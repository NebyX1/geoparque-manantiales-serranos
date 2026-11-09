import { clampPanel } from './panel-geometry';
import { availableClusters } from './clusters';
import type {
  ExperienceCluster,
  ExperiencePoint,
  LocatedExperiencePoint,
  WorldFrame,
  WorldGateway,
  WorldInput,
} from './types';

interface PageContext {
  listen: (
    target: EventTarget | null,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ) => void;
  raf: (callback: FrameRequestCallback) => number;
  timeout: (callback: () => void, delay: number) => number;
  cleanups: (() => void)[];
}
interface OpenPanel {
  node: HTMLElement;
  restore: HTMLButtonElement | null;
}
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export async function initExperience(c: PageContext) {
  const root = document.querySelector<HTMLElement>('[data-experience]');
  if (!root) return;
  function get<T extends HTMLElement = HTMLElement>(id: string): T {
    const node = document.getElementById(id);
    if (!node) throw new Error(`Missing experience element: ${id}`);
    return node as T;
  }
  const canvas = get<HTMLCanvasElement>('experience-canvas');
  const directory = get('experience-directory');
  const directoryToggle = get<HTMLButtonElement>('experience-places-toggle');
  const search = get<HTMLInputElement>('experience-place-search');
  const help = get('experience-help');
  const helpToggle = get<HTMLButtonElement>('experience-help-toggle');
  const panelsRoot = get('experience-panels');
  const dock = get('experience-dock');
  const action = get<HTMLButtonElement>('experience-action');
  const pause = get<HTMLButtonElement>('experience-pause');
  const nearbyName = get('experience-nearby-name');
  const nearbyCategory = get('experience-nearby-category');
  const announcement = get('experience-announcement');
  const area = get('experience-area');
  const overviewToggle = get<HTMLButtonElement>('experience-overview');
  const clusterInfo = get('experience-cluster-info');
  const clusterInfoToggle = get<HTMLButtonElement>('experience-area-info');
  const areaExit = get<HTMLButtonElement>('experience-area-exit');
  // A restored document can still contain the previous session's HUD state.
  root.dataset['state'] = 'loading';
  root.dataset['hasPanels'] = 'false';
  root.dataset['paused'] = 'false';
  root.dataset['inspecting'] = 'false';
  get('experience-miniature-exit').hidden = true;
  get('experience-miniature-reset').hidden = true;
  delete root.dataset['playerX'];
  delete root.dataset['playerZ'];
  delete root.dataset['miniatureId'];
  delete root.dataset['miniatureState'];
  delete root.dataset['renderedScene'];
  get('experience-loading').hidden = false;
  get('experience-fallback').hidden = true;
  get('experience-discovered').textContent = '00';
  get('experience-miniature-status').hidden = true;
  area.textContent = 'Geoparque · territorio real';
  directory.hidden = true;
  directoryToggle.setAttribute('aria-expanded', 'false');
  dock.hidden = true;
  help.hidden = true;
  helpToggle.setAttribute('aria-expanded', 'false');
  clusterInfo.hidden = true;
  clusterInfoToggle.hidden = true;
  clusterInfoToggle.setAttribute('aria-expanded', 'false');
  areaExit.hidden = true;
  overviewToggle.setAttribute('aria-pressed', 'false');
  overviewToggle.querySelector('span')!.textContent = 'Ver territorio';
  root.dataset['cluster'] = '';
  root.dataset['overview'] = 'false';
  root.dataset['explored'] = 'false';
  pause.setAttribute('aria-pressed', 'false');
  pause.querySelector('span')!.textContent = 'Pausar';
  get('experience-sound').setAttribute('aria-pressed', 'false');
  action.disabled = true;
  const data: { points: ExperiencePoint[]; clusters: ExperienceCluster[] } = JSON.parse(
    get('experience-data').textContent ?? '{}',
  );
  const { points } = data;
  const clusters = availableClusters(data.clusters, points);
  directory.querySelectorAll<HTMLButtonElement>('[data-cluster-travel]').forEach((button) => {
    button.disabled = !clusters.some((cluster) => cluster.id === button.dataset['clusterTravel']);
    if (button.disabled)
      button.title =
        'Las ubicaciones de este grupo requieren revisión. Sus fichas siguen disponibles.';
  });
  const byId = new Map(points.map((point) => [point.id, point]));
  const worldModule = () => import('./world');
  let world: ReturnType<Awaited<ReturnType<typeof worldModule>>['createWorld']> | null = null;
  let disposed = false;
  let paused = false;
  let loading = true;
  let zIndex = 20;
  let frameId = 0;
  let elapsed = 0;
  let previousTime = 0;
  let lastDraw = 0;
  let needsRender = true;
  let navigating = false;
  let lastHud = 0;
  let nearest: number | null = null;
  let gateway: WorldGateway | null = null;
  let inspectedId: number | null = null;
  let lastAnnounced: number | null = null;
  let audio: ReturnType<typeof createAmbience> | null = null;
  const keys = new Set<string>();
  const moves = new Map<number, string>();
  const panels = new Map<number, OpenPanel>();
  const discovered = new Set<number>();
  const reducedMedia = matchMedia('(prefers-reduced-motion: reduce)');
  const input: WorldInput = {
    inspect: false,
    overview: false,
    forward: 0,
    right: 0,
    run: false,
    jump: false,
    yaw: 0.3,
    pitch: 0.18,
    zoom: 17,
  };
  const on = <T extends Event>(
    target: EventTarget | null,
    type: string,
    fn: (event: T) => void,
    options?: AddEventListenerOptions,
  ) => {
    c.listen(target, type, (event) => fn(event as T), options);
  };
  const announce = (text: string) => {
    announcement.textContent = text;
  };
  const clearInput = () => {
    keys.clear();
    moves.clear();
    root.querySelectorAll('.is-held').forEach((button) => button.classList.remove('is-held'));
    input.forward = 0;
    input.right = 0;
    input.jump = false;
  };
  function setInspection(value: boolean, id?: number) {
    needsRender = true;
    if (value) {
      setOverview(false);
      setClusterInfo(false);
    }
    input.inspect = value;
    inspectedId = value ? (id ?? null) : null;
    root!.dataset['inspecting'] = String(value);
    get('experience-miniature-exit').hidden = !value;
    get('experience-miniature-reset').hidden = !value;
    world?.resetMiniatureFocus();
    root!.dataset['detailFocused'] = 'false';
    input.zoom = value ? 12 : 20;
    input.pitch = value ? 0.5 : 0.25;
  }
  function setOverview(value: boolean) {
    input.overview = value;
    needsRender = true;
    clearInput();
    root!.dataset['overview'] = String(value);
    overviewToggle.setAttribute('aria-pressed', String(value));
    overviewToggle.querySelector('span')!.textContent = value
      ? 'Volver al suelo'
      : 'Ver territorio';
    if (value) {
      setInspection(false);
      setDirectory(false);
      setHelp(false);
      setClusterInfo(false);
    }
  }
  function setClusterInfo(open: boolean) {
    clusterInfo.hidden = !open;
    clusterInfoToggle.setAttribute('aria-expanded', String(open));
    clearInput();
    needsRender = true;
    if (open) {
      clusterInfo.scrollTop = 0;
      setDirectory(false);
      setHelp(false);
      clusterInfo
        .querySelector<HTMLButtonElement>('[data-close-cluster]')
        ?.focus({ preventScroll: true });
    }
  }
  function performAction() {
    if (!input.inspect && world?.activateGateway()) return;
    const id = input.inspect ? inspectedId : nearest;
    if (id !== null) openPanel(id);
  }
  const setPause = (value: boolean) => {
    needsRender = true;
    paused = value;
    clearInput();
    pause.setAttribute('aria-pressed', String(value));
    pause.querySelector('span')!.textContent = value ? 'Continuar' : 'Pausar';
    root.dataset['paused'] = String(value);
    if (!value) canvas.focus({ preventScroll: true });
    syncAudio();
  };
  function syncAudio() {
    audio?.setActive(!paused && !document.hidden);
  }
  function setDirectory(open: boolean, restoreFocus = false) {
    needsRender = true;
    directory.hidden = !open;
    directoryToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      setHelp(false);
      setClusterInfo(false);
      clearInput();
      search.focus({ preventScroll: true });
    } else if (restoreFocus) directoryToggle.focus({ preventScroll: true });
  }
  function setHelp(open: boolean) {
    needsRender = true;
    help.hidden = !open;
    helpToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      setDirectory(false);
      setClusterInfo(false);
      clearInput();
      help.querySelector<HTMLButtonElement>('[data-close-help]')?.focus();
    }
  }
  function placePanel(panel: HTMLElement, x: number, y: number) {
    const desiredY = root!.clientWidth <= 500 ? Math.max(146, y) : y;
    const position = clampPanel(
      x,
      desiredY,
      panel.offsetWidth,
      panel.offsetHeight,
      root!.clientWidth,
      root!.clientHeight,
    );
    panel.style.left = `${position.x}px`;
    panel.style.top = `${position.y}px`;
  }
  const bringForward = (panel: HTMLElement) => {
    panel.style.zIndex = String(++zIndex);
  };
  function updatePanelState() {
    root!.dataset['hasPanels'] = String([...panels.values()].some(({ node }) => !node.hidden));
  }
  function closePanel(id: number, restoreFocus = true) {
    const panel = panels.get(id);
    if (!panel) return;
    panelObserver?.unobserve(panel.node);
    panel.node.remove();
    panel.restore?.remove();
    panels.delete(id);
    dock.hidden = !dock.childElementCount;
    updatePanelState();
    if (restoreFocus) canvas.focus({ preventScroll: true });
  }
  function restorePanel(id: number) {
    const panel = panels.get(id);
    if (!panel) return;
    panel.node.hidden = false;
    updatePanelState();
    panel.restore?.remove();
    panel.restore = null;
    dock.hidden = !dock.childElementCount;
    bringForward(panel.node);
    placePanel(panel.node, parseFloat(panel.node.style.left), parseFloat(panel.node.style.top));
    panel.node
      .querySelector<HTMLButtonElement>('[data-panel-drag]')
      ?.focus({ preventScroll: true });
  }
  function minimizePanel(id: number) {
    const panel = panels.get(id);
    const point = byId.get(id);
    if (!panel || !point || panel.restore) return;
    panel.node.hidden = true;
    updatePanelState();
    const restore = document.createElement('button');
    restore.type = 'button';
    restore.dataset['restorePanel'] = String(id);
    restore.textContent = `${String(id).padStart(2, '0')} / ${point.name} ↗`;
    restore.setAttribute('aria-label', `Restaurar ficha de ${point.name}`);
    dock.append(restore);
    panel.restore = restore;
    dock.hidden = false;
    canvas.focus({ preventScroll: true });
    announce(`Ficha de ${point.name} minimizada. Podés restaurarla desde la barra inferior.`);
  }
  function openPanel(id: number) {
    const point = byId.get(id);
    if (!point) return;
    setInspection(false);
    world?.showMiniature(id);
    const existing = panels.get(id);
    if (existing) {
      restorePanel(id);
      return;
    }
    const template = document.querySelector<HTMLTemplateElement>(
      `template[data-place-template="${id}"]`,
    );
    const node = template?.content.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
    if (!node) return;
    const miniatureButton = node.querySelector<HTMLButtonElement>('[data-view-miniature]');
    if (miniatureButton && !world) {
      miniatureButton.disabled = true;
      miniatureButton.textContent = 'Miniatura: requiere el modo 3D';
    }
    panelsRoot.append(node);
    panels.set(id, { node, restore: null });
    updatePanelState();
    bringForward(node);
    const offset = ((panels.size - 1) % 5) * 26;
    placePanel(
      node,
      (root!.clientWidth - node.offsetWidth) / 2 + (root!.clientWidth > 1000 ? 120 : 0) + offset,
      (root!.clientWidth <= 500 ? 146 : 112) + offset,
    );
    discovered.add(id);
    get('experience-discovered').textContent = String(discovered.size).padStart(2, '0');
    node.querySelector<HTMLButtonElement>('[data-panel-drag]')?.focus({ preventScroll: true });
    clearInput();
    announce(
      `Ficha de ${point.name} abierta. Movela desde su encabezado o usá las flechas con el encabezado enfocado.`,
    );
    panelObserver?.observe(node);
  }
  function travel(id: number) {
    if (!byId.has(id)) return;
    setOverview(false);
    world?.teleport(id);
    world?.showMiniature(id);
    input.yaw = 0.3;
    input.pitch = 0.25;
    input.zoom = 20;
    setDirectory(false);
    setClusterInfo(false);
    if (paused) setPause(false);
    nearest = byId.get(id)?.located ? id : null;
    updateNearest();
    openPanel(id);
  }
  function updateNearest() {
    if (gateway && !input.inspect) {
      nearbyName.textContent = gateway.kind === 'exit' ? 'Volver al geoparque' : gateway.name;
      nearbyCategory.textContent =
        gateway.kind === 'exit'
          ? 'SALIDA DE LA SALA VIRTUAL'
          : `${gateway.count} LUGARES · ENTRÁ A EXPLORAR`;
      action.disabled = false;
      action.textContent = gateway.kind === 'exit' ? 'Salir de la casa' : 'Entrar a la casa';
      return;
    }
    action.textContent = 'Accionar';
    const point = nearest === null ? undefined : byId.get(nearest);
    nearbyName.textContent =
      point?.name ??
      (world ? 'Un lugar te espera más adelante.' : 'Explorá el archivo de lugares.');
    nearbyCategory.textContent = point
      ? `${point.category.toUpperCase()} / GMS ${String(point.id).padStart(2, '0')}`
      : 'SEGUÍ LAS BALIZAS';
    action.disabled = !point;
    if (point && point.id !== lastAnnounced && !input.inspect) {
      lastAnnounced = point.id;
      announce(`Cerca de ${point.name}. Presioná E o Accionar para abrir su información.`);
    }
  }
  function fail(stage: string, error: unknown) {
    if (disposed || root!.dataset['state'] === 'fallback') return;
    loading = false;
    world?.dispose();
    world = null;
    root!.dataset['state'] = 'fallback';
    setInspection(false);
    setOverview(false);
    setClusterInfo(false);
    panelsRoot.querySelectorAll<HTMLButtonElement>('[data-view-miniature]').forEach((button) => {
      button.disabled = true;
      button.textContent = 'Miniatura: requiere el modo 3D';
    });
    get('experience-loading').hidden = true;
    get('experience-fallback').hidden = false;
    nearest = null;
    updateNearest();
    console.warn('[Geoparque/experiencia]', {
      stage,
      message: error instanceof Error ? error.message : String(error),
    });
    announce(
      'El paisaje 3D no está disponible. Las fichas de los 61 lugares siguen disponibles desde Lugares.',
    );
  }
  function resize() {
    if (disposed) return;
    needsRender = true;
    world?.resize(root!.clientWidth, root!.clientHeight, Math.min(devicePixelRatio || 1, 1.5));
    panels.forEach(({ node }) => {
      if (!node.hidden) placePanel(node, parseFloat(node.style.left), parseFloat(node.style.top));
    });
  }
  const panelObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver((entries) => {
          for (const entry of entries) {
            const node = entry.target as HTMLElement;
            if (!node.hidden)
              placePanel(node, parseFloat(node.style.left), parseFloat(node.style.top));
          }
        })
      : null;
  let resizePending = false;
  on(window, 'resize', () => {
    if (resizePending) return;
    resizePending = true;
    c.raf(() => {
      resizePending = false;
      resize();
    });
  });
  on(directoryToggle, 'click', () => setDirectory(directory.hidden));
  on(overviewToggle, 'click', () => {
    setOverview(!input.overview);
    canvas.focus({ preventScroll: true });
  });
  on(clusterInfoToggle, 'click', () => setClusterInfo(clusterInfo.hidden));
  on(clusterInfo.querySelector('[data-close-cluster]'), 'click', () => {
    setClusterInfo(false);
    canvas.focus({ preventScroll: true });
  });
  on(areaExit, 'click', () => {
    setClusterInfo(false);
    world?.leaveCluster();
    canvas.focus({ preventScroll: true });
  });
  on<MouseEvent>(clusterInfo, 'click', (event) => {
    if ((event.target as Element).closest('[data-close-cluster]')) {
      setClusterInfo(false);
      canvas.focus({ preventScroll: true });
      return;
    }
    const button = (event.target as Element).closest<HTMLElement>('[data-cluster-point]');
    if (button) travel(Number(button.dataset['clusterPoint']));
  });
  on(get('experience-miniature-exit'), 'click', () => {
    setInspection(false);
    canvas.focus({ preventScroll: true });
  });
  on(get('experience-miniature-reset'), 'click', () => {
    world?.resetMiniatureFocus();
    input.zoom = 12;
    input.pitch = 0.5;
    needsRender = true;
    root!.dataset['detailFocused'] = 'false';
    canvas.focus({ preventScroll: true });
  });
  on(get('experience-map-toggle'), 'click', () => {
    setDirectory(true);
    const mapDetails = directory.querySelector<HTMLDetailsElement>('[data-geography-disclosure]');
    if (mapDetails) mapDetails.open = true;
    directory.scrollTop = 0;
  });
  on(directory.querySelector('[data-close-directory]'), 'click', () => setDirectory(false, true));
  on(helpToggle, 'click', () => setHelp(help.hidden));
  on(help.querySelector('[data-close-help]'), 'click', () => {
    setHelp(false);
    helpToggle.focus();
  });
  on(pause, 'click', () => setPause(!paused));
  on(action, 'click', performAction);
  on<InputEvent>(search, 'input', () => {
    const term = normalize(search.value.trim());
    let count = 0;
    directory.querySelectorAll<HTMLElement>('[data-experience-place]').forEach((item) => {
      const matches = normalize(item.dataset['search'] ?? '').includes(term);
      item.hidden = !matches;
      if (matches) count++;
    });
    get('experience-directory-count').textContent =
      `${count} ${count === 1 ? 'lugar' : 'lugares'} para descubrir`;
    get('experience-directory-empty').hidden = count > 0;
  });
  on<MouseEvent>(directory, 'click', (event) => {
    const house = (event.target as Element).closest<HTMLElement>('[data-cluster-travel]');
    if (house) {
      const cluster = clusters.find((item) => item.id === house.dataset['clusterTravel']);
      if (cluster && world) {
        setOverview(false);
        setDirectory(false);
        world.teleport(cluster.memberIds[0]!);
        setClusterInfo(true);
      }
      return;
    }
    const target = (event.target as Element).closest<HTMLElement>(
      '[data-place-travel], [data-geographic-place]',
    );
    if (target) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      travel(Number(target.dataset['placeTravel'] ?? target.dataset['geographicPlace']));
    }
    const zoom = (event.target as Element).closest<HTMLElement>('[data-geography-view]');
    const map = directory.querySelector<SVGElement>('[data-geographic-map]');
    if (zoom && map) {
      const minas = zoom.dataset['geographyView'] === 'minas';
      map.dataset['view'] = minas ? 'minas' : 'all';
      const view = map.dataset[minas ? 'viewMinas' : 'viewAll'];
      if (view) map.setAttribute('viewBox', view);
      directory.querySelectorAll('[data-geography-view]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button === zoom));
      });
      const caption = directory.querySelector('[data-geography-caption]');
      if (caption) caption.textContent = minas ? 'Minas, ampliación' : 'Todo el geoparque';
    }
  });
  on<MouseEvent>(dock, 'click', (event) => {
    const target = (event.target as Element).closest<HTMLElement>('[data-restore-panel]');
    if (target) restorePanel(Number(target.dataset['restorePanel']));
  });
  on<MouseEvent>(panelsRoot, 'click', (event) => {
    const target = event.target as Element;
    const node = target.closest<HTMLElement>('[data-holo-panel]');
    if (!node) return;
    const id = Number(node.dataset['holoPanel']);
    if (target.closest('[data-view-miniature]')) {
      world?.teleport(id);
      world?.showMiniature(id);
      setClusterInfo(false);
      input.yaw = 0.3;
      setInspection(true, id);
      panels.forEach((_, panelId) => minimizePanel(panelId));
      canvas.focus({ preventScroll: true });
    } else if (target.closest('[data-panel-close]')) closePanel(id);
    else if (target.closest('[data-panel-minimize]')) minimizePanel(id);
    else if (target.closest('[data-panel-resume]')) {
      canvas.focus({ preventScroll: true });
      clearInput();
    }
  });
  let panelDrag: {
    pointer: number;
    node: HTMLElement;
    startX: number;
    startY: number;
    left: number;
    top: number;
  } | null = null;
  on<PointerEvent>(panelsRoot, 'pointerdown', (event) => {
    const target = event.target as Element;
    const node = target.closest<HTMLElement>('[data-holo-panel]');
    if (node) {
      bringForward(node);
      clearInput();
    }
    const handle = target.closest<HTMLElement>('[data-panel-drag]');
    if (!handle || !node || event.button !== 0) return;
    event.preventDefault();
    handle.focus({ preventScroll: true });
    handle.setPointerCapture(event.pointerId);
    panelDrag = {
      pointer: event.pointerId,
      node,
      startX: event.clientX,
      startY: event.clientY,
      left: parseFloat(node.style.left),
      top: parseFloat(node.style.top),
    };
  });
  on<PointerEvent>(panelsRoot, 'pointermove', (event) => {
    if (!panelDrag || panelDrag.pointer !== event.pointerId) return;
    placePanel(
      panelDrag.node,
      panelDrag.left + event.clientX - panelDrag.startX,
      panelDrag.top + event.clientY - panelDrag.startY,
    );
  });
  const endPanelDrag = () => {
    panelDrag = null;
  };
  on(panelsRoot, 'pointerup', endPanelDrag);
  on(panelsRoot, 'pointercancel', endPanelDrag);
  on(panelsRoot, 'lostpointercapture', endPanelDrag);
  on<KeyboardEvent>(panelsRoot, 'keydown', (event) => {
    const handle = (event.target as Element).closest('[data-panel-drag]');
    const node = handle?.closest<HTMLElement>('[data-holo-panel]');
    if (!node || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home'].includes(event.key))
      return;
    event.preventDefault();
    event.stopPropagation();
    const step = event.shiftKey ? 40 : 12;
    const x = parseFloat(node.style.left);
    const y = parseFloat(node.style.top);
    placePanel(
      node,
      event.key === 'Home'
        ? 16
        : x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0),
      event.key === 'Home'
        ? 96
        : y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0),
    );
  });
  const movementKeys = new Set([
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ShiftLeft',
    'ShiftRight',
    'Space',
    'KeyQ',
    'KeyR',
  ]);
  on<KeyboardEvent>(window, 'keydown', (event) => {
    if (event.key === 'Escape') {
      if (!clusterInfo.hidden) {
        setClusterInfo(false);
        canvas.focus({ preventScroll: true });
        return;
      }
      if (input.overview) {
        setOverview(false);
        canvas.focus({ preventScroll: true });
        return;
      }
      if (input.inspect) {
        setInspection(false);
        canvas.focus({ preventScroll: true });
        return;
      }
      if (!directory.hidden) {
        setDirectory(false, true);
        return;
      }
      if (!help.hidden) {
        setHelp(false);
        helpToggle.focus();
        return;
      }
      const top = [...panels.entries()]
        .filter(([, panel]) => !panel.node.hidden)
        .sort((a, b) => Number(b[1].node.style.zIndex) - Number(a[1].node.style.zIndex))[0];
      if (top) closePanel(top[0]);
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (
      target.closest('input,textarea,select,button,a,[data-holo-panel]') ||
      target.isContentEditable ||
      !directory.hidden ||
      !help.hidden ||
      !clusterInfo.hidden
    )
      return;
    if (event.code === 'KeyM' && !event.repeat) {
      event.preventDefault();
      setOverview(!input.overview);
      return;
    }
    if (event.code === 'KeyE' && !event.repeat) {
      event.preventDefault();
      performAction();
      return;
    }
    if (!movementKeys.has(event.code)) return;
    event.preventDefault();
    keys.add(event.code);
    if (event.code === 'Space' && !event.repeat) input.jump = true;
  });
  on<KeyboardEvent>(window, 'keyup', (event) => {
    keys.delete(event.code);
  });
  on(window, 'blur', clearInput);
  on<FocusEvent>(root, 'focusin', (event) => {
    if (event.target !== canvas) clearInput();
  });
  on(document, 'visibilitychange', () => {
    needsRender = true;
    clearInput();
    previousTime = 0;
    syncAudio();
  });
  // Release the graphics thread while ClientRouter fetches and prepares the next document.
  on(document, 'astro:before-preparation', () => {
    navigating = true;
    clearInput();
    audio?.setActive(false);
  });
  on(reducedMedia, 'change', () => {
    needsRender = true;
    announce('Preferencia de movimiento actualizada. Podés pausar el recorrido cuando quieras.');
  });
  let cameraDrag: {
    pointer: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null = null;
  on<PointerEvent>(canvas, 'pointerdown', (event) => {
    if (event.button !== 0 && event.button !== 2) return;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(event.pointerId);
    cameraDrag = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originX: event.clientX,
      originY: event.clientY,
      moved: false,
    };
  });
  on<PointerEvent>(canvas, 'pointermove', (event) => {
    if (!cameraDrag || cameraDrag.pointer !== event.pointerId) return;
    needsRender = true;
    const dx = event.clientX - cameraDrag.x;
    const dy = event.clientY - cameraDrag.y;
    cameraDrag.moved ||=
      Math.hypot(event.clientX - cameraDrag.originX, event.clientY - cameraDrag.originY) > 5;
    input.yaw -= dx * 0.005;
    input.pitch = Math.max(0.12, Math.min(0.95, input.pitch + dy * 0.003));
    cameraDrag.x = event.clientX;
    cameraDrag.y = event.clientY;
  });
  on<PointerEvent>(canvas, 'pointerup', (event) => {
    if (!cameraDrag || cameraDrag.pointer !== event.pointerId) return;
    if (!cameraDrag.moved && event.button === 0) {
      if (input.inspect && event.shiftKey) {
        const rect = canvas.getBoundingClientRect();
        if (
          world?.focusMiniature(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            (-(event.clientY - rect.top) / rect.height) * 2 + 1,
          )
        ) {
          input.zoom = 1.8;
          needsRender = true;
          root!.dataset['detailFocused'] = 'true';
          announce('Detalle enfocado. Usá la rueda para acercarte y Vista completa para volver.');
        }
        cameraDrag = null;
        return;
      }
      if (!input.inspect && world?.activateGateway()) {
        cameraDrag = null;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const id = input.inspect
        ? inspectedId
        : world?.pick(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            (-(event.clientY - rect.top) / rect.height) * 2 + 1,
          );
      if (id !== null && id !== undefined) openPanel(id);
      else if (nearest !== null) openPanel(nearest);
    }
    cameraDrag = null;
  });
  on(canvas, 'pointercancel', () => {
    cameraDrag = null;
  });
  on(canvas, 'lostpointercapture', () => {
    cameraDrag = null;
  });
  on(canvas, 'contextmenu', (event) => event.preventDefault());
  on<WheelEvent>(
    canvas,
    'wheel',
    (event) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      input.zoom = Math.max(
        input.inspect ? 0.65 : 9,
        Math.min(29, input.zoom + event.deltaY * 0.012),
      );
      needsRender = true;
    },
    { passive: false },
  );
  on(canvas, 'webglcontextlost', (event) => {
    event.preventDefault();
    fail('webgl-context-lost', new Error('Se perdió el contexto gráfico.'));
  });
  root.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((button) => {
    on<PointerEvent>(button, 'pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      moves.set(event.pointerId, button.dataset['move']!);
      button.classList.add('is-held');
    });
    const stop = (event: PointerEvent) => {
      moves.delete(event.pointerId);
      button.classList.remove('is-held');
    };
    on<PointerEvent>(button, 'pointerup', stop);
    on<PointerEvent>(button, 'pointercancel', stop);
    on<PointerEvent>(button, 'lostpointercapture', stop);
    on<KeyboardEvent>(button, 'keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        moves.set(-1, button.dataset['move']!);
      }
    });
    on(button, 'keyup', () => moves.delete(-1));
    on(button, 'blur', () => moves.delete(-1));
  });
  const soundButton = get<HTMLButtonElement>('experience-sound');
  on(soundButton, 'click', async () => {
    if (audio) {
      audio.dispose();
      audio = null;
      soundButton.setAttribute('aria-pressed', 'false');
      return;
    }
    try {
      audio = createAmbience();
      await audio.resume();
      if (disposed) {
        audio.dispose();
        audio = null;
        return;
      }
      soundButton.setAttribute('aria-pressed', 'true');
      syncAudio();
    } catch {
      announce('El sonido no está disponible en este navegador.');
    }
  });
  c.cleanups.push(() => {
    disposed = true;
    cancelAnimationFrame(frameId);
    clearInput();
    panelObserver?.disconnect();
    audio?.dispose();
    world?.dispose();
    world = null;
    panels.forEach(({ node, restore }) => {
      node.remove();
      restore?.remove();
    });
    panels.clear();
  });
  function tick(time: number) {
    if (disposed || !world) return;
    const reading =
      input.overview ||
      !clusterInfo.hidden ||
      !directory.hidden ||
      !help.hidden ||
      document.activeElement?.closest('[data-holo-panel], #experience-dock');
    // HTML controls remain responsive while the unchanged background is cached.
    // Loading a model, changing view or resizing explicitly invalidates it.
    if (
      document.hidden ||
      navigating ||
      ((paused || reading) && !needsRender) ||
      time - lastDraw < (paused ? 200 : reading ? 100 : 0)
    ) {
      previousTime = 0;
      frameId = c.raf(tick);
      return;
    }
    lastDraw = time;
    const delta = Math.min(previousTime ? (time - previousTime) / 1000 : 0, 0.05);
    previousTime = time;
    if (!document.hidden) {
      const blocked =
        paused || !directory.hidden || !help.hidden || !clusterInfo.hidden || input.overview;
      const held = new Set(moves.values());
      input.forward = blocked
        ? 0
        : Number(keys.has('KeyW') || keys.has('ArrowUp') || held.has('forward')) -
          Number(keys.has('KeyS') || keys.has('ArrowDown') || held.has('back'));
      input.right = blocked
        ? 0
        : Number(keys.has('KeyD') || keys.has('ArrowRight') || held.has('right')) -
          Number(keys.has('KeyA') || keys.has('ArrowLeft') || held.has('left'));
      input.run = keys.has('ShiftLeft') || keys.has('ShiftRight');
      if (input.inspect && (input.forward || input.right)) setInspection(false);
      if (!blocked)
        input.yaw += (Number(keys.has('KeyQ')) - Number(keys.has('KeyR'))) * delta * 1.4;
      if (!paused) elapsed += delta;
      try {
        const frame: WorldFrame = world.update(
          input,
          blocked ? 0 : delta,
          reducedMedia.matches ? 0 : elapsed,
        );
        input.jump = false;
        if (
          frame.nearestId !== nearest ||
          frame.gateway?.clusterId !== gateway?.clusterId ||
          frame.gateway?.kind !== gateway?.kind
        ) {
          nearest = frame.nearestId;
          gateway = frame.gateway;
          updateNearest();
        }
        if (time - lastHud > 160) {
          lastHud = time;
          root!.dataset['playerX'] = frame.x.toFixed(2);
          root!.dataset['playerZ'] = frame.z.toFixed(2);
          document
            .getElementById('experience-map-player')
            ?.setAttribute(
              'transform',
              `translate(${frame.mapX} ${frame.mapZ}) rotate(${(frame.heading * 180) / Math.PI})`,
            );
        }
        world.render();
        const sceneState = `${frame.clusterId ?? 'territory'}/${input.overview ? 'map' : input.inspect ? 'inspect' : 'walk'}/${root!.dataset['miniatureState'] ?? 'none'}/${root!.dataset['miniatureId'] ?? 'none'}`;
        if (root!.dataset['renderedScene'] !== sceneState)
          root!.dataset['renderedScene'] = sceneState;
        needsRender = false;
      } catch (error) {
        fail('render', error);
        return;
      }
    }
    frameId = c.raf(tick);
  }
  c.timeout(() => {
    if (loading && !disposed) fail('load-timeout', new Error('El motor 3D no respondió a tiempo.'));
  }, 20_000);
  try {
    const { createWorld } = await worldModule();
    if (disposed || !loading) return;
    world = createWorld({
      canvas,
      points: points.filter((point): point is LocatedExperiencePoint => point.located),
      clusters,
      onSceneChange() {
        needsRender = true;
      },
      onClusterChange(id) {
        root!.dataset['explored'] = 'true';
        setOverview(false);
        setInspection(false);
        clearInput();
        nearest = null;
        gateway = null;
        get('experience-miniature-status').hidden = true;
        root!.dataset['cluster'] = id ?? '';
        const cluster = clusters.find((item) => item.id === id);
        area.textContent = cluster
          ? `${cluster.name} · sala virtual`
          : 'Geoparque · territorio real';
        areaExit.hidden = !cluster;
        clusterInfoToggle.hidden = !cluster;
        overviewToggle.disabled = Boolean(cluster);
        clusterInfo.querySelectorAll<HTMLElement>('[data-cluster-content]').forEach((node) => {
          node.hidden = node.dataset['clusterContent'] !== id;
        });
        setClusterInfo(Boolean(cluster));
        updateNearest();
        announce(
          cluster
            ? `Entraste a ${cluster.name}. ${cluster.memberIds.length} lugares, separados para recorrerlos con comodidad.`
            : 'Volviste al territorio del geoparque.',
        );
      },
      reducedMotion: reducedMedia.matches,
      pixelRatio: Math.min(devicePixelRatio || 1, 1.5),
      onMiniatureState(id, state) {
        if (disposed) return;
        needsRender = true;
        get('experience-miniature-status').hidden = false;
        const point = byId.get(id);
        root!.dataset['miniatureId'] = String(id);
        root!.dataset['miniatureState'] = state;
        get('experience-miniature-name').textContent = point?.name ?? '';
        get('experience-miniature-detail').textContent =
          state === 'loading'
            ? 'Cargando miniatura…'
            : state === 'unavailable'
              ? 'Miniatura no disponible. Podés seguir consultando su ficha.'
              : point?.located
                ? 'Escala ampliada · Shift + clic enfoca un detalle'
                : 'Miniatura de estudio · ubicación pendiente';
      },
    });
    resize();
    loading = false;
    root.dataset['state'] = 'ready';
    get('experience-loading').hidden = true;
    frameId = c.raf(tick);
    announce(
      'Paisaje listo. Usá WASD o las flechas para caminar. E abre la información del punto cercano.',
    );
  } catch (error) {
    fail('initialization', error);
  }
}

/** Original, quiet wind/water ambience; only created after an explicit sound click. */
function createAmbience() {
  const context = new AudioContext();
  let closed = false;
  const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let previous = 0;
  for (let i = 0; i < samples.length; i++) {
    previous = (previous + (Math.random() * 2 - 1) * 0.025) / 1.025;
    samples[i] = previous * 3;
  }
  const noise = context.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 750;
  const gain = context.createGain();
  gain.gain.value = 0.16;
  noise.connect(filter).connect(gain).connect(context.destination);
  noise.start();
  return {
    resume: () => context.resume(),
    setActive: (active: boolean) => {
      if (context.state !== 'closed')
        gain.gain.setTargetAtTime(active ? 0.16 : 0, context.currentTime, 0.2);
    },
    dispose: () => {
      if (closed) return;
      closed = true;
      noise.stop();
      noise.disconnect();
      filter.disconnect();
      gain.disconnect();
      void context.close();
    },
  };
}

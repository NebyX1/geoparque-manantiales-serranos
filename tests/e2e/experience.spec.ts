import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import { places } from '../../src/data/geosites';
import { geographicPlaces } from '../../src/data/geography';
import type { ExperiencePoint } from '../../src/features/experience/types';
import { computeInspectionViewport } from '../../src/features/experience/inspection-frame';

async function waitForExperience(page: Page) {
  const experience = page.locator('[data-experience]');
  await expect(experience).toHaveAttribute('data-state', /^(ready|fallback)$/);
  return experience;
}

async function openPlaces(page: Page) {
  const toggle = page.locator('#experience-places-toggle');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(page.locator('#experience-place-search')).toBeVisible();
}

for (const subject of [
  { id: 8, search: 'Marmarajá', title: 'el lagarto de Marmarajá' },
  { id: 1, search: 'Arequita', title: 'el río Santa Lucía junto al Arequita' },
  { id: 9, search: 'Stewart', title: 'el agua y los peces de Stewart Vargas' },
  { id: 14, search: 'Penitente', title: 'la cascada y los peces del Penitente' },
]) {
  test(`${subject.title} se anima y respeta pausa y movimiento reducido`, async ({ page }) => {
    test.setTimeout(65_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    // Isolate animation from the renderer's adaptive-resolution changes under GPU load.
    // At its quality floor, a static pose must produce the same image on both engines.
    await page.addInitScript(() =>
      Object.defineProperty(window, 'devicePixelRatio', {
        configurable: true,
        get: () => 0.85,
      }),
    );
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/experiencia/');
    const experience = await waitForExperience(page);
    test.skip(
      (await experience.getAttribute('data-state')) !== 'ready',
      'Archivo accesible sin WebGL.',
    );
    await openPlaces(page);
    await page.locator('#experience-place-search').fill(subject.search);
    await page.locator(`[data-place-travel="${subject.id}"]`).click();
    await page.locator(`[data-holo-panel="${subject.id}"] [data-view-miniature]`).click();
    await expect(experience).toHaveAttribute(
      'data-rendered-scene',
      new RegExp(`/inspect/ready/${subject.id}$`),
    );
    await page.locator('#experience-canvas').focus();
    await page.waitForTimeout(1_500);
    const capture = async () =>
      sharp(
        await page.screenshot({
          clip: { x: 500, y: 350, width: 750, height: 430 },
          scale: 'css',
        }),
      )
        .removeAlpha()
        .raw()
        .toBuffer();
    const changed = (a: Buffer, b: Buffer) => {
      let pixels = 0;
      for (let i = 0; i < a.length; i += 3)
        if (
          Math.max(
            Math.abs(a[i]! - b[i]!),
            Math.abs(a[i + 1]! - b[i + 1]!),
            Math.abs(a[i + 2]! - b[i + 2]!),
          ) > 8
        )
          pixels++;
      return pixels;
    };
    const walking = await capture();
    await page.waitForTimeout(800);
    expect(changed(walking, await capture())).toBeGreaterThan(50);
    await page.locator('#experience-pause').click();
    await page.waitForTimeout(300);
    const paused = await capture();
    await page.waitForTimeout(800);
    expect(changed(paused, await capture())).toBe(0);
    await page.locator('#experience-pause').click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(300);
    const reduced = await capture();
    await page.waitForTimeout(800);
    expect(changed(reduced, await capture())).toBe(0);
  });
}

test('el Molino Viejo conserva sus materiales estáticos al avanzar el reloj de la escena', async ({
  page,
}) => {
  test.setTimeout(65_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() =>
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => 0.85 }),
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/experiencia/');
  const experience = await waitForExperience(page);
  test.skip(
    (await experience.getAttribute('data-state')) !== 'ready',
    'Archivo accesible sin WebGL.',
  );
  await openPlaces(page);
  await page.locator('[data-place-travel="61"]').click();
  await page.locator('[data-holo-panel="61"] [data-view-miniature]').click();
  await expect(experience).toHaveAttribute('data-rendered-scene', /\/inspect\/ready\/61$/);
  await page.waitForTimeout(1_500);
  const capture = async () =>
    sharp(
      await page.screenshot({
        clip: { x: 500, y: 350, width: 750, height: 430 },
        scale: 'css',
      }),
    )
      .removeAlpha()
      .raw()
      .toBuffer();
  const before = await capture();
  await page.waitForTimeout(850);
  const after = await capture();
  let changed = 0;
  for (let i = 0; i < before.length; i++) if (Math.abs(before[i]! - after[i]!) > 8) changed++;
  // In particular, a material labelled as a roof membrane must not accidentally
  // receive the generic animated-water shader intended for rivers and reservoirs.
  expect(changed).toBe(0);
  await page.locator('#experience-miniature-exit').click();
  await page.locator('a[href="/inicio/"]').first().click();
  await expect(page.locator('h1')).toContainText('MEMORIA.');
  expect(errors).toEqual([]);
});

test('la entrada ofrece las dos experiencias y mantiene enlaces utilizables sin JavaScript', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  const website = page.locator('a[href="/inicio/"]').first();
  const immersive = page.locator('a[href="/experiencia/"]').first();
  await expect(website).toBeVisible();
  await expect(immersive).toBeVisible();
  await website.click();
  await expect(page).toHaveURL(/\/inicio\/$/);
  await expect(page.locator('h1')).toContainText('MEMORIA.');
  await expect(page.locator('[data-hero]')).toHaveCount(4);

  const context = await browser.newContext({ javaScriptEnabled: false });
  const noScript = await context.newPage();
  await noScript.goto(`${baseURL}/`);
  await expect(noScript.locator('a[href="/inicio/"]').first()).toBeVisible();
  await noScript.locator('a[href="/inicio/"]').first().click();
  await expect(noScript.locator('.place-card:visible')).toHaveCount(places.length);
  await noScript.goto(`${baseURL}/experiencia/`);
  const noScriptLinks = noScript.locator(
    '#experience-directory .geo-place-list a[href^="/lugares/"]',
  );
  await expect(noScriptLinks).toHaveCount(places.length);
  expect(
    await noScriptLinks.evaluateAll((links) =>
      links.map((link) => {
        const box = link.getBoundingClientRect();
        return {
          href: link.getAttribute('href'),
          name: link.textContent?.trim(),
          visible:
            box.width > 0 && box.height > 0 && getComputedStyle(link).visibility === 'visible',
        };
      }),
    ),
  ).toEqual(
    places.map((place) => ({
      href: `/lugares/${place.slug}/`,
      name: place.name,
      visible: true,
    })),
  );
  await expect(noScriptLinks.first()).toBeVisible();
  await expect(noScriptLinks.last()).toBeVisible();
  await context.close();
});

test('el mundo carga y el directorio conserva los 61 lugares con búsqueda sin acentos', async ({
  page,
  browserName,
}) => {
  await page.goto('/experiencia/');
  const experience = await waitForExperience(page);
  // Chromium is the reference for the actual WebGL path. WebKit must retain
  // the complete directory when its headless environment cannot create WebGL2.
  if (browserName === 'chromium') await expect(experience).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('#experience-canvas')).toHaveAttribute('tabindex', '0');
  await expect(page.locator('#experience-canvas')).toHaveAccessibleName(/Paisaje 3D/);
  await openPlaces(page);
  await expect(page.locator('[data-place-travel]')).toHaveCount(places.length);
  expect(
    await page.locator('[data-place-travel]').evaluateAll((buttons) =>
      buttons.map((button) => ({
        id: Number(button.getAttribute('data-place-travel')),
        name: button.getAttribute('aria-label'),
      })),
    ),
  ).toEqual(places.map((place) => ({ id: place.id, name: `Explorar ${place.name}` })));
  await expect(page.locator('[data-place-travel="1"]')).toHaveAccessibleName(
    'Explorar Cerro Arequita',
  );
  await expect(page.locator('[data-place-travel="23"]')).toHaveAccessibleName(
    `Explorar ${places.find((place) => place.id === 23)!.name}`,
  );
  await page.locator('#experience-place-search').fill('AREQUÍTA');
  await expect(page.locator('[data-place-travel="1"]')).toBeVisible();
  await expect(page.locator('[data-place-travel="23"]')).toBeHidden();
  await page.locator('#experience-place-search').fill('sin-resultados-xyz');
  await expect(page.locator('[data-experience-place]:visible')).toHaveCount(0);
  await page.locator('#experience-place-search').fill('');
  await expect(page.locator('[data-experience-place]:visible')).toHaveCount(places.length);
});

test('Accionar y E abren la información canónica del punto cercano', async ({ page }) => {
  await page.goto('/experiencia/');
  const experience = await waitForExperience(page);
  if ((await experience.getAttribute('data-state')) === 'ready') {
    await page.locator('#experience-action').click();
    await expect(experience).toHaveAttribute('data-cluster', 'arequita');
    await expect(page.locator('#experience-cluster-info')).toContainText('Casa de Arequita');
    await expect(
      page.locator('[data-cluster-content="arequita"] [data-cluster-point]'),
    ).toHaveCount(5);
    await page.getByRole('button', { name: 'Recorrer la sala →', exact: true }).click();
    await openPlaces(page);
    await page.locator('[data-place-travel="1"]').click();
    await expect(page.locator('[data-holo-panel="1"]')).toContainText('Cerro Arequita');
    await page.getByRole('button', { name: 'Cerrar ficha de Cerro Arequita', exact: true }).click();
    await page.locator('#experience-canvas').focus();
    await page.keyboard.press('e');
    await expect(page.locator('[data-holo-panel="1"]')).toBeVisible();
  } else {
    await openPlaces(page);
    await page.locator('[data-place-travel="1"]').click();
  }
  const panel = page.locator('[data-holo-panel="1"]');
  const arequita = places.find((place) => place.id === 1)!;
  await expect(panel).toContainText(arequita.summary);
  await expect(panel).toContainText(arequita.statusRaw);
  await expect(panel.locator(`a[href="/lugares/${arequita.slug}/"]`)).toBeVisible();
});

test('las casas se recorren y se abandonan sin perder la geografía del mapa', async ({ page }) => {
  await page.goto('/experiencia/');
  const experience = await waitForExperience(page);
  test.skip(
    (await experience.getAttribute('data-state')) !== 'ready',
    'Este navegador usa el archivo accesible sin WebGL.',
  );
  await page.locator('#experience-canvas').focus();
  await page.keyboard.press('e');
  await expect(experience).toHaveAttribute('data-cluster', 'arequita');
  await expect(page.locator('#experience-area')).toContainText('sala virtual');
  await page.getByRole('button', { name: 'Recorrer la sala →', exact: true }).click();
  const before = Number(await experience.getAttribute('data-player-z'));
  await page.locator('#experience-canvas').focus();
  await page.keyboard.down('w');
  await expect
    .poll(async () => Math.abs(Number(await experience.getAttribute('data-player-z')) - before))
    .toBeGreaterThan(1);
  await page.keyboard.up('w');
  await page.locator('#experience-area-exit').click();
  await expect(experience).toHaveAttribute('data-cluster', '');
  await page.locator('#experience-overview').click();
  await expect(experience).toHaveAttribute('data-overview', 'true');
  await page.locator('#experience-canvas').focus();
  await page.keyboard.press('Escape');
  await expect(experience).toHaveAttribute('data-overview', 'false');
  await openPlaces(page);
  await expect(page.locator('[data-cluster-travel]')).toHaveCount(8);
  await page.locator('[data-cluster-travel="minas"]').click();
  await expect(experience).toHaveAttribute('data-cluster', 'minas');
  await expect(page.locator('[data-cluster-content="minas"] [data-cluster-point]')).toHaveCount(18);
});

test('la cruceta táctil conserva captura y detiene el movimiento al soltar o cancelar', async ({
  browser,
  browserName,
  baseURL,
}) => {
  test.skip(
    browserName !== 'chromium',
    'La secuencia táctil sostenida usa CDP; el resto de controles se prueba también en WebKit.',
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/experiencia/`);
    const root = await waitForExperience(page);
    await expect(root).toHaveAttribute('data-state', 'ready');
    const cdp = await context.newCDPSession(page);
    const position = async () => ({
      x: Number(await root.getAttribute('data-player-x')),
      z: Number(await root.getAttribute('data-player-z')),
    });
    async function hold(direction: string, cancel = false) {
      const button = page.locator(`[data-move="${direction}"]`),
        box = (await button.boundingBox())!;
      const before = await position(),
        x = box.x + box.width / 2,
        y = box.y + box.height / 2;
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x, y, id: 1 }],
      });
      await expect(button).toHaveClass(/is-held/);
      await expect
        .poll(async () => {
          const now = await position();
          return Math.hypot(now.x - before.x, now.z - before.z);
        })
        .toBeGreaterThan(0.7);
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: Math.min(375, x + 90), y: y - 110, id: 1 }],
      });
      await expect(button).toHaveClass(/is-held/);
      await cdp.send('Input.dispatchTouchEvent', {
        type: cancel ? 'touchCancel' : 'touchEnd',
        touchPoints: [],
      });
      await expect(button).not.toHaveClass(/is-held/);
      await page.waitForTimeout(300);
      const stopped = await position();
      await page.waitForTimeout(300);
      const after = await position();
      expect(Math.hypot(after.x - stopped.x, after.z - stopped.z)).toBeLessThan(0.04);
    }
    await page.locator('#experience-action').tap();
    await expect(root).toHaveAttribute('data-cluster', 'arequita');
    await page.getByRole('button', { name: 'Recorrer la sala →', exact: true }).tap();
    await hold('right');
    await hold('forward', true);
    await page.locator('#experience-area-exit').tap();
    await expect(root).toHaveAttribute('data-cluster', '');
  } finally {
    await context.close();
  }
});

test('el mapa conserva ubicaciones, fuentes y precisión y permite ampliar Minas', async ({
  page,
}) => {
  await page.goto('/experiencia/');
  await waitForExperience(page);
  await openPlaces(page);
  await page.locator('[data-geography-disclosure] > summary').click();
  const map = page.locator('[data-geographic-map]');
  await expect(map).toBeVisible();
  const pins = map.locator('[data-geographic-place]');
  await expect(pins).toHaveCount(61);
  await expect(
    map.locator('[data-geographic-place="58"], [data-geographic-place="60"]'),
  ).toHaveCount(2);
  await expect(page.locator('.geo-place-list [data-experience-place]')).toHaveCount(61);
  const renderedPositions = await pins.evaluateAll((links) =>
    links.map((link) => {
      const circle = link.querySelector('.geo-point')!;
      return {
        id: Number(link.getAttribute('data-geographic-place')),
        x: Number(circle.getAttribute('cx')),
        z: Number(circle.getAttribute('cy')),
        accuracy: link.getAttribute('data-accuracy'),
      };
    }),
  );
  expect(renderedPositions).toEqual(
    geographicPlaces
      .filter((place) => place.position && place.location)
      .map((place) => ({
        id: place.id,
        ...place.position!,
        accuracy: place.location!.accuracy,
      })),
  );
  // The mine and the sanctuary are distinct documented sites, even in the same zone.
  expect(renderedPositions.find((place) => place.id === 33)!.x).not.toBe(
    renderedPositions.find((place) => place.id === 34)!.x,
  );

  const allView = await map.getAttribute('viewBox');
  const minasButton = page.locator('[data-geography-view="minas"]');
  await minasButton.click();
  await expect(minasButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-geography-view="all"]')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(map).toHaveAttribute('viewBox', (await map.getAttribute('data-view-minas'))!);
  await expect(map).not.toHaveAttribute('viewBox', allView!);
  await expect(page.locator('[data-geography-caption]')).toHaveText('Minas, ampliación');
  await page.locator('[data-geography-view="all"]').click();
  await expect(map).toHaveAttribute('viewBox', allView!);

  const approximate = page.locator('[data-geography-row="59"]');
  await approximate.locator('summary').click();
  await expect(approximate.locator('.geo-source-content')).toBeVisible();
  await expect(approximate).toContainText('Referencia aproximada');
  await expect(approximate.locator('.geo-source-content a').first()).toHaveAttribute(
    'href',
    'https://www.openstreetmap.org/node/7010044977',
  );
  await expect(approximate.locator('.geo-coordinates')).toContainText('-34.44654');
  await expect(approximate.locator('.geo-real-map-link')).toHaveAttribute(
    'href',
    'https://www.openstreetmap.org/?mlat=-34.4465405&mlon=-55.2332291#map=16/-34.4465405/-55.2332291',
  );
  await expect(approximate.locator('.geo-real-map-link')).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  const lodgeReference = page.locator('[data-geography-row="58"]');
  await expect(lodgeReference).toContainText('Referencia aproximada');

  await map.locator('[data-geographic-place="14"] .geo-point').click();
  await expect(page.locator('[data-holo-panel="14"]')).toContainText('Salto del Penitente');
  await expect(page).toHaveURL(/\/experiencia\/$/);
});

test('las miniaturas se cargan por selección y una carga anterior no reemplaza la última', async ({
  page,
  browserName,
}) => {
  test.setTimeout(60_000);
  const assetRequests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (/\/models\/geosites\/.*\.glb$/.test(path)) assetRequests.push(path);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  expect(assetRequests).toEqual([]);
  await page.goto('/experiencia/');
  const experience = await waitForExperience(page);
  if (browserName === 'chromium') await expect(experience).toHaveAttribute('data-state', 'ready');
  if ((await experience.getAttribute('data-state')) === 'fallback') {
    await openPlaces(page);
    await page.locator('[data-place-travel="14"]').click();
    await expect(page.locator('[data-holo-panel="14"]')).toContainText('Salto del Penitente');
    expect(errors).toEqual([]);
    return;
  }
  // The entrance now starts outside the virtual house. No model is downloaded
  // before entering or selecting a place.
  await expect(page.locator('#experience-nearby-name')).toHaveText('Casa de Arequita');
  expect(assetRequests).toEqual([]);
  await openPlaces(page);
  // Use a GLB outside the houses: Penitente now loads its native animated module.
  await page.locator('[data-place-travel="8"]').click();
  await expect(experience).toHaveAttribute('data-miniature-id', '8');
  await expect(experience).toHaveAttribute('data-miniature-state', 'ready');
  expect(assetRequests).toEqual(['/models/geosites/rebuilt/gms-08.glb']);
  await openPlaces(page);
  await page.locator('[data-place-travel="1"]').click();
  await expect(experience).toHaveAttribute('data-miniature-id', '1');
  await expect(experience).toHaveAttribute('data-miniature-state', 'ready');
  await page.locator('[data-holo-panel="1"] [data-view-miniature]').click();
  await expect(experience).toHaveAttribute('data-inspecting', 'true');

  assetRequests.length = 0;
  let releaseOldLoads!: () => void;
  const oldLoads = new Promise<void>((resolve) => {
    releaseOldLoads = resolve;
  });
  const delayedAssets = new Set<string>();
  await page.route(/\/models\/geosites\/rebuilt\/gms-08\.glb$/, async (route) => {
    delayedAssets.add(new URL(route.request().url()).pathname);
    await oldLoads;
    await route.continue();
  });
  try {
    await openPlaces(page);
    await page.locator('[data-place-travel="8"]').click();
    await expect.poll(() => delayedAssets.has('/models/geosites/rebuilt/gms-08.glb')).toBe(true);
    await expect(experience).toHaveAttribute('data-miniature-state', 'loading');
    await openPlaces(page);
    await page.locator('[data-place-travel="4"]').click();
    await openPlaces(page);
    await page.locator('[data-place-travel="49"]').click();
    await expect(experience).toHaveAttribute('data-miniature-id', '49');
    // The queue keeps one factory in flight and replaces intermediate pending selections.
    expect(assetRequests).toEqual(['/models/geosites/rebuilt/gms-08.glb']);
    const oldResponse = page.waitForResponse(/\/models\/geosites\/rebuilt\/gms-08\.glb$/);
    releaseOldLoads();
    await (await oldResponse).finished();
    await expect(experience).toHaveAttribute('data-miniature-id', '49');
    await expect(experience).toHaveAttribute('data-miniature-state', 'ready');
    await expect(page.locator('#experience-miniature-name')).toHaveText('Parque Rodó');
    expect(assetRequests.slice(0, 2)).toEqual([
      '/models/geosites/rebuilt/gms-08.glb',
      '/models/geosites/parque-rodo.glb',
    ]);
    expect(assetRequests).not.toContain('/models/geosites/rebuilt/gms-04.glb');
    // A completed selection can then load at most two neighbours of its room.
    const permitted = new Set(
      [16, 35, 36, 37, 38, 40, 42, 43, 44, 45, 47, 48, 60, 61].map(
        (id) => `/models/geosites/rebuilt/gms-${id}.glb`,
      ),
    );
    permitted.add('/models/geosites/cerro-artigas.glb');
    expect(new Set(assetRequests.slice(2)).size).toBeLessThanOrEqual(2);
    for (const path of assetRequests.slice(2)) expect(permitted.has(path), path).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    releaseOldLoads();
  }
});

test('la miniatura admite vista cercana y permite volver a caminar', async ({
  page,
  browserName,
}) => {
  test.setTimeout(60_000);
  // Simulate an incomplete inventory: this place retains its card and model,
  // but the world must not invent a geographic pin for it.
  await page.route('**/experiencia/', async (route) => {
    const response = await route.fetch();
    const html = await response.text();
    const body = html.replace(
      /(<script\b[^>]*id="experience-data"[^>]*>)([\s\S]*?)(<\/script>)/,
      (_match, start: string, payload: string, end: string) => {
        const data: { points: ExperiencePoint[] } = JSON.parse(payload);
        data.points = data.points.map<ExperiencePoint>((point) =>
          point.id === 58 ? { ...point, located: false, location: null, x: null, z: null } : point,
        );
        return `${start}${JSON.stringify(data).replace(/</g, '\\u003c')}${end}`;
      },
    );
    await route.fulfill({ response, body });
  });
  await page.goto('/experiencia/');
  const experience = await waitForExperience(page);
  if (browserName === 'chromium') await expect(experience).toHaveAttribute('data-state', 'ready');
  await openPlaces(page);
  await page.locator('[data-place-travel="1"]').click();
  const inspect = page.locator('[data-holo-panel="1"] [data-view-miniature]');
  if ((await experience.getAttribute('data-state')) !== 'ready') {
    await expect(inspect).toBeDisabled();
    return;
  }
  await expect(experience).toHaveAttribute('data-miniature-state', 'ready');
  await inspect.click();
  await expect(experience).toHaveAttribute('data-inspecting', 'true');
  await expect(page.locator('[data-holo-panel="1"]')).toBeHidden();
  await expect(page.locator('#experience-miniature-exit')).toBeVisible();
  const studyCanvas = page.locator('#experience-canvas'),
    studyBox = (await studyCanvas.boundingBox())!;
  const studyViewport = computeInspectionViewport(studyBox.width, studyBox.height);
  await studyCanvas.click({
    position: {
      x: studyViewport.x + studyViewport.width / 2,
      y: studyViewport.y + studyViewport.height / 2,
    },
    modifiers: ['Shift'],
  });
  await expect(experience).toHaveAttribute('data-detail-focused', 'true');
  await page.locator('#experience-miniature-reset').click();
  await expect(experience).toHaveAttribute('data-detail-focused', 'false');
  await page.screenshot({ path: test.info().outputPath('arequita-inspection.png') });
  await page.locator('#experience-miniature-exit').click();
  await expect(experience).toHaveAttribute('data-inspecting', 'false');
  await expect(page.locator('#experience-canvas')).toBeFocused();
  await page.locator('[data-restore-panel="1"]').click();
  await inspect.click();
  await expect(experience).toHaveAttribute('data-inspecting', 'true');
  await page.keyboard.down('d');
  try {
    await expect(experience).toHaveAttribute('data-inspecting', 'false');
  } finally {
    await page.keyboard.up('d');
  }
  // The incomplete runtime inventory has no pin58. E follows its study model;
  // the original SSR source and precision remain independently visible.
  await openPlaces(page);
  await page.locator('[data-place-travel="58"]').click();
  await expect(page.locator('#experience-nearby-category')).not.toContainText('GMS 58');
  await expect(page.locator('[data-holo-panel="58"]')).toContainText('APROXIMADA');
  await page.locator('[data-holo-panel="58"] [data-view-miniature]').click();
  await expect(experience).toHaveAttribute('data-inspecting', 'true');
  await page.keyboard.press('e');
  await expect(page.locator('[data-holo-panel="58"]')).toBeVisible();
  await expect(page.locator('[data-holo-panel="1"]')).toBeHidden();
});

test('el clic izquierdo en el paisaje permite accionar sin usar el teclado', async ({ page }) => {
  await page.goto('/experiencia/');
  const experience = await waitForExperience(page);
  if ((await experience.getAttribute('data-state')) === 'ready') {
    const canvas = page.locator('#experience-canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    await canvas.click({ position: { x: box!.width * 0.55, y: box!.height * 0.55 } });
    await expect(experience).toHaveAttribute('data-cluster', 'arequita');
    await page.getByRole('button', { name: 'Recorrer la sala →', exact: true }).click();
    await openPlaces(page);
    await page.locator('[data-place-travel="1"]').click();
    await page.locator('[data-holo-panel="1"] [data-panel-close]').click();
    await canvas.click({ position: { x: box!.width * 0.55, y: box!.height * 0.55 } });
    const panel = page.locator('[data-holo-panel]');
    await expect(panel).toHaveCount(1);
    const id = Number(await panel.getAttribute('data-holo-panel'));
    await expect(panel).toContainText(places.find((place) => place.id === id)!.name);
  } else {
    await openPlaces(page);
    await page.locator('[data-place-travel="1"]').click();
    await expect(page.locator('[data-holo-panel="1"]')).toBeVisible();
  }
});

test('las ventanas admiten varias fichas, movimiento con mouse y teclado, minimizar y cerrar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/experiencia/');
  await waitForExperience(page);
  await openPlaces(page);
  await page.locator('[data-place-travel="1"]').click();
  const panel = page.locator('[data-holo-panel="1"]');
  await expect(panel).toBeVisible();
  const handle = panel.locator('[data-panel-drag]');
  await handle.focus();
  const initial = await panel.boundingBox();
  expect(initial).not.toBeNull();
  await handle.press('ArrowLeft');
  await expect.poll(async () => (await panel.boundingBox())!.x).toBeLessThan(initial!.x);
  const beforeDrag = await panel.boundingBox();
  const grip = await handle.boundingBox();
  expect(grip).not.toBeNull();
  await page.mouse.move(grip!.x + grip!.width / 2, grip!.y + grip!.height / 2);
  await page.mouse.down();
  await page.mouse.move(grip!.x + grip!.width / 2 - 60, grip!.y + grip!.height / 2 + 30, {
    steps: 6,
  });
  await page.mouse.up();
  await expect.poll(async () => (await panel.boundingBox())!.x).toBeLessThan(beforeDrag!.x - 20);

  await openPlaces(page);
  await page.locator('[data-place-travel="23"]').click();
  await expect(page.locator('[data-holo-panel="1"]')).toBeVisible();
  await expect(page.locator('[data-holo-panel="23"]')).toBeVisible();
  await page
    .getByRole('button', { name: 'Minimizar ficha de Cerro Arequita', exact: true })
    .press('Enter');
  await expect(panel).toBeHidden();
  await page
    .locator('#experience-dock')
    .getByRole('button', { name: /Restaurar.*Cerro Arequita/ })
    .click();
  await expect(panel).toBeVisible();
  await panel.locator('[data-panel-drag]').focus();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.locator('[data-holo-panel="23"]')).toBeVisible();
});

test('caminar cambia la posición y pausa y foco evitan movimiento involuntario', async ({
  page,
}) => {
  await page.goto('/experiencia/');
  const experience = await waitForExperience(page);
  if ((await experience.getAttribute('data-state')) !== 'ready') {
    await openPlaces(page);
    await page.locator('[data-place-travel="14"]').click();
    await expect(page.locator('[data-holo-panel="14"]')).toBeVisible();
    return;
  }
  const position = async () =>
    experience.evaluate((element) => ({
      x: Number((element as HTMLElement).dataset.playerX),
      z: Number((element as HTMLElement).dataset.playerZ),
    }));
  await expect.poll(async () => Number.isFinite((await position()).x)).toBe(true);
  const initial = await position();
  await page.locator('#experience-canvas').focus();
  await page.keyboard.down('d');
  await expect
    .poll(async () => {
      const next = await position();
      return Math.hypot(next.x - initial.x, next.z - initial.z);
    })
    .toBeGreaterThan(1);
  await page.keyboard.up('d');
  await page.locator('#experience-pause').click();
  await page.waitForTimeout(250);
  const paused = await position();
  await page.locator('#experience-canvas').focus();
  await page.keyboard.down('w');
  await page.waitForTimeout(500);
  await page.keyboard.up('w');
  const still = await position();
  expect(Math.hypot(still.x - paused.x, still.z - paused.z)).toBeLessThan(0.1);
});

test('sin WebGL existe recuperación usable y las fichas continúan disponibles', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextId: string,
      ...args: unknown[]
    ) {
      if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl')
        return null;
      return getContext.apply(this, [contextId, ...args] as Parameters<typeof getContext>);
    } as typeof getContext;
  });
  await page.goto('/experiencia/');
  await expect(page.locator('[data-experience]')).toHaveAttribute('data-state', 'fallback');
  await openPlaces(page);
  await expect(page.locator('[data-place-travel]')).toHaveCount(places.length);
  await page.locator('[data-place-travel="14"]').click();
  const panel = page.locator('[data-holo-panel="14"]');
  await expect(panel).toContainText('Salto del Penitente');
  await panel.locator('a[href="/lugares/salto-del-penitente/"]').click();
  await expect(page.locator('h1')).toHaveText('Salto del Penitente');
});

test('una descarga fallida del controlador conserva el archivo HTML y la salida al sitio', async ({
  page,
}) => {
  let blocked = false;
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(/\/controller\.[^/]+\.js(?:\?.*)?$/, async (route) => {
    blocked = true;
    await route.abort('failed');
  });
  await page.goto('/experiencia/');
  await expect(page.locator('[data-experience]')).toHaveAttribute('data-state', 'fallback');
  expect(blocked).toBe(true);
  await expect(page.locator('#experience-loading')).toBeHidden();
  await expect(page.locator('#experience-fallback')).toBeVisible();
  const directory = page.locator('#experience-directory');
  await expect(directory).toBeVisible();
  await expect(page.locator('#experience-place-search')).toBeDisabled();
  await expect(directory.locator('.geo-place-list a[href^="/lugares/"]')).toHaveCount(
    places.length,
  );
  await directory.locator('.geo-place-list a[href="/lugares/cerro-arequita/"]').click();
  await expect(page.locator('h1')).toHaveText('Cerro Arequita');
  expect(errors).toEqual([]);
});

test('perder el contexto gráfico recupera las fichas sin errores ni un cargador permanente', async ({
  page,
  browserName,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/experiencia/');
  const experience = await waitForExperience(page);
  if ((await experience.getAttribute('data-state')) === 'ready') {
    const lost = await page.locator('#experience-canvas').evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      const extension = canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context');
      if (extension) {
        extension.loseContext();
        return true;
      }
      canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
      return false;
    });
    if (browserName === 'chromium') expect(lost).toBe(true);
  }
  await expect(experience).toHaveAttribute('data-state', 'fallback');
  await expect(page.locator('#experience-loading')).toBeHidden();
  await expect(page.locator('#experience-fallback')).toBeVisible();
  await openPlaces(page);
  await page.locator('[data-place-travel="1"]').click();
  await expect(page.locator('[data-holo-panel="1"]')).toContainText('Cerro Arequita');
  expect(errors).toEqual([]);
});

test('navegar de la experiencia a las fichas y regresar no acumula errores', async ({
  page,
  browserName,
}) => {
  const errors: string[] = [];
  const speculativeRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/experiencia/' && !request.isNavigationRequest())
      speculativeRequests.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  for (let visit = 0; visit < 2; visit++) {
    await page.locator('a[href="/experiencia/"]').first().click();
    await waitForExperience(page);
    await openPlaces(page);
    await page.locator('[data-place-travel="1"]').click();
    await page.locator('[data-holo-panel="1"] a[href="/lugares/cerro-arequita/"]').click();
    await expect(page.locator('h1')).toHaveText('Cerro Arequita');
    await page.goBack();
    const restored = await waitForExperience(page);
    await expect(page.locator('#experience-canvas')).toHaveCount(1);
    if (browserName === 'chromium') await expect(restored).toHaveAttribute('data-state', 'ready');
    if ((await restored.getAttribute('data-state')) === 'ready') {
      const position = () =>
        restored.evaluate((element) => Number((element as HTMLElement).dataset.playerX));
      await expect.poll(async () => Number.isFinite(await position())).toBe(true);
      const initialX = await position();
      await page.locator('#experience-canvas').focus();
      await page.keyboard.down('d');
      try {
        await expect.poll(async () => Math.abs((await position()) - initialX)).toBeGreaterThan(0.3);
      } finally {
        await page.keyboard.up('d');
      }
    }
    await page.goto('/');
  }
  expect(errors).toEqual([]);
  expect(speculativeRequests).toEqual([]);
});

test('entrada y directorio accesibles con movimiento reducido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/experiencia/']) {
    await page.goto(route);
    if (route === '/experiencia/') {
      await waitForExperience(page);
      await openPlaces(page);
    }
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact || ''),
      ),
    ).toEqual([]);
  }
});

for (const house of [
  { id: 'villa-serrana', name: 'Casa de Villa Serrana', manual: 'teclado' },
  { id: 'verdun', name: 'Casa del entorno del Verdún', manual: 'botón' },
  { id: 'aguas-blancas', name: 'Casa de Aguas Blancas', manual: 'clic' },
] as const) {
  test(`${house.name}: el acceso permite volver a entrar caminando y con ${house.manual}`, async ({
    page,
    browserName,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/experiencia/');
    const experience = await waitForExperience(page);
    if (browserName === 'chromium') await expect(experience).toHaveAttribute('data-state', 'ready');
    test.skip(
      (await experience.getAttribute('data-state')) !== 'ready',
      'Este navegador usa el archivo accesible sin WebGL.',
    );

    const inventory = JSON.parse((await page.locator('#experience-data').textContent())!) as {
      clusters: { id: string; x: number; z: number }[];
    };
    const center = inventory.clusters.find((cluster) => cluster.id === house.id)!;
    expect(center).toBeDefined();
    const canvas = page.locator('#experience-canvas');
    const action = page.locator('#experience-action');
    const position = () =>
      experience.evaluate((element) => ({
        x: Number((element as HTMLElement).dataset.playerX),
        z: Number((element as HTMLElement).dataset.playerZ),
      }));
    async function leaveToApproach() {
      await page.getByRole('button', { name: 'Recorrer la sala →', exact: true }).click();
      await page.locator('#experience-area-exit').click();
      await expect(experience).toHaveAttribute('data-cluster', '');
      // Wait for the walking frame, rather than reading the previous room's HUD
      // coordinates immediately after its synchronous scene-change callback.
      await expect
        .poll(async () => {
          const point = await position();
          return (
            Math.abs(point.x - center.x) < 0.2 && point.z > center.z + 8 && point.z < center.z + 12
          );
        })
        .toBe(true);
      await expect(action).toHaveText('Entrar a la casa');
      await expect(page.locator('#experience-nearby-name')).toHaveText(house.name);
      return position();
    }

    await openPlaces(page);
    await page.locator(`[data-cluster-travel="${house.id}"]`).click();
    await expect(experience).toHaveAttribute('data-cluster', house.id);
    const outside = await leaveToApproach();

    // Directory travel and leaving preserve the initial yaw (0.3 rad). W moves
    // toward -Z with a small +X drift, still entirely inside the visible opening.
    // Start immediately: a long portal cooldown must not swallow this crossing.
    await canvas.focus();
    await page.keyboard.down('w');
    try {
      await expect
        .poll(async () => {
          if ((await experience.getAttribute('data-cluster')) === house.id) return true;
          const point = await position();
          return point.z < outside.z - 0.5 && point.x > outside.x + 0.1;
        })
        .toBe(true);
      await expect(experience).toHaveAttribute('data-cluster', house.id, { timeout: 20_000 });
    } finally {
      await page.keyboard.up('w');
    }
    await expect(page.locator('#experience-cluster-info')).toBeVisible();
    await expect(page.locator('#experience-area')).toContainText(house.name);

    await leaveToApproach();
    await page.screenshot({ path: test.info().outputPath(`${house.id}-entrance.png`) });
    if (house.manual === 'teclado') {
      await canvas.focus();
      await page.keyboard.press('e');
    } else if (house.manual === 'botón') {
      await action.click();
    } else {
      const bounds = (await canvas.boundingBox())!;
      await canvas.click({ position: { x: bounds.width * 0.55, y: bounds.height * 0.55 } });
    }
    await expect(experience).toHaveAttribute('data-cluster', house.id);
    await expect(page.locator('#experience-cluster-info')).toBeVisible();
    await expect(page.locator('#experience-area')).toContainText(house.name);
  });
}

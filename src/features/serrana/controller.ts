import { createAvatar } from './avatar';

type Source = { title: string; url: string };
type Turn = { role: 'user' | 'assistant'; content: string };
type ChatEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; sources: Source[] }
  | { type: 'error'; message: string };

interface PageContext {
  listen: (
    target: EventTarget | null,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ) => void;
  raf: (callback: FrameRequestCallback) => number;
  cleanups: (() => void)[];
}

const connectionError = 'Serrana no pudo conectarse. Volvé a enviar tu pregunta en unos instantes.';

function recentTurns(turns: Turn[]) {
  const recent: Turn[] = [];
  let remaining = 4800;
  for (const turn of turns.slice(-12).reverse()) {
    if (remaining <= 0) break;
    const content = turn.content.slice(0, Math.min(remaining, 1600));
    recent.unshift({ ...turn, content });
    remaining -= content.length;
  }
  return recent;
}

async function receive(response: Response, onDelta: (text: string) => void): Promise<Source[]> {
  if (!response.ok) {
    const payload: { error?: unknown } | null = await response.json().catch(() => null);
    throw new Error(typeof payload?.error === 'string' ? payload.error : connectionError);
  }
  if (!response.headers.get('content-type')?.includes('application/x-ndjson') || !response.body) {
    throw new Error(connectionError);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      if (pending.length > 160_000) throw new Error(connectionError);
      const lines = pending.split('\n');
      pending = done ? '' : lines.pop()!;
      for (const line of lines) {
        if (!line.trim()) continue;
        let event: ChatEvent;
        try {
          event = JSON.parse(line) as ChatEvent;
        } catch {
          throw new Error(connectionError);
        }
        if (event?.type === 'delta' && typeof event.text === 'string') onDelta(event.text);
        if (event?.type === 'error') {
          throw new Error(typeof event.message === 'string' ? event.message : connectionError);
        }
        if (event?.type === 'done') return Array.isArray(event.sources) ? event.sources : [];
      }
      if (done)
        throw new Error('La respuesta quedó incompleta. Podés volver a enviar tu pregunta.');
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

function appendInline(container: HTMLElement, text: string) {
  for (const segment of text.split(/(\*\*[^*\n]+\*\*|`[^`\n]+`)/)) {
    if (segment.startsWith('**') && segment.endsWith('**') && segment.length > 4) {
      const strong = document.createElement('strong');
      strong.textContent = segment.slice(2, -2);
      container.append(strong);
    } else if (segment.startsWith('`') && segment.endsWith('`') && segment.length > 2) {
      const code = document.createElement('code');
      code.textContent = segment.slice(1, -1);
      container.append(code);
    } else {
      container.append(segment);
    }
  }
}

function formatReply(container: HTMLElement, text: string) {
  const fragment = document.createDocumentFragment();
  for (const section of text.trim().split(/\n\s*\n/)) {
    const lines = section.split('\n');
    const hasBullets = lines.every((line) => /^\s*[-*]\s+/.test(line));
    if (hasBullets) {
      const list = document.createElement('ul');
      for (const line of lines) {
        const item = document.createElement('li');
        appendInline(item, line.replace(/^\s*[-*]\s+/, ''));
        list.append(item);
      }
      fragment.append(list);
    } else {
      const paragraph = document.createElement('p');
      appendInline(paragraph, lines.map((line) => line.replace(/^\s*#{1,6}\s+/, '')).join('\n'));
      fragment.append(paragraph);
    }
  }
  container.replaceChildren(fragment);
}

function appendSources(message: HTMLElement, sources: Source[]) {
  const list = document.createElement('ul');
  for (const source of sources.slice(0, 10)) {
    if (typeof source?.title !== 'string' || typeof source.url !== 'string') continue;
    let url: URL;
    try {
      url = new URL(source.url, location.origin);
    } catch {
      continue;
    }
    const local = source.url.startsWith('/') && url.origin === location.origin;
    if (!local && (url.protocol !== 'https:' || !source.url.startsWith('https://'))) continue;
    if (url.username || url.password) continue;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = local ? `${url.pathname}${url.search}${url.hash}` : url.href;
    link.textContent = source.title.slice(0, 240);
    if (!local) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    item.append(link);
    list.append(item);
  }
  if (!list.childElementCount) return;
  const panel = document.createElement('div');
  panel.className = 'serrana-sources';
  const heading = document.createElement('strong');
  heading.textContent = 'Fuentes de esta respuesta';
  panel.append(heading, list);
  message.append(panel);
}

export function initSerrana(c: PageContext) {
  const dialog = document.querySelector<HTMLDialogElement>('#serrana-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const find = <T extends HTMLElement>(part: string) =>
    dialog.querySelector<T>(`[data-serrana-${part}]`)!;
  const log = find<HTMLDivElement>('log');
  const welcome = find<HTMLDivElement>('welcome');
  const form = find<HTMLFormElement>('form');
  const question = dialog.querySelector<HTMLTextAreaElement>('textarea')!;
  const send = find<HTMLButtonElement>('send');
  const stop = find<HTMLButtonElement>('stop');
  const reset = find<HTMLButtonElement>('reset');
  const errorBox = find('error');
  const status = find('status');
  const contextBadge = find('context');
  const contextName = find('context-name');
  const avatar = createAvatar(find('avatar'));
  let opener: HTMLButtonElement | undefined;
  let placeId: number | undefined;
  let active: AbortController | undefined;
  let history: Turn[] = [];
  let disposed = false;

  function busy(value: boolean) {
    const needsFocus = value ? document.activeElement === send : document.activeElement === stop;
    send.hidden = value;
    stop.hidden = !value;
    if (needsFocus) (value ? stop : question).focus({ preventScroll: true });
  }

  function showError(message = '') {
    errorBox.hidden = !message;
    errorBox.textContent = message.slice(0, 450);
  }

  function addMessage(role: Turn['role'], text: string) {
    const message = document.createElement('article');
    message.className = 'serrana-message';
    message.dataset.role = role;
    const author = document.createElement('p');
    author.className = 'serrana-message-name';
    author.textContent = role === 'user' ? 'Vos' : 'Serrana';
    const content = document.createElement('div');
    content.className = 'serrana-message-text';
    content.textContent = text;
    message.append(author, content);
    log.append(message);
    return { message, content };
  }

  function scrollEnd() {
    log.scrollTop = log.scrollHeight;
  }

  async function ask() {
    const message = question.value.trim();
    if (!message || message.length > question.maxLength || active) return;
    const controller = new AbortController();
    active = controller;
    question.value = '';
    welcome.hidden = true;
    reset.hidden = false;
    showError();
    addMessage('user', message);
    const answer = addMessage('assistant', 'Consultando la guía…');
    status.textContent = 'Serrana está consultando la guía.';
    avatar.update('thinking');
    busy(true);
    scrollEnd();
    let text = '';
    let pending = '';
    let revealing = false;
    let revealAt = 0;
    let sources: Source[] | undefined;

    function fail(reason = '') {
      if (active !== controller || disposed) return;
      if (text.trim()) formatReply(answer.content, text);
      else answer.message.remove();
      if (!question.value) question.value = message;
      showError(reason);
      status.textContent = reason ? 'La consulta no se completó.' : 'Consulta detenida.';
      active = undefined;
      busy(false);
      avatar.update('ready');
      avatar.idle();
    }
    controller.signal.addEventListener('abort', () => fail(), { once: true });

    function finish() {
      if (active !== controller || !sources) return;
      if (text.trim()) {
        formatReply(answer.content, text);
        appendSources(answer.message, sources);
        history = recentTurns([
          ...history,
          { role: 'user', content: message },
          { role: 'assistant', content: text },
        ]);
        status.textContent = 'Respuesta de Serrana disponible en la conversación.';
      } else {
        answer.message.remove();
        if (!question.value) question.value = message;
        showError(connectionError);
      }
      active = undefined;
      busy(false);
      avatar.update('ready');
    }

    function reveal(time: number) {
      if (active !== controller || controller.signal.aborted) return;
      const follow = log.scrollHeight - log.scrollTop - log.clientHeight < 70;
      if (time - revealAt >= 24 || avatar.media.matches) {
        const count = avatar.media.matches
          ? pending.length
          : Math.max(5, Math.ceil(pending.length / 20));
        answer.content.append(pending.slice(0, count));
        pending = pending.slice(count);
        revealAt = time;
        if (follow) scrollEnd();
      }
      revealing = pending.length > 0;
      if (revealing) c.raf(reveal);
      else finish();
    }

    try {
      const response = await fetch(`${import.meta.env.PUBLIC_SERRANA_API_BASE}/api/serrana/chat`, {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
        body: JSON.stringify({ message, history, ...(placeId ? { context: { placeId } } : {}) }),
        signal: controller.signal,
      });
      sources = await receive(response, (delta) => {
        if (controller.signal.aborted || active !== controller) return;
        if (!text) answer.content.textContent = '';
        text += delta;
        pending += delta;
        avatar.update('answering');
        avatar.talk(delta);
        if (!revealing) {
          revealing = true;
          c.raf(reveal);
        }
      });
      if (!revealing) finish();
    } catch (error) {
      fail(
        error instanceof Error && !(error instanceof TypeError) ? error.message : connectionError,
      );
    }
  }

  function setContext(id?: number, name?: string) {
    placeId = id && Number.isInteger(id) && id >= 1 && id <= 61 ? id : undefined;
    contextName.textContent = placeId && name ? name : '';
    contextBadge.hidden = !placeId || !name;
  }

  function exposeTriggers(root: ParentNode) {
    root
      .querySelectorAll<HTMLButtonElement>('[data-serrana-open]')
      .forEach((button) => (button.hidden = false));
  }
  exposeTriggers(document);
  // The 3D experience copies place controls from templates after this page is initialized.
  for (const template of document.querySelectorAll<HTMLTemplateElement>(
    'template[data-place-template]',
  )) {
    exposeTriggers(template.content);
  }

  c.listen(document, 'click', (event) => {
    const target = (event.target as Element | null)?.closest<HTMLButtonElement>(
      '[data-serrana-open]',
    );
    if (!target || dialog.open) return;
    opener = target;
    setContext(Number(target.dataset.serranaPlaceId), target.dataset.serranaPlaceName);
    dialog.showModal();
    document.dispatchEvent(new CustomEvent('serrana:visibility', { detail: true }));
    avatar.open();
    question.focus({ preventScroll: true });
  });
  c.listen(dialog, 'close', () => {
    active?.abort();
    avatar.close();
    document.dispatchEvent(new CustomEvent('serrana:visibility', { detail: false }));
    if (opener?.isConnected && !disposed) opener.focus({ preventScroll: true });
  });
  c.listen(find('close'), 'click', () => dialog.close());
  c.listen(find('clear-context'), 'click', () => {
    setContext();
    question.focus({ preventScroll: true });
  });
  c.listen(dialog, 'click', (event) => {
    const prompt = (event.target as Element | null)?.closest<HTMLButtonElement>(
      '[data-serrana-prompt]',
    );
    if (!prompt || active) return;
    question.value = prompt.dataset.serranaPrompt!;
    question.focus({ preventScroll: true });
  });
  c.listen(form, 'submit', (event) => {
    event.preventDefault();
    void ask();
  });
  c.listen(question, 'keydown', (event) => {
    const key = event as KeyboardEvent;
    if (key.key !== 'Enter' || key.shiftKey || key.isComposing) return;
    event.preventDefault();
    if (!active && question.value.trim()) form.requestSubmit();
  });
  c.listen(stop, 'click', () => active?.abort());
  c.listen(reset, 'click', () => {
    active?.abort();
    active = undefined;
    history = [];
    log.replaceChildren(welcome);
    welcome.hidden = false;
    question.value = '';
    busy(false);
    reset.hidden = true;
    showError();
    status.textContent = 'Nueva conversación.';
    avatar.update('ready');
    question.focus({ preventScroll: true });
  });
  c.listen(avatar.image, 'load', avatar.idle);
  c.listen(avatar.media, 'change', avatar.idle);
  c.listen(document, 'visibilitychange', avatar.idle);
  c.cleanups.push(() => {
    disposed = true;
    active?.abort();
    avatar.close();
    if (dialog.open) dialog.close();
  });
}

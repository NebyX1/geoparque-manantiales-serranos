export interface OllamaConfig {
  baseUrl: string;
  model: string;
  apiKey?: string;
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
}

export type ChatErrorCode =
  | 'INVALID_INPUT'
  | 'UNAVAILABLE'
  | 'AUTH'
  | 'MODEL'
  | 'RATE_LIMIT'
  | 'UNGROUNDED'
  | 'UPSTREAM'
  | 'TIMEOUT';

export class ChatError extends Error {
  constructor(
    public readonly code: ChatErrorCode,
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

const MAX_ANSWER_LENGTH = 9_000;
const MAX_RESPONSE_BYTES = 256 * 1024;
const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]']);

export function ollamaEndpoint(config: OllamaConfig) {
  let url: URL;
  try {
    url = new URL(config.baseUrl);
  } catch {
    throw new ChatError('UNAVAILABLE', 503, 'Serrana no está configurada en este servidor.');
  }
  const plainHttp = url.protocol === 'http:' && (!config.apiKey || LOOPBACK.has(url.hostname));
  if (
    (!plainHttp && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    !config.model.trim()
  ) {
    throw new ChatError('UNAVAILABLE', 503, 'Serrana no está configurada en este servidor.');
  }
  if (url.hostname === 'ollama.com' && !config.apiKey?.trim()) {
    throw new ChatError('UNAVAILABLE', 503, 'Serrana todavía no puede conectarse al asistente.');
  }
  url.search = '';
  url.hash = '';
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/api/chat`;
  return url;
}

function upstreamStatus(status: number) {
  if (status === 401 || status === 403) {
    return new ChatError('AUTH', 502, 'El proveedor de Serrana rechazó la conexión.');
  }
  if (status === 404) {
    return new ChatError('MODEL', 502, 'El modelo de Serrana no está disponible en el proveedor.');
  }
  if (status === 429) {
    return new ChatError(
      'RATE_LIMIT',
      503,
      'Serrana alcanzó el límite de consultas. Probá en un momento.',
    );
  }
  return new ChatError(
    'UPSTREAM',
    502,
    'El asistente no pudo completar la respuesta. Probá en un momento.',
  );
}

function parseFrame(line: string): { content: string; done: boolean } {
  let frame: unknown;
  try {
    frame = JSON.parse(line);
  } catch {
    throw upstreamStatus(502);
  }
  if (
    !frame ||
    typeof frame !== 'object' ||
    'error' in frame ||
    !('done' in frame) ||
    typeof frame.done !== 'boolean'
  ) {
    throw upstreamStatus(502);
  }
  const message = 'message' in frame ? frame.message : undefined;
  const content =
    message && typeof message === 'object' && 'content' in message ? message.content : '';
  if (
    typeof content !== 'string' ||
    (frame.done && 'done_reason' in frame && frame.done_reason === 'length')
  ) {
    throw upstreamStatus(502);
  }
  return { content, done: frame.done };
}

async function* lines(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let pending = '';
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_RESPONSE_BYTES) throw upstreamStatus(502);
    pending += decoder.decode(value, { stream: true });
    let index = pending.indexOf('\n');
    while (index !== -1) {
      const line = pending.slice(0, index).trim();
      if (line) yield line;
      pending = pending.slice(index + 1);
      index = pending.indexOf('\n');
    }
  }
  const last = (pending + decoder.decode()).trim();
  if (last) yield last;
}

export async function* streamOllama(
  config: OllamaConfig,
  messages: readonly { role: 'system' | 'user'; content: string }[],
  client?: AbortSignal,
) {
  const url = ollamaEndpoint(config);
  const deadline = AbortSignal.timeout(config.timeoutMs ?? 65_000);
  const signal = client ? AbortSignal.any([deadline, client]) : deadline;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const headers = new Headers({
      'content-type': 'application/json',
      accept: 'application/x-ndjson',
    });
    if (config.apiKey?.trim()) headers.set('authorization', `Bearer ${config.apiKey.trim()}`);
    const response = await (config.fetch ?? globalThis.fetch)(url, {
      method: 'POST',
      headers,
      signal,
      redirect: 'error',
      body: JSON.stringify({
        model: config.model,
        messages,
        think: false,
        stream: true,
        options: { temperature: 0.2, num_predict: 650 },
      }),
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw upstreamStatus(response.status);
    }
    reader = response.body?.getReader();
    if (!reader) throw upstreamStatus(502);
    let total = 0;
    for await (const line of lines(reader)) {
      signal.throwIfAborted();
      const frame = parseFrame(line);
      total += frame.content.length;
      if (total > MAX_ANSWER_LENGTH) throw upstreamStatus(502);
      if (frame.content) yield frame.content;
      if (frame.done && total > 0) return;
    }
    throw upstreamStatus(502);
  } catch (error) {
    client?.throwIfAborted();
    if (deadline.aborted) {
      throw new ChatError(
        'TIMEOUT',
        504,
        'La respuesta de Serrana tardó demasiado. Probá de nuevo.',
      );
    }
    if (error instanceof ChatError) throw error;
    throw upstreamStatus(502);
  } finally {
    if (reader) {
      // The response can be cancelled when the widget closes or an output limit is reached.
      void reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }
}

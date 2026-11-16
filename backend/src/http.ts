import { once } from 'node:events';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { ChatError, parseChatInput, streamSerranaChat } from './chat.js';
import { knowledgeInfo } from './knowledge.js';
import { ollamaEndpoint, type OllamaConfig } from './ollama.js';

export const chatPath = '/api/serrana/chat';
const readyPath = '/api/ready';
const bodyLimit = 24 * 1024;
const maxConcurrent = 4;
const minute = 60_000;

class RequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  if (request.headers['content-type']?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
    throw new RequestError(415, 'Enviá la consulta en formato JSON.');
  }
  if (Number(request.headers['content-length']) > bodyLimit) {
    throw new RequestError(413, 'La consulta o el historial son demasiado largos.');
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += data.length;
    if (size > bodyLimit)
      throw new RequestError(413, 'La consulta o el historial son demasiado largos.');
    chunks.push(data);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new RequestError(400, 'No pude leer la consulta.');
  }
}

function corsOrigins(environment: NodeJS.ProcessEnv) {
  const production = environment.NODE_ENV === 'production';
  const origins = (
    environment.CORS_ORIGINS ?? (production ? '' : 'http://localhost:4321,http://127.0.0.1:4321')
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (production && !origins.length) {
    throw new Error('Configurá CORS_ORIGINS con el origen HTTPS del sitio en producción.');
  }
  for (const origin of origins) {
    const url = URL.canParse(origin) ? new URL(origin) : undefined;
    if (
      !url ||
      url.origin !== origin ||
      url.hostname.includes('*') ||
      (url.protocol !== 'https:' && (production || url.protocol !== 'http:'))
    ) {
      throw new Error(
        'CORS_ORIGINS debe contener orígenes exactos, sin rutas ni barra final. En producción usá HTTPS.',
      );
    }
  }
  return new Set(origins);
}

function sendJson(response: ServerResponse, status: number, value: object) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

function respond(response: ServerResponse, status: number, error: string) {
  sendJson(response, status, { error });
}

function configureCors(request: IncomingMessage, response: ServerResponse, origins: Set<string>) {
  response.setHeader('Vary', 'Origin');
  const origin = request.headers.origin;
  if (origin !== undefined) {
    if (!origins.has(origin)) return false;
    response.setHeader('Access-Control-Allow-Origin', origin);
    return true;
  }
  const site = request.headers['sec-fetch-site'];
  return !site || site === 'same-origin' || site === 'none';
}

function preflight(request: IncomingMessage, response: ServerResponse, method: string) {
  response.setHeader(
    'Vary',
    'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
  );
  const headers = (request.headers['access-control-request-headers'] ?? '')
    .toLowerCase()
    .split(',')
    .map((header) => header.trim())
    .filter(Boolean);
  if (
    !request.headers.origin ||
    request.headers['access-control-request-method'] !== method ||
    headers.some((header) => header !== 'content-type')
  ) {
    return respond(response, 403, 'La solicitud CORS no está permitida.');
  }
  response.setHeader('Access-Control-Allow-Methods', method);
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Max-Age', '600');
  response.writeHead(204).end();
}

function providerConfig(environment: NodeJS.ProcessEnv): OllamaConfig {
  const key = environment.OLLAMA_API_KEY?.trim();
  return {
    baseUrl:
      environment.OLLAMA_HOST?.trim() ||
      environment.OLLAMA_BASE_URL?.trim() ||
      'https://ollama.com',
    model: environment.OLLAMA_MODEL?.trim() || 'deepseek-v4.1-flash',
    ...(key ? { apiKey: key } : {}),
  };
}

function providerConfigured(config: OllamaConfig) {
  try {
    ollamaEndpoint(config);
    return true;
  } catch (error) {
    if (!(error instanceof ChatError)) throw error;
    return false;
  }
}

export function createSerranaHandler(environment: NodeJS.ProcessEnv = process.env) {
  const origins = corsOrigins(environment);
  const config = providerConfig(environment);
  const ready = providerConfigured(config);
  let active = 0;
  const attempts: number[] = [];
  const configuredLimit = Number(environment.SERRANA_REQUESTS_PER_MINUTE);
  const rate =
    Number.isSafeInteger(configuredLimit) && configuredLimit > 0
      ? Math.min(configuredLimit, 300)
      : 30;

  return async function handleSerranaRequest(request: IncomingMessage, response: ServerResponse) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    const path = request.url?.split('?', 1)[0];
    if (path !== chatPath && path !== readyPath) return respond(response, 404, 'Ruta inexistente.');
    if (!configureCors(request, response, origins))
      return respond(response, 403, 'Abrí Serrana desde un sitio del Geoparque autorizado.');
    if (request.method === 'OPTIONS') {
      return preflight(request, response, path === chatPath ? 'POST' : 'GET');
    }
    if (path === readyPath) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.setHeader('Allow', 'GET, HEAD, OPTIONS');
        return respond(response, 405, 'Usá GET para comprobar el servicio.');
      }
      return sendJson(
        response,
        ready ? 200 : 503,
        ready
          ? { status: 'ready', catalog: knowledgeInfo }
          : { status: 'unavailable', code: 'PROVIDER_NOT_CONFIGURED' },
      );
    }
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST, OPTIONS');
      return respond(response, 405, 'Usá POST para consultar a Serrana.');
    }
    const now = Date.now();
    while (attempts.length && attempts[0]! <= now - minute) attempts.shift();
    if (active >= maxConcurrent || attempts.length >= rate) {
      response.setHeader('Retry-After', attempts.length >= rate ? '60' : '5');
      return respond(
        response,
        429,
        'Serrana está atendiendo otras consultas. Probá en un momento.',
      );
    }

    const abort = new AbortController();
    const cancel = () => abort.abort();
    const timeout = () => request.destroy();
    response.once('close', cancel);
    request.setTimeout(10_000, timeout);
    attempts.push(now);
    active++;
    try {
      const input = parseChatInput(await readJson(request));
      request.setTimeout(0);
      for await (const event of streamSerranaChat(input, config, abort.signal)) {
        if (abort.signal.aborted) return;
        if (!response.headersSent) {
          response.writeHead(200, {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'X-Accel-Buffering': 'no',
          });
        }
        if (!response.write(JSON.stringify(event) + '\n')) {
          await once(response, 'drain', { signal: abort.signal });
        }
      }
      response.end();
    } catch (error) {
      if (abort.signal.aborted || response.destroyed) return;
      const known = error instanceof ChatError || error instanceof RequestError;
      const status = known ? error.status : 500;
      const message = known ? error.message : 'No pude completar la consulta en este momento.';
      if (status >= 500)
        console.warn('[serrana] consulta interrumpida', {
          status,
          code: error instanceof ChatError ? error.code : 'INTERNAL',
          durationMs: Date.now() - now,
        });
      if (!response.headersSent) respond(response, status, message);
      else response.end(JSON.stringify({ type: 'error', message }) + '\n');
    } finally {
      active--;
      response.off('close', cancel);
      request.off('timeout', timeout);
    }
  };
}

export function createSerranaServer(environment: NodeJS.ProcessEnv = process.env) {
  return createServer(
    { requestTimeout: 15_000, headersTimeout: 10_000 },
    createSerranaHandler(environment),
  );
}

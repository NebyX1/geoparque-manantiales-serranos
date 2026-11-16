import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    web: { type: 'string' },
    api: { type: 'string' },
    catalog: { type: 'string' },
  },
});

function origin(value, option) {
  const url = value && URL.canParse(value) ? new URL(value) : null;
  if (
    !url ||
    !['http:', 'https:'].includes(url.protocol) ||
    url.origin !== value.replace(/\/$/, '')
  ) {
    throw new Error(`Indicá --${option} con el origen HTTP(S) del servicio.`);
  }
  return url.origin;
}

const web = origin(values.web, 'web');
const api = origin(values.api, 'api');
const chat = '/api/serrana/chat';

async function request(base, path, expected, init) {
  const response = await fetch(base + path, {
    ...init,
    redirect: 'error',
    signal: AbortSignal.timeout(12_000),
  });
  if (response.status !== expected) {
    throw new Error(
      `${init?.method || 'GET'} ${base}${path}: HTTP ${response.status}, esperado ${expected}.`,
    );
  }
  return response;
}

const [health, page, guide, readiness] = await Promise.all([
  request(web, '/health', 200),
  request(web, '/inicio/', 200),
  request(web, '/serrana/guia.md', 200),
  request(api, '/api/ready', 200),
  request(web, '/__verificacion_coolify_inexistente__/', 404),
  request(api, '/.env', 404),
]);
if ((await health.text()).trim() !== 'ok') throw new Error('Respuesta de /health inesperada.');
if (!guide.headers.get('content-type')?.startsWith('text/markdown')) {
  throw new Error('La guía pública de Serrana debe servirse como Markdown.');
}
const connectSources = page.headers
  .get('content-security-policy')
  ?.split(';')
  .map((directive) => directive.trim().split(/\s+/u))
  .find(([name]) => name === 'connect-src');
if (!connectSources?.slice(1).includes(api)) {
  throw new Error(
    'La CSP de la web no incluye el origen de la API. Revisá PUBLIC_SERRANA_API_BASE y reconstruí la web.',
  );
}

const { status, catalog } = await readiness.json();
if (
  status !== 'ready' ||
  !Number.isSafeInteger(catalog?.documents) ||
  catalog.documents < 1 ||
  !Number.isSafeInteger(catalog.places) ||
  catalog.places < 1 ||
  !/^[a-f0-9]{64}$/u.test(catalog.sha256)
) {
  throw new Error('La API no informó un catálogo válido en /api/ready.');
}
if (values.catalog) {
  const local = (await readFile(values.catalog, 'utf8')).replace(/\r\n/g, '\n');
  const expected = createHash('sha256').update(local).digest('hex');
  if (catalog.sha256 !== expected)
    throw new Error('El catálogo desplegado difiere del archivo local indicado.');
}

const preflight = (origin, expected) =>
  request(api, chat, expected, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
const [allowed, denied] = await Promise.all([
  preflight(web, 204),
  preflight('https://origen-ajeno.invalid', 403),
]);
if (
  allowed.headers.get('access-control-allow-origin') !== web ||
  allowed.headers.get('access-control-allow-methods') !== 'POST' ||
  denied.headers.has('access-control-allow-origin')
) {
  throw new Error('La API no aplicó la lista CORS esperada.');
}

const greeting = await request(api, chat, 200, {
  method: 'POST',
  headers: { Origin: web, 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
  body: JSON.stringify({ message: 'Hola' }),
});
const events = (await greeting.text())
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line));
if (
  !greeting.headers.get('content-type')?.startsWith('application/x-ndjson') ||
  greeting.headers.get('access-control-allow-origin') !== web ||
  events[0]?.type !== 'delta' ||
  typeof events[0].text !== 'string' ||
  !events[0].text.includes('Soy Serrana') ||
  events.at(-1)?.type !== 'done'
) {
  throw new Error('La API no completó el saludo de verificación.');
}

console.info('Web, API y CORS correctos.');
console.info(
  `Catálogo cargado: ${catalog.documents} documentos, ${catalog.places} lugares, SHA-256 ${catalog.sha256}.`,
);

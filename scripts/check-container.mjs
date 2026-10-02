import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const url = process.env.CONTAINER_URL || 'http://127.0.0.1:8088';
const name = process.env.CONTAINER_NAME || 'geoparque-validation';
const checks = [];
async function check(path, expectedStatus) {
  const response = await fetch(`${url}${path}`, { redirect: 'manual' });
  if (response.status !== expectedStatus)
    throw new Error(`${path}: ${response.status}, expected ${expectedStatus}`);
  checks.push({ path, status: response.status });
  return response;
}
const health = await check('/health', 200);
if ((await health.text()).trim() !== 'ok') throw new Error('Invalid health body');
for (const path of [
  '/',
  '/lugares/cerro-arequita/',
  '/historias/agua/',
  '/circuitos/arequita/',
  '/planifica/',
  '/robots.txt',
  '/llms.txt',
  '/guia.md',
  '/lugares.md',
  '/sitemap-index.xml',
])
  await check(path, 200);
for (const path of [
  '/ruta-inexistente/',
  '/Manantiales_Serranos_v2.html',
  '/docs/architecture.md',
  '/tests/unit/content.test.ts',
])
  await check(path, 404);
await check('/.env', 403);
const html = await check('/', 200);
for (const header of [
  'content-security-policy',
  'x-content-type-options',
  'referrer-policy',
  'x-frame-options',
  'permissions-policy',
])
  if (!html.headers.has(header)) throw new Error(`Missing ${header}`);
if (!html.headers.get('cache-control')?.includes('must-revalidate')) throw new Error('HTML cache');
const body = await html.text();
if (!body.includes('https://manantialesserranos.uy/') || body.includes('noindex,nofollow'))
  throw new Error('Production SEO metadata');
const asset = body.match(/href="(\/_astro\/[^" ]+\.css)"/)?.[1];
const css = await check(asset, 200);
if (!css.headers.get('cache-control')?.includes('immutable')) throw new Error('Asset cache');
const markdown = await check('/guia.md', 200);
if (!markdown.headers.get('content-type')?.includes('text/markdown'))
  throw new Error('Markdown MIME');
const sitemap = await (await fetch(`${url}/sitemap-0.xml`)).text();
const editorialUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((match) => match[1])
  .filter((location) => new URL(location).pathname.endsWith('/'));
if (editorialUrls.length !== 78) throw new Error('Production sitemap HTML count');
const canonicals = new Set();
const titles = new Set();
const documents = await Promise.all(
  editorialUrls.map(async (location) => {
    const path = new URL(location).pathname;
    const response = await fetch(`${url}${path}`);
    if (response.status !== 200) throw new Error(`Production route: ${path}`);
    return { location, path, page: await response.text() };
  }),
);
for (const { location, path, page } of documents) {
  const canonical = page.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const title = page.match(/<title>(.*?)<\/title>/s)?.[1];
  if (canonical !== location || canonicals.has(canonical))
    throw new Error(`Production canonical: ${path}`);
  if (!title || titles.has(title)) throw new Error(`Production title: ${path}`);
  if (page.includes('noindex') || !page.match(/name="description" content="[^"]+"/))
    throw new Error(`Production metadata: ${path}`);
  for (const match of page.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))
    JSON.parse(match[1]);
  canonicals.add(canonical);
  titles.add(title);
}
const identity = execFileSync('docker', ['exec', name, 'id'], { encoding: 'utf8' }).trim();
if (identity.includes('uid=0(')) throw new Error('Privileged runtime');
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync(
  'reports/docker-validation.json',
  JSON.stringify({ identity, checks, seoDocuments: editorialUrls.length }, null, 2),
);
console.log(
  JSON.stringify({
    identity,
    checks: checks.length,
    seoDocuments: editorialUrls.length,
    result: 'passed',
  }),
);

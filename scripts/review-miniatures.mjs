import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const output = 'reports/experience-review/next-quality/three-models';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const errors = [],
  responses = [],
  results = [];
const assetHashes = new Map(),
  assetReads = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('response', (response) => {
  if (response.status() >= 400) responses.push({ url: response.url(), status: response.status() });
  if (response.url().endsWith('.glb') && response.ok())
    assetReads.push(
      response
        .body()
        .then((body) =>
          assetHashes.set(response.url(), createHash('sha256').update(body).digest('hex')),
        ),
    );
});
async function inspect(id) {
  await page.locator('#experience-places-toggle').click();
  await page.locator('#experience-place-search').fill('');
  await page.locator(`[data-place-travel="${id}"]`).click();
  await page.locator(`[data-holo-panel="${id}"] [data-view-miniature]`).click();
  await page.waitForFunction(
    (id) =>
      document
        .querySelector('[data-experience]')
        ?.getAttribute('data-rendered-scene')
        ?.endsWith(`/inspect/ready/${id}`),
    id,
    { timeout: 25000 },
  );
}
try {
  await page.goto('http://127.0.0.1:4321/experiencia/');
  await page.locator('[data-experience][data-state="ready"]').waitFor();
  const points = await page
    .locator('#experience-data')
    .evaluate((node) => JSON.parse(node.textContent).points);
  const selected = process.argv
    .find((arg) => arg.startsWith('--ids='))
    ?.slice(6)
    .split(',')
    .map(Number);
  for (const point of points.filter(
    (point) =>
      (!selected || selected.includes(point.id)) && !process.argv.includes('--viewport-only'),
  )) {
    const started = performance.now();
    await inspect(point.id);
    await page.screenshot({
      path: `${output}/gms-${String(point.id).padStart(2, '0')}-desktop.png`,
    });
    if (point.id === 2 && !process.argv.includes('--skip-detail')) {
      const detailCanvas = page.locator('#experience-canvas');
      await detailCanvas.click({ position: { x: 835, y: 425 }, modifiers: ['Shift'] });
      await page.locator('[data-experience][data-detail-focused="true"]').waitFor();
      await page.mouse.wheel(0, -85);
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${output}/gms-02-casita-detail.png` });
      await page.locator('#experience-miniature-reset').click();
    }
    // Actual drag changes the viewing angle through the production controls.
    const canvas = page.locator('#experience-canvas');
    const box = await canvas.boundingBox();
    await page.mouse.move(box.width * 0.5, box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.width * 0.5 + 160, box.height * 0.5 - 25, { steps: 5 });
    await page.mouse.up();
    await page.screenshot({
      path: `${output}/gms-${String(point.id).padStart(2, '0')}-oblique.png`,
    });
    results.push({
      id: point.id,
      name: point.name,
      ready: true,
      elapsedMs: Math.round(performance.now() - started),
    });
    await page.locator('#experience-miniature-exit').click();
    console.log(`REVIEWED GMS-${point.id}`);
  }
  const viewports = process.argv.includes('--desktop-only')
    ? []
    : [
        [320, 900],
        [844, 390],
        [640, 450],
      ];
  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    for (const id of [2, 35, 41, 46, 50, 52]) {
      await inspect(id);
      await page.screenshot({ path: `${output}/gms-${id}-${width}x${height}.png` });
      await page.locator('#experience-miniature-exit').click();
    }
  }
  await Promise.all(assetReads);
  await writeFile(
    `${output}/review.json`,
    JSON.stringify(
      {
        date: new Date().toISOString(),
        results,
        errors,
        responses,
        assetHashes: Object.fromEntries(assetHashes),
      },
      null,
      2,
    ),
  );
  if (errors.length || responses.length) throw new Error(JSON.stringify({ errors, responses }));
} finally {
  await browser.close();
}

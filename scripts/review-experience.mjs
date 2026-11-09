import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const output = 'reports/experience-review/next-quality/browser';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const errors = [];
async function settled() {
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-experience]');
    const rendered = root?.getAttribute('data-rendered-scene')?.split('/');
    return (
      rendered?.[0] === (root?.getAttribute('data-cluster') || 'territory') &&
      rendered[1] ===
        (root?.getAttribute('data-overview') === 'true'
          ? 'map'
          : root?.getAttribute('data-inspecting') === 'true'
            ? 'inspect'
            : 'walk')
    );
  });
}
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
try {
  await page.goto('http://127.0.0.1:4321/experiencia/');
  await page.locator('[data-experience][data-state="ready"]').waitFor();
  await settled();
  await page.screenshot({ path: `${output}/outside.png` });
  await page.locator('#experience-overview').click();
  await settled();
  await page.screenshot({ path: `${output}/territory-overview.png` });
  await page.locator('#experience-overview').click();
  await page.locator('#experience-action').click();
  await page.getByRole('button', { name: 'Recorrer la sala →', exact: true }).click();
  await settled();
  await page.screenshot({ path: `${output}/inside-arequita.png` });
  await page.locator('#experience-area-exit').click();
  for (const cluster of [
    'nacientes',
    'villa-serrana',
    'minas',
    'aguas-blancas',
    'solis',
    'verdun',
    'valle',
  ]) {
    await page.locator('#experience-places-toggle').click();
    await page.locator(`[data-cluster-travel="${cluster}"]`).click();
    await page.getByRole('button', { name: 'Recorrer la sala →', exact: true }).click();
    await settled();
    await page.screenshot({ path: `${output}/inside-${cluster}.png` });
    await page.locator('#experience-area-exit').click();
    await settled();
    await page.screenshot({ path: `${output}/outside-${cluster}.png` });
  }
  for (const [width, height] of [
    [320, 640],
    [390, 844],
    [844, 390],
    [960, 540],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.screenshot({ path: `${output}/world-${width}x${height}.png` });
    await page.locator('#experience-places-toggle').click();
    await page.locator('[data-cluster-travel="minas"]').click();
    await settled();
    await page.screenshot({ path: `${output}/welcome-${width}x${height}.png` });
    await page.getByRole('button', { name: 'Recorrer la sala →', exact: true }).click();
    await page.screenshot({ path: `${output}/room-${width}x${height}.png` });
    await page.locator('#experience-area-exit').click();
  }
  await writeFile(`${output}/world-errors.json`, JSON.stringify(errors, null, 2));
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  await browser.close();
}

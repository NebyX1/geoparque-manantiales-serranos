import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const output = 'reports/experience-review/photo-audit/browser';
await mkdir(output, { recursive: true });
const inventory = JSON.parse(await readFile('src/data/place-photos.json', 'utf8'));
const browser = await chromium.launch();
const errors = [];
const results = [];
const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4321';
const directory = await browser.newPage();
await directory.goto(`${base}/lugares/`);
const place60Path = await directory.locator('.place-card[data-id="60"] h3 a').getAttribute('href');
await directory.close();
if (!place60Path) throw new Error('Missing canonical directory link for GMS-60');
const cases = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'wide', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'small', width: 320, height: 680 },
  { name: 'landscape', width: 844, height: 390 },
  { name: 'low', width: 1280, height: 600 },
  { name: 'zoom-200-equivalent', width: 640, height: 450, dpr: 2 },
];
try {
  for (const size of cases) {
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      deviceScaleFactor: size.dpr || 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(`${size.name}: ${error.message}`));
    await page.goto(`${base}${place60Path}`);
    await page.locator('.detail-hero img').evaluate((image) => image.decode());
    await page.screenshot({ path: `${output}/place-60-${size.name}.png` });
    results.push({
      route: page.url(),
      size: size.name,
      noHorizontalOverflow: await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      fit: await page
        .locator('.detail-hero img')
        .evaluate((image) => getComputedStyle(image).objectFit),
    });
    await page.goto(`${base}/creditos-fotograficos/#gms-60-restored`);
    const item = page.locator('#gms-60-restored');
    await item.locator('summary').click();
    await item.locator('.photo-audit-image').evaluate((image) => image.decode());
    await item.locator('.photo-audit-original img').evaluate((image) => image.decode());
    await item.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/photo-comparison-${size.name}.png` });
    results.push({
      route: 'photo-comparison',
      size: size.name,
      originalFit: await item
        .locator('.photo-audit-original img')
        .evaluate((image) => getComputedStyle(image).objectFit),
      noHorizontalOverflow: await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    });
    if (['desktop', 'mobile', 'small', 'landscape', 'zoom-200-equivalent'].includes(size.name)) {
      await page.goto(`${base}/experiencia/`);
      await page.waitForFunction(
        () =>
          /^(ready|fallback)$/.test(
            document.querySelector('[data-experience]')?.dataset.state || '',
          ),
        null,
        { timeout: 45_000 },
      );
      const sharedPhotos = await page
        .locator('template[data-place-template]')
        .evaluateAll((templates) =>
          templates.map((template) => ({
            id: Number(template.dataset.placeTemplate),
            alt: template.content.querySelector('.holo-photo img')?.alt,
            kind: template.content.querySelector('.holo-photo img')?.dataset.photoKind,
            source: template.content.querySelector('.photo-credit a')?.getAttribute('href'),
          })),
        );
      for (const photo of inventory) {
        const found = sharedPhotos.find((item) => item.id === photo.id);
        if (
          found?.alt !== photo.alt ||
          found?.kind !== photo.kind ||
          found?.source !== `/creditos-fotograficos/#${photo.key}`
        )
          errors.push(`Shared photo mismatch ${size.name} / GMS-${photo.id}`);
      }
      await page.locator('#experience-places-toggle').click();
      await page.locator('#experience-place-search').fill('miniaturas');
      await page.locator('[data-place-travel="60"]').click();
      const panel = page.locator('[data-holo-panel="60"]');
      await panel.waitFor({ state: 'visible' });
      await panel.locator('.holo-photo img').evaluate((image) => image.decode());
      await page.screenshot({ path: `${output}/immersive-60-${size.name}.png` });
      results.push({
        route: 'immersive-60',
        size: size.name,
        noHorizontalOverflow: await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        fit: await panel
          .locator('.holo-photo img')
          .evaluate((image) => getComputedStyle(image).objectFit),
        photoFilter: await panel
          .locator('.holo-photo img')
          .evaluate((image) => getComputedStyle(image).filter),
      });
    }
    await context.close();
  }
} finally {
  await browser.close();
}
const report = { results, errors, generatedAt: new Date().toISOString() };
await writeFile(`${output}/review.json`, `${JSON.stringify(report, null, 2)}\n`);
if (
  errors.length ||
  results.some(
    (result) =>
      !result.noHorizontalOverflow ||
      (result.fit && result.fit !== 'contain') ||
      (result.originalFit && result.originalFit !== 'contain') ||
      (result.photoFilter && result.photoFilter !== 'none'),
  )
)
  throw new Error('Photographic visual review failed; inspect review.json');
console.log(
  `${results.length} responsive photo captures, no shared-photo mismatches or page errors`,
);

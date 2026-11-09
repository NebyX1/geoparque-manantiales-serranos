// Decode response bitmaps; naturalWidth is density-corrected with srcset.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const stage = process.argv[2] || 'current';
const output = `reports/experience-review/photo-resolution/${stage}`;
await fs.mkdir(output, { recursive: true });
const routes = ['/', '/inicio/', '/lugares/', '/explorar/', '/historias/', '/circuitos/'];
for (const directory of ['lugares', 'historias', 'circuitos']) {
  for (const entry of await fs.readdir(`dist/${directory}`, { withFileTypes: true })) {
    if (entry.isDirectory()) routes.push(`/${directory}/${entry.name}/`);
  }
}
async function measureImages(nodes) {
  await document.fonts.ready;
  const results = [];
  for (const img of nodes) {
    if (!img.clientWidth || !img.clientHeight || !img.getClientRects().length) continue;
    img.loading = 'eager';
    let decodeError;
    for (let attempt = 0; attempt < 3; attempt++) {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      try {
        await img.decode();
        decodeError = undefined;
        break;
      } catch (error) {
        decodeError = String(error);
      }
    }
    if (decodeError) {
      results.push({ alt: img.alt, error: decodeError, source: img.currentSrc });
      continue;
    }
    const bitmap = await createImageBitmap(await (await fetch(img.currentSrc)).blob());
    const fit = getComputedStyle(img).objectFit;
    const scale = fit === 'contain' || fit === 'scale-down' ? Math.min : Math.max;
    const required =
      scale(img.clientWidth, (img.clientHeight * bitmap.width) / bitmap.height) * devicePixelRatio;
    results.push({
      key: img.dataset.photoKey,
      alt: img.alt,
      source: img.currentSrc,
      kind: img.dataset.photoKind,
      cssWidth: img.clientWidth,
      cssHeight: img.clientHeight,
      fit,
      bitmap: [bitmap.width, bitmap.height],
      required: Math.round(required),
      density: +(bitmap.width / required).toFixed(3),
      sizes: img.sizes,
    });
    bitmap.close();
  }
  return results;
}
const browser = await chromium.launch();
const results = [];
try {
  for (const [width, height, dpr, full] of [
    [1920, 944, 1, true],
    [1920, 944, 2, true],
    [390, 944, 2, true],
    [320, 680, 3, false],
    [844, 390, 2, false],
    [1280, 600, 1.25, false],
    [640, 450, 2, false],
    [1920, 1080, 3, false],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const visit = full ? routes : ['/', '/inicio/'];
    for (const route of visit) {
      await page.goto(`http://127.0.0.1:4321${route}`);
      const images = await page.locator('img[data-photo-kind]').evaluateAll(measureImages);
      results.push(...images.map((image) => ({ route, width, height, dpr, ...image })));
      if (route === '/inicio/') {
        for (const selector of ['.education-image', '.nature-photo', '.culture-feature']) {
          await page
            .locator(selector)
            .screenshot({ path: `${output}/${selector.slice(1)}-${width}-${dpr}.png` });
        }
        await page.locator('#inicio').screenshot({ path: `${output}/hero-${width}-${dpr}.png` });
      }
    }
    if (full && dpr === 2) {
      await page.goto('http://127.0.0.1:4321/inicio/');
      await page.locator('[data-gallery="0"]').click();
      for (let index = 0; index < 12; index++) {
        const images = await page.locator('#lightbox-image').evaluateAll(measureImages);
        results.push(
          ...images.map((image) => ({
            route: '/inicio/#gallery',
            index,
            width,
            height,
            dpr,
            ...image,
          })),
        );
        if (index < 11) await page.locator('#gallery-next').click();
      }
      await page.goto('http://127.0.0.1:4321/experiencia/');
      await page.waitForFunction(
        () =>
          /^(ready|fallback)$/.test(
            document.querySelector('[data-experience]')?.dataset.state || '',
          ),
        null,
        { timeout: 60_000 },
      );
      const ids = await page
        .locator('template[data-place-template]')
        .evaluateAll((nodes) => nodes.map((node) => node.dataset.placeTemplate));
      // Exact photo panels, without teleporting and loading 61 separate 3D models.
      for (const id of ids) {
        await page.evaluate((id) => {
          const panel = document
            .querySelector(`template[data-place-template="${id}"]`)
            .content.firstElementChild.cloneNode(true);
          panel.id = 'photo-resolution-review-panel';
          Object.assign(panel.style, {
            left: '8px',
            top: '8px',
            width: `${Math.min(650, innerWidth - 24)}px`,
          });
          document.querySelector('#experience-panels').append(panel);
        }, id);
        const images = await page
          .locator('#photo-resolution-review-panel .holo-photo img')
          .evaluateAll(measureImages);
        results.push(
          ...images.map((image) => ({ route: '/experiencia/', id, width, height, dpr, ...image })),
        );
        if (['49', '56'].includes(id))
          await page
            .locator('#photo-resolution-review-panel .holo-photo')
            .screenshot({ path: `${output}/immersive-${id}-${width}.png` });
        await page.locator('#photo-resolution-review-panel').evaluate((node) => node.remove());
      }
    }
    await context.close();
    console.log(
      `Measured ${visit.length} routes at ${width}x${height} DPR ${dpr}${full && dpr === 2 ? ', gallery and 61 immersive photo panels' : ''}`,
    );
  }
} finally {
  await browser.close();
}
await fs.writeFile(`${output}/audit.json`, JSON.stringify(results, null, 2));
const shortages = results.filter((row) => row.density < 0.985 || row.error);
await fs.writeFile(`${output}/shortages.json`, JSON.stringify(shortages, null, 2));
console.log(`${results.length} image slots; ${shortages.length} undersampled or decode failures.`);
if (stage !== 'before' && shortages.length) process.exitCode = 1;

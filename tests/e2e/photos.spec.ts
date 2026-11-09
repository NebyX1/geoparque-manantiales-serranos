import { test, expect } from '@playwright/test';
import { places } from '../../src/data/geosites';
import { photoForPlace } from '../../src/data/place-photos';

test('las secciones, el atlas, las fichas y la galería no amplían bitmaps insuficientes', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(120_000);
  const education = places.find((place) => place.id === 56)!;
  const smallSource = places.find((place) => place.id === 49)!;
  for (const width of [1920, 390]) {
    const context = await browser.newContext({
      ...(baseURL ? { baseURL } : {}),
      viewport: { width, height: 944 },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    async function assertPixels(selector = 'img[data-photo-width]') {
      const measured = await page.locator(selector).evaluateAll(async (nodes) => {
        await document.fonts.ready;
        const results = [];
        for (const node of nodes) {
          const img = node as HTMLImageElement;
          if (!img.clientWidth || !img.clientHeight || !img.getClientRects().length) continue;
          img.loading = 'eager';
          let failure: unknown;
          for (let attempt = 0; attempt < 3; attempt++) {
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
            );
            try {
              await img.decode();
              failure = undefined;
              break;
            } catch (error) {
              failure = error;
            }
          }
          if (failure) throw failure;
          const bitmap = await createImageBitmap(await (await fetch(img.currentSrc)).blob());
          const fit = getComputedStyle(img).objectFit;
          const scale = fit === 'contain' || fit === 'scale-down' ? Math.min : Math.max;
          const required =
            scale(img.clientWidth, (img.clientHeight * bitmap.width) / bitmap.height) *
            devicePixelRatio;
          results.push({
            key: img.dataset.photoKey,
            ratio: bitmap.width / required,
            source: img.currentSrc,
          });
          bitmap.close();
        }
        return results;
      });
      expect(measured.length).toBeGreaterThan(0);
      for (const result of measured)
        expect(result.ratio, `${width}px ${result.key}: ${result.source}`).toBeGreaterThanOrEqual(
          0.985,
        );
    }
    try {
      for (const route of [
        '/inicio/',
        '/explorar/',
        '/historias/educacion/',
        `/lugares/${education.slug}/`,
        `/lugares/${smallSource.slug}/`,
      ]) {
        await page.goto(route);
        await assertPixels();
      }
      await page.goto('/inicio/');
      await page.locator('[data-gallery="0"]').click();
      for (let index = 0; index < 12; index++) {
        await assertPixels('#lightbox-image');
        if (index < 11) await page.locator('#gallery-next').click();
      }
    } finally {
      await context.close();
    }
  }
});

test('entrada y Parque de Minas entregan suficientes píxeles para el recorte y la densidad real', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(90_000);
  for (const [width, dpr] of [
    [1904, 1],
    [1904, 2],
    [390, 2],
  ] as const) {
    const context = await browser.newContext({
      ...(baseURL ? { baseURL } : {}),
      viewport: { width, height: 944 },
      deviceScaleFactor: dpr,
      reducedMotion: 'reduce',
    });
    try {
      const page = await context.newPage();
      for (const [route, selector] of [
        ['/', '.entry-card-web img'],
        ['/inicio/', '#geo-scene-2 .geo-photo img'],
      ] as const) {
        await page.goto(route);
        const image = page.locator(selector);
        await image.scrollIntoViewIfNeeded();
        const pixels = await image.evaluate(async (node) => {
          const img = node as HTMLImageElement;
          await img.decode();
          const bitmap = await createImageBitmap(await (await fetch(img.currentSrc)).blob());
          const required =
            Math.max(img.clientWidth, (img.clientHeight * bitmap.width) / bitmap.height) *
            devicePixelRatio;
          const result = { actual: bitmap.width, required, source: img.currentSrc };
          bitmap.close();
          return result;
        });
        expect(pixels.actual, `${width}px DPR ${dpr}: ${pixels.source}`).toBeGreaterThanOrEqual(
          pixels.required * 0.985,
        );
      }
    } finally {
      await context.close();
    }
  }
});

test('las fichas comunes muestran la imagen identificada, su fuente y el tipo de fotografía', async ({
  page,
}) => {
  for (const id of [31, 54, 60]) {
    const place = places.find((entry) => entry.id === id)!;
    const photo = photoForPlace(id);
    await page.goto(`/lugares/${place.slug}/`);
    const image = page.locator('.detail-hero img');
    await expect(image).toHaveAttribute('alt', photo.alt);
    await expect(image).toHaveAttribute('data-photo-kind', photo.kind);
    await expect(page.locator('.detail-photo-caption')).toHaveText(photo.caption);
    await expect(
      page.locator(`.photo-credit a[href="/creditos-fotograficos/#${photo.key}"]`),
    ).toBeVisible();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((img) => (img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    if (id === 60) {
      await expect(image).toHaveAttribute('data-photo-fit', 'contain');
      await expect(page.locator('.photo-credit')).toContainText('Restauración con IA');
    }
  }
});

test('mapa y galería actualizan imagen, rótulo y procedencia en la web común', async ({ page }) => {
  await page.goto('/inicio/');
  await expect(page.locator('html')).toHaveClass(/js/);
  await page.locator('g[data-map-place="54"]').press('Enter');
  await expect(page.locator('#map-preview-image')).toHaveAttribute('data-photo-kind', 'aerial');
  await expect(page.locator('#map-preview-caption')).toContainText('2017–2018');
  await expect(page.locator('#map-preview-source')).toHaveAttribute(
    'href',
    '/creditos-fotograficos/#gms-54',
  );
  await page.locator('[data-gallery="0"]').click();
  await expect(page.locator('#gallery-dialog')).toBeVisible();
  await expect(page.locator('#lightbox-title')).toContainText('restauración con IA');
  await expect(page.locator('#lightbox-source')).toHaveAttribute(
    'href',
    '/creditos-fotograficos/#aguas',
  );
  await page.keyboard.press('Escape');
  await page.goto('/creditos-fotograficos/#gms-60-restored');
  const item = page.locator('#gms-60-restored');
  await item.locator('summary').click();
  await expect(item.locator('.photo-audit-original img')).toBeVisible();
  await expect(item.locator('.photo-audit-original img')).toHaveAttribute(
    'src',
    '/photo-originals/gms-60.jpg',
  );
});

test('el visor inmersivo usa la misma fotografía y conserva su identificación y créditos', async ({
  page,
}) => {
  await page.goto('/experiencia/');
  await expect(page.locator('[data-experience]')).toHaveAttribute(
    'data-state',
    /^(ready|fallback)$/,
  );
  const toggle = page.locator('#experience-places-toggle');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await page.locator('#experience-place-search').fill('miniaturas');
  await page.locator('[data-place-travel="60"]').click();
  const panel = page.locator('[data-holo-panel="60"]');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.holo-photo img')).toHaveAttribute('alt', photoForPlace(60).alt);
  await expect(panel.locator('.holo-photo img')).toHaveAttribute('data-photo-kind', 'restored');
  await expect(panel.locator('.photo-credit')).toContainText('Restauración con IA');
  await expect(panel.locator('.photo-credit a')).toHaveAttribute(
    'href',
    '/creditos-fotograficos/#gms-60-restored',
  );
});

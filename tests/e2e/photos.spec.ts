import { test, expect, type Locator } from '@playwright/test';
import { places } from '../../src/data/geosites';
import { photoAuditUrl, photoForAsset, photoForDisplay } from '../../src/data/place-photos';
import { photoProfiles, heroDesktopProfile } from '../../src/lib/photo-profiles.mjs';

async function expectImageProfile(image: Locator, profile: keyof typeof photoProfiles | 'hero') {
  const { width, height } = profile === 'hero' ? heroDesktopProfile : photoProfiles[profile];
  await expect(image).toHaveAttribute('data-photo-profile', profile);
  await expect(image).toHaveAttribute('data-photo-width', String(width));
  await expect(image).toHaveAttribute('data-photo-height', String(height));
  await expect(image).toHaveAttribute('data-photo-fit', 'cover');
  await expect(image).toHaveCSS('object-fit', 'cover');
}

async function expectFrameFilled(frame: Locator, label: string) {
  const bounds = await frame.evaluate((el) => {
    const { left, right, top, bottom } = el.getBoundingClientRect();
    const photo = el.querySelector('img')!.getBoundingClientRect();
    const caption = el.querySelector('.detail-photo-caption')!.getBoundingClientRect();
    const content = el.nextElementSibling!.getBoundingClientRect();
    return {
      left: Math.abs(photo.left - left),
      right: Math.abs(photo.right - right),
      top: Math.abs(photo.top - top),
      bottom: Math.abs(photo.bottom - bottom),
      captionInside:
        caption.left >= left - 1 &&
        caption.right <= right + 1 &&
        caption.top >= top - 1 &&
        caption.bottom <= bottom + 1,
      contentBelow: content.top >= bottom - 1,
    };
  });
  expect(Math.max(bounds.left, bounds.right, bounds.top, bounds.bottom), label).toBeLessThan(1);
  expect(bounds.captionInside, label).toBe(true);
  expect(bounds.contentBelow, label).toBe(true);
}

test('las tarjetas ambientales usan fotos horizontales y el carrusel conserva sus fuentes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/inicio/');
  const water = page.locator('#eje-agua .knowledge-image img');
  await expect(water).toHaveAttribute('data-photo-key', photoForAsset('rio')!.key);
  await expectImageProfile(water, 'editorial');
  await expect(page.locator('#aprender .education-image img')).toHaveAttribute(
    'data-photo-key',
    photoForAsset('escuela')!.key,
  );
  for (const image of await page.locator('.knowledge-image img').all()) {
    await expectImageProfile(image, 'editorial');
    const { width, height } = (await image.boundingBox())!;
    expect(width / height).toBeCloseTo(16 / 9, 2);
  }
  for (const [index, key] of ['arequita-rio', 'aguas', 'salus', 'parque'].entries()) {
    await page.locator(`[data-hero="${index}"]`).click();
    await expectImageProfile(page.locator(`.hero-image[data-slide="${index}"] img`), 'hero');
    await expect(page.locator('#hero-caption a')).toHaveAttribute(
      'href',
      photoAuditUrl(photoForAsset(key)!),
    );
  }
});

test('las secciones, tarjetas y galerías sirven suficientes píxeles en pantallas de densidad doble', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(240_000);
  const education = places.find((place) => place.id === 56)!;
  const smallSource = places.find((place) => place.id === 49)!;
  for (const [width, height] of [
    [2145, 944],
    [844, 390],
    [390, 844],
  ] as const) {
    const context = await browser.newContext({
      ...(baseURL ? { baseURL } : {}),
      viewport: { width, height },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    async function assertPixels(selector = 'img[data-photo-profile]') {
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
          const coverWidth =
            scale(img.clientWidth, (img.clientHeight * bitmap.width) / bitmap.height) *
            devicePixelRatio;
          const sourceWidth = Number(
            (innerWidth <= 620 && img.dataset.photoMobileWidth) || img.dataset.photoWidth,
          );
          const required = img.closest('.hero-image')
            ? Math.min(coverWidth, sourceWidth)
            : coverWidth;
          results.push({
            key: img.dataset.photoKey,
            resolution: bitmap.width / required,
            proportion: bitmap.width / bitmap.height,
            profile: img.dataset.photoProfile!,
            source: img.currentSrc,
          });
          bitmap.close();
        }
        return results;
      });
      expect(measured.length).toBeGreaterThan(0);
      for (const result of measured) {
        const label = `${width}px ${result.profile} ${result.key}`;
        expect(result.source, label).toMatch(/\.webp(?:[?#].*)?$/);
        expect(result.resolution, label).toBeGreaterThanOrEqual(0.985);
        if (result.profile !== 'hero') {
          const profile = photoProfiles[result.profile as keyof typeof photoProfiles];
          expect(profile, label).toBeDefined();
          expect(result.proportion, label).toBeCloseTo(profile.width / profile.height, 2);
        }
      }
    }
    try {
      for (const route of [
        '/inicio/',
        '/explorar/',
        '/historias/',
        '/historias/educacion/',
        '/circuitos/agua-bosque/',
        `/lugares/${education.slug}/`,
        `/lugares/${smallSource.slug}/`,
      ]) {
        await page.goto(route);
        await assertPixels();
      }
      await page.goto('/inicio/');
      await page.locator('[data-gallery="0"]').click();
      const lightboxImage = page.locator('#lightbox-image');
      for (let index = 0; index < 12; index++) {
        await expectImageProfile(lightboxImage, 'gallery');
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
    const photo = photoForDisplay(id);
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
    await expect(page.locator('.photo-credit')).toContainText(photo.credit);
  }
});

test('las portadas de ficha respetan su marco en la página y la vista rápida', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [path, scope, placeId] of [
    ['/lugares/el-destacamento/', '.place-page', 5],
    ['/lugares/museo-de-replicas-en-miniaturas/', '.place-page', 60],
    ['/inicio/#lugar/campamento-aguas-blancas', '#place-dialog', 23],
  ] as const) {
    await page.goto(path);
    const frame = page.locator(`${scope} .detail-hero`);
    await expect(frame).toBeVisible();
    await expect(frame.locator('img')).toHaveAttribute(
      'data-photo-key',
      photoForDisplay(placeId).key,
    );
    await expectImageProfile(
      frame.locator('img'),
      scope === '.place-page' ? 'place-cover' : 'editorial',
    );
    for (const viewport of [
      { width: 2145, height: 900 },
      { width: 844, height: 390 },
      { width: 320, height: 620 },
    ]) {
      await page.setViewportSize(viewport);
      const label = `${path} · ${viewport.width}×${viewport.height}`;
      await expectFrameFilled(frame, label);
      if (viewport.width === 320) {
        await page.locator('html').evaluate((html) => (html.dataset.textSize = '200'));
        await expectFrameFilled(frame, `${label}, al 200 %`);
      }
    }
  }
});

test('las 61 fichas generadas llenan la portada a 2145 px y DPR 2', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(300_000);
  const { width, height } = photoProfiles['place-cover'];
  const context = await browser.newContext({
    ...(baseURL ? { baseURL } : {}),
    viewport: { width: 2145, height: 940 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    for (const { slug } of places) {
      const path = `/lugares/${slug}/`;
      const document = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(document?.status(), path).toBe(200);
      const frame = page.locator('.place-page .detail-hero');
      const image = frame.locator('img');
      await expectImageProfile(image, 'place-cover');
      await expectFrameFilled(frame, path);
      const bitmap = await image.evaluate(async (img: HTMLImageElement) => {
        await img.decode();
        const response = await fetch(img.currentSrc);
        const image = await createImageBitmap(await response.blob());
        const { width, height } = image;
        image.close();
        return [response.headers.get('content-type'), width, height];
      });
      expect(bitmap, path).toEqual(['image/webp', width, height]);
    }
  } finally {
    await context.close();
  }
});

test('el recorte de la tarjeta de la laguna se ajusta al marco visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/explorar/');
  await page.locator('[data-filter="Todos"]').click();
  await page.locator('#atlas-search').fill('Laguna de los Cuervos');
  const card = page.locator('.place-card[data-id="52"]');
  await expect(card).toBeVisible();
  const image = card.locator('img');
  await expectImageProfile(image, 'place-card');
  await expect(image).toHaveCSS('object-position', '50% 74%');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 870 });
    const separation = await card.evaluate((element) => {
      const photoBottom = element.querySelector('img')!.getBoundingClientRect().bottom;
      const copyTop = element.querySelector('.place-content')!.getBoundingClientRect().top;
      return Math.abs(copyTop - photoBottom);
    });
    expect(separation, `${width} px`).toBeLessThan(1);
  }
});

test('mapa y galería actualizan imagen, rótulo y procedencia en la web común', async ({ page }) => {
  const mapPhoto = photoForDisplay(54);
  const galleryPhoto = photoForAsset('aguas')!;
  const museumPhoto = photoForDisplay(60);
  await page.goto('/inicio/');
  await expect(page.locator('html')).toHaveClass(/js/);
  await page.locator('g[data-map-place="54"]').press('Enter');
  await expect(page.locator('#map-preview-image')).toHaveAttribute(
    'data-photo-kind',
    mapPhoto.kind,
  );
  await expectImageProfile(page.locator('#map-preview-image'), 'thumbnail');
  await expect(page.locator('#map-preview-caption')).toHaveText(mapPhoto.caption);
  await expect(page.locator('#map-preview-source')).toHaveAttribute(
    'href',
    photoAuditUrl(mapPhoto),
  );
  await page.locator('[data-gallery="0"]').click();
  await expect(page.locator('#gallery-dialog')).toBeVisible();
  await expect(page.locator('#lightbox-title')).toHaveText(galleryPhoto.caption);
  await expect(page.locator('#lightbox-source')).toHaveAttribute(
    'href',
    photoAuditUrl(galleryPhoto),
  );
  await page.keyboard.press('Escape');
  await page.locator('[data-action="original-map"]').click();
  await expect(page.locator('#lightbox-image')).not.toHaveAttribute('data-photo-profile', /.+/);
  await expect(page.locator('#lightbox-image')).toHaveCSS('object-fit', 'contain');
  await page.keyboard.press('Escape');
  await page.goto(photoAuditUrl(museumPhoto));
  const reference = page.locator(`#${museumPhoto.key} .photo-audit-original a`);
  await expect(reference).toBeVisible();
  await expect(reference).toHaveAttribute('href', /\/gms-60[^/]*\.webp$/);
});

test('el visor inmersivo usa la misma fotografía y conserva su identificación y créditos', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const museumPhoto = photoForDisplay(60);
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
  await expect(panel.locator('.holo-photo img')).toHaveAttribute('alt', museumPhoto.alt);
  await expect(panel.locator('.holo-photo img')).toHaveAttribute(
    'data-photo-kind',
    museumPhoto.kind,
  );
  await expectImageProfile(panel.locator('.holo-photo img'), 'immersive');
  const immersiveImages = await page
    .locator('template[data-place-template]')
    .evaluateAll(async (nodes) => {
      const images = (nodes as HTMLTemplateElement[]).map((template) =>
        template.content.querySelector<HTMLImageElement>('.holo-photo img')!,
      );
      const results = [];
      for (const image of images) {
        const largest = image.srcset.split(',').at(-1)?.trim().split(' ')[0];
        if (!largest) throw new Error(`Falta la variante inmersiva de ${image.dataset.photoKey}`);
        const response = await fetch(largest);
        const bitmap = await createImageBitmap(await response.blob());
        results.push({
          key: image.dataset.photoKey,
          container: [image.dataset.photoProfile, image.width, image.height],
          file: [response.headers.get('content-type'), bitmap.width, bitmap.height],
        });
        bitmap.close();
      }
      return results;
    });
  expect(immersiveImages).toHaveLength(places.length);
  const { width, height } = photoProfiles.immersive;
  for (const { key, container, file } of immersiveImages) {
    expect(container, key).toEqual(['immersive', width, height]);
    expect(file, key).toEqual(['image/webp', width, height]);
  }
  await expect(panel.locator('.photo-credit')).toContainText(museumPhoto.credit);
  await expect(panel.locator('.photo-credit a')).toHaveAttribute(
    'href',
    photoAuditUrl(museumPhoto),
  );
});

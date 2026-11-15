import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import heroCrops from '../../docs/hero-crop-manifest.json' with { type: 'json' };
test.beforeEach(async ({ page }) => {
  await page.goto('/inicio/');
  await expect(page.locator('html')).toHaveClass(/js/);
});
test('aprendizaje ambiental, propuestas didácticas y documentos fuente', async ({
  page,
  request,
}) => {
  await expect(page.locator('.knowledge-card')).toHaveCount(4);
  const inquiry = page.locator('.knowledge-card details').first();
  await inquiry.locator('summary').click();
  await expect(inquiry).toHaveAttribute('open', '');
  const activity = page.locator('.learning-activity').first();
  await activity.locator('summary').click();
  await expect(activity.locator('ol li')).toHaveCount(3);
  await expect(activity).toContainText('observación, interpretación y fuente');
  const documents = page.locator('.document-download');
  await expect(documents).toHaveCount(3);
  for (const link of await documents.all()) {
    const response = await request.head((await link.getAttribute('href'))!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
  }
});

test('el logo del navbar vuelve al selector desde la web y las fichas', async ({ page }) => {
  for (const [route, width] of [
    ['/inicio/', 1440],
    ['/lugares/cerro-arequita/', 390],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await page.locator('.site-header .brand').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new URL('/', page.url()).toString());
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Un viaje.');
    await expect(page.locator('.entry-card-web')).toHaveAttribute('href', '/inicio/');
    await expect(page.locator('.entry-card-world')).toHaveAttribute('href', '/experiencia/');
  }
});
test('home, fotografías, controles del hero y capítulos por teclado', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('MEMORIA.');
  const tabs = page.locator('[data-hero]');
  await tabs.nth(1).click();
  await expect(page.locator('#hero-counter')).toHaveText('02 / 04');
  await tabs.nth(1).press('End');
  await expect(page.locator('#hero-counter')).toHaveText('04 / 04');
  await page.locator('[data-chapter="0"]').scrollIntoViewIfNeeded();
  await page.locator('[data-chapter="0"]').press('End');
  await expect(page.locator('[data-chapter="3"]')).toBeFocused();
  await expect(page.locator('[data-chapter="3"]')).toHaveAttribute('aria-pressed', 'true');
});
test('hero responsive: resolución suficiente para el recorte vertical', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [
    [320, 540],
    [390, 900],
    [620, 800],
    [640, 450],
    [844, 390],
    [1440, 900],
    [1920, 900],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.reload();
    const crop = heroCrops.find((entry) => entry.path.endsWith('/arequita-rio.webp'))!.crop;
    const resolution = await page
      .locator('.hero-image.active img')
      .evaluate(async (image, mobileWidth) => {
        const img = image as HTMLImageElement;
        await img.decode();
        const bitmap = await createImageBitmap(await (await fetch(img.currentSrc)).blob());
        const box = img.getBoundingClientRect();
        const hero = img.closest('.hero')!.getBoundingClientRect();
        const sourceWidth = innerWidth <= 620 ? mobileWidth : Number(img.dataset.photoWidth);
        const sourceHeight = Number(img.dataset.photoHeight);
        const required = Math.min(
          sourceHeight,
          Math.max(box.height, (box.width * sourceHeight) / sourceWidth),
        );
        const actual = bitmap.height;
        const coversHero =
          Math.abs(box.top - hero.top) < 1 &&
          Math.abs(box.width - hero.width) < 1 &&
          Math.abs(box.height - hero.height) < 1;
        bitmap.close();
        return { actual, required, coversHero };
      }, crop.width);
    expect(resolution.coversHero, `${width}×${height}`).toBe(true);
    expect(resolution.actual, `${width}×${height}`).toBeGreaterThanOrEqual(
      resolution.required * 0.98,
    );
  }
});
test('el carrusel conserva la foto visible al cambiar mientras se decodifica', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = async function () {
      await decode.call(this);
      if (this.closest('.hero-image[data-slide="3"]'))
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
    };
  });
  await page.goto('/inicio/');
  const hero = page.locator('.hero');
  await hero.locator('[data-hero="1"]').click();
  await expect(hero.locator('.hero-image[data-slide="1"].active')).toBeVisible();
  await hero.locator('[data-hero="3"]').click();
  await expect(hero.locator('.hero-image[data-slide="3"].active')).toBeVisible();
  await hero.locator('[data-hero="0"]').click();
  await expect(hero.locator('.hero-image[data-slide="0"].active')).toBeVisible();
  await expect(hero.locator('#hero-caption a')).toHaveAttribute(
    'href',
    '/creditos-fotograficos/#gms-01-portada',
  );
});
for (const viewport of [
  { width: 1920, height: 920 },
  { width: 390, height: 844 },
]) {
  test(`cada paisaje cubre toda la portada a ${viewport.width}px`, async ({ browser, baseURL }) => {
    test.setTimeout(75_000);
    const context = await browser.newContext({
      ...(baseURL ? { baseURL } : {}),
      viewport,
      deviceScaleFactor: 3,
      reducedMotion: 'reduce',
    });
    try {
      const page = await context.newPage();
      await page.goto('/inicio/');
      await expect(page.locator('html')).toHaveClass(/\bjs\b/);
      for (let slide = 0; slide < 4; slide++) {
        if (slide > 0) await page.locator(`[data-hero="${slide}"]`).click();
        const image = page.locator(`.hero-image[data-slide="${slide}"].active img`);
        await expect(image).toBeVisible();
        const frame = await image.evaluate((img) => {
          const box = img.getBoundingClientRect();
          const hero = img.closest('.hero')!.getBoundingClientRect();
          return {
            edges: [
              box.left - hero.left,
              box.top - hero.top,
              box.right - hero.right,
              box.bottom - hero.bottom,
            ],
            fit: getComputedStyle(img).objectFit,
          };
        });
        expect(frame.edges.every((difference) => Math.abs(difference) < 1)).toBe(true);
        expect(frame.fit).toBe('cover');
      }
    } finally {
      await context.close();
    }
  });
}
test('atlas, categorías, búsqueda sin acentos, zonas, modalidades y fichas reales', async ({
  page,
}) => {
  await page.goto('/explorar/');
  await expect(page.locator('html')).toHaveClass(/js/);
  await page.locator('[data-filter="Todos"]').click();
  await page.locator('#atlas-search').fill('arequita');
  await expect(page.locator('.place-card:visible').first()).toContainText('Arequita');
  await page.locator('#atlas-region').selectOption('Arequita y Santa Lucía');
  await page.locator('#atlas-status').selectOption('Coordinación previa');
  await expect(page.locator('.place-card:visible')).not.toHaveCount(0);
  await page.locator('.place-card[data-id="1"] h3 a').click();
  await expect(page).toHaveURL(/\/lugares\/cerro-arequita\/$/);
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Cerro Arequita');
  await page.getByRole('link', { name: 'Volver al atlas' }).click();
  await expect(page).toHaveURL(/\/explorar\/$/);
  await page.locator('[data-filter="Todos"]').click();
  await page.locator('#atlas-search').fill('texto-inexistente-xx');
  await expect(page.locator('#atlas-empty')).toBeVisible();
});
test('mapa: teclado, selección, preview, zoom, reset y mapa original', async ({ page }) => {
  await page.locator('#territorio').scrollIntoViewIfNeeded();
  const pin = page.locator('g[data-map-place="23"]');
  await pin.press('Enter');
  await expect(page.locator('#map-preview-name')).toContainText('Aguas Blancas');
  await expect(page.locator('#map-preview-link')).toHaveAttribute(
    'href',
    /campamento-aguas-blancas/,
  );
  await page.locator('[data-map-zoom="in"]').click();
  const viewBox = await page.locator('#territory-svg').getAttribute('viewBox');
  await expect(page.locator('[data-map-zoom="out"]')).toBeEnabled();
  await page.locator('[data-map-zoom="reset"]').click();
  expect(await page.locator('#territory-svg').getAttribute('viewBox')).not.toBe(viewBox);
  await page.locator('[data-action="original-map"]').click();
  await expect(page.locator('#gallery-dialog')).toBeVisible();
  await expect(page.locator('#lightbox-title')).toHaveText('Mapa del Geoparque');
  await page.keyboard.press('Escape');
});
test('favoritos entre islas, rutas, recarga, otra pestaña y organización por días', async ({
  page,
  context,
}) => {
  await page.goto('/lugares/cerro-arequita/');
  const save = page.locator('[data-favorite="1"]');
  await save.click();
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.trip-button .count')).toHaveText('1');
  await page.reload();
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  const other = await context.newPage();
  await other.goto('/lugares/parque-de-minas/');
  await other.locator('[data-favorite="17"]').click();
  await expect(page.locator('.trip-button .count')).toHaveText('2');
  await page.locator('.trip-button').click();
  await expect(page.locator('.saved-item')).toHaveCount(2);
  await page.locator('[data-day="1"]').selectOption('2');
  await page.locator('[data-move="1"][data-direction="1"]').click();
  await expect(page.locator('.saved-item').first()).toContainText('Parque de Minas');
  await page.locator('[data-remove="17"]').click();
  await expect(page.locator('.saved-item')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.trip-button')).toBeFocused();
});
test('planner, circuitos, fecha, exportaciones Markdown/ICS e impresión', async ({ page }) => {
  await page.goto('/planifica/');
  await page.locator('#plan-interest').selectOption('geology');
  await page.locator('input[name="days"][value="3"]').check();
  await page.locator('#planner-form button').click();
  await expect(page.locator('#trip-dialog')).toBeVisible();
  await expect(page.locator('.saved-item')).toHaveCount(4);
  await page.locator('#trip-start-date').fill('2026-10-02');
  const calendarPromise = page.waitForEvent('download');
  await page.locator('[data-action="calendar"]').click();
  expect((await calendarPromise).suggestedFilename()).toMatch(/\.ics$/);
  const markdownPromise = page.waitForEvent('download');
  await page.locator('[data-action="trip-download"]').click();
  expect((await markdownPromise).suggestedFilename()).toMatch(/\.md$/);
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printed = 'true';
    };
  });
  await page.locator('[data-action="trip-print"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-printed', 'true');
  await expect(page.locator('#print-content')).toContainText('Cerro Arequita');
  await page.keyboard.press('Escape');
  await page.goto('/circuitos/agua-bosque/');
  await page.locator('[data-add-route]').click();
  await expect(page.locator('.saved-item')).toHaveCount(6);
});
test('buscador global, shortcut, resultados, Escape y retorno de foco', async ({ page }) => {
  await page.locator('[data-action="search"]').click();
  await expect(page.locator('#global-search')).toBeFocused();
  await page.locator('#global-search').fill('agua');
  await expect(page.locator('#search-results a')).not.toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-action="search"]')).toBeFocused();
  await page.keyboard.press('/');
  await expect(page.locator('#search-dialog')).toBeHidden();
  await page.keyboard.press('Control+/');
  await expect(page.locator('#search-dialog')).toBeVisible();
});
test('descarga la ficha en PDF con JavaScript deshabilitado', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    ...(baseURL ? { baseURL } : {}),
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    const pdf = await context.request.get('/lugares/el-destacamento.pdf');
    expect(pdf.ok()).toBe(true);
    expect(pdf.headers()['content-type']).toContain('application/pdf');
    expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
    await page.goto('/lugares/el-destacamento/');
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: /Descargar ficha en PDF/ }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe('el-destacamento.pdf');
    expect(await file.failure()).toBeNull();
  } finally {
    await context.close();
  }
});
test('galería, captions, flechas, quiz y privacidad', async ({ page }) => {
  await page.locator('[data-action="gallery"]').click();
  await expect(page.locator('#lightbox-title')).toContainText('Aguas Blancas');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lightbox-title')).toContainText('Fuente del Puma');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#lightbox-title')).toContainText('Aguas Blancas');
  await page.keyboard.press('Escape');
  await page.locator('[data-action="quiz"]').click();
  for (const answer of [0, 1, 1, 2, 0]) {
    await page.locator(`[data-answer="${answer}"]`).click();
    await page.locator('[data-action="quiz-next"]').click();
  }
  await expect(page.locator('#quiz-content')).toContainText('5 de 5');
  await page.keyboard.press('Escape');
  await page.locator('[data-action="privacy"]').click();
  await expect(page.locator('#article-content')).toContainText('Tu cuaderno se queda con vos.');
});
test('menú mobile, foco y Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#mobile-toggle').click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page.locator('#mobile-toggle')).toBeFocused();
});
test('movimiento reducido muestra todas las escenas en flujo y pausa el hero', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('#historia')).toHaveClass(/is-static/);
  await expect(page.locator('.geo-scene:visible')).toHaveCount(4);
  await expect(page.locator('#hero-pause')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#motion-toggle').click();
  await expect(page.locator('html')).not.toHaveClass(/reduce-motion/);
});
test('navegación repetida ClientRouter: sin listeners acumulados ni errores de consola', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/explorar/');
  for (let index = 0; index < 3; index++) {
    // Keep this lifecycle check independent of the atlas's animated scroll position.
    await page.locator('.place-card[data-id="1"] h3 a').press('Enter');
    await expect(page.locator('h1')).toHaveText('Cerro Arequita');
    await page.locator('[data-favorite="1"]').click();
    await expect(page.locator('.trip-button .count')).toHaveText(String(index % 2 === 0 ? 1 : 0));
    await page.getByRole('link', { name: 'Volver al atlas' }).click();
    await expect(page.locator('.place-card:visible')).toHaveCount(6);
  }
  expect(errors).toEqual([]);
});
test('accesibilidad automática sin serious/critical en home, atlas y ficha', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/inicio/', '/explorar/', '/lugares/cerro-arequita/', '/planifica/']) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveClass(/js/);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact || ''),
      ),
    ).toEqual([]);
  }
});
test('recursos sin 404, rutas directas y 404 real', async ({ page, request }) => {
  const missing: string[] = [];
  page.on('response', (response) => {
    if (response.status() === 404) missing.push(response.url());
  });
  for (const route of [
    '/inicio/',
    '/explorar/',
    '/historias/agua/',
    '/circuitos/arequita/',
    '/planifica/',
  ]) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveClass(/js/);
  }
  expect(missing).toEqual([]);
  expect((await request.get('/una-ruta-inexistente/')).status()).toBe(404);
  for (const route of [
    '/health',
    '/guia.md',
    '/lugares.md',
    '/llms.txt',
    '/robots.txt',
    '/sitemap-index.xml',
  ])
    expect((await request.get(route)).status()).toBe(200);
});
test('sin JavaScript: 61 enlaces rastreables, capítulos y ficha íntegra', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/inicio/`);
  await expect(page.locator('.place-card:visible')).toHaveCount(61);
  await expect(page.locator('.geo-scene:visible')).toHaveCount(4);
  await page.locator('.place-card[data-id="1"] h3 a').click();
  await expect(page.locator('h1')).toHaveText('Cerro Arequita');
  await expect(page.locator('.detail-body')).toContainText('130 millones');
  await context.close();
});

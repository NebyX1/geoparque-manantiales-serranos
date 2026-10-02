import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/js/);
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
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    const resolution = await page.locator('.hero-image.active img').evaluate(async (image) => {
      const img = image as HTMLImageElement;
      await img.decode();
      const bitmap = await createImageBitmap(await (await fetch(img.currentSrc)).blob());
      const box = img.getBoundingClientRect();
      const sourceWidth = innerWidth <= 620 ? 671 : 1500;
      const required = Math.min(844, Math.max(box.height, (box.width * 844) / sourceWidth));
      const actual = bitmap.height;
      bitmap.close();
      return { actual, required };
    });
    expect(resolution.actual).toBeGreaterThanOrEqual(resolution.required * 0.98);
  }
});
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
  await expect(page.locator('#search-dialog')).toBeVisible();
});
test('galería, captions, flechas, quiz y privacidad', async ({ page }) => {
  await page.locator('[data-action="gallery"]').click();
  await expect(page.locator('#lightbox-title')).toContainText('Aguas Blancas');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lightbox-title')).toContainText('Reserva Salus');
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
  await expect(page.locator('#article-content')).toContainText('Tu viaje se queda con vos.');
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
    await page.locator('.place-card[data-id="1"] h3 a').click();
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
  for (const route of ['/', '/explorar/', '/lugares/cerro-arequita/', '/planifica/']) {
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
    '/',
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
  await page.goto(`${baseURL}/`);
  await expect(page.locator('.place-card:visible')).toHaveCount(61);
  await expect(page.locator('.geo-scene:visible')).toHaveCount(4);
  await page.locator('.place-card[data-id="1"] h3 a').click();
  await expect(page.locator('h1')).toHaveText('Cerro Arequita');
  await expect(page.locator('.detail-body')).toContainText('130 millones');
  await context.close();
});

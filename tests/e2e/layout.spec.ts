import { expect, test, type Locator } from '@playwright/test';

test('el encabezado permanece fijo y deja espacio para las anclas y el menú', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const header = page.locator('#site-header');
  const section = page.locator('#aprender');
  for (const viewport of [
    { width: 1920, height: 900 },
    { width: 844, height: 390 },
    { width: 320, height: 540 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/inicio/#aprender');
    await expect(header).toHaveCSS('position', 'fixed');
    await expect.poll(async () => (await header.boundingBox())!.y).toBe(0);
    await expect
      .poll(async () => (await section.boundingBox())!.y - (await header.boundingBox())!.height)
      .toBeGreaterThanOrEqual(0);
  }
  await page.evaluate(() => localStorage.setItem('manantiales-serranos:tamano-texto:v1', '200'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-text-size', '200');
  await page.evaluate(() => scrollTo(0, 800));
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  expect((await header.boundingBox())!.y).toBe(0);
  expect((await page.locator('#mobile-menu').boundingBox())!.y).toBeCloseTo(
    (await header.boundingBox())!.height,
    0,
  );
});

test('el encabezado muestra una sola línea activa al recargar o navegar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const nav = page.getByRole('navigation', { name: 'Navegación principal', exact: true });
  const water = nav.getByRole('link', { name: 'Agua y vida' });
  const education = nav.getByRole('link', { name: 'Educación' });

  async function expectCurrentLink(link: Locator) {
    await expect(link).toHaveAttribute('aria-current', 'location');
    await expect(nav.locator('[aria-current="location"]')).toHaveCount(1);
    await expect(link).toHaveCSS('text-decoration-line', 'none');
    await expect
      .poll(() =>
        link.evaluate((node) => {
          const line = getComputedStyle(node, '::after');
          return [line.right, line.borderBottomWidth, line.borderBottomStyle];
        }),
      )
      .toEqual(['0px', '1px', 'solid']);
  }

  await page.goto('/lugares/cerro-arequita/');
  await water.click();
  await expectCurrentLink(water);
  await page.reload();
  await expectCurrentLink(water);
  await education.press('Enter');
  await expectCurrentLink(education);
});

test('la descripción, el crédito y los capítulos de portada conservan su espacio', async ({
  page,
}) => {
  await page.goto('/inicio/');
  await expect(page.locator('html')).toHaveClass(/\bjs\b/);
  await page.evaluate(() => document.fonts.ready);

  for (const viewport of [
    { width: 320, height: 540 },
    { width: 620, height: 540 },
    { width: 621, height: 540 },
    { width: 844, height: 390 },
    { width: 1920, height: 650 },
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
    const layout = await page.locator('.hero').evaluate((hero) => {
      const actions = hero.querySelector('.hero-bottom')!.getBoundingClientRect();
      const credit = hero.querySelector('.hero-caption')!.getBoundingClientRect();
      const chapters = hero.querySelector('.hero-footer')!.getBoundingClientRect();
      const tabs = hero.querySelector('.hero-tabs')!;
      return {
        creditGap: credit.top - actions.bottom,
        chapterGap: chapters.top - credit.bottom,
        tabOverflow: tabs.scrollWidth - tabs.clientWidth,
      };
    });
    const size = `${viewport.width}×${viewport.height}`;
    expect(layout.creditGap, size).toBeGreaterThan(0);
    expect(layout.chapterGap, size).toBeGreaterThan(0);
    expect(layout.tabOverflow, size).toBeLessThanOrEqual(1);
  }
});

test('las etiquetas de fotografía permanecen en su ficha de procedencia', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 540 });
  await page.goto('/creditos-fotograficos/');
  const labels = page.locator('.photo-audit-item .photo-label');
  await expect(labels.first()).toBeVisible();
  const misplaced = await labels.evaluateAll((items) =>
    items.flatMap((label) => {
      const box = label.getBoundingClientRect();
      const owner = label.closest('.photo-audit-item')!;
      const bounds = owner.getBoundingClientRect();
      const caption = label.nextElementSibling!.getBoundingClientRect();
      return box.top >= bounds.top && box.bottom <= caption.top && box.right <= bounds.right
        ? []
        : [owner.id];
    }),
  );
  expect(misplaced).toEqual([]);
});

test('el buscador alinea las miniaturas, los títulos y las flechas de los resultados', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/inicio/');
  await page.locator('[data-action="search"]').click();
  const dialog = page.locator('#search-dialog');
  const results = dialog.locator('.search-results a');
  await expect(results).toHaveCount(6);
  await page.evaluate(() => document.fonts.ready);

  for (const query of ['', 'agua']) {
    await dialog.locator('#global-search').fill(query);
    if (query)
      await expect(
        results.filter({ has: page.locator('small', { hasText: 'Historia' }) }).first(),
      ).toBeVisible();
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 320, height: 540 },
    ]) {
      await page.setViewportSize(viewport);
      const rows = await results.evaluateAll((links) =>
        links.map((link) => {
          const photo = link.querySelector('img')!.getBoundingClientRect();
          const text = link.querySelector('span')!.getBoundingClientRect();
          const arrow = link.querySelector('.icon')!.getBoundingClientRect();
          const row = link.getBoundingClientRect();
          return {
            starts: [photo.left - row.left, text.left - row.left, arrow.left - row.left],
            photoSize: [photo.width, photo.height],
            fits:
              photo.left >= row.left &&
              photo.right < text.left &&
              text.right < arrow.left &&
              arrow.right <= row.right,
          };
        }),
      );
      const first = rows[0]!;
      expect(rows.length).toBeGreaterThan(1);
      expect(first.starts[0]).toBe(0);
      for (const row of rows) {
        expect(row.starts).toEqual(first.starts);
        expect(row.photoSize).toEqual(first.photoSize);
        expect(row.fits).toBe(true);
      }
    }
  }
});

test('el acceso fijo al inicio deja libres los controles de los capítulos', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 720 });
  await page.goto('/inicio/');
  const story = page.locator('.geo-story.is-pinned');
  await expect(story).toBeVisible();
  await story.evaluate((element) => {
    window.scrollTo({
      top: element.getBoundingClientRect().top + scrollY + innerHeight,
      behavior: 'instant',
    });
  });
  const back = page.locator('#back-top.show');
  const next = story.getByRole('button', { name: 'Capítulo siguiente' });
  await expect(back).toBeVisible();
  const [backBox, nextBox] = await Promise.all([back.boundingBox(), next.boundingBox()]);
  expect(nextBox!.x + nextBox!.width).toBeLessThan(backBox!.x);
});

for (const mode of ['3D', 'sin WebGL']) {
  test(`las fichas del recorrido ${mode} caben entre el encabezado y los controles`, async ({
    page,
  }) => {
    if (mode === 'sin WebGL') {
      await page.addInitScript(() => {
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          type: string,
          ...options: unknown[]
        ) {
          if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
          return getContext.apply(this, [type, ...options] as Parameters<typeof getContext>);
        } as typeof getContext;
      });
    }
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/experiencia/');
    await expect(page.locator('[data-experience]')).toHaveAttribute(
      'data-state',
      /^(ready|fallback)$/,
      { timeout: 25_000 },
    );
    if (mode === 'sin WebGL')
      await expect(page.locator('[data-experience]')).toHaveAttribute('data-state', 'fallback');
    await page.locator('#experience-places-toggle').click();
    await page.locator('[data-place-travel="1"]').click();
    const panel = page.locator('[data-holo-panel="1"]');
    await expect(panel).toBeVisible();
    await expect(page.locator('#experience-fallback')).toBeHidden();

    for (const viewport of [
      { width: 844, height: 390 },
      { width: 320, height: 320 },
      { width: 320, height: 540 },
    ]) {
      await page.setViewportSize(viewport);
      await expect
        .poll(
          () =>
            panel.evaluate((element) => {
              const box = element.getBoundingClientRect();
              const header = document.querySelector('.exp-header')!.getBoundingClientRect();
              const tools = document.querySelector('.exp-tools')!.getBoundingClientRect();
              return {
                belowHeader: box.top >= header.bottom,
                clearsToolbar: box.right <= tools.left || box.top >= tools.bottom,
                insideWindow: box.left >= 0 && box.right <= innerWidth && box.bottom <= innerHeight,
              };
            }),
          { message: `${viewport.width}×${viewport.height}` },
        )
        .toEqual({ belowHeader: true, clearsToolbar: true, insideWindow: true });
      const heading = panel.getByRole('heading', { name: 'Cerro Arequita' });
      await heading.scrollIntoViewIfNeeded();
      const [headingBox, headerBox, panelBox] = await Promise.all([
        heading.boundingBox(),
        panel.locator('.holo-header').boundingBox(),
        panel.boundingBox(),
      ]);
      expect(headingBox!.y, `${viewport.width}×${viewport.height}`).toBeGreaterThanOrEqual(
        headerBox!.y + headerBox!.height - 1,
      );
      expect(headingBox!.y + headingBox!.height).toBeLessThanOrEqual(
        panelBox!.y + panelBox!.height + 1,
      );
    }
  });
}

import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
test('capturas del prototipo y migración en todos los tamaños y pantallas bajas', async ({
  page,
  browser,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Las capturas comparativas se generan una vez en Chromium.',
  );
  test.setTimeout(240_000);
  const directory = 'test-results/visual-comparison';
  mkdirSync(directory, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const [label, origin] of [
      ['reference', 'http://127.0.0.1:4323/'],
      ['astro', 'http://127.0.0.1:4321/'],
    ]) {
      await page.goto(origin!);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('html')).toHaveClass(/js/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      for (const [name, selector] of [
        ['hero', '#inicio'],
        ['atlas', '#explorar'],
        ['geologia', '#geo-scene-0'],
        ['mapa', '#territorio'],
        ['naturaleza', '#naturaleza'],
        ['cultura', '#cultura'],
        ['planner', '#planificador'],
        ['footer', 'footer'],
      ]) {
        const section = page.locator(selector!);
        await section.scrollIntoViewIfNeeded();
        await page.evaluate(async () => {
          await new Promise(requestAnimationFrame);
          await Promise.allSettled(
            [...document.images]
              .filter((image) => {
                const box = image.getBoundingClientRect();
                return box.bottom > 0 && box.top < innerHeight && box.width > 0;
              })
              .map((image) => image.decode()),
          );
        });
        await page.screenshot({
          path: `${directory}/${label}-${width}-${name}.png`,
          animations: 'disabled',
        });
      }
    }
    await page.goto('/lugares/cerro-arequita/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.allSettled([...document.images].map((image) => image.decode()));
    });
    await page.screenshot({
      path: `${directory}/astro-${width}-ficha.png`,
      animations: 'disabled',
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  for (const viewport of [
    { width: 390, height: 540 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: `${directory}/astro-${viewport.width}x${viewport.height}-low.png`,
    });
  }
  // 1280×900 physical pixels at 200% browser zoom become 640×450 CSS pixels.
  const zoomContext = await browser.newContext({
    viewport: { width: 640, height: 450 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  });
  const zoomPage = await zoomContext.newPage();
  await zoomPage.goto('http://127.0.0.1:4321/');
  await zoomPage.evaluate(async () => {
    await document.fonts.ready;
    await document.querySelector<HTMLImageElement>('img[fetchpriority="high"]')?.decode();
  });
  expect(await zoomPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
    true,
  );
  await zoomPage.screenshot({ path: `${directory}/astro-zoom-200.png` });
  await zoomContext.close();
});

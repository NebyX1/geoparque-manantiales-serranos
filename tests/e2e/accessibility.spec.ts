import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('el tamaño de texto alcanza el 200 % y se conserva al navegar y recargar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/inicio/');
  const trigger = page.getByRole('button', { name: 'Accesibilidad', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Accesibilidad' });
  const more = dialog.getByRole('button', { name: /aumentar tamaño del texto/i });
  const description = page.locator('.hero-description');
  const menu = page.getByRole('button', { name: 'Abrir menú' });
  const initial = await description.evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
  await expect(menu).toBeInViewport({ ratio: 1 });

  await trigger.press('Enter');
  await expect(more).toBeFocused();
  for (const size of [125, 150, 175, 200]) {
    await page.keyboard.press('Enter');
    await expect(page.locator('#text-size-status')).toContainText(`${size} %`);
  }
  await expect(more).toHaveAttribute('aria-disabled', 'true');
  await expect(description).toHaveCSS('font-size', `${initial * 2}px`);
  expect(
    await page.locator('.pills').evaluate((filters) => filters.scrollWidth <= filters.clientWidth),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  const search = page.getByRole('button', { name: 'Buscar temas y fichas' });
  await expect(search).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(search).toBeVisible();
  await page.setViewportSize({ width: 320, height: 600 });

  await page.getByRole('button', { name: 'Abrir menú' }).press('Enter');
  await expect(
    page.getByRole('link', { name: 'Historia de la Tierra', exact: true }).first(),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();

  await page.locator('[data-accessibility-open]').press('Enter');
  await page.getByRole('link', { name: 'Información de accesibilidad y contacto' }).click();
  await expect(page).toHaveURL(/\/accesibilidad\/?$/);
  await expect(page.locator('html')).toHaveAttribute('data-text-size', '200');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-text-size', '200');
  await trigger.click();
  await dialog.getByRole('button', { name: /reducir tamaño del texto/i }).press('Space');
  await expect(page.locator('#text-size-status')).toContainText('175 %');
  await dialog.getByRole('button', { name: 'Restablecer' }).press('Enter');
  await expect(page.locator('#text-size-status')).toContainText('100 %');
  await expect(page.locator('html')).not.toHaveAttribute('data-text-size');
});

test('la preferencia de tamaño se comparte con otra pestaña', async ({ context, page }) => {
  await page.goto('/inicio/');
  const second = await context.newPage();
  await second.goto('/experiencia/modelos/');

  await page.getByRole('button', { name: 'Accesibilidad', exact: true }).click();
  await page.getByRole('button', { name: /aumentar tamaño del texto/i }).click();
  await expect(second.locator('html')).toHaveAttribute('data-text-size', '125');
  await page.getByRole('button', { name: 'Restablecer', exact: true }).click();
  await expect(second.locator('html')).not.toHaveAttribute('data-text-size');
});

test('el salto de teclado y los controles de accesibilidad se mantienen visibles', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 320, height: 500 });
  await page.goto('/lugares/el-destacamento/');
  const skip = page.getByRole('link', { name: 'Saltar al contenido' });
  // WebKit's default keyboard preference skips links with the plain Tab key.
  if (browserName === 'webkit') await skip.focus();
  else await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('#contenido')).toBeFocused();

  const trigger = page.getByRole('button', { name: 'Accesibilidad', exact: true });
  await expect(trigger).toBeVisible();
  const bounds = await trigger.boundingBox();
  expect(bounds!.width).toBeGreaterThanOrEqual(44);
  expect(bounds!.height).toBeGreaterThanOrEqual(44);
  await trigger.click();
  const result = await new AxeBuilder({ page })
    .include('#accessibility-dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

import { expect, test, type Page } from '@playwright/test';

async function mockReply(page: Page) {
  const requests: unknown[] = [];
  await page.route('**/api/serrana/chat', async (route) => {
    requests.push(route.request().postDataJSON());
    const events = [
      { type: 'delta', text: 'Cerro Arequita permite observar un paredón de roca volcánica.' },
      {
        type: 'done',
        sources: [{ title: 'Ficha Cerro Arequita', url: '/lugares/cerro-arequita/' }],
      },
    ];
    await route.fulfill({
      contentType: 'application/x-ndjson',
      body: events.map((event) => JSON.stringify(event)).join('\n') + '\n',
    });
  });
  return requests;
}

test('Serrana en la web contextualiza la consulta, muestra fuentes y devuelve el foco', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = await mockReply(page);
  await page.goto('/lugares/cerro-arequita/');
  const trigger = page.locator('button[data-serrana-open][data-serrana-place-id="1"]').first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Serrana', exact: true });
  await expect(dialog).toBeVisible();
  const question = dialog.getByRole('textbox', { name: 'Tu pregunta para Serrana' });
  await expect(question).toBeFocused();
  await expect(dialog.locator('[data-serrana-context-name]')).toContainText('Cerro Arequita');
  await question.fill('¿Qué tipo de roca puedo ver acá?');
  await dialog.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(
    dialog.getByText('Cerro Arequita permite observar un paredón de roca volcánica.'),
  ).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Ficha Cerro Arequita' })).toHaveAttribute(
    'href',
    '/lugares/cerro-arequita/',
  );
  expect(requests).toEqual([
    { message: '¿Qué tipo de roca puedo ver acá?', history: [], context: { placeId: 1 } },
  ]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Serrana toma el contexto de la ficha en el recorrido 3D y deja volver a ella', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = await mockReply(page);
  await page.goto('/experiencia/');
  await expect(page.locator('[data-experience]')).toHaveAttribute(
    'data-state',
    /^(ready|fallback)$/,
    { timeout: 30_000 },
  );
  const toggle = page.locator('#experience-places-toggle');
  if ((await toggle.isVisible()) && (await toggle.getAttribute('aria-expanded')) !== 'true')
    await toggle.click();
  await page.locator('button[data-place-travel="1"]').click();
  const card = page.locator('[data-holo-panel="1"]');
  const trigger = card.locator('button[data-serrana-place-id="1"]');
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Serrana', exact: true });
  await expect(dialog.locator('[data-serrana-context-name]')).toHaveText('Cerro Arequita');
  const question = dialog.getByRole('textbox', { name: 'Tu pregunta para Serrana' });
  await question.fill('¿Cómo se formó?');
  await question.press('Enter');
  await expect(dialog.getByRole('link', { name: 'Ficha Cerro Arequita' })).toBeVisible();
  expect(requests).toEqual([{ message: '¿Cómo se formó?', history: [], context: { placeId: 1 } }]);
  await dialog.getByRole('button', { name: 'Cerrar Serrana' }).click();
  await expect(dialog).toBeHidden();
  await expect(card).toBeVisible();
  await expect(trigger).toBeFocused();
});

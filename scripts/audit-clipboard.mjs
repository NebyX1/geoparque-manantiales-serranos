import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium, webkit, expect } from '@playwright/test';

const origin = process.env.CONTAINER_URL || 'http://127.0.0.1:8088';
const checks = [];
for (const [name, engine] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({
      ...(name === 'chromium' ? { permissions: ['clipboard-read', 'clipboard-write'] } : {}),
    });
    const page = await context.newPage();
    await page.goto(`${origin}/lugares/cerro-arequita/`);
    await page.locator('[data-favorite="1"]').click();
    await expect(page.locator('[data-favorite="1"]')).toHaveAttribute('aria-pressed', 'true');
    await page.goto(`${origin}/`);
    await page.locator('[data-action="trip"]').click();
    if (name === 'webkit') {
      // WebKit automation has no clipboard permission API. Verify the write
      // contract with a stub, then the real UI fallback with a rejected write.
      await page.evaluate(() => {
        globalThis.navigator.clipboard.writeText = async (text) => {
          globalThis.copiedTrip = text;
        };
      });
    }
    await page.locator('[data-action="trip-copy"]').click();
    await expect
      .poll(() =>
        page.evaluate(
          async (profile) =>
            profile === 'chromium'
              ? globalThis.navigator.clipboard.readText()
              : globalThis.copiedTrip,
          name,
        ),
      )
      .toContain('Cerro Arequita');
    await page.evaluate(() => {
      globalThis.navigator.clipboard.writeText = async () => {
        throw new Error('Permission denied in fallback test');
      };
    });
    await page.locator('[data-action="trip-copy"]').click();
    const field = page.getByRole('textbox', { name: 'Tu viaje para copiar' });
    await expect(field).toBeFocused();
    assert.match(await field.inputValue(), /Cerro Arequita/);
    assert.equal(
      await field.evaluate((element) => element.selectionEnd - element.selectionStart),
      (await field.inputValue()).length,
    );
    checks.push({
      profile: name,
      copy: name === 'chromium' ? 'native' : 'write contract stub',
      fallback: 'focused and selected',
      result: 'passed',
    });
  } finally {
    await browser.close();
  }
}
fs.writeFileSync('reports/clipboard-validation.json', `${JSON.stringify(checks, null, 2)}\n`);
console.log(JSON.stringify(checks));

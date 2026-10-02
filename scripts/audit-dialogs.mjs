import fs from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const origin = process.env.CONTAINER_URL || 'http://127.0.0.1:8088';
const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const checks = [];
try {
  await page.goto(`${origin}/lugares/cerro-arequita/`);
  await page.locator('[data-favorite="1"]').click();
  await page.goto(`${origin}/`);
  for (const action of ['search', 'trip', 'gallery', 'quiz', 'privacy']) {
    await page.locator(`[data-action="${action}"]`).first().click();
    await page.locator('dialog[open]').waitFor({ state: 'visible' });
    const result = await new AxeBuilder({ page }).include('dialog[open]').analyze();
    const failures = result.violations.filter((item) =>
      ['serious', 'critical'].includes(item.impact),
    );
    checks.push({ action, failures });
    await page.keyboard.press('Escape');
  }
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/axe-dialogs.json', JSON.stringify(checks, null, 2));
  if (checks.some((check) => check.failures.length))
    throw new Error('Dialog accessibility violations');
  console.log(`${checks.length} open dialogs: no serious/critical violations`);
} finally {
  await browser.close();
}

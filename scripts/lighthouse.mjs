import fs from 'node:fs';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { launch } from 'chrome-launcher';
import { chromium } from 'playwright';
const url = process.env.LIGHTHOUSE_URL || 'http://127.0.0.1:4321/';
fs.mkdirSync('reports/lighthouse', { recursive: true });
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
});
try {
  for (const device of ['mobile', 'desktop']) {
    const result = await lighthouse(
      url,
      {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
      device === 'desktop' ? desktopConfig : undefined,
    );
    fs.writeFileSync(`reports/lighthouse/${device}.json`, result.report);
    console.log(
      JSON.stringify({
        device,
        url,
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([name, category]) => [
            name,
            Math.round(category.score * 100),
          ]),
        ),
        metrics: Object.fromEntries(
          ['largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift'].map(
            (name) => [name, result.lhr.audits[name].numericValue],
          ),
        ),
      }),
    );
  }
} finally {
  await chrome.kill();
}

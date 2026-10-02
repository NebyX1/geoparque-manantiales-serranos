import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { places } from '../../src/data/geosites';
import { articles } from '../../src/data/stories';
const read = (path: string) => readFileSync(join('dist', path), 'utf8');
describe('build estático y SEO', () => {
  it('publica home, 61 fichas completas y ocho historias como HTML', () => {
    expect(read('index.html')).toContain('LA TIERRA');
    for (const place of places) {
      const page = read(`lugares/${place.slug}/index.html`)
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
      expect(page.includes(place.name), `Nombre GMS-${place.id}`).toBe(true);
      expect(page.includes(place.summary), `Resumen GMS-${place.id}`).toBe(true);
      for (const block of place.blocks)
        expect(page.includes(block.text), `Bloque GMS-${place.id}`).toBe(true);
      expect(read(`lugares/${place.slug}.md`)).toContain(place.name);
    }
    for (const slug of Object.keys(articles))
      expect(existsSync(`dist/historias/${slug}/index.html`)).toBe(true);
  });
  it('genera canonicals y titles únicos, descripciones y JSON-LD válido', () => {
    const canonicals = new Set<string>();
    const titles = new Set<string>();
    for (const route of [
      '',
      'explorar/',
      'lugares/',
      'historias/',
      'circuitos/',
      'planifica/',
      ...places.map((place) => `lugares/${place.slug}/`),
    ]) {
      const page = read(`${route}index.html`);
      const canonical = page.match(/rel="canonical" href="([^"]+)"/)?.[1];
      const title = page.match(/<title>(.*?)<\/title>/)?.[1];
      expect(canonical).toBeTruthy();
      expect(canonicals.has(canonical!)).toBe(false);
      canonicals.add(canonical!);
      expect(title).toBeTruthy();
      expect(titles.has(title!)).toBe(false);
      titles.add(title!);
      expect(page).toMatch(/name="description" content="[^"]+"/);
      expect(page).toContain('lang="es-UY"');
      for (const match of page.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))
        expect(() => JSON.parse(match[1]!)).not.toThrow();
      const production = process.env.SITE_INDEXABLE === 'true';
      expect(page).toContain(
        production ? 'index,follow,max-image-preview:large' : 'noindex,nofollow',
      );
      if (production) expect(canonical).not.toMatch(/localhost|example\.|127\.0\.0\.1/);
    }
  });
  it('publica robots, sitemaps, llms, Markdown y health sin documentos internos', () => {
    for (const path of [
      'robots.txt',
      'sitemap-index.xml',
      'sitemap-0.xml',
      'llms.txt',
      'guia.md',
      'lugares.md',
      'health',
    ])
      expect(existsSync(`dist/${path}`)).toBe(true);
    expect(read('health').trim()).toBe('ok');
    for (const place of places) expect(read('sitemap-0.xml')).toContain(`/lugares/${place.slug}/`);
    expect(read('sitemap-0.xml')).not.toContain('/404/');
    expect(read('robots.txt')).toContain(
      process.env.SITE_INDEXABLE === 'true' ? 'Allow: /' : 'Disallow: /',
    );
    for (const entry of readdirSync('dist'))
      expect(entry).not.toMatch(/^(docs|tests|reports|\.env|Manantiales_Serranos_v2.html)$/);
    expect(read('index.html')).not.toMatch(/data:image\/[^;]+;base64/);
  });
});

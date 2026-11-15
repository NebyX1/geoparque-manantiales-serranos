import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { places } from '../../src/data/geosites';
import { articles } from '../../src/data/stories';
import { photoProfiles } from '../../src/lib/photo-profiles.mjs';
import visualReview from '../../src/data/visual-review.json';
import sharp from 'sharp';
const dist = 'dist';
const generated = (path: string) => join(dist, path);
const read = (path: string) => readFileSync(generated(path), 'utf8');
describe('build estático y SEO', () => {
  it('publica home, 61 fichas completas y ocho historias como HTML', () => {
    expect(read('inicio/index.html')).toContain('LA TIERRA');
    expect(read('experiencia/index.html')).not.toContain('astro-view-transitions-enabled');
    expect(read('index.html')).toContain('href="/inicio/"');
    expect(read('index.html')).toContain('href="/experiencia/"');
    expect(existsSync(generated('experiencia/index.html'))).toBe(true);
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
      const pdf = readFileSync(generated(`lugares/${place.slug}.pdf`));
      expect(pdf.subarray(0, 5).toString(), `PDF GMS-${place.id}`).toBe('%PDF-');
      expect(pdf.subarray(-20).toString()).toContain('%%EOF');
      expect(page).toContain(`download="${place.slug}.pdf"`);
    }
    for (const slug of Object.keys(articles))
      expect(existsSync(generated(`historias/${slug}/index.html`))).toBe(true);
  });
  it('genera canonicals y titles únicos, descripciones y JSON-LD válido', () => {
    const canonicals = new Set<string>();
    const titles = new Set<string>();
    for (const route of [
      '',
      'inicio/',
      'experiencia/',
      'explorar/',
      'lugares/',
      'historias/',
      'circuitos/',
      'planifica/',
      'creditos-fotograficos/',
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
      expect(existsSync(generated(path))).toBe(true);
    expect(read('health').trim()).toBe('ok');
    for (const place of places) expect(read('sitemap-0.xml')).toContain(`/lugares/${place.slug}/`);
    expect(read('sitemap-0.xml')).not.toContain('/404/');
    expect(read('sitemap-0.xml')).toContain('/inicio/');
    expect(read('sitemap-0.xml')).toContain('/experiencia/');
    expect(read('robots.txt')).toContain(
      process.env.SITE_INDEXABLE === 'true' ? 'Allow: /' : 'Disallow: /',
    );
    for (const entry of readdirSync(dist))
      expect(entry).not.toMatch(/^(docs|tests|reports|\.env|Manantiales_Serranos_v2.html)$/);
    expect(read('index.html')).not.toMatch(/data:image\/[^;]+;base64/);
  });
  it('publica solamente imágenes WebP y sirve las texturas que referencian los modelos', () => {
    const imagePattern = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)$/i;
    const files = readdirSync(dist, { recursive: true });
    const images = files.filter(
      (file): file is string => typeof file === 'string' && imagePattern.test(file),
    );
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) expect(image).toMatch(/\.webp$/);

    for (const file of [
      'models/geosites/represa-stewart-vargas.glb',
      'models/geosites/rebuilt/gms-61.glb',
    ]) {
      const model = readFileSync(generated(file));
      const gltf = JSON.parse(model.toString('utf8', 20, 20 + model.readUInt32LE(12)));
      expect(gltf.images.length).toBeGreaterThan(0);
      for (const image of gltf.images) {
        const url = new URL(image.uri, `https://geoparque.test/${file}`);
        const webp = readFileSync(generated(url.pathname));
        expect(webp.toString('ascii', 8, 12)).toBe('WEBP');
      }
    }
  });
  it('publica cada variante WebP con las dimensiones de su perfil y conserva los créditos', async () => {
    const publicText = readdirSync(dist, { recursive: true }).filter(
      (file): file is string =>
        typeof file === 'string' && /\.(html|json|md|js|txt|svg)$/i.test(file),
    );
    const processingLabel =
      /restauraci[oó]n\s+con\s+ia\b|(?:restaurad[ao]s?|generad[ao]s?|hech[ao]s?|cread[ao]s?)\s+(?:con|por)\s+ia\b/i;
    const widthsByURL = new Map<string, { width: number; height: number }>();
    const reviewedComponents = new Set(
      Object.keys(visualReview.components).map((file) => basename(file, '.webp')),
    );
    const componentURLs = new Set<string>();
    function validateSet(srcset: string, name: string, label: string) {
      const profile = photoProfiles[name as keyof typeof photoProfiles];
      expect(profile, label).toBeDefined();
      const pairs = srcset.split(', ').map((candidate) => candidate.split(' '));
      expect(
        pairs.map(([, descriptor]) => Number(descriptor?.slice(0, -1))),
        label,
      ).toEqual(profile.widths);
      for (const [url, descriptor] of pairs) {
        const width = Number(descriptor!.slice(0, -1));
        const dimensions = { width, height: (width * profile.height) / profile.width };
        const previous = widthsByURL.get(url!);
        if (previous) expect(previous, url).toEqual(dimensions);
        else widthsByURL.set(url!, dimensions);
      }
    }
    for (const file of publicText) {
      const content = read(file);
      expect(content.replaceAll('&nbsp;', ' '), file).not.toMatch(processingLabel);
      if (!file.endsWith('.html')) continue;
      for (const [tag] of content.matchAll(/<img\b[^>]*>/g)) {
        const name = tag.match(/\bdata-photo-profile="([^"]+)"/)?.[1];
        if (name === 'hero') continue;
        const srcset = tag.match(/\bsrcset="([^"]+)"/)?.[1];
        if (!name) {
          const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
          if (src) componentURLs.add(src);
          for (const entry of srcset?.split(', ') ?? []) {
            componentURLs.add(entry.split(' ')[0]!);
          }
          continue;
        }
        expect(srcset, file).toBeDefined();
        validateSet(srcset!, name!, file);
      }
    }
    const data = read('inicio/index.html').match(/<script id="page-data"[^>]*>(.*?)<\/script>/s);
    const dynamic = JSON.parse(data![1]!).photoVariants as Record<
      string,
      Record<string, [src: string, srcset: string]>
    >;
    for (const [profile, photographs] of Object.entries(dynamic))
      for (const [key, [, srcset]] of Object.entries(photographs))
        validateSet(srcset, profile, key);
    expect(widthsByURL.size).toBeGreaterThanOrEqual(61);
    for (const [url, size] of widthsByURL) {
      expect(await sharp(generated(url)).metadata(), url).toMatchObject({
        ...size,
        format: 'webp',
      });
    }
    for (const url of componentURLs) {
      expect(url).toMatch(/^\/_astro\/.+\.webp$/);
      expect(reviewedComponents.has(basename(url).split('.')[0]!), url).toBe(true);
      expect((await sharp(generated(url)).metadata()).format, url).toBe('webp');
    }
  }, 30_000);
});

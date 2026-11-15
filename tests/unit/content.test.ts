import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { places, canonicalPlaces } from '../../src/data/geosites';
import { circuits } from '../../src/data/circuits';
import { articles } from '../../src/data/stories';
import { validatePlaces } from '../../src/lib/validation';
import { normalized, matchesQuery, placeSearchText } from '../../src/lib/search';
import { placeMarkdown, placesMarkdown, guideMarkdown } from '../../src/lib/markdown';
import { getBuildSite, absoluteUrl } from '../../src/lib/urls';
import sharp from 'sharp';
import { heroCrop } from '../../src/lib/hero-crop.mjs';
import {
  environmentalAxes,
  environmentalSources,
  learningActivities,
} from '../../src/data/environment';
import { existsSync } from 'node:fs';
describe('contenido canónico', () => {
  it('conserva las 61 fichas y los datos documentales al renovar el enfoque editorial', () => {
    const source = readFileSync('Manantiales_Serranos_v2.html', 'utf8');
    const data = JSON.parse(
      source.match(/<script id="site-data" type="application\/json">([\s\S]*?)<\/script>/)![1]!,
    );
    expect(validatePlaces(places)).toEqual([]);
    for (const original of data.places)
      for (const [key, value] of Object.entries(original)) {
        if (['intro', 'summary', 'blocks'].includes(key)) continue;
        expect(canonicalPlaces.find((place) => place.id === original.id)).toHaveProperty(
          key,
          value,
        );
        // Audited photographs replace the prototype's generic image associations.
        if (key !== 'image' && key !== 'imageContext')
          expect(places.find((place) => place.id === original.id)).toHaveProperty(key, value);
      }
    const routeStructure = (routes: typeof circuits) =>
      routes.map((route) => ({
        id: route.id,
        days: route.days,
        places: route.places,
        blocks: route.blocks.map((block) => ({ day: block.day, ids: block.ids })),
      }));
    expect(routeStructure(circuits)).toEqual(routeStructure(data.routes));
    expect(Object.keys(articles)).toEqual(Object.keys(data.articles));
    for (const article of Object.values(articles)) {
      expect(article.lead.length).toBeGreaterThan(40);
      expect(article.sections.length).toBeGreaterThanOrEqual(4);
    }
    for (const place of places) {
      expect(place.blocks.length).toBeGreaterThan(0);
      expect(place.blocks.every((block) => block.text.trim().length > 0)).toBe(true);
    }
  });
  it('resuelve los recursos educativos y conserva la trazabilidad documental', () => {
    for (const resource of [...environmentalAxes, ...learningActivities]) {
      expect(Object.keys(articles)).toContain(resource.href.split('/').filter(Boolean).at(-1));
      expect(resource.sources.length).toBeGreaterThan(0);
      for (const reference of resource.sources) {
        expect(existsSync(`data/${environmentalSources[reference.source].file}`)).toBe(true);
        expect(reference.pages.every((page) => Number.isInteger(page) && page > 0)).toBe(true);
      }
    }
  });
  it('resuelve circuitos y relaciones únicamente hacia lugares existentes', () => {
    const ids = new Set(places.map((place) => place.id));
    for (const circuit of circuits)
      for (const id of circuit.blocks.flatMap((block) => block.ids)) expect(ids.has(id)).toBe(true);
    expect(places.filter((place) => place.international)).toHaveLength(4);
  });
  it('busca sin acentos y por todas las palabras, incluida modalidad de visita', () => {
    expect(normalized('Geología · Solís')).toBe('geologia · solis');
    expect(matchesQuery(placeSearchText(places[0]!), 'arequita coordinacion')).toBe(true);
    expect(matchesQuery(placeSearchText(places[0]!), 'arequita inexistente')).toBe(false);
  });
  it('deriva Markdown del mismo contenido y conserva cada apartado', () => {
    for (const place of places) {
      const markdown = placeMarkdown(place);
      for (const block of place.blocks) expect(markdown).toContain(block.text);
      expect(placesMarkdown(places)).toContain(`# ${place.name}`);
      expect(guideMarkdown(places)).toContain(place.summary);
    }
  });
  it('conserva exactamente los píxeles y el encuadre de los cuatro recortes móviles', async () => {
    const manifest = JSON.parse(readFileSync('docs/hero-crop-manifest.json', 'utf8')) as {
      original: string;
      path: string;
      crop: ReturnType<typeof heroCrop>;
    }[];
    expect(manifest).toHaveLength(4);
    for (const entry of manifest) {
      const source = sharp(entry.original);
      const { width, height } = await source.metadata();
      const crop = heroCrop(width, height);
      expect(entry.crop).toEqual(crop);
      const original = await source.extract(crop).raw().toBuffer();
      const derived = await sharp(entry.path).raw().toBuffer();
      expect(derived.equals(original)).toBe(true);
      for (const [frameWidth, frameHeight] of [
        [320, 816],
        [390, 780],
        [620, 780],
      ] as const) {
        const visibleWidth = (frameWidth * height) / frameHeight;
        expect(visibleWidth).toBeLessThanOrEqual(crop.width);
        const originalLeft = (width - visibleWidth) * 0.68;
        const croppedLeft = crop.left + (crop.width - visibleWidth) * 0.68;
        expect(Math.abs(originalLeft - croppedLeft)).toBeLessThanOrEqual(0.5);
      }
    }
  });
});
describe('URLs y política de indexación', () => {
  it('mantiene previews no indexables', () =>
    expect(getBuildSite({})).toEqual({ url: 'http://localhost:4321/', indexable: false }));
  it('requiere dominio HTTPS real para producción', () => {
    for (const url of [
      '',
      'http://manantialesserranos.uy',
      'https://localhost',
      'https://example.com',
      'https://demo.test',
    ])
      expect(() => getBuildSite({ SITE_INDEXABLE: 'true', SITE_URL: url })).toThrow();
    const build = getBuildSite({
      SITE_INDEXABLE: 'true',
      SITE_URL: 'https://manantialesserranos.uy',
    });
    expect(absoluteUrl('/lugares/cerro-arequita/', build.url)).toBe(
      'https://manantialesserranos.uy/lugares/cerro-arequita/',
    );
  });
});

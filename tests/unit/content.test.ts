import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { places } from '../../src/data/geosites';
import { circuits } from '../../src/data/circuits';
import { articles } from '../../src/data/stories';
import { validatePlaces } from '../../src/lib/validation';
import { normalized, matchesQuery, placeSearchText } from '../../src/lib/search';
import { placeMarkdown, placesMarkdown, guideMarkdown } from '../../src/lib/markdown';
import { getBuildSite, absoluteUrl } from '../../src/lib/urls';
import sharp from 'sharp';
import { heroCrop } from '../../src/lib/hero-crop.mjs';
describe('contenido canónico', () => {
  it('mantiene íntegramente las 61 fichas, sus identificadores y sus bloques', () => {
    const source = readFileSync('Manantiales_Serranos_v2.html', 'utf8');
    const data = JSON.parse(
      source.match(/<script id="site-data" type="application\/json">([\s\S]*?)<\/script>/)![1]!,
    );
    expect(validatePlaces(places)).toEqual([]);
    for (const original of data.places)
      for (const [key, value] of Object.entries(original))
        expect(places.find((place) => place.id === original.id)).toHaveProperty(key, value);
    expect(circuits).toEqual(data.routes);
    expect(articles).toEqual(data.articles);
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
    const manifest = JSON.parse(readFileSync('docs/asset-manifest.json', 'utf8'));
    for (const key of ['arequita-rio', 'aguas', 'salus', 'parque']) {
      const asset = manifest[key];
      const crop = heroCrop(asset.width, asset.height);
      const original = await sharp(asset.path).extract(crop).raw().toBuffer();
      const derived = await sharp(`src/assets/images/hero/mobile/${key}.webp`).raw().toBuffer();
      expect(derived.equals(original)).toBe(true);
      for (const [width, height] of [
        [320, 816],
        [390, 780],
        [620, 780],
      ]) {
        const visibleWidth = (width! * asset.height) / height!;
        expect(visibleWidth).toBeLessThanOrEqual(crop.width);
        const originalLeft = (asset.width - visibleWidth) * 0.68;
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

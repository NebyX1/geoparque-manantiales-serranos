import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { places, canonicalPlaces } from '../../src/data/geosites';
import { articles } from '../../src/data/stories';
import { circuits } from '../../src/data/circuits';
import { gallery } from '../../src/data/geopark';
import locations from '../../src/data/geography/locations.json';
import { photoProfiles, publishedPhotoFile } from '../../src/lib/photo-profiles.mjs';
import {
  placePhotoInventory,
  editorialPhotoInventory,
  photoForPlace,
  photoForDisplay,
  photoForAsset,
  photoLabel,
  browserPhotoMetadata,
} from '../../src/data/place-photos';

const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
describe('fotografías identificadas del Geoparque', () => {
  it('cubre cada lugar y sustituye las imágenes genéricas en los datos compartidos', () => {
    expect(placePhotoInventory.map((photo) => photo.id)).toEqual(
      canonicalPlaces.map((place) => place.id),
    );
    expect(new Set(placePhotoInventory.map((photo) => photo.key)).size).toBe(61);
    for (const place of places) {
      const photo = photoForDisplay(place.id);
      expect(place.image).toBe(photo.key);
      expect(place.images[0]?.key).toBe(photo.key);
      expect(place.imageContext).toBe(false);
      expect(place.photoCaption).toBe(photo.caption);
      expect(browserPhotoMetadata[place.image]?.caption).toBe(photo.caption);
      expect(photo.width, photo.key).toBeGreaterThanOrEqual(photo.height);
    }
    expect(() => photoForPlace(999)).toThrow();
    expect(photoForAsset('missing-photo')).toBeUndefined();
  });
  it('conserva medidas exactas en los másteres de las 61 fichas y en los perfiles', async () => {
    const cover = photoProfiles['place-cover'];
    for (const place of places) {
      const source = publishedPhotoFile(place.image);
      expect(await sharp(source).metadata(), source).toMatchObject({
        format: 'webp',
        width: cover.width,
        height: cover.height,
        hasAlpha: false,
      });
    }
    for (const { widths, width, height, fallback } of Object.values(photoProfiles)) {
      expect(widths.at(-1)).toBe(width);
      expect(widths).toContain(fallback);
      expect(widths.every((candidate) => Number.isInteger((candidate * height) / width))).toBe(
        true,
      );
    }
  });
  it('protege archivos, dimensiones y procedencia de todas las imágenes publicadas', async () => {
    for (const photo of [...placePhotoInventory, ...editorialPhotoInventory]) {
      expect(photo.verified).toBe(true);
      expect(new URL(photo.sourcePage).protocol).toBe('https:');
      expect(photo.evidence.length).toBeGreaterThan(50);
      expect(photo.credit.trim()).toBeTruthy();
      expect(sha256(photo.file), photo.key).toBe(photo.sha256);
      const metadata = await sharp(photo.file).metadata();
      expect(metadata.format).toBe('webp');
      expect([metadata.width, metadata.height]).toEqual([photo.width, photo.height]);
      expect(Math.min(photo.width, photo.height)).toBeGreaterThanOrEqual(550);
    }
    for (const key of [
      ...Object.values(articles).map((story) => story.image),
      ...circuits.map((circuit) => circuit.image),
      ...gallery.map((item) => item.key),
      'aguas',
      'salus',
      'parque',
      'arequita-rio',
    ]) {
      expect(photoForAsset(key), key).toBeDefined();
      expect(browserPhotoMetadata[key]?.caption, key).toBeTruthy();
    }
  });
  it('conserva las referencias y los prompts de las versiones editoriales', async () => {
    const prompts = JSON.parse(readFileSync('docs/photo-restoration-prompts.json', 'utf8'));
    for (const photo of [...placePhotoInventory, ...editorialPhotoInventory]) {
      if (photo.kind !== 'restored') continue;
      expect(photoLabel(photo)).toBe('');
      expect('restorationPromptId' in photo && prompts[photo.restorationPromptId!]?.status).toBe(
        'accepted',
      );
      expect(
        'restorationPromptId' in photo && prompts[photo.restorationPromptId!]?.prompt,
      ).toBeTruthy();
      expect('referenceFile' in photo && photo.referenceFile).toMatch(
        /^src\/assets\/images\/(?:photo-credit|place-photo)\/.+\.webp$/,
      );
      if ('referenceFile' in photo && photo.referenceFile) {
        expect(sha256(photo.referenceFile)).toBe(photo.referenceSha256);
        expect((await sharp(photo.referenceFile).metadata()).format).toBe('webp');
      }
    }
  });
  it('centra las ortofotos reales en las coordenadas documentadas y conserva su fecha', () => {
    for (const photo of placePhotoInventory.filter((photo) => photo.kind === 'aerial')) {
      const source = new URL(photo.sourceImage);
      const bbox = source.searchParams.get('bbox')!.split(',').map(Number);
      const location = locations.find((entry) => entry.id === photo.id)!;
      expect(source.hostname).toBe('mapas.ide.uy');
      expect(source.searchParams.get('layers')).toBe('ortofotos:ortofoto_nacional');
      expect((bbox[0]! + bbox[2]!) / 2).toBeCloseTo(location.longitude, 6);
      expect((bbox[1]! + bbox[3]!) / 2).toBeCloseTo(location.latitude, 6);
      expect(photo.historical).toBe(true);
      expect(photo.caption).toContain('2017–2018');
      expect(photoLabel(photo)).toContain('2017–2018');
    }
  });
});

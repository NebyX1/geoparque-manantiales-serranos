import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { places, canonicalPlaces } from '../../src/data/geosites';
import { articles } from '../../src/data/stories';
import { circuits } from '../../src/data/circuits';
import { gallery } from '../../src/data/geopark';
import locations from '../../src/data/geography/locations.json';
import {
  placePhotoInventory,
  editorialPhotoInventory,
  photoForPlace,
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
      const photo = photoForPlace(place.id);
      expect(place.image).toBe(photo.key);
      expect(place.images[0]?.key).toBe(photo.key);
      expect(place.imageContext).toBe(false);
      expect(place.photoCaption).toBe(photo.caption);
      expect(browserPhotoMetadata[place.image]?.caption).toBe(photo.caption);
    }
    expect(() => photoForPlace(999)).toThrow();
    expect(photoForAsset('missing-photo')).toBeUndefined();
  });
  it('protege archivos, dimensiones y procedencia de todas las imágenes publicadas', async () => {
    for (const photo of [...placePhotoInventory, ...editorialPhotoInventory]) {
      expect(photo.verified).toBe(true);
      expect(new URL(photo.sourcePage).protocol).toBe('https:');
      expect(photo.evidence.length).toBeGreaterThan(50);
      expect(photo.credit.trim()).toBeTruthy();
      expect(sha256(photo.file), photo.key).toBe(photo.sha256);
      const metadata = await sharp(photo.file).metadata();
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
  it('conserva originales y prompts y distingue cada restauración de una foto nueva', () => {
    const prompts = JSON.parse(readFileSync('docs/photo-restoration-prompts.json', 'utf8'));
    for (const photo of [...placePhotoInventory, ...editorialPhotoInventory]) {
      if (photo.kind !== 'restored') continue;
      expect(photoLabel(photo)).toBe('Restauración con IA');
      expect('restorationPromptId' in photo && prompts[photo.restorationPromptId!]?.status).toBe(
        'accepted',
      );
      expect(
        'restorationPromptId' in photo && prompts[photo.restorationPromptId!]?.prompt,
      ).toBeTruthy();
      expect('originalPhotoUrl' in photo && photo.originalPhotoUrl).toMatch(/^\/photo-originals\//);
      if ('originalPhotoUrl' in photo && photo.originalPhotoUrl) {
        expect(existsSync(`public${photo.originalPhotoUrl}`)).toBe(true);
        expect(sha256(`public${photo.originalPhotoUrl}`)).toBe(photo.referenceSha256);
      }
      expect(photo.caption.toLowerCase()).toContain('restauración con ia');
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

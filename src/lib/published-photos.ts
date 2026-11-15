import type { ImageMetadata } from 'astro';
import { photoProfiles } from './photo-profiles.mjs';

const files = import.meta.glob<ImageMetadata>('../assets/images/place-photo/published/*.webp', {
  eager: true,
  import: 'default',
});
const { width, height } = photoProfiles['place-cover'];

export const publishedPhotos = Object.fromEntries(
  Object.entries(files).map(([file, image]) => {
    if (image.width !== width || image.height !== height || image.format !== 'webp') {
      throw new Error(`${file} debe ser WebP de ${width} × ${height} px`);
    }
    return [file.split('/').at(-1)!.slice(0, -5), image] as const;
  }),
);

import type { ImageMetadata } from 'astro';
import logo from '../assets/images/site-brand/manantiales-serranos.webp';
import unesco from '../assets/images/footer/unesco.webp';

const photographs = import.meta.glob<ImageMetadata>(
  [
    '../assets/images/**/*.webp',
    '!../assets/images/**/archive/**',
    '!../assets/images/place-photo/published/**',
  ],
  { eager: true, import: 'default' },
);

export function referenceImage(file: string): ImageMetadata {
  const image = photographs[file.replace(/^src\//, '../')];
  if (!image) throw new Error(`Missing photograph: ${file}`);
  return image;
}

export const brandImages: Record<string, ImageMetadata> = {
  unesco,
  'site-brand': logo,
};

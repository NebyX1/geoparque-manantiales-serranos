import type { ImageMetadata } from 'astro';
import aguas from '../assets/images/hero/aguas.webp';
import arequita from '../assets/images/hero/arequita-rio.webp';
import parque from '../assets/images/hero/parque.webp';
import salus from '../assets/images/hero/salus.webp';
import parqueStory from '../assets/images/hero/parque-story.webp';
import { editorialPhotoPlaces, photoForPlace } from './place-photos';

const photographs = import.meta.glob<ImageMetadata>('../assets/images/places/*.webp', {
  eager: true,
  import: 'default',
});
const verified = Object.fromEntries(
  Object.entries(photographs).map(([path, image]) => [
    path
      .split('/')
      .at(-1)!
      .replace(/\.webp$/, ''),
    image,
  ]),
);
const editorial = Object.fromEntries(
  Object.entries(editorialPhotoPlaces).map(([key, id]) => [key, verified[photoForPlace(id).key]!]),
);
export const assets: Record<
  string,
  ImageMetadata | { src: string; width: number; height: number }
> = {
  ...verified,
  ...editorial,
  // These four physical sources also feed the pixel-preserving mobile hero crops.
  aguas,
  'arequita-rio': arequita,
  parque,
  'parque-story': parqueStory,
  salus,
  'map-original': { src: '/downloads/map-original.webp', width: 1224, height: 1584 },
  unesco: { src: '/partners/unesco.png', width: 77, height: 59 },
  instituciones: { src: '/partners/instituciones.png', width: 270, height: 79 },
  lavalleja: { src: '/partners/lavalleja.png', width: 124, height: 60 },
  'brand-c66ec6c0da68': { src: '/brand/logo.svg', width: 225, height: 191 },
};

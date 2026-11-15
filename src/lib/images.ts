import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { publishedPhotos } from './published-photos';
import { articles } from '../data/stories';
import { gallery } from '../data/geopark';
import { circuits } from '../data/circuits';
import { photoProfiles } from './photo-profiles.mjs';
import { photoForAsset } from '../data/place-photos';
import photoEdits from '../data/photo-edits.json';

export type PhotoProfile = keyof typeof photoProfiles;

export function photoMetadata(
  key: string,
  profile: PhotoProfile | 'hero',
  width: number,
  height: number,
) {
  const photo = photoForAsset(key);
  if (!photo) throw new Error(`Fotografía desconocida: ${key}`);
  return {
    'data-photo-key': photo.key,
    'data-photo-kind': photo.kind,
    'data-photo-fit': 'cover',
    'data-photo-profile': profile,
    'data-photo-width': width,
    'data-photo-height': height,
  };
}

const recipes: Record<
  string,
  { cardFocus?: number; cardPositionY?: number; coverPosition?: number[]; [edit: string]: unknown }
> = photoEdits;

export function detailPhotoPosition(key: string): string | undefined {
  const position = recipes[key]?.coverPosition;
  return position?.map((coordinate) => `${coordinate}%`).join(' ');
}

export function cardPhotoPosition(key: string): string | undefined {
  const position = recipes[key]?.cardPositionY;
  return position === undefined ? undefined : `50% ${position}%`;
}

type Picture = {
  src: string;
  srcset: string;
  sizes: string;
  width: number;
  height: number;
};

export function standardPhoto(key: string, profile: PhotoProfile): Promise<Picture> {
  const photo = photoForAsset(key);
  if (!photo) throw new Error(`Fotografía desconocida: ${key}`);
  return makePicture(publishedAsset(photo.key), profile, photo.key);
}

function publishedAsset(key: string): ImageMetadata {
  const asset = publishedPhotos[key];
  if (!asset) throw new Error(`Falta la fotografía de publicación: ${key}`);
  return asset;
}

const pictures = new Map<string, Promise<Picture>>();
function makePicture(asset: ImageMetadata, profile: PhotoProfile, key: string) {
  const cacheKey = `${asset.src}|${profile}`;
  const existing = pictures.get(cacheKey);
  if (existing) return existing;
  const { width, height, widths, fallback, sizes } = photoProfiles[profile];
  if (width > asset.width || height > asset.height) {
    throw new Error(`La fotografía ${key} es demasiado pequeña para ${profile}`);
  }
  const focus = recipes[key]?.cardFocus;
  const position =
    focus !== undefined && (profile === 'place-card' || profile === 'thumbnail')
      ? `focus-x:${focus}`
      : 'centre';
  const picture = Promise.all(
    widths.map(async (w) => {
      const h = (w * height) / width;
      if (!Number.isInteger(h)) throw new Error(`Variante de ${profile} sin proporción exacta`);
      const image =
        w === asset.width && h === asset.height
          ? asset
          : await getImage({
              src: asset,
              width: w,
              height: h,
              fit: 'cover',
              position,
              format: 'webp',
              quality: 90,
            });
      return [w, image.src] as const;
    }),
  ).then((sources) => ({
    src: sources.find(([w]) => w === fallback)![1],
    srcset: sources.map(([w, src]) => `${src} ${w}w`).join(', '),
    sizes,
    width,
    height,
  }));
  pictures.set(cacheKey, picture);
  return picture;
}

type ClientPicture = [src: string, srcset: string];
let clientVariants:
  Promise<Partial<Record<PhotoProfile, Record<string, ClientPicture>>>> | undefined;

/** Send just the crops that a browser can insert after navigation. */
export function clientPhotoVariants(placeKeys: string[]) {
  const articleKeys = Object.values(articles).map(({ image }) => image);
  const circuitKeys = circuits.map(({ image }) => image);
  const dynamic: Partial<Record<PhotoProfile, string[]>> = {
    thumbnail: [...placeKeys, ...articleKeys, 'arequita-rio'],
    editorial: placeKeys,
    reading: [...articleKeys, ...circuitKeys],
    gallery: gallery.map(({ key }) => key),
  };
  return (clientVariants ??= Promise.all(
    Object.entries(dynamic).map(async ([name, keys]) => {
      const profile = name as PhotoProfile;
      const canonicalKeys = new Set(keys.map((key) => photoForAsset(key)!.key));
      const entries = await Promise.all(
        [...canonicalKeys].map(async (key) => {
          const { src, srcset } = await standardPhoto(key, profile);
          return [key, [src, srcset] satisfies ClientPicture] as const;
        }),
      );
      return [profile, Object.fromEntries(entries)] as const;
    }),
  ).then((entries) => Object.fromEntries(entries)));
}

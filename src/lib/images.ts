import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { assets } from '../data/assets';
import { photoForAsset } from '../data/place-photos';
import { responsiveWidths } from './image-sizing';

let sourceSets: Promise<Record<string, string>> | undefined;
export function clientPhotoSources(): Promise<Record<string, string>> {
  return (sourceSets ??= Promise.all(
    Object.entries(assets)
      .filter(([key, asset]) => photoForAsset(key) && 'format' in asset)
      .map(
        async ([key, asset]) =>
          [
            key,
            (
              await Promise.all(
                responsiveWidths(asset.width).map(async (width) => {
                  const image = await getImage({
                    src: asset as ImageMetadata,
                    width,
                    format: 'webp',
                    quality: 92,
                  });
                  return `${image.src} ${width}w`;
                }),
              )
            ).join(', '),
          ] as const,
      ),
  ).then((entries) => Object.fromEntries(entries)));
}
export async function clientImages(): Promise<Record<string, string>> {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(assets).map(async ([key, asset]) => [
        key,
        'format' in asset
          ? (
              await getImage({
                src: asset as ImageMetadata,
                width: Math.min(1920, asset.width),
                format: 'webp',
                quality: 92,
              })
            ).src
          : asset.src,
      ]),
    ),
  );
}

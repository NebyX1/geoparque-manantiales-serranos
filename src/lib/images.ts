import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { assets } from '../data/assets';
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
              })
            ).src
          : asset.src,
      ]),
    ),
  );
}

import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { assets } from '../data/assets';
import { mobileHeroAssets, type HeroAssetKey } from '../data/hero-assets';
import { heroSizes, responsiveWidths } from './image-sizing';

async function source(asset: ImageMetadata, format: 'avif' | 'webp') {
  const images = await Promise.all(
    responsiveWidths(asset.width).map(async (width) => {
      const image = await getImage({ src: asset, width, format });
      return `${image.src} ${width}w`;
    }),
  );
  return images.join(', ');
}

export async function heroImages(key: HeroAssetKey) {
  const desktop = assets[key] as ImageMetadata;
  const mobile = mobileHeroAssets[key];
  const [desktopAvif, mobileAvif, mobileWebp] = await Promise.all([
    source(desktop, 'avif'),
    source(mobile, 'avif'),
    source(mobile, 'webp'),
  ]);
  return {
    desktop: desktopAvif,
    mobile: mobileAvif,
    mobileFallback: mobileWebp,
    desktopSizes: heroSizes(desktop),
    mobileSizes: heroSizes(mobile),
  };
}

import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { heroCoverAssets, mobileHeroAssets, type HeroAssetKey } from '../data/hero-assets';
import { heroSizes, responsiveWidths } from './image-sizing';

async function source(asset: ImageMetadata) {
  const images = await Promise.all(
    responsiveWidths(asset.width, asset.width).map(async (width) => {
      const image =
        width === asset.width
          ? asset
          : await getImage({ src: asset, width, format: 'webp', quality: 92 });
      return [width, image.src] as const;
    }),
  );
  return {
    fallback: images.find(([width]) => width === 1280)?.[1] ?? asset.src,
    srcset: images.map(([width, src]) => `${src} ${width}w`).join(', '),
  };
}

export async function heroImages(key: HeroAssetKey) {
  const desktop = heroCoverAssets[key];
  const mobile = mobileHeroAssets[key];
  const [desktopSrcset, mobileSrcset] = await Promise.all([source(desktop), source(mobile)]);
  return {
    desktopAsset: desktop,
    mobileAsset: mobile,
    desktop: desktopSrcset.srcset,
    mobile: mobileSrcset.srcset,
    fallback: desktopSrcset.fallback,
    desktopSizes: heroSizes(desktop),
    mobileSizes: heroSizes(mobile),
  };
}

import type { ImageMetadata } from 'astro';

export function responsiveWidths(width: number): number[] {
  const maximum = Math.min(3840, width);
  return [...new Set([320, 640, 960, 1280, 1600, 1920, 2560, 3200, maximum])]
    .filter((candidate) => candidate <= maximum)
    .sort((a, b) => a - b);
}

/** Cover consumes the entire scaled image, including the pixels cropped off-screen. */
export function storyPhotoSizes(asset: Pick<ImageMetadata, 'width' | 'height'>): string {
  const ratio = asset.width / asset.height;
  const scale = (frameRatio: number) => Math.max(1, ratio / frameRatio) * 1.04;
  const mobile = scale(1.48),
    narrow = scale(0.85),
    tablet = scale(1.1),
    desktop = scale(1.35);
  return [
    `(max-width: 620px) ${(100 * mobile).toFixed(3)}vw`,
    `(max-width: 900px) ${(50 * narrow).toFixed(3)}vw`,
    `(max-width: 1100px) ${(50 * tablet).toFixed(3)}vw`,
    `min(${(50 * desktop).toFixed(3)}vw, ${(698 * desktop).toFixed(3)}px)`,
  ].join(', ');
}

// object-fit: cover scales a landscape by height on a tall viewport. Its
// required source width is larger than the visible, cropped horizontal slot.
// Keep these breakpoints aligned with hero.css and responsive.css.
export function heroSizes(asset: Pick<ImageMetadata, 'width' | 'height'>): string {
  const ratio = asset.width / asset.height;
  const px = (value: number) => `${(value * ratio).toFixed(3)}px`;
  const size = (minimum: number, maximum: number, nav: number) =>
    `max(100vw, clamp(${px(minimum)}, calc(${(100 * ratio).toFixed(3)}svh - ${px(nav)}), ${px(maximum)}))`;
  return [
    `(max-width: 359px) ${size(745, 960, 84)}`,
    `(max-width: 620px) ${size(780, 960, 84)}`,
    `(max-width: 900px) ${size(810, 1050, 94)}`,
    `(max-width: 1100px) ${size(770, 1160, 94)}`,
    size(820, 1160, 94),
  ].join(', ');
}

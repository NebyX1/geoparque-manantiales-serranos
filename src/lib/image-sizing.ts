import type { ImageMetadata } from 'astro';

export function responsiveWidths(width: number): number[] {
  return [...new Set([320, 640, 960, 1280, 1920, Math.min(1920, width)])]
    .filter((candidate) => candidate <= width)
    .sort((a, b) => a - b);
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

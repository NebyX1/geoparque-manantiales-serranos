import type { ImageMetadata } from 'astro';

export function responsiveWidths(width: number, limit = 3840): number[] {
  const maximum = Math.min(limit, width);
  return [...new Set([320, 640, 960, 1280, 1600, 1920, 2560, 3200, maximum])]
    .filter((candidate) => candidate <= maximum)
    .sort((a, b) => a - b);
}

/** Use the source width required by the frame defined in pages.css. */
export function placePhotoSizes(width: number, height: number): string {
  const ratio = width / height;
  const heightWidth = `clamp(${(260 * ratio).toFixed(2)}px, ${(45 * ratio).toFixed(2)}vw, ${(650 * ratio).toFixed(2)}px)`;
  return `max(100vw, ${heightWidth})`;
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
  const size = (minimum: number, maximum: number, nav: number) => {
    const height = `clamp(${px(minimum)}, calc(${(100 * ratio).toFixed(3)}svh - ${px(nav)}), ${px(maximum)})`;
    // The editorial cover fills the whole hero, which can grow past its CSS minimum
    // when the title and footer take more space. Keep the source at native width
    // when the viewport makes the layout taller than the raster.
    const content = `min(${px(maximum)}, calc(${(90 * ratio).toFixed(3)}svh + ${px(350)}))`;
    return `max(100vw, ${height}, ${content})`;
  };
  return [
    `(max-width: 359px) ${size(915, 1060, 84)}`,
    `(max-width: 620px) ${size(900, 1060, 84)}`,
    `(max-width: 900px) ${size(830, 1050, 94)}`,
    `(max-width: 1100px) ${size(840, 1160, 94)}`,
    size(820, 1240, 94),
  ].join(', ');
}

// CSS uses object-position: 68% 50% at widths <= 620px, with a minimum
// hero height of 780px (745px only below 359px). This full-height crop
// includes every pixel visible in that range and preserves that position.
export function heroCrop(width, height) {
  const croppedWidth = Math.min(width, Math.ceil((height * 620) / 780));
  return {
    left: Math.round((width - croppedWidth) * 0.68),
    top: 0,
    width: croppedWidth,
    height,
  };
}

const toneAnchors = [0, 48, 128, 212, 255];

function toneCurve([shadows = 0, midtones = 0, highlights = 0] = []) {
  const levels = [0, 48 + shadows, 128 + midtones, 212 + highlights, 255];
  if (levels.some((level, index) => index > 0 && level <= levels[index - 1])) {
    throw new Error('La curva tonal debe conservar el orden de luminosidad');
  }
  return Float32Array.from({ length: 256 }, (_, level) => {
    const right = toneAnchors.findIndex((anchor) => anchor >= level);
    if (right === 0) return 0;
    const t = (level - toneAnchors[right - 1]) / (toneAnchors[right] - toneAnchors[right - 1]);
    const lift = levels[right - 1] - toneAnchors[right - 1];
    const nextLift = levels[right] - toneAnchors[right];
    return level + lift + (nextLift - lift) * t;
  });
}

const clampByte = (channel) => Math.max(0, Math.min(255, channel));

function smoothStep(lower, upper, value) {
  const t = Math.max(0, Math.min(1, (value - lower) / (upper - lower)));
  return t * t * (3 - 2 * t);
}

function applySelectiveGrade(pixels, width, selective) {
  const { shadowWarmth = 0, shadowLift = 0, foliageCorrection = 0, fadeFromTop } = selective;
  const rowBytes = width * 3;
  const height = pixels.length / rowBytes;

  for (let row = 0; row < height; row += 1) {
    const fade = fadeFromTop ? smoothStep(fadeFromTop[0], fadeFromTop[1], row / height) : 1;
    if (fade === 0) continue;
    const offset = row * rowBytes;
    for (let index = offset; index < offset + rowBytes; index += 3) {
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const warmth =
        shadowWarmth * (1 - smoothStep(56, 146, luma)) * smoothStep(2, 42, g - r + (b - r) / 2);
      const lifted = 16 * shadowLift * smoothStep(12, 48, luma) * (1 - smoothStep(71, 159, luma));
      const foliage =
        foliageCorrection *
        smoothStep(14, 45, g - b) *
        (1 - smoothStep(6, 30, r - g)) *
        smoothStep(76, 153, luma);

      pixels[index] = Math.round(clampByte(r + fade * (lifted + warmth * 10 - foliage * 7)));
      pixels[index + 1] = Math.round(clampByte(g + fade * (lifted + warmth + foliage * 1.5)));
      pixels[index + 2] = Math.round(clampByte(b + fade * (lifted - warmth * 6 + foliage * 5)));
    }
  }
}

/**
 * Modify luma in perceptual sRGB. Apply white balance through gains that roll off
 * near white, and use a common correction across channels to preserve hue.
 */
export function applyPhotoGrade(pixels, { tone, balance, selective } = {}, width) {
  if (selective) applySelectiveGrade(pixels, width, selective);
  if (!tone && !balance) return pixels;
  const curve = toneCurve(tone);
  const gains = (balance ?? [1, 1, 1]).map((gain) =>
    Float32Array.from({ length: 256 }, (_, value) =>
      clampByte(value * (1 + (gain - 1) * (1 - (value / 255) ** 2))),
    ),
  );
  for (let index = 0; index < pixels.length; index += 3) {
    const r = gains[0][pixels[index]];
    const g = gains[1][pixels[index + 1]];
    const b = gains[2][pixels[index + 2]];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const correction = curve[Math.round(luma)] / Math.max(1, Math.round(luma));
    const common = Math.min(correction, 255 / Math.max(1, r, g, b));
    pixels[index] = Math.round(r * common);
    pixels[index + 1] = Math.round(g * common);
    pixels[index + 2] = Math.round(b * common);
  }
  return pixels;
}

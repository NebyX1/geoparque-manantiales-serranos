export interface InspectionPoint {
  x: number;
  y: number;
  z: number;
}

export interface InspectionBounds {
  min: InspectionPoint;
  max: InspectionPoint;
}

export interface InspectionViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  fullWidth: number;
  fullHeight: number;
  /** Offsets for camera.setViewOffset(fullWidth, fullHeight, x, y, fullWidth, fullHeight). */
  viewOffsetX: number;
  viewOffsetY: number;
}

export interface InspectionFitOptions {
  yaw: number;
  pitch: number;
  /** Vertical field of view of the full canvas, in degrees. */
  fovDegrees: number;
  viewport: InspectionViewport;
  /** Fraction of the safe rectangle occupied by the projected bounds. */
  fill?: number;
  near?: number;
}

export interface InspectionFit {
  distance: number;
  center: InspectionPoint;
  /** Unit direction from the model center toward the camera. */
  eye: InspectionPoint;
  right: InspectionPoint;
  up: InspectionPoint;
}

/** CSS-pixel area clear of the inspection caption, tool strip and minimap. */
export function computeInspectionViewport(width: number, height: number): InspectionViewport {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw new RangeError('El viewport de inspección debe tener dimensiones positivas finitas.');
  const portrait = width <= 760 && height > width;
  const compact = height <= 600;
  const left = portrait ? 16 : compact ? 240 : 320;
  const right = portrait ? (height >= 600 ? 16 : 84) : compact || width <= 760 ? 84 : 124;
  const bottom = portrait ? Math.min(110, height * 0.2) : compact ? 24 : 32;
  // On a short portrait screen preserve a positive content area below the caption;
  // its right margin also reserves the tool strip when it cannot fit above it.
  const top = portrait ? Math.min(380, Math.max(80, height - bottom - 100)) : compact ? 80 : 96;
  const x = Math.min(left, Math.max(0, width - 1));
  const y = Math.min(top, Math.max(0, height - 1));
  const safeWidth = Math.max(1, width - x - Math.min(right, Math.max(0, width - x - 1)));
  const safeHeight = Math.max(1, height - y - Math.min(bottom, Math.max(0, height - y - 1)));
  return {
    x,
    y,
    width: safeWidth,
    height: safeHeight,
    fullWidth: width,
    fullHeight: height,
    viewOffsetX: width / 2 - (x + safeWidth / 2),
    viewOffsetY: height / 2 - (y + safeHeight / 2),
  };
}

/** Fit all eight physical bounds corners at the requested orbit orientation. */
export function fitInspectionBounds(
  bounds: InspectionBounds,
  { yaw, pitch, fovDegrees, viewport, fill = 0.9, near = 0.15 }: InspectionFitOptions,
): InspectionFit {
  const finite = [
    yaw,
    pitch,
    fovDegrees,
    fill,
    near,
    viewport.width,
    viewport.height,
    viewport.fullWidth,
    viewport.fullHeight,
    ...Object.values(bounds.min),
    ...Object.values(bounds.max),
  ];
  if (
    finite.some((value) => !Number.isFinite(value)) ||
    fovDegrees <= 0 ||
    fovDegrees >= 180 ||
    fill <= 0 ||
    fill > 1 ||
    near <= 0 ||
    viewport.width <= 0 ||
    viewport.height <= 0 ||
    viewport.fullWidth <= 0 ||
    viewport.fullHeight <= 0 ||
    bounds.min.x > bounds.max.x ||
    bounds.min.y > bounds.max.y ||
    bounds.min.z > bounds.max.z
  )
    throw new RangeError('Los bounds y la proyección de inspección deben ser válidos y finitos.');
  const center = {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2,
  };
  const sinYaw = Math.sin(yaw),
    cosYaw = Math.cos(yaw),
    sinPitch = Math.sin(pitch),
    cosPitch = Math.cos(pitch);
  const eye = { x: -sinYaw * cosPitch, y: sinPitch, z: cosYaw * cosPitch };
  const right = { x: cosYaw, y: 0, z: sinYaw };
  const up = { x: sinYaw * sinPitch, y: cosPitch, z: -cosYaw * sinPitch };
  const fullTanV = Math.tan((fovDegrees * Math.PI) / 360);
  const tanV = fullTanV * (viewport.height / viewport.fullHeight) * fill;
  const tanH =
    fullTanV *
    (viewport.fullWidth / viewport.fullHeight) *
    (viewport.width / viewport.fullWidth) *
    fill;
  let distance = near + 1e-6;
  for (const x of [bounds.min.x - center.x, bounds.max.x - center.x])
    for (const y of [bounds.min.y - center.y, bounds.max.y - center.y])
      for (const z of [bounds.min.z - center.z, bounds.max.z - center.z]) {
        const depth = x * eye.x + y * eye.y + z * eye.z;
        const horizontal = x * right.x + y * right.y + z * right.z;
        const vertical = x * up.x + y * up.y + z * up.z;
        distance = Math.max(
          distance,
          depth + Math.abs(horizontal) / tanH,
          depth + Math.abs(vertical) / tanV,
          depth + near + 1e-6,
        );
      }
  return { distance, center, eye, right, up };
}

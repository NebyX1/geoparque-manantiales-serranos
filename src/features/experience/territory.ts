import boundarySnapshot from '../../data/geography/boundary-path.json' with { type: 'json' };
import elevationSnapshot from '../../data/geography/territory-elevation.json' with { type: 'json' };

export interface TerritoryPoint {
  x: number;
  z: number;
}

// This is the already projected official contour, not an invented game outline.
const projected = [...boundarySnapshot.path.matchAll(/[ML](-?[\d.]+)\s+(-?[\d.]+)/g)].map(
  (match) => ({ x: Number(match[1]), z: Number(match[2]) }),
);
if (projected.length < 3) throw new Error('El contorno oficial del geoparque no es válido.');
const closing = projected.at(-1)!;
if (closing.x === projected[0]!.x && closing.z === projected[0]!.z) projected.pop();

export const territoryBoundary: readonly TerritoryPoint[] = Object.freeze(
  projected.map((point) => Object.freeze(point)),
);
export const territoryBounds = Object.freeze({ ...boundarySnapshot.bounds });
export const TERRITORY_BASE_HEIGHT = -9.5;
const EDGE_EPSILON = 0.000001;

function squareDistanceToSegment(x: number, z: number, a: TerritoryPoint, b: TerritoryPoint) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const length = dx * dx + dz * dz;
  const t = length ? Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / length)) : 0;
  const px = a.x + t * dx;
  const pz = a.z + t * dz;
  return { distance: (px - x) ** 2 + (pz - z) ** 2, x: px, z: pz };
}

/** Boundary points count as inside. Uses the geographic contour's concavities. */
export function containsTerritory(x: number, z: number): boolean {
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(z) ||
    x < territoryBounds.minX - EDGE_EPSILON ||
    x > territoryBounds.maxX + EDGE_EPSILON ||
    z < territoryBounds.minZ - EDGE_EPSILON ||
    z > territoryBounds.maxZ + EDGE_EPSILON
  ) {
    return false;
  }
  let inside = false;
  for (let i = 0, j = territoryBoundary.length - 1; i < territoryBoundary.length; j = i++) {
    const a = territoryBoundary[j]!;
    const b = territoryBoundary[i]!;
    const cross = (x - a.x) * (b.z - a.z) - (z - a.z) * (b.x - a.x);
    if (
      Math.abs(cross) < EDGE_EPSILON &&
      x >= Math.min(a.x, b.x) - EDGE_EPSILON &&
      x <= Math.max(a.x, b.x) + EDGE_EPSILON &&
      z >= Math.min(a.z, b.z) - EDGE_EPSILON &&
      z <= Math.max(a.z, b.z) + EDGE_EPSILON
    ) {
      return true;
    }
    if (a.z > z !== b.z > z && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/** Signed distance in scene units: positive inside, negative outside, zero at the edge. */
export function shoreDistance(x: number, z: number): number {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return Number.NEGATIVE_INFINITY;
  let closest = Infinity;
  for (let i = 0; i < territoryBoundary.length; i++) {
    closest = Math.min(
      closest,
      squareDistanceToSegment(
        x,
        z,
        territoryBoundary[i]!,
        territoryBoundary[(i + 1) % territoryBoundary.length]!,
      ).distance,
    );
  }
  const distance = Math.sqrt(closest);
  return distance < EDGE_EPSILON ? 0 : containsTerritory(x, z) ? distance : -distance;
}

function findInteriorSeed(): TerritoryPoint {
  const center = {
    x: (territoryBounds.minX + territoryBounds.maxX) / 2,
    z: (territoryBounds.minZ + territoryBounds.maxZ) / 2,
  };
  if (containsTerritory(center.x, center.z)) return center;
  for (let z = territoryBounds.minZ + 1; z < territoryBounds.maxZ; z += 2) {
    for (let x = territoryBounds.minX + 1; x < territoryBounds.maxX; x += 2) {
      if (containsTerritory(x, z)) return { x, z };
    }
  }
  throw new Error('El contorno del geoparque no contiene una superficie recorrible.');
}
const interiorSeed = findInteriorSeed();

function recoverOutside(x: number, z: number): TerritoryPoint {
  let closest = { distance: Infinity, x: interiorSeed.x, z: interiorSeed.z };
  for (let i = 0; i < territoryBoundary.length; i++) {
    const candidate = squareDistanceToSegment(
      x,
      z,
      territoryBoundary[i]!,
      territoryBoundary[(i + 1) % territoryBoundary.length]!,
    );
    if (candidate.distance < closest.distance) closest = candidate;
  }
  // Search locally before using the distant safe seed; this works at concave corners too.
  for (const radius of [0.08, 0.02, 0.002]) {
    for (let step = 0; step < 24; step++) {
      const angle = (step / 24) * Math.PI * 2;
      const point = {
        x: closest.x + Math.cos(angle) * radius,
        z: closest.z + Math.sin(angle) * radius,
      };
      if (containsTerritory(point.x, point.z)) return point;
    }
  }
  return { ...interiorSeed };
}

/**
 * Keeps walking inside the actual polygon, including concave inlets. If a previous
 * point is supplied the move stops at its first exit, rather than jumping across
 * a gap to a different peninsula. Teleports without a previous point use the
 * closest valid interior position. Published map markers themselves are unchanged.
 */
export function constrainToTerritory(
  x: number,
  z: number,
  fromX?: number,
  fromZ?: number,
): TerritoryPoint {
  const validPrevious =
    fromX !== undefined && fromZ !== undefined && containsTerritory(fromX, fromZ);
  if (!Number.isFinite(x) || !Number.isFinite(z)) {
    return validPrevious ? { x: fromX, z: fromZ } : { ...interiorSeed };
  }
  if (!validPrevious) return containsTerritory(x, z) ? { x, z } : recoverOutside(x, z);
  const dx = x - fromX;
  const dz = z - fromZ;
  const length = Math.hypot(dx, dz);
  if (length < EDGE_EPSILON) return { x: fromX, z: fromZ };
  const crossings: number[] = [];
  for (let i = 0; i < territoryBoundary.length; i++) {
    const a = territoryBoundary[i]!;
    const b = territoryBoundary[(i + 1) % territoryBoundary.length]!;
    const ex = b.x - a.x;
    const ez = b.z - a.z;
    const denominator = dx * ez - dz * ex;
    if (Math.abs(denominator) < 1e-12) continue;
    const ax = a.x - fromX;
    const az = a.z - fromZ;
    const t = (ax * ez - az * ex) / denominator;
    const u = (ax * dz - az * dx) / denominator;
    if (t > EDGE_EPSILON && t <= 1 && u >= -EDGE_EPSILON && u <= 1 + EDGE_EPSILON) {
      crossings.push(t);
    }
  }
  crossings.sort((a, b) => a - b);
  for (const crossing of crossings) {
    const after = Math.min(1, crossing + 0.00001 / length);
    if (containsTerritory(fromX + dx * after, fromZ + dz * after)) continue;
    const before = Math.max(0, crossing - 0.02 / length);
    const result = { x: fromX + dx * before, z: fromZ + dz * before };
    return containsTerritory(result.x, result.z) ? result : { x: fromX, z: fromZ };
  }
  return containsTerritory(x, z) ? { x, z } : { x: fromX, z: fromZ };
}

export const TERRITORY_VERTICAL_EXAGGERATION = elevationSnapshot.verticalExaggeration;
export const TERRITORY_HORIZONTAL_METERS_PER_UNIT = elevationSnapshot.horizontalMetersPerUnit;
export const territoryElevationSource = Object.freeze({
  provider: elevationSnapshot.source.provider,
  credit: elevationSnapshot.source.credit,
  formatUrl: elevationSnapshot.source.formatUrl,
  attributionUrl: elevationSnapshot.source.attributionUrl,
  retrievedAt: elevationSnapshot.source.retrievedAt,
  grid: elevationSnapshot.grid,
  verticalExaggeration: TERRITORY_VERTICAL_EXAGGERATION,
});

/** Sampled public elevation in meters, before display exaggeration. */
export function territoryElevation(x: number, z: number): number {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return 0;
  const grid = elevationSnapshot.grid;
  const bounds = elevationSnapshot.sceneBounds;
  const column = Math.max(
    0,
    Math.min(grid - 1, ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * (grid - 1)),
  );
  const row = Math.max(
    0,
    Math.min(grid - 1, ((z - bounds.minZ) / (bounds.maxZ - bounds.minZ)) * (grid - 1)),
  );
  const left = Math.floor(column),
    top = Math.floor(row);
  const right = Math.min(left + 1, grid - 1),
    bottom = Math.min(top + 1, grid - 1);
  const u = column - left,
    v = row - top;
  const a =
    elevationSnapshot.heights[top * grid + left]! * (1 - u) +
    elevationSnapshot.heights[top * grid + right]! * u;
  const b =
    elevationSnapshot.heights[bottom * grid + left]! * (1 - u) +
    elevationSnapshot.heights[bottom * grid + right]! * u;
  return a * (1 - v) + b * v;
}

/**
 * Geographic sampled relief, exaggerated six times for legibility. It is not a
 * local survey and does not resolve entrances, buildings or individual quarry cuts.
 * Outside the actual territory there is no walkable rectangular land plane.
 */
export function territoryHeight(x: number, z: number): number {
  if (!containsTerritory(x, z)) return TERRITORY_BASE_HEIGHT;
  return (
    (territoryElevation(x, z) * TERRITORY_VERTICAL_EXAGGERATION) /
    TERRITORY_HORIZONTAL_METERS_PER_UNIT
  );
}

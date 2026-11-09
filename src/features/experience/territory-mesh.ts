import * as THREE from 'three';
import {
  territoryBoundary,
  territoryHeight,
  TERRITORY_BASE_HEIGHT,
  type TerritoryPoint,
} from './territory';

export interface TerritoryGeometry {
  surface: THREE.BufferGeometry;
  sides: THREE.BufferGeometry;
  base: THREE.BufferGeometry;
  border: THREE.BufferGeometry;
}

type Triangle = readonly [TerritoryPoint, TerritoryPoint, TerritoryPoint];
const squaredLength = (a: TerritoryPoint, b: TerritoryPoint) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
const midpoint = (a: TerritoryPoint, b: TerritoryPoint) => ({
  x: (a.x + b.x) / 2,
  z: (a.z + b.z) / 2,
});
const cross = (a: TerritoryPoint, b: TerritoryPoint, c: TerritoryPoint) =>
  (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);

/**
 * Earcut follows the official concave coastline. Long-edge bisection adds interior
 * relief samples without a rectangular plane or triangles extending over inlets.
 * Shared edges get the same dyadic splits, avoiding cracks between terrain patches.
 */
export function createTerritoryGeometry(maxEdge = 2.5): TerritoryGeometry {
  if (!Number.isFinite(maxEdge) || maxEdge < 1 || maxEdge > 12) {
    throw new RangeError('La resolución del terreno debe estar entre 1 y 12 unidades.');
  }
  const contour = territoryBoundary.map((point) => new THREE.Vector2(point.x, point.z));
  const triangles = THREE.ShapeUtils.triangulateShape(contour, []);
  if (!triangles.length)
    throw new Error('No se pudo triangular el contorno oficial del geoparque.');
  const pending: Triangle[] = triangles.map((triangle) => [
    territoryBoundary[triangle[0]!]!,
    territoryBoundary[triangle[1]!]!,
    territoryBoundary[triangle[2]!]!,
  ]);
  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const vertexIds = new Map<string, number>();
  const grass = new THREE.Color('#97a96b');
  const meadow = new THREE.Color('#bac887');
  const stone = new THREE.Color('#a4a18a');
  const tint = new THREE.Color();
  const maxSquared = maxEdge * maxEdge;

  function vertex(point: TerritoryPoint): number {
    const key = `${point.x.toFixed(7)},${point.z.toFixed(7)}`;
    const existing = vertexIds.get(key);
    if (existing !== undefined) return existing;
    const index = vertices.length / 3;
    const height = territoryHeight(point.x, point.z);
    vertices.push(point.x, height, point.z);
    const variation =
      (Math.sin(point.x * 0.14 + point.z * 0.09) + Math.cos(point.z * 0.17 - point.x * 0.05) + 2) /
      4;
    tint.copy(grass).lerp(meadow, variation * 0.56);
    if (height > 8) tint.lerp(stone, Math.min(0.65, (height - 8) / 12));
    colors.push(tint.r, tint.g, tint.b);
    vertexIds.set(key, index);
    return index;
  }

  while (pending.length) {
    const [a, b, c] = pending.pop()!;
    const ab = squaredLength(a, b);
    const bc = squaredLength(b, c);
    const ca = squaredLength(c, a);
    if (Math.max(ab, bc, ca) > maxSquared) {
      if (ab >= bc && ab >= ca) {
        const middle = midpoint(a, b);
        pending.push([a, middle, c], [middle, b, c]);
      } else if (bc >= ca) {
        const middle = midpoint(b, c);
        pending.push([a, b, middle], [a, middle, c]);
      } else {
        const middle = midpoint(c, a);
        pending.push([a, b, middle], [middle, b, c]);
      }
      if (pending.length + indices.length / 3 > 500_000) {
        throw new Error('La triangulación del geoparque superó el presupuesto de geometría.');
      }
      continue;
    }
    if (Math.abs(cross(a, b, c)) < 1e-12) continue;
    // Positive x/z cross points down in Three's x/y/z coordinates.
    if (cross(a, b, c) > 0) indices.push(vertex(a), vertex(c), vertex(b));
    else indices.push(vertex(a), vertex(b), vertex(c));
  }
  const surface = new THREE.BufferGeometry();
  surface.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  surface.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  surface.setIndex(indices);
  surface.computeVertexNormals();
  surface.computeBoundingBox();
  surface.computeBoundingSphere();

  const sideVertices: number[] = [];
  const sideColors: number[] = [];
  const sideIndices: number[] = [];
  const borderVertices: number[] = [];
  const topColor = new THREE.Color('#8c9274');
  const bottomColor = new THREE.Color('#344e47');
  const winding = territoryBoundary.reduce((sum, a, i) => {
    const b = territoryBoundary[(i + 1) % territoryBoundary.length]!;
    return sum + a.x * b.z - b.x * a.z;
  }, 0);
  for (const point of territoryBoundary) {
    const height = territoryHeight(point.x, point.z);
    sideVertices.push(point.x, height, point.z, point.x, TERRITORY_BASE_HEIGHT, point.z);
    sideColors.push(
      topColor.r,
      topColor.g,
      topColor.b,
      bottomColor.r,
      bottomColor.g,
      bottomColor.b,
    );
  }
  for (let i = 0; i < territoryBoundary.length; i++) {
    const next = (i + 1) % territoryBoundary.length;
    const top = i * 2;
    const nextTop = next * 2;
    if (winding > 0) sideIndices.push(top, nextTop, top + 1, top + 1, nextTop, nextTop + 1);
    else sideIndices.push(top, top + 1, nextTop, top + 1, nextTop + 1, nextTop);
    const a = territoryBoundary[i]!;
    const b = territoryBoundary[next]!;
    borderVertices.push(
      a.x,
      territoryHeight(a.x, a.z) + 0.065,
      a.z,
      b.x,
      territoryHeight(b.x, b.z) + 0.065,
      b.z,
    );
  }
  const sides = new THREE.BufferGeometry();
  sides.setAttribute('position', new THREE.Float32BufferAttribute(sideVertices, 3));
  sides.setAttribute('color', new THREE.Float32BufferAttribute(sideColors, 3));
  sides.setIndex(sideIndices);
  sides.computeVertexNormals();
  const base = new THREE.BufferGeometry();
  base.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      territoryBoundary.flatMap((point) => [point.x, TERRITORY_BASE_HEIGHT, point.z]),
      3,
    ),
  );
  base.setIndex(
    triangles.flatMap((triangle) => {
      const a = territoryBoundary[triangle[0]!]!;
      const b = territoryBoundary[triangle[1]!]!;
      const c = territoryBoundary[triangle[2]!]!;
      return cross(a, b, c) > 0 ? triangle : [triangle[0]!, triangle[2]!, triangle[1]!];
    }),
  );
  base.computeVertexNormals();
  const border = new THREE.BufferGeometry();
  border.setAttribute('position', new THREE.Float32BufferAttribute(borderVertices, 3));
  return { surface, sides, base, border };
}

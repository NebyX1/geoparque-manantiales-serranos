import { required } from '../guards';
import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
export type Point3 = [number, number, number];
type Ellipsoid = {
  kind: 'ellipsoid';
  center: Point3;
  radii: Point3;
  angle: number;
  blend: number;
  subtract: boolean;
  bounds: [Point3, Point3];
};
type Capsule = {
  kind: 'capsule';
  a: Point3;
  b: Point3;
  ra: number;
  rb: number;
  blend: number;
  subtract: boolean;
  bounds: [Point3, Point3];
};
export type SculptPrimitive = Ellipsoid | Capsule;
function boundsFor(points: Point3[], padding: number): [Point3, Point3] {
  const min: Point3 = [Infinity, Infinity, Infinity],
    max: Point3 = [-Infinity, -Infinity, -Infinity];
  for (const point of points)
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(required(min[axis]), required(point[axis]) - padding);
      max[axis] = Math.max(required(max[axis]), required(point[axis]) + padding);
    }
  return [min, max];
}
export function ellipsoid(
  center: Point3,
  radii: Point3,
  angle = 0,
  blend = 0.2,
  subtract = false,
): Ellipsoid {
  const c = Math.cos(angle),
    s = Math.sin(angle);
  const ex = Math.hypot(required(radii[0]) * c, required(radii[1]) * s) + blend;
  const ey = Math.hypot(required(radii[0]) * s, required(radii[1]) * c) + blend;
  const ez = required(radii[2]) + blend;
  return {
    kind: 'ellipsoid',
    center,
    radii,
    angle,
    blend,
    subtract,
    bounds: [
      [required(center[0]) - ex, required(center[1]) - ey, required(center[2]) - ez],
      [required(center[0]) + ex, required(center[1]) + ey, required(center[2]) + ez],
    ],
  };
}
export function capsule(
  a: Point3,
  b: Point3,
  ra: number,
  rb = ra,
  blend = 0.16,
  subtract = false,
): Capsule {
  const radius = Math.max(ra, rb) + blend;
  return { kind: 'capsule', a, b, ra, rb, blend, subtract, bounds: boundsFor([a, b], radius) };
}
function smoothMin(a: number, b: number, k: number) {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
function distanceToPrimitive(part: SculptPrimitive, x: number, y: number, z: number) {
  const [min, max] = part.bounds;
  if (
    x < required(min[0]) ||
    y < required(min[1]) ||
    z < required(min[2]) ||
    x > required(max[0]) ||
    y > required(max[1]) ||
    z > required(max[2])
  )
    return 100;
  if (part.kind === 'ellipsoid') {
    const dx = x - required(part.center[0]),
      dy = y - required(part.center[1]),
      dz = z - required(part.center[2]);
    const c = Math.cos(part.angle),
      s = Math.sin(part.angle);
    const px = c * dx + s * dy,
      py = -s * dx + c * dy;
    const ax = px / required(part.radii[0]),
      ay = py / required(part.radii[1]),
      az = dz / required(part.radii[2]);
    const k0 = Math.sqrt(ax * ax + ay * ay + az * az);
    if (k0 < 1e-7) return -Math.min(...part.radii);
    const bx = px / required(part.radii[0]) ** 2,
      by = py / required(part.radii[1]) ** 2,
      bz = dz / required(part.radii[2]) ** 2;
    const k1 = Math.sqrt(bx * bx + by * by + bz * bz);
    return k1 > 1e-7 ? (k0 * (k0 - 1)) / k1 : k0 - 1;
  }
  const abx = required(part.b[0]) - required(part.a[0]),
    aby = required(part.b[1]) - required(part.a[1]),
    abz = required(part.b[2]) - required(part.a[2]);
  const pax = x - required(part.a[0]),
    pay = y - required(part.a[1]),
    paz = z - required(part.a[2]);
  const length2 = abx * abx + aby * aby + abz * abz;
  const t = THREE.MathUtils.clamp((pax * abx + pay * aby + paz * abz) / length2, 0, 1);
  const dx = pax - abx * t,
    dy = pay - aby * t,
    dz = paz - abz * t;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - THREE.MathUtils.lerp(part.ra, part.rb, t);
}
/**
 * Extract a single closed sculpt from smooth SDF unions. Unlike intersecting
 * primitive meshes, shoulders, neck and joints share one continuous surface.
 */
export function sculptGeometry(
  primitives: SculptPrimitive[],
  minPoint: Point3,
  maxPoint: Point3,
  resolution = 96,
) {
  const size: Point3 = [
    required(maxPoint[0]) - required(minPoint[0]),
    required(maxPoint[1]) - required(minPoint[1]),
    required(maxPoint[2]) - required(minPoint[2]),
  ];
  const center: Point3 = [
    (required(maxPoint[0]) + required(minPoint[0])) / 2,
    (required(maxPoint[1]) + required(minPoint[1])) / 2,
    (required(maxPoint[2]) + required(minPoint[2])) / 2,
  ];
  const dummyMaterial = new THREE.MeshBasicMaterial();
  const marching = new MarchingCubes(resolution, dummyMaterial, false, false, 180000);
  marching.isolation = 0;
  const field = marching.field;
  // Only visit the voxels inside each primitive's influence. Primitive order and
  // double precision are preserved, so the union/cut result stays the same.
  const distances = new Float64Array(field.length).fill(1000);
  const coordinates = size.map((extent, axis) =>
    Float64Array.from(
      { length: resolution },
      (_, i) => required(center[axis]) + (((i / resolution) * 2 - 1) * extent) / 2,
    ),
  );
  for (const part of primitives) {
    const low = required(part.bounds[0]).map((value, axis) =>
      Math.max(
        0,
        Math.floor(((value - required(minPoint[axis])) / required(size[axis])) * resolution),
      ),
    );
    const high = required(part.bounds[1]).map((value, axis) =>
      Math.min(
        resolution - 1,
        Math.ceil(((value - required(minPoint[axis])) / required(size[axis])) * resolution),
      ),
    );
    for (let iz = required(low[2]); iz <= required(high[2]); iz++) {
      for (let iy = required(low[1]); iy <= required(high[1]); iy++) {
        let index = required(low[0]) + iy * resolution + iz * resolution * resolution;
        for (let ix = required(low[0]); ix <= required(high[0]); ix++, index++) {
          const d = distanceToPrimitive(
            part,
            required(required(coordinates[0])[ix]),
            required(required(coordinates[1])[iy]),
            required(required(coordinates[2])[iz]),
          );
          if (d === 100) continue;
          distances[index] = part.subtract
            ? -smoothMin(-required(distances[index]), d, part.blend)
            : smoothMin(required(distances[index]), d, part.blend);
        }
      }
    }
  }
  for (let i = 0; i < field.length; i++) field[i] = -required(distances[i]);
  marching.update();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(marching.positionArray.slice(0, marching.count * 3), 3),
  );
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(marching.normalArray.slice(0, marching.count * 3), 3),
  );
  geometry.applyMatrix4(
    new THREE.Matrix4().makeScale(
      required(size[0]) / 2,
      required(size[1]) / 2,
      required(size[2]) / 2,
    ),
  );
  geometry.translate(...center);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  projectStoneUV(geometry);
  marching.geometry.dispose();
  dummyMaterial.dispose();
  return geometry;
}
/** World-scale box projection gives the procedural stone a stable grain without image assets. */
export function projectStoneUV(geometry: THREE.BufferGeometry, scale = 0.45) {
  const position = geometry.getAttribute('position'),
    normal = geometry.getAttribute('normal');
  if (!normal) geometry.computeVertexNormals();
  const normals = geometry.getAttribute('normal'),
    uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i),
      y = position.getY(i),
      z = position.getZ(i);
    const nx = Math.abs(normals.getX(i)),
      ny = Math.abs(normals.getY(i)),
      nz = Math.abs(normals.getZ(i));
    let u: number, v: number;
    if (ny >= nx && ny >= nz) {
      u = x;
      v = z;
    } else if (nx >= nz) {
      u = z;
      v = y;
    } else {
      u = x;
      v = y;
    }
    uv[i * 2] = u * scale;
    uv[i * 2 + 1] = v * scale;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geometry;
}

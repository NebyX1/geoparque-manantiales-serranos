import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import samples from './terrain-samples.json';

export interface Ground {
  height: (x: number, z: number) => number;
  peak: THREE.Vector3;
  width: number;
  depth: number;
}

export function rockNoise(x: number, y: number, z: number): number {
  const ix = Math.floor(x),
    iy = Math.floor(y),
    iz = Math.floor(z);
  const smooth = (v: number) => v * v * (3 - 2 * v);
  const tx = smooth(x - ix),
    ty = smooth(y - iy),
    tz = smooth(z - iz);
  const hash = (a: number, b: number, c: number) => {
    const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  };
  const layer = (k: number) =>
    THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(hash(ix, iy, k), hash(ix + 1, iy, k), tx),
      THREE.MathUtils.lerp(hash(ix, iy + 1, k), hash(ix + 1, iy + 1, k), tx),
      ty,
    );
  return THREE.MathUtils.lerp(layer(iz), layer(iz + 1), tz);
}

/** Per-model ownership: no global material, geometry or texture cache. */
export class Diorama {
  readonly group = new THREE.Group();
  private readonly batches = new Map<string, THREE.BufferGeometry[]>();
  private readonly colors = new Map<string, THREE.MeshStandardMaterial>();

  material(color: string): THREE.MeshStandardMaterial {
    let material = this.colors.get(color);
    if (!material) {
      material = new THREE.MeshStandardMaterial({ color, roughness: 0.92 });
      material.name = color === '#568d91' ? 'Agua del paisaje' : `Material ${color}`;
      this.colors.set(color, material);
    }
    return material;
  }

  /** Offline authoring of a closed rock volume with an actual subtractive cavity. */
  sculptRock(
    field: (x: number, y: number, z: number) => number,
    center: THREE.Vector3,
    halfSize: THREE.Vector3,
    color = '#949787',
    resolution = 64,
  ): void {
    const material = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 1,
    });
    const volume = new MarchingCubes(resolution, material, false, true, 100_000);
    volume.isolation = 0;
    const base = new THREE.Color(color);
    for (let z = 0; z < resolution; z++)
      for (let y = 0; y < resolution; y++)
        for (let x = 0; x < resolution; x++) {
          const px = ((x / resolution) * 2 - 1) * halfSize.x + center.x;
          const py = ((y / resolution) * 2 - 1) * halfSize.y + center.y;
          const pz = ((z / resolution) * 2 - 1) * halfSize.z + center.z;
          const i = z * resolution * resolution + y * resolution + x;
          volume.field[i] = -field(px, py, pz);
          const patch = rockNoise(px * 2.1, py * 2.1, pz * 2.1);
          const shade = base.clone().multiplyScalar(0.85 + patch * 0.18);
          if (py < 0.8 || patch > 0.65) shade.lerp(new THREE.Color('#60734e'), 0.2);
          volume.palette[i * 3] = shade.r;
          volume.palette[i * 3 + 1] = shade.g;
          volume.palette[i * 3 + 2] = shade.b;
        }
    volume.update();
    const count = volume.geometry.drawRange.count;
    if (!Number.isFinite(count) || count < 3 || count >= 100_000 * 3)
      throw new Error('Closed rock sculpture exceeds mesh budget');
    const geometry = new THREE.BufferGeometry();
    for (const key of ['position', 'normal', 'color']) {
      const attribute = volume.geometry.getAttribute(key);
      geometry.setAttribute(
        key,
        new THREE.Float32BufferAttribute(attribute.array.slice(0, count * 3), 3),
      );
    }
    geometry.scale(halfSize.x, halfSize.y, halfSize.z);
    geometry.translate(center.x, center.y, center.z);
    geometry.normalizeNormals();
    volume.geometry.dispose();
    const colors = geometry.getAttribute('color');
    const bytes = new Uint8Array(colors.count * 3);
    for (let i = 0; i < colors.count; i++)
      for (let channel = 0; channel < 3; channel++)
        bytes[i * 3 + channel] = Math.round(
          THREE.MathUtils.clamp(colors.array[i * 3 + channel]!, 0, 1) * 255,
        );
    geometry.setAttribute('color', new THREE.Uint8BufferAttribute(bytes, 3, true));
    const compact = mergeVertices(geometry, 0.0001);
    geometry.dispose();
    const mesh = new THREE.Mesh(compact, material);
    mesh.castShadow = mesh.receiveShadow = true;
    this.group.add(mesh);
    this.group.userData.closedRockSculpture = true;
  }

  add(
    geometry: THREE.BufferGeometry,
    color: string,
    position = new THREE.Vector3(),
    rotation = new THREE.Euler(),
    scale = new THREE.Vector3(1, 1, 1),
  ): void {
    const matrix = new THREE.Matrix4().compose(
      position,
      new THREE.Quaternion().setFromEuler(rotation),
      scale,
    );
    geometry.applyMatrix4(matrix);
    // Equal attribute/index layouts keep static material batching deterministic.
    geometry.deleteAttribute('uv');
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) geometry.dispose();
    const list = this.batches.get(color) ?? [];
    list.push(flat);
    this.batches.set(color, list);
  }

  box(
    w: number,
    h: number,
    d: number,
    color: string,
    x: number,
    y: number,
    z: number,
    yaw = 0,
  ): void {
    this.add(
      new THREE.BoxGeometry(w, h, d),
      color,
      new THREE.Vector3(x, y + h / 2, z),
      new THREE.Euler(0, yaw, 0),
    );
  }

  line(points: THREE.Vector3[], radius: number, color: string): void {
    if (points.length < 2) return;
    this.add(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        Math.max(8, points.length * 3),
        radius,
        5,
        false,
      ),
      color,
    );
  }

  beam(
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    color: string,
    endRadius = radius,
  ): void {
    const direction = b.clone().sub(a);
    const geometry = new THREE.CylinderGeometry(endRadius, radius, direction.length(), 7);
    const rotation = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    );
    geometry.applyQuaternion(rotation);
    this.add(geometry, color, a.clone().add(b).multiplyScalar(0.5));
  }

  rock(
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    color = '#929286',
    seed = 1,
  ): void {
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const p = geometry.getAttribute('position');
    // Coherent broad fractures, not a stack of spherical hill primitives.
    for (let i = 0; i < p.count; i++) {
      const px = p.getX(i),
        py = p.getY(i),
        pz = p.getZ(i);
      const f = 1 + Math.sin(px * 2.2 + pz * 3.1 + seed) * 0.09;
      p.setXYZ(i, px * f, Math.max(-0.78, py * f), pz * f);
    }
    geometry.computeVertexNormals();
    this.add(
      geometry,
      color,
      new THREE.Vector3(x, y + sy * 0.65, z),
      new THREE.Euler(0.08, seed * 0.7, 0.04),
      new THREE.Vector3(sx, sy, sz),
    );
  }

  tree(
    x: number,
    y: number,
    z: number,
    size = 1,
    type: 'native' | 'ombu' | 'eucalyptus' = 'native',
    seed = 1,
  ): void {
    const ombu = type === 'ombu';
    if (ombu) {
      const positions: number[] = [];
      const ringCount = 13,
        segments = 40;
      const points: THREE.Vector3[][] = Array.from({ length: ringCount }, (_, row) => {
        const height = row / (ringCount - 1),
          radius = 0.32 + 0.54 * Math.exp(-height * 3.6);
        return Array.from({ length: segments }, (_, i) => {
          const angle = (i / segments) * Math.PI * 2;
          const lobes =
            1 + Math.cos(angle * 5 + seed) * 0.075 + Math.sin(angle * 9 + height * 2) * 0.025;
          return new THREE.Vector3(
            x + Math.cos(angle) * size * radius * lobes + Math.sin(height * 2) * size * 0.09,
            y + height * size,
            z + Math.sin(angle) * size * radius * lobes * 0.86,
          );
        });
      });
      for (let row = 0; row < ringCount - 1; row++)
        for (let i = 0; i < segments; i++) {
          const a = points[row]![i]!,
            b = points[row]![(i + 1) % segments]!,
            c = points[row + 1]![(i + 1) % segments]!,
            e = points[row + 1]![i]!;
          for (const p of [a, b, c, a, c, e]) positions.push(p.x, p.y, p.z);
        }
      const base = new THREE.BufferGeometry();
      base.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const smooth = mergeVertices(base, 0.0001);
      base.dispose();
      smooth.computeVertexNormals();
      this.add(smooth, '#817d65');
      for (let i = 0; i < 5; i++) {
        const angle = i * 2.399 + seed,
          spread = size * (0.85 + (i % 2) * 0.23);
        const tip = new THREE.Vector3(
          x + Math.cos(angle) * spread,
          y + size * (1.85 + (i % 3) * 0.17),
          z + Math.sin(angle) * spread,
        );
        this.line(
          [
            new THREE.Vector3(
              x + Math.cos(angle) * size * 0.18,
              y + size * 0.45,
              z + Math.sin(angle) * size * 0.18,
            ),
            new THREE.Vector3(
              x + Math.cos(angle + 0.65) * size * 0.4,
              y + size * 1.1,
              z + Math.sin(angle + 0.65) * size * 0.4,
            ),
            new THREE.Vector3(
              x + Math.cos(angle - 0.2) * size * 0.42,
              y + size * 1.5,
              z + Math.sin(angle - 0.2) * size * 0.42,
            ),
            tip,
          ],
          size * (i % 2 ? 0.14 : 0.18),
          '#817d65',
        );
        this.add(
          new THREE.IcosahedronGeometry(1, 1),
          i % 2 ? '#536d43' : '#64794b',
          tip.clone().add(new THREE.Vector3(0, size * 0.22, 0)),
          new THREE.Euler(0, angle, 0),
          new THREE.Vector3(size * 0.85, size * 0.36, size * 0.67),
        );
      }
      return;
    }
    const tall = type === 'eucalyptus';
    const height = size * (tall ? 2.8 : 1.8);
    const trunk = '#726d58';
    const origin = new THREE.Vector3(x, y, z);
    const fork = new THREE.Vector3(x + size * 0.07, y + height * 0.68, z);
    this.beam(origin, fork, size * 0.1, trunk, size * 0.055);
    for (let i = 0; i < (tall ? 3 : 4); i++) {
      const a = seed + i * 2.399;
      const spread = size * (tall ? 0.37 : 0.52);
      const tip = new THREE.Vector3(
        x + Math.cos(a) * spread,
        y + height * (0.88 + (i % 2) * 0.12),
        z + Math.sin(a) * spread,
      );
      this.beam(fork, tip, size * 0.045, trunk, size * 0.025);
      this.add(
        new THREE.IcosahedronGeometry(1, 1),
        i % 2 ? '#536d43' : '#64794b',
        tip,
        new THREE.Euler(0, a, 0),
        new THREE.Vector3(size * (tall ? 0.47 : 0.67), size * (tall ? 0.7 : 0.55), size * 0.6),
      );
    }
  }

  roof(w: number, h: number, d: number, color: string, x: number, y: number, z: number): void {
    const shape = new THREE.Shape()
      .moveTo(-w / 2, 0)
      .lineTo(0, h)
      .lineTo(w / 2, 0)
      .closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
    geometry.translate(0, 0, -d / 2);
    this.add(geometry, color, new THREE.Vector3(x, y, z));
  }

  path(points: Array<[number, number]>, ground: Ground, width = 0.12, color = '#b3a17a'): void {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, z]) => new THREE.Vector3(x, ground.height(x, z) + 0.018, z)),
    );
    const positions: number[] = [];
    const n = 200;
    const edges = Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n,
        p = curve.getPoint(t),
        tangent = curve.getTangent(t).setY(0).normalize();
      const side = new THREE.Vector3(tangent.z, 0, -tangent.x).multiplyScalar(width / 2);
      return [p.clone().add(side), p.clone().sub(side)] as const;
    });
    for (let i = 0; i < n; i++) {
      const a = edges[i]!,
        b = edges[i + 1]!;
      for (const point of [a[0], b[1], b[0], a[0], a[1], b[1]])
        positions.push(point.x, ground.height(point.x, point.z) + 0.025, point.z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    this.add(geometry, color);
  }

  finish(): THREE.Group {
    for (const [color, geometries] of this.batches) {
      const merged = mergeGeometries(geometries, false);
      const geometry = merged ? mergeVertices(merged, 0.00001) : null;
      merged?.dispose();
      geometries.forEach((part) => part.dispose());
      if (!geometry) throw new Error(`Unable to batch natural miniature ${this.group.name}`);
      const mesh = new THREE.Mesh(geometry, this.material(color));
      mesh.castShadow = mesh.receiveShadow = true;
      this.group.add(mesh);
    }
    this.batches.clear();
    return this.group;
  }
}

export function measuredGround(
  diorama: Diorama,
  id: number,
  exaggeration = 1.65,
  shape?: (x: number, z: number, y: number) => number,
): Ground {
  const sample = (samples as Record<string, (typeof samples)['2']>)[String(id)];
  if (!sample) throw new RangeError(`No measured terrain for GMS-${id}`);
  const width = 12,
    depth = (sample.depthMeters / sample.widthMeters) * width;
  const vertical = (width / sample.widthMeters) * exaggeration;
  const heights = sample.heights.map((value, i) => {
    const y = (value - sample.minimum) * vertical + 0.16;
    const x = ((i % sample.grid) / (sample.grid - 1) - 0.5) * width;
    const z = (Math.floor(i / sample.grid) / (sample.grid - 1) - 0.5) * depth;
    return shape ? shape(x, z, y) : y;
  });
  const geometry = new THREE.PlaneGeometry(width, depth, sample.grid - 1, sample.grid - 1);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.getAttribute('position');
  const color: number[] = [];
  const green = new THREE.Color('#7f8d57'),
    pale = new THREE.Color('#a2a16d');
  const peak = new THREE.Vector3();
  let max = -Infinity;
  for (let i = 0; i < position.count; i++) {
    position.setY(i, heights[i]!);
    const ratio =
      (sample.heights[i]! - sample.minimum) / Math.max(1, sample.maximum - sample.minimum);
    const shade = green.clone().lerp(pale, ratio * 0.5 + Math.sin(i * 0.91) * 0.035);
    color.push(shade.r, shade.g, shade.b);
    if (heights[i]! > max) {
      max = heights[i]!;
      peak.set(position.getX(i), heights[i]!, position.getZ(i));
    }
  }
  geometry.computeVertexNormals();
  geometry.normalizeNormals();
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
  const terrainMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  terrainMaterial.name = 'Relieve numerico Terrarium';
  const mesh = new THREE.Mesh(geometry, terrainMaterial);
  mesh.receiveShadow = true;
  diorama.group.add(mesh);
  const height = (x: number, z: number): number => {
    const fx = THREE.MathUtils.clamp((x / width + 0.5) * (sample.grid - 1), 0, sample.grid - 1);
    const fz = THREE.MathUtils.clamp((z / depth + 0.5) * (sample.grid - 1), 0, sample.grid - 1);
    const ix = Math.min(sample.grid - 2, Math.floor(fx)),
      iz = Math.min(sample.grid - 2, Math.floor(fz));
    const tx = fx - ix,
      tz = fz - iz;
    return THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(
        heights[iz * sample.grid + ix]!,
        heights[iz * sample.grid + ix + 1]!,
        tx,
      ),
      THREE.MathUtils.lerp(
        heights[(iz + 1) * sample.grid + ix]!,
        heights[(iz + 1) * sample.grid + ix + 1]!,
        tx,
      ),
      tz,
    );
  };
  // The cut sides follow the DEM edge, not a box intersecting the hills.
  const edge: Array<[number, number]> = [];
  for (let i = 0; i < sample.grid; i++)
    edge.push([-width / 2 + (i / (sample.grid - 1)) * width, -depth / 2]);
  for (let i = 1; i < sample.grid; i++)
    edge.push([width / 2, -depth / 2 + (i / (sample.grid - 1)) * depth]);
  for (let i = sample.grid - 2; i >= 0; i--)
    edge.push([-width / 2 + (i / (sample.grid - 1)) * width, depth / 2]);
  for (let i = sample.grid - 2; i >= 0; i--)
    edge.push([-width / 2, -depth / 2 + (i / (sample.grid - 1)) * depth]);
  const sides: number[] = [];
  for (let i = 0; i < edge.length; i++) {
    const a = edge[i]!,
      b = edge[(i + 1) % edge.length]!;
    const corners = [
      [a[0], 0, a[1]],
      [a[0], height(...a), a[1]],
      [b[0], height(...b), b[1]],
      [b[0], 0, b[1]],
    ];
    for (const k of [0, 1, 2, 0, 2, 3]) sides.push(...corners[k]!);
  }
  const walls = new THREE.BufferGeometry();
  walls.setAttribute('position', new THREE.Float32BufferAttribute(sides, 3));
  walls.computeVertexNormals();
  diorama.add(walls, '#76654e');
  diorama.box(width, 0.04, depth, '#76654e', 0, 0, 0);
  diorama.group.userData.terrain = {
    center: sample.center,
    widthMeters: sample.widthMeters,
    depthMeters: sample.depthMeters,
    source: 'Mapzen / Tilezen Terrain Tiles',
    exaggeration,
    survey: false,
  };
  return { height, peak, width, depth };
}

/** A detail-stage is explicitly not a measured whole-site terrain reconstruction. */
export function detailGround(diorama: Diorama, color = '#87915e'): Ground {
  diorama.box(11.6, 0.22, 9.6, '#76654e', 0, 0, 0);
  diorama.box(11.6, 0.05, 9.6, color, 0, 0.22, 0);
  return { height: () => 0.27, peak: new THREE.Vector3(0, 0.27, 0), width: 11.6, depth: 9.6 };
}

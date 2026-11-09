import * as THREE from 'three';
import data from './cuervos-river.json';
import elevations from './terrain-samples.json';
import { Diorama } from './naturalGeometry';
import { createArequita } from '../reference/arequita';

type Polygon = { outer: number[][]; holes: number[][][] };
type Vec = { x: number; z: number };
const smooth = (v: number) => {
  const t = THREE.MathUtils.clamp(v, 0, 1);
  return t * t * (3 - 2 * t);
};

function plane(
  d: Diorama,
  w: number,
  depth: number,
  height: (x: number, z: number) => number,
  resolution = 96,
) {
  const geometry = new THREE.PlaneGeometry(w, depth, resolution, resolution);
  geometry.rotateX(-Math.PI / 2);
  const p = geometry.getAttribute('position');
  for (let i = 0; i < p.count; i++) p.setY(i, height(p.getX(i), p.getZ(i)));
  geometry.computeVertexNormals();
  d.add(geometry, '#879366');
  const positions: number[] = [];
  const edge: Vec[] = [];
  for (let i = 0; i <= resolution; i++)
    edge.push({ x: -w / 2 + (i * w) / resolution, z: -depth / 2 });
  for (let i = 1; i <= resolution; i++)
    edge.push({ x: w / 2, z: -depth / 2 + (i * depth) / resolution });
  for (let i = resolution - 1; i >= 0; i--)
    edge.push({ x: -w / 2 + (i * w) / resolution, z: depth / 2 });
  for (let i = resolution - 1; i >= 0; i--)
    edge.push({ x: -w / 2, z: -depth / 2 + (i * depth) / resolution });
  for (let i = 0; i < edge.length; i++) {
    const a = edge[i]!,
      b = edge[(i + 1) % edge.length]!;
    for (const v of [
      [a.x, 0, a.z],
      [b.x, 0, b.z],
      [b.x, height(b.x, b.z), b.z],
      [a.x, 0, a.z],
      [b.x, height(b.x, b.z), b.z],
      [a.x, height(a.x, a.z), a.z],
    ])
      positions.push(...v);
  }
  walls(d, positions, '#766c56');
  d.box(w, 0.04, depth, '#766c56', 0, 0, 0);
}
function walls(d: Diorama, positions: number[], color: string) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(
    g,
    new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide }),
  );
  mesh.castShadow = mesh.receiveShadow = true;
  d.group.add(mesh);
}
function shapeGeometry(polygon: Polygon) {
  const shape = new THREE.Shape(polygon.outer.map(([x, z]) => new THREE.Vector2(x!, -z!)));
  polygon.holes.forEach((hole) =>
    shape.holes.push(new THREE.Path(hole.map(([x, z]) => new THREE.Vector2(x!, -z!)))),
  );
  const geometry = new THREE.ShapeGeometry(shape);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function slab(
  d: Diorama,
  x: number,
  y: number,
  z: number,
  w: number,
  depth: number,
  rise: number,
  seed: number,
) {
  const outline = [
    [-0.5, -0.25],
    [-0.27, -0.5],
    [0.32, -0.42],
    [0.52, -0.13],
    [0.44, 0.37],
    [0.03, 0.5],
    [-0.42, 0.33],
  ];
  const positions: number[] = [],
    top = outline.map(([px, pz], i) => [
      px! * w,
      rise * (0.7 + 0.15 * Math.sin(seed + i * 2.1)),
      pz! * depth,
    ]);
  for (let i = 0; i < top.length; i++) {
    const a = top[i]!,
      b = top[(i + 1) % top.length]!;
    for (const p of [
      [0, rise * 0.85, 0],
      b,
      a,
      [a[0]!, -0.16, a[2]!],
      a,
      b,
      [a[0]!, -0.16, a[2]!],
      b,
      [b[0]!, -0.16, b[2]!],
    ])
      positions.push(...p);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  d.add(
    geometry,
    seed % 2 ? '#91978b' : '#a1a392',
    new THREE.Vector3(x, y, z),
    new THREE.Euler(0, seed * 0.21, 0),
  );
}

function oldDam(d: Diorama) {
  const width = (z: number) => 1.7 + 0.28 * Math.cos(z * 0.75) + 0.18 * Math.sin(z * 1.3);
  const center = (z: number) => 0.2 * Math.sin(z * 0.6);
  const level = (z: number) =>
    z < -0.45 ? 0.94 : z > 1.3 ? 0.32 : THREE.MathUtils.lerp(0.94, 0.32, smooth((z + 0.45) / 1.75));
  const height = (x: number, z: number) => {
    const distance = Math.abs(x - center(z)) - width(z),
      y = level(z);
    if (distance < -0.2) return y - 0.12;
    if (distance < 0) return y - 0.12 + 0.115 * smooth((distance + 0.2) / 0.2);
    return (
      y +
      0.008 +
      0.34 * smooth(distance / 0.75) +
      0.1 * Math.max(0, distance - 0.8) +
      0.025 * Math.sin(x * 4 + z * 3) * smooth(distance / 0.4)
    );
  };
  plane(d, 11.6, 9.6, height);
  const ledges = [
    [-1.4, -0.04, 1.25, 0.65, 0.13],
    [-0.25, 0.12, 1.2, 0.74, 0.11],
    [1.12, 0.03, 1.65, 0.66, 0.14],
    [-1.05, 0.76, 1.7, 0.71, 0.12],
    [0.65, 0.83, 1.25, 0.8, 0.12],
    [1.6, 0.95, 0.8, 0.6, 0.09],
  ];
  const positions: number[] = [];
  const colors: number[] = [];
  const up = new THREE.Color('#62867a'),
    foam = new THREE.Color('#becfc2');
  const rows = 100,
    columns = 24;
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < columns; col++) {
      const vertex = (r: number, c: number) => {
        const z = -4.8 + (r * 9.6) / rows,
          x = center(z) + ((c / columns) * 2 - 1) * width(z),
          y = level(z) + 0.005;
        positions.push(x, y, z);
        let froth = 0;
        for (const [cx, cz, w, dep] of ledges)
          froth = Math.max(
            froth,
            Math.exp(-(((x - cx!) / (w! * 0.65)) ** 2 + ((z - cz! - 0.18) / (dep! * 0.65)) ** 2)) *
              0.72,
          );
        const color = up.clone().lerp(foam, froth);
        colors.push(color.r, color.g, color.b);
      };
      vertex(row, col);
      vertex(row + 1, col);
      vertex(row, col + 1);
      vertex(row, col + 1);
      vertex(row + 1, col);
      vertex(row + 1, col + 1);
    }
  const water = new THREE.BufferGeometry();
  water.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  water.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  water.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35 });
  material.name = 'Agua de la represa antigua';
  d.group.add(new THREE.Mesh(water, material));
  d.box(6.2, 0.035, 0.13, '#9a9e90', 0, 0.907, -0.42);
  ledges.forEach(([x, z, w, dep, rise], i) =>
    slab(d, x!, level(z!) - 0.045, z!, w!, dep!, rise!, i + 2),
  );
  for (const z of [-4.8, 4.8])
    d.box(width(z) * 2, 0.125, 0.012, '#62867a', center(z), level(z) - 0.12, z);
  // Low fractured ledges and riparian woodland from the published photographs;
  // never a large reservoir or a second park's yellow pedestrian bridge.
  for (const side of [-1, 1])
    for (let i = 0; i < 8; i++) {
      const z = -3.7 + i * 1.05,
        x = side * (3.25 + (i % 3) * 0.42);
      d.tree(x, height(x, z), z, 0.46 + (i % 3) * 0.06, 'native', i * 2.3 + side);
      if (i > 2 && i < 6)
        slab(d, side * 2.7, height(side * 2.7, z) - 0.025, z, 0.95, 1.05, 0.065, i);
    }
  d.group.userData.representation =
    'Photo-informed detail of the old dam near Campamento Aguas Blancas; not the whole camp ground-plan.';
}

function lagoon(d: Diorama) {
  const sample = elevations['52'];
  const w = 12,
    depth = (sample.depthMeters / sample.widthMeters) * w,
    level = 0.14;
  const polygons = data.waterPolygons as Polygon[],
    land = data.landPolygons as Polygon[];
  const shore = (x: number, z: number) => {
    let nearest = Infinity;
    for (const polygon of polygons)
      for (const ring of [polygon.outer, ...polygon.holes])
        for (let i = 1; i < ring.length; i++) {
          const a = ring[i - 1]!,
            b = ring[i]!,
            dx = b[0]! - a[0]!,
            dz = b[1]! - a[1]!,
            length = dx * dx + dz * dz;
          if (length < 1e-12) continue;
          const t = THREE.MathUtils.clamp(((x - a[0]!) * dx + (z - a[1]!) * dz) / length, 0, 1);
          nearest = Math.min(nearest, Math.hypot(x - a[0]! - dx * t, z - a[1]! - dz * t));
        }
    return nearest;
  };
  const dem = (x: number, z: number) => {
    const fx = THREE.MathUtils.clamp((x / w + 0.5) * (sample.grid - 1), 0, sample.grid - 1),
      fz = THREE.MathUtils.clamp((z / depth + 0.5) * (sample.grid - 1), 0, sample.grid - 1);
    const ix = Math.min(sample.grid - 2, Math.floor(fx)),
      iz = Math.min(sample.grid - 2, Math.floor(fz)),
      tx = fx - ix,
      tz = fz - iz;
    const h = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(
        sample.heights[iz * sample.grid + ix]!,
        sample.heights[iz * sample.grid + ix + 1]!,
        tx,
      ),
      THREE.MathUtils.lerp(
        sample.heights[(iz + 1) * sample.grid + ix]!,
        sample.heights[(iz + 1) * sample.grid + ix + 1]!,
        tx,
      ),
      tz,
    );
    return (((h - sample.minimum) * w) / sample.widthMeters) * 1.2 + 0.16;
  };
  const height = (x: number, z: number) =>
    THREE.MathUtils.lerp(
      level + 0.018,
      Math.max(level + 0.018, dem(x, z)),
      smooth(shore(x, z) / 0.65),
    );
  // The DEM describes the hill, but smooths away the exposed rock wall visible
  // across the lagoon. Reuse the sister hill's authored escarpment construction.
  // Its placement and proportions are scenic, not a second surveyed map feature.
  const outcrop = createArequita({ outcropOnly: true }).group;
  outcrop.name = 'Cerro de los Cuervos · paredón rocoso al fondo de la laguna';
  outcrop.scale.set(0.017, 0.022, 0.019);
  outcrop.rotation.y = Math.PI / 4;
  outcrop.position.set(2.15, 0.12, -2.65);
  // Match the source texture's grey albedo in the image-free GLB export.
  outcrop.traverse((object) => {
    if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial)
      object.material.color.set('#a2a492');
  });
  outcrop.userData.representation = 'Cuervos adaptation of the Arequita escarpment, photo-informed';
  d.group.add(outcrop);
  outcrop.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const stoneHeight = (x: number, z: number) => {
    ray.set(new THREE.Vector3(x, 8, z), down);
    return ray.intersectObject(outcrop, true)[0]?.point.y;
  };
  const treeHeight = (x: number, z: number) => Math.max(height(x, z), stoneHeight(x, z) ?? 0);
  const sourceMask = data.landcover;
  const cover = (x: number, z: number) => {
    const col = Math.min(
        sourceMask.grid - 1,
        Math.max(0, Math.floor((x / w + 0.5) * sourceMask.grid)),
      ),
      row = Math.min(
        sourceMask.grid - 1,
        Math.max(0, Math.floor((z / depth + 0.5) * sourceMask.grid)),
      );
    return sourceMask.cells[row * sourceMask.grid + col];
  };
  for (const polygon of land) {
    const seed = shapeGeometry(polygon),
      p = seed.getAttribute('position'),
      indices = seed.index!;
    const pending: Array<[Vec, Vec, Vec]> = [];
    for (let i = 0; i < indices.count; i += 3)
      pending.push(
        [0, 1, 2].map((k) => ({
          x: p.getX(indices.getX(i + k)),
          z: p.getZ(indices.getX(i + k)),
        })) as [Vec, Vec, Vec],
      );
    seed.dispose();
    const vertices: number[] = [],
      colors: number[] = [],
      faces: number[] = [],
      cache = new Map<string, number>();
    const vertex = (point: Vec) => {
      const key = `${point.x.toFixed(7)},${point.z.toFixed(7)}`;
      const old = cache.get(key);
      if (old !== undefined) return old;
      const id = vertices.length / 3;
      vertices.push(point.x, height(point.x, point.z), point.z);
      const color = new THREE.Color(
        cover(point.x, point.z) === 2
          ? '#a6a494'
          : cover(point.x, point.z) === 1
            ? '#64764f'
            : '#879466',
      );
      colors.push(color.r, color.g, color.b);
      cache.set(key, id);
      return id;
    };
    const dist = (a: Vec, b: Vec) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
    while (pending.length) {
      const [a, b, c] = pending.pop()!,
        ab = dist(a, b),
        bc = dist(b, c),
        ca = dist(c, a);
      if (Math.max(ab, bc, ca) > 0.28 ** 2) {
        if (ab >= bc && ab >= ca) {
          const m = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
          pending.push([a, m, c], [m, b, c]);
        } else if (bc >= ca) {
          const m = { x: (b.x + c.x) / 2, z: (b.z + c.z) / 2 };
          pending.push([a, b, m], [a, m, c]);
        } else {
          const m = { x: (c.x + a.x) / 2, z: (c.z + a.z) / 2 };
          pending.push([a, b, m], [m, b, c]);
        }
      } else faces.push(vertex(a), vertex(b), vertex(c));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.setIndex(faces);
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
    );
    mesh.receiveShadow = true;
    d.group.add(mesh);
    const sides: number[] = [];
    const sideSegment = (a: number[], b: number[]) => {
      if (Math.hypot(b[0]! - a[0]!, b[1]! - a[1]!) > 0.28) {
        const middle = [(a[0]! + b[0]!) / 2, (a[1]! + b[1]!) / 2];
        sideSegment(a, middle);
        sideSegment(middle, b);
        return;
      }
      const bottom = 0.04;
      for (const v of [
        [a[0]!, bottom, a[1]!],
        [b[0]!, bottom, b[1]!],
        [b[0]!, height(b[0]!, b[1]!), b[1]!],
        [a[0]!, bottom, a[1]!],
        [b[0]!, height(b[0]!, b[1]!), b[1]!],
        [a[0]!, height(a[0]!, a[1]!), a[1]!],
      ])
        sides.push(...v);
    };
    for (const ring of [polygon.outer, ...polygon.holes])
      for (let i = 1; i < ring.length; i++) sideSegment(ring[i - 1]!, ring[i]!);
    walls(d, sides, '#77765f');
  }
  d.box(w, 0.04, depth, '#766c56', 0, 0, 0);
  for (const polygon of polygons) {
    const geometry = shapeGeometry(polygon);
    d.add(geometry, '#568d91', new THREE.Vector3(0, level, 0));
  }
  const random = (() => {
    let seed = 52021;
    return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  })();
  let count = 0;
  for (let i = 0; i < 2000 && count < 115; i++) {
    const x = (random() - 0.5) * w,
      z = (random() - 0.5) * depth;
    if (cover(x, z) !== 1 || shore(x, z) < 0.24) continue;
    // Land-only check: the DEM shoreline strip must remain open water.
    const inside = (ring: number[][]) => {
      let hit = false;
      for (let k = 0, j = ring.length - 1; k < ring.length; j = k++) {
        const a = ring[k]!,
          b = ring[j]!;
        if (
          a[1]! > z !== b[1]! > z &&
          x < ((b[0]! - a[0]!) * (z - a[1]!)) / (b[1]! - a[1]!) + a[0]!
        )
          hit = !hit;
      }
      return hit;
    };
    if (polygons.some((poly) => inside(poly.outer) && !poly.holes.some(inside))) continue;
    d.tree(x, treeHeight(x, z), z, 0.27 + random() * 0.12, 'native', i);
    count++;
  }
  // Low scrub follows the actual crown triangles, leaving the cliff exposed.
  for (let x = -0.4; x < 4.4; x += 0.38)
    for (let z = -4.6; z < -0.4; z += 0.4) {
      const px = x + (random() - 0.5) * 0.16,
        pz = z + (random() - 0.5) * 0.16,
        top = stoneHeight(px, pz);
      if (top === undefined || top < height(px, pz) - 0.015 || random() < 0.2) continue;
      d.tree(px, top - 0.005, pz, 0.095 + random() * 0.075, 'native', count++);
    }
  d.group.userData.cuervos = {
    component: 'Cerro de los Cuervos',
    construction: 'Shared Arequita escarpment, adapted silhouette and wooded crown',
    source: 'https://www.lagunadeloscuervos.com.uy/entorno/',
    survey: false,
  };
  d.group.userData.terrain = {
    center: sample.center,
    widthMeters: sample.widthMeters,
    depthMeters: sample.depthMeters,
    source: sample.source,
    exaggeration: 1.2,
  };
  d.group.userData.water = {
    source: data.source,
    sourceUrl: data.sourceUrl,
    processing: data.processing,
    level: 'Visual approximation; shared shoreline vertices, not water survey.',
  };
}

export function addWaterLandmark(d: Diorama, id: number): boolean {
  if (id === 23) {
    oldDam(d);
    return true;
  }
  if (id === 52) {
    lagoon(d);
    return true;
  }
  return false;
}

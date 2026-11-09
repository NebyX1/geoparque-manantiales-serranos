import * as THREE from 'three';
import { addWaterLandmark } from './naturalWater';
import landcover from './landcover-samples.json';
import localRivers from './local-rivers.json';
import { detailGround, Diorama, measuredGround, rockNoise, type Ground } from './naturalGeometry';
import { addMarmarajaOutcrops, marmarajaRelief } from './marmaraja';

export const naturalIds = [
  2, 3, 4, 5, 6, 7, 8, 12, 13, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 50, 51, 52, 53, 55, 56,
  57, 58, 59,
] as const;

function outcrops(
  d: Diorama,
  ground: Ground,
  count: number,
  seed: number,
  color = '#99998b',
  spread = 0.35,
): void {
  for (let i = 0; i < count; i++) {
    const a = i * 2.399 + seed,
      r = Math.sqrt((i + 1) / count);
    const x = Math.cos(a) * ground.width * spread * r,
      z = Math.sin(a) * ground.depth * spread * r;
    const s = 0.13 + ((i * 3) % 7) * 0.038;
    d.rock(x, ground.height(x, z) - s * 0.3, z, s * 1.6, s * 0.65, s, color, i + seed);
  }
}

function countryHouse(
  d: Diorama,
  x: number,
  y: number,
  z: number,
  width = 3.7,
  depth = 1.8,
  stone = '#b2a58d',
): void {
  d.box(width, 1.15, depth, stone, x, y, z);
  d.roof(width + 0.18, 0.42, depth + 0.16, '#716f62', x, y + 1.15, z);
  d.box(0.48, 0.82, 0.04, '#494c43', x, y, z + depth / 2 + 0.025);
  for (const side of [-1, 1])
    d.box(0.5, 0.48, 0.04, '#4c5d5a', x + side * width * 0.3, y + 0.48, z + depth / 2 + 0.025);
}

function stoneCourses(
  d: Diorama,
  points: Array<[number, number]>,
  ground: Ground,
  height = 0.6,
  closed = false,
): void {
  const list = closed ? [...points, points[0]!] : points;
  for (let i = 0; i < list.length - 1; i++) {
    const a = new THREE.Vector2(...list[i]!),
      b = new THREE.Vector2(...list[i + 1]!);
    const length = a.distanceTo(b),
      n = Math.max(1, Math.ceil(length / 0.27));
    for (let row = 0; row < Math.ceil(height / 0.14); row++)
      for (let j = 0; j < n; j++) {
        if (row > 2 && (j + i * 3) % 11 < 3) continue;
        const t = (j + 0.5 + (row % 2) * 0.16) / n,
          x = THREE.MathUtils.lerp(a.x, b.x, t),
          z = THREE.MathUtils.lerp(a.y, b.y, t);
        const irregular = 0.8 + ((j * 7 + i + row) % 8) * 0.065;
        d.rock(
          x,
          ground.height(x, z) + row * 0.125,
          z,
          (length / n) * 0.66 * irregular,
          0.075 * irregular,
          (0.2 - row * 0.023) * irregular,
          (i + j + row) % 3 ? '#8d8e83' : '#b3b2a0',
          j + i + row * 3,
        );
      }
  }
}

function cura(d: Diorama): void {
  const g = measuredGround(d, 2, 1.8),
    p = g.peak.clone();
  // Published distant view: compact summit fort and lower white annex.
  const fort = new Diorama();
  fort.box(0.78, 0.56, 0.52, '#9e9680', 0, 0, 0);
  fort.box(0.36, 0.19, 0.34, '#9e9680', 0.18, 0.56, -0.02);
  fort.box(0.5, 0.3, 0.45, '#e5e0cb', -0.57, 0, 0.03);
  for (const offset of [-0.24, 0.08, 0.28])
    fort.box(0.06, 0.11, 0.015, '#343b33', offset, 0.3, 0.267);
  for (let i = 0; i < 6; i++) fort.box(0.05, 0.08, 0.05, '#b6ab91', -0.33 + i * 0.13, 0.53, 0.23);
  const building = fort.finish();
  building.scale.set(0.35, 0.26, 0.35);
  building.position.copy(p);
  d.group.add(building);
  // Small clustered exposures along upper grassy slopes, not giant garden boulders.
  for (const [cx, cz, count] of [
    [p.x, p.z + 0.6, 36],
    [p.x - 0.8, p.z + 1.4, 35],
    [p.x + 0.9, p.z + 1.8, 32],
    [-0.7, 2.4, 25],
  ] as const) {
    for (let i = 0; i < count; i++) {
      const a = i * 2.399,
        r = Math.sqrt((i + 1) / count);
      const x = cx + Math.cos(a) * r * 0.7,
        z = cz + Math.sin(a) * r * 0.42;
      const size = 0.035 + (i % 5) * 0.011;
      d.rock(x, g.height(x, z) - 0.018, z, size * 1.5, size * 0.5, size, '#9e9d8a', i);
    }
  }
  for (const [x, z] of [
    [-4, 3],
    [3, 3.5],
    [-3, -3],
    [4, -3],
  ] as const)
    d.tree(x, g.height(x, z), z, 0.27, 'native', x);
}

function caperuza(d: Diorama): void {
  detailGround(d, '#7f8b5c');
  d.sculptRock(
    (x, y, z) => {
      const height = THREE.MathUtils.clamp((y - 1.5) / 2.85, 0, 1);
      const radius = 2.25 * Math.pow(1 - height, 0.82) + 0.23;
      const center = -0.15 - height * 0.62;
      const cross =
        (Math.pow(Math.abs((x - center) / radius), 2.8) +
          Math.pow(Math.abs((z + 0.2) / (radius * 0.75)), 2.8) -
          1) *
        radius *
        0.42;
      const cap = Math.max(cross, 1.76 - y, y - 4.38);
      const baseA = fracturedBlock(x, y, z, -1.65, 1.0, 0.1, 1, 0.8, 1.1, -0.12, 0.04);
      const baseB = fracturedBlock(x, y, z, 0.35, 0.85, 0.3, 1.2, 0.73, 1.05, 0.16, -0.04);
      const baseC = fracturedBlock(x, y, z, 2.35, 0.95, -0.55, 0.95, 0.85, 1.2, -0.1, 0.03);
      const fracture =
        0.055 * Math.sin(x * 7.3 + y * 5.1) * Math.sin(z * 6.4 - y * 3.1) +
        0.035 * Math.sin(x * 18 + y * 15 + z * 13);
      return Math.min(cap, baseA, baseB, baseC) + fracture;
    },
    new THREE.Vector3(0, 2.3, -0.2),
    new THREE.Vector3(4.7, 2.55, 3.4),
    '#a1a08a',
    60,
  );
  for (const [x, z] of [
    [-3.5, 2.8],
    [-1.8, 3],
    [0.8, 3],
    [3, 2.8],
  ] as const)
    d.rock(x, 0.27, z, 0.85, 0.16, 0.75, '#979c86', x);
  for (const [x, z] of [
    [3.9, 0.8],
    [3.4, -1.9],
    [-3.9, -2],
  ] as const)
    d.tree(x, 0.27, z, 0.65, 'native', x);
}

function fracturedBlock(
  x: number,
  y: number,
  z: number,
  cx: number,
  cy: number,
  cz: number,
  sx: number,
  sy: number,
  sz: number,
  yaw = 0,
  roll = 0,
): number {
  const dx = x - cx,
    dy = y - cy,
    dz = z - cz,
    rx = Math.cos(yaw) * dx + Math.sin(yaw) * dz,
    rz = -Math.sin(yaw) * dx + Math.cos(yaw) * dz;
  const qx = (Math.cos(roll) * rx - Math.sin(roll) * dy) / sx,
    qy = (Math.sin(roll) * rx + Math.cos(roll) * dy) / sy,
    qz = rz / sz;
  return (
    Math.max(
      qx + 0.08 * qy - 0.04 * qz - 1,
      -qx - 0.1 * qy + 0.08 * qz - 1,
      qy + 0.11 * qx + 0.08 * qz - 1,
      -qy - 1,
      qz - 0.13 * qx + 0.05 * qy - 1,
      -qz + 0.1 * qx - 0.04 * qy - 1,
      (0.7 * qx + 0.8 * qy + 0.7 * qz - 1.65) / 1.3,
      (-0.8 * qx + 0.6 * qy + 0.6 * qz - 1.5) / 1.2,
      (0.75 * qx - 0.3 * qy + 0.8 * qz - 1.6) / 1.15,
      (-0.7 * qx + 0.5 * qy - 0.65 * qz - 1.55) / 1.1,
    ) * Math.min(sx, sy, sz)
  );
}

function caveAmarilla(d: Diorama): void {
  const g = detailGround(d, '#8b9567');
  d.sculptRock(
    (x, y, z) => {
      const left = fracturedBlock(x, y, z, -2.65, 1.1, -0.3, 1.45, 1.0, 1.65, -0.24, 0.12);
      const right = fracturedBlock(x, y, z, 1.85, 1.45, -0.65, 1.95, 1.35, 1.65, 0.13, -0.08);
      const rear = fracturedBlock(x, y, z, -0.6, 2.0, -1.45, 1.65, 0.8, 1.12, -0.1, 0.1);
      const crown = fracturedBlock(x, y, z, -0.7, 1.55, 0.05, 1.2, 0.62, 1.3, 0.08, -0.17);
      const front = fracturedBlock(x, y, z, 1.55, 0.65, 1.1, 1.1, 0.55, 0.9, 0.35, 0.04);
      const backwall = fracturedBlock(x, y, z, -0.7, 0.9, -1.9, 1.25, 0.75, 0.65, 0.1, -0.04);
      const mass =
        Math.min(left, right, rear, crown, front, backwall) +
        0.025 * rockNoise(x * 5, y * 5, z * 5);
      const cavity = Math.max(
        fracturedBlock(x, y, z, -0.85, 0.65, 0.45, 0.73, 0.43, 2.5, 0, 0.05),
        0.26 - y,
      );
      const joint = Math.max(Math.abs(x - 0.35 - 0.13 * z) - 0.027, 0.6 - y, -0.4 - z);
      return Math.max(mass, -cavity, -joint, 0.24 - y);
    },
    new THREE.Vector3(0, 1.7, -0.4),
    new THREE.Vector3(5, 2.05, 3.8),
    '#a5a18b',
    72,
  );
  for (const [cx, cz, n] of [
    [-2.6, 1.6, 12],
    [3.2, 0.9, 13],
  ] as const)
    for (let i = 0; i < n; i++) {
      const a = i * 2.399,
        r = Math.sqrt((i + 1) / n),
        x = cx + Math.cos(a) * r,
        z = cz + Math.sin(a) * r * 0.65,
        size = 0.09 + (i % 3) * 0.065;
      d.rock(x, g.height(x, z), z, size * 1.4, size * 0.7, size, '#a4a48f', i);
    }
  for (const [x, z, size] of [
    [-2.25, -0.4, 0.6],
    [1.5, 0.4, 0.45],
    [3.1, -1.3, 0.5],
  ] as const)
    d.tree(x, 1.2, z, size, 'native', x);
}

function grutaColon(d: Diorama): void {
  detailGround(d, '#777e56');
  d.sculptRock(
    (x, y, z) => {
      const leftA = fracturedBlock(x, y, z, -2.45, 2.7, -0.4, 2.1, 2.6, 2.6, -0.08, 0.04);
      const leftB = fracturedBlock(x, y, z, -2.9, 2.0, -2.0, 1.4, 2.0, 1.25, 0.22, -0.04);
      const rightA = fracturedBlock(x, y, z, 2.5, 2.8, -0.65, 2.15, 2.7, 2.15, 0.12, -0.03);
      const rightB = fracturedBlock(x, y, z, 2.9, 1.9, 1.0, 1.6, 1.85, 1.2, -0.24, 0.08);
      const left = Math.max(
        Math.min(leftA, leftB),
        x + 0.4 - 0.06 * y,
        0.96 * x + 0.2 * z + 0.38 - 0.02 * y,
        x - 0.13 * z + 0.34 + 0.025 * y,
      );
      const right = Math.max(
        Math.min(rightA, rightB),
        -x + 0.38 + 0.015 * y,
        -0.95 * x - 0.12 * z + 0.3 - 0.02 * y,
        -x + 0.08 * z + 0.45,
      );
      const ramp = Math.max(
        Math.abs(x) - 0.7,
        y - (0.28 + THREE.MathUtils.clamp((-z + 0.6) * 0.43, 0, 1.35)),
        0.15 - y,
        Math.abs(z + 1.5) - 1.6,
      );
      const crack = 0.025 * rockNoise(x * 4, y * 4, z * 4);
      return Math.max(Math.min(left + crack, right + crack, ramp), 0.24 - y);
    },
    new THREE.Vector3(0, 2.7, -0.4),
    new THREE.Vector3(5.6, 3.35, 3.8),
    '#858c79',
    72,
  );
  for (let i = 0; i < 10; i++)
    d.box(
      0.68 + (i % 3) * 0.025,
      0.15 + i * 0.12,
      0.39,
      i % 2 ? '#9c9c87' : '#858e76',
      0,
      0.27,
      1.8 - i * 0.34,
    );
  for (let i = 0; i < 5; i++)
    d.beam(
      new THREE.Vector3(-0.31 + i * 0.15, 1.4, -1.7),
      new THREE.Vector3(-0.31 + i * 0.15, 2.8, -1.7),
      0.014,
      '#485345',
    );
  for (const [x, z] of [
    [-4, -1.8],
    [4.2, -2.1],
    [-4.7, 1.8],
  ] as const)
    d.tree(x, 0.3, z, 0.5, 'native', x);
  for (const [x, z] of [
    [-0.53, 0.8],
    [0.52, -0.2],
    [-0.66, -0.8],
  ] as const)
    d.line(
      [
        new THREE.Vector3(x, 4.5, z),
        new THREE.Vector3(x - 0.06, 3.1, z + 0.1),
        new THREE.Vector3(x, 1.8, z + 0.2),
      ],
      0.026,
      '#637447',
    );
}

function guarida(d: Diorama): void {
  detailGround(d, '#6e7f52');
  // The real aerial circuit has cable traverses and hanging individual planks.
  for (const x of [-3.8, 3.8] as const) {
    d.rock(x, 0.3, 0, 1.6, 1.6, 3.2, '#8e9182', x);
    for (const z of [-2.3, 2.4]) d.tree(x, 1.4, z, 0.9, 'native', z);
  }
  d.box(3.8, 0.22, 6.4, '#535e44', 0, 0.28, 0);
  for (const z of [-0.38, 0.38]) {
    d.line(
      [
        new THREE.Vector3(-3.8, 3.5, z),
        new THREE.Vector3(0, 2.85, z),
        new THREE.Vector3(3.8, 3.5, z),
      ],
      0.025,
      '#444b45',
    );
    d.line(
      [
        new THREE.Vector3(-3.8, 2.1, z),
        new THREE.Vector3(0, 1.45, z),
        new THREE.Vector3(3.8, 2.1, z),
      ],
      0.024,
      '#51574c',
    );
  }
  for (let i = 0; i < 18; i++) {
    const x = -3.5 + i * (7 / 17),
      y = 1.5 + Math.pow(x / 3.8, 2) * 0.62;
    d.box(0.25, 0.07, 0.88, '#9b815a', x, y, 0);
    for (const z of [-0.4, 0.4])
      d.beam(new THREE.Vector3(x, y + 0.06, z), new THREE.Vector3(x, y + 1.4, z), 0.012, '#6c6b56');
  }
  d.line(
    [
      new THREE.Vector3(-4.3, 4, -2),
      new THREE.Vector3(0, 3.2, -2.2),
      new THREE.Vector3(4.3, 3.9, -2.4),
    ],
    0.02,
    '#414b46',
  );
  for (const [x, z] of [
    [-4.8, -3.3],
    [-2.5, -3.6],
    [0, -3.8],
    [2.6, -3.5],
    [4.7, -3.2],
    [4.7, 3.6],
    [-4.7, 3.6],
  ] as const)
    d.tree(x, 0.3, z, 0.9, 'native', x + z);
}

function ombues(d: Diorama): void {
  const g = detailGround(d, '#8b8d5b');
  d.path(
    [
      [-4.8, 3.4],
      [-2.5, 1.6],
      [0, 0.7],
      [2.1, -1.3],
      [4.6, -2.8],
    ],
    g,
    0.65,
    '#b5a580',
  );
  for (const [x, z, s] of [
    [-2.9, -1.4, 1.3],
    [2.7, 1.5, 1.45],
    [0.5, -3.3, 1.2],
    [-4.4, 2.8, 0.75],
  ] as const)
    d.tree(x, 0.27, z, s, 'ombu', x);
  outcrops(d, g, 14, 51, '#9b9c8b', 0.43);
}

function hiloVida(d: Diorama): void {
  const g = measuredGround(d, 58, 1.5);
  // Flat irregular slabs and a broad truncated crown match the original photo.
  for (const [cx, cz, size] of [
    [-1.4, 0.1, 0.9],
    [1.8, -1.5, 0.65],
    [2.8, 1.8, 0.46],
  ] as const) {
    const y = g.height(cx, cz);
    for (let row = 0; row < 9; row++) {
      const radius = size * (0.82 - row * 0.045),
        n = Math.max(5, Math.round(radius * 16));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + row * 0.29,
          spread = radius * (0.93 + ((i * 3 + row) % 5) * 0.027);
        d.rock(
          cx + Math.cos(a) * spread,
          y + row * size * 0.13,
          cz + Math.sin(a) * spread,
          size * (0.18 + (i % 3) * 0.045),
          size * (0.06 + (i % 2) * 0.02),
          size * 0.19,
          (i + row) % 3 ? '#a9aaa0' : '#818779',
          i + row * 3,
        );
      }
    }
    for (const [dx, dz] of [
      [-0.15, 0.07],
      [0.17, -0.04],
      [0.02, 0.19],
    ] as const)
      d.rock(
        cx + dx * size,
        y + 1.1 * size,
        cz + dz * size,
        size * 0.33,
        size * 0.065,
        size * 0.27,
        '#adaea3',
        dx * 7,
      );
  }
  outcrops(d, g, 24, 58);
}

function mangas(d: Diorama): void {
  const g = measuredGround(d, 56, 1.45);
  // Dry-stone stock enclosures: masonry rather than timber fences.
  stoneCourses(
    d,
    [
      [-3.8, -1.8],
      [-2.9, -2.8],
      [-0.9, -3.2],
      [1.5, -2.9],
      [3, -1.7],
      [3.2, 0.6],
      [2.5, 2.2],
      [0, 2.6],
      [-2.4, 2.1],
      [-3.8, 0.4],
    ],
    g,
    0.65,
    true,
  );
  stoneCourses(
    d,
    [
      [-2.9, -2.8],
      [-2, -0.8],
      [-1.7, 1.8],
    ],
    g,
    0.65,
  );
  stoneCourses(
    d,
    [
      [-1.7, 1.8],
      [0.2, 0.3],
      [1.5, -2.9],
    ],
    g,
    0.65,
  );
  stoneCourses(
    d,
    [
      [3.2, 0.6],
      [4.6, 1],
      [5.4, 0.8],
    ],
    g,
    0.55,
  );
  outcrops(d, g, 18, 56);
}

function mistico(d: Diorama): void {
  const g = measuredGround(d, 59, 1.2),
    y = g.height(0, 0);
  // Casa de Piedra: photographed two-storey stone/white volume and high terrace.
  d.box(4.6, 1.65, 3.1, '#b7b6a0', 0, y, 0);
  d.box(3.25, 1.55, 2.35, '#e0ded0', 0, y + 1.85, -0.3);
  d.box(4.85, 0.2, 3.75, '#aca28b', 0, y + 1.65, 0.5);
  d.box(3.65, 0.14, 2.75, '#dbdaca', 0, y + 3.4, -0.3);
  for (const x of [-1.35, 1.1]) d.box(1, 1.35, 0.04, '#354847', x, y + 0.15, 1.57);
  d.box(2.4, 1.2, 0.04, '#43544f', 0, y + 2.05, 0.895);
  for (const x of [-2.1, 2.1]) {
    d.box(0.7, 1.65, 0.45, '#9b9681', x, y, 1.4);
    for (let row = 0; row < 12; row++)
      for (let k = 0; k < 3; k++) {
        const px = x + (k - 1) * 0.2 + (row % 2) * 0.055;
        d.rock(
          px,
          y + row * 0.135,
          1.66,
          0.13,
          0.075,
          0.06,
          (row + k) % 3 ? '#a5a18b' : '#858879',
          row + k,
        );
      }
  }
  for (const x of [-2.2, -0.75, 0.75, 2.2]) d.box(0.045, 0.8, 0.045, '#384841', x, y + 1.85, 2.3);
  for (const z of [0.4, 2.3])
    for (const h of [0.35, 0.8]) d.box(4.45, 0.045, 0.045, '#384841', 0, y + 1.85 + h, z);
  for (const x of [-2.2, 2.2]) {
    d.box(0.045, 0.045, 1.9, '#384841', x, y + 2.65, 1.35);
    d.box(0.075, 1.8, 0.075, '#384841', x, y, 2.3);
  }
  for (const [x, z] of [
    [-3.4, 2.2],
    [-4, -1.9],
    [4.7, -2.6],
  ] as const)
    d.tree(x, g.height(x, z), z, 0.85, 'eucalyptus', x);
}

function nacientes(d: Diorama): void {
  const g = measuredGround(d, 4, 1.25);
  // Photo: a damp narrow furrow in pasture, not an open blue lake.
  const furrow: Array<[number, number]> = [
    [-0.3, 5.6],
    [-0.4, 3.5],
    [0.1, 1.4],
    [-0.2, -0.2],
    [0.5, -1.8],
    [0.8, -3.1],
  ];
  d.path(furrow, g, 0.08, '#69705a');
  d.path(furrow, { ...g, height: (x, z) => g.height(x, z) + 0.008 }, 0.025, '#708176');
  for (const [cx, cz] of [
    [-1.6, -1.2],
    [1.8, -2.9],
    [-2.5, -3.9],
  ] as const)
    for (let i = 0; i < 14; i++) {
      const a = i * 2.399,
        r = Math.sqrt((i + 1) / 14),
        x = cx + Math.cos(a) * r * 0.85,
        z = cz + Math.sin(a) * r * 0.35;
      d.rock(x, g.height(x, z), z, 0.07 + (i % 3) * 0.025, 0.035, 0.08, '#acac95', i);
    }
  for (let i = 0; i < 18; i++) {
    const x = -5 + i * 0.58,
      z = -4.6 + Math.sin(i) * 0.3;
    d.tree(x, g.height(x, z), z, 0.35, 'native', i);
  }
}

function portugues(d: Diorama): void {
  const pixels = [
    [741, 0],
    [700, 118],
    [637, 239],
    [569, 347],
    [539, 421],
    [528, 497],
    [497, 578],
    [463, 662],
    [425, 716],
    [410, 731],
    [401, 724],
    [412, 665],
    [437, 602],
    [443, 539],
    [455, 477],
    [480, 418],
    [498, 372],
    [525, 320],
    [579, 212],
    [619, 144],
    [643, 81],
    [688, 0],
  ];
  const raw = pixels.map(
    ([x, z]) => new THREE.Vector2(((x! - 512) / 1024) * 10.8, ((z! - 512) / 1024) * 10.8),
  );
  const polygon: THREE.Vector2[] = [];
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i]!,
      b = raw[(i + 1) % raw.length]!,
      n = Math.max(1, Math.ceil(a.distanceTo(b) / 0.12));
    for (let j = 0; j < n; j++) polygon.push(a.clone().lerp(b, j / n));
  }
  const g = measuredGround(d, 13, 1.2);
  const surface = d.group.children.find(
    (object) =>
      (object as THREE.Mesh).material instanceof THREE.MeshStandardMaterial &&
      ((object as THREE.Mesh).material as THREE.MeshStandardMaterial).name ===
        'Relieve numerico Terrarium',
  ) as THREE.Mesh | undefined;
  if (!surface) throw new Error('Unable to replace quarry terrain surface');
  surface.removeFromParent();
  surface.geometry.dispose();
  (surface.material as THREE.Material).dispose();
  const outer: THREE.Vector2[] = [];
  for (let i = 0; i < 64; i++) outer.push(new THREE.Vector2(-6 + (i / 64) * 12, -g.depth / 2));
  for (let i = 0; i < 64; i++) outer.push(new THREE.Vector2(6, -g.depth / 2 + (i / 64) * g.depth));
  for (let i = 0; i < 64; i++) outer.push(new THREE.Vector2(6 - (i / 64) * 12, g.depth / 2));
  for (let i = 0; i < 64; i++) outer.push(new THREE.Vector2(-6, g.depth / 2 - (i / 64) * g.depth));
  const fieldShape = new THREE.Shape(outer.map((p) => new THREE.Vector2(p.x, -p.y)));
  fieldShape.holes.push(new THREE.Path(polygon.map((p) => new THREE.Vector2(p.x, -p.y))));
  const flat = new THREE.ShapeGeometry(fieldShape);
  flat.rotateX(-Math.PI / 2);
  const positions: number[] = [];
  const append = (a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2, depth = 0): void => {
    const ab = a.distanceToSquared(b),
      bc = b.distanceToSquared(c),
      ca = c.distanceToSquared(a),
      limit = 0.45 * 0.45;
    if (Math.max(ab, bc, ca) > limit && depth < 18) {
      if (ab >= bc && ab >= ca) {
        const m = a.clone().add(b).multiplyScalar(0.5);
        append(a, m, c, depth + 1);
        append(m, b, c, depth + 1);
      } else if (bc >= ca) {
        const m = b.clone().add(c).multiplyScalar(0.5);
        append(a, b, m, depth + 1);
        append(a, m, c, depth + 1);
      } else {
        const m = c.clone().add(a).multiplyScalar(0.5);
        append(a, b, m, depth + 1);
        append(m, b, c, depth + 1);
      }
      return;
    }
    for (const p of [a, b, c]) positions.push(p.x, g.height(p.x, p.y), p.y);
  };
  const p = flat.getAttribute('position'),
    indices = flat.index?.array ?? Array.from({ length: p.count }, (_, i) => i);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i]!,
      b = indices[i + 1]!,
      c = indices[i + 2]!;
    append(
      new THREE.Vector2(p.getX(a), p.getZ(a)),
      new THREE.Vector2(p.getX(b), p.getZ(b)),
      new THREE.Vector2(p.getX(c), p.getZ(c)),
    );
  }
  flat.dispose();
  const top = new THREE.BufferGeometry();
  top.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  top.computeVertexNormals();
  d.add(top, '#87915e');
  const level = 0.07,
    floorShape = new THREE.Shape(polygon.map((p) => new THREE.Vector2(p.x, -p.y))),
    floor = new THREE.ShapeGeometry(floorShape);
  floor.rotateX(-Math.PI / 2);
  d.add(floor, '#42483d', new THREE.Vector3(0, level, 0));
  const area = polygon.reduce((sum, p, i) => {
      const q = polygon[(i + 1) % polygon.length]!;
      return sum + p.x * q.y - q.x * p.y;
    }, 0),
    walls: number[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]!,
      b = polygon[(i + 1) % polygon.length]!,
      loA = [a.x, level, a.y],
      loB = [b.x, level, b.y],
      hiA = [a.x, g.height(a.x, a.y), a.y],
      hiB = [b.x, g.height(b.x, b.y), b.y];
    for (const p of area > 0 ? [loA, hiB, hiA, loA, loB, hiB] : [loA, hiA, hiB, loA, hiB, loB])
      walls.push(...p);
  }
  const cut = new THREE.BufferGeometry();
  cut.setAttribute('position', new THREE.Float32BufferAttribute(walls, 3));
  cut.computeVertexNormals();
  d.add(cut, '#929785');
  d.path(
    [
      [-5.9, 2.6],
      [-2.9, 3.2],
      [0.3, 4.0],
      [5.9, 5.6],
    ],
    g,
    0.1,
    '#a9a080',
  );
  const near = (x: number, z: number) => polygon.some((p) => Math.hypot(x - p.x, z - p.y) < 0.65);
  for (let i = 0; i < 22; i++) {
    const a = i * 2.399,
      r = Math.sqrt((i + 1) / 22),
      x = Math.cos(a) * r * 5.4,
      z = Math.sin(a) * r * 5.2;
    if (!near(x, z)) d.tree(x, g.height(x, z), z, 0.27, 'native', i);
  }
  d.group.userData.orthophoto = {
    source: 'IDE Uruguay national orthophoto2017-2018',
    currentSurvey: false,
    trace:
      'Long narrow quarry footprint; terrain triangulated with actual hole boundary, depth interpreted and not measured',
  };
}

function ramallo(d: Diorama): void {
  detailGround(d, '#a2987d');
  d.box(8.9, 0.025, 3.3, '#a9aa9a', 0, 0.275, 0);
  const supports = [
    [-4, 0.7],
    [-2.6, 0.5],
    [-1.2, 0.3],
    [0.3, 0.25],
    [1.7, 0.35],
    [3.2, 0.65],
    [4.2, 0.9],
  ] as const;
  for (const depth of [0, 1.2]) {
    for (const [x, z] of supports) d.box(0.12, 2.45, 0.12, '#78674a', x, 0.3, z - depth);
    for (let i = 0; i < supports.length - 1; i++) {
      const a = supports[i]!,
        b = supports[i + 1]!;
      d.beam(
        new THREE.Vector3(a[0], 2.78, a[1] - depth),
        new THREE.Vector3(b[0], 2.78, b[1] - depth),
        0.08,
        '#78674a',
      );
    }
  }
  for (const [x, z] of supports) d.box(0.11, 0.12, 1.48, '#78674a', x, 2.78, z - 0.6);
  for (let i = 0; i < 19; i++) {
    const x = -4 + (i * 8.2) / 18,
      z = 0.3 + Math.abs(x) * 0.1;
    d.box(0.055, 0.07, 1.45, '#897653', x, 2.88, z - 0.6);
  }
  for (const [x, z] of [
    [-4.5, -3.1],
    [3.8, -3.4],
  ] as const)
    d.tree(x, 0.27, z, 0.5, 'native', x);
}

function hipRoof(
  d: Diorama,
  w: number,
  h: number,
  depth: number,
  color: string,
  x: number,
  y: number,
  z: number,
): void {
  const v = [
    [-w / 2, 0, -depth / 2],
    [w / 2, 0, -depth / 2],
    [w / 2, 0, depth / 2],
    [-w / 2, 0, depth / 2],
    [-w * 0.22, h, 0],
    [w * 0.22, h, 0],
  ];
  const positions: number[] = [];
  for (const idx of [0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 4, 2, 4, 3, 3, 4, 0])
    positions.push(...v[idx]!);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  d.add(geometry, color, new THREE.Vector3(x, y, z));
}

function ose(d: Diorama): void {
  detailGround(d, '#819061');
  d.box(9, 0.81, 2.7, '#73815e', 0, 0.27, -2.4);
  d.box(8.95, 0.025, 2.65, '#568d91', 0, 1.08, -2.4);
  const shape = new THREE.Shape()
    .moveTo(0.9, 0)
    .lineTo(0.9, 0.82)
    .lineTo(0.3, 0.82)
    .quadraticCurveTo(-0.1, 0.08, -1.65, 0)
    .closePath();
  const dam = new THREE.ExtrudeGeometry(shape, { depth: 9, bevelEnabled: false });
  dam.translate(0, 0, -4.5);
  dam.rotateY(Math.PI / 2);
  d.add(dam, '#a6a591', new THREE.Vector3(0, 0.27, 0));
  const waterPositions: number[] = [];
  for (let j = 0; j < 40; j++) {
    const t = j / 40,
      u = (j + 1) / 40;
    const y = (v: number) => 0.27 + 0.82 * Math.pow(1 - v, 2) + 0.16 * v * (1 - v);
    const z = (v: number) => -(0.3 * Math.pow(1 - v, 2) - 0.2 * v * (1 - v) - 1.65 * v * v);
    for (const p of [
      [-4.45, y(t) + 0.018, z(t)],
      [4.45, y(u) + 0.018, z(u)],
      [4.45, y(t) + 0.018, z(t)],
      [-4.45, y(t) + 0.018, z(t)],
      [-4.45, y(u) + 0.018, z(u)],
      [4.45, y(u) + 0.018, z(u)],
    ])
      waterPositions.push(...p);
  }
  const overflow = new THREE.BufferGeometry();
  overflow.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3));
  overflow.computeVertexNormals();
  d.add(overflow, '#acbeb2');
  d.box(9.35, 0.12, 0.48, '#b6b5a0', 0, 1.57, -0.35);
  for (let i = 0; i < 13; i++) {
    const x = -4.4 + (i * 8.8) / 12;
    d.box(0.14, 0.55, 0.44, '#a4a38e', x, 1.02, -0.35);
    for (const z of [-0.57, -0.12]) {
      d.beam(new THREE.Vector3(x, 1.69, z), new THREE.Vector3(x, 2.04, z), 0.023, '#d7b32f');
      d.add(new THREE.SphereGeometry(0.036, 7, 5), '#d7b32f', new THREE.Vector3(x, 2.06, z));
    }
  }
  for (const z of [-0.57, -0.12])
    for (const y of [1.76, 1.9, 2.04])
      d.beam(new THREE.Vector3(-4.55, y, z), new THREE.Vector3(4.55, y, z), 0.017, '#d7b32f');
  d.box(9.2, 0.025, 1.25, '#568d91', 0, 0.29, 2.2);
  for (const [x, z] of [
    [-4.8, -3.8],
    [-3.4, -4],
    [-1.6, -4],
    [0.4, -4],
    [2.5, -4],
    [4.4, -3.6],
  ] as const)
    d.tree(x, 0.94, z, 0.63, 'native', x);
  for (const x of [-3, 0, 3]) {
    d.beam(
      new THREE.Vector3(x - 1, 0.66, 3.8),
      new THREE.Vector3(x + 1, 0.66, 3.8),
      0.045,
      '#766c50',
    );
    for (const dx of [-0.7, 0.7]) d.box(0.08, 0.45, 0.08, '#766c50', x + dx, 0.27, 3.8);
  }
}

function parqueMinas(d: Diorama): void {
  detailGround(d, '#849566');
  const wing = (x: number, z: number, w: number, depth: number, floors: number) => {
    d.box(w, floors * 0.58, depth, '#dbd9c8', x, 0.27, z);
    hipRoof(d, w + 0.16, 0.3, depth + 0.18, '#9c5d42', x, 0.27 + floors * 0.58, z);
    const n = Math.floor(w / 0.38);
    for (let floor = 0; floor < floors; floor++) {
      for (let i = 0; i < n; i++)
        d.box(
          0.21,
          0.3,
          0.025,
          '#46504a',
          x - w / 2 + 0.25 + (i * (w - 0.5)) / Math.max(1, n - 1),
          0.42 + floor * 0.58,
          z + depth / 2 + 0.015,
        );
      d.box(w + 0.02, 0.065, 0.26, '#efecda', x, 0.42 + floor * 0.58, z + depth / 2 + 0.09);
      d.box(w, 0.1, 0.035, '#cac8b9', x, 0.69 + floor * 0.58, z + depth / 2 + 0.22);
    }
    for (const dx of [-w * 0.28, 0, w * 0.28])
      d.box(0.13, 0.29, 0.17, '#b7aa91', x + dx, 0.27 + floors * 0.58 + 0.1, z);
  };
  wing(-2.6, -2.1, 5.1, 1.1, 2);
  wing(2.8, -2.4, 5.2, 1.1, 2);
  wing(0.6, -1, 2.7, 0.95, 2);
  wing(-3.5, 2.2, 2.65, 2.1, 3);
  for (let i = 0; i < 8; i++)
    d.box(1.4, 0.045 * (i + 1), 0.22, '#bdb39a', -1, 0.27, 0.9 - i * 0.22);
  d.box(1.25, 0.025, 1.65, '#567f78', -1, 0.29, 2.7);
  const pool = new THREE.Shape()
    .moveTo(-1.75, -0.65)
    .lineTo(-0.65, -0.8)
    .lineTo(-0.4, -0.35)
    .lineTo(0.55, -0.48)
    .lineTo(0.9, -0.1)
    .lineTo(1.7, -0.15)
    .lineTo(1.95, 0.5)
    .lineTo(1.35, 0.85)
    .lineTo(0.5, 0.65)
    .lineTo(0.15, 0.15)
    .lineTo(-1.45, 0.45)
    .closePath();
  const surface = new THREE.ShapeGeometry(pool);
  surface.rotateX(-Math.PI / 2);
  d.add(surface, '#568d91', new THREE.Vector3(2.6, 0.31, 2.5));
  for (const [x, z] of [
    [-5, -3.5],
    [-3, -3.9],
    [-0.2, -3.9],
    [2, -4.3],
    [4.8, -4],
    [5, 0],
    [-5.1, 0],
    [0, 3.9],
    [4.8, 3.8],
  ] as const)
    d.tree(x, 0.27, z, 0.58, 'native', x + z);
}

function mataojo(d: Diorama): void {
  detailGround(d, '#77855b');
  for (const z of [-4.1, 4.1])
    d.add(
      new THREE.SphereGeometry(1, 20, 10),
      '#77855b',
      new THREE.Vector3(0, 0.55, z),
      new THREE.Euler(),
      new THREE.Vector3(2.3, 0.45, 1.8),
    );
  for (let i = 0; i < 16; i++) d.box(0.025, 0.035, 6.8, '#485247', -0.8 + (i * 1.6) / 15, 0.96, 0);
  for (let i = 0; i < 54; i++)
    d.box(1.65, 0.035, 0.025, '#485247', 0, 0.96, -3.35 + (i * 6.7) / 53);
  for (const x of [-0.85, 0.85]) {
    for (const y of [1.2, 1.48, 1.78]) d.box(0.05, 0.05, 7, '#35453b', x, y, -0.05);
    for (let i = 0; i < 8; i++) d.box(0.07, 0.82, 0.07, '#35453b', x, 0.96, -3.3 + (i * 6.6) / 7);
  }
  for (const [x, z] of [
    [-2.1, -3.4],
    [-3.8, -1.2],
    [-2.8, 1.6],
    [-2.2, 3.6],
    [2, -3.8],
    [3.4, -2],
    [2.8, 1.4],
    [2.1, 3.8],
    [4.8, 0.5],
    [-4.8, 1],
  ] as const)
    d.tree(x, 0.27, z, 0.85, 'native', x + z);
}

function destacamento(d: Diorama): void {
  const g = detailGround(d, '#879261'),
    y = 0.27;
  d.box(3.1, 1.35, 2.3, '#9d927c', -1.3, y, -0.7);
  d.roof(3.26, 0.52, 2.46, '#52514c', -1.3, y + 1.35, -0.7);
  d.box(2.3, 1.3, 2.1, '#ae5637', 1.4, y, -1.1);
  d.box(2.5, 0.14, 2.3, '#46695c', 1.4, y + 1.3, -1.1);
  d.box(0.28, 0.8, 0.32, '#d2cbb6', 2.3, y + 1.2, -1.6);
  d.box(1.28, 0.7, 0.035, '#3c4e46', -1.3, y + 0.38, 0.47);
  for (let i = 0; i < 7; i++) d.box(0.025, 0.7, 0.025, '#8f8d78', -1.89 + i * 0.196, y + 0.38, 0.5);
  for (const dy of [0.12, 0.35, 0.58])
    d.box(1.28, 0.025, 0.025, '#8f8d78', -1.3, y + 0.38 + dy, 0.5);
  d.box(0.48, 1.02, 0.035, '#544d3b', 1.2, y, -0.03);
  for (let i = 0; i < 33; i++) {
    const x = -2.7 + (i % 11) * 0.27,
      z = 0.48,
      row = Math.floor(i / 11);
    d.rock(x, y + row * 0.38 + 0.1, z, 0.16, 0.1, 0.035, i % 3 ? '#9e927a' : '#ada08a', i);
  }
  d.path(
    [
      [-1, 4.7],
      [-0.3, 2.7],
      [0.3, 1.3],
      [1.2, 0.2],
    ],
    g,
    0.32,
    '#b6ae91',
  );
  for (const x of [-3.8, -2.6, -1.4, 1, 2.2, 3.4, 4.6])
    d.box(0.09, 0.8, 0.09, '#87734f', x, 0.27, 3.1);
  for (const x of [-0.5, 0.55]) d.box(0.1, 1, 0.1, '#78613f', x, 0.27, 3.1);
  for (let i = 0; i < 8; i++) d.box(0.08, 0.64, 0.06, '#78613f', -0.42 + i * 0.13, 0.27, 3.1);
  for (const [x, z] of [
    [-4, -2.5],
    [3.3, -3.4],
    [-3.9, 1.4],
    [4.5, 1.6],
  ] as const)
    d.tree(x, 0.27, z, 0.7, 'native', x);
}

function aguasBlancasCabins(d: Diorama): void {
  detailGround(d, '#8f936b');
  for (const [x, z] of [
    [-2.5, 0.6],
    [2.1, -0.8],
  ] as const) {
    const y = 0.27;
    d.box(2.7, 1.5, 4.3, '#a75e32', x, y, z);
    d.box(3.2, 0.06, 4.8, '#b9b9a1', x, y - 0.03, z);
    const shape = new THREE.Shape()
      .moveTo(-1.48, 0)
      .lineTo(-0.35, 0.28)
      .lineTo(1.48, 0)
      .closePath();
    const roof = new THREE.ExtrudeGeometry(shape, { depth: 4.5, bevelEnabled: false });
    roof.translate(0, 0, -2.25);
    d.add(roof, '#747d7c', new THREE.Vector3(x, y + 1.5, z));
    for (let i = 0; i < 22; i++)
      for (const end of [-2.16, 2.16])
        d.box(0.012, 1.47, 0.012, '#8f4e2b', x - 1.28 + i * 0.12, y, z + end);
    for (let i = 0; i < 34; i++)
      d.box(0.012, 1.45, 0.012, '#8f4e2b', x + 1.36, y, z - 2 + i * 0.12);
    for (const dx of [-0.65, 0.4]) d.box(0.32, 0.76, 0.025, '#293c37', x + dx, y + 0.45, z + 2.17);
    d.box(0.025, 1.2, 1.7, '#344540', x + 1.37, y + 0.12, z + 0.2);
    d.box(0.8, 0.12, 2.05, '#373d37', x + 1.6, y + 1.4, z + 0.2);
    d.box(0.06, 1.2, 0.06, '#242d29', x + 1.4, y + 0.12, z + 0.2);
  }
  for (const [x, z] of [
    [-4, -3.3],
    [-2.7, -3.7],
    [0.3, -3.7],
    [3, -4],
    [4.9, 1.6],
    [-4.8, 2.1],
  ] as const)
    d.tree(x, 0.27, z, 0.72, 'eucalyptus', x + z);
}

function libroGigante(d: Diorama): void {
  detailGround(d, '#838968');
  const slab = (
    x: number,
    y: number,
    width: number,
    depth: number,
    h: number,
    row: number,
    seed: number,
  ) => {
    const chip = 0.08 + ((row * 7 + seed) % 5) * 0.055;
    const shape = new THREE.Shape()
      .moveTo(-width / 2, depth / 2)
      .lineTo(width / 2 - chip, depth / 2 + 0.02)
      .lineTo(width / 2, depth / 2 - chip)
      .lineTo(width / 2 - 0.03, -depth / 2 + chip)
      .lineTo(width * 0.21, -depth / 2 - chip * 0.4)
      .lineTo(width * 0.15, -depth / 2 + chip * 0.65)
      .lineTo(-width * 0.18, -depth / 2 - 0.03)
      .lineTo(-width / 2 + chip, -depth / 2 + chip * 0.2)
      .lineTo(-width / 2, -depth * 0.25)
      .closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
    geometry.rotateX(-Math.PI / 2);
    d.add(
      geometry,
      row % 4 ? '#999c90' : '#7c8478',
      new THREE.Vector3(x, y, -0.8 + Math.sin(row * 1.07 + seed) * 0.06),
      new THREE.Euler(0, 0, seed === 1 ? -0.04 : 0.025),
    );
  };
  for (const [center, width, seed, layers] of [
    [-2.15, 3.65, 1, 39],
    [1.95, 3.3, 4, 35],
  ] as const) {
    let y = 0.27;
    for (let row = 0; row < layers; row++) {
      const h = 0.055 + ((row * 7 + seed) % 8) * 0.011,
        depth = 2.1 + Math.sin(row * 1.3 + seed) * 0.23;
      const w =
        width - (row > layers - 6 ? (row - layers + 6) * 0.09 : 0) + Math.sin(row * 1.7) * 0.12;
      const crack = Math.sin(row * 0.23 + seed) * 0.17;
      if ((row + seed) % 4 !== 0) {
        const left = w * 0.43 + crack,
          right = w - left - 0.065;
        slab(center - w / 2 + left / 2, y, left, depth, h, row, seed);
        slab(center + w / 2 - right / 2, y + 0.009, right, depth - 0.07, h, row, seed + 3);
      } else slab(center, y, w, depth, h, row, seed);
      y += h + 0.009;
    }
  }
  for (let i = 0; i < 19; i++)
    d.rock(
      -4 + ((i * 7) % 17) * 0.49,
      0.28,
      1.1 + (i % 4) * 0.35,
      0.13 + (i % 3) * 0.08,
      0.05,
      0.16,
      '#999c8e',
      i,
    );
}

function campingArequita(d: Diorama): void {
  detailGround(d, '#889461');
  const water = new THREE.Shape()
    .moveTo(-4, 0)
    .bezierCurveTo(-4, -2.1, -2.7, -2.6, 0, -2.5)
    .bezierCurveTo(3.8, -2.4, 4.5, -1, 3.2, 0.1)
    .bezierCurveTo(2.5, 0.8, 3.9, 1.8, 2.6, 2.4)
    .bezierCurveTo(-0.5, 3, -4, 2, -4, 0)
    .closePath();
  const wall = new THREE.ExtrudeGeometry(water, {
    depth: 0.4,
    bevelEnabled: false,
    curveSegments: 20,
  });
  wall.rotateX(-Math.PI / 2);
  d.add(wall, '#57a4ba', new THREE.Vector3(0, 0.28, 0));
  const points = water.getPoints(100),
    border = new THREE.Shape(points.map((p) => p.clone().multiplyScalar(1.035)));
  border.holes.push(new THREE.Path(points));
  const rim = new THREE.ExtrudeGeometry(border, { depth: 0.06, bevelEnabled: false });
  rim.rotateX(-Math.PI / 2);
  d.add(rim, '#a47b5d', new THREE.Vector3(0, 0.68, 0));
  d.add(
    new THREE.CylinderGeometry(1.35, 1.35, 0.18, 48),
    '#4c9fb8',
    new THREE.Vector3(-1.75, 0.77, -0.15),
  );
  for (const x of [-3, -2.65])
    d.line(
      [
        new THREE.Vector3(x, 0.45, -1.8),
        new THREE.Vector3(x, 1.12, -1.8),
        new THREE.Vector3(x, 1.25, -2.1),
        new THREE.Vector3(x, 0.78, -2.4),
      ],
      0.025,
      '#a9b5aa',
    );
  countryHouse(d, -3.7, 0.27, -3.8, 1.5, 1.3, '#a54d3e');
  countryHouse(d, 3.6, 0.27, -3.7, 1.5, 1.3, '#a54d3e');
  for (const [x, z] of [
    [-4.9, -2.9],
    [-2.1, -4.1],
    [0.1, -4.2],
    [2.1, -4.1],
    [4.9, -2.4],
    [-4.7, 2.7],
    [4.8, 2.4],
  ] as const)
    d.tree(x, 0.27, z, 0.75, 'eucalyptus', x);
  for (const x of [-1.1, 1.1]) d.box(0.1, 1.3, 0.1, '#b0b3a4', x, 0.27, 4.05);
  d.box(2.5, 0.65, 0.12, '#a4493d', 0, 0.75, 4.05);
  for (const y of [0.75, 1.39]) d.box(2.6, 0.06, 0.14, '#dbd7c8', 0, y, 4.05);
  d.group.userData.detailComposition =
    'Photographed pool with circular blue island, low red cabins, timber sign and trees; not a surveyed campground plan.';
}

type LandCoverGrid = {
  grid: number;
  localWidth: number;
  localDepth: number;
  cells: number[];
  source: unknown;
};
type RiverPolygon = { outer: number[][]; holes: number[][][] };
function mappedLandscape(d: Diorama, id: number): void {
  const mask = (landcover as Record<string, LandCoverGrid>)[String(id)];
  if (!mask) throw new Error(`No reference land-cover mask for GMS-${id}`);
  const river = (localRivers as Record<string, (typeof localRivers)['7']>)[String(id)];
  const inRing = (x: number, z: number, ring: number[][]): boolean => {
    let on = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i]!,
        b = ring[j]!;
      if (a[1]! > z !== b[1]! > z && x < ((b[0]! - a[0]!) * (z - a[1]!)) / (b[1]! - a[1]!) + a[0]!)
        on = !on;
    }
    return on;
  };
  const polygons = (river?.polygons ?? []) as RiverPolygon[];
  const riverDistance = (x: number, z: number): number => {
    let minimum = Infinity,
      on = false;
    for (const polygon of polygons) {
      on ||= inRing(x, z, polygon.outer) && !polygon.holes.some((hole) => inRing(x, z, hole));
      for (const ring of [polygon.outer, ...polygon.holes])
        for (let i = 1; i < ring.length; i++) {
          const a = ring[i - 1]!,
            b = ring[i]!,
            dx = b[0]! - a[0]!,
            dz = b[1]! - a[1]!,
            length = dx * dx + dz * dz;
          if (length < 1e-12) continue;
          const t = THREE.MathUtils.clamp(((x - a[0]!) * dx + (z - a[1]!) * dz) / length, 0, 1);
          minimum = Math.min(minimum, Math.hypot(x - a[0]! - t * dx, z - a[1]! - t * dz));
        }
    }
    return on ? -minimum : minimum;
  };
  const level = (x: number, z: number) =>
    river ? river.plane[0]! * x + river.plane[1]! * z + river.plane[2]! : 0;
  const g = measuredGround(
    d,
    id,
    id === 8 ? 3.4 : id === 21 ? 1.7 : 1.55,
    river
      ? (x, z, y) => {
          const distance = riverDistance(x, z),
            water = level(x, z);
          if (distance < 0.27) return Math.min(y, water - 0.07);
          if (distance < 0.55)
            return THREE.MathUtils.lerp(Math.min(y, water - 0.07), y, (distance - 0.27) / 0.28);
          return y;
        }
      : id === 8
        ? marmarajaRelief
        : undefined,
  );
  const cellW = mask.localWidth / mask.grid,
    cellD = mask.localDepth / mask.grid;
  for (let i = 0; i < mask.cells.length; i++) {
    const x = (((i % mask.grid) + 0.5) / mask.grid) * mask.localWidth - mask.localWidth / 2,
      z = ((Math.floor(i / mask.grid) + 0.5) / mask.grid) * mask.localDepth - mask.localDepth / 2;
    if (mask.cells[i] === 1 && riverDistance(x, z) > 0.09) {
      const height = 0.11 + (i % 4) * 0.012;
      d.add(
        new THREE.IcosahedronGeometry(1, 1),
        i % 3 ? '#516a43' : '#64794a',
        new THREE.Vector3(x, g.height(x, z) + height * 0.65, z),
        new THREE.Euler(0, i * 0.7, 0),
        new THREE.Vector3(cellW * 0.64, height, cellD * 0.64),
      );
    }
    if (mask.cells[i] === 2)
      for (let j = 0; j < 3; j++) {
        const px = x + Math.sin(i * 3 + j * 2.4) * cellW * 0.31,
          pz = z + Math.cos(i * 1.3 + j * 2.4) * cellD * 0.31;
        const size = cellW * (0.12 + (j % 2) * 0.07);
        if (id === 21 || id === 57)
          d.add(
            new THREE.BoxGeometry(size * 2.2, size * 0.45, size * 1.2),
            j % 2 ? '#a1a18f' : '#8d9482',
            new THREE.Vector3(px, g.height(px, pz) + size * 0.15, pz),
            new THREE.Euler(0.25, (i % 5) * 0.3, 0.12),
          );
        else
          d.rock(
            px,
            g.height(px, pz) - size * 0.1,
            pz,
            size * 1.5,
            size * 0.48,
            size,
            id === 12 ? (j % 2 ? '#ada38c' : '#999d8a') : '#a3a592',
            i + j,
          );
      }
  }
  for (const polygon of polygons) {
    const shape = new THREE.Shape(polygon.outer.map(([x, z]) => new THREE.Vector2(x!, -z!)));
    for (const hole of polygon.holes)
      shape.holes.push(new THREE.Path(hole.map(([x, z]) => new THREE.Vector2(x!, -z!))));
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(-Math.PI / 2);
    const position = geometry.getAttribute('position');
    for (let i = 0; i < position.count; i++)
      position.setY(i, level(position.getX(i), position.getZ(i)) + 0.025);
    geometry.computeVertexNormals();
    d.add(geometry, '#5e8073');
  }
  d.group.userData.landCover = {
    source: mask.source,
    interpretation:
      'Orthophoto RGB classification of canopy and pale exposed-ground footprints; species and individual trees are not identified.',
  };
  if (river) d.group.userData.hydrography = river.source;
  if (id === 8) addMarmarajaOutcrops(d, g);
}

export function createNatural(id: number): THREE.Group | null {
  if (!(naturalIds as readonly number[]).includes(id)) return null;
  const d = new Diorama();
  d.group.name = `GMS-${String(id).padStart(2, '0')} - estudio del paisaje`;
  d.group.userData.reconstruction = {
    photoSurvey: false,
    measuredBuildings: false,
    qa: 'pending-independent-review',
    sourceManifest: 'src/data/landmark-references-natural.json',
  };
  if (addWaterLandmark(d, id)) return d.finish();
  if (id === 2) cura(d);
  else if (id === 18) caveAmarilla(d);
  else if (id === 50) grutaColon(d);
  else if (id === 51) ombues(d);
  else if (id === 55) guarida(d);
  else if (id === 56) mangas(d);
  else if (id === 58) hiloVida(d);
  else if (id === 59) mistico(d);
  else if (id === 20) libroGigante(d);
  else if (id === 24) aguasBlancasCabins(d);
  else if (id === 5) destacamento(d);
  else if (id === 16) ose(d);
  else if (id === 17) parqueMinas(d);
  else if (id === 26) mataojo(d);
  else if (id === 4) nacientes(d);
  else if (id === 13) portugues(d);
  else if (id === 19) ramallo(d);
  else if (id === 25) caperuza(d);
  else if (id === 53) campingArequita(d);
  else if ([3, 6, 7, 8, 12, 15, 21, 57].includes(id)) mappedLandscape(d, id);
  else throw new RangeError(`No authored landscape for GMS-${id}`);
  return d.finish();
}

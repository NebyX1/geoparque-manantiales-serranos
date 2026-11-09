import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { layoutCluster } from './clusters';
import { gatewayPosition, type Gateway } from './gateways';
import type { ExperienceCluster } from './types';

export interface HouseCollider {
  x: number;
  z: number;
  radius: number;
}
interface Palette {
  wall: string;
  roof: string;
  trim: string;
  floor: string;
  accent: string;
}
const themes: readonly Palette[] = [
  { wall: '#a1a18b', roof: '#586f5b', trim: '#ddd7ba', floor: '#b1aa8b', accent: '#a4d4a4' },
  { wall: '#acc3bf', roof: '#4f8190', trim: '#e2dfcb', floor: '#b6d0c8', accent: '#94e0e5' },
  { wall: '#a48760', roof: '#547c74', trim: '#dfcda7', floor: '#bba87e', accent: '#e4bd70' },
  { wall: '#ddcfad', roof: '#a26852', trim: '#728e86', floor: '#d5c8a8', accent: '#c9f1d6' },
  { wall: '#b6c8c1', roof: '#4b7a91', trim: '#e6ddbd', floor: '#afbfb5', accent: '#9edbe8' },
  { wall: '#ae7860', roof: '#526b6a', trim: '#dfc297', floor: '#c0ab8b', accent: '#f1cf8a' },
  { wall: '#899088', roof: '#627476', trim: '#b8ad83', floor: '#a3a18e', accent: '#edbf6a' },
  { wall: '#53717b', roof: '#35616d', trim: '#c3c6b4', floor: '#78909a', accent: '#a1e8ed' },
];

function builder(group: THREE.Group) {
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const material = (color: string) => {
    let value = materials.get(color);
    if (!value) {
      value = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.88,
        flatShading: true,
        side: THREE.DoubleSide,
      });
      materials.set(color, value);
    }
    return value;
  };
  const mesh = (geometry: THREE.BufferGeometry, color: string, x = 0, y = 0, z = 0) => {
    const value = new THREE.Mesh(geometry, material(color));
    value.position.set(x, y, z);
    value.castShadow = value.receiveShadow = true;
    group.add(value);
    return value;
  };
  const box = (
    width: number,
    height: number,
    depth: number,
    color: string,
    x = 0,
    y = height / 2,
    z = 0,
  ) => mesh(new THREE.BoxGeometry(width, height, depth), color, x, y, z);
  return { mesh, box };
}

function nameplate(
  group: THREE.Group,
  title: string,
  subtitle: string,
  x: number,
  y: number,
  z: number,
  width = 11,
) {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 192;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.fillStyle = '#0b292ce8';
  context.fillRect(0, 0, 768, 192);
  context.strokeStyle = '#a4e2d1';
  context.lineWidth = 3;
  context.strokeRect(5, 5, 758, 182);
  context.textAlign = 'center';
  context.fillStyle = '#e5f6e7';
  context.font = '600 37px "Montserrat Variable", sans-serif';
  const words = title.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (context.measureText(next).width > 710 && current) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  lines
    .slice(0, 2)
    .forEach((line, index) => context.fillText(line, 384, lines.length > 1 ? 53 + index * 44 : 77));
  context.font = '500 24px "Montserrat Variable", sans-serif';
  context.fillStyle = '#a3d9d0';
  context.fillText(subtitle, 384, 159, 710);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  sprite.position.set(x, y, z);
  sprite.scale.set(width, width / 4, 1);
  sprite.userData['label'] = title;
  group.add(sprite);
  return sprite;
}

function gable(width: number, depth: number, eave: number, rise: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, eave);
  shape.lineTo(width / 2, eave);
  shape.lineTo(0, eave + rise);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function curvedRoof(width: number, depth: number, eave: number, rise: number) {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let index = 0; index <= 20; index++) {
    const x = (index / 20 - 0.5) * width;
    const y = eave + rise * Math.sqrt(Math.max(0, 1 - ((x * 2) / width) ** 2));
    positions.push(x, y, -depth / 2, x, y, depth / 2);
    if (index < 20) {
      const a = index * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Consolidate opaque static pieces; lettering remains separate. */
function batch(group: THREE.Group) {
  const sets = new Map<string, { material: THREE.Material; parts: THREE.BufferGeometry[] }>();
  const originals: THREE.Mesh[] = [];
  group.children.forEach((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) return;
    object.updateMatrix();
    const geometry = object.geometry.clone().applyMatrix4(object.matrix);
    const key = `${object.material.uuid}/${Boolean(geometry.index)}/${Object.keys(geometry.attributes).sort().join(',')}`;
    const set: { material: THREE.Material; parts: THREE.BufferGeometry[] } = sets.get(key) ?? {
      material: object.material,
      parts: [],
    };
    set.parts.push(geometry);
    sets.set(key, set);
    originals.push(object);
  });
  for (const set of sets.values()) {
    const geometry = mergeGeometries(set.parts, false);
    set.parts.forEach((part) => part.dispose());
    if (!geometry) throw new Error('No se pudo preparar la geometría de una casa virtual.');
    const mesh = new THREE.Mesh(geometry, set.material);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
  }
  originals.forEach((mesh) => {
    group.remove(mesh);
    mesh.geometry.dispose();
  });
}

function rectangularWalls(group: THREE.Group, palette: Palette, height = 5.8) {
  const { box } = builder(group);
  box(0.45, height, 10, palette.wall, -5.8);
  box(0.45, height, 10, palette.wall, 5.8);
  box(12, height, 0.45, palette.wall, 0, height / 2, -4.8);
  // The front has a real 4.4-wide / 5.2-high opening, not a solid façade.
  box(3.6, height, 0.45, palette.wall, -4.1, height / 2, 4.8);
  box(3.6, height, 0.45, palette.wall, 4.1, height / 2, 4.8);
  if (height > 5.2) box(4.6, height - 5.2, 0.45, palette.wall, 0, (height + 5.2) / 2, 4.8);
}

function perimeter(style: number): HouseCollider[] {
  const points: HouseCollider[] = [];
  if (style === 0 || style === 1 || style === 7) {
    for (let step = 0; step < 40; step++) {
      const angle = (step / 40) * Math.PI * 2;
      const x = Math.cos(angle) * 5.7,
        z = Math.sin(angle) * 5.7;
      if (z > 3.8 && Math.abs(x) < 2.7) continue;
      points.push({ x, z, radius: 0.7 });
    }
  } else {
    for (let z = -4.8; z <= 4.8; z += 1.2)
      points.push({ x: -5.8, z, radius: 0.75 }, { x: 5.8, z, radius: 0.75 });
    for (let x = -5.8; x <= 5.8; x += 1.2) {
      points.push({ x, z: -4.8, radius: 0.75 });
      if (Math.abs(x) > 2.3) points.push({ x, z: 4.8, radius: 0.7 });
    }
  }
  return points;
}

const thresholdZ = 5.3;
const approachEndZ = 9.5;
const approachHalfWidth = 2;
const porchHeight = 0.195;

function houseFootprint(style: number, x: number, z: number) {
  return style === 0 || style === 1 || style === 7
    ? Math.hypot(x, z) <= 7
    : Math.abs(x) <= 6.3 && Math.abs(z) <= 5.3;
}

/** Keep the virtual building above the relief, with a walkable access to its threshold. */
function houseGround(
  cluster: ExperienceCluster,
  style: number,
  ground: number | ((x: number, z: number) => number),
) {
  const groundAt = typeof ground === 'number' ? () => ground : ground;
  const heights = [groundAt(cluster.x, cluster.z)];
  for (let z = -7; z <= 7; z += 0.5)
    for (let x = -7; x <= 7; x += 0.5)
      if (houseFootprint(style, x, z)) heights.push(groundAt(cluster.x + x, cluster.z + z));
  for (let step = 0; step <= 56; step++) {
    const t = step / 56;
    if (style === 0 || style === 1 || style === 7) {
      const angle = t * Math.PI * 2;
      heights.push(groundAt(cluster.x + Math.cos(angle) * 7, cluster.z + Math.sin(angle) * 7));
    } else {
      for (const side of [-1, 1])
        heights.push(
          groundAt(cluster.x + side * 6.3, cluster.z + (t - 0.5) * 10.6),
          groundAt(cluster.x + (t - 0.5) * 12.6, cluster.z + side * 5.3),
        );
    }
  }
  return { groundAt, height: Math.max(...heights), low: Math.min(...heights) };
}

/** Original virtual architecture: these are gateways, never replicas of real buildings. */
export function createClusterHouse(
  cluster: ExperienceCluster,
  ground: number | ((x: number, z: number) => number),
) {
  const group = new THREE.Group();
  const style = ((cluster.style % themes.length) + themes.length) % themes.length;
  const { groundAt, height, low } = houseGround(cluster, style, ground);
  const p = themes[style]!;
  const { box, mesh } = builder(group);
  group.name = `${cluster.name} — edificio virtual`;
  group.userData['virtualBuilding'] = true;
  group.userData['clusterId'] = cluster.id;
  group.userData['style'] = style;
  group.position.set(cluster.x, height, cluster.z);
  const foundationHeight = height - low + 0.2;
  if (style === 0 || style === 1 || style === 7) {
    mesh(
      new THREE.CylinderGeometry(6.9, 7, foundationHeight, style === 1 ? 6 : 24),
      p.floor,
      0,
      -0.2 - foundationHeight / 2,
    );
    mesh(new THREE.CylinderGeometry(6.6, 7.0, 0.36, style === 1 ? 6 : 24), p.floor, 0, -0.08);
  } else {
    box(12.6, foundationHeight, 10.6, p.floor, 0, -0.2 - foundationHeight / 2);
    box(12.6, 0.36, 10.6, p.floor, 0, -0.08);
  }

  if (style === 0) {
    for (let segment = 0; segment < 20; segment++) {
      const angle = (segment / 20) * Math.PI * 2;
      const x = Math.cos(angle) * 5.7,
        z = Math.sin(angle) * 5.7;
      if (z > 3.8 && Math.abs(x) < 2.7) continue;
      const block = box(1.8, 5.5, 0.65, p.wall, x, 2.75, z);
      block.rotation.y = -angle + Math.PI / 2;
    }
    mesh(new THREE.ConeGeometry(7.0, 1.8, 20), p.roof, 0, 6.25);
    for (const x of [-2.5, 2.5]) box(0.65, 5.9, 0.8, p.trim, x, 2.95, 5.3);
    box(5.65, 0.6, 0.85, p.trim, 0, 5.55, 5.3);
  } else if (style === 1) {
    for (let side = 0; side < 6; side++) {
      const a = (side / 6) * Math.PI * 2,
        b = ((side + 1) / 6) * Math.PI * 2;
      const x = (Math.cos(a) + Math.cos(b)) * 3;
      const z = (Math.sin(a) + Math.sin(b)) * 3;
      if (z > 4) continue;
      const wall = box(5.8, 4.4, 0.35, p.wall, x, 2.2, z);
      wall.rotation.y = -Math.atan2(Math.sin(b) - Math.sin(a), Math.cos(b) - Math.cos(a));
    }
    for (let index = 0; index < 6; index++) {
      const angle = (index / 6) * Math.PI * 2;
      mesh(
        new THREE.CylinderGeometry(0.2, 0.24, 5.8, 8),
        p.trim,
        Math.cos(angle) * 6,
        2.9,
        Math.sin(angle) * 6,
      );
    }
    mesh(new THREE.ConeGeometry(7.1, 2.0, 6), p.roof, 0, 6.5).rotation.y = Math.PI / 6;
  } else if (style === 2) {
    rectangularWalls(group, p);
    for (let x = -5.2; x <= 5.2; x += 0.7) box(0.1, 5.7, 0.06, p.trim, x, 2.85, -5.05);
    mesh(curvedRoof(13.2, 12, 5.7, 1.5), p.roof);
    for (const x of [-3.3, 3.3]) box(2.2, 1.6, 0.12, '#496969', x, 3.2, 5.05);
  } else if (style === 3) {
    for (const x of [-4.5, 4.5]) {
      box(3.0, 5.4, 9.6, p.wall, x, 2.7, -0.2);
      mesh(gable(3.5, 10.2, 5.4, 1.0), p.roof, x);
      for (const z of [-3, 0, 3]) box(0.12, 1.6, 1.3, '#547a75', x > 0 ? 2.93 : -2.93, 3.0, z);
    }
    box(6.2, 4.8, 2.0, p.wall, 0, 2.4, -4.2);
    for (const x of [-2.75, 2.75])
      mesh(new THREE.CylinderGeometry(0.35, 0.4, 5.8, 10), p.trim, x, 2.9, 5.1);
    box(6.5, 0.55, 0.8, p.trim, 0, 5.75, 5.1);
  } else if (style === 4) {
    rectangularWalls(group, p, 5.4);
    mesh(gable(13.5, 11.8, 5.4, 2.0), p.roof);
    for (const x of [-5.7, 5.7]) {
      for (const z of [-3.2, -0.6, 2.0]) box(0.55, 5.6, 0.28, p.trim, x, 2.8, z);
    }
  } else if (style === 5) {
    rectangularWalls(group, p, 5.5);
    mesh(gable(13.0, 11.5, 5.5, 1.5), p.roof);
    for (const x of [-4.2, 4.2]) {
      box(2.0, 2.2, 0.14, '#49716c', x, 3.0, 5.05);
      for (const dx of [-0.8, 0, 0.8]) box(0.08, 2.1, 0.17, p.trim, x + dx, 3.0, 5.08);
    }
    for (const x of [-5.7, 5.7]) box(0.6, 5.8, 0.8, p.trim, x, 2.9, 5.0);
    box(1.0, 8.0, 1.0, p.wall, 4.6, 4, -3.8);
  } else if (style === 6) {
    rectangularWalls(group, p, 5.4);
    for (const x of [-4.6, 4.6]) {
      const rock = mesh(new THREE.IcosahedronGeometry(1, 1), p.wall, x, 2.7, 4.4);
      rock.scale.set(1.4, 3.2, 1.4);
    }
    for (const x of [-2.8, 2.8]) box(0.45, 5.8, 0.6, p.trim, x, 2.9, 5.3);
    box(6.2, 0.6, 0.8, p.roof, 0, 5.75, 5.3);
    mesh(gable(13.0, 11.4, 5.6, 1.2), p.roof);
  } else {
    for (let segment = 0; segment < 24; segment++) {
      const angle = (segment / 24) * Math.PI * 2;
      const x = Math.cos(angle) * 5.8,
        z = Math.sin(angle) * 5.8;
      if (z > 3.8 && Math.abs(x) < 2.7) continue;
      const wall = box(1.6, 1.0, 0.35, p.wall, x, 0.5, z);
      wall.rotation.y = -angle + Math.PI / 2;
    }
    // The open observing slit also forms the front doorway; it is never a sealed sphere.
    const dome = mesh(
      new THREE.SphereGeometry(6.0, 28, 12, Math.PI / 2 + 0.46, Math.PI * 2 - 0.92, 0, Math.PI / 2),
      p.roof,
      0,
      1.0,
    );
    dome.scale.y = 1.0;
    for (const x of [-2.8, 2.8]) box(0.35, 5.7, 0.6, p.trim, x, 2.85, 5.2);
    box(5.9, 0.45, 0.65, p.trim, 0, 5.65, 5.2);
    mesh(new THREE.TorusGeometry(5.8, 0.08, 5, 32, Math.PI), p.accent, 0, 1.05).rotation.x =
      -Math.PI / 2;
  }
  // The same frame anchors the visible portal, interactions and return position.
  const threshold = new THREE.Object3D();
  threshold.name = 'Umbral de entrada — casa virtual';
  threshold.position.set(0, porchHeight, thresholdZ);
  group.add(threshold);
  const entrance: Gateway = { anchor: threshold, halfWidth: 1.65, approach: 1 };
  for (const x of [-2.05, 2.05]) box(0.1, 4.8, 0.1, p.accent, x, 2.6, thresholdZ);
  box(4.2, 0.1, 0.1, p.accent, 0, 5.05, thresholdZ);
  box(4.2, 0.08, 0.15, p.accent, 0, porchHeight, thresholdZ);

  const local = new THREE.Vector3();
  const world = new THREE.Vector3();
  // Round foundations extend beyond the doorway; keep the porch level until
  // their front edge so the descending ramp cannot run through the solid floor.
  const rampStartZ = style === 0 || style === 1 || style === 7 ? 7.05 : thresholdZ;
  const rampHeight = (x: number, z: number) => {
    const t = THREE.MathUtils.clamp((z - rampStartZ) / (approachEndZ - rampStartZ), 0, 1);
    world.set(x, 0, approachEndZ);
    group.localToWorld(world);
    const endHeight = groundAt(world.x, world.z) + 0.03;
    world.set(x, 0, z);
    group.localToWorld(world);
    return Math.max(
      groundAt(world.x, world.z) + 0.03,
      THREE.MathUtils.lerp(height + porchHeight, endHeight, t),
    );
  };
  const rampStrip = (left: number, right: number, offset: number, skirt = false) => {
    const positions: number[] = [];
    const indices: number[] = [];
    const columns = skirt ? 16 : 1;
    const rowWidth = columns + 1;
    for (let row = 0; row <= 12; row++) {
      const z = THREE.MathUtils.lerp(thresholdZ, approachEndZ, row / 12);
      for (let column = 0; column <= columns; column++) {
        const x = THREE.MathUtils.lerp(left, right, column / columns);
        positions.push(x, rampHeight(x, z) - height + offset, z);
      }
      if (row < 12) {
        for (let column = 0; column < columns; column++) {
          const a = row * rowWidth + column;
          indices.push(a, a + rowWidth, a + 1, a + 1, a + rowWidth, a + rowWidth + 1);
        }
      }
    }
    if (skirt) {
      for (const side of [0, 1]) {
        for (let row = 0; row <= 12; row++) {
          const top = row * rowWidth + side * columns;
          const x = positions[top * 3]!;
          const z = positions[top * 3 + 2]!;
          world.set(x, 0, z);
          group.localToWorld(world);
          const bottom = positions.length / 3;
          positions.push(x, groundAt(world.x, world.z) - height - 0.1, z);
          if (row < 12)
            indices.push(top, top + rowWidth, bottom, bottom, top + rowWidth, bottom + 1);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  };
  group.updateWorldMatrix(true, false);
  mesh(rampStrip(-approachHalfWidth, approachHalfWidth, 0, true), p.floor);
  for (const x of [-1.9, 1.9]) mesh(rampStrip(x - 0.04, x + 0.04, 0.035), p.accent);
  nameplate(
    group,
    cluster.name,
    `${cluster.memberIds.length} LUGARES · CASA VIRTUAL`,
    0,
    8.0,
    1.5,
    8,
  );
  batch(group);
  return {
    group,
    entrance,
    floorAt(x: number, z: number) {
      group.updateWorldMatrix(true, false);
      local.set(x, 0, z);
      group.worldToLocal(local);
      if (
        Math.abs(local.x) <= approachHalfWidth &&
        local.z >= thresholdZ - 0.000001 &&
        local.z <= approachEndZ + 0.000001
      )
        return rampHeight(local.x, local.z);
      return houseFootprint(style, local.x, local.z) ? height + 0.1 : null;
    },
    get door() {
      const position = gatewayPosition(entrance);
      return { x: position.x, z: position.z };
    },
    get colliders() {
      group.updateWorldMatrix(true, false);
      return perimeter(style).map((collider) => {
        const position = group.localToWorld(new THREE.Vector3(collider.x, 0, collider.z));
        return { ...collider, x: position.x, z: position.z };
      });
    },
  };
}

/** Spacious cutaway galleries with a different architectural theme for each gateway. */
export function createClusterInterior(
  cluster: ExperienceCluster,
  layout: ReturnType<typeof layoutCluster>,
) {
  const group = new THREE.Group();
  const style = ((cluster.style % themes.length) + themes.length) % themes.length;
  const p = themes[style]!;
  const { box, mesh } = builder(group);
  group.name = `${cluster.name} — galería virtual ampliada`;
  group.userData['virtualInterior'] = true;
  group.userData['clusterId'] = cluster.id;
  const halfWidth = layout.width / 2,
    halfDepth = layout.depth / 2;
  box(layout.width, 0.4, layout.depth, p.floor, 0, -0.2);
  box(layout.width, 6.3, 0.6, p.wall, 0, 3.15, -halfDepth);
  box(0.6, 3.6, layout.depth, p.wall, -halfWidth, 1.8);
  box(0.6, 3.6, layout.depth, p.wall, halfWidth, 1.8);
  const colliders: HouseCollider[] = [];
  for (let x = -halfWidth; x <= halfWidth; x += 2)
    colliders.push({ x, z: -halfDepth, radius: 1.2 });
  for (let z = -halfDepth; z <= halfDepth; z += 2)
    colliders.push({ x: -halfWidth, z, radius: 1.2 }, { x: halfWidth, z, radius: 1.2 });

  // Side galleries remain open from above and in front for the walking camera.
  for (const side of [-1, 1]) {
    for (let z = -halfDepth + 8; z < halfDepth - 6; z += 16) {
      const x = side * (halfWidth - 2);
      if (style === 0 || style === 6) {
        const column = mesh(new THREE.IcosahedronGeometry(1, 1), p.trim, x, 2.6, z);
        column.scale.set(1.1, 2.9, 1.1);
      } else if (style === 1 || style === 7) {
        mesh(new THREE.CylinderGeometry(0.4, 0.5, 5.8, style === 1 ? 6 : 12), p.trim, x, 2.9, z);
      } else {
        box(style === 5 ? 1.6 : 0.65, 5.6, 0.65, p.trim, x, 2.8, z);
      }
      box(1.4, 0.12, 5.0, p.accent, x, 0.02, z);
    }
  }
  if (style === 0) {
    for (let x = -halfWidth + 6; x < halfWidth; x += 8) {
      const rock = mesh(new THREE.IcosahedronGeometry(1, 1), p.trim, x, 2.7, -halfDepth + 1.5);
      rock.scale.set(4.0, 3.1 + Math.cos(x) * 0.4, 1.2);
    }
  } else if (style === 1) {
    for (const x of [-halfWidth + 4, halfWidth - 4])
      box(1.8, 0.03, layout.depth - 10, '#70a8b2', x, 0.02);
  } else if (style === 2) {
    for (let x = -halfWidth + 1; x < halfWidth; x += 2.3)
      box(0.18, 6.2, 0.7, p.trim, x, 3.1, -halfDepth + 0.4);
  } else if (style === 3) {
    for (let x = -halfWidth + 6; x < halfWidth - 4; x += 12) {
      mesh(new THREE.TorusGeometry(4.0, 0.25, 5, 16, Math.PI), p.trim, x, 1.4, -halfDepth + 0.7);
    }
  } else if (style === 4) {
    for (let x = -halfWidth + 2; x < halfWidth; x += 3)
      box(1.5, 1.8, 0.16, p.roof, x, 3.8, -halfDepth + 0.4);
  } else if (style === 5) {
    for (let row = 0; row < 6; row++) {
      for (let x = -halfWidth + 2 + (row % 2) * 1.2; x < halfWidth; x += 4.6)
        box(4.0, 0.07, 0.15, p.trim, x, 0.7 + row * 0.85, -halfDepth + 0.4);
    }
  } else if (style === 6) {
    for (const x of [-halfWidth + 2, halfWidth - 2])
      box(0.08, 0.02, layout.depth - 8, p.accent, x, 0.03);
  } else {
    for (let index = 0; index < 45; index++) {
      const x = Math.sin(index * 2.399) * (halfWidth - 4);
      const y = 0.8 + ((index * 17) % 47) / 10;
      mesh(
        new THREE.SphereGeometry(0.07 + (index % 3) * 0.025, 5, 4),
        p.accent,
        x,
        y,
        -halfDepth + 0.45,
      );
    }
  }

  for (const point of layout.points) {
    box(10.0, 0.4, 10.0, p.trim, point.x, 0.2, point.z);
    box(10.2, 0.05, 10.2, p.accent, point.x, 0.025, point.z);
    colliders.push({ x: point.x, z: point.z, radius: 5.15 });
    const plaque = nameplate(
      group,
      point.name,
      `GMS ${String(point.id).padStart(2, '0')} · ${point.category}`,
      point.x,
      0.85,
      point.z + 5.8,
      6,
    );
    if (plaque) plaque.userData['siteId'] = point.id;
  }
  const { x, z } = layout.exit;
  // Keep the portal separate from the batched room for third-person cutaway.
  const exitStructure = new THREE.Group();
  exitStructure.name = 'Portal de salida — corte de cámara';
  exitStructure.position.set(x, 0, z);
  exitStructure.userData['exitStructure'] = true;
  group.add(exitStructure);
  const exitBuilder = builder(exitStructure);
  for (const dx of [-2.8, 2.8]) exitBuilder.box(0.3, 5.8, 0.35, p.trim, dx, 2.9);
  exitBuilder.box(5.9, 0.3, 0.35, p.accent, 0, 5.7);
  nameplate(exitStructure, 'Volver al territorio', cluster.name, 0, 7.0, 0.1, 6.5);
  batch(exitStructure);
  // The low floor marker remains a useful exit cue even while the frame is cut.
  box(5.4, 0.05, 3, p.accent, x, 0.04, z);
  nameplate(
    group,
    cluster.name,
    `${layout.points.length} LUGARES · GALERÍA VIRTUAL`,
    0,
    8.0,
    -halfDepth + 1.0,
    Math.min(16, layout.width * 0.5),
  );
  batch(group);
  return {
    group,
    colliders,
    exitStructure,
    exit: { anchor: exitStructure, halfWidth: 2.1, approach: -1 } satisfies Gateway,
  };
}

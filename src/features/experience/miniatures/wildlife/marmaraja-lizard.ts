import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const UP = new THREE.Vector3(0, 1, 0);
const ACTOR_SCALE = 0.88;
const SPEED = 0.58;

/** Read the loaded terrain once. Animation uses this grid, never per-frame raycasts. */
function terrainSampler(content: THREE.Group) {
  let terrain: THREE.Mesh | undefined;
  content.traverse((object) => {
    if (
      object instanceof THREE.Mesh &&
      !Array.isArray(object.material) &&
      object.material.name === 'Relieve numerico Terrarium'
    )
      terrain = object;
  });
  if (!terrain) throw new Error('Falta el relieve de Marmarajá para apoyar el lagarto.');
  const position = terrain.geometry.getAttribute('position');
  const xs = new Set<number>(),
    zs = new Set<number>();
  let minX = Infinity,
    minZ = Infinity,
    maxX = -Infinity,
    maxZ = -Infinity;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i),
      z = position.getZ(i);
    xs.add(x);
    zs.add(z);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  const columns = xs.size,
    rows = zs.size,
    width = maxX - minX,
    depth = maxZ - minZ;
  if (columns < 2 || rows < 2 || columns * rows > 20_000 || width <= 0 || depth <= 0)
    throw new Error('La cuadrícula del relieve de Marmarajá no es compatible.');
  const values = new Float32Array(columns * rows).fill(NaN);
  for (let i = 0; i < position.count; i++) {
    const column = Math.round(((position.getX(i) - minX) / width) * (columns - 1));
    const row = Math.round(((position.getZ(i) - minZ) / depth) * (rows - 1));
    values[row * columns + column] = position.getY(i);
  }
  if (!values.every(Number.isFinite)) throw new Error('El relieve contiene celdas sin altura.');
  return (x: number, z: number) => {
    const fx = THREE.MathUtils.clamp(((x - minX) / width) * (columns - 1), 0, columns - 1);
    const fz = THREE.MathUtils.clamp(((z - minZ) / depth) * (rows - 1), 0, rows - 1);
    const ix = Math.min(columns - 2, Math.floor(fx)),
      iz = Math.min(rows - 2, Math.floor(fz));
    const tx = fx - ix,
      tz = fz - iz;
    return THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(values[iz * columns + ix]!, values[iz * columns + ix + 1]!, tx),
      THREE.MathUtils.lerp(
        values[(iz + 1) * columns + ix]!,
        values[(iz + 1) * columns + ix + 1]!,
        tx,
      ),
      tz,
    );
  };
}

/** Every geometry/material belongs to this miniature and its existing disposal path. */
function createRig() {
  const root = new THREE.Group();
  root.name = 'Lagarto de Marmarajá';
  root.userData.wildlife = 'marmaraja-lizard';
  root.scale.setScalar(ACTOR_SCALE);
  const materials = {
    skin: new THREE.MeshStandardMaterial({ color: '#646d3e', roughness: 0.94 }),
    dark: new THREE.MeshStandardMaterial({ color: '#293d2d', roughness: 0.94 }),
    belly: new THREE.MeshStandardMaterial({ color: '#c9bb84', roughness: 0.94 }),
    eye: new THREE.MeshStandardMaterial({ color: '#b3873f', roughness: 0.52 }),
    pupil: new THREE.MeshStandardMaterial({ color: '#0d1612', roughness: 0.36 }),
  };
  const add = (parent: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    // A contact patch follows the animal; moving it does not redraw the scene shadow map.
    mesh.castShadow = false;
    parent.add(mesh);
    return mesh;
  };
  const oval = (x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
    const geometry = new THREE.SphereGeometry(1, 12, 8);
    geometry.scale(sx, sy, sz).translate(x, y, z);
    return geometry;
  };
  const batch = (parent: THREE.Group, material: THREE.Material, parts: THREE.BufferGeometry[]) => {
    const geometry = mergeGeometries(parts, false);
    parts.forEach((part) => part.dispose());
    if (!geometry) throw new Error('No se pudo construir el lagarto.');
    return add(parent, geometry, material);
  };
  const torso = new THREE.Group();
  torso.position.y = 0.23;
  root.add(torso);
  const body = batch(torso, materials.skin, [
    oval(0, 0, 0, 0.245, 0.14, 0.44),
    oval(0, 0.015, 0.32, 0.2, 0.12, 0.26),
  ]);
  batch(torso, materials.belly, [oval(0, -0.075, 0.02, 0.205, 0.065, 0.4)]);
  // Project markings onto the actual faceted skin once, rather than floating ovals.
  const skin = new THREE.Mesh(body.geometry, materials.skin);
  skin.updateMatrixWorld(true);
  const markerRay = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
  const skinY = (x: number, z: number) => {
    markerRay.ray.origin.set(x, 1, z);
    const hit = markerRay.intersectObject(skin, false)[0];
    if (!hit) throw new Error('Una marca del lagarto queda fuera de la piel.');
    return hit.point.y + 0.003;
  };
  const spot = (x: number, z: number) => {
    const positions: number[] = [],
      segments = 10;
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2,
        b = ((i + 1) / segments) * Math.PI * 2;
      const ax = x + Math.cos(a) * 0.045,
        az = z + Math.sin(a) * 0.052;
      const bx = x + Math.cos(b) * 0.045,
        bz = z + Math.sin(b) * 0.052;
      positions.push(x, skinY(x, z), z, bx, skinY(bx, bz), bz, ax, skinY(ax, az), az);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    // Winding faces the outside of the skin.
    return geometry;
  };
  const stripe = (x: number) => {
    const positions: number[] = [];
    for (let i = 0; i < 18; i++) {
      const a = -0.3 + (i / 18) * 0.6,
        b = -0.3 + ((i + 1) / 18) * 0.6;
      const corners = [
        [x - 0.014, a],
        [x + 0.014, a],
        [x - 0.014, b],
        [x + 0.014, b],
      ];
      for (const index of [0, 2, 1, 1, 2, 3]) {
        const [px, pz] = corners[index]!;
        positions.push(px!, skinY(px!, pz!), pz!);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
  };
  const spots: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const z = -0.29 + (i % 6) * 0.115,
      side = i < 6 ? -1 : 1;
    spots.push(spot(side * (0.09 + (i % 3) * 0.022), z));
  }
  batch(torso, materials.dark, spots);
  // Paired pale dorsal lines remain legible against the grassy landscape.
  batch(torso, materials.belly, [stripe(-0.065), stripe(0.065)]);

  const head = new THREE.Group();
  head.position.set(0, 0.015, 0.49);
  torso.add(head);
  batch(head, materials.skin, [
    oval(0, 0, 0.14, 0.17, 0.104, 0.23),
    oval(0, -0.025, 0.34, 0.133, 0.07, 0.145),
  ]);
  batch(head, materials.belly, [oval(0, -0.064, 0.22, 0.144, 0.027, 0.22)]);
  for (const side of [-1, 1]) {
    add(head, oval(side * 0.14, 0.069, 0.125, 0.044, 0.042, 0.045), materials.eye);
    add(head, oval(side * 0.16, 0.073, 0.144, 0.023, 0.026, 0.025), materials.pupil);
  }
  const nostrils = [-1, 1].map((side) => oval(side * 0.069, 0.015, 0.443, 0.011, 0.012, 0.012));
  batch(head, materials.dark, nostrils);

  const tail: THREE.Group[] = [];
  let parent = torso;
  for (let i = 0; i < 8; i++) {
    const joint = new THREE.Group(),
      length = 0.17 - i * 0.006;
    joint.position.set(0, i === 0 ? -0.025 : 0, i === 0 ? -0.34 : -(0.17 - (i - 1) * 0.006));
    parent.add(joint);
    const radius = 0.104 * (1 - i / 8) + 0.006;
    const segment = new THREE.CylinderGeometry(Math.max(0.007, radius - 0.015), radius, length, 8);
    segment.rotateX(-Math.PI / 2).translate(0, 0, -length / 2);
    add(joint, segment, i % 3 === 1 ? materials.dark : materials.skin);
    tail.push(joint);
    parent = joint;
  }
  const legs = [-1, 1].flatMap((side) =>
    [-1, 1].map((end) => {
      const hipZ = end > 0 ? 0.31 : -0.28;
      const upper = add(root, new THREE.CylinderGeometry(0.037, 0.052, 1, 7), materials.skin);
      const lower = add(root, new THREE.CylinderGeometry(0.022, 0.036, 1, 7), materials.skin);
      const knee = add(root, new THREE.SphereGeometry(0.048, 8, 6), materials.skin);
      const foot = new THREE.Group();
      root.add(foot);
      const parts: THREE.BufferGeometry[] = [oval(0, 0.018, 0.025, 0.057, 0.025, 0.07)];
      for (let toe = -1; toe <= 1; toe++) {
        const digit = new THREE.CylinderGeometry(0.006, 0.011, 0.13, 5);
        digit
          .rotateX(Math.PI / 2)
          .rotateY(toe * 0.27)
          .translate(toe * 0.035, 0.015, 0.1);
        parts.push(digit);
      }
      batch(foot, materials.dark, parts);
      return {
        side,
        end,
        hipZ,
        upper,
        lower,
        knee,
        foot,
        hip: new THREE.Vector3(),
        elbow: new THREE.Vector3(),
        target: new THREE.Vector3(),
      };
    }),
  );
  const contact = add(
    root,
    new THREE.CircleGeometry(0.34, 20),
    new THREE.MeshBasicMaterial({
      color: '#1c281b',
      transparent: true,
      opacity: 0.17,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.scale.set(0.8, 2.2, 1);
  contact.position.set(0, 0.018, -0.14);
  return { root, torso, head, tail, legs, contact };
}

export function addMarmarajaLizard(content: THREE.Group) {
  const ground = terrainSampler(content);
  const rig = createRig();
  content.add(rig.root);
  // A broad loop on the open outer slopes, with room for the head and tail inside the base.
  const path = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-2.5, 0, 3),
      new THREE.Vector3(1, 0, 3.25),
      new THREE.Vector3(3.75, 0, 2),
      new THREE.Vector3(4.05, 0, -0.8),
      new THREE.Vector3(2.6, 0, -3.15),
      new THREE.Vector3(-1.55, 0, -3.3),
      new THREE.Vector3(-3.6, 0, -1.7),
      new THREE.Vector3(-3.85, 0, 1.1),
    ],
    true,
    'centripetal',
  );
  const length = path.getLength();
  const samples = new Float32Array(257 * 2);
  const point = new THREE.Vector3(),
    direction = new THREE.Vector3(),
    next = new THREE.Vector3();
  for (let i = 0; i <= 256; i++) {
    path.getPointAt(i / 256, point);
    samples[i * 2] = point.x;
    samples[i * 2 + 1] = point.z;
  }
  let elapsed = 0,
    previous: number | undefined;
  const limbDirection = new THREE.Vector3();
  const bone = (mesh: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) => {
    limbDirection.subVectors(b, a);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.scale.y = limbDirection.length();
    mesh.quaternion.setFromUnitVectors(UP, limbDirection.normalize());
  };
  const at = (fraction: number, target: THREE.Vector3) => {
    const t = THREE.MathUtils.euclideanModulo(fraction, 1) * 256;
    const i = Math.floor(t),
      blend = t - i;
    return target.set(
      THREE.MathUtils.lerp(samples[i * 2]!, samples[(i + 1) * 2]!, blend),
      0,
      THREE.MathUtils.lerp(samples[i * 2 + 1]!, samples[(i + 1) * 2 + 1]!, blend),
    );
  };
  const pose = () => {
    const progress = (elapsed * SPEED) / length;
    at(progress, point);
    at(progress + 0.003, next);
    direction.subVectors(next, point).normalize();
    const heading = Math.atan2(direction.x, direction.z);
    const sine = Math.sin(heading),
      cosine = Math.cos(heading);
    const height = ground(point.x, point.z);
    rig.root.position.set(point.x, height + 0.018, point.z);
    rig.root.rotation.y = heading;
    const phase = elapsed * Math.PI * 2 * 1.35;
    rig.torso.position.y = 0.23 + Math.sin(phase * 2) * 0.007;
    const ahead = ground(point.x + direction.x * 0.4, point.z + direction.z * 0.4);
    const behind = ground(point.x - direction.x * 0.4, point.z - direction.z * 0.4);
    rig.torso.rotation.x = -Math.atan2(ahead - behind, 0.8) * 0.65;
    rig.torso.rotation.z = Math.sin(phase) * 0.018;
    rig.torso.updateMatrix();
    rig.head.rotation.y = Math.sin(elapsed * 1.2) * 0.045;
    for (let i = 0; i < rig.tail.length; i++) {
      rig.tail[i]!.rotation.y = Math.sin(phase * 0.65 - i * 0.55) * (0.075 + i * 0.009);
      rig.tail[i]!.rotation.x = Math.sin(phase * 0.42 - i * 0.37) * 0.012;
    }
    for (const leg of rig.legs) {
      const cycle = phase + (leg.side * leg.end > 0 ? 0 : Math.PI);
      const stride = Math.sin(cycle) * 0.125,
        lift = Math.max(0, Math.cos(cycle)) * 0.065;
      const footX = leg.side * 0.42,
        footZ = leg.hipZ + stride;
      const x = point.x + (footX * cosine + footZ * sine) * ACTOR_SCALE;
      const z = point.z + (footZ * cosine - footX * sine) * ACTOR_SCALE;
      const footY = (ground(x, z) - height - 0.018) / ACTOR_SCALE + 0.006 + lift;
      leg.hip.set(leg.side * 0.16, 0, leg.hipZ).applyMatrix4(rig.torso.matrix);
      leg.target.set(footX, footY, footZ);
      leg.elbow.set(
        leg.side * 0.36,
        (leg.hip.y + footY) * 0.5 + 0.045,
        leg.hipZ - leg.end * 0.1 + stride * 0.32,
      );
      bone(leg.upper, leg.hip, leg.elbow);
      bone(leg.lower, leg.elbow, leg.target);
      leg.knee.position.copy(leg.elbow);
      leg.foot.position.copy(leg.target);
      leg.foot.rotation.y = leg.side * 0.32;
    }
    rig.contact.rotation.x = -Math.PI / 2 - Math.atan2(ahead - behind, 0.8);
  };
  pose();
  return {
    group: rig.root,
    /** A repeated, paused or rewound scene clock holds the current pose. */
    update(time: number) {
      if (!Number.isFinite(time)) return;
      const delta = previous === undefined ? 0 : time - previous;
      previous = time;
      if (delta <= 0 || delta > 0.5) return;
      elapsed += delta;
      pose();
    },
  };
}

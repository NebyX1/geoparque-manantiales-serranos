import * as THREE from 'three';
import {
  containsTerritory,
  constrainToTerritory,
  territoryHeight,
  territoryBounds,
} from './territory';
import { createTerritoryGeometry } from './territory-mesh';
import { availableClusters, layoutCluster } from './clusters';
import { createClusterHouse, createClusterInterior } from './cluster-houses';
import { gatewayPosition, withinGateway, type Gateway } from './gateways';
import { exitPortalObstructsInterior, houseObstructsPlayer } from './camera-cutaway';
import { computeInspectionViewport, fitInspectionBounds } from './inspection-frame';
import type { ExperienceCluster } from './types';
import { disposeBranch } from './resources';
import { territoryRoads, territoryWaterways } from './territory-routes';
import type {
  LocatedExperiencePoint as ExperiencePoint,
  ExperienceWorld,
  WorldFrame,
  WorldInput,
} from './types';

const PALETTE = {
  grass: '#97a96b',
  meadow: '#bac887',
  forest: '#4c7353',
  leaf: '#728f62',
  darkLeaf: '#365f49',
  bark: '#78654a',
  rock: '#a4a18a',
  sand: '#c5bc8d',
  water: '#648f84',
  mist: '#d7ddc7',
  sunlight: '#fff0c8',
};

function randomGenerator(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function terrainHeight(x: number, z: number) {
  return territoryHeight(x, z);
}

function standard(
  color: THREE.ColorRepresentation,
  extra: THREE.MeshStandardMaterialParameters = {},
) {
  return new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true, ...extra });
}

function addMesh(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  scale: [number, number, number] = [1, 1, 1],
) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function makeTerrain() {
  const data = createTerritoryGeometry();
  const group = new THREE.Group();
  const surface = new THREE.Mesh(data.surface, standard('#ffffff', { vertexColors: true }));
  surface.receiveShadow = true;
  group.add(
    surface,
    new THREE.Mesh(data.sides, standard('#ffffff', { vertexColors: true })),
    new THREE.Mesh(data.base, standard('#344e47')),
    new THREE.LineSegments(
      data.border,
      new THREE.LineBasicMaterial({ color: '#d3e1b1', transparent: true, opacity: 0.55 }),
    ),
  );
  for (const [routes, width, color] of [
    [territoryWaterways, 0.42, '#648f9e'],
    [territoryRoads, 0.3, '#d4c5a4'],
  ] as const) {
    const positions: number[] = [];
    for (const route of routes)
      for (let i = 1; i < route.points.length; i++) {
        const a = route.points[i - 1]!,
          b = route.points[i]!;
        const length = Math.hypot(b.x - a.x, b.z - a.z);
        if (length < 0.001) continue;
        const dx = ((-(b.z - a.z) / length) * width) / 2,
          dz = (((b.x - a.x) / length) * width) / 2;
        const v = [
          [a.x + dx, a.z + dz],
          [a.x - dx, a.z - dz],
          [b.x + dx, b.z + dz],
          [b.x - dx, b.z - dz],
        ];
        for (const index of [0, 1, 2, 2, 1, 3]) {
          const p = v[index]!;
          positions.push(p[0]!, terrainHeight(p[0]!, p[1]!) + 0.055, p[1]!);
        }
      }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, standard(color, { side: THREE.DoubleSide }));
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return group;
}

function makeSky(scene: THREE.Scene) {
  const group = new THREE.Group();
  scene.add(group);
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(450, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        high: { value: new THREE.Color('#83b5bc') },
        low: { value: new THREE.Color('#f6e4ba') },
      },
      vertexShader: `varying vec3 vPosition; void main() { vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        varying vec3 vPosition; uniform vec3 high; uniform vec3 low;
        void main() {
          float h = smoothstep(-0.03, 0.7, normalize(vPosition).y);
          gl_FragColor = vec4(mix(low, high, h), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    }),
  );
  group.add(sky);
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 18, 12),
    new THREE.MeshBasicMaterial({ color: '#ffedb5', fog: false }),
  );
  sun.position.set(-155, 145, -220);
  group.add(sun);
  const random = randomGenerator(9481);
  const count = 20 * 4;
  const clouds = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshLambertMaterial({ color: '#fff2d2', flatShading: true, depthWrite: false }),
    count,
  );
  const object = new THREE.Object3D();
  for (let i = 0; i < 20; i++) {
    const x = (random() - 0.5) * 420;
    const z = (random() - 0.5) * 380;
    const y = 60 + random() * 35;
    const size = 6 + random() * 8;
    for (let j = 0; j < 4; j++) {
      object.position.set(x + j * size * 0.8, y + Math.sin(j) * 1.8, z);
      object.scale.set(size, size * (0.33 + random() * 0.2), size * 0.55);
      object.rotation.set(0, random() * Math.PI, 0);
      object.updateMatrix();
      clouds.setMatrixAt(i * 4 + j, object.matrix);
    }
  }
  clouds.frustumCulled = false;
  group.add(clouds);
  return group;
}

interface TrunkCollider {
  x: number;
  z: number;
  radius: number;
}

function populateLandscape(scene: THREE.Scene, points: readonly { x: number; z: number }[]) {
  const random = randomGenerator(443219);
  const treePositions: { x: number; z: number; size: number }[] = [];
  for (let i = 0; i < 1200 && treePositions.length < 270; i++) {
    const x = (random() - 0.5) * 260;
    const z = (random() - 0.5) * 240;
    if (!containsTerritory(x, z)) continue;
    // Leave room for both the diorama and the orbit camera around documented pins.
    if (points.some((point) => Math.hypot(point.x - x, point.z - z) < 35)) continue;
    const cluster = Math.sin(x * 0.074) + Math.cos(z * 0.058);
    if (cluster < -0.25 && random() < 0.88) continue;
    treePositions.push({ x, z, size: 2.1 + random() * 2.8 });
  }
  const trunkGeometry = new THREE.CylinderGeometry(0.16, 0.3, 1, 5);
  const leafGeometry = new THREE.IcosahedronGeometry(1, 1);
  const trunks = new THREE.InstancedMesh(
    trunkGeometry,
    standard(PALETTE.bark),
    treePositions.length,
  );
  const leaves = new THREE.InstancedMesh(
    leafGeometry,
    standard(PALETTE.leaf),
    treePositions.length * 3,
  );
  trunks.castShadow = true;
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  const object = new THREE.Object3D();
  const leafColor = new THREE.Color();
  const colliders: TrunkCollider[] = [];
  treePositions.forEach(({ x, z, size }, i) => {
    const y = terrainHeight(x, z);
    object.position.set(x, y + size * 0.64, z);
    object.scale.set(size * 0.38, size * 1.3, size * 0.38);
    object.rotation.set(0, random() * Math.PI, (random() - 0.5) * 0.13);
    object.updateMatrix();
    trunks.setMatrixAt(i, object.matrix);
    for (let j = 0; j < 3; j++) {
      object.position.set(
        x + (j - 1) * size * 0.43,
        y + size * (1.72 - j * 0.13),
        z + (j % 2) * size * 0.35,
      );
      object.scale.set(size * (0.83 - j * 0.1), size * (0.82 - j * 0.09), size * 0.76);
      object.rotation.set(random() * 0.5, random() * Math.PI, random() * 0.4);
      object.updateMatrix();
      leaves.setMatrixAt(i * 3 + j, object.matrix);
      leafColor.set(PALETTE.forest).lerp(new THREE.Color(PALETTE.meadow), random() * 0.56);
      leaves.setColorAt(i * 3 + j, leafColor);
    }
    if (containsTerritory(x, z)) colliders.push({ x, z, radius: size * 0.21 + 0.4 });
  });
  scene.add(trunks, leaves);

  const rockCount = 160;
  const rocks = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 0),
    standard(PALETTE.rock),
    rockCount,
  );
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  for (let i = 0; i < rockCount; i++) {
    const x = (random() - 0.5) * 190;
    const z = (random() - 0.5) * 150;
    const visible =
      containsTerritory(x, z) && points.every((point) => Math.hypot(point.x - x, point.z - z) > 20);
    const size = visible ? 0.55 + random() ** 2 * 3 : 0;
    object.position.set(x, terrainHeight(x, z) + size * 0.4, z);
    object.scale.set(size * 1.3, size * 0.7, size);
    object.rotation.set(random(), random() * Math.PI, random() * 0.4);
    object.updateMatrix();
    rocks.setMatrixAt(i, object.matrix);
    if (containsTerritory(x, z) && size > 1.1) colliders.push({ x, z, radius: size * 0.95 + 0.35 });
  }
  scene.add(rocks);

  const grassCount = 1700;
  const grass = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.15, 0.7, 3),
    standard('#78945c', { side: THREE.DoubleSide }),
    grassCount,
  );
  const grassColor = new THREE.Color();
  for (let i = 0; i < grassCount; i++) {
    const x = (random() - 0.5) * 230;
    const z = (random() - 0.5) * 200;
    const height = terrainHeight(x, z);
    const visible =
      height > 0 &&
      containsTerritory(x, z) &&
      points.every((point) => Math.hypot(point.x - x, point.z - z) > 7);
    const size = visible ? 0.6 + random() * 1.7 : 0;
    object.position.set(x, height + size * 0.3, z);
    object.rotation.set((random() - 0.5) * 0.45, random() * Math.PI, 0);
    object.scale.set(size, size, size);
    object.updateMatrix();
    grass.setMatrixAt(i, object.matrix);
    grassColor.set('#7d9157').lerp(new THREE.Color('#d2c985'), random());
    grass.setColorAt(i, grassColor);
  }
  scene.add(grass);
  return { colliders, objects: [trunks, leaves, rocks, grass] };
}

function makeAvatar() {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const jacket = standard('#2d6657');
  const jacketLight = standard('#477867');
  const skin = standard('#dbaf83');
  const trousers = standard('#a8a692');
  const boots = standard('#5b5041');
  const backpack = standard('#cd9f4f');
  const hat = standard('#d4c49a');
  const dark = standard('#3a493b');
  const sphere = new THREE.SphereGeometry(1, 8, 6);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 7);
  const box = new THREE.BoxGeometry(1, 1, 1);
  addMesh(body, sphere, jacket, [0, 2.35, 0], [0.54, 0.73, 0.35]);
  addMesh(body, cylinder, jacketLight, [0, 2.91, 0], [0.23, 0.17, 0.23]);
  addMesh(body, sphere, trousers, [0, 1.68, 0], [0.46, 0.35, 0.3]);
  addMesh(body, sphere, skin, [0, 3.36, -0.015], [0.39, 0.45, 0.37]);
  addMesh(body, sphere, skin, [0, 3.32, -0.36], [0.105, 0.1, 0.12]);
  addMesh(body, cylinder, hat, [0, 3.75, 0], [0.74, 0.09, 0.69]);
  addMesh(body, cylinder, hat, [0, 3.96, 0.015], [0.43, 0.4, 0.4]);
  addMesh(body, cylinder, dark, [0, 3.85, 0.015], [0.44, 0.065, 0.41]);
  addMesh(body, sphere, backpack, [0, 2.36, 0.43], [0.44, 0.59, 0.27]);
  addMesh(body, box, backpack, [0, 2.08, 0.66], [0.48, 0.27, 0.1]);
  for (const x of [-0.31, 0.31]) addMesh(body, box, dark, [x, 2.55, -0.28], [0.075, 0.62, 0.05]);
  const limbs: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.59, 2.79, 0);
    addMesh(arm, cylinder, jacketLight, [0, -0.43, 0], [0.17, 0.8, 0.17]);
    addMesh(arm, sphere, skin, [0, -0.92, 0], [0.16, 0.19, 0.15]);
    body.add(arm);
    limbs.push(arm);
    const leg = new THREE.Group();
    leg.position.set(side * 0.255, 1.6, 0);
    addMesh(leg, cylinder, trousers, [0, -0.56, 0], [0.21, 1.11, 0.21]);
    addMesh(leg, box, boots, [0, -1.25, -0.1], [0.38, 0.32, 0.6]);
    body.add(leg);
    limbs.push(leg);
  }
  return { root, body, limbs };
}

function labelTexture(name: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = 'rgba(25, 51, 42, 0.89)';
    context.beginPath();
    context.roundRect(2, 2, 508, 88, 14);
    context.fill();
    context.strokeStyle = 'rgba(177, 222, 183, 0.65)';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = '#f4f1d9';
    context.font = '600 28px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const label = name.length > 32 ? `${name.slice(0, 30)}…` : name;
    context.fillText(label, 256, 47, 470);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeBeacons(parent: THREE.Object3D, points: ExperiencePoint[], heightAt = terrainHeight) {
  const container = new THREE.Group();
  const base = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(1.3, 1.6, 0.2, 16),
    standard('#d8d5ad'),
    points.length,
  );
  const ring = new THREE.InstancedMesh(
    new THREE.TorusGeometry(1.15, 0.06, 4, 28),
    new THREE.MeshBasicMaterial({ color: '#bbf2cb', transparent: true, opacity: 0.82 }),
    points.length,
  );
  const posts = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.055, 0.055, 2.8, 5),
    new THREE.MeshBasicMaterial({ color: '#e8e9bc' }),
    points.length,
  );
  const orbs = new THREE.InstancedMesh(
    new THREE.OctahedronGeometry(0.53),
    standard('#c4f3cc', { emissive: '#4f8460', emissiveIntensity: 0.5, metalness: 0.15 }),
    points.length,
  );
  const targets = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1.7, 8, 6),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    points.length,
  );
  const object = new THREE.Object3D();
  const labels: THREE.Sprite[] = [];
  points.forEach((point, i) => {
    const height = Math.max(0.16, heightAt(point.x, point.z));
    object.position.set(point.x, height + 0.1, point.z);
    object.rotation.set(0, 0, 0);
    object.scale.set(1, 1, 1);
    object.updateMatrix();
    base.setMatrixAt(i, object.matrix);
    object.position.y = height + 0.3;
    object.rotation.x = -Math.PI / 2;
    object.updateMatrix();
    ring.setMatrixAt(i, object.matrix);
    object.position.y = height + 1.65;
    object.rotation.x = 0;
    object.updateMatrix();
    posts.setMatrixAt(i, object.matrix);
    object.position.y = height + 3.25;
    object.rotation.set(0, Math.PI / 4, 0);
    object.updateMatrix();
    orbs.setMatrixAt(i, object.matrix);
    targets.setMatrixAt(i, object.matrix);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: labelTexture(point.name),
        transparent: true,
        depthWrite: false,
      }),
    );
    sprite.position.set(point.x, height + 5.1, point.z);
    sprite.scale.set(9.1, 1.7, 1);
    sprite.visible = false;
    labels.push(sprite);
    container.add(sprite);
  });
  container.add(base, ring, posts, orbs, targets);
  parent.add(container);
  return { container, targets, labels, orbs, ring, objects: [base, ring, posts, orbs, targets] };
}

export function createWorld(options: {
  canvas: HTMLCanvasElement;
  points: ExperiencePoint[];
  clusters: ExperienceCluster[];
  reducedMotion: boolean;
  pixelRatio?: number;
  onClusterChange?: (id: string | null) => void;
  onSceneChange?: () => void;
  onMiniatureState?: (id: number, state: 'loading' | 'ready' | 'unavailable') => void;
}): ExperienceWorld {
  const { canvas, points, reducedMotion } = options;
  const clusters = availableClusters(options.clusters, points);
  const clusterByPoint = new Map(
    clusters.flatMap((cluster) => cluster.memberIds.map((id) => [id, cluster] as const)),
  );
  const exteriorPoints = points.filter((point) => !clusterByPoint.has(point.id));
  let activePoints = exteriorPoints;
  const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.17;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  let ratio = Math.min(options.pixelRatio ?? window.devicePixelRatio ?? 1, 1.6);
  renderer.setPixelRatio(ratio);
  const scene = new THREE.Scene();
  const landscapeBackground = new THREE.Color(PALETTE.mist);
  const inspectionBackground = new THREE.Color('#071c25');
  const landscapeFog = new THREE.Fog(PALETTE.mist, 83, 208);
  const roomFog = new THREE.Fog('#071c25', 90, 220);
  scene.background = landscapeBackground;
  scene.fog = landscapeFog;
  const camera = new THREE.PerspectiveCamera(51, 1, 0.15, 700);
  const overviewCamera = new THREE.OrthographicCamera(-120, 120, 100, -100, 0.1, 1000);
  overviewCamera.position.set(0, 350, 0.001);
  overviewCamera.up.set(0, 0, -1);
  overviewCamera.lookAt(0, 0, 0);
  let overview = false;
  const sky = makeSky(scene);
  scene.add(makeTerrain());
  scene.add(new THREE.HemisphereLight('#fff3d5', '#617658', 2.1));
  const sun = new THREE.DirectionalLight(PALETTE.sunlight, 3.3);
  sun.position.set(-45, 75, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -38;
  sun.shadow.camera.right = 38;
  sun.shadow.camera.top = 38;
  sun.shadow.camera.bottom = -38;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 170;
  sun.shadow.normalBias = 0.06;
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const landscape = populateLandscape(scene, [...exteriorPoints, ...clusters]);
  const colliders = landscape.colliders;
  const houses = clusters.map((cluster) => {
    const house = createClusterHouse(cluster, terrainHeight);
    const bounds = new THREE.Box3();
    const partBounds = new THREE.Box3();
    house.group.updateWorldMatrix(true, true);
    // Only physical meshes obstruct the camera; the floating name is not a roof.
    house.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.computeBoundingBox();
      if (object.geometry.boundingBox) {
        partBounds.copy(object.geometry.boundingBox).applyMatrix4(object.matrixWorld);
        bounds.union(partBounds);
      }
    });
    return { ...house, bounds };
  });
  houses.forEach((house) => {
    scene.add(house.group);
    colliders.push(...house.colliders);
  });
  let beacons = makeBeacons(scene, exteriorPoints);
  const avatar = makeAvatar();
  scene.add(avatar.root);
  // Study mode isolates the model from the invented landscape. Its geographic
  // anchor stays unchanged; hills and paths cannot cut across the miniature.
  const scenery = new THREE.Group();
  for (const child of [...scene.children]) {
    if (child !== avatar.root && child !== sun.target && !(child instanceof THREE.Light)) {
      scenery.add(child);
    }
  }
  scene.add(scenery);
  const first = points[0];
  const firstHouse = first ? clusterByPoint.get(first.id) : undefined;
  const firstEntrance =
    houses[clusters.findIndex((cluster) => cluster.id === firstHouse?.id)]?.entrance;
  const firstApproach = firstEntrance ? gatewayPosition(firstEntrance, 4.2) : null;
  const initial = constrainToTerritory(
    firstApproach?.x ?? first?.x ?? 0,
    firstApproach?.z ?? (first?.z ?? 0) + 10,
  );
  let activeCluster: ExperienceCluster | null = null;
  let roomLayout: ReturnType<typeof layoutCluster> | null = null;
  let roomScenery: THREE.Group | null = null;
  let roomExitStructure: THREE.Group | null = null;
  let roomExit: Gateway | null = null;
  let roomColliders: TrunkCollider[] = [];
  let gatewayCooldown = 0;
  const floorAt = (x: number, z: number) => {
    if (activeCluster) return 0;
    let height = terrainHeight(x, z);
    for (const house of houses) height = Math.max(height, house.floorAt(x, z) ?? height);
    return height;
  };
  avatar.root.position.set(initial.x, floorAt(initial.x, initial.z), initial.z);
  const cameraTarget = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();
  const targetLook = new THREE.Vector3();
  const actualLook = new THREE.Vector3();
  const cameraForward = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const movement = new THREE.Vector3();
  const labelCameraDirection = new THREE.Vector3();
  const labelOffset = new THREE.Vector3();
  const labelProjection = new THREE.Vector3();
  let viewportWidth = 1440;
  let viewportHeight = 900;
  const frame: WorldFrame = {
    x: avatar.root.position.x,
    z: avatar.root.position.z,
    heading: 0,
    nearestId: null,
    distance: Infinity,
    mapX: avatar.root.position.x,
    mapZ: avatar.root.position.z,
    clusterId: null,
    gateway: null,
  };
  let grounded = true;
  let jumpVelocity = 0;
  let jumpHeight = 0;
  let wasMoving = false;
  let lastJump = false;
  let walkPhase = 0;
  let initialized = false;
  let disposed = false;
  let preferredId: number | null = first?.id ?? null;
  let miniatureId: number | null = null;
  let miniature: THREE.Group | null = null;
  let miniatureStage: THREE.Group | null = null;
  const miniatureBounds = new THREE.Box3();
  const miniatureCenter = new THREE.Vector3();
  let miniatureFocus: THREE.Vector3 | null = null;
  let inspecting = false;
  let miniatureRequest = 0;
  let miniatureApi: typeof import('./miniatures') | null = null;
  const miniaturesModule = () => import('./miniatures');
  let miniaturesPromise: ReturnType<typeof miniaturesModule> | null = null;
  let miniatureQueue: Promise<void> = Promise.resolve();
  const previews = new Map<number, THREE.Group>();
  let previewGeneration = 0;
  let previewKey = '';

  function clearPreviews() {
    ++previewGeneration;
    previews.forEach((group) => miniatureApi?.disposeMiniature(group));
    previews.clear();
    previewKey = '';
  }

  function updatePreviews(x: number, z: number, elapsed: number) {
    if (!activeCluster || !roomScenery || inspecting) return;
    previews.forEach((group) => miniatureApi?.updateMiniature(group, elapsed));
    const wanted = activePoints
      .filter((point) => point.id !== miniatureId)
      .map((point) => ({ point, distance: Math.hypot(point.x - x, point.z - z) }))
      .filter((item) => item.distance < 58)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2)
      .map((item) => item.point);
    const key = `${activeCluster.id}/${wanted.map((point) => point.id).join(',')}`;
    if (key === previewKey) return;
    previewKey = key;
    const generation = ++previewGeneration;
    for (const [id, group] of previews)
      if (!wanted.some((point) => point.id === id)) {
        miniatureApi?.disposeMiniature(group);
        previews.delete(id);
      }
    miniaturesPromise ??= miniaturesModule();
    miniatureQueue = miniatureQueue
      .then(async () => {
        const api = await miniaturesPromise!;
        miniatureApi = api;
        for (const point of wanted) {
          if (disposed || generation !== previewGeneration || !roomScenery) return;
          if (previews.has(point.id)) continue;
          const group = await api.createMiniature(point.id);
          if (disposed || generation !== previewGeneration || !roomScenery) {
            api.disposeMiniature(group);
            return;
          }
          group.scale.setScalar(0.78);
          group.position.set(point.x, 0.58, point.z);
          previews.set(point.id, group);
          roomScenery.add(group);
          renderer.shadowMap.needsUpdate = true;
          options.onSceneChange?.();
        }
      })
      .catch((error: unknown) => {
        if (disposed || generation !== previewGeneration) return;
        console.warn('[Geoparque/exposición]', {
          cluster: activeCluster?.id,
          message: error instanceof Error ? error.message : String(error),
        });
      });
  }

  function showMiniature(id: number) {
    if (disposed || id === miniatureId) return;
    miniatureFocus = null;
    miniatureId = id;
    renderer.shadowMap.needsUpdate = true;
    const request = ++miniatureRequest;
    if (miniature && miniatureApi) {
      scene.remove(miniature);
      miniatureApi.disposeMiniature(miniature);
      miniature = null;
      miniatureStage = null;
    }
    options.onMiniatureState?.(id, 'loading');
    // Imports and assets are requested for the selected site only. One live model.
    miniaturesPromise ??= miniaturesModule();
    miniatureQueue = miniatureQueue
      .then(async () => {
        if (disposed || request !== miniatureRequest) return;
        const api = await miniaturesPromise!;
        if (disposed || request !== miniatureRequest) return;
        miniatureApi = api;
        const group = await api.createMiniature(id);
        if (disposed || request !== miniatureRequest) {
          api.disposeMiniature(group);
          return;
        }
        const point = activePoints.find((candidate) => candidate.id === id);
        // Unlocated sites have a study model beside the explorer, never a map pin.
        const x = point?.x ?? avatar.root.position.x;
        const z = point?.z ?? avatar.root.position.z - 7;
        group.position.set(x, (activeCluster ? 0.4 : Math.max(0, terrainHeight(x, z))) + 0.18, z);
        const stage = new THREE.Group();
        const grid = new THREE.GridHelper(10.2, 12, '#6ebbd2', '#235463');
        grid.position.y = -0.12;
        grid.material.transparent = true;
        grid.material.opacity = 0.35;
        grid.material.depthWrite = false;
        const box = new THREE.BoxGeometry(10.2, 0.1, 10.2);
        const edges = new THREE.EdgesGeometry(box);
        box.dispose();
        const outline = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: '#70d4df', transparent: true, opacity: 0.65 }),
        );
        outline.position.y = -0.16;
        stage.add(grid, outline);
        stage.visible = false;
        group.add(stage);
        // Fit the actual silhouette, including its display platform. Metadata
        // height alone cannot frame both tall buildings and shallow landforms.
        group.updateWorldMatrix(true, true);
        miniatureBounds.setFromObject(group);
        miniatureBounds.getCenter(miniatureCenter);
        miniatureStage = stage;
        miniature = group;
        scene.add(group);
        renderer.shadowMap.needsUpdate = true;
        options.onMiniatureState?.(id, 'ready');
      })
      .catch((error: unknown) => {
        if (disposed || request !== miniatureRequest) return;
        options.onMiniatureState?.(id, 'unavailable');
        console.warn('[Geoparque/miniatura]', {
          id,
          stage: 'load',
          message: error instanceof Error ? error.message : String(error),
        });
      });
  }
  let sampleTime = 0;
  let sampleFrames = 0;
  let adaptCooldown = 0;

  function clearMiniature() {
    miniatureFocus = null;
    ++miniatureRequest;
    if (miniature && miniatureApi) miniatureApi.disposeMiniature(miniature);
    miniature = null;
    miniatureStage = null;
    miniatureId = null;
  }

  function resetTravel() {
    initialized = false;
    grounded = true;
    jumpHeight = 0;
    jumpVelocity = 0;
    // Both destinations are outside their portal. A short release guard still
    // lets someone walk back through the door immediately after leaving.
    gatewayCooldown = 0.2;
    renderer.shadowMap.needsUpdate = true;
  }

  function enterCluster(cluster: ExperienceCluster) {
    if (disposed || activeCluster?.id === cluster.id) return;
    clearMiniature();
    clearPreviews();
    disposeBranch(beacons.container);
    if (roomScenery) disposeBranch(roomScenery);
    activeCluster = cluster;
    roomLayout = layoutCluster(cluster, points);
    activePoints = roomLayout.points;
    const interior = createClusterInterior(cluster, roomLayout);
    roomScenery = interior.group;
    roomExitStructure = interior.exitStructure;
    roomExit = interior.exit;
    roomColliders = interior.colliders;
    scene.add(roomScenery);
    beacons = makeBeacons(roomScenery, activePoints, () => 0.4);
    avatar.root.position.set(roomLayout.spawn.x, 0, roomLayout.spawn.z);
    preferredId = null;
    resetTravel();
    options.onClusterChange?.(cluster.id);
  }

  function leaveCluster() {
    if (!activeCluster || disposed) return;
    const previous = activeCluster;
    clearMiniature();
    clearPreviews();
    disposeBranch(beacons.container);
    if (roomScenery) disposeBranch(roomScenery);
    roomScenery = null;
    roomExitStructure = null;
    roomExit = null;
    roomLayout = null;
    roomColliders = [];
    activeCluster = null;
    activePoints = exteriorPoints;
    beacons = makeBeacons(scenery, exteriorPoints);
    const entrance = houses[clusters.findIndex((cluster) => cluster.id === previous.id)]!.entrance;
    const approach = gatewayPosition(entrance, 4.2);
    const outside = constrainToTerritory(approach.x, approach.z);
    avatar.root.position.set(outside.x, floorAt(outside.x, outside.z), outside.z);
    preferredId = null;
    resetTravel();
    options.onClusterChange?.(null);
  }

  function findGateway(mode: 'walk' | 'interact' = 'interact') {
    if (activeCluster && roomExit) {
      return withinGateway(roomExit, avatar.root.position, mode)
        ? {
            kind: 'exit' as const,
            clusterId: activeCluster.id,
            name: activeCluster.name,
            count: activeCluster.memberIds.length,
          }
        : null;
    }
    const index = houses.findIndex((house) =>
      withinGateway(house.entrance, avatar.root.position, mode),
    );
    const cluster = clusters[index];
    return cluster
      ? {
          kind: 'enter' as const,
          clusterId: cluster.id,
          name: cluster.name,
          count: cluster.memberIds.length,
        }
      : null;
  }

  function activateGateway() {
    const gateway = findGateway();
    if (!gateway || disposed) return false;
    if (gateway.kind === 'exit') leaveCluster();
    else {
      const cluster = clusters.find((candidate) => candidate.id === gateway.clusterId);
      if (cluster) enterCluster(cluster);
    }
    return true;
  }

  function update(input: WorldInput, delta: number, elapsed: number) {
    if (disposed) return { ...frame };
    const motionReduced = motionPreference?.matches ?? reducedMotion;
    const dt = THREE.MathUtils.clamp(delta, 0, 0.05);
    const yaw = Number.isFinite(input.yaw) ? input.yaw : 0;
    const pitch = THREE.MathUtils.clamp(
      Number.isFinite(input.pitch) ? input.pitch : 0.42,
      0.16,
      1.2,
    );
    const forward = THREE.MathUtils.clamp(input.forward, -1, 1);
    const right = THREE.MathUtils.clamp(input.right, -1, 1);
    movement.set(
      Math.sin(yaw) * forward + Math.cos(yaw) * right,
      0,
      -Math.cos(yaw) * forward + Math.sin(yaw) * right,
    );
    const moving = movement.lengthSq() > 0.001;
    if (moving || wasMoving || input.jump || !grounded) renderer.shadowMap.needsUpdate = true;
    wasMoving = moving;
    if (moving) {
      const previousX = avatar.root.position.x;
      const previousZ = avatar.root.position.z;
      movement.normalize();
      const speed = input.run ? 13 : 7.3;
      avatar.root.position.addScaledVector(movement, speed * dt);
      for (const collider of activeCluster ? roomColliders : colliders) {
        const dx = avatar.root.position.x - collider.x;
        const dz = avatar.root.position.z - collider.z;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq < collider.radius ** 2 && distanceSq > 0.0001) {
          const distance = Math.sqrt(distanceSq);
          const push = collider.radius / distance - 1;
          avatar.root.position.x += dx * push;
          avatar.root.position.z += dz * push;
        }
      }
      if (roomLayout) {
        avatar.root.position.x = THREE.MathUtils.clamp(
          avatar.root.position.x,
          -roomLayout.width / 2 + 2,
          roomLayout.width / 2 - 2,
        );
        avatar.root.position.z = THREE.MathUtils.clamp(
          avatar.root.position.z,
          -roomLayout.depth / 2 + 2,
          roomLayout.depth / 2 - 2,
        );
      } else {
        const safe = constrainToTerritory(
          avatar.root.position.x,
          avatar.root.position.z,
          previousX,
          previousZ,
        );
        avatar.root.position.x = safe.x;
        avatar.root.position.z = safe.z;
      }
      const heading = Math.atan2(-movement.x, -movement.z);
      const difference = Math.atan2(
        Math.sin(heading - avatar.root.rotation.y),
        Math.cos(heading - avatar.root.rotation.y),
      );
      avatar.root.rotation.y += difference * (1 - Math.exp(-dt * 14));
      walkPhase += dt * (input.run ? 12 : 8.7);
    }
    if (input.jump && !lastJump && grounded) {
      jumpVelocity = 6.6;
      grounded = false;
    }
    lastJump = input.jump;
    if (!grounded) {
      jumpVelocity -= dt * 18;
      jumpHeight += jumpVelocity * dt;
      if (jumpHeight <= 0) {
        jumpHeight = 0;
        jumpVelocity = 0;
        grounded = true;
      }
    }
    avatar.root.position.y = floorAt(avatar.root.position.x, avatar.root.position.z) + jumpHeight;
    const amplitude = moving && grounded ? 0.65 : 0;
    const swing = Math.sin(walkPhase) * amplitude;
    avatar.limbs[0]!.rotation.x = swing;
    avatar.limbs[1]!.rotation.x = -swing;
    avatar.limbs[2]!.rotation.x = -swing;
    avatar.limbs[3]!.rotation.x = swing;
    avatar.body.position.y =
      moving && !motionReduced ? Math.abs(Math.sin(walkPhase * 2)) * 0.07 : 0;
    avatar.body.rotation.z = moving && !motionReduced ? Math.sin(walkPhase) * 0.025 : 0;

    const player = avatar.root.position;
    gatewayCooldown = Math.max(0, gatewayCooldown - dt);
    if (moving && !input.inspect && gatewayCooldown === 0) {
      if (findGateway('walk')) activateGateway();
    }
    const nextOverview = input.overview && !activeCluster && !input.inspect;
    if (overview !== nextOverview) {
      renderer.shadowMap.needsUpdate = true;
      initialized = false;
    }
    overview = nextOverview;
    const nextInspection = input.inspect && miniature !== null;
    if (nextInspection !== inspecting) {
      if (nextInspection) clearPreviews();
      initialized = false;
      renderer.shadowMap.enabled = !nextInspection && !overview;
      renderer.shadowMap.needsUpdate = true;
    }
    inspecting = nextInspection;
    let zoom = THREE.MathUtils.clamp(input.zoom || 17, inspecting ? 0.65 : 9, 36);
    if (inspecting) {
      const inspectionViewport = computeInspectionViewport(viewportWidth, viewportHeight);
      camera.setViewOffset(
        viewportWidth,
        viewportHeight,
        inspectionViewport.viewOffsetX,
        inspectionViewport.viewOffsetY,
        viewportWidth,
        viewportHeight,
      );
      if (!miniatureFocus)
        zoom *=
          fitInspectionBounds(miniatureBounds, {
            yaw,
            pitch,
            fovDegrees: camera.fov,
            viewport: inspectionViewport,
          }).distance / 12;
    } else if (camera.view?.enabled) {
      camera.clearViewOffset();
    }
    scenery.visible = !inspecting && !activeCluster;
    sky.visible = !inspecting && !overview && !activeCluster;
    houses.forEach((house) => {
      house.group.traverse((object) => {
        if (object instanceof THREE.Sprite)
          object.visible =
            !overview &&
            viewportWidth > 700 &&
            camera.position.distanceTo(object.getWorldPosition(labelOffset)) > 20;
      });
    });
    if (roomScenery) roomScenery.visible = !inspecting;
    roomScenery?.traverse((object) => {
      if (object instanceof THREE.Sprite && object.userData['label']) {
        object.getWorldPosition(labelOffset);
        object.visible =
          !inspecting &&
          Math.hypot(player.x - labelOffset.x, player.z - labelOffset.z) >
            (object.userData['siteId'] ? 8 : 16);
      }
    });
    renderer.shadowMap.enabled = !inspecting && !overview;
    scene.background =
      inspecting || overview || activeCluster ? inspectionBackground : landscapeBackground;
    scene.fog = inspecting || overview ? null : activeCluster ? roomFog : landscapeFog;
    if (miniatureStage) miniatureStage.visible = inspecting;
    avatar.root.visible = !inspecting && !overview;
    if (inspecting) cameraTarget.copy(miniatureFocus ?? miniatureCenter);
    else cameraTarget.set(player.x, player.y + 3.2, player.z);
    const horizontal = Math.cos(pitch) * zoom;
    desiredCamera.set(
      (inspecting ? cameraTarget.x : player.x) - Math.sin(yaw) * horizontal,
      (inspecting ? cameraTarget.y : player.y + 2) + Math.sin(pitch) * zoom,
      (inspecting ? cameraTarget.z : player.z) + Math.cos(yaw) * horizontal,
    );
    if (!inspecting)
      desiredCamera.y = Math.max(desiredCamera.y, floorAt(desiredCamera.x, desiredCamera.z) + 2.5);
    // Lift the camera when a ridge lies between it and the walking character.
    for (const fraction of [0.25, 0.5, 0.75]) {
      if (inspecting) break;
      const x = THREE.MathUtils.lerp(cameraTarget.x, desiredCamera.x, fraction);
      const z = THREE.MathUtils.lerp(cameraTarget.z, desiredCamera.z, fraction);
      const sightHeight = THREE.MathUtils.lerp(cameraTarget.y, desiredCamera.y, fraction);
      const obstruction = floorAt(x, z) + 1.1 - sightHeight;
      if (obstruction > 0) desiredCamera.y += obstruction / fraction;
    }
    if (!activeCluster && !inspecting) {
      for (const house of houses) {
        if (
          Math.hypot(
            desiredCamera.x - house.group.position.x,
            desiredCamera.z - house.group.position.z,
          ) < 9
        ) {
          desiredCamera.y = Math.max(desiredCamera.y, house.group.position.y + 9);
        }
      }
      for (const collider of landscape.colliders) {
        if (
          Math.hypot(desiredCamera.x - collider.x, desiredCamera.z - collider.z) <
          collider.radius + 1
        ) {
          desiredCamera.y = Math.max(
            desiredCamera.y,
            terrainHeight(collider.x, collider.z) + collider.radius * 4 + 3,
          );
        }
      }
    }
    cameraForward.set(Math.sin(yaw), 0, -Math.cos(yaw));
    targetLook.copy(cameraTarget).addScaledVector(cameraForward, inspecting ? 0 : 6);
    if (!initialized || motionReduced || inspecting) {
      camera.position.copy(desiredCamera);
      actualLook.copy(targetLook);
      initialized = true;
    } else {
      camera.position.lerp(desiredCamera, 1 - Math.exp(-dt * 6));
      actualLook.lerp(targetLook, 1 - Math.exp(-dt * 7.5));
    }
    camera.lookAt(actualLook);
    camera.updateMatrixWorld();
    // Use the actual interpolated camera, so turning never exposes a roof during
    // the approach to its next position. Restore buildings as soon as clear.
    for (const house of houses) {
      const visible =
        !!activeCluster ||
        inspecting ||
        overview ||
        !houseObstructsPlayer(house.bounds, camera.position, cameraTarget);
      if (house.group.visible !== visible) renderer.shadowMap.needsUpdate = true;
      house.group.visible = visible;
    }
    if (roomExitStructure && roomLayout) {
      const visible =
        inspecting ||
        !exitPortalObstructsInterior(camera.position, cameraTarget, roomLayout.exit.z);
      if (roomExitStructure.visible !== visible) renderer.shadowMap.needsUpdate = true;
      roomExitStructure.visible = visible;
    }
    sun.position.set(player.x - 45, 75, player.z + 25);
    sun.target.position.set(player.x, 0, player.z);
    sun.target.updateMatrixWorld();
    if (!motionReduced) {
      sky.rotation.y = Math.sin(elapsed * 0.002) * 0.02;
    }
    frame.x = player.x;
    frame.z = player.z;
    frame.heading = -avatar.root.rotation.y;
    frame.nearestId = null;
    frame.distance = Infinity;
    frame.mapX = activeCluster?.x ?? player.x;
    frame.mapZ = activeCluster?.z ?? player.z;
    frame.clusterId = activeCluster?.id ?? null;
    frame.gateway = overview || inspecting ? null : findGateway();
    camera.getWorldDirection(labelCameraDirection);
    const labelCandidates: {
      label: THREE.Sprite;
      distance: number;
      depth: number;
      screenX: number;
      screenY: number;
    }[] = [];
    activePoints.forEach((point, i) => {
      const distance = Math.hypot(player.x - point.x, player.z - point.z);
      const label = beacons.labels[i];
      if (label) {
        label.visible = false;
        labelOffset.copy(label.position).sub(camera.position);
        const depth = labelOffset.dot(labelCameraDirection);
        if (!inspecting && !overview && distance < 35 && depth > 6 && labelOffset.lengthSq() > 36) {
          labelProjection.copy(label.position).project(camera);
          if (
            labelProjection.z > -1 &&
            labelProjection.z < 1 &&
            Math.abs(labelProjection.x) < 1 - 190 / viewportWidth &&
            labelProjection.y > -0.7 &&
            labelProjection.y < 0.72
          ) {
            labelCandidates.push({
              label,
              distance,
              depth,
              screenX: ((labelProjection.x + 1) / 2) * viewportWidth,
              screenY: ((1 - labelProjection.y) / 2) * viewportHeight,
            });
          }
        }
      }
      if (distance < frame.distance) {
        frame.distance = distance;
        frame.nearestId = distance <= 10 ? point.id : null;
      }
    });
    const preferred = activePoints.find((point) => point.id === preferredId);
    if (preferred && Math.hypot(player.x - preferred.x, player.z - preferred.z) <= 12) {
      frame.nearestId = preferred.id;
    } else {
      preferredId = null;
    }
    if (!inspecting && frame.nearestId !== null && miniatureId !== frame.nearestId)
      showMiniature(frame.nearestId);
    if (miniature && miniatureApi) miniatureApi.updateMiniature(miniature, elapsed);
    updatePreviews(player.x, player.z, elapsed);
    beacons.objects.forEach((object) => {
      object.visible = !inspecting;
    });
    landscape.objects.forEach((object) => {
      object.visible = !inspecting;
    });
    labelCandidates.sort((a, b) => a.distance - b.distance);
    const shownLabels: { x: number; y: number }[] = [];
    for (const candidate of labelCandidates) {
      if (shownLabels.length >= 4) break;
      if (
        shownLabels.some(
          (shown) =>
            Math.abs(shown.x - candidate.screenX) < 190 &&
            Math.abs(shown.y - candidate.screenY) < 42,
        )
      )
        continue;
      const unitsPerPixel =
        (2 * candidate.depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / viewportHeight;
      candidate.label.scale.set(180 * unitsPerPixel, 33.75 * unitsPerPixel, 1);
      candidate.label.material.opacity = THREE.MathUtils.clamp((29 - candidate.distance) / 7, 0, 1);
      candidate.label.visible = true;
      shownLabels.push({ x: candidate.screenX, y: candidate.screenY });
    }
    sampleTime += delta;
    sampleFrames++;
    adaptCooldown += dt;
    if (adaptCooldown > 4 && sampleFrames > 35) {
      const average = sampleTime / sampleFrames;
      if (average > 0.036 && ratio > 0.85) {
        ratio = Math.max(0.85, ratio - 0.15);
        renderer.setPixelRatio(ratio);
      }
      sampleTime = 0;
      sampleFrames = 0;
      adaptCooldown = 0;
    }
    return { ...frame };
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    clearPreviews();
    ++miniatureRequest;
    if (miniature && miniatureApi) {
      scene.remove(miniature);
      miniatureApi.disposeMiniature(miniature);
      miniature = null;
    }
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    scene.traverse((object) => {
      if (object instanceof THREE.InstancedMesh) object.dispose();
      if (
        object instanceof THREE.Mesh ||
        object instanceof THREE.Sprite ||
        object instanceof THREE.LineSegments
      ) {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments)
          geometries.add(object.geometry);
        const objectMaterials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        objectMaterials.forEach((material: THREE.Material) => {
          materials.add(material);
          Object.values(material).forEach((value: unknown) => {
            if (value instanceof THREE.Texture) textures.add(value);
          });
        });
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    sun.shadow.dispose();
    renderer.renderLists.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    scene.clear();
  }

  return {
    resize(width, height, pixelRatio) {
      if (disposed || width < 1 || height < 1) return;
      viewportWidth = width;
      viewportHeight = height;
      if (pixelRatio !== undefined) ratio = THREE.MathUtils.clamp(pixelRatio, 0.85, 1.6);
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const frameHeight = Math.max(
        territoryBounds.maxZ - territoryBounds.minZ + 30,
        (territoryBounds.maxX - territoryBounds.minX + 30) / camera.aspect,
      );
      overviewCamera.left = (-frameHeight * camera.aspect) / 2;
      overviewCamera.right = (frameHeight * camera.aspect) / 2;
      overviewCamera.top = frameHeight / 2;
      overviewCamera.bottom = -frameHeight / 2;
      overviewCamera.updateProjectionMatrix();
    },
    update,
    render() {
      if (!disposed) renderer.render(scene, overview ? overviewCamera : camera);
    },
    pick(ndcX, ndcY) {
      if (disposed) return null;
      if (inspecting) return miniatureId;
      pointer.set(ndcX, ndcY);
      camera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, overview ? overviewCamera : camera);
      const hit = raycaster.intersectObject(beacons.targets, false)[0];
      return hit?.instanceId !== undefined ? (activePoints[hit.instanceId]?.id ?? null) : null;
    },
    teleport(id) {
      if (disposed) return;
      const cluster = clusterByPoint.get(id);
      if (cluster) enterCluster(cluster);
      else leaveCluster();
      const point = activePoints.find((candidate) => candidate.id === id);
      if (!point) return;
      const safe = activeCluster
        ? { x: point.x, z: point.z + 9 }
        : constrainToTerritory(point.x, point.z + 8);
      avatar.root.position.set(safe.x, floorAt(safe.x, safe.z), safe.z);
      initialized = false;
      jumpHeight = 0;
      jumpVelocity = 0;
      grounded = true;
      preferredId = id;
      renderer.shadowMap.needsUpdate = true;
      showMiniature(id);
    },
    showMiniature,
    focusMiniature(ndcX, ndcY) {
      if (disposed || !inspecting || !miniature) return false;
      camera.updateMatrixWorld();
      miniature.updateMatrixWorld(true);
      pointer.set(ndcX, ndcY);
      raycaster.setFromCamera(pointer, camera);
      const meshes: THREE.Object3D[] = [];
      miniature.traverse((object) => {
        if (object instanceof THREE.Mesh) meshes.push(object);
      });
      const hit = raycaster.intersectObjects(meshes, false)[0];
      if (!hit) return false;
      miniatureFocus = hit.point.clone();
      initialized = false;
      return true;
    },
    resetMiniatureFocus() {
      miniatureFocus = null;
      initialized = false;
    },
    activateGateway,
    leaveCluster,
    dispose,
  };
}

import { required } from '../guards';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { capsule, ellipsoid, projectStoneUV, sculptGeometry } from './artigasGeometry';
import type { Point3, SculptPrimitive } from './artigasGeometry';
function add(
  parent: Group,
  geometry: BufferGeometry,
  material: MeshStandardMaterial,
  name: string,
) {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
/** Subtle mineral variation and damp, mossy stone at the paws, rather than painted fur. */
function weather(geometry: BufferGeometry, heightOffset = 0) {
  const p = geometry.getAttribute('position'),
    colors = new Float32Array(p.count * 3);
  const tone = new Color(),
    moss = new Color('#899078');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i) + heightOffset,
      z = p.getZ(i);
    const mineral = 0.94 + Math.sin(x * 13 + y * 8) * Math.cos(z * 11 - y * 5) * 0.026;
    tone.setRGB(mineral, mineral, mineral);
    const damp = Math.max(0, 1 - (y - 1.05) / 0.6);
    tone.lerp(moss, damp * (0.18 + 0.16 * Math.sin(z * 7 + x * 4) ** 2));
    tone.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
}
function oval(center: Point3, radii: Point3, rotation = 0) {
  const geometry = new SphereGeometry(1, 24, 16);
  geometry
    .scale(...radii)
    .rotateZ(rotation)
    .translate(...center);
  return projectStoneUV(geometry);
}
function stroke(points: Point3[], radius: number, segments = 20) {
  return new TubeGeometry(
    new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
    segments,
    radius,
    6,
    false,
  );
}
function combine(parts: BufferGeometry[]) {
  const expanded = parts.map((part) => {
    const geometry = part.index ? part.toNonIndexed() : part.clone();
    for (const name of Object.keys(geometry.attributes)) {
      const attribute = required(geometry.attributes[name]);
      geometry.setAttribute(name, new Float32BufferAttribute(attribute.array, attribute.itemSize));
    }
    return geometry;
  });
  const combined = mergeGeometries(expanded, false)!;
  parts.forEach((part) => part.dispose());
  expanded.forEach((part) => part.dispose());
  combined.computeBoundingBox();
  combined.computeBoundingSphere();
  return combined;
}
function bodyGeometry() {
  // The animal lies on its belly: low pelvis, raised scapulae, and tapering neck.
  const parts: SculptPrimitive[] = [
    ellipsoid([0, 1.65, -1.28], [0.69, 0.59, 1.37], 0, 0.24),
    ellipsoid([0.03, 1.53, -2.03], [0.65, 0.53, 0.7], 0, 0.21),
    ellipsoid([0, 1.94, -0.43], [0.65, 0.82, 0.83], 0, 0.26),
    ellipsoid([0, 2.43, -0.03], [0.49, 0.71, 0.57], 0, 0.24),
    ellipsoid([0, 2.79, 0.24], [0.405, 0.51, 0.45], 0, 0.2),
    ellipsoid([0, 2.2, 0.32], [0.41, 0.56, 0.47], 0, 0.17),
  ];
  for (const side of [-1, 1]) {
    // Folded rear thigh and hock; these remain lower than the shoulders.
    parts.push(
      ellipsoid([side * 0.65, 1.38, -1.92], [0.44, 0.4, 0.7], side * 0.07, 0.18),
      ellipsoid([side * 0.82, 1.23, -1.35], [0.29, 0.22, 0.58], 0, 0.12),
      ellipsoid([side * 0.86, 1.22, -0.94], [0.265, 0.18, 0.35], 0, 0.1),
      ellipsoid([side * 0.46, 1.92, -0.14], [0.31, 0.57, 0.55], -side * 0.14, 0.19),
      capsule([side * 0.48, 1.82, 0.03], [side * 0.55, 1.42, 0.7], 0.245, 0.205, 0.15),
      capsule([side * 0.55, 1.42, 0.65], [side * 0.57, 1.31, 1.33], 0.2, 0.19, 0.12),
      ellipsoid([side * 0.58, 1.29, 1.51], [0.31, 0.195, 0.43], 0, 0.1),
    );
    // Four rounded toes grow from each broad paw, with recessed separations.
    for (let toe = 0; toe < 4; toe++) {
      const offset = (toe - 1.5) * 0.14;
      parts.push(
        ellipsoid(
          [side * 0.58 + offset, 1.265, 1.79 - Math.abs(offset) * 0.32],
          [0.105, 0.155, 0.245],
          0,
          0.045,
        ),
      );
    }
  }
  for (const side of [-1, 1]) {
    for (const gap of [-0.14, 0, 0.14]) {
      parts.push(
        capsule(
          [side * 0.58 + gap, 1.36, 1.82],
          [side * 0.58 + gap, 1.26, 2.08],
          0.027,
          0.022,
          0.014,
          true,
        ),
      );
    }
    // A shallow crease beside the chest clarifies the separate foreleg.
    parts.push(
      ellipsoid([side * 0.35, 1.72, 0.51], [0.055, 0.28, 0.25], side * -0.22, 0.035, true),
    );
  }
  return weather(sculptGeometry(parts, [-1.3, 0.94, -3.02], [1.3, 3.42, 2.22], 32));
}
function headGeometry() {
  const parts: SculptPrimitive[] = [
    ellipsoid([0, 0.015, -0.14], [0.53, 0.45, 0.57], 0, 0.13),
    ellipsoid([0, 0.19, 0.08], [0.45, 0.31, 0.45], 0, 0.13),
    ellipsoid([0, -0.18, 0.1], [0.405, 0.26, 0.47], 0, 0.12),
    // Short nasal bridge and paired whisker pads: the muzzle is feline, not conical.
    ellipsoid([0, 0.055, 0.465], [0.21, 0.2, 0.32], 0, 0.11),
    ellipsoid([0, -0.04, 0.76], [0.175, 0.1, 0.12], 0, 0.075),
    ellipsoid([-0.17, -0.15, 0.64], [0.235, 0.165, 0.26], -0.1, 0.085),
    ellipsoid([0.17, -0.15, 0.64], [0.235, 0.165, 0.26], 0.1, 0.085),
    ellipsoid([0, -0.315, 0.48], [0.305, 0.135, 0.33], 0, 0.085),
  ];
  for (const side of [-1, 1]) {
    parts.push(
      ellipsoid([side * 0.34, -0.085, 0.22], [0.23, 0.22, 0.26], side * 0.12, 0.1),
      ellipsoid([side * 0.365, 0.11, 0.1], [0.19, 0.27, 0.31], side * 0.1, 0.12),
      ellipsoid([side * 0.31, 0.245, 0.245], [0.18, 0.06, 0.175], side * 0.2, 0.1),
      // Rounded, thick ears grow from the back of the skull.
      ellipsoid([side * 0.39, 0.36, -0.235], [0.19, 0.155, 0.15], -side * 0.25, 0.075),
      ellipsoid([side * 0.445, 0.485, -0.235], [0.145, 0.18, 0.13], -side * 0.25, 0.065),
      ellipsoid([side * 0.46, 0.61, -0.235], [0.1, 0.095, 0.1], -side * 0.2, 0.06),
    );
  }
  for (const side of [-1, 1]) {
    parts.push(
      // Eye sockets are cut under the brow; ear conchae are genuinely hollow.
      ellipsoid([side * 0.34, 0.155, 0.412], [0.147, 0.075, 0.16], side * 0.24, 0.027, true),
      ellipsoid([side * 0.465, 0.5, -0.09], [0.093, 0.145, 0.12], -side * 0.25, 0.024, true),
    );
  }
  parts.push(
    ellipsoid([0, -0.272, 0.79], [0.29, 0.031, 0.22], 0, 0.016, true),
    capsule([0, -0.117, 0.934], [0, -0.239, 0.915], 0.016, 0.012, 0.008, true),
  );
  const geometry = weather(
    sculptGeometry(parts, [-0.82, -0.64, -0.91], [0.82, 0.88, 1.16], 36),
    3.16,
  );
  const position = geometry.getAttribute('position'),
    color = geometry.getAttribute('color');
  // Darken the carved stone itself inside the hollows, rather than attaching
  // shiny eyeballs or flat discs over the eye and ear cavities.
  for (let i = 0; i < position.count; i++) {
    const x = Math.abs(position.getX(i)),
      y = position.getY(i),
      z = position.getZ(i);
    const orbit =
      Math.exp(-(((x - 0.34) / 0.14) ** 2 + ((y - 0.155) / 0.075) ** 2)) *
      Math.max(0, Math.min(1, (0.4 - z) / 0.14));
    const concha =
      Math.exp(-(((x - 0.465) / 0.09) ** 2 + ((y - 0.5) / 0.14) ** 2)) *
      Math.max(0, Math.min(1, (-0.08 - z) / 0.13));
    const shade = 1 - orbit * 0.32 - concha * 0.2;
    color.setXYZ(i, color.getX(i) * shade, color.getY(i) * shade, color.getZ(i) * shade);
  }
  return geometry;
}
function noseGeometry() {
  const outline = new Shape();
  outline.moveTo(-0.18, 0.015);
  outline.bezierCurveTo(-0.165, 0.075, 0.165, 0.075, 0.18, 0.015);
  outline.bezierCurveTo(0.16, -0.022, 0.074, -0.08, 0, -0.091);
  outline.bezierCurveTo(-0.074, -0.08, -0.16, -0.022, -0.18, 0.015);
  const geometry = new ExtrudeGeometry(outline, {
    depth: 0.034,
    bevelEnabled: true,
    bevelSize: 0.016,
    bevelThickness: 0.014,
    bevelSegments: 3,
    steps: 1,
    curveSegments: 12,
  });
  geometry.translate(0, -0.04, 0.863);
  return projectStoneUV(geometry);
}
/** A reclining, weathered stone puma, posed after the official Salus photographs. */
export function createSalusPuma(stone: MeshStandardMaterial) {
  const group = new Group();
  group.name = 'Puma de Salus — escultura anatómica';
  stone.vertexColors = true;
  stone.bumpScale = 0.024;
  add(group, bodyGeometry(), stone, 'Cuerpo continuo — pecho, hombros y cuatro patas');
  const head = new Group();
  head.name = 'Cabeza felina — hocico corto y orejas ahuecadas';
  head.position.set(0, 3.16, 0.51);
  head.rotation.x = -0.18;
  group.add(head);
  add(head, headGeometry(), stone, 'Cráneo esculpido — cejas, mejillas y mandíbula');
  const recess = stone.clone();
  recess.vertexColors = false;
  recess.color.multiplyScalar(0.6);
  recess.bumpScale = 0.01;
  const nose = recess.clone();
  nose.color.copy(stone.color).multiplyScalar(0.77);
  add(head, noseGeometry(), nose, 'Nariz triangular de piedra');
  const carvings: BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    carvings.push(
      oval([side * 0.111, -0.049, 0.907], [0.037, 0.018, 0.008], side * -0.18),
      stroke(
        [
          [side * 0.03, -0.274, 0.855],
          [side * 0.16, -0.275, 0.805],
          [side * 0.285, -0.247, 0.68],
          [side * 0.32, -0.215, 0.59],
        ],
        0.008,
      ),
    );
  }
  add(head, combine(carvings), recess, 'Fosas nasales y comisuras de la boca');
  const outlet = new CylinderGeometry(0.034, 0.034, 0.055, 16, 1, true);
  outlet.rotateX(Math.PI / 2);
  outlet.translate(0, -0.278, 0.86);
  add(head, outlet, recess, 'Salida del manantial en la boca');
  const tailCurve = new CatmullRomCurve3([
    new Vector3(0.15, 1.52, -2.3),
    new Vector3(-0.65, 1.32, -2.72),
    new Vector3(-1.32, 1.2, -2.4),
    new Vector3(-1.54, 1.16, -1.5),
    new Vector3(-1.38, 1.17, -0.55),
    new Vector3(-1.02, 1.23, -0.24),
    new Vector3(-0.89, 1.26, -0.5),
  ]);
  const tail = new TubeGeometry(tailCurve, 64, 1, 10, false),
    p = tail.getAttribute('position');
  const center = new Vector3();
  for (let ring = 0; ring <= 64; ring++) {
    const t = ring / 64,
      radius = 0.033 + 0.135 * Math.pow(1 - t, 0.75);
    tailCurve.getPointAt(t, center);
    for (let j = 0; j <= 10; j++) {
      const k = ring * 11 + j;
      p.setXYZ(
        k,
        center.x + (p.getX(k) - center.x) * radius,
        center.y + (p.getY(k) - center.y) * radius,
        center.z + (p.getZ(k) - center.z) * radius,
      );
    }
  }
  tail.computeVertexNormals();
  add(
    group,
    weather(
      projectStoneUV(combine([tail, oval(tailCurve.getPoint(1).toArray(), [0.034, 0.034, 0.034])])),
    ),
    stone,
    'Cola larga afinada sobre la roca',
  );
  head.updateMatrix();
  const mouth = new Vector3(0, -0.278, 0.8875).applyMatrix4(head.matrix);
  group.userData.reference = 'Salus Uruguay · reserva-2.webp; Presidencia · AO_470/fgr_02.jpg';
  return { group, mouth };
}

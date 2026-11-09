import * as THREE from 'three';
import type { LandmarkModel, MiniatureMetadata } from './types';

const REFERENCE =
  'https://github.com/NebyX1/nueva-web-turismo-idl/tree/08a03e8060cce0e90e4c3662feed377f4b9c4622';
const clocks = new WeakMap<THREE.Group, (elapsedSeconds: number) => void>();
const disposed = new WeakSet<THREE.Group>();
const assets: Readonly<Record<number, string>> = {
  46: 'cerro-artigas.glb',
  49: 'parque-rodo.glb',
};

function resources(group: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    for (const material of mesh.material
      ? Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]
      : []) {
      materials.add(material);
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  return { geometries, materials, textures };
}

/** Releases this model's GPU resources. There is no shared global model cache. */
export function disposeMiniature(group: THREE.Group): void {
  if (disposed.has(group)) return;
  disposed.add(group);
  clocks.delete(group);
  group.removeFromParent();
  const owned = resources(group);
  group.traverse((object) => {
    if (object instanceof THREE.InstancedMesh) object.dispose();
  });
  owned.geometries.forEach((geometry) => geometry.dispose());
  owned.materials.forEach((material) => material.dispose());
  const images = new Set<ImageBitmap>();
  owned.textures.forEach((texture) => {
    texture.dispose();
    if (typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap)
      images.add(texture.image);
  });
  images.forEach((image) => image.close());
  group.clear();
}

/** Uses elapsed seconds from the experience's existing RAF; never starts its own loop. */
export function updateMiniature(group: THREE.Group, elapsedSeconds: number): void {
  if (Number.isFinite(elapsedSeconds) && !disposed.has(group)) clocks.get(group)?.(elapsedSeconds);
}

function measure(group: THREE.Group) {
  let drawCalls = 0,
    triangles = 0;
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const instances = mesh instanceof THREE.InstancedMesh ? mesh.count : 1;
    drawCalls += Array.isArray(mesh.material)
      ? mesh.geometry.groups.length || mesh.material.length
      : 1;
    triangles +=
      ((mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position').count) / 3) *
      instances;
  });
  return { drawCalls, triangles };
}

/** Static GLBs contain many authored objects; merge compatible material batches. */
async function batchStatic(group: THREE.Group): Promise<THREE.Group> {
  const { mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js');
  const batches = new Map<string, { material: THREE.Material; geometry: THREE.BufferGeometry[] }>();
  group.updateMatrixWorld(true);
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || mesh instanceof THREE.InstancedMesh || Array.isArray(mesh.material)) return;
    const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    const attributes = Object.keys(geometry.attributes)
      .sort()
      .map((name) => {
        const attr = geometry.getAttribute(name);
        return `${name}:${attr.itemSize}:${attr.normalized}:${attr.array.constructor.name}`;
      })
      .join('/');
    const key = `${mesh.material.uuid}/${attributes}/${Boolean(geometry.index)}`;
    const batch = batches.get(key) ?? { material: mesh.material, geometry: [] };
    batch.geometry.push(geometry);
    batches.set(key, batch);
  });
  const result = new THREE.Group();
  result.name = group.name;
  result.userData = { ...group.userData };
  try {
    for (const batch of batches.values()) {
      const merged = mergeGeometries(batch.geometry, false);
      if (!merged) throw new Error('Unable to merge a compatible miniature geometry batch');
      const mesh = new THREE.Mesh(merged, batch.material);
      mesh.name = batch.material.name || 'Miniature material batch';
      mesh.castShadow = mesh.receiveShadow = true;
      result.add(mesh);
    }
    // GLBs used here are static and have no skins, instancing or animation tracks.
    resources(group).geometries.forEach((geometry) => geometry.dispose());
    group.clear();
    return result;
  } catch (error) {
    resources(result).geometries.forEach((geometry) => geometry.dispose());
    throw error;
  } finally {
    batches.forEach((batch) => batch.geometry.forEach((geometry) => geometry.dispose()));
  }
}

function animateWater(group: THREE.Group): (time: number) => void {
  const clock = { value: 0 };
  const seen = new Set<THREE.Material>();
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial) || seen.has(material)) continue;
      seen.add(material);
      if (!/agua|arroyo|canaleta|poza|desag|embalse|cauce|water/i.test(material.name)) continue;
      material.roughness = 0.24;
      material.metalness = 0.15;
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uMiniatureTime = clock;
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vMiniaturePoint;')
          .replace(
            '#include <begin_vertex>',
            '#include <begin_vertex>\nvMiniaturePoint = position;',
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            '#include <common>\nuniform float uMiniatureTime; varying vec3 vMiniaturePoint;',
          )
          .replace(
            '#include <normal_fragment_maps>',
            '#include <normal_fragment_maps>\nnormal = normalize(normal + vec3(sin(vMiniaturePoint.y * 2.0 + uMiniatureTime * 3.0) * .06, 0.0, cos(vMiniaturePoint.x * 3.0 - uMiniatureTime * 2.0) * .05));',
          );
      };
      material.customProgramCacheKey = () => 'geopark-miniature-water-v1';
    }
  });
  return (time) => {
    clock.value = time;
  };
}

async function loadAsset(id: number, filename: string): Promise<LandmarkModel> {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  let source: THREE.Group | undefined;
  try {
    const asset = await new GLTFLoader().loadAsync(
      `${import.meta.env.BASE_URL}models/geosites/${filename}`,
    );
    source = asset.scene;
    const group = await batchStatic(source);
    group.userData.sourceAsset = filename;
    const update = animateWater(group);
    return { group, target: new THREE.Vector3(), bounds: { radius: 1, height: 1 }, update };
  } catch (cause) {
    if (source) disposeMiniature(source);
    throw new Error(
      `No se pudo cargar la miniatura GMS-${String(id).padStart(2, '0')} (${filename})`,
      { cause },
    );
  }
}

async function makeReference(id: number): Promise<LandmarkModel | undefined> {
  const filename = assets[id];
  if (filename) return loadAsset(id, filename);
  switch (id) {
    case 1:
      return (await import('./reference/arequita')).createArequita();
    case 9:
      // Keep the native materials, spillway clock, instancing and fish hierarchy.
      return (await import('./reference/stewartVargas')).createStewartVargas();
    case 14:
      return (await import('./reference/penitente')).createPenitente();
    case 22: {
      const model = (await import('./reference/monastery')).createMonastery();
      return { ...model, group: await batchStatic(model.group) };
    }
    case 31:
      return (await import('./reference/salus')).createSalus();
    case 33:
      return (await import('./reference/natureMonuments')).createVerdun();
    case 39:
      return (await import('./reference/plazaLibertad')).createPlazaLibertad();
    case 41:
      return (await import('./reference/plazaLibertad')).createMinasCathedral();
    case 10:
    case 11:
    case 54: {
      const model = (await import('./reference/architectureWater')).createVillaSerrana();
      if (id !== 54) {
        const subject = model.group.children.find(
          (child) =>
            child.type === 'Group' &&
            (id === 10 ? child.position.x === -30 : child.position.z === 2),
        );
        if (!subject) {
          disposeMiniature(model.group);
          throw new Error(`Reference subject missing for GMS-${id}`);
        }
        subject.removeFromParent();
        const selected = new THREE.Group();
        selected.add(subject);
        const kept = resources(selected),
          unused = resources(model.group);
        unused.geometries.forEach((geometry) => {
          if (!kept.geometries.has(geometry)) geometry.dispose();
        });
        unused.materials.forEach((material) => {
          if (!kept.materials.has(material)) material.dispose();
        });
        unused.textures.forEach((texture) => {
          if (!kept.textures.has(texture)) texture.dispose();
        });
        model.group = selected;
      }
      return { ...model, group: await batchStatic(model.group) };
    }
    default:
      return undefined;
  }
}

/**
 * Creates an independently owned model, centred horizontally, base y=0,
 * with max(width, depth)=9. Loading is per site; no model is prefetched.
 */
export async function createMiniature(id: number): Promise<THREE.Group> {
  if (!Number.isInteger(id) || id < 1 || id > 61) throw new RangeError(`Unknown geosite ID: ${id}`);
  let model = await makeReference(id);
  const representation = model ? 'reference-model' : 'reference-informed';
  if (!model) {
    model = await loadAsset(id, `rebuilt/gms-${String(id).padStart(2, '0')}.glb`);
  }
  const content = model.group;
  if (id === 8) {
    try {
      const { addMarmarajaLizard } = await import('./wildlife/marmaraja-lizard');
      const lizard = addMarmarajaLizard(content);
      const updateLandscape = model.update;
      model.update = (time) => {
        updateLandscape?.(time);
        lizard.update(time);
      };
    } catch (cause) {
      disposeMiniature(content);
      throw new Error('No se pudo preparar el lagarto de Marmarajá.', { cause });
    }
  }
  content.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(content);
  const size = bounds.getSize(new THREE.Vector3()),
    center = bounds.getCenter(new THREE.Vector3());
  const width = Math.max(size.x, size.z);
  if (!Number.isFinite(width) || width <= 0) {
    disposeMiniature(content);
    throw new Error(`Empty miniature for GMS-${id}`);
  }
  const scale = 9 / width;
  const frame = new THREE.Group();
  frame.name = `GMS-${String(id).padStart(2, '0')} — miniatura`;
  content.scale.multiplyScalar(scale);
  content.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  frame.add(content);
  const metadata: MiniatureMetadata = {
    id,
    representation,
    source:
      representation === 'reference-model'
        ? REFERENCE
        : 'Recreación basada en fotografías y cartografía; geometría original, sin relevamiento arquitectónico. Fuentes: /experiencia/modelos/',
    width: 9,
    height: size.y * scale,
    ...measure(frame),
  };
  frame.userData.miniature = metadata;
  if (model.update) clocks.set(frame, model.update);
  return frame;
}

export type { MiniatureMetadata } from './types';

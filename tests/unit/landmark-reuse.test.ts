import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import reference from '../fixtures/tourism-model-reference.json';
import { geometryFingerprint } from '../helpers/geometry-fingerprint';
import packed from '../../src/features/experience/miniatures/reference/stewartVargasAsset.json';
import {
  createMiniature,
  disposeMiniature,
  updateMiniature,
} from '../../src/features/experience/miniatures';
import { createArequitaRiver } from '../../src/features/experience/miniatures/reference/arequitaRiver';

afterEach(() => vi.unstubAllGlobals());

function ownedResources(group: THREE.Group) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  return [...geometries, ...materials, ...textures];
}

describe('reutilización de los modelos de turismo', () => {
  it('GMS-41 conserva toda la geometría y los colores de la catedral de Plaza Libertad', async () => {
    const model = await createMiniature(41);
    const building = model.children[0] as THREE.Group;
    // Undo only the display normalization. The golden fingerprint was generated
    // from the original tourism constructor at the revision recorded in the fixture.
    building.position.set(0, 0, 0);
    building.scale.setScalar(1);
    expect(geometryFingerprint(building)).toEqual(reference.cathedral);
    expect(model.userData.miniature.representation).toBe('reference-model');
    expect(model.userData.miniature.drawCalls).toBeLessThan(100);
    disposeMiniature(model);
  });

  it('Stewart conserva los datos originales, anima agua y peces y libera cada instancia por separado', async () => {
    expect(createHash('sha256').update(JSON.stringify(packed)).digest('hex')).toBe(
      reference.stewartPackedDataSha256,
    );
    // Only canvas allocation is simulated here. Real shaders and appearance are
    // checked in Chromium/WebKit; this test checks ownership and the native clock.
    vi.stubGlobal('document', {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({ clearRect() {}, fillRect() {}, fillStyle: '' }),
      }),
    });
    const [first, second] = await Promise.all([createMiniature(9), createMiniature(9)]);
    const firstResources = ownedResources(first);
    const secondResources = ownedResources(second);
    expect(firstResources.every((resource) => !secondResources.includes(resource))).toBe(true);
    const disposals = firstResources.map((resource) => vi.spyOn(resource, 'dispose'));
    const otherDisposals = secondResources.map((resource) => vi.spyOn(resource, 'dispose'));
    const water = (root: THREE.Group) => {
      let result: THREE.MeshStandardMaterial | undefined;
      root.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material.name?.includes('embalse calmo'))
          result = object.material;
      });
      return result!;
    };
    const school = first.getObjectByName('Peces del embalse Stewart Vargas')!;
    expect(school.userData.fishSchool.count).toBe(6);
    const fish = school.getObjectByName('Peces del embalse Stewart Vargas — pez 1')!;
    updateMiniature(first, 0.2);
    const before = fish.position.clone();
    updateMiniature(first, 0.7);
    expect(fish.position.distanceTo(before)).toBeGreaterThan(1);
    expect(water(first).userData.flowClock.value).toBe(0.7);
    expect(water(second).userData.flowClock.value).toBe(0);
    expect(first.userData.miniature.triangles).toBeLessThan(150000);
    expect(first.userData.miniature.drawCalls).toBeLessThan(100);
    disposeMiniature(first);
    disposeMiniature(first);
    disposals.forEach((dispose) => expect(dispose).toHaveBeenCalledTimes(1));
    otherDisposals.forEach((dispose) => expect(dispose).not.toHaveBeenCalled());
    updateMiniature(second, 3);
    expect(water(second).userData.flowClock.value).toBe(3);
    disposeMiniature(second);
  });

  it('el relieve del agua del Santa Lucía se adapta a la escala mundial del modelo', () => {
    const river = createArequitaRiver();
    const surface = river.group.getObjectByName('Santa Lucía — superficie continua') as THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshStandardMaterial
    >;
    const shader = {
      uniforms: {},
      vertexShader: THREE.ShaderLib.standard.vertexShader,
      fragmentShader: THREE.ShaderLib.standard.fragmentShader,
    } as Parameters<THREE.Material['onBeforeCompile']>[0];
    surface.material.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
    expect(shader.vertexShader).toContain('vRiverWorldScale=length(modelMatrix[1].xyz)');
    expect(shader.fragmentShader).toContain(')*vRiverWorldScale;');
    river.update(2.5);
    expect(surface.material.userData.flowClock.value).toBe(2.5);
    disposeMiniature(river.group);
  });
});

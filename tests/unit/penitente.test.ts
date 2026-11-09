import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import asset from '../../src/features/experience/miniatures/reference/penitenteAsset.json';
import {
  createMiniature,
  disposeMiniature,
  updateMiniature,
} from '../../src/features/experience/miniatures';

describe('Penitente completo del proyecto de Turismo', () => {
  it('conserva la malla empaquetada y la referencia GLB del mismo commit', () => {
    expect(createHash('sha256').update(JSON.stringify(asset)).digest('hex')).toBe(
      '7526ce6a787edf794006d153fb207cab9218ee816bebe6938d1d19fa4929906c',
    );
    expect(
      createHash('sha256')
        .update(readFileSync('public/models/geosites/salto-del-penitente.glb'))
        .digest('hex'),
    ).toBe(asset.sourceSha256);
    expect(asset.parts.map((part) => part.kind)).toEqual([
      'rock',
      'falls',
      'falls',
      'pool',
      'falls',
    ]);
  });

  it('carga los cuatro peces sobre la poza real, salpicaduras y el reloj compartido', async () => {
    const model = await createMiniature(14);
    try {
      const content = model.children[0]!;
      const pool = content.children.find((object) => object.userData.kind === 'pool') as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.MeshStandardMaterial
      >;
      const school = model.getObjectByName('Peces de la poza del Penitente')!;
      expect(pool).toBeDefined();
      expect(school).toBeDefined();
      const fish = school.children.filter((object) => object instanceof THREE.Group);
      expect(fish).toHaveLength(4);
      expect(pool.geometry.getAttribute('aFlow').count).toBe(
        pool.geometry.getAttribute('position').count,
      );
      model.updateMatrixWorld(true);
      const ray = new THREE.Raycaster();
      for (const path of school.userData.fishSchool.paths as {
        start: [number, number, number];
        end: [number, number, number];
      }[]) {
        for (let step = 0; step <= 20; step++) {
          const point = new THREE.Vector3(...path.start).lerp(
            new THREE.Vector3(...path.end),
            step / 20,
          );
          const origin = content.localToWorld(point.add(new THREE.Vector3(0, 8, 0)));
          ray.set(origin, new THREE.Vector3(0, -1, 0));
          expect(
            ray.intersectObject(pool, false).length,
            `Trayectoria ${step} sobre la poza`,
          ).toBeGreaterThan(0);
        }
      }
      const peaks = new Map<string, number>();
      let splash = false,
        rings = false;
      for (let time = 0; time < 12; time += 0.05) {
        updateMiniature(model, time);
        for (const object of fish)
          if (object.visible)
            peaks.set(object.name, Math.max(peaks.get(object.name) ?? 0, object.position.y));
        school.traverse((object) => {
          if (object instanceof THREE.InstancedMesh && object.count > 0) splash = true;
          if (
            object.name === 'Ondas del chapoteo' &&
            object.visible &&
            (object as THREE.Mesh<THREE.BufferGeometry, THREE.Material>).material.opacity > 0
          )
            rings = true;
        });
      }
      expect(peaks.size).toBe(4);
      expect([...peaks.values()].every((height) => height > 5.7)).toBe(true);
      expect(splash && rings).toBe(true);
      updateMiniature(model, 2.1);
      const held = fish.map((object) => object.position.toArray());
      updateMiniature(model, 2.1);
      expect(fish.map((object) => object.position.toArray())).toEqual(held);
      expect(pool.material.userData.flowClock.value).toBe(2.1);
      disposeMiniature(model);
      updateMiniature(model, 9);
      expect(pool.material.userData.flowClock.value).toBe(2.1);
    } finally {
      disposeMiniature(model);
    }
  });
});

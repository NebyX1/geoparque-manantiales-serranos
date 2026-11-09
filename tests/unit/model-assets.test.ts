import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { places } from '../../src/data/geosites';
import approvals from '../../docs/landmark-asset-approvals.json';

const inherited = new Set([1, 9, 10, 11, 14, 22, 31, 33, 39, 41, 46, 49, 54]);
const models = places.filter((place) => !inherited.has(place.id));
describe('archivos de las 48 miniaturas reconstruidas', () => {
  it('conserva un GLB por ID sin sustitutos genéricos, vacío, NaN o geometría fuera de presupuesto', () => {
    const directory = new URL('../../public/models/geosites/rebuilt/', import.meta.url);
    expect(readdirSync(directory).filter((file) => file.endsWith('.glb'))).toHaveLength(
      models.length,
    );
    expect(approvals.assets.map((entry) => entry.id).sort((a, b) => a - b)).toEqual(
      models.map((model) => model.id).sort((a, b) => a - b),
    );
    for (const model of models) {
      const data = readFileSync(new URL(`gms-${String(model.id).padStart(2, '0')}.glb`, directory));
      const approval = approvals.assets.find((entry) => entry.id === model.id)!;
      expect(approval.status, model.name).toBe('APROBADO');
      expect(createHash('sha256').update(data).digest('hex'), model.name).toBe(approval.sha256);
      expect(data.readUInt32LE(0), model.name).toBe(0x46546c67);
      expect(data.readUInt32LE(4)).toBe(2);
      expect(data.readUInt32LE(8)).toBe(data.length);
      const gltf = JSON.parse(data.toString('utf8', 20, 20 + data.readUInt32LE(12)));
      if (model.id === 61) {
        // The stone must keep its baked albedo and relief after leaving Blender.
        // Blender-only procedural nodes would render correctly there and vanish here.
        const mineral = gltf.materials.filter((material: { name: string }) =>
          /mottled grey beige tower|curved aged mineral cap/.test(material.name),
        );
        expect(mineral).toHaveLength(2);
        for (const material of mineral) {
          expect(material.pbrMetallicRoughness.baseColorTexture.index).toBeTypeOf('number');
          expect(material.normalTexture.index).toBeTypeOf('number');
        }
        expect(gltf.images).toHaveLength(4);
        for (const image of gltf.images) {
          expect(image.uri).toBeUndefined();
          expect(image.bufferView).toBeTypeOf('number');
          expect(image.mimeType).toBe('image/png');
        }
      }
      let triangles = 0,
        draws = 0;
      for (const mesh of gltf.meshes)
        for (const primitive of mesh.primitives) {
          expect(primitive.mode ?? 4).toBe(4);
          const positions = gltf.accessors[primitive.attributes.POSITION];
          expect(positions.count).toBeGreaterThan(2);
          expect([...positions.min, ...positions.max].every(Number.isFinite), model.name).toBe(
            true,
          );
          triangles += (gltf.accessors[primitive.indices]?.count ?? positions.count) / 3;
          draws++;
        }
      expect(triangles, model.name).toBeGreaterThan(10);
      expect(triangles, model.name).toBeLessThanOrEqual(150000);
      expect(draws, model.name).toBeLessThan(100);
    }
  });
});

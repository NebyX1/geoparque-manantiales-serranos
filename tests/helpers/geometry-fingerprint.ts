import { createHash } from 'node:crypto';
import * as THREE from 'three';

/** Geometry identity after baking transforms; independent of object names and batching. */
export function geometryFingerprint(root: THREE.Group) {
  root.updateMatrixWorld(true);
  const vertices: string[] = [];
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) return;
    const geometry = object.geometry.index
      ? object.geometry.toNonIndexed()
      : object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    const positions = geometry.getAttribute('position');
    const material = object.material as THREE.MeshStandardMaterial;
    const color = material.color.getHexString();
    for (let i = 0; i < positions.count; i++)
      vertices.push(
        `${color}/${positions.getX(i).toFixed(6)}/${positions.getY(i).toFixed(6)}/${positions.getZ(i).toFixed(6)}`,
      );
    geometry.dispose();
  });
  return {
    sha256: createHash('sha256').update(vertices.sort().join('\n')).digest('hex'),
    vertices: vertices.length,
  };
}

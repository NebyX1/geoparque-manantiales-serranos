import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { geographicPlaces } from '../../src/data/geography';
import {
  createClusterHouse,
  createClusterInterior,
} from '../../src/features/experience/cluster-houses';
import { layoutCluster } from '../../src/features/experience/clusters';
import { experienceClusters } from '../../src/features/experience/cluster-data';
import { gatewayPosition, withinGateway } from '../../src/features/experience/gateways';
import { territoryHeight } from '../../src/features/experience/territory';
import type {
  ExperienceCluster,
  LocatedExperiencePoint,
} from '../../src/features/experience/types';

const points: LocatedExperiencePoint[] = geographicPlaces.map((place) => ({
  ...place,
  located: true,
  location: place.location!,
  x: place.position!.x,
  z: place.position!.z,
}));
function fixture(style: number): ExperienceCluster {
  return {
    id: `test-${style}`,
    name: `Casa virtual ${style}`,
    region: 'Zona de prueba',
    description: 'Espacio virtual de prueba.',
    memberIds: [1, 2],
    x: 10,
    z: 20,
    style,
  };
}
function dispose(group: THREE.Group) {
  const geometry = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      geometry.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material])
        materials.add(material);
    }
  });
  geometry.forEach((part) => part.dispose());
  materials.forEach((part) => part.dispose());
  group.clear();
}
function meshes(group: THREE.Group) {
  const children: THREE.Mesh[] = [];
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) children.push(object);
  });
  return children;
}

describe('casas virtuales de agrupación', () => {
  it('crea ocho siluetas diferentes y mantiene el corredor de entrada libre', () => {
    const signatures = new Set<string>();
    for (let style = 0; style < 8; style++) {
      const cluster = fixture(style);
      const house = createClusterHouse(cluster, 3);
      try {
        expect(house.group.userData['virtualBuilding']).toBe(true);
        expect(house.door).toEqual({ x: 10, z: 25.3 });
        house.group.rotation.y = (style * Math.PI) / 8;
        house.group.updateMatrixWorld(true);
        const objects = meshes(house.group);
        const bounds = new THREE.Box3().setFromObject(house.group);
        signatures.add(
          `${objects.reduce((sum, object) => sum + object.geometry.getAttribute('position').count, 0)}:${bounds.max.y.toFixed(3)}`,
        );
        expect(objects.length).toBeLessThan(30);
        for (const x of [-1.6, 0, 1.6]) {
          for (const height of [1, 3, 4.8]) {
            const ray = new THREE.Raycaster(
              house.group.localToWorld(new THREE.Vector3(x, height, 8)),
              new THREE.Vector3(0, 0, -1).transformDirection(house.group.matrixWorld),
              0,
              5,
            );
            expect(
              ray.intersectObjects(objects, false),
              `Puerta física libre del diseño ${style} en ${x}, a altura ${height}`,
            ).toHaveLength(0);
          }
          const threshold = house.group.localToWorld(new THREE.Vector3(x, 0, 5.3));
          expect(withinGateway(house.entrance, threshold, 'walk')).toBe(true);
        }
        for (const collider of house.colliders) {
          expect(Math.hypot(collider.x - house.door.x, collider.z - house.door.z)).toBeGreaterThan(
            collider.radius + 1.2,
          );
        }
      } finally {
        dispose(house.group);
      }
    }
    expect(signatures.size).toBe(8);
  });

  it.each(experienceClusters)(
    'une el umbral y el piso visible con el relieve real: $name',
    (cluster) => {
      const house = createClusterHouse(cluster, territoryHeight);
      try {
        house.group.updateMatrixWorld(true);
        const objects = meshes(house.group);
        const colliders = house.colliders;
        const door = gatewayPosition(house.entrance);
        expect(house.floorAt(door.x, door.z), cluster.name).toBeCloseTo(door.y, 5);
        for (const x of [-1.6, 0, 1.6]) {
          for (let step = 0; step <= 12; step++) {
            const position = house.group.localToWorld(
              new THREE.Vector3(x, 0, 5.3 + (4.2 * step) / 12),
            );
            const floor = house.floorAt(position.x, position.z);
            expect(floor, `${cluster.name}: rampa ${x}/${step}`).not.toBeNull();
            expect(floor!).toBeGreaterThanOrEqual(territoryHeight(position.x, position.z));
            const surface = new THREE.Raycaster(
              new THREE.Vector3(position.x, floor! + 0.8, position.z),
              new THREE.Vector3(0, -1, 0),
              0,
              1.1,
            ).intersectObjects(objects, false)[0];
            expect(surface, `${cluster.name}: piso visible de la rampa ${x}/${step}`).toBeDefined();
            expect(
              Math.abs(surface!.point.y - floor!),
              `${cluster.name}: piso visible ${surface!.point.y} / tránsito ${floor} en ${x}/${step}`,
            ).toBeLessThan(0.12);
            for (const collider of colliders)
              expect(Math.hypot(position.x - collider.x, position.z - collider.z)).toBeGreaterThan(
                collider.radius + 0.35,
              );
          }
        }
        const outside = gatewayPosition(house.entrance, 4.2);
        expect(house.floorAt(outside.x, outside.z)).toBeCloseTo(
          territoryHeight(outside.x, outside.z) + 0.03,
          5,
        );
      } finally {
        dispose(house.group);
      }
    },
  );

  it('conserva podios separados, piso a cero, salida despejada y cámara sin techo central', () => {
    for (let style = 0; style < 8; style++) {
      const cluster = fixture(style);
      const layout = layoutCluster(cluster, points);
      const room = createClusterInterior(cluster, layout);
      try {
        expect(room.group.position.toArray()).toEqual([0, 0, 0]);
        expect(room.exitStructure.parent).toBe(room.group);
        expect(room.exitStructure.userData['exitStructure']).toBe(true);
        expect(room.exitStructure.position.toArray()).toEqual([layout.exit.x, 0, layout.exit.z]);
        room.group.updateMatrixWorld(true);
        const objects = meshes(room.group);
        expect(room.colliders.filter((collider) => collider.radius === 5.15)).toHaveLength(2);
        for (const point of layout.points) {
          const ray = new THREE.Raycaster(
            new THREE.Vector3(point.x, 2, point.z),
            new THREE.Vector3(0, -1, 0),
            0,
            2,
          );
          expect(ray.intersectObjects(objects, false)[0]!.point.y).toBeCloseTo(0.4, 5);
        }
        const ceiling = new THREE.Raycaster(
          new THREE.Vector3(0, 10, 0),
          new THREE.Vector3(0, -1, 0),
          0,
          9,
        );
        expect(ceiling.intersectObjects(objects, false)).toHaveLength(0);
        for (const collider of room.colliders) {
          expect(
            Math.hypot(collider.x - layout.exit.x, collider.z - layout.exit.z),
          ).toBeGreaterThan(collider.radius + 1);
        }
      } finally {
        dispose(room.group);
      }
    }
  });
});

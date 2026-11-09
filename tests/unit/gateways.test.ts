import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  gatewayPosition,
  withinGateway,
  type Gateway,
} from '../../src/features/experience/gateways';

describe('acceso por el umbral visible', () => {
  for (const approach of [1, -1] as const) {
    it(`mantiene alineados el paso, la acción y el regreso con aproximación ${approach}`, () => {
      const house = new THREE.Group();
      house.position.set(27, 4.5, -32);
      house.rotation.y = Math.PI / 3;
      const anchor = new THREE.Object3D();
      anchor.position.set(0, 0.2, 5.3);
      house.add(anchor);
      const gateway: Gateway = { anchor, halfWidth: 1.65, approach };
      const at = (x: number, depth: number) => {
        anchor.updateWorldMatrix(true, false);
        return anchor.localToWorld(new THREE.Vector3(x, 0, depth * approach));
      };
      for (const x of [-1.6, 0, 1.6])
        for (const depth of [-1.4, 0, 1.4]) {
          expect(withinGateway(gateway, at(x, depth), 'walk')).toBe(true);
          expect(withinGateway(gateway, at(x, depth), 'interact')).toBe(true);
        }
      // A broad approach keeps E, click and touch comfortable; it cannot reach
      // around a wall or activate the portal from the side of the facade.
      expect(withinGateway(gateway, at(2.5, 5), 'interact')).toBe(true);
      expect(withinGateway(gateway, at(2.5, 5), 'walk')).toBe(false);
      for (const [x, depth] of [
        [5, 0],
        [3, -0.5],
        [0, -4],
        [0, 9.1],
      ]) {
        expect(withinGateway(gateway, at(x!, depth!), 'interact')).toBe(false);
        expect(withinGateway(gateway, at(x!, depth!), 'walk')).toBe(false);
      }
      expect(gatewayPosition(gateway).distanceTo(at(0, 0))).toBeLessThan(0.000001);
      expect(gatewayPosition(gateway, 4.2).distanceTo(at(0, 4.2))).toBeLessThan(0.000001);
      house.rotation.y = -Math.PI / 2;
      house.position.set(-4, 7, 23);
      expect(withinGateway(gateway, at(1.5, 0), 'walk')).toBe(true);
      expect(withinGateway(gateway, at(5, 0), 'interact')).toBe(false);
      expect(gatewayPosition(gateway, 4.2).distanceTo(at(0, 4.2))).toBeLessThan(0.000001);
    });
  }
});

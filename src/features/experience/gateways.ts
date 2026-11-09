import * as THREE from 'three';

export interface Gateway {
  /** The visible threshold's own local frame; +Z points out of the house. */
  anchor: THREE.Object3D;
  halfWidth: number;
  approach: 1 | -1;
}

interface GroundPoint {
  x: number;
  z: number;
}

const thresholdDepth = 1.5;
const interactionDepth = 9;

/** Derive every destination from the actual doorway, including its rotation. */
export function gatewayPosition(gateway: Gateway, approachDistance = 0) {
  gateway.anchor.updateWorldMatrix(true, false);
  return gateway.anchor.localToWorld(new THREE.Vector3(0, 0, approachDistance * gateway.approach));
}

/**
 * Walking uses the whole clear opening. Manual controls reach farther along its
 * approach, without making the house's side walls into invisible entrances.
 */
export function withinGateway(gateway: Gateway, point: GroundPoint, mode: 'walk' | 'interact') {
  gateway.anchor.updateWorldMatrix(true, false);
  const local = gateway.anchor.worldToLocal(new THREE.Vector3(point.x, 0, point.z));
  const depth = local.z * gateway.approach;
  if (mode === 'walk')
    return Math.abs(local.x) <= gateway.halfWidth && Math.abs(depth) <= thresholdDepth;
  return (
    depth >= -thresholdDepth &&
    depth <= interactionDepth &&
    Math.abs(local.x) <= gateway.halfWidth + Math.max(0, depth) * 0.4
  );
}

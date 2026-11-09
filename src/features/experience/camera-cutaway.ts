interface Point3 {
  x: number;
  y: number;
  z: number;
}
interface Bounds3 {
  min: Point3;
  max: Point3;
}

/** Cut away buildings behind the player, never the house being approached. */
export function houseObstructsPlayer(bounds: Bounds3, camera: Point3, chest: Point3) {
  const direction = {
    x: chest.x - camera.x,
    y: chest.y - camera.y,
    z: chest.z - camera.z,
  };
  const horizontalLengthSquared = direction.x ** 2 + direction.z ** 2;
  if (horizontalLengthSquared < 0.01) return false;
  const centerProjection =
    ((bounds.min.x + bounds.max.x - 2 * camera.x) * direction.x +
      (bounds.min.z + bounds.max.z - 2 * camera.z) * direction.z) /
    (2 * horizontalLengthSquared);
  // A house beyond the avatar stays visible, including its doorway and roof.
  if (centerProjection <= 0 || centerProjection >= 1) return false;
  let enter = 0;
  let leave = 1;
  for (const axis of ['x', 'y', 'z'] as const) {
    const low = bounds.min[axis] - 0.35;
    const high = bounds.max[axis] + 0.35;
    if (Math.abs(direction[axis]) < 1e-8) {
      if (camera[axis] < low || camera[axis] > high) return false;
      continue;
    }
    const a = (low - camera[axis]) / direction[axis];
    const b = (high - camera[axis]) / direction[axis];
    enter = Math.max(enter, Math.min(a, b));
    leave = Math.min(leave, Math.max(a, b));
    if (enter > leave) return false;
  }
  return enter < 1 && leave > 0;
}

/** The room's open front is +z; preserve the portal when looking out. */
export function exitPortalObstructsInterior(camera: Point3, chest: Point3, portalZ: number) {
  return camera.z > portalZ + 0.1 && chest.z < portalZ - 0.1;
}

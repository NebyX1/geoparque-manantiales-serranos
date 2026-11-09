import type { Group } from 'three';

export const ARCHITECTURE_MODEL_IDS = [
  27, 28, 29, 30, 32, 34, 35, 36, 37, 38, 40, 42, 43, 44, 45, 47, 48, 60, 61,
] as const;

/** Authored in Blender from the photographic dossiers; loaded by the GLB pipeline. */
export const architectureAssets = Object.fromEntries(
  ARCHITECTURE_MODEL_IDS.map((id) => [id, `rebuilt/gms-${id}.glb`]),
) as Readonly<Record<number, string>>;

export function createArchitecture(id: number): Group | null {
  if ((ARCHITECTURE_MODEL_IDS as readonly number[]).includes(id)) {
    throw new Error(`GMS-${id}: la arquitectura documentada requiere su modelo GLB.`);
  }
  return null;
}

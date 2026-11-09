import type { Group } from 'three';
import { createArchitecture } from './rebuilt/architectureRebuilt';
import { createNatural } from './rebuilt/naturalLandmarks';

/** Explicit factories replace the previous generic kind/variant shapes. */
export function createInterpretive(id: number): Group {
  const group = createArchitecture(id) ?? createNatural(id);
  if (!group) throw new RangeError(`GMS-${id} requires its authored miniature asset`);
  return group;
}

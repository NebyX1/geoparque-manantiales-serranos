import type { Diorama, Ground } from './naturalGeometry';

/** A playful reading of the ridge, requested for the miniature; not surveyed anatomy. */
export function marmarajaRelief(x: number, z: number, elevation: number): number {
  const mound = (cx: number, cz: number, width: number, depth: number, height: number) =>
    height * Math.exp(-Math.pow((x - cx) / width, 2) - Math.pow((z - cz) / depth, 2));
  // The northern summit becomes a broad rocky brow; the grassy middle stays rounded.
  const brow = mound(0.34, -2.5, 0.76, 0.68, 0.28);
  const snout = mound(0.2, -3.23, 0.53, 0.53, 0.16);
  const back = mound(0.28, -0.2, 1.02, 1.45, 0.18);
  // Low lateral spurs suggest shoulders/haunches without separate limbs or toes.
  const spurs =
    mound(-0.95, -1.25, 0.83, 0.42, 0.16) +
    mound(1.38, -1.03, 0.73, 0.45, 0.14) +
    mound(-1.04, 0.65, 0.86, 0.55, 0.23) +
    mound(1.55, 0.88, 0.88, 0.52, 0.2);
  const t = (z - 0.75) / 3.15;
  let tail = 0;
  if (t > 0 && t < 1) {
    const center = 0.55 + Math.sin(t * Math.PI * 0.9) * 1.2;
    const width = 0.64 * (1 - t) + 0.1;
    tail =
      0.42 *
      Math.sin(t * Math.PI) *
      Math.pow(1 - t, 0.35) *
      Math.exp(-Math.pow((x - center) / width, 2));
  }
  return elevation + brow + snout + back + spurs + tail;
}

export function addMarmarajaOutcrops(d: Diorama, ground: Ground): void {
  // Pale, low exposed stone follows the eastern face of the existing north/south crest.
  // No eyes, mouth, literal scales or animal meshes: the resemblance comes from landform.
  for (let i = 0; i < 18; i++) {
    const z = -3.28 + i * 0.235;
    const x = 0.65 + Math.sin(i * 0.62) * 0.16;
    const width = 0.28 + Math.sin(i * 1.7) * 0.055;
    d.rock(
      x,
      ground.height(x, z) - 0.065,
      z,
      width,
      0.09,
      0.3,
      i % 3 ? '#aba991' : '#999d86',
      i + 82,
    );
  }
  for (let i = 0; i < 10; i++) {
    const t = (i + 1) / 12;
    const z = 0.75 + t * 3.15;
    const x = 0.55 + Math.sin(t * Math.PI * 0.9) * 1.2;
    const size = 0.21 * (1 - t) + 0.045;
    d.rock(
      x,
      ground.height(x, z) - 0.04,
      z,
      size,
      size * 0.3,
      size * 1.35,
      i % 3 ? '#999d86' : '#aba991',
      i + 118,
    );
  }
  d.group.userData.artisticIntent = {
    scope: 'user-requested subtle lizard-like landform',
    features: 'northern rocky brow, rounded grassy back, low side spurs and tapering curved ridge',
    surveyed: false,
  };
}

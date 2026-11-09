import { describe, expect, it } from 'vitest';
import {
  exitPortalObstructsInterior,
  houseObstructsPlayer,
} from '../../src/features/experience/camera-cutaway';

const camera = { x: 0, y: 8, z: 20 };
const chest = { x: 0, y: 3.2, z: 0 };
const house = (x: number, z: number, base = 0) => ({
  min: { x: x - 6, y: base, z: z - 5 },
  max: { x: x + 6, y: base + 8, z: z + 5 },
});

describe('cortes de cámara de tercera persona', () => {
  it('retira una casa interpuesta y conserva la casa a la que se acerca el personaje', () => {
    expect(houseObstructsPlayer(house(0, 10), camera, chest)).toBe(true);
    expect(houseObstructsPlayer(house(0, -8), camera, chest)).toBe(false);
    expect(houseObstructsPlayer(house(0, 30), camera, chest)).toBe(false);
  });

  it('restaura casas fuera de la línea de vista o por debajo de la cámara', () => {
    expect(houseObstructsPlayer(house(20, 10), camera, chest)).toBe(false);
    expect(houseObstructsPlayer(house(0, 10, -20), camera, chest)).toBe(false);
    expect(houseObstructsPlayer(house(0, 10), { x: 40, y: 8, z: 20 }, chest)).toBe(false);
  });

  it('no corta el portal al mirar hacia la salida ni cuando ya queda detrás de la cámara', () => {
    expect(exitPortalObstructsInterior(camera, chest, 12)).toBe(true);
    expect(exitPortalObstructsInterior({ x: 0, y: 8, z: -20 }, chest, 12)).toBe(false);
    expect(exitPortalObstructsInterior(camera, { x: 0, y: 3.2, z: 25 }, 12)).toBe(false);
  });
});

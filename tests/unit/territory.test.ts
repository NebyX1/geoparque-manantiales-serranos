import { describe, expect, it } from 'vitest';
import { geographicPlaces } from '../../src/data/geography';
import elevation from '../../src/data/geography/territory-elevation.json' with { type: 'json' };
import {
  containsTerritory,
  constrainToTerritory,
  shoreDistance,
  territoryBoundary,
  territoryBounds,
  territoryElevation,
  territoryHeight,
  TERRITORY_BASE_HEIGHT,
  TERRITORY_VERTICAL_EXAGGERATION,
} from '../../src/features/experience/territory';
import { createTerritoryGeometry } from '../../src/features/experience/territory-mesh';

describe('mundo con el contorno geográfico real', () => {
  it('mantiene los 61 puntos del catálogo dentro del límite y rechaza las esquinas del antiguo rectángulo', () => {
    for (const place of geographicPlaces) {
      expect(place.position).not.toBeNull();
      expect(containsTerritory(place.position!.x, place.position!.z), place.name).toBe(true);
    }
    for (const x of [territoryBounds.minX, territoryBounds.maxX]) {
      for (const z of [territoryBounds.minZ, territoryBounds.maxZ]) {
        expect(containsTerritory(x, z)).toBe(false);
        expect(territoryHeight(x, z)).toBe(TERRITORY_BASE_HEIGHT);
      }
    }
    expect(territoryBoundary).toHaveLength(1307);
  });

  it('distingue costa, interior y exterior sin propagar entradas inválidas', () => {
    const point = territoryBoundary[0]!;
    expect(containsTerritory(point.x, point.z)).toBe(true);
    expect(shoreDistance(point.x, point.z)).toBe(0);
    expect(shoreDistance(0, 0)).toBeGreaterThan(0);
    expect(shoreDistance(200, 200)).toBeLessThan(0);
    expect(containsTerritory(NaN, 0)).toBe(false);
    expect(containsTerritory(0, Infinity)).toBe(false);
    expect(
      containsTerritory(
        ...(Object.values(constrainToTerritory(NaN, Infinity)) as [number, number]),
      ),
    ).toBe(true);
  });

  it('impide atravesar una concavidad aunque el destino vuelva a estar dentro', () => {
    const start = { x: -90, z: 40 };
    const end = { x: -80, z: 60 };
    expect(containsTerritory(start.x, start.z)).toBe(true);
    expect(containsTerritory(end.x, end.z)).toBe(true);
    expect(containsTerritory(-85, 50)).toBe(false);
    const stopped = constrainToTerritory(end.x, end.z, start.x, start.z);
    expect(containsTerritory(stopped.x, stopped.z)).toBe(true);
    expect(stopped.x).toBeLessThan(-85);
    for (let step = 0; step <= 20; step++) {
      const t = step / 20;
      expect(
        containsTerritory(start.x + (stopped.x - start.x) * t, start.z + (stopped.z - start.z) * t),
      ).toBe(true);
    }
  });

  it('recupera teletransportes fuera del mundo sin alterar los que ya son válidos', () => {
    for (const point of [
      { x: 500, z: 500 },
      { x: -500, z: -500 },
      { x: -200, z: 30 },
    ]) {
      const result = constrainToTerritory(point.x, point.z);
      expect(containsTerritory(result.x, result.z)).toBe(true);
    }
    expect(constrainToTerritory(-90, 40)).toEqual({ x: -90, z: 40 });
    expect(constrainToTerritory(NaN, 100, -90, 40)).toEqual({ x: -90, z: 40 });
  });

  it('usa la cuadrícula georreferenciada norte-sur y declara la exageración de seis veces', () => {
    expect(elevation.grid).toBe(128);
    expect(elevation.heights).toHaveLength(128 * 128);
    expect(elevation.rows).toBe('north-to-south');
    expect(elevation.columns).toBe('west-to-east');
    expect(territoryElevation(territoryBounds.minX, territoryBounds.minZ)).toBe(
      elevation.heights[0],
    );
    expect(territoryElevation(territoryBounds.maxX, territoryBounds.minZ)).toBe(
      elevation.heights[127],
    );
    expect(territoryElevation(territoryBounds.maxX, territoryBounds.maxZ)).toBe(
      elevation.heights.at(-1),
    );
    expect(TERRITORY_VERTICAL_EXAGGERATION).toBe(6);
    for (const place of geographicPlaces) {
      const { x, z } = place.position!;
      expect(territoryHeight(x, z)).toBeCloseTo((territoryElevation(x, z) * 6) / 400, 9);
    }
    expect(
      elevation.source.tiles.every(
        (tile) => /^https:\/\//.test(tile.url) && /^[a-f\d]{64}$/.test(tile.sha256),
      ),
    ).toBe(true);
  });

  it('triangula la superficie y sus costados sin rellenar las entradas del contorno', () => {
    const geometry = createTerritoryGeometry();
    try {
      const positions = geometry.surface.getAttribute('position');
      const indices = geometry.surface.index!;
      let area = 0;
      for (let index = 0; index < indices.count; index += 3) {
        const a = indices.getX(index),
          b = indices.getX(index + 1),
          c = indices.getX(index + 2);
        const ax = positions.getX(a),
          az = positions.getZ(a);
        const bx = positions.getX(b),
          bz = positions.getZ(b);
        const cx = positions.getX(c),
          cz = positions.getZ(c);
        const cross = (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
        expect(cross).toBeLessThanOrEqual(0.0001);
        area += Math.abs(cross) / 2;
        const x = (ax + bx + cx) / 3,
          z = (az + bz + cz) / 3;
        if (!containsTerritory(x, z)) expect(shoreDistance(x, z)).toBeGreaterThan(-0.0001);
      }
      const expectedArea =
        Math.abs(
          territoryBoundary.reduce((sum, point, index) => {
            const next = territoryBoundary[(index + 1) % territoryBoundary.length]!;
            return sum + point.x * next.z - next.x * point.z;
          }, 0),
        ) / 2;
      expect(Math.abs(area - expectedArea) / expectedArea).toBeLessThan(0.00001);
      expect(indices.count / 3).toBeLessThan(100_000);
      expect(geometry.sides.index!.count).toBe(territoryBoundary.length * 6);
      expect(geometry.border.getAttribute('position').count).toBe(territoryBoundary.length * 2);
      expect(
        geometry.surface.boundingBox!.max.y - geometry.surface.boundingBox!.min.y,
      ).toBeGreaterThan(3);
    } finally {
      Object.values(geometry).forEach((part) => part.dispose());
    }
    expect(() => createTerritoryGeometry(0)).toThrow(RangeError);
  });
});

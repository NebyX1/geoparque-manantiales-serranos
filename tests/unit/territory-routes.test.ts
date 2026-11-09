import { describe, expect, it } from 'vitest';
import {
  territoryRoads,
  territoryWaterways,
  territoryRouteSource,
} from '../../src/features/experience/territory-routes';
import { containsTerritory, shoreDistance } from '../../src/features/experience/territory';

describe('trazados reales del geoparque', () => {
  it('incluye el Santa Lucía y las rutas presentes en la fuente regional con sus identificadores', () => {
    expect(territoryWaterways.some((line) => /SANTA LUC/i.test(line.name))).toBe(true);
    expect(new Set(territoryRoads.map((line) => line.ref))).toEqual(
      new Set(['8', '12', '60', '81']),
    );
    expect(territoryRouteSource.provider).toContain('IDE Uruguay');
    expect(territoryRouteSource.simplificationMeters).toBe(20);
    for (const line of [...territoryRoads, ...territoryWaterways]) {
      expect(line.points.length).toBeGreaterThanOrEqual(2);
      expect(line.sourceIds.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('recorta al contorno real sin puentear entrantes y conserva un presupuesto acotado', () => {
    const lines = [...territoryRoads, ...territoryWaterways];
    expect(lines.reduce((sum, line) => sum + line.points.length, 0)).toBeLessThan(20000);
    for (const line of lines) {
      for (let index = 0; index < line.points.length - 1; index++) {
        const a = line.points[index]!,
          b = line.points[index + 1]!;
        for (const t of [0, 0.25, 0.5, 0.75, 1]) {
          const x = a.x + (b.x - a.x) * t,
            z = a.z + (b.z - a.z) * t;
          if (!containsTerritory(x, z)) expect(shoreDistance(x, z)).toBeGreaterThan(-0.0001);
        }
      }
    }
  });
});

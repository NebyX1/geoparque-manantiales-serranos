import { describe, expect, it } from 'vitest';
import { experienceClusters } from '../../src/features/experience/cluster-data';
import { availableClusters, layoutCluster } from '../../src/features/experience/clusters';
import { locatedExperiencePoints } from '../../src/features/experience/scene-data';
import { shoreDistance } from '../../src/features/experience/territory';

describe('casas para las concentraciones geográficas', () => {
  it('elimina referencias interiores ausentes y disuelve grupos con un solo lugar ubicado', () => {
    const incomplete = locatedExperiencePoints.filter((point) => point.id !== 58);
    const clusters = availableClusters(experienceClusters, incomplete);
    expect(clusters.some((cluster) => cluster.id === 'valle')).toBe(false);
    expect(clusters.flatMap((cluster) => cluster.memberIds)).not.toContain(58);
    expect(incomplete.some((point) => point.id === 59)).toBe(true);
  });
  it('agrupa los 47 puntos próximos en ocho casas distintas sin duplicarlos', () => {
    expect(experienceClusters).toHaveLength(8);
    expect(new Set(experienceClusters.map((item) => item.style)).size).toBe(8);
    expect(new Set(experienceClusters.map((item) => item.name)).size).toBe(8);
    const members = experienceClusters.flatMap((item) => item.memberIds);
    expect(members).toHaveLength(47);
    expect(new Set(members).size).toBe(members.length);
    expect(experienceClusters.find((item) => item.id === 'minas')!.memberIds).toContain(41);
    expect(experienceClusters.find((item) => item.id === 'arequita')!.memberIds).toEqual([
      1, 50, 51, 52, 53,
    ]);
  });

  it('reserva terreno suficiente para la casa y deja 24 unidades entre exposiciones', () => {
    for (const cluster of experienceClusters) {
      for (const other of experienceClusters)
        if (cluster.id !== other.id)
          expect(Math.hypot(cluster.x - other.x, cluster.z - other.z)).toBeGreaterThanOrEqual(26);
      expect(shoreDistance(cluster.x, cluster.z), cluster.name).toBeGreaterThanOrEqual(9);
      const layout = layoutCluster(cluster, locatedExperiencePoints);
      expect(layout.exit.z - layout.spawn.z).toBeGreaterThanOrEqual(10);
      for (const a of layout.points) {
        expect(Math.abs(a.x)).toBeLessThan(layout.width / 2 - 10);
        expect(Math.abs(a.z)).toBeLessThan(layout.depth / 2 - 10);
        for (const b of layout.points)
          if (a.id !== b.id) expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThanOrEqual(24);
      }
    }
  });

  it('mantiene las coordenadas reales separadas de las posiciones interiores', () => {
    const original = structuredClone(locatedExperiencePoints);
    for (const cluster of experienceClusters) {
      for (const point of layoutCluster(cluster, locatedExperiencePoints).points) {
        const canonical = locatedExperiencePoints.find((item) => item.id === point.id)!;
        expect(point.location).toEqual(canonical.location);
        expect(point.name).toBe(canonical.name);
      }
    }
    expect(locatedExperiencePoints).toEqual(original);
  });
});

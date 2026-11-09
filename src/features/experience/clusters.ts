import type { ExperienceCluster, ExperiencePoint, LocatedExperiencePoint } from './types';
import { shoreDistance } from './territory';

const LINK_DISTANCE = 7;
const MAX_DIAMETER = 18;
const identities = [
  { anchor: 1, id: 'arequita', name: 'Casa de Arequita', style: 0 },
  { anchor: 4, id: 'nacientes', name: 'Casa de las nacientes', style: 1 },
  { anchor: 9, id: 'villa-serrana', name: 'Casa de Villa Serrana', style: 2 },
  { anchor: 39, id: 'minas', name: 'Casa de Minas', style: 3 },
  { anchor: 23, id: 'aguas-blancas', name: 'Casa de Aguas Blancas', style: 4 },
  { anchor: 29, id: 'solis', name: 'Casa de Solís de Mataojo', style: 5 },
  { anchor: 33, id: 'verdun', name: 'Casa del entorno del Verdún', style: 6 },
  { anchor: 58, id: 'valle', name: 'Casa del valle serrano', style: 7 },
] as const;

/** An incomplete location inventory cannot leave a doorway to a missing pin. */
export function availableClusters(
  clusters: readonly ExperienceCluster[],
  points: readonly ExperiencePoint[],
) {
  const locatedIds = new Set(points.filter((point) => point.located).map((point) => point.id));
  return clusters
    .map((cluster) => ({
      ...cluster,
      memberIds: cluster.memberIds.filter((id) => locatedIds.has(id)),
    }))
    .filter((cluster) => cluster.memberIds.length > 1);
}

/** Game spaces derived from proximity, not new geographic sites or access routes. */
export function buildExperienceClusters(
  points: readonly LocatedExperiencePoint[],
): ExperienceCluster[] {
  const remaining = [...points].sort((a, b) => a.id - b.id);
  const clusters: ExperienceCluster[] = [];
  while (remaining.length) {
    const members = [remaining.shift()!];
    let added = true;
    while (added) {
      added = false;
      for (let i = 0; i < remaining.length;) {
        const point = remaining[i]!;
        const distances = members.map((other) => Math.hypot(other.x - point.x, other.z - point.z));
        if (
          distances.some((distance) => distance < LINK_DISTANCE) &&
          distances.every((distance) => distance < MAX_DIAMETER)
        ) {
          members.push(point);
          remaining.splice(i, 1);
          added = true;
        } else i++;
      }
    }
    if (members.length < 2) continue;
    members.sort((a, b) => a.id - b.id);
    const identity = identities.find((candidate) =>
      members.some((point) => point.id === candidate.anchor),
    );
    const region = members[0]!.region;
    const anchor = {
      x: members.reduce((sum, point) => sum + point.x, 0) / members.length,
      z: members.reduce((sum, point) => sum + point.z, 0) / members.length,
    };
    let house = { ...anchor };
    // These are virtual gateways. Keep the whole house on the real land shape
    // without moving any of its original geographic points.
    if (shoreDistance(house.x, house.z) < 9) {
      let best = Infinity;
      for (let dz = -30; dz <= 30; dz++)
        for (let dx = -30; dx <= 30; dx++) {
          const distance = dx * dx + dz * dz;
          if (distance < best && shoreDistance(anchor.x + dx, anchor.z + dz) >= 9) {
            best = distance;
            house = { x: anchor.x + dx, z: anchor.z + dz };
          }
        }
    }
    clusters.push({
      id: identity?.id ?? `grupo-${members[0]!.id}`,
      name: identity?.name ?? `Casa de ${region}`,
      region,
      description: `Una casa virtual para recorrer ${members.length} lugares próximos de ${region}. Dentro, cada lugar tiene su propio espacio de exposición. Las distancias interiores son escénicas; sus fichas conservan las ubicaciones y condiciones de visita documentadas.`,
      memberIds: members.map((point) => point.id),
      ...house,
      style: identity?.style ?? clusters.length,
    });
  }
  const clustered = new Set(clusters.flatMap((cluster) => cluster.memberIds));
  const outside = points.filter((point) => !clustered.has(point.id));
  const placed: ExperienceCluster[] = [];
  for (const cluster of clusters) {
    const fits = (x: number, z: number) =>
      shoreDistance(x, z) >= 10 &&
      placed.every((other) => Math.hypot(x - other.x, z - other.z) >= 26) &&
      outside.every((point) => Math.hypot(x - point.x, z - point.z) >= 14);
    if (!fits(cluster.x, cluster.z)) {
      const anchor = { x: cluster.x, z: cluster.z };
      let best = Infinity;
      let position: { x: number; z: number } | undefined;
      for (let dz = -65; dz <= 65; dz++)
        for (let dx = -65; dx <= 65; dx++) {
          const distance = dx * dx + dz * dz;
          if (distance < best && fits(anchor.x + dx, anchor.z + dz)) {
            best = distance;
            position = { x: anchor.x + dx, z: anchor.z + dz };
          }
        }
      if (!position) throw new Error(`No hay espacio de exploración para ${cluster.name}.`);
      cluster.x = position.x;
      cluster.z = position.z;
    }
    placed.push(cluster);
  }
  return placed;
}

/** Generous, deterministic exhibition spacing. Never exported as GPS coordinates. */
export function layoutCluster(
  cluster: ExperienceCluster,
  points: readonly LocatedExperiencePoint[],
) {
  const columns = Math.ceil(Math.sqrt(cluster.memberIds.length));
  const rows = Math.ceil(cluster.memberIds.length / columns);
  const spacing = 24;
  const width = columns * spacing + 32;
  const depth = rows * spacing + 52;
  const members = cluster.memberIds.map((id, index) => {
    const point = points.find((candidate) => candidate.id === id);
    if (!point) throw new Error(`La casa ${cluster.id} refiere al lugar inexistente ${id}.`);
    return {
      ...point,
      x: ((index % columns) - (columns - 1) / 2) * spacing,
      z: (Math.floor(index / columns) - (rows - 1) / 2) * spacing - 8,
    };
  });
  return {
    points: members,
    width,
    depth,
    exit: { x: 0, z: depth / 2 - 5 },
    spawn: { x: 0, z: depth / 2 - 16 },
  };
}

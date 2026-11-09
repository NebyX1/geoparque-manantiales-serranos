import snapshot from '../../data/geography/territory-routes.json' with { type: 'json' };
import type { TerritoryPoint } from './territory';

export interface TerritoryRoute {
  name: string;
  points: readonly TerritoryPoint[];
  sourceId: string;
  sourceIds: readonly string[];
  ref?: string;
}

/** Published IDE centre lines, simplified 20 m and clipped to the official contour. */
export const territoryWaterways: readonly TerritoryRoute[] = snapshot.waterways;
export const territoryRoads: readonly TerritoryRoute[] = snapshot.roads;
export const territoryRouteSource = snapshot.source;
export const territoryRouteStatistics = snapshot.statistics;

import { geographicPlaces } from '../../data/geography';
import type { ExperiencePoint, LocatedExperiencePoint } from './types';

/** Positions share one geographic projection with the real map. No inferred pins. */
export function toExperiencePoint(
  place: Pick<
    (typeof geographicPlaces)[number],
    'id' | 'name' | 'category' | 'region' | 'location' | 'position'
  >,
): ExperiencePoint {
  const content = {
    id: place.id,
    name: place.name,
    category: place.category,
    region: place.region,
  };
  if (!place.location || !place.position) {
    return { ...content, located: false, location: null, x: null, z: null };
  }
  return { ...content, located: true, location: place.location, ...place.position };
}

export const experiencePoints: ExperiencePoint[] = geographicPlaces.map(toExperiencePoint);

export const locatedExperiencePoints = experiencePoints.filter(
  (point): point is LocatedExperiencePoint => point.located,
);

import { placeById, places } from './geosites';
import boundarySnapshot from './geography/boundary-path.json' with { type: 'json' };
import locationRecords from './geography/locations.json' with { type: 'json' };

export interface PlaceLocation {
  id: number;
  latitude: number;
  longitude: number;
  sourceUrl: string;
  sourceLabel: string;
  accuracy: 'verified_documented' | 'approximate';
  notes: string;
  /** Short public label when the marker represents an associated reference. */
  referenceLabel?: string;
  checkedAt: '2026-11-08';
}

const CENTER_LATITUDE = -34.359205175;
const CENTER_LONGITUDE = -55.13268945;
const METERS_PER_DEGREE = 111_195;
const METERS_PER_SCENE_UNIT = 400;
const LONGITUDE_METERS_PER_DEGREE = METERS_PER_DEGREE * Math.cos((CENTER_LATITUDE * Math.PI) / 180);

/** Fixed local projection: east is +x, north is -z; one scene unit is 400 m. */
export function projectLocation(latitude: number, longitude: number): { x: number; z: number } {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    throw new RangeError('La ubicación debe contener latitud y longitud WGS84 válidas.');
  }

  return {
    x: ((longitude - CENTER_LONGITUDE) * LONGITUDE_METERS_PER_DEGREE) / METERS_PER_SCENE_UNIT,
    z: (-(latitude - CENTER_LATITUDE) * METERS_PER_DEGREE) / METERS_PER_SCENE_UNIT,
  };
}

const locationsById = new Map<number, PlaceLocation>();

for (const record of locationRecords) {
  if (
    !placeById.has(record.id) ||
    locationsById.has(record.id) ||
    record.checkedAt !== '2026-11-08' ||
    (record.accuracy !== 'verified_documented' && record.accuracy !== 'approximate')
  ) {
    throw new Error(`Registro geográfico inválido o duplicado: ${record.id}.`);
  }

  projectLocation(record.latitude, record.longitude);
  locationsById.set(record.id, {
    ...record,
    accuracy: record.accuracy,
    checkedAt: '2026-11-08',
  });
}

export function getPlaceLocation(id: number): PlaceLocation | null {
  return locationsById.get(id) ?? null;
}

export const geographicPlaces = places.map((place) => {
  const location = getPlaceLocation(place.id);
  return {
    ...place,
    location,
    position: location ? projectLocation(location.latitude, location.longitude) : null,
  };
});

/** Official territory, simplified at 20 m and projected in the same x/z coordinates. */
export const boundaryPath: string = boundarySnapshot.path;

export const geographyCoverage = {
  located: locationsById.size,
  verified: locationRecords.filter((location) => location.accuracy === 'verified_documented')
    .length,
  approximate: locationRecords.filter((location) => location.accuracy === 'approximate').length,
  unresolved: places.length - locationsById.size,
};

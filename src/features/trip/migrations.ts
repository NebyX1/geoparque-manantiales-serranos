import type { TripState } from '../../types/geopark';
export const TRIP_KEY = 'manantiales-serranos:trip:v1';
export const LEGACY_KEY = 'manantiales-serranos:viaje:v1';
export const MIGRATION_KEY = 'manantiales-serranos:migration:v1';
export const validIds = new Set(Array.from({ length: 61 }, (_, index) => index + 1));
export const emptyTrip = (): TripState => ({ version: 1, items: [], startDate: '' });
export function isCivilDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
export function sanitizeTrip(value: unknown): TripState {
  if (!value || typeof value !== 'object') return emptyTrip();
  const candidate = value as { version?: unknown; items?: unknown; startDate?: unknown };
  if (candidate.version !== 1 || !Array.isArray(candidate.items)) return emptyTrip();
  const seen = new Set<number>();
  const items: TripState['items'] = [];
  for (const item of candidate.items) {
    if (!item || typeof item !== 'object') continue;
    const id = Number((item as { id?: unknown }).id);
    if (!validIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    const day = Number((item as { day?: unknown }).day);
    items.push({
      id,
      day: Number.isFinite(day) ? Math.max(1, Math.min(3, Math.trunc(day) || 1)) : 1,
    });
  }
  return {
    version: 1,
    items,
    startDate: isCivilDate(candidate.startDate) ? candidate.startDate : '',
  };
}
export function decodeTrip(value: string): TripState {
  try {
    return sanitizeTrip(JSON.parse(value));
  } catch {
    return emptyTrip();
  }
}
export function migrateTrip(storage: Record<string, string>): TripState {
  if (TRIP_KEY in storage || MIGRATION_KEY in storage) return emptyTrip();
  const migrated = decodeTrip(storage[LEGACY_KEY] || 'null');
  storage[MIGRATION_KEY] = 'done';
  return migrated;
}

import { persistentAtom } from '@nanostores/persistent';
import { atom, computed } from 'nanostores';
import { decodeTrip, emptyTrip, migrateTrip, sanitizeTrip, TRIP_KEY } from './migrations';
import { persistentStorage } from './storage';
import type { TripItem } from '../../types/geopark';
export const $trip = persistentAtom(TRIP_KEY, migrateTrip(persistentStorage), {
  encode: (value) => JSON.stringify(sanitizeTrip(value)),
  decode: decodeTrip,
});
export const $favorites = computed($trip, (trip) => trip.items.map((item) => item.id));
export const $activeStory = atom(0);
export const $filters = atom({ category: 'Destacados', query: '', region: '', status: '' });
export function toggleFavorite(id: number): void {
  const current = $trip.get();
  const items = current.items.some((item) => item.id === id)
    ? current.items.filter((item) => item.id !== id)
    : [...current.items, { id, day: 1 }];
  $trip.set(sanitizeTrip({ ...current, items }));
}
export function addTripItems(items: TripItem[]): number {
  const current = $trip.get();
  const next = sanitizeTrip({ ...current, items: [...current.items, ...items] });
  $trip.set(next);
  return next.items.length - current.items.length;
}
export function clearTrip(): void {
  $trip.set(emptyTrip());
}

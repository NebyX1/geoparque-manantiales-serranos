import type { TripState } from '../../types/geopark';
export const selectedIds = (trip: TripState): number[] => trip.items.map((item) => item.id);
export const itemsForDay = (trip: TripState, day: number) =>
  trip.items.filter((item) => item.day === day);

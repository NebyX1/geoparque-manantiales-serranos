import type { GeoparkPlace } from '../types/geopark';
export const normalized = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export function matchesQuery(text: string, query: string): boolean {
  return normalized(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => normalized(text).includes(word));
}
export function placeSearchText(place: GeoparkPlace): string {
  return normalized(
    [
      place.name,
      place.zone,
      place.region,
      place.summary,
      place.category,
      place.status,
      ...place.themes,
      ...place.blocks.map((block) => block.text),
    ].join(' '),
  );
}

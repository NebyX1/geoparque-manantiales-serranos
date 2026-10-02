import { categories } from '../data/categories';
import type { GeoparkPlace } from '../types/geopark';
export function validatePlaces(places: readonly GeoparkPlace[]): string[] {
  const errors: string[] = [];
  if (places.length !== 61) errors.push('Se requieren exactamente 61 lugares.');
  const ids = new Set(places.map((place) => place.id));
  if (ids.size !== places.length) errors.push('IDs duplicados.');
  if (new Set(places.map((place) => place.slug)).size !== places.length)
    errors.push('Slugs duplicados.');
  for (const place of places) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(place.slug)) errors.push(`Slug inválido: ${place.slug}`);
    if (!categories.includes(place.category)) errors.push(`Categoría inválida: ${place.id}`);
    if (place.relationships.some((id) => !ids.has(id)))
      errors.push(`Relación inválida: ${place.id}`);
    if (!place.blocks.length || !place.summary) errors.push(`Ficha incompleta: ${place.id}`);
  }
  return errors;
}

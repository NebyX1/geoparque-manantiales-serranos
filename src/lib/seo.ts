import { absoluteUrl } from './urls';
import type { GeoparkPlace } from '../types/geopark';
export function breadcrumbs(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
export function placeSchema(place: GeoparkPlace): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': place.international ? 'TouristAttraction' : 'Place',
    '@id': absoluteUrl(`/lugares/${place.slug}/`),
    name: place.name,
    description: place.summary,
    address: { '@type': 'PostalAddress', addressRegion: 'Lavalleja', addressCountry: 'UY' },
    url: absoluteUrl(`/lugares/${place.slug}/`),
  };
}

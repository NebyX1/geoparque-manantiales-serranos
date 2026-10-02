import type { APIRoute } from 'astro';
import { places } from '../../data/geosites';
import { placeMarkdown } from '../../lib/markdown';
import type { GeoparkPlace } from '../../types/geopark';
export function getStaticPaths() {
  return places.map((place) => ({ params: { slug: place.slug }, props: { place } }));
}
export const GET: APIRoute = ({ props }) =>
  new Response(placeMarkdown(props.place as GeoparkPlace), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });

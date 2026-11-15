import type { APIRoute } from 'astro';
import { places } from '../../data/geosites';
import { placePdf } from '../../lib/place-pdf';
import type { GeoparkPlace } from '../../types/geopark';

export function getStaticPaths() {
  return places.map((place) => ({ params: { slug: place.slug }, props: { place } }));
}

export const GET: APIRoute = async ({ props }) => {
  const place = props.place as GeoparkPlace;
  return new Response(await placePdf(place), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${place.slug}.pdf"`,
    },
  });
};

import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/urls';
import { places } from '../data/geosites';
export const GET: APIRoute = () =>
  new Response(
    [
      '# Manantiales Serranos',
      '',
      'Sitio de información y educación ambiental del Geoparque Mundial UNESCO Manantiales Serranos en Lavalleja, Uruguay. Conservación, geodiversidad, agua, biodiversidad y comunidades en un territorio de 2.010 km².',
      '',
      '## Aprender y consultar',
      '',
      ...[
        ['Atlas', '/explorar/'],
        ['61 lugares', '/lugares/'],
        ['Temas ambientales', '/historias/'],
        ['Itinerarios de aprendizaje', '/circuitos/'],
        ['Cuaderno de campo', '/planifica/'],
        ['Guía ambiental', '/guia.md'],
        ['Fichas completas', '/lugares.md'],
      ].map(([label, url]) => `- [${label}](${absoluteUrl(url!)})`),
      '',
      '## Geositios de valor científico internacional',
      '',
      ...places
        .filter((place) => place.international)
        .map(
          (place) =>
            `- [${place.name}](${absoluteUrl(`/lugares/${place.slug}/`)}): ${place.summary}`,
        ),
      '',
      '## Categorías',
      '',
      'Las fichas permiten estudiar patrimonio y relaciones ambientales. Las propuestas didácticas de la web no son actividades programadas. Las salidas presenciales requieren confirmar accesos y acompañamiento.',
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );

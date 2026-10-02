import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/urls';
import { places } from '../data/geosites';
export const GET: APIRoute = () =>
  new Response(
    [
      '# Manantiales Serranos',
      '',
      'Geoparque Mundial UNESCO en Lavalleja, Uruguay. 2.010 km² donde patrimonio geológico, agua, naturaleza y comunidades se encuentran.',
      '',
      '## Explorar',
      '',
      ...[
        ['Atlas', '/explorar/'],
        ['61 lugares', '/lugares/'],
        ['Historias', '/historias/'],
        ['Circuitos', '/circuitos/'],
        ['Planificá tu visita', '/planifica/'],
        ['Guía de bolsillo', '/guia.md'],
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
      'Geología, naturaleza, cultura y experiencias. Las modalidades y accesos varían por lugar. Consultá reservas, permisos y condiciones antes de viajar.',
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );

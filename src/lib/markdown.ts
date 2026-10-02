import type { GeoparkPlace, TripState } from '../types/geopark';
export const visitNote = 'Consultá accesos, horarios y reservas con cada lugar antes de viajar.';
export function placeMarkdown(place: GeoparkPlace): string {
  return [
    `# ${place.name}`,
    '',
    `GMS-${String(place.id).padStart(2, '0')} · ${place.categoryRaw}`,
    '',
    place.summary,
    '',
    place.intro,
    '',
    ...place.blocks.flatMap((block) => [block.heading ? `## ${block.text}` : block.text, '']),
    '## Planeá tu visita',
    '',
    `${place.status}. ${place.statusRaw}.`,
    '',
    `Zona: ${place.zone}`,
    '',
    place.channel ? `Contacto: ${place.channel.url}` : '',
    '',
    `Relaciones: ${place.relationsRaw}`,
    '',
    visitNote,
    '',
  ].join('\n');
}
export function placesMarkdown(places: GeoparkPlace[]): string {
  return '# Los 61 lugares de Manantiales Serranos\n\n' + places.map(placeMarkdown).join('\n');
}
export function guideMarkdown(places: GeoparkPlace[]): string {
  return (
    '# Manantiales Serranos · Guía de bolsillo\n\nLavalleja, Uruguay. 2.010 km² de geología, agua, naturaleza y comunidades.\n\nCuatro geositios de valor científico internacional: Cerro Arequita, Aguas Blancas, Parque de Minas y Reserva Salus.\n\n' +
    places
      .map(
        (place) =>
          `## ${place.name}\n\n${place.summary}\n\nZona: ${place.zone}\nVisita: ${place.status}\n${place.channel ? `Contacto: ${place.channel.url}\n` : ''}`,
      )
      .join('\n') +
    `\n## Antes de salir\n${visitNote}\n`
  );
}
export function tripMarkdown(trip: TripState, places: GeoparkPlace[]): string {
  const byId = new Map(places.map((place) => [place.id, place]));
  return (
    `# Mi viaje por Manantiales Serranos\n\n${trip.startDate ? `Primer día: ${trip.startDate}\n\n` : ''}` +
    [1, 2, 3]
      .map((day) => {
        const items = trip.items.filter((item) => item.day === day);
        return items.length
          ? `## Día ${day}\n\n${items
              .map((item) => {
                const place = byId.get(item.id)!;
                return `### ${place.name}\n${place.summary}\n\nVisita: ${place.status}. ${place.zone}.\n${place.channel ? `Contacto: ${place.channel.url}\n` : ''}`;
              })
              .join('\n')}`
          : '';
      })
      .join('\n') +
    `\n## Antes de salir\n${visitNote}\n`
  );
}

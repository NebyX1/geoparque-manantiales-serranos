import type { GeoparkPlace, TripState } from '../types/geopark';
import { learningLens } from './learning';
export const visitNote =
  'El estudio de una ficha no habilita el acceso al sitio. Confirmá autorización y condiciones con sus responsables antes de una salida de campo.';
export function placeMarkdown(place: GeoparkPlace): string {
  const learning = learningLens(place);
  return [
    `# ${place.name}`,
    '',
    `GMS-${String(place.id).padStart(2, '0')} · ${place.categoryRaw}`,
    '',
    place.summary,
    '',
    `## ${learning.topic}`,
    '',
    learning.question,
    '',
    '### Observar y relacionar',
    '',
    learning.observe,
    '',
    '### Cuidar el patrimonio',
    '',
    learning.care,
    '',
    '## Información del sitio',
    '',
    ...place.blocks.flatMap((block) => [block.heading ? `## ${block.text}` : block.text, '']),
    '## Acceso y trabajo de campo',
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
  return (
    '# Atlas ambiental y patrimonial de Manantiales Serranos\n\n' +
    places.map(placeMarkdown).join('\n')
  );
}
export function guideMarkdown(places: GeoparkPlace[]): string {
  return (
    '# Manantiales Serranos · Guía ambiental\n\nLavalleja, Uruguay. 2.010 km² para comprender las relaciones entre geología, agua, biodiversidad y comunidades.\n\nCuatro geositios de valor científico internacional: Cerro Arequita, Aguas Blancas, Parque de Minas y Reserva Salus.\n\n## Cómo usar esta guía\n\nLeé las fichas, formulá preguntas y distinguí las observaciones de las interpretaciones. Usá dibujos y fotografías para registrar sin extraer muestras ni alterar ambientes.\n\n' +
    places
      .map((place) => {
        const learning = learningLens(place);
        return `## ${place.name}\n\n${place.summary}\n\nPregunta de trabajo: ${learning.question}\n\nObservar y relacionar: ${learning.observe}\n\nCuidar: ${learning.care}\n\nZona: ${place.zone}\nAcceso: ${place.status}\n${place.channel ? `Contacto: ${place.channel.url}\n` : ''}`;
      })
      .join('\n') +
    `\n## Preparar una actividad de campo\n${visitNote}\n`
  );
}
export function tripMarkdown(trip: TripState, places: GeoparkPlace[]): string {
  const byId = new Map(places.map((place) => [place.id, place]));
  return (
    `# Mi cuaderno de campo · Manantiales Serranos\n\nUna selección de fichas para estudiar el territorio y preparar observaciones.\n\n${trip.startDate ? `Primer día: ${trip.startDate}\n\n` : ''}` +
    [1, 2, 3]
      .map((day) => {
        const items = trip.items.filter((item) => item.day === day);
        return items.length
          ? `## Día ${day}\n\n${items
              .map((item) => {
                const place = byId.get(item.id)!;
                const learning = learningLens(place);
                return `### ${place.name}\n${place.summary}\n\nPregunta de trabajo: ${learning.question}\n\nObservar y relacionar: ${learning.observe}\n\nCuidar: ${learning.care}\n\nAcceso: ${place.status}. ${place.zone}.\n${place.channel ? `Contacto: ${place.channel.url}\n` : ''}`;
              })
              .join('\n')}`
          : '';
      })
      .join('\n') +
    `\n## Registro de observaciones\n\n¿Qué observé?\n\n¿Qué relaciones puedo explicar con la información de las fichas?\n\n¿Qué preguntas necesito seguir investigando?\n\n## Preparar una actividad de campo\n${visitNote}\n`
  );
}

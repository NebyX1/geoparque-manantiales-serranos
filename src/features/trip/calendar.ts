import type { GeoparkPlace, TripState } from '../../types/geopark';
import { isCivilDate } from './migrations';
import { visitNote } from '../../lib/markdown';
import { learningLens } from '../../lib/learning';
export const icsEscape = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
export function foldIcs(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  for (const char of line) {
    if (encoder.encode(current + char).length > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = char;
    } else current += char;
  }
  parts.push(current);
  return parts.join('\r\n ');
}
export function shiftDate(value: string, days: number): string {
  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}
export function tripCalendar(trip: TripState, places: GeoparkPlace[], now = new Date()): string {
  if (!isCivilDate(trip.startDate)) throw new Error('Elegí una fecha válida para el primer día.');
  const byId = new Map(places.map((place) => [place.id, place]));
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d+Z/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Manantiales Serranos//Cuaderno de campo//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  for (const item of trip.items) {
    const place = byId.get(item.id);
    if (!place) continue;
    const learning = learningLens(place);
    const date = shiftDate(trip.startDate, item.day - 1);
    lines.push(
      'BEGIN:VEVENT',
      `UID:gms-${item.id}-${date}@manantialesserranos.uy`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${date.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${shiftDate(date, 1).replace(/-/g, '')}`,
      `SUMMARY:${icsEscape(`Observación propuesta: ${place.name}`)}`,
      `DESCRIPTION:${icsEscape(`${place.summary}\nPregunta de trabajo: ${learning.question}\nCuidar: ${learning.care}\n${place.status}. ${visitNote}\nSelección personal de estudio; actividad presencial por coordinar.`)}`,
      'STATUS:TENTATIVE',
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  return [...lines, 'END:VCALENDAR'].map(foldIcs).join('\r\n') + '\r\n';
}

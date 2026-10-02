import { places } from './geosites';
import { articles } from './stories';
import { circuits } from './circuits';
export const gallery = [
  {
    key: 'aguas',
    title: 'Aguas Blancas · agua y sierras',
    caption: 'Aguas Blancas · agua y sierras',
  },
  {
    key: 'salus',
    title: 'La luz del bosque · Reserva Salus',
    caption: 'La luz del bosque · Reserva Salus',
  },
  {
    key: 'arequita',
    title: 'Cerro Arequita · memoria volcánica',
    caption: 'Cerro Arequita · memoria volcánica',
  },
  {
    key: 'penitente',
    title: 'Salto del Penitente · agua entre rocas',
    caption: 'Salto del Penitente · agua entre rocas',
  },
  {
    key: 'arequita-rio',
    title: 'Arequita y río Santa Lucía',
    caption: 'Arequita y río Santa Lucía',
  },
  {
    key: 'rio',
    title: 'Río Santa Lucía en el entorno de Arequita',
    caption: 'Río Santa Lucía en el entorno de Arequita',
  },
  {
    key: 'artigas',
    title: 'Cerro Artigas · el horizonte de Minas',
    caption: 'Cerro Artigas · el horizonte de Minas',
  },
  {
    key: 'parque',
    title: 'Parque de Minas · observar juntos',
    caption: 'Parque de Minas · observar juntos',
  },
  {
    key: 'cantera',
    title: 'Rocas y paisajes de Manantiales Serranos',
    caption: 'Rocas y paisajes de Manantiales Serranos',
  },
  {
    key: 'cielo',
    title: 'El cielo sobre las sierras',
    caption: 'El cielo sobre las sierras',
  },
  {
    key: 'parque-puente',
    title: 'Parque de Minas · paisaje y paseo',
    caption: 'Parque de Minas · paisaje y paseo',
  },
  {
    key: 'aprendiendo',
    title: 'Una experiencia educativa en el Geoparque',
    caption: 'Una experiencia educativa en el Geoparque',
  },
];
export const mapPoints = [
  {
    n: 1,
    id: 1,
    x: 241.6,
    y: 187,
    label: 'Cerro Arequita',
  },
  {
    n: 2,
    id: 23,
    x: 173.7,
    y: 301.5,
    label: 'Aguas Blancas',
  },
  {
    n: 3,
    id: 31,
    x: 205,
    y: 259,
    label: 'Reserva Salus',
  },
  {
    n: 4,
    id: 17,
    x: 274.5,
    y: 271,
    label: 'Parque de Minas',
  },
  {
    n: 5,
    id: 14,
    x: 316.6,
    y: 230,
    label: 'Salto del Penitente',
  },
  {
    n: 6,
    id: 54,
    x: 382,
    y: 210,
    label: 'Villa Serrana',
  },
  {
    n: 7,
    id: 42,
    x: 249,
    y: 237,
    label: 'Minas y sus historias',
  },
  {
    n: 8,
    id: 5,
    x: 351.8,
    y: 142.5,
    label: 'El Destacamento',
  },
];
export const geopark = {
  places,
  articles,
  routes: circuits,
  gallery,
  mapPoints,
  version: 1,
  date: '2026-10-01',
};

import { places } from './geosites';
import { articles } from './stories';
import { circuits } from './circuits';
import { photoForAsset } from './place-photos';
export const gallery = [
  'aguas',
  'salus',
  'arequita',
  'penitente',
  'arequita-rio',
  'rio',
  'artigas',
  'parque',
  'cantera',
  'cielo',
  'parque-puente',
  'aprendiendo',
].map((key) => {
  const photo = photoForAsset(key)!;
  return { key, title: photo.caption, caption: photo.caption };
});
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

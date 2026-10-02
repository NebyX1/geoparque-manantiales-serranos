import type { ImageMetadata } from 'astro';
import asset_aguas from '../assets/images/hero/aguas.webp';
import asset_aprendiendo from '../assets/images/education/aprendiendo.webp';
import asset_arequita_rio from '../assets/images/hero/arequita-rio.webp';
import asset_arequita from '../assets/images/geosites/arequita.webp';
import asset_arroyo from '../assets/images/landscapes/arroyo.webp';
import asset_artesania from '../assets/images/culture/artesania.webp';
import asset_artigas from '../assets/images/culture/artigas.webp';
import asset_aves from '../assets/images/nature/aves.webp';
import asset_bosque from '../assets/images/nature/bosque.webp';
import asset_campo from '../assets/images/landscapes/campo.webp';
import asset_cantera from '../assets/images/geosites/cantera.webp';
import asset_carpincho from '../assets/images/nature/carpincho.webp';
import asset_cielo from '../assets/images/landscapes/cielo.webp';
import asset_escuela from '../assets/images/education/escuela.webp';
import asset_gastronomia from '../assets/images/culture/gastronomia.webp';
import asset_gauchos from '../assets/images/culture/gauchos.webp';
import asset_gruta from '../assets/images/geosites/gruta.webp';
import asset_martin from '../assets/images/culture/martin.webp';
import asset_ombues from '../assets/images/nature/ombues.webp';
import asset_paisaje from '../assets/images/landscapes/paisaje.webp';
import asset_panorama from '../assets/images/landscapes/panorama.webp';
import asset_parque_puente from '../assets/images/landscapes/parque-puente.webp';
import asset_parque from '../assets/images/hero/parque.webp';
import asset_pelado from '../assets/images/geosites/pelado.webp';
import asset_penitente_poza from '../assets/images/landscapes/penitente-poza.webp';
import asset_penitente from '../assets/images/landscapes/penitente.webp';
import asset_puma from '../assets/images/nature/puma.webp';
import asset_rio from '../assets/images/landscapes/rio.webp';
import asset_salus from '../assets/images/hero/salus.webp';
export const assets: Record<
  string,
  ImageMetadata | { src: string; width: number; height: number }
> = {
  aguas: asset_aguas,
  aprendiendo: asset_aprendiendo,
  'arequita-rio': asset_arequita_rio,
  arequita: asset_arequita,
  arroyo: asset_arroyo,
  artesania: asset_artesania,
  artigas: asset_artigas,
  aves: asset_aves,
  bosque: asset_bosque,
  campo: asset_campo,
  cantera: asset_cantera,
  carpincho: asset_carpincho,
  cielo: asset_cielo,
  escuela: asset_escuela,
  gastronomia: asset_gastronomia,
  gauchos: asset_gauchos,
  gruta: asset_gruta,
  'map-original': { src: '/downloads/map-original.webp', width: 1224, height: 1584 },
  martin: asset_martin,
  ombues: asset_ombues,
  paisaje: asset_paisaje,
  panorama: asset_panorama,
  'parque-puente': asset_parque_puente,
  parque: asset_parque,
  pelado: asset_pelado,
  'penitente-poza': asset_penitente_poza,
  penitente: asset_penitente,
  puma: asset_puma,
  rio: asset_rio,
  salus: asset_salus,
  unesco: { src: '/partners/unesco.png', width: 77, height: 59 },
  instituciones: { src: '/partners/instituciones.png', width: 270, height: 79 },
  lavalleja: { src: '/partners/lavalleja.png', width: 124, height: 60 },
  'brand-c66ec6c0da68': { src: '/brand/logo.svg', width: 225, height: 191 },
};

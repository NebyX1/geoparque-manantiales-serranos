export type GeoparkCategory = 'Geología' | 'Naturaleza' | 'Cultura' | 'Experiencias';
export type VisitStatus =
  'Coordinación previa' | 'Paseo por el entorno' | 'Consultar acceso' | 'Visita no confirmada';
export interface ContentBlock {
  text: string;
  heading: boolean;
}
export interface PlaceImage {
  key: string;
  alt: string;
}
export interface PlaceContact {
  url: string;
  label: string;
}
export interface GeoparkPlace {
  id: number;
  slug: string;
  name: string;
  title: string;
  summary: string;
  description: string;
  blocks: ContentBlock[];
  zone: string;
  region: string;
  category: GeoparkCategory;
  categoryRaw: string;
  status: VisitStatus;
  statusRaw: string;
  visitStatus: VisitStatus;
  access: string;
  relationsRaw: string;
  relationships: number[];
  tagline: string;
  intro: string;
  themes: string[];
  tags: string[];
  image: string;
  imageContext: boolean;
  images: PlaceImage[];
  channel?: PlaceContact;
  contacts: PlaceContact[];
  featured: boolean;
  international: boolean;
  internationalValue: boolean;
  seo: { title: string; description: string };
}
export interface GeologicalStory {
  title: string;
  eyebrow: string;
  image: string;
  lead: string;
  sections: [string, string][];
}
export interface Circuit {
  id: string;
  name: string;
  kicker: string;
  days: number;
  image: string;
  imageContext?: boolean;
  text: string;
  path: string;
  places: number[];
  blocks: { day: number; title: string; ids: number[]; text: string }[];
}
export interface TripItem {
  id: number;
  day: number;
}
export interface TripState {
  version: 1;
  items: TripItem[];
  startDate: string;
}

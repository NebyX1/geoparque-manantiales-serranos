import { circuits } from '../data/circuits';
import { environmentalAxes, environmentalSources, learningActivities } from '../data/environment';
import type { EnvironmentalReference, EnvironmentalSourceId } from '../data/environment';
import { getPlaceLocation } from '../data/geography';
import { places, placeById } from '../data/geosites';
import { serranaPlaceEvidence } from '../data/serrana/catalog';
import { serranaSources } from '../data/serrana/sources';
import type { SerranaSource } from '../data/serrana/sources';
import { serranaTopics } from '../data/serrana/topics';
import { articles } from '../data/stories';
import type { GeoparkPlace } from '../types/geopark';
import { learningLens } from './learning';

export type SerranaKnowledgeKind = 'place' | 'story' | 'circuit' | 'topic' | 'activity';

export interface SerranaKnowledgeDocument {
  id: string;
  title: string;
  text: string;
  sources: readonly SerranaSource[];
  tags: readonly string[];
  kind: SerranaKnowledgeKind;
  placeId?: number;
  aliases?: readonly string[];
  relatedPlaceIds?: readonly number[];
}

function placeSource(place: Pick<GeoparkPlace, 'name' | 'slug'>): SerranaSource {
  return { title: `Ficha del Geoparque · ${place.name}`, url: `/lugares/${place.slug}/` };
}

function sourcesForPlaces(ids: readonly number[]) {
  return ids.map((id) => {
    const place = placeById.get(id);
    if (!place) throw new Error(`Serrana: la ficha GMS-${id} no existe.`);
    return placeSource(place);
  });
}

function uniqueSources(sources: readonly SerranaSource[]) {
  return [...new Map(sources.map((source) => [source.url, source])).values()];
}

const environmentalLinks: Record<EnvironmentalSourceId, string> = {
  presentation: serranaSources.presentation.url,
  expo: serranaSources.expo.url,
  geopark: serranaSources.team.url,
  editorialGuide: '/inicio/#documentacion',
};

function environmentalReferences(references: readonly EnvironmentalReference[]) {
  return references.map(({ source, pages }) => ({
    title: `${environmentalSources[source].title} · pp. ${pages.join(', ')}`,
    url: environmentalLinks[source],
  }));
}

// The historical catalogue may contain hours, tariffs and contact details. Keep the
// documented visit status and link to the operator instead of reasserting these.
const temporalDetail =
  /\b\d{1,2}:\d{2}\b|[\w.-]+@[\w.-]+\.[a-z]{2,}|\+598\b|\b(?:teléfono|entrada gratuita|ingreso pago|cierre temporal|temporalmente cerrad[ao]|tarifas?|precios?)\b/i;

function durableBlocks(place: GeoparkPlace) {
  const retained: string[] = [];
  let contactSection = false;
  let heading = '';

  for (const block of place.blocks) {
    if (block.heading) {
      contactSection = /^contacto/i.test(block.text);
      heading = block.text;
      continue;
    }
    if (contactSection || temporalDetail.test(block.text)) continue;
    if (heading) retained.push(heading);
    heading = '';
    retained.push(block.text);
  }

  return retained;
}

const placeDocuments = places.map<SerranaKnowledgeDocument>((place) => {
  const evidence = serranaPlaceEvidence[place.id];
  const location = getPlaceLocation(place.id);
  const lens = learningLens(place);
  const operator = place.channel?.url.startsWith('https://') ? place.channel : undefined;
  const entryCode = `GMS-${String(place.id).padStart(2, '0')}`;
  const accessNote = temporalDetail.test(place.statusRaw) ? '' : place.statusRaw;
  const locationNote = location
    ? `Referencia cartográfica ${location.accuracy === 'approximate' ? 'aproximada' : 'documentada'}. El punto caracteriza el lugar y puede no corresponder a una entrada habilitada.`
    : '';

  return {
    id: `place-${place.id}`,
    kind: 'place',
    placeId: place.id,
    ...(evidence?.aliases ? { aliases: evidence.aliases } : {}),
    title: place.name,
    tags: [
      ...new Set([
        entryCode,
        place.slug.replaceAll('-', ' '),
        place.zone,
        place.region,
        place.category,
        ...place.themes,
        ...(evidence?.aliases ?? []),
      ]),
    ],
    text: [
      `${entryCode}. ${place.categoryRaw}. Región del atlas: ${place.region}. Entorno: ${place.zone}.`,
      place.international
        ? 'Geositio de valor científico internacional según la presentación institucional.'
        : '',
      place.intro,
      ...durableBlocks(place),
      [`Estado documental de visita: ${place.status}.`, accessNote].filter(Boolean).join(' '),
      locationNote,
      `Preguntas de aprendizaje: ${lens.question} ${lens.observe} ${lens.care}`,
      place.relationsRaw ? `Relaciones con otros lugares o temas: ${place.relationsRaw}` : '',
      operator
        ? 'Confirmar acceso, horarios, costos y servicios vigentes a través del enlace del responsable.'
        : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    sources: uniqueSources([
      placeSource(place),
      ...(evidence?.references ?? []).map((id) => serranaSources[id]),
      ...(location?.sourceUrl.startsWith('https://')
        ? [{ title: 'Fuente de la referencia cartográfica', url: location.sourceUrl }]
        : []),
      ...(operator ? [{ title: `Consulta de visita · ${operator.label}`, url: operator.url }] : []),
    ]),
  };
});

const topicDocuments = serranaTopics.map<SerranaKnowledgeDocument>((topic) => ({
  id: `topic-${topic.id}`,
  kind: 'topic',
  ...(topic.places ? { relatedPlaceIds: topic.places } : {}),
  title: topic.title,
  text: topic.text,
  tags: topic.tags,
  sources: uniqueSources([
    ...topic.references.map((id) => serranaSources[id]),
    ...sourcesForPlaces(topic.places ?? []),
  ]),
}));

const regionalDocuments = [
  ...new Set(places.map((place) => place.region)),
].map<SerranaKnowledgeDocument>((region) => {
  const entries = places.filter((place) => place.region === region);
  const slug = region
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replaceAll(' ', '-');
  return {
    id: `region-${slug}`,
    kind: 'topic',
    title: `Atlas de ${region}`,
    tags: [region, 'qué lugares hay', 'lista de fichas', 'atlas por región', 'territorio'],
    text: [
      `El atlas del Geoparque registra ${entries.length} fichas en la región ${region}. Incluye lugares geológicos, naturales, culturales o experiencias según el caso. Cada ficha tiene un estado de visita propio.`,
      ...entries.map(
        (place) => `GMS-${String(place.id).padStart(2, '0')} · ${place.name} (${place.category}).`,
      ),
    ].join('\n'),
    sources: [serranaSources.atlas, ...entries.map(placeSource)],
  };
});

const storyDocuments = Object.entries(articles).map<SerranaKnowledgeDocument>(
  ([slug, article]) => ({
    id: `story-${slug}`,
    kind: 'story',
    title: article.title,
    tags: [slug, article.eyebrow, 'historia del geoparque'],
    text: [
      article.lead,
      ...article.sections.map(([heading, paragraph]) => `${heading}\n${paragraph}`),
    ].join('\n\n'),
    sources: [
      { title: `Relato del Geoparque · ${article.title}`, url: `/historias/${slug}/` },
      serranaSources.presentation,
      serranaSources.expo,
    ],
  }),
);

const circuitDocuments = circuits.map<SerranaKnowledgeDocument>((circuit) => ({
  id: `circuit-${circuit.id}`,
  kind: 'circuit',
  title: circuit.name,
  tags: [
    circuit.kicker,
    circuit.id,
    'itinerario',
    'circuito de aprendizaje',
    'recorrido educativo',
  ],
  text: [
    circuit.text,
    `Secuencia de referencia de ${circuit.days} ${circuit.days === 1 ? 'día' : 'días'}: ${circuit.path}. Es una propuesta educativa. Los accesos y las actividades en terreno se confirman por separado.`,
    ...circuit.blocks.map((block) => `Día ${block.day} · ${block.title}\n${block.text}`),
  ].join('\n\n'),
  sources: [
    { title: `Itinerario del Geoparque · ${circuit.name}`, url: `/circuitos/${circuit.id}/` },
    ...sourcesForPlaces(circuit.places),
  ],
}));

const axisDocuments = environmentalAxes.map<SerranaKnowledgeDocument>((axis) => ({
  id: `axis-${axis.id}`,
  kind: 'topic',
  title: axis.title,
  tags: [axis.id, axis.label, 'educación ambiental'],
  text: [axis.description, axis.question, axis.action].join('\n\n'),
  sources: uniqueSources([
    { title: 'Eje educativo del Geoparque', url: axis.href },
    ...environmentalReferences(axis.sources),
  ]),
}));

const activityDocuments = learningActivities.map<SerranaKnowledgeDocument>((activity) => ({
  id: `activity-${activity.id}`,
  kind: 'activity',
  title: activity.title,
  tags: [
    activity.id.replaceAll('-', ' '),
    'propuesta didáctica',
    'actividad educativa',
    'escuelas',
    'cuaderno de campo',
  ],
  text: [
    'Propuesta educativa del portal. No constituye una convocatoria ni una salida programada.',
    activity.setting,
    activity.objective,
    activity.question,
    ...activity.steps.map((step, index) => `${index + 1}. ${step}`),
    `Registro sugerido: ${activity.record}`,
    activity.care,
  ].join('\n\n'),
  sources: uniqueSources([
    { title: 'Propuestas de geoeducación', url: '/inicio/#aprender' },
    { title: 'Lectura de apoyo', url: activity.href },
    ...environmentalReferences(activity.sources),
  ]),
}));

/** Shared source for the public guide and the backend's generated catalogue. */
export const serranaKnowledge: readonly SerranaKnowledgeDocument[] = [
  ...topicDocuments,
  ...axisDocuments,
  ...regionalDocuments,
  ...placeDocuments,
  ...storyDocuments,
  ...circuitDocuments,
  ...activityDocuments,
];

export const serranaAtlasPlaces = places.map(
  ({ id, name, slug, zone, status, statusRaw, summary }) => ({
    id,
    name,
    slug,
    zone,
    status,
    statusRaw,
    summary,
    aliases: serranaPlaceEvidence[id]?.aliases ?? [],
  }),
);

export const serranaKnowledgeManifest = {
  version: 1,
  reviewedAt: '2026-11-15',
  total: serranaKnowledge.length,
  counts: {
    place: placeDocuments.length,
    story: storyDocuments.length,
    circuit: circuitDocuments.length,
    topic: topicDocuments.length + axisDocuments.length + regionalDocuments.length,
    activity: activityDocuments.length,
  } satisfies Record<SerranaKnowledgeKind, number>,
  sources: uniqueSources(serranaKnowledge.flatMap((document) => document.sources)).length,
};

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { KnowledgeDocument, Source } from './retrieval.js';
import { defaultVisitIds, visitAreas, visitProfiles } from './visit-catalog.js';

export interface AtlasPlace {
  id: number;
  name: string;
  slug: string;
  zone: string;
  status: string;
  statusRaw: string;
  summary: string;
  aliases: readonly string[];
}

interface KnowledgeSnapshot {
  manifest: {
    version: number;
    total: number;
    reviewedAt: string;
    counts: Record<KnowledgeDocument['kind'], number>;
    sources: number;
  };
  documents: readonly KnowledgeDocument[];
  places: readonly AtlasPlace[];
}

function invalidKnowledge(detail: string): never {
  throw new Error(`[serrana] data/knowledge.json: ${detail}. Regenerá el catálogo desde el sitio.`);
}

const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

function validSource(source: Source | null) {
  return (
    source &&
    hasText(source.title) &&
    hasText(source.url) &&
    (/^\/(?![/\\])/u.test(source.url) ||
      (source.url.startsWith('https://') && URL.canParse(source.url)))
  );
}

export function validateKnowledgeSnapshot(serialized: string) {
  const normalized = serialized.replace(/\r\n/g, '\n');
  let snapshot: KnowledgeSnapshot | null;
  try {
    snapshot = JSON.parse(normalized);
  } catch {
    invalidKnowledge('el archivo no es JSON válido');
  }
  if (!snapshot || snapshot.manifest?.version !== 1) {
    invalidKnowledge('versión del catálogo incompatible');
  }

  const { manifest, documents, places } = snapshot;
  if (
    !Array.isArray(documents) ||
    !documents.length ||
    documents.length !== manifest.total ||
    !Array.isArray(places) ||
    !places.length ||
    !hasText(manifest.reviewedAt) ||
    !/^\d{4}-\d{2}-\d{2}$/u.test(manifest.reviewedAt)
  ) {
    invalidKnowledge('faltan documentos, fichas o datos del manifiesto');
  }

  const atlas = new Map<number, AtlasPlace>();
  const slugs = new Set<string>();
  const atlasEntries: readonly AtlasPlace[] = places;
  for (const place of atlasEntries) {
    if (
      !place ||
      !Number.isSafeInteger(place.id) ||
      place.id < 1 ||
      atlas.has(place.id) ||
      !hasText(place.slug) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(place.slug) ||
      slugs.has(place.slug) ||
      ![place.name, place.zone, place.status, place.statusRaw, place.summary].every(hasText) ||
      !Array.isArray(place.aliases) ||
      !place.aliases.every(hasText)
    ) {
      invalidKnowledge('hay una ficha incompleta o duplicada');
    }
    atlas.set(place.id, place);
    slugs.add(place.slug);
  }

  const counts = { place: 0, story: 0, circuit: 0, topic: 0, activity: 0 };
  const ids = new Set<string>();
  const sources = new Set<string>();
  const knowledgeDocuments: readonly KnowledgeDocument[] = documents;
  for (const document of knowledgeDocuments) {
    if (
      !document ||
      !Object.hasOwn(counts, document.kind) ||
      ![document.id, document.title, document.text].every(hasText) ||
      ids.has(document.id) ||
      !Array.isArray(document.tags) ||
      !document.tags.every(hasText) ||
      !Array.isArray(document.sources) ||
      !document.sources.length ||
      !document.sources.every(validSource) ||
      (document.aliases !== undefined &&
        (!Array.isArray(document.aliases) || !document.aliases.every(hasText))) ||
      (document.relatedPlaceIds !== undefined &&
        (!Array.isArray(document.relatedPlaceIds) ||
          !document.relatedPlaceIds.every((id: number) => atlas.has(id))))
    ) {
      invalidKnowledge('hay un documento incompleto, duplicado o con referencias inválidas');
    }
    if (document.kind === 'place') {
      const place = document.placeId === undefined ? undefined : atlas.get(document.placeId);
      if (
        !place ||
        document.id !== `place-${place.id}` ||
        document.title !== place.name ||
        document.sources[0]?.url !== `/lugares/${place.slug}/`
      ) {
        invalidKnowledge('una ficha del atlas no coincide con su documento');
      }
    }
    counts[document.kind]++;
    ids.add(document.id);
    for (const source of document.sources) sources.add(source.url);
  }
  if (
    counts.place !== atlas.size ||
    sources.size !== manifest.sources ||
    Object.entries(counts).some(
      ([kind, count]) => manifest.counts?.[kind as KnowledgeDocument['kind']] !== count,
    )
  ) {
    invalidKnowledge('los totales del manifiesto no coinciden con el catálogo');
  }

  const visitIds = [
    ...defaultVisitIds,
    ...Object.keys(visitProfiles).map(Number),
    ...visitAreas.flatMap(({ placeIds, surroundings }) => [...placeIds, ...(surroundings ?? [])]),
  ];
  if (visitIds.some((id) => !atlas.has(id)))
    invalidKnowledge('la guía de visitas cita una ficha ausente');

  return {
    documents: knowledgeDocuments,
    atlas,
    info: {
      version: manifest.version,
      reviewedAt: manifest.reviewedAt,
      documents: documents.length,
      places: atlas.size,
      sources: sources.size,
      sha256: createHash('sha256').update(normalized).digest('hex'),
    },
  };
}

export const {
  documents: serranaKnowledge,
  atlas: placeById,
  info: knowledgeInfo,
} = validateKnowledgeSnapshot(
  readFileSync(new URL('../data/knowledge.json', import.meta.url), 'utf8'),
);

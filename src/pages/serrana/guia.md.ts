import type { APIRoute } from 'astro';
import { serranaKnowledge } from '../../lib/serrana-knowledge';

const sections = [
  ['topic', 'Territorio, patrimonio y conservación'],
  ['place', 'Lugares y geositios'],
  ['story', 'Historias del territorio'],
  ['circuit', 'Recorridos y conexiones'],
  ['activity', 'Propuestas de aprendizaje'],
] as const;

export const GET: APIRoute = () => {
  const lines = [
    '# Guía de Serrana · Geoparque Manantiales Serranos',
    '',
    'Material de consulta de la guía del Geoparque, con referencias al sitio y a sus fuentes documentales.',
  ];
  for (const [kind, title] of sections) {
    const documents = serranaKnowledge.filter((document) => document.kind === kind);
    if (!documents.length) continue;
    lines.push('', `## ${title}`);
    for (const document of documents) {
      lines.push('', `### ${document.title}`, '', document.text, '');
      for (const source of document.sources) lines.push(`- [${source.title}](${source.url})`);
    }
  }
  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};

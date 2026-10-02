import type { APIRoute } from 'astro';
import { places } from '../data/geosites';
import { guideMarkdown } from '../lib/markdown';
export const GET: APIRoute = () =>
  new Response(guideMarkdown(places), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });

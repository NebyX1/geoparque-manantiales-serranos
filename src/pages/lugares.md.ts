import type { APIRoute } from 'astro';
import { places } from '../data/geosites';
import { placesMarkdown } from '../lib/markdown';
export const GET: APIRoute = () =>
  new Response(placesMarkdown(places), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });

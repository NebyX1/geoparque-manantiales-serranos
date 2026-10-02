import type { APIRoute } from 'astro';
import { getBuildSite } from '../lib/urls';
export const GET: APIRoute = () => {
  const site = getBuildSite();
  return new Response(
    site.indexable
      ? `User-agent: *\nAllow: /\nSitemap: ${site.url}sitemap-index.xml\n`
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};

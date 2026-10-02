import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { getBuildSite } from './src/lib/urls';
import { reactHydration } from './src/integrations/reactHydration';

const buildSite = getBuildSite();

export default defineConfig({
  output: 'static',
  site: buildSite.url,
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.endsWith('/404/') && !page.endsWith('/health/'),
      customPages: buildSite.indexable
        ? [`${buildSite.url}llms.txt`, `${buildSite.url}guia.md`, `${buildSite.url}lugares.md`]
        : [],
    }),
  ],
  vite: {
    plugins: [reactHydration(), tailwindcss()],
    build: {
      // Preserve classic media queries for Safari versions that cannot parse
      // the range syntax emitted by the default CSS minifier target.
      cssTarget: 'safari15',
    },
  },
});

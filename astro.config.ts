import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import { getBuildSite } from './src/lib/urls';
import { reactHydration } from './src/integrations/reactHydration';

const buildSite = getBuildSite();
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), [
  'PUBLIC_SERRANA_API_BASE',
  'SERRANA_BACKEND_URL',
]);
const serranaApiBase = env.PUBLIC_SERRANA_API_BASE || '';
if (serranaApiBase) {
  const url = URL.canParse(serranaApiBase) ? new URL(serranaApiBase) : undefined;
  if (
    !url ||
    url.origin !== serranaApiBase ||
    !/^(?:[a-z0-9-]+(?:\.[a-z0-9-]+)*|\[[0-9a-f:]+\])$/u.test(url.hostname) ||
    (url.protocol !== 'https:' &&
      !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))
  ) {
    throw new Error('PUBLIC_SERRANA_API_BASE debe ser un origen HTTPS, sin rutas ni barra final.');
  }
}
const serranaProxy = {
  '/api/serrana/chat': {
    target: env.SERRANA_BACKEND_URL || 'http://127.0.0.1:4319',
    changeOrigin: false,
    proxyTimeout: 75_000,
  },
};

export default defineConfig({
  output: 'static',
  site: buildSite.url,
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  image: { service: { entrypoint: './src/integrations/photoImageService.ts' } },
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
    define: { 'import.meta.env.PUBLIC_SERRANA_API_BASE': JSON.stringify(serranaApiBase) },
    ...(!serranaApiBase && { server: { proxy: serranaProxy }, preview: { proxy: serranaProxy } }),
    build: {
      // Preserve classic media queries for Safari versions that cannot parse
      // the range syntax emitted by the default CSS minifier target.
      cssTarget: 'safari15',
    },
  },
});

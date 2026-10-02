from pathlib import Path
import json
import re
import os

ROOT = Path(__file__).resolve().parents[1]

def write(path, value):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(value.strip() + '\n', encoding='utf-8')

def replace(path, before, after):
    p = ROOT / path
    value = p.read_text(encoding='utf-8')
    assert before in value, (path, before[:60])
    p.write_text(value.replace(before, after), encoding='utf-8')

write('src/config/site.ts', '''
export const siteConfig = {
  name: 'Manantiales Serranos',
  description: 'Descubrí el Geoparque Mundial UNESCO Manantiales Serranos en Lavalleja, Uruguay: 61 lugares, sierras, manantiales, naturaleza y cultura.',
  locale: 'es-UY', ogLocale: 'es_UY', country: 'Uruguay', region: 'Lavalleja',
  image: '/brand/social.webp', imageWidth: 1200, imageHeight: 630,
  lastModified: '2026-10-02',
} as const;
''')
write('src/config/navigation.ts', '''
export const navigation = [
  { href: '/explorar/', label: 'Explorar' }, { href: '/historias/', label: 'Historias' },
  { href: '/#territorio', label: 'El territorio' }, { href: '/#naturaleza', label: 'Naturaleza' },
  { href: '/circuitos/', label: 'Circuitos' }, { href: '/planifica/', label: 'Planificá tu viaje' },
] as const;
''')
write('src/config/social.ts', "export const social = { instagram: 'https://www.instagram.com/manantiales_serranos/' } as const;")
replace('src/features/trip/storage.ts', 'festival:storage', 'geopark:storage')
replace('src/features/trip/storage.ts', '__semana_lavalleja_probe__', '__manantiales_serranos_probe__')
replace('src/components/islands/TripTrigger.tsx', 'trip-trigger', 'trip-button')
replace('src/components/islands/TripTrigger.tsx', '<b data-count="" aria-live="polite">', '<b className="count" data-count="" aria-live="polite">')
replace('astro.config.ts', 'programacion.md', 'guia.md')
replace('astro.config.ts', '`${buildSite.url}guia.md`', '`${buildSite.url}guia.md`, `${buildSite.url}lugares.md`')
replace('src/components/seo/SeoHead.astro', 'La Fiesta de Nuestros Pueblos', 'La Tierra tiene memoria')
replace('src/components/seo/SeoHead.astro', 'Paisaje gráfico de la 53.ª Semana de Lavalleja', 'Sierras y río Santa Lucía en Manantiales Serranos')
write('src/components/brand/Photo.astro', '''
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { assets } from '../../data/assets';
interface Props { assetKey: string; alt: string; class?: string; loading?: 'eager' | 'lazy'; fetchpriority?: 'high' | 'low' | 'auto'; sizes?: string; id?: string }
const { assetKey, alt, loading = 'lazy', sizes = '(max-width: 620px) 100vw, 50vw', ...rest } = Astro.props;
const asset = assets[assetKey] || assets['panorama']!;
const local = 'format' in asset;
const widths = [320, 640, 960, 1280, 1920].filter(width => width <= asset.width);
if (!widths.length) widths.push(asset.width);
---
{local ? <Image src={asset as ImageMetadata} alt={alt} widths={widths} sizes={sizes} format="webp" loading={loading} decoding="async" {...rest} /> : <img src={asset.src} width={asset.width} height={asset.height} alt={alt} loading={loading} decoding="async" {...rest} />}
''')
write('src/lib/images.ts', '''
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { assets } from '../data/assets';
export async function clientImages(): Promise<Record<string, string>> {
  return Object.fromEntries(await Promise.all(Object.entries(assets).map(async ([key, asset]) => [key, 'format' in asset ? (await getImage({ src: asset as ImageMetadata, width: Math.min(1920, asset.width), format: 'webp' })).src : asset.src])));
}
''')

# The cards and circuits use the typed content rather than duplicate prototype text.
atlas = (ROOT / 'src/components/sections/Atlas.astro').read_text(encoding='utf-8')
start = atlas.index('<div class="places-grid"')
end = atlas.index('</article>', atlas.rindex('<article class="place-card')) + len('</article>')
atlas = atlas[:start] + '<div class="places-grid" id="places-grid">\n{places.map(place => <PlaceCard {place} />)}' + atlas[end:]
atlas = atlas.replace("import Photo from '../brand/Photo.astro';", "import PlaceCard from '../geosites/PlaceCard.astro';\nimport { places } from '../../data/geosites';")
write('src/components/sections/Atlas.astro', atlas)

planner = (ROOT / 'src/components/sections/Planner.astro').read_text(encoding='utf-8')
planner = re.sub(r'<form\b.*?</form>', '<TripPlanner client:visible />', planner, flags=re.S)
write('src/components/sections/Planner.astro', "---\nimport { TripPlanner } from '../islands/TripPlanner';\n---\n" + planner)
navbar = (ROOT / 'src/components/layout/Navbar.astro').read_text(encoding='utf-8')
navbar = re.sub(r'<button class="trip-button".*?</button>', '<TripTrigger client:load />', navbar, flags=re.S)
navbar = navbar.replace("import Photo from '../brand/Photo.astro';", "import Photo from '../brand/Photo.astro';\nimport { TripTrigger } from '../islands/TripTrigger';")
write('src/components/layout/Navbar.astro', navbar)

write('src/styles/global.css', '''
@import '@fontsource/barlow-condensed/500.css';
@import '@fontsource/barlow-condensed/600.css';
@import '@fontsource/barlow-condensed/700.css';
@import '@fontsource/barlow-condensed/800.css';
@import '@fontsource/montserrat/400.css';
@import '@fontsource/montserrat/500.css';
@import '@fontsource/montserrat/600.css';
@import '@fontsource/montserrat/700.css';
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
@plugin 'daisyui' { themes: false; include: loading; logs: false; }
@import './geopark.css';
@import './pages.css';
:root { --forest-deep: var(--deep); --moss: var(--green); --water: #24535b; --stone: #c39353; --cream: var(--paper); --sun: var(--lime); --body: var(--sans); --header-h: var(--nav); }
astro-island { display: contents; }
.place-visual astro-island { display: contents; }
.hero-image img { width: 100%; height: 100%; object-fit: cover; }
html:not(.js) .place-card { display: block !important; opacity: 1; transform: none; }
html:not(.js) .atlas-toolbar { display: flex !important; }
html:not(.js) [data-action], html:not(.js) [data-favorite], html:not(.js) #planner-form button { visibility: hidden; }
html:not(.js) .reveal { opacity: 1; transform: none; }
html.reduce-motion { scroll-behavior: auto; }
html.reduce-motion *, html.reduce-motion *::before, html.reduce-motion *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
.route-page .site-header { border-bottom: 1px solid var(--line); }
.sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
''')
write('src/styles/pages.css', '''
.editorial-page { padding: 60px var(--gutter) 100px; min-height: 65vh; }
.editorial-page>h1 { font: 800 clamp(48px, 8vw, 128px)/.95 var(--display); text-transform: uppercase; max-width: 1150px; margin: 25px 0; }
.editorial-page>.lead { max-width: 800px; margin-bottom: 40px; }
.breadcrumbs { display:flex; flex-wrap:wrap; gap:10px; font-size:11px; margin-bottom:25px; }
.place-page .detail-hero { height: clamp(260px, 45vw, 650px); }
.place-page .detail-main { padding: 45px var(--gutter) 85px; }
.place-page .detail-description { font-size: 18px; line-height: 1.8; }
.story-page .reading-image { height: clamp(220px, 45vw, 620px); object-fit: cover; }
.story-page .article-reading { max-width: 850px; margin: 40px auto; }
.story-page .article-reading h2 { font: 700 clamp(28px, 4vw, 48px)/1.1 var(--display); margin: 36px 0 16px; }
.story-page .article-reading p { line-height: 1.9; }
.stories-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:26px; }
.story-card img { width:100%;height:240px;object-fit:cover; }
.story-card h2 { font:700 38px/1.05 var(--display); margin:18px 0; }
.story-card p { font-size:12px;line-height:1.8; }
.route-page .explore { padding-top:55px; }
.planner-fallback { margin:15px 0; line-height:1.8; }
@media(max-width:900px) { .stories-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:620px) { .stories-grid { grid-template-columns:minmax(0,1fr); } .place-page .detail-main { padding-top:25px; } }
''')
write('.prettierignore', '''
node_modules
dist
.astro
Manantiales_Serranos_v2.html
docs/reference
scripts/reference-runtime.txt
test-results
playwright-report
reports
package-lock.json
*.py
''')
write('.gitignore', '''
node_modules/
dist/
.astro/
test-results/
playwright-report/
coverage/
.env
*.log
''')
replace('.dockerignore', 'Semana-de-Lavalleja-53.html', 'Manantiales_Serranos_v2.html\nreports\nscripts/reference-runtime.txt')
replace('nginx.conf', 'location = /programacion.md {', 'location ~ \\.md$ {')
replace('nginx.conf', 'webp|svg)', 'webp|avif|svg)')
replace('tsconfig.json', '"exclude": ["dist", "reference"]', '"exclude": ["dist", "docs/reference", "scripts", "node_modules", "reports", "test-results"]')
print('Project configuration and reusable components created.')

from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
def write(path, content):
    p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(content.strip()+'\n',encoding='utf-8')
write('src/layouts/BaseLayout.astro', '''
---
import { ClientRouter } from 'astro:transitions';
import Navbar from '../components/layout/Navbar.astro';
import MobileNavigation from '../components/layout/MobileNavigation.astro';
import Footer from '../components/layout/Footer.astro';
import Dialogs from '../components/layout/Dialogs.astro';
import IconSprite from '../components/decorative/IconSprite.astro';
import SeoHead from '../components/seo/SeoHead.astro';
import StructuredData from '../components/seo/StructuredData.astro';
import { geopark } from '../data/geopark';
import { clientImages } from '../lib/images';
import { absoluteUrl } from '../lib/urls';
import '../styles/global.css';
interface Props { title?: string; description?: string; structuredData?: Record<string, unknown>[] }
const { title, description, structuredData = [] } = Astro.props;
const images = await clientImages();
const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\\\u003c');
const home = Astro.url.pathname === '/';
const common = [
  { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Manantiales Serranos', url: absoluteUrl('/') },
  ...(home ? [{ '@context': 'https://schema.org', '@type': 'TouristDestination', name: 'Geoparque Mundial UNESCO Manantiales Serranos', description: '2.010 km² de geología, naturaleza y cultura en Lavalleja, Uruguay.', url: absoluteUrl('/'), sameAs: 'https://www.unesco.org/en/iggp/manantiales-serranos-unesco-global-geopark' }, { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: geopark.places.filter(place => place.featured).map((place, index) => ({ '@type': 'ListItem', position: index + 1, name: place.name, url: absoluteUrl(`/lugares/${place.slug}/`) })) }] : []),
];
---
<!doctype html>
<html lang="es-UY">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#214b37" />
    <link rel="icon" href="/icons/favicon.svg" type="image/svg+xml" />
    <SeoHead {title} {description} />
    <ClientRouter />
    <StructuredData data={[...common, ...structuredData]} />
    <slot name="head" />
  </head>
  <body class:list={{ 'route-page': !home }}>
    <a class="skip" href="#contenido">Saltar al contenido</a>
    <IconSprite />
    <Navbar />
    <MobileNavigation />
    <main id="contenido"><slot /></main>
    <Footer />
    <a class="round back-top" id="back-top" href="/#inicio" aria-label="Volver al inicio"><svg class="icon" aria-hidden="true"><use href="#i-up" /></svg></a>
    <div class="toast" id="toast" popover="manual" role="status" aria-live="polite"></div>
    <Dialogs />
    <script id="page-data" type="application/json" set:html={json(geopark)} />
    <script id="client-assets" type="application/json" set:html={json(images)} />
    <noscript><p class="planner-fallback">Explorá los <a href="/lugares/">61 lugares</a>, las <a href="/historias/">historias</a> y los <a href="/circuitos/">circuitos</a>. <a href="/guia.md" download>Llevá la guía de bolsillo.</a></p></noscript>
    <script>import '../features/site/lifecycle.js';</script>
  </body>
</html>
''')
names=['Hero','Ticker','TrustStrip','Introduction','GeologicalIntroduction','GeologicalStory','Atlas','TerritoryMap','Nature','Culture','Circuits','Planner','Education','Gallery','Visit']
write('src/pages/index.astro', '---\nimport BaseLayout from "../layouts/BaseLayout.astro";\n'+ '\n'.join(f'import {name} from "../components/sections/{name}.astro";' for name in names)+'\n---\n<BaseLayout>\n'+'\n'.join(f'<{name} />' for name in names)+'\n</BaseLayout>')
for route,title,description,sections in [
 ('explorar','Explorar el Geoparque','Explorá el atlas de 61 lugares por categoría, zona y modalidad de visita.',['Atlas','TerritoryMap']),
 ('lugares','Los 61 lugares del Geoparque','Todas las fichas de Manantiales Serranos: información, historias y condiciones de visita.',['Atlas']),
 ('planifica','Planificá tu viaje','Armá una escapada de uno a tres días y guardá los lugares de Manantiales Serranos.',['Planner','Visit']),
 ('circuitos','Circuitos y escapadas','Tres ideas para descubrir agua, bosque, Arequita y arquitectura serrana.',['Circuits','Planner']),
]:
 write(f'src/pages/{route}/index.astro', '---\nimport BaseLayout from "../../layouts/BaseLayout.astro";\n'+'\n'.join(f'import {name} from "../../components/sections/{name}.astro";' for name in sections)+f'\n---\n<BaseLayout title="{title} · Manantiales Serranos" description="{description}"><h1 class="sr-only">{title}</h1>'+'\n'.join(f'<{name} />' for name in sections)+'</BaseLayout>')
write('src/pages/lugares/[slug].astro', '''
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Photo from '../../components/brand/Photo.astro';
import { FavoritesButton } from '../../components/islands/FavoritesButton';
import { places } from '../../data/geosites';
import { placeSchema, breadcrumbs } from '../../lib/seo';
import type { GeoparkPlace } from '../../types/geopark';
export function getStaticPaths() { return places.map(place => ({ params: { slug: place.slug }, props: { place } })); }
interface Props { place: GeoparkPlace }
const { place } = Astro.props;
const nearby = places.filter(item => item.region === place.region && item.id !== place.id).slice(0, 4);
const structuredData = [placeSchema(place), breadcrumbs([{ name: 'Inicio', path: '/' }, { name: 'Lugares', path: '/lugares/' }, { name: place.name, path: `/lugares/${place.slug}/` }])];
---
<BaseLayout title={place.seo.title} description={place.seo.description} {structuredData}>
  <article class="place-page">
    <div class="detail-hero"><Photo assetKey={place.image} alt={place.images[0]?.alt || place.name} loading="eager" fetchpriority="high" sizes="100vw" transition:name={`place-${place.slug}`} /><span class="detail-photo-caption">{place.images[0]?.alt}</span></div>
    <div class="detail-main">
      <nav class="breadcrumbs" aria-label="Ubicación"><a href="/">Inicio</a><span>/</span><a href="/lugares/">Lugares</a><span>/</span><span>{place.name}</span></nav>
      <div class="eyebrow">GMS-{String(place.id).padStart(2,'0')} · {place.categoryRaw}{place.international && ' · Valor científico internacional'}</div>
      <h1 class="detail-title">{place.name}</h1><p class="detail-tagline">{place.tagline}</p>
      <div class="detail-grid"><div class="detail-body">
        <p class="detail-description">{place.summary}</p><p>{place.intro}</p>
        {place.blocks.map(block => block.heading ? <h2>{block.text}</h2> : <p>{block.text}</p>)}
        {place.relationsRaw && <><h2>Conexiones del territorio</h2><p>{place.relationsRaw}</p></>}
        <h2>Más cerca de acá</h2><div class="related-items">{nearby.map(item => <a href={`/lugares/${item.slug}/`}>{item.name} ↗</a>)}</div>
      </div><aside class="detail-side"><h2>Planeá tu visita.</h2><span class="status">{place.status}</span><p>{place.zone}</p><p>{place.statusRaw}</p><FavoritesButton id={place.id} name={place.name} compact={false} client:load />{place.channel && <a class="btn outline" href={place.channel.url} target="_blank" rel="noopener noreferrer">{place.channel.label} ↗</a>}<a class="text-link" href={`/lugares/${place.slug}.md`}>Descargar esta ficha ↓</a><a class="text-link" href="/explorar/">Volver al atlas ↗</a></aside></div>
    </div>
  </article>
</BaseLayout>
''')
write('src/pages/historias/index.astro', '''
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Photo from '../../components/brand/Photo.astro';
import { articles } from '../../data/stories';
---
<BaseLayout title="Historias de la Tierra y sus comunidades · Manantiales Serranos" description="Descubrí las historias del agua, las rocas, la biodiversidad, los oficios y las comunidades del Geoparque.">
<section class="editorial-page"><p class="eyebrow">El territorio cuenta</p><h1>La Tierra tiene memoria.</h1><p class="lead">Ocho historias para mirar el paisaje con curiosidad.</p><div class="stories-grid">{Object.entries(articles).map(([slug, story]) => <article class="story-card"><a href={`/historias/${slug}/`}><Photo assetKey={story.image} alt={story.title} /><h2>{story.title}</h2></a><p>{story.lead}</p><a class="text-link" href={`/historias/${slug}/`}>Conocé su historia ↗</a></article>)}</div></section>
</BaseLayout>
''')
write('src/pages/historias/[slug].astro', '''
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Photo from '../../components/brand/Photo.astro';
import { articles } from '../../data/stories';
import type { GeologicalStory } from '../../types/geopark';
import { breadcrumbs } from '../../lib/seo';
export function getStaticPaths() { return Object.entries(articles).map(([slug, story]) => ({ params: { slug }, props: { story, slug } })); }
interface Props { story: GeologicalStory; slug: string }
const { story, slug } = Astro.props;
---
<BaseLayout title={`${story.title} · Manantiales Serranos`} description={story.lead} structuredData={[breadcrumbs([{ name: 'Inicio', path: '/' }, { name: 'Historias', path: '/historias/' }, { name: story.title, path: `/historias/${slug}/` }])]}>
<article class="editorial-page story-page"><nav class="breadcrumbs" aria-label="Ubicación"><a href="/">Inicio</a> / <a href="/historias/">Historias</a></nav><p class="eyebrow">{story.eyebrow}</p><h1>{story.title}</h1><p class="lead">{story.lead}</p><Photo assetKey={story.image} alt={story.title} class="reading-image" sizes="100vw" loading="eager" fetchpriority="high" /><div class="article-reading">{story.sections.map(([heading, text]) => <section><h2>{heading}</h2><p>{text}</p></section>)}<a class="text-link" href="/historias/">Más historias ↗</a></div></article>
</BaseLayout>
''')
write('src/pages/circuitos/[slug].astro', '''
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Photo from '../../components/brand/Photo.astro';
import { circuits } from '../../data/circuits';
import { placeById } from '../../data/geosites';
import { absoluteUrl } from '../../lib/urls';
import { breadcrumbs } from '../../lib/seo';
import type { Circuit } from '../../types/geopark';
export function getStaticPaths() { return circuits.map(circuit => ({ params: { slug: circuit.id }, props: { circuit } })); }
interface Props { circuit: Circuit }
const { circuit } = Astro.props;
const structuredData = [breadcrumbs([{ name: 'Inicio', path: '/' }, { name: 'Circuitos', path: '/circuitos/' }, { name: circuit.name, path: `/circuitos/${circuit.id}/` }]), { '@context': 'https://schema.org', '@type': 'ItemList', name: circuit.name, itemListElement: circuit.places.map((id, index) => ({ '@type': 'ListItem', position: index+1, name: placeById.get(id)!.name, url: absoluteUrl(`/lugares/${placeById.get(id)!.slug}/`) })) }];
---
<BaseLayout title={`${circuit.name} · Manantiales Serranos`} description={circuit.text} {structuredData}>
<article class="editorial-page story-page"><p class="eyebrow">{circuit.days} días · {circuit.kicker}</p><h1>{circuit.name}</h1><p class="lead">{circuit.text}</p><Photo assetKey={circuit.image} alt={circuit.imageContext ? 'Paisaje de Lavalleja' : circuit.name} class="reading-image" loading="eager" fetchpriority="high" sizes="100vw" /><div class="article-reading">{circuit.blocks.map(block => <section><h2>Día {block.day} · {block.title}</h2><p>{block.text}</p><div class="related-items">{block.ids.map(id => <a href={`/lugares/${placeById.get(id)!.slug}/`}>{placeById.get(id)!.name} ↗</a>)}</div></section>)}<button class="btn" data-add-route={circuit.id}>Guardar esta escapada ↗</button><p class="visit-note">Coordiná reservas y accesos con los lugares que elijas visitar.</p><a class="text-link" href="/circuitos/">Más escapadas ↗</a></div></article>
</BaseLayout>
''')
write('src/pages/404.astro', '''
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Página no encontrada · Manantiales Serranos" description="Volvé a los caminos y las historias del Geoparque Manantiales Serranos."><section class="editorial-page"><p class="eyebrow">404 · Este camino no sigue por acá</p><h1>El paisaje tiene otros caminos.</h1><p class="lead">No encontramos esa página. Encontrá tu próxima historia en el atlas del Geoparque.</p><a class="btn" href="/explorar/">Explorar los lugares ↗</a></section></BaseLayout>
''')
write('src/pages/robots.txt.ts', '''
import type { APIRoute } from 'astro';
import { getBuildSite } from '../lib/urls';
export const GET: APIRoute = () => {
  const site = getBuildSite();
  return new Response(site.indexable ? `User-agent: *\\nAllow: /\\nSitemap: ${site.url}sitemap-index.xml\\n` : 'User-agent: *\\nDisallow: /\\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
''')
write('src/pages/guia.md.ts', '''
import type { APIRoute } from 'astro';
import { places } from '../data/geosites';
import { guideMarkdown } from '../lib/markdown';
export const GET: APIRoute = () => new Response(guideMarkdown(places), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
''')
write('src/pages/lugares.md.ts', '''
import type { APIRoute } from 'astro';
import { places } from '../data/geosites';
import { placesMarkdown } from '../lib/markdown';
export const GET: APIRoute = () => new Response(placesMarkdown(places), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
''')
write('src/pages/lugares/[slug].md.ts', '''
import type { APIRoute } from 'astro';
import { places } from '../../data/geosites';
import { placeMarkdown } from '../../lib/markdown';
import type { GeoparkPlace } from '../../types/geopark';
export function getStaticPaths() { return places.map(place => ({ params: { slug: place.slug }, props: { place } })); }
export const GET: APIRoute = ({ props }) => new Response(placeMarkdown(props.place as GeoparkPlace), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
''')
write('src/pages/llms.txt.ts', '''
import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/urls';
import { places } from '../data/geosites';
export const GET: APIRoute = () => new Response([
  '# Manantiales Serranos', '', 'Geoparque Mundial UNESCO en Lavalleja, Uruguay. 2.010 km² donde patrimonio geológico, agua, naturaleza y comunidades se encuentran.', '',
  '## Explorar', '', ...[['Atlas', '/explorar/'], ['61 lugares', '/lugares/'], ['Historias', '/historias/'], ['Circuitos', '/circuitos/'], ['Planificá tu visita', '/planifica/'], ['Guía de bolsillo', '/guia.md'], ['Fichas completas', '/lugares.md']].map(([label, url]) => `- [${label}](${absoluteUrl(url!)})`), '',
  '## Geositios de valor científico internacional', '', ...places.filter(place => place.international).map(place => `- [${place.name}](${absoluteUrl(`/lugares/${place.slug}/`)}): ${place.summary}`), '',
  '## Categorías', '', 'Geología, naturaleza, cultura y experiencias. Las modalidades y accesos varían por lugar. Consultá reservas, permisos y condiciones antes de viajar.', '',
].join('\\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
''')
write('src/pages/health.ts', "import type { APIRoute } from 'astro';\nexport const GET: APIRoute = () => new Response('ok\\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });")
write('public/icons/favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#214b37"/><path d="M8 46L25 18l9 16 8-10 14 22" fill="none" stroke="#dfc568" stroke-width="5" stroke-linejoin="round"/><path d="M12 53h40" stroke="#f5f0e5" stroke-width="3"/></svg>')
from PIL import Image
manifest = __import__('json').loads((ROOT/'docs/asset-manifest.json').read_text(encoding='utf-8'))
with Image.open(ROOT/manifest['arequita-rio']['path']) as image:
    from PIL import ImageOps
    ImageOps.fit(image.convert('RGB'), (1200,630)).save(ROOT/'public/brand/social.webp', quality=88)
print('Created static HTML and Markdown routes, metadata and machine-readable resources.')

# Assets

Todas las imágenes publicadas están en WebP bajo `src/assets/images/<componente>/`. `asset-manifest.original.json` registra la extracción histórica del prototipo. `src/data/place-photos.json` registra la fuente, las dimensiones, la evidencia y el SHA-256 de cada lugar. `src/data/editorial-photos.json` identifica las versiones de publicación.

| Carpeta                                           | Imágenes                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| `hero/`                                           | Portadas y recortes móviles del carrusel                               |
| `entry/`                                          | Ilustración del selector del recorrido 3D                              |
| `place-photo/catalog/`                            | Fuentes identificadas para atlas, fichas, buscador, galería y visor 3D |
| `place-photo/published/`                          | Másteres WebP comunes para los perfiles de presentación                |
| `environment/`, `education/`, `geological-story/` | Encuadres de las secciones editoriales                                 |
| `photo-credit/`                                   | Referencias que se abren desde los créditos                            |
| `site-brand/`, `footer/`, `seo-head/`             | Marca compartida, logos institucionales, favicon y Open Graph          |
| `territory-map/`                                  | Mapa histórico que se amplía desde la web                              |
| `experience-miniature/`                           | Texturas WebP sin pérdida del Molino Viejo y de la represa             |

Para reemplazar una foto manteniendo su ruta, actualizá también las dimensiones y el SHA-256 del inventario correspondiente. Las rutas de referencias en `referenceFile` apuntan al archivo WebP. El catálogo reutiliza el mismo archivo cuando la referencia ya coincide con una foto registrada. Los archivos bajo `archive/` conservan encuadres históricos.

La [política de calidad visual](photo-editorial-policy.md) fija la revisión individual. El build comprueba que el [registro de revisión](../src/data/visual-review.json) coincida con los archivos vigentes.

`Photo.astro` usa las dimensiones exactas declaradas en [los perfiles fotográficos](photo-standards.md) para generar los WebP responsivos. Los mismos perfiles se aplican a las imágenes que se insertan desde el buscador, el mapa y la galería. El mapa histórico y las referencias conservan el encuadre de sus archivos fuente. Astro publica las texturas externas del recorrido en las rutas relativas que usan los GLB.

Atlas, fichas, mapa, galería y recorrido inmersivo comparten el catálogo de los 61 lugares. Los pies identifican escenas, autores y fuentes. Las 13 ortofotos de IDE corresponden a 2017–2018 y mantienen el centro y la escala de las coordenadas documentadas. Los originales se consultan mediante enlaces en `/creditos-fotograficos/`. Los prompts y las referencias de las ediciones están en `photo-restoration-prompts.json` y el inventario de publicación registra las dimensiones de cada entrada.

Acumin Variable Concept es la tipografía del sitio. El texto usa el ancho regular y los títulos usan el ancho condensado de la misma familia. Ambas variantes comparten un único WOFF2 precargado y servido desde el mismo origen con `font-display: swap`.

El prototipo histórico permanece en la raíz, fuera de dist y excluido del contexto Docker. La página de producción no contiene fotografías base64. Los scripts históricos de extracción están en `docs/reference/migration-tools/` y no deben ejecutarse para editar la fuente actual.

La marca usa una derivada WebP con transparencia. El vector de origen queda en `docs/reference/media/`. Los íconos en línea, los mapas interactivos y los gráficos de interfaz se dibujan en el propio componente.

`HeroPhoto.astro` usa cuatro derivados para pantallas de hasta 620 px. Al reemplazar una portada, `npm run assets:hero` conserva los píxeles del encuadre móvil y actualiza `hero-crop-manifest.json`. El navegador elige el WebP por ancho y densidad con `<picture>` y los dos preloads comparten sus conjuntos de tamaños con la portada.

El WOFF2 se genera a partir de `fonts/AcuminVariableConcept.otf` y conserva todos los caracteres y ejes variables del archivo original. `fonts-manifest.json` registra ambos archivos, sus tamaños y sumas de verificación. Para regenerar, instalar `fonttools==4.66.1` y `brotli==1.2.0` y ejecutar `python scripts/subset-fonts.py`. El build de Astro usa el WOFF2 ya generado.

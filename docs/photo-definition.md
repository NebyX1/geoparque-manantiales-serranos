# Definición de las fotografías y regreso al selector

Actualización posterior: Arequita se sustituyó por una fotografía auténtica de 3840 × 2162 y se amplió la corrección al sitio completo. Esta página conserva el diagnóstico anterior; el estado vigente está en `docs/photo-resolution.md`.

Revisión del 9 de noviembre de 2026 para las dos situaciones señaladas por el usuario: foto de Parque de Minas en los capítulos y foto del selector de entrada, además del destino del logo del navbar.

## Diagnóstico medido

Se midió el bitmap realmente descargado mediante `img.currentSrc` y `createImageBitmap`, junto al tamaño CSS y `devicePixelRatio`. No se usó `naturalWidth` como sustituto de la resolución del archivo, porque con `srcset` puede estar corregido por densidad.

| Imagen a 1904 × 944             | Antes                                                                                                   | Después                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Parque de Minas, densidad 1     | Bitmap 960 × 403 para un recorte de 698 × 517. El escalado por altura necesitaba unos 1232 px de ancho. | Recorte editorial restaurado, bitmap 960 × 709; necesita unos 700 px de ancho.               |
| Parque de Minas, densidad 2     | Bitmap 1600 × 672, frente a unos 2462 px necesarios para cubrir el marco con ese panorama.              | Bitmap 1459 × 1078, frente a unos 1399 px necesarios con el nuevo recorte.                   |
| Selector de entrada, densidad 2 | Bitmap de 1500 px para 1476 px necesarios. La resolución era suficiente, pero la foto base era blanda.  | Referencia restaurada de 1672 × 941; el navegador selecciona 1600 px para ese mismo espacio. |

El error de Parque era calcular la entrega sólo con el ancho visible. `object-fit: cover` también puede ampliar por altura, dejando parte del bitmap fuera del marco. El panorama original tiene una relación de 2,38:1, mientras la tarjeta de escritorio es de 1,35:1. Las capturas y lecturas exactas están en `reports/experience-review/photo-definition/before/` y `after/`.

## Correcciones

- `storyPhotoSizes()` considera la relación del archivo y los marcos de escritorio, tableta y móvil, con margen para el hover. Las cuatro escenas usan el mismo cálculo.
- `responsiveWidths()` incluye tamaños intermedios y la resolución nativa disponible hasta 3840 px; no amplía archivos pequeños para inventar resolución.
- `Photo`, la preparación del hero y las imágenes de los controladores codifican con calidad 92. Los nuevos masters WebP son lossless, de modo que no añaden otra compresión con pérdida antes de Astro.
- Parque de Minas tiene una restauración panorámica y una restauración del recorte editorial que ya se veía en la tarjeta. El segundo permite cubrir la tarjeta a densidad 2 sin estirar un panorama insuficiente. Arequita conserva el encuadre panorámico de la referencia restaurada.
- Los recortes móviles del hero se regeneraron con `npm run assets:hero`, conservando los píxeles originales de los cuatro archivos actuales. Preloads, breakpoints y fuentes siguen usando los mismos helpers.
- El logo del navbar enlaza a `/`, con navegación completa al selector de experiencias. Desde allí se elige `/inicio/` o `/experiencia/`.
- El rótulo del selector reserva espacio para el número de la tarjeta y puede ocupar varias líneas en móvil.

## Procedencia y límites

Se utilizó la herramienta nativa `image_gen` conforme a la skill `imagegen`. Se revisó visualmente la identidad general de Arequita y su río, y de los edificios, patios, caminos y piscinas de Parque de Minas frente a las referencias. La restauración interpreta textura fina y no constituye una nueva toma ni prueba del estado actual del lugar. Se identifica como **restauración con IA** en la interfaz y los créditos.

Los originales están conservados en `public/photo-originals/gms-01.webp`, `gms-17.jpg` y `parque-story.png`. El original del Parque procede de [la galería de su operador](https://parquedeminas.uy/), archivo `Home1Nosotros.jpg`; el de Arequita es el aportado por el proyecto, cuya identidad se contrastó con el Ministerio de Ambiente. No se atribuye su autoría al Ministerio.

Los tres prompts exactos, referencias y hashes están en `docs/photo-restoration-prompts.json`, claves `definition-arequita`, `definition-parque` y `definition-parque-story`. Se solicitaron las máximas resoluciones disponibles; los resultados nativos son 1672 × 941, 1935 × 813 y 1459 × 1078, respectivamente. No se presentan como fotografías 4K.

Los activos finales viven en:

- `src/assets/images/places/gms-01-restored.webp` y su copia editorial `hero/arequita-rio.webp`.
- `src/assets/images/places/gms-17-restored.webp` y su copia editorial `hero/parque.webp`.
- `src/assets/images/hero/parque-story.webp`.

El registro fotográfico mantiene 61 lugares y ahora dos imágenes editoriales adicionales, todos con procedencia. No se afirma una revisión independiente en esta corrección fotográfica. El alcance no incluye recrear las otras 59 fotos ni prometer detalle nativo ilimitado para cualquier pantalla.

## Comprobaciones

Las pruebas E2E comprueban los píxeles reales servidos para las dos imágenes señaladas en escritorio de densidades 1/2 y móvil de densidad 2, en Chromium y WebKit. El test del hero deriva sus dimensiones del manifiesto actual en lugar de fijar las dimensiones antiguas. La navegación del logo se prueba por teclado desde el sitio y desde una ficha, en escritorio y móvil. `npm run verify` conserva la cobertura general del sitio y de la experiencia.

Resultado: `npm run verify` terminó con código 0 en Node 22.22.3: 56 pruebas unitarias, 3 de SEO y 79 E2E aprobadas, con 3 omisiones previstas por configuración. Después del ajuste de espacio del rótulo se reconstruyeron las 83 páginas, se revisaron 12 tamaños de entrada entre 320 y 1920 px (incluidos landscape, pantalla baja y equivalente de zoom 200 %) sin solapamientos ni desbordamiento horizontal, y se repitieron las 4 comprobaciones de fotos/logo en Chromium y WebKit: todas aprobadas. Los registros y capturas finales están en `reports/experience-review/photo-definition/`.

# Calidad fotográfica en todo el sitio

La revisión del 9 de noviembre de 2026 amplía la corrección anterior de dos fotos. Se revisan los archivos publicados y los bitmaps realmente descargados en cada marco, tanto en la web como en las ventanas del recorrido 3D.

## Qué fallaba

La primera medición registró 125 usos insuficientes en 327 posiciones de imagen y 76 rutas, entre escritorio de densidades 1/2 y móvil de densidad 2. La comprobación antigua de un mínimo de 550 píxeles por archivo no garantizaba calidad al ampliarlo. Además, `sizes` describía el ancho del marco sin considerar la ampliación por altura de `object-fit: cover`, y varias fuentes eran miniaturas aunque existía un original mayor.

## Archivos recuperados

No se amplían artificialmente los originales. Se vuelve a codificar desde las referencias de mayor resolución, hasta 3840 px, con calidad 95. Se conservan los permisos y la procedencia de cada fotografía en el inventario.

| Lugar               | Antes       | Ahora                           |
| ------------------- | ----------- | ------------------------------- |
| Cerro del Cura      | 2400 × 1800 | 3840 × 2880                     |
| Mesón de las Cañas  | 2400 × 1199 | 2786 × 1392                     |
| Salto del Penitente | 2400 × 1747 | 3024 × 2201                     |
| Cueva Amarilla      | 2400 × 1350 | 3840 × 2160                     |
| Reserva Salus       | 2400 × 1600 | 3840 × 2560                     |
| Escuela 8           | 2400 × 1800 | 3840 × 2880                     |
| Teatro Lavalleja    | 2400 × 1800 | 3072 × 2304                     |
| Museo Belloni       | 1024 × 576  | 1920 × 1080                     |
| Casa Curbelo Báez   | 1024 × 576  | 3840 × 2160                     |
| Mangas de Piedra    | 870 × 555   | Restauración nativa 1448 × 1086 |

Los originales de Belloni y Curbelo se recuperaron de las mismas galerías de Diario La Unión. Los otros siete originales ya estaban guardados en el proyecto y se habían reducido durante la preparación. La fotografía de Mangas del operador permanece en 870 × 555 incluso sin el sufijo de miniatura; por ello se restauró un recorte 4:3 a partir de la referencia auténtica.

## Fuente nativa para Arequita

Además de esas diez actualizaciones, se sustituyó la restauración anterior de Arequita (1672 × 941) por una fotografía auténtica de 3840 × 2162: [Cerro_arequita.jpg, Bienflorencia](https://commons.wikimedia.org/wiki/File:Cerro_arequita.jpg), tomada en 2012, con licencia CC BY-SA 4.0. Muestra el paredón sobre el río Santa Lucía. Se comparte en portada, selector, fichas y paneles; la atribución y la fecha son visibles y los datos canónicos del lugar no cambian. No se identifica esa fotografía como restauración con IA.

## Entrega y límites de ampliación

Cada `Photo` publica su tamaño fuente. CSS limita ambos ejes según la densidad de pantalla y también funciona sin JavaScript. Cuando no hay más detalle disponible, la fotografía se presenta dentro del marco, centrada y sobre el color del sitio, en vez de estirarla o inventar un fondo desenfocado. Se mantienen los cuatro paisajes del hero y sus recortes móviles sin reescalado. El hero utiliza un marco limpio cuando la fuente no alcanza a cubrirlo a la densidad actual, sin difuminar los bordes.

Un `ResizeObserver` compartido calcula el ancho necesario con la proporción del archivo y el `object-fit` efectivo, y actualiza `sizes` para que el navegador escoja el candidato correcto. El trabajo se agrupa mediante RAF, sin sondeo continuo. El observador de inserciones incorpora las fotos de paneles y resultados dinámicos; ambos observadores y cualquier RAF pendiente se liberan con el contexto de navegación. El zoom decorativo se desactiva cuando agotaría la resolución disponible.

La galería y el mapa cambian juntos la fotografía, el `srcset`, su procedencia y sus dimensiones. Esto evita conservar las dimensiones de la imagen anterior. La entrega dinámica conserva candidatos pequeños para miniaturas y los mayores para ampliaciones; no obliga a descargar siempre el archivo más grande.

## Restauración de educación

Se utilizó la herramienta nativa `image_gen`, conforme a la skill `imagegen`. El resultado final está en `src/assets/images/places/gms-56-restored.webp`. El prompt completo y sus hashes están en `docs/photo-restoration-prompts.json`, clave `resolution-mangas-education`.

Se conserva la fotografía completa en `public/photo-originals/mangas-source.jpg` y el recorte de referencia en `public/photo-originals/gms-56.png`. Se compararon los seis visitantes, la ubicación de los muros y el horizonte con la referencia del operador. Las texturas finas y los rostros distantes son interpretados; la imagen se identifica como restauración con IA y no acredita una nueva toma ni el estado actual del lugar. Se comparte la misma imagen en fichas, educación y experiencia 3D.

## Revisión reproducible

`node scripts/audit-photo-resolution.mjs current` usa la compilación servida en `http://127.0.0.1:4321`. Mide con `currentSrc` y `createImageBitmap`, no sólo con `naturalWidth`. Calcula los píxeles realmente pintados y falla ante una insuficiencia o error de decodificación persistente. Reintenta únicamente las decodificaciones abortadas durante un cambio de candidato.

Incluye 78 rutas, los 61 lugares, los 12 elementos de la galería y las 61 fotos de paneles inmersivos, además de tamaños de 320 a 1920 px, landscape, pantalla baja, zoom equivalente y densidades hasta 3. Los paneles se montan desde sus plantillas reales para medir sus fotos sin cargar 61 modelos 3D. Los registros, capturas y referencias viven en `reports/experience-review/photo-resolution/`.

Las pruebas E2E de regresión recorren las secciones, el atlas, las fichas y toda la galería en Chromium y WebKit. La suite general comprueba navegación, accesibilidad, recortes, ausencia de errores y la experiencia 3D.

La auditoría final de las fotografías registró **618 posiciones sin insuficiencia de resolución ni errores de decodificación**. Los detalles están en `release/audit.json` y `release/shortages.json` dentro del directorio de informes. Las 10 pruebas E2E fotográficas pasaron en Chromium y WebKit. Se revisaron visualmente las capturas de educación, naturaleza, cultura, portada y paneles; la miniatura social también se deriva de la nueva fotografía auténtica de Arequita.

La verificación conjunta definitiva (`npm run verify`, Node 22.22.3) terminó con código 0: 68 pruebas unitarias, 3 de SEO y 89 de navegador aprobadas, con 3 omisiones previstas por configuración. Incluye los accesos corregidos y el Penitente con sus efectos nativos. Registro: `reports/experience-review/photo-resolution/verify-final.log`.

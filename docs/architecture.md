# Arquitectura

La referencia de ingeniería fue [Semana de Lavalleja](https://github.com/NebyX1/semana-de-lavalleja): se inspeccionaron configuración, componentes, layouts, datos, stores, motion, lifecycle, SEO, pruebas y despliegue antes de crear el proyecto. Los textos, composición y fotografías proceden exclusivamente del prototipo del Geoparque.

## Render y rutas

Astro genera el contenido completo en build. Hay 79 documentos HTML: home, explorar, índice de lugares, 61 lugares, índice de historias y ocho relatos, índice de circuitos y tres circuitos, planifica y 404. `/health` es un recurso estático de texto y una respuesta explícita Nginx. Hay 63 documentos Markdown: guía, colección y 61 fichas individuales.

`BaseLayout` centraliza head, SEO, ClientRouter, sprite SVG, navegación, footer y diálogos. Las quince secciones editoriales se mantienen en componentes Astro. Todas las fichas y bloques están presentes sin JavaScript. En ese caso, el atlas expone los 61 lugares y las cuatro escenas geológicas aparecen en flujo.

`ClientRouter` conserva navegación por secciones y rutas reales. Las URLs editoriales usan barra final y canonical explícito; `trailingSlash: ignore` también permite `/health` sin barra en la vista previa. Nginx resuelve directorios estáticos y nunca convierte una URL desconocida en home.

## Datos y tipos

`canonicalPlaces` contiene exactamente los campos originales. `places` añade campos derivados tipados para cards, metadatos, imágenes y relaciones. Historias, circuitos y puntos del mapa están separados y referencian los IDs canónicos. Los puntos del SVG son coordenadas de dibujo del prototipo, no latitud/longitud.

Los modelos viven en `src/types/geopark.ts`. La validación comprueba cantidad, unicidad, referencias y categorías. `src/lib/search.ts`, `markdown.ts`, `seo.ts` y `urls.ts` concentran transformaciones compartidas. El JSON editorial entregado al runtime usa la colección canónica y escapa `<`.

## Islas y stores

React hidrata `FavoritesButton` y `TripPlanner` al aparecer en pantalla; el favorito de una ficha directa usa `client:load`. Las estructuras editoriales y cards siguen siendo Astro. `TripTrigger.astro` usa el controlador nativo y el mismo store; home no descarga React hasta necesitar una isla. No hay una raíz global.

Nano Stores comparte `$trip`, `$favorites`, `$filters` y `$activeStory`. El viaje usa `persistentAtom`, versión 1, validación de IDs/días/fecha, deduplicación, migración de la clave original y eventos de storage entre pestañas. Si storage falla, funciona en memoria y el diálogo informa cómo exportar antes de cerrar.

El adaptador Vite elimina el `root.render` redundante después de `hydrateRoot` y completa el primer commit con `flushSync`. Así una navegación rápida no desmonta una raíz todavía sin hidratar, lo que producía React #424. El adaptador conserva posteriores actualizaciones, persistencia y unmount, y falla expresamente si cambia el código esperado de la dependencia.

## Controladores y movimiento

Los controladores nativos conservan mapa SVG, búsqueda, diálogos, exportación, galería, quiz, hero y escenas geológicas. Cada página recibe un contexto independiente con acceso a DOM, estado y registro de recursos. En `astro:before-swap` se abortan eventos, desconectan observers, cancelan RAF/timers, cierran diálogos y liberan suscripciones/Blobs. HMR también elimina los hooks globales anteriores.

El hero conserva sus cuatro imágenes y temporizador de 8,5 segundos, teclado, pausa manual y pausa al quedar oculto. La historia geológica conserva scroll desktop, cuatro capítulos discretos, carousel y swipe móvil, y modo estático accesible. El progreso visual permanece en DOM/RAF y sólo el capítulo discreto se escribe en un store.

## CSS, assets e infraestructura

La cascada original se divide en módulos temáticos conservando su orden. Tailwind proporciona utilidades; DaisyUI se limita a `loading`, sin tema. Las fuentes están empaquetadas y las fotografías tienen dimensiones, srcset, sizes y variantes WebP. El hero usa AVIF/WebP y derivados móviles con píxeles y encuadre preservados. Sólo el hero inicial tiene prioridad alta.

Docker compila con Node 22.22.3 y sirve únicamente dist mediante Nginx 1.29.4 sin root en 8080. El dominio y la política de indexación se fijan durante build. La validación cubre unidades, HTML generado, navegadores, accesibilidad, screenshots, Lighthouse y respuesta del contenedor.

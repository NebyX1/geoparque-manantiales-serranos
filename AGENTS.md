# Reglas de mantenimiento

El prototipo `Manantiales_Serranos_v2.html` define diseño, textos y comportamiento. El repositorio Semana de Lavalleja define la referencia de arquitectura e infraestructura. No reemplazar la identidad por un template o tema DaisyUI.

El giro editorial solicitado el 4 de noviembre de 2026 prioriza información y educación ambiental, conservación y comunidad. Los textos promocionales del prototipo quedan sustituidos por este enfoque; se conservan identidad visual, rutas, datos documentales y comportamiento. Las fuentes y criterios están en `docs/editorial-environment.md`.

- Astro renderiza contenido editorial y todas las rutas SEO. React se limita a favoritos y formulario del planificador. Conservar SSR; no crear raíz React global ni SPA.
- `src/data/geosites.ts` contiene una sola colección canónica. Los campos complementarios se derivan. IDs, slugs, estados y enlaces conservan la continuidad con el prototipo; los textos siguen el enfoque ambiental documentado y las fuentes de `data`. No inventar coordenadas, horarios, contactos, precios o permisos de acceso.
- Relatos y circuitos viven en `src/data/stories.ts` y `circuits.ts`. Markdown, JSON-LD y exportaciones se derivan de estos datos.
- `$trip` y `$favorites` son compartidos por las islas y los controladores. Mantener versión de storage, sanitización, migración única y sincronización entre pestañas. No usar `localStorage.clear()`.
- Toda interacción nativa se inicializa en `astro:page-load`. `src/features/site/lifecycle.js` cancela listeners, observers, RAF, timers, suscripciones y URLs Blob al cambiar de página. Registrar nuevas liberaciones en ese contexto. No editar DOM dentro de una isla React.
- Scroll y resize usan RAF; no escribir progreso de scroll en un store a cada frame. Conservar las cuatro escenas, el carousel móvil, pausa por visibilidad, control manual y `prefers-reduced-motion`.
- El adaptador `src/integrations/reactHydration.ts` corrige un render inicial redundante de @astrojs/react 7.0.0/React 19.3.0. Su test debe exigir revisión al cambiar esa dependencia; no ocultar errores de hidratación.
- Conservar el orden de `src/styles/geopark.css`. Comparar screenshots del prototipo y migración al modificar diseño. Verificar 320–1920 px, pantalla baja, landscape y zoom 200%.
- Guardar todas las imágenes publicadas de la web y del recorrido 3D bajo `src/assets/images/<componente>/`, en WebP. Los componentes que comparten un recurso apuntan al mismo archivo. Usar los tamaños en `rem` de `src/styles/fonts.css` para texto, controles y créditos.
- Toda foto editorial debe declarar el perfil de su componente en `src/lib/photo-profiles.mjs`. Usar WebP con dimensiones exactas por perfil, recorte proporcional y foco revisado. Verificar detalle, balance de blancos, luces y sombras sobre la fuente identificada. Ejecutar `npm run assets:photos` al cambiar el catálogo o su edición. `npm run build` valida que los másteres estén al día. El mapa original y los documentos enlazados conservan su geometría de referencia.
- Aplicar `docs/photo-editorial-policy.md` a cada alta o edición de fotografía y registrar su revisión individual. Comprobar el motivo al 100 % y en los componentes que lo usan, incluida la vista inmersiva.
- Los recortes de `src/assets/images/hero/mobile/` conservan píxeles y encuadre originales. Regenerar con `npm run assets:hero` si cambian las fotos. Mantener alineados `heroCrop`, `heroSizes`, los breakpoints CSS y los dos preloads; no reducir la resolución del hero al ancho visible de un recorte vertical.
- Ejecutar `npm run verify` con Node 22.22.3+. Playwright necesita Chromium y WebKit instalados; no lanzar suites simultáneas que compartan sus servidores.
- Producción usa Docker multietapa y Nginx sin root en 8080. `SITE_URL` y `SITE_INDEXABLE` son argumentos de build. No agregar fallback SPA. `/health` debe devolver 200 y rutas inexistentes 404 real.
- El HTML original y `docs/reference/migration-tools/` son referencias históricas, excluidas de dist y Docker. Los generadores históricos no incorporan las correcciones posteriores: no ejecutarlos para actualizar el sitio.

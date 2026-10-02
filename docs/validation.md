# Validación

Validación final realizada el **2 de octubre de 2026**, en Windows, con Node 22.22.3 portátil, npm 10.9.8, Playwright 1.63.0, Chromium y WebKit. Docker Desktop utiliza contenedores Linux. La referencia editorial y visual fue `Manantiales_Serranos_v2.html`; la referencia de ingeniería fue Semana de Lavalleja.

## Resultado de la verificación

`npm run verify` terminó con código 0. Los logs completos se conservan en `reports/verify.log`.

| Comprobación                   | Resultado                                      |
| ------------------------------ | ---------------------------------------------- |
| Astro check, 99 archivos       | 0 errores, 0 advertencias, 0 hints             |
| ESLint                         | Correcto                                       |
| Prettier check                 | Correcto                                       |
| Vitest unitario                | 17 pruebas correctas, 3 archivos               |
| Build estático                 | 79 documentos HTML, incluido 404               |
| Vitest SEO                     | 3 pruebas correctas                            |
| Playwright completo            | 29 correctas; 1 omitida intencionalmente       |
| Playwright contra Nginx        | 28 correctas, Chromium y WebKit                |
| Diálogos abiertos con axe      | 5 revisados; sin infracciones serious/critical |
| Docker HTTP, cache y seguridad | 19 comprobaciones correctas                    |
| SEO HTTP de producción         | 78 páginas indexables correctas                |
| npm audit                      | 0 vulnerabilidades                             |

La omisión es únicamente la segunda ejecución de screenshots en WebKit: las capturas se generan una vez en Chromium. Los 14 escenarios funcionales se ejecutan en ambos motores. Se comprobó además `npm run dev` en `0.0.0.0:4321`, con home, explorar, ficha y planifica correctas y sin errores de consola.

## Integridad y comportamiento

Las pruebas unitarias comparan todos los campos originales de las **61 fichas**, los **ocho relatos** y los **tres circuitos** con su fuente TypeScript. Verifican identificadores, slugs, categorías, referencias, búsqueda sin acentos, URLs, Markdown, favoritos, storage corrupto, deduplicación, migración única, planner y calendarios ICS. También comprueban el contrato de la integración React y la igualdad exacta de los píxeles de los cuatro recortes móviles del hero.

El build contiene 61 fichas con todos sus bloques en HTML y 63 recursos Markdown derivados: guía, colección y una versión individual de cada ficha. Incluye robots, llms, sitemap, metadatos, canonicals y JSON-LD. La revisión del contenedor recorre las 78 páginas HTML indexables del sitemap, exige status 200, canonicals y títulos únicos, descripciones, ausencia de noindex y JSON-LD parseable.

Se comprobaron también los SHA-256 de los 34 assets originales contra `asset-manifest.json`: todos coinciden. Los cuatro recortes móviles y las fuentes derivadas tienen manifests propios; el HTML canónico se conserva fuera de dist y Docker.

Los escenarios E2E cubren portada y capítulos con teclado, resolución del hero, categorías, búsqueda, zona y modalidad, ficha directa y recarga, mapa/pines/zoom/reset, favoritos entre islas y pestañas, persistencia, días y reordenación del viaje, propuestas del planner, circuitos, fecha, Markdown, ICS e impresión. También prueban búsqueda global, foco y Escape, galería/captions/flechas, quiz, privacidad y menú móvil.

La copia se verificó adicionalmente con `scripts/audit-clipboard.mjs`: escritura y lectura nativas en Chromium, contrato de escritura mediante stub en WebKit —su automatización no expone permisos de clipboard— y fallback ante permiso denegado en ambos motores. El fallback deja el texto completo enfocado y seleccionado para copiar manualmente. Los resultados están en `reports/clipboard-validation.json`.

La navegación repetida con ClientRouter conserva el estado y no presenta errores de consola ni acciones duplicadas. Las rutas y recursos probados no tienen 404 inesperados. Sin JavaScript aparecen los 61 enlaces del atlas, las cuatro escenas geológicas en flujo y el contenido completo de la ficha. Con movimiento reducido se detiene el cambio automático del hero y se conserva la selección manual.

La auditoría axe se ejecuta en home, explorar, ficha y planifica en ambos motores. Los cinco diálogos abiertos —búsqueda, viaje, galería, quiz y privacidad— se revisan además sobre Nginx. No hay infracciones serious/critical en esas comprobaciones; esto no sustituye una auditoría humana completa con tecnologías de asistencia.

## Comparación visual

Se generaron y revisaron **156 PNG** en `test-results/visual-comparison/`, con copia duradera local en `reports/visual-comparison/`. Estas capturas no se versionan; se regeneran con `npm run test:visual`. Incluyen pares prototipo/Astro de hero, atlas, geología, mapa, naturaleza, cultura, planner y footer, más la ficha directa, en **320, 360, 390, 430, 768, 1024, 1280, 1440 y 1920 px**.

También se capturaron 390×540 y 844×390. El zoom 200% se comprobó mediante su geometría equivalente: 1280×900 píxeles físicos, 640×450 píxeles CSS y factor de escala 2. Las comprobaciones de ancho no detectaron overflow horizontal. Son pruebas de navegador automatizado; no se utilizó un dispositivo iPhone físico.

Las capturas esperan fuentes e imágenes decodificadas y usan movimiento reducido para comparar estados estables. El servidor del prototipo sustituye solamente la descarga de Google Fonts por las mismas fuentes locales originales, para evitar variaciones de red. La revisión conserva composición, tipografía, fotografías, encuadres y estructura. Se documentan en `migration.md` los tonos oscurecidos para contraste AA y la conversión de fichas a rutas reales.

La revisión detectó una portada borrosa en móvil causada por dimensionar la fuente sólo con `100vw`. Se corrigieron los tamaños y se añadieron recortes lossless que excluyen las columnas fuera de pantalla, manteniendo el encuadre original. El test E2E decodifica la imagen elegida para comprobar su resolución real.

## Lighthouse

Lighthouse **13.5.0** se ejecutó sobre builds estáticos, sin pruebas ni compilaciones simultáneas. Mobile usa el preset y throttling estándar; desktop usa explícitamente la configuración oficial desktop. Los JSON conservan métricas, configuración, URL y fecha de cada ejecución, sin editar sus resultados.

Producción local, servida por Nginx en `http://127.0.0.1:8088/`, con `SITE_URL=https://manantialesserranos.uy` y `SITE_INDEXABLE=true`:

| Perfil  | Performance | Accessibility | Best Practices | SEO     | LCP     | TBT  | CLS      |
| ------- | ----------- | ------------- | -------------- | ------- | ------- | ---- | -------- |
| Mobile  | **95**      | **100**       | **100**        | **100** | 2.705 s | 0 ms | 0.000054 |
| Desktop | **100**     | **100**       | **100**        | **100** | 0.684 s | 0 ms | 0.000441 |

Informes: `reports/lighthouse/mobile.json` y `desktop.json`. Se alcanzan las metas solicitadas en esta medición local. Los resultados pueden variar con hardware, red y despliegue real.

La vista previa estática de Astro, con la política segura de no indexación, obtuvo:

| Perfil  | Performance | Accessibility | Best Practices | SEO | LCP     | TBT  |
| ------- | ----------- | ------------- | -------------- | --- | ------- | ---- |
| Mobile  | 95          | 100           | 100            | 69  | 2.715 s | 0 ms |
| Desktop | 100         | 100           | 100            | 69  | 0.688 s | 0 ms |

Sus informes son `mobile-preview.json` y `desktop-preview.json`. El SEO 69 corresponde a noindex y robots de preview; no se eliminó esa protección para mejorar el score. El dominio de producción procede del prototipo y del encargo, no se inventó para la medición.

Las optimizaciones conservan contenido y controles: hero AVIF con fallback WebP y preload responsive, paisajes secundarios lazy, marca SVG optimizada conservando su original, fuentes locales con todos los caracteres del sitio y subconjuntos reproducibles. El contador del viaje usa Astro/Nano Stores y React se carga cuando hace falta una isla.

## Docker y despliegue

La imagen `manantiales-serranos:validation` se construyó mediante el Dockerfile multietapa con `npm ci`. El contenedor `geoparque-validation` escucha en el puerto interno 8080, publicado localmente en 8088, funciona con **UID 101** y su healthcheck está **healthy**. `/health` devuelve 200 con cuerpo `ok`.

Se comprobaron rutas de fichas, relatos, circuitos, planner, Markdown, llms, robots y sitemap. Las URLs inexistentes devuelven 404 real; el prototipo, docs y tests no se sirven; los dotfiles se bloquean. Los assets con hash llevan cache immutable de un año; HTML y Markdown revalidan. Markdown tiene MIME correcto y se verificaron CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options y Permissions-Policy.

Las 28 pruebas funcionales y las cinco auditorías de diálogos se repitieron contra el contenedor, con su CSP activa. `reports/docker-validation.json`, `axe-dialogs.json`, `production-e2e.log` y `docker-build.log` conservan los resultados. `reports/npm-audit.json` registra la auditoría de dependencias.

Reproducir infraestructura con los comandos de `deployment-coolify.md`; repetir la auditoría HTTP con `node scripts/check-container.mjs`. Para E2E de producción en PowerShell, configurar `$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:8088'` y ejecutar `npm run test:e2e -- --grep-invert capturas`. Para Lighthouse, configurar `$env:LIGHTHOUSE_URL='http://127.0.0.1:8088/'` y ejecutar `npm run test:lighthouse`.

No se realizó publicación remota, conexión de un repositorio a Coolify ni modificación DNS. El proyecto y el contenedor están preparados y probados; esas acciones requieren la instancia y el repositorio del propietario. El npm del sistema de este equipo necesita repararse o actualizarse a Node 22.22.3; la distribución portátil utilizada y su comando están documentados en README.

# Manantiales Serranos

Sitio del Geoparque Mundial UNESCO Manantiales Serranos, Lavalleja, Uruguay. Migración del prototipo canónico `Manantiales_Serranos_v2.html`, con las 61 fichas completas, sus fotografías y sus interacciones.

## Desarrollo

Requiere Node **22.22.3 o posterior de la rama 22** y npm. Las versiones están fijadas en `package.json` y `package-lock.json`.

```sh
npm ci
npx playwright install chromium webkit
npm run dev
```

Abrir http://localhost:4321/. El servidor escucha en `0.0.0.0:4321`.

La entrada ofrece dos recorridos: el sitio editorial en `/inicio/` y la experiencia 3D en `/experiencia/`. Las fichas, historias, circuitos y el planificador conservan sus rutas. Consultar [la experiencia inmersiva](docs/experience.md) para controles, datos y mantenimiento. La [geografía y su precisión](docs/geography.md) y la [procedencia de las miniaturas](docs/model-provenance.md) documentan las fuentes utilizadas.

La experiencia incluye los 61 puntos del Geoparque, ocho casas para recorrer zonas con lugares próximos y miniaturas con procedencia documentada. El Penitente, Stewart Vargas y el río junto a Arequita conservan sus efectos animados; el entorno de Marmarajá incorpora un lagarto animado. Los accesos de las casas comparten la posición de sus puertas y sus rampas.

Las fotografías se comparten entre ambas experiencias, con créditos, originales de las restauraciones y límites de ampliación según la resolución disponible. Consultar [calidad de las fotos](docs/photo-resolution.md), [accesos a las casas](docs/house-entrances.md) y [reutilización del Penitente](docs/penitente-reuse.md).

En Windows, si la versión del sistema es anterior a 22.22.3, usar una instalación compatible de Node 22 y agregar su carpeta al `PATH` antes de ejecutar estos comandos.

## Verificación y build

```sh
npm run verify
npm run build
npm run preview
npm run test:visual
npm run test:lighthouse
```

`verify` ejecuta tipos, lint, formato, unidades, build, SEO y Playwright. La primera instalación de Playwright necesita descargar los navegadores. Las capturas comparativas se guardan en `test-results/visual-comparison/`; los informes Lighthouse en `reports/lighthouse/`.

La vista previa de Astro 7 es un proceso independiente. Después de cambiar la configuración, detenerla con `npx astro preview stop` antes de iniciarla nuevamente. Para pruebas se usan los puertos 4321 y 4323; ejecutar una sola suite Playwright a la vez.

La revisión del 9 de noviembre de 2026 pasó `npm run verify` con Node 22.22.3: 68 pruebas unitarias, 3 de SEO y 89 de navegador aprobadas, con 3 omisiones previstas. La auditoría fotográfica comprobó además 618 posiciones sin insuficiencia de resolución ni errores de carga.

## Arquitectura

Astro 7, React 19 para favoritos y planificador, Nano Stores, Tailwind 4 y DaisyUI 5 limitada a la primitiva `loading`, sin tema ni estilos genéricos. Las fuentes Montserrat y Barlow Condensed se sirven localmente. Las imágenes pasan por `astro:assets`.

- `src/data/`: lugares, relatos, circuitos, categorías y assets canónicos.
- `src/components/`: secciones editoriales Astro, marca, navegación, fichas, SEO e islas.
- `src/features/`: viaje, búsqueda, mapa, galería, educación, movimiento, experiencia Three.js y lifecycle.
- `src/pages/`: 83 documentos HTML, incluidas las dos entradas, 61 fichas y la página 404; también Markdown, robots, llms y sitemap.
- `src/styles/`: cascada del prototipo separada por responsabilidad y ajustes de accesibilidad.
- `tests/`: unidades, SEO del build y E2E Chromium/WebKit.

Consultar [arquitectura](docs/architecture.md), [migración](docs/migration.md), [assets](docs/assets.md) y [resultados de validación](docs/validation.md).

## Producción y Docker

Los previews son `noindex` por defecto. La indexación requiere una URL HTTPS real explícita al construir:

```sh
docker build --build-arg SITE_URL=https://manantialesserranos.uy --build-arg SITE_INDEXABLE=true -t manantiales-serranos:production .
docker run --rm -p 8080:8080 manantiales-serranos:production
```

El dominio procede del prototipo; confirmar su asignación al desplegar. Las variables son argumentos de **build**, no ajustes que cambien un contenedor ya construido. Nginx escucha en 8080, funciona sin root, expone `/health` y devuelve 404 real. No incluye el prototipo, documentación ni tests en la imagen servida.

Para Compose, configurar `SITE_URL`, `SITE_INDEXABLE=true` y opcionalmente `HOST_PORT`, y ejecutar `docker compose up --build -d`. Las instrucciones completas están en [Coolify](docs/deployment-coolify.md).

Para medir el contenedor local, fijar `LIGHTHOUSE_URL=http://127.0.0.1:8088/` antes de `npm run test:lighthouse`. Los scores de preview incluyen la política noindex.

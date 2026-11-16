# Manantiales Serranos

Sitio de información y educación ambiental del Geoparque Mundial UNESCO Manantiales Serranos, Lavalleja, Uruguay. Conserva la identidad visual y las interacciones del prototipo `Manantiales_Serranos_v2.html`, con una orientación editorial hacia el conocimiento, la conservación y la comunidad.

La portada presenta cuatro ejes ambientales, propuestas didácticas, el atlas de 61 fichas, itinerarios de aprendizaje y un cuaderno de campo. `src/data/environment.ts` organiza los recursos educativos y sus fuentes; `src/lib/learning.ts` deriva preguntas y cuidados para las fichas. Las presentaciones institucionales se sirven desde `public/documentos/`. Los criterios y la trazabilidad de los materiales de `data/` están en [el enfoque editorial](docs/editorial-environment.md).

## Desarrollo

Requiere Node **22.22.3 o posterior de la rama 22** y npm. Las versiones están fijadas en `package.json` y `package-lock.json`.

```sh
npm ci
cp .env.example .env
npm run dev
```

Abrí `http://localhost:4321/`. Los comandos de Astro leen `.env` para el dominio canónico, la indexación y la conexión a la API. Para usar el chat en local, iniciá Serrana en otra terminal. Por defecto, Astro reenvía `/api/serrana/chat` a `127.0.0.1:4319`. [Instalación y configuración de Serrana](docs/serrana.md)

La entrada ofrece dos recorridos: el sitio editorial en `/inicio/` y la experiencia 3D en `/experiencia/`. Las fichas, historias, circuitos y el planificador conservan sus rutas. Consultar [la experiencia inmersiva](docs/experience.md) para controles, datos y mantenimiento. La [geografía y su precisión](docs/geography.md) y la [procedencia de las miniaturas](docs/model-provenance.md) documentan las fuentes utilizadas.

La experiencia incluye los 61 puntos del Geoparque, ocho casas para recorrer zonas con lugares próximos y miniaturas con procedencia documentada. El Penitente, Stewart Vargas y el río junto a Arequita conservan sus efectos animados; el entorno de Marmarajá incorpora un lagarto animado. Los accesos de las casas comparten la posición de sus puertas y sus rampas.

Las fotografías se comparten entre ambas experiencias, con créditos, originales de las restauraciones y límites de ampliación según la resolución disponible. Consultar [calidad de las fotos](docs/photo-resolution.md), [accesos a las casas](docs/house-entrances.md) y [reutilización del Penitente](docs/penitente-reuse.md).

En Windows, si la versión del sistema es anterior a 22.22.3, usar una instalación compatible de Node 22 y agregar su carpeta al `PATH` antes de ejecutar estos comandos.

## Verificación y build

```sh
npx playwright install chromium webkit
npm run verify
npm run build
npm run preview
npm run test:visual
npm run test:lighthouse
```

`verify` ejecuta tipos, lint, formato, unidades, build, SEO y Playwright. Cuando el backend está incluido, comprueba también que su catálogo coincida con los datos canónicos de la web. Las capturas comparativas se guardan en `test-results/visual-comparison/` y los informes Lighthouse en `reports/lighthouse/`.

`npm run preview` sirve el build del sitio. Para pruebas se usan los puertos 4321 y 4323. Ejecutar una sola suite Playwright a la vez.

Para comprobar la API por separado, ejecutá `npm --prefix backend ci` y `npm --prefix backend run verify` desde la raíz web, o `npm ci` y `npm run verify` desde su propio repositorio.

## Arquitectura

Astro 7, React 19 para favoritos y planificador, Nano Stores, Tailwind 4 y DaisyUI 5 limitada a la primitiva `loading`, sin tema ni estilos genéricos. Las fuentes Montserrat y Barlow Condensed se sirven localmente. Las imágenes pasan por `astro:assets`.

- `src/data/`: lugares, relatos, circuitos, categorías y assets canónicos.
- `src/components/`: secciones editoriales Astro, marca, navegación, fichas, SEO e islas.
- `src/features/`: viaje, búsqueda, mapa, galería, educación, movimiento, experiencia Three.js y lifecycle.
- `src/pages/`: 84 documentos HTML, incluidas las dos entradas, 61 fichas y la página 404. También genera Markdown, robots, llms y sitemap.
- `src/styles/`: cascada del prototipo separada por responsabilidad y ajustes de accesibilidad.
- `tests/`: unidades, SEO del build y E2E Chromium/WebKit.

Consultar [arquitectura](docs/architecture.md), [migración](docs/migration.md), [assets](docs/assets.md) y [resultados de validación](docs/validation.md).

## Docker y Coolify

El frontend es una aplicación Dockerfile con Nginx sin root en `8080`, healthcheck `/health` y `404` real para rutas inexistentes. El backend es una segunda aplicación Dockerfile en `4319`, con healthcheck `/api/ready`. En un repositorio compartido, sus contextos son `/` y `/backend`. Con repositorios separados, ambos usan `/`. [Configuración completa de Coolify y Auto Deploy](docs/deployment-coolify.md)

Para construir la imagen del frontend, usá los dominios reales de ambos servicios. La configuración de preview usa `SITE_INDEXABLE=false`.

```sh
docker build \
  --build-arg SITE_URL=https://manantialesserranos.uy \
  --build-arg SITE_INDEXABLE=true \
  --build-arg PUBLIC_SERRANA_API_BASE=https://serrana-api.example \
  -t manantiales-serranos:production .
docker run --rm -p 127.0.0.1:8080:8080 manantiales-serranos:production
```

`SITE_URL`, `SITE_INDEXABLE` y `PUBLIC_SERRANA_API_BASE` son variables de **build** de la web. `CORS_ORIGINS` y las variables de Ollama son de **runtime** de la API. El catálogo viaja dentro de la imagen del backend. `/api/ready` identifica el catálogo cargado mediante su huella SHA-256. [Actualización de la base de conocimiento](docs/serrana.md#actualización-del-catálogo)

Con ambas aplicaciones desplegadas, comprobá los dominios y el catálogo desde la raíz web.

```sh
npm run check:coolify -- --web https://manantialesserranos.uy --api https://serrana-api.example
```

Para iniciar ambos servicios en local, creá `.env` y `backend/.env` desde las plantillas y ejecutá `docker compose --env-file .env --env-file backend/.env up --build -d`. Para Lighthouse, usá `LIGHTHOUSE_URL` con la URL del frontend local. [Compose y verificación HTTP](docs/deployment-coolify.md#ambos-servicios-con-compose)

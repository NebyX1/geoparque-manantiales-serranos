# Despliegue del Geoparque y Serrana

El sitio Astro y la API se construyen como dos aplicaciones Dockerfile. El backend incluye `data/knowledge.json` en su repositorio. Su build verifica el archivo, prueba que se pueda construir el índice y copia el catálogo validado a la imagen. Al arrancar cada contenedor, Serrana reconstruye el índice en memoria con ese catálogo. El contenido y el código viajan juntos en cada despliegue, como en [Gianna Turismo](https://github.com/NebyX1/nueva-web-turismo-idl/blob/346a8a770d68120af7263f962a42399930e93b7c/gianna-backend/Dockerfile).

## Crear las dos aplicaciones

Conectá a Coolify la rama `main` de los repositorios que correspondan. Elegí **Dockerfile** como build pack para cada recurso. La tabla indica el directorio que Coolify usará como contexto y la ubicación del Dockerfile relativa a ese contexto. [Configuración Dockerfile en Coolify](https://coolify.io/docs/applications/builds/dockerfile#configure-the-build-context)

| Aplicación        | Base Directory si comparten repositorio | Base Directory en repositorio propio | Dockerfile    | Puerto interno | Healthcheck      |
| ----------------- | --------------------------------------- | ------------------------------------ | ------------- | -------------- | ---------------- |
| Web del Geoparque | `/`                                     | `/`                                  | `/Dockerfile` | `8080`         | `GET /health`    |
| API de Serrana    | `/backend`                              | `/`                                  | `/Dockerfile` | `4319`         | `GET /api/ready` |

Al crear el repositorio institucional de la API, copiá el contenido completo de `backend/` a su raíz, incluidos `.dockerignore`, `.gitignore`, `.env.example`, `package-lock.json` y `data/knowledge.json`. El frontend se publica desde la raíz del proyecto web. Asigná un dominio HTTPS a cada aplicación. En esta guía `https://manantialesserranos.uy` representa la web y `https://serrana-api.example` el dominio de API que tenés que reemplazar.

### API de Serrana

En **Environment Variables** de la API, activá **Runtime** y desactivá **Buildtime** en estas variables. Cargá el valor real de `OLLAMA_API_KEY` como secreto del recurso. El Dockerfile ya establece `NODE_ENV=production`, `HOST=0.0.0.0` y `PORT=4319`. [Variables en Coolify](https://coolify.io/docs/applications/configuration/environment-variables)

```dotenv
CORS_ORIGINS=https://manantialesserranos.uy
OLLAMA_HOST=https://ollama.com
OLLAMA_MODEL=deepseek-v4.1-flash
OLLAMA_API_KEY=
SERRANA_REQUESTS_PER_MINUTE=30
```

`CORS_ORIGINS` es una lista de orígenes HTTPS exactos separados por comas, sin rutas ni barra final. Agregá la variante `www` y el dominio de staging solamente si desde allí se va a usar la API. Si migrás una configuración anterior, `OLLAMA_BASE_URL` sigue funcionando cuando `OLLAMA_HOST` está vacío.

Desplegá primero la API. En el log de build debe aparecer `[serrana] catálogo validado`. `GET /api/ready` debe devolver HTTP `200`, `status: ready` y un objeto `catalog` con versión de esquema, fecha de revisión, cantidades y huella SHA-256. El catálogo actual contiene 123 documentos de consulta, 61 lugares y 156 fuentes. El healthcheck valida el catálogo cargado y la configuración local del proveedor. Para comprobar que Ollama acepta la clave y el modelo, hacé una consulta del Geoparque desde el navegador.

### Web del Geoparque

Configurá como **Buildtime** las variables que siguen. `SITE_URL` es el dominio canónico del sitio. Para staging usá su propio dominio y `SITE_INDEXABLE=false`.

```dotenv
SITE_URL=https://manantialesserranos.uy
SITE_INDEXABLE=true
PUBLIC_SERRANA_API_BASE=https://serrana-api.example
```

`PUBLIC_SERRANA_API_BASE` contiene el origen HTTPS de la API, sin `/api` ni barra final. Astro incorpora ese origen a las consultas de la web y el recorrido 3D. El Dockerfile también lo incorpora a `connect-src` en Nginx. Reconstruí la imagen web al cambiar estas variables. El healthcheck de la web responde en el puerto `8080`.

## Publicación automática desde GitHub

Conectá los repositorios institucionales mediante la GitHub App de Coolify y habilitá **Deploy on push (webhooks)** en **Advanced → Deployment → Auto deploy** para ambos recursos. En cada push a la rama configurada, Coolify reconstruye la aplicación correspondiente. Un push del backend que incluya `data/knowledge.json` empaqueta ese mismo archivo y deja su huella en `/api/ready`. [Auto Deploy de GitHub en Coolify](https://coolify.io/docs/applications/sources/github/auto-deploy)

Editá los datos canónicos del Geoparque en el sitio. Cuando esas ediciones cambien lo que responde Serrana, regenerá el archivo con `npm run serrana:knowledge` y versioná el resultado con la API. Si ya están en dos repositorios, desde el de la web ejecutá `npm run serrana:knowledge -- --backend ../serrana-backend`. El chequeo de sincronización acepta el mismo argumento con `npm run serrana:knowledge:check -- --backend ../serrana-backend`. [Mantenimiento del catálogo](serrana.md#actualización-del-catálogo)

## Verificación después del despliegue

Desde el repositorio web, ejecutá la comprobación con ambos dominios reales.

```sh
npm run check:coolify -- --web https://manantialesserranos.uy --api https://serrana-api.example
```

El comando comprueba `/health`, `/api/ready`, la guía Markdown, un `404` real, la política de conexión del sitio, el preflight permitido y rechazado, y el saludo por el endpoint del chat. Agregá `--catalog backend/data/knowledge.json` para cotejar la huella desplegada con un archivo local. Si los repositorios están separados, indicá la ruta al `data/knowledge.json` del repositorio de la API. Terminá probando una consulta con fuentes desde `/inicio/` y `/experiencia/`.

| Resultado                                                     | Qué revisar                                                                                     |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Docker indica que falta `data/knowledge.json`                 | El contexto de la API y que el archivo forme parte del commit desplegado.                       |
| La validación del catálogo falla                              | El detalle del build, el exportador y la sincronización con los datos canónicos.                |
| `/api/ready` devuelve `PROVIDER_NOT_CONFIGURED`               | `OLLAMA_API_KEY`, `OLLAMA_HOST` y `OLLAMA_MODEL` en Runtime de la API.                          |
| El preflight devuelve `403` desde la web                      | El esquema, dominio y puerto exactos del sitio en `CORS_ORIGINS`.                               |
| El navegador bloquea la conexión por CSP o usa el proxy local | `PUBLIC_SERRANA_API_BASE` en Buildtime y el último build de la web.                             |
| Readiness devuelve `200` y una pregunta real falla            | La autorización de la clave y del modelo en Ollama y el código del error en los logs de la API. |

## Ambos servicios con Compose

Para probarlos juntos, creá `.env` y `backend/.env` a partir de sus plantillas y configurá la clave local en `backend/.env`. En la configuración de la web, ajustá `SITE_URL` a `http://localhost:8080` si usás ese puerto. Ejecutá desde la raíz.

```sh
docker compose --env-file .env --env-file backend/.env up --build -d
docker compose --env-file .env --env-file backend/.env ps
docker compose --env-file .env --env-file backend/.env exec -T backend wget -qO- http://127.0.0.1:4319/api/ready
```

Abrí `http://localhost:8080/`. Nginx reenvía `/api/serrana/chat` al backend por la red interna. Si cambiás `HOST_PORT`, incluí en `CORS_ORIGINS` el origen del navegador con ese puerto. Si usás un recurso **Docker Compose** en Coolify, seleccioná `compose.yaml`, asigná el dominio al servicio `web` en el puerto `8080` y configurá `SITE_URL`, `SITE_INDEXABLE`, `NODE_ENV=production`, `CORS_ORIGINS` y las variables de Ollama en ese recurso. El destino del chat en este modo es el proxy del sitio.

Nginx actualiza la dirección interna del servicio cuando se reemplaza el contenedor de la API. [DNS de Docker](https://docs.docker.com/engine/network/#dns-services)

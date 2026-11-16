# Despliegue del Geoparque y Serrana

La web Astro y Serrana se despliegan en dos aplicaciones Dockerfile. La API deriva del [backend institucional de Gianna Turismo](https://github.com/IntendenciaDeLavalleja/demo-pagina-turismo-idl-backend/tree/b60895f6f1421c9f57f29db6fcb0c9c1d211a106).

| Aplicación        | Contexto en este repositorio | Contexto en repositorio independiente | Puerto interno | Healthcheck      |
| ----------------- | ---------------------------- | ------------------------------------- | -------------- | ---------------- |
| Web Astro y Nginx | `/`                          | `/`                                   | `8080`         | `GET /health`    |
| API Serrana       | `/backend`                   | `/`                                   | `5000`         | `GET /api/ready` |

En ambos recursos, la ubicación del Dockerfile es `/Dockerfile` relativa al contexto.

## Backend

En runtime configurá las variables de [backend/.env.example](../backend/.env.example). `CORS_ORIGINS` contiene los orígenes HTTPS exactos de la web. La clave de Ollama es un secreto del backend. El Dockerfile usa Python 3.12, Flask y Waitress, y trabaja con CPU x86-64 con AVX2 para los modelos ONNX.

Usá un volumen exclusivo en `/app/storage` para Qdrant embebido. La base SQLite y los fragmentos se generan en el build desde `data/knowledge.json`. Si el volumen arranca vacío o contiene un índice incompatible, Serrana vuelve a indexar al iniciar. En un bind mount, asegurate de que UID y GID 10001 puedan escribir. `/api/ready` verifica el estado del índice y del catálogo cargado. [Operación de la API](../backend/README.md)

## Frontend

Configurá `SITE_URL`, `SITE_INDEXABLE` y `PUBLIC_SERRANA_API_BASE` en **Buildtime**. `PUBLIC_SERRANA_API_BASE` usa el dominio HTTPS de la API, sin `/api` ni barra final. Se incorpora tanto al cliente del chat como a la política CSP de Nginx. Reconstruí la web si cambia el dominio de la API.

## Despliegue automático y comprobación

Conectá cada recurso al repositorio y a la rama que corresponda. Habilitá [Deploy on push en Coolify](https://coolify.io/docs/applications/sources/github/auto-deploy). Cada build de la API incorpora el catálogo de su commit.

```sh
npm run check:coolify -- --web https://manantialesserranos.uy --api https://serrana-api.example --catalog backend/data/knowledge.json
```

Reemplazá el dominio de ejemplo y usá la ruta al catálogo que corresponde al commit desplegado. El comando verifica healthchecks, 404, CSP, CORS, el saludo y la huella del catálogo. Probá después una consulta documentada en la web y en el recorrido 3D para confirmar la conexión con Ollama.

## Compose local

Creá `.env` desde la plantilla de la web, y `backend/.env` desde `backend/.env.local.example`. Si Ollama local corre en el host, para Docker Desktop usá `OLLAMA_HOST=http://host.docker.internal:11434`. Para Ollama Cloud usá su URL HTTPS y la clave de runtime.

```sh
docker compose --env-file .env --env-file backend/.env up --build -d
docker compose --env-file .env --env-file backend/.env logs -f backend
```

Abrí `http://localhost:8080/`. Nginx reenvía el chat al backend en la red interna. Si cambiás `HOST_PORT`, actualizá `CORS_ORIGINS` con el puerto del navegador.

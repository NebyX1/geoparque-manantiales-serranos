# API de Serrana

Servicio de orientación del Geoparque Manantiales Serranos. Recibe el mensaje, el historial reciente y, opcionalmente, el ID de una ficha por `POST /api/serrana/chat`. Devuelve respuestas y fuentes en NDJSON. Este directorio contiene todo lo necesario para instalar, probar y construir la API como repositorio independiente.

## Desarrollo

Usá Node 22.22.3 o posterior de la rama 22. Desde la raíz de la API, copiá `.env.example` a `.env`. Cargá `OLLAMA_API_KEY` para Ollama Cloud y agregá en `CORS_ORIGINS` el origen exacto del frontend.

```sh
npm ci
npm run dev
```

En local, la API escucha en `127.0.0.1:4319`. `npm run verify` compila, valida el catálogo y ejecuta las pruebas unitarias con respuestas controladas del proveedor. `node scripts/evaluate-serrana.mjs --list` enumera los casos de evaluación. Ejecutá ese script contra el servidor local iniciado para evaluar respuestas reales con el proveedor configurado.

## Docker y Coolify

Construí con esta carpeta como contexto de Docker. El siguiente ejemplo usa el `.env` local y expone la API en loopback del host.

```sh
docker build -t serrana-backend .
docker run --rm --env-file .env -e HOST=0.0.0.0 -p 127.0.0.1:4319:4319 serrana-backend
```

En Coolify creá una aplicación con **Dockerfile**, puerto interno `4319` y healthcheck `GET /api/ready`. Usá Base Directory `/` para el repositorio independiente, o `/backend` si la API está dentro del repositorio web. La ubicación del Dockerfile es `/Dockerfile` relativa a ese contexto. La imagen ejecuta Node como usuario sin privilegios y escucha en `0.0.0.0:4319`.

| Variable de runtime           | Valor o formato                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `CORS_ORIGINS`                | Orígenes HTTPS exactos del frontend, separados por comas y sin barra final. Requerida en producción.   |
| `OLLAMA_API_KEY`              | Secreto requerido por Ollama Cloud. Activá Runtime y desactivá Buildtime para esta variable.           |
| `OLLAMA_HOST`                 | `https://ollama.com` por defecto. `OLLAMA_BASE_URL` funciona como alias si `OLLAMA_HOST` está vacío.   |
| `OLLAMA_MODEL`                | `deepseek-v4.1-flash` por defecto.                                                                     |
| `SERRANA_REQUESTS_PER_MINUTE` | `30` por defecto por instancia, ajustable hasta `300`. Hay cuatro consultas simultáneas por instancia. |
| `NODE_ENV`, `HOST`, `PORT`    | La imagen ya configura `production`, `0.0.0.0` y `4319`.                                               |

Asigná un dominio HTTPS a la API. Configurá ese origen como `PUBLIC_SERRANA_API_BASE` de build en el recurso web y desplegá el frontend. Para desplegar con cada push de la rama configurada, conectá el repositorio con la GitHub App y seleccioná **Deploy on push (webhooks)**. [Auto Deploy en Coolify](https://coolify.io/docs/applications/sources/github/auto-deploy)

## Catálogo en cada despliegue

`data/knowledge.json` forma parte del repositorio. Contiene los documentos de búsqueda, las fuentes y las fichas de visita de Serrana. `npm run build` valida el manifiesto, las referencias, la unicidad de las fichas y la construcción del índice. Docker copia ese mismo catálogo a la imagen y el índice se crea en memoria en cada arranque. Un redeploy carga la base incluida en el commit, incluso en un servidor nuevo.

Al editar los datos canónicos, desde el repositorio web ejecutá `npm run serrana:knowledge -- --backend ../serrana-backend` con la ruta real a esta API. Verificá con `npm run serrana:knowledge:check -- --backend ../serrana-backend` y versioná aquí el resultado. Si ambas carpetas comparten repositorio, ejecutá los comandos desde la raíz web y omití `--backend`. Las reglas de orientación de visitas viven en `src/visit-catalog.ts`.

## Comprobación de la API

`GET /api/ready` devuelve `200` con `status: ready` y `catalog`. Ese objeto incluye la versión de esquema, la fecha de revisión, las cantidades de documentos, fichas y fuentes, y la huella SHA-256 del archivo cargado. Comparala con la huella impresa en el build. Si responde `503 PROVIDER_NOT_CONFIGURED`, revisá las variables de Ollama en el entorno de la API.

El chequeo de salud comprueba configuración local y catálogo. Para verificar la autorización de la clave y la disponibilidad del modelo, hacé una consulta real desde el frontend. Los errores de consulta se registran por código, estado HTTP y duración.

## Contrato del chat

Enviá un `POST /api/serrana/chat` con `Content-Type: application/json`. `history` es opcional y contiene turnos con `role` igual a `user` o `assistant` y un `content` de texto. `context.placeId` permite asociar la pregunta a una ficha. El frontend envía el origen automáticamente y puede cancelar la consulta al cerrar el diálogo.

```json
{
  "message": "¿Qué rocas puedo observar acá?",
  "history": [],
  "context": { "placeId": 1 }
}
```

Cada línea de la respuesta exitosa es un objeto JSON. Los eventos `delta` llevan `text` y `done` lleva `sources`, una lista de pares `title` y `url`. Las rutas de fichas que empiezan con `/` se abren en el frontend. Si se interrumpe una respuesta ya iniciada, el evento `error` contiene el mensaje visible. Un error antes de iniciar la transmisión devuelve un estado HTTP y un objeto JSON con `error`.

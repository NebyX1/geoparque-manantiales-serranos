# Serrana · API del Geoparque

Serrana es una adaptación del backend institucional de Gianna Turismo, revisión [b60895f](https://github.com/IntendenciaDeLavalleja/demo-pagina-turismo-idl-backend/tree/b60895f6f1421c9f57f29db6fcb0c9c1d211a106). Usa Python 3.12, Flask y Waitress. La búsqueda combina SQLite FTS5 con Qdrant embebido y embeddings Granite multilingües. mMARCO reordena la evidencia. Ambos modelos de recuperación se ejecutan con ONNX Runtime en CPU x86-64 con AVX2.

## Docker y Coolify

Construí esta carpeta con su Dockerfile. En Coolify elegí Base Directory `/backend` si compartís repositorio con la web, o `/` si publicás esta carpeta como repositorio propio. Usá el puerto `5000` y `GET /api/ready`. El contenedor ejecuta como UID 10001.

- Configurá `CORS_ORIGINS` con el origen HTTPS exacto de la web, sin barra final. Separá varios orígenes con comas.
- Configurá `OLLAMA_HOST`, `OLLAMA_MODEL` y el secreto `OLLAMA_API_KEY` en runtime de la API. La plantilla de producción es [.env.example](.env.example).
- Montá un volumen dedicado en `/app/storage` para reutilizar el índice Qdrant entre deploys. Un volumen nuevo se inicializa al arrancar. Para un bind mount, el directorio debe ser escribible por UID y GID 10001. Usá un volumen por instancia de Qdrant embebido.

El build genera SQLite y los fragmentos a partir de `data/knowledge.json`. También prepara los modelos ONNX fijados por revisión y SHA-256. Al arrancar, el backend comprueba las firmas del índice y lo reconstruye si cambia el corpus o la configuración de embeddings. `/api/ready` informa el catálogo cargado y sólo está listo cuando el índice coincide y los modelos están calentados. El chequeo no hace consultas a Ollama.

## Desarrollo y verificación

Desde esta carpeta, con Python 3.12 y las variables de [.env.local.example](.env.local.example) en `.env`:

```sh
python -m pip install -r backend/requirements-lock.txt
python scripts/ingest.py
python scripts/prepare_models.py
python -m backend.app.main
```

La API usa `127.0.0.1:5000` en local. `python -m unittest discover -s scripts -p 'test_serrana_*.py'` ejecuta las pruebas del adaptador y del router con proveedor simulado. `node scripts/evaluate-serrana.mjs --list` enumera los casos de diálogo.

## Conexión con el Geoparque

El contrato nativo `POST /api/ask-text` usa `question`. El adaptador `POST /api/serrana/chat` admite `message`, `history` y `context.placeId`. Llama al mismo motor y devuelve NDJSON con eventos `delta` y `done`, que la interfaz Astro usa para mostrar la respuesta y las fuentes. Cada consulta del adaptador usa el historial reciente de su pestaña.

El router de Gianna evalúa el alcance y la seguridad antes de recuperar evidencia. Serrana opera con el catálogo documental del Geoparque. Para actualizarlo, exportá `data/knowledge.json` desde la web con `npm run serrana:knowledge`. En checkouts separados, usá `npm run serrana:knowledge -- --backend ../serrana-backend` con la ruta real de la API. Incorporá el archivo exportado al commit de la API.

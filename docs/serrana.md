# Serrana

Serrana es la guía conversacional de Manantiales Serranos. Está disponible en las páginas del sitio y durante la experiencia inmersiva. En una ficha puede recibir el identificador del lugar para contextualizar preguntas como «¿qué rocas se ven acá?».

El catálogo de consulta reúne las 61 fichas del atlas, historias, recorridos, propuestas didácticas y referencias normativas. La ruta `/serrana/guia.md` publica los mismos documentos y fuentes. Los títulos, alias y temas permiten buscar evidencia antes de generar una respuesta. El servidor envía al modelo sólo los pasajes seleccionados, la consulta y el historial reciente. Valida los marcadores de cita y genera los enlaces desde el catálogo.

La API parte del código institucional de Gianna Turismo. Usa Python, Flask, Waitress, SQLite FTS5, Qdrant y los modelos ONNX Granite y mMARCO. El [código institucional](https://github.com/IntendenciaDeLavalleja/demo-pagina-turismo-idl-backend/tree/b60895f6f1421c9f57f29db6fcb0c9c1d211a106) fija la revisión de origen. El repositorio de Turismo aporta el [retrato que anima Serrana](https://github.com/NebyX1/nueva-web-turismo-idl/blob/346a8a770d68120af7263f962a42399930e93b7c/public/media/137ff3d8d4cde96e.png).

Las referencias normativas identifican la autoridad, la actividad y el ámbito de cada instrumento. El bloque explica las directrices UNESCO, los convenios internacionales, las leyes nacionales y las medidas específicas de Lavalleja y del Parque Nacional Arequita. Los permisos y las excepciones de un sitio se consultan en la fuente oficial que corresponde a ese sitio.

Para orientar visitas, Serrana selecciona fichas del atlas por zona, interés y condiciones documentadas. El modelo evalúa el pedido completo antes de que el servicio muestre la selección. Cada parada incluye qué observar, una indicación práctica y el enlace a su ficha. La orientación distingue una salida por el entorno de una actividad que requiere coordinación.

## Desarrollo

En la API, copiá `.env.local.example` a `.env` y seguí las instrucciones de instalación para Python 3.12. Para Ollama Cloud usá `https://ollama.com` y la clave en la API. [Instalación del backend](../backend/README.md)

```sh
cd backend
python scripts/ingest.py
python -m backend.app.main
```

En otra terminal, ejecutá `npm run dev` en la raíz web. Astro reenvía el chat a `http://127.0.0.1:5000` en desarrollo y preview. Para una conexión directa desde el navegador, configurá `PUBLIC_SERRANA_API_BASE` con el origen de la API y agregá el origen de la web a `CORS_ORIGINS` en el backend.

El historial permanece en memoria de la pestaña y se puede borrar desde el panel. El avatar anima la boca durante la escritura del texto.

## Operación

La ruta `POST /api/serrana/chat` adapta el contrato nativo `/api/ask-text` a JSON delimitado por líneas. Gianna evalúa seguridad y alcance antes de buscar evidencia. La interfaz puede interrumpir la espera de la respuesta. Waitress usa cuatro hilos y ambos endpoints del chat comparten el límite `SERRANA_REQUESTS_PER_MINUTE`, con 30 consultas por minuto por defecto.

En producción, el sitio y la API se despliegan por separado. El backend valida el origen de las solicitudes del navegador con `CORS_ORIGINS` y mantiene sus límites por instancia para todos los clientes. `GET /api/ready` informa el catálogo cargado y si está presente la configuración del proveedor. [Despliegue y diagnóstico en Coolify](deployment-coolify.md)

## Actualización del catálogo

El sitio genera `/serrana/guia.md` desde `src/lib/serrana-knowledge.ts`, las fichas canónicas y las fuentes de `src/data/serrana/`. De esos mismos datos se deriva el catálogo de API `backend/data/knowledge.json`. Ajustá la fecha del manifiesto en `src/lib/serrana-knowledge.ts` al completar una nueva revisión documental.

```sh
npm run serrana:knowledge
npm run serrana:knowledge:check
```

Cuando cambien las fichas, los relatos o las fuentes, exportá y versioná el resultado con la API. Con repositorios separados, pasá `-- --backend ../serrana-backend` a ambos comandos desde la raíz web y usá la ruta real al checkout del backend.

En cada deploy, la ingesta de Gianna genera SQLite FTS5 y los fragmentos a partir del catálogo versionado. Al arrancar se carga el índice Qdrant o se reconstruye si cambia su firma. La huella SHA-256 de `/api/ready` se puede comparar con la del archivo mediante `npm run check:coolify` y `--catalog`.

## Evaluación

El corpus de evaluación incluye 261 consultas sintéticas en 26 categorías. Cada caso declara el comportamiento esperado, el criterio de revisión y las comprobaciones automáticas pertinentes. Los informes conservan la respuesta visible, las fuentes, la latencia y las comprobaciones que discrepan. La revisión humana verifica si la respuesta atendió la consulta y si sus afirmaciones están respaldadas.

Con el proveedor configurado en el entorno del backend, iniciá la API y ejecutá el evaluador desde su directorio. `--list` permite revisar la selección antes de consultar el servicio.

```sh
node scripts/evaluate-serrana.mjs --list
node scripts/evaluate-serrana.mjs --endpoint http://127.0.0.1:5000/api/serrana/chat --jobs 3 --rpm 24
```

Los resultados se guardan en `reports/experience-review/serrana-qa/responses`. `--resume` continúa con los casos pendientes y repite errores técnicos. Para evaluar una revisión nueva del motor, elegir un directorio distinto con `--out`.

El corpus `tests/evaluation/serrana-visits-cases.mjs` agrega consultas sobre recomendaciones, recorridos, intereses, ubicación, accesos y continuidad. Usá `--input tests/evaluation/serrana-visits-cases.mjs` para ejecutarlo. Además de los patrones, revisá que la respuesta proponga lugares distintos, explique cada elección y cite su ficha.

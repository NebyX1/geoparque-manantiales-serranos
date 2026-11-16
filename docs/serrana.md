# Serrana

Serrana es la guía conversacional de Manantiales Serranos. Está disponible en las páginas del sitio y durante la experiencia inmersiva. En una ficha puede recibir el identificador del lugar para contextualizar preguntas como «¿qué rocas se ven acá?».

El catálogo de consulta reúne las 61 fichas del atlas, historias, recorridos, propuestas didácticas y referencias normativas. La ruta `/serrana/guia.md` publica los mismos documentos y fuentes. Los títulos, alias y temas permiten buscar evidencia antes de generar una respuesta. El servidor envía al modelo sólo los pasajes seleccionados, la consulta y el historial reciente. Valida los marcadores de cita y genera los enlaces desde el catálogo.

La estructura de catálogo, evidencias, alias y referencias se adaptó de [Gianna Turismo](https://github.com/NebyX1/nueva-web-turismo-idl/tree/346a8a770d68120af7263f962a42399930e93b7c/gianna-backend). El índice se construye en memoria con el corpus exclusivo del Geoparque. El repositorio de Turismo también aporta el [retrato que anima Serrana](https://github.com/NebyX1/nueva-web-turismo-idl/blob/346a8a770d68120af7263f962a42399930e93b7c/public/media/137ff3d8d4cde96e.png).

Las referencias normativas identifican la autoridad, la actividad y el ámbito de cada instrumento. El bloque explica las directrices UNESCO, los convenios internacionales, las leyes nacionales y las medidas específicas de Lavalleja y del Parque Nacional Arequita. Los permisos y las excepciones de un sitio se consultan en la fuente oficial que corresponde a ese sitio.

Para orientar visitas, Serrana selecciona fichas del atlas por zona, interés y condiciones documentadas. El modelo evalúa el pedido completo antes de que el servicio muestre la selección. Cada parada incluye qué observar, una indicación práctica y el enlace a su ficha. La orientación distingue una salida por el entorno de una actividad que requiere coordinación.

## Desarrollo

Copiá la plantilla `.env.example` de la API a `.env` dentro del directorio de la API y configurá allí `OLLAMA_API_KEY`. El modelo por defecto es [`deepseek-v4.1-flash`](https://ollama.com/library/deepseek-v4.1-flash) con `https://ollama.com` como base. Si ambos proyectos están en el mismo repositorio, iniciá la API desde la raíz web.

```sh
npm --prefix backend ci
npm --prefix backend run dev
```

Si la API tiene su propio repositorio, ejecutá `npm ci` y `npm run dev` allí. En otra terminal, ejecutá `npm run dev` en la raíz web. Astro reenvía el chat a `http://127.0.0.1:4319` en desarrollo y preview. Para una conexión directa desde el navegador, configurá `PUBLIC_SERRANA_API_BASE` en el `.env` de la web con el origen de la API. Agregá el origen exacto de la web a `CORS_ORIGINS` en el entorno del backend.

El historial permanece en memoria de la pestaña y se puede borrar desde el panel. El avatar anima la boca durante la escritura del texto.

## Operación

La ruta `POST /api/serrana/chat` transmite JSON delimitado por líneas y admite cancelar la consulta. El servidor revisa la respuesta completa del modelo antes de enviar los párrafos validados. Un rechazo del modelo prevalece aunque llegue después de texto con citas. El servicio tiene un límite de cuatro solicitudes simultáneas y 30 por minuto en cada instancia. `SERRANA_REQUESTS_PER_MINUTE` permite ajustar el segundo límite hasta 300. Los errores del proveedor se registran con su categoría y duración. Las credenciales, preguntas y respuestas quedan fuera de esos registros.

En producción, el sitio y la API se despliegan por separado. El backend valida el origen de las solicitudes del navegador con `CORS_ORIGINS` y mantiene sus límites por instancia para todos los clientes. `GET /api/ready` informa el catálogo cargado y si está presente la configuración del proveedor. [Despliegue y diagnóstico en Coolify](deployment-coolify.md)

## Actualización del catálogo

El sitio genera `/serrana/guia.md` desde `src/lib/serrana-knowledge.ts`, las fichas canónicas y las fuentes de `src/data/serrana/`. De esos mismos datos se deriva el catálogo de API `backend/data/knowledge.json`. Ajustá la fecha del manifiesto en `src/lib/serrana-knowledge.ts` al completar una nueva revisión documental.

```sh
npm run serrana:knowledge
npm run serrana:knowledge:check
```

Cuando cambien las fichas, los relatos o las fuentes, exportá y versioná el resultado con la API. Con repositorios separados, pasá `-- --backend ../serrana-backend` a ambos comandos desde la raíz web y usá la ruta real al checkout del backend. Las reglas y perfiles de orientación de visitas se editan en `src/visit-catalog.ts` del backend.

En cada deploy, el Dockerfile de la API lee el catálogo versionado, valida sus documentos, IDs y referencias, y lo incluye en la imagen. Al iniciar un contenedor se construye el índice en memoria. La huella SHA-256 de `/api/ready` se puede comparar con la del build o con `npm run check:coolify` usando `--catalog`.

## Evaluación

El corpus de evaluación incluye 261 consultas sintéticas en 26 categorías. Cada caso declara el comportamiento esperado, el criterio de revisión y las comprobaciones automáticas pertinentes. Los informes conservan la respuesta visible, las fuentes, la latencia y las comprobaciones que discrepan. La revisión humana verifica si la respuesta atendió la consulta y si sus afirmaciones están respaldadas.

Con el proveedor configurado en el entorno del backend, iniciá la API y ejecutá el evaluador desde su directorio. `--list` permite revisar la selección antes de consultar el servicio.

```sh
node scripts/evaluate-serrana.mjs --list
node scripts/evaluate-serrana.mjs --endpoint http://127.0.0.1:4319/api/serrana/chat --jobs 3 --rpm 24
```

Los resultados se guardan en `reports/experience-review/serrana-qa/responses`. `--resume` continúa con los casos pendientes y repite errores técnicos. Para evaluar una revisión nueva del motor, elegir un directorio distinto con `--out`.

El corpus `tests/evaluation/serrana-visits-cases.mjs` agrega consultas sobre recomendaciones, recorridos, intereses, ubicación, accesos y continuidad. Usá `--input tests/evaluation/serrana-visits-cases.mjs` para ejecutarlo. Además de los patrones, revisá que la respuesta proponga lugares distintos, explique cada elección y cite su ficha.

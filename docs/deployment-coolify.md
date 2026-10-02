# Despliegue en Coolify

## Recurso

1. Subir este proyecto a un repositorio Git y conectarlo a Coolify.
2. Crear un recurso **Application**, seleccionar el repositorio y elegir build pack **Dockerfile**.
3. Configurar directorio base `/`, Dockerfile `/Dockerfile` y puerto interno **8080**.
4. Asignar el dominio HTTPS que corresponda al Geoparque. El prototipo incluye `https://manantialesserranos.uy/`; confirmar que su DNS apunta al servidor de Coolify.
5. Configurar como variables disponibles durante **build**: `SITE_URL=https://manantialesserranos.uy` y `SITE_INDEXABLE=true`. Para staging, usar su propia URL y `SITE_INDEXABLE=false`.
6. Configurar healthcheck HTTP `GET /health`, puerto 8080, intervalo 30 s, timeout 3 s y tres reintentos; también existe HEALTHCHECK en la imagen.
7. Desplegar. El proxy de Coolify termina TLS y reenvía al puerto interno 8080. No hace falta volumen, base de datos ni servidor Node en runtime.

Cambiar dominio/indexación exige reconstruir. Una variable de runtime no cambia el HTML, canonical, robots ni sitemap ya generados.

## Verificación

```sh
curl -i https://manantialesserranos.uy/health
curl -I https://manantialesserranos.uy/lugares/cerro-arequita/
curl -I https://manantialesserranos.uy/historias/agua/
curl -I https://manantialesserranos.uy/circuitos/arequita/
curl -I https://manantialesserranos.uy/ruta-inexistente/
```

Esperado: 200 con cuerpo `ok` en health; 200 en rutas; 404 real en la última. Revisar canonical HTTPS del dominio elegido, ausencia de noindex en producción, robots, llms, guía Markdown y sitemap. Los recursos `/_astro/` llevan cache immutable de un año; HTML y documentos deben revalidar.

## Prueba local equivalente

```sh
docker build --build-arg SITE_URL=https://manantialesserranos.uy --build-arg SITE_INDEXABLE=true -t manantiales-serranos:validation .
docker run -d --name geoparque-validation -p 8088:8080 manantiales-serranos:validation
node scripts/check-container.mjs
```

Alternativa Compose: fijar `SITE_URL`, `SITE_INDEXABLE=true`, `HOST_PORT=8080`, luego `docker compose up --build -d`. Para retirar solamente el contenedor de prueba: `docker stop geoparque-validation` y `docker rm geoparque-validation`.

La imagen usa `nginxinc/nginx-unprivileged:1.29.4-alpine3.23`, UID 101, con headers de seguridad y gzip. La CSP permite inline necesario para Astro y estilos del prototipo, sin `unsafe-eval` ni orígenes comodín. El HTML original, archivos de trabajo, tests y documentación nunca se copian a la carpeta servida.

No se realizó publicación remota ni modificación DNS desde este entorno. Quedan esas acciones de infraestructura en la instancia y dominio reales del propietario.

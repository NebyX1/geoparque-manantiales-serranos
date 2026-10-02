# Migración

El HTML original se auditó antes de modificar el proyecto. Se inventariaron secciones, overlays, controladores, responsive, 61 fichas, ocho historias, tres circuitos, cuatro slides del hero, cuatro capítulos geológicos, ocho puntos del mapa y doce entradas de galería. El inventario detallado está en `migration-inventory.md`.

Los tests comparan todos los campos originales de las fichas, relatos y circuitos con los datos TypeScript. Las fichas conservan todos sus bloques y URLs; cada una tiene HTML directo y Markdown. Las rutas editoriales sustituyen navegación por hashes de fichas, preservando las anclas de secciones de home. El diseño de cada sección procede del markup y la cascada originales.

## Cambios y correcciones

- Las imágenes base64 se extrajeron a archivos locales y se optimizan en build. Se preservan originales, composición, alt contextual y captions.
- El hero dimensiona sus variantes según la altura y el ancho de su recorte. Usar solamente `100vw` descargaba una fotografía demasiado pequeña en móviles y la ampliaba al cubrir una portada vertical. La resolución nativa se incluye en el srcset y la comprobación E2E decodifica la imagen elegida para verificar sus píxeles reales.
- La tipografía remota se reemplazó por los mismos tipos y pesos locales. El servidor de comparación también usa esos archivos para evitar diferencias causadas por red.
- El preview del mapa actualiza un enlace real y elimina el srcset anterior al seleccionar otra foto; mantenerlo hacía que el navegador siguiera mostrando la imagen inicial.
- Los controladores registran recursos por página y hacen cleanup en las transiciones; no acumulan listeners ni timers. El contador del viaje deja de escribir dentro de las islas React.
- Safari no enfoca automáticamente todos los botones al hacer clic. Los diálogos recuerdan explícitamente el disparador y restauran foco después de cerrarse.
- La actualización de la fecha no reconstruye el diálogo del viaje antes de recibir el clic en exportar, evitando que Safari pierda ese clic.
- La integración React 7.0.0 programaba un render redundante inmediatamente después de `hydrateRoot`, ocasionando #424 con React 19.3.0. Un adaptador Vite probado elimina ese render redundante, completa el primer commit con `flushSync` y conserva actualizaciones y unmount. Así la navegación rápida no desmonta una raíz todavía sin hidratar. No se modificó node_modules ni se silenció el error.
- Los números pequeños del menú y mapa, textos secundarios y texto del planificador tenían contraste insuficiente. Se conservaron las familias cromáticas y se oscurecieron sólo esos tonos; la cuarta escena geológica tiene un fondo ligeramente más oscuro para contraste AA.
- El enlace fijo de volver al inicio queda dentro del landmark footer sin cambiar su posición visual.
- Las fichas y capítulos permanecen visibles sin JavaScript. Las acciones que requieren JS se ocultan y la guía tiene un enlace de descarga nativo.
- La búsqueda comparte el índice y la normalización probados; incluye región y modalidad de visita, además de nombre, categoría, temas y bloques.
- `trailingSlash: ignore` permite que Astro preview sirva `/health` exactamente; las rutas editoriales y canonical siguen usando barra final. Nginx tiene su endpoint de salud explícito.

## Referencias históricas

El HTML canónico permanece intacto en la raíz y queda fuera de dist/Docker. Los generadores empleados durante la extracción inicial se archivaron en `docs/reference/migration-tools/`. Son históricos: volver a ejecutarlos sobrescribiría mejoras posteriores. Para mantener el proyecto, editar las fuentes actuales y verificar paridad con screenshots.

La foto inicial del hero ofrece AVIF con fallback WebP. En móvil se generan recortes que excluyen sólo columnas no visibles y conservan exactamente los píxeles y el encuadre originales; así no se necesita descargar toda la fotografía horizontal para mostrar una portada vertical nítida. Las otras fotos se cargan al activarse, conservando crossfade y temporizador. Montserrat variable conserva familia y pesos con menos descargas. El contador del viaje usa Astro y Nano Stores para evitar cargar React antes de necesitar una isla.

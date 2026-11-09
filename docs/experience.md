# Experiencia inmersiva

La raíz `/` permite elegir entre el sitio editorial existente (`/inicio/`) y el recorrido con Three.js (`/experiencia/`). Astro sigue generando el HTML de todas las rutas. React conserva su alcance en favoritos y planificador.

El documento 3D usa navegación nativa al entrar y salir: las transiciones visuales de páginas quedan fuera de ese límite para evitar bloqueos al capturar una escena WebGL. Al salir se liberan los recursos; si el navegador recupera el documento desde su caché de navegación, se crea un canvas nuevo y se reinicia el lifecycle antes de habilitar el recorrido.

## Paisaje e información

El suelo completo se recorta con el límite oficial de IDE Uruguay. El relieve utiliza elevaciones Mapzen/Tilezen con exageración vertical 6×; cauces y rutas se derivan de cartografía vectorial IDE. La vegetación y la escala de las miniaturas son escénicas. Estos datos no certifican entradas o recorridos autorizados. Detalles y procedencia en `territory-world.md`.

Los 47 puntos próximos se organizan en ocho casas virtuales con arquitecturas distintas. Sus anclas se separan al menos 26 unidades para que las casas no se superpongan; todos los pines reales permanecen intactos. Los interiores tienen 24 unidades entre exposiciones y un portal de salida. La información de zona y de cada miembro deriva del catálogo canónico. E, Accionar, clic o atravesar la puerta permiten entrar/salir; el botón «Salir de la casa» siempre permite regresar. M o «Ver territorio» muestra el contorno completo desde arriba.

Las 61 fichas se derivan de `src/data/geosites.ts`. No hay una segunda colección editorial. `src/data/geography.ts` cruza los IDs con sus fuentes geográficas: 51 documentadas y 10 aproximadas. El Valle del Hilo de la Vida se referencia mediante la posada publicada en un portal turístico, no mediante las estructuras arqueológicas; el Museo de Miniaturas usa el domicilio publicado por el MEC y geolocalizado por IDE/SUDIR. Estas limitaciones aparecen en las fichas. Si falta una ubicación en el inventario, se conserva la ficha y la miniatura de estudio sin fabricar una baliza. El mapa del directorio muestra el contorno real, permite ampliar Minas y enlaza cada ubicación a su fuente y al mapa base. Ver [procedencia y precisión](geography.md).

Las ventanas muestran nombre, categoría, fotografía, resumen, introducción y condiciones de visita canónicos, con acceso a la ficha completa y al contacto documentado cuando existe. Las fotografías de contexto están identificadas. Las fichas abiertas y el contador de descubrimientos duran sólo durante el recorrido actual; no modifican favoritos ni el itinerario guardado.

## Controles

| Acción                     | Control                                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caminar                    | WASD o flechas; botones táctiles en móvil                                                                                                                  |
| Correr                     | Shift mientras se camina                                                                                                                                   |
| Saltar                     | Espacio                                                                                                                                                    |
| Girar la cámara            | Arrastrar sobre el paisaje, Q o R                                                                                                                          |
| Acercar o alejar la cámara | Rueda del mouse                                                                                                                                            |
| Abrir información          | E, Accionar o clic izquierdo en una baliza; el clic en el paisaje también acciona el lugar cercano                                                         |
| Elegir otro lugar          | Lugares → buscar → botón Explorar                                                                                                                          |
| Ver una miniatura          | Botón Ver miniatura 3D en la ficha; minimiza las ventanas y acerca la cámara. Arrastrar gira la vista; Volver a caminar, Esc o WASD recuperan al personaje |
| Mover una ventana          | Arrastrar su encabezado o enfocarlo y usar flechas; Shift amplía el paso; Inicio la recoloca                                                               |
| Minimizar y recuperar      | Botón de minimizar y barra de fichas minimizadas                                                                                                           |
| Cerrar                     | Botón de cerrar o Escape para la ficha del frente                                                                                                          |

La vista cercana aísla la miniatura del paisaje artístico sobre una retícula holográfica, ajusta la cámara para modelos altos y pantallas verticales, y oculta el dock. En el paseo, el dock tiene altura limitada y desplazamiento para conservar el acceso a las fichas.

Shift + clic sobre la geometría enfoca un detalle real de la miniatura; la rueda permite aproximarse y «Vista completa» restaura el encuadre. Esto permite examinar la construcción de la cima del Cerro del Cura sin agrandar su proporción respecto de la ladera.

Las ventanas son independientes y admiten varias fichas abiertas, cambio de orden y redimensión en escritorio. El movimiento se limpia al abrir controles o fichas, perder foco, cambiar de pestaña o pausar. Escribir en un buscador o usar controles no mueve al personaje.

## Carga, rendimiento y recuperación

- Three.js se importa dinámicamente únicamente al entrar en la experiencia. El portal y el sitio editorial no descargan el motor 3D.
- Vegetación instanciada, DPR acotado y reducción adaptativa de resolución. Las miniaturas se sirven localmente: 12 adaptadas del proyecto turístico y 49 nuevas construidas por lugar con referencias. Un archivo fallido se informa sin sustituirlo por un arquetipo genérico. Se conserva una miniatura seleccionada y hasta dos vistas próximas del interior; las cargas se serializan y las respuestas obsoletas se liberan. Al salir de una casa se eliminan todos sus modelos y recursos. No se descargan tiles ni se llama a proveedores de IA durante el recorrido.
- La animación usa el contexto RAF de `src/features/site/lifecycle.js`; al cambiar de ruta se abortan los eventos y se liberan ventanas, observadores, audio, geometrías, materiales, texturas y contexto WebGL.
- Al leer fichas o abrir el directorio se conserva el último fotograma y sólo se redibuja al cambiar el modelo o la vista. Las sombras se reutilizan cuando los objetos están quietos. Al ocultar la pestaña se suspenden las actualizaciones visuales y se silencia el ambiente. Pausar detiene el recorrido. `prefers-reduced-motion` suprime el movimiento ambiental y el balanceo de cámara/personaje opcional.
- El sonido ambiental se sintetiza localmente y comienza sólo al activar Sonido.
- Un fallo de carga, inicialización, renderizado o pérdida de contexto muestra una alternativa explícita. Las fichas siguen disponibles desde el directorio y sus enlaces HTML; sin JavaScript también se muestran esos enlaces.
- No se utiliza una raíz React global, fallback SPA ni almacenamiento nuevo en localStorage.

Los límites de resolución y la calidad adaptativa son mecanismos implementados, no una garantía de FPS en cualquier equipo. Las pruebas automatizadas de WebGL no sustituyen la evaluación en teléfonos físicos.

## Verificación

`npm run verify` incluye pruebas del portal, sitio anterior, las 61 fichas, ventanas múltiples, movimiento, pausa, teclado, clic izquierdo, fallo WebGL, navegación repetida y accesibilidad en Chromium/WebKit. Las capturas de ambas entradas y de la experiencia cubren 320–1920 px, pantalla baja, landscape y viewport equivalente a zoom de 200%.

Playwright limita sus workers a dos porque las escenas de WebGL comparten recursos gráficos. Ejecutar una sola suite por vez en los puertos 4321 y 4323. Las capturas se generan en `test-results/experience-visual/`; el prototipo histórico sigue comparándose con `/inicio/`.

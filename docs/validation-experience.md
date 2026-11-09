# Validación de la experiencia inmersiva

Fecha de trabajo: 8 de noviembre de 2026. Entorno: Windows, Node 22.22.3 y dependencias fijadas en el lockfile. Este registro corresponde al territorio oficial, las ocho casas virtuales y las 49 miniaturas reconstruidas. Sustituye el registro anterior de 24 pruebas unitarias, 81 páginas y 58 pruebas de navegador.

## Estado de la entrega

La entrega tiene tres capas de validación aprobadas: **geometría de los 49 modelos nuevos**, **presentación Three de los 61 IDs en dos vistas de escritorio y 18 capturas de pantalla reducida**, y **ejecución completa de `npm run verify`**. Los 49 GLB servidos coinciden con las huellas de geometría aceptadas. La aprobación corresponde a esos archivos y al código revisado, no a cambios posteriores. El estado `ready` no se utilizó como sustituto de la comparación visual independiente.

La ejecución final completa de `npm run verify`, después del ajuste de encuadre, terminó con código 0:

| Comprobación                 | Última ejecución completa           |
| ---------------------------- | ----------------------------------- |
| Astro / TypeScript           | 0 errores, 0 advertencias, 0 hints  |
| ESLint y Prettier            | Aprobados                           |
| Unitarias                    | 46 aprobadas en 11 archivos         |
| Build estático               | 82 páginas HTML                     |
| SEO                          | 3 aprobadas                         |
| Playwright Chromium + WebKit | 61 aprobadas, 3 omisiones esperadas |

Las omisiones son las dos suites de capturas exclusivas de Chromium y la prueba táctil mediante CDP, que WebKit no implementa. No son tres fallos omitidos. Las pruebas funcionales aplicables se ejecutan en ambos motores.

Las cuatro pruebas del ajuste de encuadre forman parte de las 46 unitarias aprobadas. Astro comprobó 149 archivos sin errores, advertencias ni hints. El informe de cierre conserva los resultados coincidentes con esta versión.

## Territorio, posiciones y casas

- La colección conserva los 61 IDs, nombres, categorías y fichas canónicos. Las referencias geográficas siguen distinguiendo 51 ubicaciones documentadas y 10 aproximadas; los 49 puntos procedentes de IDE conservan exactamente sus coordenadas publicadas. No se añade un pin de sustitución cuando falta una referencia.
- La superficie utiliza el polígono oficial del geoparque, simplificado a 20 m, con sus entrantes. El relieve procede del DEM regional de 128 × 128 muestras, con exageración vertical declarada de seis veces. Ni ese DEM ni su interpolación son un levantamiento local.
- Las ocho casas son espacios virtuales con diseños diferenciados. Agrupan 47 lugares; los otros 14 quedan sin agrupar en el recorrido exterior. Ese conteo describe la exposición, no cuántos lugares pertenecen al polígono geográfico. Los GPS permanecen intactos y el espaciado interior es escénico.
- La hidrografía y los trazados viales regionales proceden de las capas públicas documentadas en [territory-world.md](territory-world.md). Su dibujo no certifica caminos transitables, accesos habilitados ni niveles de agua actuales.

## Miniaturas y evidencia visual

Se preservan doce miniaturas del proyecto de turismo y se incorporan **49 GLB nuevos: 20 modelos de arquitectura e industria producidos con Blender y 29 entornos naturales exportados desde Three.js**. Los ocho paisajes 3, 6, 7, 8, 12, 15, 21 y 57 tienen alcance cartográfico aproximado mediante DEM y ortofoto, con apoyo fotográfico cercano o regional cuando existe. No se presentan como reconstrucciones de detalle medidas.

La revisión independiente compara los 49 GLB nuevos con las fuentes del lugar, desde frente y reverso u oblicua. Conserva los rechazos y correcciones previos, los motivos de aprobación y las huellas de los archivos aceptados. Las fichas distinguen fotografías de suelo, vistas aéreas y cartografía; un contacto de fotos no acredita por sí solo múltiples ángulos del mismo elemento. Las brechas, incluidas las vistas o dimensiones que faltan, se mantienen en los manifiestos.

La revisión del visor comprobó los **61 IDs desde la interfaz de producción**, con dos ángulos de escritorio por ID. La batería de encuadre reducido aprobó seis modelos —2, 35, 41, 46, 50 y 52— en 320 × 900, 844 × 390 y 640 × 450: 18 capturas. Comprobó el cuerpo y la base física del modelo, la ausencia de HTML sobre el motivo, títulos y botones legibles y salida disponible. El recorte de la cuadrícula escénica circundante no equivale al recorte del modelo. Los modelos heredados se revisan como regresión, no como reconstrucciones nuevas.

Los dictámenes de geometría, escritorio y pantalla reducida son capas distintas. El cierre independiente consta en [landmark-quality-audit.md](landmark-quality-audit.md) y en `reports/experience-review/next-quality/final-quality-gate.json`, después de la recaptura del ajuste de cámara. También se aprobó el detalle ampliado de la casa del Cura y el recorrido en pantalla de 320 px. La batería de 18 capturas no equivale a revisar individualmente los 61 modelos en todos los tamaños.

## Regresiones y recuperación

La ejecución completa conserva las comprobaciones del sitio editorial —hero, atlas, fichas, mapa, favoritos, planificador, exportaciones, navegación y contenido sin JavaScript— y de la entrada con dos opciones. El control de la experiencia cubre caminar, pausar, accionar, entrar y salir de las casas, búsqueda y selección, ventanas movibles y cerrables, y retorno de la inspección al personaje.

La carga de miniaturas es bajo demanda: una selección obsoleta no puede reemplazar la vigente, las selecciones intermedias se omiten y los recursos descartados se liberan. La recuperación ante falta de WebGL, fallo de descarga o pérdida de contexto conserva enlaces a las fichas y una salida al sitio. La revisión de accesibilidad automatizada comprueba incidencias `serious` y `critical` en los estados cubiertos; no sustituye una auditoría manual completa de todos los recorridos posibles.

## Recursos y rendimiento

[territory-world.md](territory-world.md) documenta el ensayo reproducible de mundo exterior, galería, inspección, solicitudes obsoletas y cinco ciclos de entrada/salida. Registra contadores WebGL y tiempos de envío de comandos JavaScript en Chromium con SwiftShader. El ensayo conserva el hash de la fuente exacta que midió, anterior a las correcciones posteriores de corte y encuadre de cámara; no se atribuyen sus cifras a un binario distinto.

En esa prueba acotada no hubo aumento de los contadores al volver al mismo punto y se liberaron todas las miniaturas creadas al destruir el mundo. No se deducen de ello FPS garantizados, tiempo real completo en GPU, memoria total del controlador, consumo de batería ni rendimiento de teléfonos físicos.

## Registros y límites

Los originales y las capturas de investigación permanecen fuera del producto. La consulta de fuentes en noviembre de 2026 no convierte las ortofotos de 2017–2018 ni las fotografías históricas en un relevamiento actual. Las miniaturas no son fotogrametría ni planos arquitectónicos, y las coordenadas no acreditan una entrada, permiso de visita o accesibilidad.

El trabajo no incluye un despliegue de producción. El cierre enlaza la ejecución completa y los dictámenes coincidentes con los archivos entregados:

- `reports/experience-review/next-quality/final-quality-gate.json`: cierre autorizado de las tres capas; distingue la recaptura final de los dictámenes históricos.
- `reports/experience-review/next-quality/latest-model-review.json`: geometría de los 49 nuevos.
- `reports/experience-review/next-quality/geometry-approved-glb-hashes.json`: archivos geométricos aceptados.
- `reports/experience-review/next-quality/three-models/review.json`: recorrido del visor y hashes servidos.
- `reports/experience-review/next-quality/three-desktop-review.json`, `three-natural-review.json` y `viewport-independent-review.json`: dictámenes históricos independientes del visor; sus observaciones previas se conservan y el cierre final indica qué recapturas los sustituyen.
- `reports/experience-review/next-quality/verify-final.log`: ejecución final completa de verificación tras el ajuste de cámara, terminada con código 0.
- `test-results/experience-visual/` y `test-results/visual-comparison/`: capturas automatizadas de la experiencia y regresión del prototipo editorial.

Estos informes, fotografías y capturas locales están excluidos de Git; la documentación versionada conserva el alcance y las limitaciones de lo validado.

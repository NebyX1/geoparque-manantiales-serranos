# Plan independiente de calidad de la experiencia

Fecha de inicio: 8 de noviembre de 2026. Este control corresponde a las misiones de silueta territorial, casas de clúster y reconstrucción de lugares solicitadas por el usuario. La persona o agente que construye un modelo no emite su aprobación visual.

## Regla de entrega

La carga de un modelo, el conteo de polígonos y las pruebas de TypeScript no acreditan semejanza con un lugar. La entrega requiere un dictamen independiente por cada uno de los 49 modelos nuevos y una comprobación de regresión de los 12 heredados. No se declara validado el conjunto mientras exista un ID rechazado o pendiente de evidencia.

Los estados son **APROBADO**, **RECHAZADO** y **PENDIENTE DE EVIDENCIA**. Una falta de fotografía no se resuelve inventando una reconstrucción ni llamando fiel a una forma genérica.

## Evidencia antes del modelado

- Identificar el lugar por su ID y nombre canónico, evitando homónimos de otros departamentos o países.
- Buscar fotografías publicadas de frente, oblicuas y de entorno; para relieves, perfil y vista elevada cuando exista. Dos reproducciones de una misma foto no son dos ángulos.
- Priorizar operador, institución responsable, arquitecto, inventario patrimonial y fotografía original identificada. Las fotos de prensa local pueden complementar la evidencia, con su procedencia explícita.
- Registrar URL de la página, URL de la imagen, autor/licencia cuando conste, fecha o contexto y los rasgos efectivamente visibles. La descarga para análisis no autoriza distribuir una foto en el sitio.
- Los lados no documentados se señalan; no se inventan detalles singulares. Las medidas no levantadas se presentan como proporciones visuales aproximadas.
- Registrar también las bases 3D externas usadas, con licencia compatible y modificaciones. Elegir Blender/GLB u otro flujo por fidelidad y coste de mantenimiento, no por comodidad de generar primitivas.

Un paisaje cartográfico puede usar DEM y ortofoto oficial alineados al punto canónico para acreditar relieve y cobertura. Se juzga con el mismo mínimo, sin aceptar rasgos distintivos inventados ni un terreno decorado al azar. Si falta fotografía inequívoca del perfil o del detalle de superficie, se declara también en la procedencia pública de esa miniatura; la aprobación no certifica una réplica fotográfica.

## Evaluación visual por modelo

Se comparan fotografía y render desde ángulos equivalentes. El mínimo presentable exige todos los requisitos críticos y al menos 80/100 en la matriz:

| Aspecto             | Peso | Comprobación                                                                                                                                                     |
| ------------------- | ---: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Silueta y volúmenes |   30 | Perfil reconocible; relación entre ancho, altura y profundidad coherente con las referencias.                                                                    |
| Rasgos distintivos  |   30 | Edificios: número y disposición de torres, arcos, cuerpos y cubiertas. Naturales: laderas, escarpes, entrada de cueva, agua y elementos singulares documentados. |
| Proporciones        |   20 | Sin estiramientos, casitas gigantes, cilindros arbitrarios ni partes que destruyan la escala relativa observada.                                                 |
| Material y color    |   10 | Familias de material y color coherentes; sin sustituir ladrillo por piedra o cubiertas planas por agujas sin evidencia.                                          |
| Presentación        |   10 | Modelo completo, iluminación legible y ausencia de artefactos, intersecciones o piezas flotantes accidentales.                                                   |

Son rechazos críticos: identidad equivocada; silueta radicalmente diferente; ausencia de un rasgo determinante publicado; geometría deforme o autointersectada visible; captura o referencia inexistente presentada como revisada; fuentes que no permiten identificar el lugar. El caso GMS-02 debe cotejar expresamente la construcción de la cima del Cerro del Cura.

## Mundo y casas de clúster

- Comparar la vista cenital del mundo con el contorno oficial del geoparque y con el mapa editorial. No aceptar un rectángulo como límite del territorio.
- Conservar la proyección y las referencias geográficas documentadas. Una casa virtual no se convierte en una coordenada de entrada real ni en autorización de visita.
- Cada clúster debe conservar todos sus IDs canónicos y permitir entrar y salir con teclado, mouse y controles táctiles. Salir devuelve al exterior correcto.
- El interior dispone de separación suficiente para seleccionar y recorrer cada punto sin superposición. Sus posiciones son de exposición, no GPS.
- Las casas tienen siluetas/materiales distintos y texto sobre la zona y los lugares que contienen, derivado de información canónica; no agregar historias, horarios ni permisos inventados.
- Verificar puerta, colisiones, límites, recuperación tras cerrar paneles, teletransporte a un punto interior y salida de la casa. Ningún punto puede quedar inaccesible.

## Presentación y funcionamiento

Capturar 320–1920 px, pantalla baja, landscape y zoom equivalente a 200 %. Revisar encuadre de modelos altos y anchos, textos, puerta, botón de salir, ventanas, foco y dock. El dock no puede tapar el modelo ni interceptar controles. Las pruebas funcionales, accesibilidad y recuperación se ejecutan en Chromium y WebKit. No correr suites simultáneas que compartan servidores.

Fuera de las salas, cargar por selección. Dentro de una sala, admitir como máximo tres miniaturas en la escena: la seleccionada y hasta dos vecinas, con carga serial. Al alejarse, cambiar de sala o salir se liberan las vecinas. Al entrar al inspector se liberan las vecinas y se reutiliza la selección existente: máximo una miniatura, sin copia adicional. Verificar el máximo real, incluidas las cargas que terminan después de cancelar una selección.

Liberar geometría, instancias, materiales, texturas, imágenes y RAF/listeners al cambiar de documento. Medir peticiones, latencia de selección, cadencia de cuadros y conteo de recursos después de alternar salas y abrir/cerrar el inspector. Si no existe una medición anterior comparable de FPS, no afirmar mejora numérica; conservar esa limitación y comparar una secuencia equivalente contra la versión anterior cuando esté disponible. Documentar cualquier regresión material.

## Registro y dictamen

El informe por ID contiene referencias consultadas, ángulos realmente observados, rasgos exigidos, render y versión revisados, puntuación, defectos y estado. Las fotografías y capturas locales de análisis viven en `reports/experience-review/next-quality/`, excluido de Git. El inventario y dictamen legibles se mantienen en `docs/landmark-quality-audit.md`. La aprobación se refiere a una versión concreta; un cambio posterior de geometría o encuadre exige revisar lo afectado.

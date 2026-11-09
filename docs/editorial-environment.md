# Enfoque editorial ambiental

## Objetivo

La web explica el Geoparque como un territorio para conocer, comprender y conservar. Su finalidad principal es la alfabetización ambiental: relacionar patrimonio geológico, agua, biodiversidad y comunidades, y ayudar a formular preguntas con fundamento. El usuario solicitó esta nueva orientación; sustituye el enfoque promocional del prototipo en los textos y en la jerarquía de información, conservando su identidad y la arquitectura del proyecto.

## Audiencias y jerarquía

1. Comunidad local y público general: comprender qué es un geoparque y cómo se relacionan sus ambientes.
2. Estudiantes y docentes: preguntas, fichas, propuestas de observación y recursos para trabajar antes, durante y después de una actividad.
3. Personas que investigan o acompañan grupos: fuentes, diferencias entre observación e interpretación y condiciones de acceso documentadas.

La portada prioriza la misión, la historia de la Tierra, el agua, la biodiversidad y la educación. El atlas funciona como un conjunto de casos para comprender procesos. Los itinerarios y el cuaderno organizan preguntas y observaciones. La información de acceso acompaña el cuidado de los sitios y no presupone apertura, autorización ni servicios.

## Trazabilidad de las fuentes de `data`

| Documento                                                         | Páginas   | Evidencia utilizada                                                                                                                                                                                                                             |
| ----------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO sostenible 26  Manantiales Serranos.pdf`                    | 2         | Define un geoparque como territorio con patrimonio geológico de importancia internacional que promueve conservación, educación y desarrollo sostenible de sus comunidades. La definición está incorporada como imagen; se comprobó visualmente. |
| Mismo documento                                                   | 3–10      | Tiempo geológico, geositios de valor internacional y divisoria de cuencas en Cerro Pelado.                                                                                                                                                      |
| Mismo documento                                                   | 11–13     | Sitios ecológicos, inventario de biodiversidad y diversidad de ambientes. No se convierten sus cifras en un censo actual ni se promete observar especies.                                                                                       |
| Mismo documento                                                   | 15–16     | Presenta el vínculo entre escuelas y geositios y líneas de trabajo: aula al aire libre, interpretación geoambiental, agua y acuíferos, tectónica, paleontología, materiales didácticos e identidad local.                                       |
| Mismo documento                                                   | 20–21, 26 | Conocer, conservar y valorizar; investigación, inventarios, monitoreo, interpretación, protección y apropiación comunitaria.                                                                                                                    |
| `PRESENTATION OF UNESCO GLOBAL  GEOPARK MANANTIALES SERRANOS.pdf` | 3–5       | Nombre participativo, superficie de 2.010 km², agua superficial y subterránea, tres grandes sistemas de cuencas y diversidad de registros geológicos.                                                                                           |
| Mismo documento                                                   | 6–9       | Valor científico internacional de Aguas Blancas, Parque de Minas, Reserva Salus y Cerro Arequita.                                                                                                                                               |
| Mismo documento                                                   | 10–12     | Relación del Geoparque con conocimiento, gestión y conservación de cuencas; bosques serranos y ribereños, pastizales y montes de ombúes; inventario de patrimonio natural.                                                                      |
| Mismo documento                                                   | 13, 15    | Patrimonio cultural y formas de habitar; escuelas rurales y comunidades vinculadas a los geositios; territorio como aula abierta.                                                                                                               |
| `Geoparque Manantiales Serranos.pdf`                              | 2, 15–16  | Organización interdisciplinaria, construcción colectiva de georutas y presentación de «Una escuela, un geositio». La descripción no se publica como convocatoria ni inscripción vigentes.                                                       |
| `Geoparque Manantiales Serranos (1).pdf`                          | 1–16      | Su extracción textual coincide con la del archivo anterior. Se auditó como copia de la misma presentación y no se cuenta como corroboración independiente.                                                                                      |
| `Manantiales_Serranos_reconstruida.pdf`                           | 2–5       | Explica que las 61 fichas combinan 49 registros reproducidos del inventario y 12 complementos editoriales. Distingue relatos, evidencia y datos pendientes; desarrolla claves de geología, agua, biodiversidad y cuidado.                       |
| Mismo documento                                                   | 35, 38    | Ejemplos de interpretación de biodiversidad y de acceso no confirmado. Programaciones históricas no equivalen a horarios permanentes ni a disponibilidad actual.                                                                                |

## Reglas de contenido

- Los cuatro ejes y sus referencias viven en `src/data/environment.ts`; las fichas de lugares siguen en la única colección canónica de `src/data/geosites.ts`.
- Las tres propuestas de aprendizaje de `environment.ts` son elaboraciones editoriales inspiradas en las líneas educativas documentadas. No se atribuyen a un programa oficial, una institución docente ni una agenda vigente.
- No se inventan coordenadas, horarios, precios, contactos, permisos, ofertas educativas ni resultados de monitoreo. Las referencias institucionales describen lo que documenta cada presentación; no certifican una estructura administrativa actual.
- La guía reconstruida declara que no realizó nueva verificación externa. Sus referencias sirven como procedencia documental, no como comprobación actual.
- Se distinguen observación, interpretación científica, memoria y leyenda. Las dudas o discrepancias geológicas se conservan como tales, sin elegir una explicación por efecto narrativo.
- Se aprende sin extraer rocas, fósiles, plantas ni restos y sin interferir con fauna. Una fotografía o una ficha no constituye autorización para entrar a un predio ni certifica condiciones del agua.

## Implementación editorial

`environment.ts` ofrece `environmentalPurpose`, `environmentalAxes`, `learningActivities` y `environmentalSources`. Cada eje y actividad conserva referencias a documentos y páginas. Las referencias son documentales: el campo `file` identifica la fuente en `data`, no una ruta pública de descarga.

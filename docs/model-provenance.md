# Miniaturas del geoparque: procedencia y alcance

## Modelos reutilizados

Se reutilizan modelos y constructores del proyecto del usuario [nueva-web-turismo-idl](https://github.com/NebyX1/nueva-web-turismo-idl), revisión `08a03e8060cce0e90e4c3662feed377f4b9c4622`. Las miniaturas son interpretaciones visuales, no levantamientos topográficos o arquitectónicos. Su posición geográfica procede de los datos geográficos complementarios, independientemente de la geometría artística del modelo.

| GMS | Lugar                         | Procedencia                                                                                 |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| 01  | Cerro Arequita                | Constructor `src/three/landmarks/arequita.ts` y `arequitaRiver.ts`, con LOD para miniatura  |
| 09  | Represa Stewart Vargas        | Constructor `stewartVargas.ts`, datos `stewartVargasAsset.json`, peces y shaders nativos    |
| 10  | Mesón de las Cañas            | Componente del constructor `architectureWater.ts`                                           |
| 11  | Ventorrillo de la Buena Vista | Componente del constructor `architectureWater.ts`                                           |
| 14  | Salto del Penitente           | Constructor `penitente.ts`, malla empaquetada y módulos nativos de agua, roca y peces       |
| 22  | Templo budista                | Constructor `monastery.ts`, `monasteryRoof.ts` y `monasteryDetails.ts`                      |
| 31  | Reserva Natural Parque Salus  | Constructor `salus.ts`, puma y geometría auxiliar, con LOD                                  |
| 33  | Cerro del Verdún              | Constructor `natureMonuments.ts`                                                            |
| 39  | Plaza Libertad                | Constructor `plazaLibertad.ts` y luces de fuente                                            |
| 41  | Catedral de Minas             | El mismo componente `cathedral()` de `plazaLibertad.ts`, sin construir el resto de la plaza |
| 46  | Cerro Artigas                 | `assets/artigas/artigas-rebuilt.glb`                                                        |
| 49  | Parque Rodó                   | `assets/parque-rodo/parque-rodo.glb`                                                        |
| 54  | Villa Serrana                 | Composición del constructor `architectureWater.ts`                                          |

Los GLB copiados se conservan byte por byte. Stewart ahora utiliza el constructor nativo y sus datos geométricos empaquetados, idénticos al origen; el archivo GLB original sigue disponible como referencia de procedencia. Esta conservación no debe confundirse con incorporar las fotografías de investigación de las reconstrucciones nuevas. El loader agrupa geometría estática compatible por material en memoria; conserva normales, materiales y transformaciones. No se importan React, la escena, la ruta esquemática, la cámara automática ni la infraestructura del proyecto de referencia.

Los 48 lugares restantes se exportan a GLB independientes bajo `public/models/geosites/rebuilt/`. Hay 19 maquetas de arquitectura, espacios urbanos e industria modeladas con Blender y 29 entornos naturales con generadores geométricos y datos de elevación; ambas rutas producen activos locales que Three.js sólo visualiza. `miniatures/interpretive.ts` ya no forma parte de la carga de producción. Una ausencia de GLB se informa como error, sin reemplazar el lugar por un modelo temático. Fuentes, decisiones y revisiones independientes en `landmark-rebuild.md`, `landmark-quality-audit.md` y `experience-quality-plan.md`. No se afirma fotogrametría ni medidas arquitectónicas donde no existen.

Los créditos y límites también son visibles en `/experiencia/modelos/` y en cada ficha. El modelo 36 identifica el edificio de Belloni fotografiado en 2024, sin presentar el pin institucional anterior como su entrada; el 42 identifica la casa natal preservada dentro del conjunto. El 29 conserva el nombre canónico y documenta la discrepancia con Lázaro Cabrera en las fuentes.

## Cambios para la escala de miniatura

- Ancho máximo horizontal de nueve unidades, centrado, con la base en `y=0`.
- Arequita: textura de 192 px, perfil pétreo original con muestreo reducido a 144 × 18, dos refinamientos de coronación, terreno 64 × 60, vegetación simplificada. El registro de adaptación de ese constructor heredado contó 73 plantas, 46.545 triángulos y 86 lotes de dibujo; no es una medición de FPS.
- Salus: resolución de superficie implícita del puma reducida de 68/76 a 32/36. Se conservan postura, cabeza, fuente y entorno; 62.165 triángulos y 20 lotes.
- Monasterio y componentes estáticos: lotes por material, sin alterar la composición; 20 lotes en el templo.
- Agua de los GLB: perturbación animada de normales mediante shader. Los GLB de origen no traen pistas de animación; no se afirma que se hayan importado las simulaciones, peces o eventos nocturnos del sitio de referencia.
- Los constructores reciben validación de atributos y búsquedas de geometría; un índice inconsistente produce un error explícito.

## Fuentes auxiliares de Artigas

El README original identifica dos bases geométricas CC0, adaptadas al monumento por el proyecto de referencia:

- Caballo: Lyndon Daniels, [Realtime Rancher's 3D Model Pack](https://opengameart.org/content/realtime-ranchers-3d-model-pack), CC0. Las texturas fotográficas del paquete no se redistribuyen.
- Base humana: MakeHuman Community, malla hm08 y objetivos de forma oficiales, [licencia CC0 de activos](https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.ASSETS.md).

Los avisos originales se conservan en `public/models/geosites/HORSE-CC0.txt` y `MAKEHUMAN-CC0.txt`. El manto, cabello, botas, manos, carona, flecos, riendas y basamento son trabajo del proyecto de referencia. Esa atribución no convierte las fotos utilizadas para estudio en texturas redistribuidas.

## Huellas de los GLB

| Archivo público              |     Bytes | SHA-256                                                            |
| ---------------------------- | --------: | ------------------------------------------------------------------ |
| `cerro-artigas.glb`          | 3.934.348 | `112c805995ff0ffd75f752960d38730848ac1fb3a05be9c38e1f546d3592d32f` |
| `parque-rodo.glb`            | 6.184.188 | `28df17cc7087e09b7a907c679b1a524726b5c08fc3693b60f033887e293a970e` |
| `represa-stewart-vargas.glb` | 5.031.412 | `eb97158a95a284f92f56a7dcd3f0dd926b9426dc8c4ac3c518cd1c48bd88f2df` |
| `salto-del-penitente.glb`    | 3.074.548 | `21808837be32892d793695a843798e159ddc730955a31b040fe9da46331ce17d` |

## Contrato de ciclo de vida

`createMiniature(id)` entrega un `Promise<THREE.Group>` independiente. `updateMiniature(group, elapsedSeconds)` utiliza el RAF del controlador; no crea RAF, listeners ni temporizadores. `disposeMiniature(group)` elimina el grupo, libera geometrías/materiales/texturas únicos, cierra imágenes bitmap y elimina el callback de animación. Es idempotente. No existe caché global de grupos o geometrías; la caché HTTP puede reutilizar la descarga estática de GLB.

Un ID fuera de 1–61 rechaza con `RangeError`. Una carga GLB fallida rechaza con un mensaje que identifica el GMS y el archivo, conservando la causa. El controlador decide cómo mostrar ese estado y descarta respuestas de selecciones anteriores. La procedencia, tipo de representación, dimensiones, lotes y triángulos quedan en `group.userData.miniature`.

El registro anterior ejecutó 61 constructores en Node con canvas y decodificación de imagen simulados; corresponde a la versión anterior de las miniaturas y no acredita los 49 GLB reconstruidos. En la versión actual, el exportador natural comprueba atributos finitos, dimensiones y presupuesto de geometría, mientras la revisión independiente compara los archivos exportados desde dos ángulos con las referencias. Las comprobaciones de archivo no verifican por sí solas materiales, shaders, encuadre, liberación real de recursos ni rendimiento GPU. La revisión del visor y el ensayo acotado de recursos tienen registros separados en `validation-experience.md` y `territory-world.md`.

## Reutilización y correcciones posteriores

Los cambios de Arequita/Santa Lucía, Stewart Vargas, la catedral y el Cerro de los Cuervos se documentan en [landmark-reuse.md](landmark-reuse.md). La catedral separada antigua se retiró del catálogo de GLB activos. Cuervos conserva sus contornos cartográficos e incorpora el escarpe y la corona de vegetación interpretados desde fotografías, usando el constructor de roca del Arequita.

La reconstrucción posterior de GMS-61 usa la galería publicada en julio de 2026 y mapas PBR originales empaquetados; se detalla en [molino-viejo.md](molino-viejo.md). No incluye fotografías externas en las texturas. Su dictamen independiente es [molino-viejo-review.json](molino-viejo-review.json).

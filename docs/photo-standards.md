# Estándar fotográfico

Cada foto tiene un autor o crédito, una escena identificada y un archivo. Usá las fuentes del catálogo para recortar y ajustar las imágenes que se comparten entre el sitio y el recorrido 3D. Para valorar la nitidez, inspeccioná tanto el archivo de origen a tamaño real como la versión situada en el navegador. Revisá la legibilidad del motivo, el balance de blancos, el detalle en sombras, la textura en luces y la ausencia de bandas o deformaciones.

La [política de calidad visual](photo-editorial-policy.md) define los criterios de color, luz, nitidez y fidelidad, y el trabajo de revisión y edición antes de publicar.

| Componente                                          | Dimensiones máximas del WebP |                        Proporción |
| --------------------------------------------------- | ---------------------------: | --------------------------------: |
| Portada de ficha                                    |                  4352 × 2448 |                              16:9 |
| Tarjeta de atlas, circuito, historia o cultura      |                  1280 × 1600 |                               4:5 |
| Imagen de sección editorial y vista rápida          |                  1920 × 1080 |                              16:9 |
| Lectura, destacado cultural y ampliación de galería |                  2560 × 1440 |                              16:9 |
| Buscador, cuaderno y mapa                           |                    640 × 480 |                               4:3 |
| Visor 3D                                            |                   1600 × 900 |                              16:9 |
| Carrusel principal                                  |                  3840 × 2160 |                              16:9 |
| Recorte del carrusel hasta 620 px                   |                  1717 × 2160 | Recorte exacto, a altura completa |

Las variantes de cada componente usan la misma proporción de su perfil y el navegador elige un ancho en función del espacio disponible y la densidad de pantalla. El carrusel móvil es el recorte de altura completa del carrusel de escritorio y usa sus propios anchos y precarga. Los logos, el mapa documental, los originales enlazados, las texturas y la ilustración de entrada tienen tamaños propios para conservar su composición o su función.

## Publicar una foto

1. Seleccioná la mejor referencia identificada y anotá autor, enlace, dimensiones y condiciones de uso en el catálogo de lugares o en el inventario editorial. Guardá la imagen en el componente correspondiente bajo `src/assets/images/`. Si una edición interpreta detalles finos, conservá la referencia para su consulta.
2. Revisá cómo queda el motivo en el marco panorámico y en el recorte de tarjeta. Usá `src/data/photo-edits.json` para ajustes individuales de exposición, curva tonal, balance, enfoque y selección de sombras o verdes. `cardFocus` es el centro horizontal del motivo entre 0 y 1 en el máster. Si el texto llegara a ocultar el motivo, `cardPositionY` permite encuadrar la foto en el espacio visible de la tarjeta entre 0 y 100 %. `coverPosition` fija las dos coordenadas de CSS en la portada de ficha. En los componentes, elegí un perfil de `src/lib/photo-profiles.mjs`.
3. Ejecutá `npm run assets:photos` y, si cambiaste el carrusel, `npm run assets:hero`. Contrastá los resultados con la fuente y actualizá la entrada correspondiente de `src/data/visual-review.json` con el SHA-256 del máster de `src/data/photo-publication.json` o del archivo del componente. Un archivo faltante, en otro formato, con otra medida o sin la revisión correspondiente detiene `npm run build`.
4. Ejecutá `npm run verify`. La auditoría del build lee las dimensiones de los WebP servidos. Las pruebas del navegador decodifican las 61 portadas de ficha a 2145 px y DPR 2 y los 61 WebP del visor 3D. También cubren el atlas, las secciones y los controles dinámicos.

## Entrega y encuadres

Se revisaron los 61 lugares y las fotos editoriales que aparecen fuera del atlas. La causa de las franjas era un límite CSS que restringía el ancho y el alto de la imagen según su resolución y la densidad de la pantalla. Ahora la foto llena su marco con un recorte proporcional. En el atlas y en las secciones, cada tarjeta usa una variante pensada para su formato.

- La ficha de Aguas Blancas presenta el cauce de la represa vieja, atribuida a Danares316. El carrusel y la galería usan la vista aérea del embalse y las sierras de Marcelo Campi.
- La ficha de la Laguna de los Cuervos usa la foto de Fernando Morán. La sección de agua, el artículo y la galería muestran la vista aérea del Santa Lucía del archivo del operador.
- La ficha de Villa Serrana conserva horizonte, poblado y embalse, y la tarjeta prioriza el conjunto urbano junto al agua. La gradación recupera detalle en el monte y mantiene la luz cálida de la ladera.
- Las fotos directas del templo Sengue Dzong, el Museo del Alfajor, el Destacamento y la Cuna de Fabini sustituyen las portadas de definición limitada. Cerro La Caperuza y los otros doce sitios sin una toma terrestre publicable tienen ortofotos panorámicas de IDE de 3840 × 2160.
- La medida de salida expresa la geometría de publicación. El [registro por imagen](../src/data/visual-review.json) documenta la definición disponible de originales como el mural de Solís, la Gruta Colón y el Monte de Ombúes.

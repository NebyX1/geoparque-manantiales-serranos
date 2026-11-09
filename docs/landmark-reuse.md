# Cuervos, catedral, Stewart Vargas y Santa Lucía

Corrección solicitada por el usuario el 8 de noviembre de 2026. Origen: [nueva-web-turismo-idl, revisión 08a03e8060cce0e90e4c3662feed377f4b9c4622](https://github.com/NebyX1/nueva-web-turismo-idl/tree/08a03e8060cce0e90e4c3662feed377f4b9c4622), contrastada con `main` de ese repositorio.

| GMS | Cambio                                                                                                                                                                                                    | Geometría / llamadas estructurales |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 01  | Mantiene el río Santa Lucía original, incluidos cauce, juncos, peces y material animado. Recupera la resolución original del terreno junto a las orillas.                                                 | 71.365 triángulos / 86             |
| 09  | Sustituye la carga estática del GLB por el constructor nativo: geometría empaquetada original, materiales de hormigón, malla de la pasarela, agua de embalse/vertedero/arroyo, seis peces y salpicaduras. | 115.694 triángulos / 80            |
| 41  | Utiliza exactamente `cathedral()` de Plaza Libertad, recentrada y normalizada. La fábrica compartida evita construir y desechar el resto de la plaza.                                                     | 26.935 triángulos / 6              |
| 52  | Añade el escarpe del Cerro de los Cuervos detrás del agua, con la construcción de roca del Arequita y copa arbolada.                                                                                      | 103.382 triángulos / 12 en el GLB  |

Los recuentos de los constructores incluyen las mallas de peces ocultos y la cantidad inicial de instancias; no equivalen al número de llamadas visibles de un frame ni a una medición de FPS. Todos permanecen dentro del presupuesto de 150.000 triángulos y menos de 100 llamadas por miniatura. Los peces pueden activar pequeñas cantidades adicionales de gotas, dentro de ese margen.

## Identidad y materiales

El fingerprint de los 80.805 vértices no indexados de la catedral, con sus transformaciones y colores, se generó desde el constructor limpio del repositorio original. Coincide con la catedral actual después de deshacer únicamente el encuadre de nueve unidades. La referencia está en `tests/fixtures/tourism-model-reference.json`. El GLB anterior de GMS-41 dejó de formar parte del loader y de los exportadores activos; su aprobación anterior queda archivada en `landmark-asset-approvals.json`.

El contenido de `stewartVargasAsset.json` conserva exactamente los datos del original. Los cambios de TypeScript tipan tuplas y comprueban las claves de material; no alteran posiciones ni normales. El loader conserva el árbol animado y las instancias; no aplica un agrupado estático ni un shader genérico sobre estos constructores.

La derivación del relieve del agua usa posiciones de vista ya escaladas. En Arequita y Stewart el relieve del shader original estaba expresado en metros; sin compensación, reducir la maqueta amplificaba sus normales y producía franjas excesivas. Ahora se multiplica la altura por `length(modelMatrix[1].xyz)` antes de derivarla. La corriente, paletas y frecuencias del original se conservan. Los relojes siguen dependiendo del RAF existente y respetan pausa, visibilidad y movimiento reducido.

## Cuervos: referencia y alcance

La [galería del operador](https://www.lagunadeloscuervos.com.uy/entorno/) y las fotografías locales de referencia muestran el paredón detrás del remanso, con monte en su base y vegetación en la corona. La [descripción del Ministerio de Ambiente](https://www.gub.uy/ministerio-ambiente/politicas-y-gestion/parque-nacional-arequita) documenta la similitud de las siluetas de ambos cerros y sus paredones. Se comparte la construcción de roca y se adapta su escala y colocación; no se presenta como un escaneo ni como un nuevo punto geográfico medido.

Se conservan los polígonos del agua, el relieve de base, la cobertura y el recorte de 1.300 × 1.200 metros. No se ensancha el río para exagerar su apariencia. El nuevo arbolado se apoya en los triángulos reales de la corona. El GLB exportado no necesita imágenes externas: el albedo gris verdoso compensa la ausencia de las texturas procedurales del constructor de roca usado en el navegador.

Sólo se regeneró `gms-52.glb`. Los otros 47 GLB reconstruidos, incluido Marmarajá y su lagarto, conservan sus hashes; GMS-41 se retiró. Las fotografías verificadas y los datos canónicos de los 61 lugares no cambian por esta corrección.

## Evidencia

La revisión visual independiente se registra en `landmark-reuse-review.json`. Las capturas reales del juego, los estados previos y los hashes servidos están en `reports/experience-review/model-reuse/`. La ronda final incluye vistas completas, oblicuas y bajas, 320 px, horizontal 844 × 390 y reflow equivalente a 200 % en 640 × 450. La catedral de Plaza Libertad se incluye como regresión.

Los tests verifican identidad geométrica y de datos, movimiento de peces, reloj del agua, aislamiento de instancias y liberación única de recursos. Las pruebas E2E comprueban animación, pausa y movimiento reducido de Santa Lucía y Stewart en los navegadores configurados. `npm run verify` es la validación general del repositorio; su salida de esta revisión se conserva en `reports/experience-review/model-reuse/verify.log`.

# Miniaturas: reconstrucción y control de fidelidad

La colección utiliza trece modelos heredados y cuarenta y ocho reconstruidos: diecinueve modelos de arquitectura e industria se producen con Blender y veintinueve entornos naturales se exportan desde las fuentes Three.js. El navegador recibe un GLB por selección, sin ejecutar Blender, descargar datos de elevación ni generar todos los modelos al entrar al mundo.

## Evidencia y alcance

`src/data/landmark-references-natural.json` conserva las treinta y una fichas investigadas de paisaje y geopatrimonio: ID canónico, fuentes, fotografías disponibles para estudio, rasgos determinantes, recorte de elevación y brechas. Las fichas 32 y 34 corresponden a las plantas/canteras y se producen dentro del grupo de veinte modelos Blender; las otras veintinueve usan el exportador natural. Cada ruta sigue el formato `public/models/geosites/rebuilt/gms-XX.glb`, con dos cifras. La ficha distingue el relieve muestreado de un modelo de elevación de la interpretación de una fotografía; ese muestreo no equivale a una medición de campo. Un DEM no acredita un edificio, la posición de una boca de cueva, una excavación minera actual ni un recorrido de acceso.

Las fotografías externas consultadas para reconstruir los 49 modelos nuevos no se han incorporado a sus texturas. Los recursos heredados conservan su contenido original y su procedencia se documenta por separado. Las imágenes descargadas para comparar quedan en `reports/experience-review/`, fuera del producto. No se han añadido coordenadas de acceso, precios, permisos, horarios ni datos comerciales al registro canónico.

Los modelos son miniaturas de interpretación visual, no fotogrametría ni levantamientos arquitectónicos. Las escenas de detalle de cuevas, árboles, puentes y corrales amplían elementos para permitir su inspección. Se deben juzgar por la silueta, material, proporción y rasgos comprobados; una escena técnicamente válida no se considera aprobada por eso.

## Relieve numérico

Los recortes locales proceden de [Mapzen / Tilezen Terrain Tiles](https://github.com/tilezen/joerd/blob/master/docs/formats.md), formato Terrarium. La decodificación es `R * 256 + G + B / 256 - 32768` metros, antes de interpolar. Cada recorte tiene 65 × 65 muestras, filas de norte a sur y columnas de oeste a este. La forma de la loma no se sustituye por esferas, conos aleatorios ni una montaña por categoría.

Las fuentes de origen pueden variar por tesela y nivel: SRTM, GMTED y otras. No se atribuyen todos los datos a SRTM. Los metadatos incluyen URL de cada tesela, SHA-256, fecha, licencia y, cuando la respuesta lo proporciona, `X-Imagery-Sources`. Deben conservarse los créditos de [Tilezen y sus proveedores](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).

La resolución y la fecha del DEM limitan los detalles. Se aplica una exageración vertical declarada en cada grupo para que el relieve se lea como miniatura. Las plantas, afloramientos, caminos e instalaciones deben validarse aparte. Los recortes utilizan puntos oficiales y, donde faltan, los puntos aproximados ya documentados en `locations.json`; no representan puertas de entrada. Campanero requiere atención especial por su coordenada aproximada y redondeada: el DEM y la descripción de un caminante de 2025 son compatibles con unos 365–367 m, sin adoptar los 426 m de una guía secundaria ni certificar una cota topográfica.

Generación reproducible:

```powershell
python scripts/prepare-landmark-elevation.py
python scripts/models/prepare-landmark-landcover.py
python scripts/models/prepare-local-rivers.py
python scripts/models/prepare-cuervos-water.py
npx esbuild scripts/models/natural-models.ts --bundle --platform=node --format=esm --external:three --external:three/* --outfile=reports/experience-review/rebuild-natural-export.mjs
node reports/experience-review/rebuild-natural-export.mjs
blender -b -t 4 -P scripts/models/render-natural-models.py -- 2 18 50 51 52 55 56 58 59
```

La preparación de datos usa Requests, Pillow y, para buffers/uniones y ajuste de pendientes de visualización, Shapely 2.x y NumPy. Son dependencias locales de autoría: no se necesitan en el navegador, en el build Astro ni en el contenedor de producción. El exportador y el renderizador admiten IDs concretos para volver a revisar sólo los modelos modificados; `--views=profile,profile-east,plan` permite las vistas cartográficas adicionales disponibles.

## Herramientas y bases 3D evaluadas

- **Blender 4.5 LTS**, portable oficial y ejecución local: adecuado para booleans de puertas/ventanas, cubiertas, cornisas, biseles y exportación de arquitectura estática. Permite revisar siluetas y materiales antes de entregar GLB a Three.js. Las fuentes de arquitectura se conservan en `scripts/models/`.
- **Three.js**, geometría propia y exportación offline: adecuado para terrenos derivados de datos numéricos, curvas de cables, raíces de ombú y piezas de piedra. No se inicia un render loop por miniatura. El proceso agrupa geometrías por material y conserva recursos por modelo para liberarlos al cerrar.
- [Kenney Nature Kit](https://kenney.nl/assets/nature-kit), CC0: útil como base de utilería vegetal; no acredita la forma de ningún geositio. No se incorporó un paisaje de catálogo como si fuese un cerro real.
- [Quaternius Ultimate Nature](https://quaternius.com/packs/ultimatenature.html), CC0: evaluado para vegetación de contexto; las siluetas específicas del sitio necesitan referencias independientes.
- [Three.js Procedural Rocks / Cliffs](https://github.com/maxliebscher/threejs-procedural-rocks-cliffs), MIT: técnica de superficies de roca evaluada. No se copió su generador ni se ejecuta mallado pesado durante la interacción.
- [THREE.Terrain](https://github.com/IceCreamYou/THREE.Terrain), MIT: evaluado; se prefirió un mallado directo de alturas reales en lugar de ruido que inventa la forma de las sierras.
- [Poly Haven Rock Face 01](https://polyhaven.com/a/rock_face_01), Dario Barresi, CC0: se descargó y evaluó como base fotogramétrica de fracturas. La superficie abierta no produjo un macizo adecuado al girar las cuevas y se descartó del producto. Las cuevas finales se esculpen como volúmenes cerrados con cavidades sustraídas, usando MarchingCubes de Three.js sólo durante la exportación offline. La investigación y su script quedan documentados, sin presentar ese escaneo como un sitio de Lavalleja.

Las masas de canopia y las superficies claras de ocho paisajes se distribuyen según máscaras de las ortofotos oficiales IDE de 2017–2018. La clasificación RGB tiene límites explícitos: no identifica especies ni convierte un techo claro en un afloramiento geológico acreditado. `landcover-samples.json` conserva fecha, bounds, hashes, umbrales y limitaciones. Los cauces de Paso de la Arena y El Abra se recortan de la hidrografía oficial IDE; el remanso de los Cuervos usa un buffer y unión planar de la línea OSM documentada. Las superficies de agua son polígonos triangulados continuos, evitando tiras que se superponen al girar. Los anchos y las pendientes de visualización no son un relevamiento hidráulico.

La consulta de las fuentes se realizó el 8 de noviembre de 2026; esa fecha no actualiza la antigüedad del relevamiento. Las ortofotos son de 2017–2018 y las fotografías publicadas abarcan fechas históricas y recientes. Las fichas distinguen fotos de suelo, vistas aéreas y cartografía: una ortofoto no cuenta como un segundo ángulo a nivel de suelo. Los paisajes 3, 6, 7, 8, 12, 15, 21 y 57 tienen alcance cartográfico aproximado; donde hay fotos próximas o regionales, sólo sustentan la apariencia que efectivamente muestran.

## Represa antigua y remanso

`naturalWater.ts` aporta las dos composiciones de agua al exportador de veintinueve entornos mediante `addWaterLandmark`. El ID 23 muestra el labio bajo de la represa vieja de Aguas Blancas, el descenso sobre lajas fracturadas y el monte ribereño observado en las fotografías. El terreno y la superficie del agua comparten sus márgenes; es una composición de detalle de ese sector, con escalas y profundidad interpretativas. La categoría geológica del Campamento Aguas Blancas y su relación con la zona de cizalla se mantienen en el contenido canónico.

En el ID 52, `prepare-cuervos-water.py` construye el cauce y su remanso a partir de la línea OSM, además de los polígonos complementarios de tierra. El terreno derivado del DEM se triangula con el hueco de agua y un perímetro cerrado. La canopia y las superficies claras se apoyan en la ortofoto IDE del entorno. El nivel, el ancho del agua y la forma ampliada del remanso sirven a la lectura de la miniatura; no son cotas o bordes relevados en campo. Se conserva la distinción entre esas aproximaciones, el trazado cartográfico documentado y las fotografías del operador.

Cada nueva exportación nace con QA pendiente en los datos del generador y del archivo. La aprobación de una versión concreta se registra aparte, en el ledger de referencias y los informes con SHA-256; no se vuelve a exportar un GLB sólo para cambiar esa etiqueta, porque cambiaría la huella del archivo revisado. Modificar la geometría exige una nueva comparación independiente.

## Revisión por capas

1. **Identidad**: corroborar lugar y descartar homónimos. El Cerro del Ombú de una tesis sobre Yaguarí/Curió al norte del país no es el ID 3 de Lavalleja. Casa de Campo El Destacamento no es el destacamento policial activo de Villa Serrana. Las fotos de la cantera ANCAP no se transfieren a Mina Verdún.
2. **Referencia visual**: estudiar varios ángulos y anotar los rasgos que distinguen el lugar. El fortín y anexo del Cura, la fisura alta de Colón, el alero bajo de Cueva Amarilla y los peldaños suspendidos de La Guarida requieren modelos distintos.
3. **Integridad geométrica**: verificar valores finitos, normales, escala, volumen visible desde frente y reverso, contacto con suelo y ausencia de geometría cerrando las entradas.
4. **Presupuesto**: menos de 150.000 triángulos y cien llamadas de dibujo por modelo. Exportador y manifiesto registran el conteo real. La carga es individual y el cierre libera geometrías, materiales y texturas.
5. **Comparación independiente**: el agente de control de calidad compara renders de los GLB exportados con las fotografías originales. `pending-independent-review` nunca significa aprobado.

Los informes y capturas viven en `reports/experience-review/rebuild-natural/`. Las brechas de la ficha no se ocultan mediante geometría genérica: cualquier ID sin evidencia suficiente debe quedar pendiente de aceptación visual y no se presenta como reconstrucción validada.

La revisión independiente de geometría aprobó los 49 modelos nuevos y confirmó que sus huellas coinciden con los GLB servidos. La revisión de Three.js aprobó dos vistas de escritorio de los 61 IDs y las 18 capturas de seis modelos en tres pantallas reducidas; también se comprobó el detalle de la casa del Cura con zoom. Son comprobaciones de alcance distinto: no se afirma una revisión individual de los 61 modelos en todos los tamaños. Los ocho paisajes cartográficos conservan sus límites, incluida la falta de perfil fotográfico exacto de los IDs 3 y 8. La ejecución completa de `npm run verify` terminó con código 0: 46 unitarias, 82 páginas HTML, 3 pruebas SEO y 61 pruebas de navegador aprobadas, con 3 omisiones previstas. El cierre autorizado se registra en `reports/experience-review/next-quality/final-quality-gate.json`; el detalle y los límites, en `validation-experience.md`.

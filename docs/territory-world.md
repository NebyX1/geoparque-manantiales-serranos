# Territorio y casas virtuales

## Forma horizontal

El terreno usa el contorno oficial de **Geoparque Manantiales Serranos: Límites del
Geoparque**, publicado por Intendencia de Lavalleja / IDE Uruguay:

- [Metadatos institucionales](https://visualizador.ide.uy/geonetwork/static/api/records/761171f4-b446-436d-9b70-dfe15bddc8b7).
- [Catálogo institucional que lista la capa](https://visualizador.ide.uy/geonetwork/srv/search?any=2026&fast=index).
- Capa WFS `ideuy:uyla_geoparque`, consultada en EPSG:4326 el 8/11/2026.
- Fuente original Catastro y ámbito de Minas, Solís de Mataojo, Villa Serrana y
  Marco de los Reyes; escala declarada 1:250.000. Licencia de Datos Abiertos Uruguay.

`territory.ts` importa el path ya proyectado de `boundary-path.json`: 1.307 puntos
únicos, equivalentes a 1.308 con cierre. Conserva la simplificación a 20 m y la
misma proyección de `geography.ts`, 400 m por unidad horizontal. El GeoJSON de
4.643 vértices no se incorpora al JavaScript del recorrido.

La superficie se triangula con Earcut y se refinan los lados largos mediante
bisección; el contorno no se reemplaza por un rectángulo, círculo o envolvente
convexa. El espesor, la cara inferior y la línea perimetral usan el mismo anillo.
Las concavidades permanecen abiertas. Las pruebas comparan el área triangulada
con la del polígono y verifican el sentido de las caras y los 61 puntos publicados.

`containsTerritory()` considera el borde dentro. `shoreDistance()` devuelve
distancia positiva dentro y negativa fuera, en unidades de escena.
`constrainToTerritory(x,z,fromX,fromZ)` detiene el desplazamiento en su primera
salida: un salto largo no puede atravesar un entrante y reaparecer en otra parte
del polígono. Sin posición anterior, un teletransporte exterior se recupera en
el interior próximo. Estas correcciones afectan al personaje, nunca a los pines.

## Relieve regional

La altura deja de proceder de Gaussianas inventadas. Se utiliza una muestra de
**Mapzen / Tilezen Terrain Tiles**, formato Terrarium, cuadrícula regional de
128 × 128 sobre aproximadamente 76,8 × 61,5 km. La malla representa relieve
global generalizado; no un levantamiento local, edificios, accesos ni cortes
recientes de canteras.

- [Formato y decodificación Terrarium](https://github.com/tilezen/joerd/blob/master/docs/formats.md).
- [Fuentes de los mosaicos](https://github.com/tilezen/joerd/blob/master/docs/data-sources.md).
- [Atribución](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).

Crédito: **Mapzen / Tilezen; global GMTED2010 and SRTM terrain data courtesy of
the U.S. Geological Survey; global ETOPO1 terrain data U.S. National Oceanic and
Atmospheric Administration**, según corresponda a los mosaicos globales.
El servidor actual no devolvió `X-Imagery-Sources` para estos tiles: no se afirma
que todos los valores provengan exclusivamente de SRTM. Se conservan las URLs,
SHA-256 y fechas `Last-Modified` devueltas en el snapshot.

RGB se decodifica como `R × 256 + G + B / 256 − 32768` antes de interpolar. Las
filas van de norte a sur y las columnas de oeste a este. El snapshot contiene
12 tiles a zoom 10, muestreo regional cercano a 600 m y alturas entre 16,27 y
414,303 m antes de redondear a décimas. Los decimales codificados no equivalen
a precisión vertical del terreno. El dibujo exagera la altura **seis veces**:

```text
y_escena = altura_metros × 6 / 400
```

El valor en metros continúa disponible como `territoryElevation()`; la altura
de representación como `territoryHeight()`. No hay descargas al proveedor en
tiempo de ejecución. Para regenerar, desde la raíz del repositorio:

```sh
python scripts/prepare-territory-elevation.py
```

El script utiliza `scripts/elevation_utils.py` y conserva los PNG fuente en la
caché de revisión. El contorno delimita la superficie; el relieve no se aplana
artificialmente junto al límite ni se excava un río supuesto.

## Casas de acceso a grupos

Las casas son **arquitectura virtual de navegación**, no lugares nuevos del
catálogo ni reconstrucciones de edificios existentes. `cluster-houses.ts`
construye ocho lenguajes diferentes: piedra circular, pabellón hexagonal de agua,
cabaña de madera con cubierta curva, patio con pórtico, pabellón de dos aguas,
galpón de ladrillo, marco de piedra/minero y observatorio abierto.

Las puertas tienen vano físico de al menos 4,4 × 5,2 unidades; los colliders dejan
libre ese paso. El edificio se devuelve en coordenadas del mundo; el interior,
en coordenadas locales con piso a cero y podios de 0,4 de altura. Las galerías
no tienen una cubierta o pared frontal completa que tape la cámara. Cada una
adopta el material, color y detalles de su casa; las letras identifican el grupo,
el número de lugares y los nombres/IDs recibidos del catálogo.

Los podios siguen el `layoutCluster()` de la aplicación y no modifican GPS.
Su separación de 24 unidades permite circular entre modelos de nueve unidades.
Los cuerpos estáticos se agrupan por material para reducir draw calls. Los
CanvasTexture de los letreros y las geometrías/materiales pertenecen al grupo;
el destructor de la escena debe recorrer y liberar todos esos recursos.

El mundo debe situar los modelos de galería sobre `y=0,4`, y mantener una
implantación de la casa con margen dentro del contorno. La altura del terreno
regional no certifica una plataforma o edificio físico en ese lugar.

El portal de salida pertenece a un subgrupo independiente, marcado
`userData.exitStructure`, para que sus columnas, dintel y letrero no se fusionen
con la sala. Al mirar hacia el interior, si el plano del portal queda entre
la cámara y el personaje, se oculta ese subgrupo; la marca baja de piso sigue
visible. Al mirar hacia la salida se restaura. Los letreros calculan distancia
con su posición mundial, incluso cuando pertenecen al portal anidado.

Fuera, el corte de cámara considera sólo los bounds de las mallas físicas de
cada casa, no sus letreros flotantes. Una casa que intersecta el segmento entre
la cámara real interpolada y el pecho del avatar se retira temporalmente si su
centro está antes del personaje; la casa situada delante del personaje sigue
visible. Cada frame restaura las casas que ya no obstruyen. Esta visibilidad no
modifica colliders, puertas ni ubicaciones, y actualiza las sombras al cambiar.

## Cursos de agua y vías reales

El escenario dispone de trazados públicos oficiales descargados del WFS de IDE
Uruguay, sin llamadas al servicio durante el recorrido:

- [Hidrografía nacional consolidada, líneas](https://visualizador.ide.uy/geonetwork/static/api/records/74408873-0bb7-4fde-8146-512493f0a11b), capa publicada `ideuy:hidro_cnsolidada_l`.
- [Ejes viales](https://visualizador.ide.uy/geonetwork/static/api/records/529ae824-1b11-434d-92fd-7a6205a573c6), capa `ideuy:ejes_viales_ide`, versión del servicio al 30/10/2026.

Crédito: **IDE Uruguay / AGESIC**, bajo la **Licencia de Datos Abiertos Uruguay**.
La hidrografía se origina en el relevamiento aerofotogramétrico 2017–2018; su
consolidación fue publicada en 2026. Los ejes viales incorporan ese relevamiento
y diversas fuentes verificadas. No se declara que estos datos acrediten un
camino transitable, una habilitación o una altura actual de lámina de agua.

La selección contempla Santa Lucía, Solís Grande, Campanero Grande/Chico,
San Francisco, Penitente, Mataojo, Marmarajá, Soldado y Aiguá, según los nombres
publicados que intersectan el ámbito. Son **trazos seleccionados**, no la red
hidrográfica completa. La selección vial incluye referencias 8, 12, 60 y 81:
Ruta 81 aparece en el nomenclátor como `via_tipo=CALLE`, `via_nombre=RUTA 81`
y `ruta_num=null`; su número se toma del nombre explícito, sin convertirla en
ruta nacional por inferencia.

Se solicitaron geometrías EPSG:4326 en el bbox `[-55.551,-34.636,-54.714,-34.082]`.
Los elementos que intersectan un bbox pueden continuar fuera; por eso se
proyectan con la misma función local, se simplifican con Douglas–Peucker a
20 m y se recortan segmento a segmento al contorno cóncavo oficial. Sólo se
unen extremos exactamente coincidentes, sin dibujar puentes sobre huecos.
Las pruebas muestrean cada segmento para detectar salidas del polígono.

Estadísticas de la instantánea: 15 entidades hidrográficas y 209 tramos viales
seleccionados; 206.211 vértices originales, 6.966 tras simplificación y **2.516**
tras recorte y unión. Se conservan 237 polilíneas de agua y 33 viales; las ramas
discontinuas deben componerse en una geometría por material para reducir draw
calls, sin conectarlas artificialmente. El ancho visible y el desplazamiento
vertical del dibujo siguen siendo escénicos.

Las URLs WFS reproducibles y los identificadores de las entidades están en
`territory-routes.json`; las respuestas originales y URLs separadas quedan en
`reports/experience-review/geography/routes/`. Huellas de las respuestas:

| Archivo original                 | SHA-256                                                            |
| -------------------------------- | ------------------------------------------------------------------ |
| `ide-waterways-original.geojson` | `79492351c2c468a4c84231ce3779a803b461cd0c87ed7817f0ea7049f5a1adb1` |
| `ide-roads-original.geojson`     | `fdeb8a0f07a11f2f27f1c1921b5f1a43caf0eb55cd82f44992a87752b25eb581` |

`python scripts/prepare-territory-routes.py` regenera el snapshot a partir de
esas respuestas guardadas. La API de Overpass principal devolvió HTTP 502 y el
servidor alternativo agotó el tiempo; no se usaron datos de OSM para estas
geometrías ni se creó un sustituto ficticio.

## Distribución de vegetación en miniaturas naturales

`miniatures/rebuilt/landcover-samples.json` aporta una cuadrícula de 32 × 32
celdas para los lugares 3, 6, 7, 8, 12, 15, 21 y 57. Cada recorte utiliza el
centro y la extensión del DEM de esa miniatura: norte hacia `z` negativo,
12 unidades de ancho y profundidad proporcional. Las posiciones proceden de
los datos geográficos; los interiores de las casas siguen siendo expositivos.

Se consultó la [ortofoto nacional de IDE Uruguay / AGESIC](https://catalogodatos.gub.uy/dataset/ide-ortoimagen-mdt-de-cobertura-nacional),
relevamiento 2017–2018, mediante WMS `ortofotos:ortofoto_nacional`. El JSON guarda
URL, bbox, SHA-256 y umbrales de cada imagen. Sólo se distribuyen clases y
fracciones numéricas, sin texturas aéreas. El relevamiento está publicado bajo
la Licencia de Datos Abiertos Uruguay.

Las etiquetas `forest`, `rock` y `field` son una clasificación visual de
apariencia, comprobada sobre cada ortofoto, para evitar anillos de árboles o
rocas colocadas sin referencia. No certifican uso del suelo, especies ni bosque
nativo: `forest` puede incluir plantaciones, matorral, sombras y agua; los
tonos de `rock` también pueden corresponder a caminos, construcciones o pasto
seco; `field` es el resto de la imagen. El relieve procede del DEM, no del color.

La calibración utiliza un umbral de luminancia por imagen y verde relativo;
en Campanero se limita la luminancia a 65 porque el corte automático de 89
incluía el pastizal de la ladera. Las fracciones conservan incertidumbre dentro
de cada celda. Los cauces se toman de la hidrografía oficial y pueden quedar
ocultos por copas en la ortofoto. Las clases no justifican inventar grandes
peñascos, edificios o una especie de árbol determinada.

Los originales, superposiciones revisadas y el generador de esta extracción
quedan en `reports/experience-review/next-quality/gap-research/landcover/` y
`scripts/models/prepare-landmark-landcover.py`. Desde la raíz del repositorio,
`python scripts/models/prepare-landmark-landcover.py` reutiliza la caché de
ortofotos o consulta las URLs WMS documentadas, aplica los umbrales calibrados
incluido el límite manual de Campanero y regenera el JSON y las superposiciones.
Necesita `requests` y Pillow. Son evidencia de trabajo; no se incluyen
fotografías de investigación en los recursos públicos del sitio.

## Medición del mundo y liberación de recursos

El 08/11/2026 se ejecutó un arnés local de Chromium a 1440 × 900, DPR 1 y
movimiento reducido, con copias de los módulos del mundo anterior y actual.
Las doce miniaturas heredadas utilizaron los mismos generadores actuales en
ambas copias. El renderizador fue ANGLE/Vulkan con **SwiftShader**; los tiempos
miden envío de comandos de `update()` y `render()` desde JavaScript, no duración
completa en GPU ni FPS de un dispositivo de producción.

En ese control exterior la mediana fue 1,2 ms en ambos mundos y el p95 pasó de
1,6 a 1,7 ms. Las llamadas de dibujo fueron 59 y 60; los buffers, 173 y 161;
las texturas, 11 en ambos. Cada una de las doce inspecciones mostró el ID real
solicitado y el mismo número de llamadas de dibujo en las dos versiones.
El contorno, relieve y composición de los mundos son diferentes: estos datos
no prueban una mejora universal ni una comparación de escenas idénticas.

Con los 61 lugares y ocho casas, el exterior registró 46 llamadas de dibujo
y mediana/p95 de 1,4/1,9 ms; la sala de Minas, 42 y 1,2/1,4 ms; la inspección
de un modelo, 10 y 0,6/0,8 ms. En la sala hubo como máximo tres miniaturas
adjuntas y una construcción simultánea. Tras cinco ciclos de entrada,
inspección y salida, cada retorno al mismo punto exterior conservó exactamente
292 buffers, 11 texturas, 25 programas, 177 VAO y una miniatura. No hubo aumento
en esos contadores durante la prueba acotada.

La prueba de solicitudes obsoletas introdujo una demora de 100 ms únicamente
en esa fase, solicitó ocho destinos rápidamente y terminó con el destino
vigente. Se liberaron las 38 miniaturas creadas; al destruir el mundo quedaron
cero construcciones pendientes, cero miniaturas y el contexto WebGL perdido
explícitamente. Los contadores representan llamadas WebGL observadas, no toda
la memoria interna del controlador.

Una primera ejecución encontró un HTTP 504 `Outdated Optimize Dep` del Vite
temporal al importar Salus. Esa comparación se conservó como fallida y se
repitieron las doce inspecciones con caché aislada y dependencias explícitas;
la repetición completó sin errores HTTP, de consola ni de modelos. No se
ocultó el fallo original ni se contabilizó una miniatura ausente como válida.

El informe, datos JSON, huellas SHA-256 y arnés reproducible están en
`reports/experience-review/next-quality/performance/benchmark-report.md`.
Se ejecuta con Node 22.22.3+ y servidor temporal 4325, sin concurrir con las
suites de navegador del proyecto. La fuente actual medida tiene SHA-256
`bc8f04687e5a6787ccda8da27d5a6fe4197aa8c33330c047a64ae20df42f2bff`.

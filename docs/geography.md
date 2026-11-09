# Geografía documentada del geoparque

Consulta y descarga: **8 de noviembre de 2026**. La colección editorial continúa en
`src/data/geosites.ts`. `src/data/geography.ts` añade posiciones y procedencia por ID;
no mantiene una segunda colección de nombres, textos o estados.

## Cobertura y significado de las posiciones

Las **61 fichas tienen una referencia geográfica**: 51 documentadas por una fuente
institucional, científica u operadora y **10 aproximadas**, sin referencias
pendientes en esta revisión. Esto no equivale a 61 coordenadas exactas ni a 61
entradas habilitadas. Cada registro conserva el significado y la limitación de su
fuente. Si una ficha pierde su referencia, el adaptador mantiene `location: null`,
`position: null` y ningún pin; no la completa con el centro de Minas o un lugar vecino.

`verified_documented` significa que la coordenada está documentada para ese lugar.
No significa levantamiento topográfico, entrada habilitada, estacionamiento,
permiso de visita o disponibilidad actual. La escala de origen de la capa oficial
es 1:55.000; sus decimales reproyectados no declaran precisión de terreno.

Los registros aproximados explicitan qué representan:

| ID  | Referencia y límite de precisión                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15  | Cerro Campanero: la propia capa institucional publica sólo `-34.4, -55.15`.                                                                                 |
| 51  | Monte de Ombúes: nodo OSM dentro del bosque, no entrada ni sendero habilitado.                                                                              |
| 52  | Laguna de los Cuervos: nodo OSM del establecimiento, corroborado por web y contactos del operador; no centro del cauce.                                     |
| 54  | Villa Serrana: centro representativo de la localidad en OSM/Nominatim. La ficha describe el conjunto urbano; no se sustituye por el Ventorrillo o el Mesón. |
| 56  | Mangas de Piedra y Cerro de la Leona: referencia del mapa de la actividad del operador, no cumbre ni acceso confirmado.                                     |
| 57  | Reserva El Abra: coordenada de una guía oficial con separadores no estándar, normalizada explícitamente al hemisferio sur/oeste.                            |
| 58  | Valle del Hilo de la Vida: referencia comercial de la posada turística, no corroborada con el operador; no estructuras arqueológicas ni entrada habilitada. |
| 59  | Cerro Místico: nodo OSM del hotel, corroborado por el operador; no cumbre ni recepción exacta.                                                              |
| 60  | Museo de Réplicas en Miniaturas: domicilio del MEC localizado por el portal de IDE/SUDIR; no puerta exacta o permiso de visita.                             |
| 61  | Molino Viejo: nodo OSM del edificio, corroborado por la dirección del MEC; no entrada habilitada.                                                           |

El Valle del Hilo de la Vida (58) usa únicamente la **referencia comercial de la
posada turística**, publicada por Portales del Uruguay. No se logró corroborar
esa ubicación con el operador: su web respondió sin contenido durante esta
consulta. El marcador no localiza las estructuras arqueológicas del valle, no
identifica una entrada exacta ni acredita ingreso habilitado o disponibilidad
actual. La coordinación previa sigue siendo necesaria.

El Museo de Réplicas en Miniaturas (60) usa una **referencia del domicilio**:
el MEC publica Carabajal 322, Minas, y la API oficial IDE/SUDIR devuelve el portal
322 de la calle que denomina `CORONEL M. CARBAJAL`. La consulta libre y la búsqueda
estructurada por calle/portal coinciden en el registro 726988. Se conserva como
aproximada por representar el domicilio, sin afirmar puerta exacta del museo o
entrada habilitada. No se realizó interpolación propia.

La Cueva Amarilla (18) está localizada en la capa pública institucional. Se
conserva su carácter arqueológico y de investigación: el punto no habilita visita
espontánea ni se interpreta como acceso público. La Gruta Colón (50) usa la
referencia pública del programa de conservación de murciélagos, con manejo privado
y acceso restringido acompañado. En ambos casos permanecen los estados y textos
canónicos de visita.

## Fuentes oficiales y complementarias

### Geositios 1–49

[Intendencia de Lavalleja / IDE Uruguay, Geoparque Manantiales Serranos: Geositios](https://visualizador.ide.uy/geonetwork/static/api/records/dca18d8e-d5cf-4f26-ab41-2ea393a4c358).
Capa `ideuy:uyla_geositios`, metadatos del 22/05/2026, información del Área Turismo
de IDL y actualización cartográfica de 2026. La descarga contiene 49 `MultiPoint`
de un punto, con IDs únicos 1–49. Se contrastaron ID y nombre con el catálogo
editorial; no se usa el orden de los elementos del GeoJSON como identificador.

[Descarga WFS en EPSG:4326](https://mapas.ide.uy/geoserver-vectorial/ideuy/uyla_geositios/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=ideuy:uyla_geositios&outputFormat=application%2Fjson&srsName=EPSG:4326).
El CRS original declarado es EPSG:32721. El GeoJSON descargado usa el orden
**longitud, latitud**, y se transforma explícitamente al contrato
`latitude`, `longitude` de la aplicación.

### Límite territorial

[Intendencia de Lavalleja / IDE Uruguay, límite del Geoparque Manantiales Serranos](https://visualizador.ide.uy/geonetwork/srv/api/records/761171f4-b446-436d-9b70-dfe15bddc8b7).
Capa `ideuy:uyla_geoparque`, metadatos del 22/05/2026, escala 1:250.000. La fuente
deriva de las secciones catastrales 1, 2 y 7 de Lavalleja; no representa el límite
de todo el departamento.

[Descarga WFS en EPSG:4326](https://mapas.ide.uy/geoserver-vectorial/ideuy/uyla_geoparque/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=ideuy:uyla_geoparque&outputFormat=application%2Fjson&srsName=EPSG:4326).
Se conserva el `MultiPolygon` oficial: un polígono, un anillo y 4.643 vértices.

### Experiencias 50–61

| IDs | Procedencia                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 50  | [RELCOM / Programa para la Conservación de los Murciélagos de Uruguay, SICOM S-UR-002](https://relcomlatinoamerica.net/sicoms/gruta-arequita/). El pin rotulado es `34°17′08.9″ S, 55°16′04.4″ O`; el centro de vista del iframe no se toma como posición del refugio.                                                                |
| 51  | [OSM, nodo 5274275321](https://www.openstreetmap.org/node/5274275321), con contexto del [Parque Nacional Arequita, Ministerio de Ambiente](https://www.ambiente.gub.uy/oan/snap/parque-nacional-arequita/).                                                                                                                           |
| 52  | [OSM, nodo 6416153797](https://www.openstreetmap.org/node/6416153797), con identidad corroborada en [Laguna de los Cuervos](https://www.lagunadeloscuervos.com.uy/).                                                                                                                                                                  |
| 53  | [CND, obra Camping Arequita para IDL, entidad 9766](https://mapa.cnd.org.uy/es/node/9766). Se usa el punto de obra/complejo del mapa Leaflet, no una puerta. No se reutiliza el JSON-LD contradictorio del sitio comercial.                                                                                                           |
| 54  | [OSM, relación 2562628](https://www.openstreetmap.org/relation/2562628), centro representativo consultado mediante Nominatim; ámbito corroborado por el [Plan Local de Villa Serrana, IDL](https://www.gub.uy/intendencia-lavalleja/tematica/plan-local-villa-serrana).                                                               |
| 55  | [Parque La Guarida, Cómo llegar](https://laguarida.com.uy/), coordenadas DMS publicadas por el operador y convertidas aritméticamente.                                                                                                                                                                                                |
| 56  | [Experiencias Villa Serrana, Mangas de Piedra](https://experienciasvillaserrana.com.uy/st_tour/mangas-de-piedra/), mapa de la actividad.                                                                                                                                                                                              |
| 57  | [Ministerio de Turismo, guía del Día del Patrimonio 2022](https://www.gub.uy/ministerio-turismo/sites/ministerio-turismo/files/documentos/noticias/Patrimonio2022.pdf), con normalización documentada del formato numérico.                                                                                                           |
| 58  | [Portales del Uruguay, Valle del Hilo de la Vida Eco Lodge, ID 25240](https://www.portalesdeluruguay.com.uy/en/alojamientos/country-inn/valle-del-hilo-de-la-vida-eco-lodge). Referencia comercial de la posada en JSON-LD y sus indicaciones; no corroborada con el operador.                                                        |
| 59  | [OSM, nodo 7010044977](https://www.openstreetmap.org/node/7010044977), corroborado por [Cerro Místico](https://www.cerromistico.com/pages/enlace.php).                                                                                                                                                                                |
| 60  | [IDE/SUDIR, consulta estructurada del portal 322 en calle 18885](https://direcciones.ide.uy/api/v1/geocode/find?type=CALLEyPORTAL&idcalle=18885&portal=322), registro 726988; domicilio corroborado por el [MEC](https://www.museos.gub.uy/index.php/museos/museos-por-localidad/lavalleja/item/585-museo-de-replicas-en-miniaturas). |
| 61  | [OSM, nodo 6693848991](https://www.openstreetmap.org/node/6693848991), corroborado por la [ficha del Museo del Molino Viejo, MEC](https://www.museos.gub.uy/index.php?id=253%3Amuseo-del-molino-viejo&option=com_k2&view=item).                                                                                                       |

### Evidencia de las referencias incorporadas en la revisión final

Para el ID 58, el JSON-LD de la ficha comercial publica `@type: BedAndBreakfast`,
`name: Country Inn Valle del Hilo de la Vida - Eco Lodge` y
`geo: {latitude: -34.442158, longitude: -55.236637}`. El identificador de publicación
es 25240. Esta evidencia identifica la posada turística de la publicación, sin
atribuirle verificación del operador o una ubicación de estructuras arqueológicas.

Para el ID 60, [direcUnica de IDE/SUDIR](https://direcciones.ide.uy/api/v1/geocode/direcUnica?q=Carabajal%20322%2C%20Minas%2C%20Lavalleja&limit=3)
y la consulta estructurada `find` devuelven el mismo registro: tipo `CALLEyPORTAL`,
ID `726988`, `idCalle: 18885`, `portalNumber: 322`, localidad `MINAS`, departamento
`LAVALLEJA`, `source: ide_uy`, `state: 1`, `stateMsg: ""`,
`lat: -34.377108276779744`, `lng: -55.22923863682804`. Se conserva literalmente la
variante del nomenclátor `CORONEL M. CARBAJAL`, diferenciada del nombre Carabajal
publicado por el MEC. [Documentación de la API](https://direcciones.ide.uy/swagger-ui.html)
y [descripción oficial del servicio público de direcciones](https://www.gub.uy/infraestructura-datos-espaciales/tramites-y-servicios/servicios/servicio-direcciones-geograficas).
Ambas referencias se consultaron el 08/11/2026 y se clasifican como aproximadas.

Las notas de cada registro conservan las diferencias entre hito, conjunto,
establecimiento y acceso. Por ejemplo, Campamento Aguas Blancas (23) y Camping
Aguas Blancas (24) mantienen puntos distintos; Parque de Minas (17) no se convierte
en un parque del centro de la ciudad; los sectores de Salus no se presentan como
si compartieran una única entrada.

## Proyección y contorno

La proyección local usa centro `lat=-34.359205175`, `lon=-55.13268945`,
`111195 m` por grado de latitud y el coseno de la latitud central para la longitud.
Una unidad de escena representa **400 m** horizontalmente:

```text
x = (longitud - longitud_central) × 111195 × cos(latitud_central) / 400
z = -(latitud - latitud_central) × 111195 / 400
```

Este y norte corresponden a `+x` y `-z`. No se desplazan puntos para despejar
solapamientos. Las casas virtuales separan sus exposiciones en salas; esas posiciones no se exportan como GPS ni cambian los pines. Las etiquetas pueden desplazarse respecto de su ancla. El relieve y las miniaturas son representaciones visuales; esta proyección sólo documenta posiciones horizontales y contorno.

El path SVG se genera a partir del polígono oficial proyectado, con
Douglas–Peucker a **20 m**, cierre del anillo conservado y redondeo a `0.000001`
unidades de escena. El resultado tiene 1.308 vértices; el máximo error medido de
los vértices originales al contorno simplificado es **19,948 m**. El path y los
puntos usan las mismas coordenadas `x,z`. Su caja es
`[-95.991040,-76.879071,95.991040,76.879071]`.

El inventario de las fichas importa `locations.json` y el path precomputado. El mundo utiliza además las instantáneas preparadas de elevación y trazados; los GeoJSON completos de procedencia no se importan al paquete de la experiencia.

## Evidencia, hashes y mantenimiento

Los GeoJSON originales y los XML de metadatos están en
`reports/experience-review/geography/`. Los snapshots de `src/data/geography/`
conservan geometrías, IDs y propiedades; su formato JSON se adapta al estilo del
repositorio. El path simplificado registra el hash del snapshot del cual deriva.

| Descarga original                   | SHA-256                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| `ideuy-geosites-2026-11-08.geojson` | `81185f67c4f9301ac64aba54db8e74eb58a55c115910fc642931ce255b1227cf` |
| `ideuy-boundary-2026-11-08.geojson` | `4dbd0b64c230d74f101efb3ca3e4fccfe1814091c861d35b817aaa71eba81c8b` |
| `ideuy-geosites-metadata.xml`       | `b462ba7db6b3342a3f1cd1e5fa5abd152bb65ff5fc2bb4d3443313e833be0aa7` |
| `ideuy-boundary-metadata.xml`       | `4e49297408e7d60d37e9e5e50cce36f6809416421ad91da5a10a10937b1c6787` |

| Snapshot con formato del repositorio        | SHA-256                                                            |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `src/data/geography/official-geosites.json` | `ee718c8995c2032d42caa16f974a8622675e28e4d3e6bcab025c0cdc49d877d7` |
| `src/data/geography/official-boundary.json` | `729386259a316187f980fbd7d3663c6b3754c839c7112e74aa52ab5fd65e8d1d` |

Para actualizar: volver a descargar las capas con CRS explícito; comparar IDs y
nombres con el catálogo; conservar la evidencia y sus hashes; revisar cambios de
precisión y significado; regenerar posiciones y path con esta misma proyección;
comprobar cobertura, pertenencia al contorno, orientación norte/este y error de
simplificación. Un fallo de fuente no debe introducir coordenadas de sustitución.

## Licencia y atribución

IDL/IDE Uruguay publican las capas bajo la
[Licencia de Datos Abiertos Uruguay](https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/comunicacion/publicaciones/licencia-datos-abiertos-uruguay-0).
Se identifica proveedor, conjunto, fecha y transformación. Las referencias OSM
requieren atribución a [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
y su licencia ODbL. Los datos institucionales y los comunitarios conservan su
procedencia diferenciada en cada registro.

Texto de atribución de la representación: **“Geositios y límite: Intendencia de
Lavalleja / IDE Uruguay, Licencia de Datos Abiertos Uruguay. Referencias
comunitarias: © OpenStreetMap contributors, ODbL. Consulta: 08/11/2026. Coordenadas
adaptadas a escala reducida; límite simplificado.”**

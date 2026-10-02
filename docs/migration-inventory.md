# Inventario de migración

Referencia canónica: `Manantiales_Serranos_v2.html`. Auditoría completa del DOM, datos, CSS y JavaScript realizada el 2 de octubre de 2026.

Referencia técnica inspeccionada: Semana de Lavalleja (package/config, layouts, components/islands/layout/sections/seo, config/data/types, features/site/motion/agenda, lib/pages, estilos, Docker/Nginx/Compose, Vitest/Playwright/ESLint y documentación).

## Secciones y estructura

| Elemento        | Controles | SVG | Imágenes | Estado  |
| --------------- | --------: | --: | -------: | ------- |
| inicio          |         5 |  12 |        8 | Migrado |
| geopark-ticker  |         0 |   8 |        0 | Migrado |
| trust-strip     |         0 |   0 |        1 | Migrado |
| section intro   |         0 |   2 |        0 | Migrado |
| geo-intro       |         0 |   1 |        0 | Migrado |
| historia        |        10 |  14 |        4 | Migrado |
| explorar        |        71 | 124 |       61 | Migrado |
| territorio      |        13 |  14 |        1 | Migrado |
| naturaleza      |         0 |   9 |        1 | Migrado |
| cultura         |         0 |   4 |        1 | Migrado |
| circuitos       |         0 |   6 |        3 | Migrado |
| planificador    |         5 |   2 |        0 | Migrado |
| aprender        |         1 |   3 |        1 | Migrado |
| section gallery |         5 |   5 |        4 | Migrado |
| visita          |         1 |   9 |        0 | Migrado |

## Funciones y estados

- [x] Marca y sprite de iconos SVG; navegación desktop/mobile; skip link; progreso y volver arriba
- [x] Hero: cuatro fotografías, captions, contador, tabs, flechas/Home/End, pausa, temporizador 8,5 s, visibilidad y parallax
- [x] Ticker animado, sellos e instituciones, introducción editorial y vínculo al artículo del geoparque
- [x] Cuatro capítulos geológicos: colores, polaroids, estratos, halos, dígitos, transforms/opacidad, scroll nativo RAF, pinning, carousel móvil, swipe, teclado y progreso
- [x] Atlas: 61 fichas, GMS, destacados, categorías/temas, texto normalizado, zonas, modalidades, chips, paginación, vacío y contador
- [x] Buscador global: lugares/historias, diálogo, shortcut /, resultados y estado vacío
- [x] Mapa SVG: territorio, rutas ilustradas, ocho pines, teclado, lista, selección, preview, zoom 1–2,5, reset y mapa original en lightbox
- [x] Naturaleza: biodiversidad, agua, gruta, paisajes y vínculos editoriales
- [x] Cultura: memoria, arquitectura, gastronomía, arqueología y fichas relacionadas
- [x] Tres circuitos con días, bloques, lugares y guardado acumulativo
- [x] Planner: cinco intereses, uno a tres días y propuestas preservando elecciones previas
- [x] Geoeducación: programa rural y quiz de cinco preguntas, feedback, score y reinicio
- [x] Galería: 12 fotografías, botón de apertura, previo/siguiente, Escape, teclado y captions
- [x] Visita: advertencias, guía de bolsillo Markdown, enlaces, Instagram y consultas
- [x] Mi viaje: favoritos, contador, clave v1, añadir/quitar, ordenar, asignar días, fecha inicial, memoria si falla storage, sincronización pestañas
- [x] Exportaciones: Markdown, copiar con fallback, impresión y calendario ICS con plegado UTF-8 y visitas tentativas
- [x] Siete diálogos: ficha, búsqueda, viaje, circuito, artículo, quiz y galería; backdrop, foco inicial, Escape, retorno de foco y scroll lock
- [x] Footer, marca, logos institucionales, privacidad y control manual de movimiento
- [x] Observers: reveals, hero visibility y navegación activa; resize, fonts.ready y document visibility
- [x] Responsive completo, focus/hover, prefers-reduced-motion, flujo estático sin JavaScript

## Fichas canónicas (61)

| GMS    | Slug                                            | Nombre                                             | Bloques | Modalidad            | Estado  |
| ------ | ----------------------------------------------- | -------------------------------------------------- | ------: | -------------------- | ------- |
| GMS-01 | cerro-arequita                                  | Cerro Arequita                                     |       5 | Coordinación previa  | Migrado |
| GMS-02 | cerro-del-cura                                  | Cerro del Cura                                     |       2 | Consultar acceso     | Migrado |
| GMS-03 | cerro-del-ombu                                  | Cerro del Ombú                                     |       2 | Consultar acceso     | Migrado |
| GMS-04 | nacientes-del-rio-santa-lucia                   | Nacientes del Río Santa Lucía                      |       3 | Visita no confirmada | Migrado |
| GMS-05 | el-destacamento                                 | El Destacamento                                    |       8 | Coordinación previa  | Migrado |
| GMS-06 | reserva-artistica-kyky-o                        | Reserva Artística KyKy-Ó                           |       8 | Coordinación previa  | Migrado |
| GMS-07 | paso-de-la-arena                                | Paso de la Arena                                   |       2 | Consultar acceso     | Migrado |
| GMS-08 | cerro-marmaraja                                 | Cerro Marmarajá                                    |       2 | Consultar acceso     | Migrado |
| GMS-09 | represa-stewart-vargas                          | Represa Stewart Vargas                             |       3 | Paseo por el entorno | Migrado |
| GMS-10 | meson-de-las-canas                              | Mesón de las Cañas                                 |      10 | Coordinación previa  | Migrado |
| GMS-11 | ventorrillo-de-la-buena-vista                   | Ventorrillo de la Buena Vista                      |       9 | Coordinación previa  | Migrado |
| GMS-12 | granito-villa-serrana                           | Granito Villa Serrana                              |       3 | Visita no confirmada | Migrado |
| GMS-13 | cantera-del-portugues                           | Cantera del Portugués                              |       2 | Consultar acceso     | Migrado |
| GMS-14 | salto-del-penitente                             | Salto del Penitente                                |      13 | Coordinación previa  | Migrado |
| GMS-15 | cerro-campanero                                 | Cerro Campanero                                    |       2 | Consultar acceso     | Migrado |
| GMS-16 | parque-represa-de-ose                           | Parque Represa de OSE                              |       5 | Coordinación previa  | Migrado |
| GMS-17 | parque-de-minas                                 | Parque de Minas                                    |      10 | Coordinación previa  | Migrado |
| GMS-18 | cueva-amarilla                                  | Cueva Amarilla                                     |       5 | Visita no confirmada | Migrado |
| GMS-19 | mirador-ramallo                                 | Mirador Ramallo                                    |       2 | Consultar acceso     | Migrado |
| GMS-20 | cantera-libro-gigante                           | Cantera Libro Gigante                              |       2 | Consultar acceso     | Migrado |
| GMS-21 | abra-de-zabaleta                                | Abra de Zabaleta                                   |       2 | Coordinación previa  | Migrado |
| GMS-22 | templo-budista-chagdud-gonpa-sengue-dzong       | Templo Budista Chagdud Gonpa Sengue Dzong          |       3 | Visita no confirmada | Migrado |
| GMS-23 | campamento-aguas-blancas                        | Campamento Aguas Blancas                           |       2 | Coordinación previa  | Migrado |
| GMS-24 | camping-aguas-blancas                           | Camping Aguas Blancas                              |       6 | Coordinación previa  | Migrado |
| GMS-25 | cerro-la-caperuza                               | Cerro La Caperuza                                  |       2 | Consultar acceso     | Migrado |
| GMS-26 | parque-mataojo                                  | Parque Mataojo                                     |       5 | Paseo por el entorno | Migrado |
| GMS-27 | casa-de-la-cultura-solis                        | Casa de la Cultura - Solís                         |       2 | Consultar acceso     | Migrado |
| GMS-28 | edificio-cuna-de-fabini                         | Edificio "Cuna de Fabini"                          |       2 | Consultar acceso     | Migrado |
| GMS-29 | plaza-lazaro-cortes                             | Plaza Lázaro Cortés                                |       2 | Paseo por el entorno | Migrado |
| GMS-30 | plaza-de-deportes                               | Plaza de Deportes                                  |       2 | Consultar acceso     | Migrado |
| GMS-31 | reserva-natural-parque-salus                    | Reserva Natural Parque Salus                       |      11 | Coordinación previa  | Migrado |
| GMS-32 | mina-ancap                                      | Mina ANCAP                                         |       2 | Consultar acceso     | Migrado |
| GMS-33 | cerro-del-verdun                                | Cerro del Verdún                                   |      11 | Coordinación previa  | Migrado |
| GMS-34 | mina-verdun                                     | Mina Verdún                                        |       4 | Consultar acceso     | Migrado |
| GMS-35 | centro-cultural-angel-ugarte-ex-estacion-de-afe | Centro Cultural Ángel Ugarte ( Ex Estación de AFE) |       5 | Consultar acceso     | Migrado |
| GMS-36 | museo-stelio-belloni                            | Museo Stelio Belloni                               |       2 | Consultar acceso     | Migrado |
| GMS-37 | edificio-escuela-1-de-practicas-artigas         | Edificio Escuela 1 de Prácticas "Artigas"          |       2 | Consultar acceso     | Migrado |
| GMS-38 | edificio-escuela-8-guillermo-cuadri             | Edificio Escuela 8 "Guillermo Cuadri"              |       2 | Consultar acceso     | Migrado |
| GMS-39 | plaza-libertad                                  | Plaza Libertad                                     |       3 | Paseo por el entorno | Migrado |
| GMS-40 | confiteria-irisarri                             | Confitería Irisarri                                |       9 | Coordinación previa  | Migrado |
| GMS-41 | catedral-de-la-inmaculada-concepcion-de-minas   | Catedral de la Inmaculada Concepción de Minas      |       9 | Coordinación previa  | Migrado |
| GMS-42 | casa-de-la-cultura                              | Casa de la Cultura                                 |      12 | Coordinación previa  | Migrado |
| GMS-43 | cementerio-central                              | Cementerio Central                                 |       2 | Consultar acceso     | Migrado |
| GMS-44 | museo-alfajores-de-las-sierras-de-minas         | Museo Alfajores de las Sierras de Minas            |      10 | Coordinación previa  | Migrado |
| GMS-45 | teatro-lavalleja                                | Teatro Lavalleja                                   |       9 | Coordinación previa  | Migrado |
| GMS-46 | cerro-artigas                                   | Cerro Artigas                                      |       5 | Paseo por el entorno | Migrado |
| GMS-47 | casa-curbelo-baez                               | Casa Curbelo Báez                                  |       2 | Consultar acceso     | Migrado |
| GMS-48 | iglesia-santa-teresita                          | Iglesia Santa Teresita                             |       2 | Consultar acceso     | Migrado |
| GMS-49 | parque-rodo                                     | Parque Rodó                                        |       5 | Paseo por el entorno | Migrado |
| GMS-50 | gruta-colon-y-conservacion-de-murcielagos       | Gruta Colón y conservación de murciélagos          |       3 | Coordinación previa  | Migrado |
| GMS-51 | monte-de-ombues-del-entorno-de-arequita         | Monte de Ombúes del entorno de Arequita            |       2 | Consultar acceso     | Migrado |
| GMS-52 | laguna-de-los-cuervos-y-entorno                 | Laguna de los Cuervos y entorno                    |       9 | Coordinación previa  | Migrado |
| GMS-53 | camping-arequita                                | Camping Arequita                                   |       9 | Coordinación previa  | Migrado |
| GMS-54 | villa-serrana-el-conjunto-urbano-y-paisajistico | Villa Serrana: el conjunto urbano y paisajístico   |       5 | Paseo por el entorno | Migrado |
| GMS-55 | la-guarida                                      | La Guarida                                         |       8 | Coordinación previa  | Migrado |
| GMS-56 | mangas-de-piedra-y-cerro-de-la-leona            | Mangas de Piedra y Cerro de la Leona               |      11 | Coordinación previa  | Migrado |
| GMS-57 | reserva-el-abra                                 | Reserva El Abra                                    |       8 | Consultar acceso     | Migrado |
| GMS-58 | valle-del-hilo-de-la-vida                       | Valle del Hilo de la Vida                          |       8 | Coordinación previa  | Migrado |
| GMS-59 | cerro-mistico                                   | Cerro Místico                                      |      11 | Coordinación previa  | Migrado |
| GMS-60 | museo-de-replicas-en-miniaturas                 | Museo de Réplicas en Miniaturas                    |       8 | Coordinación previa  | Migrado |
| GMS-61 | molino-viejo-de-minas                           | Molino Viejo de Minas                              |       2 | Visita no confirmada | Migrado |

## Relatos, circuitos y recursos

- [x] Historia `geoparque`: Un territorio. Muchas formas de descubrirlo. (4 apartados).
- [x] Historia `agua`: El viaje invisible del agua (4 apartados).
- [x] Historia `biodiversidad`: La vida que crece entre las rocas (4 apartados).
- [x] Historia `memoria`: El territorio también se cuenta en voz humana (4 apartados).
- [x] Historia `sabores`: Los recuerdos también se llevan a la mesa (4 apartados).
- [x] Historia `arqueologia`: Las historias que guarda la piedra. (4 apartados).
- [x] Historia `educacion`: La próxima clase puede empezar afuera (4 apartados).
- [x] Historia `conservacion`: Que el paisaje también te recuerde bien (4 apartados).
- [x] Circuito `agua-bosque`: Agua, bosque y asombro.
- [x] Circuito `arequita`: Un encuentro con Arequita.
- [x] Circuito `villa-serrana`: Arquitectura para quedarse.
- [x] Asset `aguas`: extraer original y mantener uso/caption.
- [x] Asset `aprendiendo`: extraer original y mantener uso/caption.
- [x] Asset `arequita-rio`: extraer original y mantener uso/caption.
- [x] Asset `arequita`: extraer original y mantener uso/caption.
- [x] Asset `arroyo`: extraer original y mantener uso/caption.
- [x] Asset `artesania`: extraer original y mantener uso/caption.
- [x] Asset `artigas`: extraer original y mantener uso/caption.
- [x] Asset `aves`: extraer original y mantener uso/caption.
- [x] Asset `bosque`: extraer original y mantener uso/caption.
- [x] Asset `campo`: extraer original y mantener uso/caption.
- [x] Asset `cantera`: extraer original y mantener uso/caption.
- [x] Asset `carpincho`: extraer original y mantener uso/caption.
- [x] Asset `cielo`: extraer original y mantener uso/caption.
- [x] Asset `escuela`: extraer original y mantener uso/caption.
- [x] Asset `gastronomia`: extraer original y mantener uso/caption.
- [x] Asset `gauchos`: extraer original y mantener uso/caption.
- [x] Asset `gruta`: extraer original y mantener uso/caption.
- [x] Asset `map-original`: extraer original y mantener uso/caption.
- [x] Asset `martin`: extraer original y mantener uso/caption.
- [x] Asset `ombues`: extraer original y mantener uso/caption.
- [x] Asset `paisaje`: extraer original y mantener uso/caption.
- [x] Asset `panorama`: extraer original y mantener uso/caption.
- [x] Asset `parque-puente`: extraer original y mantener uso/caption.
- [x] Asset `parque`: extraer original y mantener uso/caption.
- [x] Asset `pelado`: extraer original y mantener uso/caption.
- [x] Asset `penitente-poza`: extraer original y mantener uso/caption.
- [x] Asset `penitente`: extraer original y mantener uso/caption.
- [x] Asset `puma`: extraer original y mantener uso/caption.
- [x] Asset `rio`: extraer original y mantener uso/caption.
- [x] Asset `salus`: extraer original y mantener uso/caption.
- [x] Asset `unesco`: extraer original y mantener uso/caption.
- [x] Asset `instituciones`: extraer original y mantener uso/caption.
- [x] Asset `lavalleja`: extraer original y mantener uso/caption.

## Verificación de cierre

La marca de migrado exige implementación y comparación; no implica por sí sola que haya pasado la verificación de producción. Los resultados efectivos se registran en `validation.md`.

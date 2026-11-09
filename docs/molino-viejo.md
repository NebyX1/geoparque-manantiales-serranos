# Reconstrucción del Molino Viejo de Minas

Revisión solicitada el 9 de noviembre de 2026 para GMS-61. La maqueta anterior simplificaba el edificio como una nave blanca larga con torre de pequeñas hiladas, huecos negros bajo un remate casi cónico y una puerta desplazada. Se reemplaza por una reconstrucción basada en diez fotografías de la [galería de La Unión publicada el 9 de julio de 2026](https://www.diariolaunion.com/2026/07/09/obras/) y la fotografía asociada a [Serrano, 13 de julio](https://serrano.uy/avanzan-las-obras-de-recuperacion-del-museo-molino-viejo/).

Las fechas son de publicación. No se acreditó la fecha exacta de captura de cada imagen. La [rendición de cuentas de la IDL del 8 de agosto](https://www.gub.uy/intendencia-lavalleja/comunicacion/noticias/rendicion-cuentas-ano-para-ordenar-estar-cerca-poner-futuro-marcha-lavalleja) informa una restauración en ejecución; no demuestra el acabado final de noviembre ni la apertura al público. La ficha canónica y sus condiciones de visita permanecen intactas.

## Rasgos de aceptación

- Torre gruesa y ligeramente troncocónica, con hombro superior y cubierta curva; sin aspas ni remate cónico.
- Grupos de ventanas blancas cortas separados por mampostería gris bajo la cúpula, sin convertir todo el nivel en una galería panorámica.
- Tres vanos verticales alineados, con huecos reales, profundidad y carpintería.
- Frente con cuatro ventanas y puerta central; lateral de mayor longitud y más vanos. Rejas oscuras, carpinterías rojizas, marcos taupe y nave marfil.
- Zócalo gris, cornisa fina continua, parapeto bajo y azotea ocre según las vistas aéreas. Las aproximaciones de las caras menos documentadas se mantienen sobrias.
- Superficie mineral gris-beige con manchas y grandes marcas horizontales discretas. No se modelan la grúa, los andamios ni parches transitorios de pintura como rasgos permanentes.

Las proporciones y la disposición del grupo de ventanas son una interpretación visual, no medidas documentadas ni una fotogrametría. Se excluye el liceo vecino del modelo representativo. El suelo de exposición no pretende reproducir el plano completo del predio.

## Flujo de autoría

`scripts/models/molino_viejo.py` construye la geometría mediante Blender 4.5 y reutiliza la infraestructura de `architecture_models.py`. La fábrica `mill61()` delega en ese módulo; el comando habitual del exportador conserva el mismo ID y archivo `gms-61.glb`.

Primero se generaron un master editable de Blender y seis renders: frente, oblicua, lateral, posterior, planta y detalle de coronación. El control independiente detectó dos defectos intermedios: intersecciones coplanares en marcos y zócalo, y una franja de vidrio demasiado continua. Se corrigieron antes de aceptar el modelo e integrarlo. El master empaquetado y las versiones de estudio están en `reports/experience-review/molino-viejo/`.

La geometría final tiene **45.260 triángulos y 16 primitivas**, dentro del presupuesto por miniatura. El GLB pesa **3.041.576 bytes**. Incluye cuatro mapas originales de 512 × 512 para albedo y normales de la torre y la cubierta; son campos procedurales creados para el modelo, sin fotografías ajenas incrustadas ni dependencias de imagen externas. Los mapas se exportan para conservar el acabado en Three.js. El material de la azotea se identifica como membrana de cubierta y permanece estático al avanzar el reloj del juego.

Sólo se sustituye GMS-61; los otros 47 GLB reconstruidos conservan sus hashes. La anterior aprobación numérica de 61 se archiva en `landmark-asset-approvals.json`, sin trasladarla al archivo nuevo.

## Validación y evidencia

El dictamen nuevo está en `molino-viejo-review.json`. Los renders y las siete capturas del juego incluyen inspector, vista baja, recorrido, 320 px, horizontal 844 × 390 y reflow equivalente a 200 % en 640 × 450. Se inspeccionan silueta, materiales, contacto entre piezas y separación del HUD. El manifiesto `game/review.json` registra respuestas y errores del navegador, además del hash del GLB servido.

Los tests comprueban que albedo y normales permanecen incrustados tras exportar y que la maqueta sigue estática mientras avanza el reloj en Chromium y WebKit. La validación general es `npm run verify`; su salida se conserva en `reports/experience-review/molino-viejo/verify.log`.

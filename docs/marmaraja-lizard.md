# Lagarto animado de Marmarajá

Compañero lúdico solicitado por el usuario el 8 de noviembre de 2026. Aparece exclusivamente en GMS-08, tanto al acercarse caminando como en el visor de la miniatura.

El personaje original combina cabeza móvil, cuatro patas articuladas, dedos, vientre claro, manchas y líneas dorsales apoyadas sobre la piel, y una cola de ocho segmentos. Recorre una curva cerrada entre los pastizales exteriores de la loma. Su altura y la de los apoyos se obtienen de la cuadrícula del GLB ya cargado; la ruta y las poses permanecen dentro de la base.

## Integración y recursos

La implementación está en `src/features/experience/miniatures/wildlife/marmaraja-lizard.ts`. `createMiniature(8)` la importa bajo demanda, después de agrupar la geometría estática, y compone su actualización con el reloj existente de `updateMiniature`. No crea RAF, intervalos, listeners ni cargas de modelos adicionales. Una entrada repetida, detenida o reiniciada del reloj conserva la pose y la reanudación evita saltos.

Respeta la pausa general, el movimiento reducido, la suspensión al ocultar la página y la cancelación del ciclo de vida existente. Sus geometrías y materiales pertenecen a esa instancia y se liberan con `disposeMiniature`. No usa caché global de recursos, texturas externas, luces nuevas ni un recálculo de sombras de toda la escena por cada paso. La sombra de contacto es una malla ligera.

| Presupuesto | Lagarto | Cerro y lagarto |
| ----------- | ------- | --------------- |
| Triángulos  | 3.940   | 61.218          |
| Draw calls  | 36      | 43              |

El conjunto permanece dentro del límite existente de 150.000 triángulos y menos de 100 draw calls por miniatura. Los 49 GLB aprobados y las fotografías permanecen intactos; el personaje es una adición animada en ejecución, no una modificación del terreno ni una observación de fauna real.

## Comprobación

Tres pruebas unitarias verifican continuidad del recorrido, apoyo en pendiente, contención de la geometría en la base, reloj detenido/reducido y liberación de recursos. La prueba de navegador de Marmarajá compara la imagen del inspector: debe cambiar al caminar y permanecer idéntica al pausar o activar movimiento reducido. Pasó en Chromium y WebKit.

Capturas y vídeos locales: `reports/experience-review/marmaraja-lizard/`. El control visual independiente revisa sólo los tramos y poses capturados, sin atribuir a esas imágenes una inspección de cada posición del ciclo completo. La verificación general queda en `verify.log` dentro de ese directorio.

Dictamen independiente: **APROBADO**, sin ajustes bloqueantes, a partir de 21 capturas. Forma, apoyo, patrón de piel y tramos muestreados de movimiento aceptados; las parejas examinadas de pausa y movimiento reducido son idénticas. Evidencia y hashes del runtime: [marmaraja-lizard-review.json](marmaraja-lizard-review.json). La prueba de imagen fija el ratio de render al piso de calidad para que los cambios de resolución adaptativa no se confundan con movimiento; la escena real conserva su ajuste adaptativo habitual.

## Validación final

`npm run verify` aprobado con Node 22.22.3: 157 archivos Astro sin errores, advertencias ni hints; lint y formato aprobados; 53 pruebas unitarias, tres de SEO y 69 de navegador aprobadas, con tres omisiones previstas. La nueva prueba de movimiento también pasó cuatro ejecuciones repetidas entre Chromium y WebKit. Vídeo de muestra local: `reports/experience-review/marmaraja-lizard/lagarto-marmaraja.mp4`.

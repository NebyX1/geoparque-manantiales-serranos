# Marmarajá: guiño al Cerro del Lagarto

Revisión solicitada por el usuario el 8 de noviembre de 2026. GMS-08 incorpora una alusión muy discreta a un lagarto manteniendo su aspecto de cerro.

La cresta norte gana un extremo rocoso bajo; el centro forma un lomo suave, con espolones laterales poco elevados y una prolongación curva afinada. La cobertura general de la ortofoto sigue sobre la base DEM. El relieve de esta miniatura se acentúa a 3,4 y recibe ajustes artísticos locales: no representa una nueva medición del cerro.

La implementación está en `src/features/experience/miniatures/rebuilt/marmaraja.ts`, conectada sólo al ID 8. El GLB se exportó únicamente para ese lugar. Los otros 48 GLB reconstruidos conservan sus hashes; las fotografías, coordenadas y textos canónicos se mantienen.

## Control visual y presupuesto

El revisor independiente inspeccionó 12 imágenes: referencia aérea, antes/después al caminar, inspector y detalle, dos vistas móviles, y renders frontal, cenital y de perfil. Dictamen: **APROBADO**, sin ajustes bloqueantes. Sigue predominando la lectura de cerro; la pareidolia es tenue y en móvil resulta débil. El modelo completo queda visible en el inspector, sin deformaciones ni oclusiones accidentales observadas.

El dictamen está en [marmaraja-visual-review.json](marmaraja-visual-review.json). El ledger conserva el hash y la puntuación de la versión anterior como revisión histórica; esta aceptación es cualitativa y corresponde al nuevo hash.

| Métrica    | Anterior  | Actual    |
| ---------- | --------- | --------- |
| Triángulos | 55.038    | 57.278    |
| Draw calls | 5         | 7         |
| Bytes GLB  | 3.187.332 | 3.361.740 |

SHA-256 actual: `5380c89d60bca34ae5d2833d311c72fd480893bc6e48126a4517b19fa910b4ca`.

El modelado se ejecuta al exportar, sin cálculos nuevos por frame. El activo sigue dentro del presupuesto existente de 150.000 triángulos y menos de 100 draw calls. Las capturas locales están en `reports/experience-review/marmaraja-lagarto/`; la validación completa queda en `verify.log` en ese directorio.

## Validación final

Una solicitud posterior añadió un lagarto animado que recorre el entorno de esta miniatura. Su alcance, ciclo de vida y validación están documentados en [marmaraja-lizard.md](marmaraja-lizard.md); el GLB de la loma mantiene el hash aprobado aquí.

`npm run verify` aprobado con Node 22.22.3: 155 archivos Astro sin errores, advertencias ni hints; lint y formato aprobados; 50 pruebas unitarias, tres de SEO y 67 de navegador aprobadas, con tres omisiones previstas. Tras registrar la revisión se comprobó nuevamente el tipado de las anotaciones. El GLB en `dist` coincide con el hash aprobado por QA.

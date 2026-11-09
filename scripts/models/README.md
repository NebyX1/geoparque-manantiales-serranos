# Modelado y exportación de miniaturas

Las referencias fotográficas y las ortofotos de la reconstrucción nueva se consultan para geometría y proporciones; no se distribuyen como texturas de esos 49 modelos. Los doce modelos heredados conservan su procedencia y recursos originales. Las capturas de análisis están excluidas de Git y Docker. El dictamen visual lo emite el revisor independiente, no estos generadores.

## Blender

Con Blender 4.5 LTS, desde la raíz del proyecto:

```text
blender -b -t 4 --python scripts/models/architecture_models.py -- 41 --render
blender -b -t 4 --python scripts/models/architecture_models.py -- 32 34 --render
```

Sin IDs genera las 20 maquetas. Cada GLB se exporta bajo `public/models/geosites/rebuilt/gms-XX.glb`. `--render` produce frente y oblicua para revisión. Los caracteres y objetos estáticos se convierten a mallas y se agrupan por material. Las maquetas industriales usan la planta visible en ortofotos IDE y fotografías de MIEM/operador; las profundidades no son mediciones topográficas.

## Entornos naturales

Los 29 entornos se exportan desde Three.js. Los IDs 32 y 34 se producen con el generador Blender, aunque sus fuentes se investigaron junto con los paisajes. Para regenerar los datos de autoría, con Python, Requests, Pillow, Shapely 2.x y NumPy instalados:

```text
python scripts/prepare-landmark-elevation.py
python scripts/models/prepare-landmark-landcover.py
python scripts/models/prepare-local-rivers.py
python scripts/models/prepare-cuervos-water.py
```

Los dos primeros comandos pueden consultar las URLs públicas documentadas cuando no hay caché; no ejecutarlos para una simple revisión de código. Los demás preparan las geometrías a partir de las instantáneas locales. Después:

```text
npx esbuild scripts/models/natural-models.ts --bundle --platform=node --format=esm --external:three --external:three/* --outfile=reports/experience-review/rebuild-natural-export.mjs
node reports/experience-review/rebuild-natural-export.mjs
blender -b -t 4 --python scripts/models/render-natural-models.py -- 2 18 50
```

El exportador admite selección por ID y comprueba el presupuesto de geometría. Los datos DEM, las máscaras de cobertura y los cauces locales son instantáneas reproducibles con fuente y límites documentados. No se ejecutan estos generadores al navegar por la web ni durante el build de producción.

Después de cambiar un modelo: exportar sólo los IDs afectados, someter sus vistas a QA, generar el build y revisar el GLB en el visor real. `scripts/review-miniatures.mjs` recorre los 61 modelos desde la interfaz y captura escritorio y casos de pantalla reducida. Las comprobaciones de archivo no sustituyen el cotejo visual.

`prepare-scanned-rock.py` conserva un experimento de investigación con Poly Haven CC0 que se descartó. Su salida no se importa ni se exporta en los modelos finales; no forma parte del proceso anterior.

El estado de autoría de una nueva exportación es QA pendiente. La aceptación vigente pertenece al ledger y al hash exacto revisado, no a una etiqueta de aprobación incorporada por el generador. No regenerar GLB únicamente para cambiar estados de revisión.

# Penitente: geometría, corriente y peces originales

Se completa la reutilización de GMS-14 desde `NebyX1/nueva-web-turismo-idl`, commit `08a03e8060cce0e90e4c3662feed377f4b9c4622`. La integración anterior cargaba el GLB estático y aplicaba un shader genérico; no incluía los cuatro peces ni el flujo propio de la cascada.

Ahora se utiliza el constructor `penitente.ts` y sus módulos `penitenteWater.ts`, `penitenteRock.ts`, `penitenteFish.ts`, `penitenteMesh.ts` y `penitenteAsset.json`, junto al `waterLife.ts` compartido ya incorporado desde Turismo. Se conservan las cinco piezas de la geometría: macizo rocoso, arroyo superior, canaleta de caída, poza y desagüe; además del monte instanciado. No se cambia el relieve del modelo.

La malla empaquetada corresponde al GLB conservado en `public/models/geosites/salto-del-penitente.glb`, SHA-256 `21808837be32892d793695a843798e159ddc730955a31b040fe9da46331ce17d`. Se verificó el blob original del JSON, SHA-1 `670c69540fc30661270b7018d129c04ce82f533a`; su contenido canónico tiene SHA-256 `7526ce6a787edf794006d153fb207cab9218ee816bebe6938d1d19fa4929906c`.

El flujo usa las coordenadas `aFlow` de la geometría original: estrías y espuma que avanzan por la canaleta, ondas y espuma en el contacto con la poza. Cuatro peces estilizados saltan en sectores distintos de esa misma poza, con gotas y ondas al caer. No se atribuye una especie real. Agua y peces reciben el reloj de `updateMiniature`, sin añadir RAF ni temporizadores; pausa, movimiento reducido y liberación del modelo conservan el comportamiento de la experiencia.

Las únicas adaptaciones del código copiado son de tipado estricto y acceso validado a los datos. Las pruebas fijan el contenido geométrico, verifican 84 posiciones de las trayectorias sobre la poza, los cuatro saltos, salpicaduras, ondas, repetición del tiempo pausado y ausencia de actualización tras liberar recursos. La prueba visual de animación también incluye GMS-14 en Chromium y WebKit.

Fuente: [constructor y módulos de Turismo](https://github.com/NebyX1/nueva-web-turismo-idl/blob/08a03e8060cce0e90e4c3662feed377f4b9c4622/src/three/landmarks/penitente.ts).

Validación final: las dos pruebas unitarias del modelo y su animación visual en Chromium y WebKit pasaron dentro de `npm run verify` (código 0; 68 unitarias, 3 SEO y 89 E2E aprobadas, 3 omisiones previstas). Las capturas adicionales del constructor nativo están en `reports/experience-review/penitente-native/`.

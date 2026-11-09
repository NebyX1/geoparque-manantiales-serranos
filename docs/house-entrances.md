# Accesos de las casas virtuales

Corrección realizada por el agente dedicado a accesos, solicitada por el usuario el 9 de noviembre de 2026.

El punto de transporte anterior utilizaba una posición independiente de la puerta, una zona automática estrecha y una zona manual circular que alcanzaba los laterales. En Villa Serrana y Verdún también había diferencias de altura entre el terreno y el umbral de la casa.

Ahora `cluster-houses.ts` construye el umbral y una rampa que une el terreno con la base de cada uno de los ocho diseños. `gateways.ts` toma la posición y rotación del propio umbral para el marcador, la aproximación y la entrada/salida. La entrada caminando utiliza el ancho del vano; la interacción manual permite acercarse por delante sin convertir las paredes laterales en entradas. Al salir se vuelve al pie de la rampa. El margen de bloqueo es de 0,2 s para permitir la reentrada inmediata sin saltarse la zona de cruce.

La validación incluye 16 pruebas unitarias de clústeres, casas y portales, con intersecciones por rayos contra el piso renderizado de las ocho rampas. Se ejecutan además tres recorridos E2E en cada motor: Villa Serrana, Verdún y Aguas Blancas; comprueban entrar caminando y volver a entrar con teclado, botón y clic. Las seis capturas aprobadas están en `reports/experience-review/house-entrances/`.

El modelo del Cerro del Verdún sigue reutilizando `createVerdun()` del proyecto de Turismo, independiente de su casa virtual. No se cambian sus coordenadas ni la maqueta del santuario.

Validación conjunta final con fotos y Penitente: `npm run verify` terminó con código 0 en Node 22.22.3: **68 unitarias, 3 SEO y 89 E2E aprobadas**, con 3 omisiones previstas por configuración. Registro: `reports/experience-review/photo-resolution/verify-final.log`.

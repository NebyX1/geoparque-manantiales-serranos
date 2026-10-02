import type { Circuit } from '../types/geopark';
export const circuits: Circuit[] = [
  {
    id: 'agua-bosque',
    name: 'Agua, bosque y asombro',
    kicker: 'Naturaleza a tu ritmo',
    days: 1,
    image: 'salus',
    text: 'Una caminata elegida según el grupo, la historia de un manantial y un cierre entre cultura y sabores de Minas.',
    path: 'Reserva Salus → centro de Minas → tradición del alfajor',
    places: [31, 39, 44],
    blocks: [
      {
        day: 1,
        title: 'La mañana, para escuchar el bosque',
        ids: [31],
        text: 'Elegí el sector de Salus antes de salir: Jardines del Puma y Parque Familiar tienen modalidades y distancias propias. Consultá senderos y condiciones del día.',
      },
      {
        day: 1,
        title: 'La tarde, para recorrer Minas',
        ids: [39, 44],
        text: 'Paseá por Plaza Libertad y coordiná la visita al Museo del Alfajor. La propuesta es combinar un ambiente natural con una historia de producción local.',
      },
    ],
  },
  {
    id: 'arequita',
    name: 'Un encuentro con Arequita',
    kicker: 'Paisaje, volcanismo y río',
    days: 2,
    image: 'arequita-rio',
    text: 'Un día para observar y otro para quedarse. Organizá cada acceso por separado y elegí una base junto al paisaje.',
    path: 'Cerro Arequita → monte de ombúes → Camping Arequita',
    places: [1, 51, 53],
    blocks: [
      {
        day: 1,
        title: 'Reconocer el paisaje',
        ids: [1, 51],
        text: 'Observá los paredones y recorré únicamente sectores habilitados. El monte de ombúes tiene condiciones de acceso propias. La Gruta Colón sólo se incorpora con autorización específica.',
      },
      {
        day: 2,
        title: 'Quedarse junto al río',
        ids: [53],
        text: 'Una parcela o una cabaña permiten prolongar la salida. Confirmá reserva y servicios directamente con el camping; la reserva no incluye otros accesos del parque nacional.',
      },
    ],
  },
  {
    id: 'villa-serrana',
    name: 'Arquitectura para quedarse',
    kicker: 'Una escapada serrana',
    days: 2,
    image: 'panorama',
    imageContext: true,
    text: 'El proyecto de Vilamajó, una mesa frente a las sierras y una caminata acompañada para mirar más allá del paisaje.',
    path: 'Villa Serrana → Ventorrillo → Mangas de Piedra',
    places: [54, 11, 56],
    blocks: [
      {
        day: 1,
        title: 'Un pueblo pensado desde el relieve',
        ids: [54, 11],
        text: 'Recorré los espacios públicos de Villa Serrana y reservá una comida en el Ventorrillo. Elegí el alojamiento con el establecimiento; el itinerario no realiza reservas.',
      },
      {
        day: 2,
        title: 'Caminar con una historia que escuchar',
        ids: [56],
        text: 'La excursión de Mangas de Piedra se contrata con guía local e incluye permisos para los campos del recorrido publicado. Confirmá dificultad, duración y condiciones actuales.',
      },
    ],
  },
];

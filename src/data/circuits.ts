import type { Circuit } from '../types/geopark';
export const circuits: Circuit[] = [
  {
    id: 'agua-bosque',
    name: 'Agua, bosque y vida cotidiana',
    kicker: 'Cuencas, ambientes y producción',
    days: 1,
    image: 'salus',
    text: 'Relacioná el agua de un manantial, el bosque y las actividades de una comunidad. Una propuesta para formular preguntas y registrar evidencias.',
    path: 'Reserva Salus → Plaza Libertad → memoria de la producción local',
    places: [31, 39, 44],
    blocks: [
      {
        day: 1,
        title: 'Del manantial al ambiente',
        ids: [31],
        text: 'Pregunta de trabajo: ¿qué relaciones podemos reconocer entre las rocas, el agua y la vegetación? Consultá la ficha de Salus y registrá observaciones desde los sectores habilitados. Distinguí el agua que se ve de las preguntas sobre su circulación subterránea. Los sectores del parque tienen condiciones de acceso propias y la salida requiere coordinación.',
      },
      {
        day: 1,
        title: 'El agua y los recursos en la vida cotidiana',
        ids: [39, 44],
        text: 'Usá el centro de Minas y la memoria de la producción local como contexto para preguntar por materias primas, agua, energía, trabajo y residuos. El Museo del Alfajor aporta documentos sobre una historia productiva; cualquier actividad institucional se acuerda previamente. Como cierre, compará el mapa de relaciones del grupo con lo observado en el ambiente natural.',
      },
    ],
  },
  {
    id: 'arequita',
    name: 'Arequita: geología y conservación',
    kicker: 'Volcanismo, ambientes y agua',
    days: 2,
    image: 'arequita-rio',
    text: 'Estudiá cómo un paisaje volcánico se relaciona con los ambientes actuales y el agua. La observación se organiza alrededor del cuidado del patrimonio.',
    path: 'Cerro Arequita → monte de ombúes → entorno del río Santa Lucía',
    places: [1, 51, 53],
    blocks: [
      {
        day: 1,
        title: 'Leer las rocas y los ambientes',
        ids: [1, 51],
        text: 'Pregunta de trabajo: ¿qué evidencias permiten relacionar el relieve con su historia geológica y con la vida actual? Compará las fichas del cerro y del monte de ombúes antes de una eventual salida. En terreno, registrá sin recoger materiales y utilizá únicamente accesos habilitados. La Gruta Colón tiene una autorización específica que se coordina por separado.',
      },
      {
        day: 2,
        title: 'Relacionar el río con sus márgenes',
        ids: [53],
        text: 'La ficha del Camping Arequita aporta una referencia del entorno del río. Preguntá cómo se conectan el cauce, las márgenes, la vegetación y los usos humanos. Contrastá tus registros con la lectura sobre cuencas. El acceso al establecimiento y las actividades junto al agua se coordinan por separado; la presencia de agua no acredita baño habilitado.',
      },
    ],
  },
  {
    id: 'villa-serrana',
    name: 'Habitar y cuidar el paisaje serrano',
    kicker: 'Relieve, materiales y patrimonio',
    days: 2,
    image: 'panorama',
    imageContext: true,
    text: 'Relacioná la arquitectura de Villa Serrana, los materiales y las formas de ocupar el suelo. Una lectura ambiental del paisaje cultural.',
    path: 'Villa Serrana → Ventorrillo → construcciones de piedra del entorno',
    places: [54, 11, 56],
    blocks: [
      {
        day: 1,
        title: 'Un asentamiento pensado desde el relieve',
        ids: [54, 11],
        text: 'Pregunta de trabajo: ¿cómo se relacionan las construcciones con las pendientes, el agua, la vegetación y los materiales? Consultá las fichas de Villa Serrana y del Ventorrillo, y compará documentos con observaciones desde espacios públicos. Si el estudio incluye el ingreso a una institución o establecimiento, coordiná la actividad con sus responsables.',
      },
      {
        day: 2,
        title: 'Distinguir observación, relato e interpretación',
        ids: [56],
        text: 'Las construcciones de piedra del entorno permiten preguntar por materiales, usos del suelo y memoria local. Separá lo que podés observar de los relatos y las explicaciones que requieren estudio. Una actividad en Mangas de Piedra necesita acompañamiento y permisos de los predios. También podés trabajar desde el aula con las fichas y la lectura sobre patrimonio arqueológico, sin intervenir las estructuras.',
      },
    ],
  },
];

import type { GeoparkPlace } from '../types/geopark';
import { placePhotoPresentation } from './place-photos';

type CanonicalPlace = Omit<
  GeoparkPlace,
  | 'title'
  | 'description'
  | 'tags'
  | 'visitStatus'
  | 'access'
  | 'contacts'
  | 'images'
  | 'featured'
  | 'internationalValue'
  | 'seo'
  | 'relationships'
>;
export const canonicalPlaces: CanonicalPlace[] = [
  {
    id: 1,
    name: 'Cerro Arequita',
    blocks: [
      {
        text: 'Riolita, paredones y una historia de volcanismo',
        heading: true,
      },
      {
        text: 'El Arequita y el cerro de los Cuervos pertenecen a una formación volcánica del Cretácico inferior. Predomina la riolita, una roca volcánica; el Ministerio de Ambiente sitúa su origen en torno a los 130 millones de años. Sus siluetas compactas y grandes paredones contrastan con otros relieves serranos del departamento. La edad de la roca explica un episodio de la historia geológica, mientras la forma que vemos también es resultado de procesos posteriores de erosión.',
        heading: false,
      },
      {
        text: 'La observación del conjunto a distintas escalas permite reconocer formas del relieve, fracturas, vegetación adherida a la pared y ambientes de sombra. Estas relaciones ayudan a comprender el valor geológico y biológico del sitio.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'El área forma parte del SNAP desde 2024. Utilizá recorridos habilitados y respetá las reglas del parque nacional. La Gruta Colón conserva un refugio de murciélagos y su ingreso se coordina específicamente. Mascotas, fuego y drones tienen restricciones propias dentro del área protegida.',
        heading: false,
      },
    ],
    zone: 'Arequita y Santa Lucía',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Consulta de acceso por sector',
    relationsRaw: 'Salus · Gruta Colón · Monte de Ombúes · Camping Arequita.',
    tagline: 'La memoria del fuego',
    intro:
      'La riolita y los paredones del Cerro Arequita registran una historia de volcanismo y erosión. Su relación con el monte nativo, el río y los ambientes de sombra permite estudiar conexiones entre geología y biodiversidad.',
    slug: 'cerro-arequita',
    category: 'Geología',
    international: true,
    status: 'Coordinación previa',
    image: 'arequita-rio',
    imageContext: false,
    summary:
      'Riolita y paredones que registran volcanismo y erosión, en relación con el monte nativo y el río Santa Lucía.',
    region: 'Arequita y Santa Lucía',
    themes: ['Agua', 'Geología'],
  },
  {
    id: 2,
    name: 'Cerro del Cura',
    blocks: [
      {
        text: 'El Cerro del Cura integra el patrimonio geológico del territorio. Es un lugar distinto del Cerro de los Cuervos y del Cerro del Ombú.',
        heading: false,
      },
      {
        text: 'La visita requiere coordinación previa y acompañamiento especializado. Consultá el acceso antes de organizar una salida.',
        heading: false,
      },
    ],
    zone: 'Paisaje rural del geoparque',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Visita especializada por coordinar',
    relationsRaw: 'Cerro del Ombú · geología del geoparque.',
    tagline: 'Aprender a mirar más allá de los nombres conocidos',
    intro:
      'Cerro del Cura integra el patrimonio geológico del Geoparque. Es un sitio diferente del Cerro de los Cuervos y del Cerro del Ombú. Su interpretación requiere coordinación y acompañamiento especializado.',
    slug: 'cerro-del-cura',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Registro del patrimonio geológico que requiere interpretación especializada; es distinto del Cerro de los Cuervos y del Cerro del Ombú.',
    region: 'Sierras y campo',
    themes: ['Geología'],
  },
  {
    id: 3,
    name: 'Cerro del Ombú',
    blocks: [
      {
        text: 'En Cerro del Ombú, los estromatolitos permiten acercarse a la actividad de antiguas comunidades microbianas y a las huellas que dejaron en las rocas.',
        heading: false,
      },
      {
        text: 'Se trata de un lugar distinto del monte de ombúes de Arequita. Para conocerlo, coordiná una visita especializada.',
        heading: false,
      },
    ],
    zone: 'Paisaje rural del geoparque',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Visita especializada por coordinar',
    relationsRaw: 'Mina Verdún · interpretación geológica.',
    tagline: 'Cuando la vida escribía sobre la piedra',
    intro:
      'Los estromatolitos del Cerro del Ombú son registros de la actividad de antiguas comunidades microbianas. Su estudio relaciona la historia de la vida con la formación de las rocas y debe distinguirse del monte de ombúes de Arequita.',
    slug: 'cerro-del-ombu',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'Estromatolitos que permiten estudiar la actividad de antiguas comunidades microbianas y sus registros en las rocas.',
    region: 'Sierras y campo',
    themes: ['Geología'],
  },
  {
    id: 4,
    name: 'Nacientes del Río Santa Lucía',
    blocks: [
      {
        text: 'Las nacientes del Santa Lucía son el comienzo de una red de agua que conecta ambientes y comunidades. Cabecera, cauce y cuenca describen partes diferentes de esa historia.',
        heading: false,
      },
      {
        text: 'La cuenca sostiene abastecimiento humano y actividades productivas. Las lluvias, la infiltración y el escurrimiento ayudan a comprender su relación con el territorio.',
        heading: false,
      },
      {
        text: 'El acceso a las nacientes requiere consulta previa. No ingreses a terrenos privados sin autorización.',
        heading: false,
      },
    ],
    zone: 'Cabeceras del Santa Lucía',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Consultá los accesos a las nacientes antes de organizar la salida.',
    relationsRaw: 'Arequita · Salus · Parque Represa de OSE.',
    tagline: 'El comienzo de una historia que sigue corriente abajo',
    intro:
      'Las nacientes del Santa Lucía forman el inicio de una red que vincula ambientes, abastecimiento humano y actividades productivas. Cabecera, cauce y cuenca ayudan a explicar la relación entre lluvia, infiltración, escurrimiento y territorio.',
    slug: 'nacientes-del-rio-santa-lucia',
    category: 'Geología',
    international: false,
    status: 'Visita no confirmada',
    image: 'arroyo',
    imageContext: true,
    summary:
      'Nacientes de una red hídrica que relaciona ambientes, abastecimiento humano, actividades productivas y territorio.',
    region: 'Sierras y campo',
    themes: ['Agua', 'Geología'],
  },
  {
    id: 5,
    name: 'El Destacamento',
    blocks: [
      {
        text: 'Ganadería, memoria y formas de vida rural',
        heading: true,
      },
      {
        text: 'El Destacamento funciona en un establecimiento familiar de ganadería sobre campo natural. La casa conserva rasgos de un antiguo puesto de policía rural que dio nombre al emprendimiento. Las actividades documentadas incluyen conocimiento de tareas del predio, recorridos acompañados, gastronomía de campo, relatos, música y observación del cielo.',
        heading: false,
      },
      {
        text: 'La explicación de las tareas permite comprender cómo se organiza el trabajo rural y cómo se relaciona con la vida de sus habitantes. El establecimiento se ubica en Cerro Pelado, a unos 35 km de Minas por camino rural y a 17 km del desvío de Ruta 8 km 162. El contenido de las actividades se acuerda con sus responsables.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Se encuentra en Cerro Pelado, aproximadamente a 35 km de Minas por camino rural y a 17 km de Ruta 8, km 162. La actividad y el punto de llegada se acuerdan con el anfitrión. Fogón, música y observación del cielo corresponden a programas específicos.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Teléfono: +598 91 490 630',
        heading: false,
      },
      {
        text: 'Correo: elenayanetro@hotmail.com',
        heading: false,
      },
    ],
    zone: 'Cerro Pelado y entorno rural',
    categoryRaw: 'Patrimonio Natural',
    statusRaw: 'Reserva previa',
    relationsRaw: 'Kykyo · Villa Serrana · Museo de Miniaturas.',
    tagline: 'El campo contado por quienes lo viven',
    intro:
      'El Destacamento es un establecimiento familiar de ganadería sobre campo natural en Cerro Pelado. La casa vinculada a un antiguo puesto de policía rural y las tareas del predio permiten conocer relaciones entre trabajo, memoria y formas de habitar el campo.',
    slug: 'el-destacamento',
    category: 'Naturaleza',
    international: false,
    status: 'Coordinación previa',
    image: 'campo',
    imageContext: true,
    channel: {
      url: 'tel:+59891490630',
      label: '+598 91 490 630',
    },
    summary:
      'Establecimiento familiar sobre campo natural que relaciona ganadería, memoria de un puesto policial y formas de vida rural.',
    region: 'Sierras y campo',
    themes: ['Sabores', 'Naturaleza'],
  },
  {
    id: 6,
    name: 'Reserva Artística KyKy-Ó',
    blocks: [
      {
        text: 'Un campo donde naturaleza y arte se encuentran',
        heading: true,
      },
      {
        text: 'Kykyo se presenta como reserva y campo cultural entre Marmarajá y Cerro Pelado. Combina conservación del paisaje, recorridos acompañados y procesos artísticos. Las residencias relatadas en diciembre de 2025, coordinadas por Nicolás Spinosa y Óscar Álvarez, trabajaron con materiales y condiciones del propio territorio. Esa documentación relaciona creación, habitantes y ambiente.',
        heading: false,
      },
      {
        text: 'El acceso se organiza por reserva o invitación. La documentación también registra una salida en bicicleta gestionada por Experiencias Villa Serrana; esa actividad comercial y las residencias artísticas tienen formas de coordinación diferentes. La participación requiere acordar el contenido con sus responsables.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Ingreso por reserva o invitación. La salida en bicicleta está publicada por Experiencias Villa Serrana. Las residencias artísticas tienen convocatoria propia; la autorización de ingreso y la participación en cada actividad se confirman por separado.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Consulta por excursión organizada a Kykyo; no contacto directo de la reserva',
        heading: false,
      },
      {
        text: '+598 99 024 434',
        heading: false,
      },
    ],
    zone: 'Marmarajá y Cerro Pelado',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Reserva o invitación',
    relationsRaw: 'Cerro Marmarajá · El Destacamento · Villa Serrana.',
    tagline: 'El paisaje también puede ser un taller',
    intro:
      'La reserva artística KyKy-Ó relaciona procesos de creación, conservación del paisaje y vida rural entre Marmarajá y Cerro Pelado. Las experiencias documentadas trabajan con materiales y condiciones del territorio y se organizan con sus responsables.',
    slug: 'reserva-artistica-kyky-o',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'panorama',
    imageContext: true,
    channel: {
      url: 'tel:+59899024434',
      label: 'Excursiones: +598 99 024 434',
    },
    summary:
      'Campo cultural que vincula creación artística, conservación del paisaje y vida rural entre Marmarajá y Cerro Pelado.',
    region: 'Sierras y campo',
    themes: ['Cultura', 'Aventura', 'Cultura'],
  },
  {
    id: 7,
    name: 'Paso de la Arena',
    blocks: [
      {
        text: 'Paso de la Arena integra el patrimonio natural del Geoparque.',
        heading: false,
      },
      {
        text: 'Consultá la ubicación y las condiciones de acceso antes de organizar una visita.',
        heading: false,
      },
    ],
    zone: 'Ubicación operativa pendiente',
    categoryRaw: 'Patrimonio Natural',
    statusRaw: 'Consultá las condiciones de visita.',
    relationsRaw: 'Patrimonio natural del geoparque.',
    tagline: 'Las pausas también merecen un lugar en el mapa',
    intro:
      'Paso de la Arena figura entre los registros de patrimonio natural del Geoparque. Su ubicación y condiciones de acceso necesitan confirmación antes de desarrollar una actividad de observación en el lugar.',
    slug: 'paso-de-la-arena',
    category: 'Naturaleza',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Registro del patrimonio natural con ubicación y condiciones de acceso que necesitan confirmación.',
    region: 'Minas y entorno',
    themes: ['Naturaleza'],
  },
  {
    id: 8,
    name: 'Cerro Marmarajá',
    blocks: [
      {
        text: 'Cerro Marmarajá forma parte del patrimonio geológico del Geoparque. La interpretación de su entorno se vincula al paisaje rural y al acompañamiento local en recorridos coordinados.',
        heading: false,
      },
      {
        text: 'Las salidas se coordinan con Experiencias Villa Serrana. Los accesos a campos privados requieren autorización.',
        heading: false,
      },
    ],
    zone: 'Marmarajá',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Excursión por coordinar',
    relationsRaw: 'Kykyo · Villa Serrana.',
    tagline: 'Una sierra para hacer preguntas',
    intro:
      'Cerro Marmarajá forma parte del patrimonio geológico del Geoparque. La interpretación de su entorno se vincula con el paisaje rural y el conocimiento local; los recorridos por campos privados requieren autorización.',
    slug: 'cerro-marmaraja',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Patrimonio geológico del paisaje rural de Marmarajá, con interpretación local y accesos a campos sujetos a autorización.',
    region: 'Villa Serrana',
    themes: ['Aventura', 'Geología'],
  },
  {
    id: 9,
    name: 'Represa Stewart Vargas',
    blocks: [
      {
        text: 'El lago se formó en 1958 mediante una intervención de Enrique Stewart Vargas sobre el arroyo Miraflores, junto a la confluencia con La Leona. Es una pieza central del paisaje de la villa y un lugar desde el cual observar la relación entre agua, vegetación y laderas. El Baño de la India es otra pequeña represa vinculada a esa historia local, en el sector oriental.',
        heading: false,
      },
      {
        text: 'La observación del lago permite relacionar los cursos de agua con la forma del valle, las laderas y la vegetación. El Baño de la India también aparece en recorridos acompañados hacia el Cerro de la Leona; esos accesos a sectores del entorno tienen condiciones propias.',
        heading: false,
      },
      {
        text: 'La represa y el Baño de la India son paisajes de agua. La presencia del embalse no confirma condiciones de baño; deben consultarse las habilitaciones y las condiciones locales.',
        heading: false,
      },
    ],
    zone: 'Villa Serrana',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Paisaje; condiciones locales por confirmar',
    relationsRaw: 'Villa Serrana · Ventorrillo · Mesón de las Cañas.',
    tagline: 'Un lugar para volver a mirar la misma vista',
    intro:
      'La represa Stewart Vargas transformó el arroyo Miraflores y pasó a integrar el paisaje de Villa Serrana. El lago, las laderas y la vegetación permiten observar relaciones entre agua, relieve e intervención humana.',
    slug: 'represa-stewart-vargas',
    category: 'Cultura',
    international: false,
    status: 'Paseo por el entorno',
    image: 'panorama',
    imageContext: true,
    summary:
      'Represa sobre el arroyo Miraflores que permite estudiar relaciones entre agua, relieve, vegetación e intervención humana.',
    region: 'Villa Serrana',
    themes: ['Agua', 'Cultura', 'Cultura'],
  },
  {
    id: 10,
    name: 'Mesón de las Cañas',
    blocks: [
      {
        text: 'Alojamiento · Hotel · Restaurante · Bar · Villa Serrana',
        heading: false,
      },
      {
        text: 'Ubicación: Av. Vilamajó, Villa Serrana',
        heading: false,
      },
      {
        text: 'Contacto: +598 96 602 263',
        heading: false,
      },
      {
        text: 'El Mesón de las Cañas pertenece al proyecto con que Julio Vilamajó imaginó Villa Serrana en la década de 1940. En ese planteo, el relieve organizaba el asentamiento: las áreas bajas conservaban sus ambientes húmedos y agrestes, mientras la construcción se relacionaba con piedra, madera, paja y ladrillo de campo. El Mesón y el Ventorrillo son las dos obras que el arquitecto estudió y dirigió total o parcialmente para la villa.',
        heading: false,
      },
      {
        text: 'El proyecto posterior de recuperación del Mesón, documentado por Gualano + Gualano, trabaja la continuidad de las vistas y la relación entre edificio, suelo y horizonte. Las galerías y balcones funcionan como espacios intermedios entre habitación y paisaje y permiten analizar cambios de percepción entre interior y exterior.',
        heading: false,
      },
      {
        text: 'Las Cañas Inn es otro nombre comercial utilizado por el Mesón. La documentación distingue habitaciones, apartamentos familiares y dúplex con entrepiso. Estas modalidades tienen distribuciones y superficies diferentes, por lo que su uso y accesibilidad deben consultarse con el establecimiento.',
        heading: false,
      },
      {
        text: 'Las escaleras, los entrepisos y la separación de ambientes condicionan el uso de las unidades de alojamiento. La accesibilidad debe comprobarse para la habitación concreta y para su recorrido de ingreso.',
        heading: false,
      },
      {
        text: 'El establecimiento documenta restaurante, piscina exterior sin climatización, wifi y cargador para vehículos eléctricos con costo. Los recorridos autoguiados y las cabalgatas tienen contratación y coordinación propias. La disponibilidad de estos servicios se consulta con sus responsables.',
        heading: false,
      },
      {
        text: 'El uso de alojamiento y gastronomía forma parte del funcionamiento del edificio. Para estudiar o conocer sus espacios deben acordarse los sectores y las condiciones de acceso. El contacto documentado es +598 96 602 263 y la entrada se identifica sobre avenida Vilamajó.',
        heading: false,
      },
      {
        text: 'Canal de consulta: https://www.elmeson.com.uy/',
        heading: false,
      },
    ],
    zone: 'Villa Serrana',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Reserva de servicio',
    relationsRaw: 'Ventorrillo · Villa Serrana · Represa Stewart Vargas.',
    tagline: 'Quedarse también es una forma de conocer',
    intro:
      'El Mesón de las Cañas pertenece al proyecto de Villa Serrana ligado a Julio Vilamajó. Su implantación, sus materiales y sus espacios intermedios permiten estudiar la relación entre arquitectura, suelo y paisaje.',
    slug: 'meson-de-las-canas',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'panorama',
    imageContext: true,
    channel: {
      url: 'https://www.elmeson.com.uy/',
      label: 'Mesón de las Cañas',
    },
    summary:
      'Obra del proyecto de Villa Serrana ligado a Julio Vilamajó: materiales e implantación que relacionan arquitectura y paisaje.',
    region: 'Villa Serrana',
    themes: ['Cultura', 'Dormir', 'Sabores', 'Cultura'],
  },
  {
    id: 11,
    name: 'Ventorrillo de la Buena Vista',
    blocks: [
      {
        text: 'Restaurante · Alojamiento · Villa Serrana, aprox. 30 km al este de Minas',
        heading: false,
      },
      {
        text: 'Ubicación: Arquitecto Julio Vilamajó, Villa Serrana',
        heading: false,
      },
      {
        text: 'Contacto: +598 4440 2109 · info@ventorrillodelabuenavista.com.uy',
        heading: false,
      },
      {
        text: 'En 2019 se inauguró el Espacio Vilamajó, una sala museo dedicada al arquitecto que también presenta exposiciones de artistas nacionales. La ubicación y los apoyos del edificio permiten estudiar la relación entre arquitectura y terreno, junto a sus usos culturales y gastronómicos.',
        heading: false,
      },
      {
        text: 'La documentación gastronómica menciona carnes de la zona, frutos nativos y elaboración artesanal, además de pan cocido en horno a leña. Estas prácticas forman parte de la actividad productiva del establecimiento. El salón registra unas 60 plazas.',
        heading: false,
      },
      {
        text: 'El material consultado publica atención del restaurante de lunes a viernes, 11:00–18:30, y sábados y domingos, 8:30–18:30. Estos datos requieren confirmación con el establecimiento. El acceso al espacio cultural, el restaurante y el alojamiento corresponde a funciones diferentes del edificio.',
        heading: false,
      },
      {
        text: 'El alojamiento documentado comprende seis apartamentos para entre tres y seis personas, con estar, dormitorio y baño. La información del establecimiento detalla equipamiento y servicios incluidos; las condiciones de uso se consultan para cada unidad.',
        heading: false,
      },
      {
        text: 'El ingreso al alojamiento se anuncia desde las 13:00 y la salida a las 11:00. La llegada debe coordinarse dentro del horario de atención, porque el establecimiento cierra al caer la tarde. La observación del patrimonio arquitectónico debe ajustarse al funcionamiento y a los sectores autorizados.',
        heading: false,
      },
      {
        text: 'Canal de consulta: https://ventorrillodelabuenavista.com.uy/es/',
        heading: false,
      },
    ],
    zone: 'Villa Serrana',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Reserva de servicio',
    relationsRaw: 'Mesón de las Cañas · Villa Serrana · Represa Stewart Vargas.',
    tagline: 'Sentarse frente al paisaje',
    intro:
      'El Ventorrillo reúne una obra arquitectónica de Villa Serrana y el Espacio Vilamajó, dedicado al arquitecto. El edificio y sus usos culturales y gastronómicos permiten conocer vínculos entre construcción, paisaje y vida local.',
    slug: 'ventorrillo-de-la-buena-vista',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'panorama',
    imageContext: true,
    channel: {
      url: 'https://ventorrillodelabuenavista.com.uy/es/',
      label: 'Ventorrillo de la Buena Vista',
    },
    summary:
      'Arquitectura de Villa Serrana y Espacio Vilamajó, con usos culturales y gastronómicos vinculados al edificio y al paisaje.',
    region: 'Villa Serrana',
    themes: ['Cultura', 'Dormir', 'Sabores', 'Cultura'],
  },
  {
    id: 12,
    name: 'Granito Villa Serrana',
    blocks: [
      {
        text: 'El granito de Villa Serrana forma parte de la relación entre roca, relieve y arquitectura. Mirar el suelo y las construcciones permite descubrir cómo se vinculan en un mismo paisaje.',
        heading: false,
      },
      {
        text: 'Julio Vilamajó estudió el terreno, el clima, la vegetación y las vistas para proyectar la villa a mediados de la década de 1940. Piedra, ladrillo, madera y quincha acompañan ese diálogo con el lugar.',
        heading: false,
      },
      {
        text: 'Observá el paisaje desde los espacios públicos o en recorridos autorizados.',
        heading: false,
      },
    ],
    zone: 'Villa Serrana',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Recorré los sectores públicos o coordiná una visita acompañada.',
    relationsRaw: 'Villa Serrana · Ventorrillo · Mesón de las Cañas.',
    tagline: 'La piedra también organiza el viaje',
    intro:
      'El granito de Villa Serrana relaciona la geología con el relieve y la arquitectura del conjunto. Los materiales y las decisiones de implantación permiten estudiar cómo el proyecto urbano respondió al terreno y a la vegetación.',
    slug: 'granito-villa-serrana',
    category: 'Geología',
    international: false,
    status: 'Visita no confirmada',
    image: 'panorama',
    imageContext: true,
    summary:
      'Granito, relieve y materiales de construcción que permiten comprender la relación entre geología y arquitectura en Villa Serrana.',
    region: 'Villa Serrana',
    themes: ['Geología'],
  },
  {
    id: 13,
    name: 'Cantera del Portugués',
    blocks: [
      {
        text: 'La Cantera del Portugués integra el patrimonio geológico del Geoparque y permite acercarse al vínculo entre materiales, trabajo y territorio.',
        heading: false,
      },
      {
        text: 'El ingreso requiere autorización de sus responsables. No se ofrece como visita de acceso libre.',
        heading: false,
      },
    ],
    zone: 'Ubicación operativa pendiente',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Ingreso únicamente con autorización.',
    relationsRaw: 'Libro Gigante · patrimonio geológico.',
    tagline: 'Una página de la memoria mineral',
    intro:
      'La Cantera del Portugués integra el patrimonio geológico del Geoparque. Su documentación permite situar preguntas sobre materiales, trabajo y transformación del territorio, con ingreso sujeto a autorización.',
    slug: 'cantera-del-portugues',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'Patrimonio geológico que vincula materiales, trabajo y transformación del territorio; ingreso sujeto a autorización.',
    region: 'Minas y entorno',
    themes: ['Geología'],
  },
  {
    id: 14,
    name: 'Salto del Penitente',
    blocks: [
      {
        text: 'El salto, la roca y una arquitectura pensada desde la ladera',
        heading: true,
      },
      {
        text: 'El Salto del Penitente reúne roca expuesta, agua que desciende entre las sierras y vegetación concentrada en zonas húmedas. El parador se aborda desde su parte superior y acompaña el desnivel del terreno; su cubierta permite observar la relación entre arquitectura y paisaje.',
        heading: false,
      },
      {
        text: 'El parque surgió de la donación de un predio de Francisco Ferber a la Intendencia. El parador fue resultado de un concurso de 2003 y se inauguró en agosto de 2004. La posición del edificio en la pendiente permite analizar cómo una intervención arquitectónica organiza el acceso y las vistas hacia el salto.',
        heading: false,
      },
      {
        text: 'Interpretación del paisaje y modalidades de actividad',
        heading: true,
      },
      {
        text: 'El operador documenta caminatas, escalada, rappel, tirolesa y cabalgatas guiadas. Las actividades de aventura y cabalgata se anuncian para fines de semana y feriados; sus condiciones de realización y seguridad se confirman con el operador.',
        heading: false,
      },
      {
        text: 'La lectura ambiental del sitio relaciona pendiente, roca expuesta, circulación del agua y vegetación de sectores húmedos. Los distintos usos del parque requieren identificar recorridos autorizados y condiciones específicas de cada actividad.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Acceso: Ruta 8 km 134 y unos 8 km de camino de entrada. El operador informa 10:00- 18:00, ingreso pago y pagos en efectivo. Los seis parrilleros tienen uso gratuito; parrilla y leña se consiguen como servicios adicionales. La aventura se anuncia para fines de semana y feriados. Mascotas con correa. El paisaje de agua no garantiza condiciones de baño para una fecha concreta.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Teléfono fijo +598 4440 3096',
        heading: false,
      },
      {
        text: 'Celular +598 99 090 974',
        heading: false,
      },
      {
        text: 'Consultas y reservas info@saltodelpenitente.com',
        heading: false,
      },
      {
        text: 'Sitio oficial https://saltodelpenitente.com/es/',
        heading: false,
      },
    ],
    zone: 'Sierras del este de Minas',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Ingreso y actividades según operador',
    relationsRaw: 'Villa Serrana · Minas · alojamiento del Penitente.',
    tagline: 'Donde el agua se abre camino',
    intro:
      'El Salto del Penitente relaciona roca expuesta, agua y vegetación de zonas húmedas. La implantación del parador en la pendiente también permite analizar cómo la arquitectura se adapta al relieve.',
    slug: 'salto-del-penitente',
    category: 'Geología',
    international: false,
    status: 'Coordinación previa',
    image: 'penitente',
    imageContext: false,
    channel: {
      url: 'https://saltodelpenitente.com/es/',
      label: 'Parque Salto del Penitente',
    },
    summary:
      'Roca expuesta, agua y vegetación de zonas húmedas, junto a un parador adaptado a la pendiente serrana.',
    region: 'Penitente',
    themes: ['Agua', 'Aventura', 'Sabores', 'Geología'],
  },
  {
    id: 15,
    name: 'Cerro Campanero',
    blocks: [
      {
        text: 'Campanero reúne referencias a un cerro, un arroyo y una zona rural del entorno de Minas. Cada uno tiene condiciones de acceso propias.',
        heading: false,
      },
      {
        text: 'Antes de trasladarte al cerro, consultá el punto de llegada y las posibilidades de realizar una actividad acompañada.',
        heading: false,
      },
    ],
    zone: 'Campanero',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Acceso al cerro por confirmar',
    relationsRaw: 'Paisaje del Campanero · Minas · Penitente.',
    tagline: 'Otra manera de encontrarse con la sierra',
    intro:
      'Campanero reúne referencias a un cerro, un arroyo y una zona rural del entorno de Minas. Distinguir estos lugares permite interpretar el territorio y reconocer que sus puntos de llegada y condiciones de acceso son diferentes.',
    slug: 'cerro-campanero',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Referencias a un cerro, un arroyo y una zona rural de Minas que requieren distinguir sus ubicaciones y condiciones de acceso.',
    region: 'Minas y entorno',
    themes: ['Geología'],
  },
  {
    id: 16,
    name: 'Parque Represa de OSE',
    blocks: [
      {
        text: 'Infraestructura hidráulica y relación entre ciudad y agua',
        heading: true,
      },
      {
        text: 'La Represa y Parque OSE de Minas documentan una relación entre ciudad y agua. La obra data de 1934 y describe un muro de unos 250 metros y un embalse con capacidad de un millón de metros cúbicos. El entorno público reúne vegetación y equipamiento de uso recreativo.',
        heading: false,
      },
      {
        text: 'El interés documental se centra en la obra hidráulica, el embalse y su relación con la ciudad. El espacio recreativo y las instalaciones operativas de abastecimiento tienen funciones y condiciones de acceso diferentes.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'La ubicación del acceso recreativo de Parque OSE debe confirmarse al organizar un traslado. Las instalaciones operativas de abastecimiento no forman parte del acceso público. Este registro es distinto de la represa de Aguas Blancas.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Natural',
    statusRaw: 'Acceso recreativo por confirmar',
    relationsRaw: 'Minas · Salus · Aguas Blancas.',
    tagline: 'El agua y la ciudad, en una misma escena',
    intro:
      'La Represa y Parque OSE documentan una relación histórica entre infraestructura, agua y ciudad. El muro, el embalse y la vegetación del entorno permiten reconocer una obra vinculada a la vida cotidiana de Minas.',
    slug: 'parque-represa-de-ose',
    category: 'Naturaleza',
    international: false,
    status: 'Coordinación previa',
    image: 'panorama',
    imageContext: true,
    summary:
      'Infraestructura histórica de agua y parque que permite relacionar el embalse con la vida urbana de Minas.',
    region: 'Minas y entorno',
    themes: ['Agua', 'Naturaleza'],
  },
  {
    id: 17,
    name: 'Parque de Minas',
    blocks: [
      {
        text: 'Una secuencia para estudiar la historia de Rodinia',
        heading: true,
      },
      {
        text: 'La presentación institucional del Geoparque describe el Grupo Parque de Minas / Complejo Zanja del Tigre como una secuencia volcanosedimentaria del Terreno Nico Pérez, relevante para comprender la unión de los bloques que formaron Rodinia. Esta evidencia geológica permite relacionar el sitio con procesos continentales de una escala muy anterior al paisaje actual. Fuente: presentación institucional del Geoparque, página 7.',
        heading: false,
      },
      {
        text: 'Usos colectivos, paisaje y actividades productivas',
        heading: true,
      },
      {
        text: 'Parque de Minas es un complejo serrano sobre Ruta 12, km 347,5, desarrollado para el descanso colectivo desde la década de 1940. En una extensión cercana a 500 hectáreas reúne sectores de bosque, caminos, instalaciones deportivas y espacios productivos. El arroyo, las piscinas y el miniparque acuático corresponden a espacios y usos diferentes del agua.',
        heading: false,
      },
      {
        text: 'La documentación del establecimiento incluye tambo, huerta, producción avícola y otros sectores de granja. El ordeñe y la relación entre producción y alimentación permiten explicar tareas rurales y procesos de obtención de alimentos. El acceso a estos sectores y la participación en actividades se acuerdan con sus responsables.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Ruta 12, km 347,5. Hotel: 4443 0000. Reservas por mensajes: 098 727 783. Ofrece estadía en habitaciones o casas, visita por el día y servicios gastronómicos.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Hotel +598 4443 0000',
        heading: false,
      },
      {
        text: 'Reservas, sólo mensajes +598 98 727 783',
        heading: false,
      },
      {
        text: 'Reservas parqueminasreservas@ute.com.uy',
        heading: false,
      },
      {
        text: 'Sitio oficial https://parquedeminas.uy/',
        heading: false,
      },
    ],
    zone: 'Ruta 12 y sierras del sur',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Reserva de alojamiento o visita diurna',
    relationsRaw: 'Minas · Mirador Ramallo · geología del geoparque.',
    tagline: 'Las huellas de un mar antiguo',
    intro:
      'El geositio Parque de Minas permite estudiar una secuencia volcanosedimentaria vinculada a la historia de Rodinia. Su entorno también relaciona bosque, actividades productivas y usos del territorio.',
    slug: 'parque-de-minas',
    category: 'Geología',
    international: true,
    status: 'Coordinación previa',
    image: 'parque-puente',
    imageContext: false,
    channel: {
      url: 'https://parquedeminas.uy/',
      label: 'Parque de Minas',
    },
    summary:
      'Una secuencia volcanosedimentaria vinculada a Rodinia, en un entorno de bosque y actividades productivas.',
    region: 'Minas y entorno',
    themes: ['Dormir', 'Sabores', 'Geología'],
  },
  {
    id: 18,
    name: 'Cueva Amarilla',
    blocks: [
      {
        text: 'Cómo una excavación reconstruye ocupaciones muy antiguas',
        heading: true,
      },
      {
        text: 'Cueva Amarilla es un sitio de investigación al sur de Parque Salus. El trabajo presentado al Congreso Nacional de Arqueología Uruguaya de 2026 describe una cavidad de unos 9,5 metros, dos entradas naturales y sectores con derrumbe. Los hallazgos incluyen restos de talla de piedra, instrumentos y carbones registrados en tres dimensiones. La posición de cada objeto permite estudiar relaciones entre actividades, depósitos y fechas.',
        heading: false,
      },
      {
        text: 'Los fechados radiocarbónicos informados se sitúan entre 10.470 ± 30 y 9.580 ± 50 años antes del presente, sin calibrar. La difusión pública ha utilizado una antigüedad aproximada de 12.500 años: ambas maneras de expresar el tiempo responden a escalas y procesos de calibración diferentes. Este patrimonio permite contar una historia humana mucho más antigua que la fundación de Minas. El acceso al sitio se vincula a investigación y actividades autorizadas en terreno privado.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'El sitio se encuentra en terrenos privados y los permisos de sus propietarios hicieron posible la investigación. El sitio se dedica a investigación y no tiene acceso turístico libre.',
        heading: false,
      },
    ],
    zone: 'Patrimonio científico al sur de Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Investigación; no visita espontánea',
    relationsRaw: 'Museo Lítico · Casa de la Cultura · Salus como contexto regional.',
    tagline: 'El pasado necesita que sepamos escucharlo',
    intro:
      'Cueva Amarilla es un sitio de investigación arqueológica donde la posición de instrumentos, restos de talla y carbones ayuda a reconstruir actividades humanas del pasado. Su valor depende de conservar el contexto de los hallazgos y de desarrollar únicamente actividades autorizadas.',
    slug: 'cueva-amarilla',
    category: 'Cultura',
    international: false,
    status: 'Visita no confirmada',
    image: 'cantera',
    imageContext: true,
    summary:
      'Sitio arqueológico donde instrumentos, restos de talla y carbones se estudian en su contexto, mediante actividades autorizadas.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 19,
    name: 'Mirador Ramallo',
    blocks: [
      {
        text: 'El Mirador Ramallo forma parte del patrimonio cultural del paisaje serrano.',
        heading: false,
      },
      {
        text: 'Consultá el acceso y las condiciones del lugar antes de planificar una parada.',
        heading: false,
      },
    ],
    zone: 'Sierras de Ramallo',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Consultá el acceso y las condiciones del mirador.',
    relationsRaw: 'Minas · lectura del paisaje serrano.',
    tagline: 'Una pausa con horizonte',
    intro:
      'El Mirador Ramallo integra el patrimonio cultural del paisaje serrano. Su registro permite incorporar la observación del paisaje a la lectura del territorio, con condiciones de acceso que deben confirmarse.',
    slug: 'mirador-ramallo',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Registro del patrimonio cultural del paisaje serrano, con condiciones de acceso que deben confirmarse.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 20,
    name: 'Cantera Libro Gigante',
    blocks: [
      {
        text: 'La Cantera Libro Gigante, también conocida como Libro del Gigante, se vincula con la piedra pizarra y la memoria del trabajo minero.',
        heading: false,
      },
      {
        text: 'Su interés reúne geología y producción. Las visitas deben coordinarse con anticipación y realizarse por recorridos autorizados.',
        heading: false,
      },
    ],
    zone: 'Patrimonio minero del geoparque',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Visita especializada autorizada',
    relationsRaw: 'Mina Verdún · Villa Serrana · patrimonio productivo.',
    tagline: 'La piedra como archivo y como oficio',
    intro:
      'La Cantera Libro Gigante vincula la piedra pizarra con la memoria del trabajo minero. Su interpretación reúne la formación de los materiales y sus usos productivos, con recorridos sujetos a autorización.',
    slug: 'cantera-libro-gigante',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'Cantera vinculada a la piedra pizarra y a la memoria del trabajo minero; su interpretación reúne geología y producción.',
    region: 'Minas y entorno',
    themes: ['Geología'],
  },
  {
    id: 21,
    name: 'Abra de Zabaleta',
    blocks: [
      {
        text: 'El Abra de Zabaleta forma parte del paisaje serrano que se recorre por Ruta 81, en el entorno de Aguas Blancas.',
        heading: false,
      },
      {
        text: 'El camino permite observar la relación entre el relieve y el agua. Elegí puntos de detención seguros y utilizá únicamente accesos habilitados.',
        heading: false,
      },
    ],
    zone: 'Ruta 81 y Aguas Blancas',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Elegí puntos seguros para detenerte a mirar el paisaje.',
    relationsRaw: 'Aguas Blancas · Reserva El Abra · Solís de Mataojo.',
    tagline: 'El camino también forma parte del destino',
    intro:
      'El Abra de Zabaleta permite observar relaciones entre relieve y agua en el paisaje serrano de Ruta 81. La lectura del entorno requiere distinguir el corredor vial de los sectores con acceso habilitado.',
    slug: 'abra-de-zabaleta',
    category: 'Geología',
    international: false,
    status: 'Coordinación previa',
    image: 'aguas',
    imageContext: true,
    summary:
      'Paisaje serrano de Ruta 81 que permite observar relaciones entre relieve y agua, utilizando sectores habilitados.',
    region: 'Solís y Aguas Blancas',
    themes: ['Agua', 'Geología'],
  },
  {
    id: 22,
    name: 'Templo Budista Chagdud Gonpa Sengue Dzong',
    blocks: [
      {
        text: 'Chagdud Sengue Dzong es un centro de budismo tibetano en el paisaje de Aguas Blancas. Su propuesta cultural y espiritual tiene tiempos y condiciones de visita propios.',
        heading: false,
      },
      {
        text: 'El centro anunció un cierre temporal por reformas. Consultá su reapertura antes de acercarte.',
        heading: false,
      },
      {
        text: 'Consultas de visitas por mensaje: +598 95 489 550. Retiros y otras consultas por mensaje: +598 94 700 137.',
        heading: false,
      },
    ],
    zone: 'Aguas Blancas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Consultá la reapertura antes de ir.',
    relationsRaw: 'Aguas Blancas · Reserva El Abra · patrimonio religioso.',
    tagline: 'Conocer también significa respetar otros ritmos',
    intro:
      'Chagdud Sengue Dzong es un centro de budismo tibetano en el paisaje de Aguas Blancas. Su valor cultural se relaciona con la práctica espiritual y con el uso del lugar por su comunidad.',
    slug: 'templo-budista-chagdud-gonpa-sengue-dzong',
    category: 'Cultura',
    international: false,
    status: 'Visita no confirmada',
    image: 'panorama',
    imageContext: true,
    channel: {
      url: 'https://budismo.com.uy/visitas/',
      label: 'Consultar aviso de visitas',
    },
    summary:
      'Centro de budismo tibetano cuyo valor cultural se relaciona con la práctica espiritual y la vida de su comunidad.',
    region: 'Solís y Aguas Blancas',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 23,
    name: 'Campamento Aguas Blancas',
    blocks: [
      {
        text: 'Aguas Blancas es uno de los cuatro geositios de valor científico internacional del Geoparque. La Zona de Cizalla Sarandí del Yi–Piriápolis permite acercarse a una gran frontera tectónica.',
        heading: false,
      },
      {
        text: 'La geología se relaciona con un paisaje de embalse y sierras. El registro científico y las actividades del camping tienen finalidades y accesos diferentes que deben identificarse al organizar una observación.',
        heading: false,
      },
    ],
    zone: 'Aguas Blancas',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Coordiná el recorrido y su punto de encuentro.',
    relationsRaw: 'Abra de Zabaleta · Camping Aguas Blancas.',
    tagline: 'Cicatrices de la Tierra',
    intro:
      'El registro de Aguas Blancas vincula el paisaje de embalse y sierras con la Zona de Cizalla Sarandí del Yi–Piriápolis, una gran frontera tectónica. La interpretación del geositio y las actividades del camping corresponden a ámbitos y accesos diferentes.',
    slug: 'campamento-aguas-blancas',
    category: 'Geología',
    international: true,
    status: 'Coordinación previa',
    image: 'aguas',
    imageContext: false,
    summary:
      'Geositio de valor científico internacional vinculado a la Zona de Cizalla Sarandí del Yi–Piriápolis y al paisaje de embalse y sierras.',
    region: 'Solís y Aguas Blancas',
    themes: ['Agua', 'Geología'],
  },
  {
    id: 24,
    name: 'Camping Aguas Blancas',
    blocks: [
      {
        text: 'Embalse, camping y el paisaje de Ruta 81',
        heading: true,
      },
      {
        text: 'El camping municipal se sitúa junto al agua represada y al paisaje del Abra de Zabaleta. Reúne áreas de acampe, parrilleros, baños y servicios de apoyo. El embalse y sus orillas permiten relacionar el relieve serrano con los usos recreativos del territorio.',
        heading: false,
      },
      {
        text: 'La infraestructura de camping, cabañas y recreación tiene condiciones de funcionamiento propias. Una actividad de observación del entorno debe identificar los sectores autorizados y distinguir sus usos de los del geositio de Aguas Blancas.',
        heading: false,
      },
      {
        text: 'La memoria rural de la zona, la interpretación de biodiversidad documentada en Reserva El Abra y el patrimonio de Solís de Mataojo aportan referencias complementarias para estudiar el territorio. Cada lugar tiene responsables y condiciones de acceso propios.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Acceso por Ruta 81 desde el entorno de Ruta 8 km 91 o desde Ruta 60. Camping y cabañas son servicios municipales documentados; se elige modalidad al reservar. Las actividades de baño, pesca o navegación tienen condiciones propias y no se deducen de la sola presencia del embalse.',
        heading: false,
      },
    ],
    zone: 'Aguas Blancas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Reserva y condiciones del camping',
    relationsRaw: 'Abra de Zabaleta · Solís de Mataojo · Reserva El Abra.',
    tagline: 'Quedarse junto al paisaje',
    intro:
      'El Camping Aguas Blancas es un espacio municipal de uso recreativo junto al embalse y al paisaje del Abra de Zabaleta. Su ficha distingue la organización del camping y los servicios del entorno de la interpretación geológica de Aguas Blancas.',
    slug: 'camping-aguas-blancas',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'aguas',
    imageContext: false,
    summary:
      'Espacio municipal de uso recreativo junto al embalse de Aguas Blancas, con organización y servicios propios.',
    region: 'Solís y Aguas Blancas',
    themes: ['Agua', 'Cultura', 'Dormir', 'Cultura'],
  },
  {
    id: 25,
    name: 'Cerro La Caperuza',
    blocks: [
      {
        text: 'Cerro La Caperuza permite acercarse a una intrusión granítica de aproximadamente 571 millones de años y a una historia profunda del paisaje serrano.',
        heading: false,
      },
      {
        text: 'Para una visita al cerro, consultá los accesos y la posibilidad de contar con acompañamiento especializado.',
        heading: false,
      },
    ],
    zone: 'Paisaje geológico del sur',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Consulta previa para acceder al cerro.',
    relationsRaw: 'Abra de Zabaleta · Aguas Blancas · geología del geoparque.',
    tagline: 'Una historia profunda, sin apuro',
    intro:
      'Cerro La Caperuza permite estudiar una intrusión granítica y procesos geológicos de larga duración. La interpretación especializada ayuda a relacionar la edad de la roca con la historia del paisaje serrano.',
    slug: 'cerro-la-caperuza',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'Intrusión granítica que permite estudiar procesos geológicos de larga duración en el paisaje serrano.',
    region: 'Solís y Aguas Blancas',
    themes: ['Geología'],
  },
  {
    id: 26,
    name: 'Parque Mataojo',
    blocks: [
      {
        text: 'Agua y espacio público en Solís de Mataojo',
        heading: true,
      },
      {
        text: 'Los parques Figari y Mataojo acompañan el arroyo que da nombre a Solís de Mataojo. El entorno cuenta con mesas, bancos y parrilleros, y registra sanitarios en Parque Mataojo. Estos equipamientos permiten reconocer usos comunitarios del espacio junto al agua.',
        heading: false,
      },
      {
        text: 'Los parques, la plaza y los lugares relacionados con Fabini permiten estudiar dimensiones distintas de Solís de Mataojo: el arroyo, el espacio público y la memoria cultural. La relación entre estos registros ayuda a comprender la organización de la localidad.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'La presencia de agua no equivale por sí sola a una zona habilitada de baño. El parque cuenta con parrilleros, mesas y bancos, y sanitarios en Mataojo. Deben utilizarse las áreas de recreación habilitadas y seguirse las indicaciones del lugar.',
        heading: false,
      },
    ],
    zone: 'Solís de Mataojo',
    categoryRaw: 'Patrimonio Natural',
    statusRaw: 'Uso recreativo según condiciones locales',
    relationsRaw: 'Solís de Mataojo · Plaza Lázaro Cortés · Aguas Blancas.',
    tagline: 'Un almuerzo que también es parte del viaje',
    intro:
      'Los parques Figari y Mataojo acompañan el arroyo de Solís de Mataojo. Estos espacios relacionan agua, vegetación y usos comunitarios, y permiten reconocer cómo se organiza el espacio público de la localidad.',
    slug: 'parque-mataojo',
    category: 'Naturaleza',
    international: false,
    status: 'Paseo por el entorno',
    image: 'panorama',
    imageContext: true,
    summary:
      'Parques junto al arroyo de Solís de Mataojo que relacionan agua, vegetación y usos comunitarios del espacio público.',
    region: 'Solís y Aguas Blancas',
    themes: ['Agua', 'Naturaleza'],
  },
  {
    id: 27,
    name: 'Casa de la Cultura - Solís',
    blocks: [
      {
        text: 'La Casa de la Cultura de Solís de Mataojo forma parte del patrimonio cultural de la localidad.',
        heading: false,
      },
      {
        text: 'Consultá la sede, la agenda y las condiciones de visita antes de organizar un encuentro o una salida en grupo.',
        heading: false,
      },
    ],
    zone: 'Solís de Mataojo',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Consultá sede, agenda y horarios.',
    relationsRaw: 'Cuna de Fabini · plaza · recorrido cultural de Solís.',
    tagline: 'La cultura se construye en el encuentro',
    intro:
      'La Casa de la Cultura de Solís de Mataojo integra el patrimonio cultural de la localidad. Sus actividades y formas de uso se conocen mediante la institución y la comunidad que participa en ella.',
    slug: 'casa-de-la-cultura-solis',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Institución del patrimonio cultural de Solís de Mataojo, vinculada a la actividad y la memoria de su comunidad.',
    region: 'Solís y Aguas Blancas',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 28,
    name: 'Edificio "Cuna de Fabini"',
    blocks: [
      {
        text: 'El edificio conocido como «Cuna de Fabini» integra el patrimonio cultural de Solís de Mataojo. La localidad permite relacionar paisaje, memoria y creación artística.',
        heading: false,
      },
      {
        text: 'Para visitar este inmueble, consultá previamente su ubicación y funcionamiento. No debe confundirse con otros lugares vinculados a la vida del compositor.',
        heading: false,
      },
    ],
    zone: 'Solís de Mataojo',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Consulta previa sobre ubicación y acceso.',
    relationsRaw: 'Solís de Mataojo · Museo Fabini de Minas · Salus.',
    tagline: 'Un nombre, una localidad y muchas formas de crear',
    intro:
      'El edificio conocido como Cuna de Fabini forma parte del patrimonio cultural de Solís de Mataojo. Su identificación permite relacionar memoria local, paisaje y creación artística sin confundir los distintos inmuebles asociados al compositor.',
    slug: 'edificio-cuna-de-fabini',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Edificio del patrimonio cultural de Solís de Mataojo que relaciona memoria local, paisaje y creación artística.',
    region: 'Solís y Aguas Blancas',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 29,
    name: 'Plaza Lázaro Cortés',
    blocks: [
      {
        text: 'La Plaza Lázaro Cortés es un espacio de encuentro y patrimonio cultural de Solís de Mataojo.',
        heading: false,
      },
      {
        text: 'La localidad conmemora su fundación el 12 de agosto de 1874. La plaza, los parques del arroyo y los lugares relacionados con la memoria cultural del pueblo permiten comprender distintas formas de uso del espacio comunitario.',
        heading: false,
      },
    ],
    zone: 'Solís de Mataojo',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Paseo urbano.',
    relationsRaw: 'Casa de la Cultura de Solís · Parque Mataojo.',
    tagline: 'Conocer un pueblo desde su lugar de encuentro',
    intro:
      'La Plaza Lázaro Cortés es un espacio de encuentro y patrimonio cultural de Solís de Mataojo. Su relación con las calles, los parques del arroyo y la memoria de la localidad permite estudiar la vida cotidiana del pueblo.',
    slug: 'plaza-lazaro-cortes',
    category: 'Cultura',
    international: false,
    status: 'Paseo por el entorno',
    image: 'panorama',
    imageContext: true,
    summary:
      'Plaza de Solís de Mataojo donde patrimonio cultural, espacio público y vida comunitaria se relacionan.',
    region: 'Solís y Aguas Blancas',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 30,
    name: 'Plaza de Deportes',
    blocks: [
      {
        text: 'La Plaza de Deportes de Solís de Mataojo forma parte de la vida comunitaria y del patrimonio cultural de la localidad.',
        heading: false,
      },
      {
        text: 'Consultá las actividades y los horarios con sus responsables. El uso de las instalaciones está sujeto a sus condiciones de funcionamiento.',
        heading: false,
      },
    ],
    zone: 'Solís de Mataojo',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Consultá actividades y horarios.',
    relationsRaw: 'Espacios públicos de Solís de Mataojo.',
    tagline: 'La vida compartida también es patrimonio',
    intro:
      'La Plaza de Deportes de Solís de Mataojo forma parte de la vida comunitaria y del patrimonio cultural local. Sus usos deportivos y colectivos dependen de las actividades y condiciones de funcionamiento de la instalación.',
    slug: 'plaza-de-deportes',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Instalación deportiva de Solís de Mataojo que integra la vida comunitaria y el patrimonio cultural local.',
    region: 'Solís y Aguas Blancas',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 31,
    name: 'Reserva Natural Parque Salus',
    blocks: [
      {
        text: 'Antiguos ambientes marinos y registro fósil',
        heading: true,
      },
      {
        text: 'La presentación institucional identifica en el geositio Salus al Grupo Arroyo del Soldado, una secuencia de plataforma marina cuyo registro fósil permite correlacionar unidades geológicas y reconstruir procesos asociados a la formación de Gondwana. Ese patrimonio se estudia en relación con el agua y los ambientes actuales. Fuente: presentación institucional del Geoparque, página 8.',
        heading: false,
      },
      {
        text: 'Sectores, manantial y recursos de interpretación',
        heading: true,
      },
      {
        text: 'Salus distingue los Jardines del Puma y el Parque Familiar. Los jardines reúnen la fuente, el centro de interpretación, la galería al aire libre y el Sendero de la Diversidad. El Parque Familiar se ubica a 3,5 kilómetros de la fuente sobre el acceso y cuenta con recepción, microcine, senderos y espacios recreativos.',
        heading: false,
      },
      {
        text: 'El manantial, el bosque y la historia de Salus permiten abordar relaciones entre agua, ambientes y usos del territorio. La separación entre Jardines del Puma y Parque Familiar debe considerarse al organizar transporte y acompañamiento de un grupo.',
        heading: false,
      },
      {
        text: 'Senderos e interpretación ambiental',
        heading: true,
      },
      {
        text: 'Los senderos documentados tienen longitudes diferentes: Pequeño Explorador, menos de un kilómetro; Agua, menos de dos; Puma, alrededor de siete. El recorrido al Cerro del Águila se realiza con guardaparques. La elección de un recorrido requiere confirmar las condiciones reales y las necesidades del grupo.',
        heading: false,
      },
      {
        text: 'El agua, la vegetación y el manejo de la reserva son temas de interpretación. El registro de cambios de sombra, ambientes húmedos, plantas y sonidos de aves permite relacionar observaciones de campo con la información del centro de interpretación.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Jardines del Puma: ingreso libre. Parque Familiar: entrada y registro; se ubica a unos 3,5 km de los Jardines. El recorrido al Cerro del Águila se hace con guardaparques. Grupos: reservanaturalsalus@gmail.com. Salus no admite mascotas, campamento ni fuego.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Consultas de grupos reservanaturalsalus@gmail.com',
        heading: false,
      },
      {
        text: 'Sitio de visita https://reservanaturalsalus.com.uy/',
        heading: false,
      },
    ],
    zone: 'Ruta 8 y entorno de Minas',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Sectores con modalidades diferentes',
    relationsRaw: 'Minas · Arequita · interpretación del agua.',
    tagline: 'Donde la roca guarda agua y vida',
    intro:
      'En Salus, las rocas y los fósiles del Grupo Arroyo del Soldado permiten estudiar antiguos ambientes marinos. El manantial, el bosque y los recursos de interpretación conectan ese patrimonio con el agua y la biodiversidad actuales.',
    slug: 'reserva-natural-parque-salus',
    category: 'Geología',
    international: true,
    status: 'Coordinación previa',
    image: 'salus',
    imageContext: false,
    channel: {
      url: 'https://reservanaturalsalus.com.uy/',
      label: 'Reserva Natural Salus',
    },
    summary:
      'Rocas y fósiles de antiguos ambientes marinos, en relación con el manantial, el bosque y la biodiversidad actuales.',
    region: 'Minas y entorno',
    themes: ['Agua', 'Geología'],
  },
  {
    id: 32,
    name: 'Mina ANCAP',
    blocks: [
      {
        text: 'Mina ANCAP reúne patrimonio geológico y memoria productiva del entorno de Minas.',
        heading: false,
      },
      {
        text: 'El ingreso requiere autorización de sus responsables y condiciones específicas de seguridad. No se ofrece como visita de acceso libre.',
        heading: false,
      },
    ],
    zone: 'Entorno de Minas',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Visita no confirmada; autorización indispensable',
    relationsRaw: 'Mina Verdún · Libro Gigante · patrimonio minero.',
    tagline: 'La memoria productiva también se puede interpretar',
    intro:
      'Mina ANCAP reúne patrimonio geológico y memoria productiva del entorno de Minas. El estudio de materiales y transformaciones del territorio requiere información técnica y las condiciones de seguridad que definan sus responsables.',
    slug: 'mina-ancap',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'Patrimonio geológico y memoria productiva del entorno de Minas, con ingreso sujeto a autorización y condiciones de seguridad.',
    region: 'Minas y entorno',
    themes: ['Geología'],
  },
  {
    id: 33,
    name: 'Cerro del Verdún',
    blocks: [
      {
        text: 'Peregrinación, paisaje y una historia de trenes especiales',
        heading: true,
      },
      {
        text: 'La colocación de la imagen en la cumbre fue impulsada por el párroco José De Luca. La estatua, traída de Francia, se inauguró el 21 de abril de 1901; llegaron trenes especiales desde Montevideo y miles de fieles. La principal peregrinación anual se consolidó el 19 de abril. El ascenso incorpora catorce estaciones del Vía Crucis y alcanza una cumbre situada a 326 metros sobre el nivel del mar.',
        heading: false,
      },
      {
        text: 'Las estaciones del Vía Crucis organizan el recorrido religioso y permiten comprender cómo el cerro se convirtió en un lugar de encuentro colectivo. La capilla de la base, la Casa del Peregrino y la cumbre corresponden a sectores distintos del santuario; sus recorridos requieren considerar las capacidades de cada persona.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Para grupos y retiros, contactá al santuario o a la Casa de Retiro. Elegí un turno concreto para retiros o grupos. La fiesta principal es el 19 de abril; para celebraciones ordinarias, la página oficial publica la agenda litúrgica.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Santuario Virgen del Verdún / Catedral de Minas +59844422074',
        heading: false,
      },
      {
        text: 'Santuario Virgen del Verdún catedraldeminas@gmail.com',
        heading: false,
      },
      {
        text: 'Santuario Virgen del Verdún https://www.virgendelverdun.com/',
        heading: false,
      },
      {
        text: 'Santuario / Catedral de Minas +598 4442 2074',
        heading: false,
      },
      {
        text: 'Oferta de la Casa de Retiro https://www.virgendelverdun.com/casa-de-retiro',
        heading: false,
      },
    ],
    zone: 'Entorno oeste de Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Santuario; consulta de celebraciones y acceso',
    relationsRaw: 'Catedral de Minas · Casa de la Cultura.',
    tagline: 'Un ascenso que cada persona vive de una manera',
    intro:
      'El Cerro del Verdún permite estudiar cómo un relieve se transforma en un lugar de devoción y encuentro colectivo. El santuario, las estaciones del Vía Crucis y la historia de la imagen articulan paisaje, práctica religiosa y memoria social.',
    slug: 'cerro-del-verdun',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'panorama',
    imageContext: true,
    channel: {
      url: 'https://www.virgendelverdun.com/',
      label: 'Santuario del Verdún',
    },
    summary:
      'Relieve transformado en santuario y lugar de peregrinación, donde paisaje, práctica religiosa y memoria social se relacionan.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 34,
    name: 'Mina Verdún',
    blocks: [
      {
        text: 'El estudio geológico ubica la cantera en el lado oriental del Cerro Verdún y describe lutitas, margas, calizas y dolomías. Son distintos tipos de roca sedimentaria que permiten reconstruir antiguos ambientes de acumulación.',
        heading: false,
      },
      {
        text: 'La Formación El Calabozo contiene estructuras columnares de laminación cónica asignadas a Conophyton. Se interpretan como registros de actividad biológica en un ambiente marino antiguo; no son huesos de dinosaurios ni estatuas naturales recientes.',
        heading: false,
      },
      {
        text: 'La acumulación de capas durante largos períodos ayuda a interpretar estas estructuras. La forma preservada aporta información sobre el ambiente, pero por sí sola no fija una edad exacta. El interés científico de la cantera se suma a su uso productivo. La observación geológica se organiza con los responsables del sitio; el santuario de la Virgen del Verdún tiene otro acceso.',
        heading: false,
      },
      {
        text: 'La visita a la mina requiere autorización; no comparte acceso turístico con el santuario.',
        heading: false,
      },
    ],
    zone: 'Entorno del Cerro Verdún',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Visita científica o especializada autorizada',
    relationsRaw: 'Cerro del Ombú · geología del geoparque.',
    tagline: 'Cuando el paisaje era otro mundo',
    intro:
      'Mina Verdún conserva rocas sedimentarias y estructuras asignadas a Conophyton que permiten interpretar antiguos ambientes marinos. Su valor científico se comprende a partir de la relación entre la forma preservada, el contexto geológico y la investigación.',
    slug: 'mina-verdun',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'Rocas sedimentarias y estructuras asignadas a Conophyton que permiten interpretar antiguos ambientes marinos.',
    region: 'Minas y entorno',
    themes: ['Geología'],
  },
  {
    id: 35,
    name: 'Centro Cultural Ángel Ugarte ( Ex Estación de AFE)',
    blocks: [
      {
        text: 'Patrimonio gráfico, técnicas y reutilización de un edificio',
        heading: true,
      },
      {
        text: 'El Museo Nacional del Grabado se creó en diciembre de 1999 mediante el acuerdo de la Fundación Lolita Rubial, la Intendencia de Lavalleja y el Club de Grabado de Montevideo. Su colección abarca obra gráfica uruguaya e internacional, exlibris, miniprints y creación digital. El catálogo de la Fundación permite reconocer técnicas y autores: Máscara indoamericana de Ignacio Márquez es una xilografía; Altzella de Valentina Torrado combina aguatinta y punta seca; El gaucho de Javier Hernández es otra obra en xilografía.',
        heading: false,
      },
      {
        text: 'La comparación de técnicas permite estudiar cómo cambia una imagen según su proceso de producción. El acervo y el catálogo del museo son más amplios que una exposición temporal. Su sede en el Centro Ángel Ugarte relaciona actividad cultural y recuperación del antiguo entorno ferroviario de Minas.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'La apertura del complejo fue el 3 de mayo de 2024; la sala del Museo Nacional del Grabado abrió en noviembre de 2024. Para ver obra gráfica, pedí la exposición y la sala concretas: el año de apertura de esta sede no es el año de creación del museo.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Agenda cultural y salas por confirmar',
    relationsRaw: 'Museo del Grabado · centro de Minas · Teatro Lavalleja.',
    tagline: 'Los edificios también pueden empezar otra vida',
    intro:
      'El Centro Cultural Ángel Ugarte relaciona la recuperación del antiguo entorno ferroviario con nuevos usos culturales. La sede del Museo Nacional del Grabado permite conocer técnicas de producción gráfica y formas de conservar y compartir ese patrimonio.',
    slug: 'centro-cultural-angel-ugarte-ex-estacion-de-afe',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Recuperación del entorno ferroviario para usos culturales, con patrimonio gráfico y técnicas del Museo Nacional del Grabado.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 36,
    name: 'Museo Stelio Belloni',
    blocks: [
      {
        text: 'El Museo Stelio Belloni reúne bocetos, modelos, yesos y bronces que permiten aproximarse al proceso previo a una escultura monumental. En el atrio de la Intendencia, el recorrido Belloni del MEC documenta los yesos originales del boceto del monumento a José Enrique Rodó, cuya obra definitiva está en Montevideo. Estos materiales ayudan a comprender cómo una idea toma forma y cambia de escala.',
        heading: false,
      },
      {
        text: 'El Museo Stelio Belloni y el monumento del Cerro Artigas aportan referencias complementarias sobre el proceso escultórico. Cada colección y espacio tiene acceso y condiciones propios; la apertura del museo debe confirmarse.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Visita de museo por confirmar',
    relationsRaw: 'Cerro Artigas · Plaza Libertad · Ruta Belloni.',
    tagline: 'Antes del monumento hubo una idea',
    intro:
      'El Museo Stelio Belloni reúne bocetos, modelos, yesos y bronces vinculados al proceso de creación escultórica. Estos materiales permiten estudiar decisiones de forma y escala y relacionarlas con obras presentes en el espacio público.',
    slug: 'museo-stelio-belloni',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'artesania',
    imageContext: true,
    summary:
      'Bocetos, modelos, yesos y bronces que documentan el proceso de creación escultórica y los cambios de escala.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 37,
    name: 'Edificio Escuela 1 de Prácticas "Artigas"',
    blocks: [
      {
        text: 'El edificio de la Escuela n.º 1 de Prácticas «Artigas» integra el patrimonio cultural de Minas.',
        heading: false,
      },
      {
        text: 'Las visitas se coordinan directamente con la institución y respetan su actividad educativa.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Visita institucional únicamente con autorización',
    relationsRaw: 'Escuela 8 · memoria educativa de Minas.',
    tagline: 'Las aulas también guardan memoria',
    intro:
      'El edificio de la Escuela n.º 1 de Prácticas Artigas integra el patrimonio cultural de Minas. Su conocimiento se vincula a la memoria educativa de la ciudad y debe respetar la actividad cotidiana de la institución.',
    slug: 'edificio-escuela-1-de-practicas-artigas',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Edificio escolar del patrimonio cultural de Minas, vinculado a la memoria educativa y a una institución en funcionamiento.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 38,
    name: 'Edificio Escuela 8 "Guillermo Cuadri"',
    blocks: [
      {
        text: 'La Escuela n.º 8 Guillermo Cuadri es Monumento Histórico Nacional. Está ubicada en José Batlle y Ordóñez 884, en Minas.',
        heading: false,
      },
      {
        text: 'La memoria escolar es parte del interés patrimonial del edificio. Las visitas se coordinan con la institución y respetan sus actividades.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Visita institucional por coordinar',
    relationsRaw: 'Escuela 1 · patrimonio de Minas.',
    tagline: 'Una historia de aprendizajes compartidos',
    intro:
      'La Escuela n.º 8 Guillermo Cuadri es Monumento Histórico Nacional y forma parte de la memoria educativa de Minas. El valor patrimonial del edificio se relaciona con su historia escolar y con una institución en funcionamiento.',
    slug: 'edificio-escuela-8-guillermo-cuadri',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Monumento Histórico Nacional que relaciona patrimonio arquitectónico, memoria escolar y actividad educativa.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 39,
    name: 'Plaza Libertad',
    blocks: [
      {
        text: 'Trazado urbano y memoria pública de Minas',
        heading: true,
      },
      {
        text: 'La Plaza Libertad reúne varias de las claves de Minas: el trazado urbano, los edificios cívicos, la vista hacia la catedral y el recuerdo de Juan Antonio Lavalleja. Su monumento ecuestre, obra de Juan Manuel Ferrari, fue inaugurado el 12 de octubre de 1902. Se lo reconoce como la primera estatua ecuestre inaugurada en Uruguay. La Jefatura de Policía y el Club Minas forman parte de los edificios que ayudan a reconocer el entorno.',
        heading: false,
      },
      {
        text: 'La disposición de calles, fachadas y monumentos permite analizar la organización del centro de Minas. La plaza funciona como espacio de encuentro, comercio y circulación. La intervención de 2018 incorporó iluminación y juegos de agua, modificando algunos usos y formas de percepción del lugar.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Paseo urbano',
    relationsRaw: 'Catedral · Casa de la Cultura · Irisarri.',
    tagline: 'Empezá por el lugar donde la ciudad se encuentra',
    intro:
      'La Plaza Libertad reúne trazado urbano, edificios cívicos y representaciones de la memoria de Minas. El monumento a Lavalleja y las fachadas del entorno permiten estudiar cómo se construyen la identidad pública y el espacio de encuentro de una ciudad.',
    slug: 'plaza-libertad',
    category: 'Cultura',
    international: false,
    status: 'Paseo por el entorno',
    image: 'gauchos',
    imageContext: true,
    summary:
      'Espacio cívico donde trazado urbano, edificios y monumentos permiten estudiar la memoria pública de Minas.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 40,
    name: 'Confitería Irisarri',
    blocks: [
      {
        text: 'Cafetería · Minas',
        heading: false,
      },
      {
        text: 'Contacto: +598 4442 2038 · +598 4442 4008',
        heading: false,
      },
      {
        text: 'La historia familiar de Irisarri comienza en 1898, cuando Manuel Irisarri Aguirre compró un comercio de billar y chocolatería en Minas. En el relato de sus descendientes aparece una vida comercial anterior: Manuel recorría la campaña vendiendo productos desde una carreta y decidió establecerse al formar su familia. Esa transición, del comercio ambulante a una casa frente a la plaza, ayuda a entender la relación de la confitería con la ciudad y con quienes llegaban desde el campo.',
        heading: false,
      },
      {
        text: 'La confitería se desarrolló como lugar de encuentro, salón de té y comercio de especialidades. La entrevista familiar publicada por sus 125 años documenta continuidad de oficios y recetas a lo largo de varias generaciones. Esa trayectoria forma parte de la memoria productiva y comercial de Minas.',
        heading: false,
      },
      {
        text: 'Entre las especialidades están las yemas, serranitos, damasquitos y alfajores Verdún. Florencia Irisarri explicó en una entrevista de mayo de 2026 que las yemas desarrollaron la tradición española del yemón incorporando una cubierta de caramelo. También relató que los alfajores Verdún tuvieron primero el nombre Franquitos. La casa mantiene la fabricación de pastas y la elaboración en Minas.',
        heading: false,
      },
      {
        text: 'La cuarta generación está incorporando equipamiento y ampliando la distribución. Estos cambios permiten estudiar la continuidad de una empresa familiar y la transformación de sus formas de producción y comercialización.',
        heading: false,
      },
      {
        text: 'La casa central está frente a Plaza Libertad, en la cuadra del Club Minas, y reúne venta, cafetería y sandwichería. En el subsuelo se documenta una bodega museo con documentos, objetos de la empresa y una representación de la mesa de los apóstoles. El acceso a ese espacio patrimonial se coordina con el establecimiento.',
        heading: false,
      },
      {
        text: 'También se documenta un local en el acceso de Ruta 8, sobre avenida Baltasar Brum y calle 144. Los distintos locales tienen funciones comerciales propias. El perfil consultado publica para Minas el teléfono 4442 4008.',
        heading: false,
      },
      {
        text: 'Canal de consulta: https://www.tripadvisor.com.ar/Restaurant_Review-g1933338-d8664715-Reviews- or20-Confiteria_Irisarri-Minas_Lavalleja_Department.html',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Atención comercial; reconfirmar sucursal',
    relationsRaw: 'Plaza Libertad · Museo del Alfajor · paseo urbano.',
    tagline: 'El recuerdo también puede tener sabor',
    intro:
      'La historia de Irisarri relaciona trabajo familiar, comercio y vida urbana desde fines del siglo XIX. Su trayectoria permite conocer vínculos entre la campaña, la producción gastronómica y la memoria de Minas.',
    slug: 'confiteria-irisarri',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'gastronomia',
    imageContext: true,
    channel: {
      url: 'tel:+59844424008',
      label: '+598 4442 4008',
    },
    summary:
      'Historia de trabajo familiar y comercio que relaciona producción gastronómica, campaña y memoria urbana de Minas.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Sabores', 'Cultura'],
  },
  {
    id: 41,
    name: 'Catedral de la Inmaculada Concepción de Minas',
    blocks: [
      {
        text: 'La fachada y el espacio interior',
        heading: true,
      },
      {
        text: 'La catedral de la Inmaculada Concepción y San Felipe y Santiago se inauguró en 1892. Su composición neoclásica, la simetría de la fachada y las torres le dan una presencia reconocible en el centro de Minas. En el interior, las bóvedas y la secuencia de los espacios permiten apreciar cómo el edificio organiza la luz y la mirada hacia el altar.',
        heading: false,
      },
      {
        text: 'El eje central y las proporciones de puertas, ventanas y torres permiten analizar la composición de la fachada. Las bóvedas y la secuencia interior relacionan escala, luz y uso religioso. El templo es un lugar de culto activo; cualquier observación de su interior se adapta a las celebraciones.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Secretaría parroquial: Treinta y Tres 527, lunes a viernes 15:00-18:00. Las visitas al interior se organizan en armonía con las celebraciones.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Catedral de Minas +59844422074',
        heading: false,
      },
      {
        text: 'Catedral de Minas catedraldeminas@gmail.com',
        heading: false,
      },
      {
        text: 'Catedral de Minas · horarios publicados https://catedraldeminas.com/horarios',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Templo activo; horarios de culto y visita diferentes',
    relationsRaw: 'Plaza Libertad · Verdún · Casa de la Cultura.',
    tagline: 'Mirar la ciudad desde otro silencio',
    intro:
      'La Catedral de la Inmaculada Concepción de Minas reúne patrimonio arquitectónico y vida religiosa. Su composición neoclásica, las torres y la organización interior permiten estudiar proporciones, luz y usos del espacio.',
    slug: 'catedral-de-la-inmaculada-concepcion-de-minas',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'panorama',
    imageContext: true,
    channel: {
      url: 'https://catedraldeminas.com/horarios',
      label: 'Catedral de Minas',
    },
    summary:
      'Patrimonio arquitectónico y religioso que permite estudiar composición neoclásica, proporciones, luz y usos del espacio.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 42,
    name: 'Casa de la Cultura',
    blocks: [
      {
        text: 'Juan Antonio Lavalleja: una casa natal dentro del centro cultural',
        heading: true,
      },
      {
        text: 'El conjunto de Lavalleja 572 conserva la vivienda natal de Juan Antonio Lavalleja y reúne biblioteca, museos, exposiciones y anfiteatro. El museo dedicado al militar ofrece una entrada a la historia de la independencia desde una escala doméstica: la casa y los objetos personales acercan al personaje que aparece a caballo en el monumento de Plaza Libertad. El recorrido incluye uniforme, armas y sable.',
        heading: false,
      },
      {
        text: 'La casa natal y el monumento de Plaza Libertad permiten comparar memoria biográfica y representación pública. Los objetos personales, la vivienda conservada y la escultura ecuestre muestran maneras diferentes de construir una memoria histórica compartida.',
        heading: false,
      },
      {
        text: 'Eduardo Fabini: documentos para acercarse a la música',
        heading: true,
      },
      {
        text: 'El Museo Eduardo Fabini nació el 12 de octubre de 1955 a partir del legado de Emma Suárez, viuda del compositor. El encargo fue confiado a Santiago Dossetti, primer director de Casa de la Cultura. Conserva el archivo de la obra del músico y objetos que permiten estudiar su trayectoria y su proceso de creación.',
        heading: false,
      },
      {
        text: 'Las partituras y los objetos biográficos permiten relacionar el archivo con paisajes de Solís de Mataojo y Salus asociados a Fabini. El vínculo entre documentación, música y memoria local puede estudiarse independientemente de una programación de actuaciones.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Dirección: Lavalleja 572, esquina José Enrique Rodó. Utilizá el contacto de Casa de la Cultura para coordinar una visita de grupo y elegir salas. El horario de oficina de Cultura es administrativo; la apertura de las colecciones se trata como información específica de visita.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Casa de la Cultura de Minas +59844422010',
        heading: false,
      },
      {
        text: 'Dirección de Cultura · correo institucional casadelacultura@lavalleja.gub.uy',
        heading: false,
      },
      {
        text: 'Casa de la Cultura de Minas casadelaculturalavalleja@gmail.com',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Consultar salas y visitas de grupo',
    relationsRaw: 'Plaza Libertad · Teatro · Solís de Mataojo.',
    tagline: 'Elegí una historia y dejá que te lleve',
    intro:
      'La Casa de la Cultura conserva la vivienda natal de Juan Antonio Lavalleja y reúne museos, biblioteca y espacios de exposición. Sus documentos, objetos y colecciones permiten relacionar memoria biográfica, historia de la ciudad y representación pública.',
    slug: 'casa-de-la-cultura',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'gauchos',
    imageContext: true,
    channel: {
      url: 'tel:+59844422010',
      label: '+598 4442 2010',
    },
    summary:
      'Vivienda natal de Lavalleja, museos, biblioteca y colecciones que relacionan historia personal y memoria pública.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 43,
    name: 'Cementerio Central',
    blocks: [
      {
        text: 'El Cementerio Central forma parte del patrimonio cultural de Minas. Es un espacio para acercarse a la memoria de la ciudad con respeto por las familias y la vida cotidiana del lugar.',
        heading: false,
      },
      {
        text: 'Para realizar una visita patrimonial, consultá las condiciones con su administración.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Visita patrimonial a coordinar.',
    relationsRaw: 'Historia urbana de Minas.',
    tagline: 'La memoria también habita los lugares de despedida',
    intro:
      'El Cementerio Central forma parte del patrimonio cultural de Minas y de sus formas de recordar. La lectura histórica de este espacio requiere contexto y respeto por las familias y por su función cotidiana.',
    slug: 'cementerio-central',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Patrimonio cultural de Minas y espacio de memoria que requiere contexto histórico y respeto por su función cotidiana.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 44,
    name: 'Museo Alfajores de las Sierras de Minas',
    blocks: [
      {
        text: 'Objetos, documentos y una historia de producción familiar',
        heading: true,
      },
      {
        text: 'El Museo del Alfajor reúne objetos y documentos de tres generaciones de la familia Cedrés, creadora de Alfajores de las Sierras de Minas. La empresa sitúa su origen en 1953. La colección documenta la continuidad de una actividad familiar y sus vínculos con la producción local.',
        heading: false,
      },
      {
        text: 'Los objetos pueden estudiarse como huellas de trabajo: qué tarea resolvían, qué materiales utilizaban y cómo se organizaban la producción y la venta. Relacionar el producto con sus herramientas y procesos permite abordar conocimientos técnicos y memoria de los oficios.',
        heading: false,
      },
      {
        text: 'Trabajo, documentación y memoria productiva',
        heading: true,
      },
      {
        text: 'El museo se encuentra en Carabajal 405, esquina Colón, junto a la referencia comercial de la fábrica. La documentación publica entrada gratuita y apertura de mañana y tarde con pausa al mediodía; estos datos se confirman con sus responsables. Las colecciones sobre oficios de Minas permiten comparar distintas formas de conservar la memoria productiva.',
        heading: false,
      },
      {
        text: 'La empresa también publica un punto de venta en Plaza Treinta y Tres, sobre 25 de Mayo. El local comercial y el museo de la fábrica tienen funciones distintas; una actividad de estudio de la colección debe coordinarse con el museo.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Carabajal 405, esquina Colón. Lunes a sábados, 8:30-12:30 y 14:30-19:00. Entrada gratuita. Teléfono 4442 3056.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Museo del Alfajor +59844423056',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Visita comercial y museística; reconfirmar horario',
    relationsRaw: 'Irisarri · Museo de Miniaturas · centro de Minas.',
    tagline: 'Una historia familiar detrás de cada recuerdo dulce',
    intro:
      'El Museo del Alfajor reúne objetos y documentos de tres generaciones de la familia Cedrés. Su colección permite conocer técnicas de trabajo, continuidad familiar y transformaciones de una actividad productiva vinculada a Minas.',
    slug: 'museo-alfajores-de-las-sierras-de-minas',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'gastronomia',
    imageContext: true,
    channel: {
      url: 'tel:+59844423056',
      label: '+598 4442 3056',
    },
    summary:
      'Objetos y documentos de tres generaciones de la familia Cedrés que explican técnicas de trabajo y continuidad productiva.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Sabores', 'Cultura'],
  },
  {
    id: 45,
    name: 'Teatro Lavalleja',
    blocks: [
      {
        text: 'El Teatro Lavalleja como escenario de la cultura nacional',
        heading: true,
      },
      {
        text: 'El Teatro Lavalleja reúne historia arquitectónica y actividad cultural. Inaugurado en 1909 y reabierto en 1989 tras su recuperación, es también el lugar donde se realiza el encuentro anual de los Premios Morosoli. La Fundación Lolita Rubial creó esos premios en 1995 como reconocimiento de Minas a personas e instituciones de la cultura uruguaya. El nombre del escritor minuano establece una conexión entre la tradición local y una celebración de alcance nacional.',
        heading: false,
      },
      {
        text: 'El Museo del Humor y la Historieta incorpora caricaturas, dibujo y narración gráfica al conjunto cultural. La sala teatral, la colección y las funciones tienen modalidades propias y permiten estudiar usos diferentes de un mismo edificio.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Se encuentra en José Batlle y Ordóñez, entre Sarandí y Florencio Sánchez. Las galerías del museo, una visita a la sala y una función tienen modalidades propias. El Museo del Humor se creó en 1992 mediante convenio de la Intendencia y la Fundación Lolita Rubial.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Teatro Lavalleja +59844424254',
        heading: false,
      },
      {
        text: 'Teatro Lavalleja teatrolavallejaminas@gmail.com',
        heading: false,
      },
      {
        text: 'Museo del Humor museohumor@fundacionlolitarubial.org',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Agenda, museo y sala con condiciones propias',
    relationsRaw: 'Casa de la Cultura · Museo del Grabado · Plaza Libertad.',
    tagline: 'Una ciudad también se cuenta desde su escenario',
    intro:
      'El Teatro Lavalleja articula historia arquitectónica y actividad cultural colectiva. El edificio, los Premios Morosoli y el Museo del Humor y la Historieta permiten relacionar distintas expresiones de la cultura local y nacional.',
    slug: 'teatro-lavalleja',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'panorama',
    imageContext: true,
    channel: {
      url: 'tel:+59844424254',
      label: '+598 4442 4254',
    },
    summary:
      'Edificio que articula historia arquitectónica y actividad cultural, vinculado a los Premios Morosoli y al humor gráfico.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 46,
    name: 'Cerro Artigas',
    blocks: [
      {
        text: 'El monumento y la ciudad vista desde el este',
        heading: true,
      },
      {
        text: 'El Cerro Artigas fue conocido como Ventura y Arbolito. Desde su posición al este de Minas ofrece una lectura panorámica de la ciudad y de las sierras que la rodean. El monumento ecuestre a Artigas fue inaugurado el 19 de octubre de 1974. La obra, realizada en hormigón armado, es de Stelio Belloni, con colaboración de José Belloni en el modelado.',
        heading: false,
      },
      {
        text: 'La observación a distintas distancias permite comparar la escala, la silueta y los detalles del monumento. La vista hacia Minas ayuda a reconocer la trama urbana y su relación con las sierras. Estas relaciones aportan una lectura conjunta de arte público, ciudad y relieve.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'El cerro está al este de Minas. El Museo Stelio Belloni y el atrio de la Intendencia son visitas con acceso propio. La Noche de los Fogones tiene como momento característico el canto colectivo de A Don José; la fecha y organización corresponden a cada Semana de Lavalleja.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Paseo panorámico; acceso por confirmar',
    relationsRaw: 'Museo Stelio Belloni · Plaza Libertad · Minas.',
    tagline: 'Volver a mirar la ciudad que acabás de recorrer',
    intro:
      'El Cerro Artigas relaciona la lectura panorámica de Minas con una obra escultórica de gran escala. El monumento de Stelio Belloni y su posición en el relieve permiten estudiar vínculos entre arte público, ciudad y paisaje.',
    slug: 'cerro-artigas',
    category: 'Geología',
    international: false,
    status: 'Paseo por el entorno',
    image: 'artigas',
    imageContext: false,
    summary:
      'Monumento de Stelio Belloni que permite relacionar arte público, escala escultórica, ciudad y relieve.',
    region: 'Minas y entorno',
    themes: ['Geología'],
  },
  {
    id: 47,
    name: 'Casa Curbelo Báez',
    blocks: [
      {
        text: 'Casa Curbelo Báez integra el patrimonio cultural de Minas y ofrece una entrada a la memoria doméstica de la ciudad.',
        heading: false,
      },
      {
        text: 'Consultá su identificación, ubicación y modalidad de acceso antes de organizar una visita.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Consulta previa sobre el inmueble y su acceso.',
    relationsRaw: 'Patrimonio doméstico de Minas.',
    tagline: 'Una casa puede abrir preguntas sobre toda una ciudad',
    intro:
      'Casa Curbelo Báez integra el patrimonio cultural y la memoria doméstica de Minas. Su identificación y documentación permiten formular preguntas sobre los usos de la vivienda y las transformaciones de la ciudad.',
    slug: 'casa-curbelo-baez',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Vivienda del patrimonio cultural de Minas que abre preguntas documentales sobre usos domésticos y cambios urbanos.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 48,
    name: 'Iglesia Santa Teresita',
    blocks: [
      {
        text: 'La Iglesia Santa Teresita integra el patrimonio cultural y religioso de Minas.',
        heading: false,
      },
      {
        text: 'Consultá con la comunidad los horarios y las posibilidades de conocer el templo, sin interrumpir las celebraciones.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Consultá horarios y celebraciones.',
    relationsRaw: 'Catedral · Verdún · patrimonio religioso de Minas.',
    tagline: 'Otra escala del patrimonio religioso',
    intro:
      'La Iglesia Santa Teresita integra el patrimonio cultural y religioso de Minas. Su significado se relaciona con la comunidad que utiliza y conserva el templo y con las prácticas que allí se desarrollan.',
    slug: 'iglesia-santa-teresita',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Patrimonio cultural y religioso relacionado con la comunidad que utiliza y conserva el templo.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 49,
    name: 'Parque Rodó',
    blocks: [
      {
        text: 'Recreación urbana y encuentro comunitario',
        heading: true,
      },
      {
        text: 'Parque Rodó se encuentra al norte de Minas, sobre avenida San Martín. Reúne mesas, bancos, parrilleros, juegos, rosal y un lago artificial. Ese equipamiento permite reconocer distintos usos recreativos del espacio público y la incorporación de vegetación y agua al paisaje urbano.',
        heading: false,
      },
      {
        text: 'El parque recibe acontecimientos como Minas y Abril y actividades de la Semana de Lavalleja. Estos usos culturales colectivos requieren una organización diferente de la del funcionamiento cotidiano; su programación y condiciones dependen de cada acontecimiento.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Referencia de llegada: avenida San Martín, al norte de Minas. El sector y las condiciones de ingreso cambian durante festivales. El lago artificial se incorpora como paisaje y no como lugar de baño.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Recreación; condiciones especiales durante eventos',
    relationsRaw: 'Centro de Minas · paseo del San Francisco.',
    tagline: 'Un día que no necesita correr',
    intro:
      'Parque Rodó reúne espacios de recreación, un lago artificial y usos culturales al norte de Minas. Su organización permite estudiar la relación entre equipamiento urbano, encuentro comunitario y actividades colectivas.',
    slug: 'parque-rodo',
    category: 'Cultura',
    international: false,
    status: 'Paseo por el entorno',
    image: 'panorama',
    imageContext: true,
    summary:
      'Parque urbano con lago artificial y espacios de recreación y encuentro cultural al norte de Minas.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 50,
    name: 'Gruta Colón y conservación de murciélagos',
    blocks: [
      {
        text: 'La gruta Colón alberga murciélagos de las especies Myotis levis y Desmodus rotundus según el Programa para la Conservación de los Murciélagos de Uruguay. Su importancia científica se apoya en registros que se remontan al siglo XIX. La cueva tiene una abertura semejante a una chimenea que utilizan los animales; el control de la entrada de visitantes se realiza en otro acceso.',
        heading: false,
      },
      {
        text: 'La cavidad debe interpretarse como un refugio de fauna cuyo manejo protege la vida que alberga. La gruta y el monte de ombúes corresponden a ambientes diferentes, con accesos y condiciones propios. La observación del ambiente subterráneo requiere acompañamiento y coordinación específicos.',
        heading: false,
      },
      {
        text: 'La descripción de manejo de RELCOM documenta ingreso restringido y acompañado; no confirma disponibilidad turística para una fecha nueva. Coordinar específicamente y seguir las indicaciones de conservación.',
        heading: false,
      },
    ],
    zone: 'Arequita',
    categoryRaw: 'Experiencias',
    statusRaw: 'Acceso acompañado y autorizado',
    relationsRaw: 'Cerro Arequita · Monte de Ombúes.',
    tagline: 'La aventura también puede ser aprender a no interrumpir',
    intro:
      'La Gruta Colón es un refugio de murciélagos con registros de interés científico. Su interpretación relaciona el ambiente subterráneo con la conservación de fauna y requiere proteger las condiciones de la cavidad habitada.',
    slug: 'gruta-colon-y-conservacion-de-murcielagos',
    category: 'Experiencias',
    international: false,
    status: 'Coordinación previa',
    image: 'gruta',
    imageContext: false,
    summary:
      'Refugio de murciélagos de interés científico que relaciona ambiente subterráneo y conservación de fauna.',
    region: 'Arequita y Santa Lucía',
    themes: ['Agua', 'Experiencias'],
  },
  {
    id: 51,
    name: 'Monte de Ombúes del entorno de Arequita',
    blocks: [
      {
        text: 'El paisaje de Arequita integra ombúes, helechos, pastizales, humedales y bosque asociado al agua. Los paredones también albergan el clavel del aire blanco, una planta de distribución muy restringida. El Parque Nacional Arequita incorporado al Sistema Nacional de Áreas Protegidas en 2024 abarca 560 hectáreas e incluye ambos cerros y un tramo del Santa Lucía próximo a sus nacientes.',
        heading: false,
      },
      {
        text: 'El río explica parte de la continuidad entre ambientes: conecta el valle, la vegetación de ribera y los espacios cercanos. El registro de fauna requiere observación a distancia desde recorridos habilitados. Carpinchos, guazubirás y aves forman parte de la biodiversidad documentada del área; su presencia no garantiza avistamientos durante una actividad.',
        heading: false,
      },
    ],
    zone: 'Arequita y Santa Lucía',
    categoryRaw: 'Experiencias',
    statusRaw: 'Recorrido habilitado por confirmar',
    relationsRaw: 'Cerro Arequita · Gruta Colón · Santa Lucía.',
    tagline: 'Descubrir un paisaje a la altura de sus troncos',
    intro:
      'El entorno de Arequita reúne ombúes, helechos, pastizales, humedales y bosque asociado al agua. La continuidad entre río, valle y paredones permite comprender relaciones entre geología, vegetación y hábitats de fauna.',
    slug: 'monte-de-ombues-del-entorno-de-arequita',
    category: 'Experiencias',
    international: false,
    status: 'Consultar acceso',
    image: 'ombues',
    imageContext: false,
    summary:
      'Ombúes, pastizales, humedales y bosque ribereño que permiten comprender conexiones entre río, relieve y hábitats.',
    region: 'Arequita y Santa Lucía',
    themes: ['Agua', 'Experiencias'],
  },
  {
    id: 52,
    name: 'Laguna de los Cuervos y entorno',
    blocks: [
      {
        text: 'Valle, bosque ribereño e historia del agua',
        heading: true,
      },
      {
        text: 'La documentación ambiental de Laguna de los Cuervos describe un entorno de río y bosque nativo próximo al macizo de Arequita. El paisaje de valle, laguna y cerro se relaciona con el Santa Lucía y con las ruinas de un antiguo molino harinero. El agua reúne aquí dimensiones ambientales y productivas.',
        heading: false,
      },
      {
        text: 'El establecimiento se alcanza por camino Valeriano Magri, a unos trece kilómetros de Minas. La documentación comercial publica acceso por el día y cabañas, con área de camping temporalmente cerrada. También registra parrilleros y los contactos 099 912 596, 4440 3962 e info@lagunadeloscuervos.com.uy. La disponibilidad y el acceso deben confirmarse con el operador.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Contacto del operador: +598 99 912 596, +598 4440 3962, info@lagunadeloscuervos.com.uy. Publica estadía por el día y cabañas habilitadas, con área de camping temporalmente cerrada. Acceso por camino Valeriano Magri, a 13 km de Minas.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Laguna de los Cuervos +59899912596',
        heading: false,
      },
      {
        text: 'Laguna de los Cuervos +59844403962',
        heading: false,
      },
      {
        text: 'Laguna de los Cuervos info@lagunadeloscuervos.com.uy',
        heading: false,
      },
    ],
    zone: 'Arequita y Santa Lucía',
    categoryRaw: 'Experiencias',
    statusRaw:
      'Consultá las modalidades de visita y alojamiento. El área de camping anunció un cierre temporal.',
    relationsRaw: 'Cerro Arequita · Monte de Ombúes · Minas.',
    tagline: 'Quedarse un poco más junto al río',
    intro:
      'Laguna de los Cuervos relaciona el valle, el bosque nativo y el macizo de Arequita con el río Santa Lucía. Las ruinas de un antiguo molino añaden una dimensión productiva a la historia del agua en el entorno.',
    slug: 'laguna-de-los-cuervos-y-entorno',
    category: 'Experiencias',
    international: false,
    status: 'Coordinación previa',
    image: 'rio',
    imageContext: true,
    channel: {
      url: 'https://lagunadeloscuervos.com.uy/',
      label: 'Laguna de los Cuervos',
    },
    summary:
      'Entorno de valle, laguna y bosque nativo donde las ruinas de un molino relacionan agua, paisaje e historia productiva.',
    region: 'Arequita y Santa Lucía',
    themes: ['Agua', 'Dormir', 'Experiencias'],
  },
  {
    id: 53,
    name: 'Camping Arequita',
    blocks: [
      {
        text: 'Usos recreativos y condiciones de acceso junto al Santa Lucía',
        heading: true,
      },
      {
        text: 'La documentación del Camping Arequita distingue parcelas, cabañas y servicios recreativos en el entorno del Santa Lucía. Registra electricidad, parrilleros individuales, estacionamiento, juegos infantiles, wifi en áreas comunes y piscinas exterior y cubierta climatizada. Estos servicios corresponden al funcionamiento del complejo.',
        heading: false,
      },
      {
        text: 'El camping, el cerro, el monte de ombúes y la Gruta Colón tienen funciones y condiciones de acceso propias. La reserva de un servicio del camping no sustituye la coordinación de otras actividades del entorno. Para una observación educativa deben identificarse previamente los sectores autorizados.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Publica electricidad, parrilleros, juegos y piscinas exterior y cubierta. Contacto: +598 4440 2503, info@campingarequita.uy. La administración informa la modalidad diurna, la parcela o cabaña y el acceso de llegada. La autorización de un parrillero del camping no se extiende a cualquier punto del parque nacional.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Administración y reservas +598 4440 2503',
        heading: false,
      },
      {
        text: 'Consultas publicadas info@campingarequita.uy',
        heading: false,
      },
      {
        text: 'Sitio web https://campingarequita.uy/',
        heading: false,
      },
    ],
    zone: 'Arequita y Santa Lucía',
    categoryRaw: 'Experiencias',
    statusRaw: 'Reserva y confirmación de servicios',
    relationsRaw: 'Cerro Arequita · Gruta Colón · Minas.',
    tagline: 'Una base para compartir más tiempo afuera',
    intro:
      'Camping Arequita es un complejo recreativo y de alojamiento en el entorno del Santa Lucía. Su organización y servicios permiten distinguir los usos del camping de las condiciones de acceso a los otros sectores del paisaje de Arequita.',
    slug: 'camping-arequita',
    category: 'Experiencias',
    international: false,
    status: 'Coordinación previa',
    image: 'rio',
    imageContext: true,
    channel: {
      url: 'https://campingarequita.uy/',
      label: 'Camping Arequita',
    },
    summary:
      'Complejo recreativo y de alojamiento junto al Santa Lucía, con organización y condiciones propias respecto de otros sectores de Arequita.',
    region: 'Arequita y Santa Lucía',
    themes: ['Agua', 'Dormir', 'Experiencias'],
  },
  {
    id: 54,
    name: 'Villa Serrana: el conjunto urbano y paisajístico',
    blocks: [
      {
        text: 'Un pueblo proyectado para convivir con la sierra',
        heading: true,
      },
      {
        text: 'Villa Serrana nació de una manera particular de imaginar el descanso. Julio Vilamajó estudió el terreno, el clima, la vegetación y las vistas para proyectar el conjunto a mediados de la década de 1940. El paisaje no debía quedar reducido a un fondo decorativo: las calles, los espacios comunes y las construcciones tenían que responder a la topografía. Piedra, ladrillo, madera y quincha formaban parte de ese diálogo con los materiales y los oficios del lugar.',
        heading: false,
      },
      {
        text: 'Las curvas, los árboles y las diferencias de altura modifican la aparición de las vistas dentro de la villa. El trazado y las calles internas sin pavimentar permiten estudiar decisiones de implantación, circulación y relación con el relieve. La lectura del conjunto vincula espacios públicos, construcciones y paisaje.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'El trazado de Villa Serrana está ligado a Julio Vilamajó. La llegada se hace desde Ruta 8 por los accesos correspondientes al sector elegido. En el lago y el Baño de la India, consultá las zonas y condiciones habilitadas para bañarse. Los servicios de restaurante y alojamiento se reservan con cada establecimiento.',
        heading: false,
      },
    ],
    zone: 'Villa Serrana',
    categoryRaw: 'Experiencias',
    statusRaw: 'Espacios públicos y servicios privados diferenciados',
    relationsRaw: 'Ventorrillo · Mesón · Represa Stewart Vargas · La Guarida.',
    tagline: 'Venir para quedarse un rato',
    intro:
      'El proyecto de Villa Serrana, ligado a Julio Vilamajó, relaciona topografía, vegetación, materiales y formas de habitar. Las calles, los espacios comunes y las construcciones permiten analizar cómo el conjunto urbano responde al paisaje.',
    slug: 'villa-serrana-el-conjunto-urbano-y-paisajistico',
    category: 'Experiencias',
    international: false,
    status: 'Paseo por el entorno',
    image: 'panorama',
    imageContext: true,
    summary:
      'Conjunto urbano de Julio Vilamajó que relaciona topografía, vegetación, materiales y formas de habitar el paisaje.',
    region: 'Villa Serrana',
    themes: ['Cultura', 'Experiencias'],
  },
  {
    id: 55,
    name: 'La Guarida',
    blocks: [
      {
        text: 'Senderos interpretativos y modalidades de actividad',
        heading: true,
      },
      {
        text: 'La Guarida ocupa un predio al pie del Cerro Guazubirá, con monte nativo y rocas que permiten trabajar la interpretación del paisaje. Ofrece dos senderos autoguiados: uno de 1,5 km, estimado en una hora y media, y otro de 3 km, estimado en dos horas y media. Los códigos QR incorporan contenidos de naturaleza y geología; la duración contempla detenerse a leer y observar, además de caminar.',
        heading: false,
      },
      {
        text: 'El circuito aéreo reúne vía ferrata, aerocarril, puentes colgantes y tirolesa. Los senderos y el circuito tienen funciones y exigencias diferentes. La reserva es previa, el operador exige caminar sin ayuda y las actividades se suspenden con lluvia. El acceso publicado es por la primera entrada a Villa Serrana, Ruta 8 km 139,5; contacto: 091 346 342.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Reserva previa obligatoria. El operador exige caminar sin ayuda para ambas actividades y suspende con lluvia. Acceso publicado por la primera entrada a Villa Serrana, Ruta 8 km 139,500, sector Cerro Guazubirá. Sitio: laguarida.com.uy.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Reservas +598 91 346 342',
        heading: false,
      },
      {
        text: 'Correo del parque info@laguarida.com.uy',
        heading: false,
      },
    ],
    zone: 'Villa Serrana',
    categoryRaw: 'Experiencias',
    statusRaw: 'Reserva previa; condiciones físicas y meteorológicas',
    relationsRaw: 'Villa Serrana · Penitente como experiencia alternativa.',
    tagline: 'Elegí cómo querés encontrarte con el paisaje',
    intro:
      'La Guarida reúne monte nativo y rocas al pie del Cerro Guazubirá. Sus senderos y recursos de interpretación permiten relacionar naturaleza y geología; las actividades físicas del predio tienen modalidades y condiciones propias.',
    slug: 'la-guarida',
    category: 'Experiencias',
    international: false,
    status: 'Coordinación previa',
    image: 'panorama',
    imageContext: true,
    channel: {
      url: 'https://laguarida.com.uy/',
      label: 'Parque La Guarida',
    },
    summary:
      'Monte nativo y rocas al pie del Cerro Guazubirá, con senderos y recursos de interpretación de naturaleza y geología.',
    region: 'Villa Serrana',
    themes: ['Aventura', 'Experiencias'],
  },
  {
    id: 56,
    name: 'Mangas de Piedra y Cerro de la Leona',
    blocks: [
      {
        text: 'Mangas de Piedra: una caminata con lectura del territorio',
        heading: true,
      },
      {
        text: 'La excursión a Mangas de Piedra atraviesa pastizales, colinas y cañadas en una caminata de unas tres horas. El guía residente aporta interpretación de la biodiversidad y relatos del lugar, con vistas hacia el Cerro de la Leona. La contratación incluye autorización de ingreso a los campos privados atravesados por la excursión y materiales de interpretación; el catálogo anuncia grupos de hasta quince personas.',
        heading: false,
      },
      {
        text: 'La interpretación local permite formular preguntas sobre construcciones de piedra, usos del campo y cambios de vegetación. Esos elementos relacionan patrimonio construido, biodiversidad y formas de utilizar el territorio; el ingreso se realiza con autorización y acompañamiento.',
        heading: false,
      },
      {
        text: 'Cabalgata a La Leona: recorrido y condiciones',
        heading: true,
      },
      {
        text: 'La cabalgata documentada dura unas tres horas y une sectores de Atalaya, Sierra Alta y Baño de la India, con vistas del Cerro de la Leona y regreso hacia el lago. Incluye guía local bilingüe, caballo equipado y alforjas. El operador establece un límite de 90 kg por jinete.',
        heading: false,
      },
      {
        text: 'La duración y las características del terreno requieren confirmar la adecuación de la actividad al grupo. La observación e interpretación del paisaje debe ajustarse a las condiciones del recorrido y a las indicaciones del guía.',
        heading: false,
      },
      {
        text: 'La conversación de reserva debe indicar la experiencia de cada jinete, porque el catálogo combina referencias a principiantes con una clasificación intermedia o avanzada. Ese dato permite que el guía asigne un programa adecuado al grupo.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Experiencias Villa Serrana: +598 99 024 434. Mangas de Piedra publica tres horas, guía local y permisos de acceso a campos. La cabalgata al Cerro de la Leona publica un máximo de 90 kg por jinete. Los traslados y el alojamiento no se incluyen por defecto en estas actividades.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Coordinación Experiencias Villa Serrana +598 99 024 434',
        heading: false,
      },
    ],
    zone: 'Villa Serrana y entorno',
    categoryRaw: 'Experiencias',
    statusRaw: 'Excursión contratada; accesos privados autorizados',
    relationsRaw: 'Villa Serrana · lago · gastronomía local.',
    tagline: 'Los caminos se entienden mejor con alguien del lugar',
    intro:
      'Mangas de Piedra y el entorno del Cerro de la Leona relacionan pastizales, cañadas, construcciones de piedra y usos rurales. La interpretación local permite reconocer cambios de vegetación y formular preguntas sobre las formas de utilizar el territorio.',
    slug: 'mangas-de-piedra-y-cerro-de-la-leona',
    category: 'Experiencias',
    international: false,
    status: 'Coordinación previa',
    image: 'campo',
    imageContext: true,
    channel: {
      url: 'tel:+59899024434',
      label: '+598 99 024 434',
    },
    summary:
      'Pastizales, cañadas y construcciones de piedra que permiten estudiar biodiversidad, usos rurales y formas de habitar el territorio.',
    region: 'Villa Serrana',
    themes: ['Aventura', 'Experiencias'],
  },
  {
    id: 57,
    name: 'Reserva El Abra',
    blocks: [
      {
        text: 'Aprender a reconocer lo que crece en Aguas Blancas',
        heading: true,
      },
      {
        text: 'Reserva El Abra aparece en la programación patrimonial con caminatas guiadas, identificación de flora y fauna nativas y conversaciones sobre conservación. La interpretación relaciona reconocimiento de especies, características de los ambientes, vegetación y relieve.',
        heading: false,
      },
      {
        text: 'La referencia de llegada es Ruta 81, km 124, a once kilómetros de Ruta 8. Pedro Telmo Moreira y Julia Odera figuran como responsables de la actividad documentada. El contenido y las condiciones de una actividad interpretativa se acuerdan con sus responsables; una programación histórica no acredita disponibilidad permanente.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Ruta 81 km 124, a 11 km de Ruta 8. Para coordinar una visita y consultar horarios, contactá a Pedro Telmo Moreira o Julia Odera.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Pedro Telmo Moreira +598 4370 9377',
        heading: false,
      },
      {
        text: 'Julia Odera +598 98 413 265',
        heading: false,
      },
    ],
    zone: 'Aguas Blancas',
    categoryRaw: 'Experiencias',
    statusRaw: 'Coordiná la visita y el horario con sus responsables.',
    relationsRaw: 'Aguas Blancas · Abra de Zabaleta · Solís.',
    tagline: 'Aprender el nombre de lo que antes era solamente verde',
    intro:
      'La documentación de Reserva El Abra describe identificación de flora y fauna nativas y conversaciones sobre conservación. Ese enfoque relaciona la observación de especies con los ambientes, la vegetación y el relieve de Aguas Blancas.',
    slug: 'reserva-el-abra',
    category: 'Experiencias',
    international: false,
    status: 'Consultar acceso',
    image: 'bosque',
    imageContext: true,
    channel: {
      url: 'tel:+59898413265',
      label: '+598 98 413 265',
    },
    summary:
      'Interpretación documentada de flora y fauna nativas, ambientes y conservación en el entorno de Aguas Blancas.',
    region: 'Solís y Aguas Blancas',
    themes: ['Agua', 'Experiencias'],
  },
  {
    id: 58,
    name: 'Valle del Hilo de la Vida',
    blocks: [
      {
        text: 'Las estructuras de piedra y las preguntas de la arqueología',
        heading: true,
      },
      {
        text: 'En el entorno conocido como Valle del Hilo de la Vida, las construcciones de piedra motivan relatos, visitas e investigación. Un trabajo arqueológico publicado en 2026 estudia doce estructuras repartidas en dos grupos al sur de Minas y distingue diferentes formas constructivas. Los investigadores analizan posibles funciones y contextos; el origen de cada estructura requiere evidencia, comparación y estudio del terreno.',
        heading: false,
      },
      {
        text: 'La forma de las estructuras, la disposición de la piedra y su relación con el paisaje aportan elementos para la investigación. Los relatos locales forman parte de la memoria cultural y deben distinguirse de las conclusiones arqueológicas. Toda interpretación necesita precisar las evidencias que la sustentan.',
        heading: false,
      },
      {
        text: 'Fotografía del paisaje y del cielo',
        heading: true,
      },
      {
        text: 'El fotógrafo Fefo Bouvier documentó una visita de astrofotografía realizada con acuerdo de los propietarios. Su relato ubica el desvío en Ruta 12, km 346, seguido de unos cinco kilómetros de camino rural, y señala la influencia luminosa de Minas sobre parte del cielo. La experiencia permite relacionar las estructuras de piedra con un paisaje nocturno más amplio.',
        heading: false,
      },
      {
        text: 'El reconocimiento del terreno de día y la observación nocturna del cielo requieren condiciones diferentes de registro y permanencia. Las actividades de fotografía o interpretación se coordinan con los responsables del predio, con autorización específica para los sectores y horarios previstos.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'La visita publicada de 2020 toma como referencia Ruta 12 km 346 y unos 5 km de camino rural, con coordinación de los propietarios. Para reservar, usá el contacto documentado del predio y su indicación de llegada. El ingreso y la permanencia nocturna se acuerdan por separado.',
        heading: false,
      },
    ],
    zone: 'Sierras al sur de Minas',
    categoryRaw: 'Experiencias',
    statusRaw: 'Visitas y recorridos nocturnos con coordinación previa.',
    relationsRaw: 'Casa de la Cultura · Museo Lítico · paisaje nocturno.',
    tagline: 'Un paisaje de preguntas',
    intro:
      'Las estructuras de piedra del Valle del Hilo de la Vida son objeto de relatos e investigación arqueológica. Estudiar formas, disposición y contexto permite distinguir memorias locales, interpretaciones y conclusiones respaldadas por evidencias.',
    slug: 'valle-del-hilo-de-la-vida',
    category: 'Experiencias',
    international: false,
    status: 'Coordinación previa',
    image: 'campo',
    imageContext: true,
    summary:
      'Estructuras de piedra cuyo estudio permite distinguir memoria local, interpretaciones y evidencias arqueológicas.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Experiencias'],
  },
  {
    id: 59,
    name: 'Cerro Místico',
    blocks: [
      {
        text: 'Alojamiento · Hotel · Ruta 12 / entorno serrano',
        heading: false,
      },
      {
        text: 'Ubicación: Ruta 12 km 346',
        heading: false,
      },
      {
        text: 'Contacto: +598 98 239 633 · +598 4440 3441',
        heading: false,
      },
      {
        text: 'Cerro Místico se encuentra sobre Ruta 12, km 346, en las sierras cercanas a Minas. La modalidad de apart hotel documentada comprende cuatro habitaciones con baño privado, fogón y acceso a una cocina compartida equipada.',
        heading: false,
      },
      {
        text: 'El establecimiento también registra piscinas exteriores, terrazas y servicios de alimentación. Estos servicios corresponden a la operación del alojamiento y sus condiciones deben confirmarse directamente con sus responsables.',
        heading: false,
      },
      {
        text: 'La política documentada admite huéspedes desde los 12 años y no admite mascotas. El ingreso figura a las 15:00 y la salida a las 12:00. Las condiciones de edad, acompañamiento y uso de instalaciones se confirman con el operador.',
        heading: false,
      },
      {
        text: 'La documentación distingue la Casa de la Luna, la Casa del Bosque y la Casa de Piedra, con distribuciones y capacidades diferentes. Las dos primeras tienen un dormitorio y la última dos dormitorios con baños en suite. El uso de cada unidad depende de las condiciones de alojamiento y accesibilidad informadas por el establecimiento.',
        heading: false,
      },
      {
        text: 'Las casas se encuentran a unos 500 metros del hotel y cuentan con servicios propios. La separación entre sectores debe considerarse al acordar llegada, desplazamientos y actividades dentro del predio.',
        heading: false,
      },
      {
        text: 'El circuito histórico del establecimiento registra corrales de piedra y taperas centenarias. El operador también documenta recorridos guiados, fotografía de naturaleza, observación de aves y actividades nocturnas, además de otras propuestas recreativas y talleres. La oferta comercial y la interpretación patrimonial tienen contenidos que deben acordarse específicamente.',
        heading: false,
      },
      {
        text: 'El establecimiento diferencia acceso por el día, alojamiento y actividades organizadas. Cada modalidad tiene condiciones propias de coordinación, permanencia y uso de instalaciones; su existencia no acredita una oferta educativa específica.',
        heading: false,
      },
      {
        text: 'Canal de consulta: https://www.cerromistico.com/pages/enlace.php',
        heading: false,
      },
    ],
    zone: 'Sierras al sur de Minas',
    categoryRaw: 'Experiencias',
    statusRaw: 'Reserva; consultar edades y modalidad de visita',
    relationsRaw: 'Minas · paisaje de Ruta 12 · estadía serrana.',
    tagline: 'Hacerle lugar a una pausa',
    intro:
      'Cerro Místico es un establecimiento de alojamiento en las sierras al sur de Minas. La documentación describe modalidades de estadía y actividades dentro del predio, incluido un circuito de corrales de piedra y taperas, con condiciones definidas por el operador.',
    slug: 'cerro-mistico',
    category: 'Experiencias',
    international: false,
    status: 'Coordinación previa',
    image: 'panorama',
    imageContext: true,
    channel: {
      url: 'https://www.cerromistico.com/',
      label: 'Cerro Místico',
    },
    summary:
      'Establecimiento de alojamiento con actividades dentro del predio y un circuito de corrales de piedra y taperas.',
    region: 'Minas y entorno',
    themes: ['Dormir', 'Sabores', 'Experiencias'],
  },
  {
    id: 60,
    name: 'Museo de Réplicas en Miniaturas',
    blocks: [
      {
        text: 'Mecanismos, oficios y memoria del trabajo',
        heading: true,
      },
      {
        text: 'El Museo de Réplicas en Miniaturas nació del trabajo de Horacio Chocho. La primera réplica que dio origen a la colección fue una carreta vinculada a la memoria de su padre. Con el tiempo incorporó maquinaria agrícola e industrial, vehículos y escenas de oficios. Varias piezas funcionan mediante mecanismos que permiten observar movimiento: la escala pequeña vuelve visible lo que en una máquina real queda oculto.',
        heading: false,
      },
      {
        text: 'Las réplicas permiten seguir cadenas de trabajo, como las tareas del trigo hasta la panadería. La explicación de los mecanismos relaciona movimiento, función y conocimientos técnicos de distintos oficios. Las demostraciones se coordinan con el museo.',
        heading: false,
      },
      {
        text: 'Acceso y cuidado del lugar',
        heading: true,
      },
      {
        text: 'Dirección: Carabajal 322. Coordiná el turno de visita y demostración directamente con el museo.',
        heading: false,
      },
      {
        text: 'Contacto',
        heading: true,
      },
      {
        text: 'Museo de Réplicas en Miniaturas +59844423464',
        heading: false,
      },
      {
        text: 'Museo de Réplicas en Miniaturas +59899432405',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Experiencias',
    statusRaw: 'Visita coordinada',
    relationsRaw: 'Museo del Alfajor · Casa de la Cultura · El Destacamento.',
    tagline: 'Lo pequeño puede mostrar cómo funcionaba un mundo',
    intro:
      'El Museo de Réplicas en Miniaturas reúne modelos de maquinaria, vehículos y escenas de oficios creados por Horacio Chocho. Los mecanismos en funcionamiento permiten explicar procesos técnicos y conservar memoria del trabajo agrícola e industrial.',
    slug: 'museo-de-replicas-en-miniaturas',
    category: 'Experiencias',
    international: false,
    status: 'Coordinación previa',
    image: 'artesania',
    imageContext: true,
    channel: {
      url: 'tel:+59899432405',
      label: '+598 99 432 405',
    },
    summary:
      'Réplicas de maquinaria, vehículos y oficios que permiten explicar procesos técnicos y conservar memoria del trabajo.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Experiencias'],
  },
  {
    id: 61,
    name: 'Molino Viejo de Minas',
    blocks: [
      {
        text: 'Construido antes de 1860, cerca del arroyo San Francisco, el Molino Viejo forma parte de la memoria productiva de Minas. Entre 1981 y 2001 alojó al Liceo n.º 2 y en 2010 abrió como museo.',
        heading: false,
      },
      {
        text: 'El edificio cuenta con protección patrimonial. En 2025 estuvo inhabilitado para visitas; consultá su situación antes de planificar un ingreso.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Experiencias',
    statusRaw: 'Consultá la situación del edificio antes de ir.',
    relationsRaw: 'Arroyo San Francisco · memoria productiva de Minas.',
    tagline: 'Una ciudad también se recuerda por sus transformaciones',
    intro:
      'El Molino Viejo forma parte de la memoria productiva y educativa de Minas. Sus sucesivos usos como molino, sede de un liceo y museo permiten estudiar transformaciones del edificio y de la ciudad.',
    slug: 'molino-viejo-de-minas',
    category: 'Experiencias',
    international: false,
    status: 'Visita no confirmada',
    image: 'panorama',
    imageContext: true,
    summary:
      'Edificio de la memoria productiva y educativa de Minas, con sucesivos usos como molino, liceo y museo.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Experiencias'],
  },
];
export const featuredIds = [1, 23, 31, 17, 14, 54];
export const places: GeoparkPlace[] = canonicalPlaces.map((place) => ({
  ...place,
  ...placePhotoPresentation(place.id),
  title: place.name,
  description: place.blocks.map((block) => block.text).join('\n\n'),
  tags: place.themes,
  visitStatus: place.status,
  access: place.statusRaw,
  contacts: place.channel ? [place.channel] : [],
  featured: featuredIds.includes(place.id),
  internationalValue: place.international,
  seo: { title: `${place.name} · Manantiales Serranos`, description: place.summary },
  relationships: canonicalPlaces
    .filter(
      (candidate) =>
        candidate.id !== place.id &&
        place.relationsRaw.toLowerCase().includes(candidate.name.toLowerCase()),
    )
    .map((candidate) => candidate.id),
}));
export const placeById = new Map(places.map((place) => [place.id, place]));

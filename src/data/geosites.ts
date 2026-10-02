import type { GeoparkPlace } from '../types/geopark';

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
        text: 'El interés del paseo aumenta al mirar el conjunto desde cierta distancia y después acercarse al pie del cerro. Desde lejos se reconoce la forma; cerca aparecen fracturas, vegetación adherida a la pared y ambientes de sombra. Esa alternancia permite entender por qué este sitio combina valor paisajístico, geológico y biológico.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'El viaje puede empezar con una silueta. Acercate sin apuro, dejá que cambie la escala y mirá de nuevo. En Arequita, la primera impresión abre una conversación entre piedra, vegetación y tiempo. La fotografía es apenas el comienzo del recuerdo.',
    slug: 'cerro-arequita',
    category: 'Geología',
    international: true,
    status: 'Coordinación previa',
    image: 'arequita-rio',
    imageContext: false,
    summary:
      'Paredones de riolita, monte nativo y un río que acompaña un paisaje nacido del volcanismo.',
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
      'Hay lugares que no se entregan en una postal rápida. Cerro del Cura propone otra forma de descubrir el territorio: acercarse con preguntas, acompañamiento y ganas de comprender. Su historia debe abrirse con quienes conocen el sitio, no con una entrada improvisada.',
    slug: 'cerro-del-cura',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Hay lugares que no se entregan en una postal rápida. Cerro del Cura propone otra forma de descubrir el territorio: acercarse con preguntas, acompañamiento y ganas de comprender. Su historia debe abrirse con quienes conocen el sitio, no con una entrada improvisada.',
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
      'Antes de los caminos y de las ciudades, otras formas de vida dejaban señales. Conocerlas invita a cambiar la escala del viaje: lo pequeño puede guardar una historia inmensa. Cerro del Ombú merece una mirada atenta y una interpretación que haga visible lo que suele pasar inadvertido.',
    slug: 'cerro-del-ombu',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'Antes de los caminos y de las ciudades, otras formas de vida dejaban señales. Conocerlas invita a cambiar la escala del viaje: lo pequeño puede guardar una historia inmensa. Cerro del Ombú merece una mirada atenta y una interpretación que haga visible lo que suele pasar inadvertido.',
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
      'Un río no empieza siendo el río que conocemos. Su historia se reúne poco a poco, entre suelo, lluvia y pequeños cursos de agua. Pensar en sus nacientes es mirar hacia el origen de muchas vidas conectadas por una misma corriente.',
    slug: 'nacientes-del-rio-santa-lucia',
    category: 'Geología',
    international: false,
    status: 'Visita no confirmada',
    image: 'arroyo',
    imageContext: true,
    summary:
      'Un río no empieza siendo el río que conocemos. Su historia se reúne poco a poco, entre suelo, lluvia y pequeños cursos de agua. Pensar en sus nacientes es mirar hacia el origen de muchas vidas conectadas por una misma corriente.',
    region: 'Sierras y campo',
    themes: ['Agua', 'Geología'],
  },
  {
    id: 5,
    name: 'El Destacamento',
    blocks: [
      {
        text: 'Conocer el trabajo y la conversación de una familia rural',
        heading: true,
      },
      {
        text: 'El Destacamento funciona en un establecimiento familiar de ganadería sobre campo natural. La casa conserva rasgos de un antiguo puesto de policía rural, que dio nombre al emprendimiento. Las visitas de día permiten acercarse a tareas del establecimiento, caminar o cabalgar con los anfitriones y compartir gastronomía de campo. Las jornadas pueden incorporar fogón, relatos, música y observación del cielo.',
        heading: false,
      },
      {
        text: 'Su mayor interés está en el encuentro: ver una tarea, preguntar cómo se realiza y comprender por qué se organiza de cierta manera. Una opción para una familia que quiere una experiencia rural acompañada o para visitantes que buscan conversar con quienes viven en las sierras. Se ubica en Cerro Pelado, a unos 35 km de Minas por camino rural y a 17 km del desvío de Ruta 8 km 162. La jornada se acuerda con los anfitriones para organizar comidas y actividades.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
        heading: true,
      },
      {
        text: 'Se encuentra en Cerro Pelado, aproximadamente a 35 km de Minas por camino rural y a 17 km de Ruta 8, km 162. Reservá la actividad y recibí el punto de llegada del anfitrión. Fogón, música y observación del cielo forman parte de programas acordados.',
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
      'Una jornada rural vale por las conversaciones que aparecen entre una tarea y otra. Preguntar, mirar, compartir la mesa y reconocer un ritmo diferente: El Destacamento invita a conocer el campo desde sus anfitriones, no solamente desde la ventanilla.',
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
      'Turismo rural con anfitriones, gastronomía de campo y la vida cotidiana de un establecimiento familiar.',
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
        text: 'Kykyo se presenta como reserva y campo cultural entre Marmarajá y Cerro Pelado. Su propuesta combina conservación del paisaje, caminatas acompañadas y procesos artísticos. Las residencias relatadas en diciembre de 2025, coordinadas por Nicolás Spinosa y Óscar Álvarez, trabajaron con materiales y condiciones del propio territorio. La experiencia interesa por lo que ocurre entre artistas, anfitriones y ambiente, además de las obras que puedan producirse.',
        heading: false,
      },
      {
        text: 'Kykyo es una propuesta para quien disfruta del arte contemporáneo, los procesos de creación y las conversaciones sobre cómo se habita el campo. El acceso se organiza por reserva o invitación. Una forma comercial de conocerlo es la jornada en bicicleta ofrecida por Experiencias Villa Serrana, con equipo y picnic. Para incluirla en el viaje conviene reservar un día, de modo que traslado, recorrido y encuentro tengan tiempo propio.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
        heading: true,
      },
      {
        text: 'Ingreso por reserva o invitación. La salida en bicicleta está publicada por Experiencias Villa Serrana. Las residencias artísticas tienen convocatoria propia; acordá el contenido de la visita y no sólo el acceso al predio.',
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
      '¿Qué sucede cuando la creación se toma tiempo para escuchar el lugar? En Kykyo, el encuentro entre naturaleza y arte invita a explorar esa pregunta. Llegá con curiosidad por los procesos, las conversaciones y las maneras de habitar un mismo paisaje.',
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
      'Arte contemporáneo y paisaje rural en una reserva que se conoce por invitación o actividad acordada.',
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
      'Hay paisajes que se conocen mejor al escuchar a quienes viven cerca. Paso de la Arena es una invitación a completar esa mirada con conocimiento local.',
    slug: 'paso-de-la-arena',
    category: 'Naturaleza',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary: 'Un lugar del patrimonio natural para conocer con orientación local.',
    region: 'Minas y entorno',
    themes: ['Naturaleza'],
  },
  {
    id: 8,
    name: 'Cerro Marmarajá',
    blocks: [
      {
        text: 'Cerro Marmarajá forma parte del patrimonio geológico del Geoparque. Las excursiones a su entorno y a la reserva Kykyo combinan paisaje, caminatas y acompañamiento local.',
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
      'Cambiar de perspectiva puede transformar una salida. El nombre Marmarajá abre la puerta a conocer el paisaje con atención: qué vemos, cómo lo interpretamos y quién nos ayuda a descubrirlo. La experiencia se construye con una actividad acordada, no solamente con un punto en el mapa.',
    slug: 'cerro-marmaraja',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Cambiar de perspectiva puede transformar una salida. El nombre Marmarajá abre la puerta a conocer el paisaje con atención: qué vemos, cómo lo interpretamos y quién nos ayuda a descubrirlo. La experiencia se construye con una actividad acordada, no solamente con un punto en el mapa.',
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
        text: 'Para quien quiere fotografiar, podés volver al mismo punto del lago en dos momentos del día y comparar reflejos y sombras. Para una caminata con contenido, se puede buscar la relación entre los cursos de agua y la forma del valle. La cabalgata al Cerro de la Leona incluye sectores de Baño de la India dentro de un recorrido acompañado. El lago y esos recorridos ofrecen experiencias diferentes: el primero funciona como centro paisajístico de la localidad; los segundos permiten internarse en el entorno con un guía.',
        heading: false,
      },
      {
        text: 'La represa y el Baño de la India invitan a disfrutar del paisaje. Consultá las condiciones locales antes de entrar al agua.',
        heading: false,
      },
    ],
    zone: 'Villa Serrana',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Paisaje; condiciones locales por confirmar',
    relationsRaw: 'Villa Serrana · Ventorrillo · Mesón de las Cañas.',
    tagline: 'Un lugar para volver a mirar la misma vista',
    intro:
      'El paseo puede ser tan sencillo como detenerse y regresar más tarde al mismo punto. El agua, las laderas y la luz ofrecen otra escena sin que haya cambiado el lugar. La represa invita a una forma de viaje que no necesita estar siempre avanzando.',
    slug: 'represa-stewart-vargas',
    category: 'Cultura',
    international: false,
    status: 'Paseo por el entorno',
    image: 'panorama',
    imageContext: true,
    summary:
      'El espejo de agua de Villa Serrana y su relación con las laderas, la luz y la arquitectura.',
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
        text: 'El proyecto posterior de recuperación del Mesón, documentado por Gualano + Gualano, trabaja la continuidad de las vistas y la relación entre edificio, suelo y horizonte. Las galerías y balcones funcionan como espacios intermedios entre habitación y paisaje. Durante una visita interesa reconocer cómo cambia la percepción de la sierra al pasar de un espacio interior a una galería. Es una obra para recorrer y habitar, además de fotografiar desde afuera.',
        heading: false,
      },
      {
        text: 'Las Cañas Inn, nombre comercial que también utiliza el Mesón, publica cinco modalidades. La habitación estándar tiene 20 m², baño privado, aire acondicionado y calefacción. El apartamento familiar, de 30 m², dispone de dos dormitorios. El dúplex familiar tiene 40 m² y entrepiso; otro dúplex de 25 m² incorpora un entrepiso para dos niños. La habitación familiar, también de 25 m², ofrece baño privado y televisión con streaming.',
        heading: false,
      },
      {
        text: 'Para una pareja, la estándar es la elección más sencilla. Para cuatro personas, conviene distinguir un apartamento de dos dormitorios de un ambiente con entrepiso: la separación y el uso de escaleras cambian la comodidad cotidiana. Al reservar, consultá la accesibilidad de la habitación y de su recorrido de ingreso.',
        heading: false,
      },
      {
        text: 'El Mesón tiene piscina exterior con vista a las sierras, sin climatización. El restaurante sirve almuerzo, merienda y cena; se ofrecen media pensión y pensión completa como opciones. El establecimiento dispone de wifi y cargador para vehículos eléctricos con costo. También organiza senderismo autoguiado y cabalgatas con contratación y coordinación propias.',
        heading: false,
      },
      {
        text: 'Una estadía de fin de semana puede combinar llegada y almuerzo, paseo por el lago y regreso para la merienda; al día siguiente, una cabalgata o caminata contratada. Quien prefiera descansar puede concentrarse en la piscina, las vistas y las comidas. La opción de pensión ayuda a planificar ese segundo tipo de viaje, mientras una reserva con desayuno deja más libertad para conocer otros restaurantes de la villa. El contacto comercial es +598 96 602 263; el acceso se identifica sobre avenida Vilamajó.',
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
      'Algunos edificios no se entienden de pasada. Una comida, una conversación o una noche pueden revelar la relación entre sus espacios y el paisaje. En el Mesón, la propuesta es dejar que la arquitectura forme parte del tiempo del viaje.',
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
      'La arquitectura de Julio Vilamajó se vuelve estadía, gastronomía y horizonte serrano.',
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
        text: 'En 2019 se inauguró el Espacio Vilamajó, una sala museo dedicada al arquitecto que también presenta exposiciones de artistas nacionales. La visita puede reunir tres intereses en una misma parada: conocer la obra, entrar al espacio cultural y sentarse a comer. Desde el salón se entiende por qué la ubicación y los apoyos del edificio son parte esencial de la experiencia.',
        heading: false,
      },
      {
        text: 'La propuesta gastronómica incorpora carnes de la zona, frutos nativos y elaboración artesanal. Entre los platos anunciados figuran empanaditas y bocatas de entrada, pastas, carnes y volcanes de chocolate o dulce de leche. En desayuno y merienda se destaca el pan casero cocido en horno a leña, junto con pastelería y cafetería. El salón tiene unas 60 plazas.',
        heading: false,
      },
      {
        text: 'Para almorzar, la experiencia más completa es dejar tiempo para el edificio y la sala cultural, además de la mesa. Para una visita corta, una merienda permite conocer el lugar sin organizar toda la jornada alrededor del restaurante. Los horarios son de lunes a viernes, 11:00-18:30; sábados y domingos, 8:30-18:30. Los huéspedes pueden encargar la cena antes del cierre y consumirla en su apartamento.',
        heading: false,
      },
      {
        text: 'El alojamiento se distribuye en seis pequeños apartamentos para entre tres y seis personas. Cada unidad reúne estar, dormitorio y baño; el equipamiento incluye ventilador, estufa a leña o de alto rendimiento, frigobar y jarra eléctrica. La estadía incorpora desayuno y acceso a la piscina, y hay reposeras para utilizar los espacios verdes.',
        heading: false,
      },
      {
        text: 'El ingreso se anuncia desde las 13:00 y la salida a las 11:00. La llegada debe organizarse dentro del horario de atención, porque el establecimiento cierra al caer la tarde. Es una elección atractiva para quien quiere permanecer en una obra histórica después del movimiento de los visitantes del restaurante. La combinación más coherente es alojarse, cenar con encargo previo y dedicar la mañana siguiente al lago y al entorno de Villa Serrana.',
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
      'Una mesa puede ser el mejor comienzo de una visita. El Ventorrillo invita a reunir comida, arquitectura y contemplación en un mismo momento. No se trata de consumir la vista a toda velocidad, sino de quedarse el tiempo suficiente para que el lugar encuentre su ritmo.',
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
    summary: 'Una obra de 1946 concebida para sentarse a la mesa sin dejar de mirar la sierra.',
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
      'Antes de mirar una construcción, mirá dónde se apoya. El granito de Villa Serrana permite cambiar el foco y descubrir el paisaje desde su materia. Después, volvés a las calles y edificios con otra pregunta: cómo aprendieron a convivir con ese suelo.',
    slug: 'granito-villa-serrana',
    category: 'Geología',
    international: false,
    status: 'Visita no confirmada',
    image: 'panorama',
    imageContext: true,
    summary:
      'Antes de mirar una construcción, mirá dónde se apoya. El granito de Villa Serrana permite cambiar el foco y descubrir el paisaje desde su materia. Después, volvés a las calles y edificios con otra pregunta: cómo aprendieron a convivir con ese suelo.',
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
      'Las canteras permiten formular preguntas sobre el vínculo entre materiales y territorio. La del Portugués tiene un lugar en ese relato, todavía por desarrollar con sus responsables.',
    slug: 'cantera-del-portugues',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary: 'Patrimonio mineral y memoria del trabajo en las sierras.',
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
        text: 'El Salto del Penitente permite acercarse a un paisaje de roca expuesta, agua que desciende entre las sierras y vegetación que se concentra en las zonas húmedas. La llegada al parador introduce una particularidad: el edificio se aborda desde su parte superior y acompaña el desnivel del terreno. La cubierta se convierte en un primer lugar para leer el paisaje antes de bajar hacia los sectores de visita.',
        heading: false,
      },
      {
        text: 'El parque surgió de la donación de un predio de Francisco Ferber a la Intendencia. El parador fue resultado de un concurso de 2003 y se inauguró en agosto de 2004. Para apreciar la intervención, podés observar primero cómo se apoya el edificio en la pendiente y luego mirar hacia atrás desde un nivel inferior. El paseo tiene así dos protagonistas: el salto de agua y la forma en que la arquitectura permite acercarse a él.',
        heading: false,
      },
      {
        text: 'Caminar, trepar o hacer una primera cabalgata',
        heading: true,
      },
      {
        text: 'La visita puede ser contemplativa, deportiva o una combinación de ambas. El operador ofrece caminatas y actividades de aventura: pared natural de escalada de unos diez metros con tres vías, rappel y dos tramos de tirolesa de 195 y 189 metros. También anuncia cabalgatas guiadas de alrededor de media hora. Las propuestas de aventura y cabalgata se concentran en fines de semana y feriados.',
        heading: false,
      },
      {
        text: 'Para una primera visita, podés empezar por el paisaje y elegir después una sola actividad. La cabalgata breve puede encajar en una jornada que también incluya almuerzo y observación del salto; una persona interesada en escalada preferirá reservar más tiempo a esa experiencia. Quienes viajan juntos pueden compartir comida y miradores aunque tengan intereses deportivos diferentes.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Primero mirá. Después elegí cómo querés vivir el lugar: una caminata, una actividad de aventura o una pausa larga frente a la sierra. El Penitente permite que un mismo día tenga ritmos distintos y que cada visitante encuentre su propia manera de recordar el paisaje.',
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
      'Agua entre rocas, un parador integrado a la ladera y actividades de aventura con operador.',
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
      'Caminar no es solamente llegar más lejos. También puede ser detenerse a reconocer cómo cambia el terreno. El paisaje de Campanero propone ese encuentro, con una diferencia importante: cerro, arroyo y parque no son una misma entrada ni una experiencia intercambiable.',
    slug: 'cerro-campanero',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Caminar no es solamente llegar más lejos. También puede ser detenerse a reconocer cómo cambia el terreno. El paisaje de Campanero propone ese encuentro, con una diferencia importante: cerro, arroyo y parque no son una misma entrada ni una experiencia intercambiable.',
    region: 'Minas y entorno',
    themes: ['Geología'],
  },
  {
    id: 16,
    name: 'Parque Represa de OSE',
    blocks: [
      {
        text: 'Una obra hidráulica que también forma parte del paseo',
        heading: true,
      },
      {
        text: 'La Represa y Parque OSE de Minas permite conocer otra relación entre ciudad y agua. La obra data de en 1934 y describe un muro de unos 250 metros y un embalse con capacidad de un millón de metros cúbicos. Las mesas del entorno permiten detenerse a comer en un paisaje de vegetación y agua.',
        heading: false,
      },
      {
        text: 'Es una propuesta adecuada para una pausa de picnic y para observar una infraestructura histórica desde su entorno público. La visita puede acompañar una mañana urbana, sin exigir un día entero de excursión. El interés está en la obra, el espejo de agua y el parque; para una jornada centrada en parrilleros, piscinas o camping, Arequita ofrece una organización recreativa más completa.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
        heading: true,
      },
      {
        text: 'Pedí la ubicación del acceso recreativo de Parque OSE al organizar el traslado. Esta propuesta es de paisaje y observación; las instalaciones operativas de abastecimiento no forman parte del paseo. No confundir con la represa de Aguas Blancas.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Natural',
    statusRaw: 'Acceso recreativo por confirmar',
    relationsRaw: 'Minas · Salus · Aguas Blancas.',
    tagline: 'El agua y la ciudad, en una misma escena',
    intro:
      'Una represa también cuenta una historia urbana. Acercarse a su paisaje permite pensar en las obras que sostienen la vida cotidiana y que pocas veces entran en el relato de un viaje. Aquí la pausa puede convertirse en una pregunta sobre la relación entre ciudad y agua.',
    slug: 'parque-represa-de-ose',
    category: 'Naturaleza',
    international: false,
    status: 'Coordinación previa',
    image: 'panorama',
    imageContext: true,
    summary:
      'Una represa también cuenta una historia urbana. Acercarse a su paisaje permite pensar en las obras que sostienen la vida cotidiana y que pocas veces entran en el relato de un viaje. Aquí la pausa puede convertirse en una pregunta sobre la relación entre ciudad y agua.',
    region: 'Minas y entorno',
    themes: ['Agua', 'Naturaleza'],
  },
  {
    id: 17,
    name: 'Parque de Minas',
    blocks: [
      {
        text: 'Un parque para organizar la estadía alrededor de sus actividades',
        heading: true,
      },
      {
        text: 'El Parque de Minas es un complejo vacacional serrano sobre Ruta 12, km 347,5. Nació del proyecto de crear un lugar de descanso colectivo en la década de 1940 y conserva esa vocación de vacaciones en familia. Su extensión, cercana a 500 hectáreas, permite alternar sectores de bosque, caminos serranos, instalaciones deportivas y espacios productivos. Hay balneario de arroyo, piscinas y un miniparque acuático: son ambientes diferentes para disfrutar del agua dentro de una misma estadía.',
        heading: false,
      },
      {
        text: 'El tambo es una de las experiencias que más lo distingue de un hotel convencional. La propuesta del establecimiento incluye observar el ordeñe y alimentar terneros; se suman huerta, producción avícola y otros sectores de granja. Una visita con niños puede partir de una pregunta concreta, «de dónde viene lo que comemos», y continuar después en la mesa del restaurante, que utiliza parte de esa producción.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Hay estadías que se organizan alrededor de una sola pregunta: ¿qué nos gustaría hacer hoy? Un paseo, un encuentro con la vida productiva del predio o una tarde de descanso pueden convivir sin convertir las vacaciones en una carrera. Parque de Minas invita a esa continuidad.',
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
      'Una secuencia volcanosedimentaria abre una historia de océanos antiguos. El parque suma naturaleza y estadías.',
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
        text: 'Llegada y datos de visita',
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
      'Una herramienta, un carbón, la posición de una piedra: los indicios más pequeños pueden abrir preguntas enormes. Cueva Amarilla invita a conocer cómo se investiga nuestra historia. Su valor se comparte también mediante relatos, museos y educación, sin convertir un sitio frágil en tránsito indiscriminado.',
    slug: 'cueva-amarilla',
    category: 'Cultura',
    international: false,
    status: 'Visita no confirmada',
    image: 'cantera',
    imageContext: true,
    summary:
      'Un sitio arqueológico para comprender cómo se investiga el pasado. No es un destino de acceso espontáneo.',
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
      'El viaje también necesita un lugar donde dejar de avanzar. Un mirador puede dar ese permiso: detenerse, respirar y volver a mirar. Ramallo tiene su lugar en la lectura cultural del paisaje serrano y en la invitación a viajar con menos apuro.',
    slug: 'mirador-ramallo',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary: 'Una pausa para descubrir el horizonte serrano.',
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
      'Un material puede contar dos historias a la vez: cómo se formó y cómo aprendimos a utilizarlo. Libro Gigante invita a reunir esas miradas. Con interpretación y acceso autorizado, la memoria mineral puede convertirse en una experiencia de descubrimiento, no en una búsqueda de recuerdos para extraer.',
    slug: 'cantera-libro-gigante',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'Un material puede contar dos historias a la vez: cómo se formó y cómo aprendimos a utilizarlo. Libro Gigante invita a reunir esas miradas. Con interpretación y acceso autorizado, la memoria mineral puede convertirse en una experiencia de descubrimiento, no en una búsqueda de recuerdos para extraer.',
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
      'No todos los paisajes se descubren al llegar. Algunos empiezan a contarse durante el trayecto, cuando el relieve cambia y obliga a mirar de otra manera. Abra de Zabaleta invita a darle valor a ese recorrido, con paradas seguras y tiempo para observar.',
    slug: 'abra-de-zabaleta',
    category: 'Geología',
    international: false,
    status: 'Coordinación previa',
    image: 'aguas',
    imageContext: true,
    summary:
      'No todos los paisajes se descubren al llegar. Algunos empiezan a contarse durante el trayecto, cuando el relieve cambia y obliga a mirar de otra manera. Abra de Zabaleta invita a darle valor a ese recorrido, con paradas seguras y tiempo para observar.',
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
      'Un lugar de práctica espiritual no necesita convertirse en una atracción de paso para tener valor cultural. Acercarse a su historia implica comprender su propósito, sus tiempos y sus condiciones. La curiosidad encuentra aquí una forma de visita que comienza por el respeto.',
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
      'Un lugar de práctica espiritual no necesita convertirse en una atracción de paso para tener valor cultural. Acercarse a su historia implica comprender su propósito, sus tiempos y sus condiciones. La curiosidad encuentra aquí una forma de visita que comienza por el respeto.',
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
        text: 'La geología se encuentra aquí con un paisaje de embalse y sierras. El camping y el geositio tienen accesos y actividades diferentes: elegí la experiencia y consultá cómo llegar.',
        heading: false,
      },
    ],
    zone: 'Aguas Blancas',
    categoryRaw: 'Patrimonio Geológico',
    statusRaw: 'Coordiná el recorrido y su punto de encuentro.',
    relationsRaw: 'Abra de Zabaleta · Camping Aguas Blancas.',
    tagline: 'Cicatrices de la Tierra',
    intro:
      'Mirar un embalse puede abrir una pregunta que va más allá de su superficie: qué relación tiene el agua con el territorio que la recibe. El registro geológico de Aguas Blancas invita a desarrollar esa interpretación con información técnica y acompañamiento local.',
    slug: 'campamento-aguas-blancas',
    category: 'Geología',
    international: true,
    status: 'Coordinación previa',
    image: 'aguas',
    imageContext: false,
    summary:
      'Una gran zona de cizalla permite leer fuerzas profundas que transformaron las rocas del territorio.',
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
        text: 'Aguas Blancas permite conocer la sierra desde el agua represada y el paisaje del Abra de Zabaleta. El camping municipal reúne espacios para acampar y hacer asado, baños y servicios de apoyo a una jornada prolongada. El embalse y sus orillas dan identidad al paseo; el trayecto por Ruta 81 forma parte de la experiencia paisajística.',
        heading: false,
      },
      {
        text: 'Para un día completo, podés llegar por la mañana, instalar la base de picnic o camping, dedicar un paseo al entorno del agua y reservar una pausa larga para comer. Una segunda parte del recorrido',
        heading: false,
      },
      {
        text: 'puede orientarse a la memoria rural del área o a una visita acordada con Reserva El Abra. Quien busque combinar naturaleza y pueblo puede dedicar otra media jornada a Solís de Mataojo.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Preparar el almuerzo, dejar pasar la tarde y despertar sin un nuevo traslado: acampar cambia la duración del encuentro con un lugar. Aguas Blancas invita a pensar una salida que incluya descanso, conversación y tiempo compartido, además del recorrido.',
    slug: 'camping-aguas-blancas',
    category: 'Cultura',
    international: false,
    status: 'Coordinación previa',
    image: 'aguas',
    imageContext: false,
    summary: 'Una base municipal junto al embalse para organizar una salida de camping y paisaje.',
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
      'La escala de una vida parece pequeña cuando se mira la historia de las rocas. La Caperuza invita a esa conversación sobre el tiempo: no para memorizar cifras, sino para comprender que el paisaje reúne procesos que no podríamos observar en una sola visita.',
    slug: 'cerro-la-caperuza',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'La escala de una vida parece pequeña cuando se mira la historia de las rocas. La Caperuza invita a esa conversación sobre el tiempo: no para memorizar cifras, sino para comprender que el paisaje reúne procesos que no podríamos observar en una sola visita.',
    region: 'Solís y Aguas Blancas',
    themes: ['Geología'],
  },
  {
    id: 26,
    name: 'Parque Mataojo',
    blocks: [
      {
        text: 'Asado y paseo junto al Mataojo',
        heading: true,
      },
      {
        text: 'Los parques Figari y Mataojo acompañan el arroyo que da nombre a Solís de Mataojo. El entorno cuenta con mesas, bancos y parrilleros, y registra sanitarios en Parque Mataojo. Son espacios apropiados para organizar una salida en la que el agua, la sombra y una comida al aire libre sean los protagonistas.',
        heading: false,
      },
      {
        text: 'Podés recorrer primero la plaza y los lugares vinculados a Fabini y luego instalarse para almorzar junto al parque. De ese modo, la salida combina una breve historia del pueblo con una tarde tranquila. Para quien viene desde el sur del departamento, esta opción tiene sentido propio y permite disfrutar Solís sin convertirlo únicamente en una parada de ruta.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
        heading: true,
      },
      {
        text: 'La presencia de agua es un atractivo de paisaje; no equivale por sí sola a una zona habilitada de baño. El parque cuenta con parrilleros, mesas y bancos, y sanitarios en Mataojo. Para una salida ordinaria, utilizá las áreas de recreación y las indicaciones del lugar.',
        heading: false,
      },
    ],
    zone: 'Solís de Mataojo',
    categoryRaw: 'Patrimonio Natural',
    statusRaw: 'Uso recreativo según condiciones locales',
    relationsRaw: 'Solís de Mataojo · Plaza Lázaro Cortés · Aguas Blancas.',
    tagline: 'Un almuerzo que también es parte del viaje',
    intro:
      'A veces alcanza una mesa al aire libre y tiempo para compartirla. El paseo por Mataojo invita a disfrutar el pueblo con otro ritmo: acercarse a sus historias, hacer una pausa y quedarse junto al paisaje sin que todo tenga que ser una gran excursión.',
    slug: 'parque-mataojo',
    category: 'Naturaleza',
    international: false,
    status: 'Paseo por el entorno',
    image: 'panorama',
    imageContext: true,
    summary:
      'A veces alcanza una mesa al aire libre y tiempo para compartirla. El paseo por Mataojo invita a disfrutar el pueblo con otro ritmo: acercarse a sus historias, hacer una pausa y quedarse junto al paisaje sin que todo tenga que ser una gran excursión.',
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
      'Las historias de un pueblo también viven en los espacios donde se comparten. Una Casa de la Cultura invita a conocer voces, prácticas y memorias que no siempre aparecen en los grandes monumentos. El recorrido empieza por saber qué está sucediendo allí y quién puede contarlo.',
    slug: 'casa-de-la-cultura-solis',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary: 'Cultura, actividades y memoria compartida en Solís de Mataojo.',
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
      'A veces conocemos primero la música y después el lugar donde empieza su historia. La referencia a Fabini invita a recorrer ese camino al revés: del paisaje y la memoria local hacia la obra. La experiencia gana profundidad cuando distingue cada inmueble y cada etapa de esa vida.',
    slug: 'edificio-cuna-de-fabini',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary: 'Un encuentro con la memoria cultural de Solís de Mataojo.',
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
        text: 'La localidad conmemora su fundación el 12 de agosto de 1874. El paseo puede combinarse con los parques del arroyo y con los lugares relacionados con la memoria cultural del pueblo.',
        heading: false,
      },
    ],
    zone: 'Solís de Mataojo',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Paseo urbano.',
    relationsRaw: 'Casa de la Cultura de Solís · Parque Mataojo.',
    tagline: 'Conocer un pueblo desde su lugar de encuentro',
    intro:
      'Una plaza permite mirar lo que pasa sin tener que intervenir. Las conversaciones, los recorridos cotidianos y las pausas construyen una forma de conocer el lugar. Lázaro Cortés merece contarse desde esa escala cercana, con la historia local como guía.',
    slug: 'plaza-lazaro-cortes',
    category: 'Cultura',
    international: false,
    status: 'Paseo por el entorno',
    image: 'panorama',
    imageContext: true,
    summary:
      'Una plaza permite mirar lo que pasa sin tener que intervenir. Las conversaciones, los recorridos cotidianos y las pausas construyen una forma de conocer el lugar. Lázaro Cortés merece contarse desde esa escala cercana, con la historia local como guía.',
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
      'Un territorio no se explica solamente mediante edificios antiguos. También se reconoce en sus espacios para jugar, moverse y reunirse. La Plaza de Deportes invita a incorporar esa dimensión cotidiana del lugar, sin confundir una instalación comunitaria con un servicio turístico de uso libre.',
    slug: 'plaza-de-deportes',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary: 'Deporte y encuentro en la vida cotidiana de Solís de Mataojo.',
    region: 'Solís y Aguas Blancas',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 31,
    name: 'Reserva Natural Parque Salus',
    blocks: [
      {
        text: 'Dos sectores para dos ritmos de visita',
        heading: true,
      },
      {
        text: 'En Salus conviene elegir primero entre los Jardines del Puma y el Parque Familiar. Los jardines permiten una visita breve a la fuente, al centro de interpretación, a la galería al aire libre y al Sendero de la Diversidad. El Parque Familiar, ubicado a 3,5 kilómetros de la fuente sobre el acceso, propone una permanencia mayor: recepción con microcine, juegos, senderos y espacio de picnic.',
        heading: false,
      },
      {
        text: 'Para una primera visita, podés comenzar en los jardines y entender el vínculo entre manantial, bosque e historia de Salus. Si el grupo quiere seguir caminando, se puede continuar al Parque Familiar. La separación entre sectores importa al organizar el transporte y el tiempo; no conviene tratarlos como dos rincones contiguos a pie.',
        heading: false,
      },
      {
        text: 'Elegir el sendero según la jornada',
        heading: true,
      },
      {
        text: 'La oferta de senderos permite adaptar la visita: Pequeño Explorador tiene menos de un kilómetro; Agua, menos de dos; Puma, alrededor de siete. El recorrido al Cerro del Águila se realiza con guardaparques. Para una familia que además quiere jugar y almorzar, una opción corta deja tiempo para todo. Para quienes buscan caminar como actividad principal, el itinerario largo exige reservar una parte mayor del día.',
        heading: false,
      },
      {
        text: 'El interés del bosque no se limita a llegar a un mirador. El agua, la vegetación y el manejo de la reserva son temas de interpretación. Una forma de aprovechar la visita es empezar por el centro, elegir el sendero y volver con las observaciones del camino: cambios de sombra, ambientes húmedos, plantas y sonidos de aves.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Ver surgir el agua invita a imaginar el recorrido que no vemos. En Salus, la fuente, los senderos y la interpretación permiten conectar esa pregunta con el paisaje. Elegí el ritmo de tu visita y dejá tiempo para mirar aquello que suele quedar entre una parada y otra.',
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
      'Manantiales, bosque e interpretación: geología antigua y agua cotidiana en una misma visita.',
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
      'Un paisaje de trabajo abre preguntas sobre materiales, usos y transformaciones. Conocerlo exige algo distinto a una visita espontánea: contexto y coordinación. Mina ANCAP tiene lugar en ese relato, siempre desde la información técnica y las condiciones que definan sus responsables.',
    slug: 'mina-ancap',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'Un paisaje de trabajo abre preguntas sobre materiales, usos y transformaciones. Conocerlo exige algo distinto a una visita espontánea: contexto y coordinación. Mina ANCAP tiene lugar en ese relato, siempre desde la información técnica y las condiciones que definan sus responsables.',
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
        text: 'Para quien llega por devoción, las estaciones ordenan un camino de oración. Para quien se interesa por paisaje e historia, ayudan a comprender cómo un cerro se transformó en lugar de encuentro colectivo. La capilla de la base y la Casa del Peregrino permiten conocer el santuario con distintos ritmos de visita; la cumbre puede ser una parte del recorrido, según la capacidad de cada persona.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'La devoción, la historia o el deseo de mirar desde otra altura pueden llevar al mismo lugar. En el Verdún, cada visitante encuentra su propio ritmo. La experiencia no exige llegar a la cumbre para reconocer el significado de un espacio de encuentro y peregrinación.',
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
    summary: 'Peregrinación y paisaje en un cerro cuya historia de encuentro se remonta a 1901.',
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
        text: 'Para explicarlo a un visitante, conviene imaginar una superficie que incorpora capa tras capa durante mucho tiempo. La forma preservada ayuda a reconstruir el ambiente, pero por sí sola no fija una edad exacta. Este contenido permite entender por qué una cantera puede tener valor científico internacional además de productivo. La visita geológica se organiza con responsables del sitio; el santuario de la Virgen del Verdún constituye otra experiencia, aunque comparta el nombre territorial.',
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
      'Hay huellas de vida que no tienen huesos ni una silueta familiar. Su lectura necesita atención y conocimiento. Mina Verdún invita a descubrir esa historia remota: aprender a reconocerla puede cambiar para siempre la manera de mirar una piedra.',
    slug: 'mina-verdun',
    category: 'Geología',
    international: false,
    status: 'Consultar acceso',
    image: 'cantera',
    imageContext: true,
    summary:
      'Hay huellas de vida que no tienen huesos ni una silueta familiar. Su lectura necesita atención y conocimiento. Mina Verdún invita a descubrir esa historia remota: aprender a reconocerla puede cambiar para siempre la manera de mirar una piedra.',
    region: 'Minas y entorno',
    themes: ['Geología'],
  },
  {
    id: 35,
    name: 'Centro Cultural Ángel Ugarte ( Ex Estación de AFE)',
    blocks: [
      {
        text: 'Qué significa visitar un museo de grabado',
        heading: true,
      },
      {
        text: 'El Museo Nacional del Grabado se creó en diciembre de 1999 mediante el acuerdo de la Fundación Lolita Rubial, la Intendencia de Lavalleja y el Club de Grabado de Montevideo. Su colección abarca obra gráfica uruguaya e internacional, exlibris, miniprints y creación digital. El catálogo de la Fundación permite reconocer técnicas y autores: Máscara indoamericana de Ignacio Márquez es una xilografía; Altzella de Valentina Torrado combina aguatinta y punta seca; El gaucho de Javier Hernández es otra obra en xilografía.',
        heading: false,
      },
      {
        text: 'Estos ejemplos sirven para entrar a la sala con una pregunta concreta: cómo cambia una imagen según la técnica con que se produce. El acervo y el catálogo son más amplios que cualquier exposición temporal. La sede expositiva en el Centro Ángel Ugarte permite integrar el museo a un paseo por el antiguo entorno ferroviario de Minas.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Un lugar de partidas y llegadas puede convertirse en un espacio para crear y encontrarse. Ángel Ugarte invita a observar esa transformación: qué permanece, qué cambia y cómo una comunidad vuelve a usar un edificio que forma parte de su memoria.',
    slug: 'centro-cultural-angel-ugarte-ex-estacion-de-afe',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Un lugar de partidas y llegadas puede convertirse en un espacio para crear y encontrarse. Ángel Ugarte invita a observar esa transformación: qué permanece, qué cambia y cómo una comunidad vuelve a usar un edificio que forma parte de su memoria.',
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
        text: 'La visita al Museo Stelio Belloni y la observación del monumento del Cerro Artigas son experiencias relacionadas, pero con accesos y condiciones propias. Confirmar apertura de la colección.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Visita de museo por confirmar',
    relationsRaw: 'Cerro Artigas · Plaza Libertad · Ruta Belloni.',
    tagline: 'Antes del monumento hubo una idea',
    intro:
      'Una gran escultura empieza con decisiones pequeñas: una línea, una forma, una prueba. Conocer materiales de taller permite acercarse a ese proceso y volver a mirar la obra pública con otros ojos. Belloni invita a recorrer la distancia entre imaginar y construir.',
    slug: 'museo-stelio-belloni',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'artesania',
    imageContext: true,
    summary:
      'Una gran escultura empieza con decisiones pequeñas: una línea, una forma, una prueba. Conocer materiales de taller permite acercarse a ese proceso y volver a mirar la obra pública con otros ojos. Belloni invita a recorrer la distancia entre imaginar y construir.',
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
      'La historia de una ciudad se aprende y se transmite. Sus edificios educativos permiten preguntar por las generaciones que pasaron por ellos y por las formas de enseñar. Conocer ese patrimonio requiere cuidar la vida escolar y acordar una visita que tenga sentido para la institución.',
    slug: 'edificio-escuela-1-de-practicas-artigas',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary: 'Memoria educativa y patrimonio de la ciudad de Minas.',
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
      'Una escuela puede conservar más que una fachada: también preguntas, recuerdos y maneras de aprender. Su patrimonio invita a conocer la ciudad desde las experiencias de quienes la habitaron. Ese encuentro se prepara con la institución y respeta sus tiempos cotidianos.',
    slug: 'edificio-escuela-8-guillermo-cuadri',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary:
      'Una escuela puede conservar más que una fachada: también preguntas, recuerdos y maneras de aprender. Su patrimonio invita a conocer la ciudad desde las experiencias de quienes la habitaron. Ese encuentro se prepara con la institución y respeta sus tiempos cotidianos.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 39,
    name: 'Plaza Libertad',
    blocks: [
      {
        text: 'Plaza Libertad: comenzar por el corazón de la ciudad',
        heading: true,
      },
      {
        text: 'La Plaza Libertad reúne varias de las claves de Minas: el trazado urbano, los edificios cívicos, la vista hacia la catedral y el recuerdo de Juan Antonio Lavalleja. Su monumento ecuestre, obra de Juan Manuel Ferrari, fue inaugurado el 12 de octubre de 1902. Se lo reconoce como la primera estatua ecuestre inaugurada en Uruguay. La Jefatura de Policía y el Club Minas forman parte de los edificios que ayudan a reconocer el entorno.',
        heading: false,
      },
      {
        text: 'Podés empezar el recorrido dando una vuelta completa a la plaza. Desde cada lado cambian las relaciones entre monumento, calles y fachadas. Una pausa en un banco permite observar también la vida cotidiana: el centro funciona como lugar de encuentro, compras y circulación. La intervención de 2018 incorporó iluminación y juegos de agua, sumando otra lectura del espacio al caer la tarde.',
        heading: false,
      },
    ],
    zone: 'Minas',
    categoryRaw: 'Patrimonio Cultural',
    statusRaw: 'Paseo urbano',
    relationsRaw: 'Catedral · Casa de la Cultura · Irisarri.',
    tagline: 'Empezá por el lugar donde la ciudad se encuentra',
    intro:
      'Antes de salir hacia las sierras, regalate una vuelta por la plaza. Mirá las fachadas, detenete frente al monumento y observá cómo transcurre la vida alrededor. Un viaje también se construye con esas escenas que nadie organizó especialmente para el visitante.',
    slug: 'plaza-libertad',
    category: 'Cultura',
    international: false,
    status: 'Paseo por el entorno',
    image: 'gauchos',
    imageContext: true,
    summary: 'El centro de Minas se descubre entre fachadas, vida cotidiana y memoria urbana.',
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
        text: 'La confitería creció hasta convertirse en un lugar de encuentro, salón de té y compra de especialidades. La entrevista familiar publicada por sus 125 años muestra una continuidad de oficios y recetas que acompaña varias generaciones de visitantes. Por eso la parada tiene interés patrimonial además de gastronómico: permite conocer una tradición comercial que sigue formando parte de la vida minuana.',
        heading: false,
      },
      {
        text: 'Entre las especialidades están las yemas, serranitos, damasquitos y alfajores Verdún. Florencia Irisarri explicó en una entrevista de mayo de 2026 que las yemas desarrollaron la tradición española del yemón incorporando una cubierta de caramelo. También relató que los alfajores Verdún tuvieron primero el nombre Franquitos. La casa mantiene la fabricación de pastas y la elaboración en Minas.',
        heading: false,
      },
      {
        text: 'La cuarta generación está incorporando equipamiento y ampliando la distribución. Esa historia reciente evita una imagen congelada de la confitería: sigue siendo una empresa de producción y comercio. La visita al centro puede terminar con una pequeña selección para comparar las especialidades en la merienda y llevar otras como recuerdo del departamento.',
        heading: false,
      },
      {
        text: 'La casa central se encuentra frente a Plaza Libertad, en la cuadra del Club Minas. Reúne venta de productos, cafetería y sandwichería; es una parada natural después de Casa de la Cultura o del paseo por la plaza. En el lugar se encuentra en el subsuelo una bodega museo con documentos, objetos de la empresa y una representación de la mesa de los apóstoles. Ese espacio patrimonial se organiza con el establecimiento; la compra y la cafetería son la base del paseo habitual.',
        heading: false,
      },
      {
        text: 'También se documenta un local sobre el acceso de Ruta 8, avenida Baltasar Brum y calle 144. Para quien recorre la ciudad, la casa de la plaza ofrece más contexto histórico; para llevar productos al continuar viaje, el acceso puede resultar práctico. El perfil comercial publica para Minas el teléfono 4442 4008.',
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
      'Algunas paradas se recuerdan por una conversación; otras, por lo que probamos. Una confitería permite reunir ambas cosas. Irisarri invita a conocer una tradición local sin separar el sabor del trabajo y de las historias que lo hicieron posible.',
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
      'Una tradición familiar iniciada en 1898, con yemas, serranitos y recuerdos que se llevan a la mesa.',
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
        text: 'Para una visita breve, recomiendo detenerse primero frente a la fachada, identificar el eje central y observar las proporciones de puertas, ventanas y torres. En el interior se puede seguir ese eje y comparar la escala del espacio con la percepción desde la plaza. El templo es parte del recorrido histórico y, a la vez, un lugar de culto activo, por lo que la visita se adapta a las celebraciones.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'La puerta de un templo cambia el ritmo del recorrido. La luz, las proporciones y las imágenes invitan a observar con otra atención. En la catedral, el interés por la arquitectura puede convivir con la vida religiosa del lugar, sin que una visita interrumpa a la otra.',
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
      'La puerta de un templo cambia el ritmo del recorrido. La luz, las proporciones y las imágenes invitan a observar con otra atención. En la catedral, el interés por la arquitectura puede convivir con la vida religiosa del lugar, sin que una visita interrumpa a la otra.',
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
        text: 'Una visita con sentido puede comenzar por la casa y continuar luego hacia la plaza. Así se relacionan la memoria biográfica y la representación pública del prócer. La diferencia entre una vivienda conservada y un monumento ecuestre ayuda a contar cómo una ciudad construye su identidad alrededor de una figura histórica.',
        heading: false,
      },
      {
        text: 'Eduardo Fabini: documentos para acercarse a la música',
        heading: true,
      },
      {
        text: 'El Museo Eduardo Fabini nació el 12 de octubre de 1955 a partir del legado de Emma Suárez, viuda del compositor. El encargo fue confiado a Santiago Dossetti, primer director de Casa de la Cultura. Conserva el archivo de la obra del músico y objetos vinculados a su trayectoria. Es una visita que permite pasar de conocer un nombre en una calle o en una sala de conciertos a comprender el trabajo de un creador.',
        heading: false,
      },
      {
        text: 'Para disfrutarlo, conviene relacionar las partituras y objetos biográficos con el paisaje de Solís de Mataojo y Salus, lugares asociados a Fabini. El recorrido musical por Lavalleja puede comenzar aquí y continuar otro día en esas zonas. La conexión entre archivo, paisaje y memoria es el tema del paseo; no depende de que haya una actuación musical durante la visita.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'No hace falta recorrer todas las salas para salir con algo nuevo. Una casa, un documento, una partitura o un objeto pueden abrir una historia completa. Casa de la Cultura invita a elegir ese hilo y seguirlo con tiempo, antes de volver a caminar la ciudad.',
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
      'La casa natal de Lavalleja, el archivo de Fabini y las historias que una ciudad conserva.',
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
      'Un cementerio merece una mirada que combine interés histórico y respeto. Puede ayudar a conversar sobre memoria, nombres y formas de recordar, sin transformar el duelo ajeno en espectáculo. La visita patrimonial necesita contexto, cuidado y acuerdos claros.',
    slug: 'cementerio-central',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary: 'Memoria urbana y patrimonio cultural en un espacio de recogimiento.',
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
        text: 'El Museo del Alfajor reúne objetos y documentos vinculados a tres generaciones de la familia Cedrés, creadora de Alfajores de las Sierras de Minas. La empresa sitúa su origen en 1953. La visita permite acercarse a la historia de un producto que se transformó en un recuerdo gastronómico de Minas y a la continuidad de una actividad familiar a lo largo del tiempo.',
        heading: false,
      },
      {
        text: 'Para recorrerlo, podés mirar los objetos como huellas de trabajo: qué tarea resolvían, qué materiales utilizaban y qué cuentan de la forma de producir y vender. Con niños, se puede partir del alfajor que conocen y reconstruir hacia atrás el oficio que lo hizo posible. La compra posterior permite comparar presentaciones de merengue, chocolate y otras variedades.',
        heading: false,
      },
      {
        text: 'Cómo incorporarlo al paseo por Minas',
        heading: true,
      },
      {
        text: 'El museo está en Carabajal 405, esquina Colón, junto a la referencia comercial de la fábrica. Su horario publicado abarca mañana y tarde, con una pausa al mediodía. La entrada gratuita facilita incorporarlo a un circuito familiar de cultura y sabores. Para una visita centrada en oficios, lo combinaría con el Museo de Miniaturas de Carabajal 322; para un recorrido gastronómico, con Irisarri y una vuelta por Plaza Libertad.',
        heading: false,
      },
      {
        text: 'La empresa también publica un punto de venta en Plaza Treinta y Tres, sobre 25 de Mayo. Elegir la fábrica y museo aporta historia además de compra; el local de plaza permite resolver una parada breve durante el paseo urbano.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Conocer un producto desde su historia cambia la manera de llevarlo de regalo. El Museo del Alfajor invita a mirar objetos, trabajo y continuidad familiar. Después, la elección de una caja deja de ser solamente una compra: se convierte en una parte del viaje que podés compartir.',
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
    summary: 'Objetos, documentos y tres generaciones de una tradición gastronómica minuana.',
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
        text: 'El Museo del Humor y la Historieta ofrece otra forma de aproximarse al edificio: caricaturas, dibujo y narración gráfica. Un paseo cultural puede vincular el escenario, la colección de humor y las salas de Casa de la Cultura. Si el viaje coincide con una función, verla permite conocer el teatro en uso; la visita patrimonial y la asistencia a un espectáculo son experiencias complementarias.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Hay una diferencia entre mirar un teatro vacío y vivirlo durante una función. Ambas experiencias revelan algo del lugar: su arquitectura y su capacidad de reunir. El Teatro Lavalleja invita a acercarse por la historia y, cuando la agenda acompaña, quedarse por lo que sucede en escena.',
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
      'Arquitectura, espectáculos y patrimonio del humor en un escenario inaugurado en 1909.',
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
        text: 'Podés observar el monumento desde cierta distancia antes de acercarse. La escala, la silueta y la relación con el cielo se perciben de otra manera que los detalles vistos desde la base. Después, mirar hacia Minas ayuda a reconocer la trama urbana y ubicar algunos de los lugares recorridos durante el día. Es una buena culminación de un circuito que haya empezado en Plaza Libertad.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Después de caminar las calles, cambiar de altura permite ordenar los recuerdos. El Cerro Artigas invita a reconocer el conjunto y la relación entre la ciudad y su paisaje. La escultura añade otra escala: mirarla de lejos y de cerca son dos formas distintas de descubrirla.',
    slug: 'cerro-artigas',
    category: 'Geología',
    international: false,
    status: 'Paseo por el entorno',
    image: 'artigas',
    imageContext: false,
    summary:
      'Una mirada panorámica sobre Minas y un monumento que forma parte de la memoria del paisaje.',
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
      'El patrimonio doméstico acerca la historia a otra escala. Una vivienda invita a preguntar por los usos, las familias y los cambios de un barrio. Casa Curbelo Báez merece una investigación que permita contar su singularidad sin confundirla con otros inmuebles de nombres parecidos.',
    slug: 'casa-curbelo-baez',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary: 'Una casa para acercarse a la historia doméstica de Minas.',
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
      'Un recorrido de templos también puede acercarse a la vida de los barrios. Santa Teresita invita a incorporar esa mirada, sin exigir monumentalidad para reconocer un lugar significativo. La historia se completa con la comunidad que lo habita y conserva.',
    slug: 'iglesia-santa-teresita',
    category: 'Cultura',
    international: false,
    status: 'Consultar acceso',
    image: 'panorama',
    imageContext: true,
    summary: 'La vida de la comunidad y el patrimonio religioso de Minas.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Cultura'],
  },
  {
    id: 49,
    name: 'Parque Rodó',
    blocks: [
      {
        text: 'Una salida de parque con tiempo para comer y jugar',
        heading: true,
      },
      {
        text: 'Parque Rodó se encuentra al norte de Minas, sobre avenida San Martín. El parque reúne mesas, bancos, parrilleros, juegos, rosal y un lago artificial. Esa combinación permite una salida familiar que reúna comida, paseo y juego en un mismo espacio urbano. El lago aporta paisaje y observación; los parrilleros permiten que el almuerzo sea parte del encuentro.',
        heading: false,
      },
      {
        text: 'Una opción para quien quiere hacer asado cerca de la ciudad y alternar la mesa con actividades sencillas. Puede ocupar una tarde completa o combinarse con un museo durante la mañana. El parque también recibe acontecimientos como Minas y Abril y actividades de la Semana de Lavalleja, por lo que una visita durante un festival tiene un ritmo y una organización distintos de un día ordinario.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Jugar, compartir una comida y caminar un rato también pueden ser un buen plan de viaje. Parque Rodó invita a dedicar tiempo a lo sencillo. En fechas de encuentro cultural, el lugar cambia de ritmo; fuera de ellas, la experiencia puede ser una tarde tranquila.',
    slug: 'parque-rodo',
    category: 'Cultura',
    international: false,
    status: 'Paseo por el entorno',
    image: 'panorama',
    imageContext: true,
    summary:
      'Jugar, compartir una comida y caminar un rato también pueden ser un buen plan de viaje. Parque Rodó invita a dedicar tiempo a lo sencillo. En fechas de encuentro cultural, el lugar cambia de ritmo; fuera de ellas, la experiencia puede ser una tarde tranquila.',
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
        text: 'La visita acompañada tiene sentido precisamente por ese carácter de refugio de fauna. Permite conocer una cavidad habitada sin convertirla en un espacio de tránsito indiscriminado. La gruta y el monte de ombúes son dos experiencias distintas: una acerca al ambiente subterráneo y la otra a un bosque singular. Para un día de naturaleza, ambas pueden formar el núcleo del paseo por Arequita.',
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
      'Una cavidad habitada nos recuerda que no somos los únicos visitantes del paisaje. Conocer la gruta tiene sentido cuando la curiosidad se acompaña de cuidado. La mejor experiencia es la que permite comprender el refugio sin alterar la vida que lo hace especial.',
    slug: 'gruta-colon-y-conservacion-de-murcielagos',
    category: 'Experiencias',
    international: false,
    status: 'Coordinación previa',
    image: 'gruta',
    imageContext: false,
    summary:
      'Una cavidad de importancia para los murciélagos. Su conocimiento requiere acompañamiento y autorización.',
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
        text: 'El río explica parte de la continuidad entre ambientes: une el valle, la vegetación de ribera y los espacios de recreación cercanos. Para observar fauna conviene caminar despacio por los recorridos habilitados, detenerse y escuchar. Los carpinchos, guazubirás y aves forman parte de la biodiversidad del área; el atractivo está en conocer sus ambientes, sin organizar el paseo alrededor de un avistamiento garantizado.',
        heading: false,
      },
    ],
    zone: 'Arequita y Santa Lucía',
    categoryRaw: 'Experiencias',
    statusRaw: 'Recorrido habilitado por confirmar',
    relationsRaw: 'Cerro Arequita · Gruta Colón · Santa Lucía.',
    tagline: 'Descubrir un paisaje a la altura de sus troncos',
    intro:
      'Hay paseos en los que mirar hacia abajo y alrededor vale tanto como mirar al horizonte. Formas, sombras y vegetación invitan a caminar con otra atención. El monte de ombúes propone un encuentro botánico y paisajístico que no necesita convertirse en una carrera hacia la cima.',
    slug: 'monte-de-ombues-del-entorno-de-arequita',
    category: 'Experiencias',
    international: false,
    status: 'Consultar acceso',
    image: 'ombues',
    imageContext: false,
    summary: 'Troncos, sombras y formas de un bosque singular en el entorno de Arequita.',
    region: 'Arequita y Santa Lucía',
    themes: ['Agua', 'Experiencias'],
  },
  {
    id: 52,
    name: 'Laguna de los Cuervos y entorno',
    blocks: [
      {
        text: 'El Santa Lucía, el bosque ribereño y una estadía en cabaña',
        heading: true,
      },
      {
        text: 'Laguna de los Cuervos permite disfrutar de un entorno de río y bosque nativo próximo al macizo de Arequita. La documentación ambiental describe un paisaje de valle, laguna y cerro, con vistas hacia el Santa Lucía; también registra las ruinas de un antiguo molino harinero. Esa presencia recuerda que el agua del lugar tiene una historia productiva además de paisajística.',
        heading: false,
      },
      {
        text: 'El establecimiento comercial se alcanza por camino Valeriano Magri, a unos trece kilómetros de Minas. Ofrece visita por el día y cabañas; el aviso consultado mantiene temporalmente cerrado su camping. Para una jornada de agua y asado, el establecimiento cuenta con un sector de parrilleros. Elegiría una cabaña si se busca permanecer junto al paisaje al final del día y comenzar la mañana siguiente sin traslado. Para reservar: 099 912 596, 4440 3962 e info@lagunadeloscuervos.com.uy.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Una tarde puede cambiar cuando no hace falta salir enseguida hacia el próximo destino. El entorno de los Cuervos invita a quedarse junto al paisaje, compartir una pausa y descubrir cómo la luz transforma el mismo lugar. Elegí la modalidad de visita antes de llegar.',
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
      'Una tarde puede cambiar cuando no hace falta salir enseguida hacia el próximo destino. El entorno de los Cuervos invita a quedarse junto al paisaje, compartir una pausa y descubrir cómo la luz transforma el mismo lugar. Elegí la modalidad de visita antes de llegar.',
    region: 'Arequita y Santa Lucía',
    themes: ['Agua', 'Dormir', 'Experiencias'],
  },
  {
    id: 53,
    name: 'Camping Arequita',
    blocks: [
      {
        text: 'Una base para pasar más tiempo junto al río',
        heading: true,
      },
      {
        text: 'El Camping Arequita combina parcelas, cabañas y servicios para permanecer en el entorno del Santa Lucía. Su oferta incluye electricidad en las parcelas, parrilleros individuales, estacionamiento junto al alojamiento, juegos infantiles y wifi en áreas comunes. La piscina exterior y la piscina cubierta climatizada ofrecen alternativas al río dentro del complejo.',
        heading: false,
      },
      {
        text: 'Para una salida de asado, la ventaja es reunir comida, espacio de descanso y servicios en una misma base. Para dos días, propongo instalarse y disfrutar del camping el primero; dedicar el segundo al cerro, el monte de ombúes o una visita guiada a la gruta. Quien llega con una familia puede elegir cabaña para conservar esa base sin montar carpa.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Acampar o elegir una cabaña cambia la forma de organizar el viaje. El paisaje deja de ser una parada y se vuelve el lugar donde transcurre el día. Camping Arequita invita a combinar descanso y paseos, con una base propia para volver a encontrarse.',
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
      'Acampar o elegir una cabaña cambia la forma de organizar el viaje. El paisaje deja de ser una parada y se vuelve el lugar donde transcurre el día. Camping Arequita invita a combinar descanso y paseos, con una base propia para volver a encontrarse.',
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
        text: 'Al recorrer la villa, interesa observar cómo aparecen y desaparecen las vistas entre curvas, árboles y diferencias de altura. Las calles internas sin pavimentar contribuyen a una experiencia de desplazamiento pausado. Recomiendo dedicarle al menos una jornada completa: un paso rápido por el lago muestra apenas una parte del proyecto. Una noche permite conocer los cambios de luz y disfrutar una comida sin estar pendiente del regreso a Minas.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'No todos los viajes necesitan una agenda llena. Algunos necesitan una ventana, una caminata y tiempo para volver a sentarse. Villa Serrana invita a reconocer la relación entre arquitectura y paisaje, y a descubrir cuánto cambia la visita cuando no está pendiente del regreso inmediato.',
    slug: 'villa-serrana-el-conjunto-urbano-y-paisajistico',
    category: 'Experiencias',
    international: false,
    status: 'Paseo por el entorno',
    image: 'panorama',
    imageContext: true,
    summary:
      'Un conjunto pensado desde el relieve, los materiales locales y el tiempo del descanso.',
    region: 'Villa Serrana',
    themes: ['Cultura', 'Experiencias'],
  },
  {
    id: 55,
    name: 'La Guarida',
    blocks: [
      {
        text: 'Elegir entre el sendero interpretativo y el circuito aéreo',
        heading: true,
      },
      {
        text: 'La Guarida ocupa un predio al pie del Cerro Guazubirá, con monte nativo y rocas que permiten trabajar la interpretación del paisaje. Ofrece dos senderos autoguiados: uno de 1,5 km, estimado en una hora y media, y otro de 3 km, estimado en dos horas y media. Los códigos QR incorporan contenidos de naturaleza y geología; la duración contempla detenerse a leer y observar, además de caminar.',
        heading: false,
      },
      {
        text: 'El circuito aéreo propone vía ferrata, aerocarril, puentes colgantes y tirolesa. Elegiría el sendero para una salida centrada en plantas, roca y observación; el circuito aéreo para quien busca una experiencia física en altura. La reserva es previa, la actividad requiere caminar sin ayuda y se suspende con lluvia. El acceso publicado es por la primera entrada a Villa Serrana, Ruta 8 km 139,5. El contacto es 091 346 342.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'La misma sierra puede recorrerse con preguntas o con una dosis de aventura. La Guarida invita a elegir entre observar e interpretar o vivir una experiencia física en altura. Reservar la actividad adecuada permite que el desafío sea parte del disfrute y no una sorpresa al llegar.',
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
    summary: 'Senderos interpretativos y aventura en altura al pie del Cerro Guazubirá.',
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
        text: 'Elegiría esta propuesta para quien siente que un mirador por sí solo se queda corto y quiere comprender qué está viendo. Caminar con alguien del lugar permite preguntar por las construcciones de piedra, los usos del campo y los cambios de vegetación. Es una actividad apropiada para dedicarle la mañana y regresar a Villa Serrana a almorzar. El catálogo consultado presenta una referencia desde 30 USD por persona.',
        heading: false,
      },
      {
        text: 'Cabalgata a La Leona: un recorrido más largo sobre el caballo',
        heading: true,
      },
      {
        text: 'La cabalgata dura unas tres horas y une sectores de Atalaya, Sierra Alta y Baño de la India, con vistas del Cerro de la Leona y regreso hacia el lago. Incluye guía local bilingüe, caballo equipado y alforjas. La actividad establece un límite de 90 kg por jinete y muestra una tarifa desde 65 USD.',
        heading: false,
      },
      {
        text: 'Frente a la cabalgata breve del Penitente, esta salida dedica una parte sustancial del día a montar. La elegiría para una persona que quiere conocer el paisaje a caballo y que puede sostener esa duración.',
        heading: false,
      },
      {
        text: 'La conversación de reserva debe indicar la experiencia de cada jinete, porque el catálogo combina referencias a principiantes con una clasificación intermedia o avanzada. Ese dato permite que el guía asigne un programa adecuado al grupo.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Una excursión cambia cuando se puede preguntar por lo que aparece al costado. Piedra, usos del campo y paisaje encuentran un hilo conductor en el relato local. Caminando o a caballo, la invitación es dejar que el recorrido tenga tiempo para la conversación.',
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
      'Caminatas y cabalgatas con guía local, interpretación y permisos para atravesar campos privados.',
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
        text: 'Reserva El Abra aparece en la programación patrimonial con caminatas guiadas, identificación de flora y fauna nativas y conversaciones sobre conservación. El recorrido ofrece una forma de mirar que suele perderse cuando se atraviesa la sierra en automóvil: distinguir especies, observar ambientes y relacionar la vegetación con el relieve.',
        heading: false,
      },
      {
        text: 'La referencia de llegada es Ruta 81, km 124, a once kilómetros de Ruta 8. Pedro Telmo Moreira y Julia Odera figuran como responsables de la actividad documentada. Para organizar una visita, recomiendo dedicarle un bloque propio y combinarla después con Aguas Blancas o con la memoria cultural de Solís. Su interés está en el acompañamiento interpretativo, por lo que la experiencia se organiza con sus responsables.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Reconocer una planta o distinguir un ambiente transforma un paseo. La Reserva El Abra invita a conocer el territorio desde esa atención: mirar, preguntar y relacionar. Una caminata acompañada puede dejar herramientas para disfrutar también de todos los paisajes que vendrán después.',
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
      'Caminatas acordadas para aprender a reconocer flora, fauna y ambientes de Aguas Blancas.',
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
        text: 'La visita gana profundidad cuando se aprende a observar la forma, la disposición de la piedra y la relación con el paisaje. Propongo escuchar los relatos locales como parte de la experiencia cultural y distinguirlos de las conclusiones arqueológicas. Se puede disfrutar de una historia y, al mismo tiempo, formular preguntas sobre cómo se sabe lo que se afirma. El interés del lugar está también en esa búsqueda.',
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
        text: 'Para un viaje fotográfico, propongo separar dos objetivos: recorrer e interpretar el terreno de día y trabajar la composición nocturna en un programa acordado. Conocer primero el lugar ayuda a elegir un encuadre y a comprender qué se está fotografiando. Las salidas nocturnas se coordinan con los responsables del predio.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Las piedras pueden despertar relatos y también preguntas sobre cómo conocemos el pasado. El Valle del Hilo de la Vida invita a escuchar y observar, distinguiendo memoria, interpretación e investigación. No hace falta resolver todos los enigmas para disfrutar una visita atenta y cuidadosa.',
    slug: 'valle-del-hilo-de-la-vida',
    category: 'Experiencias',
    international: false,
    status: 'Coordinación previa',
    image: 'campo',
    imageContext: true,
    summary:
      'Estructuras de piedra, paisaje y relatos locales: una invitación a distinguir interpretación y evidencia.',
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
        text: 'Cerro Místico se encuentra sobre Ruta 12, km 346, en las sierras cercanas a Minas. Su modalidad de apart hotel incluye cuatro habitaciones panorámicas con baño privado, fogón y acceso a una cocina',
        heading: false,
      },
      {
        text: 'compartida equipada. Las piscinas exteriores y las terrazas aprovechan las vistas desde la parte alta del establecimiento. Las habitaciones no incluyen comidas; el operador ofrece viandas para almuerzo y cena.',
        heading: false,
      },
      {
        text: 'La propuesta se orienta al descanso y a grupos pequeños. La política admite huéspedes desde los 12 años y no admite mascotas. Estos dos datos son determinantes al elegirlo: para viajar con niños menores o con perro conviene seleccionar otra base. El ingreso figura a las 15:00 y la salida a las 12:00.',
        heading: false,
      },
      {
        text: 'La Casa de la Luna y la Casa del Bosque tienen un dormitorio en suite, sofá cama en el estar, cocina con horno, vajilla y parrillero. Sus decks privados permiten permanecer al aire libre junto al fogón. La Casa de Piedra ofrece dos dormitorios con baños en suite, estar comedor, cocina integrada, baño social, parrillero y horno de pan; se alquila para un mínimo de cuatro personas y aloja hasta siete.',
        heading: false,
      },
      {
        text: 'Las casas están a unos 500 metros del hotel. Incluyen ropa blanca, leña, agua mineral natural y uso de las piscinas del complejo. Para quienes prefieren cocinar y organizar sus comidas, esta modalidad tiene más autonomía que una habitación con cocina compartida. La ubicación separada también invita a pensar la estadía como una casa en el paisaje, con paseos dentro del predio.',
        heading: false,
      },
      {
        text: 'El circuito histórico del ecoparque reúne corrales de piedra y taperas centenarias. El operador organiza caminatas guiadas, fotografía de naturaleza, avistamiento de aves y travesías en Land Rover Defender al atardecer. En su programación también aparecen fogones y senderismo nocturno con luna llena. Los talleres opcionales incluyen meditación, yoga y propuestas simbólicas o de autoconocimiento.',
        heading: false,
      },
      {
        text: 'La visita por el día tiene un programa propio: comida de cuatro pasos, bebidas, un taller elegido y té antes del atardecer, junto con tiempo para caminar y descansar. Es una alternativa concreta para quien duerme en Minas y quiere dedicar una jornada a este entorno. Para una escapada tranquila, recomiendo elegir una caminata y un solo taller, dejando el resto de la tarde libre para las terrazas y el paisaje.',
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
      'El descanso puede ser el motivo del viaje, no solamente lo que ocurre entre dos actividades. Cerro Místico invita a elegir una estadía o una experiencia que deje espacio al silencio y al paisaje. La propuesta se disfruta mejor cuando sus condiciones coinciden con las necesidades del grupo.',
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
    summary: 'Estadías, caminatas y espacios de descanso en el paisaje de la Ruta 12.',
    region: 'Minas y entorno',
    themes: ['Dormir', 'Sabores', 'Experiencias'],
  },
  {
    id: 60,
    name: 'Museo de Réplicas en Miniaturas',
    blocks: [
      {
        text: 'Una visita que explica cómo trabajaban las máquinas',
        heading: true,
      },
      {
        text: 'El Museo de Réplicas en Miniaturas nació del trabajo de Horacio Chocho. La primera réplica que dio origen a la colección fue una carreta vinculada a la memoria de su padre. Con el tiempo incorporó maquinaria agrícola e industrial, vehículos y escenas de oficios. Varias piezas funcionan mediante mecanismos que permiten observar movimiento: la escala pequeña vuelve visible lo que en una máquina real queda oculto.',
        heading: false,
      },
      {
        text: 'La visita tiene especial interés cuando se sigue una cadena de trabajo, por ejemplo las tareas del trigo hasta llegar a la panadería. La explicación de su creador conecta el mecanismo con el uso que tenía. Es una recomendación sólida para familias, personas interesadas en tecnología y visitantes que buscan una experiencia de conversación con un artesano local. Conviene dedicarle alrededor de dos horas para disfrutar las demostraciones.',
        heading: false,
      },
      {
        text: 'Llegada y datos de visita',
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
      'Una pieza en movimiento permite descubrir lo que una máquina grande a veces oculta. Las miniaturas invitan a mirar el trabajo con curiosidad: cómo se hacía, qué problema resolvía y quién conservó esa memoria. La escala cambia; la capacidad de asombro permanece.',
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
      'Máquinas y oficios reconstruidos en miniatura, nacidos del trabajo de Horacio Chocho.',
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
      'Un edificio puede atravesar usos y generaciones sin perder su capacidad de contar. El Molino Viejo invita a reconstruir esa historia y a mirar la ciudad desde sus cambios. Conocerlo también puede empezar por una investigación y una imagen histórica, mientras se confirma cómo acercarse al lugar.',
    slug: 'molino-viejo-de-minas',
    category: 'Experiencias',
    international: false,
    status: 'Visita no confirmada',
    image: 'panorama',
    imageContext: true,
    summary:
      'Memoria productiva y educativa de Minas. El ingreso necesita confirmación actualizada.',
    region: 'Minas y entorno',
    themes: ['Cultura', 'Experiencias'],
  },
];
export const featuredIds = [1, 23, 31, 17, 14, 54];
export const places: GeoparkPlace[] = canonicalPlaces.map((place) => ({
  ...place,
  title: place.name,
  description: place.blocks.map((block) => block.text).join('\n\n'),
  tags: place.themes,
  visitStatus: place.status,
  access: place.statusRaw,
  contacts: place.channel ? [place.channel] : [],
  images: [
    {
      key: place.image,
      alt: place.imageContext ? 'Paisaje de las sierras de Lavalleja' : place.name,
    },
  ],
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

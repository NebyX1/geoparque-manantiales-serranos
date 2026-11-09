export const environmentalSources = {
  presentation: {
    title: 'Presentación del Geoparque Mundial UNESCO Manantiales Serranos',
    file: 'PRESENTATION OF UNESCO GLOBAL  GEOPARK MANANTIALES SERRANOS.pdf',
    note: 'Presentación institucional en inglés; geodiversidad, cuencas, ambientes y geoeducación.',
  },
  expo: {
    title: 'Manantiales Serranos: conservación, educación y desarrollo sostenible en el territorio',
    file: 'EXPO sostenible 26  Manantiales Serranos.pdf',
    note: 'Presentación institucional; objetivos, interpretación ambiental y propuestas de geoeducación.',
  },
  geopark: {
    title: 'Geoparque Manantiales Serranos',
    file: 'Geoparque Manantiales Serranos.pdf',
    note: 'Presentación del equipo, patrimonio geológico y vínculo entre escuelas y geositios.',
  },
  editorialGuide: {
    title: 'Manantiales Serranos: edición editorial reconstruida',
    file: 'Manantiales_Serranos_reconstruida.pdf',
    note: 'Documento de trabajo de septiembre de 2026; distingue información documental, interpretación y acceso pendiente de confirmación.',
  },
} as const;

export type EnvironmentalSourceId = keyof typeof environmentalSources;

export interface EnvironmentalReference {
  source: EnvironmentalSourceId;
  pages: number[];
}

export interface EnvironmentalAxis {
  id: string;
  label: string;
  title: string;
  description: string;
  question: string;
  action: string;
  image: string;
  href: string;
  sources: EnvironmentalReference[];
}

export interface LearningActivity {
  id: string;
  title: string;
  setting: string;
  objective: string;
  question: string;
  steps: string[];
  record: string;
  care: string;
  href: string;
  sources: EnvironmentalReference[];
}

export const environmentalPurpose = {
  eyebrow: 'Conocer · comprender · conservar',
  title: 'Un territorio para aprender a cuidar.',
  description:
    'Manantiales Serranos relaciona el patrimonio geológico con el agua, la biodiversidad y la vida de sus comunidades. Comprender esas conexiones es el primer paso para participar en su conservación.',
  principles: [
    'Conocer las evidencias que cuentan la historia de la Tierra.',
    'Comprender cómo se relacionan rocas, agua, ambientes y comunidades.',
    'Conservar el patrimonio mediante observación, educación y cuidado compartido.',
  ],
  sources: [{ source: 'expo', pages: [2, 20, 21, 26] }] satisfies EnvironmentalReference[],
};

export const environmentalAxes: EnvironmentalAxis[] = [
  {
    id: 'geodiversidad',
    label: '01 / Geodiversidad',
    title: 'La Tierra deja evidencias.',
    description:
      'Rocas, fósiles, pliegues y formas del relieve permiten reconstruir antiguos océanos y movimientos continentales. Cada geositio aporta una parte de esa historia; comparar sus evidencias ayuda a comprenderla.',
    question: '¿Qué podemos observar y qué necesitamos investigar para explicar una roca?',
    action:
      'Compará fotografías y descripciones de los geositios. Distinguí lo que observás de la interpretación científica y conservá las rocas y los fósiles en su lugar.',
    image: 'arequita-rio',
    href: '/historias/geoparque/',
    sources: [
      { source: 'presentation', pages: [4, 5, 6, 7, 8, 9] },
      { source: 'editorialGuide', pages: [5] },
    ],
  },
  {
    id: 'agua',
    label: '02 / Agua y cuencas',
    title: 'El agua conecta el territorio.',
    description:
      'Manantiales, cursos superficiales y reservas subterráneas forman parte de una misma lectura del paisaje. Las nacientes del Santa Lucía y las divisorias de cuencas muestran por qué su cuidado incluye el suelo, la vegetación y los usos del territorio.',
    question: '¿Por qué el cuidado de un manantial empieza más allá del lugar donde vemos el agua?',
    action:
      'Seguí los cauces y las divisorias en un mapa. Relacioná infiltración y escurrimiento con la vegetación, el relieve y las actividades humanas.',
    image: 'rio',
    href: '/historias/agua/',
    sources: [
      { source: 'presentation', pages: [3, 10] },
      { source: 'expo', pages: [10, 16] },
      { source: 'editorialGuide', pages: [5] },
    ],
  },
  {
    id: 'biodiversidad',
    label: '03 / Biodiversidad',
    title: 'Ambientes que sostienen la vida.',
    description:
      'Bosques serranos y ribereños, pastizales y montes de ombúes integran un mosaico de ambientes. La biodiversidad se comprende al observar esas relaciones y su continuidad con los paisajes transformados por las personas.',
    question:
      '¿Qué cambia en la vida de un ambiente cuando cambian el agua, el suelo o la vegetación?',
    action:
      'Registrá lo que ves y escuchás sin retirar plantas ni molestar a los animales. Identificá los ambientes antes de intentar poner nombre a cada especie.',
    image: 'bosque',
    href: '/historias/biodiversidad/',
    sources: [
      { source: 'presentation', pages: [11, 12] },
      { source: 'expo', pages: [11, 12, 13] },
      { source: 'editorialGuide', pages: [5] },
    ],
  },
  {
    id: 'comunidad',
    label: '04 / Educación y comunidad',
    title: 'Aprender para cuidar en comunidad.',
    description:
      'La geoeducación relaciona escuelas, comunidades, ciencia y patrimonio. El territorio se convierte en un aula para formular preguntas, interpretar evidencias y compartir conocimientos sobre su cuidado.',
    question: '¿Cómo puede lo que aprendemos sobre un lugar ayudar a conservarlo?',
    action:
      'Construí un cuaderno de observaciones y compartí preguntas con tu grupo. Escuchá los saberes locales y distinguí las memorias y los relatos de las evidencias científicas.',
    image: 'aprendiendo',
    href: '/historias/educacion/',
    sources: [
      { source: 'presentation', pages: [13, 15] },
      { source: 'expo', pages: [15, 16, 20, 21] },
      { source: 'geopark', pages: [16] },
      { source: 'editorialGuide', pages: [5] },
    ],
  },
];

// Editorial learning proposals inspired by the sources; these are not scheduled activities.
export const learningActivities: LearningActivity[] = [
  {
    id: 'rocas-evidencias',
    title: 'Leer las rocas sin llevarlas.',
    setting: 'En el aula, con fotografías y fichas del atlas',
    objective: 'Distinguir una observación de una interpretación sobre la historia geológica.',
    question: '¿Qué evidencia permite contar la historia de una roca?',
    steps: [
      'Elegí dos geositios del atlas y compará sus fotografías: formas, colores, capas o fracturas visibles.',
      'Anotá por separado qué observás, qué explicación proponés y qué información aporta la ficha.',
      'Volvé a la pregunta inicial: identificá qué datos faltan y qué consultarías a una persona especialista.',
    ],
    record: 'Un cuadro con tres columnas: observación, interpretación y fuente consultada.',
    care: 'Las rocas, los fósiles y los restos se estudian en su contexto; no se extraen ni se intervienen.',
    href: '/historias/geoparque/',
    sources: [
      { source: 'presentation', pages: [5, 6, 7, 8, 9] },
      { source: 'expo', pages: [16] },
      { source: 'editorialGuide', pages: [5] },
    ],
  },
  {
    id: 'agua-cuenca',
    title: 'Seguir el agua en un mapa.',
    setting: 'En el aula o como preparación de una observación autorizada',
    objective: 'Relacionar el agua visible con el relieve y el territorio de una cuenca.',
    question: '¿Qué territorio alimenta un manantial y cómo se conecta con los cursos de agua?',
    steps: [
      'Localizá un curso de agua en un mapa y observá el relieve que lo rodea.',
      'Dibujá recorridos posibles de la lluvia: una parte escurre por la superficie y otra puede infiltrarse.',
      'Señalá qué relaciones conviene estudiar entre agua, vegetación, suelo y actividades humanas.',
    ],
    record: 'Un mapa comentado con recorridos del agua, conexiones y nuevas preguntas.',
    care: 'Observar agua no significa que sea apta para beber o bañarse. Cualquier salida requiere accesos y condiciones confirmados.',
    href: '/historias/agua/',
    sources: [
      { source: 'presentation', pages: [3, 10] },
      { source: 'expo', pages: [10, 16] },
      { source: 'editorialGuide', pages: [5] },
    ],
  },
  {
    id: 'ambientes-cuidados',
    title: 'Observar un ambiente y proponer cuidados.',
    setting: 'Con imágenes, en el entorno educativo o en un espacio con acceso autorizado',
    objective:
      'Reconocer relaciones entre biodiversidad, condiciones del ambiente y presencia humana.',
    question: '¿Qué necesita este ambiente para seguir sosteniendo vida?',
    steps: [
      'Compará dos ambientes mediante fotografías o una observación acordada: vegetación, sombras, suelo y presencia de agua.',
      'Registrá seres vivos o indicios sin tocarlos. Si no conocés una especie, describila sin asignarle un nombre incierto.',
      'Compartí lo observado y elaborá un afiche con preguntas pendientes y acciones de cuidado justificadas.',
    ],
    record: 'Un cuaderno de campo y un afiche colectivo que relacione observaciones con cuidados.',
    care: 'Mantené distancia de la fauna, no retires plantas y respetá senderos y sectores habilitados.',
    href: '/historias/biodiversidad/',
    sources: [
      { source: 'presentation', pages: [11, 12, 15] },
      { source: 'expo', pages: [12, 16, 21] },
      { source: 'editorialGuide', pages: [5] },
    ],
  },
];

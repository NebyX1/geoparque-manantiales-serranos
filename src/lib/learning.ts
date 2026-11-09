import type { GeoparkPlace } from '../types/geopark';

interface LearningLens {
  topic: string;
  question: string;
  observe: string;
  care: string;
  article: string;
}

const lenses: Record<GeoparkPlace['category'], LearningLens> = {
  Geología: {
    topic: 'Geodiversidad e historia de la Tierra',
    question: '¿Qué evidencias permiten explicar cómo se formó este paisaje?',
    observe:
      'Identificá en la ficha las rocas, las formas del relieve y los procesos mencionados. Diferenciá lo que observás de la explicación científica y anotá qué información falta para responder tus preguntas.',
    care: 'Las rocas y los fósiles forman parte del registro del territorio. Registrá con dibujos o fotografías; no extraigas muestras ni intervengas afloramientos.',
    article: 'geoparque',
  },
  Naturaleza: {
    topic: 'Agua, ambientes y biodiversidad',
    question: '¿Cómo se relacionan el agua, el suelo, el relieve y los seres vivos?',
    observe:
      'Reconocé los ambientes que describe la ficha y sus relaciones. Compará zonas de sombra y luz, cercanía al agua y cobertura vegetal sin salir de los sectores habilitados.',
    care: 'Observá a distancia. No alimentes ni manipules fauna, no retires vegetación y evitá alterar refugios o cursos de agua.',
    article: 'biodiversidad',
  },
  Cultura: {
    topic: 'Patrimonio y formas de habitar',
    question: '¿Qué vínculos entre comunidad y ambiente conserva este patrimonio?',
    observe:
      'Buscá en la ficha relaciones entre materiales, paisaje, oficios y memoria local. Distinguí los testimonios, las interpretaciones y los hechos documentados.',
    care: 'Respetá las obras, las colecciones y los espacios de vida de la comunidad. Pedí autorización antes de registrar testimonios o ingresar a predios.',
    article: 'memoria',
  },
  Experiencias: {
    topic: 'Comunidad y uso responsable del territorio',
    question: '¿Cómo se vincula esta actividad con los recursos y la vida del territorio?',
    observe:
      'Analizá qué usos del agua, del suelo, de los materiales o del paisaje aparecen en la información disponible. Formulá preguntas sobre sus cuidados y su relación con la comunidad.',
    care: 'La ficha documenta una actividad del territorio. Cualquier observación presencial requiere confirmar autorización y condiciones con su responsable.',
    article: 'conservacion',
  },
};

const scientificLenses: Record<number, Partial<LearningLens>> = {
  4: {
    ...lenses.Naturaleza,
    topic: 'Agua y cuencas',
    question:
      '¿Qué relación hay entre las nacientes del Santa Lucía y el territorio que las alimenta?',
    article: 'agua',
  },
  1: {
    question: '¿Qué nos cuenta la riolita de Arequita sobre la apertura del océano Atlántico?',
    observe:
      'Relacioná el volcanismo cretácico con la fragmentación de Pangea. Compará la edad de la roca con los procesos posteriores que modelaron los paredones y el relieve.',
  },
  17: {
    question:
      '¿Cómo ayuda una secuencia volcanosedimentaria a reconstruir la historia de los continentes?',
    observe:
      'Leé las evidencias geológicas descritas para Parque de Minas y su relación con Rodinia. Una roca puede conservar información sobre ambientes y procesos muy anteriores al paisaje actual.',
  },
  23: {
    question: '¿Qué es una zona de cizalla y qué permite investigar en Aguas Blancas?',
    observe:
      'Relacioná la deformación de las rocas con la zona de cizalla Sarandí del Yí–Piriápolis. Separá la observación del afloramiento de las interpretaciones sobre la evolución tectónica regional.',
  },
  24: { ...lenses.Experiencias },
  31: {
    question: '¿Qué relación hay entre un antiguo ambiente marino y las rocas de la Reserva Salus?',
    observe:
      'Estudiá la secuencia del Grupo Arroyo del Soldado y su registro fósil. Relacioná el patrimonio geológico con el agua y los ambientes actuales sin extraer muestras.',
    article: 'agua',
  },
  46: {
    ...lenses.Cultura,
    question: '¿Cómo se relacionan el monumento, la memoria de la comunidad y el paisaje de Minas?',
  },
  50: {
    ...lenses.Naturaleza,
    question: '¿Por qué una cavidad también debe estudiarse como refugio de fauna?',
    care: 'La Gruta Colón alberga un refugio de murciélagos. No alteres su ambiente; el ingreso requiere coordinación y acompañamiento específicos.',
  },
  51: {
    ...lenses.Naturaleza,
    question:
      '¿Qué relaciones entre vegetación, relieve y usos del entorno podemos estudiar en el monte de ombúes?',
  },
  52: { ...lenses.Naturaleza, topic: 'Agua y ambientes', article: 'agua' },
  54: {
    ...lenses.Cultura,
    question: '¿Cómo dialoga el proyecto de Villa Serrana con los materiales y el relieve?',
  },
  56: {
    ...lenses.Cultura,
    question:
      '¿Qué evidencias, testimonios e interpretaciones ayudan a estudiar las construcciones de piedra?',
  },
  57: { ...lenses.Naturaleza },
  58: {
    ...lenses.Cultura,
    question:
      '¿Cómo distinguimos los relatos sobre las estructuras de piedra de la evidencia arqueológica disponible?',
  },
  60: { ...lenses.Cultura },
  61: { ...lenses.Cultura },
};

export function learningLens(place: Pick<GeoparkPlace, 'id' | 'category'>): LearningLens {
  return { ...lenses[place.category], ...scientificLenses[place.id] };
}

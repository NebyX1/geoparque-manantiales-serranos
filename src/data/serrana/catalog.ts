import type { SerranaSourceId } from './sources';

interface PlaceEvidence {
  aliases?: readonly string[];
  references?: readonly SerranaSourceId[];
}

/** Search aliases and supplementary references; titles and facts stay in the atlas. */
export const serranaPlaceEvidence: Readonly<Partial<Record<number, PlaceEvidence>>> = {
  1: {
    aliases: ['Arequita', 'Parque Nacional Arequita', 'riolita'],
    references: ['arequita', 'presentation'],
  },
  4: {
    aliases: ['nacimiento del Santa Lucía', 'Cerro Pelado', 'nacientes del Santa Lucía'],
    references: ['santaLucia', 'presentation'],
  },
  6: { aliases: ['KyKy-Ó', 'Kykyo', 'Kyky O'] },
  8: { aliases: ['Marmarajá', 'Cerro Marmaraja'] },
  9: {
    aliases: ['Stewart Vargas', 'represa de Villa Serrana', 'lago de Villa Serrana'],
    references: ['villaSerrana'],
  },
  10: {
    aliases: ['El Mesón', 'Mesón de las Cañas', 'Julio Vilamajó'],
    references: ['villaSerrana'],
  },
  11: {
    aliases: ['Ventorrillo', 'Ventorrillo de la Buena Vista', 'Vilamajó'],
    references: ['villaSerrana'],
  },
  12: { aliases: ['granito de Villa Serrana'], references: ['geologicalMap', 'villaSerrana'] },
  14: {
    aliases: ['Penitente', 'Cascada del Penitente', 'Salto Penitente', 'Parque del Penitente'],
  },
  16: { aliases: ['Represa de OSE', 'Parque de OSE'] },
  17: {
    aliases: ['Parque Minas', 'Parque UTE', 'Parque UTE-ANTEL', 'Zanja del Tigre'],
    references: ['presentation', 'zanjaTigre'],
  },
  18: {
    aliases: ['Cueva Amarilla de Minas', 'alero de la Cueva Amarilla'],
    references: ['cuevaAmarilla', 'arequitaProject'],
  },
  20: { aliases: ['Libro Gigante', 'Cantera Libro del Gigante'], references: ['geologicalMap'] },
  22: { aliases: ['Templo Budista', 'Sengue Dzong', 'centro budista'] },
  23: {
    aliases: [
      'geositio Aguas Blancas',
      'Campamento de Aguas Blancas',
      'Zona de Cizalla Sarandí del Yi–Piriápolis',
    ],
    references: ['presentation', 'geologicalMap'],
  },
  24: {
    aliases: ['Camping de Aguas Blancas', 'embalse de Aguas Blancas', 'represa de Aguas Blancas'],
  },
  26: { aliases: ['Parque de Mataojo', 'arroyo Mataojo'] },
  27: {
    aliases: ['Casa de la Cultura de Solís', 'Casa de la Cultura de Solís de Mataojo'],
    references: ['solis'],
  },
  28: { aliases: ['Cuna de Fabini', 'Eduardo Fabini en Solís'], references: ['solis'] },
  29: { aliases: ['Plaza de Solís de Mataojo'] },
  31: {
    aliases: ['Salus', 'Parque Salus', 'Reserva Salus', 'Fuente del Puma', 'Arroyo del Soldado'],
    references: ['presentation', 'minasEnvironment', 'hydrogeology'],
  },
  33: { aliases: ['Cerro Verdún', 'Santuario del Verdún', 'Virgen del Verdún'] },
  34: {
    aliases: ['Cantera Verdún', 'Mina del Verdún'],
    references: ['zanjaTigre', 'geologicalMap'],
  },
  35: {
    aliases: ['Ángel Ugarte', 'antigua estación de AFE', 'estación de tren de Minas'],
    references: ['minasPlan'],
  },
  36: { aliases: ['Museo Belloni', 'Stelio Belloni'] },
  39: {
    aliases: ['Plaza Libertad de Minas', 'plaza principal de Minas'],
    references: ['minasPlan'],
  },
  40: { aliases: ['Irisarri', 'Confitería Irisarri de Minas'] },
  41: { aliases: ['Catedral de Minas', 'Inmaculada Concepción'], references: ['minasPlan'] },
  42: {
    aliases: [
      'Casa de la Cultura de Minas',
      'Casa natal de Lavalleja',
      'Museo Eduardo Fabini',
      'Museo Juan José Morosoli',
    ],
    references: ['minasPlan', 'museumFabini'],
  },
  44: { aliases: ['Museo del Alfajor', 'Alfajores de las Sierras de Minas'] },
  45: { aliases: ['Teatro de Minas'], references: ['minasPlan'] },
  46: { aliases: ['monumento a Artigas', 'Cerro Artigas de Minas'] },
  49: { aliases: ['Parque Rodó de Minas', 'Parque Rodo de Minas'] },
  50: {
    aliases: ['Gruta Colón', 'Gruta de Arequita', 'SICOM S-UR-002'],
    references: ['bats', 'arequita'],
  },
  51: {
    aliases: ['Monte de Ombúes', 'Isla de Ombúes', 'bosque de los ombúes'],
    references: ['arequita'],
  },
  52: { aliases: ['Laguna de los Cuervos'], references: ['arequita'] },
  54: {
    aliases: ['Villa Serrana', 'urbanización de Vilamajó', 'conjunto de Villa Serrana'],
    references: ['villaSerrana'],
  },
  56: { aliases: ['Mangas de Piedra', 'Cerro de la Leona', 'La Leona'] },
  57: { aliases: ['El Abra', 'Reserva Natural El Abra'] },
  58: { aliases: ['Valle Hilo de la Vida', 'Hilo de la Vida'] },
  60: { aliases: ['Museo de Miniaturas', 'Horacio Chocho'] },
  61: {
    aliases: ['Molino Viejo', 'Molino de viento de Minas', 'Antiguo Molino de Viento'],
    references: ['minasPlan'],
  },
};

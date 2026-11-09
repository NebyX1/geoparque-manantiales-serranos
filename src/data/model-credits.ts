import natural from './landmark-references-natural.json';

const architecture: Record<number, string[]> = {
  27: ['https://diarioprimerapagina.blogspot.com/2016/08/solis-festejo-lo-grande.html'],
  28: [
    'https://anaforas.fic.edu.uy/jspui/bitstream/123456789/71435/1/Liceos%20del%20Uruguay.pdf',
    'https://uruguayeduca.anep.edu.uy/sites/default/files/exelearning/06-2026/14578/homenajes.html',
  ],
  29: [
    'https://serrano.uy/tristeza-y-esperanza-el-corte-de-palmeras-en-la-plaza-lazaro-cabrera-de-solis-de-mataojo/',
  ],
  30: [
    'https://www.gub.uy/intendencia-lavalleja/comunicacion/noticias/se-inauguro-nueva-cancha-cesped-sintetico-solis-mataojo',
  ],
  32: [
    'https://www.gub.uy/ministerio-industria-energia-mineria/comunicacion/noticias/autoridades-del-miem-recorrieron-emprendimientos-industriales-energeticos',
    'https://mapas.ide.uy/geoserver-raster/ows?service=WMS&version=1.1.1&request=GetMap&layers=ortofotos%3Aortofoto_nacional&styles=&srs=EPSG%3A4326&bbox=-55.29326519015879%2C-34.40429901028746%2C-55.28346674984121%2C-34.39621420971254&width=1024&height=1024&format=image%2Fpng&transparent=false',
  ],
  34: [
    'https://www.cementosartigas.com.uy/noticia/visita-a-la-cantera-en-el-marco-de-la-inauguracion-de-las-nuevas-instalaciones-en-minas',
    'https://www.gub.uy/intendencia-lavalleja/sites/intendencia-lavalleja/files/2024-12/Anexo%20I%20PLMinas_Memo%20Informaci%C3%B3n_2024%20%281%29_compressed.pdf',
    'https://visualizador.ide.uy/',
  ],
  35: ['https://www.opp.gub.uy/sites/default/files/noticias/2024-05/fgr01.jpg'],
  36: [
    'https://www.diariolaunion.com/2024/10/21/21-10-2023-en-la-falda-del-cerro-artigas-fue-inaugurado-el-museo-stellio-belloni/',
  ],
  37: ['https://commons.wikimedia.org/wiki/File:Escuela_N%C2%B0_1_Artigas_(2).jpg'],
  38: ['https://commons.wikimedia.org/wiki/File:School_N%C2%B08_Guillermo_Cuadri.jpg'],
  40: ['https://www.elpais.com.uy/negocios/125-anos-de-una-historia-enlazada-con-la-de-uruguay'],
  42: [
    'https://www.elpais.com.uy/vida-actual/un-recorrido-por-minas-a-traves-de-su-cultura-y-sus-riquezas-literarias',
  ],
  43: [
    'https://www.waze.com/es/live-map/directions/cementerio-central-minas?to=place.w.199755184.1997355234.12034398',
  ],
  44: ['https://sierrasdeminas.com.uy/museo/'],
  45: [
    'https://nomada.uy/guide/view/attractions/3953',
    'https://commons.wikimedia.org/wiki/File:Teatro_Lavalleja.JPG',
    'https://commons.wikimedia.org/wiki/File:Teatro_Municipal_de_Minas.JPG',
  ],
  47: [
    'https://www.diariolaunion.com/wp-content/uploads/2022/12/casa_curbelo_Baez2-1024x576.jpg',
    'https://www.diariolaunion.com/wp-content/uploads/2022/12/Casa_Curbelo_Baez_1-1024x576.jpg',
  ],
  48: ['https://colletlacoste.com/projects/parroquia-santa-teresita-minas/'],
  60: ['https://www.museos.gub.uy/media/k2/items/cache/77df7a7d1a333dea87cc5a7a24bfa2c8_L.jpg'],
  61: [
    'https://www.diariolaunion.com/2026/07/09/obras/',
    'https://serrano.uy/avanzan-las-obras-de-recuperacion-del-museo-molino-viejo/',
    'https://www.gub.uy/intendencia-lavalleja/sites/intendencia-lavalleja/files/2024-12/Anexo%20I%20PLMinas_Memo%20Informaci%C3%B3n_2024%20%281%29_compressed.pdf',
  ],
};
const inherited = new Set([1, 9, 10, 11, 14, 22, 31, 33, 39, 41, 46, 49, 54]);
export function modelSources(id: number): string[] {
  return inherited.has(id)
    ? [
        'https://github.com/NebyX1/nueva-web-turismo-idl/tree/08a03e8060cce0e90e4c3662feed377f4b9c4622',
      ]
    : (architecture[id] ?? natural.landmarks.find((item) => item.id === id)?.urls ?? []);
}
export function modelNote(id: number): string {
  if (id === 8)
    return 'Interpretación lúdica del «Cerro del Lagarto»: la cresta, un extremo rocoso y una prolongación afinada sugieren un lagarto entre las lomas. Un pequeño lagarto animado recorre los pastizales que rodean la loma. El paisaje cartográfico de base se simplifica y su relieve se acentúa para esta miniatura.';
  if ([3, 6, 7, 8, 12, 15, 21, 57].includes(id))
    return `Paisaje cartográfico aproximado del entorno, basado en relieve público y ortofotos IDE de 2017–2018. La vegetación y los afloramientos representan cobertura, sin detalle levantado.${id === 3 ? ' No certifica el detalle de los estromatolitos.' : ''}`;
  if (id === 23)
    return 'Detalle representativo: la represa antigua del entorno del campamento de Aguas Blancas. La miniatura no representa la planta completa del campamento.';
  if (id === 41)
    return 'La misma catedral del modelo de Plaza Libertad del proyecto turístico de Lavalleja, presentada por separado.';
  if (id === 52)
    return 'La laguna y el monte ribereño conservan su base cartográfica aproximada. El Cerro de los Cuervos incorpora un paredón y una corona arbolada adaptados de la maqueta del Arequita y de fotografías del lugar; sus proporciones se simplifican para esta miniatura.';
  if (id === 29)
    return 'La fuente fotográfica identifica esta plaza como Lázaro Cabrera. Conservamos el nombre del catálogo. La miniatura muestra un sector representativo con jardines, bancos y farolas; la fotografía de 2026 documenta la retirada de palmeras.';
  if (id === 36)
    return 'La miniatura representa el edificio fotografiado al pie del Cerro Artigas en 2024. La referencia geográfica del catálogo corresponde al registro institucional anterior; no indica la entrada del edificio representado.';
  if (id === 42)
    return 'Elemento representativo del conjunto: la casa natal de Lavalleja conservada en el patio de la Casa de la Cultura.';
  if (id === 61)
    return 'Exterior recreado a partir de la galería de obras publicada en julio de 2026: torre de acabado mineral, grupos de ventanas bajo la cúpula, nave marfil y azotea ocre. Las proporciones son una interpretación visual; esa referencia no acredita la finalización posterior de las obras.';
  return inherited.has(id)
    ? 'Modelo adaptado del proyecto turístico de Lavalleja.'
    : 'Recreación visual a partir de referencias publicadas. Las proporciones se simplifican para su lectura como miniatura; no es un relevamiento arquitectónico ni un escaneo del lugar.';
}

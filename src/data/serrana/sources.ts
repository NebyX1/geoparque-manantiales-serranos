export interface SerranaSource {
  title: string;
  url: string;
}

/** Reference register for Serrana's curated knowledge, independent of chat traffic. */
export const serranaSources = {
  portal: { title: 'Geoparque Manantiales Serranos · portal educativo', url: '/inicio/' },
  atlas: { title: 'Atlas del Geoparque Manantiales Serranos', url: '/explorar/' },
  experience: { title: 'Recorrido inmersivo del Geoparque', url: '/experiencia/' },
  presentation: {
    title: 'Presentación institucional de Manantiales Serranos',
    url: '/documentos/presentacion-unesco.pdf',
  },
  expo: { title: 'Manantiales Serranos · Expo Sostenible', url: '/documentos/expo-sostenible.pdf' },
  team: {
    title: 'Geoparque Manantiales Serranos · presentación del equipo',
    url: '/documentos/geoparque.pdf',
  },
  unesco: {
    title: 'UNESCO · Manantiales Serranos UNESCO Global Geopark',
    url: 'https://www.unesco.org/en/iggp/manantiales-serranos-unesco-global-geopark',
  },
  unescoDesignation: {
    title: 'UNESCO · Designación de Manantiales Serranos en 2026',
    url: 'https://www.unesco.org/es/articles/manantiales-serranos-se-integra-la-red-mundial-de-geoparques-de-la-unesco-y-posiciona-uruguay-en-el',
  },
  unescoDefinition: {
    title: 'UNESCO · Qué es un Geoparque Mundial',
    url: 'https://www.unesco.org/en/iggp/geoparks/about?language=en',
  },
  unescoGuidelines: {
    title: 'UNESCO · Geoconservación y directrices de los Geoparques Mundiales',
    url: 'https://www.unesco.org/es/iggp/geoparks/about',
  },
  unescoWorldHeritageUruguay: {
    title: 'UNESCO · Lista del Patrimonio Mundial de Uruguay',
    url: 'https://whc.unesco.org/en/statesparties/uy',
  },
  unescoCulturalPropertyConvention: {
    title: 'UNESCO · Convención de 1970 sobre tráfico ilícito de bienes culturales',
    url: 'https://www.unesco.org/es/legal-affairs/convention-means-prohibiting-and-preventing-illicit-import-export-and-transfer-ownership-cultural',
  },
  biodiversityConvention: {
    title: 'Convenio sobre Diversidad Biológica · artículo 8, conservación in situ',
    url: 'https://www.cbd.int/convention/articles?a=cbd-08',
  },
  biodiversityLaw: {
    title: 'IMPO · Ley 16.408, aprobación del Convenio sobre Diversidad Biológica',
    url: 'https://www.impo.com.uy/bases/leyes/16408-1993',
  },
  nagoyaLaw: {
    title: 'IMPO · Ley 19.227, aprobación del Protocolo de Nagoya',
    url: 'https://www.impo.com.uy/bases/leyes/19227-2014',
  },
  geneticResourcesProcedure: {
    title: 'Ministerio de Ambiente · solicitud de acceso a recursos genéticos y bioquímicos',
    url: 'https://www.gub.uy/tramites/solicitud-acceso-recursos-geneticos-yo-bioquimicos-fines-investigacion-no-comercial-comercial',
  },
  escazuLaw: {
    title: 'IMPO · Ley 19.773, aprobación del Acuerdo de Escazú',
    url: 'https://www.impo.com.uy/bases/leyes/19773-2019',
  },
  escazuUruguay: {
    title: 'Ministerio de Ambiente · Uruguay y el Acuerdo de Escazú',
    url: 'https://www.gub.uy/ministerio-ambiente/politicas-y-gestion/uruguay-acuerdo-escazu',
  },
  geoInventory: {
    title: 'IDL e IDE Uruguay · inventario cartográfico de geositios',
    url: 'https://visualizador.ide.uy/geonetwork/static/api/records/dca18d8e-d5cf-4f26-ab41-2ea393a4c358',
  },
  boundary: {
    title: 'IDL e IDE Uruguay · límite del Geoparque',
    url: 'https://visualizador.ide.uy/geonetwork/srv/api/records/761171f4-b446-436d-9b70-dfe15bddc8b7',
  },
  idlGeopark: {
    title: 'Intendencia de Lavalleja · patrimonio geológico de Manantiales Serranos',
    url: 'https://www.gub.uy/intendencia-lavalleja/comunicacion/noticias/lavalleja-geoparque-manantiales-serranos-se-presentaron-feria-internacional',
  },
  geologicalMap: {
    title: 'DINAMIGE y Facultad de Ciencias · Carta Geológica de Lavalleja',
    url: 'https://www.gub.uy/ministerio-industria-energia-mineria/comunicacion/publicaciones/carta-geologica-del-departamento-lavalleja',
  },
  chronology: {
    title: 'Comisión Internacional de Estratigrafía · tabla del tiempo geológico',
    url: 'https://stratigraphy.org/chart/',
  },
  zanjaTigre: {
    title: 'Universidad de la República · complejo Zanja del Tigre',
    url: 'https://www.colibri.udelar.edu.uy/jspui/bitstream/20.500.12008/38360/1/uy24-20755.pdf',
  },
  hydrogeology: {
    title: 'Investigación en Udelar · Hidrogeoquímica de las aguas subterráneas de Minas',
    url: 'https://www.colibri.udelar.edu.uy/jspui/bitstream/20.500.12008/42365/1/10.18273REVBOL.V45N1-2023005.pdf',
  },
  santaLucia: {
    title: 'Ministerio de Ambiente · Plan de Cuenca del Río Santa Lucía',
    url: 'https://www.gub.uy/ministerio-ambiente/sites/ministerio-ambiente/files/documentos/publicaciones/Plan%20de%20cuenca%20Santa%20Luc%C3%ADa%2020250514_compressed%20%281%29.pdf',
  },
  waterLaw: {
    title: 'IMPO · Ley 18.610, Política Nacional de Aguas',
    url: 'https://www.impo.com.uy/bases/leyes/18610-2009',
  },
  waterCode: {
    title: 'IMPO · Código de Aguas, artículo 163, usos comunes del agua',
    url: 'https://www.impo.com.uy/bases/codigo-aguas/14859-1978/163',
  },
  waterActionPlan: {
    title:
      'Ministerio de Ambiente · Plan de acción para la protección del agua en la cuenca del Santa Lucía',
    url: 'https://www.gub.uy/ministerio-ambiente/politicas-y-gestion/plan-accion-para-proteccion-del-agua-cuenca-del-santa-lucia',
  },
  environmentLaw: {
    title: 'IMPO · Ley 17.283, Protección del Medio Ambiente',
    url: 'https://www.impo.com.uy/bases/leyes/17283-2000',
  },
  environmentalReporting: {
    title: 'Ministerio de Ambiente · Sistema de Atención de Denuncias Ambientales',
    url: 'https://www.gub.uy/ministerio-ambiente/tramites-y-servicios/servicios/sistema-atencion-denuncias-ambientales',
  },
  protectedAreasLaw: {
    title: 'IMPO · Ley 17.234, Sistema Nacional de Áreas Naturales Protegidas',
    url: 'https://www.impo.com.uy/bases/leyes/17234-2000',
  },
  protectedAreasRegulation: {
    title: 'IMPO · Decreto 52/005, reglamentación del SNAP',
    url: 'https://www.impo.com.uy/bases/decretos/52-2005',
  },
  arequita: {
    title: 'Ministerio de Ambiente · Parque Nacional Arequita',
    url: 'https://www.gub.uy/ministerio-ambiente/politicas-y-gestion/parque-nacional-arequita',
  },
  arequitaDecree: {
    title: 'IMPO · Decreto 306/024, delimitación y medidas de protección de Arequita',
    url: 'https://www.impo.com.uy/bases/decretos/306-2024',
  },
  arequitaVisits: {
    title: 'Ministerio de Ambiente · condiciones de visita del Parque Nacional Arequita',
    url: 'https://www.ambiente.gub.uy/oan/snap/parque-nacional-arequita/',
  },
  nativeForestLaw: {
    title: 'IMPO · Ley Forestal 15.939, artículo 24, protección del monte indígena',
    url: 'https://www.impo.com.uy/bases/leyes/15939-1987/24',
  },
  wildlifeLaw: {
    title: 'IMPO · Ley 9.481, protección de la fauna y régimen de caza',
    url: 'https://www.impo.com.uy/bases/leyes/9481-1935',
  },
  fireDecree: {
    title: 'IMPO · Decreto 245/025, prevención de incendios forestales y de campo',
    url: 'https://www.impo.com.uy/bases/decretos/245-2025',
  },
  arequitaProject: {
    title: 'Ministerio de Ambiente · bases científicas y delimitación de Arequita',
    url: 'https://www.gub.uy/ministerio-ambiente/sites/ministerio-ambiente/files/documentos/publicaciones/Proyecto%20de%20selecci%C3%B3n%20y%20delimitaci%C3%B3n%20Arequita.pdf',
  },
  bats: {
    title: 'RELCOM · Gruta Arequita, Sitio de Importancia para la Conservación de Murciélagos',
    url: 'https://relcomlatinoamerica.net/sicoms/gruta-arequita/',
  },
  minasPlan: {
    title: 'Intendencia de Lavalleja · memoria del Plan Local de Minas y su entorno',
    url: 'https://www.gub.uy/intendencia-lavalleja/sites/intendencia-lavalleja/files/2024-12/Anexo%20I%20PLMinas_Memo%20Informaci%C3%B3n_2024%20%281%29_compressed.pdf',
  },
  minasEnvironment: {
    title: 'Intendencia de Lavalleja · informe ambiental del Plan Local de Minas',
    url: 'https://www.gub.uy/intendencia-lavalleja/sites/intendencia-lavalleja/files/2024-12/Anexo%20II%20_IAE_FINAL_compressed.pdf',
  },
  solis: {
    title: 'Presidencia · reseña de la fundación de Solís de Mataojo',
    url: 'https://www.gub.uy/presidencia/comunicacion/noticias/presidente-lacalle-pou-participo-150o-aniversario-fundacion-solis-mataojo',
  },
  villaSerrana: {
    title: 'Intendencia de Lavalleja · memoria del Plan Local de Villa Serrana',
    url: 'https://www.gub.uy/intendencia-lavalleja/sites/intendencia-lavalleja/files/documentos/publicaciones/1%20Memoria%20de%20Informaci%C3%B3n.pdf',
  },
  geoparkDepartmentalDecree: {
    title:
      'Intendencia de Lavalleja · Decreto 3.959, interés departamental de Manantiales Serranos',
    url: 'https://www.gub.uy/intendencia-lavalleja/institucional/normativa/decreto-departamental-n-3959-fecha-19032025',
  },
  geoparkManagementResolution: {
    title: 'Intendencia de Lavalleja · Resolución 224/025, gestión del Geoparque',
    url: 'https://www.gub.uy/intendencia-lavalleja/institucional/normativa/resolucion-n-224025',
  },
  geoparkCureAgreement: {
    title: 'Intendencia de Lavalleja · Resolución 3.423/026, cooperación con Udelar–CURE',
    url: 'https://www.gub.uy/intendencia-lavalleja/institucional/normativa/resolucion-n-3423026',
  },
  departmentalLandUse: {
    title:
      'Intendencia de Lavalleja · Decreto 3.571, Directrices Departamentales de Ordenamiento Territorial',
    url: 'https://www.gub.uy/intendencia-lavalleja/sites/intendencia-lavalleja/files/2023-05/Decreto%203571%20DDOTDS.pdf',
  },
  penitenteProtection: {
    title: 'Intendencia de Lavalleja · zona de protección departamental del Salto del Penitente',
    url: 'https://www.gub.uy/intendencia-lavalleja/comunicacion/publicaciones/zona-proteccion-departamental-salto-agua-del-penitente',
  },
  villaSerranaDecree: {
    title: 'Intendencia de Lavalleja · Decreto 3.701, Plan Local de Villa Serrana y su entorno',
    url: 'https://www.gub.uy/intendencia-lavalleja/institucional/normativa/decreto-departamental-n-3701-fecha-21122021',
  },
  cuevaAmarilla: {
    title:
      'Intendencia de Lavalleja · Resolución 2.033/025, patrimonio departamental de Cueva Amarilla',
    url: 'https://www.gub.uy/intendencia-lavalleja/institucional/normativa/resolucion-n-2033025',
  },
  cuevaAmarillaDecree: {
    title: 'Intendencia de Lavalleja · Decreto 3.977, patrimonio departamental de Cueva Amarilla',
    url: 'https://www.gub.uy/intendencia-lavalleja/institucional/normativa/decreto-departamental-n-3977-fecha-11062025',
  },
  cathedralDecree: {
    title:
      'Intendencia de Lavalleja · Decreto 3.975, patrimonio departamental de la Catedral de Minas',
    url: 'https://www.gub.uy/intendencia-lavalleja/institucional/normativa/decreto-departamental-n-3975-fecha-11062025',
  },
  artigasMonumentDecree: {
    title:
      'Intendencia de Lavalleja · Decreto 3.978, patrimonio departamental del monumento ecuestre a Artigas',
    url: 'https://www.gub.uy/intendencia-lavalleja/institucional/normativa/decreto-departamental-n-3978-fecha-11062025',
  },
  theatreHeritageResolution: {
    title: 'IMPO · Resolución 244/006, monumento histórico Teatro Lavalleja',
    url: 'https://www.impo.com.uy/bases/resoluciones/244-2006',
  },
  archaeologicalLaw: {
    title: 'IMPO · Ley 14.040, artículo 14, sitios arqueológicos y yacimientos paleontológicos',
    url: 'https://www.impo.com.uy/bases/leyes/14040-1971/14',
  },
  archaeologicalReporting: {
    title:
      'Ministerio de Educación y Cultura · aviso de hallazgos o daños al patrimonio arqueológico',
    url: 'https://www.gub.uy/tramites/denuncia-patrimonio-arqueologico',
  },
  museumFabini: {
    title: 'Sistema Nacional de Museos · Museo Eduardo Fabini de Minas',
    url: 'https://www.museos.gub.uy/index.php/museos/museos-por-localidad/lavalleja/item/56-museo-eduardo-fabini',
  },
} as const satisfies Record<string, SerranaSource>;

export type SerranaSourceId = keyof typeof serranaSources;

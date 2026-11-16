import type { ChatInput } from './chat.js';
import { placeById, type AtlasPlace } from './knowledge.js';
import { normalize, type Source } from './retrieval.js';
import { defaultVisitIds, visitAreas, visitProfiles, type VisitInterest } from './visit-catalog.js';

const maximumPlaces = 8;
const quantities = {
  un: 1,
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
} as const;
const number = `(${Object.keys(quantities).join('|')}|[1-9]\\d?)`;
const quantityPattern = new RegExp(
  `\\b${number} (?:(?:otros?|otras?|buen[oa]s?|distint[oa]s?|lind[oa]s?) )?(?:lugares?|geositios?|paradas?|opciones?|planes?|paseos?|alternativas?|ideas?|recomendacion(?:es)?|sitios?|museos?|puntos?|destinos?|cerros?|actividades?|mas)\\b|\\b(?:otras?|otros?) ${number}\\b|\\b(?:recomendame|sugerime|elegime|dame) ${number}(?: para (?:visitar|ver|conocer)|$)`,
  'g',
);
const dayPattern = new RegExp(`\\b${number} dias?\\b`);
const visitRequest =
  /\b(?:recomend\w*|suger\w*|sugier\w*|elegime|itinerari\w*|armame (?:un |el |una )?(?:recorrido|paseo|plan|circuito|visita)|(?:lugares?|paradas?|geositios?|sitios?) (?:para|a) (?:visitar|recorrer|ver|conocer)|(?:que|cuales) (?:lugares?|geositios?|paradas?|museos?|paseos?|planes?|senderos?)\b|que (?:(?:puedo|podemos|conviene|vale la pena|me conviene) )?(?:visitar|conocer|hacer|ver|recorrer)\b|(?:adonde|a donde|donde) (?:ir|pasear|puedo ir|me conviene ir)\b|(?:por donde|con que) (?:empiezo|empezar)\b)/u;
const morePlaces =
  /\b(?:otros|otras|mas opciones|mas lugares|mas paradas|lugares mas|paradas mas|opciones mas|alternativas|dos mas|tres mas|algun otro|alguna otra)\b/;
const cityOnly =
  /\b(?:a pie|caminando|sin auto|sin coche|sin vehiculo|centro(?: de minas)?|centrica?s?|centricos?|casco urbano|sin salir|en la ciudad|paradas? urbanas?|solo la ciudad)\b/;
const nearby =
  /\b(?:cerca|alrededores|alrededor|entorno|desde|en auto|tengo auto|con auto|en coche)\b/;
const mobility =
  /\b(?:movilidad reducida|silla de ruedas|dificultad (?:para|al) caminar|baston|sin escalones|evitar escalones|sin escaleras|evitar subidas|no (?:quiere|puede) subir|no puede caminar mucho|nos cuesta caminar|(?:se|me) cansa caminando)\b/;
const withoutBooking =
  /\b(?:sin reserva(?:r|s)?|sin guia|sin coordinar|sin agendar|sin organizar con un guia|sin pedir hora|sin entrar|no dependan de entrar|solo (?:desde )?(?:afuera|exteriores)|gratis|sin pagar|gratuit[oa]s?|gastar poco|bajo presupuesto)\b/;
const shortVisit =
  /\b(?:una tarde|una manana|media jornada|medio dia|pocas horas|dos horas|tres horas|un par de horas|una hora|60 minutos)\b/;
const walking = /\b(?:a pie|caminando|sin auto|sin coche|sin vehiculo)\b/;
const currentConditions =
  /\b(?:hoy|amanana|abiert\w*|horario\w*|tarif\w*|precio\w*|cuanto (?:sale|cuesta)|gratis|gratuit\w*|sin pagar|lluvia|llueve)\b/;
const mixedOuting =
  /\b(?:urbano|urbana|ciudad|centro)\b.*\b(?:naturaleza|naturales?|camp[oa]|aire libre)\b/u;

const interests: Record<VisitInterest, RegExp> = {
  geologia: /\b(?:geologi\w*|geositios?|rocas?|afloramient\w*|volcan\w*|riolita|fosiles)\b/,
  naturaleza:
    /\b(?:naturaleza|natural(?:es)?|paisajes?|bosques?|agua|cascadas?|pajaros?|fauna|flora|sierras)\b/,
  cultura: /\b(?:cultur\w*|histor\w*|patrimoni\w*|arte|museos?|tradiciones|oficios)\b/,
  arquitectura: /\b(?:arquitect\w*|vilamajo|edificios?|fachadas?)\b/,
  interior: /\b(?:lluvia|llueve|bajo techo|techad\w*|interiores?|en interiores|adentro|museos?)\b/,
  'aire-libre':
    /\b(?:al aire libre|exteriores?|pasear afuera|espacios abiertos|sin entrar|no dependan de entrar)\b/,
  familia: /\b(?:familia|chicos|gurises|ninos|ninas|peques|hijos|hijas)\b/,
  sendero: /\b(?:sender\w*|caminat\w*|trekking|caminos rurales)\b/,
  alojamiento: /\b(?:alojar\w*|alojamiento|hospedarme|dormir|acampar|camping|pernoctar)\b/,
  gastronomia: /\b(?:cafe|merienda|gastronom\w*|almorzar|comer)\b/,
};

type Area = (typeof visitAreas)[number];
type Place = AtlasPlace;

interface VisitPlan {
  areas: Area[];
  places: Place[];
  requested: number;
  days: number;
  short: boolean;
  walk: boolean;
  reducedMobility: boolean;
  live: boolean;
  weather: boolean;
  exterior: boolean;
  mixed: boolean;
  wantsRoute: boolean;
}

function toNumber(value: string | undefined) {
  if (!value) return undefined;
  return quantities[value as keyof typeof quantities] ?? Number(value);
}

function phrase(text: string, value: string) {
  return ` ${text} `.includes(` ${normalize(value)} `);
}

function resolveAreas(question: string) {
  const destination = question
    .split(/\b(?:ahora (?:quiero|voy a|prefiero)|me quedo en|mi paseo va a ser por)\b/u)
    .at(-1)!;
  const mentions = visitAreas
    .flatMap((area) => {
      const indices = area.aliases
        .map((alias) => ` ${destination} `.indexOf(` ${normalize(alias)} `))
        .filter((index) => index >= 0);
      const first = Math.min(...indices);
      if (!Number.isFinite(first)) return [];
      const before = destination.slice(0, first);
      const clause = before
        .split(/\b(?:dame|elegime|recomendame|sugerime|pero|alternativas?)\b/u)
        .at(-1)!;
      const excluded =
        /\b(?:no (?:quiero|puedo|conviene) (?:ir|salir|entrar|visitar|conocer)|ya no voy|sin ir|evita|excepto) (?:(?:a|al|hasta) )?(?:.*\bni )?$/u.test(
          clause,
        );
      const origin = /\b(?:desde|saliendo de) $/.test(before);
      return [{ area, first, excluded, origin }];
    })
    .sort((left, right) => left.first - right.first);
  const allowed = mentions.filter(({ excluded }) => !excluded);
  const destinations = allowed.filter(({ origin }) => !origin);
  return {
    areas: (destinations.length ? destinations : allowed).map(({ area }) => area),
    excluded: mentions.filter(({ excluded }) => excluded).map(({ area }) => area),
  };
}

function areaForPlace(id: number | undefined) {
  const place = id === undefined ? undefined : placeById.get(id);
  return (
    place &&
    visitAreas.find(
      (area) => area.placeIds.includes(place.id) || phrase(normalize(place.zone), area.label),
    )
  );
}

function placeNames(place: Place) {
  return [
    place.name,
    place.name.split(':', 1)[0]!,
    place.name.replace(/^Cerro |^Salto del /, ''),
    ...place.aliases,
  ];
}

function rejectPlace(place: Place, question: string) {
  const exclusions = question
    .split(
      /\b(?:ya (?:visite|conozco|fui a)|no (?:quiero|puedo|conviene) (?:visitar|ver|entrar|ir)|excepto|evita|sin repetir)\b/u,
    )
    .slice(1)
    .map((part) => part.split(/\b(?:dame|quiero|sugerime|recomendame|que)\b/, 1)[0]!);
  return exclusions.some((part) => placeNames(place).some((name) => phrase(part, name)));
}

function plannedInterests(query: string) {
  const wanted = (Object.keys(interests) as VisitInterest[]).filter((interest) =>
    interests[interest].test(query),
  );
  if (/\b(?:no museos|sin museos|no quiero museos|no dependan de entrar a un museo)\b/.test(query))
    return wanted.filter((interest) => interest !== 'interior' && interest !== 'cultura');
  return wanted;
}

function requestedQuantity(question: string) {
  return [...question.matchAll(quantityPattern)].find(
    ({ index }) =>
      !/\bno (?:quiero|quiere|puedo|puede) (?:ir a|ver|subir|visitar) $/.test(
        question.slice(0, index),
      ),
  );
}

function asksForOptions(question: string) {
  return (
    visitRequest.test(question) ||
    Boolean(
      requestedQuantity(question) &&
      (resolveAreas(question).areas.length ||
        /\b(?:visitar|conocer|pasear|paradas?|aprovechar|ir|recorrer|visitas?|salida|alojamiento|planes?|dame|pasame)\b/.test(
          question,
        )),
    )
  );
}

export function planVisits(input: ChatInput): VisitPlan | undefined {
  const question = normalize(input.message);
  if (/^cual era el (?:recorrido|circuito)\b/.test(question)) return undefined;
  const recent = input.history.slice(-6);
  const visitTurn = recent.findLast(
    (turn) => turn.role === 'user' && asksForOptions(normalize(turn.content)),
  );
  const previous = normalize(visitTurn?.content ?? '');
  const followUp =
    Boolean(previous) &&
    (morePlaces.test(question) ||
      /^(?:y|mejor|prefiero|ahora|que tal|en cambio|en realidad|si)\b/.test(question) ||
      cityOnly.test(question) ||
      mobility.test(question) ||
      currentConditions.test(question));
  const wantsRoute =
    /\b(?:itinerario|recorrido|circuito|en que orden|paradas|por donde empezar|que hacer primero)\b/.test(
      question,
    );
  const quantity = requestedQuantity(question);
  if (!asksForOptions(question) && !followUp && !wantsRoute) return undefined;

  const { areas: named, excluded } = resolveAreas(question);
  const previousAreas = followUp
    ? resolveAreas(previous).areas.filter((area) => !excluded.includes(area))
    : [];
  const contextual = areaForPlace(input.context?.placeId);
  const areas = named.length
    ? named
    : previousAreas.length
      ? previousAreas
      : contextual && !excluded.includes(contextual)
        ? [contextual]
        : [];
  const sameArea =
    followUp && (!named.length || named.some((area) => previousAreas.includes(area)));
  const active = sameArea ? `${previous} ${question}` : question;
  const walk =
    walking.test(question) || (sameArea && walking.test(previous) && !nearby.test(question));
  const reducedMobility = mobility.test(active);
  const excludeReservations = withoutBooking.test(active);
  const short = shortVisit.test(active);
  const live = currentConditions.test(question);
  const mixed = mixedOuting.test(question) && !walk && !reducedMobility;
  const onlyOutdoors = interests['aire-libre'].test(question);
  const wantedNow = plannedInterests(question);
  const wanted = wantedNow.length ? wantedNow : plannedInterests(active);
  const days = Math.min(maximumPlaces, toNumber(dayPattern.exec(question)?.[1]) ?? 0);
  const count = toNumber(quantity?.slice(1).find(Boolean));
  const perDay = days > 1 && /\b(?:por dia|cada dia)\b/.test(question);
  const requested = mixed
    ? 2
    : count
      ? count * (perDay ? days : 1)
      : /\b(?:primero|una hora)\b/.test(question)
        ? 1
        : days > 1
          ? days * 2
          : 3;
  const wantsInterior = wanted.includes('interior') && !onlyOutdoors && !excludeReservations;
  const wantsStay = wanted.includes('alojamiento');
  const focus = wanted.filter(
    (interest) => !['familia', 'aire-libre', 'interior'].includes(interest),
  );
  const local =
    !mixed &&
    (cityOnly.test(question) || walk || reducedMobility || (short && !nearby.test(question)));
  const widen =
    !local &&
    (nearby.test(active) ||
      focus.some((interest) => ['geologia', 'naturaleza', 'sendero'].includes(interest)) ||
      mixed);
  const ids = areas.length
    ? areas.flatMap((area) => (widen ? (area.surroundings ?? area.placeIds) : area.placeIds))
    : defaultVisitIds;
  const priorText = morePlaces.test(question)
    ? recent
        .filter((turn) => turn.role === 'assistant')
        .map(({ content }) => normalize(content))
        .join(' ')
    : '';

  const places = [...new Set(ids)].flatMap((id) => {
    const place = placeById.get(id);
    const profile = visitProfiles[id];
    if (excluded.some((area) => area.placeIds.includes(id) || area.surroundings?.includes(id)))
      return [];
    if (
      !place ||
      !profile ||
      place.status === 'Visita no confirmada' ||
      rejectPlace(place, question)
    )
      return [];
    if (priorText && placeNames(place).some((name) => phrase(priorText, name))) return [];
    if (!wantsStay && profile.stayOnly) return [];
    if (wantsStay && !profile.interests.includes('alojamiento')) return [];
    if (excludeReservations && place.status !== 'Paseo por el entorno' && !profile.exterior)
      return [];
    if (onlyOutdoors && !profile.interests.includes('aire-libre') && !profile.exterior) return [];
    if (wantsInterior && !profile.interests.includes('interior')) return [];
    if (
      reducedMobility &&
      (!['Minas', 'Solís de Mataojo'].includes(place.zone) ||
        profile.interests.includes('sendero') ||
        place.status !== 'Paseo por el entorno')
    )
      return [];
    const score = wanted.filter((interest) => profile.interests.includes(interest)).length;
    return [{ place, profile, score }];
  });

  const sorted = places.toSorted((left, right) => right.score - left.score);
  const matching =
    focus.length && !mixed
      ? sorted.filter(({ profile }) =>
          focus.some((interest) => profile.interests.includes(interest)),
        )
      : sorted;
  const twoTypes = mixed
    ? [
        places.find(({ place }) => place.zone === areas[0]?.label),
        sorted.find(
          ({ place, profile }) =>
            place.zone !== areas[0]?.label && profile.interests.includes('naturaleza'),
        ),
      ].filter((entry) => entry !== undefined)
    : matching;
  const limit = Math.min(requested, maximumPlaces);
  const chosen =
    areas.length > 1 && !mixed
      ? areas.flatMap((area, index) => {
          const quota =
            Math.ceil((limit * (index + 1)) / areas.length) -
            Math.ceil((limit * index) / areas.length);
          const localIds = widen ? (area.surroundings ?? area.placeIds) : area.placeIds;
          return matching.filter(({ place }) => localIds.includes(place.id)).slice(0, quota);
        })
      : twoTypes;

  return {
    areas,
    places: [...new Map(chosen.map(({ place }) => [place.id, place])).values()].slice(0, limit),
    requested,
    days,
    short,
    walk,
    reducedMobility,
    live,
    weather: /\b(?:lluvia|llueve|pronostico|clima|tormenta)\b/.test(question),
    exterior: onlyOutdoors || excludeReservations,
    mixed,
    wantsRoute,
  };
}

export function visitPreview(plan: VisitPlan) {
  return {
    zona: plan.areas.map(({ label }) => label).join(' y ') || 'Geoparque Manantiales Serranos',
    cantidad: plan.requested,
    lugares: plan.places.map(({ name, zone, status }) => ({
      nombre: name,
      zona: zone,
      visita: status,
    })),
  };
}

function visitBullet(place: Place, plan: VisitPlan) {
  const profile = visitProfiles[place.id]!;
  if (plan.exterior && profile.exterior) return `- **${place.name}**. ${profile.exterior}`;
  const reason = profile.reason ?? place.summary;
  const access = profile.access ?? `${place.statusRaw.replace(/\.$/, '')}.`;
  return `- **${place.name}**. ${reason.replace(/\.$/, '')}. ${access}`;
}

export function formatVisitPlan(plan: VisitPlan): { text: string; sources: Source[] } {
  const { areas, places } = plan;
  const zone = areas.map(({ label }) => label).join(' y ') || 'el Geoparque Manantiales Serranos';
  if (!places.length) {
    return {
      text: `Para ${zone} no tengo una parada que pueda recomendar con todas esas condiciones. Si me decís cuál condición es imprescindible o qué zona cercana también te sirve, puedo proponerte opciones concretas.`,
      sources: [],
    };
  }
  const area = areas[0];
  const minas = areas.length === 1 && area?.id === 'minas';
  const outside = minas && places.some((place) => place.zone !== 'Minas');
  const destination = outside ? 'Minas y alrededores' : zone;
  const title =
    plan.mixed && places.length === 2
      ? `Una parada urbana y otra en la naturaleza desde ${zone}`
      : places.length === 1
        ? `Mi primera opción para ${destination}`
        : `${places.length} lugares para visitar en ${destination}`;
  const sections = [title + '.'];
  const bullets = (items: readonly Place[]) =>
    items.map((place) => visitBullet(place, plan)).join('\n');
  if (plan.days > 1 && places.length > 1) {
    const days = Math.min(plan.days, places.length);
    for (let day = 0; day < days; day++) {
      const start = Math.ceil((day * places.length) / days);
      const end = Math.ceil(((day + 1) * places.length) / days);
      const label = day < areas.length && days === areas.length ? ` · ${areas[day]!.label}` : '';
      sections.push(`**Día ${day + 1}${label}**`, bullets(places.slice(start, end)));
    }
  } else if (outside && places.some((place) => place.zone === 'Minas')) {
    sections.push('**En la ciudad**', bullets(places.filter((place) => place.zone === 'Minas')));
    sections.push(
      '**En los alrededores**',
      bullets(places.filter((place) => place.zone !== 'Minas')),
    );
  } else {
    sections.push(bullets(places));
  }

  if (places.length < plan.requested) {
    sections.push(
      places.length === maximumPlaces
        ? 'Estas son ocho para empezar. Puedo darte más opciones en otra tanda.'
        : `Con esas condiciones encontré ${places.length} ${places.length === 1 ? 'opción documentada' : 'opciones documentadas'}. Si querés ampliar la zona o cambiar algún filtro, puedo sumar otras.`,
    );
  }
  if (plan.walk && minas) {
    sections.push(
      'Para hacerlo a pie, arrancá por la primera parada y seguí el orden de la lista. Consultá el recorrido en el mapa de cada ficha.',
    );
  } else if (plan.short && places.length > 1) {
    sections.push(
      `Si tenés poco tiempo, priorizá ${places[0]!.name}. Tomá el resto como alternativas según el tiempo y el acceso del día.`,
    );
  } else if (plan.wantsRoute && places.length > 1) {
    sections.push(
      'Tomá el orden de la lista como punto de partida. Confirmá los accesos y ajustá el recorrido según tus traslados.',
    );
  }
  if (plan.reducedMobility)
    sections.push(
      'Las fichas no verifican accesibilidad del trayecto. Confirmá el pavimento, las pendientes y si hay escalones antes de salir.',
    );
  if (plan.weather)
    sections.push(
      'Para el escenario de lluvia, consultá el pronóstico y confirmá qué opciones cubiertas están disponibles.',
    );
  else if (plan.live)
    sections.push(
      'Antes de salir, confirmá la apertura, los horarios y las tarifas vigentes en las fichas o con los responsables.',
    );

  return {
    text: sections.join('\n\n'),
    sources: places.map(({ name, slug }) => ({
      title: `Ficha del Geoparque · ${name}`,
      url: `/lugares/${slug}/`,
    })),
  };
}

import re
from backend.app.temporal import has_relative_time, is_event_query, plain


CONVERSATION = "CONVERSATION"
GIANA_META = "GIANA_META"
TOURISM_RAG = "TOURISM_RAG"
CURRENT_INFO = "CURRENT_INFO"
WEB_FOLLOWUP = "WEB_FOLLOWUP"
OUT_OF_SCOPE = "OUT_OF_SCOPE"
CURRENT_TIME = "CURRENT_TIME"

LAVALLEJA_PLACES = (
    "manantiales serranos", "geoparque", "minas", "villa serrana", "aguas blancas",
    "solís de mataojo", "solis de mataojo", "arequita", "penitente", "salus",
    "verdún", "verdun", "cerro del cura", "campanero", "santa lucía", "santa lucia",
    "cerro artigas", "parque rodó", "parque rodo",
)

# Lugares con nombre propio que un turista puede mencionar y no pertenecen a Lavalleja.
FOREIGN_PLACES = (
    "montevideo", "punta del este", "maldonado", "colonia", "rocha", "canelones", "salto", "paysandú", "paysandu",
    "rivera", "tacuarembó", "tacuarembo", "durazno", "florida", "flores", "soriano", "río negro", "rio negro",
    "artigas", "cerro largo", "treinta y tres", "san josé", "san jose", "buenos aires", "valencia", "madrid",
    "barcelona", "parís", "paris", "roma", "londres", "nueva york", "miami", "río de janeiro", "rio de janeiro",
    "san pablo", "sao paulo", "santiago de chile", "lima", "bogotá", "bogota", "ciudad de méxico", "mexico",
    "méxico", "españa", "argentina", "brasil", "chile", "cancún", "cancun", "bariloche", "mendoza", "córdoba",
    "cordoba", "rosario", "gramado", "florianópolis", "florianopolis", "porto alegre",
)

# Variantes ortográficas y alias de topónimos del corpus.
PLACE_ALIASES = {
    "arequita": ("ser varequita", "cerro arequitá", "ser arequita", "varequita", "arekita", "are quita", "arequíta", "arequitá"),
    "minas": ("ciudadaninas", "ciudad de minas"),
    "villa serrana": ("villaserrana", "villa cerrana", "villa serana", "bilha serrana", "villaserana"),
    "penitente": ("penintente", "pénitente"),
    "salus": ("parque salú", "salú"),
    "lavalleja": ("la valleja", "lavaleja", "la balleja", "lavalleya", "labaieja", "lavalleha", "laballeja"),
    "aguas blancas": ("agua blanca", "aguasblancas"),
    "geoparque": ("geo parque", "geoparke", "geoparc"),
}

CANONICAL_FORMS = {"arequita": "Cerro Arequita", "salus": "Parque Salus"}


def normalize_query(text: str) -> str:
    """Normaliza alias y variantes de topónimos antes de clasificar y recuperar."""
    normalized = text
    for canonical, variants in PLACE_ALIASES.items():
        replacement = CANONICAL_FORMS.get(canonical, canonical.title())
        for variant in sorted(variants, key=len, reverse=True):
            pattern = re.compile(r"\b" + re.escape(variant) + r"\b", re.IGNORECASE)
            normalized = pattern.sub(replacement, normalized)
    # "Cerro Cerro Arequita" cuando el usuario ya dijo "cerro".
    return re.sub(r"\b(cerro)\s+cerro\b", r"\1", normalized, flags=re.IGNORECASE)


def mentions_lavalleja(q: str) -> bool:
    return any(place in q for place in LAVALLEJA_PLACES)


def mentions_foreign_place(q: str) -> bool:
    return any(re.search(r"\b" + re.escape(place) + r"\b", q) for place in FOREIGN_PLACES)


def is_web_request(q: str) -> bool:
    if not web_allowed(q):
        return False
    if re.search(r'\ben (?:la )?(?:web|internet)\b', q):
        return True
    if re.search(r"\b(bus(?:c[aá]|qu[eé])\w{0,5}|consult[aá]\w{0,3}|fijate|fíjate|averigu[aá]\w{0,3}|chequea|revis[aá])\b.{0,40}\b(web|internet|online|en línea|en linea|google)\b", q):
        return True
    if re.search(r"\b(web|internet)\b.{0,30}\b(busc|busq|consult|averigu|fijate)", q):
        return True
    return q.strip(" .!¡¿?") in {"buscalo en la web", "buscá en la web", "busca en la web", "buscar en la web", "en la web", "en internet", "sí, buscalo", "si, buscalo", "dale, buscalo"}


def web_allowed(_text):
    return False


def conversation_kind(text: str) -> str:
    """Classify bounded social turns that must never reach RAG or the web."""
    q = re.sub(r'\s+', ' ', plain(normalize_query(text))).strip(' .!¡¿?')
    if re.search(
        r'\b(?:hij[ao] de (?:mil )?putas?|la puta que te pario|put[ao]|forr[ao]|idiota|imbecil|estupid[ao]|'
        r'inutil|pelotud[ao]|bolud[ao]|tarad[ao]|malparid[ao]|basura|mierda|callate|cerra el orto|andate|'
        r'jodete|te odio|no servis para nada|das asco)\b', q
    ):
        return 'abuse'
    # Do not swallow a useful tourism request merely because it starts with
    # friendly small talk ("¿cómo estás y dónde puedo comer en Minas?").
    tourism_request = mentions_lavalleja(q) or bool(re.search(
        r'\b(?:donde (?:comer|aloj|ir)|hotel|camping|restaurante|paseo|visitar|evento|actividad|turismo|recomend)\b', q
    ))
    if not tourism_request and re.search(
        r'\b(?:como estas|como andas|como te va|que tal estas|todo bien|estas bien|como te sentis)\b', q
    ):
        return 'wellbeing'
    if re.fullmatch(
        r'(?:y )?(?:vos )?(?:sos (?:real|humana|una persona)|tenes (?:novi[ao]|familia|amigos|edad|sentimientos)|'
        r'cuantos anos tenes|donde vivis|te gusta [a-z0-9 ]+|cual es tu [a-z0-9 ]+ favorito|podes sentir|dormis|comes)', q
    ):
        return 'personal'
    if re.fullmatch(
        r'(?:podemos hablar de otra cosa|hablemos de otra cosa|contame (?:algo|un chiste)|que opinas(?: de [a-z0-9 ]+)?|'
        r'decime algo|estoy aburrid[ao])', q
    ):
        return 'scope'
    return ''


def pure_conversation(text: str) -> bool:
    """Compositional offline fast path; consume ALL text, never swallow a query.

    A greeting prefix alone cannot suppress a trailing request for facts.
    Remaining unknown words go to semantic selection, not to this fast path.
    """
    q_plain = plain(normalize_query(text)).strip(' .!¡¿?')
    if re.fullmatch(r'(?:como estas|como andas|todo bien)(?: serrana)?', q_plain):
        return True
    q = re.sub(r'[^a-z0-9 ]', ' ', plain(normalize_query(text)))
    q = re.sub(r'\s+', ' ', q).strip()
    units = [r'hola', r'buenas(?: tardes| noches| dias)?', r'buen(?:os)? dias',
             r'serrana', r'che', r'bueno', r'por favor',
             r'(?:muchas )?gracias(?: por (?:la ayuda|todo|ayudarme))?',
             r'hasta (?:luego|despues|manana)', r'adios', r'chau', r'salud',
             r'estas ahi', r'seguis ahi(?: conmigo)?', r'estas funcionando', r'funcionas',
             r'me (?:escuchas|recibis|ois)(?: bien)?', r'me estas escuchando',
             r'me podes escuchar', r'podes escucharme', r'se oye lo que digo',
             r'uno dos tres', r'probando', r'para', r'dejame pensar',
             r'perfecto', r'genial']
    return bool(q and re.fullmatch(r'(?:(?:'+'|'.join(units)+r')(?: |$))+',q))


def classify_intent(text: str) -> str:
    q = re.sub(r"\s+", " ", normalize_query(text).lower().strip())
    plain_q = plain(q)
    if pure_conversation(q):
        return CONVERSATION
    if not is_event_query(q) and re.search(r'\b(que (?:dia|fecha|hora)(?: y (?:dia|fecha|hora))?(?: es| son| tenemos| estamos)|en que (?:dia|fecha) estamos|que dia de la semana|(?:el )?dia de hoy.*cual es|decime la (?:hora|fecha)|sabes (?:la fecha|que dia|que hora)|fecha (?:y hora|actual)|hora actual)\b', plain_q):
        return CURRENT_TIME
    meta_terms = (
        "quién sos", "quien sos", "qué sos", "que sos", "cómo te llamás",
        "como te llamas", "cuál es tu misión", "cual es tu mision",
        "qué hacés", "que haces", "qué podés hacer", "que podes hacer",
        "para qué servís", "para que servis",
    )
    if any(term in q for term in meta_terms):
        return GIANA_META
    if mentions_foreign_place(q) and not mentions_lavalleja(q):
        return OUT_OF_SCOPE
    if is_web_request(q):
        return WEB_FOLLOWUP
    if is_event_query(q) and web_allowed(q) and not re.search(r'\b(historia|origen|que es)\b', plain_q):
        return CURRENT_INFO
    # "hoy"/"ahora" sólo son información actual si preguntan por apertura, horario o disponibilidad.
    current_terms = (
        "está abierto", "esta abierto", "abierto ahora", "abre hoy", "cierra hoy", "cuánto cuesta hoy",
        "cuanto cuesta hoy", "hay lugar esta noche", "evento hay hoy", "hay lugar hoy", "disponibilidad hoy",
        "horario de hoy", "horarios de hoy", "hoy está", "hoy esta", "ahora está", "ahora esta", "qué eventos hay",
        "que eventos hay", "clima hoy", "tiempo hoy",
    )
    if any(term in q for term in current_terms):
        return CURRENT_INFO
    presence_check = re.search(r"\b(?:me (?:pod[eé]s )?escuchar|me escuch[aá]s|pod[eé]s escucharme|me o[íi]s|pod[eé]s escuchar(?: lo que| bien)?|me est[aá]s escuchando)\b", q)
    tourism_terms = (
        "minas", "lavalleja", "villa serrana", "arequita", "penitente", "comer",
        "comida", "vegano", "alojar", "alojamiento", "hotel", "cabaña", "camping", "geoparque", "paseo",
        "hacer", "turismo", "visitar", "conocer", "recomend", "restaurante", "cerro", "sierra", "salto",
    )
    tourism_query = any(term in q for term in tourism_terms)
    conversation_terms = {
        "hola", "hola serrana", "buenas", "gracias", "dale", "ok", "cómo andás",
        "como andas", "estás ahí", "estas ahi", "me escuchás", "me escuchas", "chau", "adiós", "adios",
        "muchas gracias", "perfecto", "genial", "bien", "no", "sí", "si", "salud",
    }
    if q.strip(" .!¡¿?") in conversation_terms or (presence_check and not tourism_query):
        return CONVERSATION
    return TOURISM_RAG


def conversation_answer(text: str, _variant: int = 0) -> str:
    q = plain(text).strip()
    kind = conversation_kind(text)
    if kind == 'abuse':
        return "Puedo ayudarte con una pregunta sobre el Geoparque Manantiales Serranos."
    if kind == 'wellbeing':
        return "¡Todo bien! Estoy lista para ayudarte a conocer el Geoparque Manantiales Serranos."
    if kind == 'personal':
        return "Soy Serrana, una guía virtual del Geoparque Manantiales Serranos."
    if "gracia" in q:
        return "¡De nada! Si querés seguir explorando el Geoparque, estoy acá."
    if "chau" in q or "adios" in q or "hasta " in q:
        return "¡Hasta luego! Que disfrutes el Geoparque."
    if any(term in q for term in ('ahi', 'recibis', 'escuch', 'funcion', 'probando')):
        return "Sí, te leo. ¿Qué querés conocer del Geoparque?"
    return "¡Hola! Soy Serrana, la guía del Geoparque Manantiales Serranos. ¿Qué te gustaría conocer?"


def out_of_scope_answer(_text: str) -> str:
    return "Puedo orientarte sobre el Geoparque Manantiales Serranos y sus geositios."

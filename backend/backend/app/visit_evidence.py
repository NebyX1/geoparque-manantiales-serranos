"""Curated Geopark candidates complement Gianna's hybrid retrieval."""
import json
import re
import sqlite3
import unicodedata
from contextlib import closing
from pathlib import Path


CATALOG = json.loads(
    (Path(__file__).resolve().parents[2] / "data" / "visit-profiles.json").read_text(encoding="utf-8")
)
VISIT = re.compile(
    r"\b(?:recomend\w*|suger\w*|sugier\w*|itinerari\w*|armame|dame|elegime|"
    r"(?:que|cuales) (?:puedo |podemos |conviene )?(?:visitar|conocer|recorrer|hacer|lugares|geositios|paradas))\b"
)
PLACE_WORDS = re.compile(
    r"\b(?:visitar|conocer|recorrer|pasear|visitas?|lugares?|geositios?|paradas?|paseos?|"
    r"recorridos?|senderos?|museos?|cerros?|circuitos?|planes?|itinerarios?|alojamiento)\b"
)
NEARBY = re.compile(r"\b(?:cerca|alrededores|alrededor|entorno|desde|en auto|con auto)\b")
CITY = re.compile(r"\b(?:a pie|caminando|sin auto|sin coche|sin vehiculo|centro|casco urbano|sin salir)\b")
EXTERIOR = re.compile(r"\b(?:sin reserv(?:as?|ar)|sin coordinar|sin agendar|sin guia|sin entrar|solo desde afuera)\b")
VISITABLE = {"Paseo por el entorno", "Consultar acceso", "Coordinación previa"}
COUNT_WORDS = dict(zip("un una uno dos tres cuatro cinco seis siete ocho nueve diez".split(),
                       (1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)))
COUNT = re.compile(r"\b([1-9]\d?|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez) "
                   r"(?:lugares?|geositios?|paradas?|opciones?|paseos?|sitios?|museos?|cerros?|actividades?)\b")
INTEREST = {
    "geologia": r"\b(?:geologi\w*|rocas?|afloramient\w*|riolita|volcan\w*)\b",
    "naturaleza": r"\b(?:naturaleza|naturales?|paisajes?|bosques?|agua|cascadas?|fauna|flora|sierras)\b",
    "cultura": r"\b(?:cultur\w*|histor\w*|patrimoni\w*|arte|museos?|tradiciones)\b",
    "arquitectura": r"\b(?:arquitect\w*|vilamajo|edificios?|fachadas?)\b",
    "interior": r"\b(?:lluvia|llueve|bajo techo|techad\w*|interiores?|museos?)\b",
    "aire-libre": r"\b(?:al aire libre|exteriores?|espacios abiertos|sin entrar)\b",
    "familia": r"\b(?:familia|chicos|gurises|ninos|ninas|peques|hijos|hijas)\b",
    "sendero": r"\b(?:sender\w*|caminat\w*|trekking)\b",
    "alojamiento": r"\b(?:alojar\w*|alojamiento|hospedarme|dormir|acampar|camping|pernoctar)\b",
    "gastronomia": r"\b(?:cafe|merienda|gastronom\w*|almorzar|comer)\b",
}


def normalize(value):
    folded = "".join(c for c in unicodedata.normalize("NFD", value.lower())
                     if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", folded).strip()


def mentions(text, phrase):
    return f" {normalize(phrase)} " in f" {text} "


def candidate_ids(query):
    travel_areas = [
        area for area in CATALOG["areas"] if any(mentions(query, alias) for alias in area["aliases"])
    ]
    if not travel_areas:
        if re.search(r"\b(?:geoparque|manantiales serranos)\b", query):
            return CATALOG["defaultIds"]
        return []
    preferred = [
        area for area in travel_areas
        if not any(mentions(query, ("desde " + alias)) for alias in area["aliases"])
    ]
    around = bool(NEARBY.search(query) and not CITY.search(query))
    return list(dict.fromkeys(
        place_id for area in (preferred or travel_areas)
        for place_id in (area.get("surroundings", area["placeIds"]) if around else area["placeIds"])
    ))


def recommendation_evidence(db_path, question):
    """Return factual supplemental evidence. The authorized model still answers."""
    query = normalize(question)
    if not VISIT.search(query) or not PLACE_WORDS.search(query):
        return []
    ids = candidate_ids(query)
    if not ids:
        return []
    wanted = {interest for interest, pattern in INTEREST.items() if re.search(pattern, query)}
    number = COUNT.search(query)
    requested = 4
    if number:
        value = number[1]
        requested = int(value) if value.isdigit() else COUNT_WORDS[value]
    quantity = min(requested, 8)
    outside = bool(EXTERIOR.search(query))
    exclusions = re.split(r"\b(?:ya visite|no quiero visitar|no quiero ir a|excepto|evita)\b", query)[1:]
    entity_ids = [f"gms_{place_id:02d}" for place_id in ids]
    placeholders = ",".join("?" for _ in entity_ids)
    with closing(sqlite3.connect(db_path)) as db:
        db.row_factory = sqlite3.Row
        rows = db.execute(f"""
            SELECT e.*, b.block_id, b.source_refs
            FROM entities e
            JOIN source_blocks b ON b.start_line = e.start_line AND b.title = e.name
            WHERE e.entity_id IN ({placeholders})
        """, entity_ids).fetchall()
    by_entity = {row["entity_id"]: row for row in rows}
    results = []
    for place_id, entity_id in zip(ids, entity_ids):
        row = by_entity.get(entity_id)
        profile = CATALOG["profiles"].get(str(place_id))
        if not row or not profile or row["status"] not in VISITABLE:
            continue
        if profile.get("stayOnly") and "alojamiento" not in wanted:
            continue
        if any(mentions(excluded, row["name"]) for excluded in exclusions):
            continue
        if outside and row["status"] != "Paseo por el entorno" and not profile.get("exterior"):
            continue
        match = wanted.intersection(profile["interests"])
        if wanted and not match:
            continue
        description = profile.get("exterior") if outside and profile.get("exterior") else profile.get("reason")
        if not description:
            description = row["description"]
        access = profile.get("access") or "Chequeá las condiciones de visita en la ficha."
        details = (
            f"Zona documentada: {row['zone']}.\nEstado documental de visita: {row['status']}.\n"
            f"{description}\n{access}\nLa ficha no confirma horarios, tarifas ni apertura actual."
        )
        results.append((len(match), {
            "chunk_id": row["block_id"], "block_id": row["block_id"], "title": row["name"],
            "text": details, "start_line": row["start_line"], "end_line": row["end_line"],
            "source_refs": json.loads(row["source_refs"]), "content_origin": "ficha del atlas del Geoparque",
        }))
    results.sort(key=lambda item: item[0], reverse=True)  # Preserve editorial order on ties.
    return [evidence for _, evidence in results[:quantity]]

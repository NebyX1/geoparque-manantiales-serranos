"""Render the canonical Geopark snapshot into Gianna's Markdown ingestion format."""
import re
from collections import defaultdict
from urllib.parse import urlsplit


DIRECTORY = "Directorio de geositios"
QUESTIONS = "Preguntas sobre el Geoparque"
SOURCES = "Fuentes de la guía consolidada"
SECTIONS = {
    "topic": "Conocer el Geoparque",
    "story": "Relatos del territorio",
    "circuit": "Circuitos del Geoparque",
    "activity": "Propuestas de aprendizaje",
}


def one_line(value):
    if not isinstance(value, str) or not value.strip():
        raise ValueError("El catálogo requiere texto en sus títulos, etiquetas y fichas.")
    return " ".join(value.split())


def valid_source_url(value):
    if not isinstance(value, str) or re.search(r"[\s<>\\]", value):
        return False
    if value.startswith("/") and not value.startswith("//"):
        return True
    parsed = urlsplit(value)
    return parsed.scheme == "https" and bool(parsed.hostname) and not (parsed.username or parsed.password)


def render(snapshot):
    """Return the same Markdown for the same snapshot in any checkout."""
    manifest = snapshot["manifest"]
    documents, places = snapshot["documents"], snapshot["places"]
    by_id = {place["id"]: place for place in places}
    if (
        manifest["version"] != 1
        or len(documents) != manifest["total"]
        or len(places) != manifest["counts"]["place"]
        or len(by_id) != len(places)
        or len({doc["id"] for doc in documents}) != len(documents)
    ):
        raise ValueError("El manifiesto del Geoparque no coincide con el catálogo.")

    topics = defaultdict(list)
    zones = defaultdict(list)
    source_numbers = {}
    seen_places = set()
    for doc in documents:
        title = one_line(doc["title"])
        kind = doc["kind"]
        if not doc["sources"]:
            raise ValueError(f"El documento {doc['id']} no tiene fuentes.")
        for source in doc["sources"]:
            url = source["url"]
            if not valid_source_url(url):
                raise ValueError(f"El documento {doc['id']} tiene un enlace de fuente inválido.")
            if url not in source_numbers:
                source_numbers[url] = (len(source_numbers) + 1, one_line(source["title"]))
        if kind == "place":
            place = by_id.get(doc["placeId"])
            if (
                not place
                or place["id"] in seen_places
                or doc["id"] != f"place-{place['id']}"
                or title != one_line(place["name"])
                or doc["sources"][0]["url"] != f"/lugares/{place['slug']}/"
            ):
                raise ValueError(f"La ficha {doc['id']} no coincide con el atlas del Geoparque.")
            seen_places.add(place["id"])
            zones[one_line(place["zone"])].append((place, doc))
        else:
            if kind not in SECTIONS:
                raise ValueError(f"Tipo de documento no reconocido: {kind}.")
            topics[QUESTIONS if kind == "topic" and title.startswith("¿") else SECTIONS[kind]].append(doc)
    if seen_places != set(by_id) or len(source_numbers) != manifest["sources"]:
        raise ValueError("Faltan fichas o fuentes del catálogo del Geoparque.")

    def body(doc, aliases=()):
        if not isinstance(doc["text"], str) or not doc["text"].strip():
            raise ValueError(f"El documento {doc['id']} no tiene contenido.")
        # Editorial headings are evidence text: they cannot introduce ingest sections.
        evidence = re.sub(r"(?m)^#(?=#*\s)", r"\\#", doc["text"].strip())
        references = " ".join(f"[{source_numbers[source['url']][0]}]" for source in doc["sources"])
        terms = " · ".join(dict.fromkeys(one_line(tag) for tag in doc["tags"]))
        aliases = " · ".join(dict.fromkeys(one_line(alias) for alias in aliases))
        return [
            *(["Temas: " + terms] if terms else []),
            *(["Alias: " + aliases] if aliases else []),
            "",
            evidence,
            "",
            f"Fuentes: {references}",
            "",
        ]

    lines = ["# Guía del Geoparque Manantiales Serranos", ""]
    for section, entries in topics.items():
        lines.extend([f"## {section}", ""])
        for doc in entries:
            lines.extend([f"### {one_line(doc['title'])}", "", *body(doc, doc.get("aliases", []))])

    lines.extend(["## Fichas del atlas", "", f"### {DIRECTORY}", ""])
    for zone, entries in zones.items():
        lines.extend([f"### {zone}", ""])
        for place, doc in entries:
            lines.extend([
                f"#### {one_line(place['name'])}",
                "",
                f"Ficha GMS: {place['id']}",
                f"Ubicación: {zone}",
                f"Estado del atlas: {one_line(place['status'])}",
                f"Condición documentada: {one_line(place['statusRaw'])}",
                f"Resumen: {one_line(place['summary'])}",
                *body(doc, [*place["aliases"], *doc.get("aliases", [])]),
            ])

    lines.extend([f"## {SOURCES}", ""])
    lines.extend(f"[{number}] {title} <{url}>" for url, (number, title) in source_numbers.items())
    return "\n".join(lines) + "\n"

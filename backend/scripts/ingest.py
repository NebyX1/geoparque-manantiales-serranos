"""Deterministic Markdown views for M1; no LLM is used during ingestion."""
import hashlib
import json
import re
import sqlite3
from collections import defaultdict
from pathlib import Path

if __package__:
    from .serrana_corpus import DIRECTORY, QUESTIONS, SOURCES, render
else:
    from serrana_corpus import DIRECTORY, QUESTIONS, SOURCES, render


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "data/knowledge.json"
SOURCE = ROOT / "data/source/Guia_Geoparque_Manantiales_Serranos.md"
OUT = ROOT / "data/generated"
PARSER_VERSION = "serrana-m1-1"


def refs(text):
    return list(dict.fromkeys(int(x) for x in re.findall(r"\[(\d+)\]", text)))


def stable(prefix, text):
    return f"{prefix}_{hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]}"


def parse_blocks(lines):
    blocks, path, current = [], [], None
    def flush(end):
        nonlocal current
        if not current:
            return
        text = "\n".join(current["lines"]).strip()
        if text:
            heading_path = current["heading_path"]
            raw = f"{SOURCE.relative_to(ROOT).as_posix()}:{current['start']}:{end}:{text}"
            blocks.append({
                "block_id": stable("b", raw), "heading_path": heading_path,
                "heading_level": current["level"], "title": current["title"],
                "text": text, "start_line": current["start"], "end_line": end,
                "source_refs": refs(text), "section_type": current["section_type"],
            })
        current = None
    for number, line in enumerate(lines, 1):
        match = re.match(r"^(#{1,6})\s+(.+?)\s*$", line)
        if match:
            flush(number - 1)
            level, title = len(match.group(1)), match.group(2).strip()
            path = path[: level - 1] + [title]
            section_type = "faq" if QUESTIONS in path else "narrative"
            current = {"start": number, "level": level, "title": title, "heading_path": path[:], "lines": [], "section_type": section_type}
        elif current is None:
            current = {"start": number, "level": 0, "title": "", "heading_path": [], "lines": [], "section_type": "preamble"}
        else:
            current["lines"].append(line)
    flush(len(lines))
    return blocks


def make_chunks(blocks, max_chars=1900, overlap=260):
    chunks = []
    for block in blocks:
        text = block["text"]
        if len(text) <= max_chars:
            pieces = [text]
        else:
            pieces, start = [], 0
            while start < len(text):
                end = min(len(text), start + max_chars)
                if end < len(text):
                    cut = text.rfind("\n", start, end)
                    if cut > start + max_chars // 2:
                        end = cut
                pieces.append(text[start:end].strip())
                if end == len(text):
                    break
                start = max(start + 1, end - overlap)
        for index, piece in enumerate(pieces):
            raw = f"{block['block_id']}:{index}:{piece}"
            chunks.append({"chunk_id": stable("c", raw), "block_id": block["block_id"], "entity_id": None,
                           "title": block["title"], "heading_path": block["heading_path"],
                           "start_line": block["start_line"], "end_line": block["end_line"],
                           "source_refs": block["source_refs"], "section_type": block["section_type"], "text": piece})
    return chunks


def parse_catalog(lines):
    start = lines.index(f"### {DIRECTORY}")
    end = lines.index(f"## {SOURCES}", start + 1)
    entries, zone, current = [], "", None
    def flush(end_line):
        nonlocal current
        if not current: return
        text = "\n".join(current["lines"]).strip()
        fields = {"name": current["name"],
                  "categories": [], "zone": current["zone"], "location_text": "", "contacts": [],
                  "description": text, "source_refs": refs(text), "aliases": [],
                  "start_line": current["start"], "end_line": end_line}
        for line in current["lines"]:
            s = line.strip()
            label, _, value = s.partition(":")
            value = value.strip()
            if label == "Ficha GMS":
                fields["place_id"] = int(value)
            elif label == "Ubicación":
                fields["location_text"] = value
            elif label == "Estado del atlas":
                fields["status"] = value
            elif label == "Temas":
                fields["categories"] = [x.strip() for x in value.split("·") if x.strip()]
            elif label == "Alias":
                fields["aliases"] = [x.strip() for x in value.split("·") if x.strip()]
            elif not label and fields.get("categories"):
                break
        if not fields.get("place_id") or not fields.get("status"):
            raise ValueError(f"Ficha incompleta: {fields['name']}.")
        fields["entity_id"] = f"gms_{fields['place_id']:02d}"
        entries.append(fields); current = None
    for i in range(start + 1, end):
        line = lines[i]
        if line.startswith("### "):
            flush(i); zone = line[4:].strip()
        elif line.startswith("#### "):
            flush(i); current = {"name": line[5:].strip(), "zone": zone, "start": i + 1, "lines": []}
        elif current:
            current["lines"].append(line)
    flush(end)
    return entries


def parse_faq(blocks):
    return [{"faq_id": stable("faq", b["title"]), "question": b["title"], "answer": b["text"],
             "start_line": b["start_line"], "end_line": b["end_line"], "source_refs": b["source_refs"]}
            for b in blocks if b["section_type"] == "faq" and b["heading_level"] == 3]


def parse_sources(text):
    _, _, tail = text.partition(f"\n## {SOURCES}\n")
    out = []
    seen = set()
    for line in tail.splitlines():
        if not line.strip():
            continue
        match = re.fullmatch(r"\[(\d+)\]\s+(.+?)\s+<([^<>\s]+)>", line.strip())
        if not match:
            raise ValueError("Una referencia de la guía tiene formato inesperado.")
        number, title, url = match.groups()
        number = int(number)
        if number in seen:
            raise ValueError(f"Referencia duplicada: [{number}].")
        seen.add(number)
        out.append({"source_number": number, "name": title, "title": title, "url": url, "review_date": None})
    return out


def write_jsonl(name, rows):
    (OUT / name).write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows), encoding="utf-8", newline="\n")


def build_sqlite(blocks, chunks, catalog, sources):
    db_path = OUT / "giana.sqlite3"
    staging_db = db_path.with_suffix(".sqlite3.tmp")
    staging_db.unlink(missing_ok=True)
    db = sqlite3.connect(staging_db)
    db.executescript("""
      DROP TABLE IF EXISTS entities; DROP TABLE IF EXISTS entity_categories; DROP TABLE IF EXISTS entity_contacts;
      DROP TABLE IF EXISTS source_blocks; DROP TABLE IF EXISTS sources; DROP TABLE IF EXISTS chunks;
      DROP TABLE IF EXISTS source_fts; DROP TABLE IF EXISTS entity_fts;
      CREATE TABLE entities(entity_id TEXT PRIMARY KEY,name TEXT,zone TEXT,location_text TEXT,description TEXT,status TEXT,start_line INT,end_line INT);
      CREATE TABLE entity_categories(entity_id TEXT,category TEXT); CREATE TABLE entity_contacts(entity_id TEXT,contact TEXT);
      CREATE TABLE source_blocks(block_id TEXT PRIMARY KEY,title TEXT,heading_path TEXT,text TEXT,start_line INT,end_line INT,source_refs TEXT,section_type TEXT);
      CREATE TABLE chunks(chunk_id TEXT PRIMARY KEY,block_id TEXT,title TEXT,text TEXT,start_line INT,end_line INT,source_refs TEXT);
      CREATE TABLE sources(source_number INTEGER PRIMARY KEY,name TEXT,title TEXT,url TEXT,review_date TEXT);
      CREATE VIRTUAL TABLE source_fts USING fts5(block_id UNINDEXED,title,heading_path,text);
      CREATE VIRTUAL TABLE entity_fts USING fts5(entity_id UNINDEXED,name,zone,location_text,description);
    """)
    for b in blocks:
        db.execute("INSERT INTO source_blocks VALUES(?,?,?,?,?,?,?,?)", (b["block_id"], b["title"], " / ".join(b["heading_path"]), b["text"], b["start_line"], b["end_line"], json.dumps(b["source_refs"]), b["section_type"]))
        db.execute("INSERT INTO source_fts VALUES(?,?,?,?)", (b["block_id"], b["title"], " / ".join(b["heading_path"]), b["text"]))
    for c in chunks: db.execute("INSERT INTO chunks VALUES(?,?,?,?,?,?,?)", (c["chunk_id"], c["block_id"], c["title"], c["text"], c["start_line"], c["end_line"], json.dumps(c["source_refs"])))
    for e in catalog:
        db.execute("INSERT INTO entities VALUES(?,?,?,?,?,?,?,?)", tuple(e[k] for k in ["entity_id","name","zone","location_text","description","status","start_line","end_line"]))
        db.execute("INSERT INTO entity_fts VALUES(?,?,?,?,?)", (e["entity_id"], e["name"], e["zone"], e["location_text"], e["description"]))
        for v in e["categories"]: db.execute("INSERT INTO entity_categories VALUES(?,?)", (e["entity_id"], v))
        for v in e["contacts"]: db.execute("INSERT INTO entity_contacts VALUES(?,?)", (e["entity_id"], v))
    for s in sources: db.execute("INSERT INTO sources VALUES(?,?,?,?,?)", tuple(s[k] for k in ["source_number","name","title","url","review_date"]))
    db.commit(); db.close()
    staging_db.replace(db_path)


def main():
    snapshot_text = SNAPSHOT.read_text(encoding="utf-8")
    snapshot = json.loads(snapshot_text)
    text = render(snapshot)
    lines = text.splitlines()
    # The appendix resolves source IDs. It is not itself a searchable document.
    blocks = parse_blocks(lines[:lines.index(f"## {SOURCES}")])
    catalog, sources = parse_catalog(lines), parse_sources(text)
    if (
        len(blocks) != snapshot["manifest"]["total"]
        or {row["place_id"] for row in catalog} != {place["id"] for place in snapshot["places"]}
        or len(catalog) != snapshot["manifest"]["counts"]["place"]
        or len(sources) != snapshot["manifest"]["sources"]
        or {ref for row in blocks for ref in row["source_refs"]} != {row["source_number"] for row in sources}
    ):
        raise ValueError("La ingestión perdió textos, fichas o referencias del Geoparque.")
    chunks = make_chunks(blocks)
    faq = parse_faq(blocks)
    aliases = defaultdict(list)
    for entry in catalog:
        for alias in entry["aliases"]:
            aliases[alias].append(entry["entity_id"])
    SOURCE.parent.mkdir(parents=True, exist_ok=True)
    SOURCE.write_text(text, encoding="utf-8", newline="\n")
    OUT.mkdir(parents=True, exist_ok=True)
    write_jsonl("blocks.jsonl", blocks); write_jsonl("chunks.jsonl", chunks); write_jsonl("catalog.jsonl", catalog); write_jsonl("faq.jsonl", faq); write_jsonl("sources.jsonl", sources)
    (OUT / "aliases.json").write_text(json.dumps(aliases, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    build_sqlite(blocks, chunks, catalog, sources)
    manifest = {"source_path": SOURCE.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(text.encode()).hexdigest(), "catalog_sha256": hashlib.sha256(snapshot_text.encode()).hexdigest(), "reviewed_at": snapshot["manifest"]["reviewedAt"], "parser_version": PARSER_VERSION, "blocks": len(blocks), "chunks": len(chunks), "catalog": len(catalog), "faq": len(faq), "sources": len(sources)}
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(manifest, ensure_ascii=False))


if __name__ == "__main__": main()

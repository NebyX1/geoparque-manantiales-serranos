"""One-time lossless migration helper. Requires beautifulsoup4 and Pillow."""
import base64
import hashlib
import io
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def write(path, content):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def ts(value):
    return json.dumps(value, ensure_ascii=False, indent=2)


source = (ROOT / "Manantiales_Serranos_v2.html").read_text(encoding="utf-8")
soup = BeautifulSoup(source, "html.parser")
data = json.loads(soup.find(id="site-data").string)
assets = json.loads(soup.find(id="site-assets").string)
original_script = soup.find_all("script")[-1].string
write("scripts/reference-runtime.txt", original_script)
manifest = {}
uri_keys = {}
groups = {
    "hero": ["arequita-rio", "aguas", "salus", "parque"],
    "geosites": ["arequita", "cantera", "gruta", "pelado"],
    "culture": ["artigas", "artesania", "gastronomia", "gauchos", "martin"],
    "nature": ["aves", "bosque", "carpincho", "ombues", "puma"],
    "education": ["aprendiendo", "escuela"],
}
for key, uri in assets.items():
    raw = base64.b64decode(uri.split(",", 1)[1])
    extension = uri.split(";", 1)[0].split("/", 1)[1].replace("svg+xml", "svg").replace("jpeg", "jpg")
    if key in ["unesco", "instituciones", "lavalleja"]:
        path = f"public/partners/{key}.{extension}"
    elif key == "map-original":
        path = f"public/downloads/{key}.{extension}"
    else:
        group = next((g for g, keys in groups.items() if key in keys), "landscapes")
        path = f"src/assets/images/{group}/{key}.{extension}"
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(raw)
    try:
        with Image.open(io.BytesIO(raw)) as im:
            width, height = im.size
    except Exception:
        width, height = 500, 300
    manifest[key] = {"path": path, "width": width, "height": height, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
    uri_keys[uri] = key

for image in soup.select("img[src^='data:']"):
    uri = image["src"]
    if uri not in uri_keys:
        raw = base64.b64decode(uri.split(",", 1)[1])
        key = "brand-" + hashlib.sha256(raw).hexdigest()[:12]
        extension = uri.split(";", 1)[0].split("/", 1)[1].replace("svg+xml", "svg")
        path = f"public/brand/{key}.{extension}"
        target = ROOT / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
        manifest[key] = {"path": path, "width": int(image.get("width", 228)), "height": int(image.get("height", 195)), "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
        uri_keys[uri] = key

write("docs/asset-manifest.json", ts(manifest))
imports, entries = [], []
for key, info in manifest.items():
    if info["path"].startswith("src/"):
        symbol = "asset_" + key.replace("-", "_")
        imports.append(f"import {symbol} from '../{info['path'][4:]}';")
        entries.append(f"  {ts(key)}: {symbol},")
    else:
        entries.append(f"  {ts(key)}: {{ src: {ts('/' + info['path'][7:])}, width: {info['width']}, height: {info['height']} }},")
write("src/data/assets.ts", "import type { ImageMetadata } from 'astro';\n" + "\n".join(imports) + "\nexport const assets: Record<string, ImageMetadata | { src: string; width: number; height: number }> = {\n" + "\n".join(entries) + "\n};\n")

featured = [1, 23, 31, 17, 14, 54]
for place in data["places"]:
    place["title"] = place["name"]
    place["description"] = "\n\n".join(b["text"] for b in place["blocks"])
    place["tags"] = place["themes"]
    place["visitStatus"] = place["status"]
    place["access"] = place["statusRaw"]
    place["contacts"] = [place["channel"]] if place.get("channel") else []
    place["images"] = [{"key": place["image"], "alt": "Paisaje de las sierras de Lavalleja" if place["imageContext"] else place["name"]}]
    place["featured"] = place["id"] in featured
    place["internationalValue"] = place["international"]
    place["seo"] = {"title": place["name"] + " · Manantiales Serranos", "description": place["summary"]}
    # Relations are only resolved where the canonical text names a known place.
    place["relationships"] = [p["id"] for p in data["places"] if p["id"] != place["id"] and p["name"].lower() in place["relationsRaw"].lower()]
write("src/data/geosites.ts", "import type { GeoparkPlace } from '../types/geopark';\nexport const places: GeoparkPlace[] = " + ts(data["places"]) + ";\nexport const featuredIds = [1,23,31,17,14,54];\nexport const placeById = new Map(places.map(place => [place.id, place]));\n")
write("src/data/stories.ts", "import type { GeologicalStory } from '../types/geopark';\nexport const articles: Record<string, GeologicalStory> = " + ts(data["articles"]) + ";\n")
write("src/data/circuits.ts", "import type { Circuit } from '../types/geopark';\nexport const circuits: Circuit[] = " + ts(data["routes"]) + ";\n")
write("src/data/geopark.ts", "import { places } from './geosites';\nimport { articles } from './stories';\nimport { circuits } from './circuits';\nexport const gallery = " + ts(data["gallery"]) + ";\nexport const mapPoints = " + ts(data["mapPoints"]) + ";\nexport const geopark = { places, articles, routes: circuits, gallery, mapPoints, version: 1, date: " + ts(data["date"]) + " };\n")
write("src/data/categories.ts", "export const categories = " + ts(sorted({p["category"] for p in data["places"]})) + " as const;\nexport const regions = " + ts(sorted({p["region"] for p in data["places"]})) + " as const;\nexport const visitStatuses = " + ts(sorted({p["status"] for p in data["places"]})) + " as const;\n")

# Replace asset references before splitting the canonical markup into Astro components.
for image in soup.select("img"):
    key = image.get("data-photo") or uri_keys.get(image.get("src"))
    if not key:
        continue
    image.name = "Photo"
    image.attrs.pop("src", None)
    image.attrs.pop("data-photo", None)
    image.attrs.pop("width", None)
    image.attrs.pop("height", None)
    image["assetKey"] = key
    if image.find_parent(id="inicio"):
        image["loading"] = "eager" if key == "arequita-rio" else "lazy"
        image["sizes"] = "(max-width: 900px) 100vw, 75vw"
        if key == "arequita-rio" and image.find_parent(class_="hero-image"):
            image["fetchpriority"] = "high"

for anchor in soup.select("a[href]"):
    href = anchor["href"]
    if href.startswith("#lugar/"):
        anchor["href"] = "/lugares/" + href[7:] + "/"
    elif href.startswith("#historia/"):
        anchor["href"] = "/historias/" + href[10:] + "/"
    elif href.startswith("#circuito/"):
        anchor["href"] = "/circuitos/" + href[10:] + "/"
    elif href.startswith("#") and href not in ["#contenido"]:
        anchor["href"] = "/" + href

def markup(node):
    text = str(node)
    # Astro treats braces as expressions; the static prototype contains no script now.
    text = text.replace("{", "&#123;").replace("}", "&#125;")
    text = re.sub(r"><", ">\n<", text)
    text = re.sub(r'<Photo([^>]*)></Photo>', r'<Photo\1 />', text)
    return text


def component(path, node, imports=""):
    text = markup(node)
    if "<Photo" in text:
        imports = "import Photo from '../brand/Photo.astro';\n" + imports
    write(path, ("---\n" + imports + "---\n" if imports else "") + text + "\n")

component("src/components/decorative/IconSprite.astro", soup.body.find("svg", recursive=False))
component("src/components/layout/Navbar.astro", soup.header)
component("src/components/layout/MobileNavigation.astro", soup.find(id="mobile-menu"))
component("src/components/layout/Footer.astro", soup.footer)

section_names = ["Hero", "Ticker", "TrustStrip", "Introduction", "GeologicalIntroduction", "GeologicalStory", "Atlas", "TerritoryMap", "Nature", "Culture", "Circuits", "Planner", "Education", "Gallery", "Visit"]
for name, node in zip(section_names, soup.main.find_all(recursive=False)):
    if not node.name:
        continue
    component(f"src/components/sections/{name}.astro", node)

dialogs = "\n".join(markup(x) for x in soup.body.find_all("dialog", recursive=False))
write("src/components/layout/Dialogs.astro", dialogs + "\n<div id=\"print-content\" class=\"print-only\"></div>\n")

# Preserve cascade order exactly; each file corresponds to a canonical CSS block.
css = "\n".join(x.string or "" for x in soup.find_all("style"))
lines = css.splitlines()
segments = [
    ("foundation", 0, 6), ("hero-base", 6, 10), ("atlas-base", 10, 14),
    ("map-base", 14, 16), ("editorial-base", 16, 28), ("dialogs-base", 28, 32),
    ("responsive-base", 32, 50), ("identity", 50, 53), ("hero", 53, 57),
    ("geological-story", 57, 59), ("editorial", 59, 61), ("dialogs", 61, 62),
    ("responsive", 62, 74), ("layout-fit", 74, len(lines)),
]
for name, start, end in segments:
    write(f"src/styles/{name}.css", "\n".join(lines[start:end]) + "\n")
write("src/styles/geopark.css", "\n".join(f"@import './{name}.css';" for name, _, _ in segments) + "\n")
print(f"Extracted {len(manifest)} unique assets; {len(data['places'])} places; {len(section_names)} sections.")

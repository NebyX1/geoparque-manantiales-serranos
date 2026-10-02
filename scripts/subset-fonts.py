"""Regenerate local font subsets; run after npm ci with fonttools and brotli installed."""
from pathlib import Path
from string import printable
import hashlib
import json
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
characters = set(printable + 'áéíóúüñÁÉÍÓÚÜÑ¿¡°²³€©®')
for path in (root / 'src').rglob('*'):
    if path.suffix in {'.astro', '.ts', '.tsx', '.js', '.css'}:
        characters.update(path.read_text(encoding='utf8'))
target = root / 'src/assets/fonts'
target.mkdir(parents=True, exist_ok=True)
fonts = [(f'@fontsource/barlow-condensed/files/barlow-condensed-latin-{weight}-normal.woff2', f'barlow-{weight}.woff2') for weight in (500, 600, 700, 800)]
fonts.append(('@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2', 'montserrat-variable.woff2'))
manifest = []
for source, name in fonts:
    original = root / 'node_modules' / source
    font = TTFont(original, recalcTimestamp=False)
    options = subset.Options()
    options.flavor = 'woff2'
    options.hinting = True
    options.name_IDs = ['*']
    options.name_languages = ['*']
    sub = subset.Subsetter(options=options)
    sub.populate(text=''.join(sorted(characters)))
    sub.subset(font)
    font.flavor = 'woff2'
    output = target / name
    font.save(output)
    # Confirm every requested character supported by the source remains available.
    before = TTFont(original).getBestCmap()
    after = TTFont(output).getBestCmap()
    assert set(before).intersection(map(ord, characters)) <= set(after)
    manifest.append({'path': output.relative_to(root).as_posix(), 'source': source, 'originalBytes': original.stat().st_size, 'bytes': output.stat().st_size, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest()})
(root / 'docs/fonts-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf8')
print(json.dumps({'originalBytes': sum(f['originalBytes'] for f in manifest), 'bytes': sum(f['bytes'] for f in manifest)}))

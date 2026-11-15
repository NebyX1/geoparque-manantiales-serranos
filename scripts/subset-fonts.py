"""Create the site's variable WOFF2 from the supplied Acumin OTF."""
from pathlib import Path
import hashlib
import json
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
source = root / 'fonts/AcuminVariableConcept.otf'
output = root / 'src/assets/fonts/acumin-variable.woff2'
font = TTFont(source, recalcTimestamp=False)
characters = set(font.getBestCmap())
axes = [axis.__dict__ for axis in font['fvar'].axes]

# Keep every encoded character. Drop unused outlines while preserving shaping and variations.
options = subset.Options()
options.name_IDs = ['*']
options.name_languages = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=sorted(characters))
subsetter.subset(font)
font.flavor = 'woff2'
font.save(output)

web_font = TTFont(output)
assert characters == set(web_font.getBestCmap())
assert axes == [axis.__dict__ for axis in web_font['fvar'].axes]
manifest = [{
    'path': output.relative_to(root).as_posix(),
    'source': source.relative_to(root).as_posix(),
    'originalBytes': source.stat().st_size,
    'originalSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'bytes': output.stat().st_size,
    'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
}]
(root / 'docs/fonts-manifest.json').write_text(
    json.dumps(manifest, indent=2) + '\n', encoding='utf8', newline='\n'
)
print(f'{output.name}: {output.stat().st_size} bytes')

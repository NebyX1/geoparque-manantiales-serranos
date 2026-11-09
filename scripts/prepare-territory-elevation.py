"""Regenerate the geopark's offline regional elevation snapshot from public Terrarium tiles.

Run from the repository root: python scripts/prepare-territory-elevation.py
The RGB channels encode elevation, so decoding precedes interpolation.
"""
from __future__ import annotations

import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from elevation_utils import sample_grid

ROOT = Path(__file__).resolve().parents[1]
snapshot = json.loads((ROOT / 'src/data/geography/boundary-path.json').read_text(encoding='utf-8'))
bounds = snapshot['bounds']
width_meters = (bounds['maxX'] - bounds['minX']) * 400
depth_meters = (bounds['maxZ'] - bounds['minZ']) * 400
result = sample_grid(
    -34.359205175,
    -55.13268945,
    width_meters,
    depth_meters,
    grid=128,
    z=10,
    cache_dir=ROOT / 'reports/experience-review/elevation/tiles',
)

def source_headers(tile):
    """Older cached PNGs may predate the attribution-header sidecar."""
    if 'imagerySources' not in tile:
        request = urllib.request.Request(tile['url'], method='HEAD', headers={
            'User-Agent': 'Geoparque-reference-research/1.0',
        })
        with urllib.request.urlopen(request, timeout=30) as response:
            tile['imagerySources'] = response.headers.get('X-Imagery-Sources')
            tile['lastModified'] = response.headers.get('Last-Modified')
        parts = tile['url'].split('/')
        filename = f"{parts[-3]}-{parts[-2]}-{parts[-1][:-4]}.json"
        sidecar = ROOT / 'reports/experience-review/elevation/tiles' / filename
        sidecar.write_text(json.dumps({
            'imagerySources': tile['imagerySources'], 'lastModified': tile['lastModified'],
        }), encoding='utf-8')
    return tile

result['source']['tiles'] = list(ThreadPoolExecutor(max_workers=8).map(
    source_headers, result['source']['tiles'],
))
result['sceneBounds'] = bounds
result['horizontalMetersPerUnit'] = 400
result['verticalExaggeration'] = 6
result['boundarySourceSha256'] = snapshot['sourceSha256']
result['heights'] = [round(height, 1) for height in result['heights']]
output = ROOT / 'src/data/geography/territory-elevation.json'
output.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
print(json.dumps({
    'output': str(output), 'grid': result['grid'], 'tiles': len(result['source']['tiles']),
    'minimumMeters': result['minimum'], 'maximumMeters': result['maximum'],
    'verticalExaggeration': result['verticalExaggeration'], 'bytes': output.stat().st_size,
}, indent=2))

"""Offline Mapzen Terrarium decoding; never resize RGB-encoded height tiles.

Data format and attribution: tilezen/joerd docs/formats.md, docs/attribution.md.
Rows are north to south and columns west to east. Distances use the project's
local equirectangular projection. Output records source tile hashes for review.
"""
from __future__ import annotations
import hashlib
import io
import json
import math
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image

BASE_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium'
METERS_PER_DEGREE = 111195.0

def _pixel(longitude: float, latitude: float, zoom: int):
    n = 256 * 2**zoom
    phi = math.radians(latitude)
    return (longitude + 180) / 360 * n, (1 - math.asinh(math.tan(phi)) / math.pi) / 2 * n

def sample_grid(latitude: float, longitude: float, width_m: float, depth_m: float,
                grid: int = 65, z: int = 14,
                cache_dir: str | Path = 'reports/experience-review/elevation/tiles'):
    if not (2 <= grid <= 512 and 0 <= z <= 15):
        raise ValueError('Invalid grid or zoom')
    cache = Path(cache_dir)
    cache.mkdir(parents=True, exist_ok=True)
    lon_m = METERS_PER_DEGREE * math.cos(math.radians(latitude))
    west = longitude - width_m / 2 / lon_m
    east = longitude + width_m / 2 / lon_m
    north = latitude + depth_m / 2 / METERS_PER_DEGREE
    south = latitude - depth_m / 2 / METERS_PER_DEGREE
    positions = []
    keys = set()
    for row in range(grid):
        lat = north + (south - north) * row / (grid - 1)
        for col in range(grid):
            lon = west + (east - west) * col / (grid - 1)
            px, py = _pixel(lon, lat, z)
            ix, iy = math.floor(px), math.floor(py)
            positions.append((px, py))
            for dx,dy in ((0,0),(1,0),(0,1),(1,1)):
                keys.add(((ix + dx)//256, (iy + dy)//256))
    def load(key):
        x,y = key
        path = cache / f'{z}-{x}-{y}.png'
        url = f'{BASE_URL}/{z}/{x}/{y}.png'
        meta_path = path.with_suffix('.json')
        headers = {}
        if path.exists():
            data = path.read_bytes()
            if meta_path.exists(): headers = json.loads(meta_path.read_text(encoding='utf-8'))
        else:
            request = urllib.request.Request(url, headers={'User-Agent':'Geoparque-reference-research/1.0'})
            with urllib.request.urlopen(request, timeout=45) as response:
                data = response.read()
                headers = {'imagerySources': response.headers.get('X-Imagery-Sources'), 'lastModified': response.headers.get('Last-Modified')}
            path.write_bytes(data)
            meta_path.write_text(json.dumps(headers), encoding='utf-8')
        im = Image.open(io.BytesIO(data)).convert('RGB')
        if im.size != (256,256):
            raise ValueError(f'Unexpected elevation tile dimensions: {im.size}')
        return key, im, {'url':url,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data), **headers}
    loaded = list(ThreadPoolExecutor(max_workers=8).map(load, sorted(keys)))
    images = {key:im for key,im,_meta in loaded}
    def value(x,y):
        r,g,b = images[(x//256,y//256)].getpixel((x%256,y%256))
        return r*256 + g + b/256 - 32768
    heights=[]
    for px,py in positions:
        ix,iy = math.floor(px),math.floor(py)
        fx,fy = px-ix,py-iy
        a=value(ix,iy)*(1-fx)+value(ix+1,iy)*fx
        b=value(ix,iy+1)*(1-fx)+value(ix+1,iy+1)*fx
        heights.append(round(a*(1-fy)+b*fy,3))
    for im in images.values():im.close()
    return {'center':{'latitude':latitude,'longitude':longitude}, 'widthMeters':width_m,
            'depthMeters':depth_m, 'grid':grid, 'zoom':z, 'rows':'north-to-south',
            'columns':'west-to-east', 'minimum':min(heights),'maximum':max(heights),
            'heights':heights, 'source':{'provider':'Mapzen / Tilezen Terrain Tiles',
            'format':'Terrarium: R*256 + G + B/256 - 32768 meters',
            'formatUrl':'https://github.com/tilezen/joerd/blob/master/docs/formats.md',
            'attributionUrl':'https://github.com/tilezen/joerd/blob/master/docs/attribution.md',
            'credit':'Mapzen / Tilezen and applicable upstream contributors identified in tile imagerySources headers; see attributionUrl',
            'retrievedAt':'2026-11-08','tiles':[meta for _key,_im,meta in loaded]},
            'precisionNote':'Resampled public global elevation data, not a local survey. Encoded fractions are not vertical accuracy. Buildings, vegetation and later quarry changes are not resolved reliably.'}

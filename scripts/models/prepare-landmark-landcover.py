"""Reproducible coarse cover classification from public IDE orthophotography.

This is a visual aid, not a vegetation inventory, a species classifier or field survey.
"""
from pathlib import Path
from urllib.parse import urlencode
import concurrent.futures
import hashlib
import json
import math
import requests
from PIL import Image, ImageDraw

ROOT = Path.cwd()
OUT = ROOT / 'reports/experience-review/next-quality/gap-research/landcover'
OUT.mkdir(parents=True, exist_ok=True)
DEM = json.loads((ROOT / 'src/features/experience/miniatures/rebuilt/terrain-samples.json').read_text(encoding='utf-8'))
IDS = [3, 6, 7, 8, 12, 15, 21, 57]
GRID = 32
SIZE = 1024


def acquire(site_id):
    sample = DEM[str(site_id)]
    lat, lon = sample['center']['latitude'], sample['center']['longitude']
    dy = sample['depthMeters'] / 2 / 111320
    dx = sample['widthMeters'] / 2 / (111320 * math.cos(math.radians(lat)))
    bbox = [lon - dx, lat - dy, lon + dx, lat + dy]
    url = 'https://mapas.ide.uy/geoserver-raster/ows?' + urlencode(dict(
        service='WMS', version='1.1.1', request='GetMap', layers='ortofotos:ortofoto_nacional',
        styles='', srs='EPSG:4326', bbox=','.join(map(str, bbox)), width=SIZE, height=SIZE,
        format='image/png', transparent='false',
    ))
    target = OUT / f'{site_id:02d}-exact-dem-ortho.png'
    if not target.exists():
        response = requests.get(url, timeout=45)
        response.raise_for_status()
        if not response.content.startswith(b'\x89PNG'):
            raise ValueError(f'IDE did not return PNG for {site_id}')
        target.write_bytes(response.content)
    return site_id, target, url, bbox


def components(cells, kind, local_width, local_depth, weights):
    unseen = {i for i, value in enumerate(cells) if value == kind}
    results = []
    while unseen:
        start = min(unseen)
        unseen.remove(start)
        stack, region = [start], []
        while stack:
            idx = stack.pop()
            region.append(idx)
            col, row = idx % GRID, idx // GRID
            for dc, dr in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                cc, rr = col + dc, row + dr
                neighbor = rr * GRID + cc
                if 0 <= cc < GRID and 0 <= rr < GRID and neighbor in unseen:
                    unseen.remove(neighbor)
                    stack.append(neighbor)
        total = sum(weights[i] for i in region)
        cx = sum(((i % GRID + .5) / GRID - .5) * local_width * weights[i] for i in region) / total
        cz = sum(((i // GRID + .5) / GRID - .5) * local_depth * weights[i] for i in region) / total
        cols, rows = [i % GRID for i in region], [i // GRID for i in region]
        results.append(dict(x=round(cx, 4), z=round(cz, 4), areaCells=len(region),
                            width=round((max(cols) - min(cols) + 1) / GRID * local_width, 4),
                            depth=round((max(rows) - min(rows) + 1) / GRID * local_depth, 4)))
    return sorted(results, key=lambda x: -x['areaCells'])


def classify(record):
    site_id, target, url, bbox = record
    sample = DEM[str(site_id)]
    im = Image.open(target).convert('RGB')
    histogram = im.convert('L').histogram()
    total, overall = sum(histogram), sum(i * n for i, n in enumerate(histogram))
    count = cumulative = 0
    best = (-1, 0)
    for threshold, n in enumerate(histogram):
        count += n
        cumulative += threshold * n
        if not count or count == total:
            continue
        variance = count * (total - count) * (cumulative / count - (overall - cumulative) / (total - count)) ** 2
        if variance > best[0]:
            best = (variance, threshold)
    # The open grassland at Campanero dominates its histogram: its raw Otsu
    # threshold89 wrongly includes grass. Cap65 was checked against the two
    # actual wooded blocks in the source image; do not turn the entire hill into forest.
    forest_luminance = min(best[1], 65) if site_id == 15 else best[1]
    forest = [0] * (GRID * GRID)
    rock = [0] * (GRID * GRID)
    luminance_sum = [0.] * (GRID * GRID)
    luminance_square = [0.] * (GRID * GRID)
    # Work on original RGB pixels, never RGB imagery resampled across class edges.
    for y in range(SIZE):
        for x in range(SIZE):
            r, g, b = im.getpixel((x, y))
            lum = .2126 * r + .7152 * g + .0722 * b
            index = (y // 32) * GRID + x // 32
            luminance_sum[index] += lum
            luminance_square[index] += lum * lum
            if lum < forest_luminance and g >= r * .96 and g >= b * .83:
                forest[index] += 1
            elif (lum > 105 and b >= g * .71 and r <= g * 1.18 and g <= r * 1.18
                  and max(r, g, b) - min(r, g, b) < 66 and (2 * g - r - b) / max(1, r + g + b) < .115):
                rock[index] += 1
    ff = [round(n / 1024, 3) for n in forest]
    rf = [round(n / 1024, 3) for n in rock]
    texture = [math.sqrt(max(0, q / 1024 - (s / 1024) ** 2)) for s, q in zip(luminance_sum, luminance_square)]
    cells = [2 if r >= .16 and f < .65 else 1 if f >= .42 and t >= 4.5 else 2 if r >= .08 else 0
             for f, r, t in zip(ff, rf, texture)]
    local_width = 12
    local_depth = sample['depthMeters'] / sample['widthMeters'] * local_width
    colors = [(190, 183, 126), (32, 102, 59), (202, 176, 171)]
    mask = Image.new('RGB', (GRID, GRID))
    mask.putdata([colors[k] for k in cells])
    expanded = mask.resize((SIZE, SIZE), Image.Resampling.NEAREST)
    overlay = Image.blend(im, expanded, .42)
    sheet = Image.new('RGB', (1024, 550), 'white')
    sheet.paste(im.resize((512, 512)), (0, 32))
    sheet.paste(overlay.resize((512, 512)), (512, 32))
    draw = ImageDraw.Draw(sheet)
    draw.text((12, 8), f'GMS {site_id:02d}: original IDE 2017-2018 | coarse mask: field / dark green canopy / pale rock', fill='black')
    sheet.save(OUT / f'{site_id:02d}-classification-review.jpg', quality=90)
    mask.save(OUT / f'{site_id:02d}-classes32.png')
    result = dict(grid=GRID, center=sample['center'], widthMeters=sample['widthMeters'], depthMeters=sample['depthMeters'],
                  localWidth=local_width, localDepth=round(local_depth, 6), rows='north-to-south', columns='west-to-east',
                  classes=['field', 'forest', 'rock'], cells=cells, forestFraction=ff, rockFraction=rf,
                  cellCounts={label: cells.count(i) for i, label in enumerate(['field', 'forest', 'rock'])},
                  centroids=dict(forest=components(cells, 1, local_width, local_depth, ff),
                                 rock=components(cells, 2, local_width, local_depth, rf)),
                  source=dict(provider='IDE Uruguay / AGESIC', layer='ortofotos:ortofoto_nacional',
                              metadataUrl='https://catalogodatos.gub.uy/dataset/ide-ortoimagen-mdt-de-cobertura-nacional',
                              license='Licencia de Datos Abiertos Uruguay', survey='2017-2018', retrievedAt='2026-11-08',
                              url=url, bboxLonLat=bbox, sha256=hashlib.sha256(target.read_bytes()).hexdigest(),
                              thresholds=dict(forestLuminanceMax=forest_luminance, forestThresholdMethod='per-image Otsu on grey histogram',
                                              forestCellLuminanceStdMin=4.5, forestCellFractionMin=.42, rockLuminanceMin=105,
                                              rockCellFractionMin=.08, rockBlueGreenMin=.71,
                                              rockRelativeGreenExcessMax=.115,
                                              manualForestThresholdCap=65 if site_id == 15 else None),
                              limits=['Coarse RGB appearance classification calibrated visually; not a surveyed land-cover product.',
                                      'Forest means dark canopy appearance, including plantations; species and native status are not inferred.',
                                      'Shadows, water and dark soil can resemble canopy; roads, buildings and dry grass can resemble pale rock.',
                                      'Grid fractions preserve evidence of mixed cells; field is the unclassified remainder, not a verified agricultural use.',
                                      'Cell centroids and bounds are geometric summaries. Connected regions can have holes; do not replace them by a filled ellipse.',
                                      'Positions cover exactly the numerical DEM crop. Cell centers use x=(column+.5)/32*12-6 and z=(row+.5)/32*localDepth-localDepth/2.',
                                      'No orthophoto texture is shipped to the renderer; only labels/fractions and source provenance.']))
    print(site_id, result['cellCounts'], flush=True)
    return str(site_id), result


if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(acquire, IDS))
    output = dict(classify(record) for record in records)
    target = ROOT / 'src/features/experience/miniatures/rebuilt/landcover-samples.json'
    target.write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    (OUT / 'landcover-provenance.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

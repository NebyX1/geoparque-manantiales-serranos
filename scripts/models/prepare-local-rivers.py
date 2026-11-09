"""Clip already downloaded official IDE centerlines into local miniature space."""
import json
import math
import numpy as np
from pathlib import Path
from shapely.geometry import LineString, box, mapping
from shapely.ops import unary_union

routes=json.loads(Path('src/data/geography/territory-routes.json').read_text(encoding='utf-8'))
samples=json.loads(Path('src/features/experience/miniatures/rebuilt/terrain-samples.json').read_text(encoding='utf-8'))
records={}
for site_id in [7,57]:
    sample=samples[str(site_id)]
    center=sample['center']
    wx=(center['longitude']+55.13268945)*111195*math.cos(math.radians(-34.359205175))/400
    wz=-(center['latitude']+34.359205175)*111195/400
    scale=400/sample['widthMeters']*12
    depth=sample['depthMeters']/sample['widthMeters']*12
    crop=box(-6,-depth/2,6,depth/2)
    lines=[]
    sources=[]
    for river in routes['waterways']:
        line=LineString([((p['x']-wx)*scale,(p['z']-wz)*scale) for p in river['points']])
        local=line.intersection(crop)
        if local.is_empty:continue
        lines.append(local.buffer(0.075,quad_segs=5,cap_style='flat',join_style='round'))
        sources.append({'name':river['name'],'sourceId':river['sourceId']})
    if not lines:
        print('NO_MAPPED_RIVER',site_id)
        continue
    water=unary_union(lines).intersection(crop)
    polygons=[water] if water.geom_type=='Polygon' else list(water.geoms)
    records[str(site_id)]={'polygons':[{'outer':[[round(x,5),round(z,5)] for x,z in p.exterior.coords],'holes':[[[round(x,5),round(z,5)] for x,z in ring.coords] for ring in p.interiors]} for p in polygons],'sources':sources,'source':routes['source'],'widthNote':'15 to 17 m display width interpreted as small-channel landscape detail, not a water-edge survey.'}
    def elevation(x,z):
        grid=sample['grid'];heights=sample['heights']
        fx=max(0,min(grid-1,(x/12+0.5)*(grid-1)))
        fz=max(0,min(grid-1,(z/depth+0.5)*(grid-1)))
        ix=min(grid-2,int(fx));iz=min(grid-2,int(fz));tx=fx-ix;tz=fz-iz
        a=heights[iz*grid+ix]*(1-tx)+heights[iz*grid+ix+1]*tx
        b=heights[(iz+1)*grid+ix]*(1-tx)+heights[(iz+1)*grid+ix+1]*tx
        return (a*(1-tz)+b*tz-sample['minimum'])*12/sample['widthMeters']*1.55+0.16
    points=[point for polygon in records[str(site_id)]['polygons'] for point in polygon['outer']]
    coefficients=np.linalg.lstsq(np.array([[x,z,1] for x,z in points]),np.array([elevation(x,z) for x,z in points]),rcond=None)[0]
    records[str(site_id)]['plane']=[round(float(value),7) for value in coefficients]
    records[str(site_id)]['planeNote']='Linear display grade fitted to coarse DEM along documented centerline footprint; not surveyed water level or hydraulic model.'
    print(site_id,len(polygons),sources)
Path('src/features/experience/miniatures/rebuilt/local-rivers.json').write_text(json.dumps(records,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')

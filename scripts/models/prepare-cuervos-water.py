"""Offline polygon buffer of ODbL river geometry (requires Shapely 2.x)."""
import json
import math
import sys
from pathlib import Path
from shapely.geometry import LineString, Point, box
from shapely.ops import unary_union
from shapely import affinity

path=Path('src/features/experience/miniatures/rebuilt/cuervos-river.json')
record=json.loads(path.read_text(encoding='utf-8'))
shapes=[LineString(p['points']).buffer(0.25,quad_segs=7,join_style='round',cap_style='flat') for p in record['paths']]
# A modest remanso at the photographed central river bend; width is interpretive.
line=LineString(record['paths'][0]['points'])
distance=line.project(Point(0.69,-0.30));pool=line.interpolate(distance)
a=line.interpolate(max(0,distance-.3));b=line.interpolate(min(line.length,distance+.3));angle=math.degrees(math.atan2(b.y-a.y,b.x-a.x))
pool_shape=affinity.scale(Point(0,0).buffer(1,quad_segs=16),xfact=.9,yfact=.48)
pool_shape=affinity.translate(affinity.rotate(pool_shape,angle,origin=(0,0)),xoff=pool.x,yoff=pool.y)
shapes.append(pool_shape)
water=unary_union(shapes).intersection(box(-6,-5.53846,6,5.53846))
polygons=[water] if water.geom_type=='Polygon' else list(water.geoms)
record['waterPolygons']=[{'outer':[[round(x,5),round(z,5)] for x,z in p.exterior.coords], 'holes':[[[round(x,5),round(z,5)] for x,z in r.coords] for r in p.interiors]} for p in polygons]
land=box(-6,-5.53846,6,5.53846).difference(water)
parts=[land]if land.geom_type=='Polygon'else list(land.geoms)
record['landPolygons']=[{'outer':[[round(x,5),round(z,5)] for x,z in p.exterior.coords], 'holes':[[[round(x,5),round(z,5)] for x,z in r.coords]for r in p.interiors]}for p in parts]
record['processing']='Shapely planar buffer/union of projected OSM river, photographic remanso, and exact complementary land polygons. Width/depth are visual approximations, not surveyed.'
from PIL import Image
photo=Path('reports/experience-review/next-quality/references/52-ortho.png')
if photo.exists():
 image=Image.open(photo).convert('RGB');grid=32;cells=[]
 for row in range(grid):
  for col in range(grid):
   tile=image.crop((col*image.width//grid,row*image.height//grid,(col+1)*image.width//grid,(row+1)*image.height//grid))
   pixels=list(tile.getdata());forest=sum(g-r>5 and g>b*1.05 and (r+g+b)/3<92 for r,g,b in pixels)/len(pixels)
   rock=sum(105<(r+g+b)/3<205 and max(r,g,b)-min(r,g,b)<38 for r,g,b in pixels)/len(pixels)
   cells.append(1 if forest>.44 else 2 if rock>.22 else 0)
 record['landcover']={'grid':grid,'cells':cells,'source':'IDE national orthophoto2017–2018','sourceUrl':json.loads(photo.with_suffix('.json').read_text())['url'],'note':'Approximate coverage classification, not individual trees or rock surveys.'}
path.write_text(json.dumps(record,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print('VALID_WATER_POLYGON',water.is_valid,len(polygons),sum(len(p['outer']) for p in record['waterPolygons']))

"""Project and clip public IDE Uruguay route/watercourse vectors for the game.

Uses the saved source GeoJSON in reports/experience-review/geography/routes.
The adjacent *-url.txt files contain reproducible WFS URLs. No runtime requests.
"""
from __future__ import annotations
import hashlib
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'reports/experience-review/geography/routes'
BOUNDARY = json.loads((ROOT / 'src/data/geography/boundary-path.json').read_text(encoding='utf-8'))
RING = [tuple(map(float, point)) for point in re.findall(r'[ML](-?[\d.]+)\s+(-?[\d.]+)', BOUNDARY['path'])]
if RING[0] == RING[-1]: RING.pop()
TOLERANCE = 20 / 400

def project(point):
    lon, lat = point[:2]
    return ((lon + 55.13268945) * 111195 * math.cos(math.radians(-34.359205175)) / 400,
            -(lat + 34.359205175) * 111195 / 400)

def inside(point):
    x,z = point
    if not (-95.991041 <= x <= 95.991041 and -76.879072 <= z <= 76.879072): return False
    result=False
    for i,a in enumerate(RING):
        b=RING[(i+1)%len(RING)]
        if (a[1]>z)!=(b[1]>z) and x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]: result=not result
    return result

def distance_squared(point,a,b):
    dx,dz=b[0]-a[0],b[1]-a[1]
    length=dx*dx+dz*dz
    t=max(0,min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dz)/length)) if length else 0
    return (point[0]-a[0]-t*dx)**2+(point[1]-a[1]-t*dz)**2

def simplify(points):
    keep={0,len(points)-1};pending=[(0,len(points)-1)]
    while pending:
        start,end=pending.pop()
        best=TOLERANCE*TOLERANCE;selected=None
        for i in range(start+1,end):
            distance=distance_squared(points[i],points[start],points[end])
            if distance>best:best=distance;selected=i
        if selected is not None:
            keep.add(selected);pending.extend([(start,selected),(selected,end)])
    return [points[i]for i in sorted(keep)]

def clip(points):
    parts=[];current=[]
    for a,b in zip(points,points[1:]):
        dx,dz=b[0]-a[0],b[1]-a[1]
        cuts=[0.0,1.0]
        for i,c in enumerate(RING):
            d=RING[(i+1)%len(RING)]
            ex,ez=d[0]-c[0],d[1]-c[1]
            denominator=dx*ez-dz*ex
            if abs(denominator)<1e-14:continue
            ax,az=c[0]-a[0],c[1]-a[1]
            t=(ax*ez-az*ex)/denominator
            u=(ax*dz-az*dx)/denominator
            if 0<t<1 and 0<=u<=1:cuts.append(t)
        cuts=sorted(set(cuts))
        for left,right in zip(cuts,cuts[1:]):
            middle=(left+right)/2
            if inside((a[0]+dx*middle,a[1]+dz*middle)):
                start=(a[0]+dx*left,a[1]+dz*left)
                end=(a[0]+dx*right,a[1]+dz*right)
                if current and math.dist(current[-1],start)>1e-5:
                    if len(current)>1:parts.append(current)
                    current=[]
                if not current:current.append(start)
                current.append(end)
            else:
                if len(current)>1:parts.append(current)
                current=[]
    if len(current)>1:parts.append(current)
    return parts

result={'waterways':[],'roads':[],'source':{
    'provider':'IDE Uruguay / AGESIC; ejes viales nacionales y cartografía de hidrografía',
    'license':'Licencia de Datos Abiertos Uruguay',
    'retrievedAt':'2026-11-08',
    'horizontalMetersPerUnit':400,'simplificationMeters':20,
    'boundarySourceSha256':BOUNDARY['sourceSha256'],
    'layers':[],
    'note':'Centerline positions are geographic. Displayed widths and vertical offsets are scenic; not navigation or permission to travel.'
}}
stats={'originalVertices':0,'simplifiedVertices':0,'clippedVertices':0,'selectedFeatures':{}}
for kind in ['waterways','roads']:
    path=SOURCE/f'ide-{kind}-original.geojson'
    raw=path.read_bytes();data=json.loads(raw)
    result['source']['layers'].append({
        'kind':kind,
        'url':(SOURCE/f'ide-{kind}-url.txt').read_text(encoding='utf-8'),
        'sha256':hashlib.sha256(raw).hexdigest(),
        'featuresDownloaded':len(data['features']),
        'metadataUrl':'https://visualizador.ide.uy/geonetwork/static/api/records/'+('74408873-0bb7-4fde-8146-512493f0a11b' if kind=='waterways' else '529ae824-1b11-434d-92fd-7a6205a573c6'),
    })
    selected=0
    for feature in data['features']:
        props=feature['properties']
        route_number=props.get('ruta_num')
        if kind=='roads' and route_number is None:
            named_route=re.match(r'^RUTA\s+(8|12|60|81)\b',props.get('via_nombre',''),re.IGNORECASE)
            if named_route:route_number=int(named_route.group(1))
        if kind=='roads' and route_number not in [8,12,60,81]:continue
        selected+=1
        geometry=feature['geometry']
        lines=geometry['coordinates']if geometry['type']=='MultiLineString'else[geometry['coordinates']]
        for line in lines:
            if len(line)<2:continue
            projected=[project(point)for point in line]
            simple=simplify(projected)
            stats['originalVertices']+=len(projected);stats['simplifiedVertices']+=len(simple)
            for part in clip(simple):
                if len(part)<2 or sum(math.dist(a,b)for a,b in zip(part,part[1:]))<0.025:continue
                points=[{'x':round(p[0],6),'z':round(p[1],6)}for p in part]
                result[kind].append({'name':props.get('nombre')or props.get('via_nombre'),
                    'sourceId':feature['id'],'points':points,**({'ref':str(route_number)}if kind=='roads'else{})})
                stats['clippedVertices']+=len(points)
    stats['selectedFeatures'][kind]=selected
def join_continuous(lines,kind):
    groups={}
    for line in lines:groups.setdefault(line.get('ref')if kind=='roads'else line['name'],[]).append(line)
    merged=[]
    for group in groups.values():
        for line in group:line['sourceIds']=[line['sourceId']]
        changed=True
        while changed:
            changed=False;ends={}
            for index,line in enumerate(group):
                for side in [0,-1]:
                    p=line['points'][side];ends.setdefault((p['x'],p['z']),[]).append((index,side))
            for matches in ends.values():
                if len(matches)!=2 or matches[0][0]==matches[1][0]:continue
                (i,a),(j,b)=matches
                first=group[i];second=group[j]
                first_points=first['points']if a==-1 else list(reversed(first['points']))
                second_points=second['points']if b==0 else list(reversed(second['points']))
                combined={**first,'points':first_points+second_points[1:],'sourceIds':sorted(set(first['sourceIds']+second['sourceIds']))}
                group=[line for index,line in enumerate(group)if index not in [i,j]]+[combined]
                changed=True;break
        merged.extend(group)
    return merged

result['waterways']=join_continuous(result['waterways'],'waterways')
result['roads']=join_continuous(result['roads'],'roads')
stats['clippedVertices']=sum(len(line['points'])for kind in ['waterways','roads']for line in result[kind])
if stats['clippedVertices']>20000:raise ValueError('Route snapshot exceeds vertex budget')
result['statistics']=stats
output=ROOT/'src/data/geography/territory-routes.json'
output.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
(SOURCE/'processing-statistics.json').write_text(json.dumps(stats,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'output':str(output),'waterways':len(result['waterways']),'roads':len(result['roads']),**stats},indent=2))

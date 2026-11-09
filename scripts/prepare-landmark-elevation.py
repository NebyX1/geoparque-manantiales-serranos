"""Prepare local numerical terrain samples for small landmark dioramas."""
import json
from pathlib import Path
from elevation_utils import sample_grid

records = json.loads(Path('src/data/geography/locations.json').read_text(encoding='utf-8'))
# Bounds are reference crop sizes, never coordinates of an invented access.
crops = {2:(1200,1100),5:(400,400),6:(2200,1800),52:(1300,1200),57:(900,900),58:(900,900),59:(600,600),3:(1400,1200),4:(1400,1400),7:(1300,1300),8:(2800,2200),12:(850,850),13:(1000,1000),15:(3200,2800),18:(900,900),19:(1400,1400),20:(800,800),21:(2600,2400),25:(1400,1400),32:(1600,1600),34:(1800,1800),56:(1600,1400)}
output={}
for record in records:
    site_id=record['id']
    if site_id not in crops:continue
    width,depth=crops[site_id]
    output[str(site_id)]=sample_grid(record['latitude'],record['longitude'],width,depth,grid=65,z=14)
    print(site_id,output[str(site_id)]['minimum'],output[str(site_id)]['maximum'],flush=True)
Path('src/features/experience/miniatures/rebuilt').mkdir(parents=True,exist_ok=True)
Path('src/features/experience/miniatures/rebuilt/terrain-samples.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
Path('reports/experience-review/rebuild-reference/terrain-samples-provenance.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

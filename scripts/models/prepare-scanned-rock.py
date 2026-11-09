"""Reduce a CC0 Poly Haven scan and sample its own CC0 texture into vertex colors.

Original asset: Dario Barresi / Poly Haven, rock_face_01, CC0.
This generic fracture base is not a scan of a Lavalleja geosite.
"""
import bpy
import json
from pathlib import Path
from mathutils import Vector

root=Path.cwd()
source=root/'reports/experience-review/rebuild-reference/polyhaven-rock-face'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(source/'rock_face_01.gltf'))
obj=next(o for o in bpy.context.scene.objects if o.type=='MESH')
bpy.context.view_layer.objects.active=obj
obj.select_set(True)
modifier=obj.modifiers.new('Offline mobile fracture reduction','DECIMATE')
modifier.ratio=0.16
bpy.ops.object.modifier_apply(modifier=modifier.name)
mesh=obj.data
mesh.calc_loop_triangles()
image=bpy.data.images.load(str(source/'textures/rock_face_01_diff_1k.jpg'))
pixels=list(image.pixels)
width,height=image.size
uv=mesh.uv_layers.active.data
positions=[]
for v in mesh.vertices:
    p=obj.matrix_world@v.co
    positions.append((p.x,p.z,-p.y))
low=[min(v[i] for v in positions) for i in range(3)]
high=[max(v[i] for v in positions) for i in range(3)]
color_sums=[[0.0,0.0,0.0,0] for _ in positions]
for loop in mesh.loops:
    u,v=uv[loop.index].uv
    x=min(width-1,max(0,int(u*width)))
    y=min(height-1,max(0,int(v*height)))
    k=(y*width+x)*4
    c=color_sums[loop.vertex_index]
    for n in range(3):c[n]+=pixels[k+n]
    c[3]+=1
out={'asset':'rock_face_01','author':'Dario Barresi / Poly Haven','license':'CC0-1.0','sourceUrl':'https://polyhaven.com/a/rock_face_01','licenseUrl':'https://polyhaven.com/license','sourceDimensionsMeters':[high[i]-low[i] for i in range(3)],'note':'Generic scanned rock fracture base, not a scan of the geosite. Decimated offline to 16%; original CC0 texture sampled into vertex colors.','positions':[],'normals':[],'colors':[],'indices':[]}
for i,p in enumerate(positions):
    out['positions'] += [round((p[0]-(high[0]+low[0])/2)/(high[0]-low[0])*2,5),round((p[1]-low[1])/(high[1]-low[1]),5),round((p[2]-(high[2]+low[2])/2)/(high[2]-low[2])*2,5)]
    n=obj.matrix_world.to_3x3()@mesh.vertices[i].normal
    out['normals'] += [round(n.x,5),round(n.z,5),round(-n.y,5)]
    c=color_sums[i]
    out['colors'] += [round(c[n]/max(1,c[3]),5) for n in range(3)]
for tri in mesh.loop_triangles:out['indices']+=list(tri.vertices)
target=root/'src/features/experience/miniatures/rebuilt/rock-face-cc0.json'
target.write_text(json.dumps(out,separators=(',',':'))+'\n',encoding='utf-8')
print('SCAN PREPARED',len(positions),len(out['indices'])//3,target.stat().st_size)

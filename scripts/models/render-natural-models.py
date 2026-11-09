"""Offline Blender review renders of the exact exported natural GLBs."""
import bpy
import math
import sys
from mathutils import Vector
from pathlib import Path

root = Path.cwd()
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
requested_views = next((set(value.split('=',1)[1].split(',')) for value in args if value.startswith('--views=')), None)
site_args = [value for value in args if not value.startswith('--views=')]
ids = [int(value) for value in site_args] if site_args else [2,3,4,5,6,7,8,12,13,15,16,17,18,19,20,21,23,24,25,26,50,51,52,53,55,56,57,58,59]
out = root / 'reports/experience-review/rebuild-natural'
out.mkdir(parents=True, exist_ok=True)
for site_id in ids:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(root / f'public/models/geosites/rebuilt/gms-{site_id:02}.glb'))
    objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    points = [o.matrix_world @ Vector(v) for o in objects for v in o.bound_box]
    low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    center = (low + high) / 2
    span = max(high.x-low.x, high.y-low.y, (high.z-low.z)*1.4)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 16
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 720
    scene.render.resolution_y = 600
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.world = bpy.data.worlds.new('Review world')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (0.72,0.76,0.7,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = 0.65
    bpy.ops.mesh.primitive_plane_add(size=200, location=(center.x,center.y,low.z-0.02))
    floor = bpy.context.object
    mat = bpy.data.materials.new('Review floor')
    mat.diffuse_color = (0.21,0.25,0.23,1)
    floor.data.materials.append(mat)
    bpy.ops.object.light_add(type='AREA', location=center+Vector((-span*.5,-span*.7,span*1.8)))
    bpy.context.object.data.energy = 1800
    bpy.context.object.data.shape='DISK'
    bpy.context.object.data.size=span*0.8
    bpy.ops.object.camera_add()
    camera=bpy.context.object
    scene.camera=camera
    camera.data.type='ORTHO'
    camera.data.ortho_scale=span*1.48
    for angle,offset in [('front',(0.7,-1.3,0.95)),('rear',(-0.75,1.2,0.9))] + ([('profile',(0.1,-1.5,0.24))] if site_id in [2,3,6,7,8,12,13,15,21,57] else []) + ([('profile-east',(1.5,0.1,0.24))] if site_id in [8,13,15] else []) + ([('plan',(0,0.001,1.8))] if site_id in [3,6,7,8,12,13,15,21,57] else []):
        if requested_views and angle not in requested_views:
            continue
        camera.location=center+Vector(offset)*span
        direction=center-camera.location
        camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(out/f'gms-{site_id:02}-{angle}.png')
        bpy.ops.render.render(write_still=True)
    print(f'RENDERED GMS-{site_id:02}',flush=True)

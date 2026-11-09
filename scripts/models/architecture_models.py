"""Original photo-informed miniature geometry. Run with Blender 4.5 LTS.

Sources and limits: docs/landmark-rebuild.md and independent photographic dossiers.
No photograph is copied into a texture. These are visual recreations, not surveys.
Blender coordinates: Z up, facade faces -Y. glTF export converts to Y up.
"""
import bpy
import math
import json
import random
import sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/models/geosites/rebuilt'
REVIEW = ROOT / 'reports/experience-review/next-quality/architecture'
MATS = {}

def rgba(value):
    c = [int(value[i:i+2], 16) / 255 for i in (1, 3, 5)]
    return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in c) + (1,)

def material(name, color, roughness=.85, metallic=0):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = rgba(color)
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Metallic'].default_value = metallic
    m.diffuse_color = rgba(color)
    MATS[name] = m
    return m

def assign(obj, mat, name=None):
    obj.data.materials.append(mat)
    if name: obj.name = name
    return obj

def box(name, x, y, z, w, d, h, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + h/2))
    o=bpy.context.object; o.name=name; o.scale=(w,d,h)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod=o.modifiers.new('Soft original edges', 'BEVEL'); mod.width=bevel; mod.segments=2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return assign(o,mat)

def cylinder(name, x,y,z,r,h,mat,vertices=20,r2=None):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r, radius2=r if r2 is None else r2, depth=h, location=(x,y,z+h/2))
    return assign(bpy.context.object,mat,name)

def ball(name,x,y,z,r,mat,scale=(1,1,1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=r, location=(x,y,z))
    o=assign(bpy.context.object,mat,name);o.scale=scale;return o

def beam(name,a,b,r,mat,vertices=8):
    a,b=Vector(a),Vector(b);v=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=v.length,location=(a+b)/2)
    o=assign(bpy.context.object,mat,name);o.rotation_euler=v.to_track_quat('Z','Y').to_euler();return o

def polygon(name, outline, depth, y, mat):
    # outline is x,z. Concave spandrels remain real openings, not painted boxes.
    n=len(outline);v=[(x,y-depth/2,z) for x,z in outline]+[(x,y+depth/2,z) for x,z in outline]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(v,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);assign(o,mat)
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    # Ensure consistent outward normals on custom concave profiles.
    import bmesh
    bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
    o.select_set(False);return o

def arch(name,x,y,bottom,width,spring,depth,mat,top=None):
    r=width/2;top=top if top is not None else spring+r+.18
    p=[(x-r,bottom+spring),(x-r,bottom+top),(x+r,bottom+top),(x+r,bottom+spring)]
    p += [(x+r*math.cos(t*math.pi/20),bottom+spring+r*math.sin(t*math.pi/20)) for t in range(1,20)]
    return polygon(name,p,depth,y,mat)

def arch_panel(name,x,y,z,w,h,mat):
    r=w/2; spring=max(.1,h-r)
    p=[(x-r,z),(x+r,z),(x+r,z+spring)]
    p += [(x+r*math.cos(t*math.pi/20),z+spring+r*math.sin(t*math.pi/20)) for t in range(1,21)]
    return polygon(name,p,.06,y,mat)

def arch_ring(name,x,y,z,r,thickness,mat):
    p=[(x+(r+thickness)*math.cos(i*math.pi/24),z+(r+thickness)*math.sin(i*math.pi/24)) for i in range(25)]
    p += [(x+r*math.cos(i*math.pi/24),z+r*math.sin(i*math.pi/24)) for i in range(24,-1,-1)]
    return polygon(name,p,.08,y,mat)

def segment_panel(name,x,y,z,w,h,rise,mat):
    p=[(x-w/2,z),(x+w/2,z),(x+w/2,z+h-rise)]
    p += [(x+w/2*math.cos(i*math.pi/20),z+h-rise+rise*math.sin(i*math.pi/20)) for i in range(1,21)]
    return polygon(name,p,.07,y,mat)

def segment_ring(name,x,y,z,w,rise,t,mat):
    p=[(x+(w/2+t)*math.cos(i*math.pi/24),z+(rise+t)*math.sin(i*math.pi/24)) for i in range(25)]
    p += [(x+w/2*math.cos(i*math.pi/24),z+rise*math.sin(i*math.pi/24)) for i in range(24,-1,-1)]
    return polygon(name,p,.09,y,mat)

def brick_courses(x,y,z,w,h,excluded=()):
    # Original mortar geometry, not a borrowed photographic texture.
    mortar=material('Warm brick mortar','#a47558')
    for row in range(int(h/.105)):
        zz=z+row*.105
        spans=[(x-w/2,x+w/2)]
        for left,right,bottom,top in excluded:
            if bottom-.02<=zz<=top+.02:
                spans=[part for a,b in spans for part in [(a,min(b,left)),(max(a,right),b)] if part[1]-part[0]>.01]
        for left,right in spans:
            box('Mortar horizontal joint',(left+right)/2,y,zz,right-left,.012,.008,mortar)
            start=math.ceil((left+(row%2)*.12)/.24)*.24-(row%2)*.12
            for xx in [start+i*.24 for i in range(max(0,int((right-start)/.24)+1))]:
                box('Mortar staggered head joint',xx,y,zz,.008,.012,.1,mortar)

def roof(name,x,y,z,w,d,rise,mat):
    return polygon(name,[(x-w/2,z),(x+w/2,z),(x,z+rise)],d,y,mat)

def longitudinal_roof(name,x,y,z,w,d,rise,mat):
    v=[(x-w/2,y-d/2,z),(x+w/2,y-d/2,z),(x-w/2,y+d/2,z),(x+w/2,y+d/2,z),(x-w/2,y,z+rise),(x+w/2,y,z+rise)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(v,[],[(0,1,5,4),(4,5,3,2),(0,4,2),(1,3,5),(0,2,3,1)]);mesh.update()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return assign(o,mat)

def trim(name,x,y,z,w,d,mat): return box(name,x,y,z,w,d,.12,mat,.02)

def window(name,x,y,z,w,h,frame,glass,grille=False):
    box(name+' recess',x,y,z,w,.045,h,glass)
    for dx in [-w/2,w/2]: box(name+' jamb',x+dx,y-.035,z,.065,.07,h,frame)
    for zz in [z,z+h]: box(name+' lintel',x,y-.04,zz,w+.12,.09,.065,frame)
    box(name+' mullion',x,y-.055,z,.04,.05,h,frame)
    box(name+' transom',x,y-.06,z+h*.7,w,.05,.035,frame)
    if grille:
        for j in range(5):box(name+' iron bar',x-w*.4+j*w*.2,y-.11,z,.018,.03,h,IRON)

def door(name,x,y,z,w,h):
    window(name,x,y,z,w,h,WOOD,DARK)
    for j in [-.25,.25]:box(name+' panel',x+j*w,y-.08,z+.15,w*.37,.045,h*.7,WOOD)

def text(name,value,x,y,z,size,mat):
    bpy.ops.object.text_add(location=(x,y,z),rotation=(math.pi/2,0,0))
    o=bpy.context.object;o.name=name;o.data.body=value;o.data.size=size;o.data.align_x='CENTER';o.data.align_y='CENTER';o.data.extrude=.004
    o.data.materials.append(mat);return o

def steps(x,y,w,count=3,rise=.12,run=.22):
    for i in range(count):box('Entry step',x,y-i*run,.02,w,(count-i)*run,(i+1)*rise,STONE)

def rail(x,y,z,w,height=.65,metal=False):
    mat=IRON if metal else WHITE
    for k in range(max(3,int(w/.19))+1):
        xx=x-w/2+k*w/max(3,int(w/.19));cylinder('Baluster',xx,y,z,.025 if metal else .045,height,mat,8)
        if not metal:ball('Baluster swelling',xx,y,z+height*.45,.06,mat,(1,1,.8))
    for zz in [z+.04,z+height]:box('Balustrade rail',x,y,zz,w+.1,.08,.06,mat)

def base(w,d):
    box('Context plinth',0,0,-.14,w,d,.14,PAVING,.04)

def tree(x,y,size=1,ground=0):
    cylinder('Native trunk',x,y,ground,.07*size,.9*size,BARK,7)
    ball('Broadleaf canopy',x,y,ground+size*1.3,.6*size,LEAF,(1,.8,.8))

def clock(x,y,z,r):
    o=cylinder('Clock face',x,y,z-r,r,.045,WHITE,32);o.rotation_euler[0]=math.pi/2;o.location=(x,y,z)
    # Thin geometry on the facade plane, rather than an invented painted dial.
    for k in range(12):
        a=k*math.tau/12;beam('Clock marker',(x+math.sin(a)*r*.75,y-.04,z+math.cos(a)*r*.75),(x+math.sin(a)*r*.9,y-.04,z+math.cos(a)*r*.9),.012,IRON,6)
    beam('Clock minute hand',(x,y-.06,z),(x+r*.1,y-.06,z+r*.67),.018,IRON)
    beam('Clock hour hand',(x,y-.065,z),(x-r*.43,y-.065,z+.08),.022,IRON)

def church41():
    base(12,12)
    box('Long cathedral nave',0,2.2,0,8.2,8,3.5,OCHRE,.04)
    roof('Nave gable',0,2.2,3.5,8.5,8.3,1.25,GREY)
    box('Recessed facade behind portico',0,-1.85,0,9.3,.35,3.4,OCHRE)
    for x in [-2.8,0,2.8]:door('Interior timber door',x,-2.07,.12,.85,2.2)
    for i in range(5):
        x=(i-2)*1.8;arch('Five-arch portico',x,-3.1,0,1.58,1.95,.35,OCHRE,3.2)
        arch_ring('White archivolt',x,-3.32,1.95,.79,.07,WHITE)
    for i in range(6):
        x=(i-2.5)*1.8;box('Portico pier',x,-3.1,0,.22,.45,2.07,WHITE)
        box('Pier foot',x,-3.1,0,.34,.55,.22,WHITE);box('Capital',x,-3.1,1.9,.34,.55,.2,WHITE)
        for off in [-.07,0,.07]:box('Fluted pier',x+off,-3.36,.3,.025,.035,1.5,WHITE)
    trim('Portico entablature',0,-3.05,3.16,9.6,.85,WHITE)
    rail(0,-3.35,3.3,9.4,.35)
    polygon('Central triangular pediment',[(-2.65,3.58),(2.65,3.58),(0,4.98)],.35,-2.65,OCHRE)
    for a,b in [((-2.8,-2.9,3.6),(0,-2.9,5.1)),((0,-2.9,5.1),(2.8,-2.9,3.6))]:beam('White pediment moulding',a,b,.07,WHITE)
    polygon('Smaller pediment above portico',[(-1.3,3.5),(1.3,3.5),(0,4.02)],.18,-3.15,OCHRE)
    for a,b in [((-1.38,-3.28,3.5),(0,-3.28,4.09)),((0,-3.28,4.09),(1.38,-3.28,3.5))]:beam('Secondary pediment trim',a,b,.045,WHITE)
    segment_panel('Semicircular fanlight',0,-2.91,4.24,.76,.38,.38,DARK)
    for a in [math.pi*i/6 for i in range(7)]:beam('Fanlight radial mullion',(0,-2.97,4.24),(.38*math.cos(a),-2.97,4.24+.38*math.sin(a)),.012,WHITE)
    for x in [-3.7,3.7]:
        box('Square clock tower',x,-1.7,3.25,1.75,1.85,3.3,OCHRE,.03)
        for dx in [-.78,.78]:box('White tower corner',x+dx,-2.66,3.3,.12,.14,3.15,WHITE)
        trim('Tower middle cornice',x,-1.7,6.4,2.05,2.1,WHITE)
        clock(x,-2.66,5.25,.38)
        # Open bell chamber, square plan, four corner piers.
        for dx in [-.73,.73]:
            for yy in [-2.43,-.97]:box('Belfry corner',x+dx,yy,6.55,.28,.28,1.8,WHITE,.02)
        arch('Belfry arch front',x,-2.48,6.55,1.16,1.12,.18,OCHRE,1.86)
        arch_ring('Bell arch trim',x,-2.6,7.67,.58,.065,WHITE)
        cylinder('Bronze bell',x,-1.7,7.15,.23,.32,BRONZE,20,r2=.12)
        trim('Belfry roof cornice',x,-1.7,8.38,2.12,2.14,WHITE)
        p=[(x-.85,8.5),(x+.85,8.5)]+[(x+.85*math.cos(i*math.pi/24),8.5+.28*math.sin(i*math.pi/24)) for i in range(1,24)]
        polygon('Low curved grey tower cap',p,1.85,-1.7,GREY)
        beam('Tower cross vertical',(x,-1.7,8.7),(x,-1.7,9.45),.035,IRON)
        beam('Tower cross arms',(x-.22,-1.7,9.17),(x+.22,-1.7,9.17),.035,IRON)
    steps(0,-3.6,9.8,3)
    rail(0,-4.4,.05,10.5,1.1,True)

def theatre45():
    base(12,9);box('Long theatre auditorium',0,2,0,10.4,5.8,5.5,BRICK)
    # Five real open arches with recessed doors, plus the two closed lateral bays.
    box('Upper facade above the open portico',0,-1.72,2.65,10.4,.48,2.9,BRICK)
    excluded=[]
    for i in range(7):
        x=(i-3)*1.36
        if i in [0,6]:
            box('Lateral ground floor solid facade',x,-1.72,0,2.15,.48,2.65,BRICK)
            arch_panel('Closed lateral arched bay',x,-1.98,.1,1.16,2.4,DARK)
            window('Closed lateral door frame',x,-2.025,.1,.98,1.88,WOOD,DARK)
        else:
            arch('Five open portico bays',x,-1.72,0,1.06,1.63,.48,BRICK,2.65)
            for dx in [-.59,.59]:box('Portico brick pier',x+dx,-1.72,0,.13,.48,1.7,BRICK)
            door('Door recessed behind portico',x,-.95,.1,.78,2.15)
        arch_ring('Brick arch casing',x,-2,1.73 if i in [0,6] else 1.63,.58 if i in [0,6] else .53,.1,TRIM_RED)
        window('First-floor French windows',x,-1.95,3.08,.85,1.45,WHITE,DARK)
        arch_panel('Lunette over upper window',x,-1.96,4.52,.85,.4,WHITE)
        excluded += [(x-.64,x+.64,0,2.5),(x-.51,x+.51,3,5)]
    brick_courses(0,-1.969,.05,10.3,5.45,excluded)
    trim('Masonry stringcourse',0,-1.95,2.7,10.65,.22,STONE)
    box('Continuous balcony slab',0,-2.3,2.76,8.3,1.05,.16,STONE,.04);rail(0,-2.8,2.94,8.2,.55)
    for x in [-4.72,-4.4,4.4,4.72]:
        cylinder('Slender paired facade column',x,-2.01,2.98,.09,2.65,TRIM_RED,16)
        cylinder('Capital collar',x,-2.01,5.52,.14,.16,TRIM_RED,16)
    for x in [-4.05,4.05]:
        segment_panel('Solid brick curved tympanum',x,-1.98,5.57,1.7,.85,.85,BRICK)
        arch_ring('Curved lateral pediment',x,-2.05,5.57,.85,.16,TRIM_RED)
        box('Pediment side upright',x-.82,-2.02,5.58,.16,.3,.55,BRICK)
        box('Pediment side upright',x+.82,-2.02,5.58,.16,.3,.55,BRICK)
    trim('Upper dentil cornice',0,-1.93,5.53,10.6,.4,TRIM_RED)
    for x in [i*.27 for i in range(-19,20)]:box('Cornice dentil',x,-2.1,5.36,.11,.14,.15,TRIM_RED)
    box('Central horizontal parapet',0,-1.7,5.65,5.5,.45,.48,BRICK)
    text('Theatre name','TEATRO LAVALLEJA',0,-2.015,5.78,.21,STONE)

def school37():
    base(12,8);box('Two-storey main school block',0,.4,0,9.2,5.5,5.3,YELLOW,.025)
    for x in [-1.5,0,1.5]:
        segment_panel('Three grey segmental entrance doors',x,-2.39,.06,.8,2.45,.14,GREY)
        segment_ring('Shallow white entrance arch',x,-2.46,2.37,.8,.14,.12,WHITE)
        for dx in [-.46,.46]:box('Thick white door jamb',x+dx,-2.45,.05,.12,.11,2.33,WHITE)
        for dx in [-.22,.22]:box('Grey door leaf panel',x+dx,-2.44,.2,.31,.03,1.45,GREY)
        box('Door central join',x,-2.48,.1,.025,.03,2.24,IRON)
    for x in [-3.6,-2.7,2.7,3.6]:window('Narrow lower school window',x,-2.4,.65,.48,1.7,WHITE,GREY)
    for x in [-3.45,-1.7,0,1.7,3.45]:
        window('Five upper shuttered windows',x,-2.4,3.15,.95,1.65,WHITE,GREY)
        box('White upper lintel',x,-2.5,4.79,1.21,.2,.27,WHITE)
        box('White panel beneath upper window',x,-2.45,2.85,1.12,.1,.26,WHITE)
        for dx in [-.34,0,.34]:box('Shutter panel',x+dx,-2.49,3.25,.02,.03,1.5,IRON)
    for z in [.2,2.7,5.2]:trim('School horizontal cornice',0,-2.34,z,9.6,.4,WHITE)
    trim('White lower facade linking band',0,-2.43,2.31,9.3,.14,WHITE)
    for z in [i*.32 for i in range(1,16)]:box('Rusticated horizontal joint',0,-2.38,z,9.1,.025,.018,OCHRE)
    for x in [-5.1,5.1]:box('Lower lateral wing',x,.6,0,1.05,4.8,2.9,YELLOW)
    text('School sign','ESCUELA ARTIGAS',0,-2.47,2.63,.2,IRON);steps(0,-2.7,8.7,3)
    box('Small Artigas bust pedestal',-3.4,-3.1,0,.35,.35,.72,STONE)
    ball('Small bust head',-3.4,-3.1,1.02,.13,BRONZE);ball('Small bust shoulders',-3.4,-3.1,.83,.18,BRONZE,(1,.6,.7))
    beam('School flagpole',(3.5,-3.1,0),(3.5,-3.1,5.4),.025,IRON)

def school38():
    base(12,9);box('Single-storey school behind gallery',0,1.2,0,10,5,3.5,MINT)
    for i in range(5):
        x=(i-2)*1.85;arch('Five open gallery bays',x,-1.9,.4,1.58,1.85,.35,MINT,3.15)
        arch_ring('Cream arch trim',x,-2.1,2.25,.79,.07,WHITE)
        window('Tall gallery window',x,-1.36,.75,1.15,1.9,PINK,DARK)
        if i!=2:rail(x,-2.18,.43,1.55,.6)
    for i in range(6):box('Broad arcade pier',(i-2.5)*1.85,-1.92,.35,.24,.5,2.8,MINT)
    trim('School flat parapet',0,-1.85,3.47,10.5,.6,WHITE)
    rail(0,-1.9,3.59,10.2,.3);steps(0,-2.4,1.8,3)
    for x in [-4.9,4.9]:tree(x,-3.3,1.65)
    text('School8 name','GUILLERMO CUADRI',0,-2.15,3.16,.16,IRON)

def station35():
    base(15,7);box('Long single-storey railway station',0,.6,0,13,4,2.6,WHITE)
    longitudinal_roof('Red double-pitch railway roof, ridge parallel to facade',0,.6,2.6,13.5,4.6,.85,TILE)
    for x in [-4.3,4.3]:box('Two station chimneys',x,.5,2.9,.36,.38,1.25,WHITE);trim('Chimney cap',x,.5,4.1,.5,.5,WHITE)
    for x in [-5.5,-3.7,-1.8,1.8,3.7,5.5]:window('Grilled station window',x,-1.45,.45,.65,1.6,WOOD,DARK,True)
    door('Central railway entrance',0,-1.46,.04,.8,2.05)
    box('Iron canopy roof',0,-1.9,2.15,2.6,1.25,.09,IRON)
    for x in [-1.05,0,1.05]:
        beam('Canopy iron bracket',(x,-1.5,1.65),(x,-2.4,2.15),.025,IRON)
        beam('Canopy iron bracket',(x,-1.5,2.15),(x,-2.4,2.15),.025,IRON)
    box('Station grey plinth',0,-1.44,0,13.1,.12,.25,GREY)
    text('Station name','MINAS',0,-2.5,.14,.35,IRON)
    for x in [-3,3]:box('Timber bench',x,-2.2,.35,1.4,.35,.1,WOOD);box('Bench back',x,-2.1,.53,1.4,.09,.45,WOOD)

def irisarri40():
    base(7,7);box('Narrow two-storey confectionery',0,.6,0,5.8,5,5.6,CREAM,.03)
    for x in [-1.7,0,1.7]:window('Ground-floor shopfront',x,-1.95,.08,1.46,2.1,IRON,DARK)
    box('Dated flat shop awning',0,-2.35,2.2,6.2,1.1,.28,CREAM,.04)
    text('Anniversary fascia','1898  CONFITERIA IRISARRI  1998',0,-2.92,2.34,.155,IRON)
    for x in [-1.65,0,1.65]:window('Three upper shutters',x,-1.96,3.02,1.42,1.6,WOOD,GREY)
    box('Curved balcony floor',0,-2.25,2.85,5.5,.95,.14,CREAM,.1)
    # Metal railing is horizontal, not a colonial balustrade.
    for zz in [3.02,3.25,3.48,3.7]:box('Horizontal balcony rail',0,-2.72,zz,5.4,.035,.035,IRON)
    for x in [-2.65,-1.3,0,1.3,2.65]:box('Balcony metal upright',x,-2.72,2.98,.035,.035,.77,IRON)
    for x in [-2.7,2.7]:box('Facade side pilaster',x,-1.99,2.8,.22,.16,2.6,WHITE)
    segment_ring('Broad shallow blind arch',0,-2.06,4.45,4.9,.72,.075,WHITE)
    trim('Irisarri top cornice',0,-1.96,5.58,6.18,.4,WHITE)
    text('Casa Irisarri parapet','CASA IRISARRI',0,-2.18,5.92,.32,WHITE)
    box('Flat parapet behind name',0,-1.82,5.68,5.65,.3,.52,CREAM)

def house47():
    base(11,10);box('Single-floor rectangular historic house',0,.7,0,8.6,7.1,2.65,CREAM,.02)
    for x in [-4.25,4.25]:box('White roof parapet side',x,.7,2.65,.12,7.3,.45,WHITE)
    for y in [-2.87,4.27]:box('White roof parapet end',0,y,2.65,8.6,.12,.45,WHITE)
    for x in [-3,-1,1,3]:window('Tall original ground-floor window',x,-2.9,.35,.77,1.75,WHITE,WOOD)
    # A raised octagonal corner pavilion, not a tower in the middle of the roof.
    cylinder('Octagonal raised corner bay',3.15,-2.1,0,1.24,4.7,CREAM,8)
    for a in range(8):
        angle=a*math.tau/8;cx=3.15+math.cos(angle)*1.16;cy=-2.1+math.sin(angle)*1.16
        for z,h in [(0.5,1.7),(2.9,1.55)]:
            o=box('Large rectangular corner pavilion glazing',cx,cy,z,.83,.05,h,GLASS);o.rotation_euler[2]=angle+math.pi/2
            for off in [-.43,0,.43]:
                o=box('Corner glazing timber jamb',cx-math.sin(angle)*off,cy+math.cos(angle)*off,z,.04,.08,h,WOOD);o.rotation_euler[2]=angle+math.pi/2
            for zz in [z,z+h]:
                o=box('Corner glazing sill and lintel',cx,cy,zz,.92,.1,.07,WHITE);o.rotation_euler[2]=angle+math.pi/2
    cylinder('Eight-hip steep terracotta pavilion roof',3.15,-2.1,4.7,1.6,1.8,TILE,8,r2=.08)
    for i in range(8):
        a=i*math.tau/8;beam('Octagonal tiled hip ridge',(3.15+1.6*math.cos(a),-2.1+1.6*math.sin(a),4.72),(3.15,-2.1,6.52),.025,TRIM_RED)
    ball('Small roof finial',3.15,-2.1,6.63,.15,STONE,(1,1,1.6))
    box('Central roof skylight',-.4,.9,2.65,1.2,1.2,.23,GREY)
    box('Skylight glazing',-.4,.9,2.9,1.04,1.04,.04,GLASS)
    for x in [-2.7,1.5]:box('Roof chimney',x,2.7,2.65,.28,.3,1.1,WHITE)
    tree(-4.7,3.5,1.2)

def teresita48():
    base(10,12);box('Long single nave',0,2.1,0,5.7,9.2,3.5,CREAM)
    roof('Low red double-pitch nave roof',0,2.1,3.5,6.05,9.5,1.1,TILE)
    polygon('Front church gable',[(-2.85,3.35),(2.85,3.35),(0,4.65)],.3,-2.55,CREAM)
    door('Central church timber entrance',0,-2.64,.08,1.15,2.1)
    arch_panel('Arched entrance reveal',0,-2.71,.06,1.5,2.45,STONE)
    arch_panel('Door within reveal',0,-2.76,.08,1.17,2.16,WOOD)
    arch_ring('Entrance arch trim',0,-2.81,1.66,.75,.09,WHITE)
    roof('Small door pediment canopy',0,-2.85,2.65,2.2,.5,.45,WHITE)
    for x in [-2,2]:arch_panel('Blind facade niche',x,-2.74,1.0,.5,1.1,STONE)
    o=cylinder('Circular front oculus',0,-2.72,3.65,.4,.05,DARK,28);o.rotation_euler[0]=math.pi/2;o.location=(0,-2.74,3.65)
    arch_ring('Oculus surround upper',0,-2.8,3.65,.4,.08,WHITE)
    # One central open polygonal belfry. Never two towers or a Gothic spire.
    box('Square masonry neck above church gable',0,-1.95,4.0,1.65,1.65,1.45,CREAM)
    trim('Square neck projecting cornice',0,-1.95,5.4,2,2,WHITE)
    cylinder('Central belfry base',0,-1.95,5.55,.92,.35,WHITE,8)
    for i in range(8):
        a=i*math.tau/8;cylinder('Belfry column',math.cos(a)*.72,-1.95+math.sin(a)*.72,5.9,.09,1.2,CREAM,12)
    cylinder('Low red belfry roof',0,-1.95,7.1,1.04,.58,TILE,16,r2=.22)
    beam('Church cross',(0,-1.95,7.68),(0,-1.95,8.25),.035,IRON)
    beam('Church cross arms',(-.18,-1.95,8.08),(.18,-1.95,8.08),.035,IRON)
    for x in [-2.9,2.9]:
        for y in [-.6,2,4.6]:box('Simple nave buttress',x,y,0,.24,.45,3.25,WHITE)
    steps(0,-3,2.5,3)

def miniatures60():
    base(9,8);box('Low pale-green workshop entrance',-.6,.7,0,6,4,2.3,MINT)
    box('Straight corrugated roof edge',-.6,.7,2.3,6.3,4.2,.12,GREY)
    door('Workshop doorway',-1.65,-1.34,.02,1.0,1.9)
    window('Workshop barred window',-3,-1.34,.65,1.05,1.15,IRON,DARK,True)
    # Distinctive welded red robot carries the museum's sign.
    x=.9;y=-2.1
    box('Robot riveted torso',x,y,.7,.65,.38,.95,RED,.025)
    for dx in [-.28,.28]:beam('Robot splayed leg',(x+dx,y,.76),(x+dx*1.6,y-.02,.08),.07,RED)
    for dx in [-.36,.36]:
        beam('Raised robot forearm',(x+dx,y,1.35),(x+dx*2,y,1.68),.07,RED)
        beam('Raised robot upper arm',(x+dx*2,y,1.68),(x+dx*1.6,y,2.6),.07,RED)
    o=cylinder('Robot gear head',x,y,1.8,.26,.14,RED,24);o.rotation_euler[0]=math.pi/2;o.location=(x,y,1.88)
    for i in range(20):
        a=i*math.tau/20;o=box('Visible head gear tooth',x+math.sin(a)*.29,y,1.88+math.cos(a)*.29,.075,.15,.075,RED);o.rotation_euler[1]=-a
    for dx in [-.1,.1]:ball('Robot bolt eye',x+dx,y-.1,1.94,.04,IRON)
    for dx in [-.21,0,.21]:
        for z in [.9,1.15,1.4]:ball('Torso rivet',x+dx,y-.21,z,.025,IRON)
    box('White sign carried by robot',x,y-.03,2.46,1.65,.12,1.28,WHITE,.03)
    text('Miniatures sign','EXPONE\nRÉPLICAS EN\nMINIATURA',x,y-.105,3.13,.2,RED)
    box('Vertical museum sign',x+1.08,y,2.42,.45,.13,1.65,BLUE)
    text('Vertical MUSEO','M\nU\nS\nE\nO',x+1.08,y-.08,3.25,.23,WHITE)
    for i in range(12):box('Narrow metal entrance fence',2.2+i*.13,-2.1,0,.025,.04,1.7,IRON)

def culture27():
    blue=material('Culture house pale blue frames','#b1cad5');pink=material('Culture house rose plaster','#e0b8b8')
    base(13,8);box('One-storey rose cultural centre',0,1,0,11.4,5.6,3.5,pink)
    for x in [-4.3,-1.45,1.45,4.3]:
        window('Very tall rectangular cultural opening',x,-1.85,.2,1.18,2.8,blue,WOOD if x==-1.45 else GREY,True)
        for dx in [-.69,.69]:box('Layered pale blue jamb',x+dx,-1.93,.12,.16,.16,3.0,blue)
        for zz in [.12,3.1]:trim('Pale blue lintel and sill',x,-1.94,zz,1.57,.21,blue)
    for zz in [3.35,3.5]:trim('Horizontal culture house cornice',0,-1.85,zz,11.7,.35,blue)
    text('Casa de la Cultura sign','CASA DE LA CULTURA',-1.45,-2.02,3.31,.15,IRON)
    # A new simplified colour study recalls the three mural panels. No photo
    # or protected mural artwork is embedded or traced into a texture.
    red=material('Culture mural red','#983e39');gold=material('Culture mural yellow','#d4aa48')
    for index,x in enumerate([-3,0,3]):
        box('Three coloured mural fields',x,-1.83,.2,1.3,.025,2.9,red if index!=1 else gold)
        for k in range(4):
            polygon('Original mural geometric rhythm',[(x-.6,.2+k*.65),(x+.6,.4+k*.65),(x-.3,.8+k*.65)],.025,-1.86,gold if index!=1 else red)
        ball('Simplified portrait medallion',x,-1.91,2.18,.3,WHITE,(.75,.07,1))
        polygon('Simplified portrait shoulders',[(x-.46,1.12),(x+.46,1.12),(x+.22,1.85),(x-.22,1.85)],.035,-1.9,WHITE)
        for dx in [-.57,.57]:box('Blue mural vertical field',x+dx,-1.9,.24,.11,.035,2.8,BLUE)
        if index in [1,2]:
            ball('Distinctive portrait beret',x-.05,-1.95,2.49,.3,WHITE,(1.05,.12,.32))
            beam('Original beret rim',(x-.3,-1.98,2.43),(x+.22,-1.98,2.43),.023,IRON)
        if index==2:polygon('Long bearded portrait silhouette',[(x-.18,2.1),(x+.18,2.1),(x+.06,1.58),(x-.08,1.63)],.035,-1.97,WHITE)
        elif index==0:box('Portrait short dark hair',x,-1.95,2.43,.33,.04,.12,IRON)
    box('Low blue facade plinth',0,-1.86,0,11.5,.09,.17,blue)

def cuna28():
    base(16,7);box('Long single-floor liceo',0,.8,0,14.4,4.8,3.1,CREAM)
    box('Terracotta plinth',0,-1.65,0,14.5,.1,.32,RED)
    for zz in [2.75,2.92]:trim('Long terracotta upper bands',0,-1.65,zz,14.5,.14,RED)
    box('Low school parapet',0,-1.55,3.1,14.5,.25,.55,CREAM)
    for x in [-7.1,-2.2,2.4,7.1]:box('Terracotta parapet pilaster',x,-1.72,3.06,.16,.16,.65,RED)
    stone=material('Liceo dark irregular stone','#65625b')
    box('Left access stone-faced section',-3.2,-1.66,.32,6.9,.12,1.96,stone)
    for row in range(8):
        z=.35+row*.24
        for col in range(14):
            x=-6.65+col*.5+(row%2)*.15
            if abs(x+3.2)<.6 or abs(x+5.2)<.55 or abs(x+1.1)<.55:continue
            box('Liceo irregular stone joint',x,-1.735,z,.35,.02,.014,STONE)
    door('Left wooden central entrance',-3.2,-1.78,.06,1.02,2.02)
    for x in [-5.2,-1.1]:window('Left stone-faced rectangular window',x,-1.8,.62,1.0,1.42,WOOD,DARK)
    door('Narrow right school entrance',4.65,-1.7,.06,.6,2.0)
    for x in [.8,2.55,6.3]:window('Right cream section window',x,-1.71,.65,.7,1.4,GREY,DARK)
    box('Cuna de Fabini plaque',4.65,-1.79,2.2,1.35,.05,.47,WHITE)
    text('Cuna de Fabini inscription','CUNA DE\nFABINI',4.65,-1.83,2.43,.17,BLUE)
    tree(1,-2.7,1.4)

def bench(x,y,w=1.5):
    for k in range(4):box('Dark timber bench seat',x,y+k*.085,.4,w,.065,.055,WOOD)
    for k in range(3):box('Dark timber bench back',x,y+.28,.55+k*.1,w,.05,.065,WOOD)
    for dx in [-w*.35,w*.35]:box('Bench iron leg',x+dx,y+.1,0,.045,.22,.42,IRON)

def plaza29():
    grass=material('Low plaza lawns','#7f9562');base(14,12)
    box('Low lawn across the square',0,0,.01,12.5,10.5,.07,grass)
    # Official orthophoto: diagonal X from the corners, circular central node.
    outline=[(-6,-5),(-4.9,-5),(0,-.8),(4.9,-5),(6,-5),(6,-3.9),(.95,0),(6,3.9),(6,5),(4.9,5),(0,.8),(-4.9,5),(-6,5),(-6,3.9),(-.95,0),(-6,-3.9)]
    mesh=bpy.data.meshes.new('Single clipped diagonal X');mesh.from_pydata([(x,y,.13)for x,y in outline],[],[tuple(range(len(outline)))]);mesh.update()
    o=bpy.data.objects.new('One continuous diagonal plaza path',mesh);bpy.context.collection.objects.link(o);assign(o,PAVING)
    cylinder('Circular central promenade',0,0,.14,1.3,.035,PAVING,64)
    cylinder('Low circular central edging',0,0,.18,.57,.13,STONE,48)
    cylinder('Small central round feature',0,0,.32,.42,.08,PAVING,48)
    for x,y in [(-3.6,0),(3.6,0),(0,3.6),(0,-3.6)]:bench(x,y)
    for x,y in [(-5,-4),(5,4),(-5,4),(5,-4)]:
        beam('Double plaza lamp post',(x,y,0),(x,y,3.3),.045,IRON)
        for sign in [-1,1]:
            beam('Curved lamp arm',(x,y,3.3),(x+sign*.55,y,3.52),.035,IRON)
            ball('Oval lamp shade',x+sign*.55,y,3.51,.16,GREY,(1.2,.5,.35))
    for x,y in [(-6,4),(6,4),(-6,-4),(6,-4)]:tree(x,y,1.7)

def pitch30():
    grass=material('Synthetic football turf','#426d39');line=material('Football white line','#efefdc')
    base(13,17);box('Rectangular synthetic grass field',0,0,.01,10.5,14.5,.07,grass)
    for x in [-4.95,4.95]:box('Touchline',x,0,.09,.045,13.9,.012,line)
    for y in [-6.95,0,6.95]:box('End and half-way line',0,y,.09,9.9,.045,.012,line)
    for y in [-5.75,5.75]:
        box('Penalty area front',0,y,.09,5.8,.045,.012,line)
        for x in [-2.9,2.9]:box('Penalty area side',x,(y+math.copysign(6.95,y))/2,.09,.045,1.2,.012,line)
    ring=[]
    for i in range(64):
        a=i*math.tau/64;b=(i+1)*math.tau/64;beam('Centre circle',(1.3*math.cos(a),1.3*math.sin(a),.105),(1.3*math.cos(b),1.3*math.sin(b),.105),.022,line,4)
    for y in [-7.05,7.05]:
        for x in [-1.3,1.3]:beam('White goal post',(x,y,.08),(x,y,1.75),.04,WHITE)
        beam('White goal crossbar',(-1.3,y,1.75),(1.3,y,1.75),.04,WHITE)
        for k in range(11):beam('Fine goal net vertical',(-1.3+k*.26,y+.3,.08),(-1.3+k*.26,y+.3,1.7),.009,WHITE,4)
        for z in [.3,.6,.9,1.2,1.5]:beam('Fine goal net horizontal',(-1.3,y+.3,z),(1.3,y+.3,z),.009,WHITE,4)
    for x in [-5.5,5.5]:
        box('White perimeter plinth',x,0,0,.18,15.3,.45,WHITE)
        for y in [i*1.5 for i in range(-5,6)]:beam('Fence steel post',(x,y,.4),(x,y,3.6),.025,IRON)
        for y in [i*.22 for i in range(-34,35)]:beam('Fine perimeter mesh',(x,y,.45),(x,y,3.6),.006,GREY,4)
        for z in [.5+i*.22 for i in range(15)]:beam('Mesh crosswire',(x,-7.5,z),(x,7.5,z),.006,GREY,4)
    for y in [-7.65,7.65]:
        box('End white fence plinth',0,y,0,11.2,.18,.45,WHITE)
        for x in [-5.5,0,5.5]:beam('End fence post',(x,y,.4),(x,y,3.6),.025,IRON)
        for x in [i*.22 for i in range(-25,26)]:beam('Fine end mesh',(x,y,.45),(x,y,3.6),.006,GREY,4)
        for z in [.5+i*.22 for i in range(15)]:beam('Fine end crosswire',(-5.5,y,z),(5.5,y,z),.006,GREY,4)
    for x in [-6,6]:
        for y in [-6,6]:
            beam('Tall floodlight pole',(x,y,0),(x,y,5),.04,GREY)
            box('Pitch floodlight',x,y,4.8,.45,.22,.32,WHITE)

def belloni36():
    base(12,9);box('Low museum building',0,1,0,10.5,5.5,2.7,CREAM)
    box('Grey stone museum plinth',0,-1.8,0,10.6,.3,.42,GREY)
    box('Thin flat dark roof',0,1,2.7,10.9,5.8,.16,GREY)
    box('Red-brick upper parapet',0,-1.65,2.42,10.6,.3,.45,BRICK)
    for i in range(9):
        x=(i-4)*1.15;window('Glazed modular facade',x,-1.83,.43,1.08,1.98,WOOD,GLASS)
    box('Brown museum entrance transom',-3.45,-1.89,1.62,2.3,.1,.1,WOOD)
    text('Museum front name','MUSEO STELLIO BELLONI',0,-1.9,2.66,.19,WHITE)
    for x in [-4.2,-2,2.2,4.2]:
        box('Low rectangular concrete planter',x,-2.6,0,1.2,.6,.45,STONE,.025)
        for k in range(3):ball('Small planter greenery',x-.3+k*.3,-2.6,.52,.16,LEAF,(1,.7,.7))
    bench(0,-2.6,2.4)

def culture42():
    base(12,10);box('Preserved Lavalleja birthplace in cultural courtyard',-.9,1,.2,7.8,5.2,3.05,CREAM)
    box('Grey lower wall plinth',-.9,-1.66,.2,7.85,.16,.53,GREY)
    trim('Low cream cornice',-.9,-1.65,3.19,8.05,.25,WHITE)
    for x in [-4.8+i*.16 for i in range(50)]:cylinder('Visible red clay tile edge',x,-1.63,3.3,.055,.22,TILE,10)
    door('Birthplace rectangular timber door',.5,-1.72,.2,1.05,2.15)
    window('Grilled birthplace window',-2.25,-1.74,1.0,.9,1.35,WOOD,DARK,True)
    box('Exposed brick corner patch',2.94,-1.73,1.03,.1,.08,1.85,BRICK)
    box('Exposed brick corner front',2.7,-1.73,1.03,.5,.09,1.85,BRICK)
    brick_courses(2.7,-1.78,1.05,.48,1.8)
    for x in [-3.4,-.55,1.8]:
        cylinder('Terracotta courtyard pot',x,-2.3,0,.18,.45,TILE,16,r2=.29)
        for k in range(3):beam('Courtyard potted plant',(x,-2.3,.4),(x+(k-1)*.13,-2.3,1.0+(.2 if k==1 else 0)),.025,LEAF)
    for i in range(6):box('Courtyard paving joints',0,-3.9+i*.42,-.003,11.5,.015,.012,GREY)
    steps(4,-1.2,2.1,5,.15,.36)
    text('Birthplace small identifying plaque','CASA NATAL\nJ. A. LAVALLEJA',1.8,-1.81,2.0,.13,GREY)

def cemetery43():
    base(16,9)
    for x in [-5.5,5.5]:box('Long low white cemetery wall',x,0,0,6.2,.65,2.25,WHITE)
    # The portal has a real through-opening, not a dark sticker.
    for x in [-1.65,1.65]:box('Broad grey Art Deco portal pier',x,0,0,1.5,1.05,3.9,STONE)
    arch('Narrow central semicircular portal',0,0,0,1.8,2.15,1.05,STONE,4.05)
    arch_ring('Inset white portal archivolt',0,-.58,2.15,.9,.12,WHITE)
    for x in [-1.11,1.11]:box('White inset arch jamb',x,-.58,0,.12,.1,2.17,WHITE)
    for x in [-1.26,1.26]:box('Dark grey central field side',x,-.54,0,.16,.08,3.45,GREY)
    arch('Dark grey portal field above arch',0,-.56,0,2.38,2.15,.09,GREY,3.43)
    for i,w in enumerate([4.7,4.38,4.05,3.72,3.4]):box('Stepped Art Deco parapet',0,0,3.84+i*.12,w,1.06,.14,STONE)
    for i,w in enumerate([1.2,.92,.68]):box('Stepped cross pedestal',0,0,4.42+i*.12,w,.7,.13,STONE)
    box('Stone cross vertical',0,0,4.74,.22,.28,1.05,STONE)
    box('Stone cross arms',0,0,5.18,.83,.28,.21,STONE)
    for x in [-6.5,6.5]:
        cylinder('Wallside square planter',x,-1.2,0,.4,.45,STONE,4)
        tree(x,-1.2,.8)

def alfajor44():
    charcoal=material('Alfajor factory charcoal facade','#303a3c');warm=material('Museum timber walls','#957256')
    base(13,10);box('Low contemporary factory museum',0,1.1,0,11.3,6,3.1,charcoal)
    box('Wide dark horizontal fascia',0,-2.0,2.26,11.6,.45,.95,charcoal)
    for x in [-4.25,-2.1,0,2.1,4.25]:window('Museum front glazing',x,-1.96,.13,1.95,2.0,IRON,GLASS)
    box('Modern recessed canopy',0,-2.3,2.22,11.7,1,.12,charcoal)
    text('Factory white raised lettering','FÁBRICA DE ALFAJORES',.5,-2.25,2.94,.35,WHITE)
    text('Factory foundation date','DESDE 1953',.5,-2.26,2.5,.21,WHITE)
    o=cylinder('Round factory badge',-4.65,-2.2,2.75,.35,.06,WHITE,36);o.rotation_euler[0]=math.pi/2;o.location=(-4.65,-2.26,2.75)
    text('Original simple factory badge','MS',-4.65,-2.31,2.76,.2,BLUE)

def mill61():
    # Dedicated, reproducible reconstruction from the July 2026 photo dossier.
    import importlib.util
    spec=importlib.util.spec_from_file_location('molino_viejo_authoring', ROOT / 'scripts/models/molino_viejo.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    module.build(sys.modules[__name__])


def ground_polygon(name,outline,z,mat):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata([(x,y,z)for x,y in outline],[],[tuple(range(len(outline)))]);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);return assign(obj,mat)

def mapped_path(name,points,width,z,mat):
    # One continuous, mitered strip; no coplanar overlapping slabs at turns.
    verts=[];faces=[]
    for i,(x,y) in enumerate(points):
        before=Vector(points[max(0,i-1)]);after=Vector(points[min(len(points)-1,i+1)]);delta=(after-before).normalized();normal=Vector((-delta.y,delta.x))*width/2
        verts.extend([(x+normal.x,y+normal.y,z),(x-normal.x,y-normal.y,z)])
        if i:faces.append((2*i-2,2*i-1,2*i+1,2*i))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);return assign(obj,mat)

def industrial32():
    # Ground-plan relationships read from the exact IDE orthophoto; buildings
    # are simplified visual proportions from MIEM's ANCAP Minas photographs.
    lawn=material('ANCAP surrounding grass','#7b8b5d');clearing=material('ANCAP pale extraction clearing','#b2b1a4');road=material('ANCAP unsealed service roads','#beb59a')
    box('ANCAP solid context base',0,0,-.4,14,13,.12,PAVING)
    pit_polygons=[ [(-4.3,-3.3),(-2,-3.7),(-1.65,-2.1),(-3.7,-1.8)], [(-4.7,.2),(-3.6,-.05),(-3.1,1.6),(-4.3,1.9)] ]
    cleared=[(-4.4,-3.5),(-1.4,-4.3),(-.8,-2.1),(-2.1,-.8),(-2.6,1.3),(-4,2),(-5.2,.7),(-4.5,-1.4)]
    def inside(x,y,poly):
        hit=False
        for i,a in enumerate(poly):
            b=poly[(i+1)%len(poly)]
            if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:hit=not hit
        return hit
    grid=64;verts=[];faces=[];indices=[]
    for row in range(grid+1):
        y=-6.5+row*13/grid
        for col in range(grid+1):
            x=-7+col*14/grid;z=-.16 if any(inside(x,y,poly)for poly in pit_polygons)else .12
            verts.append((x,y,z))
    for row in range(grid):
        for col in range(grid):
            i=row*(grid+1)+col;faces.append((i,i+1,i+grid+2,i+grid+1));x=-7+(col+.5)*14/grid;y=-6.5+(row+.5)*13/grid;indices.append(1 if inside(x,y,cleared)else 0)
    mesh=bpy.data.meshes.new('ANCAP ground with excavations');mesh.from_pydata(verts,[],faces);mesh.update();obj=bpy.data.objects.new('Quarry cuts below ground, not raised slabs',mesh);bpy.context.collection.objects.link(obj)
    for mat in [lawn,clearing]:mesh.materials.append(mat)
    for face,index in zip(mesh.polygons,indices):face.material_index=index
    for x in [-7,7]:box('ANCAP plinth side',x,0,-.28,.03,13,.4,lawn)
    for y in [-6.5,6.5]:box('ANCAP plinth end',0,y,-.28,14,.03,.4,lawn)
    ground_polygon('East industrial compound',[(0,-4.8),(5.9,-5.6),(5.4,3.7),(3,4.8),(.1,2.9),(-.6,.6)],.13,clearing)
    mapped_path('Curved northern mine access',[(-6,5.7),(-3.8,4.6),(-1.6,3),(-.6,.6),(0,-2.8),(1.4,-5.6),(5,-6)],.22,.145,road)
    mapped_path('Factory access loop',[(0,-2.8),(3.6,-3.8),(5.6,-2),(5.1,2.8),(3,4.1),(-1.6,3)],.2,.16,road)
    # Two extraction cuts west of the factory, not a giant generic terraced pit.
    for x,y,w,d in [(-3,-2.6,1.7,1.1),(-3.9,.8,.9,1.1)]:
        for i in range(8):
            r=random.Random(i+int((x+6)*100));ball('Small extraction rubble',x+(r.random()-.5)*w,y+(r.random()-.5)*d,-.12,.03+r.random()*.025,STONE,(1.7,1,.7))
    for x,y,w,d,h in [(1.1,-2.5,1.5,3,.37),(3.8,-2.6,1.1,2.7,.42),(4.7,.2,1.4,3.2,.43),(1.6,.3,1.2,2.4,.5),(2.2,2.4,2.6,1.15,.4)]:
        box('Low ANCAP industrial nave',x,y,.14,w,d,h,CREAM)
        longitudinal_roof('Shallow industrial nave roof',x,y,.14+h,w+.1,d+.1,.12,GREY)
    # Tall light-grey preheater with open structural piers, decks and ducts.
    x=3.5;y=1.2
    for dx in [-.33,.33]:
        for dy in [-.3,.3]:box('Preheater concrete upright',x+dx,y+dy,.15,.075,.075,1.65,STONE)
    for z in [.55,.95,1.35,1.8]:
        box('Preheater service platform',x,y,z,.88,.78,.06,STONE)
        for dx in [-.42,.42]:beam('Platform guard rail',(x+dx,y-.38,z+.03),(x+dx,y-.38,z+.18),.012,IRON)
    for dx in [-.17,.17]:
        cylinder('Preheater vertical process cylinder',x+dx,y,.28,.13,1.45,STONE,20)
        cylinder('Preheater tapered hopper',x+dx,y,1.72,.03,.35,STONE,20,r2=.18)
    for dx in [-.47,.47]:beam('External process duct',(x+dx,y-.15,.2),(x+dx,y-.15,1.65),.045,STONE,12)
    for xx,yy,rr,top in [(x-.42,y-.5,.075,1.48),(x,y-.55,.11,1.38),(x+.39,y-.48,.065,1.21)]:
        beam('Large visible front process pipe',(xx,yy,.18),(xx,yy,top),rr,STONE,16)
        beam('Visible pipe upper elbow',(xx,yy,top),(xx+.13,yy,top+.16),rr,STONE,16)
        for zz in [.4,.8,1.1]:
            cylinder('Pipe joining collar',xx,yy,zz,rr*1.17,.035,STONE,16)
    beam('Large transverse process connection',(x+.39,y-.48,1.21),(x+.84,y-.48,1.45),.065,STONE,16)
    for z in [.55,.95,1.35]:
        beam('Front diagonal structural brace',(x-.32,y-.32,z),(x+.32,y-.32,z+.35),.016,GREY,8)
        beam('Side diagonal structural brace',(x+.33,y-.3,z),(x+.33,y+.3,z+.35),.016,GREY,8)
    for dx,dy,r,h in [(0,0,.3,.88),(.65,0,.3,.88),(1.3,0,.3,.88)]:
        cylinder('ANCAP cement silo',1+dx,1.65+dy,.14,r,h,STONE,28)
        cylinder('Low silo cap',1+dx,1.65+dy,1.02,r,.07,GREY,28,r2=.18)
    beam('Covered elevated conveyor',(1,1.7,.83),(3.5,1.2,1.45),.075,STONE,8)
    walk=box('Elevated service walkway floor',2.15,1.55,.94,2.35,.36,.045,STONE);walk.rotation_euler[2]=-.2
    for side in [-1,1]:
        beam('Long walkway guardrail',(1,1.7+side*.18,1.13),(3.3,1.24+side*.18,1.13),.012,IRON)
        for k in range(7):
            xx=1+k*2.3/6;yy=1.7-k*.46/6+side*.18
            beam('Walkway guardrail upright',(xx,yy,.98),(xx,yy,1.14),.009,IRON,6)
    beam('Covered discharge conveyor',(3.5,1.2,.55),(4.8,-1,.7),.065,GREY,8)
    for j in range(3):box('Open stockpile bays',1.2+j*.6,3.45,.14,.45,.75,.13,STONE)
    # Vegetation is confined to the wooded western and northern sectors visible
    # in the orthophoto. No circular ring of arbitrary trees around the site.
    noise=random.Random(32021);placed=0
    for i in range(1400):
        x=-6.6+noise.random()*4.8;y=-5.8+noise.random()*11.8
        if x<-4.9 or (y>3.9 and x<-2) or (x<-2 and y<-4.3):
            tree(x,y,.17+noise.random()*.11,.12);placed+=1
            if placed>=240:break
    text('ANCAP identifying compound plaque','ANCAP · MINAS',2.2,-5.0,.17,.22,IRON)

def quarry34():
    # Benched pit outline digitised as a simplified original contour from IDE's
    # 2017–2018 orthophoto, checked against Cementos Artigas / MIEM photographs.
    grass=material('Verdun quarry grassy surroundings','#7c885e');dust=material('Verdun quarry pale bench dust','#b9b3a3')
    rocks=[material('Verdun grey sedimentary face','#85877d'),material('Verdun pink sedimentary face','#998478'),material('Verdun dark sedimentary face','#747c77')]
    base(14,15)
    outline=[(-3.9,4.9),(-2.5,5.1),(-.8,4.95),(.9,5.25),(2.2,4.9),(3.05,3.8),(3.6,2.3),(3.55,.5),(3.05,-.9),(1.9,-1.85),(.9,-2.4),(-.3,-3.15),(-1.8,-3.4),(-3.1,-2.85),(-3.85,-1.7),(-4.1,.1),(-4.2,1.8),(-4.05,3.3)]
    outline.reverse() # CCW top faces; preserve the through-hole and inward risers.
    center=Vector((-.4,1.0));n=len(outline)
    # Interpolated contour has gentle irregularity; all neighbouring faces share
    # vertices. Flat benches alternate with exposed vertical faces, not discs.
    sampled=[]
    for i,a in enumerate(outline):
        b=outline[(i+1)%n]
        for k in range(5):
            t=k/5;sampled.append(Vector((a[0]*(1-t)+b[0]*t,a[1]*(1-t)+b[1]*t)))
    loops=[];heights=[]
    for step in range(7):
        radius=1-step*.105
        for ratio,z in [(radius,1.15-step*.145),(radius-.018,1.15-(step+1)*.145)]:
            loops.append([center+(p-center)*ratio for p in sampled]);heights.append(max(.12,z))
    count=len(sampled);verts=[(p.x,p.y,heights[i])for i,loop in enumerate(loops)for p in loop];faces=[];types=[]
    for row in range(len(loops)-1):
        for i in range(count):
            j=(i+1)%count;faces.append((row*count+i,row*count+j,(row+1)*count+j,(row+1)*count+i));types.append(1+(i//5)%3 if row%2==0 else 0)
    faces.append(tuple((len(loops)-1)*count+i for i in range(count)));types.append(0)
    mesh=bpy.data.meshes.new('Continuous benched mine, no gaps');mesh.from_pydata(verts,[],faces);mesh.update();obj=bpy.data.objects.new('Mina Verdun open benched pit',mesh);bpy.context.collection.objects.link(obj)
    for mat in [dust]+rocks:mesh.materials.append(mat)
    for face,index in zip(mesh.polygons,types):face.material_index=index
    # Annular surrounding land, with a real hole for the quarry.
    vertices=[];faces=[];outer=[]
    for p in sampled:
        d=p-center;f=min((7-abs(center.x))/max(abs(d.x),.001),(7.5-abs(center.y))/max(abs(d.y),.001));q=center+d*f;outer.append(q);vertices.extend([(p.x,p.y,1.15),(q.x,q.y,1.15)])
    for i in range(count):j=(i+1)%count;faces.append((2*i,2*i+1,2*j+1,2*j))
    mesh=bpy.data.meshes.new('Quarry rim with central hole');mesh.from_pydata(vertices,[],faces);mesh.update();obj=bpy.data.objects.new('Grassy quarry rim',mesh);bpy.context.collection.objects.link(obj);assign(obj,grass)
    vertices=[(p.x,p.y,z)for p in outer for z in [0,1.15]];faces=[]
    for i in range(count):j=(i+1)%count;faces.append((2*i,2*j,2*j+1,2*i+1))
    mesh=bpy.data.meshes.new('Closed outer context sides');mesh.from_pydata(vertices,[],faces);mesh.update();obj=bpy.data.objects.new('Solid quarry diorama sides',mesh);bpy.context.collection.objects.link(obj);assign(obj,rocks[0])
    # Low industrial compound south of the pit, in the orthophoto's actual sector.
    ground_polygon('South cement works hardstand',[(-2,-3.8),(3.6,-3),(5.7,-5.3),(2.4,-6.8),(-2.6,-5.7)],1.162,dust)
    for x,y,w,d,h in [(.2,-4.5,2.6,.75,.26),(2,-5,1.2,2,.34),(3.6,-4,1.5,1.1,.29)]:
        box('Low cement works nave',x,y,1.17,w,d,h,CREAM);longitudinal_roof('Cement works shallow roof',x,y,1.17+h,w+.05,d+.05,.12,GREY)
    for i in range(3):cylinder('South cement works silo',.4+i*.42,-5.6,1.17,.18,.72,STONE,20)
    mapped_path('North to east perimeter road',[(-6,5.9),(-2,6.3),(2.8,5.7),(5.2,3.7),(5.8,.4),(5.2,-3.3),(2.8,-6.5)],.28,1.18,dust)
    for ix in range(8):
        for iy in range(9):
            x=4.7+ix*.23;y=-1.6+iy*.65
            if x<6.7:tree(x,y,.16+.03*((ix+iy)%3),1.15)

def generic_export_metadata(model_id):
    if model_id == 61:
        return {'id':61,'workflow':'Blender 4.5 reconstruction from the July 2026 photo gallery with original embedded PBR textures','survey':False,'sourceDossier':'reports/experience-review/molino-viejo/references/','qa':'Acceptance recorded separately in docs/molino-viejo-review.json'}
    return {'id':model_id,'workflow':'Blender 4.5 photo-informed authored geometry','survey':False,'sourceDossier':'reports/experience-review/next-quality/references/','qa':'pending independent comparison'}

def palette():
    global WHITE,CREAM,OCHRE,YELLOW,MINT,PINK,STONE,GREY,IRON,WOOD,DARK,TILE,BRICK,TRIM_RED,BRONZE,PAVING,LEAF,BARK,GLASS,RED,BLUE
    WHITE=material('Ivory mouldings','#eee9d9');CREAM=material('Cream plaster','#d9d1b5');OCHRE=material('Cathedral ochre plaster','#d4b568')
    YELLOW=material('School yellow plaster','#d3c665');MINT=material('Pale green facade','#c9d8c4');PINK=material('Pale pink trim','#d7b7a2')
    STONE=material('Grey masonry','#a1a197');GREY=material('Aged grey roof','#7b8281');IRON=material('Dark ironwork','#39494b',.65,.35)
    WOOD=material('Old timber joinery','#695447');DARK=material('Deep recess and glass','#263e40',.35);TILE=material('Red terracotta roofs','#a66748')
    BRICK=material('Historic red brick','#a06e53');TRIM_RED=material('Raised red masonry details','#be8d6d');BRONZE=material('Bronze bell','#8e7142',.45,.55)
    PAVING=material('Context stone paving','#aaab9c');LEAF=material('Broadleaf canopy','#527455');BARK=material('Tree bark','#79634e')
    GLASS=material('Skylight glass','#789ca0',.23);RED=material('Welded robot oxide red','#a84a38',.75,.35);BLUE=material('Museum sign blue','#28596d')

BUILDERS={27:culture27,28:cuna28,29:plaza29,30:pitch30,32:industrial32,34:quarry34,35:station35,36:belloni36,37:school37,38:school38,40:irisarri40,42:culture42,43:cemetery43,44:alfajor44,45:theatre45,47:house47,48:teresita48,60:miniatures60,61:mill61}

def finish(model_id):
    # Convert letters and merge static geometry by material, preserving individual forms.
    for obj in list(bpy.context.scene.objects):
        if obj.type=='FONT':
            bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH')
    groups={}
    for o in list(bpy.context.scene.objects):
        if o.type=='MESH':groups.setdefault(tuple(m.name for m in o.data.materials),[]).append(o)
    for objs in groups.values():
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:o.select_set(True)
        bpy.context.view_layer.objects.active=objs[0]
        bpy.ops.object.join()
    bpy.ops.object.select_all(action='SELECT')
    for o in bpy.context.selected_objects:o['reference_informed']=True
    bpy.context.scene['model_provenance']=json.dumps(generic_export_metadata(model_id))
    output=OUT/f'gms-{model_id}.glb'
    bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',export_yup=True,export_apply=True,export_extras=True,export_cameras=False,export_lights=False)
    return output

def render_review(model_id):
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True
    scene.render.resolution_x=800;scene.render.resolution_y=650;scene.render.resolution_percentage=100
    scene.world.color=(.22,.26,.28)
    if model_id in [32,34]:
        scene.world.use_nodes=True
        scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.76,.7,1)
        scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
    scene.view_settings.view_transform='Standard'
    objs=[o for o in scene.objects if o.type=='MESH'];coords=[o.matrix_world@Vector(c) for o in objs for c in o.bound_box]
    lo=Vector(tuple(min(v[i] for v in coords) for i in range(3)));hi=Vector(tuple(max(v[i] for v in coords)for i in range(3)))
    target=(lo+hi)/2;size=max(hi-lo)
    bpy.ops.object.light_add(type='AREA',location=(-size,-size,size*1.7));light=bpy.context.object;light.data.energy=1800;light.data.shape='DISK';light.data.size=size
    light.rotation_euler=(target-light.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.light_add(type='AREA',location=(size,-size*.2,size));bpy.context.object.data.energy=700;bpy.context.object.data.size=size
    bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=size*1.35
    for label,pos in [('front',(0,-size*1.8,target.z+.6)),('oblique',(size*1.15,-size*1.6,size*.9))]:
        cam.location=pos;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(REVIEW/f'{model_id}-{label}.png');bpy.ops.render.render(write_still=True)

def main():
    OUT.mkdir(parents=True,exist_ok=True);REVIEW.mkdir(parents=True,exist_ok=True)
    args=sys.argv[sys.argv.index('--')+1:] if '--'in sys.argv else []
    ids=[int(a)for a in args if a.isdigit()]or list(BUILDERS)
    for model_id in ids:
        bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
        MATS.clear();palette();BUILDERS[model_id]();path=finish(model_id)
        if '--render'in args:render_review(model_id)
        print('MODEL_BUILT',model_id,path,flush=True)

if __name__=='__main__':main()

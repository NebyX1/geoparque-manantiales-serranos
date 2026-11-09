"""Molino Viejo, Minas: photo-informed July 2026 reconstruction, not a survey.

Source dossier: reports/experience-review/molino-viejo/references/.
All textures are original procedural fields. No reference photograph is embedded.
This module is called by architecture_models.mill61 and shares its export palette.
"""
import math
import bpy
from mathutils import Vector, noise


def build(a):
    plaster = a.material('Molino - warm ivory restored plaster', '#e5e0ce', .94)
    trim = a.material('Molino - wide taupe window reveals', '#b3ad99', .92)
    basecoat = a.material('Molino - taupe grey plinth', '#b4ad9b', .95)
    white = a.material('Molino - ivory cornice and white glazed ring', '#eeeade', .83)
    roof = a.material('Molino - ochre roof membrane', '#b9a16b', .95)
    timber = a.material('Molino - reddish timber window joinery', '#794c36', .82)
    doorwood = a.material('Molino - entrance vertical timber boards', '#97774e', .87)
    iron = a.material('Molino - fine dark window grilles', '#303a38', .68, .2)
    glass = a.material('Molino - recessed smoky window glass', '#3c5254', .34, .08)
    upperglass = a.material('Molino - upper glazed observation band', '#62787c', .3, .1)
    dark = a.material('Molino - interior shade', '#283531', 1)
    ground = a.material('Molino - neutral paved study setting', '#9b9c8b', .98)
    grass = a.material('Molino - restrained lawn border', '#818a62', 1)
    stone = textured_stone(a, 'Molino - mottled grey beige tower', '#98958a')
    capmat = textured_stone(a, 'Molino - curved aged mineral cap', '#99917c', dome=True)
    mineral_trim = a.material('Molino - mineral ledge below grouped upper windows', '#a39f90', .95)

    width, depth, floor, cornice = 12, 15.6, .24, 3.34
    a.box('Molino study plinth', 0, -.25, -.16, 14.5, 19.8, .16, ground, .035)
    a.box('Molino low floor slab', 0, 0, 0, width, depth, floor, basecoat)
    # Neutral context remains distinct from a measured site plan or neighbouring school.
    for side in [-1, 1]:
        a.box('Narrow grass margin', side * 6.8, .35, .003, .52, 15.9, .025, grass)

    def oriented_box(name, u, length, bottom, height, mat, side, inset=0, thickness=.28):
        if side in ['front', 'back']:
            y = (-depth / 2 if side == 'front' else depth / 2)
            sign = -1 if side == 'front' else 1
            return a.box(name, u, y + sign * inset, bottom, length, thickness, height, mat)
        x = (-width / 2 if side == 'left' else width / 2)
        sign = -1 if side == 'left' else 1
        return a.box(name, x + sign * inset, u, bottom, thickness, length, height, mat)

    front = [(-4.55, 1.22, 1.03, 2.22), (-2.3, 1.22, 1.03, 2.22),
             (0, 1.38, floor, 2.58), (2.3, 1.22, 1.03, 2.22), (4.55, 1.22, 1.03, 2.22)]
    lateral = [(u, 1.24, 1.03, 2.22) for u in [-6.3, -4.2, -2.1, 0, 2.1, 4.2, 6.3]]
    back = [(u, 1.22, 1.03, 2.22) for u in [-4.55, -2.3, 2.3, 4.55]]

    def wall(side, openings):
        # Miter the wall extents instead of overlapping four closed boxes.
        length = width + .28 if side in ['front', 'back'] else depth - .28
        cursor = -length / 2
        for u, w, bottom, top in openings:
            left, right = u - w / 2, u + w / 2
            if left > cursor:
                oriented_box('Solid plaster wall between actual openings', (cursor + left) / 2,
                             left - cursor, floor, cornice - floor, plaster, side)
            if bottom > floor:
                oriented_box('Masonry below recessed sill', u, w, floor, bottom - floor, plaster, side)
            oriented_box('Masonry above recessed opening', u, w, top, cornice - top, plaster, side)
            cursor = right
        if cursor < length / 2:
            oriented_box('End masonry pier', (cursor + length / 2) / 2,
                         length / 2 - cursor, floor, cornice - floor, plaster, side)

    for side, openings in [('front', front), ('back', back), ('left', lateral), ('right', lateral)]:
        wall(side, openings)
    paint_band = rectangular_ring('Continuous taupe plinth with mitered corners',
                                  width + .38, depth + .38, .015, .48, .20, basecoat)
    cutter = a.box('Temporary entrance paint clearance', 0, -depth / 2, 0, 1.55, .8, .55, dark)
    modifier = paint_band.modifiers.new('Paint band interrupted at entrance', 'BOOLEAN')
    modifier.operation = 'DIFFERENCE'; modifier.solver = 'EXACT'; modifier.object = cutter
    bpy.context.view_layer.objects.active = paint_band
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    bpy.data.objects.remove(cutter, do_unlink=True)

    def frame(side, u, w, bottom, top, is_door=False):
        h = top - bottom
        # Outer taupe surround, inner timber frame, glass behind the actual hole.
        for du in [-w / 2 - .095, w / 2 + .095]:
            oriented_box('Wide taupe vertical window surround', u + du, .19, bottom,
                         h, trim, side, inset=.18, thickness=.11)
        for z in [bottom - .16, top]:
            oriented_box('Taupe lintel or sill surround', u, w + .38, z, .16,
                         trim, side, inset=.183, thickness=.12)
        if is_door:
            oriented_box('Entrance deep shadow', u, w, bottom, h, dark, side, inset=-.18, thickness=.025)
            count = 12
            for j in range(count):
                oriented_box('Entrance timber vertical board', u - w / 2 + (j + .5) * w / count,
                             w / count - .014, bottom + .018, h - .03,
                             doorwood, side, inset=-.05, thickness=.065)
            oriented_box('Entrance centre seam', u, .024, bottom, h, dark, side, inset=-.008, thickness=.012)
            return
        oriented_box('Glass within thick masonry recess', u, w - .06, bottom + .03,
                     h - .06, glass, side, inset=-.14, thickness=.025)
        for du in [-w / 2 + .04, 0, w / 2 - .04]:
            oriented_box('Reddish timber window upright', u + du, .055, bottom, h,
                         timber, side, inset=-.09, thickness=.06)
        for z in [bottom, bottom + h * .55, top - .05]:
            oriented_box('Reddish timber window crosspiece', u, w, z, .055,
                         timber, side, inset=-.09, thickness=.06)
        for j in range(8):
            oriented_box('Fine black vertical grille bar', u - w * .44 + j * w * .88 / 7,
                         .026, bottom + .045, h - .09, iron, side, inset=.035, thickness=.032)
        for z in [bottom + .1, bottom + h * .52, top - .1]:
            oriented_box('Black horizontal grille rail', u, w - .07, z, .028,
                         iron, side, inset=.04, thickness=.035)

    for side, openings in [('front', front), ('back', back), ('left', lateral), ('right', lateral)]:
        for u, w, bottom, top in openings:
            frame(side, u, w, bottom, top, side == 'front' and u == 0)

    # Continuous thin cornice, low parapet and the ochre flat surface visible in aerials.
    a.box('Flat ochre waterproofed roof', 0, 0, cornice - .05, width, depth, .09, roof)
    rectangular_ring('Continuous lower cornice bead', width + .56, depth + .56,
                     cornice - .08, .09, .45, white)
    rectangular_ring('Low ivory parapet wall', width + .28, depth + .28,
                     cornice + .01, .19, .24, plaster)
    rectangular_ring('Thin upper parapet coping', width + .56, depth + .56,
                     cornice + .2, .055, .38, white)
    for side in ['front', 'back', 'left', 'right']:
        length = width if side in ['front', 'back'] else depth
        for u in ([-5.4, -3.6, -1.8, 0, 1.8, 3.6, 5.4] if side in ['front', 'back']
                  else [-7, -5.2, -3.4, -1.6, .2, 2, 3.8, 5.6, 7.3]):
            oriented_box('Small visible eaves bracket', u, .14, cornice - .28,
                         .11, white, side, inset=.13, thickness=.29)

    # Front threshold, short steps and the visible side approach with a simple rail.
    for j in range(3):
        a.box('Entrance shallow stone step', 0, -8.3 - j * .32, 0,
              3.3, 1.25 - j * .3, floor - j * .075, trim)
    for side in [-1, 1]:
        a.box('Entrance timber door jamb', side * .72, -7.96, floor, .07, .09, 2.36, timber)
        a.box('Small black wall lantern backplate', side * .98, -7.98, 2.35, .09, .06, .25, iron)
        a.box('Small black wall lantern body', side * .98, -8.055, 2.43, .16, .12, .2, glass)
        a.box('Small wall lantern cap', side * .98, -8.055, 2.63, .2, .16, .04, iron)
    ramp_vertices = [(-5.8, -8.9, 0), (-1.7, -8.9, 0), (-1.7, -7.95, 0), (-5.8, -7.95, 0),
                     (-5.8, -8.9, .025), (-1.7, -8.9, floor), (-1.7, -7.95, floor), (-5.8, -7.95, .025)]
    ramp_mesh = bpy.data.meshes.new('Sloped front approach')
    ramp_mesh.from_pydata(ramp_vertices, [], [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
                                              (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
    ramp_mesh.update()
    ramp_obj = bpy.data.objects.new('Photo-supported low entrance ramp', ramp_mesh)
    bpy.context.collection.objects.link(ramp_obj); ramp_mesh.materials.append(trim)
    for x in [-5.55, -3.7, -1.85]:
        level = .025 + (x + 5.8) / 4.1 * (floor - .025)
        a.beam('Front approach slender rail upright', (x, -8.9, level), (x, -8.9, level + .67), .021, iron)
    a.beam('Front approach sloped handrail', (-5.55, -8.9, .71), (-1.85, -8.9, .91), .026, iron)

    # The photo-supported tower profile has broad courses, a shoulder, a short
    # glazed ring and a rounded cap. No ashlar grid, battlements or invented sails.
    cx, cy = 0, -.7
    bottom, shoulder, band_bottom, band_top = cornice, 8.5, 9.04, 9.61
    def radius(z):
        if z <= shoulder:
            return 1.89 - (z - bottom) / (shoulder - bottom) * .29
        t = (z - shoulder) / (band_bottom - shoulder)
        return 1.60 - .19 * (t * t * (3 - 2 * t))
    rows = 104
    profile = []
    for row in range(rows + 1):
        z = bottom + (band_bottom - bottom) * row / rows
        # Very shallow incised horizontal construction seams, not raised brick strips.
        seam = sum(math.exp(-((z - level) / .018) ** 2) for level in [4.05, 4.92, 5.79, 6.66, 7.53, 8.4])
        profile.append((radius(z) - .02 * seam, z))
    tower = lathe('Tapering rough mill tower with broad horizontal construction marks',
                  profile, cx, cy, stone, 128)
    # Cut actual recesses into the curved solid before placing the timber/glass.
    for z, h in [(3.71, .96), (5.34, .74), (6.95, .67)]:
        r = radius(z + h / 2)
        cutter = a.box('Temporary tower opening cutter', cx, cy - r + .19, z,
                       .56, .78, h, dark)
        modifier = tower.modifiers.new('Recessed rectangular tower opening', 'BOOLEAN')
        modifier.operation = 'DIFFERENCE'; modifier.solver = 'EXACT'; modifier.object = cutter
        bpy.context.view_layer.objects.active = tower
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        bpy.data.objects.remove(cutter, do_unlink=True)
        # Timber frame and quiet interior, recessed behind the real curved reveal.
        a.box('Tower window glass recessed inside wall', cx, cy - r + .52, z + .035,
              .48, .025, h - .07, glass)
        for x in [-.265, .265]:
            a.box('Tower reddish timber jamb', cx + x, cy - r + .21, z, .055, .06, h, timber)
        for zz in [z, z + h - .055]:
            a.box('Tower timber sill and lintel', cx, cy - r + .21, zz, .54, .06, .055, timber)
    cylindrical_uv(tower, cx, cy, bottom, band_bottom)

    # Photos show groups of short white sashes separated by broad masonry piers;
    # it is not an uninterrupted panoramic glass observation gallery.
    a.cylinder('Shade behind glazed observation band', cx, cy, band_bottom,
               1.30, band_top - band_bottom, dark, 80)
    for z in [band_bottom - .025, band_top - .04]:
        lathe('Thin mineral ledge at grouped window level',
              [(1.38, z), (1.45, z), (1.45, z + .065), (1.38, z + .065)], cx, cy, mineral_trim, 100)
    panes = 20
    pane_width = 2 * 1.412 * math.sin(math.pi / panes)
    for quadrant in range(4):
        begin = (quadrant * 5 + 3) * math.tau / panes
        end = (quadrant * 5 + 5) * math.tau / panes
        pier = ring_sector('Broad mineral pier between groups of upper windows',
                           cx, cy, 1.22, 1.415, band_bottom + .03, band_top - .015,
                           begin, end, stone)
        cylindrical_uv(pier, cx, cy, bottom, band_top)
    for i in range(panes):
        if i % 5 >= 3:
            continue
        angle = (i + .5) * math.tau / panes
        def tangent_box(name, du, z, w, height, mat, radial=1.416, thickness=.055):
            x = cx + radial * math.cos(angle) - du * math.sin(angle)
            y = cy + radial * math.sin(angle) + du * math.cos(angle)
            obj = a.box(name, x, y, z, w, thickness, height, mat)
            obj.rotation_euler[2] = angle + math.pi / 2
            return obj
        tangent_box('Short glazed pane below curved cap', 0, band_bottom + .065,
                    pane_width - .035, .44, upperglass, radial=1.397, thickness=.018)
        for du in [-pane_width / 2 + .025, pane_width / 2 - .025]:
            tangent_box('White upper observation sash upright', du, band_bottom + .04,
                        .045, .49, white)
        for z in [band_bottom + .04, band_top - .06]:
            tangent_box('White upper observation sash rail', 0, z, pane_width, .045, white)

    cap_profile = [(1.455, band_top - .015), (1.49, band_top + .04)]
    for i in range(1, 30):
        t = i * (math.pi / 2) / 30
        cap_profile.append((1.49 * math.cos(t), band_top + .04 + 1.18 * math.sin(t)))
    cap_profile.append((0, band_top + 1.22))
    lathe('Rounded hemispherical mill cap - no conical roof', cap_profile, cx, cy, capmat, 128)
    # Flush roof details are restrained; no fake chimney or added ornamental tower.
    for x, y in [(3.25, -3.7), (-3.65, 4.6)]:
        a.box('Low rectangular roof access panel', x, y, cornice + .045, .7, 1.02, .035, trim)
        a.box('Inset roof access panel face', x, y, cornice + .081, .57, .88, .01, roof)
    bpy.context.scene['molino_reference'] = 'La Union 2026-07-09 gallery; geometric study, not surveyed or a claim of completed works'


def lathe(name, profile, cx, cy, mat, segments):
    vertices, faces = [], []
    pole = profile[-1][0] == 0
    rings = profile[:-1] if pole else profile
    for radius, z in rings:
        for i in range(segments + 1):
            angle = i * math.tau / segments
            vertices.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle), z))
    stride = segments + 1
    for row in range(len(rings) - 1):
        for i in range(segments):
            p = row * stride + i
            faces.append((p, p + 1, p + 1 + stride, p + stride))
    if pole:
        top = len(vertices); vertices.append((cx, cy, profile[-1][1]))
        start = (len(rings) - 1) * stride
        for i in range(segments): faces.append((start + i, start + i + 1, top))
    faces.append(tuple(reversed(range(segments))))
    mesh = bpy.data.meshes.new(name); mesh.from_pydata(vertices, [], faces); mesh.update()
    obj = bpy.data.objects.new(name, mesh); bpy.context.collection.objects.link(obj)
    mesh.materials.append(mat)
    for face in mesh.polygons: face.use_smooth = len(face.vertices) == 4
    cylindrical_uv(obj, cx, cy, profile[0][1], profile[-1][1])
    return obj


def rectangular_ring(name, width, depth, z, height, thickness, mat):
    outer = [(-width / 2, -depth / 2), (width / 2, -depth / 2),
             (width / 2, depth / 2), (-width / 2, depth / 2)]
    inner = [(x - math.copysign(thickness, x), y - math.copysign(thickness, y)) for x, y in outer]
    vertices = [(x, y, zz) for zz in [z, z + height] for ring in [outer, inner] for x, y in ring]
    faces = []
    for i in range(4):
        j = (i + 1) % 4
        faces.extend([(i, j, j + 8, i + 8), (i + 4, i + 12, j + 12, j + 4),
                      (i + 8, j + 8, j + 12, i + 12), (i, i + 4, j + 4, j)])
    mesh = bpy.data.meshes.new(name); mesh.from_pydata(vertices, [], faces); mesh.update()
    obj = bpy.data.objects.new(name, mesh); bpy.context.collection.objects.link(obj); mesh.materials.append(mat)
    return obj


def ring_sector(name, cx, cy, inner, outer, bottom, top, begin, end, mat):
    profile = [(inner, bottom), (outer, bottom), (outer, top), (inner, top)]
    vertices, faces = [], []
    segments = 12
    for i in range(segments + 1):
        angle = begin + (end - begin) * i / segments
        vertices.extend((cx + r * math.cos(angle), cy + r * math.sin(angle), z) for r, z in profile)
    for i in range(segments):
        for j in range(4):
            p = i * 4 + j; q = i * 4 + (j + 1) % 4
            faces.append((p, p + 4, q + 4, q))
    faces.extend([(3, 2, 1, 0), tuple(segments * 4 + j for j in range(4))])
    mesh = bpy.data.meshes.new(name); mesh.from_pydata(vertices, [], faces); mesh.update()
    obj = bpy.data.objects.new(name, mesh); bpy.context.collection.objects.link(obj); mesh.materials.append(mat)
    import bmesh
    bm = bmesh.new(); bm.from_mesh(mesh); bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces)); bm.to_mesh(mesh); bm.free()
    return obj
    return obj


def cylindrical_uv(obj, cx, cy, bottom, top):
    mesh = obj.data
    uv = mesh.uv_layers.active or mesh.uv_layers.new(name='Original cylindrical procedural texture')
    for face in mesh.polygons:
        values = []
        for loop in face.loop_indices:
            p = mesh.vertices[mesh.loops[loop].vertex_index].co
            u = math.atan2(p.y - cy, p.x - cx) / math.tau + .5
            values.append((loop, u, (p.z - bottom) / max(.01, top - bottom)))
        crossing = max(u for _, u, _ in values) - min(u for _, u, _ in values) > .5
        for loop, u, v in values:
            uv.data[loop].uv = (u + (1 if crossing and u < .5 else 0), v)


def textured_stone(a, name, color, dome=False):
    mat = a.material(name, color, .97)
    size = 512
    image = bpy.data.images.new(name + ' original procedural albedo', width=size, height=size)
    normal_image = bpy.data.images.new(name + ' original fine mineral normal', width=size, height=size)
    normal_image.colorspace_settings.name = 'Non-Color'
    # Stored as reusable baked PBR images in GLB; Blender-only procedural nodes
    # would otherwise disappear in Three.js. Continuous periodic coordinates
    # avoid an artificial vertical seam on the cylindrical unwrap.
    pixels, normals = [], []
    base = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    for y in range(size):
        v = y / size
        for x in range(size):
            angle = x / size * math.tau
            p = Vector((math.cos(angle) * 3.1, math.sin(angle) * 3.1, v * 8.7))
            broad = noise.noise(p, noise_basis='PERLIN_ORIGINAL')
            patches = noise.noise(p * 3.7 + Vector((7, 1, 3)), noise_basis='PERLIN_ORIGINAL')
            grain = noise.noise(p * 41, noise_basis='PERLIN_ORIGINAL')
            stain = broad * .12 + patches * .055 + grain * .035
            if not dome:
                seams = sum(math.exp(-((v - (level - 3.34) / 5.7) / .0026) ** 2)
                            for level in [4.05, 4.92, 5.79, 6.66, 7.53, 8.4])
                stain += seams * .037
            pixels.extend([max(.05, min(.95, c + stain + (.012 if i == 0 else 0)))
                           for i, c in enumerate(base)] + [1])
            gx = noise.noise(p * 30 + Vector((1, 2, 3)), noise_basis='PERLIN_ORIGINAL') * .1
            gy = noise.noise(p * 30 + Vector((5, 9, 2)), noise_basis='PERLIN_ORIGINAL') * .1
            normals.extend([.5 + gx, .5 + gy, .985, 1])
    image.pixels.foreach_set(pixels); image.pack()
    normal_image.pixels.foreach_set(normals); normal_image.pack()
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    shader = nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (1, 1, 1, 1)
    texture = nodes.new('ShaderNodeTexImage'); texture.image = image
    links.new(texture.outputs['Color'], shader.inputs['Base Color'])
    normal_texture = nodes.new('ShaderNodeTexImage'); normal_texture.image = normal_image
    normal_node = nodes.new('ShaderNodeNormalMap'); normal_node.inputs['Strength'].default_value = .23
    links.new(normal_texture.outputs['Color'], normal_node.inputs['Color'])
    links.new(normal_node.outputs['Normal'], shader.inputs['Normal'])
    return mat

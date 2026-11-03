# The Learning Loop from a CPG field perspective: case stacks, shelves and price tags, a back bar, a checkout.
# Usage: Blender -b -P loop_mockups3.py -- /out/dir   (ONLY=<concept_fn> renders one)
import bpy, bmesh, math, sys, os
from mathutils import Vector

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "."
STEPS = [("01", "Recognize", "See the pattern"), ("02", "Diagnose", "Understand what's driving it"), ("03", "Prioritize", "Decide what matters most"),
         ("04", "Act", "Choose under uncertainty"), ("05", "Defend", "Make the case"), ("06", "Lead", "Change how decisions get made")]
FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
def srgb(h):
    r, g, b = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b), 1.0)
C = dict(ivory="#F5F5F0", ink="#171717", ink2="#4A4A46", kraft="#C8A872", kraft2="#B8975F", tape="#D9C9A3", paper="#FAF8F2", steel="#9A9C9E", steel2="#7E8183",
         wood="#4A3326", wood2="#2E201A", amber="#6B3A12", green="#1E3A2A", copper="#9E5F3B", rubber="#232323", chrome="#B9BCC0", cream="#EFE9DA", red="#B3261E")
def mat(name, col, rough=0.6, metal=0.0, alpha=1.0, emit=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = srgb(col); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if alpha < 1: b.inputs["Alpha"].default_value = alpha; m.blend_method = "BLEND"
    if emit: b.inputs["Emission Color"].default_value = srgb(col); b.inputs["Emission Strength"].default_value = emit
    return m
M = lambda k, rough=0.6, metal=0.0, **kw: mat(f"{k}-{rough}-{metal}-{kw.get('emit', 0)}", C[k], rough, metal, **kw)

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.samples = 220; sc.cycles.use_denoising = True
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences; prefs.compute_device_type = "METAL"; prefs.get_devices()
        for d in prefs.devices: d.use = True
        sc.cycles.device = "GPU"
    except Exception: sc.cycles.device = "CPU"
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1800, 1125, 100
    if os.environ.get("TRANSPARENT"):
        sc.render.film_transparent = True; sc.render.image_settings.color_mode = "RGBA"
        sc.render.resolution_x, sc.render.resolution_y = 2400, 1500
    w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes["Background"]; bg.inputs[0].default_value = srgb(C["ivory"]); bg.inputs[1].default_value = 1.0
    try: sc.view_settings.view_transform = "Standard"
    except Exception: pass
    return sc

def lights(key=2.4):
    sun = bpy.data.lights.new("sun", "SUN"); sun.energy = key; sun.angle = math.radians(7); sun.color = (1.0, 0.97, 0.92)
    o = bpy.data.objects.new("sun", sun); bpy.context.collection.objects.link(o); o.rotation_euler = (math.radians(52), math.radians(-12), math.radians(32))
    for name, loc, rot, e, size in (("fill", (-8, -9, 7), (52, 0, -40), 900, 10), ("rim", (7, 7, 7), (-48, 0, 135), 700, 5), ("top", (0, -2, 12), (0, 0, 0), 500, 12)):
        l = bpy.data.lights.new(name, "AREA"); l.energy = e; l.size = size; ob = bpy.data.objects.new(name, l); bpy.context.collection.objects.link(ob)
        ob.location = loc; ob.rotation_euler = tuple(math.radians(v) for v in rot)

def camera(loc, target, lens=50):
    cam = bpy.data.cameras.new("cam"); cam.lens = lens
    o = bpy.data.objects.new("cam", cam); bpy.context.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler(); bpy.context.scene.camera = o; return o
def face_cam(): return bpy.context.scene.camera.rotation_euler
def ground():
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.01)); g = bpy.context.active_object; g.data.materials.append(mat("ground", C["ivory"], 0.9)); g.is_shadow_catcher = True

def box(loc, size, m, bevel=0.03, segs=4, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.active_object; o.scale = size; bpy.ops.object.transform_apply(scale=True); o.rotation_euler = rot
    if bevel: b = o.modifiers.new("bevel", "BEVEL"); b.width = bevel; b.segments = segs
    o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = bevel > 0
    return o
def cyl(loc, r, h, m, verts=64, rot=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=verts); o = bpy.context.active_object; o.rotation_euler = rot; o.data.materials.append(m)
    if bevel: b = o.modifiers.new("bevel", "BEVEL"); b.width = bevel; b.segments = 4
    for p in o.data.polygons: p.use_smooth = True
    return o
def text(body, loc, size, m, rot=(0, 0, 0), align="CENTER", extrude=0.002, spacing=1.0):
    c = bpy.data.curves.new("t", "FONT"); c.body = body; c.size = size; c.extrude = extrude; c.align_x = align; c.space_line = spacing
    try: c.font = bpy.data.fonts.load(FONT)
    except Exception: pass
    o = bpy.data.objects.new("t", c); bpy.context.collection.objects.link(o); o.location = loc; o.rotation_euler = rot; o.data.materials.append(m); return o
FRONT = (math.radians(90), 0, 0)  # text standing up, readable from -Y
def barcode(loc, w, h, m, rot=FRONT, n=22):
    import random; random.seed(int(loc[0] * 100 + loc[2] * 10))
    x = -w / 2
    while x < w / 2:
        bw = random.choice((0.012, 0.02, 0.03)); box((loc[0] + x + bw / 2, loc[1], loc[2]), (bw, 0.004, h), m, bevel=0); x += bw + random.choice((0.012, 0.02))
# A card standing up and leaning back by `tilt` degrees (0 = upright, facing -Y). Text goes on its front face.
def tilted_card(center, w, h, tilt, m, thick=0.006):
    # Text is parented to the card and placed in the card's own space, so it sits on the face whatever the tilt.
    t = math.radians(tilt); cx, cy, cz = center
    box(center, (w, thick, t and h or h), m, bevel=0, rot=(-t, 0, 0))
    # A card rotated by -tilt about X leans its top toward the viewer (-Y); the same trigonometry that placed the receipt's lines.
    def put(body, dx, dz, size, mm, align="CENTER"):
        pos = (cx + dx, cy - thick / 2 - 0.003 + dz * math.sin(t), cz + dz * math.cos(t))  # the card's top leans back (+Y)
        text(body, pos, size, mm, rot=(math.radians(90) - t, 0, 0), align=align)
    return put
def loop_mark(loc, r, m, rot=FRONT):
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=r * 0.16, location=loc, major_segments=48, minor_segments=12); t = bpy.context.active_object
    t.rotation_euler = rot; t.data.materials.append(m)
    cone((loc[0] + r * 0.98, loc[1], loc[2] + r * 0.2), (0, 0, 1), m, r=r * 0.42, h=r * 0.7)
def cone(loc, direction, m, r=0.2, h=0.4):
    bpy.ops.mesh.primitive_cone_add(radius1=r, depth=h, location=loc, vertices=32); o = bpy.context.active_object
    o.rotation_euler = Vector(direction).to_track_quat("Z", "Y").to_euler(); o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    return o
def render(name):
    bpy.context.scene.render.filepath = os.path.join(OUT, name); bpy.ops.render.render(write_still=True); print("rendered", name)

# ---------- 1. The end cap: six cases stacked 3-2-1 on a pallet, each printed like a case label ----------
def case(loc, size, n, name, sub):
    w, d, h = size; box(loc, size, M("kraft"), bevel=0.02)
    box((loc[0], loc[1], loc[2] + h / 2 + 0.002), (w * 0.14, d, 0.004), M("tape"), bevel=0)  # packing tape down the middle
    y = loc[1] - d / 2 - 0.003; ink = M("ink", rough=0.8)
    # The label fills the case face: a big number top-left, the name across the middle, the one-liner under it.
    text(n, (loc[0] - w * 0.44, y, loc[2] + h * 0.04), h * 0.5, ink, rot=FRONT, align="LEFT")
    text(name.upper(), (loc[0] - w * 0.44, y, loc[2] - h * 0.23), h * 0.22, ink, rot=FRONT, align="LEFT")
    text(sub, (loc[0] - w * 0.44, y, loc[2] - h * 0.41), h * 0.12, M("ink2", rough=0.8), rot=FRONT, align="LEFT")
    barcode((loc[0] + w * 0.34, y, loc[2] + h * 0.33), w * 0.16, h * 0.12, ink)

def concept_endcap():
    reset(); lights(); ground(); camera((3.2, -10.6, 4.1), (0, 0, 1.85), 58)
    # pallet: three runners and top slats
    for x in (-2.4, 0, 2.4): box((x, 0, 0.06), (0.14, 2.3, 0.12), M("wood2"), bevel=0.01)
    for y in (-1.0, -0.6, -0.2, 0.2, 0.6, 1.0): box((0, y, 0.16), (5.3, 0.3, 0.08), M("wood"), bevel=0.01)
    W, D, H = 1.7, 1.05, 1.0; z1 = 0.2 + H / 2; gap = 0.06
    spots = [(-(W + gap), z1), (0, z1), ((W + gap), z1), (-(W + gap) / 2, z1 + H + 0.02), ((W + gap) / 2, z1 + H + 0.02), (0, z1 + 2 * (H + 0.02))]
    for (x, z), (n, name, sub) in zip(spots, STEPS): case((x, 0.1, z), (W, D, H), n, name, sub)
    # a shelf talker clipped to the top case: back to the start
    top = spots[-1][1] + H / 2
    box((0.9, -0.5, top + 0.02), (0.02, 0.06, 0.22), M("chrome", 0.35, 1.0), bevel=0)
    card = box((0.9, -0.53, top + 0.36), (1.3, 0.012, 0.5), M("paper", 0.7), bevel=0.0)
    loop_mark((0.43, -0.542, top + 0.4), 0.09, M("copper", 0.5, 1.0)); text("BACK TO 01", (0.58, -0.539, top + 0.36), 0.16, M("ink"), rot=FRONT, align="LEFT")
    text("EVERY QUARTER", (0.58, -0.539, top + 0.19), 0.1, M("ink2"), rot=FRONT, align="LEFT")
    render("cpg-1-endcap.png")

# ---------- 2. The shelf: a gondola bay, six packs, a price tag under each, and a tag that says where it goes next ----------
def pack(loc, size, n, name, sub, body="paper", accent="ink"):
    w, d, h = size; box(loc, size, M(body, 0.55), bevel=0.012)
    y = loc[1] - d / 2 - 0.003
    box((loc[0], y + 0.001, loc[2] + h * 0.3), (w * 0.9, 0.002, h * 0.3), M(accent), bevel=0)  # a colour block like a brand band
    text(n, (loc[0], y - 0.001, loc[2] + h * 0.22), h * 0.2, M("paper"), rot=FRONT)
    text(name, (loc[0], y, loc[2] - h * 0.05), h * 0.13, M("ink"), rot=FRONT)
    text(sub, (loc[0], y, loc[2] - h * 0.2), h * 0.055, M("ink2"), rot=FRONT)
def tag(loc, w, n, name, sub, last=False):
    # a shelf-edge label: the number sits where the price goes
    box(loc, (w, 0.01, 0.17), M("paper", 0.7), bevel=0)
    y = loc[1] - 0.007
    text(n, (loc[0] - w / 2 + 0.03, y, loc[2] - 0.055), 0.12, M("ink"), rot=FRONT, align="LEFT")
    text(name.upper(), (loc[0] - w / 2 + 0.26, y, loc[2] + 0.015), 0.045, M("ink"), rot=FRONT, align="LEFT")
    text(sub, (loc[0] - w / 2 + 0.26, y, loc[2] - 0.045), 0.03, M("ink2"), rot=FRONT, align="LEFT")
    if last: text("then back to 01", (loc[0] + w / 2 - 0.03, y, loc[2] - 0.055), 0.04, M("copper", 0.5, 1.0), rot=FRONT, align="RIGHT")
def concept_shelf():
    reset(); lights(); ground(); camera((1.4, -8.6, 2.3), (0, 0, 1.4), 50)
    box((0, 0.55, 1.5), (4.6, 0.1, 3.0), M("steel2", 0.5, 0.3), bevel=0.01)             # back panel
    for x in (-2.25, 2.25): box((x, 0.3, 1.5), (0.1, 0.6, 3.0), M("steel2", 0.5, 0.3), bevel=0.01)  # uprights
    for zi, z in enumerate((0.85, 1.9)):
        box((0, 0.2, z), (4.4, 0.7, 0.03), M("steel", 0.35, 0.6), bevel=0.005)          # shelf
        box((0, -0.16, z - 0.07), (4.4, 0.02, 0.17), M("steel", 0.35, 0.6), bevel=0)      # tag channel
        row = STEPS[3:] if zi == 1 else STEPS[:3]
        for i, (n, name, sub) in enumerate(row):
            x = -1.45 + i * 1.45; w, d, h = (0.78, 0.5, 0.95) if (i + zi) % 2 == 0 else (0.62, 0.42, 0.78)
            pack((x, 0.15, z + 0.015 + h / 2), (w, d, h), n, name, sub, accent=("copper" if n == "06" else "ink"))
            tag((x, -0.175, z - 0.07), 1.3, n, name, sub, last=(n == "06"))
    render("cpg-2-shelf.png")

# ---------- 3. The back bar: six bottles with the steps on their labels, stools, and a table-tent menu ----------
def bottle(loc, n, name, kind):
    glass = M(kind, 0.12)
    cyl((loc[0], loc[1], loc[2] + 0.5), 0.17, 1.0, glass, bevel=0.03); cyl((loc[0], loc[1], loc[2] + 1.15), 0.07, 0.4, glass)
    cyl((loc[0], loc[1], loc[2] + 1.38), 0.075, 0.08, M("copper", 0.4, 1.0))
    # paper label on the front
    box((loc[0], loc[1] - 0.17, loc[2] + 0.5), (0.24, 0.006, 0.36), M("cream", 0.75), bevel=0)
    text(n, (loc[0], loc[1] - 0.175, loc[2] + 0.55), 0.12, M("ink"), rot=FRONT); text(name.upper(), (loc[0], loc[1] - 0.175, loc[2] + 0.4), 0.045, M("ink"), rot=FRONT)
def stool(loc):
    cyl((loc[0], loc[1], 0.72), 0.2, 0.06, M("wood", 0.5), bevel=0.015); cyl((loc[0], loc[1], 0.36), 0.03, 0.7, M("chrome", 0.3, 1.0))
    cyl((loc[0], loc[1], 0.02), 0.2, 0.03, M("chrome", 0.3, 1.0))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.17, minor_radius=0.012, location=(loc[0], loc[1], 0.25)); t = bpy.context.active_object; t.data.materials.append(M("chrome", 0.3, 1.0))
def concept_backbar():
    reset(); lights(1.8); ground(); camera((0.9, -7.6, 1.9), (0.2, 0.6, 1.35), 42)
    box((0, 2.2, 1.6), (5.6, 0.12, 3.2), M("wood2", 0.55), bevel=0.01)                   # back wall
    box((0, 1.95, 1.55), (5.0, 0.42, 0.05), M("wood", 0.45), bevel=0.005)                # bottle shelf
    box((0, 1.95, 1.52), (4.9, 0.02, 0.02), M("copper", 0.5, 1.0, emit=2.0), bevel=0)   # a warm strip under the bottles
    kinds = ("amber", "green", "amber", "amber", "green", "amber")
    for i, (n, name, sub) in enumerate(STEPS): bottle((-2.0 + i * 0.8, 1.95, 1.575), n, name, kinds[i])
    box((0, 0.6, 1.0), (5.2, 0.7, 0.07), M("wood", 0.35), bevel=0.01)                    # bar top
    box((0, 0.6, 0.48), (5.2, 0.6, 0.96), M("wood2", 0.6), bevel=0.01)                   # bar front
    for x in (-1.5, 0.0, 1.5): stool((x, -0.4))
    # table tent on the bar: the loop as a menu (front card leans back 15°, the back card leans forward to meet it)
    put = tilted_card((1.25, 0.42, 1.215), 0.5, 0.36, 0, M("cream", 0.75))
    box((1.25, 0.49, 1.215), (0.5, 0.006, 0.36), M("cream", 0.75), bevel=0, rot=(math.radians(-22), 0, 0))  # the back leaf leans away
    put("THE LOOP", 0, 0.135, 0.034, M("copper", 0.5, 1.0))
    for i, (n, name, sub) in enumerate(STEPS): put(f"{n}  {name}", -0.2, 0.085 - i * 0.037, 0.026, M("ink"), align="LEFT")
    put("then back to 01", 0, -0.145, 0.022, M("ink2"))
    render("cpg-3-backbar.png")

# ---------- 4. The checkout: six packs on the belt, and the loop itemised on the receipt ----------
def concept_register():
    reset(); lights(); ground(); camera((1.6, -5.6, 2.4), (-0.1, 0.4, 1.05), 45)
    box((0, 0.3, 0.42), (5.0, 1.3, 0.84), M("cream", 0.7), bevel=0.02)                    # the lane
    box((-0.6, 0.3, 0.86), (3.6, 0.6, 0.04), M("rubber", 0.85), bevel=0.01)              # belt
    box((-0.6, 0.3, 0.845), (3.62, 0.72, 0.01), M("steel", 0.4, 0.6), bevel=0)           # belt frame
    # packs on the belt, waiting their turn
    for i, (n, name, sub) in enumerate(STEPS):
        x = -2.15 + i * 0.6; w, d, h = (0.42, 0.3, 0.52) if i % 2 == 0 else (0.36, 0.3, 0.42)
        pack((x, 0.2, 0.88 + h / 2), (w, d, h), n, name, sub, accent=("copper" if n == "06" else "ink"))
    # the register
    box((1.65, 0.45, 1.0), (0.9, 0.6, 0.32), M("steel2", 0.45, 0.4), bevel=0.02)
    box((1.65, 0.6, 1.42), (0.7, 0.05, 0.5), M("ink", 0.3), bevel=0.02, rot=(math.radians(-15), 0, 0))  # screen
    for r in range(3):
        for c in range(4): box((1.42 + c * 0.14, 0.28 - r * 0.12, 1.17), (0.1, 0.09, 0.04), M("cream", 0.6), bevel=0.01)
    # the receipt: the loop itemised
    put = tilted_card((1.65, 0.5, 1.62), 0.52, 1.1, 0, M("paper", 0.8), thick=0.004)
    def rline(dz, left, right=None, m=None, size=0.032):
        put(left, -0.21, dz, size, m or M("ink"), align="LEFT")
        if right: put(right, 0.21, dz, size, m or M("ink"), align="RIGHT")
    rline(0.46, "DECISION OS", size=0.04); rline(0.40, "THE LOOP", m=M("ink2"), size=0.028)
    for i, (n, name, sub) in enumerate(STEPS): rline(0.31 - i * 0.072, f"{n}  {name.upper()}", "1", size=0.03)
    rline(-0.16, "SUBTOTAL", "6", size=0.03); rline(-0.23, "REPEAT", "EVERY QUARTER", m=M("copper", 0.5, 1.0), size=0.03)
    rline(-0.33, "THANK YOU. COME BACK.", m=M("ink2"), size=0.026)
    render("cpg-4-register.png")

ONLY = os.environ.get("ONLY")
for fn in (concept_endcap, concept_shelf, concept_backbar, concept_register):
    if ONLY and fn.__name__ != ONLY: continue
    try: fn()
    except Exception as e:
        import traceback; traceback.print_exc(); print("FAILED", fn.__name__, e)

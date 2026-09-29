import json, math, subprocess, sys
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
EDL = json.load(open('edl.json'))
WORDS = json.load(open('outwords.json'))
FACES = json.load(open('faces.json'))
NF = 751
ONLY = None
if len(sys.argv) > 1:
    ONLY = [int(x) for x in sys.argv[1].split(',')]

# ---------------- identity ----------------
GREEN = (61, 242, 154)
ORANGE = (255, 154, 60)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
DARK = (7, 14, 10)

def font(size, w=900, mono=False):
    f = ImageFont.truetype('fonts/JBMono.ttf' if mono else 'fonts/Montserrat.ttf', size)
    f.set_variation_by_axes([w])
    return f

_fc = {}
def F(size, w=900, mono=False):
    k = (size, w, mono)
    if k not in _fc: _fc[k] = font(size, w, mono)
    return _fc[k]

# ---------------- easing ----------------
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp(x); return x * x * (3 - 2 * x)
def back_out(x, s=1.9):
    x = clamp(x); x -= 1; return x * x * ((s + 1) * x + s) + 1
def prog(t, a, d): return clamp((t - a) / d)
def lerp(a, b, x): return a + (b - a) * x

# ---------------- source timing / face track ----------------
seg_out = []
o = 0
for s, e in EDL:
    seg_out.append((o, o + (e - s), s)); o += e - s

def src_time(t):
    for a, b, s in seg_out:
        if a <= t < b: return s + (t - a), a
    a, b, s = seg_out[-1]; return s + (t - a), a

ft = np.array([f[0] for f in FACES if f[1]]); fx = np.array([f[1] for f in FACES if f[1]]); fy = np.array([f[2] for f in FACES if f[2]])
def face_at(ts):
    return float(np.interp(ts, ft, fx)), float(np.interp(ts, ft, fy))

# smoothed per-output-frame face position (smoothing restarts at each cut)
raw = []
for i in range(NF):
    t = i / FPS; ts, sa = src_time(t); raw.append((sa, *face_at(ts)))
smooth = []
for i in range(NF):
    sa = raw[i][0]
    idx = [j for j in range(max(0, i - 20), min(NF, i + 21)) if raw[j][0] == sa]
    wts = np.array([math.exp(-((j - i) / 9.0) ** 2) for j in idx])
    xs = np.array([raw[j][1] for j in idx]); ys = np.array([raw[j][2] for j in idx])
    smooth.append((float((xs * wts).sum() / wts.sum()), float((ys * wts).sum() / wts.sum())))

# ---------------- zoom / layout timeline ----------------
def zoom_full(t):
    if t < 2.733: return lerp(1.08, 1.15, t / 2.733)
    if t < 4.39: return lerp(1.30, 1.24, ease_out((t - 2.733) / 0.5))
    if t < 6.0: return lerp(1.24, 1.12, ease_io((t - 4.39) / 0.35))
    if t < 8.52: return lerp(1.18, 1.23, (t - 6.0) / 2.5)
    if t < 9.6: return lerp(1.23, 1.33, back_out((t - 8.52) / 0.22))
    if t < 17.267: return 1.2
    if t < 18.833: return lerp(1.22, 1.33, ease_io((t - 17.267) / 0.8))
    if t < 21.6: return lerp(1.12, 1.18, (t - 18.833) / 2.8)
    if t < 23.333: return 1.26
    return lerp(1.14, 1.2, (t - 23.333) / 1.7)

SPLIT_IN, SPLIT_OUT = 9.55, 17.25
def split_p(t):
    return ease_io(prog(t, SPLIT_IN, 0.35)) * (1 - ease_io(prog(t, SPLIT_OUT, 0.3)))

SEAM = 960

def face_crop(frame, fxy, Wr, Hr, z):
    a = Wr / Hr
    if a < 1920 / 1080: ch = 1080.0; cw = ch * a
    else: cw = 1920.0; ch = cw / a
    ch /= z; cw /= z
    fx, fy = fxy
    x0 = clamp(fx - cw / 2, 0, 1920 - cw)
    y0 = clamp(fy - 0.40 * ch, 0, 1080 - ch)
    # sub-pixel accurate crop via affine warp
    sx = Wr / cw; sy = Hr / ch
    M = np.array([[sx, 0, -x0 * sx], [0, sy, -y0 * sy]], np.float32)
    return cv2.warpAffine(frame, M, (Wr, Hr), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

def sharpen(img):
    bl = cv2.GaussianBlur(img, (0, 0), 1.6)
    return cv2.addWeighted(img, 1.45, bl, -0.45, 0)

VIGN = None
def vignette(img):
    global VIGN
    h, w = img.shape[:2]
    if VIGN is None or VIGN.shape[:2] != (h, w):
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
        VIGN = (1 - 0.28 * np.clip(d - 0.55, 0, 1) ** 1.4)[..., None].astype(np.float32)
    return (img.astype(np.float32) * VIGN).astype(np.uint8)

# ---------------- captions ----------------
words = []
for w in WORDS:
    if w[2] == '.5' and words: words[-1][2] += '.5'; words[-1][1] = w[1]; continue
    words.append(list(w))
SIZES = [3,4,4,2,3,3,2,4,3,2,3,3,2,2,4,5,4,1,5,2,4,6,2,5,2,4,2,4,2,2,5]
assert sum(SIZES) == len(words), (sum(SIZES), len(words))
chunks = []; k = 0
for n in SIZES:
    chunks.append(words[k:k + n]); k += n
KEY_G = {'EVOLUÇÃO','IA','EXTREMAMENTE','INCRÍVEL','SITE','10','MILHÕES','CÓDIGO','MONKEY','CODE','PESQUISA','OLHADA','LINK','DESCRIÇÃO','SEGUE','EDITAR'}
KEY_O = {'CLAUDE','OPUS','5.5'}
def clean(s):
    s = s.upper().strip()
    while s and s[-1] in '.,': s = s[:-1]
    return s
chunk_times = []
for i, c in enumerate(chunks):
    st = c[0][0] - 0.06
    en = chunks[i + 1][0][0] - 0.06 if i + 1 < len(chunks) else c[-1][1] + 0.6
    en = min(en, c[-1][1] + 0.45)
    chunk_times.append((st, en))

def draw_caption(img, t, cy):
    d = ImageDraw.Draw(img)
    for ci, c in enumerate(chunks):
        st, en = chunk_times[ci]
        if not (st <= t < en): continue
        if 17.95 <= t < 18.8: return  # logo reveal owns the screen
        pin = back_out(prog(t, st, 0.16))
        size = 84
        f = F(size, 900)
        toks = [clean(w[2]) for w in c]
        # layout with wrapping at 900px
        sp = 20
        lines = [[]]; lw = 0
        for j, tk in enumerate(toks):
            wl = f.getlength(tk) * 1.05
            if lines[-1] and lw + sp + wl > 900:
                lines.append([]); lw = 0
            lines[-1].append(j); lw += (sp if lw else 0) + wl
        lh = 104
        y0 = cy - lh * len(lines) / 2
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
        for li, ln in enumerate(lines):
            widths = [f.getlength(toks[j]) * 1.05 for j in ln]
            tot = sum(widths) + sp * (len(ln) - 1)
            x = W / 2 - tot / 2
            y = y0 + li * lh
            for j, wd in zip(ln, widths):
                w = c[j]; tk = toks[j]
                active = w[0] - 0.04 <= t < (c[j + 1][0] - 0.04 if j + 1 < len(c) else en)
                spoken = t >= w[0] - 0.04
                sc = 1.0
                if active: sc = 1.0 + 0.09 * (1 - ease_out(prog(t, w[0] - 0.04, 0.18)) * 0.4)
                col = WHITE if spoken else (255, 255, 255)
                if tk in KEY_G or tk in KEY_O:
                    col = GREEN if tk in KEY_G else ORANGE
                fs = int(size * sc)
                ff = F(fs, 900)
                cxw = x + wd / 2; cyw = y + lh / 2
                if active and (tk in KEY_G or tk in KEY_O):
                    tw = ff.getlength(tk); pad = 16
                    bx = [cxw - tw / 2 - pad, cyw - fs * 0.62, cxw + tw / 2 + pad, cyw + fs * 0.62]
                    ld.rounded_rectangle(bx, 18, fill=col + (255,))
                    ld.text((cxw, cyw), tk, font=ff, fill=BLACK, anchor='mm')
                else:
                    ld.text((cxw, cyw + 6), tk, font=ff, fill=(0, 0, 0, 150), anchor='mm')
                    ld.text((cxw, cyw), tk, font=ff, fill=col + ((255 if spoken else 235),), anchor='mm', stroke_width=7, stroke_fill=BLACK)
                x += wd + sp
        # pop-in scale about caption centre
        if pin < 0.999:
            s = 0.75 + 0.25 * pin
            lay = layer.resize((int(W * s), int(H * s)), Image.BILINEAR)
            layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            ox = int(W / 2 - W * s / 2); oy = int(cy - cy * s)
            layer.alpha_composite(lay, (ox, oy))
            a = np.array(layer); a[..., 3] = (a[..., 3] * clamp(pin * 1.6)).astype(np.uint8); layer = Image.fromarray(a)
        img.alpha_composite(layer)
        return

# ---------------- assets ----------------
SITE = Image.open('assets/site_desktop.png').convert('RGB')
CARD = Image.open('assets/free_card.png').convert('RGB')
LOGO = Image.open('assets/logo-dark.png').convert('RGBA')
LOGO_L = Image.open('assets/logo-light.png').convert('RGBA')

def panel_bg(w, h, t):
    bg = Image.new('RGB', (w, h), DARK)
    d = ImageDraw.Draw(bg)
    off = int((t * 30) % 60)
    for x in range(-60, w + 60, 60): d.line([(x + off, 0), (x + off, h)], fill=(16, 34, 24), width=1)
    for y in range(0, h, 60): d.line([(0, y), (w, y)], fill=(16, 34, 24), width=1)
    glow = Image.new('L', (w, h), 0); gd = ImageDraw.Draw(glow)
    gd.ellipse([w * 0.1, h * 0.15, w * 0.9, h * 0.95], fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    col = Image.new('RGB', (w, h), (30, 140, 90))
    bg = Image.composite(col, bg, glow)
    return bg.convert('RGBA')

def shadowed(card, radius=28, blur=30, alpha=160):
    w, h = card.size
    sh = Image.new('RGBA', (w + blur * 4, h + blur * 4), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([blur * 2, blur * 2 + 16, blur * 2 + w, blur * 2 + h + 16], radius, fill=(0, 0, 0, alpha))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    mask = Image.new('L', (w, h), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius, fill=255)
    c2 = card.convert('RGBA'); c2.putalpha(mask)
    sh.alpha_composite(c2, (blur * 2, blur * 2))
    return sh, blur * 2

def browser_card(t, t0):
    cw, bar = 960, 64
    ih = int(cw / 1.6)
    card = Image.new('RGBA', (cw, bar + ih), (22, 26, 24, 255))
    d = ImageDraw.Draw(card)
    for i, c in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
        d.ellipse([26 + i * 34, 22, 46 + i * 34, 42], fill=c)
    d.rounded_rectangle([140, 13, cw - 30, 51], 19, fill=(40, 46, 43))
    d.text((170, 32), 'monkeycode-ai.net', font=F(26, 500, True), fill=(210, 230, 220), anchor='lm')
    # Ken Burns toward the agent panel (right side of the hero)
    k = ease_io(prog(t, t0 + 0.3, 3.2))
    z = lerp(1.0, 1.9, k)
    cx = lerp(1440, 1950, k); cy = lerp(900, 880, k)
    sw, sh_ = 2880 / z, 1800 / z
    box = (cx - sw / 2, cy - sh_ / 2, cx + sw / 2, cy + sh_ / 2)
    box = (clamp(box[0], 0, 2880 - sw), clamp(box[1], 0, 1800 - sh_))
    crop = SITE.crop((int(box[0]), int(box[1]), int(box[0] + sw), int(box[1] + sh_))).resize((cw, ih), Image.LANCZOS)
    card.paste(crop, (0, bar))
    return card

def fmt_int(n): return f'{n:,}'.replace(',', '.')

def panel_site(t):
    p = panel_bg(W, SEAM, t)
    d = ImageDraw.Draw(p)
    a = ease_out(prog(t, 9.6, 0.45))
    card = browser_card(t, 9.6)
    sc = lerp(0.9, 1.0, back_out(prog(t, 9.6, 0.5), 1.4))
    card = card.resize((int(card.width * sc), int(card.height * sc)), Image.LANCZOS)
    shc, o = shadowed(card)
    x = W // 2 - card.width // 2 - o; y = 250 - o + int((1 - a) * 90)
    p.alpha_composite(shc, (x, y))
    # label chip
    la = ease_out(prog(t, 9.95, 0.35))
    if la > 0:
        txt = 'TESTANDO: CRIAÇÃO DE SITE'
        f = F(34, 800); tw = f.getlength(txt)
        chip = Image.new('RGBA', (int(tw + 60), 64), (0, 0, 0, 0))
        ImageDraw.Draw(chip).rounded_rectangle([0, 0, chip.width - 1, 63], 32, fill=GREEN + (255,))
        ImageDraw.Draw(chip).text((chip.width / 2, 32), txt, font=f, fill=BLACK, anchor='mm')
        chip.putalpha(chip.getchannel('A').point(lambda v: int(v * la)))
        p.alpha_composite(chip, (W // 2 - chip.width // 2, 175 + int((1 - la) * -30)))
    return p

CARD_CROP = CARD.crop((0, 90, 790, 610))
def panel_tokens(t):
    p = panel_bg(W, SEAM, t)
    d = ImageDraw.Draw(p)
    t0 = 15.05
    k = ease_out(prog(t, t0, 0.6))
    val = int(round(10_000_000 * k / 1000) * 1000) if k < 1 else 10_000_000
    txt = fmt_int(val)
    # number with glow
    f = F(150, 900)
    glow = Image.new('RGBA', (W, 260), (0, 0, 0, 0))
    ImageDraw.Draw(glow).text((W / 2, 130), txt, font=f, fill=GREEN + (200,), anchor='mm')
    glow = glow.filter(ImageFilter.GaussianBlur(22))
    punch = 1 + 0.08 * (1 - ease_out(prog(t, t0 + 0.6, 0.25))) if t >= t0 + 0.6 else 1.0
    num = Image.new('RGBA', (W, 260), (0, 0, 0, 0))
    ImageDraw.Draw(num).text((W / 2, 130), txt, font=f, fill=GREEN if t >= t0 else (90, 120, 105), anchor='mm')
    if punch != 1.0:
        num = num.resize((int(W * punch), int(260 * punch)), Image.LANCZOS)
    ia = ease_out(prog(t, 14.45, 0.35))
    yo = 150 + int((1 - ia) * -40)
    p.alpha_composite(glow, (0, yo))
    p.alpha_composite(num, (W // 2 - num.width // 2, yo + 130 - num.height // 2))
    d = ImageDraw.Draw(p)
    d.text((W / 2, yo + 270), 'TOKENS POR DIA  •  GRÁTIS', font=F(52, 800), fill=WHITE, anchor='mm')
    # evidence card from the official pricing section
    ca = ease_out(prog(t, 15.7, 0.4))
    if ca > 0:
        cw = 620; chh = int(CARD_CROP.height * cw / CARD_CROP.width)
        cc = CARD_CROP.resize((cw, chh), Image.LANCZOS).convert('RGBA')
        cd = ImageDraw.Draw(cc)
        # highlight "Daily quota: 10M tokens/day" row (y≈571 in source card)
        s = cw / 790; ry = (571 - 90) * s
        hk = ease_out(prog(t, 16.1, 0.35))
        cd.rounded_rectangle([38 * s, ry - 32 * s, 38 * s + (540 * s) * hk + 12, ry + 32 * s], 10, outline=ORANGE, width=5)
        shc, o = shadowed(cc, 22, 24, 170)
        rot = shc.rotate(-2.5 * (1 - ca) - 1.5, resample=Image.BICUBIC, expand=True)
        p.alpha_composite(rot, (W // 2 - rot.width // 2, 470 - o + int((1 - ca) * 80)))
        d.text((W / 2, 905), 'fonte: monkeycode-ai.net — plano Basic', font=F(28, 600), fill=(170, 200, 185), anchor='mm')
    return p

def draw_top_gradient(img, strength):
    if strength <= 0: return
    g = np.zeros((H, W, 4), np.uint8)
    ys = np.arange(760)
    al = (np.clip(1 - ys / 760, 0, 1) ** 1.3 * 190 * strength).astype(np.uint8)
    g[:760, :, 3] = al[:, None]
    img.alpha_composite(Image.fromarray(g))

def hook(img, t):
    if t > 6.1: return
    out = 1 - ease_io(prog(t, 5.75, 0.3))
    draw_top_gradient(img, out)
    d = ImageDraw.Draw(img)
    a1 = ease_out(prog(t, 0.0, 0.25)); a2 = back_out(prog(t, 0.12, 0.35))
    if a1 <= 0: return
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
    ld.text((W / 2, 290 - (1 - a1) * 40), 'ESTE VÍDEO FOI', font=F(66, 900), fill=WHITE, anchor='mm', stroke_width=5, stroke_fill=BLACK)
    f2 = F(int(104 * (0.6 + 0.4 * a2)), 900)
    ld.text((W / 2, 395), 'EDITADO POR IA', font=f2, fill=GREEN, anchor='mm', stroke_width=7, stroke_fill=BLACK)
    # underline sweep
    uw = 640 * ease_out(prog(t, 0.35, 0.4))
    ld.rounded_rectangle([W / 2 - uw / 2, 462, W / 2 + uw / 2, 472], 5, fill=GREEN)
    # Claude chip
    ca = back_out(prog(t, 2.78, 0.3))
    if ca > 0:
        txt = 'CLAUDE OPUS 5.5'
        f = F(44, 900); tw = f.getlength(txt)
        cw_, ch_ = int(tw + 110), 84
        chip = Image.new('RGBA', (cw_, ch_), (0, 0, 0, 0)); cdd = ImageDraw.Draw(chip)
        cdd.rounded_rectangle([0, 0, cw_ - 1, ch_ - 1], 42, fill=ORANGE + (255,))
        # small spark mark
        cx, cy = 44, 42
        for ang in range(0, 360, 45):
            r = 20 if ang % 90 == 0 else 12
            cdd.line([(cx, cy), (cx + r * math.cos(math.radians(ang)), cy + r * math.sin(math.radians(ang)))], fill=BLACK, width=5)
        cdd.text((cw_ / 2 + 26, ch_ / 2), txt, font=f, fill=BLACK, anchor='mm')
        s = 0.5 + 0.5 * ca
        chip = chip.resize((max(1, int(cw_ * s)), max(1, int(ch_ * s))), Image.LANCZOS)
        lay.alpha_composite(chip, (W // 2 - chip.width // 2, 540 - chip.height // 2))
    if out < 1:
        a = np.array(lay); a[..., 3] = (a[..., 3] * out).astype(np.uint8); lay = Image.fromarray(a)
    img.alpha_composite(lay)

def evolution(img, t):
    t0, t1 = 7.0, 9.2
    if not (t0 <= t < t1 + 0.3): return
    out = 1 - ease_io(prog(t, t1, 0.3))
    draw_top_gradient(img, 0.85 * out * ease_out(prog(t, t0, 0.3)))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
    ld.text((W / 2, 250), 'A EVOLUÇÃO DA IA', font=F(64, 900), fill=WHITE, anchor='mm', stroke_width=5, stroke_fill=BLACK)
    # ascending curve drawing in
    k = ease_out(prog(t, t0 + 0.1, 0.9))
    pts = []
    n = 60
    for i in range(int(n * k) + 1):
        u = i / n
        x = 170 + u * 740
        y = 560 - (u ** 2.4) * 230 - 8 * math.sin(u * 9) * (1 - u)
        pts.append((x, y))
    if len(pts) > 1:
        glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(glow).line(pts, fill=GREEN + (200,), width=26, joint='curve')
        lay.alpha_composite(glow.filter(ImageFilter.GaussianBlur(14)))
        ld.line(pts, fill=GREEN, width=12, joint='curve')
        ex, ey = pts[-1]
        ld.ellipse([ex - 16, ey - 16, ex + 16, ey + 16], fill=WHITE, outline=GREEN, width=6)
    # baseline
    ld.line([(160, 575), (920, 575)], fill=(255, 255, 255, 120), width=3)
    if out < 1:
        a = np.array(lay); a[..., 3] = (a[..., 3] * out).astype(np.uint8); lay = Image.fromarray(a)
    img.alpha_composite(lay)

def logo_reveal(img, t):
    t0, t1 = 17.98, 18.8
    if not (t0 - 0.05 <= t < t1 + 0.25): return
    a_in = ease_out(prog(t, t0, 0.12)); a_out = 1 - ease_io(prog(t, t1, 0.22))
    a = a_in * a_out
    bg = panel_bg(W, H, t)
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ov.alpha_composite(bg)
    s = back_out(prog(t, t0, 0.4), 2.2) * (1 + 0.08 * prog(t, t0 + 0.4, 1.0))
    ls = int(470 * max(0.01, s))
    lg = LOGO.resize((ls, ls), Image.LANCZOS)
    # glow behind logo
    gl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(gl).ellipse([W / 2 - 300, 760 - 300, W / 2 + 300, 760 + 300], fill=GREEN + (110,))
    ov.alpha_composite(gl.filter(ImageFilter.GaussianBlur(90)))
    ov.alpha_composite(lg, (W // 2 - ls // 2, 760 - ls // 2))
    wa = ease_out(prog(t, t0 + 0.12, 0.3))
    tl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(tl)
    f = F(118, 800, True)
    w1 = f.getlength('Monkey'); w2 = f.getlength('Code')
    x0 = W / 2 - (w1 + w2) / 2; yy = 1110 + (1 - wa) * 50
    d.text((x0, yy), 'Monkey', font=f, fill=(255, 255, 255, int(255 * wa)), anchor='lm')
    d.text((x0 + w1, yy), 'Code', font=f, fill=GREEN + (int(255 * wa),), anchor='lm')
    sa = ease_out(prog(t, t0 + 0.28, 0.3))
    d.text((W / 2, 1235), 'PLATAFORMA DE IA PARA CÓDIGO', font=F(42, 800), fill=(200, 235, 215, int(255 * sa)), anchor='mm')
    d.text((W / 2, 1300), 'open source  •  by Chaitin', font=F(36, 500, True), fill=(140, 190, 165, int(255 * sa)), anchor='mm')
    ov.alpha_composite(tl)
    arr = np.array(ov); arr[..., 3] = (arr[..., 3] * a).astype(np.uint8)
    img.alpha_composite(Image.fromarray(arr))

def search_bar(img, t):
    t0, t1 = 19.95, 21.5
    if not (t0 <= t < t1 + 0.3): return
    a = ease_out(prog(t, t0, 0.35)) * (1 - ease_io(prog(t, t1, 0.3)))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    y = 300 + (1 - a) * -60
    bx = [90, y, 990, y + 124]
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([bx[0], bx[1] + 14, bx[2], bx[3] + 14], 62, fill=(0, 0, 0, 120))
    lay.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)))
    d.rounded_rectangle(bx, 62, fill=WHITE, outline=GREEN, width=5)
    # magnifier
    mx, my = 160, y + 62
    pulse = 1 + 0.25 * math.sin(math.pi * prog(t, 21.15, 0.2)) if 21.15 <= t < 21.35 else 1
    r = 22 * pulse
    d.ellipse([mx - r, my - r - 4, mx + r, my + r - 4], outline=(30, 30, 30), width=7)
    d.line([(mx + r * 0.7, my + r * 0.7 - 4), (mx + r * 1.45, my + r * 1.45 - 4)], fill=(30, 30, 30), width=8)
    q = 'monkeycode'
    n = int(len(q) * prog(t, 20.3, 0.6))
    txt = q[:n]
    f = F(56, 600, True)
    d.text((215, my), txt, font=f, fill=(20, 20, 20), anchor='lm')
    if (int(t * 3) % 2 == 0 or n < len(q)) and t < 21.1:
        cx = 215 + f.getlength(txt) + 6
        d.line([(cx, my - 30), (cx, my + 30)], fill=(20, 20, 20), width=4)
    # result card
    ra = back_out(prog(t, 20.95, 0.3), 1.5)
    if ra > 0:
        ry = y + 150
        rc = [90, ry, 990, ry + 150]
        d.rounded_rectangle(rc, 30, fill=(14, 22, 18, 245), outline=(61, 242, 154, 180), width=3)
        lg = LOGO_L.resize((96, 96), Image.LANCZOS)
        lay.alpha_composite(lg, (120, int(ry + 27)))
        d.text((240, ry + 55), 'MonkeyCode AI Platform', font=F(44, 800), fill=WHITE, anchor='lm')
        d.text((240, ry + 105), 'monkeycode-ai.net', font=F(34, 500, True), fill=GREEN, anchor='lm')
        # tap ripple
        if t >= 21.15:
            k = prog(t, 21.15, 0.4)
            rr = 20 + 60 * k
            d.ellipse([860 - rr, ry + 75 - rr, 860 + rr, ry + 75 + rr], outline=(255, 255, 255, int(220 * (1 - k))), width=6)
        d.ellipse([845, ry + 60, 875, ry + 90], fill=(255, 255, 255, 230))
    if a < 1:
        arr = np.array(lay); arr[..., 3] = (arr[..., 3] * a).astype(np.uint8); lay = Image.fromarray(arr)
    img.alpha_composite(lay)

def link_pill(img, t):
    t0, t1 = 21.62, 23.2
    if not (t0 <= t < t1 + 0.25): return
    a = back_out(prog(t, t0, 0.35)) ; fo = 1 - ease_io(prog(t, t1, 0.25))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    txt = 'LINK NA DESCRIÇÃO'
    f = F(56, 900); tw = f.getlength(txt)
    pw = tw + 170; ph = 116
    x0 = W / 2 - pw / 2; y0 = 300
    d.rounded_rectangle([x0, y0, x0 + pw, y0 + ph], 58, fill=(10, 18, 14, 235), outline=GREEN, width=5)
    # chain icon
    cx, cy = x0 + 70, y0 + ph / 2
    d.rounded_rectangle([cx - 30, cy - 12, cx + 2, cy + 12], 12, outline=GREEN, width=6)
    d.rounded_rectangle([cx - 4, cy - 12, cx + 28, cy + 12], 12, outline=GREEN, width=6)
    d.text((x0 + 110 + tw / 2, cy), txt, font=f, fill=WHITE, anchor='mm')
    bounce = abs(math.sin((t - t0) * 6)) * 22
    ay = y0 + ph + 30 + bounce
    d.line([(W / 2 - 34, ay), (W / 2, ay + 34), (W / 2 + 34, ay)], fill=GREEN, width=12, joint='curve')
    s = max(0.01, a)
    lay = lay.resize((int(W * s), int(H * s)), Image.BILINEAR) if s < 0.999 or s > 1.001 else lay
    full = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    full.alpha_composite(lay, (int(W / 2 - W * s / 2), int((y0 + ph / 2) - (y0 + ph / 2) * s)))
    arr = np.array(full); arr[..., 3] = (arr[..., 3] * fo).astype(np.uint8)
    img.alpha_composite(Image.fromarray(arr))

def follow_cta(img, t):
    t0 = 23.38
    if t < t0: return
    a = back_out(prog(t, t0, 0.35))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    tap = 24.02
    done = t >= tap + 0.08
    txt = 'SEGUINDO' if done else 'SEGUIR'
    f = F(62, 900); tw = f.getlength(txt)
    pw = tw + 190; ph = 124
    press = 1 - 0.08 * math.sin(math.pi * prog(t, tap - 0.05, 0.22)) if tap - 0.05 <= t < tap + 0.17 else 1
    x0 = W / 2 - pw / 2; y0 = 310
    d.rounded_rectangle([x0, y0, x0 + pw, y0 + ph], 62, fill=GREEN if done else WHITE)
    cx, cy = x0 + 72, y0 + ph / 2
    if done:
        d.line([(cx - 18, cy), (cx - 4, cy + 16), (cx + 22, cy - 16)], fill=BLACK, width=10, joint='curve')
    else:
        d.line([(cx - 20, cy), (cx + 20, cy)], fill=BLACK, width=10); d.line([(cx, cy - 20), (cx, cy + 20)], fill=BLACK, width=10)
    d.text((x0 + 120 + tw / 2, cy), txt, font=f, fill=BLACK, anchor='mm')
    if tap - 0.3 <= t < tap + 0.5:
        k = prog(t, tap, 0.45)
        fx_, fy_ = x0 + pw - 18, y0 + ph - 8
        if t >= tap:
            rr = 30 + 90 * k
            d.ellipse([fx_ - rr, fy_ - rr, fx_ + rr, fy_ + rr], outline=(255, 255, 255, int(230 * (1 - k))), width=7)
        mv = ease_out(prog(t, tap - 0.3, 0.3))
        px, py = fx_ + (1 - mv) * 120, fy_ + (1 - mv) * 140
        d.ellipse([px - 26, py - 26, px + 26, py + 26], fill=(255, 255, 255, 200), outline=(0, 0, 0, 160), width=4)
    s = max(0.01, a * press)
    lay2 = lay.resize((int(W * s), int(H * s)), Image.BILINEAR)
    full = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    full.alpha_composite(lay2, (int(W / 2 - W * s / 2), int((y0 + ph / 2) - (y0 + ph / 2) * s)))
    img.alpha_composite(full)

# ---------------- main loop ----------------
cap = cv2.VideoCapture('cut.mp4')
enc = None
if ONLY is None:
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', 'video_noaudio.mp4'], stdin=subprocess.PIPE)
cache_panel = {}
for i in range(NF):
    ok, fr = cap.read()
    if not ok: fr = last
    last = fr
    if ONLY is not None and i not in ONLY: continue
    t = i / FPS
    fr = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
    sp = split_p(t)
    seam = int(round(SEAM * sp))
    if seam < 4:
        face = face_crop(fr, smooth[i], W, H, zoom_full(t))
        base = vignette(sharpen(face))
    else:
        z = lerp(zoom_full(t), 1.3, sp)
        face = face_crop(fr, smooth[i], W, H - seam, z)
        base = np.zeros((H, W, 3), np.uint8)
        base[seam:] = vignette(sharpen(face))
    img = Image.fromarray(base).convert('RGBA')
    if seam >= 4:
        pnl = panel_site(t) if t < 14.4 else panel_tokens(t)
        if 14.3 <= t < 14.55:  # quick swap flash between panels
            k = prog(t, 14.3, 0.25)
            a_ = panel_site(t); b_ = panel_tokens(t)
            e_ = ease_io(k); pnl = Image.new('RGBA', (W, SEAM), DARK + (255,))
            pnl.alpha_composite(a_, (int(-e_ * W), 0)); pnl.alpha_composite(b_, (int((1 - e_) * W), 0))
        crop = pnl.crop((0, SEAM - seam, W, SEAM))
        img.alpha_composite(crop, (0, 0))
        d = ImageDraw.Draw(img)
        d.rectangle([0, seam - 3, W, seam + 3], fill=GREEN + (255,))
    hook(img, t)
    evolution(img, t)
    logo_reveal(img, t)
    search_bar(img, t)
    link_pill(img, t)
    follow_cta(img, t)
    cy = lerp(1340, SEAM + 100, sp)
    draw_caption(img, t, cy)
    rgb = img.convert('RGB')
    if ONLY is not None:
        rgb.save(f'prev/p_{i:04d}.jpg', quality=88)
    else:
        enc.stdin.write(rgb.tobytes())
    if i % 60 == 0: print('frame', i, flush=True)
if enc:
    enc.stdin.close(); enc.wait()

"""Modelo visual dos carrosséis Roger Machado (estilo post do X, 1080x1350)."""
import base64
import pathlib

BASE = pathlib.Path(__file__).parent
AV = "data:image/png;base64," + base64.b64encode((BASE / "avatar.png").read_bytes()).decode()

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;background:#fff;font-family:'Inter','Liberation Sans',Helvetica,Arial,'Noto Color Emoji',sans-serif;color:#0f1419;overflow:hidden;position:relative}
.wrap{padding:110px 88px 120px 88px;height:100%;display:flex;flex-direction:column}
.head{display:flex;align-items:center;gap:34px}
.av{width:146px;height:146px;border-radius:50%;background:url(AVATAR) center/cover;flex:none}
.name{font-size:50px;font-weight:800;display:flex;align-items:center;gap:12px;letter-spacing:-.5px}
.handle{font-size:38px;color:#536471;margin-top:4px}
.txt{font-size:44px;line-height:1.4;margin-top:46px;letter-spacing:-.3px}
.txt p+p{margin-top:30px}
.txt b{font-weight:800}
.cards{display:flex;gap:22px;margin-top:48px;flex:1;min-height:0}
.card{flex:1;border-radius:30px;overflow:hidden;position:relative;background:radial-gradient(120% 90% at 70% 20%,#1d2a55 0%,#0b1022 55%,#05070f 100%);color:#e8ecff;padding:40px;display:flex;flex-direction:column}
.card.black{background:#000}
.card.center{justify-content:center;align-items:center;text-align:center}
.card.vcenter{justify-content:center}
.coral{color:#E07A5F}
.blue{color:#7c8cff}
.red{color:#ff8a7a}
.pager{position:absolute;right:26px;top:880px;width:48px;height:48px;border-radius:50%;border:2px solid #e3e6ea;display:flex;align-items:center;justify-content:center;color:#9aa4ad;font-size:30px;background:#fff}
.num{position:absolute;right:88px;bottom:56px;font-size:28px;color:#9aa4ad;font-weight:600}
.fonte{position:absolute;left:88px;bottom:58px;font-size:22px;color:#9aa4ad;max-width:800px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lbl{font-size:24px;letter-spacing:3px;text-transform:uppercase;color:#8b95c9;font-weight:700}
.black .lbl{color:#777}
.glow{box-shadow:0 0 0 2px #5b6cff66,0 0 40px #5b6cff55}
.bar{background:#ffffff14;border-radius:14px;height:18px;margin-top:16px}
.item{display:flex;align-items:center;gap:18px;font-size:29px;margin-top:26px;line-height:1.25}
.ic{flex:none;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff}
.big{font-weight:900;line-height:.95;letter-spacing:-2px;white-space:nowrap}
.sub{font-size:24px;color:#9aa0b4;margin-top:16px;line-height:1.35}
.step{border-radius:18px;padding:20px 26px;font-size:28px;font-weight:700;text-align:center;background:#ffffff14}
.black .step{background:#1a1a1a}
.arrow{text-align:center;font-size:30px;color:#6a74a8;margin:8px 0}
.tl{display:flex;gap:22px;margin-top:22px;align-items:flex-start}
.tl .d{flex:none;min-width:130px;font-size:26px;font-weight:800;color:#E07A5F}
.tl .t{font-size:26px;line-height:1.3;color:#dfe3f5}
.card:only-child{padding:48px}
.card:only-child > *{zoom:1.35}
"""

BADGE = ('<svg width="44" height="44" viewBox="0 0 24 24"><path fill="#1D9BF0" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"/>'
         '<path fill="#fff" d="M9.9 16.3 6.4 12.8l1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4z"/></svg>')


def page(text, cards, n, total, fonte=""):
    return f"""<!doctype html><html><head><meta charset=utf-8>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel=stylesheet>
<style>{CSS.replace('AVATAR', AV)}</style></head><body><div class=wrap>
<div class=head><div class=av></div><div><div class=name>Roger Machado {BADGE}</div><div class=handle>@machadomtds</div></div></div>
<div class=txt>{text}</div>
<div class=cards>{''.join(cards)}</div>
</div>{'<div class=pager>›</div>' if n < total else ''}{f'<div class=fonte>Fonte: {fonte}</div>' if fonte else ''}<div class=num>{n}/{total}</div></body></html>"""


# ---------- componentes dos cards ----------

def card(inner, cls=""):
    return f'<div class="card {cls}">{inner}</div>'


def stat(big, label="", sub="", black=True, color="coral", size=200):
    return card(
        (f'<div class=lbl style="margin-bottom:22px">{label}</div>' if label else "")
        + f'<div class="big {color}" style="font-size:{size}px">{big}</div>'
        + (f'<div class=sub style="font-size:28px">{sub}</div>' if sub else ""),
        ("black " if black else "") + "center")


def lista(label, items, icon="✓", cor="#4f5dff", black=False, fs=29):
    li = "".join(
        f'<div class=item style="font-size:{fs}px"><span class=ic style="background:{cor}">{icon}</span><span>{t}</span></div>'
        for t in items)
    return card(f'<div class=lbl>{label}</div>{li}', ("black " if black else "") + "vcenter")


def linha(label, items, black=False):
    li = "".join(f'<div class=tl><div class=d>{d}</div><div class=t>{t}</div></div>' for d, t in items)
    return card(f'<div class=lbl style="margin-bottom:6px">{label}</div>{li}', ("black " if black else "") + "vcenter")


def fluxo(label, steps, black=False, destaque=True):
    out = []
    for i, s in enumerate(steps):
        last = destaque and i == len(steps) - 1
        out.append(f'<div class=step style="{"background:#4f5dff" if last else ""}">{s}</div>')
    return card(f'<div class=lbl style="margin-bottom:24px">{label}</div>' + '<div class=arrow>↓</div>'.join(out),
                ("black " if black else "") + "vcenter")


def aviso(titulo, sub, icone="!", black=True, cor="#555"):
    return card(
        f'<div style="width:130px;height:130px;border-radius:50%;background:#1c1c1c;display:flex;align-items:center;justify-content:center;font-size:70px;font-weight:800;color:{cor}">{icone}</div>'
        f'<div style="font-size:32px;font-weight:800;margin-top:30px;line-height:1.25">{titulo}</div>'
        f'<div class=sub>{sub}</div>', ("black " if black else "") + "center")


def pilula(label, texto, sub="", black=False):
    return card(
        (f'<div class=lbl>{label}</div>' if label else "")
        + f'<div class=glow style="margin-top:30px;border-radius:20px;padding:22px 30px;font-size:34px;font-weight:800;background:#ffffff10">{texto}</div>'
        + (f'<div class=sub style="font-size:26px;margin-top:30px">{sub}</div>' if sub else ""),
        ("black " if black else "") + "center")


def barras(label, rows, black=False):
    mx = max(v for _, v, _ in rows)
    li = "".join(
        f'<div style="margin-top:26px"><div style="display:flex;justify-content:space-between;font-size:27px;font-weight:700"><span>{n}</span><span class=coral>{t}</span></div>'
        f'<div style="margin-top:12px;height:26px;border-radius:13px;background:#ffffff12"><div style="height:100%;width:{v / mx * 100:.0f}%;border-radius:13px;background:linear-gradient(90deg,#4f5dff,#7c8cff)"></div></div></div>'
        for n, v, t in rows)
    return card(f'<div class=lbl>{label}</div>{li}', ("black " if black else "") + "vcenter")


def browser(url, inner):
    return card(
        f"""<div style="background:#0d1330;border:1px solid #ffffff1f;border-radius:18px;overflow:hidden;flex:1">
<div style="display:flex;gap:8px;align-items:center;padding:14px 18px;border-bottom:1px solid #ffffff14">
<i style="width:12px;height:12px;border-radius:50%;background:#ff5f57"></i><i style="width:12px;height:12px;border-radius:50%;background:#febc2e"></i><i style="width:12px;height:12px;border-radius:50%;background:#28c840"></i>
<span style="margin-left:14px;background:#ffffff12;border-radius:8px;padding:6px 16px;font-size:20px;color:#aab3e0">{url}</span></div>
<div style="padding:26px">{inner}</div></div>""", "") .replace('class="card "', 'class="card " style="padding:28px"')


def seguir(extra="Tecnologia, IA e negócios, direto ao ponto."):
    return card(
        '<div style="font-size:36px;font-weight:800;line-height:1.3"><span class=coral>Salve</span> este post.</div>'
        '<div style="font-size:36px;font-weight:800;line-height:1.3;margin-top:20px"><span class=coral>Siga</span> @machadomtds</div>'
        f'<div class=sub style="margin-top:24px">{extra}</div>', "black vcenter")


def direct(palavra="SITE", sub="Envie e eu te respondo."):
    return card(
        '<div class=lbl>Direct</div>'
        f'<div class=glow style="margin-top:34px;background:#4f5dff;border-radius:40px;padding:26px 60px;font-size:52px;font-weight:900;letter-spacing:2px">{palavra}</div>'
        f'<div class=sub style="font-size:26px;margin-top:34px">{sub}</div>', "center")


def texto(label, html, black=False, fs=34):
    return card(f'<div class=lbl>{label}</div><div style="font-size:{fs}px;font-weight:700;line-height:1.35;margin-top:26px">{html}</div>',
                ("black " if black else "") + "vcenter")

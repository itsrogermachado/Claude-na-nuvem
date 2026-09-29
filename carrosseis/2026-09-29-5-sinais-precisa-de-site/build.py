from PIL import Image
import base64, io, pathlib

here = pathlib.Path(__file__).parent
im = Image.open(here / "../../images/1.png").convert("RGB")
av = im.crop((56, 118, 142, 204)).resize((300, 300), Image.LANCZOS)
buf = io.BytesIO(); av.save(buf, "PNG")
AV = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;background:#fff;font-family:'Inter',Helvetica,Arial,sans-serif;color:#0f1419;overflow:hidden}
.wrap{padding:110px 88px 120px 88px;height:100%;display:flex;flex-direction:column}
.head{display:flex;align-items:center;gap:34px}
.av{width:146px;height:146px;border-radius:50%;background:url(AVATAR) center/cover}
.name{font-size:50px;font-weight:800;display:flex;align-items:center;gap:12px;letter-spacing:-.5px}
.handle{font-size:38px;color:#536471;margin-top:4px}
.txt{font-size:44px;line-height:1.4;margin-top:46px;letter-spacing:-.3px}
.txt p+p{margin-top:30px}
.txt b{font-weight:800}
.cards{display:flex;gap:22px;margin-top:48px;flex:1;min-height:0}
.card{flex:1;border-radius:30px;overflow:hidden;position:relative;background:radial-gradient(120% 90% at 70% 20%,#1d2a55 0%,#0b1022 55%,#05070f 100%);color:#e8ecff;padding:40px}
.card.black{background:#000}
.coral{color:#E07A5F}
.pager{position:absolute;right:26px;top:880px;width:48px;height:48px;border-radius:50%;border:2px solid #e3e6ea;display:flex;align-items:center;justify-content:center;color:#9aa4ad;font-size:30px;background:#fff}
.num{position:absolute;right:88px;bottom:56px;font-size:28px;color:#9aa4ad;font-weight:600}
.lbl{font-size:24px;letter-spacing:3px;text-transform:uppercase;color:#8b95c9;font-weight:700}
.glow{box-shadow:0 0 0 2px #5b6cff66,0 0 40px #5b6cff55}
.bar{background:#ffffff14;border-radius:14px;height:18px;margin-top:16px}
"""

BADGE = '<svg width="44" height="44" viewBox="0 0 24 24"><path fill="#1D9BF0" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"/><path fill="#fff" d="M9.9 16.3 6.4 12.8l1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4z"/></svg>'

def slide(text, cards, n, total=7):
    return f"""<!doctype html><html><head><meta charset=utf-8>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel=stylesheet>
<style>{CSS.replace('AVATAR', AV)}</style></head><body><div class=wrap>
<div class=head><div class=av></div><div><div class=name>Roger Machado {BADGE}</div><div class=handle>@machadomtds</div></div></div>
<div class=txt>{text}</div>
<div class=cards>{cards}</div>
</div>{'<div class=pager>›</div>' if n < total else ''}<div class=num>{n}/{total}</div></body></html>"""

def browser(url, inner):
    return f"""<div style="background:#0d1330;border:1px solid #ffffff1f;border-radius:18px;overflow:hidden;height:100%">
<div style="display:flex;gap:8px;align-items:center;padding:14px 18px;border-bottom:1px solid #ffffff14">
<i style="width:12px;height:12px;border-radius:50%;background:#ff5f57"></i><i style="width:12px;height:12px;border-radius:50%;background:#febc2e"></i><i style="width:12px;height:12px;border-radius:50%;background:#28c840"></i>
<span style="margin-left:14px;background:#ffffff12;border-radius:8px;padding:6px 16px;font-size:20px;color:#aab3e0">{url}</span></div>
<div style="padding:26px">{inner}</div></div>"""

S = []

# 1 — capa
S.append(slide(
    "<p>Seu negócio depende <b>só do Instagram</b>? Isso é um risco que pouca gente enxerga.</p>"
    "<p>Estes são os <b>5 sinais</b> de que você já precisa de um site.</p>",
    '<div class="card" style="padding:28px">' + browser("seunegocio.com.br",
        '<div style="font-size:34px;font-weight:800;line-height:1.15">Sua empresa<br>aberta <span style="color:#7c8cff">24 horas</span></div>'
        '<div style="font-size:19px;color:#aab3e0;margin-top:14px">Serviços, preços e contato em um só lugar.</div>'
        '<div style="display:inline-block;margin-top:24px;background:#4f5dff;border-radius:12px;padding:14px 22px;font-size:20px;font-weight:700">Falar com a empresa</div>'
        '<div style="display:flex;gap:12px;margin-top:30px"><div style="flex:1;height:110px;border-radius:12px;background:linear-gradient(135deg,#2a3a7a,#141c40)"></div><div style="flex:1;height:110px;border-radius:12px;background:linear-gradient(135deg,#3a2a6a,#141c40)"></div><div style="flex:1;height:110px;border-radius:12px;background:linear-gradient(135deg,#1f4a6a,#141c40)"></div></div>'
    ) + '</div>'
    '<div class="card black" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">'
    '<div style="font-size:250px;font-weight:900;line-height:.9" class=coral>5</div>'
    '<div style="font-size:44px;font-weight:800;margin-top:10px">sinais</div>'
    '<div style="font-size:24px;color:#9aa0b4;margin-top:18px">Arraste para o lado →</div></div>', 1))

# 2 — Google
S.append(slide(
    "<p><b>Sinal 1:</b> o cliente pesquisa o nome da sua empresa e <b>não encontra nada</b>.</p>"
    "<p>Antes de comprar, ele procura. Se não te acha, encontra quem aparece primeiro.</p>",
    '<div class="card"><div class=lbl>Pesquisa</div>'
    '<div class=glow style="margin-top:26px;background:#ffffff10;border-radius:60px;padding:24px 34px;font-size:30px;display:flex;align-items:center;gap:18px">'
    '<svg width=34 height=34 viewBox="0 0 24 24"><circle cx=10 cy=10 r=7 stroke="#aab3e0" stroke-width=2.4 fill=none /><path d="m15 15 6 6" stroke="#aab3e0" stroke-width=2.4 /></svg>nome da sua empresa</div>'
    '<div style="margin-top:44px;font-size:30px;color:#ff8a7a;font-weight:700">Nenhum site oficial encontrado.</div>'
    '<div style="margin-top:34px;opacity:.55"><div style="font-size:22px;color:#8fa0ff">concorrente.com.br</div><div class=bar style="width:80%"></div><div class=bar style="width:60%"></div></div>'
    '<div style="margin-top:30px;opacity:.35"><div style="font-size:22px;color:#8fa0ff">outraempresa.com.br</div><div class=bar style="width:70%"></div></div>'
    '</div>', 2))

# 3 — direct repetido
bubble = lambda t: f'<div style="align-self:flex-start;background:#ffffff14;border-radius:26px 26px 26px 8px;padding:18px 26px;font-size:27px;margin-top:16px">{t}</div>'
S.append(slide(
    "<p><b>Sinal 2:</b> você responde as <b>mesmas perguntas</b> no direct todos os dias.</p>"
    "<p>Preço, horário, endereço, como funciona. Um site responde tudo isso <b>enquanto você trabalha</b>.</p>",
    '<div class="card" style="display:flex;flex-direction:column"><div class=lbl>Direct · hoje</div>'
    + bubble("Qual o valor?") + bubble("Qual o horário de vocês?") + bubble("Onde fica?") + bubble("Como funciona?") + bubble("Qual o valor?") +
    '</div>'
    '<div class="card" style="display:flex;flex-direction:column"><div class=lbl>No site</div>'
    + ''.join(f'<div style="display:flex;align-items:center;gap:16px;font-size:28px;margin-top:30px"><span style="width:40px;height:40px;border-radius:50%;background:#4f5dff;display:flex;align-items:center;justify-content:center;font-size:24px">✓</span>{t}</div>' for t in ["Serviços e valores", "Horário de atendimento", "Endereço e mapa", "Como funciona", "Botão de contato"]) +
    '</div>', 3))

# 4 — terreno alugado
S.append(slide(
    "<p><b>Sinal 3:</b> sua vitrine está <b>alugada</b> numa rede social.</p>"
    "<p>Se a conta cair ou o alcance mudar, sua presença some junto. O site é o único endereço digital que é <b>seu</b>.</p>",
    '<div class="card black" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">'
    '<div style="width:130px;height:130px;border-radius:50%;background:#1c1c1c;display:flex;align-items:center;justify-content:center;font-size:70px;color:#555">!</div>'
    '<div style="font-size:32px;font-weight:800;margin-top:30px">Esta conta não está disponível</div>'
    '<div style="font-size:23px;color:#777;margin-top:14px">Rede social · perfil da empresa</div></div>'
    '<div class="card" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">'
    '<div class=glow style="border-radius:20px;padding:22px 30px;font-size:34px;font-weight:800;background:#ffffff10">seunegocio.com.br</div>'
    '<div style="font-size:30px;font-weight:700;margin-top:36px">Endereço próprio</div>'
    '<div style="font-size:23px;color:#aab3e0;margin-top:14px">Você controla. Ninguém desliga.</div></div>', 4))

# 5 — percepção
S.append(slide(
    "<p><b>Sinal 4:</b> você cobra como profissional, mas <b>aparece como amador</b>.</p>"
    "<p>Um link de perfil não transmite o mesmo peso de um site próprio. O cliente percebe a diferença antes de falar com você.</p>",
    '<div class="card black" style="display:flex;flex-direction:column"><div class=lbl style="color:#777">Hoje</div>'
    '<div style="margin-top:40px;font-size:26px;color:#888">link na bio</div>'
    + ''.join('<div style="margin-top:18px;border:2px solid #333;border-radius:40px;padding:20px;text-align:center;font-size:24px;color:#aaa">link</div>' for _ in range(4)) +
    '</div>'
    '<div class="card" style="padding:28px"><div class=lbl style="margin:6px 0 18px 12px">Com site</div>' + browser("suaempresa.com.br",
        '<div style="font-size:30px;font-weight:800;line-height:1.2">Especialista no<br>que você faz</div>'
        '<div class=bar style="width:90%"></div><div class=bar style="width:70%"></div>'
        '<div style="display:flex;gap:10px;margin-top:24px"><span style="background:#4f5dff;border-radius:10px;padding:12px 18px;font-size:18px;font-weight:700">Orçamento</span><span style="border:1px solid #ffffff40;border-radius:10px;padding:12px 18px;font-size:18px">Portfólio</span></div>'
    ) + '</div>', 5))

# 6 — tráfego
step = lambda t, c: f'<div style="background:{c};border-radius:18px;padding:20px 26px;font-size:28px;font-weight:700;text-align:center">{t}</div>'
arrow = '<div style="text-align:center;font-size:30px;color:#6a74a8;margin:8px 0">↓</div>'
S.append(slide(
    "<p><b>Sinal 5:</b> você investe em anúncio e manda o visitante para um lugar <b>sem estrutura</b>.</p>"
    "<p>Um site de alta conversão é construído com um objetivo: <b>levar o visitante até o contato</b>.</p>",
    '<div class="card black" style="display:flex;flex-direction:column;justify-content:center"><div class=lbl style="color:#777;margin-bottom:24px">Sem site</div>'
    + step("Anúncio", "#1a1a1a") + arrow + step("Perfil", "#1a1a1a") + arrow + step("?", "#1a1a1a;color:#777") +
    '</div>'
    '<div class="card" style="display:flex;flex-direction:column;justify-content:center"><div class=lbl style="margin-bottom:24px">Com site</div>'
    + step("Anúncio", "#ffffff14") + arrow + step("Página feita para converter", "#ffffff14") + arrow + step("Contato", "#4f5dff") +
    '</div>', 6))

# 7 — CTA
S.append(slide(
    "<p>Se você se viu em <b>dois ou mais sinais</b>, o próximo passo está claro.</p>"
    "<p>Eu crio <b>sites de alta conversão</b> para empresários. Me manda a palavra <b>SITE</b> no direct.</p>",
    '<div class="card" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">'
    '<div class=lbl>Direct</div>'
    '<div class=glow style="margin-top:34px;background:#4f5dff;border-radius:40px;padding:26px 60px;font-size:52px;font-weight:900;letter-spacing:2px">SITE</div>'
    '<div style="font-size:26px;color:#aab3e0;margin-top:34px">Envie e eu te respondo.</div></div>'
    '<div class="card black" style="display:flex;flex-direction:column;justify-content:center;padding:44px">'
    '<div style="font-size:34px;font-weight:800;line-height:1.3"><span class=coral>Salve</span> este post.</div>'
    '<div style="font-size:34px;font-weight:800;line-height:1.3;margin-top:20px"><span class=coral>Siga</span> @machadomtds</div>'
    '<div style="font-size:24px;color:#9aa0b4;margin-top:24px;line-height:1.4">Tecnologia, IA e criação de sites.</div></div>', 7))

out = here / "html"; out.mkdir(exist_ok=True)
for i, h in enumerate(S, 1):
    (out / f"{i:02d}.html").write_text(h)
print(len(S))

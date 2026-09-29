"""Monta o pacote diário: pasta por post (imagens + legendas), calendário CSV/JSON, instruções e zip."""
import csv, datetime as dt, json, pathlib, shutil, zipfile
from PIL import Image
from conteudo import POSTS
from gerar import legendas

AQUI = pathlib.Path(__file__).parent
TEND = AQUI.parent / "2026-09-29-tendencias"
OUT = AQUI / "pacote"
INICIO = dt.date(2026, 9, 30)
HORA = "12:00"
DIAS = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"]

# Carrosséis do lote de 29/09 (o 01, da OpenAI, fica de fora porque virou reel)
ANTIGOS = {
 "10-tem-saldo-em-bet-prazos": ("news", "Tem dinheiro parado em bet? O prazo para sacar termina em 5 de outubro.",
   "Depois disso, o saldo não é perdido: entra em devolução automática pelos bancos, e o que não for devolvido vai para a Caixa.",
   "Exame, Suno, Seu Dinheiro e ND+ (26 a 28/09/2026)", "#bets #apostas #seudinheiro #brasil #noticias"),
 "09-bets-proibidas-no-brasil": ("news", "As bets estão proibidas no Brasil. Veja o que diz a MP 1.394/2026.",
   "Apostas esportivas, jogos online e publicidade proibidos. Sites fora do ar em 6/10 e multas de até 10% do faturamento. A MP ainda passa pelo Congresso.",
   "Agência Senado (28/09/2026) e Exame", "#bets #apostas #brasil #noticias #mp"),
 "06-googlebook": ("news", "O Google lançou o Googlebook, notebook com o Gemini no centro do sistema.",
   "A partir de US$ 899, com 12 meses de Google AI Pro. Chega aos EUA em 4 de outubro. O Brasil não está na primeira lista.",
   "Google Blog, TechCrunch e 9to5Google (21/09/2026)", "#google #gemini #tecnologia #inteligenciaartificial #notebook"),
 "02-claude-sonnet-5-5": ("news", "A Anthropic lançou o Claude Sonnet 5.5: mais de 30% mais rápido e pelo mesmo preço.",
   "Até 30% mais barato por tarefa, porque usa menos tokens. No Terminal-Bench 4.0, saltou de 10,3% para 70,6%.",
   "Anthropic, anúncio oficial (28/09/2026)", "#inteligenciaartificial #claude #anthropic #tecnologia #ia"),
 "03-amazon-bloqueia-agente-da-meta": ("site", "A Amazon bloqueou o agente de IA da Meta. A Shopify abriu as portas.",
   "O cliente vai começar a pedir para a IA pesquisar e comprar. A IA precisa encontrar e entender o que você vende, e isso começa com um site próprio.",
   "GeekWire, Motley Fool e Forbes (22 a 27/09/2026)", "#agentesdeia #ecommerce #meta #empreendedorismo #inteligenciaartificial"),
 "04-openai-desliga-api-do-sora": ("site", "A OpenAI desligou a API do Sora, e quem dependia dela ficou sem substituto.",
   "A lição vale para qualquer negócio: quando tudo depende de uma plataforma que não é sua, a regra muda sem você ter voz.",
   "OpenAI Help Center (24/09/2026)", "#criacaodesites #empreendedorismo #openai #negocios #tecnologia"),
 "05-google-busca-por-imagem": ("site", "O cliente tira foto e pesquisa. Agora o Google mostra quantas pessoas chegam ao seu site assim.",
   "O Search Console separou a busca por texto da busca com imagem: Lens, Circle to Search e Chrome. E esse relatório só existe para quem tem site.",
   "Google Search Central Blog (24/09/2026)", "#googlesearchconsole #seo #criacaodesites #marketingdigital #negocios"),
 "07-iphone-duo-dobravel": ("news", "A Apple entrou no mercado de dobráveis com o iPhone Duo.",
   "De US$ 1.999 a US$ 3.199, telas de 5,4\" e 7,6\" e pré-venda em 16 de outubro. Você trocaria o seu celular por um dobrável? Comenta aqui.",
   "MacRumors e Variety (09/09/2026)", "#apple #iphone #tecnologia #dobravel #iphoneduo"),
 "08-pix-cobranca-hibrida": ("site", "Boleto e Pix no mesmo documento: o Banco Central anunciou a cobrança híbrida.",
   "Começa em fevereiro de 2027 e evita pagamento em dobro. Em julho de 2027, chega o Pix Automático em conta-salário.",
   "Banco Central do Brasil, via Mix Vale (setembro/2026)", "#pix #bancocentral #empreendedorismo #negocios #pagamentos"),
 "11-linha-do-tempo-das-bets": ("news", "Da liberação à proibição: a história das bets no Brasil em 8 anos.",
   "De 2018, com a Lei 13.756, até a MP 1.394/2026. Licenças de R$ 30 milhões interrompidas no meio do caminho.",
   "Congresso em Foco", "#bets #apostas #brasil #politica #noticias"),
 "12-quem-perde-com-o-fim-das-bets": ("news", "O fim das bets mexe com o futebol, com o governo e com os influenciadores.",
   "14 dos 20 clubes da Série A têm bet como patrocinador máster, e o governo arrecadou R$ 9,91 bilhões com o setor de janeiro a agosto. Você concorda com a proibição? Comenta aqui.",
   "CNN Brasil, Jornal de Brasília, Exame e Agência Senado (09/2026)", "#bets #futebol #brasileirao #brasil #noticias"),
}
ORDEM_NOTICIAS = ["10-tem-saldo-em-bet-prazos", "tse-deepfake-eleicoes-2026", "09-bets-proibidas-no-brasil", "06-googlebook",
                  "02-claude-sonnet-5-5", "03-amazon-bloqueia-agente-da-meta", "amd-compra-world-labs", "04-openai-desliga-api-do-sora",
                  "05-google-busca-por-imagem", "youtube-feed-com-ia", "google-home-agentes-de-ia", "ray-ban-meta-gen-3",
                  "07-iphone-duo-dobravel", "08-pix-cobranca-hibrida", "11-linha-do-tempo-das-bets", "12-quem-perde-com-o-fim-das-bets",
                  "oracle-ia-e-empregos"]

novos = {p["slug"]: p for p in POSTS}


def item(slug):
    if slug in ANTIGOS:
        cat, gancho, resumo, fonte, tags = ANTIGOS[slug]
        p = dict(slug=slug, cat=cat, gancho=gancho, resumo=resumo, fonte=fonte, tags=tags)
        imgs = sorted((TEND / slug).glob("slide-*.png"))
    else:
        p = novos[slug]
        imgs = sorted((AQUI / "posts" / slug).glob("*.jpg"))
    ig, tt = legendas(p)
    return p, imgs, ig, tt


# perenes intercalados por categoria (site aparece com mais frequência, por ser a métrica de prospecção)
fila = {c: [p["slug"] for p in POSTS if p["cat"] == c] for c in ("site", "ia", "tech")}
perenes, pos = [], {c: 0.0 for c in fila}
passo = {c: 1 / len(v) for c, v in fila.items()}
while any(fila.values()):
    c = min((c for c in fila if fila[c]), key=lambda c: pos[c])
    perenes.append(fila[c].pop(0)); pos[c] += passo[c]
ordem = ORDEM_NOTICIAS + perenes
assert len(set(ordem)) == len(ordem) == 61, len(ordem)

if OUT.exists():
    shutil.rmtree(OUT)
(OUT / "posts").mkdir(parents=True)
linhas, js = [], []
for n, slug in enumerate(ordem, 1):
    p, imgs, ig, tt = item(slug)
    data = INICIO + dt.timedelta(days=n - 1)
    nome = f"{n:02d}_{data.isoformat()}_{slug.split('-', 1)[1] if slug in ANTIGOS else slug}"
    d = OUT / "posts" / nome
    d.mkdir()
    for i, im in enumerate(imgs, 1):
        Image.open(im).convert("RGB").save(d / f"{i:02d}.jpg", quality=93, optimize=True) if im.suffix == ".png" else shutil.copy(im, d / f"{i:02d}.jpg")
    (d / "legenda-instagram.txt").write_text(ig + "\n")
    (d / "legenda-tiktok.txt").write_text(tt + "\n")
    row = {"n": n, "data": data.isoformat(), "dia_semana": DIAS[data.weekday()], "hora_brasilia": HORA, "pasta": f"posts/{nome}",
           "tipo": {"news": "notícia", "site": "sites e negócios", "ia": "IA na prática", "tech": "tecnologia e segurança"}[p["cat"]],
           "titulo": p["gancho"], "imagens": len(imgs), "fonte": p.get("fonte", "")}
    linhas.append(row)
    js.append({**row, "legenda_instagram": ig, "legenda_tiktok": tt})
    (d / "info.txt").write_text(f"Post {n} de {len(ordem)}\nData: {data.strftime('%d/%m/%Y')} ({DIAS[data.weekday()]}), {HORA} (Brasília)\n"
                                f"Tipo: {row['tipo']}\nImagens: {len(imgs)} (publicar na ordem 01, 02, 03...)\n")

with open(OUT / "calendario.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=list(linhas[0]))
    w.writeheader(); w.writerows(linhas)
(OUT / "calendario.json").write_text(json.dumps(js, ensure_ascii=False, indent=1))
shutil.copy(AQUI / "LEIA-ME.md", OUT / "LEIA-ME.md")
fim = INICIO + dt.timedelta(days=len(ordem) - 1)

zp = AQUI / "pacote-posts-roger-machado.zip"
with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted(OUT.rglob("*")):
        if f.is_file():
            z.write(f, f"pacote-posts-roger-machado/{f.relative_to(OUT)}")
print(len(ordem), "posts de", INICIO, "a", fim, "| zip:", round(zp.stat().st_size / 1e6, 1), "MB")

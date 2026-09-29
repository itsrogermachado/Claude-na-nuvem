"""Gera os HTMLs dos 50 carrosséis do pacote diário. Depois rode render.js e converter.py."""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "_base"))
from modelo import page, direct, seguir  # noqa: E402
from conteudo import POSTS  # noqa: E402
import conteudo2  # noqa: E402,F401  (adiciona o lote 2 à lista POSTS)

AQUI = pathlib.Path(__file__).parent

CTA_IG = {
    "site": "Quer um site de alta conversão para o seu negócio? Me manda SITE no direct.\n\nSalve este post e siga @machadomtds.",
    "ia": "Salve para consultar depois e siga @machadomtds para acompanhar tecnologia e IA sem ruído.",
    "tech": "Salve para consultar depois e siga @machadomtds para acompanhar tecnologia e IA sem ruído.",
    "news": "Siga @machadomtds para acompanhar tecnologia, negócios e o que muda no Brasil.",
}
CTA_TT = {
    "site": "Quer um site para o seu negócio? Manda SITE no direct.",
    "ia": "Siga para mais tecnologia e IA sem ruído.",
    "tech": "Siga para mais tecnologia e IA sem ruído.",
    "news": "Siga para acompanhar tecnologia, negócios e o que muda no Brasil.",
}


def cta_slide(p):
    if p["cat"] == "site":
        return (f"<p>{p['fecho']}</p><p>Quer um site de alta conversão para o seu negócio? Me manda <b>SITE</b> no direct.</p>",
                [direct(), seguir()])
    return (f"<p>{p['fecho']}</p><p>Siga para acompanhar tecnologia e IA <b>sem ruído</b>.</p>", [seguir()])


def legendas(p):
    fonte = f"Fonte: {p['fonte']}.\n\n" if p["fonte"] else ""
    ig = f"{p['gancho']}\n\n{p['resumo']}\n\n{CTA_IG[p['cat']]}\n\n{fonte}{p['tags']}"
    tt = f"{p['gancho']}\n\n{CTA_TT[p['cat']]}\n\n{fonte}{p['tags']}"
    return ig, tt


if __name__ == "__main__":
    meta = []
    for p in POSTS:
        slides = p["slides"] + [cta_slide(p)]
        pasta = AQUI / "posts" / p["slug"]
        (pasta / "html").mkdir(parents=True, exist_ok=True)
        for f in (pasta / "html").glob("*.html"):
            f.unlink()
        for i, (txt, cards) in enumerate(slides, 1):
            (pasta / "html" / f"{i:02d}.html").write_text(page(txt, cards, i, len(slides), p["fonte"]))
        ig, tt = legendas(p)
        (pasta / "legenda-instagram.txt").write_text(ig + "\n")
        (pasta / "legenda-tiktok.txt").write_text(tt + "\n")
        meta.append({"slug": p["slug"], "cat": p["cat"], "titulo": p["gancho"], "fonte": p["fonte"], "slides": len(slides)})
    (AQUI / "posts.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
    print(len(POSTS), "carrosséis,", sum(m["slides"] for m in meta), "slides")

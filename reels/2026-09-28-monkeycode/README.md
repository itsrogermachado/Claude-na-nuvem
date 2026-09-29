# Reel — "Editado por IA" + MonkeyCode (v2, Remotion)

**Arquivo final:** `reel_monkeycode_v2_1080x1920.mp4`. Especificações: 1080×1920 (9:16), **60 fps** (igual ao original), H.264 CRF 14, AAC 320k, -14 LUFS, faststart, 25,6 s.

Toda a edição é feita em **JavaScript/React com [Remotion](https://www.remotion.dev)** (`remotion/`). Os modelos 3D usam **Three.js** (`@remotion/three`).

## O que mudou em relação à v1
- **Imagem original:** sem correção de cor, nitidez artificial ou vinheta, e sem o escurecimento no topo. O zoom máximo caiu de 1.33 para 1.13. Os quadros são capturados em PNG direto do arquivo original, e o render é feito uma única vez, sem recompressão.
- **Logo 3D do Claude na mão:**
  - O SVG oficial foi extrudado em Three.js, com material brilhante, reflexos e luz de recorte.
  - Ele fica preso na palma usando rastreamento da mão (MediaPipe) quadro a quadro.
  - Entra girando quando você levanta a mão em "Claude Code", continua em "Claude Opus 5.5" e voa para o selo quando a mão desce.
  - Nesse momento o quadro abre para caber rosto e mão ao mesmo tempo, com o hook no painel de cima.
- **MonkeyCode:** o logo virou uma moeda 3D que entra girando e depois vira um selo no topo enquanto você fala "se você não conhece ainda".
- **Animações:** as mesmas da v1, agora com física de mola (spring) a 60 fps.

## Roteiro (31 s → 25,6 s)
| Tempo | Fala | Visual |
|---|---|---|
| 0–2,2 s | "Acabei de começar a gravar… vou editar ele usando o" | Hook "ESTE VÍDEO FOI EDITADO POR IA" |
| 2,2–4,9 s | "Claude Code. Claude Opus 5.5" | Quadro abre; **logo 3D do Claude na mão**; selo CLAUDE CODE → CLAUDE OPUS 5.5 |
| 4,9–10 s | "E vamos ver a qualidade… evolução da IA… extremamente incrível" | Curva animada "A EVOLUÇÃO DA IA", zoom sutil |
| 10–15 s | "Acabei testando uma IA… criação de site" | Split: site oficial do MonkeyCode |
| 15–17,9 s | "Uma IA que te dá 10 milhões de contexto de código" | Contador 0 → 10.000.000 + card oficial de preços |
| 17,9–19,5 s | "O nome dela é o quê? Monkey Code" | Riser + **moeda 3D do MonkeyCode** |
| 19,5–22,2 s | "Se você não conhece ainda… pesquisa e dá uma olhada" | Selo MonkeyCode → barra de busca |
| 22,2–25,6 s | "Link na descrição… tamo junto e já segue nós aí" | Pill do link → botão SEGUIR → SEGUINDO |

## Checagem de fatos
Ele fala "10 milhões de **contexto**". O site oficial (monkeycode-ai.net, seção de preços) mostra **10M tokens por dia** no plano grátis Basic. A legenda mantém a fala, e o gráfico mostra o dado verificado, com a fonte.

## Como renderizar de novo
```bash
cd remotion
npm install
npx remotion studio            # prévia interativa no navegador
npx remotion render Reel out/reel_raw.mp4 --gl=swangle
# normalização final do áudio (-14 LUFS), sem recodificar o vídeo:
ffmpeg -i out/reel_raw.mp4 -c:v copy -af "volume=XdB,alimiter=limit=0.85" -c:a aac -b:a 320k -movflags +faststart final.mp4
```
- `tools/prepare_data.py` regenera a transcrição (Whisper large-v3), os rastreamentos de rosto e mão, e a trilha de voz cortada (`src/data.json`, `public/voice.wav`).
- `tools/make_audio.py` gera a trilha e os efeitos sonoros. São originais, sintetizados, então não têm problema de direitos autorais.

O Remotion é gratuito para uso individual e para empresas de até 3 pessoas (veja a licença deles).

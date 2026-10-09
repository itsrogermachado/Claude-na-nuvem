# Reel: "Como eu fiz esse valor" (Empire Live)

**Arquivo final:** `reel_empire_live_1080x1920.mp4`. Especificações: 1080×1920, 60 fps (igual ao original), H.264 CRF 14, AAC 320k, -14 LUFS, 34,6 s.

A edição foi feita em **JavaScript/React com [Remotion](https://www.remotion.dev)**, em `remotion/`.

## O que foi e o que não foi mexido
- **Imagem:** a original, sem filtro, correção de cor, nitidez ou vinheta. Só tem cortes e zooms (punch-in). Como os takes são 4K, os zooms não perdem nitidez.
- **Voz:** o áudio original, sem efeito nenhum. Tem só fades de 6/10 ms em cada corte e o nível final em -14 LUFS (padrão do Instagram).
- **Trilha e efeitos sonoros:** originais, sintetizados em `tools/make_audio.py`, então não têm problema de direitos autorais. A trilha abaixa sozinha quando você fala.

## Material bruto
São 2 takes do iPhone (vertical 4K HEVC, 60 fps) que ficam no Google Drive, não no git: `IMG_1126.MOV` e `IMG_1127.MOV`. Converta cada um para `remotion/public/c1.mp4` e `c2.mp4`:
```bash
ffmpeg -i IMG_1126.MOV -map 0:v:0 -map 0:a:0 -vf "scale=1440:2560:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 12 -c:a pcm_s16le public/c1.mp4
```
As imagens `public/img/renda.jpg` (print da renda) e `public/img/empire.jpg` (logo da Empire Live) vieram da mesma pasta.

## Cortes (38,5 s de bruto → 34,6 s)
| Tempo | Fala | Visual |
|---|---|---|
| 0–1,9 s | "Hoje eu vou te ensinar como eu fiz" | Hook "VOU TE ENSINAR / COMO EU FIZ" |
| 1,9–4,2 s | "esse valor aqui, sem investir um real em anúncios" | Print da renda entra em um celular, contador R$ 0 → R$ 18.567,36, selo "R$ 0 em anúncios" |
| 4,2–9,3 s | "sem ficar perdendo tempo indo atrás de produto na Shopee" | Lista "sem precisar de", com cada item riscado |
| 9,3–11,8 s | "E aí, você vai me dizer se valeu a pena ou não" | Enquete estilo Instagram "VALEU A PENA?" |
| 11,8–16,1 s | "Primeira coisa… baixei essa ferramenta… Empire Live, o link tá na bio" | PASSO 1, barra de download, logo da Empire Live girando, "LINK NA BIO" |
| 16,1–20,7 s | "Você vai entrar, conectar suas contas… explicar tudo" | Fluxo ENTRAR → CONECTAR → ELA EXPLICA TUDO |
| 20,7–24,7 s | "fazendo live dos produtos automático… acha os melhores produtos" | Tela "AO VIVO", chave AUTOMÁTICO ligando, produtos com TOP 1/2/3 |
| 24,7–30,9 s | "E pronto… vendendo como afiliado na Shopee, Mercado Livre, TikTok… pros três" | PRONTO, notificações de venda, chips das 3 plataformas → "3 EM 1" |
| 30,9–34,6 s | "é a melhor coisa que vocês podem fazer no momento" | CTA: logo + "LINK NA BIO" |

Os produtos e as notificações de venda da tela "ao vivo" são ilustrativos, sem valores. O único número real na tela é o total do print (R$ 18.567,36).

## Como renderizar de novo
```bash
cd remotion
npm install
python3 tools/prepare_data.py <pasta com words.json e faces.json>   # gera src/data.json e public/voice.wav
python3 tools/make_audio.py public 11.833 24.717                  # trilha + efeitos
npx remotion render Reel out/reel_raw.mp4 --gl=swangle
ffmpeg -i out/reel_raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=11" -c:a aac -b:a 320k -movflags +faststart final.mp4
```
- `words.json` é a transcrição palavra por palavra (Whisper large-v3). `faces.json` é o rastreamento do rosto (OpenCV), usado nos zooms.
- `node tools/stills.mjs 1.5 10 20` gera quadros de prévia em `out/`.

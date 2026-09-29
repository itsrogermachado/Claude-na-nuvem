# Reel: "Esse vídeo foi 100% editado por IA" (v3)

Editado inteiramente em **JavaScript/React com [Remotion](https://www.remotion.dev)**, com os objetos 3D em **Three.js**. O roteiro está em `../roteiros/roteiro-ia-edita-meus-videos.md`.

**Arquivo final:** `reel_ia_edita_1080x1920.mp4` (1080×1920, 60 fps, H.264 CRF 14, AAC 320k, -14 LUFS, 41,3 s).

## Material bruto
São 4 takes (1920×1080, 60 fps, cerca de 680 MB no total) que ficam no Google Drive, não no git. Para renderizar de novo, coloque os arquivos em `remotion/public/` com os nomes `c1.mp4` a `c4.mp4`, em ordem de gravação.

## Cortes (68,2 s de bruto → 41,3 s)
| Trecho | Fala | Visual |
|---|---|---|
| 0–4,2 s | "Esse vídeo foi 100% editado utilizando inteligência artificial" | Hook com contador 0 → 100% |
| 4,2–8,6 s | "O Claude Opus 5.5, e eu não abri nenhum editor de vídeo" | Quadro abre; **logo 3D do Claude na mão**; editor de vídeo riscado; selo |
| 8,6–12,9 s | "Eu só gravo, mando o arquivo pro Claude e ele faz o resto. Isso é um absurdo" | Fluxo animado: EU GRAVO → CLAUDE → VÍDEO PRONTO |
| 12,9–24,1 s | "Primeiro… Segundo… Terceiro…" | Painel dos 3 passos (detalhes abaixo) |
| 24,1–26,7 s | "E ele montou também esse roteiro pra mim" | O roteiro de verdade como documento |
| 26,7–35,2 s | "Sabe essa logo aqui… rastreou a minha mão, quadro a quadro… Isso é bem incrível" | Logo 3D seguindo a mão; painel de rastreamento com o esqueleto da mão ao vivo; esqueleto desenhado sobre a mão real |
| 35,2–41,3 s | "Resumindo, eu gravo, a IA edita. Me manda uma mensagem no direct…" | "EU GRAVO. / A IA EDITA." e a animação do Direct |

O painel dos 3 passos mostra:
1. Onda do áudio real da sua voz, com a transcrição aparecendo palavra por palavra.
2. A linha do tempo **real** dos cortes deste vídeo encolhendo de 68,2 s para 41,3 s.
3. Código sendo digitado, com uma prévia da animação que ele gera.

Saíram do corte: "vamos lá", "basicamente", "né", "falando o que vai acontecer e etc", "e pega basicamente me enviando", o "roteiro" repetido e "tem muita gente que não edita em JavaScript…".

## Pipeline
1. Transcrição com Whisper large-v3, com marcação de tempo por palavra.
2. Rastreamento de rosto (OpenCV) e de mão (MediaPipe: palma, a 60 Hz, e os 21 pontos do clipe 4).
3. `tools/prepare_data.py` gera `src/data.json` e `public/voice.wav` (voz original, cortada com fades de 6–10 ms).
4. `tools/make_audio.py` gera a trilha e os efeitos sonoros (originais, sintetizados).
5. Render: `npx remotion render Reel out/reel_raw.mp4 --gl=swangle`. Depois o áudio é normalizado para -14 LUFS sem recodificar o vídeo.

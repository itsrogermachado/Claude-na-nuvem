# Reel: "A OpenAI desistiu da própria IA" (exemplo de motion design)

Vídeo 100% em motion (sem gravação de rosto), feito em **JavaScript/React com [Remotion](https://www.remotion.dev)**, com a mesma identidade visual dos carrosséis.
Roteiro e texto para o ElevenLabs: `../roteiros/roteiro-openai-cancela-astra.md`.

**Arquivo:** `reel_openai_cancela_astra_1080x1920.mp4` (1080×1920, 30 fps, ~38 s).

## Estado atual
- **Sem narração ainda.** A legenda está sincronizada com um tempo **estimado** de fala (~2,7 palavras/s).
- Tem efeitos sonoros (whoosh, impacto, pop, tique do contador), sem música. A ideia é colocar um áudio em alta direto no app, ou a narração.

## Quando a narração do ElevenLabs chegar
1. Salvar o áudio em `remotion/public/narracao.mp3`.
2. Ajustar os tempos de cada frase em `src/timeline.ts` (`LINES`) ao áudio real (ou marcar palavra por palavra a partir de uma transcrição).
3. Em `src/timeline.ts`, trocar `NARRATION = null` por `'narracao.mp3'`.
4. Renderizar de novo.

## Render
```bash
cd remotion
npm install
npx remotion render Reel out/reel.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```
(Fora deste ambiente, dá para tirar o `--browser-executable` e o Remotion baixa o Chrome sozinho.)

## Estrutura
- `src/timeline.ts`: texto da narração, tempos, cenas e cálculo da legenda palavra por palavra.
- `src/theme.ts`: cores e fontes (as mesmas dos carrosséis).
- `src/Reel.tsx`: as 7 cenas, a legenda e os efeitos sonoros.

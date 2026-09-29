# Reel — "Editado por IA" + MonkeyCode

**Arquivo final:** `reel_monkeycode_1080x1920.mp4` — 1080×1920 (9:16), 30 fps, H.264 + AAC 256k, 25 s, -14 LUFS, faststart.

## Roteiro da edição (31 s → 25 s)
| Tempo | Fala | Visual |
|---|---|---|
| 0–6 s | "Acabei de começar a gravar… usando o Claude Opus 5.5" | Hook "ESTE VÍDEO FOI EDITADO POR IA" + selo CLAUDE OPUS 5.5, punch-in no corte |
| 6–9,5 s | "Evolução da IA… extremamente incrível" | Curva ascendente animada, punch zoom com impacto |
| 9,5–14,4 s | "Testando uma IA… criação de site" | Split-screen: site oficial do MonkeyCode (Ken Burns até o painel do agente) |
| 14,4–17,3 s | "10 milhões de contexto de código" | Contador 0 → 10.000.000 + card real do plano Basic ("Daily quota: 10M tokens/day") |
| 17,3–18,8 s | "O nome dela é o quê? Monkey Code" | Riser + queda da música → reveal do logo com impacto |
| 18,8–21,6 s | "Pesquisa e dá uma olhada" | Barra de busca digitando "monkeycode" + resultado |
| 21,6–23,3 s | "Link tá aqui na descrição" | Pill "LINK NA DESCRIÇÃO" |
| 23,3–25 s | "Tamo junto e já segue nós aí" | Botão SEGUIR → SEGUINDO |

Cortados: "Claude Code. Não o Claude Code, mas…" (autocorreção), os "beleza?", "que é basicamente", pausas.

## Checagem de fatos
- Ele fala "10 milhões de **contexto**". O site oficial mostra **10M tokens por dia** no plano grátis (Basic, $0), e não uma janela de contexto. A legenda mantém a fala, mas o gráfico mostra o dado verificado: "10.000.000 TOKENS POR DIA • GRÁTIS", com a fonte.
- MonkeyCode: open source (AGPL-3.0), feito pela Chaitin — github.com/chaitin/MonkeyCode, monkeycode-ai.net.

## Identidade visual
Montserrat Black (legendas/títulos) + JetBrains Mono (elementos de UI/código). Verde #3DF29A (cor da marca MonkeyCode) para destaques, laranja #FF9A3C só para Claude, fundo escuro #070E0A com grid. Legendas karaokê palavra a palavra, e as palavras-chave ganham uma pill colorida.

## Áudio
Voz com EQ + compressão. Trilha e efeitos são originais, sintetizados em `projeto/audio.py` (sem problema de direitos autorais). A música abaixa sozinha (sidechain) quando ele fala.

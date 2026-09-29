# Pacote de posts: Roger Machado (@machadomtds)

São **61 carrosséis, um por dia, às 12h (Brasília), de 30/09/2026 a 29/11/2026**, para Instagram e TikTok.

## O que tem aqui
```
calendario.csv    → uma linha por post: data, hora, pasta, tipo, título, número de imagens e fonte
calendario.json   → a mesma coisa, com as duas legendas completas dentro
posts/
  01_2026-09-30_tem-saldo-em-bet-prazos/
    01.jpg, 02.jpg, ...     → imagens do carrossel, NA ORDEM (1080×1350)
    legenda-instagram.txt   → legenda completa com hashtags
    legenda-tiktok.txt      → legenda curta com hashtags
    info.txt                → data, hora e tipo
  02_2026-10-01_.../
  ...
```

## Ordem do calendário
1. **Posts 1 a 17 (30/09 a 16/10): notícias.** Vêm primeiro porque perdem validade. Os de bets e eleições têm prazo:
   - o post 1 (saldo em bet) precisa sair antes de **5/10**;
   - o post 2 (deepfake no TSE) precisa sair antes do primeiro turno, em **4/10**.
2. **Posts 18 a 61 (17/10 a 29/11): conteúdos que não envelhecem.** Sites e negócios, IA na prática e tecnologia e segurança, intercalados.

Os posts de "sites e negócios" terminam com "Me manda SITE no direct", para prospectar empresários.

## Prompt para colar no Claude Cowork
Descompacte o zip, abra a pasta `pacote-posts-roger-machado` no Cowork e cole:

```
Nesta pasta há um pacote de posts para o meu Instagram (@machadomtds) e o meu TikTok.
O arquivo calendario.csv lista 61 posts, um por dia, com data, hora (horário de Brasília) e a pasta de cada um.

Para cada linha do calendario.csv, em ordem:
1. Abra a pasta indicada na coluna "pasta".
2. No Instagram (pelo Meta Business Suite), crie um post de carrossel com TODAS as imagens .jpg da pasta, na ordem numérica (01.jpg, 02.jpg...).
3. Use como legenda o texto exato do arquivo legenda-instagram.txt.
4. AGENDE (não publique agora) para a data e hora da linha, no fuso America/Sao_Paulo.
5. No TikTok (pelo TikTok Studio), crie um post de fotos com as mesmas imagens, na mesma ordem, com o texto de legenda-tiktok.txt, e agende para a mesma data e hora.

Regras:
- Não altere as legendas nem a ordem das imagens.
- Se a plataforma não deixar agendar tão à frente, agende o que for permitido e me diga até qual post você chegou.
- Se algo der erro, pare e me avise em vez de publicar na hora.
- No final, me mostre uma tabela com: número do post, data, Instagram (agendado sim/não) e TikTok (agendado sim/não).
```

## Antes de agendar
- **Notícias:** confira se continuam atuais, principalmente as de bets. A MP ainda vai passar pelo Congresso.
- **Horário:** 12h é uma sugestão geral. Veja em Insights → Público → "Horários mais ativos" e ajuste a coluna `hora_brasilia` se quiser.
- **Limites de agendamento:** as plataformas limitam quanto tempo à frente dá para agendar. O TikTok costuma permitir poucos dias. Pode ser preciso agendar em lotes (por exemplo, toda semana).
- **Carrossel 01 da OpenAI (GPT-6.1 Astra):** ficou fora do calendário porque o mesmo tema já foi postado em reel.

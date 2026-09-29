# Pacote de posts do Instagram: Roger Machado (@machadomtds)

São **111 carrosséis, 2 por dia (12h e 19h, horário de Brasília), de 30/09/2026 a 24/11/2026**, só para o Instagram.

## O que tem aqui
```
calendario.csv    → uma linha por post: data, hora, pasta, tipo, título, número de imagens e fonte
calendario.json   → a mesma coisa, com a legenda completa dentro
posts/
  001_2026-09-30_12h_tem-saldo-em-bet-prazos/
    01.jpg, 02.jpg, ...     → imagens do carrossel, NA ORDEM (1080×1350)
    legenda-instagram.txt   → legenda completa com hashtags
    info.txt                → data, hora e tipo
  002_2026-09-30_19h_.../
  ...
```

## Ordem do calendário
1. **Posts 1 a 17 (30/09 a 08/10): notícias.** Vêm primeiro porque perdem validade.
   - O post 1 (saldo em bet) precisa sair antes de **5/10**.
   - O post 2 (deepfake no TSE) precisa sair antes do primeiro turno, em **4/10**.
2. **Posts 18 a 111 (08/10 a 24/11): conteúdos que não envelhecem.** Sites e negócios, IA na prática e tecnologia e segurança, intercalados.

Os posts de "sites e negócios" terminam com "Me manda SITE no direct", para prospectar empresários.

## Prompt para colar no Claude Cowork
Descompacte o zip, abra a pasta `pacote-posts-roger-machado` no Cowork e cole:

```
Nesta pasta há um pacote de posts para o meu Instagram (@machadomtds).
O arquivo calendario.csv lista 111 carrosséis, 2 por dia, com data, hora (horário de Brasília) e a pasta de cada um.

Para cada linha do calendario.csv, em ordem:
1. Abra a pasta indicada na coluna "pasta".
2. No Meta Business Suite, crie um post de carrossel para o Instagram com TODAS as imagens .jpg da pasta, na ordem numérica (01.jpg, 02.jpg...).
3. Use como legenda o texto exato do arquivo legenda-instagram.txt.
4. AGENDE (não publique agora) para a data e hora da linha, no fuso America/Sao_Paulo.

Regras:
- Não altere a legenda nem a ordem das imagens.
- Se a plataforma não deixar agendar tão à frente, agende o que for permitido e me diga até qual post você chegou.
- Se algo der erro, pare e me avise em vez de publicar na hora.
- No final, me mostre uma tabela com: número do post, data, hora e se foi agendado (sim/não).
```

## Antes de agendar
- **Notícias:** confira se continuam atuais, principalmente as de bets. A MP ainda vai passar pelo Congresso.
- **Horários:** 12h e 19h são sugestões gerais. Veja em Insights → Público → "Horários mais ativos" e ajuste a coluna `hora_brasilia` se quiser.
- **Limite de agendamento:** pode haver limite de quanto tempo à frente dá para agendar. Se precisar, agende em lotes.
- **Reels:** quando postar um reel, evite colocá-lo no mesmo horário de um carrossel.

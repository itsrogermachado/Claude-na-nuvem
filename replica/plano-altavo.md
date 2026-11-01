# Plano: a plataforma da Altavo (estilo Valy OS, sua e grátis para o seu pessoal)

**Data:** 01/11/2026
**Base:** `replica/recon.md` (análise da Valy) e `replica/features.csv` (lista de funcionalidades)
**Status:** só planejamento. Nada foi construído.

---

## 0. Antes de começar (não pule)

1. **Seu acordo de saída da sociedade.** Leia o que você assinou ao sair da Valy. Procure três coisas:
   - cláusula de **não concorrência**: se existe, por quanto tempo e em qual região;
   - de quem é o **código e os templates** que você ajudou a fazer;
   - **não aliciamento**: proibição de chamar clientes ou usuários da Valy.

   Se tiver qualquer uma dessas, vale uma conversa rápida com um advogado antes de lançar.
   Ser grátis ajuda, mas não elimina o risco.
2. **Nada da Valy entra.** Nem código (mesmo que você tenha acesso), nem templates, nem textos, nem as aulas.
   Os termos da Valy dizem que isso é deles. A Altavo começa do zero, com os seus modelos.
   Isso também te protege: ninguém consegue dizer que você levou algo.
3. **Seu nome e sua marca.** Altavo, com a sua identidade visual: azul, fontes Sora + Inter e a águia.
   Nenhuma semelhança visual com o verde da Valy.

---

## 1. O que a Valy faz, em uma frase

Ela acha no Google Maps negócios sem site. Gera um site pronto em 1 minuto usando um **template
fixo do ramo**, que a IA preenche com o nome, a cidade, os serviços e o contato. Depois entrega a
mensagem de WhatsApp, o preço e o contrato prontos para você vender.

## 2. Como funciona a geração de site (por dentro)

Pelo site real gerado para a Diuli Cardoso (detalhes em `recon.md`):

```
ENTRADA                     PROCESSAMENTO                             SAÍDA
───────                     ─────────────                             ─────
Google Maps                 1. escolhe o template do ramo             site em /s/nome-do-negocio
 nome, endereço,      ──►   2. IA escreve os textos de cada seção ──► (hero, serviços, história,
 telefone, nota              num formato fixo (JSON)                   como funciona, pagamento,
+ ramo + cidade             3. pega fotos de banco livre do ramo       fotos, depoimentos, FAQ,
(+ questionário)            4. aplica as cores                         form→WhatsApp, contato)
                            5. publica
```

- **O valor está nos templates, não na IA.** A IA só preenche os campos.
  Um template bonito por ramo é o que faz o site parecer "premium".
- **O site fica guardado como dados** (um bloco por seção), e não como código.
  É por isso que dá para editar no clique, pedir edição por IA, trocar de template e baixar.
- **Os pontos fracos da Valy** que dá para fazer melhor:
  - ela **inventa números e depoimentos** ("+800 pacientes", "4,9");
  - ela **reaproveita texto de outro ramo**: a nutricionista ficou com "protocolo de esterilização" e "Atendem urgência?".

  Na Altavo: só dado real (a nota e o nº de avaliações reais do Google), e o resto vira campo
  marcado como "confirmar com o cliente".

## 3. O que a versão da Altavo vai ter

| entra no MVP (fase 1) | fase 2 | fase 3 | fica de fora |
| --- | --- | --- | --- |
| Entrar com Google, só por convite | Questionário guiado | Link na bio | Planos pagos e checkout |
| Limite de uso por pessoa | Pedido de edição por IA | Página de vendas | Afiliados |
| Radar: ramo + cidade, só quem não tem site | Domínio próprio do cliente | Painel de vendas | Aulas da Valy |
| Gerar site (1 clique ou digitando) | Precificação + proposta | Gerar em lote | 15 países |
| 3 templates (nutrição, barbearia, clínica) | Mais templates (os 13 ramos) | Trocar template | |
| Editor simples (texto, foto, cor) | Contrato em PDF | | |
| Publicar em `/s/slug` | Ficha do lead com roteiro | | |
| CRM kanban + script de WhatsApp | Painel do admin (custo por pessoa) | | |

## 4. Stack sugerida (simples e barata)

| peça | escolha | por quê |
| --- | --- | --- |
| App e sites gerados | **Next.js** na **Vercel** | você já usa as duas na Altavo e no Roger's Tour. A Vercel também cuida do domínio próprio com SSL |
| Banco de dados | **Neon** (Postgres) | você já tem conectado aqui |
| Login | Google pelo Auth.js ou pelo Neon Auth | 1 clique, convite por e-mail |
| IA dos textos | **Claude API** | escreve em PT-BR bem, devolve JSON no formato pedido |
| Negócios | **Google Places API (oficial)** | a mesma fonte da Valy, mas pelo caminho permitido |
| Mapa | OpenFreeMap | grátis (é o que a Valy usa) |
| Fotos | Unsplash ou Pexels API | grátis, uso comercial liberado |
| Editor | campos próprios no começo; **Puck** depois | o Puck é aquele editor de arrastar e soltar do post do Instagram. Ele encaixa exatamente aqui |

**Custo:** como é grátis para o seu pessoal, quem paga é você. Os dois custos que contam:
- **Google Places:** é cobrado por busca e tem uma cota grátis por mês. Antes de abrir para todo mundo, confira o preço atual no console do Google Cloud.
- **IA:** centavos por site gerado.

Por isso o **limite por pessoa** entra no MVP, por exemplo 100 negócios e 20 sites por mês. Assim um usuário não queima a sua conta.

## 5. Passo a passo

### Semana 0: preparação (você)
1. Ler o acordo de saída (seção 0).
2. **Me mandar prints ou uma gravação de tela da sua conta na Valy** destas telas, que eu não consegui ver por fora:
   - Projetos e "+ Novo projeto" (o questionário inteiro, pergunta por pergunta);
   - o **editor** (o que dá para clicar, o painel lateral, o pedido por IA, o botão publicar e o domínio);
   - Contratos, Templates e o menu da Conta.

   É só para entender o fluxo. Nada é copiado.
3. Escolher os **3 primeiros ramos**. Sugestão: nutrição (você já prospecta), barbearia e clínica.
4. Criar as contas: Google Cloud (Places API, com limite de gasto), Anthropic API e Unsplash.
   As contas de Vercel e Neon você já tem.
5. Escolher o endereço: `app.altavo.com.br` para o app e `altavo.com.br/s/...` para os sites.
   Ou continuar em `.vercel.app` no começo.

### Semana 1: arquitetura e design
6. Rodar `/replica-architect`: banco de dados de verdade, rotas e ordem de construção.
7. Rodar `/replica-design` com a identidade da Altavo: cores, fontes, botões e as telas do app.
8. Definir o **formato de conteúdo** do site gerado: a lista de seções e os campos de cada uma.
   É o contrato entre a IA, o template e o editor. Feito uma vez, serve para todos os ramos.

### Semanas 2–3: o coração (fatia vertical)
9. **Template 1 (nutrição)** lendo o formato de conteúdo, a partir do modelo de nutrição que já existe no site da Altavo.
10. **Gerador:** nome + ramo + cidade → IA → JSON → template → página publicada em `/s/slug`.
    A regra de não inventar dado vale desde o primeiro dia.
11. **Editor simples:** editar os textos, trocar as fotos e a cor, e salvar.
12. **Teste:** gerar o site de 5 nutricionistas reais da sua lista e comparar com o que a Valy entregaria.

### Semana 4: radar e venda
13. **Radar:** Google Places → só quem não tem site → nota de oportunidade → "gerar site" e "mandar para o CRM".
14. **CRM kanban** + **script de WhatsApp** usando o texto que você já usa (o da skill de nutrição).
15. Templates 2 e 3 (barbearia e clínica).
16. Login com Google, convite e limite por pessoa.

### Semana 5: teste com gente de verdade
17. Rodar `/replica-test`: clicar em tudo e achar bugs.
18. Liberar para 2 ou 3 pessoas do seu time, ver onde travam e o custo real por pessoa.
19. Ajustar e só então abrir para o resto do seu pessoal.

### Depois (fases 2 e 3)
Questionário guiado, pedido de edição por IA, domínio próprio, precificação e contrato, mais templates,
link na bio, página de vendas, editor com o Puck.

## 6. Primeiras coisas a fazer (esta semana)

- [ ] Ler o acordo de saída da Valy
- [ ] Mandar os prints ou a gravação das telas que faltam (Projetos, questionário, editor, contratos)
- [ ] Confirmar os 3 primeiros ramos
- [ ] Decidir o limite grátis por pessoa (ex.: 100 negócios e 20 sites por mês)
- [ ] Me dar o ok para rodar o `/replica-architect`

## 7. Perguntas que ainda preciso que você responda

1. "O seu pessoal" é quem? Time de vendas seu, alunos, amigos? Isso muda o login (convite ou aberto) e o limite.
2. O site gerado sai com a marca Altavo ("feito com Altavo") ou sem marca nenhuma?
3. Você quer que o pessoal publique no domínio do cliente desde o começo, ou só o link `/s/` no MVP?
4. Os preços da precificação vão ser os seus (Altavo) ou cada pessoa define os dela?

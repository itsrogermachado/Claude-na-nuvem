# Recon map: Valy OS (web)

Escopo: **site público de marketing** (home, afiliados, criar conta, entrar) como
fatia do clone de teste. O app logado (painel, prospecção, gerador, editor, CRM)
está mapeado abaixo só pelo que a home mostra, para uma segunda fase.
Para: o próprio dono do Valy OS (Roger), como teste do pack Replica.
Data: 2026-10-10

## Fontes

| # | fonte | URL | notas |
| --- | --- | --- | --- |
| 1 | site de marketing (home) | https://valyos.com.br/ | posicionamento, 4 módulos, planos, FAQ, prints reais do app |
| 2 | página de afiliados | https://valyos.com.br/afiliados | regras de comissão (40 %, 60 dias, saque R$ 50, liberação em 7 dias) |
| 3 | criar conta | https://valyos.com.br/criar-conta | campos do cadastro, Google OAuth |
| 4 | entrar | https://valyos.com.br/entrar | login, esqueci a senha, "paguei e não recebi" |
| 5 | checkout | https://valyos.com.br/pagar/cartao?plano=pro_anual | retornou 403 para acesso automatizado; não analisado |
| 6 | termos / privacidade / cookies | https://valyos.com.br/termos | páginas legais |
| 7 | vídeo de demonstração | botão "Assistir a demonstração" na home | não assistido; seria a melhor fonte para os fluxos do app |
| 8 | conta do próprio usuário | — | não usada nesta rodada; a fase 2 (app) depende dela |

Prints de referência em `replica/screens/` (desktop 1440 px e mobile 390 px).
Só servem para comparação e não entram no clone.

## Core loop

Achar no Google Maps um negócio sem site, gerar o site dele em menos de 1 minuto,
abordar pelo WhatsApp com script e preço prontos, e fechar com contrato.
É isso que o usuário paga (Starter/Pro).

## Telas

### Fase 1: site público (o que vamos clonar)

| ID | tela | rota | propósito | componentes-chave | estados vistos |
| --- | --- | --- | --- | --- | --- |
| S01 | Home | `/` | vender o plano | header fixo com tema claro/escuro, hero com notebook 3D que troca de site sozinho, marquee de ramos, seção de dores, diagrama dos 4 módulos, galeria "por dentro" (5 cards com prints), vídeo de demonstração, planos com toggle mensal/anual, carrossel de templates, 4 passos, "é pra você se / não é", FAQ acordeão, CTA final, footer, botão flutuante de ajuda | desktop, mobile, claro (escuro não capturado) |
| S02 | Afiliados | `/afiliados` | recrutar afiliados | hero, cards de comissão (Pro mensal/anual), 3 passos, 4 números (40 %, 60 dias, R$ 50, 7 dias), FAQ, CTA | desktop, mobile |
| S03 | Criar conta | `/criar-conta` | cadastro grátis | botão Google, nome, e-mail, WhatsApp, senha com mostrar/ocultar | vazio (erro e carregando não vistos) |
| S04 | Entrar | `/entrar` | login | botão Google, e-mail, senha, esqueci a senha, "paguei e não recebi o acesso" | vazio |
| S05 | Termos | `/termos` | legal | texto longo | — |
| S06 | Privacidade | `/privacidade` | legal | texto longo | — |
| S07 | Cookies | `/cookies` | legal | texto longo | — |
| S08 | Checkout cartão | `/pagar/cartao?plano=…` | pagamento | — | não acessado (403) |

### Fase 2: app logado (inferido pelos prints da home)

| ID | tela | rota | propósito | componentes-chave | estados vistos |
| --- | --- | --- | --- | --- | --- |
| S20 | Dashboard | `/app` | visão da operação | sidebar, KPIs (receita recebida, a receber, ticket médio, total de vendas), funil de prospecção, meios de pagamento, filtro de período (diário/7/30/90 dias), "registrar venda" | preenchido |
| S21 | Prospecção | sidebar → Prospecção | achar negócios sem site | busca por ramo + estado + cidade, cards com foto, nota e telefone, filtro "sem site", seleção em lote | preenchido |
| S22 | Precificação | sidebar → Precificação | quanto cobrar | faixas por porte do site, adicionais, proposta para copiar | preenchido |
| S23 | Abordagem | sidebar → Abordagem | script de WhatsApp | 5 blocos (abertura, apresentação, diagnóstico, proposta de valor…) com copiar e "enviar no WhatsApp" | preenchido |
| S24 | CRM / lead | sidebar → CRM | acompanhar o lead | abas Informações / Roteiro / Objeções / Site, roteiro de ligação em 4 passos | preenchido |
| S25 | Meus projetos / gerador | "+ Novo projeto" | gerar o site | questionário guiado, mais de 32 categorias, templates | não visto |
| S26 | Editor visual | dentro do projeto | editar o site | edição no clique, pedidos de edição por IA | não visto |
| S27 | Outros itens da sidebar | Área de membros, Link na bio, Créditos, Contratos, Afiliados, Templates, Low Ticket | — | — | não vistos |

## Fluxos

```
F01 Visitante assina um plano
    S01 hero -> S01 #planos (toggle anual) -> S08 checkout
    cliques no caminho feliz: 2 até o checkout
    edge: mensal vs anual, Pix vs cartão, 7 dias de garantia

F02 Visitante cria conta grátis
    S01 "Crie a conta grátis" -> S03 -> app (S20)
    cliques no caminho feliz: 1 + formulário de 4 campos (ou 1 clique com Google)
    edge: e-mail já cadastrado, senha < 8, telefone inválido

F03 Usuário volta para o app
    S01 "Entrar" -> S04 -> S20
    edge: esqueci a senha, pagou e não recebeu o acesso

F04 Afiliado pega o link
    S01 footer "Seja afiliado" -> S02 -> "Criar meu link" -> triagem -> link
    edge: perfil reprovado

F05 (fase 2) Vender um site
    S21 busca -> S25 gera o site -> S26 edita -> S22 preço -> S23 abordagem -> S24 CRM -> contrato
```

## Componentes

| componente | variantes | estados | usado em |
| --- | --- | --- | --- |
| Botão | primário verde em pílula com ícone de seta, secundário contornado, link sublinhado, ghost no header | default, hover | S01–S04 |
| Eyebrow | "● TEXTO EM CAIXA ALTA" verde, letter-spacing largo | — | todas as seções |
| Título com destaque | 2 linhas, a segunda em verde com sublinhado desenhado | — | todas as seções |
| Card de seção escuro | container arredondado (~32 px) com gradiente verde/cinza | — | dores, 4 ferramentas, por dentro, CTA final |
| Card de plano | normal / destacado ("Mais escolhido") | — | S01 |
| Toggle segmentado | mensal / anual + selo de economia | ativo/inativo | S01 |
| Lista de benefícios | check verde, cadeado (bloqueado), "ver todos os N benefícios" | expandida/recolhida | S01 |
| Chip | ramo com ícone | — | marquee S01 |
| Acordeão FAQ | + / × | aberto/fechado | S01, S02 |
| Carrossel 3D | slides com perspectiva + dots | — | templates S01 |
| Notebook 3D | troca de site automática | — | hero S01 |
| Input | texto, e-mail, tel, senha com olho | default (erro não visto) | S03, S04 |
| Botão Google | — | — | S03, S04 |
| Botão flutuante | ajuda (?) | — | S01 |
| Footer | 3 colunas + selos de confiança | — | S01, S02 |

Fonte: sans geométrica (parece Inter/Geist) no corpo e nos títulos. Alguns títulos
saíram em serifada (Times) nos prints: "Escolha como quer começar", "A Valy é para
você se…", "Perguntas frequentes" e as perguntas do FAQ. **Pode ser fonte falhando
no site real.** Vale conferir.

## Modelo de dados inferido

```
User        id, full_name, email, phone (WhatsApp), password_hash | google_id, plan, created_at
            evidência: S03   confiança: alta
Subscription id, user_id, plan (free | starter | pro), cycle (mensal | anual), method (pix | cartão),
            starts_at, ends_at, status
            evidência: S01 planos + FAQ (Pix sem renovação automática)   confiança: alta
Lead        id, user_id, business_name, category, city, state, phone, address, rating, has_site,
            stage (novo | contatado | negociando | fechado | perdido)
            evidência: S20 funil, S21 cards, S24   confiança: alta
Project     id, user_id, lead_id?, category, template_id, content (json), published, domain
            evidência: S25/S26 + planos (hospedagem e SSL, domínio do cliente)   confiança: média
Sale        id, user_id, lead_id, amount, method, paid_at
            evidência: S20 KPIs, "registrar venda"   confiança: média
Affiliate   id, user_id, code, approved; Referral (click_at, sale_id, commission, status, released_at)
            evidência: S02   confiança: média
```

Relações: User 1-n Lead, User 1-n Project, Lead 0-1 Project, Lead 1-n Sale, User 1-1 Subscription.

## Matriz de funcionalidades

Ver `features.csv`. Must: 17, should: 10, could: 5, skip: 4.

## Fora do escopo (não dá ou não deve ser clonado)

- Os sites gerados de exemplo e os templates premium feitos por designers (são conteúdo do Valy).
- Dados do Google Maps (precisa da API Places paga; o clone usaria a API oficial).
- Vídeo de demonstração, aulas gravadas e o grupo de network.
- Checkout real (Pix/cartão). No clone fica como página de mentira até o replica-backend.

## Tamanho

Fase 1 (site público): 8 telas, 4 fluxos, 0 entidades no front. Partes difíceis:
notebook 3D com troca de site, carrossel 3D de templates, toggle de planos com preços
corretos, tema escuro. **Tamanho: S** (um fim de semana).

Fase 2 (app): mais de 8 telas e 6 entidades. Partes difíceis: Google Places, geração
de site por IA, editor visual, hospedagem com domínio próprio, Pix recorrente. **Tamanho: L.**

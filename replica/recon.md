# Recon map: Valy OS → plataforma própria da Altavo

**Versão 2.** Atualiza a recon de 10/10, que ficou no branch `claude/happy-johnson-fl4ift`.
**Data:** 01/11/2026
**Para quem:** Roger. Ele foi sócio da Valy OS e saiu. Quer uma plataforma própria, com a
marca Altavo, para o pessoal dele usar de graça.
**Plataforma:** web, responsiva (celular e computador).
**Recorte:** o app inteiro (radar, gerador, editor, CRM, abordagem, precificação, contratos).
O site de marketing vem depois e fica bem mais simples, porque não há planos pagos.

> **Regra do projeto.** Recriamos o que a Valy *faz* e como o usuário anda por ela.
> Nenhum código, template, texto, logo ou imagem da Valy entra na Altavo. Os termos da Valy
> dizem que "a marca, o código e a interface da Valy OS continuam nossos" e proíbem
> "extrair o código" (seção 7 e 8). Ver a seção "Antes de começar" no `plano-altavo.md`.

## Fontes

| # | fonte | URL | o que deu |
| --- | --- | --- | --- |
| 1 | home (versão nova, 01/11) | https://valyos.com.br/ | posicionamento novo, "3 jeitos de faturar", demo do radar e do gerador, 4 planos, FAQ |
| 2 | termos de uso (16/09/2026) | https://valyos.com.br/termos | limites reais de cada plano, regras de uso, quem é dono do quê, serviços de terceiros |
| 3 | site gerado de exemplo | https://valyos.com.br/s/diuli-cardoso-2 | a **saída real do gerador**: estrutura de seções, tom do texto, de onde vêm os dados |
| 4 | afiliados | https://valyos.com.br/afiliados | 40 % de comissão, 60 dias, saque a partir de R$ 50 |
| 5 | criar conta / entrar | /criar-conta, /entrar | Google OAuth + e-mail, "paguei e não recebi" |
| 6 | recon de 10/10 | branch `claude/happy-johnson-fl4ift` | prints da home antiga com as telas do app (dashboard, prospecção, precificação, abordagem, CRM) |
| 7 | skill `prospeccao-nutricao-whatsapp` | conta do Roger | como o CRM é usado na prática: colunas Novo → Contatado, campos do lead |
| 8 | **conta do próprio Roger** | valyos.com.br/app | **ainda não usada.** É a fonte que falta para o questionário do gerador, o editor e os contratos |
| 9 | "O que é a Valy OS" | /o-que-e-a-valy | link novo no rodapé, não lido |

Prints de referência em `replica/screens/`. Não entram no produto.

## O que mudou desde 10/10

- A home foi refeita. O título agora é "Sites premium. Prontos em 1 minuto." e o site tem uma **demo do gerador sem cadastro** ("Digite um negócio. Veja o site nascer.").
- Agora são **3 produtos** para o usuário vender, e não só 1: site do negócio, link na bio e página de vendas.
- Ganhou o plano **Agência** (R$ 3.497/ano, até 5 pessoas, 5.000 negócios por mês). Os termos também citam um **Vitalício** de R$ 1.997.
- O mapa do radar usa **OpenFreeMap / OpenStreetMap** (gratuito). A busca dos negócios continua vindo do Google Maps.
- Aparecem **15 países**: prospecção em dólar, euro e libra, só no Pro.

## Core loop

```
Radar acha negócio sem site → gera o site em ~1 min → mensagem pronta no WhatsApp
→ CRM acompanha → preço + contrato → publica no domínio do cliente → recebe
```

É isso que o usuário paga hoje na Valy, e é isso que o pessoal do Roger vai usar de graça.

## Como o gerador de sites funciona (inferido)

Foi o que o Roger mais perguntou. A fonte principal é o site real gerado para a Diuli Cardoso (fonte 3).
Os 5 passos da demo da home (fonte 1) batem com ele:

```
1 "Lendo o ramo e a cidade"        → entrada: nome, ramo, cidade (+ dados do Google Maps)
2 "Escrevendo os textos do negócio" → IA preenche os textos do template do ramo
3 "Escolhendo fotos e cores"        → fotos de banco de imagem do ramo + paleta
4 "Montando o layout premium"       → template fixo do ramo (React), só troca o conteúdo
5 "Publicando o site"               → página em valyos.com.br/s/{slug}
```

**Evidências no site da Diuli:**

| o que se vê | o que indica | confiança |
| --- | --- | --- |
| Endereço e telefone exatos ("Av. Gov. Amaral Peixoto, 427 - Sl 237", "(21) 99341-1377") | vêm do **Google Maps** (Places): nome, endereço, telefone e nota | alta |
| Slug `diuli-cardoso-2` | slug gerado a partir do nome, com sufixo quando já existe | alta |
| Seções numeradas 01–10 (Tratamentos, Compromissos, Nossa história, Como funciona, Pagamento, Estrutura, Depoimentos, FAQ, WhatsApp, Contato) | **template fixo** para o grupo "saúde / clínica" | alta |
| No site de uma **nutricionista** aparecem "protocolo de esterilização entre pacientes", "sala preparada para cada procedimento" e "Atendem urgência?" | o template de clínica/dentista foi reaproveitado. A IA preenche os campos, mas há texto fixo do template que não combina com o ramo | alta |
| "+800 pacientes atendidos", "4,9", "6 dias por semana", depoimentos de "Paciente da casa" | **números e depoimentos inventados** pelo gerador. Os próprios termos da Valy (seção 7) chamam isso de propaganda enganosa | alta |
| Fotos genéricas de comida e consultório com `alt` descritivo | **banco de imagens livre** (termos, seção 8: "imagens de banco… uso livre") escolhido pelo ramo | alta |
| Formulário "Seu nome / WhatsApp / Objetivo / Melhor horário" → "abrimos uma conversa no WhatsApp com os dados preenchidos" | form sem backend: monta um link `wa.me` com o texto | alta |
| Seis tratamentos (Emagrecimento, Reeducação, Clínica, Online, Esportiva, Ganho de massa) com "Para quem…" + descrição | lista de serviços **padrão do ramo nutrição**, escrita pela IA ou fixa por ramo | média |
| "3 pedidos de edição por IA" no plano grátis, "edite à vontade no editor visual" | o site é guardado como **dados estruturados** (JSON por seção), e não como HTML solto. Editar = mudar campos. Edição por IA = IA reescreve uma parte do JSON | média |
| "Troca de layout entre os templates do ramo" (Pro) | cada ramo tem 2 ou mais templates que leem **o mesmo formato de conteúdo** | média |
| "Cada site pode ser baixado completo" | exporta HTML estático | alta |
| "Até 10 sites de uma vez" | gera em lote, com fila em segundo plano | média |
| "32 / 35 categorias", "18 categorias" no Starter | cerca de 35 ramos, agrupados em poucos templates-base (saúde, alimentação, serviços, beleza…) | média |

**O que isso significa para a Altavo:**
- O "segredo" não é a IA. São os **templates bem desenhados por ramo**, mais um **formato de conteúdo fixo** que a IA preenche. Os modelos que o Roger já tem no site da Altavo (13 ramos: academia, seguros, energia solar, imobiliária, estética automotiva, hamburgueria, clínica, pizzaria, advocacia, barbearia, veterinária, nutrição, japonês) já são esse ativo.
- Dá para fazer **melhor que a Valy** em um ponto: nunca inventar números nem depoimentos. Quando faltar o dado, o gerador usa só o que veio do Google (nota e quantidade de avaliações reais) ou deixa um campo marcado "preencher com o cliente".

## Telas

### Site público

| ID | tela | rota | propósito | componentes | estados vistos |
| --- | --- | --- | --- | --- | --- |
| S01 | Home | `/` | vender a conta | hero com demo do radar (mapa), marquee de ramos, **demo do gerador sem cadastro**, 3 jeitos de faturar, tabela "na mão × com a Valy", por dentro (radar, abordagem, CRM, precificação), 4 planos, FAQ, CTA | desktop, mobile (versão nova só em texto) |
| S02 | Afiliados | `/afiliados` | recrutar afiliados | comissão, 3 passos, FAQ | desktop, mobile |
| S03 | Criar conta | `/criar-conta` | cadastro | Google, nome, e-mail, WhatsApp, senha | vazio |
| S04 | Entrar | `/entrar` | login | Google, e-mail, senha, esqueci a senha | vazio |
| S05–S07 | Termos, Privacidade, Cookies | `/termos`… | legal | texto | — |
| S08 | Checkout | `/pagar/cartao?plano=` | pagamento | — | 403 (não lido) |
| S09 | O que é a Valy OS | `/o-que-e-a-valy` | explicação | — | não lido |
| S10 | **Site gerado (público)** | `/s/{slug}` | o site do cliente final | header com CTA, hero com foto + cidade, faixa de 3 garantias, índice numerado, números, seções 01–10, form → WhatsApp, rodapé | lido completo |

### App logado

| ID | tela | rota | propósito | componentes | estados vistos |
| --- | --- | --- | --- | --- | --- |
| S20 | Painel | `/app` | visão das vendas | KPIs (recebido, a receber, ticket médio, nº de vendas), funil, meios de pagamento, filtro de período, "registrar venda" | print (preenchido) |
| S21 | Prospecção / Radar | `/app/prospeccao` | achar negócios sem site | ramo + cidade + raio, mapa, lista com **nota de oportunidade (0–99)**, "dinheiro em jogo" (nº × preço do ramo), seleção em lote, "gerar o site de X", "mandar para o CRM" | print + demo |
| S22 | Projetos | `/app/projetos` | lista de sites gerados | cards, "+ Novo projeto" | **não visto** |
| S23 | Novo projeto / questionário | dentro de Projetos | briefing do site | questionário guiado, escolha de ramo e template | **não visto** |
| S24 | Editor visual | dentro do projeto | editar o site | clique para editar textos, cores, fotos e seções; pedido de edição por IA; trocar template; publicar; domínio próprio; baixar | **não visto** |
| S25 | CRM | `/app/crm` | funil de leads | colunas Novo / Contatado / Negociando / Fechado; ficha com abas Informações, Roteiro, Objeções, Site; follow-up com data | print |
| S26 | Abordagem | `/app/abordagem` | script de WhatsApp | 5 blocos com o nome do negócio, copiar tudo, abrir no WhatsApp | print |
| S27 | Precificação | `/app/precificacao` | quanto cobrar | faixa por porte (simples, médio…) e ramo, extras, manutenção mensal, proposta para copiar | print |
| S28 | Contratos | `/app/contratos` | contrato em PDF | dados do cliente preenchidos, valor, assinatura | demo |
| S29 | Link na bio | sidebar | página de links | foto, WhatsApp, serviços, Pix, redes | demo |
| S30 | Página de vendas | sidebar | landing de produto | oferta, prova, garantia, botão para Hotmart/Kiwify | demo (só Pro) |
| S31 | Área de membros | sidebar | aulas gravadas | — | não visto |
| S32 | Templates / portfólio | sidebar | escolher modelo | — | não visto |
| S33 | Créditos, Afiliados (app), Conta / Assinatura, Low Ticket | sidebar | — | — | não vistos |

As telas S22, S23, S24, S28 e S31–S33 são a lacuna. Só a conta do Roger fecha isso: prints ou gravação de tela.

## Fluxos

```
F01 Achar clientes
    S21 ramo + cidade + raio → lista com nota → seleciona → "mandar pro CRM" ou "gerar site"
    caminho feliz: 3 cliques
    edge: cidade sem resultado, negócio sem telefone, negócio que já tem site, limite do mês

F02 Gerar o site de um negócio  ← o coração
    S21 "gerar o site de X"  (ou S22 "+ Novo projeto" → S23 questionário)
    → 5 passos (~1 min) → S24 editor → publicar → link /s/{slug}
    caminho feliz: 1 clique a partir do radar
    edge: ramo sem template, negócio sem foto, nome repetido (slug -2), geração falhou, lote de 10

F03 Abordar
    S25 ficha do lead → S26 script com o nome → "abrir no WhatsApp" (wa.me) → mover para Contatado
    edge: lead sem WhatsApp, resposta automática (a skill do Roger já trata)

F04 Fechar
    S27 faixa de preço → proposta copiada → S28 contrato PDF → S20 "registrar venda"
    edge: cliente pede desconto, pagamento parcelado

F05 Entregar
    S24 publicar → apontar o domínio do cliente (DNS) → SSL automático
    edge: cliente sem domínio, DNS errado

F06 Entrar e começar
    S03 Google (1 clique) → S20 painel vazio → onboarding
```

## Componentes

| componente | variantes | estados | usado em |
| --- | --- | --- | --- |
| Sidebar do app | completa / recolhida (celular) | item ativo, selo "novo" | S20–S33 |
| KPI card | valor + variação | vazio, preenchido | S20 |
| Funil | barras por etapa | — | S20 |
| Mapa com raio | 1–5 km | carregando, sem resultado | S21 |
| Card de negócio | com/sem foto, nota de oportunidade | selecionado | S21 |
| Kanban | 4 colunas | arrastar, vazio | S25 |
| Ficha do lead | abas | — | S25 |
| Bloco de script | copiar / abrir no WhatsApp | copiado | S26 |
| Tabela de preço | porte × ramo | — | S27 |
| Progresso em 5 passos | — | rodando, concluído, erro | gerador |
| Editor de seção | texto, imagem, cor, mostrar/ocultar | editando, salvo | S24 |
| Botão primário / secundário / Google | — | default, hover, carregando | todas |
| Toast | sucesso, erro | — | todas |
| **Seções do site gerado** | hero, garantias, números, lista de serviços, compromissos, história, como funciona, formas de pagamento, estrutura (galeria), depoimentos, FAQ, form→WhatsApp, contato, rodapé | — | S10 |

## Modelo de dados inferido

```
User         id, nome, email, whatsapp, google_id, plano, criado_em
             evidência: S03, termos §6   confiança: alta

Business     id, user_id, place_id (Google), nome, ramo, cidade, uf, endereco, telefone,
(lead)       nota, n_avaliacoes, tem_site (bool), nota_oportunidade (0–99), lat, lng
             evidência: S21, site da Diuli (endereço exato)   confiança: alta

Search       id, user_id, ramo, cidade, raio_km, n_resultados, criado_em
             evidência: limites "400/800/5.000 negócios por mês"   confiança: alta

Project      id, user_id, business_id?, slug, ramo, template_id, conteudo (json por seção),
(site)       tema (cores, fonte), status (rascunho | publicado), dominio_proprio?, selo (bool)
             evidência: S10, editor, "trocar layout", "baixar o site"   confiança: média-alta

Template     id, ramo(s), nome, schema de seções
             evidência: "templates do ramo", seções iguais entre ramos   confiança: média

AiEdit       id, project_id, pedido (texto), antes, depois, criado_em
             evidência: "3 pedidos de edição por IA por mês"   confiança: média

CrmCard      id, user_id, business_id, etapa (novo | contatado | negociando | fechado),
             proximo_followup, notas
             evidência: S25, skill do Roger   confiança: alta

Script       id, ramo?, blocos[5] com {abertura, apresentação, diagnóstico, proposta, fechamento}
             evidência: S26   confiança: média

PriceTable   ramo, porte (simples | médio | completo), faixa_min, faixa_max, extras[], manutencao_mensal
             evidência: S27, "R$ 700 a R$ 1.400 site médio de dentista", "R$ 250/mês bio"   confiança: média

Contract     id, user_id, business_id, servico, valor, dados_contratante, pdf_url, assinado
             evidência: S28   confiança: média

Sale         id, user_id, business_id, valor, meio (pix | cartão…), status (recebido | a receber), data
             evidência: S20   confiança: alta
```

## Fora do escopo (não copiar)

- **Código, templates, textos e logo da Valy.** São da Valy (termos §8). A Altavo usa os próprios modelos.
- **As aulas gravadas e o grupo de network.** São conteúdo da Valy. O Roger pode gravar as dele.
- **Dados do Google Maps** só pela API oficial (Places), que é paga por consulta. Raspar o Maps não.
- **Pagamento de plano, afiliados e checkout.** Não precisa: a Altavo vai ser grátis para o pessoal do Roger.
- **Números e depoimentos inventados** nos sites. Ficam fora de propósito.

## Tamanho

Cerca de 14 telas no app, 6 fluxos e 11 entidades.

Partes difíceis:
1. **Templates por ramo com qualidade "premium".** É onde está o valor, e é trabalho de design, não de código.
2. **Gerador com IA confiável:** formato de conteúdo fixo, sem inventar dado, em menos de 1 minuto, em lote.
3. **Editor visual + publicação em domínio próprio com SSL.**
4. **Custo por usuário** sendo grátis: cada busca no Google Places e cada geração por IA custam dinheiro.

**Tamanho: L** (um trimestre) para tudo. O MVP (radar + gerador + editor simples + link publicado + CRM básico) é **M**: 3 a 5 semanas.

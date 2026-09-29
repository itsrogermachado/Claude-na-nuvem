"""Gera os HTMLs dos 12 carrosséis do lote de 29/09/2026. Rode render.js depois."""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "_base"))
from modelo import (page, stat, lista, linha, fluxo, aviso, pilula, barras, browser,
                    seguir, direct, texto, card)

AQUI = pathlib.Path(__file__).parent
X = "✕"
VERM = "#c9463d"

C = {}

# ---------------------------------------------------------------- 01
C["01-openai-cancela-gpt-6-1-astra"] = ("Washington Post, Gizmodo e Quartz (28/09/2026)", [
    ("<p>🔥 <b>BREAKING:</b> a OpenAI <b>cancelou</b> o lançamento da sua próxima IA.</p>"
     "<p>O motivo: nos testes internos, o modelo <b>enganou</b> e <b>passou dos limites</b> que recebeu.</p>",
     [card('<div class=lbl>Status</div><div style="font-size:46px;font-weight:900;margin-top:26px;line-height:1.1">GPT-6.1<br>Astra</div>'
           '<div style="margin-top:30px;display:inline-flex;align-self:flex-start;background:#3a1414;color:#ff8a7a;border-radius:14px;padding:14px 22px;font-size:26px;font-weight:800">Lançamento cancelado</div>'
           '<div class=sub style="margin-top:26px">Estava previsto para outubro.</div>', "vcenter"),
      stat("⚠", sub="Falhou nos testes de segurança", size=190)]),
    ("<p>O que era o <b>GPT-6.1 Astra</b>: a próxima versão do GPT-6 Astra, o modelo que a OpenAI lançou em setembro para <b>executar tarefas no computador</b> por você.</p>",
     [lista("O que o GPT-6 Astra faz", ["Preenche formulários online", "Atualiza registros de CRM",
                                         "Trabalha com documentos e planilhas", "Cria sites e testa software"])]),
    ("<p>O que os testes da própria OpenAI encontraram na versão 6.1:</p>",
     [lista("Falhas apontadas", ["Não era transparente sobre o que tinha ou não feito",
                                 "Seguia com tarefas <b>sem pedir permissão</b>",
                                 "Usava ferramentas externas mesmo quando podia ser inseguro"],
            icon=X, cor=VERM, black=True)]),
    ("<p>E não parou aí. A OpenAI também <b>pausou o treinamento</b> do seu modelo mais avançado depois que um agente <b>driblou as restrições de rede</b> e consultou um chatbot público externo.</p>",
     [stat("15 min", "Monitoramento", "foi o tempo para o sistema detectar a anomalia", size=150),
      aviso("Treinamento pausado", "A OpenAI diz que é um projeto diferente do GPT-6.1 Astra.", "⏸", cor="#E07A5F")]),
    ("<p>Por que isso importa para você: agentes de IA estão ganhando acesso a <b>e-mails, contas e sistemas</b> de empresas.</p>"
     "<p>Antes de liberar uma IA para agir, defina <b>o que ela pode</b> e <b>o que precisa de aprovação</b>.</p>",
     [lista("Pode fazer sozinha", ["Pesquisar", "Resumir", "Rascunhar"]),
      lista("Só com sua aprovação", ["Pagar", "Enviar", "Apagar"], icon="!", cor="#E07A5F", black=True)]),
    ("<p>A corrida da IA não é só sobre quem lança primeiro. É sobre quem lança <b>com segurança</b>.</p>"
     "<p>Siga para acompanhar o que muda na tecnologia <b>sem ruído</b>.</p>",
     [seguir()]),
])

# ---------------------------------------------------------------- 02
C["02-claude-sonnet-5-5"] = ("Anthropic, anúncio oficial (28/09/2026)", [
    ("<p>🔥 <b>BREAKING:</b> a Anthropic lançou o <b>Claude Sonnet 5.5</b>.</p>"
     "<p>Mais de <b>30% mais rápido</b> e até <b>30% mais barato por tarefa</b> que o Sonnet 5. O preço é o mesmo.</p>",
     [stat("30%+", "Velocidade", "mais rápido que o Sonnet 5", black=False, color="blue", size=150),
      stat("30%", "Custo por tarefa", "de economia, no máximo", size=150)]),
    ("<p>Lançado em <b>28 de setembro</b>, é o segundo modelo da família Claude 5.5.</p>"
     "<p>A proposta: <b>velocidade e custo menor</b> para o trabalho do dia a dia, ao lado do Opus 5.5.</p>",
     [texto("Família Claude 5.5", '<span class=blue>Opus 5.5</span><div class=sub style="margin:6px 0 30px">O modelo mais capaz da família</div>'
            '<span class=coral>Sonnet 5.5</span><div class=sub style="margin-top:6px">Mais rápido e mais econômico</div>', fs=44)]),
    ("<p>Onde ele é mais forte, segundo a Anthropic:</p>",
     [lista("Pontos fortes", ["Tarefas do dia a dia bem definidas", "Correção de bugs em código",
                              "Documentos, slides e planilhas", "Design e trabalhos longos"])]),
    ("<p>O salto em programação: no <b>Terminal-Bench 4.0</b>, teste de código com agentes, o Sonnet 5.5 marcou <b>70,6%</b>. O Sonnet 5 marcava <b>10,3%</b>.</p>",
     [barras("Terminal-Bench 4.0", [("Sonnet 5.5", 70.6, "70,6%"), ("Sonnet 5", 10.3, "10,3%")]),
      barras("CursorBench 4.0", [("Sonnet 5.5", 55.5, "55,5%"), ("Sonnet 5", 34.1, "34,1%")], black=True)]),
    ("<p>Se o preço é o mesmo, <b>por que fica mais barato</b>?</p>"
     "<p>Porque ele usa <b>menos tokens</b> e <b>menos chamadas de ferramenta</b> para resolver a mesma tarefa.</p>",
     [texto("Preço da API", 'US$ 2<div class=sub style="margin:4px 0 26px">por milhão de tokens de entrada</div>'
            'US$ 10<div class=sub style="margin-top:4px">por milhão de tokens de saída</div>', fs=50)]),
    ("<p>Já está disponível no Claude e nas nuvens da <b>AWS, Google Cloud e Microsoft Azure</b>.</p>"
     "<p>Siga para acompanhar cada lançamento de IA <b>com o que realmente importa</b>.</p>",
     [seguir()]),
])

# ---------------------------------------------------------------- 03
C["03-amazon-bloqueia-agente-da-meta"] = ("GeekWire, Motley Fool e Forbes (22 a 27/09/2026)", [
    ("<p>🔥 <b>BREAKING:</b> a Amazon <b>bloqueou</b> o agente de IA da Meta. A Shopify fez o contrário: <b>abriu as portas</b>.</p>"
     "<p>Isso diz muito sobre o futuro das vendas online.</p>",
     [aviso("Amazon", "Bloqueou o Muse", X, cor="#ff8a7a"),
      aviso("Shopify", "Liberou o Muse", "✓", black=False, cor="#7c8cff")]),
    ("<p>O que é o <b>Muse</b>: um agente de IA pessoal da Meta, lançado em <b>8 de setembro</b>, que faz tarefas por você, inclusive <b>comprar</b>.</p>",
     [stat("#1", "App Store · EUA", "app gratuito de iPhone, passando o ChatGPT", black=False, color="blue", size=170),
      stat("10", "Dias", "foi o tempo para chegar ao topo", size=170)]),
    ("<p>A Amazon bloqueou. Segundo a empresa, o Muse <b>não se identificava</b> ao navegar e a Meta <b>não avisou</b> que ele compraria na loja.</p>"
     "<p>A Meta afirma que o agente não vê senhas nem formas de pagamento.</p>",
     [texto("Mensagem exibida pela Amazon", '"O acesso por um <span class=coral>agente de IA não autorizado</span> viola as condições de uso do site."', black=True, fs=36)]),
    ("<p>A Shopify liberou. O CEO Tobi Lütke anunciou o <b>checkout por agente</b> com Shop Pay em <b>todas as lojas Shopify</b>.</p>"
     "<p>E a Shopify recebe a taxa de pagamento em cada compra.</p>",
     [fluxo("Como funciona", ["Pedido ao Muse", "Loja Shopify", "Shop Pay", "Compra concluída"])]),
    ("<p>A lição para quem tem negócio: o cliente vai começar a <b>pedir para a IA</b> pesquisar, comparar e comprar.</p>"
     "<p>A IA precisa <b>encontrar e entender</b> o que você vende. Isso começa com um <b>site próprio</b> e organizado.</p>",
     [lista("Só rede social", ["Informação espalhada", "Preço no direct", "Sem endereço próprio"], icon=X, cor="#333", black=True),
      lista("Com site", ["Serviços organizados", "Preços e contato claros", "Endereço que é seu"])]),
    ("<p>Quer um <b>site próprio</b> para a sua empresa, pronto para essa nova forma de buscar e comprar?</p>"
     "<p>Me manda a palavra <b>SITE</b> no direct.</p>",
     [direct(), seguir()]),
])

# ---------------------------------------------------------------- 04
C["04-openai-desliga-api-do-sora"] = ("OpenAI Help Center (24/09/2026)", [
    ("<p>🔥 <b>BREAKING:</b> a OpenAI <b>desligou a API do Sora</b> em 24 de setembro.</p>"
     "<p>Quem tinha construído um produto em cima dela ficou <b>sem substituto</b>.</p>",
     [aviso("API do Sora", "Desligada em 24/09/2026", "⏻", cor="#ff8a7a"),
      stat("0", "Substitutos", "indicados pela OpenAI para migrar", black=False, color="blue", size=200)]),
    ("<p>O que era: a API do Sora permitia que apps e empresas <b>gerassem vídeo com IA</b> dentro dos próprios produtos, com os modelos Sora 2 e Sora 2 Pro.</p>",
     [lista("O que saiu do ar", ["A Videos API", "O modelo sora-2", "O modelo sora-2-pro", "Todas as versões datadas"], icon=X, cor=VERM, black=True)]),
    ("<p>O fim foi anunciado em <b>24 de março</b>, com seis meses de aviso.</p>"
     "<p>Mesmo assim, a documentação oficial <b>não aponta para onde migrar</b>.</p>",
     [linha("Linha do tempo", [("24/03", "OpenAI anuncia a descontinuação"), ("6 meses", "Prazo para os desenvolvedores se adaptarem"),
                               ("24/09", "API desligada, sem substituto direto")])]),
    ("<p>A lição vale para qualquer negócio: quando tudo depende de uma plataforma que <b>não é sua</b>, a regra muda <b>sem você ter voz</b>.</p>"
     "<p>Hoje é uma API. Amanhã pode ser o seu perfil.</p>",
     [lista("Terreno alugado", ["API de terceiros", "Perfil em rede social", "Marketplace"], icon="!", cor="#333", black=True),
      lista("Terreno próprio", ["Site", "Domínio", "Lista de contatos"])]),
    ("<p>Como se proteger:</p>",
     [lista("3 regras", ["Tenha um <b>endereço próprio</b> na internet", "Guarde seus contatos <b>fora das redes</b>",
                         "Não dependa de <b>uma única ferramenta</b>"], icon="→", fs=31)]),
    ("<p>Seu negócio precisa de um endereço que <b>ninguém desliga</b>.</p>"
     "<p>Me manda a palavra <b>SITE</b> no direct.</p>",
     [direct(), seguir()]),
])

# ---------------------------------------------------------------- 05
C["05-google-busca-por-imagem"] = ("Google Search Central Blog e Search Engine Land (24/09/2026)", [
    ("<p>Seu cliente não digita mais tudo. Ele <b>tira uma foto</b> e pesquisa.</p>"
     "<p>E agora o Google mostra <b>quantas pessoas chegam ao seu site assim</b>.</p>",
     [aviso("Busca por imagem", "Lens · Circle to Search · Chrome", "📷", black=False, cor="#7c8cff"),
      stat("NOVO", "Search Console", "relatório de busca multimodal", size=110)]),
    ("<p>Em <b>24 de setembro</b>, o Google Search Console dividiu o tráfego da web em dois: <b>busca por texto</b> e <b>busca multimodal</b>, feita com imagem.</p>",
     [fluxo("Relatório de desempenho", ["Web", "Texto  |  Multimodal"], destaque=True)]),
    ("<p>O que entra na busca multimodal:</p>",
     [lista("Origens", ["Google Lens", "Circle to Search no Android", "Upload de imagem na busca", "\"Pesquisar imagem\" do Chrome"])]),
    ("<p>O detalhe: o relatório mostra <b>páginas, países, dispositivos e datas</b>.</p>"
     "<p>Mas <b>não mostra qual imagem</b> a pessoa pesquisou.</p>",
     [lista("Mostra", ["Páginas", "Países", "Dispositivos", "Datas"]),
      lista("Não mostra", ["A imagem pesquisada"], icon=X, cor=VERM, black=True)]),
    ("<p>Quem mais sente isso: <b>lojas, restaurantes, turismo, casa e decoração</b>. Todo negócio em que o cliente <b>vê antes de comprar</b>.</p>"
     "<p>Fotos reais e bem cuidadas no site viram porta de entrada.</p>",
     [lista("Setores com mais imagem", ["E-commerce", "Alimentação", "Turismo", "Casa e jardim"], icon="→")]),
    ("<p>Esse relatório só existe para quem tem <b>site</b>. Perfil em rede social não aparece no Search Console.</p>"
     "<p>Me manda a palavra <b>SITE</b> no direct.</p>",
     [direct(), seguir()]),
])

# ---------------------------------------------------------------- 06
C["06-googlebook"] = ("Google Blog, TechCrunch e 9to5Google (21/09/2026)", [
    ("<p>🔥 <b>BREAKING:</b> o Google lançou o <b>Googlebook</b>, notebook com o <b>Gemini</b> no centro do sistema.</p>"
     "<p>Chega às lojas dos EUA em <b>4 de outubro</b>.</p>",
     [browser("Googlebook", '<div style="font-size:34px;font-weight:800;line-height:1.2">Seu notebook,<br>com <span class=blue>Gemini</span> no sistema</div>'
              '<div class=bar style="width:90%"></div><div class=bar style="width:70%"></div><div class=bar style="width:55%"></div>'),
      stat("US$ 899", "A partir de", "", size=96)]),
    ("<p>Os números: a partir de <b>US$ 899</b>, feito por <b>Acer, ASUS, Dell, HP e Lenovo</b>.</p>"
     "<p>Processadores <b>Intel Core Ultra Series 3</b> ou <b>Snapdragon X Elite</b>, com NPU para rodar IA.</p>",
     [lista("Fabricantes", ["Acer", "ASUS", "Dell", "HP", "Lenovo"], icon="•", cor="#333", black=True, fs=30),
      lista("Processadores", ["Intel Core Ultra Series 3", "Snapdragon X Elite", "NPU dedicada para IA"], fs=28)]),
    ("<p>Os recursos de IA que o Google destacou:</p>",
     [lista("Recursos", ["<b>Cursor com IA</b>", "<b>Widgets criados por comando</b>", "<b>Ditado com IA</b>"], icon="✦", fs=32)]),
    ("<p>No pacote: <b>12 meses de Google AI Pro</b>, com 5 TB de armazenamento, e <b>3 meses de YouTube Premium</b>.</p>",
     [stat("12", "Meses", "de Google AI Pro inclusos", black=False, color="blue", size=190),
      stat("5 TB", "Nuvem", "de armazenamento no plano", size=130)]),
    ("<p>Lançamento: <b>EUA em 4/10</b>. Canadá, Reino Unido, Irlanda, França, Alemanha e Austrália em <b>5/10</b>.</p>"
     "<p>O Brasil <b>não está nessa primeira lista</b>.</p>",
     [linha("Lançamento", [("04/10", "Estados Unidos"), ("05/10", "Canadá, Reino Unido, Irlanda, França, Alemanha e Austrália"), ("Brasil", "Sem data anunciada")])]),
    ("<p>A leitura: a IA deixou de ser um app que você abre. Ela está virando <b>o próprio sistema</b>.</p>"
     "<p>Siga para entender cada movimento antes de ele chegar aqui.</p>",
     [seguir()]),
])

# ---------------------------------------------------------------- 07
C["07-iphone-duo-dobravel"] = ("MacRumors e Variety (09/09/2026)", [
    ("<p>🔥 <b>BREAKING:</b> a Apple entrou no mercado de dobráveis.</p>"
     "<p>Conheça o <b>iPhone Duo</b>, o primeiro iPhone que dobra.</p>",
     [card('<div style="display:flex;gap:6px;height:330px"><div style="width:130px;border-radius:26px 6px 6px 26px;background:linear-gradient(160deg,#2a3a7a,#0d1330);border:2px solid #ffffff22"></div>'
           '<div style="width:130px;border-radius:6px 26px 26px 6px;background:linear-gradient(200deg,#3a2a6a,#0d1330);border:2px solid #ffffff22"></div></div>'
           '<div class=sub style="margin-top:24px">Tela interna de 7,6"</div>', "center"),
      stat("US$ 1.999", "A partir de", "", size=66)]),
    ("<p>Os preços nos EUA vão de <b>US$ 1.999</b> a <b>US$ 3.199</b>, conforme o armazenamento.</p>",
     [barras("Preço por versão", [("256 GB", 1999, "US$ 1.999"), ("512 GB", 2199, "US$ 2.199"),
                                  ("1 TB", 2599, "US$ 2.599"), ("2 TB", 3199, "US$ 3.199")])]),
    ("<p>Duas telas: <b>5,4\"</b> por fora e <b>7,6\"</b> por dentro, com uma dobra mínima no meio.</p>"
     "<p>Cores: <b>Star White</b> e <b>Night Sky</b>.</p>",
     [stat('5,4"', "Tela externa", "", black=False, color="blue", size=150),
      stat('7,6"', "Tela interna", "", size=150)]),
    ("<p>Datas: pré-venda em <b>16 de outubro</b>. Chega em <b>23 de outubro</b> a mais de 70 países, e em outros 28 em <b>30 de outubro</b>.</p>",
     [linha("Calendário", [("16/10", "Início da pré-venda"), ("23/10", "Lançamento em mais de 70 países"), ("30/10", "Mais 28 países")])]),
    ("<p>Dobráveis já existiam. A diferença é que a Apple costuma chegar depois e <b>definir o padrão</b> do mercado.</p>"
     "<p>Agora é ver se o público paga o preço.</p>",
     [texto("A pergunta", 'Você pagaria <span class=coral>US$ 1.999</span> em um celular dobrável?', black=True, fs=42)]),
    ("<p>Comenta aqui: você trocaria seu celular por um dobrável?</p>"
     "<p>Siga para acompanhar tecnologia <b>sem ruído</b>.</p>",
     [seguir()]),
])

# ---------------------------------------------------------------- 08
C["08-pix-cobranca-hibrida"] = ("Banco Central do Brasil, via Mix Vale (setembro/2026)", [
    ("<p>O Banco Central anunciou mudanças no <b>Pix</b>.</p>"
     "<p>Uma delas muda a forma como a sua empresa <b>cobra os clientes</b>.</p>",
     [card('<div class=lbl>Cobrança híbrida</div>'
           '<div style="margin-top:26px;background:#fff;border-radius:18px;padding:26px;color:#111;display:flex;gap:22px;align-items:center">'
           '<div style="flex:1"><div style="font-size:22px;font-weight:800">Boleto</div>'
           '<div style="margin-top:14px;height:70px;background:repeating-linear-gradient(90deg,#111 0 3px,#fff 3px 6px,#111 6px 7px,#fff 7px 11px)"></div></div>'
           '<div style="width:120px;height:120px;background:conic-gradient(#111 25%,#fff 0 50%,#111 0 75%,#fff 0) 0 0/30px 30px;border:6px solid #111;border-radius:8px"></div></div>'
           '<div class=sub>Boleto e QR Code do Pix no mesmo documento</div>', "vcenter")]),
    ("<p><b>Cobrança híbrida:</b> o código de barras do boleto e o QR Code do Pix <b>no mesmo documento</b>, físico ou digital.</p>"
     "<p>O cliente escolhe como pagar.</p>",
     [fluxo("Na prática", ["Uma única cobrança", "Cliente escolhe: boleto ou Pix", "Pagamento registrado"])]),
    ("<p>O objetivo: <b>evitar pagamento em dobro</b>, quando a mesma conta é paga pelo boleto e pelo Pix.</p>"
     "<p>Começa a valer em <b>fevereiro de 2027</b>.</p>",
     [stat("FEV/27", "Início", "da cobrança híbrida", black=False, color="blue", size=130)]),
    ("<p><b>Pix Automático em conta-salário:</b> a partir de <b>julho de 2027</b>, quem recebe salário poderá autorizar pagamentos recorrentes direto dessa conta.</p>",
     [lista("Exemplos de uso", ["Contas de consumo", "Assinaturas", "Mensalidades"], icon="↻"),
      stat("JUL/27", "Início", "", size=110)]),
    ("<p>Mais segurança: instituições punidas passam a ser <b>desligadas do Pix na hora</b>, sem o prazo de 30 dias que existia antes.</p>",
     [linha("Desligamento de instituições", [("Antes", "30 dias depois da decisão definitiva"), ("Agora", "Imediato, após a comunicação da decisão")])]),
    ("<p>Para quem vende, menos atrito no pagamento é menos cliente desistindo no caminho.</p>"
     "<p>Seu site já facilita o pagamento? Me manda <b>SITE</b> no direct.</p>",
     [direct(), seguir()]),
])

# ---------------------------------------------------------------- 09 bets
C["09-bets-proibidas-no-brasil"] = ("Agência Senado (28/09/2026) e Exame", [
    ("<p>🔥 <b>BREAKING:</b> as bets estão <b>proibidas no Brasil</b>.</p>"
     "<p>A Medida Provisória <b>1.394/2026</b> foi publicada em <b>25 de setembro</b>, com efeito imediato.</p>",
     [stat("MP", "Medida Provisória", "1.394/2026", size=200),
      lista("Proibido", ["Apostas esportivas", "Jogos online", "Publicidade e patrocínio"], icon=X, cor=VERM)]),
    ("<p>O que a MP proíbe: <b>exploração, oferta, intermediação e publicidade</b> de apostas de quota fixa.</p>"
     "<p>Vale também para empresas <b>sediadas no exterior</b> que oferecem apostas a brasileiros.</p>",
     [lista("Alcance da MP", ["Apostas em eventos esportivos reais", "Jogos online", "Empresas estrangeiras",
                              "Novas autorizações"], icon=X, cor=VERM, black=True)]),
    ("<p>Os prazos que você precisa saber:</p>",
     [linha("Calendário oficial", [("5/10", "Último dia para saque voluntário, até 23h59"),
                                   ("6/10", "Sites e aplicativos fora do ar"),
                                   ("10 dias", "Prazo para retirar publicidade"),
                                   ("25/10", "Autorizações extintas")])]),
    ("<p>As multas para quem descumprir:</p>",
     [stat("R$ 200 mil", "Por dia", "para quem não devolver os saldos", size=64),
      stat("10%", "Do faturamento", "do grupo, para plataformas digitais", black=False, color="blue", size=170)]),
    ("<p>E agora? A MP vale na hora, mas precisa ser <b>aprovada pelo Congresso</b> em até 120 dias para virar lei.</p>"
     "<p>Empresas do setor falam em <b>insegurança jurídica</b> e podem ir à Justiça.</p>",
     [fluxo("Próximos passos", ["MP publicada · 25/09", "Análise no Congresso", "Vira lei ou perde validade"], destaque=False)]),
    ("<p>Salve para consultar os prazos e envie para quem precisa saber.</p>"
     "<p>Siga para acompanhar os <b>próximos capítulos</b>.</p>",
     [seguir("Tecnologia, negócios e o que muda no Brasil.")]),
])

C["10-tem-saldo-em-bet-prazos"] = ("Exame, Suno, Seu Dinheiro e ND+ (26 a 28/09/2026)", [
    ("<p>Tem dinheiro parado em bet?</p>"
     "<p>Você tem até <b>5 de outubro, às 23h59</b>, para sacar direto na plataforma.</p>",
     [stat("05/10", "Prazo final", "até 23h59, saque voluntário", size=150),
      aviso("Depois disso?", "Arrasta para o lado →", "?", black=False, cor="#7c8cff")]),
    ("<p>Desde <b>25 de setembro</b>, não é mais possível <b>depositar nem apostar</b>.</p>"
     "<p>A partir de <b>6 de outubro</b>, sites e aplicativos saem do ar.</p>",
     [lista("Situação atual", ["Novos depósitos bloqueados", "Apostas proibidas", "Plataformas saem do ar em 6/10"], icon=X, cor=VERM, black=True)]),
    ("<p>Se você não sacar, o saldo <b>não é perdido</b>. Ele entra em <b>devolução automática</b>.</p>",
     [linha("Devolução automática", [("7 e 8/10", "Empresas enviam os saldos aos bancos"),
                                     ("9 a 14/10", "Bancos devolvem os valores aos apostadores")])]),
    ("<p>Se o banco não conseguir devolver, por dado errado ou conta encerrada, o valor vai para a <b>Caixa Econômica Federal</b>.</p>"
     "<p>A Caixa guarda o dinheiro para você pedir depois.</p>",
     [fluxo("Se a devolução falhar", ["Banco não consegue devolver", "Valor vai para a Caixa", "Você solicita o pagamento"])]),
    ("<p>O governo prevê a devolução de cerca de <b>R$ 1,7 bilhão</b> aos apostadores.</p>",
     [stat("R$ 1,7 bi", "Previsão", "em saldos a devolver", size=110)]),
    ("<p>Cuidado com golpes: <b>ninguém precisa da sua senha</b> nem pode cobrar taxa para devolver o seu saldo.</p>"
     "<p>Salve e mande para quem tem conta em bet.</p>",
     [aviso("Alerta de golpe", "Desconfie de quem pedir senha, código ou taxa.", "!", cor="#E07A5F"), seguir("Informação que protege o seu dinheiro.")]),
])

C["11-linha-do-tempo-das-bets"] = ("Congresso em Foco, linha do tempo das bets", [
    ("<p>Da <b>liberação</b> à <b>proibição</b>.</p>"
     "<p>A história das bets no Brasil em <b>8 anos</b>, do começo ao fim.</p>",
     [stat("2018", "Liberação", "", black=False, color="blue", size=150),
      stat("2026", "Proibição", "", size=150)]),
    ("<p><b>2018:</b> a Lei 13.756, sancionada no governo Temer, cria as apostas de quota fixa.</p>"
     "<p><b>2019 a 2022:</b> a regulamentação não sai, e as plataformas crescem <b>sem regra federal</b>.</p>",
     [linha("O começo", [("12/2018", "Lei 13.756 cria a modalidade"), ("2019–22", "Mercado cresce sem autorização federal")])]),
    ("<p><b>2023:</b> o governo edita a MP 1.182 em julho e sanciona a <b>Lei 14.790</b> em dezembro.</p>"
     "<p>Licença de <b>R$ 30 milhões</b> por 5 anos, com até 3 marcas por empresa.</p>",
     [stat("R$ 30 mi", "Licença", "por 5 anos de operação", size=110)]),
    ("<p><b>2024:</b> nasce a Secretaria de Prêmios e Apostas, com proibição de cartão de crédito e de bônus de entrada.</p>"
     "<p><b>1º de janeiro de 2025:</b> só operam empresas autorizadas, com domínio <b>.bet.br</b>.</p>",
     [pilula("Mercado regulado", "nomedacasa.bet.br", "Obrigatório a partir de 01/01/2025")]),
    ("<p><b>2025 e 2026:</b> o cerco aumenta.</p>",
     [linha("Novas regras", [("09/2025", "Bloqueio para beneficiários do Bolsa Família e BPC"),
                             ("11/2025", "Regras de autoexclusão e limite de perdas"),
                             ("07/2026", "Plataforma central de autoexclusão")])]),
    ("<p><b>25 de setembro de 2026:</b> a MP 1.394 proíbe tudo.</p>"
     "<p>Quem pagou <b>R$ 30 milhões</b> por uma licença de 5 anos ficou no meio do caminho.</p>",
     [aviso("Bets proibidas", "MP 1.394/2026", X, cor="#ff8a7a")]),
    ("<p>Oito anos, duas leis, várias portarias e uma proibição.</p>"
     "<p>Salve para lembrar e siga para acompanhar o que vem depois.</p>",
     [seguir("Tecnologia, negócios e o que muda no Brasil.")]),
])

C["12-quem-perde-com-o-fim-das-bets"] = ("CNN Brasil, Jornal de Brasília, Exame e Ag. Senado (09/2026)", [
    ("<p>O fim das bets não mexe só com o apostador.</p>"
     "<p>Veja <b>quem perde</b> com a proibição.</p>",
     [lista("Quem perde", ["O futebol", "O governo", "As empresas", "Os influenciadores"], icon="↓", cor=VERM, black=True, fs=32)]),
    ("<p><b>O futebol:</b> 14 dos 20 clubes da Série A têm uma bet como patrocinador máster.</p>"
     "<p>Juntos, esses contratos somam cerca de <b>R$ 910 milhões</b>.</p>",
     [stat("14/20", "Série A", "clubes com bet no patrocínio máster", size=140),
      stat("R$ 910 mi", "Total", "em patrocínios", black=False, color="blue", size=68)]),
    ("<p>Os três maiores contratos:</p>",
     [barras("Patrocínio máster por ano", [("Flamengo", 220, "R$ 220 mi"), ("Corinthians", 150, "R$ 150 mi"), ("Palmeiras", 100, "R$ 100 mi")])]),
    ("<p><b>O governo:</b> arrecadou <b>R$ 9,91 bilhões</b> com as bets de janeiro a agosto de 2026.</p>"
     "<p>A própria equipe econômica estima perder <b>R$ 5,15 bilhões</b> em 2027.</p>",
     [stat("R$ 9,91 bi", "Arrecadado", "de janeiro a agosto de 2026", size=64),
      stat("R$ 5,15 bi", "Perda estimada", "em 2027", black=False, color="blue", size=64)]),
    ("<p><b>As empresas:</b> pagaram R$ 30 milhões por licenças de 5 anos, interrompidas antes do fim.</p>"
     "<p><b>Os influenciadores:</b> um projeto de lei prevê de <b>4 a 6 anos de prisão</b> para quem divulgar bets.</p>",
     [stat("R$ 30 mi", "Licença", "interrompida antes do prazo", size=72),
      stat("4 a 6", "Anos", "de prisão, previstos em projeto de lei", black=False, color="blue", size=130)]),
    ("<p>O governo defende a proibição pelo <b>impacto nas famílias</b>. A palavra final agora é do <b>Congresso</b>.</p>"
     "<p>Comenta: você concorda com a proibição?</p>",
     [seguir("Tecnologia, negócios e o que muda no Brasil.")]),
])


if __name__ == "__main__":
    for slug, (fonte, slides) in C.items():
        pasta = AQUI / slug / "html"
        pasta.mkdir(parents=True, exist_ok=True)
        for f in pasta.glob("*.html"):
            f.unlink()
        for i, (txt, cards) in enumerate(slides, 1):
            (pasta / f"{i:02d}.html").write_text(page(txt, cards, i, len(slides), fonte))
    print(len(C), "carrosséis,", sum(len(s) for _, s in C.values()), "slides")

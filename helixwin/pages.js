// Telas: página inicial, login, cadastro e painel do jogador.
(function () {
  const { esc, data, toast, modal, confirmar, logo, avisoFichas } = UI;

  // ── Página inicial ──────────────────────────────────────────────────────
  function jogarDemo() {
    const cfg = Store.config();
    if (!cfg.demo_ativo) return App.ir('cadastro');
    const entrada = cfg.demo_entrada;
    App.partida = {
      demo: true,
      id: 'demo',
      entrada,
      meta: Math.round(entrada * cfg.demo_multiplicador * 100) / 100,
      por_plat: entrada,
      dificuldade: cfg.demo_dificuldade,
    };
    App.ir('jogo');
  }

  // Números de "prova social" simulados, como no original
  function animarNumero(el, ate, dur, formatar) {
    if (!el) return;
    const t0 = performance.now();
    (function passo(t) {
      const k = Math.min(1, (t - t0) / dur);
      const v = ate * (1 - Math.pow(1 - k, 3));
      el.textContent = formatar(v);
      if (k < 1 && el.isConnected) requestAnimationFrame(passo);
    })(t0);
  }

  const DEPOIMENTOS = [
    ['Ana Paula S.', 'Jogadora desde janeiro', 'Comecei com R$10 e em 3 partidas já tinha R$70. O jogo é justo e o PIX cai na hora. Recomendo muito!'],
    ['Carlos M.', 'Jogador profissional', 'Sou viciado em Helix Jump de qualquer forma, agora ainda ganho dinheiro jogando. Já saquei mais de R$300 esse mês!'],
    ['Lucas R.', '4 amigos indicados', 'Sistema de indicação é incrível. Já ganhei R$20 só indicando amigos e nem precisei jogar. Transparente e confiável.'],
  ];

  App.registrar('inicio', {
    render(app) {
      const cfg = Store.config();
      const user = Store.usuarioAtual();
      const mult = Math.max(...cfg.multiplicadores);
      const online = 2700 + Math.floor(Math.random() * 300);
      app.innerHTML = `
      <header class="topo">
        <div class="topo-in">
          ${logo()}
          <nav class="topo-acoes">
            ${
              user
                ? `<a class="btn btn-abobora btn-p" href="#painel">Meu painel</a>`
                : `<a class="link-topo" href="#entrar">Entrar</a><a class="btn btn-abobora btn-p" href="#cadastro">Cadastrar</a>`
            }
          </nav>
        </div>
      </header>

      <section class="heroi faixa">
        <div class="faixa-in heroi-in">
          <span class="pilula"><i class="ponto"></i><span id="online-heroi">${online.toLocaleString('pt-BR')}</span> jogadores online agora</span>
          <h1 class="heroi-titulo">Gire e sobreviva <em>à noite de Halloween</em></h1>
          <p class="heroi-sub">Helix Jump no clima do <strong>Halloween</strong>: desça a torre amaldiçoada, marque pontos e transforme
            <strong>habilidade em prêmio</strong>. Resgate quando quiser!</p>
          <div class="heroi-ctas">
            ${cfg.demo_ativo ? `<button class="btn btn-abobora btn-g" id="btn-demo" type="button">${icone('play')} Jogar grátis</button>` : ''}
            <a class="link-suave" href="${user ? '#painel' : '#entrar'}">${user ? 'Ir para o painel' : 'Já tenho conta'} →</a>
          </div>
          <ul class="chips">
            <li>${icone('check')} Resgate instantâneo</li>
            <li>${icone('check')} Entrada mín. ${fmt(cfg.entrada_min).replace(',00', '')}</li>
            <li>${icone('check')} Resultado na hora</li>
          </ul>
          <img class="abobora-heroi" src="images/abobora.webp" alt="" width="512" height="512" decoding="async">
        </div>
      </section>

      <section class="faixa faixa-numeros">
        <div class="faixa-in numeros">
          <div><b id="st-arena">0</b><span>Jogadores na arena</span></div>
          <div><b id="st-hoje">R$ 0</b><span>Prêmios hoje</span></div>
          <div><b id="st-maior">R$ 0</b><span>Maior prêmio hoje</span></div>
        </div>
      </section>

      <section class="faixa">
        <div class="faixa-in">
          <h2 class="secao-titulo">Como funciona no Halloween?</h2>
          <p class="secao-sub">Três passos até a meia-noite</p>
          <ol class="passos">
            <li><span class="passo-n">01</span>${icone('moeda')}<h3>Defina sua aposta</h3>
              <p>Escolha de ${fmt(cfg.entrada_min)} a ${fmt(cfg.entrada_max)} e decida o quanto quer arriscar por partida.</p></li>
            <li><span class="passo-n">02</span>${icone('torre')}<h3>Desça a torre</h3>
              <p>Gire a hélice e guie a bolinha. Evite as peças amaldiçoadas e alcance a meta de plataformas.</p></li>
            <li><span class="passo-n">03</span>${icone('subir')}<h3>Ganhe ${mult}x</h3>
              <p>Alcance a meta e receba ${mult}x o valor apostado no seu saldo.</p></li>
          </ol>
        </div>
      </section>

      <section class="faixa">
        <div class="faixa-in">
          <h2 class="secao-titulo">Vozes da noite</h2>
          <p class="secao-sub">Histórias reais de quem já escapou da torre</p>
          <ul class="depos">${DEPOIMENTOS.map(
            ([nome, desde, txt]) => `<li><span class="estrelas" aria-label="5 estrelas">★★★★★</span>
              <blockquote>“${esc(txt)}”</blockquote>
              <div class="depo-autor"><span class="depo-av">${nome[0]}</span><div><b>${esc(nome)}</b><small>${esc(desde)}</small></div></div></li>`
          ).join('')}</ul>
        </div>
      </section>

      <section class="faixa faixa-final">
        <div class="faixa-in final">
          <h2 class="secao-titulo">Pronto para enfrentar a torre?</h2>
          <p class="secao-sub">Entre na noite: crie sua conta, receba ${fmt(cfg.saldo_inicial)} em fichas e dispute seu prêmio em tempo real.</p>
          <a class="btn btn-abobora btn-g" href="${user ? '#painel' : '#cadastro'}">${icone('pessoa')} ${user ? 'Ir para o painel' : 'Criar conta grátis'}</a>
        </div>
      </section>

      <footer class="rodape faixa">
        <div class="faixa-in">
          ${logo('p')}
          <nav class="rodape-links"><a href="#inicio">Início</a><a href="#cadastro">Cadastrar</a><a href="#entrar">Entrar</a></nav>
          <p class="aviso-fichas">⚠️ Jogo de entretenimento. Jogue com responsabilidade. Proibido para menores de 18 anos.</p>
          ${avisoFichas()}
          <p class="rodape-copy">© ${new Date().getFullYear()} ${esc(cfg.site_nome)}. Todos os direitos reservados.</p>
        </div>
      </footer>`;
      const b = app.querySelector('#btn-demo');
      if (b) b.addEventListener('click', jogarDemo);

      const reais = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
      setTimeout(() => {
        animarNumero(app.querySelector('#st-arena'), 1847 + Math.floor(Math.random() * 200), 1200, (v) => Math.round(v).toLocaleString('pt-BR'));
        animarNumero(app.querySelector('#st-hoje'), 8420, 1400, reais);
        animarNumero(app.querySelector('#st-maior'), 700, 1000, reais);
      }, 300);
      // o contador de online oscila de leve
      let atual = online;
      const timer = setInterval(() => {
        atual = Math.max(2500, atual + Math.floor(Math.random() * 21) - 10);
        const el = app.querySelector('#online-heroi');
        if (el) el.textContent = atual.toLocaleString('pt-BR');
      }, 3000);
      return () => clearInterval(timer);
    },
  });

  // ── Login e cadastro ────────────────────────────────────────────────────
  function telaAuth(app, { titulo, sub, campos, botao, rodape, extra = '', aoEnviar }) {
    app.innerHTML = `
      <div class="auth">
        <div class="auth-topo">${logo()}</div>
        <form class="auth-card" novalidate>
          <h1 class="auth-titulo">${titulo}</h1>
          <p class="auth-sub">${sub}</p>
          ${extra}
          ${campos}
          <p class="form-erro" hidden></p>
          <button class="btn btn-abobora btn-g btn-bloco" type="submit">${botao}</button>
          <p class="auth-rodape">${rodape}</p>
        </form>
        ${avisoFichas()}
      </div>`;
    const form = app.querySelector('form');
    const erroEl = form.querySelector('.form-erro');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      erroEl.hidden = true;
      const dados = Object.fromEntries(new FormData(form));
      try {
        aoEnviar(dados);
      } catch (err) {
        erroEl.textContent = err.amigavel ? err.message : 'Algo deu errado. Tente de novo.';
        erroEl.hidden = false;
        if (!err.amigavel) console.error(err);
      }
    });
  }

  function campo(id, rotulo, tipo, extra = '') {
    return `<label class="campo" for="${id}"><span>${rotulo}</span><input id="${id}" name="${id}" type="${tipo}" ${extra}></label>`;
  }

  App.registrar('entrar', {
    visitante: true,
    render(app) {
      telaAuth(app, {
        titulo: 'Entrar',
        sub: 'Bem-vindo de volta. A torre está esperando.',
        campos: campo('email', 'E-mail', 'email', 'autocomplete="email" required') + campo('senha', 'Senha', 'password', 'autocomplete="current-password" required'),
        botao: 'Entrar',
        rodape: 'Ainda não tem conta? <a href="#cadastro">Cadastre-se</a>',
        extra: `<div class="dica">Conta de administrador para testes: <b>admin@helixwin.local</b> · senha <b>admin123</b></div>`,
        aoEnviar(d) {
          const u = Store.entrar(d.email, d.senha);
          toast(`Bem-vindo, ${u.nome.split(' ')[0]}!`, 'ok');
          App.ir('painel');
        },
      });
    },
  });

  App.registrar('cadastro', {
    visitante: true,
    render(app) {
      const cfg = Store.config();
      telaAuth(app, {
        titulo: 'Criar conta',
        sub: 'Leva menos de um minuto.',
        extra: `<div class="bonus">${icone('presente')} Você ganha <b>${fmt(cfg.saldo_inicial)}</b> em fichas para jogar.</div>`,
        campos:
          campo('nome', 'Nome', 'text', 'autocomplete="name" required') +
          campo('email', 'E-mail', 'email', 'autocomplete="email" required') +
          campo('telefone', 'Celular (opcional)', 'tel', 'autocomplete="tel" inputmode="numeric" placeholder="(11) 90000-0000"') +
          campo('senha', 'Senha', 'password', 'autocomplete="new-password" minlength="6" required placeholder="Pelo menos 6 caracteres"'),
        botao: 'Criar conta e jogar',
        rodape: 'Já tem conta? <a href="#entrar">Entrar</a>',
        aoEnviar(d) {
          const u = Store.cadastrar(d);
          toast(`Conta criada! ${fmt(u.saldo)} em fichas na sua carteira.`, 'ok');
          App.ir('painel');
        },
      });
      const tel = app.querySelector('#telefone');
      tel.addEventListener('input', () => {
        const v = tel.value.replace(/\D/g, '').slice(0, 11);
        tel.value = v.length > 6 ? `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}` : v.length > 2 ? `(${v.slice(0, 2)}) ${v.slice(2)}` : v;
      });
    },
  });

  // ── Painel do jogador ───────────────────────────────────────────────────
  const STATUS = {
    resgatou: ['Resgatou', 'ok'],
    perdeu: ['Perdeu', 'erro'],
    desistiu: ['Desistiu', 'neutro'],
    andamento: ['Em andamento', 'aviso'],
  };

  function modalFichas(aoMudar) {
    let valor = 500;
    const m = modal(
      `<h3 class="modal-titulo">Adicionar fichas</h3>
       <p class="modal-texto">Fichas fictícias para testar o jogo. Nenhum pagamento é feito.</p>
       <div class="rapidos">${[100, 500, 1000, 5000].map((v) => `<button type="button" class="chip-valor${v === valor ? ' ativo' : ''}" data-v="${v}">${fmt(v).replace(',00', '')}</button>`).join('')}</div>
       <label class="campo" for="fichas-valor"><span>Outro valor</span>
         <div class="campo-prefixo"><i>R$</i><input id="fichas-valor" type="number" min="1" max="100000" step="1" value="${valor}" inputmode="decimal"></div></label>
       <button class="btn btn-abobora btn-g btn-bloco" type="button" id="fichas-ok">Adicionar fichas</button>`
    );
    const input = m.el.querySelector('#fichas-valor');
    m.el.querySelectorAll('.chip-valor').forEach((b) =>
      b.addEventListener('click', () => {
        m.el.querySelectorAll('.chip-valor').forEach((x) => x.classList.toggle('ativo', x === b));
        input.value = b.dataset.v;
      })
    );
    m.el.querySelector('#fichas-ok').addEventListener('click', () => {
      try {
        const saldo = Store.adicionarFichas(input.value);
        toast(`Fichas adicionadas. Saldo: ${fmt(saldo)}`, 'ok');
        m.fechar();
        aoMudar();
      } catch (e) {
        toast(e.message, 'erro');
      }
    });
  }

  function modalPerfil(aoMudar) {
    const u = Store.usuarioAtual();
    const ps = Store.minhasPartidas().filter((p) => p.status !== 'andamento');
    const m = modal(
      `<div class="perfil-topo"><span class="avatar avatar-g">${esc(u.nome[0] || '?').toUpperCase()}</span>
         <div><h3 class="modal-titulo">${esc(u.nome)}</h3><p class="modal-texto">${esc(u.email)}</p></div></div>
       <div class="mini-grade">
         <div><span>Saldo</span><b>${fmt(u.saldo)}</b></div>
         <div><span>Partidas</span><b>${ps.length}</b></div>
         <div><span>Recorde</span><b>${ps.reduce((m, p) => Math.max(m, p.plataformas), 0)} plat.</b></div>
       </div>
       <form class="sub-form" id="f-dados">
         <h4>Meus dados</h4>
         ${campo('p-nome', 'Nome', 'text', `value="${esc(u.nome)}" autocomplete="name"`)}
         ${campo('p-tel', 'Celular', 'tel', `value="${esc(u.telefone)}" autocomplete="tel"`)}
         <button class="btn btn-fantasma btn-bloco" type="submit">Salvar dados</button>
       </form>
       <form class="sub-form" id="f-senha">
         <h4>Alterar senha</h4>
         ${campo('p-atual', 'Senha atual', 'password', 'autocomplete="current-password"')}
         ${campo('p-nova', 'Nova senha', 'password', 'autocomplete="new-password" minlength="6"')}
         <button class="btn btn-fantasma btn-bloco" type="submit">Alterar senha</button>
       </form>`,
      { classe: 'modal-largo' }
    );
    m.el.querySelector('#f-dados').addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        Store.atualizarPerfil({ nome: m.el.querySelector('#p-nome').value, telefone: m.el.querySelector('#p-tel').value });
        toast('Dados salvos.', 'ok');
        aoMudar();
      } catch (err) {
        toast(err.message, 'erro');
      }
    });
    m.el.querySelector('#f-senha').addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        Store.alterarSenha(m.el.querySelector('#p-atual').value, m.el.querySelector('#p-nova').value);
        toast('Senha alterada.', 'ok');
        e.target.reset();
      } catch (err) {
        toast(err.message, 'erro');
      }
    });
  }

  async function sair() {
    const ok = await confirmar({ titulo: 'Sair da conta?', texto: 'Seu saldo de fichas fica guardado para a próxima vez.', sim: 'Sair' });
    if (!ok) return;
    Store.sair();
    App.ir('inicio');
  }

  function verificarPendente() {
    const p = Store.partidaPendente();
    if (!p) return;
    const m = modal(
      `<h3 class="modal-titulo">Partida em andamento</h3>
       <p class="modal-texto">Você saiu de uma partida antes de terminar. Continue de onde a entrada já foi paga ou desista dela.</p>
       <div class="mini-grade">
         <div><span>Entrada</span><b>${fmt(p.entrada)}</b></div>
         <div><span>Meta</span><b>${fmt(p.meta)}</b></div>
         <div><span>Iniciada</span><b>${data(p.inicio)}</b></div>
       </div>
       <div class="modal-acoes">
         <button class="btn btn-fantasma" data-r="desistir" type="button">Desistir</button>
         <button class="btn btn-abobora" data-r="continuar" type="button">Continuar</button>
       </div>`,
      { fechavel: false }
    );
    m.el.querySelector('[data-r="desistir"]').addEventListener('click', () => {
      Store.finalizarPartida(p.id, { status: 'desistiu', plataformas: 0 });
      m.fechar();
      App.ir('painel');
    });
    m.el.querySelector('[data-r="continuar"]').addEventListener('click', () => {
      App.partida = p;
      m.fechar();
      App.ir('jogo');
    });
  }

  App.registrar('painel', {
    logado: true,
    render(app) {
      const cfg = Store.config();
      const estado = {
        entrada: Math.min(cfg.entradas_rapidas[0] || 10, cfg.entrada_max),
        mult: cfg.multiplicadores.includes(cfg.multiplicador_padrao) ? cfg.multiplicador_padrao : cfg.multiplicadores[0],
        aba: 'partidas',
      };

      function desenhar() {
        const u = Store.usuarioAtual();
        if (!u) return App.ir('entrar');
        const partidas = Store.minhasPartidas();
        const fechadas = partidas.filter((p) => p.status !== 'andamento');
        const dif = cfg.dificuldades[Store.dificuldadeDe(u)];
        const c = Store.calcular(estado.entrada || 0, estado.mult);
        const semSaldo = estado.entrada > u.saldo;

        app.innerHTML = `
        <header class="topo topo-painel">
          <div class="topo-in">
            ${logo('p')}
            <div class="topo-acoes">
              <button class="saldo-pilula" id="btn-saldo" type="button" aria-label="Saldo: ${fmt(u.saldo)}. Adicionar fichas">
                <span>${fmt(u.saldo)}</span><i>+</i>
              </button>
              <div class="menu-wrap">
                <button class="avatar" id="btn-avatar" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Menu da conta">${esc(u.nome[0] || '?').toUpperCase()}</button>
                <div class="menu" id="menu-conta" hidden>
                  <button type="button" data-acao="perfil">${icone('pessoa')} Meu perfil</button>
                  ${u.is_admin ? `<a href="#admin">${icone('engrenagem')} Painel admin</a>` : ''}
                  <hr>
                  <button type="button" data-acao="sair">${icone('sair')} Sair</button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main class="painel faixa">
          <div class="faixa-in painel-in">
            <section class="cartao cartao-saldo">
              <span class="rotulo">Seu saldo disponível</span>
              <b class="saldo-grande">${fmt(u.saldo)}</b>
              <div class="linha-btns">
                <button class="btn btn-abobora" data-acao="fichas" type="button">${icone('moeda')} Adicionar fichas</button>
                <button class="btn btn-fantasma" data-acao="extrato" type="button">Extrato</button>
              </div>
            </section>

            <section class="cartao cartao-jogar" id="jogar">
              <div class="cartao-cab">
                <div><h2>Pronto para jogar?</h2><p>Olá, ${esc(u.nome.split(' ')[0])}. Dificuldade: <b class="tag-dif">${esc(dif.nome)}</b></p></div>
                <span class="online"><i class="ponto"></i><span id="online-painel">${online.toLocaleString('pt-BR')}</span> online</span>
              </div>
              <div class="mini-grade">
                <div><span>Recorde</span><b>${fechadas.reduce((m, p) => Math.max(m, p.plataformas), 0)} plat.</b></div>
                <div><span>Partidas</span><b>${fechadas.length}</b></div>
                <div><span>Resgatado</span><b>${fmt(fechadas.reduce((s, p) => s + (p.premio || 0), 0))}</b></div>
              </div>

              <label class="campo" for="entrada"><span>Valor de entrada</span>
                <div class="campo-prefixo"><i>R$</i><input id="entrada" type="number" inputmode="decimal" min="${cfg.entrada_min}" max="${cfg.entrada_max}" step="1" value="${estado.entrada}"></div>
              </label>
              <div class="rapidos">${cfg.entradas_rapidas
                .filter((v) => v <= cfg.entrada_max)
                .map((v) => `<button type="button" class="chip-valor${v === estado.entrada ? ' ativo' : ''}" data-entrada="${v}">${fmt(v).replace(',00', '')}</button>`)
                .join('')}</div>

              <div class="campo"><span>Multiplicador da meta</span>
                <div class="rapidos">${cfg.multiplicadores.map((m) => `<button type="button" class="chip-valor${m === estado.mult ? ' ativo' : ''}" data-mult="${m}">${m}x</button>`).join('')}</div>
              </div>

              <div class="meta-grade">
                <div><span>Meta de ganho</span><b>${fmt(c.meta)}</b></div>
                <div><span>Por plataforma</span><b>${fmt(c.por_plat)}</b></div>
                <div><span>Plat. p/ meta</span><b>${c.plats_meta}</b></div>
              </div>

              ${
                semSaldo
                  ? `<button class="btn btn-abobora btn-g btn-bloco" data-acao="fichas" type="button">Saldo insuficiente · Adicionar fichas</button>`
                  : `<button class="btn btn-jogar btn-bloco" data-acao="jogar" type="button">${icone('play')} Jogar · ${fmt(estado.entrada)}</button>`
              }
            </section>

            <section class="cartao" id="historico">
              <div class="abas" role="tablist">
                <button role="tab" type="button" data-aba="partidas" aria-selected="${estado.aba === 'partidas'}">Partidas</button>
                <button role="tab" type="button" data-aba="extrato" aria-selected="${estado.aba === 'extrato'}">Extrato</button>
              </div>
              ${estado.aba === 'partidas' ? listaPartidas(partidas) : listaExtrato(Store.minhasTransacoes())}
            </section>
            ${avisoFichas()}
          </div>
        </main>

        <nav class="nav-baixo" aria-label="Atalhos">
          <button type="button" data-acao="topo">${icone('play')}<span>Jogar</span></button>
          <button type="button" data-acao="fichas">${icone('moeda')}<span>Fichas</span></button>
          <button type="button" data-acao="historico">${icone('lista')}<span>Histórico</span></button>
          <button type="button" data-acao="perfil">${icone('pessoa')}<span>Perfil</span></button>
          <button type="button" data-acao="sair">${icone('sair')}<span>Sair</span></button>
        </nav>`;
        ligar();
      }

      function listaPartidas(ps) {
        if (!ps.length) return `<div class="vazio">Nenhuma partida ainda. Escolha a entrada acima e desça a torre.</div>`;
        return `<ul class="lista">${ps
          .slice(0, 30)
          .map((p) => {
            const [rot, cls] = STATUS[p.status] || ['—', 'neutro'];
            return `<li><span class="status status-${cls}">${rot}</span>
              <div class="lista-corpo"><b>Entrada ${fmt(p.entrada)} · meta ${fmt(p.meta)}</b><small>${p.plataformas} plataformas · ${data(p.inicio)}</small></div>
              <b class="valor ${p.premio > 0 ? 'pos' : p.status === 'perdeu' ? 'neg' : ''}">${p.premio > 0 ? '+' + fmt(p.premio) : p.status === 'perdeu' ? '−' + fmt(p.entrada) : '—'}</b></li>`;
          })
          .join('')}</ul>`;
      }

      function listaExtrato(ts) {
        if (!ts.length) return `<div class="vazio">Sem movimentações ainda.</div>`;
        return `<ul class="lista">${ts
          .slice(0, 40)
          .map(
            (t) => `<li><div class="lista-corpo"><b>${esc(t.descricao)}</b><small>${data(t.data)}</small></div>
              <b class="valor ${t.valor >= 0 ? 'pos' : 'neg'}">${t.valor >= 0 ? '+' : '−'}${fmt(Math.abs(t.valor))}</b></li>`
          )
          .join('')}</ul>`;
      }

      function ligar() {
        const menu = app.querySelector('#menu-conta');
        const av = app.querySelector('#btn-avatar');
        av.addEventListener('click', (e) => {
          e.stopPropagation();
          menu.hidden = !menu.hidden;
          av.setAttribute('aria-expanded', String(!menu.hidden));
        });
        app.querySelector('#btn-saldo').addEventListener('click', () => modalFichas(desenhar));

        const input = app.querySelector('#entrada');
        input.addEventListener('change', () => {
          const v = Math.round(Number(input.value) * 100) / 100;
          estado.entrada = Math.min(cfg.entrada_max, Math.max(cfg.entrada_min, v || cfg.entrada_min));
          desenhar();
        });
        app.querySelectorAll('[data-entrada]').forEach((b) =>
          b.addEventListener('click', () => {
            estado.entrada = Number(b.dataset.entrada);
            desenhar();
          })
        );
        app.querySelectorAll('[data-mult]').forEach((b) =>
          b.addEventListener('click', () => {
            estado.mult = Number(b.dataset.mult);
            desenhar();
          })
        );
        app.querySelectorAll('[data-aba]').forEach((b) =>
          b.addEventListener('click', () => {
            estado.aba = b.dataset.aba;
            desenhar();
            app.querySelector('#historico').scrollIntoView({ block: 'start' });
          })
        );
        app.querySelectorAll('[data-acao]').forEach((b) =>
          b.addEventListener('click', () => {
            const a = b.dataset.acao;
            menu.hidden = true;
            if (a === 'fichas') modalFichas(desenhar);
            else if (a === 'perfil') modalPerfil(desenhar);
            else if (a === 'sair') sair();
            else if (a === 'topo') app.querySelector('#jogar').scrollIntoView({ behavior: 'smooth' });
            else if (a === 'historico' || a === 'extrato') {
              estado.aba = a === 'extrato' ? 'extrato' : estado.aba;
              if (a === 'extrato') desenhar();
              app.querySelector('#historico').scrollIntoView({ behavior: 'smooth' });
            } else if (a === 'jogar') {
              try {
                App.partida = Store.iniciarPartida(estado.entrada, estado.mult);
                App.ir('jogo');
              } catch (e) {
                toast(e.message, 'erro');
              }
            }
          })
        );
      }

      // Contador de online e notificações de saque simulados, como no original
      let online = 2700 + Math.floor(Math.random() * 300);
      const timerOnline = setInterval(() => {
        online = Math.max(2500, online + Math.floor(Math.random() * 21) - 10);
        const el = app.querySelector('#online-painel');
        if (el) el.textContent = online.toLocaleString('pt-BR');
      }, 3000);
      const pararNotifs = iniciarNotificacoesSaque();

      const fecharMenu = (e) => {
        const menu = app.querySelector('#menu-conta');
        if (menu && !e.target.closest('.menu-wrap')) menu.hidden = true;
      };
      document.addEventListener('click', fecharMenu);
      desenhar();
      verificarPendente();
      return () => {
        document.removeEventListener('click', fecharMenu);
        clearInterval(timerOnline);
        pararNotifs();
      };
    },
  });

  // ── Notificações de saque simuladas ─────────────────────────────────────
  const NOMES = [
    'Lucas', 'Gabriela', 'Rafael', 'Isabela', 'Matheus', 'Fernanda', 'Rodrigo', 'Camila',
    'Felipe', 'Juliana', 'Thiago', 'Amanda', 'Leonardo', 'Larissa', 'Bruno', 'Mariana',
    'André', 'Beatriz', 'Gustavo', 'Natália', 'Diego', 'Priscila', 'Marcelo', 'Letícia',
    'Pedro', 'Vanessa', 'Ricardo', 'Patrícia', 'Eduardo', 'Renata', 'Vinícius', 'Aline',
    'Caio', 'Carolina', 'Fábio', 'Michele', 'Leandro', 'Simone', 'Henrique', 'Bruna',
  ];
  const VALORES = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 250, 270, 290, 299];

  function iniciarNotificacoesSaque() {
    const box = document.createElement('div');
    box.className = 'notifs';
    box.setAttribute('aria-hidden', 'true');
    document.body.appendChild(box);
    function mostrar() {
      const nome = NOMES[Math.floor(Math.random() * NOMES.length)];
      const valor = VALORES[Math.floor(Math.random() * VALORES.length)];
      const el = document.createElement('div');
      el.className = 'notif';
      el.innerHTML = `<span class="notif-ico"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>
        <span class="notif-txt"><b>${nome}</b><span>acabou de sacar</span></span>
        <b class="notif-valor">${fmt(valor)}</b>`;
      box.appendChild(el);
      setTimeout(() => el.classList.add('saindo'), 4500);
      setTimeout(() => el.remove(), 4900);
      const todas = box.querySelectorAll('.notif');
      if (todas.length > 3) todas[0].remove();
    }
    const proximo = () => 8000 + Math.floor(Math.random() * 7001);
    let timer = setTimeout(function loop() {
      mostrar();
      timer = setTimeout(loop, proximo());
    }, 4000);
    return () => {
      clearTimeout(timer);
      box.remove();
    };
  }

  // ── Ícones (traço simples, herdam a cor do texto) ───────────────────────
  const ICONES = {
    play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    moeda: '<circle cx="12" cy="12" r="8"/><path d="M12 7v10M9.5 9.5c0-1 1-1.6 2.5-1.6s2.5.7 2.5 1.7-1 1.5-2.5 1.8-2.5.8-2.5 1.9 1 1.7 2.5 1.7 2.5-.6 2.5-1.6"/>',
    torre: '<ellipse cx="12" cy="6" rx="8" ry="2.5"/><ellipse cx="12" cy="12" rx="8" ry="2.5"/><ellipse cx="12" cy="18" rx="8" ry="2.5"/><path d="M12 3v18"/>',
    subir: '<path d="M4 17l6-6 4 4 6-7M14 8h6v6"/>',
    pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
    presente: '<rect x="4" y="10" width="16" height="10" rx="1"/><path d="M3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/>',
    engrenagem: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    sair: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    lista: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    som: '<path d="M4 9v6h4l5 4V5L8 9zM16 9c1.5 1.5 1.5 4.5 0 6M19 6c3 3 3 9 0 12"/>',
    mudo: '<path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/>',
  };
  function icone(nome) {
    return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome] || ''}</svg>`;
  }
  window.icone = icone;
  window.Paginas = { jogarDemo };
})();

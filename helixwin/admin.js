// Painel administrativo: visão geral, usuários, partidas, configurações e dificuldades.
(function () {
  const { esc, data, toast, modal, confirmar, logo } = UI;

  const ABAS = [
    ['geral', 'Visão geral'],
    ['usuarios', 'Usuários'],
    ['partidas', 'Partidas'],
    ['jogo', 'Configurações'],
    ['dificuldades', 'Dificuldades'],
  ];
  const CAMPOS_DIF = [
    ['obstaculo_pct', 'Chance de obstáculo por segmento', '%', 0, 60, 1],
    ['max_obstaculos', 'Máximo de obstáculos por plataforma', '', 0, 10, 1],
    ['garantir_a_cada', 'Forçar 1 obstáculo a cada N plataformas (0 = nunca)', '', 0, 20, 1],
    ['rampa_pct', 'Aumento da chance a cada 10 plataformas', '%', 0, 20, 1],
    ['gravidade_pct', 'Gravidade', '%', 50, 200, 5],
    ['abertura_min', 'Buraco mínimo (segmentos de 12)', '', 1, 6, 1],
    ['abertura_max', 'Buraco máximo (segmentos de 12)', '', 1, 6, 1],
  ];
  const ROT_STATUS = { resgatou: 'Resgatou', perdeu: 'Perdeu', desistiu: 'Desistiu', andamento: 'Em andamento' };
  const CLS_STATUS = { resgatou: 'ok', perdeu: 'erro', desistiu: 'neutro', andamento: 'aviso' };

  let aba = 'geral';
  let busca = '';
  let filtroStatus = '';

  // Desenha uma plataforma vista de cima: 12 segmentos, buraco vazio, obstáculo em laranja.
  function anel(tipos) {
    const cx = 40, cy = 40, R = 36, r = 14;
    const p = (ang, raio) => [cx + Math.cos(ang) * raio, cy - Math.sin(ang) * raio];
    const segs = tipos
      .map((t, s) => {
        if (t === 'buraco') return '';
        const a0 = (s * Math.PI * 2) / 12, a1 = ((s + 1) * Math.PI * 2) / 12;
        const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, r), [x3, y3] = p(a0, r);
        const cor = t === 'mortal' ? 'var(--abobora)' : s % 2 ? 'var(--roxo)' : 'var(--roxo-esc)';
        return `<path d="M${x0} ${y0} A${R} ${R} 0 0 0 ${x1} ${y1} L${x2} ${y2} A${r} ${r} 0 0 1 ${x3} ${y3}Z" fill="${cor}" stroke="var(--noite)" stroke-width="1"/>`;
      })
      .join('');
    return `<svg viewBox="0 0 80 80" class="anel" aria-hidden="true">${segs}<circle cx="40" cy="40" r="12" fill="var(--poste)"/></svg>`;
  }

  function previa(dif) {
    const gerar = (i) => TorreJogo.prototype._gerarTipos.call({ dif }, i);
    return [8, 9, 10, 11, 12, 13].map((i) => anel(gerar(i))).join('');
  }

  function barras(partidas) {
    const dias = [];
    for (let k = 13; k >= 0; k--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - k);
      dias.push({ d, n: 0 });
    }
    partidas.forEach((p) => {
      const t = new Date(p.inicio);
      t.setHours(0, 0, 0, 0);
      const alvo = dias.find((x) => x.d.getTime() === t.getTime());
      if (alvo) alvo.n++;
    });
    const max = Math.max(1, ...dias.map((x) => x.n));
    const W = 560, H = 160, base = 130, larg = W / 14;
    const barrasSvg = dias
      .map((x, i) => {
        const h = (x.n / max) * 100;
        const xx = i * larg + larg * 0.18;
        return `<rect x="${xx}" y="${base - h}" width="${larg * 0.64}" height="${Math.max(h, 1)}" rx="3" fill="${i === 13 ? 'var(--abobora)' : 'var(--roxo)'}"/>
          ${x.n ? `<text x="${xx + larg * 0.32}" y="${base - h - 6}" text-anchor="middle" class="graf-num">${x.n}</text>` : ''}
          <text x="${xx + larg * 0.32}" y="${base + 18}" text-anchor="middle" class="graf-dia">${x.d.getDate()}</text>`;
      })
      .join('');
    return `<div class="graf-wrap"><svg viewBox="0 0 ${W} ${H}" class="graf" role="img" aria-label="Partidas por dia nos últimos 14 dias">
      <line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="var(--linha)"/>${barrasSvg}</svg></div>`;
  }

  App.registrar('admin', {
    logado: true,
    admin: true,
    render(app) {
      function desenhar() {
        const db = Store.admin.db();
        const cfg = db.config;
        app.innerHTML = `
          <header class="topo topo-painel">
            <div class="topo-in">
              <div class="topo-marca">${logo('p')}<span class="selo-admin">Admin</span></div>
              <div class="topo-acoes"><a class="btn btn-fantasma btn-p" href="#painel">Voltar ao painel</a></div>
            </div>
          </header>
          <main class="admin faixa">
            <div class="faixa-in">
              <nav class="admin-abas" role="tablist">${ABAS.map(([k, n]) => `<button role="tab" type="button" data-aba="${k}" aria-selected="${aba === k}">${n}</button>`).join('')}</nav>
              <div class="admin-conteudo">${conteudo(db, cfg)}</div>
            </div>
          </main>`;
        app.querySelectorAll('[data-aba]').forEach((b) =>
          b.addEventListener('click', () => {
            aba = b.dataset.aba;
            desenhar();
          })
        );
        ligar(db, cfg);
      }

      function conteudo(db, cfg) {
        const nomeDe = (id) => (db.users.find((u) => u.id === id) || {}).nome || '(excluído)';
        const fechadas = db.partidas.filter((p) => p.status !== 'andamento');

        if (aba === 'geral') {
          const entradas = fechadas.reduce((s, p) => s + p.entrada, 0);
          const premios = fechadas.reduce((s, p) => s + (p.premio || 0), 0);
          const resg = fechadas.filter((p) => p.status === 'resgatou').length;
          const media = fechadas.length ? fechadas.reduce((s, p) => s + p.plataformas, 0) / fechadas.length : 0;
          const casa = entradas - premios;
          return `
            <div class="kpis">
              <div class="kpi"><span>Usuários</span><b>${db.users.length}</b></div>
              <div class="kpi"><span>Partidas</span><b>${fechadas.length}</b></div>
              <div class="kpi"><span>Total em entradas</span><b>${fmt(entradas)}</b></div>
              <div class="kpi"><span>Total resgatado</span><b>${fmt(premios)}</b></div>
              <div class="kpi"><span>Resultado da casa</span><b class="${casa >= 0 ? 'pos' : 'neg'}">${fmt(casa)}</b></div>
              <div class="kpi"><span>Taxa de resgate</span><b>${fechadas.length ? Math.round((resg / fechadas.length) * 100) : 0}%</b></div>
              <div class="kpi"><span>Média de plataformas</span><b>${media.toFixed(1).replace('.', ',')}</b></div>
              <div class="kpi"><span>Em andamento</span><b>${db.partidas.length - fechadas.length}</b></div>
            </div>
            <section class="cartao"><h3 class="cartao-titulo">Partidas por dia</h3>${barras(db.partidas)}</section>
            <section class="cartao"><h3 class="cartao-titulo">Últimas partidas</h3>${tabelaPartidas(db.partidas.slice(0, 8), nomeDe)}</section>
            <p class="nota">Todos os valores são fichas fictícias guardadas neste navegador.</p>`;
        }

        if (aba === 'usuarios') {
          const q = busca.trim().toLowerCase();
          const lista = db.users.filter((u) => !q || u.nome.toLowerCase().includes(q) || u.email.includes(q));
          return `
            <div class="filtros"><label class="campo campo-busca" for="busca"><span>Buscar</span><input id="busca" type="search" placeholder="Nome ou e-mail" value="${esc(busca)}"></label></div>
            <div class="tabela-wrap"><table class="tabela">
              <thead><tr><th>Jogador</th><th class="num">Saldo</th><th class="num">Partidas</th><th>Dificuldade</th><th>Situação</th><th></th></tr></thead>
              <tbody>${lista
                .map((u) => {
                  const n = db.partidas.filter((p) => p.user_id === u.id).length;
                  const dif = u.dificuldade ? cfg.dificuldades[u.dificuldade].nome : `Padrão (${cfg.dificuldades[cfg.dificuldade_padrao].nome})`;
                  return `<tr>
                    <td><b>${esc(u.nome)}</b><small>${esc(u.email)}</small></td>
                    <td class="num">${fmt(u.saldo)}</td>
                    <td class="num">${n}</td>
                    <td>${esc(dif)}</td>
                    <td>${u.bloqueado ? '<span class="status status-erro">Bloqueado</span>' : u.is_admin ? '<span class="status status-aviso">Admin</span>' : '<span class="status status-ok">Ativo</span>'}</td>
                    <td><button class="btn btn-fantasma btn-p" data-editar="${u.id}" type="button">Editar</button></td>
                  </tr>`;
                })
                .join('')}</tbody></table></div>
            ${lista.length ? '' : '<div class="vazio">Nenhum usuário encontrado.</div>'}`;
        }

        if (aba === 'partidas') {
          const lista = db.partidas.filter((p) => !filtroStatus || p.status === filtroStatus);
          return `
            <div class="filtros"><label class="campo" for="f-status"><span>Situação</span>
              <select id="f-status"><option value="">Todas</option>${Object.entries(ROT_STATUS).map(([k, v]) => `<option value="${k}" ${filtroStatus === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label></div>
            ${tabelaPartidas(lista.slice(0, 200), nomeDe)}`;
        }

        if (aba === 'jogo') {
          const optsDif = (sel) => Object.entries(cfg.dificuldades).map(([k, d]) => `<option value="${k}" ${sel === k ? 'selected' : ''}>${esc(d.nome)}</option>`).join('');
          return `
            <form class="cartao form-admin" id="form-cfg">
              <h3 class="cartao-titulo">Site e conta</h3>
              <div class="grade-campos">
                ${ci('site_nome', 'Nome do site', 'text', cfg.site_nome)}
                ${ci('saldo_inicial', 'Fichas ao criar conta (R$)', 'number', cfg.saldo_inicial)}
              </div>
              <h3 class="cartao-titulo">Partida</h3>
              <div class="grade-campos">
                ${ci('entrada_min', 'Entrada mínima (R$)', 'number', cfg.entrada_min)}
                ${ci('entrada_max', 'Entrada máxima (R$)', 'number', cfg.entrada_max)}
                ${ci('entradas_rapidas', 'Botões de entrada rápida', 'text', cfg.entradas_rapidas.join(', '))}
                ${ci('multiplicadores', 'Multiplicadores da meta', 'text', cfg.multiplicadores.join(', '))}
                ${ci('multiplicador_padrao', 'Multiplicador padrão', 'number', cfg.multiplicador_padrao)}
                ${ci('pct_por_plataforma', 'Cada plataforma vale (% da entrada)', 'number', cfg.pct_por_plataforma)}
                <label class="campo" for="dificuldade_padrao"><span>Dificuldade padrão</span><select id="dificuldade_padrao" name="dificuldade_padrao">${optsDif(cfg.dificuldade_padrao)}</select></label>
              </div>
              <h3 class="cartao-titulo">Teste grátis (página inicial)</h3>
              <div class="grade-campos">
                <label class="campo campo-check" for="demo_ativo"><input id="demo_ativo" name="demo_ativo" type="checkbox" ${cfg.demo_ativo ? 'checked' : ''}><span>Mostrar botão “Jogar grátis”</span></label>
                ${ci('demo_entrada', 'Entrada do teste (R$)', 'number', cfg.demo_entrada)}
                ${ci('demo_multiplicador', 'Multiplicador do teste', 'number', cfg.demo_multiplicador)}
                <label class="campo" for="demo_dificuldade"><span>Dificuldade do teste</span><select id="demo_dificuldade" name="demo_dificuldade">${optsDif(cfg.demo_dificuldade)}</select></label>
              </div>
              <div class="linha-btns">
                <button class="btn btn-abobora" type="submit">Salvar configurações</button>
                <button class="btn btn-fantasma" type="button" id="cfg-restaurar">Restaurar padrão</button>
              </div>
            </form>
            <section class="cartao zona-perigo">
              <h3 class="cartao-titulo">Zerar dados</h3>
              <p class="modal-texto">Apaga usuários, partidas, extratos e configurações deste navegador e volta ao estado inicial.</p>
              <button class="btn btn-perigo" type="button" id="zerar">Zerar todos os dados</button>
            </section>`;
        }

        if (aba === 'dificuldades') {
          return `
            <p class="nota">Cada partida usa a dificuldade do jogador (ou a padrão) e mostra o nome dela no placar do jogo.
              A prévia sorteia 6 plataformas a partir da 8ª: roxo é seguro, laranja mata, vazio é o buraco.</p>
            <div class="difs">${Object.entries(cfg.dificuldades)
              .map(
                ([k, d]) => `<form class="cartao dif" data-dif="${k}">
                  <div class="dif-cab"><input class="dif-nome" name="nome" value="${esc(d.nome)}" aria-label="Nome da dificuldade">
                    ${cfg.dificuldade_padrao === k ? '<span class="status status-aviso">Padrão</span>' : ''}</div>
                  <div class="previa" data-previa="${k}">${previa(d)}</div>
                  ${CAMPOS_DIF.map(
                    ([c, rot, suf, min, max, step]) => `<label class="campo campo-linha" for="${k}-${c}"><span>${rot}</span>
                      <span class="campo-num"><input id="${k}-${c}" name="${c}" type="number" min="${min}" max="${max}" step="${step}" value="${d[c]}">${suf ? `<i>${suf}</i>` : ''}</span></label>`
                  ).join('')}
                  <div class="linha-btns">
                    <button class="btn btn-abobora btn-p" type="submit">Salvar</button>
                    <button class="btn btn-fantasma btn-p" type="button" data-testar="${k}">Testar no jogo</button>
                  </div>
                </form>`
              )
              .join('')}</div>`;
        }
        return '';
      }

      function ci(id, rot, tipo, valor) {
        return `<label class="campo" for="${id}"><span>${rot}</span><input id="${id}" name="${id}" type="${tipo}" value="${esc(valor)}" ${tipo === 'number' ? 'step="any" min="0"' : ''}></label>`;
      }

      function tabelaPartidas(lista, nomeDe) {
        if (!lista.length) return '<div class="vazio">Nenhuma partida por aqui ainda.</div>';
        const cfg = Store.config();
        return `<div class="tabela-wrap"><table class="tabela">
          <thead><tr><th>Jogador</th><th class="num">Entrada</th><th class="num">Meta</th><th class="num">Plat.</th><th class="num">Prêmio</th><th>Situação</th><th>Dificuldade</th><th>Início</th></tr></thead>
          <tbody>${lista
            .map(
              (p) => `<tr>
                <td>${esc(nomeDe(p.user_id))}</td>
                <td class="num">${fmt(p.entrada)}</td>
                <td class="num">${fmt(p.meta)}</td>
                <td class="num">${p.plataformas}</td>
                <td class="num ${p.premio ? 'pos' : ''}">${p.premio ? fmt(p.premio) : '—'}</td>
                <td><span class="status status-${CLS_STATUS[p.status]}">${ROT_STATUS[p.status]}</span></td>
                <td>${esc((cfg.dificuldades[p.dificuldade] || {}).nome || p.dificuldade)}</td>
                <td>${data(p.inicio)}</td>
              </tr>`
            )
            .join('')}</tbody></table></div>`;
      }

      function numeros(txt) {
        return String(txt)
          .split(/[,;\s]+/)
          .map(Number)
          .filter((n) => n > 0);
      }

      function ligar(db, cfg) {
        const busc = app.querySelector('#busca');
        if (busc) {
          busc.addEventListener('input', () => {
            busca = busc.value;
            const pos = busc.selectionStart;
            desenhar();
            const novo = app.querySelector('#busca');
            novo.focus();
            novo.setSelectionRange(pos, pos);
          });
        }
        const fs = app.querySelector('#f-status');
        if (fs) fs.addEventListener('change', () => ((filtroStatus = fs.value), desenhar()));

        app.querySelectorAll('[data-editar]').forEach((b) => b.addEventListener('click', () => editarUsuario(b.dataset.editar)));

        const form = app.querySelector('#form-cfg');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(form));
            const patch = {
              site_nome: f.site_nome.trim() || 'HelixWin',
              saldo_inicial: Number(f.saldo_inicial) || 0,
              entrada_min: Number(f.entrada_min) || 1,
              entrada_max: Number(f.entrada_max) || 1,
              entradas_rapidas: numeros(f.entradas_rapidas),
              multiplicadores: numeros(f.multiplicadores),
              multiplicador_padrao: Number(f.multiplicador_padrao),
              pct_por_plataforma: Number(f.pct_por_plataforma) || 1,
              dificuldade_padrao: f.dificuldade_padrao,
              demo_ativo: !!f.demo_ativo,
              demo_entrada: Number(f.demo_entrada) || 1,
              demo_multiplicador: Number(f.demo_multiplicador) || 2,
              demo_dificuldade: f.demo_dificuldade,
            };
            if (patch.entrada_min > patch.entrada_max) return toast('A entrada mínima não pode ser maior que a máxima.', 'erro');
            if (!patch.multiplicadores.length) return toast('Informe pelo menos um multiplicador.', 'erro');
            if (!patch.entradas_rapidas.length) patch.entradas_rapidas = [patch.entrada_min];
            Store.salvarConfig(patch);
            toast('Configurações salvas.', 'ok');
            desenhar();
          });
          app.querySelector('#cfg-restaurar').addEventListener('click', async () => {
            if (!(await confirmar({ titulo: 'Restaurar configurações?', texto: 'As configurações e dificuldades voltam ao padrão. Usuários e partidas ficam.', sim: 'Restaurar' }))) return;
            Store.restaurarConfig();
            toast('Configurações restauradas.', 'ok');
            desenhar();
          });
          app.querySelector('#zerar').addEventListener('click', async () => {
            if (!(await confirmar({ titulo: 'Zerar todos os dados?', texto: 'Isso apaga usuários, partidas e extratos deste navegador. Não dá para desfazer.', sim: 'Zerar tudo', perigo: true }))) return;
            Store.admin.zerarTudo();
            toast('Dados zerados.', 'ok');
            if (!Store.usuarioAtual()) return App.ir('entrar');
            desenhar();
          });
        }

        app.querySelectorAll('form.dif').forEach((f) => {
          const k = f.dataset.dif;
          const ler = () => {
            const d = { nome: f.querySelector('[name="nome"]').value.trim() || cfg.dificuldades[k].nome };
            CAMPOS_DIF.forEach(([c, , , min, max]) => {
              const v = Number(f.querySelector(`[name="${c}"]`).value);
              d[c] = Math.min(max, Math.max(min, isNaN(v) ? min : v));
            });
            if (d.abertura_max < d.abertura_min) d.abertura_max = d.abertura_min;
            return d;
          };
          f.addEventListener('input', () => {
            f.querySelector('[data-previa]').innerHTML = previa(ler());
          });
          f.addEventListener('submit', (e) => {
            e.preventDefault();
            cfg.dificuldades[k] = ler();
            Store.salvarConfig({ dificuldades: cfg.dificuldades });
            toast(`Dificuldade “${cfg.dificuldades[k].nome}” salva.`, 'ok');
            desenhar();
          });
          f.querySelector('[data-testar]').addEventListener('click', () => {
            cfg.dificuldades[k] = ler();
            Store.salvarConfig({ dificuldades: cfg.dificuldades });
            App.partida = { demo: true, id: 'demo', entrada: 1, meta: 20, por_plat: 1, dificuldade: k };
            App.ir('jogo');
          });
        });
      }

      function editarUsuario(id) {
        const db = Store.admin.db();
        const cfg = db.config;
        const u = db.users.find((x) => x.id === id);
        if (!u) return;
        const souEu = Store.usuarioAtual().id === u.id;
        const m = modal(
          `<h3 class="modal-titulo">${esc(u.nome)}</h3>
           <p class="modal-texto">${esc(u.email)} · desde ${data(u.criado_em)}</p>
           <label class="campo" for="u-saldo"><span>Saldo de fichas</span>
             <div class="campo-prefixo"><i>R$</i><input id="u-saldo" type="number" min="0" step="0.01" value="${u.saldo}"></div></label>
           <label class="campo" for="u-dif"><span>Dificuldade</span>
             <select id="u-dif"><option value="">Padrão (${esc(cfg.dificuldades[cfg.dificuldade_padrao].nome)})</option>
             ${Object.entries(cfg.dificuldades).map(([k, d]) => `<option value="${k}" ${u.dificuldade === k ? 'selected' : ''}>${esc(d.nome)}</option>`).join('')}</select></label>
           <label class="campo campo-check" for="u-admin"><input id="u-admin" type="checkbox" ${u.is_admin ? 'checked' : ''} ${souEu ? 'disabled' : ''}><span>Administrador</span></label>
           <label class="campo campo-check" for="u-bloq"><input id="u-bloq" type="checkbox" ${u.bloqueado ? 'checked' : ''} ${souEu ? 'disabled' : ''}><span>Bloquear acesso</span></label>
           <div class="modal-acoes">
             ${souEu ? '' : '<button class="btn btn-perigo" data-r="excluir" type="button">Excluir</button>'}
             <button class="btn btn-abobora" data-r="salvar" type="button">Salvar</button>
           </div>`
        );
        m.el.querySelector('[data-r="salvar"]').addEventListener('click', () => {
          try {
            Store.admin.ajustarSaldo(u.id, m.el.querySelector('#u-saldo').value);
            const patch = { dificuldade: m.el.querySelector('#u-dif').value || null };
            if (!souEu) {
              patch.is_admin = m.el.querySelector('#u-admin').checked;
              patch.bloqueado = m.el.querySelector('#u-bloq').checked;
            }
            Store.admin.atualizarUsuario(u.id, patch);
            toast('Usuário atualizado.', 'ok');
            m.fechar();
            desenhar();
          } catch (e) {
            toast(e.message, 'erro');
          }
        });
        const ex = m.el.querySelector('[data-r="excluir"]');
        if (ex)
          ex.addEventListener('click', async () => {
            m.fechar();
            if (!(await confirmar({ titulo: `Excluir ${u.nome}?`, texto: 'A conta, as partidas e o extrato dela são apagados.', sim: 'Excluir', perigo: true }))) return;
            try {
              Store.admin.excluirUsuario(u.id);
              toast('Usuário excluído.', 'ok');
              desenhar();
            } catch (e) {
              toast(e.message, 'erro');
            }
          });
      }

      desenhar();
    },
  });
})();

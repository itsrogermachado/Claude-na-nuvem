// Banco de dados local (localStorage) — substitui o backend do original.
// Tudo aqui é fictício: o saldo são fichas de demonstração, sem dinheiro real.
(function () {
  const KEY = 'helixwin_db_v1';

  const DIFICULDADES_PADRAO = {
    facil: {
      nome: 'Fácil',
      obstaculo_pct: 10,      // chance de cada segmento virar obstáculo mortal
      max_obstaculos: 1,      // máximo de obstáculos por plataforma
      garantir_a_cada: 0,     // força 1 obstáculo a cada N plataformas (0 = nunca)
      gravidade_pct: 90,      // 100 = gravidade normal
      abertura_min: 3,        // tamanho do buraco, em segmentos (de 12)
      abertura_max: 4,
      rampa_pct: 1,           // +% de obstáculo a cada 10 plataformas
    },
    normal: {
      nome: 'Normal',
      obstaculo_pct: 18,
      max_obstaculos: 2,
      garantir_a_cada: 4,
      gravidade_pct: 100,
      abertura_min: 2,
      abertura_max: 3,
      rampa_pct: 2,
    },
    dificil: {
      nome: 'Difícil',
      obstaculo_pct: 28,
      max_obstaculos: 3,
      garantir_a_cada: 2,
      gravidade_pct: 115,
      abertura_min: 2,
      abertura_max: 2,
      rampa_pct: 3,
    },
  };

  const CONFIG_PADRAO = {
    site_nome: 'HelixWin',
    saldo_inicial: 1000,
    entrada_min: 1,
    entrada_max: 100,
    entradas_rapidas: [10, 20, 50],
    multiplicadores: [2, 3, 5, 7],
    multiplicador_padrao: 7,
    pct_por_plataforma: 100,  // cada plataforma vale X% da entrada
    dificuldade_padrao: 'normal',
    demo_ativo: true,
    demo_entrada: 1,
    demo_multiplicador: 20,
    demo_dificuldade: 'normal',
    dificuldades: DIFICULDADES_PADRAO,
  };

  // Senha guardada com um hash simples. É um protótipo local, não um sistema de produção.
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 'h' + (h >>> 0).toString(36);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function seed() {
    return {
      config: JSON.parse(JSON.stringify(CONFIG_PADRAO)),
      users: [
        {
          id: 'admin',
          nome: 'Administrador',
          email: 'admin@helixwin.local',
          telefone: '',
          senha: hash('admin123'),
          saldo: 1000,
          is_admin: true,
          bloqueado: false,
          dificuldade: null,
          criado_em: new Date().toISOString(),
        },
      ],
      partidas: [],
      transacoes: [],
      sessao: null,
    };
  }

  let memoria = null; // usado quando o localStorage está bloqueado

  function load() {
    if (memoria) return memoria;
    let db = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) db = JSON.parse(raw);
    } catch (_) {}
    if (!db) db = seed();
    // Completa campos novos de config sem apagar o que o admin mudou
    db.config = Object.assign(JSON.parse(JSON.stringify(CONFIG_PADRAO)), db.config || {});
    for (const k of Object.keys(DIFICULDADES_PADRAO)) {
      db.config.dificuldades[k] = Object.assign({}, DIFICULDADES_PADRAO[k], db.config.dificuldades[k] || {});
    }
    memoria = db;
    return db;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(memoria));
    } catch (_) {}
  }

  function erro(msg) {
    const e = new Error(msg);
    e.amigavel = true;
    throw e;
  }

  function addTx(db, user_id, tipo, valor, descricao) {
    db.transacoes.unshift({ id: uid(), user_id, tipo, valor, descricao, data: new Date().toISOString() });
    if (db.transacoes.length > 2000) db.transacoes.length = 2000;
  }

  function round2(v) {
    return Math.round(v * 100) / 100;
  }

  const Store = {
    hash,
    DIFICULDADES_PADRAO,

    config() {
      return load().config;
    },

    salvarConfig(patch) {
      const db = load();
      Object.assign(db.config, patch);
      save();
      return db.config;
    },

    restaurarConfig() {
      const db = load();
      db.config = JSON.parse(JSON.stringify(CONFIG_PADRAO));
      save();
    },

    // ── Conta ───────────────────────────────────────────────────────────────
    usuarioAtual() {
      const db = load();
      if (!db.sessao) return null;
      return db.users.find((u) => u.id === db.sessao) || null;
    },

    cadastrar({ nome, email, telefone, senha }) {
      const db = load();
      nome = (nome || '').trim();
      email = (email || '').trim().toLowerCase();
      if (nome.length < 2) erro('Digite seu nome.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erro('Digite um e-mail válido.');
      if ((senha || '').length < 6) erro('A senha precisa ter pelo menos 6 caracteres.');
      if (db.users.some((u) => u.email === email)) erro('Já existe uma conta com esse e-mail. Faça login.');
      const user = {
        id: uid(),
        nome,
        email,
        telefone: telefone || '',
        senha: hash(senha),
        saldo: db.config.saldo_inicial,
        is_admin: false,
        bloqueado: false,
        dificuldade: null,
        criado_em: new Date().toISOString(),
      };
      db.users.push(user);
      addTx(db, user.id, 'credito', user.saldo, 'Fichas de boas-vindas');
      db.sessao = user.id;
      save();
      return user;
    },

    entrar(email, senha) {
      const db = load();
      email = (email || '').trim().toLowerCase();
      const user = db.users.find((u) => u.email === email);
      if (!user || user.senha !== hash(senha || '')) erro('E-mail ou senha incorretos.');
      if (user.bloqueado) erro('Esta conta foi bloqueada pelo administrador.');
      db.sessao = user.id;
      save();
      return user;
    },

    sair() {
      const db = load();
      db.sessao = null;
      save();
    },

    atualizarPerfil(patch) {
      const db = load();
      const u = Store.usuarioAtual();
      if (!u) erro('Sessão expirada.');
      if (patch.nome !== undefined) {
        if (patch.nome.trim().length < 2) erro('Digite seu nome.');
        u.nome = patch.nome.trim();
      }
      if (patch.telefone !== undefined) u.telefone = patch.telefone;
      save();
      return u;
    },

    alterarSenha(atual, nova) {
      const u = Store.usuarioAtual();
      if (!u) erro('Sessão expirada.');
      if (u.senha !== hash(atual || '')) erro('A senha atual está incorreta.');
      if ((nova || '').length < 6) erro('A nova senha precisa ter pelo menos 6 caracteres.');
      u.senha = hash(nova);
      save();
    },

    adicionarFichas(valor) {
      const db = load();
      const u = Store.usuarioAtual();
      valor = round2(Number(valor));
      if (!u) erro('Sessão expirada.');
      if (!(valor > 0) || valor > 100000) erro('Escolha um valor entre R$ 1 e R$ 100.000.');
      u.saldo = round2(u.saldo + valor);
      addTx(db, u.id, 'credito', valor, 'Fichas adicionadas');
      save();
      return u.saldo;
    },

    // ── Partidas ────────────────────────────────────────────────────────────
    dificuldadeDe(user) {
      const cfg = load().config;
      const chave = (user && user.dificuldade) || cfg.dificuldade_padrao;
      return cfg.dificuldades[chave] ? chave : 'normal';
    },

    calcular(entrada, multiplicador) {
      const cfg = load().config;
      const meta = round2(entrada * multiplicador);
      const por_plat = Math.max(0.01, round2((entrada * cfg.pct_por_plataforma) / 100));
      return { meta, por_plat, plats_meta: Math.ceil(meta / por_plat - 1e-9) };
    },

    partidaPendente() {
      const db = load();
      const u = Store.usuarioAtual();
      if (!u) return null;
      return db.partidas.find((p) => p.user_id === u.id && p.status === 'andamento') || null;
    },

    iniciarPartida(entrada, multiplicador) {
      const db = load();
      const cfg = db.config;
      const u = Store.usuarioAtual();
      entrada = round2(Number(entrada));
      if (!u) erro('Sessão expirada.');
      if (Store.partidaPendente()) erro('Você já tem uma partida em andamento.');
      if (!(entrada >= cfg.entrada_min)) erro(`A entrada mínima é ${fmt(cfg.entrada_min)}.`);
      if (entrada > cfg.entrada_max) erro(`A entrada máxima é ${fmt(cfg.entrada_max)}.`);
      if (entrada > u.saldo) erro('Saldo insuficiente. Adicione fichas para jogar.');
      const { meta, por_plat } = Store.calcular(entrada, multiplicador);
      const partida = {
        id: uid(),
        user_id: u.id,
        entrada,
        multiplicador,
        meta,
        por_plat,
        dificuldade: Store.dificuldadeDe(u),
        plataformas: 0,
        premio: 0,
        status: 'andamento',
        inicio: new Date().toISOString(),
        fim: null,
      };
      u.saldo = round2(u.saldo - entrada);
      addTx(db, u.id, 'aposta', -entrada, `Entrada na partida (meta ${fmt(meta)})`);
      db.partidas.unshift(partida);
      save();
      return partida;
    },

    finalizarPartida(id, { status, plataformas }) {
      const db = load();
      const p = db.partidas.find((x) => x.id === id);
      if (!p || p.status !== 'andamento') return null;
      p.plataformas = plataformas || 0;
      p.status = status; // 'resgatou' | 'perdeu' | 'desistiu'
      p.fim = new Date().toISOString();
      if (status === 'resgatou') {
        p.premio = round2(p.plataformas * p.por_plat);
        const u = db.users.find((x) => x.id === p.user_id);
        if (u) {
          u.saldo = round2(u.saldo + p.premio);
          addTx(db, u.id, 'premio', p.premio, `Resgate: ${p.plataformas} plataformas`);
        }
      }
      save();
      return p;
    },

    minhasPartidas() {
      const u = Store.usuarioAtual();
      if (!u) return [];
      return load().partidas.filter((p) => p.user_id === u.id);
    },

    minhasTransacoes() {
      const u = Store.usuarioAtual();
      if (!u) return [];
      return load().transacoes.filter((t) => t.user_id === u.id);
    },

    estatisticasPublicas() {
      const db = load();
      const fechadas = db.partidas.filter((p) => p.status !== 'andamento');
      const resgates = fechadas.filter((p) => p.status === 'resgatou');
      const nomeDe = (id) => (db.users.find((u) => u.id === id) || {}).nome || 'Jogador';
      return {
        jogadores: db.users.length,
        partidas: fechadas.length,
        maior_resgate: resgates.reduce((m, p) => Math.max(m, p.premio), 0),
        recorde_plataformas: fechadas.reduce((m, p) => Math.max(m, p.plataformas), 0),
        ranking: resgates
          .slice()
          .sort((a, b) => b.premio - a.premio)
          .slice(0, 5)
          .map((p) => ({ nome: nomeDe(p.user_id), premio: p.premio, plataformas: p.plataformas, data: p.fim })),
      };
    },

    // ── Admin ───────────────────────────────────────────────────────────────
    admin: {
      db() {
        return load();
      },
      salvar() {
        save();
      },
      ajustarSaldo(user_id, novo) {
        const db = load();
        const u = db.users.find((x) => x.id === user_id);
        novo = round2(Number(novo));
        if (!u) erro('Usuário não encontrado.');
        if (!(novo >= 0)) erro('Digite um saldo válido.');
        const dif = round2(novo - u.saldo);
        u.saldo = novo;
        if (dif !== 0) addTx(db, u.id, 'ajuste', dif, 'Ajuste feito pelo administrador');
        save();
      },
      atualizarUsuario(user_id, patch) {
        const db = load();
        const u = db.users.find((x) => x.id === user_id);
        if (!u) erro('Usuário não encontrado.');
        if (patch.is_admin === false && u.is_admin && db.users.filter((x) => x.is_admin).length === 1) {
          erro('Precisa existir pelo menos um administrador.');
        }
        Object.assign(u, patch);
        save();
      },
      excluirUsuario(user_id) {
        const db = load();
        if (db.sessao === user_id) erro('Você não pode excluir a própria conta.');
        db.users = db.users.filter((u) => u.id !== user_id);
        db.partidas = db.partidas.filter((p) => p.user_id !== user_id);
        db.transacoes = db.transacoes.filter((t) => t.user_id !== user_id);
        save();
      },
      zerarTudo() {
        const atual = Store.usuarioAtual();
        memoria = seed();
        if (atual && atual.id === 'admin') memoria.sessao = 'admin';
        save();
      },
    },
  };

  function fmt(v) {
    return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  window.fmt = fmt;
  window.Store = Store;
})();

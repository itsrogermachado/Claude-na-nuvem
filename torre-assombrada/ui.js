// Utilitários de interface: roteador por #hash, toasts, modais e o logo.
(function () {
  const $app = () => document.getElementById('app');

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  function data(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function toast(msg, tipo = 'info') {
    const box = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = 'toast toast-' + tipo;
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.classList.add('saindo'), 3200);
    setTimeout(() => t.remove(), 3600);
  }

  // Abre um modal. `conteudo` é HTML. Retorna { el, fechar }.
  function modal(conteudo, { classe = '', aoFechar, fechavel = true } = {}) {
    const fundo = document.createElement('div');
    fundo.className = 'modal-fundo';
    fundo.innerHTML = `<div class="modal ${classe}" role="dialog" aria-modal="true">
      ${fechavel ? '<button class="modal-x" type="button" aria-label="Fechar">×</button>' : ''}
      ${conteudo}
    </div>`;
    document.getElementById('modais').appendChild(fundo);
    requestAnimationFrame(() => fundo.classList.add('aberto'));
    let fechado = false;
    function fechar() {
      if (fechado) return;
      fechado = true;
      fundo.classList.remove('aberto');
      setTimeout(() => fundo.remove(), 200);
      if (aoFechar) aoFechar();
    }
    if (fechavel) {
      fundo.querySelector('.modal-x').addEventListener('click', fechar);
      fundo.addEventListener('click', (e) => {
        if (e.target === fundo) fechar();
      });
    }
    const foco = fundo.querySelector('input, button:not(.modal-x)');
    if (foco) setTimeout(() => foco.focus({ preventScroll: true }), 50);
    return { el: fundo.querySelector('.modal'), fechar };
  }

  // Confirmação dentro da página (o visualizador não mostra confirm()).
  function confirmar({ titulo, texto, sim = 'Confirmar', nao = 'Cancelar', perigo = false }) {
    return new Promise((resolve) => {
      let resposta = false;
      const m = modal(
        `<h3 class="modal-titulo">${esc(titulo)}</h3>
         <p class="modal-texto">${texto}</p>
         <div class="modal-acoes">
           <button class="btn btn-fantasma" data-r="nao" type="button">${esc(nao)}</button>
           <button class="btn ${perigo ? 'btn-perigo' : 'btn-abobora'}" data-r="sim" type="button">${esc(sim)}</button>
         </div>`,
        { aoFechar: () => resolve(resposta) }
      );
      m.el.querySelectorAll('[data-r]').forEach((b) =>
        b.addEventListener('click', () => {
          resposta = b.dataset.r === 'sim';
          m.fechar();
        })
      );
    });
  }

  function logo(tamanho = 'normal') {
    const nome = esc(Store.config().site_nome);
    return `<a class="logo logo-${tamanho}" href="#inicio" aria-label="${nome}, página inicial">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 8c-1-3 0-5 3-6" stroke="#3f7a2a" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="13" cy="23" rx="9" ry="12" fill="#e2620e"/>
        <ellipse cx="27" cy="23" rx="9" ry="12" fill="#e2620e"/>
        <ellipse cx="20" cy="23" rx="9" ry="13" fill="#ff7518"/>
        <path d="M12 20l4-3 2 4z M28 20l-4-3-2 4z" fill="#1a0f2c"/>
        <path d="M12 27q8 7 16 0l-3 1-2-2-3 2-3-2-2 2z" fill="#1a0f2c"/>
      </svg>
      <span>${nome}</span>
    </a>`;
  }

  function avisoFichas() {
    return `<p class="aviso-fichas">Demonstração com fichas fictícias. Nenhum valor real é depositado ou sacado.</p>`;
  }

  // ── Roteador ────────────────────────────────────────────────────────────
  const rotas = {};
  let limpar = null;

  function rotaAtual() {
    return (location.hash || '#inicio').slice(1) || 'inicio';
  }

  function ir(rota) {
    if (rotaAtual() === rota) render();
    else location.hash = rota;
  }

  function render() {
    let rota = rotaAtual();
    if (!rotas[rota]) rota = 'inicio';
    const r = rotas[rota];
    const user = Store.usuarioAtual();
    if (r.logado && !user) return ir('entrar');
    if (r.admin && !(user && user.is_admin)) {
      toast('Essa área é só para administradores.', 'erro');
      return ir(user ? 'painel' : 'entrar');
    }
    if (r.visitante && user) return ir('painel');
    if (limpar) {
      try {
        limpar();
      } catch (_) {}
      limpar = null;
    }
    document.getElementById('modais').innerHTML = '';
    document.body.dataset.rota = rota;
    const app = $app();
    app.innerHTML = '';
    window.scrollTo(0, 0);
    const resultado = r.render(app);
    if (typeof resultado === 'function') limpar = resultado;
  }

  window.UI = { esc, data, toast, modal, confirmar, logo, avisoFichas };
  window.App = {
    rotas,
    ir,
    partida: null, // partida em memória para a tela do jogo
    registrar(nome, def) {
      rotas[nome] = def;
    },
    iniciar() {
      window.addEventListener('hashchange', render);
      render();
    },
  };
})();

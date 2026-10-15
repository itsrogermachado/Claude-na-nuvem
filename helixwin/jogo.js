// Tela do jogo: placar (HUD), resgate livre, resultado e modo de teste grátis.
//  • Cada plataforma passada soma `por_plat` ao acumulado
//  • Ao atingir a meta (entrada × multiplicador) aparece o botão Resgatar
//  • O jogador escolhe quando parar; se morrer antes de resgatar, perde a entrada
(function () {
  const { esc, toast, modal, confirmar } = UI;

  const FRASES_DERROTA = [
    'A abóbora encostou no laranja. A torre venceu essa.',
    'Tão perto da meia-noite… respira e tenta de novo.',
    'Os fantasmas agradecem a sua entrada.',
    'Gire com calma: o buraco sempre aparece.',
  ];

  App.registrar('jogo', {
    render(app) {
      const partida = App.partida;
      const user = Store.usuarioAtual();
      if (!partida || (!partida.demo && (!user || partida.user_id !== user.id))) {
        App.ir(user ? 'painel' : 'inicio');
        return;
      }
      const cfg = Store.config();
      const dif = cfg.dificuldades[partida.dificuldade] || cfg.dificuldades.normal;
      let plataformas = 0;
      let acumulado = 0;
      let metaBatida = false;
      let acabou = false;

      app.innerHTML = `
        <div class="jogo">
          <div class="palco" id="palco"></div>
          <div class="hud">
            <div class="hud-linha">
              <div class="hud-bloco"><span>Aposta</span><b id="hud-aposta">${fmt(partida.entrada)}</b></div>
              <div class="hud-centro">
                <b class="hud-ganho" id="hud-ganho">${fmt(0)}</b>
                <span class="hud-meta">/ <b>${fmt(partida.meta)}</b></span>
              </div>
              <button class="hud-som" id="hud-som" type="button" aria-label="Ligar ou desligar o som">${icone(Sons.mudo ? 'mudo' : 'som')}</button>
            </div>
            <div class="hud-barra"><i id="hud-barra"></i></div>
            <p class="hud-info"><span id="hud-plat">0 plataformas</span> · +${fmt(partida.por_plat)}/plat · ${esc(dif.nome)}${partida.demo ? ' · teste grátis' : ''}</p>
            <button class="hud-sair" id="hud-sair" type="button">Sair</button>
          </div>
          <div class="combo" id="combo" hidden>Bola de fogo!</div>
          <div class="inicio-jogo" id="inicio-jogo">
            <p>Toque para jogar</p>
            <span class="seta">↓</span>
            <small>Arraste para os lados para girar a torre</small>
          </div>
          <button class="btn-resgatar" id="btn-resgatar" type="button" hidden>Resgatar <b id="resgatar-valor"></b></button>
        </div>`;

      const $ = (id) => app.querySelector('#' + id);
      const palco = $('palco');

      const jogo = new TorreJogo(palco, {
        dificuldade: dif,
        aoPassar(n, { esmagou }) {
          plataformas = n;
          acumulado = Math.round(n * partida.por_plat * 100) / 100;
          atualizarHud();
          flutuar('+' + fmt(partida.por_plat));
          if (esmagou) {
            Sons.esmagou();
          } else Sons.passou(n);
          if (!metaBatida && acumulado >= partida.meta - 1e-9) {
            metaBatida = true;
            Sons.meta();
            $('btn-resgatar').hidden = false;
            toast('Meta batida! Resgate agora ou continue descendo.', 'ok');
          }
        },
        aoEsmagar() {
          const c = $('combo');
          c.hidden = false;
          c.classList.remove('pulo');
          void c.offsetWidth;
          c.classList.add('pulo');
          setTimeout(() => (c.hidden = true), 900);
        },
        aoQuicar() {
          Sons.quique();
        },
        aoMorrer() {
          if (acabou) return;
          acabou = true;
          Sons.morreu();
          if (navigator.vibrate) navigator.vibrate(200);
          $('btn-resgatar').hidden = true;
          if (partida.demo) return resultadoDemo(false);
          Store.finalizarPartida(partida.id, { status: 'perdeu', plataformas });
          resultado(false);
        },
      });

      function atualizarHud() {
        $('hud-ganho').textContent = fmt(acumulado);
        $('hud-plat').textContent = `${plataformas} ${plataformas === 1 ? 'plataforma' : 'plataformas'}`;
        $('hud-barra').style.width = Math.min(100, (acumulado / partida.meta) * 100) + '%';
        $('resgatar-valor').textContent = fmt(acumulado);
        $('hud-ganho').classList.toggle('batida', metaBatida || acumulado >= partida.meta);
      }

      function flutuar(texto) {
        const f = document.createElement('div');
        f.className = 'flutua';
        f.textContent = texto;
        app.querySelector('.jogo').appendChild(f);
        setTimeout(() => f.remove(), 900);
      }

      function comecar() {
        Sons.desbloquear();
        $('inicio-jogo').hidden = true;
        jogo.iniciar();
      }
      $('inicio-jogo').addEventListener('pointerdown', comecar, { once: true });

      $('hud-som').addEventListener('click', () => {
        const mudo = Sons.alternar();
        $('hud-som').innerHTML = icone(mudo ? 'mudo' : 'som');
      });

      $('btn-resgatar').addEventListener('click', () => {
        if (acabou || !metaBatida) return;
        acabou = true;
        jogo.parar();
        $('btn-resgatar').hidden = true;
        Sons.resgate();
        if (partida.demo) return resultadoDemo(true);
        Store.finalizarPartida(partida.id, { status: 'resgatou', plataformas });
        resultado(true);
      });

      $('hud-sair').addEventListener('click', async () => {
        if (acabou) return sairDaTela();
        if (partida.demo) return App.ir('inicio');
        const ok = await confirmar({
          titulo: 'Desistir da partida?',
          texto: `Você perde a entrada de <b>${fmt(partida.entrada)}</b>${acumulado ? ` e o acumulado de <b>${fmt(acumulado)}</b>` : ''}.`,
          sim: 'Desistir',
          nao: 'Continuar jogando',
          perigo: true,
        });
        if (!ok || acabou) return;
        acabou = true;
        jogo.parar();
        Store.finalizarPartida(partida.id, { status: 'desistiu', plataformas });
        App.ir('painel');
      });

      function sairDaTela() {
        App.partida = null;
        App.ir(partida.demo ? 'inicio' : 'painel');
      }

      function resultado(venceu) {
        const u = Store.usuarioAtual();
        const m = modal(
          `<div class="resultado ${venceu ? 'venceu' : 'perdeu'}">
             <div class="resultado-icone">${venceu ? '🎃' : '💀'}</div>
             <h2 class="resultado-titulo">${venceu ? 'Você escapou!' : 'Você perdeu!'}</h2>
             <p class="modal-texto">${venceu ? `Resgate feito com ${plataformas} plataformas.` : esc(FRASES_DERROTA[Math.floor(Math.random() * FRASES_DERROTA.length)])}</p>
             <div class="resultado-valor"><span>${venceu ? 'Prêmio' : 'Entrada perdida'}</span><b>${venceu ? '+' : '−'}${fmt(venceu ? acumulado : partida.entrada)}</b></div>
             <p class="resultado-saldo">Saldo agora: <b>${fmt(u ? u.saldo : 0)}</b></p>
             <div class="modal-acoes">
               <button class="btn btn-fantasma" data-r="painel" type="button">Voltar ao painel</button>
               <button class="btn btn-abobora" data-r="denovo" type="button">Jogar de novo</button>
             </div>
           </div>`,
          { fechavel: false, classe: 'modal-resultado' }
        );
        m.el.querySelector('[data-r="painel"]').addEventListener('click', () => {
          m.fechar();
          sairDaTela();
        });
        m.el.querySelector('[data-r="denovo"]').addEventListener('click', () => {
          try {
            App.partida = Store.iniciarPartida(partida.entrada, partida.multiplicador);
            m.fechar();
            App.ir('jogo');
          } catch (e) {
            toast(e.message, 'erro');
            m.fechar();
            sairDaTela();
          }
        });
      }

      function resultadoDemo() {
        const cfg = Store.config();
        const m = modal(
          `<div class="resultado venceu">
             <div class="resultado-icone">🎃</div>
             <h2 class="resultado-titulo">🎃 Que sortudo!</h2>
             <p class="modal-texto">Veja quanto você <b>ganharia</b> de verdade:</p>
             <div class="resultado-valor"><span>🎃 Seu prêmio amaldiçoado seria</span><b>+ ${fmt(acumulado)}</b></div>
             <p class="modal-texto">Encare a torre de verdade! 🎃<br><b style="color:var(--abobora-luz)">Ganhe ${fmt(cfg.saldo_inicial)} em fichas</b> ao criar sua conta.<br>Hora de sobreviver à noite!</p>
             <div class="modal-acoes coluna">
               <button class="btn btn-abobora btn-g btn-bloco" data-r="conta" type="button">${icone('pessoa')} 🎃 Jogar de verdade</button>
               <button class="btn btn-fantasma btn-bloco" data-r="denovo" type="button">Testar de novo</button>
             </div>
           </div>`,
          { fechavel: false, classe: 'modal-resultado' }
        );
        m.el.querySelector('[data-r="conta"]').addEventListener('click', () => {
          m.fechar();
          App.partida = null;
          App.ir(Store.usuarioAtual() ? 'painel' : 'cadastro');
        });
        m.el.querySelector('[data-r="denovo"]').addEventListener('click', () => {
          m.fechar();
          Paginas.jogarDemo();
        });
      }

      return () => jogo.destruir();
    },
  });
})();

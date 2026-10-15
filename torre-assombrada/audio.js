// Efeitos sonoros sintetizados com Web Audio (nenhum arquivo de áudio externo).
(function () {
  let ctx = null;
  let master = null;
  let mudo = false;
  try {
    mudo = localStorage.getItem('torre_mudo') === '1';
  } catch (_) {}

  function garantir() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tom(freq, dur, { tipo = 'sine', vol = 0.5, ate = null, atraso = 0 } = {}) {
    if (mudo || !garantir()) return;
    const t = ctx.currentTime + atraso;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t);
    if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  window.Sons = {
    desbloquear: garantir,
    get mudo() {
      return mudo;
    },
    alternar() {
      mudo = !mudo;
      try {
        localStorage.setItem('torre_mudo', mudo ? '1' : '0');
      } catch (_) {}
      return mudo;
    },
    quique() {
      tom(220, 0.12, { tipo: 'sine', vol: 0.4, ate: 140 });
    },
    passou(n) {
      const base = 520 + Math.min(n % 8, 7) * 40;
      tom(base, 0.09, { tipo: 'triangle', vol: 0.25 });
    },
    esmagou() {
      tom(160, 0.25, { tipo: 'sawtooth', vol: 0.25, ate: 60 });
      tom(900, 0.15, { tipo: 'square', vol: 0.08, ate: 300 });
    },
    meta() {
      [660, 880, 1100].forEach((f, i) => tom(f, 0.18, { tipo: 'triangle', vol: 0.3, atraso: i * 0.09 }));
    },
    morreu() {
      tom(300, 0.7, { tipo: 'sawtooth', vol: 0.3, ate: 45 });
      tom(150, 0.9, { tipo: 'square', vol: 0.12, ate: 40, atraso: 0.05 });
    },
    resgate() {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tom(f, 0.22, { tipo: 'triangle', vol: 0.3, atraso: i * 0.08 }));
    },
  };
})();

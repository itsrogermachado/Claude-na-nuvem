// Motor do jogo — torre em espiral estilo Helix Jump, em Three.js (r128, global THREE).
//
// Geometria: cada plataforma é um anel de 12 segmentos. O ângulo local φ de um ponto (x, z)
// é atan2(-z, x). Girar a torre em ρ leva o ângulo local φ ao ângulo de mundo φ + ρ.
// A bolinha fica parada no ângulo de mundo -π/2 (de frente para a câmera), então o segmento
// embaixo dela é o de ângulo local  -π/2 - ρ.
(function () {
  const SEG = 12;
  const SEG_A = (Math.PI * 2) / SEG;
  const ESPACO = 3.2;        // distância vertical entre plataformas
  const R_IN = 1.05;
  const R_OUT = 3.1;
  const ALT = 0.38;          // espessura da plataforma
  const BOLA_R = 0.3;
  const BOLA_Z = 2.05;       // raio onde a bolinha quica
  const G_BASE = 30;
  const V_QUIQUE = 10;
  const COMBO_FOGO = 3;      // plataformas seguidas sem quicar para virar bola de fogo

  const CORES = {
    seguro: 0x6b3fd4,
    seguroEsc: 0x4c2a9e,
    mortal: 0xff5a14,
    poste: 0x221340,
    abobora: 0xff7518,
    gosma: 0xff9a3c,
  };

  function aleatorio(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function normalizar(a) {
    const t = Math.PI * 2;
    return ((a % t) + t) % t;
  }

  function texturaAbobora() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#ff9a3c');
    grad.addColorStop(0.5, '#ff7518');
    grad.addColorStop(1, '#c84a08');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 128);
    // gomos da abóbora
    for (let i = 0; i < 10; i++) {
      const x = (i / 10) * 256;
      const lg = g.createLinearGradient(x - 12, 0, x + 12, 0);
      lg.addColorStop(0, 'rgba(120,40,0,0)');
      lg.addColorStop(0.5, 'rgba(120,40,0,.45)');
      lg.addColorStop(1, 'rgba(120,40,0,0)');
      g.fillStyle = lg;
      g.fillRect(x - 12, 0, 24, 128);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    return t;
  }

  function geometriaSegmento() {
    const s = new THREE.Shape();
    s.absarc(0, 0, R_OUT, 0, SEG_A, false);
    s.absarc(0, 0, R_IN, SEG_A, 0, true);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: ALT,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 10,
    });
    geo.rotateX(-Math.PI / 2); // forma no plano XZ, espessura para cima
    return geo;
  }

  class TorreJogo {
    constructor(container, opcoes) {
      this.container = container;
      this.dif = opcoes.dificuldade;
      this.cb = opcoes;
      this.estado = 'pronto';      // pronto | jogando | parado | morto
      this.rho = 0;
      this.plataformas = [];       // { i, y, tipos, grupo, passada, quebrando, t }
      this.atual = 0;              // próxima plataforma abaixo da bolinha
      this.passadas = 0;
      this.combo = 0;
      this.bolaY = ALT + BOLA_R + 1.2;
      this.vy = 0;
      this.camY = null;
      this.squash = 0;
      this.gosmas = [];
      this.tMorte = 0;
      this.teclas = { esq: false, dir: false };

      this._montarCena();
      this._montarEntrada();
      for (let i = 0; i < 14; i++) this._criarPlataforma(i);

      this._ultimo = performance.now();
      this._loop = this._loop.bind(this);
      this._raf = requestAnimationFrame(this._loop);
    }

    // ── Cena ──────────────────────────────────────────────────────────────
    _montarCena() {
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h);
      this.renderer.setClearColor(0x000000, 0);
      this.container.appendChild(this.renderer.domElement);

      this.cena = new THREE.Scene();
      this.cena.fog = new THREE.Fog(0x140a26, 14, 34);
      this.camera = new THREE.PerspectiveCamera(w / h < 0.7 ? 58 : 48, w / h, 0.1, 100);

      this.cena.add(new THREE.AmbientLight(0x9a7be0, 0.55));
      const sol = new THREE.DirectionalLight(0xffffff, 0.85);
      sol.position.set(5, 10, 8);
      this.cena.add(sol);
      const contra = new THREE.DirectionalLight(0xff7a2a, 0.45);
      contra.position.set(-6, -2, 4);
      this.cena.add(contra);

      this.torre = new THREE.Group();
      this.cena.add(this.torre);

      const poste = new THREE.Mesh(
        new THREE.CylinderGeometry(R_IN - 0.02, R_IN - 0.02, 90, 32),
        new THREE.MeshStandardMaterial({ color: CORES.poste, roughness: 0.75 })
      );
      this.poste = poste;
      this.cena.add(poste);

      this.geoSeg = geometriaSegmento();
      this.mat = {
        seguro: new THREE.MeshStandardMaterial({ color: CORES.seguro, roughness: 0.45, metalness: 0.05 }),
        seguroEsc: new THREE.MeshStandardMaterial({ color: CORES.seguroEsc, roughness: 0.5 }),
        mortal: new THREE.MeshStandardMaterial({
          color: CORES.mortal,
          emissive: 0xff3300,
          emissiveIntensity: 0.55,
          roughness: 0.35,
        }),
        gosma: new THREE.MeshBasicMaterial({ color: CORES.gosma, transparent: true, opacity: 0.9 }),
      };
      this.geoGosma = new THREE.CircleGeometry(0.34, 14);
      this.geoGosma.rotateX(-Math.PI / 2);

      // Bolinha-abóbora
      this.bolaMat = new THREE.MeshStandardMaterial({
        map: texturaAbobora(),
        roughness: 0.5,
        emissive: 0xff5a00,
        emissiveIntensity: 0.12,
      });
      this.bola = new THREE.Group();
      const corpo = new THREE.Mesh(new THREE.SphereGeometry(BOLA_R, 32, 20), this.bolaMat);
      corpo.scale.set(1.08, 0.92, 1.08);
      const cabo = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.05, 0.14, 8),
        new THREE.MeshStandardMaterial({ color: 0x3f7a2a, roughness: 0.8 })
      );
      cabo.position.y = BOLA_R * 0.95;
      cabo.rotation.z = 0.25;
      this.bola.add(corpo, cabo);
      this.bolaCorpo = corpo;
      this.bola.position.set(0, this.bolaY, BOLA_Z);
      this.cena.add(this.bola);

      // Brilho da bola de fogo
      this.aura = new THREE.Mesh(
        new THREE.SphereGeometry(BOLA_R * 1.7, 20, 14),
        new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0, depthWrite: false })
      );
      this.bola.add(this.aura);

      this._aoRedimensionar = () => {
        const W = this.container.clientWidth;
        const H = this.container.clientHeight;
        if (!W || !H) return;
        this.renderer.setSize(W, H);
        this.camera.aspect = W / H;
        this.camera.fov = W / H < 0.7 ? 58 : 48;
        this.camera.updateProjectionMatrix();
      };
      this._ro = new ResizeObserver(this._aoRedimensionar);
      this._ro.observe(this.container);
    }

    // ── Controles ─────────────────────────────────────────────────────────
    _montarEntrada() {
      const el = this.renderer.domElement;
      el.style.touchAction = 'none';
      let arrastando = false;
      let ultimoX = 0;
      this._down = (e) => {
        arrastando = true;
        ultimoX = e.clientX;
        try {
          el.setPointerCapture(e.pointerId);
        } catch (_) {}
      };
      this._move = (e) => {
        if (!arrastando) return;
        const dx = e.clientX - ultimoX;
        ultimoX = e.clientX;
        if (this.estado !== 'jogando') return;
        const largura = this.container.clientWidth || 400;
        this.rho += (dx / largura) * 5.2;
      };
      this._up = () => {
        arrastando = false;
      };
      this._tecla = (e) => {
        const v = e.type === 'keydown';
        if (e.key === 'ArrowLeft' || e.key === 'a') this.teclas.esq = v;
        if (e.key === 'ArrowRight' || e.key === 'd') this.teclas.dir = v;
      };
      el.addEventListener('pointerdown', this._down);
      el.addEventListener('pointermove', this._move);
      el.addEventListener('pointerup', this._up);
      el.addEventListener('pointercancel', this._up);
      window.addEventListener('keydown', this._tecla);
      window.addEventListener('keyup', this._tecla);
    }

    // ── Plataformas ───────────────────────────────────────────────────────
    _gerarTipos(i) {
      const d = this.dif;
      const tipos = new Array(SEG).fill('seguro');
      const segBola = Math.floor(normalizar(-Math.PI / 2) / SEG_A); // segmento sob a bola com ρ = 0
      const tam = Math.max(1, Math.min(6, aleatorio(d.abertura_min, Math.max(d.abertura_min, d.abertura_max))));
      // A primeira plataforma tem o buraco longe da bolinha e nenhum obstáculo
      const inicio = i === 0 ? (segBola + 4) % SEG : aleatorio(0, SEG - 1);
      for (let k = 0; k < tam; k++) tipos[(inicio + k) % SEG] = 'buraco';
      if (i <= 1) return tipos;

      const chance = Math.min(60, d.obstaculo_pct + d.rampa_pct * Math.floor(i / 10)) / 100;
      let mortais = 0;
      const seguros = [];
      for (let s = 0; s < SEG; s++) {
        if (tipos[s] !== 'seguro') continue;
        if (mortais < d.max_obstaculos && Math.random() < chance) {
          tipos[s] = 'mortal';
          mortais++;
        } else seguros.push(s);
      }
      if (d.garantir_a_cada > 0 && i % d.garantir_a_cada === 0 && mortais === 0 && seguros.length > 1) {
        tipos[seguros[aleatorio(0, seguros.length - 1)]] = 'mortal';
      }
      return tipos;
    }

    _criarPlataforma(i) {
      const tipos = this._gerarTipos(i);
      const grupo = new THREE.Group();
      grupo.position.y = -i * ESPACO;
      tipos.forEach((t, s) => {
        if (t === 'buraco') return;
        const mat = t === 'mortal' ? this.mat.mortal : s % 2 ? this.mat.seguro : this.mat.seguroEsc;
        const m = new THREE.Mesh(this.geoSeg, mat);
        m.rotation.y = s * SEG_A;
        m.userData.seg = s;
        grupo.add(m);
      });
      this.torre.add(grupo);
      this.plataformas[i] = { i, y: -i * ESPACO, tipos, grupo, passada: false, quebrando: false, t: 0 };
    }

    _garantirPlataformas() {
      for (let i = this.atual; i < this.atual + 14; i++) {
        if (!this.plataformas[i]) this._criarPlataforma(i);
      }
    }

    _quebrar(p) {
      p.quebrando = true;
      p.t = 0;
      p.grupo.children.forEach((m) => {
        if (m.userData.seg === undefined) {
          m.visible = false;
          return;
        }
        m.material = m.material.clone();
        m.material.transparent = true;
        const meio = (m.userData.seg + 0.5) * SEG_A;
        m.userData.vel = new THREE.Vector3(Math.cos(meio) * 7, 3 + Math.random() * 3, -Math.sin(meio) * 7);
        m.userData.giro = (Math.random() - 0.5) * 8;
      });
    }

    _animarQuebras(dt) {
      for (const p of this.plataformas) {
        if (!p || !p.quebrando || !p.grupo) continue;
        p.t += dt;
        p.grupo.children.forEach((m) => {
          if (!m.userData.vel) return;
          m.userData.vel.y -= 25 * dt;
          m.position.addScaledVector(m.userData.vel, dt);
          m.rotation.x += m.userData.giro * dt;
          m.material.opacity = Math.max(0, 1 - p.t / 0.7);
        });
        if (p.t > 0.75) {
          p.grupo.children.forEach((m) => {
            if (m.material && m.material !== this.mat.gosma && m.userData.vel) m.material.dispose();
          });
          this.torre.remove(p.grupo);
          p.grupo = null;
        }
      }
    }

    _gosma(p, seg) {
      const phi = normalizar(-Math.PI / 2 - this.rho);
      const g = new THREE.Mesh(this.geoGosma, this.mat.gosma);
      g.position.set(Math.cos(phi) * BOLA_Z, ALT + 0.045, -Math.sin(phi) * BOLA_Z);
      g.scale.setScalar(0.7 + Math.random() * 0.5);
      p.grupo.add(g);
    }

    _passar(p, esmagou) {
      p.passada = true;
      this.passadas++;
      this.combo++;
      this.atual = p.i + 1;
      this._quebrar(p);
      this._garantirPlataformas();
      if (this.cb.aoPassar) this.cb.aoPassar(this.passadas, { combo: this.combo, esmagou });
    }

    // ── Física ────────────────────────────────────────────────────────────
    _fisica(h) {
      const g = G_BASE * (this.dif.gravidade_pct / 100);
      const yAntes = this.bolaY;
      this.vy -= g * h;
      this.bolaY += this.vy * h;

      const p = this.plataformas[this.atual];
      if (!p) return;
      const topo = p.y + ALT;
      if (this.vy < 0 && yAntes - BOLA_R >= topo - 1e-6 && this.bolaY - BOLA_R < topo) {
        const seg = Math.floor(normalizar(-Math.PI / 2 - this.rho) / SEG_A) % SEG;
        const tipo = p.tipos[seg];
        if (tipo !== 'buraco') {
          if (this.estado === 'jogando' && this.combo >= COMBO_FOGO) {
            // bola de fogo: atravessa e quebra a plataforma, inclusive obstáculos
            this.combo = 0;
            if (this.cb.aoEsmagar) this.cb.aoEsmagar();
            this._passar(p, true);
            this.combo = 0;
            return;
          }
          if (tipo === 'mortal' && this.estado === 'jogando') {
            this.bolaY = topo + BOLA_R;
            this._morrer();
            return;
          }
          this.bolaY = topo + BOLA_R;
          this.vy = V_QUIQUE * Math.sqrt(this.dif.gravidade_pct / 100);
          this.squash = 1;
          this.combo = 0;
          if (this.estado === 'jogando') {
            this._gosma(p, seg);
            if (this.cb.aoQuicar) this.cb.aoQuicar();
          }
        }
      }
      if (this.estado === 'jogando' && !p.passada && this.bolaY + BOLA_R < p.y - 0.05) {
        this._passar(p, false);
      }
    }

    _morrer() {
      this.estado = 'morto';
      this.tMorte = 0;
      this.vy = 0;
      this.bolaMat.emissive.setHex(0xff0000);
      this.bolaMat.emissiveIntensity = 0.9;
      if (this.cb.aoMorrer) setTimeout(() => this.cb.aoMorrer(this.passadas), 650);
    }

    // ── Loop ──────────────────────────────────────────────────────────────
    _loop(agora) {
      this._raf = requestAnimationFrame(this._loop);
      const dt = Math.min(0.05, (agora - this._ultimo) / 1000);
      this._ultimo = agora;

      if (this.estado === 'jogando') {
        if (this.teclas.esq) this.rho -= 3.2 * dt;
        if (this.teclas.dir) this.rho += 3.2 * dt;
      }
      this.torre.rotation.y = this.rho;

      if (this.estado === 'pronto' || this.estado === 'jogando') {
        const passos = Math.max(1, Math.ceil(dt / (1 / 240)));
        for (let k = 0; k < passos && (this.estado === 'pronto' || this.estado === 'jogando'); k++) {
          this._fisica(dt / passos);
        }
      }

      // bolinha: amassa ao quicar, brilha em combo
      this.squash = Math.max(0, this.squash - dt * 6);
      const sq = this.squash * 0.28;
      this.bolaCorpo.scale.set(1.08 * (1 + sq), 0.92 * (1 - sq), 1.08 * (1 + sq));
      const fogo = this.estado === 'jogando' && this.combo >= COMBO_FOGO;
      this.aura.material.opacity += ((fogo ? 0.45 : 0) - this.aura.material.opacity) * Math.min(1, dt * 10);
      if (this.estado !== 'morto') {
        this.bolaMat.emissiveIntensity = fogo ? 0.7 : 0.12;
      } else {
        this.tMorte += dt;
        const s = Math.max(0.05, 1 - this.tMorte * 1.6);
        this.bolaCorpo.scale.set(1.08 * (1 + (1 - s) * 0.8), 0.92 * s, 1.08 * (1 + (1 - s) * 0.8));
      }
      this.bola.position.y = this.bolaY;

      // câmera acompanha a plataforma atual, sem tremer a cada quique
      const p = this.plataformas[this.atual];
      const alvo = (p ? p.y : this.bolaY) + 4.8;
      this.camY = this.camY === null ? alvo : this.camY + (alvo - this.camY) * Math.min(1, dt * 5);
      this.camera.position.set(0, this.camY, 11);
      this.camera.lookAt(0, this.camY - 4.2, 0);
      this.poste.position.y = this.camY - 30;

      this._animarQuebras(dt);
      // remove plataformas que já saíram da tela
      for (let i = Math.max(0, this.atual - 20); i < this.atual - 3; i++) {
        const q = this.plataformas[i];
        if (q && q.grupo && !q.quebrando) {
          this.torre.remove(q.grupo);
          q.grupo = null;
        }
      }
      this.renderer.render(this.cena, this.camera);
    }

    // ── API ───────────────────────────────────────────────────────────────
    iniciar() {
      if (this.estado === 'pronto') this.estado = 'jogando';
    }

    parar() {
      if (this.estado === 'jogando' || this.estado === 'pronto') this.estado = 'parado';
    }

    destruir() {
      cancelAnimationFrame(this._raf);
      this._ro.disconnect();
      window.removeEventListener('keydown', this._tecla);
      window.removeEventListener('keyup', this._tecla);
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }

  window.TorreJogo = TorreJogo;
})();

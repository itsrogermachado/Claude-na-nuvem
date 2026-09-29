import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, SANS, cardBg, easeInOut, easeOut, prog, springAt} from './theme';
import {FPS, NARRATION, SCENES, WORDS, wordAt} from './timeline';

const useT = () => useCurrentFrame() / FPS;

// ---------------------------------------------------------------- base

const Background: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{backgroundImage: 'radial-gradient(#E3E7EE 2.2px, transparent 2.4px)', backgroundSize: '44px 44px', opacity: 0.9}} />
			<div style={{position: 'absolute', width: 900, height: 900, borderRadius: '50%', left: -300 + Math.sin(t * 0.35) * 80, top: 150 + Math.cos(t * 0.3) * 90, background: C.coral, opacity: 0.1, filter: 'blur(140px)'}} />
			<div style={{position: 'absolute', width: 900, height: 900, borderRadius: '50%', right: -320 + Math.cos(t * 0.3) * 80, top: 900 + Math.sin(t * 0.4) * 90, background: C.blue, opacity: 0.1, filter: 'blur(140px)'}} />
		</AbsoluteFill>
	);
};

const Badge: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path fill={C.badge} d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" />
		<path fill="#fff" d="M9.9 16.3 6.4 12.8l1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4z" />
	</svg>
);

/** Cabeçalho estilo post do X, igual aos carrosséis */
const Header: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const s = springAt(frame, 0.05);
	const out = prog(t, SCENES.cta[0] - 0.1, 0.35, easeInOut);
	return (
		<div style={{position: 'absolute', top: 150, left: 90, display: 'flex', alignItems: 'center', gap: 26, opacity: s * (1 - out), transform: `translateY(${(1 - s) * -40}px)`}}>
			<Img src={staticFile('img/avatar.png')} style={{width: 112, height: 112, borderRadius: '50%'}} />
			<div>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.ink, display: 'flex', alignItems: 'center', gap: 10}}>
					Roger Machado <Badge size={40} />
				</div>
				<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.gray}}>@machadomtds</div>
			</div>
		</div>
	);
};

/** Entrada/saída de cada cena */
const Scene: React.FC<{range: readonly [number, number]; children: React.ReactNode}> = ({range, children}) => {
	const t = useT();
	const [a, b] = range;
	if (t < a - 0.02 || t > b + 0.4) return null;
	const i = prog(t, a, 0.45);
	const o = prog(t, b, 0.3, easeInOut);
	return <AbsoluteFill style={{opacity: i * (1 - o), transform: `translateY(${(1 - i) * 70 - o * 50}px) scale(${1 - o * 0.04})`}}>{children}</AbsoluteFill>;
};

const Chip: React.FC<{t0: number; children: React.ReactNode; bg?: string; color?: string; top: number}> = ({t0, children, bg = C.navy, color = '#fff', top}) => {
	const frame = useCurrentFrame();
	const s = springAt(frame, t0);
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 3, background: bg, color, borderRadius: 60, padding: '16px 34px', transform: `scale(${s})`, opacity: Math.min(1, s * 1.5)}}>{children}</div>
		</div>
	);
};

const Lbl: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = '#8B95C9'}) => (
	<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 4, color, textTransform: 'uppercase'}}>{children}</div>
);

// ---------------------------------------------------------------- cenas

const tDesistiu = wordAt('desistiu');

const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const card = springAt(frame, 0.3, {damping: 15});
	const stamp = springAt(frame, tDesistiu - 0.05, {damping: 11, stiffness: 220});
	const since = t - (tDesistiu - 0.05);
	const shake = since > 0 && since < 0.45 ? Math.sin(since * 70) * 18 * (1 - since / 0.45) : 0;
	const strike = prog(t, tDesistiu - 0.05, 0.25);
	const flash = since > 0 ? Math.max(0, 1 - since / 0.35) : 0;
	return (
		<Scene range={SCENES.hook}>
			<Chip t0={0.15} top={360} bg="#FDECE7" color={C.coral}>🔥 BREAKING</Chip>
			<div style={{position: 'absolute', top: 500, left: 90, width: 900, height: 560, borderRadius: 44, background: cardBg, padding: 60, boxShadow: '0 40px 80px rgba(11,16,34,.25)', transform: `translateY(${(1 - card) * 160}px) translateX(${shake}px)`, opacity: Math.min(1, card * 1.4), overflow: 'hidden'}}>
				<Lbl>Próximo modelo da OpenAI</Lbl>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 132, lineHeight: 1, color: '#fff', marginTop: 34, letterSpacing: -3}}>GPT-6.1</div>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 132, lineHeight: 1.05, color: C.blueLight, letterSpacing: -3}}>Astra</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 44}}>
					<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: '#AAB3E0'}}>Lançamento previsto</span>
					<span style={{position: 'relative', fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#fff', background: C.blue, borderRadius: 14, padding: '10px 22px'}}>
						OUTUBRO
						<span style={{position: 'absolute', left: 10, top: '50%', height: 6, width: `${strike * 88}%`, background: C.red, borderRadius: 3}} />
					</span>
				</div>
				<AbsoluteFill style={{background: C.red, opacity: flash * 0.35}} />
			</div>
			<div style={{position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 118, color: C.red, border: `12px solid ${C.red}`, borderRadius: 26, padding: '6px 36px', background: 'rgba(255,255,255,.92)', transform: `rotate(-11deg) scale(${interpolate(stamp, [0, 1], [2.4, 1])})`, opacity: stamp > 0.01 ? Math.min(1, stamp * 2) : 0, letterSpacing: 2}}>
					CANCELADO
				</div>
			</div>
			<div style={{position: 'absolute', top: 1110, left: 90, right: 90, fontFamily: SANS, fontWeight: 500, fontSize: 26, color: C.gray, opacity: prog(t, 1, 0.6)}}>
				Fonte: Washington Post, Gizmodo e Quartz (28/09/2026)
			</div>
		</Scene>
	);
};

const Limites: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const tri = prog(t, 5.6, 0.9, easeInOut);
	const ex = springAt(frame, 6.3);
	const eng = springAt(frame, wordAt('enganou') - 0.1, {damping: 10});
	const pas = springAt(frame, wordAt('passou') - 0.1, {damping: 12});
	const tE = t - wordAt('enganou');
	const glitch = tE > 0 && tE < 0.5 ? (Math.floor(frame / 2) % 2 ? 10 : -10) * (1 - tE / 0.5) : 0;
	const per = 3 * 520;
	return (
		<Scene range={SCENES.limites}>
			<Chip t0={5.45} top={360}>NOS TESTES INTERNOS</Chip>
			<svg width={320} height={290} viewBox="0 0 320 290" style={{position: 'absolute', top: 490, left: 380}}>
				<path d="M160 20 L300 270 L20 270 Z" fill="none" stroke={C.coral} strokeWidth={20} strokeLinejoin="round" strokeDasharray={per} strokeDashoffset={per * (1 - tri)} />
				<g transform={`translate(160 190) scale(${ex}) translate(-160 -190)`}>
					<rect x={148} y={100} width={24} height={100} rx={12} fill={C.coral} />
					<circle cx={160} cy={232} r={15} fill={C.coral} />
				</g>
			</svg>
			<div style={{position: 'absolute', top: 850, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 168, color: C.ink, letterSpacing: -4, transform: `scale(${eng}) translateX(${glitch}px)`, opacity: Math.min(1, eng * 2), textShadow: glitch ? `${-glitch}px 0 ${C.blue}, ${glitch}px 0 ${C.coral}` : 'none'}}>
				ENGANOU
			</div>
			<div style={{position: 'absolute', top: 1060, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.coral, letterSpacing: -1, transform: `translateY(${(1 - pas) * 60}px)`, opacity: Math.min(1, pas * 2)}}>
				E PASSOU DOS LIMITES
			</div>
		</Scene>
	);
};

const FALHAS = [
	{t: wordAt('seguia', 9.5) - 0.15, txt: 'Seguia com tarefas sem pedir permissão'},
	{t: wordAt('não', 11.5) - 0.15, txt: 'Não contava o que tinha feito'},
	{t: 13.5, txt: 'Usava ferramentas externas mesmo quando era inseguro'},
];

const Falhas: React.FC = () => {
	const frame = useCurrentFrame();
	const card = springAt(frame, 9.8, {damping: 15});
	return (
		<Scene range={SCENES.falhas}>
			<div style={{position: 'absolute', top: 380, left: 90, width: 900, height: 900, borderRadius: 44, background: '#000', padding: '64px 56px', transform: `translateY(${(1 - card) * 140}px)`, opacity: Math.min(1, card * 1.4)}}>
				<Lbl color="#8A8A8A">O que os testes encontraram</Lbl>
				{FALHAS.map((f, i) => {
					const s = springAt(frame, f.t, {damping: 11});
					const x = springAt(frame, f.t + 0.05, {damping: 16});
					return (
						<div key={i} style={{display: 'flex', alignItems: 'center', gap: 34, marginTop: 64, paddingBottom: i < 2 ? 56 : 0, borderBottom: i < 2 ? '2px solid #1C1C1C' : 'none'}}>
							<div style={{flex: 'none', width: 92, height: 92, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 50, transform: `scale(${s}) rotate(${(1 - s) * -90}deg)`}}>✕</div>
							<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 48, lineHeight: 1.2, color: '#fff', opacity: x, transform: `translateX(${(1 - x) * -50}px)`}}>{f.txt}</div>
						</div>
					);
				})}
			</div>
		</Scene>
	);
};

const Pausa: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const tP = wordAt('pausou') - 0.15;
	const pb = springAt(frame, tP, {damping: 10});
	const txt = springAt(frame, tP + 0.15, {damping: 15});
	const tAg = wordAt('agente') - 0.3;
	const diag = springAt(frame, tAg, {damping: 15});
	const tDr = wordAt('driblou');
	const dot = prog(t, tDr - 0.1, 1.0, easeInOut);
	const alert = t > tDr + 0.55;
	const blink = alert ? (Math.floor(t * 6) % 2 ? 1 : 0.35) : 0;
	const pulse = 1 + Math.sin(t * 5) * 0.03;
	// caminho do pacote: agente (190,190) → borda (470,190) → chatbot (730,190)
	const dx = interpolate(dot, [0, 1], [190, 730]);
	const dy = 190 - Math.sin(dot * Math.PI) * 60;
	return (
		<Scene range={SCENES.pausa}>
			<div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{width: 210, height: 210, borderRadius: '50%', background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, transform: `scale(${pb * pulse})`, boxShadow: `0 0 0 ${18 + Math.sin(t * 5) * 6}px rgba(224,122,95,.18)`}}>
					<div style={{width: 34, height: 100, borderRadius: 10, background: '#fff'}} />
					<div style={{width: 34, height: 100, borderRadius: 10, background: '#fff'}} />
				</div>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 70, color: C.ink, marginTop: 44, letterSpacing: -1.5, opacity: txt, transform: `translateY(${(1 - txt) * 40}px)`}}>TREINAMENTO PAUSADO</div>
				<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 36, color: C.gray, marginTop: 10, opacity: txt}}>do modelo mais avançado da OpenAI</div>
			</div>
			<div style={{position: 'absolute', top: 960, left: 90, width: 900, height: 400, borderRadius: 40, background: cardBg, opacity: Math.min(1, diag * 1.4), transform: `translateY(${(1 - diag) * 120}px)`, overflow: 'hidden'}}>
				<svg width={900} height={400} viewBox="0 0 900 400">
					<rect x={40} y={60} width={470} height={290} rx={30} fill="none" stroke={alert ? C.red : '#7C8CFF'} strokeOpacity={alert ? blink : 0.8} strokeWidth={5} strokeDasharray="18 14" />
					<text x={70} y={110} fill={alert ? C.red : '#8B95C9'} fontFamily={SANS} fontWeight={800} fontSize={24} letterSpacing={3}>REDE RESTRITA</text>
					<circle cx={190} cy={220} r={62} fill={C.blue} />
					<text x={190} y={230} textAnchor="middle" fill="#fff" fontFamily={SANS} fontWeight={800} fontSize={26}>AGENTE</text>
					<rect x={620} y={160} width={230} height={120} rx={24} fill="#ffffff14" stroke="#ffffff33" strokeWidth={2} />
					<text x={735} y={212} textAnchor="middle" fill="#fff" fontFamily={SANS} fontWeight={800} fontSize={24}>CHATBOT</text>
					<text x={735} y={246} textAnchor="middle" fill="#AAB3E0" fontFamily={SANS} fontWeight={600} fontSize={22}>externo</text>
					{dot > 0 && dot < 1 && <circle cx={dx} cy={dy + 30} r={16} fill={C.coral} />}
					{alert && (
						<g opacity={blink}>
							<rect x={560} y={300} width={300} height={56} rx={28} fill={C.red} />
							<text x={710} y={337} textAnchor="middle" fill="#fff" fontFamily={SANS} fontWeight={900} fontSize={26}>⚠ DRIBLOU A REDE</text>
						</g>
					)}
				</svg>
			</div>
		</Scene>
	);
};

const Contador: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const c = prog(t, 23.35, 1.3, easeOut);
	const n = Math.round(c * 15);
	const done = springAt(frame, 24.75, {damping: 11});
	const ring = springAt(frame, 23.15, {damping: 16});
	return (
		<Scene range={SCENES.contador}>
			<Chip t0={23.2} top={360}>DETECTADO EM</Chip>
			<div style={{position: 'absolute', top: 480, left: 190, width: 700, height: 700, transform: `scale(${ring})`}}>
				{[1, 0.72, 0.44].map((k, i) => (
					<div key={i} style={{position: 'absolute', inset: `${(1 - k) * 350}px`, borderRadius: '50%', border: `4px solid ${C.blue}`, opacity: 0.25 + i * 0.1}} />
				))}
				<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from ${t * 240}deg, rgba(79,93,255,.35), rgba(79,93,255,0) 25%)`}} />
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 260, lineHeight: 0.9, color: C.ink, letterSpacing: -8, fontVariantNumeric: 'tabular-nums'}}>{n}</div>
					<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 70, color: C.blue, letterSpacing: 6}}>MIN</div>
				</div>
			</div>
			<div style={{position: 'absolute', top: 1220, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#fff', background: C.blue, borderRadius: 60, padding: '16px 34px', transform: `scale(${done})`}}>✓ Anomalia detectada</div>
			</div>
		</Scene>
	);
};

const Coluna: React.FC<{t0: number; titulo: string; itens: string[]; icon: string; cor: string; black?: boolean; left: number}> = ({t0, titulo, itens, icon, cor, black, left}) => {
	const frame = useCurrentFrame();
	const s = springAt(frame, t0, {damping: 15});
	return (
		<div style={{position: 'absolute', top: 640, left, width: 430, height: 640, borderRadius: 40, background: black ? '#000' : cardBg, padding: '52px 40px', opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 130}px)`}}>
			<Lbl color={black ? '#8A8A8A' : '#8B95C9'}>{titulo}</Lbl>
			{itens.map((it, i) => {
				const k = springAt(frame, t0 + 0.25 + i * 0.22, {damping: 12});
				return (
					<div key={it} style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 50, opacity: Math.min(1, k * 1.5), transform: `translateX(${(1 - k) * -40}px)`}}>
						<div style={{flex: 'none', width: 68, height: 68, borderRadius: '50%', background: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 36, transform: `scale(${k})`}}>{icon}</div>
						<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, color: '#fff'}}>{it}</div>
					</div>
				);
			})}
		</div>
	);
};

const Licao: React.FC = () => {
	const frame = useCurrentFrame();
	const sub = springAt(frame, 26.1, {damping: 15});
	return (
		<Scene range={SCENES.licao}>
			<Chip t0={25.95} top={360} bg="#FDECE7" color={C.coral}>A LIÇÃO</Chip>
			<div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.ink, lineHeight: 1.2, opacity: sub, transform: `translateY(${(1 - sub) * 30}px)`}}>
				Defina os limites da sua IA
			</div>
			<Coluna t0={wordAt('defina') - 0.2} titulo="Pode sozinha" itens={['Pesquisar', 'Resumir', 'Rascunhar']} icon="✓" cor={C.blue} left={90} />
			<Coluna t0={wordAt('precisa') - 0.4} titulo="Só com aprovação" itens={['Pagar', 'Enviar', 'Apagar']} icon="!" cor={C.coral} black left={560} />
		</Scene>
	);
};

const Cta: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const a = springAt(frame, 34.0, {damping: 13});
	const nm = springAt(frame, 34.25, {damping: 15});
	const btn = springAt(frame, 34.5, {damping: 13});
	const tClick = 35.7;
	const press = t > tClick && t < tClick + 0.18 ? 0.9 : 1;
	const done = t >= tClick + 0.1;
	return (
		<Scene range={[SCENES.cta[0], 99]}>
			<div style={{position: 'absolute', top: 430, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{position: 'relative', width: 330, height: 330, transform: `scale(${a})`}}>
					<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from ${t * 120}deg, ${C.coral}, ${C.blue}, ${C.coral})`}} />
					<Img src={staticFile('img/avatar.png')} style={{position: 'absolute', inset: 14, width: 302, height: 302, borderRadius: '50%', border: '8px solid #fff'}} />
				</div>
				<div style={{marginTop: 44, display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 70, color: C.ink, opacity: nm, transform: `translateY(${(1 - nm) * 30}px)`}}>
					Roger Machado <Badge size={62} />
				</div>
				<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 44, color: C.gray, marginTop: 6, opacity: nm}}>@machadomtds</div>
				<div style={{marginTop: 64, width: 440, height: 120, borderRadius: 60, background: done ? '#EFF3F4' : C.blue, color: done ? C.ink : '#fff', border: done ? '3px solid #CFD9DE' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 50, transform: `scale(${btn * press})`, boxShadow: done ? 'none' : '0 20px 50px rgba(79,93,255,.35)'}}>
					{done ? 'Seguindo ✓' : 'Seguir'}
				</div>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 44, color: C.ink, marginTop: 56, opacity: prog(t, 35.9, 0.5)}}>
					Tecnologia <span style={{color: C.coral}}>sem ruído.</span>
				</div>
			</div>
		</Scene>
	);
};

// ---------------------------------------------------------------- legendas

type Group = {words: typeof WORDS; t0: number; t1: number};
const GROUPS: Group[] = (() => {
	const out: Group[] = [];
	let cur: typeof WORDS = [];
	WORDS.forEach((w, i) => {
		cur.push(w);
		const next = WORDS[i + 1];
		const brk = /[,.:]$/.test(w.w) || cur.length >= 3 || !next || next.t0 - w.t1 > 0.2;
		if (brk) {
			out.push({words: cur, t0: cur[0].t0, t1: cur[cur.length - 1].t1});
			cur = [];
		}
	});
	return out;
})();

const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const idx = GROUPS.findIndex((g, i) => t >= g.t0 - 0.05 && t < (GROUPS[i + 1] ? Math.min(GROUPS[i + 1].t0 - 0.05, g.t1 + 0.35) : g.t1 + 0.35));
	if (idx < 0) return null;
	const g = GROUPS[idx];
	const pop = springAt(frame, g.t0 - 0.05, {damping: 14, stiffness: 260});
	return (
		<div style={{position: 'absolute', top: 1430, left: 70, right: 70, display: 'flex', justifyContent: 'center'}}>
			<div style={{background: 'rgba(11,16,34,.94)', borderRadius: 30, padding: '20px 36px', transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 20px', maxWidth: 940}}>
				{g.words.map((w, i) => {
					const on = t >= w.t0 - 0.03 && t < w.t1 + 0.02;
					const said = t >= w.t0 - 0.03;
					return (
						<span key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.25, color: on ? C.coral : said ? '#fff' : 'rgba(255,255,255,.45)', display: 'inline-block', transform: `translateY(${on ? -3 : 0}px)`}}>
							{w.w}
						</span>
					);
				})}
			</div>
		</div>
	);
};

// ---------------------------------------------------------------- som

const SFX: {t: number; f: string; v: number}[] = [
	{t: 0.15, f: 'whoosh_up', v: 0.45},
	{t: 0.35, f: 'pop', v: 0.5},
	{t: tDesistiu - 0.05, f: 'hit_big', v: 0.7},
	{t: SCENES.limites[0], f: 'whoosh_short', v: 0.4},
	{t: 6.3, f: 'pop_hi', v: 0.4},
	{t: wordAt('enganou') - 0.1, f: 'hit', v: 0.6},
	{t: SCENES.falhas[0], f: 'whoosh_short', v: 0.4},
	...FALHAS.map((f) => ({t: f.t, f: 'pop_hi', v: 0.5})),
	{t: SCENES.pausa[0], f: 'whoosh_short', v: 0.4},
	{t: wordAt('pausou') - 0.15, f: 'hit', v: 0.6},
	{t: wordAt('driblou') - 0.1, f: 'riser', v: 0.35},
	{t: wordAt('driblou') + 0.55, f: 'click', v: 0.6},
	{t: SCENES.contador[0], f: 'whoosh_short', v: 0.4},
	...Array.from({length: 15}, (_, i) => ({t: 23.35 + i * 0.085, f: 'tick', v: 0.3})),
	{t: 24.75, f: 'shimmer', v: 0.45},
	{t: SCENES.licao[0], f: 'whoosh_short', v: 0.4},
	{t: wordAt('defina') - 0.2, f: 'pop', v: 0.45},
	{t: wordAt('precisa') - 0.4, f: 'pop', v: 0.45},
	{t: SCENES.cta[0], f: 'whoosh_up', v: 0.45},
	{t: 35.7, f: 'click', v: 0.7},
	{t: 35.85, f: 'shimmer', v: 0.4},
];

export const Reel: React.FC = () => (
	<AbsoluteFill style={{fontFamily: SANS}}>
		<Background />
		<Header />
		<Hook />
		<Limites />
		<Falhas />
		<Pausa />
		<Contador />
		<Licao />
		<Cta />
		<Captions />
		{SFX.map((s, i) => (
			<Sequence key={i} from={Math.max(0, Math.round(s.t * FPS))}>
				<Audio src={staticFile(`sfx/${s.f}.wav`)} volume={s.v} />
			</Sequence>
		))}
		{NARRATION && <Audio src={staticFile(NARRATION)} />}
	</AbsoluteFill>
);

import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {T} from '../camera';
import {C, MONO, SANS, brl, clamp01, easeOut, outlined, prog, springAt} from '../theme';
import {DURATION, FPS, W} from '../timeline';
import {Card, Icon, Label, Scene, Strike, lerp} from './Kit';

const useT = () => {
	const frame = useCurrentFrame();
	return {frame, t: frame / FPS};
};

// ---------------------------------------------------------------------------
// 1. Hook: "Hoje eu vou te ensinar como eu fiz esse valor aqui"
// ---------------------------------------------------------------------------
const TOTAL = 18567.36;

export const Hook: React.FC = () => {
	const {frame, t} = useT();
	const a = springAt(frame, -0.4, {damping: 15, stiffness: 200});
	const b = springAt(frame, T.fiz - 0.25, {damping: 10, stiffness: 190});
	const swap = prog(t, T.valor - 0.18, 0.22);
	const phone = springAt(frame, T.valor - 0.12, {damping: 13, stiffness: 160});
	const lab = springAt(frame, T.valor, {damping: 14});
	const count = prog(t, T.valor + 0.02, 1.1, easeOut);
	const chip = springAt(frame, T.aqui, {damping: 11, stiffness: 220});
	const glow = Math.sin(clamp01((t - T.valor - 1.1) / 0.4) * Math.PI);
	const ring = prog(t, T.aqui - 0.05, 0.45, easeOut);
	const zero = springAt(frame, T.real - 0.04, {damping: 8, stiffness: 300, mass: 0.7});
	return (
		<Scene t0={0} t1={T.sem2 - 0.06}>
			{/* "VOU TE ENSINAR / COMO EU FIZ" */}
			<div style={{position: 'absolute', inset: 0, opacity: 1 - swap, transform: `translateY(${-swap * 80}px)`}}>
				<div style={{position: 'absolute', top: 150, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: C.white, opacity: clamp01(a * 2), transform: `translateY(${(1 - a) * -30}px)`, ...outlined(8)}}>
					VOU TE ENSINAR
				</div>
				{b > 0.001 && (
					<div style={{position: 'absolute', top: 236, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 150, lineHeight: 1, letterSpacing: -4, color: C.orange, transform: `scale(${lerp(b, 0.4, 1)})`, ...outlined(13)}}>
						COMO EU FIZ
					</div>
				)}
			</div>
			{/* proof: the earnings screenshot + the total counting up */}
			{swap > 0 && (
				<>
					<div
						style={{
							position: 'absolute',
							left: 64,
							top: 78,
							width: 330,
							height: 560,
							borderRadius: 44,
							background: '#000',
							padding: 10,
							boxSizing: 'border-box',
							boxShadow: '0 30px 70px rgba(0,0,0,0.55), 0 0 0 4px #000',
							transform: `translateX(${(1 - phone) * -420}px) rotate(${lerp(phone, -18, -4)}deg)`,
						}}
					>
						<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 36, overflow: 'hidden', background: '#fff'}}>
							<Img src={staticFile('img/renda.jpg')} style={{position: 'absolute', left: 0, top: 0, width: '100%'}} />
							{/* highlight ring on the total */}
							<div
								style={{
									position: 'absolute',
									left: 30,
									top: 168,
									width: 250,
									height: 76,
									borderRadius: 22,
									border: `6px solid ${C.green}`,
									opacity: ring,
									transform: `scale(${lerp(ring, 1.5, 1)})`,
								}}
							/>
						</div>
					</div>
					<div style={{position: 'absolute', left: 424, top: 150, width: 620, transform: `translateY(${(1 - lab) * 40}px)`, opacity: clamp01(lab * 2)}}>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: C.white, ...outlined(7)}}>PAGAMENTO TOTAL</div>
						<div style={{display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6, transform: `scale(${1 + 0.06 * glow})`, transformOrigin: '0 50%'}}>
							<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 48, color: C.green, ...outlined(9)}}>R$</span>
							<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 88, letterSpacing: -3, color: C.green, fontVariantNumeric: 'tabular-nums', ...outlined(11)}}>{brl(TOTAL * count)}</span>
						</div>
						{chip > 0.001 && (
							<div
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 12,
									marginTop: 18,
									padding: '12px 26px',
									borderRadius: 40,
									background: C.orange,
									fontFamily: SANS,
									fontWeight: 900,
									fontSize: 36,
									color: C.white,
									boxShadow: '0 0 0 4px #000',
									transform: `scale(${chip})`,
									transformOrigin: '0 50%',
								}}
							>
								<Icon name="bag" size={40} stroke={2.6} />
								COMISSÕES DE AFILIADO
							</div>
						)}
						{zero > 0.001 && (
							<div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 22, transform: `rotate(-4deg) scale(${lerp(zero, 2.2, 1)})`, transformOrigin: '20% 50%', opacity: clamp01(zero * 3)}}>
								<div style={{padding: '2px 18px 6px', border: `7px solid ${C.green}`, borderRadius: 16, background: '#0E0A08', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: C.green, boxShadow: '0 0 0 4px #000'}}>R$ 0</div>
								<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, lineHeight: 1.05, color: C.white, ...outlined(8)}}>
									EM
									<br />
									ANÚNCIOS
								</div>
							</div>
						)}
					</div>
				</>
			)}
		</Scene>
	);
};

// ---------------------------------------------------------------------------
// 2. "sem investir um real em anúncios, sem ficar perdendo tempo indo atrás de produto na Shopee"
// ---------------------------------------------------------------------------
const NoRow: React.FC<{t0: number; y: number; icon: 'megaphone' | 'clock' | 'search'; children: React.ReactNode; strikeAt: number; strikeW: number}> = ({t0, y, icon, children, strikeAt, strikeW}) => {
	const {frame, t} = useT();
	if (t < t0 - 0.02) return null;
	const s = springAt(frame, t0, {damping: 13, stiffness: 200});
	const x = springAt(frame, strikeAt, {damping: 9, stiffness: 300});
	const st = prog(t, strikeAt, 0.25, easeOut);
	return (
		<div style={{position: 'absolute', left: 40, top: y, width: 820, height: 120, display: 'flex', alignItems: 'center', gap: 26, transform: `translateX(${(1 - s) * -120}px)`, opacity: clamp01(s * 2)}}>
			<div style={{width: 100, height: 100, borderRadius: 28, background: 'rgba(255,90,31,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				<Icon name={icon} size={60} color={C.orange2} />
			</div>
			<div style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: 50, color: C.white, whiteSpace: 'nowrap'}}>
				{children}
				<Strike p={st} w={strikeW} top={30} left={-8} rot={-3} />
			</div>
			<div style={{marginLeft: 'auto', width: 74, height: 74, borderRadius: 37, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${x})`, boxShadow: '0 0 0 4px #000', flexShrink: 0}}>
				<Icon name="x" size={46} stroke={3.4} />
			</div>
		</div>
	);
};

export const Without: React.FC = () => {
	const {frame, t} = useT();
	const card = springAt(frame, T.sem2 - 0.06, {damping: 15, stiffness: 180});
	return (
		<Scene t0={T.sem2 - 0.06} t1={T.eai - 0.02}>
			<Card x={70} y={80} w={940} h={560} s={card} origin="50% 0%">
				<Label style={{position: 'absolute', left: 44, top: 34}}>SEM PRECISAR DE</Label>
				<NoRow t0={T.sem2 - 0.06} y={92} icon="megaphone" strikeAt={T.sem2 + 0.05} strikeW={500}>
					ANÚNCIOS PAGOS
				</NoRow>
				<NoRow t0={T.sem2 + 0.2} y={232} icon="clock" strikeAt={T.tempo + 0.12} strikeW={430}>
					PERDER TEMPO
				</NoRow>
				<NoRow t0={T.produto - 0.25} y={372} icon="search" strikeAt={T.etc - 0.05} strikeW={520}>
					CAÇAR PRODUTO
				</NoRow>
				{t >= T.shopee1 - 0.05 && (
					<div style={{position: 'absolute', left: 166, top: 482, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: C.orange2, opacity: clamp01(springAt(frame, T.shopee1 - 0.05) * 2)}}>na Shopee, um por um…</div>
				)}
			</Card>
		</Scene>
	);
};

// ---------------------------------------------------------------------------
// 3. "E aí, você vai me dizer se valeu a pena ou não" (Instagram-style poll sticker)
// ---------------------------------------------------------------------------
export const Poll: React.FC = () => {
	const {frame, t} = useT();
	const s = springAt(frame, T.eai - 0.02, {damping: 12, stiffness: 170});
	const q = springAt(frame, T.eai + 0.05, {damping: 10, stiffness: 220});
	const tapT = T.nao + 0.2;
	const hand = prog(t, T.nao - 0.35, 0.5, easeOut);
	const tap = t >= tapT ? Math.sin(clamp01((t - tapT) / 0.18) * Math.PI) : 0;
	const fill = prog(t, tapT, 0.35, easeOut);
	return (
		<Scene t0={T.eai - 0.02} t1={T.take2}>
			<div style={{position: 'absolute', left: 150, top: 110, width: 780, height: 470, transform: `rotate(-3deg) scale(${s})`, opacity: clamp01(s * 2)}}>
				<div style={{position: 'absolute', inset: 0, borderRadius: 40, background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,0.5), 0 0 0 5px #000', overflow: 'hidden'}}>
					<div style={{height: 170, background: `linear-gradient(90deg, ${C.orange}, #FF2E63)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 74, color: C.white, transform: `scale(${lerp(q, 0.6, 1)})`, opacity: clamp01(q * 2)}}>VALEU A PENA?</div>
					</div>
					{[
						{txt: 'SIM 🔥', y: 200, on: true},
						{txt: 'NÃO', y: 330, on: false},
					].map((o) => (
						<div key={o.txt} style={{position: 'absolute', left: 40, top: o.y, width: 700, height: 100, borderRadius: 50, background: '#EFEFEF', overflow: 'hidden'}}>
							{o.on && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: C.orange}} />}
							<div style={{position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 50, color: o.on && fill > 0.5 ? C.white : '#222'}}>{o.txt}</div>
						</div>
					))}
				</div>
				{/* tapping finger */}
				<div style={{position: 'absolute', left: 520, top: 260 + (1 - hand) * 300, opacity: hand, transform: `scale(${1 - 0.18 * tap})`}}>
					<div style={{width: 110, height: 110, borderRadius: 55, background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 5px #fff'}}>
						<Icon name="hand" size={70} />
					</div>
				</div>
			</div>
		</Scene>
	);
};

// ---------------------------------------------------------------------------
// 4. "Primeira coisa que eu fiz, eu baixei essa ferramenta que é a Empire Live, o link tá na bio"
// ---------------------------------------------------------------------------
export const EmpireLogo: React.FC<{size: number; spin: number; glow?: number}> = ({size, spin, glow = 0}) => (
	<div style={{width: size, height: size, perspective: 1400}}>
		<div
			style={{
				width: '100%',
				height: '100%',
				borderRadius: size * 0.12,
				overflow: 'hidden',
				transform: `rotateY(${spin}deg)`,
				boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 5px #000, 0 0 ${60 + 80 * glow}px rgba(255,90,31,${0.35 + 0.4 * glow})`,
			}}
		>
			<Img src={staticFile('img/empire.jpg')} style={{width: '100%', height: '100%'}} />
			{/* specular sweep */}
			<div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${30 + spin * 0.2}%, rgba(255,255,255,0.35) ${42 + spin * 0.2}%, transparent ${54 + spin * 0.2}%)`}} />
		</div>
	</div>
);

export const Tool: React.FC = () => {
	const {frame, t} = useT();
	const badge = springAt(frame, T.take2 + 0.02, {damping: 11, stiffness: 220});
	const dl = springAt(frame, T.baixei - 0.1, {damping: 13, stiffness: 190});
	const p = prog(t, T.baixei, 0.85, easeOut);
	const toLogo = prog(t, T.empire - 0.25, 0.2);
	const logo = springAt(frame, T.empire - 0.12, {damping: 12, stiffness: 120});
	const spin = interpolate(logo, [0, 1], [-75, 0]) + 6 * Math.sin(t * 1.6);
	const glow = Math.sin(clamp01((t - T.empire) / 0.6) * Math.PI);
	const link = springAt(frame, T.link - 0.08, {damping: 10, stiffness: 230});
	const bob = Math.sin(Math.max(0, t - T.link) * 7) * 10;
	return (
		<Scene t0={T.take2} t1={T.entrar - 0.22}>
			{/* PASSO 1 */}
			<div style={{position: 'absolute', left: 70, top: 70, padding: '10px 26px', borderRadius: 30, background: C.white, fontFamily: SANS, fontWeight: 900, fontSize: 36, color: C.black, boxShadow: '0 0 0 4px #000', transform: `scale(${badge})`, transformOrigin: '0 50%', opacity: 1 - toLogo * 0}}>
				PASSO 1
			</div>
			{/* download bar */}
			{toLogo < 1 && (
				<div style={{opacity: 1 - toLogo, transform: `scale(${1 - 0.2 * toLogo})`}}>
					<Card x={140} y={210} w={800} h={250} s={dl}>
						<div style={{position: 'absolute', left: 40, top: 40, display: 'flex', alignItems: 'center', gap: 22}}>
							<div style={{width: 84, height: 84, borderRadius: 24, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${Math.sin(p * Math.PI * 3) * 4}px)`}}>
								<Icon name={p >= 1 ? 'check' : 'download'} size={52} stroke={3} />
							</div>
							<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 48, color: C.white}}>{p >= 1 ? 'FERRAMENTA PRONTA' : 'BAIXANDO…'}</div>
						</div>
						<div style={{position: 'absolute', left: 40, right: 40, top: 160, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
							<div style={{width: `${p * 100}%`, height: '100%', borderRadius: 17, background: `linear-gradient(90deg, ${C.orange}, ${C.gold})`}} />
						</div>
						<div style={{position: 'absolute', right: 40, top: 104, fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.orange2}}>{Math.round(p * 100)}%</div>
					</Card>
				</div>
			)}
			{/* the Empire Live logo */}
			{logo > 0.001 && (
				<div style={{position: 'absolute', left: W / 2 - 215, top: 66, transform: `scale(${lerp(logo, 0.3, 1)})`, opacity: clamp01(logo * 3)}}>
					<EmpireLogo size={430} spin={spin} glow={glow} />
				</div>
			)}
			{/* LINK NA BIO */}
			{link > 0.001 && (
				<div style={{position: 'absolute', left: 0, width: W, top: 530, display: 'flex', justifyContent: 'center', transform: `translateY(${bob}px)`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 34px', borderRadius: 50, background: C.white, boxShadow: '0 0 0 5px #000, 0 20px 40px rgba(0,0,0,0.4)', transform: `scale(${link})`, fontFamily: SANS, fontWeight: 900, fontSize: 46, color: C.black}}>
						<Icon name="link" size={46} color={C.orange} stroke={3} />
						LINK NA BIO
						<Icon name="arrowUp" size={44} color={C.black} stroke={3.2} />
					</div>
				</div>
			)}
		</Scene>
	);
};

// ---------------------------------------------------------------------------
// 5. "Você vai entrar, conectar suas contas nela e ela vai te explicar tudo"
// ---------------------------------------------------------------------------
export const Steps: React.FC = () => {
	const {frame, t} = useT();
	const card = springAt(frame, T.entrar - 0.2, {damping: 15, stiffness: 180});
	const nodes = [
		{at: T.entrar - 0.1, icon: 'login' as const, label: ['ENTRAR', 'NA FERRAMENTA']},
		{at: T.conectar - 0.08, icon: 'plug' as const, label: ['CONECTAR', 'SUAS CONTAS']},
		{at: T.explicar - 0.1, icon: 'book' as const, label: ['ELA TE', 'EXPLICA TUDO']},
	];
	const xs = [190, 470, 750];
	return (
		<Scene t0={T.entrar - 0.2} t1={T.live - 0.55}>
			<Card x={70} y={90} w={940} h={520} s={card} origin="50% 0%">
				<Label style={{position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center'}}>COMO FUNCIONA</Label>
				{/* progress line */}
				<div style={{position: 'absolute', left: xs[0], top: 205, width: xs[2] - xs[0], height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.1)'}}>
					<div
						style={{
							width: `${(prog(t, nodes[0].at + 0.1, nodes[1].at - nodes[0].at, easeOut) * 0.5 + prog(t, nodes[1].at + 0.1, nodes[2].at - nodes[1].at, easeOut) * 0.5) * 100}%`,
							height: '100%',
							borderRadius: 5,
							background: `linear-gradient(90deg, ${C.orange}, ${C.gold})`,
						}}
					/>
				</div>
				{nodes.map((n, i) => {
					const s = springAt(frame, n.at, {damping: 10, stiffness: 220});
					const done = t > (nodes[i + 1]?.at ?? Infinity);
					const active = s > 0.01 && !done;
					return (
						<div key={i} style={{position: 'absolute', left: xs[i] - 70 - 70, top: 120, width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clamp01(s * 2), transform: `translateY(${(1 - s) * 40}px)`}}>
							<div
								style={{
									width: 180,
									height: 180,
									borderRadius: 90,
									background: done ? C.green : C.orange,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									boxShadow: `0 0 0 6px #000, 0 0 ${active ? 50 : 0}px rgba(255,90,31,0.7)`,
									transform: `scale(${lerp(s, 0.4, 1) * (active ? 1 + 0.04 * Math.sin(t * 8) : 1)})`,
								}}
							>
								<Icon name={done ? 'check' : n.icon} size={92} stroke={2.6} color={done ? C.black : C.white} />
							</div>
							<div style={{marginTop: 24, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 38, lineHeight: 1.1, color: C.white}}>{n.label[0]}</div>
							<div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 28, lineHeight: 1.2, color: C.orange2}}>{n.label[1]}</div>
						</div>
					);
				})}
				<div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: 'rgba(255,255,255,0.55)', opacity: prog(t, T.fazer1 - 0.3, 0.3)}}>
					SEM COMPLICAÇÃO
				</div>
			</Card>
		</Scene>
	);
};

// ---------------------------------------------------------------------------
// 6. "vai ficar fazendo live dos produtos automático, ela acha os melhores produtos"
// ---------------------------------------------------------------------------
const PRODUCTS = [
	{name: 'Fone Bluetooth', hue: '#3D7BFF', stars: 4.9},
	{name: 'Garrafa Térmica', hue: '#2BE38B', stars: 4.8},
	{name: 'Luminária LED', hue: '#FFC23D', stars: 4.8},
];

export const Live: React.FC = () => {
	const {frame, t} = useT();
	const card = springAt(frame, T.live - 0.5, {damping: 15, stiffness: 180});
	const on = prog(t, T.automatico, 0.25, easeOut);
	const scan = prog(t, T.acha, 0.9);
	const viewers = Math.round(interpolate(t, [T.live - 0.4, T.pronto], [12, 1480], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x}));
	return (
		<Scene t0={T.live - 0.5} t1={T.pronto - 0.05}>
			<Card x={70} y={84} w={940} h={540} s={card} origin="50% 0%">
				{/* top bar */}
				<div style={{position: 'absolute', left: 36, top: 34, display: 'flex', alignItems: 'center', gap: 16}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px', borderRadius: 14, background: C.red, fontFamily: SANS, fontWeight: 900, fontSize: 34, color: C.white}}>
						<div style={{width: 18, height: 18, borderRadius: 9, background: C.white, opacity: 0.5 + 0.5 * Math.sin(t * 9)}} />
						AO VIVO
					</div>
					<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.8)'}}>👁 {viewers.toLocaleString('pt-BR')}</div>
				</div>
				{/* automatic toggle */}
				<div style={{position: 'absolute', right: 36, top: 30, display: 'flex', alignItems: 'center', gap: 16}}>
					<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 32, color: on > 0.5 ? C.green : 'rgba(255,255,255,0.6)'}}>AUTOMÁTICO</div>
					<div style={{width: 110, height: 60, borderRadius: 30, background: on > 0.5 ? C.green : 'rgba(255,255,255,0.18)', position: 'relative', boxShadow: on > 0.5 ? `0 0 ${30 * on}px ${C.green}` : 'none'}}>
						<div style={{position: 'absolute', top: 6, left: 6 + 50 * on, width: 48, height: 48, borderRadius: 24, background: C.white}} />
					</div>
				</div>
				{/* products */}
				{PRODUCTS.map((p, i) => {
					const s = springAt(frame, T.live + 0.15 + i * 0.18, {damping: 12, stiffness: 200});
					const top = springAt(frame, T.melhores + i * 0.12, {damping: 9, stiffness: 260});
					const lit = scan > i / 3 && scan > 0;
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: 36 + i * 296,
								top: 130,
								width: 276,
								height: 370,
								borderRadius: 28,
								background: '#fff',
								overflow: 'hidden',
								transform: `translateY(${(1 - s) * 80}px) scale(${1 + 0.04 * top})`,
								opacity: clamp01(s * 2),
								boxShadow: lit ? `0 0 0 6px ${C.orange}` : '0 0 0 2px rgba(255,255,255,0.1)',
							}}
						>
							<div style={{height: 210, background: `radial-gradient(circle at 50% 45%, ${p.hue}55, ${p.hue}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name="bag" size={120} color={p.hue} stroke={1.8} />
							</div>
							<div style={{padding: '14px 18px', fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#222', lineHeight: 1.15}}>{p.name}</div>
							<div style={{paddingLeft: 18, display: 'flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#444'}}>
								<Icon name="star" size={28} color={C.gold} stroke={2.4} /> {p.stars.toFixed(1).replace('.', ',')}
							</div>
							{top > 0.001 && (
								<div style={{position: 'absolute', right: 12, top: 12, padding: '6px 16px', borderRadius: 14, background: C.orange, fontFamily: SANS, fontWeight: 900, fontSize: 28, color: C.white, transform: `scale(${top}) rotate(6deg)`, boxShadow: '0 0 0 3px #000'}}>
									TOP {i + 1}
								</div>
							)}
							{/* scanning beam */}
							{scan > 0 && scan < 1 && <div style={{position: 'absolute', left: 0, right: 0, top: `${((scan * 3 - i) % 1) * 100}%`, height: 8, background: C.orange, opacity: scan * 3 > i && scan * 3 < i + 1 ? 0.8 : 0, boxShadow: `0 0 24px ${C.orange}`}} />}
						</div>
					);
				})}
			</Card>
		</Scene>
	);
};

// ---------------------------------------------------------------------------
// 7. "E pronto, você já tá vendendo como afiliado na Shopee ou Mercado Livre ou TikTok"
// ---------------------------------------------------------------------------
const PLATFORMS = [
	{name: 'SHOPEE', bg: '#EE4D2D', fg: '#fff'},
	{name: 'MERCADO LIVRE', bg: '#FFE600', fg: '#2D3277'},
	{name: 'TIKTOK', bg: '#000', fg: '#fff'},
];

const Toast: React.FC<{t0: number; y: number; title: string; sub: string}> = ({t0, y, title, sub}) => {
	const {frame, t} = useT();
	if (t < t0 - 0.02) return null;
	const s = springAt(frame, t0, {damping: 13, stiffness: 200});
	return (
		<div style={{position: 'absolute', left: 120, top: y, width: 840, height: 112, borderRadius: 30, background: 'rgba(255,255,255,0.96)', boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 4px #000', display: 'flex', alignItems: 'center', gap: 22, padding: '0 26px', boxSizing: 'border-box', transform: `translateY(${(1 - s) * -120}px) scale(${lerp(s, 0.9, 1)})`, opacity: clamp01(s * 2)}}>
			<div style={{width: 70, height: 70, borderRadius: 20, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name="bell" size={44} stroke={2.6} />
			</div>
			<div>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 36, color: '#111'}}>{title}</div>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: '#666'}}>{sub}</div>
			</div>
			<div style={{marginLeft: 'auto', fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#999'}}>agora</div>
		</div>
	);
};

export const Platforms: React.FC = () => {
	const {frame, t} = useT();
	const ok = springAt(frame, T.pronto - 0.05, {damping: 9, stiffness: 260});
	const okOut = prog(t, T.vendendo - 0.2, 0.2);
	const ats = [T.shopee2, T.mercado, T.tiktok];
	const merge = prog(t, T.tres - 0.05, 0.45);
	const three = springAt(frame, T.tres + 0.25, {damping: 9, stiffness: 240});
	return (
		<Scene t0={T.pronto - 0.05} t1={T.melhor - 0.15}>
			{/* PRONTO ✓ */}
			{okOut < 1 && (
				<div style={{position: 'absolute', left: 0, width: W, top: 180, display: 'flex', justifyContent: 'center', opacity: 1 - okOut}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 44px', borderRadius: 60, background: C.green, boxShadow: '0 0 0 6px #000', transform: `scale(${lerp(ok, 1.5, 1)}) rotate(-4deg)`, opacity: clamp01(ok * 3), fontFamily: SANS, fontWeight: 900, fontSize: 92, color: C.black}}>
						<Icon name="check" size={92} color={C.black} stroke={3.6} />
						PRONTO
					</div>
				</div>
			)}
			{/* sales notifications */}
			<div style={{opacity: 1 - merge}}>
				<Toast t0={T.vendendo - 0.05} y={70} title="Nova venda! 🎉" sub="Comissão de afiliado" />
				<Toast t0={T.afiliado + 0.1} y={200} title="Nova venda! 🎉" sub="Pedido via sua live" />
			</div>
			{/* the three marketplaces */}
			{PLATFORMS.map((p, i) => {
				const s = springAt(frame, ats[i] - 0.06, {damping: 10, stiffness: 240});
				if (s < 0.001) return null;
				const x0 = [70, 330, 760][i];
				const w = [240, 410, 250][i];
				const x = lerp(merge, x0, W / 2 - w / 2);
				const y = lerp(merge, 360, 250);
				return (
					<div
						key={p.name}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: w,
							height: 100,
							borderRadius: 26,
							background: p.bg,
							color: p.fg,
							fontFamily: SANS,
							fontWeight: 900,
							fontSize: 40,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: i === 2 ? '-4px -3px 0 #25F4EE, 4px 3px 0 #FE2C55, 0 0 0 4px #000' : '0 0 0 4px #000',
							transform: `scale(${lerp(s, 0.3, 1) * (1 - 0.6 * merge)}) rotate(${(1 - s) * 20}deg)`,
							opacity: clamp01(s * 2) * (1 - merge),
						}}
					>
						{p.name}
					</div>
				);
			})}
			{/* 3 EM 1 */}
			{three > 0.001 && (
				<div style={{position: 'absolute', left: 0, width: W, top: 120, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 200, lineHeight: 1, letterSpacing: -6, color: C.orange, transform: `scale(${lerp(three, 0.3, 1)})`, ...outlined(14)}}>3 EM 1</div>
					<div style={{display: 'flex', gap: 14, marginTop: 20, opacity: clamp01(three * 2)}}>
						{PLATFORMS.map((p) => (
							<div key={p.name} style={{padding: '8px 18px', borderRadius: 16, background: p.bg, color: p.fg, fontFamily: SANS, fontWeight: 900, fontSize: 28, boxShadow: '0 0 0 3px #000'}}>
								{p.name}
							</div>
						))}
					</div>
				</div>
			)}
		</Scene>
	);
};

// ---------------------------------------------------------------------------
// 8. "é a melhor coisa que vocês podem fazer no momento" → CTA until the end
// ---------------------------------------------------------------------------
export const Cta: React.FC = () => {
	const {frame, t} = useT();
	const end = DURATION / FPS;
	const logo = springAt(frame, T.melhor - 0.15, {damping: 12, stiffness: 140});
	const spin = interpolate(logo, [0, 1], [75, 0]) + 5 * Math.sin(t * 1.8);
	const pill = springAt(frame, T.momento2 - 0.1, {damping: 10, stiffness: 230});
	const bob = Math.sin(Math.max(0, t - T.momento2) * 7) * 9;
	if (t < T.melhor - 0.17) return null;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - prog(t, end - 0.12, 0.12)}}>
			<div style={{position: 'absolute', left: 80, top: 96, transform: `scale(${lerp(logo, 0.3, 1)})`, opacity: clamp01(logo * 3)}}>
				<EmpireLogo size={360} spin={spin} glow={0.6 + 0.4 * Math.sin(t * 3)} />
			</div>
			<div style={{position: 'absolute', left: 480, top: 120, width: 540, opacity: clamp01(logo * 2), transform: `translateX(${(1 - logo) * 120}px)`}}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 50, lineHeight: 1.05, color: C.white, ...outlined(9)}}>A MELHOR COISA</div>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 50, lineHeight: 1.05, color: C.white, ...outlined(9)}}>PRA FAZER</div>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 50, lineHeight: 1.05, color: C.orange, ...outlined(9)}}>NO MOMENTO</div>
				{pill > 0.001 && (
					<div style={{display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 28, padding: '14px 28px', borderRadius: 50, background: C.white, boxShadow: '0 0 0 5px #000', transform: `translateY(${bob}px) scale(${pill})`, transformOrigin: '0 50%', fontFamily: SANS, fontWeight: 900, fontSize: 42, color: C.black}}>
						<Icon name="link" size={42} color={C.orange} stroke={3} />
						LINK NA BIO
						<Icon name="arrowUp" size={40} color={C.black} stroke={3.2} />
					</div>
				)}
			</div>
		</div>
	);
};

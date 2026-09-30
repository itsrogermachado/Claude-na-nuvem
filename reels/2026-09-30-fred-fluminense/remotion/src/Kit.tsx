import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, FPS, H, SANS, SERIF, W, WORDS, clamp01, easeOut, prog, springAt} from './lib';

/** Cinematic dark background: navy gradient, drifting light, faint pitch lines and grain */
export const Bg: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	return (
		<div style={{position: 'absolute', inset: 0, background: `radial-gradient(120% 80% at 50% 38%, ${C.navy} 0%, ${C.bg} 70%)`, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: -400 + Math.sin(t * 0.25) * 200,
					top: 200 + Math.cos(t * 0.2) * 150,
					width: 1600,
					height: 900,
					borderRadius: '50%',
					background: 'radial-gradient(closest-side, rgba(142,27,58,0.28), rgba(142,27,58,0))',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: -200 + Math.cos(t * 0.22) * 200,
					top: 1000 + Math.sin(t * 0.18) * 160,
					width: 1500,
					height: 900,
					borderRadius: '50%',
					background: 'radial-gradient(closest-side, rgba(14,122,69,0.22), rgba(14,122,69,0))',
				}}
			/>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.07}}>
				<rect x={90} y={260} width={900} height={1400} fill="none" stroke="#fff" strokeWidth={3} />
				<line x1={90} y1={960} x2={990} y2={960} stroke="#fff" strokeWidth={3} />
				<circle cx={540} cy={960} r={150} fill="none" stroke="#fff" strokeWidth={3} />
				<rect x={330} y={260} width={420} height={220} fill="none" stroke="#fff" strokeWidth={3} />
				<rect x={330} y={1440} width={420} height={220} fill="none" stroke="#fff" strokeWidth={3} />
			</svg>
			<div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 260px 60px rgba(0,0,0,0.85)'}} />
		</div>
	);
};

/** Framed photo with Ken Burns drift; enters with a spring */
export const Photo: React.FC<{
	src: string;
	t0: number;
	t1: number;
	x: number;
	y: number;
	w: number;
	h: number;
	pos?: string;
	rot?: number;
	zoom?: [number, number];
	gray?: number;
	from?: 'up' | 'down' | 'left' | 'right' | 'scale';
	border?: string;
	radius?: number;
}> = ({src, t0, t1, x, y, w: ww, h: hh, pos = '50% 40%', rot = 0, zoom = [1.04, 1.14], gray = 0, from = 'scale', border = 'rgba(255,255,255,0.9)', radius = 26}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < t0 - 0.02) return null;
	const s = springAt(frame, t0, {damping: 15, stiffness: 150});
	const z = interpolate(t, [t0, t1], zoom, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const off = (1 - s) * 180;
	const tr =
		from === 'up' ? `translateY(${-off}px)` : from === 'down' ? `translateY(${off}px)` : from === 'left' ? `translateX(${-off * 1.6}px)` : from === 'right' ? `translateX(${off * 1.6}px)` : `scale(${interpolate(s, [0, 1], [0.82, 1])})`;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: ww,
				height: hh,
				borderRadius: radius,
				overflow: 'hidden',
				border: `5px solid ${border}`,
				boxShadow: '0 40px 90px rgba(0,0,0,0.7)',
				transform: `${tr} rotate(${rot}deg)`,
				opacity: clamp01(s * 2),
			}}
		>
			<Img
				src={staticFile(`img/${src}`)}
				style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${z})`, filter: gray ? `grayscale(${gray}) contrast(1.1) brightness(0.8)` : undefined}}
			/>
		</div>
	);
};

/** Big condensed headline with an optional italic serif accent word (the channel's typographic signature) */
export const Title: React.FC<{t0: number; top: number; big: string; accent?: string; size?: number; color?: string; accentColor?: string; accentFirst?: boolean}> = ({
	t0,
	top,
	big,
	accent,
	size = 150,
	color = C.white,
	accentColor = C.white,
	accentFirst = false,
}) => {
	const frame = useCurrentFrame();
	if (frame / FPS < t0 - 0.02) return null;
	const s = springAt(frame, t0, {damping: 11, stiffness: 200});
	const acc = springAt(frame, t0 + 0.12, {damping: 12, stiffness: 180});
	const accentEl = accent ? (
		<div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: size * 0.52, color: accentColor, lineHeight: 1, marginTop: accentFirst ? 0 : -size * 0.08, marginBottom: accentFirst ? -size * 0.06 : 0, transform: `translateY(${(1 - acc) * 30}px)`, opacity: clamp01(acc * 2), textShadow: '0 6px 24px rgba(0,0,0,0.6)'}}>
			{accent}
		</div>
	) : null;
	return (
		<div style={{position: 'absolute', top, left: 0, width: W, textAlign: 'center'}}>
			{accentFirst && accentEl}
			<div style={{fontFamily: DISPLAY, fontSize: size, lineHeight: 1, color, letterSpacing: 1, transform: `scale(${interpolate(s, [0, 1], [1.4, 1])})`, opacity: clamp01(s * 2), textShadow: '0 10px 40px rgba(0,0,0,0.65)'}}>{big}</div>
			{!accentFirst && accentEl}
		</div>
	);
};

/** Red rubber-stamp word that slams in */
export const Stamp: React.FC<{t0: number; text: string; x: number; y: number; rot?: number; size?: number; color?: string}> = ({t0, text, x, y, rot = -8, size = 150, color = C.red}) => {
	const frame = useCurrentFrame();
	if (frame / FPS < t0 - 0.02) return null;
	const s = springAt(frame, t0, {damping: 9, stiffness: 320, mass: 0.7});
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${interpolate(s, [0, 1], [2.6, 1])})`,
				opacity: clamp01(s * 3),
				padding: '6px 34px 14px',
				border: `10px solid ${color}`,
				borderRadius: 18,
				fontFamily: DISPLAY,
				fontSize: size,
				lineHeight: 1,
				color,
				background: 'rgba(0,0,0,0.35)',
				textShadow: '0 6px 30px rgba(0,0,0,0.5)',
				whiteSpace: 'nowrap',
			}}
		>
			{text}
		</div>
	);
};

export const Crest: React.FC<{t0: number; x: number; y: number; size: number; glow?: boolean}> = ({t0, x, y, size, glow = true}) => {
	const frame = useCurrentFrame();
	if (frame / FPS < t0 - 0.02) return null;
	const s = springAt(frame, t0, {damping: 10, stiffness: 160});
	const t = frame / FPS;
	return (
		<div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${s}) rotate(${(1 - s) * -25}deg)`}}>
			{glow && <div style={{position: 'absolute', inset: -size * 0.3, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(194,41,79,${0.35 + 0.1 * Math.sin(t * 3)}), rgba(194,41,79,0))`}} />}
			<Img src={staticFile('img/escudo_flu.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))'}} />
		</div>
	);
};

/** Ranking table (e.g. all-time scorers); the highlighted row pops in last */
export const Ranking: React.FC<{t0: number; top: number; title: string; sub: string; rows: {pos: number; name: string; value: number; hl?: boolean; at?: number}[]}> = ({t0, top, title, sub, rows}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < t0 - 0.02) return null;
	const head = springAt(frame, t0, {damping: 14});
	return (
		<div style={{position: 'absolute', left: 90, top, width: 900}}>
			<div style={{opacity: clamp01(head * 2), transform: `translateY(${(1 - head) * -30}px)`}}>
				<div style={{fontFamily: DISPLAY, fontSize: title.length > 26 ? 64 : 76, color: C.white, lineHeight: 1, whiteSpace: 'nowrap'}}>{title}</div>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 44, color: C.gold, marginTop: 6}}>{sub}</div>
			</div>
			<div style={{marginTop: 34, display: 'flex', flexDirection: 'column', gap: 18}}>
				{rows.map((r, i) => {
					const at = r.at ?? t0 + 0.25 + i * 0.18;
					if (t < at - 0.02) return <div key={i} style={{height: 118}} />;
					const s = springAt(frame, at, {damping: 13, stiffness: 190});
					const val = Math.round(r.value * prog(t, at, 0.7, easeOut));
					return (
						<div
							key={i}
							style={{
								height: 118,
								borderRadius: 22,
								display: 'flex',
								alignItems: 'center',
								padding: '0 34px',
								gap: 30,
								background: r.hl ? `linear-gradient(90deg, ${C.grena}, ${C.verde})` : 'rgba(255,255,255,0.08)',
								border: r.hl ? `4px solid ${C.gold}` : '2px solid rgba(255,255,255,0.12)',
								boxShadow: r.hl ? '0 20px 50px rgba(142,27,58,0.55)' : 'none',
								transform: `translateX(${(1 - s) * 400}px) scale(${r.hl ? 1 + 0.04 * Math.sin(clamp01((t - at) / 0.4) * Math.PI) : 1})`,
								opacity: clamp01(s * 2),
							}}
						>
							<div style={{fontFamily: DISPLAY, fontSize: 64, color: r.hl ? C.gold : C.mute, width: 70}}>{r.pos}º</div>
							<div style={{flex: 1, fontFamily: SANS, fontWeight: 900, fontSize: 50, color: C.white}}>{r.name}</div>
							<div style={{fontFamily: DISPLAY, fontSize: 76, color: r.hl ? C.white : C.mute}}>{val}</div>
							<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.mute, marginLeft: -18, marginTop: 22}}>gols</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

const Flag: React.FC<{team: 'bra' | 'esp' | 'ita'; size: number}> = ({team, size}) => {
	const h = size * 0.68;
	if (team === 'bra')
		return (
			<svg width={size} height={h} viewBox="0 0 100 68" style={{borderRadius: 8}}>
				<rect width={100} height={68} fill="#009C3B" />
				<polygon points="50,6 94,34 50,62 6,34" fill="#FFDF00" />
				<circle cx={50} cy={34} r={15} fill="#002776" />
				<path d="M35.5 31 Q50 26 64.5 36" stroke="#fff" strokeWidth={2.4} fill="none" />
			</svg>
		);
	if (team === 'esp')
		return (
			<svg width={size} height={h} viewBox="0 0 100 68" style={{borderRadius: 8}}>
				<rect width={100} height={68} fill="#AA151B" />
				<rect y={17} width={100} height={34} fill="#F1BF00" />
			</svg>
		);
	return (
		<svg width={size} height={h} viewBox="0 0 100 68" style={{borderRadius: 8}}>
			<rect width={34} height={68} fill="#009246" />
			<rect x={33} width={34} height={68} fill="#fff" />
			<rect x={66} width={34} height={68} fill="#CE2B37" />
		</svg>
	);
};

/** Match scoreboard card */
export const Score: React.FC<{t0: number; top: number; away: 'esp' | 'ita'; score: [number, number]; label: string; note: string}> = ({t0, top, away, score, label, note}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < t0 - 0.02) return null;
	const s = springAt(frame, t0, {damping: 13, stiffness: 190});
	const n = springAt(frame, t0 + 0.35, {damping: 12});
	return (
		<div style={{position: 'absolute', left: 90, top, width: 900, transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`, opacity: clamp01(s * 2)}}>
			<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: 4, color: C.gold, textAlign: 'center', marginBottom: 12}}>{label}</div>
			<div style={{height: 190, borderRadius: 30, background: 'rgba(8,12,24,0.92)', border: '3px solid rgba(255,255,255,0.18)', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 46px'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
					<Flag team="bra" size={110} />
					<div style={{fontFamily: DISPLAY, fontSize: 60, color: C.white}}>BRA</div>
				</div>
				<div style={{fontFamily: DISPLAY, fontSize: 130, color: C.white, letterSpacing: 6}}>
					{score[0]}
					<span style={{color: C.mute, fontSize: 80, margin: '0 14px'}}>x</span>
					{score[1]}
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
					<div style={{fontFamily: DISPLAY, fontSize: 60, color: C.white}}>{away.toUpperCase()}</div>
					<Flag team={away} size={110} />
				</div>
			</div>
			<div style={{marginTop: 16, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.white, opacity: clamp01(n * 2), transform: `translateY(${(1 - n) * 20}px)`}}>
				⚽ {note}
			</div>
		</div>
	);
};

export const Trophy: React.FC<{t0: number; x: number; y: number; size: number; year: string}> = ({t0, x, y, size, year}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < t0 - 0.02) return null;
	const s = springAt(frame, t0, {damping: 9, stiffness: 200});
	return (
		<div style={{position: 'absolute', left: x - size / 2, top: y, width: size, textAlign: 'center', transform: `translateY(${(1 - s) * -200}px) scale(${interpolate(s, [0, 1], [0.5, 1])})`, opacity: clamp01(s * 2)}}>
			<svg width={size} height={size * 1.15} viewBox="0 0 100 115">
				<defs>
					<linearGradient id={`g${year}`} x1="0" x2="1">
						<stop offset="0" stopColor="#B8862B" />
						<stop offset="0.45" stopColor="#FFE08A" />
						<stop offset="1" stopColor="#B8862B" />
					</linearGradient>
				</defs>
				<path d="M25 8 H75 V30 C75 52 62 62 50 64 C38 62 25 52 25 30 Z" fill={`url(#g${year})`} />
				<path d="M25 14 C10 14 8 34 26 40 M75 14 C90 14 92 34 74 40" stroke={`url(#g${year})`} strokeWidth={6} fill="none" />
				<rect x={44} y={63} width={12} height={18} fill={`url(#g${year})`} />
				<rect x={30} y={80} width={40} height={10} rx={3} fill={`url(#g${year})`} />
				<rect x={24} y={90} width={52} height={16} rx={4} fill="#2A2A2A" />
				<path d={`M50 ${22 + 0 * t} l4 9 10 1-7.5 6.5 2.3 10-8.8-5.2-8.8 5.2 2.3-10-7.5-6.5 10-1z`} fill="#fff" opacity={0.85} />
			</svg>
			<div style={{fontFamily: DISPLAY, fontSize: size * 0.34, color: C.gold, marginTop: -6}}>{year}</div>
		</div>
	);
};

/** Short lowercase subtitles under the visuals, like the channel's original style */
export const Subtitles: React.FC<{hide?: [number, number][]}> = ({hide = []}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (hide.some(([a, b]) => t >= a && t < b)) return null;
	// chunk words: up to 3 words, break on punctuation / pauses
	const chunks: {start: number; end: number; text: string}[] = [];
	let cur: typeof WORDS = [];
	WORDS.forEach((wd, i) => {
		const prev = WORDS[i - 1];
		if (cur.length && (cur.length >= 3 || /[.,?!]$/.test(prev.w) || wd.s - prev.e > 0.25)) {
			chunks.push({start: cur[0].s, end: cur[cur.length - 1].e, text: cur.map((c) => c.w).join(' ')});
			cur = [];
		}
		cur.push(wd);
	});
	if (cur.length) chunks.push({start: cur[0].s, end: cur[cur.length - 1].e, text: cur.map((c) => c.w).join(' ')});
	const idx = chunks.findIndex((c, i) => t >= c.start - 0.04 && t < (chunks[i + 1] ? chunks[i + 1].start - 0.04 : c.end + 0.5));
	if (idx < 0) return null;
	const c = chunks[idx];
	const s = springAt(frame, c.start - 0.04, {damping: 14, stiffness: 240});
	const text = c.text.replace(/ %/g, '%').replace(/[.,]$/, '').toLowerCase();
	return (
		<div
			style={{
				position: 'absolute',
				top: 1460,
				left: 60,
				width: W - 120,
				textAlign: 'center',
				fontFamily: SANS,
				fontWeight: 900,
				fontSize: 62,
				color: C.white,
				WebkitTextStroke: '8px #000',
				paintOrder: 'stroke fill',
				textShadow: '0 6px 20px rgba(0,0,0,0.6)',
				transform: `translateY(${(1 - s) * 16}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
				opacity: clamp01(s * 2),
			}}
		>
			{text}
		</div>
	);
};

export {easeOut, prog};

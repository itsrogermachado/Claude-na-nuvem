import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {T} from '../camera';
import {C, MONO, SANS, clamp01, easeOut, outlined, prog, springAt} from '../theme';
import {FPS, W} from '../timeline';

const card: React.CSSProperties = {
	background: 'rgba(7,14,10,0.86)',
	border: '2px solid rgba(61,242,154,0.35)',
	borderRadius: 32,
	boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
};

/** "A evolução da IA": a line that draws itself upwards */
export const Evolution: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const t0 = T.evolution - 0.12;
	const t1 = T.splitIn - 0.3;
	if (t < t0 || t > t1 + 0.3) return null;
	const inS = springAt(frame, t0, {damping: 14, stiffness: 170});
	const out = prog(t, t1, 0.26);
	const draw = prog(t, t0 + 0.12, 1.0, easeOut);
	const n = 80;
	const pts: string[] = [];
	for (let i = 0; i <= Math.floor(n * draw); i++) {
		const u = i / n;
		const x = 70 + u * 760;
		const y = 250 - Math.pow(u, 2.3) * 190 - 10 * Math.sin(u * 10) * (1 - u);
		pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
	}
	const last = pts[pts.length - 1]?.split(',').map(Number) ?? [70, 250];
	return (
		<div
			style={{
				position: 'absolute',
				left: (W - 900) / 2,
				top: 190,
				width: 900,
				height: 340,
				...card,
				transform: `translateY(${(1 - inS) * -50 - out * 40}px) scale(${interpolate(inS, [0, 1], [0.92, 1])})`,
				opacity: clamp01(inS * 1.8) * (1 - out),
			}}
		>
			<div style={{position: 'absolute', top: 30, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 52, color: C.white}}>
				A EVOLUÇÃO DA <span style={{color: C.green}}>IA</span>
			</div>
			<svg width={900} height={340} style={{position: 'absolute', left: 0, top: 30}}>
				<line x1={60} y1={262} x2={840} y2={262} stroke="rgba(255,255,255,0.25)" strokeWidth={3} />
				{pts.length > 1 && (
					<>
						<polyline points={pts.join(' ')} fill="none" stroke="rgba(61,242,154,0.35)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
						<polyline points={pts.join(' ')} fill="none" stroke={C.green} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
						<circle cx={last[0]} cy={last[1]} r={15} fill={C.white} stroke={C.green} strokeWidth={6} />
					</>
				)}
			</svg>
		</div>
	);
};

/** "Pesquisa e dá uma olhada": search bar typing monkeycode + a result */
export const SearchBar: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const t0 = T.search - 0.1;
	const t1 = T.cutF - 0.28;
	if (t < t0 || t > t1 + 0.3) return null;
	const inS = springAt(frame, t0, {damping: 13, stiffness: 190});
	const out = prog(t, t1, 0.26);
	const q = 'monkeycode';
	const typed = q.slice(0, Math.floor(q.length * prog(t, t0 + 0.18, 0.55, (x) => x)));
	const caret = typed.length < q.length || Math.floor(t * 3) % 2 === 0;
	const res = springAt(frame, t0 + 0.82, {damping: 12, stiffness: 200});
	const tapT = t0 + 1.12;
	const tap = clamp01((t - tapT) / 0.4);
	const y = 262;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `translateY(${(1 - inS) * -70 - out * 30}px)`}}>
			<div
				style={{
					position: 'absolute',
					left: 90,
					top: y,
					width: 900,
					height: 124,
					borderRadius: 62,
					background: C.white,
					border: `5px solid ${C.green}`,
					boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
					display: 'flex',
					alignItems: 'center',
					paddingLeft: 36,
					boxSizing: 'border-box',
					transform: `scale(${interpolate(inS, [0, 1], [0.9, 1])})`,
				}}
			>
				<svg width={52} height={52} viewBox="0 0 24 24">
					<circle cx={10} cy={10} r={6.5} fill="none" stroke="#1B1B1B" strokeWidth={2.6} />
					<line x1={15} y1={15} x2={21} y2={21} stroke="#1B1B1B" strokeWidth={2.8} strokeLinecap="round" />
				</svg>
				<div style={{marginLeft: 22, fontFamily: MONO, fontWeight: 600, fontSize: 56, color: '#141414'}}>{typed}</div>
				{caret && t < tapT && <div style={{width: 4, height: 60, background: '#141414', marginLeft: 4}} />}
			</div>
			{res > 0.001 && (
				<div
					style={{
						position: 'absolute',
						left: 90,
						top: y + 150,
						width: 900,
						height: 150,
						...card,
						borderRadius: 30,
						display: 'flex',
						alignItems: 'center',
						transform: `translateY(${(1 - res) * -30}px) scale(${interpolate(res, [0, 1], [0.94, 1])})`,
						opacity: clamp01(res * 1.6),
					}}
				>
					<Img src={staticFile('img/logo-light.png')} style={{width: 96, height: 96, marginLeft: 30, borderRadius: 48, background: C.white}} />
					<div style={{marginLeft: 26}}>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.white}}>MonkeyCode AI Platform</div>
						<div style={{fontFamily: MONO, fontSize: 34, color: C.green, marginTop: 4}}>monkeycode-ai.net</div>
					</div>
					{t >= tapT - 0.25 && (
						<div style={{position: 'absolute', left: 820, top: 75}}>
							<div
								style={{
									position: 'absolute',
									left: -(26 + 70 * tap),
									top: -(26 + 70 * tap),
									width: 2 * (26 + 70 * tap),
									height: 2 * (26 + 70 * tap),
									borderRadius: '50%',
									border: `6px solid rgba(255,255,255,${t >= tapT ? 0.9 * (1 - tap) : 0})`,
								}}
							/>
							<div
								style={{
									position: 'absolute',
									left: -24 + (1 - prog(t, tapT - 0.25, 0.25, easeOut)) * 90,
									top: -24 + (1 - prog(t, tapT - 0.25, 0.25, easeOut)) * 110,
									width: 48,
									height: 48,
									borderRadius: 24,
									background: 'rgba(255,255,255,0.85)',
									border: '4px solid rgba(0,0,0,0.5)',
									transform: `scale(${t >= tapT && t < tapT + 0.15 ? 0.82 : 1})`,
								}}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export const LinkPill: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const t0 = T.link - 0.12;
	const t1 = T.cutG - 0.22;
	if (t < t0 || t > t1 + 0.3) return null;
	const inS = springAt(frame, t0, {damping: 10, stiffness: 200});
	const out = prog(t, t1, 0.22);
	const bounce = Math.abs(Math.sin((t - t0) * 6.5)) * 22;
	return (
		<div
			style={{
				position: 'absolute',
				top: 280,
				width: W,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				transform: `scale(${inS * (1 - 0.2 * out)})`,
				opacity: 1 - out,
			}}
		>
			<div
				style={{
					...card,
					border: `4px solid ${C.green}`,
					borderRadius: 64,
					height: 124,
					padding: '0 50px 0 36px',
					display: 'flex',
					alignItems: 'center',
					gap: 22,
					fontFamily: SANS,
					fontWeight: 900,
					fontSize: 56,
					color: C.white,
				}}
			>
				<svg width={62} height={62} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
				</svg>
				LINK NA DESCRIÇÃO
			</div>
			<svg width={80} height={60} style={{marginTop: 18 + bounce}} viewBox="0 0 80 60">
				<polyline points="12,14 40,42 68,14" fill="none" stroke={C.green} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		</div>
	);
};

export const FollowCTA: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const t0 = T.cutG + 0.05;
	if (t < t0) return null;
	const inS = springAt(frame, t0, {damping: 11, stiffness: 190});
	const tapT = T.follow - 0.02;
	const done = t >= tapT + 0.06;
	const press = t >= tapT - 0.05 && t < tapT + 0.2 ? 1 - 0.08 * Math.sin(((t - tapT + 0.05) / 0.25) * Math.PI) : 1;
	const flip = springAt(frame, tapT + 0.06, {damping: 12, stiffness: 240});
	const ripple = clamp01((t - tapT) / 0.45);
	const approach = prog(t, tapT - 0.32, 0.3, easeOut);
	return (
		<div style={{position: 'absolute', top: 300, width: W, display: 'flex', justifyContent: 'center', transform: `scale(${inS * press})`}}>
			<div
				style={{
					position: 'relative',
					height: 128,
					padding: '0 58px 0 46px',
					borderRadius: 64,
					background: done ? C.green : C.white,
					display: 'flex',
					alignItems: 'center',
					gap: 24,
					fontFamily: SANS,
					fontWeight: 900,
					fontSize: 60,
					color: C.black,
					boxShadow: '0 20px 50px rgba(0,0,0,0.35), 0 0 0 4px #000',
				}}
			>
				<svg width={54} height={54} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" style={{transform: done ? `scale(${flip})` : undefined}}>
					{done ? <polyline points="4,12.5 9.5,18 20,6.5" /> : <path d="M12 4v16M4 12h16" />}
				</svg>
				<span style={{...(done ? {} : {})}}>{done ? 'SEGUINDO' : 'SEGUIR'}</span>
				{t >= tapT - 0.32 && t < tapT + 0.6 && (
					<div style={{position: 'absolute', right: 26, bottom: 10}}>
						{t >= tapT && (
							<div
								style={{
									position: 'absolute',
									left: -(30 + 90 * ripple),
									top: -(30 + 90 * ripple),
									width: 2 * (30 + 90 * ripple),
									height: 2 * (30 + 90 * ripple),
									borderRadius: '50%',
									border: `7px solid rgba(255,255,255,${0.9 * (1 - ripple)})`,
								}}
							/>
						)}
						<div
							style={{
								position: 'absolute',
								left: -26 + (1 - approach) * 130,
								top: -26 + (1 - approach) * 150,
								width: 52,
								height: 52,
								borderRadius: 26,
								background: 'rgba(255,255,255,0.85)',
								border: '4px solid rgba(0,0,0,0.55)',
								opacity: 1 - clamp01((t - tapT - 0.3) / 0.3),
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export {outlined};

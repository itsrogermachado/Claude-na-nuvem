import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PANEL_SPLIT, T, layoutWeights, panelHeight} from '../camera';
import {C, MONO, SANS, clamp01, easeOut, prog, springAt} from '../theme';
import {FPS, W} from '../timeline';

/** Brand background: near-black green with a slow grid and a soft glow */
export const DarkBg: React.FC<{t: number; h: number; glowY?: number}> = ({t, h, glowY = 0.55}) => {
	const off = (t * 24) % 64;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, background: C.dark, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					inset: -64,
					backgroundImage:
						'linear-gradient(rgba(61,242,154,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(61,242,154,0.07) 1px, transparent 1px)',
					backgroundSize: '64px 64px',
					transform: `translate(${off}px, ${off * 0.5}px)`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: W * 0.5 - 520,
					top: h * glowY - 420,
					width: 1040,
					height: 840,
					borderRadius: '50%',
					background: 'radial-gradient(closest-side, rgba(40,160,105,0.38), rgba(40,160,105,0))',
				}}
			/>
		</div>
	);
};

const Chip: React.FC<{text: string; t: number; t0: number; y: number}> = ({text, t, t0, y}) => {
	const frame = Math.round(t * FPS);
	const s = springAt(frame, t0, {damping: 12, stiffness: 220});
	if (s < 0.001) return null;
	return (
		<div style={{position: 'absolute', top: y, left: 0, width: W, display: 'flex', justifyContent: 'center'}}>
			<div
				style={{
					background: C.green,
					color: C.black,
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 34,
					padding: '12px 30px',
					borderRadius: 40,
					transform: `scale(${s})`,
					boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
				}}
			>
				{text}
			</div>
		</div>
	);
};

const SitePanel: React.FC<{t: number}> = ({t}) => {
	const frame = Math.round(t * FPS);
	const inS = springAt(frame, T.splitIn + 0.05, {damping: 15, stiffness: 120});
	const kb = prog(t, T.splitIn + 0.35, 3.6);
	const z = interpolate(kb, [0, 1], [1, 1.85]);
	const cx = interpolate(kb, [0, 1], [0.5, 0.69]);
	const cy = interpolate(kb, [0, 1], [0.5, 0.47]);
	const cardW = 960,
		bar = 64,
		imgH = cardW / 1.6;
	return (
		<>
			<Chip text="TESTANDO: CRIAÇÃO DE SITE" t={t} t0={T.criacao - 0.05} y={160} />
			<div
				style={{
					position: 'absolute',
					left: (W - cardW) / 2,
					top: 250,
					width: cardW,
					height: bar + imgH,
					borderRadius: 26,
					overflow: 'hidden',
					background: '#161A18',
					boxShadow: '0 30px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(61,242,154,0.25)',
					transform: `translateY(${(1 - inS) * 90}px) scale(${interpolate(inS, [0, 1], [0.9, 1])})`,
					opacity: clamp01(inS * 1.5),
				}}
			>
				<div style={{height: bar, display: 'flex', alignItems: 'center', paddingLeft: 26, gap: 12}}>
					{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
						<div key={c} style={{width: 20, height: 20, borderRadius: 10, background: c}} />
					))}
					<div
						style={{
							marginLeft: 22,
							flex: 1,
							marginRight: 28,
							height: 38,
							borderRadius: 19,
							background: '#282E2B',
							display: 'flex',
							alignItems: 'center',
							paddingLeft: 24,
							fontFamily: MONO,
							fontSize: 26,
							color: '#D2E6DC',
						}}
					>
						monkeycode-ai.net
					</div>
				</div>
				<div style={{position: 'relative', width: cardW, height: imgH, overflow: 'hidden'}}>
					<Img
						src={staticFile('img/site_desktop.png')}
						style={{
							position: 'absolute',
							width: cardW * z,
							height: imgH * z,
							left: cardW / 2 - cardW * z * cx,
							top: imgH / 2 - imgH * z * cy,
							maxWidth: 'none',
						}}
					/>
				</div>
			</div>
		</>
	);
};

const fmt = (n: number) => n.toLocaleString('pt-BR');

const TokensPanel: React.FC<{t: number}> = ({t}) => {
	const frame = Math.round(t * FPS);
	const k = prog(t, T.count - 0.08, 0.62, easeOut);
	const done = t >= T.count + 0.54;
	const val = done ? 10_000_000 : Math.round((10_000_000 * k) / 1000) * 1000;
	const punch = springAt(frame, T.count + 0.54, {damping: 9, stiffness: 260});
	const numScale = done ? 1 + 0.08 * (1 - punch) : 1;
	const cardIn = springAt(frame, T.count + 0.62, {damping: 14, stiffness: 120});
	const hl = prog(t, T.contexto - 0.1, 0.4, easeOut);
	const cardW = 620;
	const s = cardW / 790; // screenshot is 790 px wide
	return (
		<>
			<div
				style={{
					position: 'absolute',
					top: 200,
					width: W,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 900,
					fontSize: 150,
					letterSpacing: -3,
					color: t >= T.count - 0.08 ? C.green : 'rgba(61,242,154,0.35)',
					textShadow: '0 0 40px rgba(61,242,154,0.45)',
					transform: `scale(${numScale})`,
				}}
			>
				{fmt(val)}
			</div>
			<div style={{position: 'absolute', top: 395, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.white}}>
				TOKENS POR DIA <span style={{color: C.green}}>•</span> GRÁTIS
			</div>
			{cardIn > 0.001 && (
				<div
					style={{
						position: 'absolute',
						left: (W - cardW) / 2,
						top: 478,
						width: cardW,
						height: 520 * s,
						borderRadius: 20,
						overflow: 'hidden',
						boxShadow: '0 26px 60px rgba(0,0,0,0.65)',
						transform: `translateY(${(1 - cardIn) * 120}px) rotate(${(1 - cardIn) * -5 - 1.2}deg)`,
						opacity: clamp01(cardIn * 1.6),
					}}
				>
					<Img src={staticFile('img/free_card.png')} style={{position: 'absolute', left: 0, top: -90 * s, width: cardW, maxWidth: 'none'}} />
					{/* highlight the real line from the official pricing card */}
					<div
						style={{
							position: 'absolute',
							left: 38 * s,
							top: (571 - 90 - 32) * s,
							width: (540 * s) * hl + 14,
							height: 64 * s,
							border: `5px solid ${C.claude}`,
							borderRadius: 10,
							opacity: hl > 0 ? 1 : 0,
						}}
					/>
				</div>
			)}
			<div
				style={{
					position: 'absolute',
					top: 900,
					width: W,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: 27,
					color: 'rgba(190,220,205,0.85)',
					opacity: clamp01(cardIn * 1.5),
				}}
			>
				fonte: monkeycode-ai.net — plano Basic
			</div>
		</>
	);
};

/** Graphics panel that slides down from the top in the split layout */
export const SplitPanel: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const {split} = layoutWeights(t);
	if (split <= 0.001) return null;
	const h = panelHeight(t);
	const swap = prog(t, T.swap, 0.34);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: h - PANEL_SPLIT, width: W, height: PANEL_SPLIT}}>
				<DarkBg t={t} h={PANEL_SPLIT} />
				{swap < 1 && (
					<div style={{position: 'absolute', inset: 0, transform: `translateX(${-swap * W}px)`}}>
						<SitePanel t={t} />
					</div>
				)}
				{swap > 0 && (
					<div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - swap) * W}px)`}}>
						<TokensPanel t={t} />
					</div>
				)}
			</div>
		</div>
	);
};

export const Seam: React.FC<{y: number}> = ({y}) => (
	<div style={{position: 'absolute', left: 0, top: y - 3, width: W, height: 6, background: C.green, boxShadow: '0 0 24px rgba(61,242,154,0.8)'}} />
);

/** Dark panel behind the hook while the frame opens up for the hand + 3D logo */
export const ClaudePanel: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const {claude} = layoutWeights(t);
	if (claude <= 0.001) return null;
	const h = panelHeight(t);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, overflow: 'hidden'}}>
			<DarkBg t={t} h={h} glowY={0.75} />
			<div
				style={{
					position: 'absolute',
					left: W / 2 - 420,
					top: h - 300,
					width: 840,
					height: 600,
					borderRadius: '50%',
					background: `radial-gradient(closest-side, rgba(217,119,87,${0.28 * claude}), rgba(217,119,87,0))`,
				}}
			/>
		</div>
	);
};

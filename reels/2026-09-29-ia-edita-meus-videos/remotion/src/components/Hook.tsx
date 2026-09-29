import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {PANEL_CLAUDE, T, panelHeight} from '../camera';
import {CLAUDE_PATH} from '../claudePath';
import {C, SANS, clamp01, easeOut, outlined, prog, springAt} from '../theme';
import {FPS, W} from '../timeline';

export const ClaudeGlyph: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path d={CLAUDE_PATH} fill={color} />
	</svg>
);

const CHIP_W = 600;
/** chip centre in screen px once the Claude panel is fully open (the 3D logo flies into its icon) */
export const CHIP = {y: PANEL_CLAUDE - 92, iconX: W / 2 - CHIP_W / 2 + 56};

/** "ESTE VÍDEO FOI / 100% / EDITADO POR IA" — then "nenhum editor aberto", then the Claude chip */
export const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t >= T.claudeWinOut) return null;
	// in the Claude layout everything rides inside the panel (offset follows the panel as it opens)
	const panel = panelHeight(t);
	const dy = t >= T.claudeWinIn ? panel - PANEL_CLAUDE : 0;

	const l1 = springAt(frame, 0.0, {damping: 16, stiffness: 200});
	const big = springAt(frame, T.hundred - 0.1, {damping: 10, stiffness: 180});
	const count = Math.round(100 * prog(t, T.hundred - 0.05, 0.55, easeOut));
	const l3 = springAt(frame, T.hundred + 0.55, {damping: 13, stiffness: 190});
	const swap = prog(t, T.nenhum - 0.15, 0.35); // title -> "no editor" card
	const exit = prog(t, T.claudeWinOut - 0.2, 0.18);

	const chipIn = springAt(frame, T.claude1 - 0.05, {damping: 12, stiffness: 200});
	const arrive = T.claudeWinOut - 0.45;
	const pulse = t >= arrive ? Math.sin(clamp01((t - arrive) / 0.3) * Math.PI) : 0;
	const noEd = springAt(frame, T.nenhum - 0.05, {damping: 12, stiffness: 170});
	const strike = prog(t, T.nenhum + 0.3, 0.3, easeOut);

	return (
		<div style={{position: 'absolute', inset: 0, transform: `translateY(${dy}px)`, opacity: 1 - exit}}>
			{/* title block */}
			<div style={{position: 'absolute', inset: 0, transform: `translateX(${-swap * W}px)`, opacity: 1 - swap}}>
				<div style={{position: 'absolute', top: 196, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, color: C.white, opacity: clamp01(l1 * 2), transform: `translateY(${(1 - l1) * -30}px)`, ...outlined(8)}}>
					ESTE VÍDEO FOI
				</div>
				{t >= T.hundred - 0.12 && (
					<div
						style={{
							position: 'absolute',
							top: 250,
							width: W,
							textAlign: 'center',
							fontFamily: SANS,
							fontWeight: 900,
							fontSize: 190,
							lineHeight: 1,
							letterSpacing: -6,
							color: C.green,
							transform: `scale(${interpolate(big, [0, 1], [0.4, 1])})`,
							...outlined(12),
						}}
					>
						{count}%
					</div>
				)}
				{t >= T.hundred + 0.5 && (
					<div style={{position: 'absolute', top: 452, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 76, color: C.white, transform: `translateY(${(1 - l3) * 30}px)`, opacity: clamp01(l3 * 2), ...outlined(9)}}>
						EDITADO POR <span style={{color: C.green}}>IA</span>
					</div>
				)}
			</div>
			{/* "nenhum editor de vídeo" */}
			{swap > 0 && (
				<div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - swap) * W}px)`}}>
					<div style={{position: 'absolute', left: W / 2 - 280, top: 150, width: 560, height: 280, transform: `scale(${noEd})`}}>
						{/* generic video-editor window */}
						<div style={{position: 'absolute', inset: 0, borderRadius: 28, background: '#141A17', border: '3px solid rgba(255,255,255,0.18)', overflow: 'hidden'}}>
							<div style={{height: 46, background: '#1E2622', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 18}}>
								{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
									<div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />
								))}
							</div>
							<div style={{position: 'absolute', left: 30, top: 70, width: 250, height: 120, borderRadius: 12, background: '#2A3530'}} />
							{[0, 1, 2].map((r) => (
								<div key={r} style={{position: 'absolute', left: 30, top: 208 + r * 26, height: 16, width: 540, borderRadius: 8, background: 'rgba(255,255,255,0.08)'}}>
									<div style={{position: 'absolute', left: 40 + r * 70, width: 200 - r * 30, height: 16, borderRadius: 8, background: ['#5A8DEE', '#E6A23C', '#9B6BDF'][r]}} />
								</div>
							))}
							<div style={{position: 'absolute', left: 320, top: 80, width: 240, height: 100}}>
								{[0, 1, 2].map((r) => (
									<div key={r} style={{height: 16, marginBottom: 14, borderRadius: 8, width: 240 - r * 50, background: 'rgba(255,255,255,0.12)'}} />
								))}
							</div>
						</div>
						{/* red strike */}
						<div style={{position: 'absolute', left: -30, top: 130, width: 620 * strike, height: 22, borderRadius: 11, background: '#FF4D4D', transform: 'rotate(-22deg)', transformOrigin: '0 50%', boxShadow: '0 0 0 5px #000'}} />
					</div>
					<div style={{position: 'absolute', top: 448, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, color: C.white, opacity: clamp01(noEd * 2)}}>
						<span style={{color: '#FF4D4D'}}>NENHUM</span> EDITOR DE VÍDEO
					</div>
				</div>
			)}
			{/* Claude chip */}
			{chipIn > 0.001 && (
				<div
					style={{
						position: 'absolute',
						left: W / 2 - CHIP_W / 2,
						top: CHIP.y - 42,
						width: CHIP_W,
						height: 84,
						borderRadius: 42,
						background: C.claude,
						boxShadow: '0 10px 30px rgba(0,0,0,0.35), 0 0 0 4px #000',
						transform: `scale(${chipIn})`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						paddingLeft: 70,
						boxSizing: 'border-box',
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 46,
						color: C.white,
					}}
				>
					<div style={{position: 'absolute', left: 56 - 26, top: 42 - 26, transform: `scale(${1 + 0.4 * pulse}) rotate(${pulse * 45}deg)`}}>
						<ClaudeGlyph size={52} color={C.white} />
					</div>
					CLAUDE OPUS 5.5
				</div>
			)}
		</div>
	);
};

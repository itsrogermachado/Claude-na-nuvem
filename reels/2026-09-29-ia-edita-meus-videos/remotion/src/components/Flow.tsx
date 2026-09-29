import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {T} from '../camera';
import {C, SANS, clamp01, easeOut, prog, springAt} from '../theme';
import {FPS, W} from '../timeline';
import {ClaudeGlyph} from './Hook';

const NODE_Y = 330;
const XS = [200, 540, 880];

const CameraIcon = () => (
	<svg width={78} height={78} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
		<rect x="2" y="6" width="14" height="12" rx="2.5" />
		<path d="M16 10.5 22 7v10l-6-3.5" />
	</svg>
);
const DoneIcon = () => (
	<svg width={78} height={78} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
		<polygon points="8,5 19,12 8,19" fill="#000" />
	</svg>
);

/** "eu só gravo, mando o arquivo pro Claude e ele faz o resto" as a 3-step flow */
export const Flow: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const t0 = T.claudeWinOut;
	if (t < t0 || t >= T.stepsIn) return null;
	const card = springAt(frame, t0, {damping: 15, stiffness: 170});
	const n = [springAt(frame, T.gravo - 0.08, {damping: 11}), springAt(frame, T.claude2 - 0.05, {damping: 11}), springAt(frame, T.resto - 0.1, {damping: 11})];
	const file = prog(t, T.arquivo - 0.05, 0.55, easeOut);
	const line2 = prog(t, T.resto - 0.25, 0.3, easeOut);
	const absurd = springAt(frame, T.absurdo, {damping: 8, stiffness: 240});
	const punch = t >= T.absurdo ? 1 + 0.06 * Math.sin(clamp01((t - T.absurdo) / 0.35) * Math.PI) : 1;
	const exit = prog(t, T.stepsIn - 0.16, 0.14);
	const labels = ['EU GRAVO', 'CLAUDE', 'VÍDEO PRONTO'];
	const bgs = [C.white, C.claude, C.green];
	return (
		<div
			style={{
				position: 'absolute',
				left: 60,
				top: 190,
				width: W - 120,
				height: 330,
				borderRadius: 36,
				background: 'rgba(7,14,10,0.88)',
				border: `3px solid ${t >= T.absurdo ? C.green : 'rgba(61,242,154,0.35)'}`,
				boxShadow: `0 24px 60px rgba(0,0,0,0.45)${t >= T.absurdo ? `, 0 0 ${40 * absurd}px rgba(61,242,154,0.6)` : ''}`,
				transform: `translateY(${(1 - card) * -60}px) scale(${interpolate(card, [0, 1], [0.92, 1]) * punch})`,
				opacity: clamp01(card * 2) * (1 - exit),
			}}
		>
			{/* connecting lines */}
			<div style={{position: 'absolute', left: XS[0] - 60, top: NODE_Y - 190 - 3, width: (XS[1] - XS[0]) * clamp01(file * 1.2), height: 6, borderRadius: 3, background: C.claude}} />
			<div style={{position: 'absolute', left: XS[1] - 60, top: NODE_Y - 190 - 3, width: (XS[2] - XS[1]) * line2, height: 6, borderRadius: 3, background: C.green}} />
			{/* travelling file */}
			{file > 0 && file < 1 && (
				<div style={{position: 'absolute', left: XS[0] - 60 + (XS[1] - XS[0]) * file - 28, top: NODE_Y - 190 - 72 - Math.sin(file * Math.PI) * 30, width: 56, height: 68, borderRadius: 8, background: C.white, boxShadow: '0 0 0 4px #000'}}>
					<div style={{position: 'absolute', right: 0, top: 0, width: 18, height: 18, background: '#CFCFCF', borderBottomLeftRadius: 6}} />
					<svg width={30} height={30} viewBox="0 0 24 24" style={{position: 'absolute', left: 13, top: 24}}>
						<polygon points="8,5 19,12 8,19" fill="#000" />
					</svg>
				</div>
			)}
			{XS.map((x, i) => (
				<div key={i} style={{position: 'absolute', left: x - 60 - 75, top: NODE_Y - 190 - 75, width: 150, height: 150, transform: `scale(${n[i]})`}}>
					<div style={{width: 150, height: 150, borderRadius: 75, background: bgs[i], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 5px #000, 0 12px 30px rgba(0,0,0,0.4)'}}>
						{i === 0 ? <CameraIcon /> : i === 1 ? <ClaudeGlyph size={86} color={C.white} /> : <DoneIcon />}
					</div>
					<div style={{position: 'absolute', top: 168, left: -80, width: 310, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 36, color: C.white}}>{labels[i]}</div>
				</div>
			))}
		</div>
	);
};

import React from 'react';
import {useCurrentFrame} from 'remotion';
import {PANEL_TRACK, T, camera, toScreen} from '../camera';
import {C, MONO, SANS, clamp01, prog, springAt} from '../theme';
import {FPS, landmarksAt, segmentAt} from '../timeline';
import {ClaudeGlyph} from './Hook';
import {PanelSlot} from './Panels';

// MediaPipe hand topology
const BONES = [
	[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
	[9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

const Skeleton: React.FC<{pts: number[][]; stroke: number; dot: number; opacity?: number}> = ({pts, stroke, dot, opacity = 1}) => (
	<g opacity={opacity}>
		{BONES.map(([a, b], i) => (
			<line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={C.green} strokeWidth={stroke} strokeLinecap="round" />
		))}
		{pts.map((p, i) => (
			<circle key={i} cx={p[0]} cy={p[1]} r={i % 4 === 0 ? dot * 1.3 : dot} fill={C.white} stroke={C.green} strokeWidth={dot * 0.5} />
		))}
	</g>
);

/** Panel: live hand-tracking readout (the same 21 points the logo is pinned to) */
export const TrackPanel: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < T.trackIn || t >= T.trackOut) return null;
	const lm = landmarksAt(frame);
	const seg = segmentAt(frame);
	const srcFrame = seg.srcStart + (frame - seg.outStart);
	const inS = springAt(frame, T.trackIn + 0.05, {damping: 14, stiffness: 160});
	const fade = 1 - prog(t, T.incrivel - 0.4, 0.3); // the logo lands here on "incrível"
	let norm: number[][] | null = null;
	if (lm) {
		const xs = lm.map((p) => p[0]),
			ys = lm.map((p) => p[1]);
		const cx = (Math.min(...xs) + Math.max(...xs)) / 2,
			cy = (Math.min(...ys) + Math.max(...ys)) / 2;
		const k = 400 / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 180);
		norm = lm.map((p) => [540 + (p[0] - cx) * k, 470 + (p[1] - cy) * k]);
	}
	const chip = springAt(frame, T.claude3 - 0.05, {damping: 12, stiffness: 200});
	const heart = springAt(frame, T.claude3 + 1.4, {damping: 8, stiffness: 260});
	return (
		<PanelSlot height={PANEL_TRACK}>
			<div style={{position: 'absolute', inset: 0, opacity: clamp01(inS * 2)}}>
				<div style={{position: 'absolute', top: 150, left: 70, right: 70, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 1}}>
					<div style={{color: C.green}}>{'// RASTREAMENTO DE MÃO'}</div>
					<div style={{color: C.white, display: 'flex', alignItems: 'center', gap: 12}}>
						<div style={{width: 18, height: 18, borderRadius: 9, background: '#FF4D4D', opacity: Math.floor(t * 2) % 2 ? 1 : 0.3}} />
						QUADRO {String(srcFrame).padStart(4, '0')}
					</div>
				</div>
				{/* viewfinder */}
				{[[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j], k) => (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: 290 + i * 500 - (i ? 60 : 0),
							top: 240 + j * 470 - (j ? 60 : 0),
							width: 60,
							height: 60,
							borderColor: 'rgba(61,242,154,0.7)',
							borderStyle: 'solid',
							borderWidth: `${j ? 0 : 5}px ${i ? 5 : 0}px ${j ? 5 : 0}px ${i ? 0 : 5}px`,
						}}
					/>
				))}
				{norm && (
					<svg width={1080} height={960} style={{position: 'absolute', left: 0, top: 0}}>
						<Skeleton pts={norm} stroke={7} dot={9} opacity={fade} />
					</svg>
				)}
				<div style={{position: 'absolute', top: 725, width: '100%', textAlign: 'center', fontFamily: MONO, fontSize: 28, color: 'rgba(205,235,220,0.8)', opacity: fade}}>21 PONTOS · 60 QUADROS POR SEGUNDO</div>
				{chip > 0.001 && (
					<div style={{position: 'absolute', top: 790, width: '100%', display: 'flex', justifyContent: 'center'}}>
						<div style={{height: 84, padding: '0 36px 0 24px', borderRadius: 42, background: C.claude, display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${chip})`, boxShadow: '0 0 0 4px #000', fontFamily: SANS, fontWeight: 900, fontSize: 42, color: C.white}}>
							<ClaudeGlyph size={50} color={C.white} />
							CLAUDE OPUS 5.5
							<svg width={44} height={44} viewBox="0 0 24 24" style={{transform: `scale(${heart})`}}>
								<path d="M12 21s-7.5-4.6-10-9.3C.6 8.9 2.2 5 6 5c2.2 0 3.6 1.3 4.5 2.6h3C14.4 6.3 15.8 5 18 5c3.8 0 5.4 3.9 4 6.7C19.5 16.4 12 21 12 21z" fill="#fff" />
							</svg>
						</div>
					</div>
				)}
			</div>
		</PanelSlot>
	);
};

/** The same tracking drawn on the real hand while he says "rastreou a minha mão, quadro a quadro" */
export const HandOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const t0 = T.rastreou - 0.1,
		t1 = T.incrivel - 0.45;
	if (t < t0 || t > t1) return null;
	const lm = landmarksAt(frame);
	if (!lm) return null;
	const cam = camera(frame);
	const pts = lm.map((p) => {
		const s = toScreen(cam, p[0], p[1]);
		return [s.x, s.y];
	});
	const a = prog(t, t0, 0.2) * (1 - prog(t, t1 - 0.2, 0.2));
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
			<Skeleton pts={pts} stroke={5} dot={7} opacity={a * 0.95} />
		</svg>
	);
};

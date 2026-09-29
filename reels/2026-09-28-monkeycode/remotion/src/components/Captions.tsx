import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {T, layoutWeights, panelHeight} from '../camera';
import {C, SANS, clamp01, outlined, springAt} from '../theme';
import {FPS, W, WORDS} from '../timeline';

// How many words go on screen together (hand-tuned for natural phrase breaks)
const SIZES = [3, 4, 4, 2, 2, 3, 3, 2, 4, 3, 2, 3, 3, 2, 2, 4, 5, 4, 1, 5, 2, 4, 6, 2, 5, 2, 4, 2, 4, 2, 2, 5];
if (SIZES.reduce((a, b) => a + b, 0) !== WORDS.length) {
	throw new Error(`caption chunks cover ${SIZES.reduce((a, b) => a + b, 0)} words, transcript has ${WORDS.length}`);
}
const CHUNKS = (() => {
	let k = 0;
	return SIZES.map((n) => {
		const c = WORDS.slice(k, k + n);
		k += n;
		return c;
	});
})();
const TIMES = CHUNKS.map((c, i) => {
	const start = c[0].start - 0.05;
	const next = i + 1 < CHUNKS.length ? CHUNKS[i + 1][0].start - 0.05 : Infinity;
	return {start, end: Math.min(next, c[c.length - 1].end + 0.45)};
});

const KEY_GREEN = new Set(['EVOLUÇÃO', 'IA', 'EXTREMAMENTE', 'INCRÍVEL', 'SITE', '10', 'MILHÕES', 'CÓDIGO', 'MONKEY', 'CODE', 'PESQUISA', 'OLHADA', 'LINK', 'DESCRIÇÃO', 'SEGUE', 'EDITAR']);
const KEY_CLAUDE = new Set(['CLAUDE', 'OPUS', '5.5']);
const clean = (s: string) => s.toUpperCase().replace(/[.,]+$/, '');

export const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t >= T.reveal - 0.02 && t < T.revealOut) return null; // the logo reveal owns the screen
	const idx = TIMES.findIndex((x) => t >= x.start && t < x.end);
	if (idx < 0) return null;
	const chunk = CHUNKS[idx];
	const {claude, split} = layoutWeights(t);
	const full = clamp01(1 - claude - split);
	const panel = panelHeight(t);
	// full screen: below the chin; with a top panel: just under the seam
	const cy = full * 1335 + claude * (panel + 125) + split * (panel + 92);

	const pop = springAt(frame, TIMES[idx].start, {damping: 13, stiffness: 210});
	const inScale = interpolate(pop, [0, 1], [0.78, 1]);
	const inY = interpolate(pop, [0, 1], [26, 0]);
	const inOp = clamp01(pop * 2.2);

	// Claude words in the Claude colour, everything else green when highlighted
	const isCodeContext = chunk.some((w) => clean(w.text) === 'CLAUDE');

	return (
		<div
			style={{
				position: 'absolute',
				left: (W - 860) / 2,
				width: 860,
				top: cy,
				transform: `translateY(-50%) translateY(${inY}px) scale(${inScale})`,
				opacity: inOp,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignItems: 'center',
				columnGap: 30,
				rowGap: 2,
				fontFamily: SANS,
				fontWeight: 900,
				fontSize: 80,
				lineHeight: 1.18,
				letterSpacing: -0.5,
			}}
		>
			{chunk.map((w, i) => {
				const tok = clean(w.text);
				const next = chunk[i + 1];
				const active = t >= w.start - 0.03 && t < (next ? next.start - 0.03 : TIMES[idx].end);
				const spoken = t >= w.start - 0.03;
				const hit = springAt(frame, w.start - 0.03, {damping: 11, stiffness: 260});
				const sc = active ? 1 + 0.1 * hit - 0.04 * clamp01((t - w.start) / 0.4) : 1;
				const isKeyC = KEY_CLAUDE.has(tok) || (isCodeContext && tok === 'CODE');
				const isKeyG = !isKeyC && KEY_GREEN.has(tok);
				const color = isKeyC ? C.claude : isKeyG ? C.green : C.white;
				const pill = active && (isKeyC || isKeyG);
				return (
					<span
						key={i}
						style={{
							position: 'relative',
							isolation: 'isolate',
							display: 'inline-block',
							transform: `scale(${sc})`,
							color: pill ? C.black : color,
							opacity: spoken ? 1 : 0.92,
							padding: '0 4px',
							...(pill ? {} : outlined(9)),
						}}
					>
						{pill && (
							<span
								style={{
									position: 'absolute',
									inset: '4px -7px 0px -7px',
									background: color,
									borderRadius: 16,
									zIndex: -1,
									transform: `scaleX(${interpolate(hit, [0, 1], [0.6, 1])})`,
									boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
								}}
							/>
						)}
						<span style={{position: 'relative'}}>{tok}</span>
					</span>
				);
			})}
		</div>
	);
};

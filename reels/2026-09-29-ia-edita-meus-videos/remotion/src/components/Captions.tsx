import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {PANEL_CLAUDE, T, layoutAt, panelHeight} from '../camera';
import {C, SANS, clamp01, outlined, springAt} from '../theme';
import {FPS, W, WORDS, Word} from '../timeline';

// "ele ouve o | o vídeo": the first "o" sits on a cut and is barely audible — keep one on screen
const SPOKEN = WORDS.filter((w, i) => !(i > 0 && w.text === 'o' && WORDS[i - 1].text === 'o' && w.seg !== WORDS[i - 1].seg));
const SIZES = [3, 2, 1, 2, 4, 4, 4, 3, 4, 3, 5, 4, 1, 4, 3, 3, 1, 4, 2, 3, 3, 1, 2, 2, 2, 3, 3, 2, 5, 3, 3, 3, 3, 2, 4, 3, 4, 1, 2, 3, 3, 4, 4, 2, 4, 4];
if (SIZES.reduce((a, b) => a + b, 0) !== SPOKEN.length) {
	throw new Error(`caption chunks cover ${SIZES.reduce((a, b) => a + b, 0)} words, transcript has ${SPOKEN.length}`);
}
const CHUNKS: Word[][] = (() => {
	let k = 0;
	return SIZES.map((n) => {
		const c = SPOKEN.slice(k, k + n);
		k += n;
		return c;
	});
})();
const TIMES = CHUNKS.map((c, i) => {
	const start = c[0].start - 0.05;
	const next = i + 1 < CHUNKS.length ? CHUNKS[i + 1][0].start - 0.05 : Infinity;
	return {start, end: Math.min(next, c[c.length - 1].end + 0.45)};
});

const FIX: Record<string, string> = {RASTROU: 'RASTREOU'};
const clean = (s: string) => {
	const u = s.toUpperCase().replace(/[.,]+$/, '');
	return FIX[u] ?? u;
};
const KEY_GREEN = new Set([
	'100%', 'EDITADO', 'INTELIGÊNCIA', 'ARTIFICIAL', 'NENHUM', 'EDITOR', 'GRAVO', 'ARQUIVO', 'RESTO', 'ABSURDO', 'PRIMEIRO', 'SEGUNDO', 'TERCEIRO',
	'TRANSCREVE', 'PALAVRA', 'CORTA', 'SILÊNCIOS', 'ERROS', 'PAUSAZINHAS', 'ANIMAÇÕES', 'JAVASCRIPT', 'ROTEIRO', 'LOGO', 'MÃO', 'RASTREOU', 'QUADRO',
	'INCRÍVEL', 'IA', 'EDITA', 'PASSO', 'DIRECT', 'ENSINO',
]);
const KEY_CLAUDE = new Set(['CLAUDE', 'OPUS', '5.5', 'QUERIDO']);

export const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const idx = TIMES.findIndex((x) => t >= x.start && t < x.end);
	if (idx < 0) return null;
	const chunk = CHUNKS[idx];
	const kind = layoutAt(t);
	const panel = panelHeight(t);
	// full screen: under the chin, above Instagram's bottom UI; with a panel: just under the seam
	const cy = kind === 'full' ? 1500 : panel + (kind === 'claude' ? Math.min(118, 118 * (panel / PANEL_CLAUDE)) : 92);

	const pop = springAt(frame, TIMES[idx].start, {damping: 13, stiffness: 220});
	return (
		<div
			style={{
				position: 'absolute',
				left: (W - 900) / 2,
				width: 900,
				top: cy,
				transform: `translateY(-50%) translateY(${interpolate(pop, [0, 1], [26, 0])}px) scale(${interpolate(pop, [0, 1], [0.78, 1])})`,
				opacity: clamp01(pop * 2.2),
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignItems: 'center',
				columnGap: 26,
				rowGap: 0,
				fontFamily: SANS,
				fontWeight: 900,
				fontSize: 80,
				lineHeight: 1.16,
				letterSpacing: -0.5,
			}}
		>
			{chunk.map((w, i) => {
				const tok = clean(w.text);
				const next = chunk[i + 1];
				const active = t >= w.start - 0.03 && t < (next ? next.start - 0.03 : TIMES[idx].end);
				const hit = springAt(frame, w.start - 0.03, {damping: 11, stiffness: 260});
				const sc = active ? 1 + 0.1 * hit - 0.04 * clamp01((t - w.start) / 0.4) : 1;
				const isC = KEY_CLAUDE.has(tok);
				const isG = !isC && KEY_GREEN.has(tok);
				const color = isC ? C.claude : isG ? C.green : C.white;
				const pill = active && (isC || isG);
				return (
					<span
						key={i}
						style={{position: 'relative', isolation: 'isolate', display: 'inline-block', transform: `scale(${sc})`, color: pill ? C.black : color, padding: '0 4px', ...(pill ? {} : outlined(9))}}
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

export {T};

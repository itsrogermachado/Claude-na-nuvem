import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, SANS, clamp01, outlined, springAt} from '../theme';
import {FPS, W, WORDS, Word} from '../timeline';

const WEAK = new Set(['o', 'os', 'a', 'as', 'e', 'em', 'de', 'do', 'da', 'dos', 'que', 'um', 'uma', 'no', 'na', 'pra', 'pros', 'para', 'eu', 'ela', 'se', 'me', 'te', 'essa', 'esse', 'como', 'ou', 'vai', 'você', 'sem', 'tá']);
const norm = (x: string) => x.toLowerCase().replace(/[.,?!]/g, '');
// Automatic phrasing: short, punchy chunks that break on punctuation and pauses
const CHUNKS: Word[][] = (() => {
	const out: Word[][] = [];
	let cur: Word[] = [];
	const len = (c: Word[]) => c.reduce((a, w) => a + w.text.length + 1, 0);
	WORDS.forEach((w, i) => {
		const prev = WORDS[i - 1];
		const hard = !!prev && (/[.,?!]$/.test(prev.text) || w.start - prev.end > 0.28 || w.seg !== prev.seg);
		const breakHere = cur.length > 0 && (cur.length >= 4 || len(cur) + w.text.length > 20 || hard);
		if (breakHere) {
			// never leave a dangling "o / em / que / de…" at the end of a line when breaking for length
			const carry = !hard && cur.length > 1 && WEAK.has(norm(cur[cur.length - 1].text)) ? [cur.pop()!] : [];
			out.push(cur);
			cur = carry;
		}
		cur.push(w);
	});
	if (cur.length) out.push(cur);
	return out;
})();
const TIMES = CHUNKS.map((c, i) => {
	const start = c[0].start - 0.05;
	const next = i + 1 < CHUNKS.length ? CHUNKS[i + 1][0].start - 0.05 : Infinity;
	return {start, end: Math.min(next, c[c.length - 1].end + 0.45)};
});

const clean = (s: string) => s.toUpperCase().replace(/[.,]+$/, '');
const KEY_GREEN = new Set(['VALOR', 'REAL', 'VALEU', 'PENA', 'VENDENDO', 'AFILIADO', 'MELHOR', 'MELHORES', 'PRONTO']);
const KEY_ORANGE = new Set(['ENSINAR', 'ANÚNCIOS', 'TEMPO', 'SHOPEE', 'EMPIRE', 'LIVE', 'LINK', 'BIO', 'CONECTAR', 'AUTOMÁTICO', 'PRODUTOS', 'MERCADO', 'LIVRE', 'TIKTOK', 'TRÊS', 'FERRAMENTA']);

/** Word-by-word captions, just under the graphics band and above the face (top of the block; a second line grows down over the hair) */
export const CAPTION_Y = 492;

export const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const idx = TIMES.findIndex((x) => t >= x.start && t < x.end);
	if (idx < 0) return null;
	const chunk = CHUNKS[idx];
	const pop = springAt(frame, TIMES[idx].start, {damping: 13, stiffness: 220});
	return (
		<div
			style={{
				position: 'absolute',
				left: (W - 940) / 2,
				width: 940,
				top: CAPTION_Y,
				transform: `translateY(${interpolate(pop, [0, 1], [26, 0])}px) scale(${interpolate(pop, [0, 1], [0.78, 1])})`,
				transformOrigin: '50% 0',
				opacity: clamp01(pop * 2.2),
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignItems: 'center',
				columnGap: 30,
				fontFamily: SANS,
				fontWeight: 900,
				fontSize: 64,
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
				const isO = KEY_ORANGE.has(tok);
				const isG = !isO && KEY_GREEN.has(tok);
				const color = isO ? C.orange : isG ? C.green : C.white;
				const pill = active && (isO || isG);
				return (
					<span key={i} style={{position: 'relative', isolation: 'isolate', display: 'inline-block', transform: `scale(${sc})`, color: pill ? (isO ? C.white : C.black) : color, padding: '0 4px', ...(pill ? {} : outlined(9))}}>
						{pill && (
							<span
								style={{
									position: 'absolute',
									inset: '4px -7px 0px -7px',
									background: color,
									borderRadius: 16,
									zIndex: -1,
									transform: `scaleX(${interpolate(hit, [0, 1], [0.6, 1])})`,
									boxShadow: '0 8px 24px rgba(0,0,0,0.35), 0 0 0 4px #000',
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

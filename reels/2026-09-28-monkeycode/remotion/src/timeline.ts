import data from './data.json';

export const FPS = 60;
export const W = 1080;
export const H = 1920;
export const SRC_W = 1920;
export const SRC_H = 1080;

// ---------------------------------------------------------------------------
// Edit decision list: [sourceStartFrame, sourceEndFrame) at 60 fps
// ---------------------------------------------------------------------------
export type Segment = {srcStart: number; srcEnd: number; outStart: number; len: number};
export const SEGMENTS: Segment[] = (() => {
	let o = 0;
	return (data.edl as number[][]).map(([a, b]) => {
		const s = {srcStart: a, srcEnd: b, outStart: o, len: b - a};
		o += b - a;
		return s;
	});
})();
export const DURATION = SEGMENTS.reduce((acc, s) => acc + s.len, 0);
export const CUTS = SEGMENTS.map((s) => s.outStart / FPS);

export const segmentAt = (outFrame: number) => {
	for (const s of SEGMENTS) if (outFrame >= s.outStart && outFrame < s.outStart + s.len) return s;
	return SEGMENTS[SEGMENTS.length - 1];
};
/** Output time (s) -> source time (s) */
export const srcTime = (t: number) => {
	const f = Math.max(0, Math.min(DURATION - 1, t * FPS));
	const s = segmentAt(Math.floor(f));
	return (s.srcStart + (f - s.outStart)) / FPS;
};
/** Source time (s) -> output time (s), or null when the moment was cut */
export const outTime = (ts: number) => {
	const f = ts * FPS;
	for (const s of SEGMENTS) if (f >= s.srcStart - 0.5 && f < s.srcEnd) return (s.outStart + (f - s.srcStart)) / FPS;
	return null;
};

// ---------------------------------------------------------------------------
// Words (whisper large-v3, word timestamps) mapped onto the output timeline
// ---------------------------------------------------------------------------
export type Word = {text: string; start: number; end: number};
export const WORDS: Word[] = (() => {
	const out: Word[] = [];
	for (const w of data.words as {s: number; e: number; w: string}[]) {
		const mid = (w.s + w.e) / 2;
		const seg = SEGMENTS.find((s) => mid * FPS >= s.srcStart && mid * FPS < s.srcEnd);
		if (!seg) continue;
		const clampS = Math.max(w.s, seg.srcStart / FPS);
		const clampE = Math.min(w.e, seg.srcEnd / FPS);
		const text = w.w;
		// whisper splits "5.5" into "5" + ".5"
		if (text === '.5' && out.length) {
			out[out.length - 1].text += '.5';
			out[out.length - 1].end = (seg.outStart + (clampE * FPS - seg.srcStart)) / FPS;
			continue;
		}
		out.push({
			text,
			start: (seg.outStart + (clampS * FPS - seg.srcStart)) / FPS,
			end: (seg.outStart + (clampE * FPS - seg.srcStart)) / FPS,
		});
	}
	return out;
})();
/** Output time of the n-th occurrence of a word (case-insensitive, punctuation ignored) */
export const wordT = (text: string, nth = 0) => {
	const norm = (s: string) => s.toLowerCase().replace(/[.,?!]/g, '');
	const hits = WORDS.filter((w) => norm(w.text) === norm(text));
	if (!hits[nth]) throw new Error(`word not found: ${text}#${nth}`);
	return hits[nth].start;
};

/** 1 while he is speaking, 0 in gaps — used to duck the music */
export const speaking = (t: number) => WORDS.some((w) => t >= w.start - 0.05 && t <= w.end + 0.08);

// ---------------------------------------------------------------------------
// Tracking data
// ---------------------------------------------------------------------------
const faces = data.faces as number[][]; // [t, cx, cy, w] at 30 Hz, source px
const interp = (arr: number[][], t: number, k: number) => {
	if (t <= arr[0][0]) return arr[0][k];
	if (t >= arr[arr.length - 1][0]) return arr[arr.length - 1][k];
	let lo = 0,
		hi = arr.length - 1;
	while (hi - lo > 1) {
		const m = (lo + hi) >> 1;
		if (arr[m][0] <= t) lo = m;
		else hi = m;
	}
	const a = arr[lo],
		b = arr[hi];
	const u = (t - a[0]) / (b[0] - a[0]);
	return a[k] + (b[k] - a[k]) * u;
};

/** Gaussian smoothing on the output timeline that never crosses a cut */
const smoothOut = (fn: (ts: number) => number, sigmaS: number) => {
	const cache = new Map<number, number>();
	return (outFrame: number) => {
		const key = Math.round(outFrame);
		const hit = cache.get(key);
		if (hit !== undefined) return hit;
		const seg = segmentAt(key);
		const r = Math.ceil(sigmaS * FPS * 2.5);
		let acc = 0,
			wsum = 0;
		for (let d = -r; d <= r; d++) {
			const f = key + d;
			if (f < seg.outStart || f >= seg.outStart + seg.len) continue;
			const w = Math.exp(-0.5 * (d / (sigmaS * FPS)) ** 2);
			acc += w * fn((seg.srcStart + (f - seg.outStart)) / FPS);
			wsum += w;
		}
		const v = acc / wsum;
		cache.set(key, v);
		return v;
	};
};

export const faceX = smoothOut((ts) => interp(faces, ts, 1), 0.35);
export const faceY = smoothOut((ts) => interp(faces, ts, 2), 0.5);

// Hand (palm) track for the "Claude" moment: [t, palmX, palmY, size, angleDeg]
const hands = data.hands as number[][];
const handAt = (ts: number, k: number) => interp(hands, ts, k);
export const HAND_T0 = hands[0][0];
export const HAND_T1 = hands[hands.length - 1][0];
const palmXs = smoothOut((ts) => handAt(ts, 1), 0.035);
const palmYs = smoothOut((ts) => handAt(ts, 2), 0.035);
const palmSz = smoothOut((ts) => handAt(ts, 3), 0.18);
const palmAng = smoothOut((ts) => handAt(ts, 4), 0.1);
export const palm = (outFrame: number) => {
	const sz = palmSz(outFrame);
	const ang = palmAng(outFrame);
	// shift from the palm centre towards the fingers so the logo sits "in" the open hand
	const rad = (ang * Math.PI) / 180;
	return {
		x: palmXs(outFrame) + Math.sin(rad) * sz * 0.32,
		y: palmYs(outFrame) - Math.cos(rad) * sz * 0.32,
		size: sz,
		angle: ang,
	};
};

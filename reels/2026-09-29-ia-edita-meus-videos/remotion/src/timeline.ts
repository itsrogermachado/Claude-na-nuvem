import data from './data.json';

export const FPS = 60;
export const W = 1080;
export const H = 1920;
export const SRC_W = 1920;
export const SRC_H = 1080;

type ClipData = {
	faces: number[][]; // [t, cx, cy, w]
	hands: number[][]; // [t, palmX, palmY, size, angle, minX, maxX, minY]
	words: {s: number; e: number; w: string}[];
	landmarks?: [number, number[][]][];
};
const CLIPS = data.clips as unknown as Record<string, ClipData>;

// ---------------------------------------------------------------------------
// Edit decision list (60 fps source frames per clip)
// ---------------------------------------------------------------------------
export type Segment = {clip: string; srcStart: number; srcEnd: number; outStart: number; len: number};
export const SEGMENTS: Segment[] = (() => {
	let o = 0;
	return (data.segments as {clip: string; srcStart: number; srcEnd: number}[]).map((s) => {
		const seg = {...s, outStart: o, len: s.srcEnd - s.srcStart};
		o += seg.len;
		return seg;
	});
})();
export const DURATION = SEGMENTS.reduce((a, s) => a + s.len, 0);
export const CUTS = SEGMENTS.map((s) => s.outStart / FPS);

export const segmentAt = (outFrame: number) => {
	const f = Math.max(0, Math.min(DURATION - 1, Math.floor(outFrame)));
	for (const s of SEGMENTS) if (f >= s.outStart && f < s.outStart + s.len) return s;
	return SEGMENTS[SEGMENTS.length - 1];
};
export const segIndexAt = (outFrame: number) => SEGMENTS.indexOf(segmentAt(outFrame));
/** source time (s) of an output frame, in its own clip */
export const srcTimeOf = (outFrame: number) => {
	const s = segmentAt(outFrame);
	return (s.srcStart + (outFrame - s.outStart)) / FPS;
};

// ---------------------------------------------------------------------------
// Words on the output timeline
// ---------------------------------------------------------------------------
export type Word = {text: string; start: number; end: number; seg: number};
export const WORDS: Word[] = (() => {
	const out: Word[] = [];
	SEGMENTS.forEach((seg, k) => {
		for (const w of CLIPS[seg.clip].words) {
			const mid = ((w.s + w.e) / 2) * FPS;
			if (mid < seg.srcStart || mid >= seg.srcEnd) continue;
			const start = (seg.outStart + (Math.max(w.s * FPS, seg.srcStart) - seg.srcStart)) / FPS;
			const end = (seg.outStart + (Math.min(w.e * FPS, seg.srcEnd) - seg.srcStart)) / FPS;
			const prev = out[out.length - 1];
			// whisper splits "5.5" and "100%"
			if (prev && prev.seg === k && (w.w.startsWith('.') || w.w === '%')) {
				prev.text += w.w.replace(/,$/, '');
				prev.end = end;
				continue;
			}
			// fix the model name the recogniser keeps hearing as "Cloud"
			const text = w.w.replace(/^Cloud/, 'Claude');
			out.push({text, start, end, seg: k});
		}
	});
	return out;
})();
const norm = (s: string) => s.toLowerCase().replace(/[.,?!]/g, '');
export const wordT = (text: string, nth = 0) => {
	const hits = WORDS.filter((w) => norm(w.text) === norm(text));
	if (!hits[nth]) throw new Error(`word not found: ${text}#${nth}`);
	return hits[nth].start;
};
/** start (s) of the word `offset` positions away from the nth match (e.g. -2 = two words earlier) */
export const wordAt = (text: string, nth = 0, offset = 0) => {
	const hits = WORDS.map((w, i) => [w, i] as const).filter(([w]) => norm(w.text) === norm(text));
	if (!hits[nth]) throw new Error(`word not found: ${text}#${nth}`);
	return WORDS[hits[nth][1] + offset].start;
};
/** output time where a take (clip) first appears */
export const clipStart = (clip: string) => SEGMENTS.find((s) => s.clip === clip)!.outStart / FPS;
/** output time of the cut that starts the segment containing time t */
export const segStartAt = (t: number) => segmentAt(t * FPS).outStart / FPS;

export const speaking = (t: number) => WORDS.some((w) => t >= w.start - 0.05 && t <= w.end + 0.08);

// ---------------------------------------------------------------------------
// Tracking helpers
// ---------------------------------------------------------------------------
const interp = (arr: number[][], t: number, k: number) => {
	if (!arr.length) return NaN;
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
	return a[k] + (b[k] - a[k]) * ((t - a[0]) / (b[0] - a[0]));
};
/** distance (s) to the nearest sample — used to know if a hand is really there */
const gapAt = (arr: number[][], t: number) => {
	let best = Infinity;
	let lo = 0,
		hi = arr.length - 1;
	while (hi - lo > 1) {
		const m = (lo + hi) >> 1;
		if (arr[m][0] <= t) lo = m;
		else hi = m;
	}
	for (const i of [lo, hi]) if (arr[i]) best = Math.min(best, Math.abs(arr[i][0] - t));
	return best;
};

/** Gaussian smoothing on the output timeline that never crosses a cut */
export const smoothed = (fn: (seg: Segment, ts: number) => number, sigmaS: number) => {
	const cache = new Map<number, number>();
	return (outFrame: number) => {
		const key = Math.round(outFrame);
		const hit = cache.get(key);
		if (hit !== undefined) return hit;
		const seg = segmentAt(key);
		const r = Math.ceil(sigmaS * FPS * 2.5);
		let acc = 0,
			ws = 0;
		for (let d = -r; d <= r; d++) {
			const f = key + d;
			if (f < seg.outStart || f >= seg.outStart + seg.len) continue;
			const v = fn(seg, (seg.srcStart + (f - seg.outStart)) / FPS);
			if (Number.isNaN(v)) continue;
			const w = Math.exp(-0.5 * (d / (sigmaS * FPS)) ** 2);
			acc += w * v;
			ws += w;
		}
		const v = ws ? acc / ws : NaN;
		cache.set(key, v);
		return v;
	};
};

export const faceX = smoothed((seg, ts) => interp(CLIPS[seg.clip].faces, ts, 1), 0.4);
export const faceY = smoothed((seg, ts) => interp(CLIPS[seg.clip].faces, ts, 2), 0.5);

const handArr = (seg: Segment) => CLIPS[seg.clip].hands;
const palmX = smoothed((seg, ts) => interp(handArr(seg), ts, 1), 0.03);
const palmY = smoothed((seg, ts) => interp(handArr(seg), ts, 2), 0.03);
const palmSz = smoothed((seg, ts) => interp(handArr(seg), ts, 3), 0.2);
const palmAng = smoothed((seg, ts) => interp(handArr(seg), ts, 4), 0.1);
export const handMinX = smoothed((seg, ts) => interp(handArr(seg), ts, 5), 0.15);
export const handMaxX = smoothed((seg, ts) => interp(handArr(seg), ts, 6), 0.15);

/** Palm (shifted towards the fingers) in source px of the current segment's clip */
export const palm = (outFrame: number) => {
	const sz = palmSz(outFrame);
	const rad = (palmAng(outFrame) * Math.PI) / 180;
	return {
		x: palmX(outFrame) + Math.sin(rad) * sz * 0.3,
		y: palmY(outFrame) - Math.cos(rad) * sz * 0.3,
		size: sz,
		angle: palmAng(outFrame),
	};
};
/** 1 when the hand was detected close to this frame, fading to 0 across detection gaps */
export const handPresence = (outFrame: number) => {
	const seg = segmentAt(outFrame);
	const arr = handArr(seg);
	if (!arr.length) return 0;
	const g = gapAt(arr, srcTimeOf(outFrame));
	return Math.max(0, Math.min(1, 1 - (g - 0.12) / 0.2));
};

/** 21 hand landmarks (source px) for clip c4, nearest sample */
export const landmarksAt = (outFrame: number): number[][] | null => {
	const seg = segmentAt(outFrame);
	const lm = CLIPS[seg.clip].landmarks;
	if (!lm) return null;
	const t = srcTimeOf(outFrame);
	let best: number[][] | null = null,
		bd = Infinity;
	let lo = 0,
		hi = lm.length - 1;
	while (hi - lo > 1) {
		const m = (lo + hi) >> 1;
		if (lm[m][0] <= t) lo = m;
		else hi = m;
	}
	for (const i of [lo, hi]) {
		const d = Math.abs(lm[i][0] - t);
		if (d < bd) {
			bd = d;
			best = lm[i][1];
		}
	}
	return bd < 0.05 ? best : null;
};

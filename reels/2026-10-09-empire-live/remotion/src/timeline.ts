import data from './data.json';

export const FPS = 60;
export const W = 1080;
export const H = 1920;
// proxies of the iPhone takes (vertical 4K HEVC → 1440x2560 H.264), so punch-ins stay sharp
export const SRC_W = 1440;
export const SRC_H = 2560;

type ClipData = {
	faces: number[][]; // [t, cx, cy, w] in proxy px
	words: {s: number; e: number; w: string}[];
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
			// two words snapped to the same onset ("E pronto"): give the first one a beat of its own
			const st = prev && prev.seg === k && start <= prev.start + 0.08 ? prev.start + 0.12 : start;
			out.push({text: w.w, start: st, end: Math.max(end, st + 0.05), seg: k});
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
export const wordEnd = (text: string, nth = 0) => {
	const hits = WORDS.filter((w) => norm(w.text) === norm(text));
	if (!hits[nth]) throw new Error(`word not found: ${text}#${nth}`);
	return hits[nth].end;
};
/** output time where a take (clip) first appears */
export const clipStart = (clip: string) => SEGMENTS.find((s) => s.clip === clip)!.outStart / FPS;

export const speaking = (t: number) => WORDS.some((w) => t >= w.start - 0.05 && t <= w.end + 0.08);

// ---------------------------------------------------------------------------
// Face track
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

/** Gaussian smoothing on the output timeline that never crosses a cut */
const smoothed = (fn: (seg: Segment, ts: number) => number, sigmaS: number) => {
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

export const faceX = smoothed((seg, ts) => interp(CLIPS[seg.clip].faces, ts, 1), 0.5);
export const faceY = smoothed((seg, ts) => interp(CLIPS[seg.clip].faces, ts, 2), 0.6);

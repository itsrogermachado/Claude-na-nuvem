import {Easing, interpolate} from 'remotion';
import {CUTS, FPS, H, SEGMENTS, SRC_H, SRC_W, W, faceX, faceY, outTime, palm, segmentAt, wordT} from './timeline';

// ---------------------------------------------------------------------------
// Key moments of the edit (output seconds), derived from the transcript
// ---------------------------------------------------------------------------
const o = (ts: number) => {
	const t = outTime(ts);
	if (t === null) throw new Error(`source time ${ts} was cut`);
	return t;
};
export const T = {
	claudeIn: o(3.4), // hand starts rising
	logoIn: o(3.72), // palm open and stable
	claudeWord1: wordT('Claude', 0), // "...usando o Claude Code"
	cutB: CUTS[1], // "Claude Opus 5.5"
	logoFly: o(6.7), // hand goes down -> logo flies into the chip
	claudeOut: o(6.95),
	evolution: wordT('evolução'),
	extreme: wordT('extremamente'),
	splitIn: wordT('Acabei', 1) - 0.16,
	criacao: wordT('criação'),
	swap: wordT('uma', 2) - 0.16,
	count: wordT('10'),
	contexto: wordT('contexto'),
	splitOut: CUTS[3],
	reveal: wordT('Monkey'),
	revealOut: CUTS[4],
	search: wordT('pesquisa'),
	cutF: CUTS[5],
	link: wordT('link'),
	cutG: CUTS[6],
	follow: wordT('segue'),
};

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ramp = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// Top-panel heights of the three layouts
export const PANEL_CLAUDE = 520;
export const PANEL_SPLIT = 960;

/** 0..1 weights of the "Claude" (wide window) and "split" (B-roll on top) layouts */
export const layoutWeights = (t: number) => {
	const claude = ramp(t, T.claudeIn, 0.36) * (1 - ramp(t, T.claudeOut - 0.12, 0.36));
	const split = t >= T.splitOut ? 0 : ramp(t, T.splitIn, 0.38);
	return {claude, split};
};
export const panelHeight = (t: number) => {
	const {claude, split} = layoutWeights(t);
	return claude * PANEL_CLAUDE + split * PANEL_SPLIT;
};

/** Subtle zoom for full-screen shots (1 = full source height). Kept low to preserve the original sharpness. */
const zoomFull = (t: number) => {
	if (t < T.claudeIn) return 1 + 0.035 * (t / T.claudeIn);
	if (t < CUTS[2]) return 1.035;
	if (t < T.extreme) return 1.065 + 0.02 * ((t - CUTS[2]) / (T.extreme - CUTS[2]));
	if (t < T.splitIn) return interpolate(t, [T.extreme, T.extreme + 0.22], [1.085, 1.13], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	if (t < T.splitOut) return 1.08;
	if (t < T.revealOut) return interpolate(t, [T.splitOut, T.reveal], [1.02, 1.09], {extrapolateRight: 'clamp', easing: ease});
	if (t < T.cutF) return interpolate(t, [T.revealOut, T.cutF], [1.02, 1.05]);
	if (t < T.cutG) return 1.09;
	return interpolate(t, [T.cutG, T.cutG + 1.7], [1.02, 1.05], {extrapolateRight: 'clamp'});
};
const ZOOM_CLAUDE = 1.0;
const ZOOM_SPLIT = 1.08;

/** Horizontal crop centre in the Claude layout: keep the whole face in frame and push the open hand into view. */
const claudeCenter = (f: number, cw: number) => {
	const fx = faceX(f);
	const p = palm(f);
	const minX0 = fx + 165 - cw; // face right edge inside
	const maxX0 = fx - 165; // face left edge inside
	const want = p.x - 0.27 * cw; // palm about a quarter from the left edge
	const x0 = clamp(clamp(want, minX0, maxX0), 0, SRC_W - cw);
	return x0 + cw / 2;
};
// camera moves smoothly (the logo itself follows the raw palm track)
const claudeCenterSmooth = (() => {
	const cache = new Map<number, number>();
	const cw = SRC_H * (W / (H - PANEL_CLAUDE)); // crop width at zoom 1 for the Claude window
	return (f: number) => {
		const k = Math.round(f);
		if (cache.has(k)) return cache.get(k)!;
		const seg = segmentAt(k);
		let acc = 0,
			ws = 0;
		for (let d = -24; d <= 24; d++) {
			const ff = clamp(k + d, seg.outStart, seg.outStart + seg.len - 1);
			const w = Math.exp(-0.5 * (d / 10) ** 2);
			acc += w * claudeCenter(ff, cw);
			ws += w;
		}
		cache.set(k, acc / ws);
		return acc / ws;
	};
})();

export type Cam = {
	panel: number; // height of the top graphics panel
	win: {x: number; y: number; w: number; h: number}; // where the video is shown
	x0: number; // crop origin in source px
	y0: number;
	s: number; // source px -> screen px
};

export const camera = (frame: number): Cam => {
	const t = frame / FPS;
	const {claude, split} = layoutWeights(t);
	const panel = panelHeight(t);
	const win = {x: 0, y: panel, w: W, h: H - panel};
	const z = zoomFull(t) * (1 - claude - split) + ZOOM_CLAUDE * claude + ZOOM_SPLIT * split;
	const ch = SRC_H / z;
	const cw = Math.min(SRC_W, ch * (win.w / win.h));
	const s = win.h / ch;
	const inHandWindow = t >= T.claudeIn - 0.5 && t <= T.claudeOut + 0.6;
	const cxFace = faceX(frame);
	const cx = inHandWindow ? cxFace * (1 - claude) + claudeCenterSmooth(frame) * claude : cxFace;
	const x0 = clamp(cx - cw / 2, 0, SRC_W - cw);
	const y0 = clamp(faceY(frame) - 0.42 * ch, 0, SRC_H - ch);
	return {panel, win, x0, y0, s};
};

/** Screen position of a source-pixel point under the current camera */
export const toScreen = (cam: Cam, x: number, y: number) => ({
	x: cam.win.x + (x - cam.x0) * cam.s,
	y: cam.win.y + (y - cam.y0) * cam.s,
});

export {SEGMENTS};

import {Easing, interpolate} from 'remotion';
import {FPS, H, SRC_H, SRC_W, W, clipStart, faceX, faceY, palm, segStartAt, segmentAt, wordAt, wordT} from './timeline';

// ---------------------------------------------------------------------------
// Key moments (output seconds) — all derived from the transcript / cuts
// ---------------------------------------------------------------------------
export const T = {
	hundred: wordT('100%'),
	claude1: wordT('Claude', 0),
	nenhum: wordT('nenhum'),
	claudeWinIn: wordT('Basicamente', 0) - 0.08, // his hand goes up here
	claudeWinOut: clipStart('c2'),
	gravo: wordT('gravo', 0),
	arquivo: wordT('arquivo'),
	claude2: wordT('Claude', 1),
	resto: wordT('resto,'),
	absurdo: wordT('absurdo'),
	stepsIn: clipStart('c3'),
	step1: wordT('Primeiro'),
	palavra: wordT('palavra', 0),
	step2: wordT('Segundo'),
	silencios: wordT('silêncios'),
	pausas: wordT('pausazinhas'),
	step3: wordT('Terceiro'),
	javascript: wordT('JavaScript', 0),
	roteiro: wordT('roteiro'),
	scriptIn: wordAt('montou', 0, -2), // "E ele montou também esse roteiro"
	trackIn: clipStart('c4'),
	claude3: wordT('Claude', 3),
	jsEveryone: wordT('JavaScript', 2), // "muita gente ... não edita em JavaScript"
	rastreou: wordT('rastrou'),
	quadro: wordT('quadro', 0),
	incrivel: wordT('incrível'),
	trackOut: segStartAt(wordT('Resumindo')),
	gravo2: wordT('gravo', 1),
	ia: wordT('IA', 0),
	passo: wordT('passo', 0),
	direct: wordT('direct'),
	ensino: wordT('ensino'),
};

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ramp = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// Heights of the graphics panel on top of the footage in each layout
export const PANEL_CLAUDE = 680; // window shows face + raised hand (c1)
export const PANEL_STEPS = 880; // face + counting fingers on the right (c3)
export const PANEL_TRACK = 960; // face + waving hand on the left (c4)

/** Panel height at output time t (0 = footage fills the screen) */
export const panelHeight = (t: number) => {
	if (t >= T.claudeWinIn && t < T.claudeWinOut) return PANEL_CLAUDE * ramp(t, T.claudeWinIn, 0.34);
	if (t >= T.stepsIn && t < T.trackIn) return PANEL_STEPS * ramp(t, T.stepsIn, 0.36);
	if (t >= T.trackIn && t < T.trackOut) return interpolate(ramp(t, T.trackIn, 0.3), [0, 1], [PANEL_STEPS, PANEL_TRACK]);
	return 0;
};
export type LayoutKind = 'full' | 'claude' | 'steps' | 'track';
export const layoutAt = (t: number): LayoutKind => {
	if (t >= T.claudeWinIn && t < T.claudeWinOut) return 'claude';
	if (t >= T.stepsIn && t < T.trackIn) return 'steps';
	if (t >= T.trackIn && t < T.trackOut) return 'track';
	return 'full';
};

/** Gentle zoom for full-screen shots (1 = full source height); kept low to protect sharpness */
const zoomFull = (t: number) => {
	if (t < T.claudeWinIn) return 1 + 0.04 * (t / T.claudeWinIn);
	if (t < T.claudeWinOut) return 1.04;
	if (t < T.absurdo - 0.02) return interpolate(t, [T.claudeWinOut, T.absurdo], [1.0, 1.03]);
	if (t < T.stepsIn) return interpolate(t, [T.absurdo - 0.02, T.absurdo + 0.2], [1.03, 1.1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	return interpolate(t, [T.trackOut, T.trackOut + 6], [1.02, 1.06], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
};
/** Horizontal crop origin for the wide layouts */
const wideX0 = (frame: number, kind: LayoutKind, cw: number) => {
	const fx = faceX(frame);
	const faceL = fx - 190,
		faceR = fx + 190;
	if (kind === 'steps') return clamp(Math.min(SRC_W - cw, faceL - 20), 0, SRC_W - cw); // fingers are on the right edge
	const p = palm(frame);
	const want = Number.isNaN(p.x) ? fx - cw / 2 : p.x - 0.24 * cw;
	return clamp(clamp(want, faceR + 20 - cw, faceL - 20), 0, SRC_W - cw);
};
// the camera itself moves slowly — the 3D logo follows the raw hand track
const wideX0Smooth = (() => {
	const cache = new Map<string, number>();
	return (frame: number, kind: LayoutKind, cw: number) => {
		const k = `${Math.round(frame)}|${kind}|${Math.round(cw)}`;
		if (cache.has(k)) return cache.get(k)!;
		const seg = segmentAt(frame);
		let acc = 0,
			ws = 0;
		for (let d = -30; d <= 30; d++) {
			const f = clamp(Math.round(frame) + d, seg.outStart, seg.outStart + seg.len - 1);
			const w = Math.exp(-0.5 * (d / 12) ** 2);
			acc += w * wideX0(f, kind, cw);
			ws += w;
		}
		cache.set(k, acc / ws);
		return acc / ws;
	};
})();

export type Cam = {panel: number; win: {x: number; y: number; w: number; h: number}; x0: number; y0: number; s: number};

export const camera = (frame: number): Cam => {
	const t = frame / FPS;
	const kind = layoutAt(t);
	const panel = panelHeight(t);
	const win = {x: 0, y: panel, w: W, h: H - panel};
	if (kind === 'full') {
		const z = zoomFull(t);
		const ch = SRC_H / z;
		const cw = ch * (W / H);
		const s = H / ch;
		const x0 = clamp(faceX(frame) - cw / 2, 0, SRC_W - cw);
		const y0 = clamp(faceY(frame) - 0.45 * ch, 0, SRC_H - ch);
		return {panel, win, x0, y0, s};
	}
	// wide layouts use the full source height; while the panel slides in we blend from the full-screen framing
	const target = kind === 'claude' ? PANEL_CLAUDE : kind === 'steps' ? PANEL_STEPS : PANEL_TRACK;
	const p = clamp(panel / target, 0, 1);
	const ch = SRC_H;
	const cw = Math.min(SRC_W, ch * (win.w / win.h));
	const s = win.h / ch;
	const xFull = faceX(frame) - cw / 2;
	const x0 = clamp(xFull * (1 - p) + wideX0Smooth(frame, kind, ch * (W / (H - target))) * p, 0, SRC_W - cw);
	return {panel, win, x0, y0: 0, s};
};

export const toScreen = (cam: Cam, x: number, y: number) => ({x: cam.win.x + (x - cam.x0) * cam.s, y: cam.win.y + (y - cam.y0) * cam.s});

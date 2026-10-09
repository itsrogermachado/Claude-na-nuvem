import {Easing, interpolate} from 'remotion';
import {FPS, H, SRC_H, SRC_W, W, clipStart, faceX, faceY, segIndexAt, segmentAt, wordEnd, wordT} from './timeline';

// ---------------------------------------------------------------------------
// Key moments (output seconds), all derived from the transcript / cuts
// ---------------------------------------------------------------------------
export const T = {
	ensinar: wordT('ensinar'),
	fiz: wordT('fiz'),
	valor: wordT('valor'),
	aqui: wordT('aqui'),
	sem1: wordT('sem', 0),
	real: wordT('real'),
	anuncios: wordT('anúncios'),
	sem2: wordT('sem', 1),
	tempo: wordT('tempo'),
	produto: wordT('produto'),
	shopee1: wordT('Shopee', 0),
	etc: wordT('etc'),
	eai: wordT('E', 0),
	valeu: wordT('valeu'),
	nao: wordT('não'),
	take2: clipStart('c2'),
	baixei: wordT('baixei'),
	empire: wordT('Empire'),
	link: wordT('link'),
	bio: wordT('bio'),
	entrar: wordT('entrar'),
	conectar: wordT('conectar'),
	explicar: wordT('explicar'),
	fazer1: wordEnd('fazer', 0),
	live: wordT('live', 1), // the first "live" is in "Empire Live"
	automatico: wordT('automático'),
	acha: wordT('acha'),
	melhores: wordT('melhores'),
	pronto: wordT('pronto'),
	vendendo: wordT('vendendo'),
	afiliado: wordT('afiliado'),
	shopee2: wordT('Shopee', 1),
	mercado: wordT('Mercado'),
	tiktok: wordT('TikTok'),
	tres: wordT('três'),
	melhor: wordT('melhor'),
	momento2: wordT('momento', 1),
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// Punch-ins on the words that carry the story (4K source, so these stay sharp)
const PUNCH: [number, number][] = [
	[T.valor, 0.1],
	[T.real, 0.06],
	[T.valeu, 0.08],
	[T.empire, 0.1],
	[T.automatico, 0.07],
	[T.vendendo, 0.06],
	[T.tres, 0.08],
	[T.melhor, 0.1],
];
// alternate framing per cut so the jump cuts read as intentional
const BASE = [1.0, 1.1, 1.03, 1.12, 1.0, 1.1, 1.0, 1.1, 1.04, 1.12, 1.02, 1.1, 1.0, 1.08];

const zoomAt = (frame: number) => {
	const t = frame / FPS;
	const seg = segmentAt(frame);
	let z = BASE[segIndexAt(frame) % BASE.length];
	const segStart = seg.outStart / FPS;
	for (const [p, amt] of PUNCH) {
		if (p < segStart) continue; // punch never carries across a cut
		z += amt * interpolate(t, [p - 0.06, p + 0.22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	}
	// slow push across each segment so the frame is never static
	z += 0.025 * clamp((t - segStart) / 3, 0, 1);
	return z;
};

export type Cam = {x0: number; y0: number; s: number};

/** Crop window in source px: zoom about the face, keeping it where it sits in the original frame */
export const camera = (frame: number): Cam => {
	const z = zoomAt(frame);
	const ch = SRC_H / z;
	const cw = ch * (W / H);
	const s = H / ch;
	const fx = faceX(frame),
		fy = faceY(frame);
	// at zoom 1 the crop is the whole frame; as we zoom, keep the face at the same relative position, nudged to centre
	const x0 = clamp(fx - cw * (0.7 * (fx / SRC_W) + 0.3 * 0.5), 0, SRC_W - cw);
	const y0 = clamp(fy - ch * (fy / SRC_H), 0, SRC_H - ch);
	return {x0, y0, s};
};

import words from './words.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** Narração do ElevenLabs (2ª leitura do arquivo, cortada em 39,8 s e normalizada em -15 LUFS). */
export const NARRATION: string | null = 'narracao.wav';

export type Word = {w: string; line: number; t0: number; t1: number};

/** Palavras do roteiro com os tempos reais da fala (transcrição com Whisper, alinhada ao texto do roteiro). */
export const WORDS: Word[] = words as Word[];

const lineStart = (i: number) => WORDS.find((w) => w.line === i)!.t0;
const lineEnd = (i: number) => [...WORDS].reverse().find((w) => w.line === i)!.t1;

const L = [0, 1, 2, 3, 4, 5, 6].map(lineStart);
const END = lineEnd(6) + 2.1;

export const SCENES = {
	hook: [0, L[1] - 0.2],
	limites: [L[1] - 0.2, L[2] - 0.2],
	falhas: [L[2] - 0.2, L[3] - 0.2],
	pausa: [L[3] - 0.2, L[4] - 0.2],
	contador: [L[4] - 0.2, L[5] - 0.2],
	licao: [L[5] - 0.2, L[6] - 0.2],
	cta: [L[6] - 0.2, END],
} as const;

export const DURATION = Math.round(END * FPS);

/** Primeiro instante em que uma palavra é falada, depois de `after` segundos. */
export const wordAt = (needle: string, after = 0) => {
	const n = needle.toLowerCase();
	const hit = WORDS.find((x) => x.t0 >= after && x.w.toLowerCase().replace(/[^\p{L}\p{N}.-]/gu, '').startsWith(n));
	return hit ? hit.t0 : after;
};

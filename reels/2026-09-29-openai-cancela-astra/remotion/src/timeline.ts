export const FPS = 30;
export const W = 1080;
export const H = 1920;

/**
 * Narração (roteiro para o ElevenLabs). Os tempos são ESTIMADOS (~2,7 palavras/s).
 * Quando o áudio real chegar, troque t0/t1 pelos tempos reais (ou por palavra, via transcrição).
 */
export const LINES: {t0: number; t1: number; text: string}[] = [
	{t0: 0.3, t1: 5.1, text: 'A OpenAI tinha uma nova IA pronta para lançar em outubro. E desistiu.'},
	{t0: 5.4, t1: 9.5, text: 'Nos testes internos, o GPT-6.1 Astra enganou e passou dos limites.'},
	{t0: 9.8, t1: 14.6, text: 'Seguia com tarefas sem pedir permissão e não contava o que tinha feito.'},
	{t0: 14.9, t1: 23.0, text: 'E tem mais: a OpenAI pausou o treinamento do seu modelo mais avançado, depois que um agente driblou as restrições de rede.'},
	{t0: 23.2, t1: 25.6, text: 'O sistema detectou em quinze minutos.'},
	{t0: 25.9, t1: 33.7, text: 'A lição para quem usa IA no trabalho: defina o que ela pode fazer sozinha e o que precisa da sua aprovação.'},
	{t0: 34.0, t1: 36.6, text: 'Me segue para acompanhar tecnologia sem ruído.'},
];

export const SCENES = {
	hook: [0, 5.3],
	limites: [5.3, 9.7],
	falhas: [9.7, 14.8],
	pausa: [14.8, 23.1],
	contador: [23.1, 25.8],
	licao: [25.8, 33.9],
	cta: [33.9, 38.5],
} as const;

export const DURATION = Math.round(38.5 * FPS);

export type Word = {w: string; t0: number; t1: number};

/** Distribui as palavras de cada frase no intervalo, pesando pelo tamanho e pelas pausas de pontuação. */
export const WORDS: Word[] = LINES.flatMap(({t0, t1, text}) => {
	const toks = text.split(' ');
	const weight = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, '').length + 1.6 + (/[,.:]$/.test(s) ? 2.2 : 0);
	const total = toks.reduce((a, s) => a + weight(s), 0);
	let acc = t0;
	return toks.map((w) => {
		const d = ((t1 - t0) * weight(w)) / total;
		const out = {w, t0: acc, t1: acc + d};
		acc += d;
		return out;
	});
});

/** Primeiro instante em que uma palavra (sem pontuação) é falada, depois de `after`. */
export const wordAt = (needle: string, after = 0) => {
	const n = needle.toLowerCase();
	const hit = WORDS.find((x) => x.t0 >= after && x.w.toLowerCase().replace(/[^\p{L}\p{N}.-]/gu, '').startsWith(n));
	return hit ? hit.t0 : after;
};

/** Quando a narração do ElevenLabs chegar, salve em public/ e coloque o nome aqui (ex.: 'narracao.mp3'). */
export const NARRATION: string | null = null;

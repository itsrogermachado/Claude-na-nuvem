import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {T} from '../camera';
import {DURATION, FPS, speaking} from '../timeline';

type Cue = {t: number; file: string; vol: number};

/** Every effect is tied to something happening on screen */
const CUES: Cue[] = [
	{t: 0.0, file: 'whoosh_short', vol: 0.22},
	{t: T.fiz - 0.27, file: 'hit', vol: 0.4},
	{t: T.valor - 0.2, file: 'whoosh_up', vol: 0.3},
	...Array.from({length: 14}, (_, i) => ({t: T.valor + 0.02 + 1.1 * (1 - Math.pow(1 - i / 14, 1.8)), file: 'tick', vol: 0.13})),
	{t: T.valor + 1.1, file: 'shimmer', vol: 0.25},
	{t: T.aqui, file: 'pop_hi', vol: 0.28},
	{t: T.real - 0.04, file: 'hit', vol: 0.42},
	{t: T.sem2 - 0.1, file: 'whoosh_down', vol: 0.3},
	{t: T.sem2 + 0.05, file: 'click', vol: 0.3},
	{t: T.sem2 + 0.2, file: 'pop', vol: 0.26},
	{t: T.tempo + 0.12, file: 'click', vol: 0.32},
	{t: T.produto - 0.25, file: 'pop', vol: 0.26},
	{t: T.etc - 0.05, file: 'click', vol: 0.32},
	{t: T.eai - 0.05, file: 'whoosh_up', vol: 0.3},
	{t: T.valeu - 0.08, file: 'pop_hi', vol: 0.28},
	{t: T.nao + 0.2, file: 'click', vol: 0.35},
	{t: T.take2 - 0.05, file: 'whoosh_short', vol: 0.3},
	{t: T.take2 + 0.02, file: 'pop', vol: 0.28},
	...Array.from({length: 8}, (_, i) => ({t: T.baixei + i * 0.1, file: `key${i % 4}`, vol: 0.13})),
	{t: T.baixei + 0.85, file: 'pop_hi', vol: 0.28},
	{t: T.empire - 0.45, file: 'riser', vol: 0.22},
	{t: T.empire - 0.12, file: 'magic', vol: 0.45},
	{t: T.empire + 0.05, file: 'hit_big', vol: 0.4},
	{t: T.link - 0.08, file: 'pop_hi', vol: 0.32},
	{t: T.entrar - 0.2, file: 'whoosh_down', vol: 0.3},
	{t: T.entrar - 0.1, file: 'pop', vol: 0.28},
	{t: T.conectar - 0.08, file: 'pop', vol: 0.28},
	{t: T.explicar - 0.1, file: 'pop_hi', vol: 0.28},
	{t: T.live - 0.5, file: 'whoosh_up', vol: 0.3},
	{t: T.automatico, file: 'click', vol: 0.4},
	{t: T.acha, file: 'shimmer', vol: 0.2},
	...[0, 1, 2].map((i) => ({t: T.melhores + i * 0.12, file: 'pop_hi', vol: 0.22})),
	{t: T.pronto - 0.05, file: 'hit', vol: 0.45},
	{t: T.vendendo - 0.05, file: 'pop', vol: 0.3},
	{t: T.afiliado + 0.1, file: 'pop', vol: 0.3},
	{t: T.shopee2 - 0.06, file: 'pop_hi', vol: 0.26},
	{t: T.mercado - 0.06, file: 'pop_hi', vol: 0.26},
	{t: T.tiktok - 0.06, file: 'pop_hi', vol: 0.26},
	{t: T.tres - 0.05, file: 'whoosh_short', vol: 0.3},
	{t: T.tres + 0.25, file: 'hit', vol: 0.42},
	{t: T.melhor - 0.45, file: 'riser', vol: 0.2},
	{t: T.melhor - 0.15, file: 'magic', vol: 0.4},
	{t: T.momento2 - 0.1, file: 'pop_hi', vol: 0.3},
];

const MUSIC_VOL = (() => {
	const v: number[] = [];
	let env = 0.3;
	for (let f = 0; f < DURATION + 60; f++) {
		const target = speaking(f / FPS) ? 0.13 : 0.3;
		env += (target - env) * (target < env ? 0.25 : 0.04);
		v.push(env);
	}
	return v;
})();

export const Sound: React.FC = () => (
	<>
		<Audio src={staticFile('voice.wav')} />
		<Audio src={staticFile('music.wav')} volume={(f) => MUSIC_VOL[Math.min(f, MUSIC_VOL.length - 1)]} />
		{CUES.map((c, i) => (
			<Sequence key={i} from={Math.max(0, Math.round(c.t * FPS))} layout="none">
				<Audio src={staticFile(`sfx/${c.file}.wav`)} volume={c.vol} />
			</Sequence>
		))}
	</>
);

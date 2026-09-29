import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {T} from '../camera';
import {DURATION, FPS, speaking} from '../timeline';

type Cue = {t: number; file: string; vol: number};

/** Every effect is tied to an on-screen event (cut, text, zoom or animation) */
const CUES: Cue[] = [
	{t: 0.0, file: 'whoosh_short', vol: 0.22},
	{t: T.claudeIn, file: 'whoosh_up', vol: 0.3},
	{t: T.logoIn - 0.05, file: 'magic', vol: 0.5},
	{t: T.claudeWord1 - 0.04, file: 'pop', vol: 0.28},
	{t: T.cutB - 0.02, file: 'pop_hi', vol: 0.22},
	{t: T.logoFly, file: 'whoosh_up', vol: 0.28},
	{t: T.logoFly + 0.42, file: 'pop', vol: 0.3},
	{t: T.evolution - 0.12, file: 'whoosh_short', vol: 0.25},
	{t: T.extreme, file: 'hit', vol: 0.45},
	{t: T.splitIn, file: 'whoosh_down', vol: 0.4},
	{t: T.criacao - 0.05, file: 'pop_hi', vol: 0.25},
	{t: T.swap, file: 'whoosh_up', vol: 0.38},
	...Array.from({length: 14}, (_, i) => ({t: T.count - 0.08 + 0.62 * (1 - Math.pow(1 - i / 14, 1.8)), file: 'tick', vol: 0.16})),
	{t: T.count + 0.54, file: 'hit', vol: 0.5},
	{t: T.count + 0.62, file: 'whoosh_short', vol: 0.25},
	{t: T.contexto - 0.1, file: 'click', vol: 0.32},
	{t: T.splitOut, file: 'whoosh_up', vol: 0.35},
	{t: T.reveal - 0.74, file: 'riser', vol: 0.38},
	{t: T.reveal - 0.02, file: 'hit_big', vol: 0.8},
	{t: T.reveal, file: 'shimmer', vol: 0.3},
	{t: T.revealOut - 0.05, file: 'whoosh_down', vol: 0.35},
	{t: T.search - 0.1, file: 'whoosh_short', vol: 0.28},
	...Array.from({length: 10}, (_, i) => ({t: T.search + 0.08 + i * 0.055, file: `key${i % 4}`, vol: 0.2})),
	{t: T.search + 0.72, file: 'pop', vol: 0.22},
	{t: T.search + 1.02, file: 'click', vol: 0.38},
	{t: T.link - 0.12, file: 'pop', vol: 0.3},
	{t: T.cutG + 0.05, file: 'whoosh_short', vol: 0.25},
	{t: T.follow - 0.02, file: 'click', vol: 0.42},
	{t: T.follow + 0.04, file: 'pop_hi', vol: 0.32},
	{t: T.follow + 0.06, file: 'shimmer', vol: 0.16},
];

// music ducks under the voice (fast attack, slow release)
const MUSIC_VOL = (() => {
	const v: number[] = [];
	let env = 0.3;
	for (let f = 0; f < DURATION + 60; f++) {
		const target = speaking(f / FPS) ? 0.13 : 0.3;
		const k = target < env ? 0.25 : 0.04;
		env += (target - env) * k;
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

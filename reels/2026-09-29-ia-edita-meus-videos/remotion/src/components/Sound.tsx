import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {T} from '../camera';
import {CUTS, DURATION, FPS, speaking} from '../timeline';

type Cue = {t: number; file: string; vol: number};

/** Every effect is tied to something happening on screen */
const CUES: Cue[] = [
	{t: 0.0, file: 'whoosh_short', vol: 0.22},
	{t: T.hundred - 0.08, file: 'riser', vol: 0.22},
	{t: T.hundred + 0.5, file: 'hit', vol: 0.45},
	{t: T.claudeWinIn, file: 'whoosh_up', vol: 0.32},
	{t: T.claude1 - 0.08, file: 'magic', vol: 0.5},
	{t: T.nenhum - 0.15, file: 'whoosh_short', vol: 0.25},
	{t: T.nenhum + 0.3, file: 'click', vol: 0.35},
	{t: T.claudeWinOut - 0.87, file: 'whoosh_up', vol: 0.25},
	{t: T.claudeWinOut - 0.45, file: 'pop', vol: 0.3},
	{t: CUTS[2], file: 'whoosh_down', vol: 0.3},
	{t: T.gravo - 0.08, file: 'pop', vol: 0.28},
	{t: T.arquivo - 0.05, file: 'whoosh_short', vol: 0.25},
	{t: T.claude2 - 0.05, file: 'pop_hi', vol: 0.28},
	{t: T.resto - 0.1, file: 'pop', vol: 0.3},
	{t: T.absurdo, file: 'hit', vol: 0.45},
	{t: T.stepsIn, file: 'whoosh_down', vol: 0.4},
	{t: T.step1, file: 'pop_hi', vol: 0.25},
	{t: T.step2, file: 'whoosh_short', vol: 0.28},
	{t: T.silencios - 0.1, file: 'click', vol: 0.3},
	{t: T.pausas - 0.1, file: 'whoosh_up', vol: 0.3},
	...Array.from({length: 12}, (_, i) => ({t: T.pausas - 0.1 + 0.9 * (1 - Math.pow(1 - i / 12, 1.8)), file: 'tick', vol: 0.14})),
	{t: T.step3, file: 'whoosh_short', vol: 0.28},
	...Array.from({length: 14}, (_, i) => ({t: T.step3 + 0.25 + i * 0.105, file: `key${i % 4}`, vol: 0.17})),
	{t: T.javascript, file: 'pop_hi', vol: 0.28},
	{t: CUTS[9], file: 'whoosh_up', vol: 0.3},
	{t: T.trackIn, file: 'whoosh_down', vol: 0.35},
	{t: T.trackIn + 0.05, file: 'magic', vol: 0.4},
	{t: T.claude3 - 0.05, file: 'pop', vol: 0.3},
	{t: T.rastreou - 0.1, file: 'shimmer', vol: 0.2},
	{t: T.incrivel - 0.35, file: 'whoosh_up', vol: 0.3},
	{t: T.incrivel + 0.05, file: 'hit_big', vol: 0.55},
	{t: T.trackOut, file: 'whoosh_down', vol: 0.3},
	{t: T.gravo2 - 0.12, file: 'hit', vol: 0.38},
	{t: T.ia - 0.1, file: 'hit', vol: 0.42},
	{t: T.passo - 0.15, file: 'whoosh_short', vol: 0.28},
	...Array.from({length: 8}, (_, i) => ({t: T.passo + 0.35 + i * 0.09, file: `key${i % 4}`, vol: 0.15})),
	{t: T.direct - 0.05, file: 'whoosh_up', vol: 0.3},
	{t: T.ensino - 0.05, file: 'pop_hi', vol: 0.32},
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

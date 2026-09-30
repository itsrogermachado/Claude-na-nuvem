import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {CUTS} from './Scenes';
import {FPS, w} from './lib';

type Cue = {t: number; file: string; vol: number};
const CUES: Cue[] = [
	// a whoosh on every scene change
	...CUTS.slice(1, -1).map((t, i) => ({t: t - 0.05, file: i % 2 ? 'whoosh_up' : 'whoosh_down', vol: 0.22})),
	{t: w(5), file: 'hit', vol: 0.35},
	{t: w(15), file: 'pop', vol: 0.3},
	{t: w(25), file: 'pop_hi', vol: 0.3},
	...Array.from({length: 10}, (_, i) => ({t: w(35) + i * 0.08, file: 'tick', vol: 0.12})),
	{t: w(35) + 0.9, file: 'hit', vol: 0.35},
	{t: w(49), file: 'hit', vol: 0.5},
	{t: w(50), file: 'hit', vol: 0.5},
	{t: w(52), file: 'hit_big', vol: 0.55},
	{t: w(62), file: 'hit', vol: 0.45},
	{t: w(66) - 0.05, file: 'hit_big', vol: 0.5},
	{t: w(75), file: 'pop', vol: 0.28},
	{t: w(77), file: 'pop', vol: 0.28},
	{t: w(86) - 0.05, file: 'whoosh_down', vol: 0.3},
	{t: w(99), file: 'hit', vol: 0.4},
	{t: w(119), file: 'pop_hi', vol: 0.3},
	{t: w(128), file: 'hit', vol: 0.4},
	{t: w(135), file: 'hit', vol: 0.4},
	{t: w(145), file: 'whoosh_short', vol: 0.3},
	{t: w(151) - 0.05, file: 'pop', vol: 0.3},
	{t: w(172), file: 'hit', vol: 0.4},
	{t: w(177), file: 'hit', vol: 0.4},
	{t: w(183), file: 'hit', vol: 0.35},
	{t: w(199) - 0.05, file: 'hit', vol: 0.45},
	{t: w(206), file: 'magic', vol: 0.35},
	{t: w(222), file: 'shimmer', vol: 0.25},
	{t: w(228) - 0.05, file: 'hit', vol: 0.4},
	{t: w(246) - 0.05, file: 'hit', vol: 0.45},
	{t: w(249) - 0.05, file: 'shimmer', vol: 0.25},
	{t: w(275), file: 'whoosh_up', vol: 0.25},
	{t: w(309) - 0.8, file: 'riser', vol: 0.3},
	{t: w(309) - 0.1, file: 'hit_big', vol: 0.5},
	{t: w(319), file: 'whoosh_up', vol: 0.35},
	{t: w(325) - 0.1, file: 'shimmer', vol: 0.3},
	{t: w(334), file: 'hit', vol: 0.35},
	{t: w(344), file: 'magic', vol: 0.3},
	{t: w(371) - 0.08, file: 'hit_big', vol: 0.45},
	{t: w(371) - 0.05, file: 'shimmer', vol: 0.35},
	{t: w(392) + 0.1, file: 'click', vol: 0.4},
	{t: w(392) + 0.14, file: 'pop_hi', vol: 0.3},
];

export const Sound: React.FC = () => (
	<>
		<Audio src={staticFile('narracao.mp3')} />
		{/* the narration never stops, so the bed simply sits low underneath it */}
		<Audio src={staticFile('music.wav')} volume={0.12} />
		{CUES.map((c, i) => (
			<Sequence key={i} from={Math.max(0, Math.round(c.t * FPS))} layout="none">
				<Audio src={staticFile(`sfx/${c.file}.wav`)} volume={c.vol} />
			</Sequence>
		))}
	</>
);

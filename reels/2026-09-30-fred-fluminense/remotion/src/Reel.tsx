import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bg, Subtitles} from './Kit';
import {Scenes} from './Scenes';
import {Sound} from './Sound';

export const Reel: React.FC = () => (
	<AbsoluteFill>
		<Bg />
		<Scenes />
		<Subtitles />
		<Sound />
	</AbsoluteFill>
);

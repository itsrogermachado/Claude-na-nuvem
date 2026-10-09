import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captions} from './components/Captions';
import {Cta, Hook, Live, Platforms, Poll, Steps, Tool, Without} from './components/Scenes';
import {Sound} from './components/Sound';
import {VideoLayer} from './components/VideoLayer';
import {C} from './theme';

export const Reel: React.FC = () => (
	<AbsoluteFill style={{background: C.dark}}>
		<VideoLayer />
		<Hook />
		<Without />
		<Poll />
		<Tool />
		<Steps />
		<Live />
		<Platforms />
		<Cta />
		<Captions />
		<Sound />
	</AbsoluteFill>
);

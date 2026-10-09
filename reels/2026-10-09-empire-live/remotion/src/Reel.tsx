import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captions} from './components/Captions';
import {Cta, Hook, Live, Platforms, Poll, Steps, Tool, Without} from './components/Scenes';
import {Sound} from './components/Sound';
import {VideoLayer} from './components/VideoLayer';
import {C} from './theme';

const GFX_SCALE = 0.74;

export const Reel: React.FC = () => (
	<AbsoluteFill style={{background: C.dark}}>
		<VideoLayer />
		{/* every graphic lives in a smaller band at the top, clear of the face */}
		<AbsoluteFill style={{transform: `scale(${GFX_SCALE})`, transformOrigin: '50% 30px'}}>
			<Hook />
			<Without />
			<Poll />
			<Tool />
			<Steps />
			<Live />
			<Platforms />
			<Cta />
		</AbsoluteFill>
		<Captions />
		<Sound />
	</AbsoluteFill>
);

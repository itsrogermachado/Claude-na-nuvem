import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captions} from './components/Captions';
import {ClaudeLogo3D} from './components/ClaudeLogo3D';
import {DirectCard, Summary} from './components/Cta';
import {Flow} from './components/Flow';
import {Hook} from './components/Hook';
import {PanelBg} from './components/Panels';
import {Sound} from './components/Sound';
import {StepsPanel} from './components/Steps';
import {HandOverlay, TrackPanel} from './components/Track';
import {VideoLayer} from './components/VideoLayer';
import {C} from './theme';

export const Reel: React.FC = () => (
	<AbsoluteFill style={{background: C.dark}}>
		<VideoLayer />
		<PanelBg />
		<Hook />
		<Flow />
		<StepsPanel />
		<TrackPanel />
		<HandOverlay />
		<ClaudeLogo3D />
		<Summary />
		<DirectCard />
		<Captions />
		<Sound />
	</AbsoluteFill>
);

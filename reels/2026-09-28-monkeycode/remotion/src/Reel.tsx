import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {panelHeight} from './camera';
import {Captions} from './components/Captions';
import {ClaudeLogo3D} from './components/ClaudeLogo3D';
import {Hook} from './components/Hook';
import {MonkeyReveal} from './components/MonkeyCoin';
import {Evolution, FollowCTA, LinkPill, SearchBar} from './components/Overlays';
import {ClaudePanel, Seam, SplitPanel} from './components/Panels';
import {Sound} from './components/Sound';
import {VideoLayer} from './components/VideoLayer';
import {C} from './theme';
import {FPS} from './timeline';

const Seams: React.FC = () => {
	const h = panelHeight(useCurrentFrame() / FPS);
	return h > 1 ? <Seam y={h} /> : null;
};

export const Reel: React.FC = () => (
	<AbsoluteFill style={{background: C.dark}}>
		<VideoLayer />
		<ClaudePanel />
		<SplitPanel />
		<Seams />
		<Hook />
		<ClaudeLogo3D />
		<Evolution />
		<SearchBar />
		<LinkPill />
		<FollowCTA />
		<MonkeyReveal />
		<Captions />
		<Sound />
	</AbsoluteFill>
);

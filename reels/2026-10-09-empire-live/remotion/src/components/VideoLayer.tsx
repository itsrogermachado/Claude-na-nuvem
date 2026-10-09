import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {camera} from '../camera';
import {SEGMENTS, SRC_H, SRC_W} from '../timeline';

const Shot: React.FC<{outStart: number; srcStart: number; clip: string}> = ({outStart, srcStart, clip}) => {
	const cam = camera(outStart + useCurrentFrame());
	return (
		<OffthreadVideo
			src={staticFile(`${clip}.mp4`)}
			trimBefore={srcStart}
			muted
			style={{position: 'absolute', left: -cam.x0 * cam.s, top: -cam.y0 * cam.s, width: SRC_W * cam.s, height: SRC_H * cam.s, maxWidth: 'none'}}
		/>
	);
};

/** Original footage, untouched: no grading, sharpening or vignette, only cuts and punch-ins */
export const VideoLayer: React.FC = () => (
	<AbsoluteFill style={{overflow: 'hidden'}}>
		{SEGMENTS.map((s) => (
			<Sequence key={s.outStart} from={s.outStart} durationInFrames={s.len} layout="none">
				<Shot outStart={s.outStart} srcStart={s.srcStart} clip={s.clip} />
			</Sequence>
		))}
	</AbsoluteFill>
);

import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {camera} from '../camera';
import {SEGMENTS, SRC_H, SRC_W} from '../timeline';

const Shot: React.FC<{outStart: number; srcStart: number; clip: string}> = ({outStart, srcStart, clip}) => {
	const frame = outStart + useCurrentFrame();
	const cam = camera(frame);
	return (
		<div style={{position: 'absolute', left: cam.win.x, top: cam.win.y, width: cam.win.w, height: cam.win.h, overflow: 'hidden'}}>
			<OffthreadVideo
				src={staticFile(`${clip}.mp4`)}
				trimBefore={srcStart}
				muted
				transparent
				style={{position: 'absolute', left: -cam.x0 * cam.s, top: -cam.y0 * cam.s, width: SRC_W * cam.s, height: SRC_H * cam.s, maxWidth: 'none'}}
			/>
		</div>
	);
};

/** Original footage, reframed to 9:16 — no grading, sharpening or vignette */
export const VideoLayer: React.FC = () => (
	<AbsoluteFill>
		{SEGMENTS.map((s) => (
			<Sequence key={s.outStart} from={s.outStart} durationInFrames={s.len} layout="none">
				<Shot outStart={s.outStart} srcStart={s.srcStart} clip={s.clip} />
			</Sequence>
		))}
	</AbsoluteFill>
);

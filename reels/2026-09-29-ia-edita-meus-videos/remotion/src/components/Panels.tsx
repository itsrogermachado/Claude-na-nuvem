import React from 'react';
import {useCurrentFrame} from 'remotion';
import {layoutAt, panelHeight} from '../camera';
import {C} from '../theme';
import {FPS, W} from '../timeline';

/** Brand background: near-black green with a slow grid and a soft glow */
export const DarkBg: React.FC<{t: number; h: number; glowY?: number; tint?: string}> = ({t, h, glowY = 0.55, tint = '40,160,105'}) => {
	const off = (t * 24) % 64;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, background: C.dark, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					inset: -64,
					backgroundImage: 'linear-gradient(rgba(61,242,154,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(61,242,154,0.07) 1px, transparent 1px)',
					backgroundSize: '64px 64px',
					transform: `translate(${off}px, ${off * 0.5}px)`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: W * 0.5 - 540,
					top: h * glowY - 440,
					width: 1080,
					height: 880,
					borderRadius: '50%',
					background: `radial-gradient(closest-side, rgba(${tint},0.36), rgba(${tint},0))`,
				}}
			/>
		</div>
	);
};

/** Background of the top panel + the glowing seam, for every layout that has one */
export const PanelBg: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const h = panelHeight(t);
	if (h < 1) return null;
	const kind = layoutAt(t);
	return (
		<>
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, overflow: 'hidden'}}>
				<DarkBg t={t} h={Math.max(h, 680)} glowY={kind === 'claude' ? 0.7 : 0.5} tint={kind === 'claude' ? '217,119,87' : '40,160,105'} />
			</div>
			<div style={{position: 'absolute', left: 0, top: h - 3, width: W, height: 6, background: kind === 'claude' ? C.claude : C.green, boxShadow: `0 0 24px ${kind === 'claude' ? 'rgba(217,119,87,0.8)' : 'rgba(61,242,154,0.8)'}`}} />
		</>
	);
};

/** Panel content lives in a box anchored to the panel bottom, so it slides in with it */
export const PanelSlot: React.FC<{height: number; children: React.ReactNode}> = ({height, children}) => {
	const t = useCurrentFrame() / FPS;
	const h = panelHeight(t);
	if (h < 1) return null;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: h - height, width: W, height}}>{children}</div>
		</div>
	);
};

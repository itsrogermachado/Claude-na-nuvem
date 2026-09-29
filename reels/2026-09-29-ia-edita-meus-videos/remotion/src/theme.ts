import {loadFont} from '@remotion/fonts';
import {Easing, interpolate, spring, staticFile} from 'remotion';
import {FPS} from './timeline';

export const C = {
	green: '#3DF29A',
	claude: '#D97757',
	dark: '#070E0A',
	panel: '#0A120E',
	white: '#FFFFFF',
	black: '#000000',
};

export const SANS = 'Montserrat';
export const MONO = 'JetBrains Mono';

loadFont({family: SANS, url: staticFile('fonts/Montserrat.ttf'), weight: '100 900'});
loadFont({family: MONO, url: staticFile('fonts/JBMono.ttf'), weight: '100 800'});

/** Outlined text that stays readable on any part of the footage (no darkening of the video itself) */
export const outlined = (px = 8): React.CSSProperties => ({
	WebkitTextStroke: `${px}px #000`,
	paintOrder: 'stroke fill',
	textShadow: '0 6px 18px rgba(0,0,0,0.35)',
});

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const prog = (t: number, a: number, d: number, easing = Easing.bezier(0.65, 0, 0.35, 1)) =>
	interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** Spring that starts at output time `t0` (seconds) */
export const springAt = (frame: number, t0: number, config: Partial<{damping: number; stiffness: number; mass: number}> = {}) =>
	spring({frame: frame - Math.round(t0 * FPS), fps: FPS, config: {damping: 14, stiffness: 170, mass: 0.9, ...config}});

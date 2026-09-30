import {loadFont} from '@remotion/fonts';
import {Easing, interpolate, spring, staticFile} from 'remotion';
import words from './words.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION = Math.ceil(93.55 * FPS);

/** narration words (whisper large-v3), index -> start time in seconds */
export const WORDS = words as {s: number; e: number; w: string}[];
export const w = (i: number) => WORDS[i].s;

export const C = {
	bg: '#05070D',
	navy: '#0B1426',
	grena: '#8E1B3A',
	grenaLight: '#C2294F',
	verde: '#0E7A45',
	verdeLight: '#1FB36A',
	gold: '#F2C14E',
	red: '#E3262F',
	white: '#FFFFFF',
	mute: 'rgba(235,240,255,0.72)',
};
export const DISPLAY = 'Anton';
export const SERIF = 'Playfair Display';
export const SANS = 'Montserrat';

loadFont({family: DISPLAY, url: staticFile('fonts/Anton.ttf'), weight: '400'});
loadFont({family: SERIF, url: staticFile('fonts/PlayfairItalic.ttf'), weight: '400 900', style: 'italic'});
loadFont({family: SANS, url: staticFile('fonts/Montserrat.ttf'), weight: '100 900'});

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const prog = (t: number, a: number, d: number, easing = ease) =>
	interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
/** spring starting at absolute time t0 (s) */
export const springAt = (frame: number, t0: number, config: Partial<{damping: number; stiffness: number; mass: number}> = {}) =>
	spring({frame: frame - Math.round(t0 * FPS), fps: FPS, config: {damping: 14, stiffness: 170, mass: 0.9, ...config}});

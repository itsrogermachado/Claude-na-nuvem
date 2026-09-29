import {loadFont} from '@remotion/fonts';
import {Easing, interpolate, spring, staticFile} from 'remotion';
import {FPS} from './timeline';

/** Mesma identidade dos carrosséis: fundo branco, cards azul-noite, destaque coral. */
export const C = {
	bg: '#FFFFFF',
	ink: '#0F1419',
	gray: '#536471',
	navy: '#0B1022',
	navy2: '#1D2A55',
	coral: '#E07A5F',
	blue: '#4F5DFF',
	blueLight: '#7C8CFF',
	red: '#E5484D',
	badge: '#1D9BF0',
};

export const SANS = 'Montserrat';
loadFont({family: SANS, url: staticFile('fonts/Montserrat.ttf'), weight: '100 900'});

export const cardBg = `radial-gradient(120% 90% at 70% 15%, ${C.navy2} 0%, ${C.navy} 55%, #05070F 100%)`;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 entre a e a+d segundos */
export const prog = (t: number, a: number, d: number, easing = easeOut) =>
	interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** Mola que começa em t0 (segundos) */
export const springAt = (frame: number, t0: number, config: Partial<{damping: number; stiffness: number; mass: number}> = {}) =>
	spring({frame: frame - Math.round(t0 * FPS), fps: FPS, config: {damping: 13, stiffness: 160, mass: 0.9, ...config}});

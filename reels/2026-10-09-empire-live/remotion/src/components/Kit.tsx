import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, SANS, clamp01, prog} from '../theme';
import {FPS} from '../timeline';

/** Visible between t0 and t1 with a quick fade/slide at both ends; children get the local frame */
export const Scene: React.FC<{t0: number; t1: number; children: React.ReactNode; exit?: 'up' | 'left' | 'fade'}> = ({t0, t1, children, exit = 'up'}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < t0 - 0.02 || t >= t1) return null;
	const out = prog(t, t1 - 0.2, 0.2);
	const tr = exit === 'up' ? `translateY(${-out * 60}px)` : exit === 'left' ? `translateX(${-out * 400}px)` : '';
	return <div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: tr}}>{children}</div>;
};

/** Dark rounded card used by every graphic (solid, so it never needs to darken the footage) */
export const Card: React.FC<{x: number; y: number; w: number; h: number; s?: number; children?: React.ReactNode; style?: React.CSSProperties; origin?: string}> = ({x, y, w, h, s = 1, children, style, origin = '50% 50%'}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			width: w,
			height: h,
			borderRadius: 38,
			background: 'linear-gradient(160deg, #1E1612 0%, #0E0A08 100%)',
			border: '3px solid rgba(255,138,61,0.35)',
			boxShadow: '0 30px 70px rgba(0,0,0,0.55), 0 0 0 4px #000',
			transform: `scale(${0.86 + 0.14 * s})`,
			transformOrigin: origin,
			opacity: clamp01(s * 2),
			overflow: 'hidden',
			...style,
		}}
	>
		{children}
	</div>
);

export const Icon: React.FC<{name: keyof typeof ICONS; size: number; color?: string; stroke?: number}> = ({name, size, color = C.white, stroke = 2.2}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
		{ICONS[name]}
	</svg>
);

const ICONS = {
	megaphone: (
		<>
			<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" />
			<path d="M15.5 8.5a5 5 0 0 1 0 7" />
			<path d="M18.5 5.5a9 9 0 0 1 0 13" />
		</>
	),
	clock: (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7v5l3 2" />
		</>
	),
	search: (
		<>
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</>
	),
	download: (
		<>
			<path d="M12 3v12" />
			<path d="m7 10 5 5 5-5" />
			<path d="M5 21h14" />
		</>
	),
	link: (
		<>
			<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
			<path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
		</>
	),
	login: (
		<>
			<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
			<path d="m10 17 5-5-5-5" />
			<path d="M15 12H3" />
		</>
	),
	plug: (
		<>
			<path d="M9 2v6" />
			<path d="M15 2v6" />
			<path d="M6 8h12v4a6 6 0 0 1-12 0z" />
			<path d="M12 18v4" />
		</>
	),
	book: (
		<>
			<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
			<path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
		</>
	),
	bag: (
		<>
			<path d="M5 8h14l-1 13H6z" />
			<path d="M9 8V6a3 3 0 0 1 6 0v2" />
		</>
	),
	check: <path d="m5 12 5 5 9-10" />,
	x: (
		<>
			<path d="M6 6l12 12" />
			<path d="M18 6 6 18" />
		</>
	),
	star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
	bell: (
		<>
			<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
			<path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
		</>
	),
	arrowUp: (
		<>
			<path d="M12 19V5" />
			<path d="m5 12 7-7 7 7" />
		</>
	),
	hand: (
		<>
			<path d="M9 11V5a1.5 1.5 0 0 1 3 0v5" />
			<path d="M12 10V4a1.5 1.5 0 0 1 3 0v6" />
			<path d="M15 10V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3 14a1.5 1.5 0 0 1 2.4-1.8L9 15" />
		</>
	),
};

/** Small uppercase label with letter spacing */
export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = C.orange2, size = 30, style}) => (
	<div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: 5, color, ...style}}>{children}</div>
);

/** Red strike that draws across its parent */
export const Strike: React.FC<{p: number; w: number; top: number; left?: number; rot?: number}> = ({p, w, top, left = 0, rot = -8}) => (
	<div style={{position: 'absolute', left, top, width: w * p, height: 12, borderRadius: 6, background: C.red, transform: `rotate(${rot}deg)`, transformOrigin: '0 50%', boxShadow: '0 0 0 3px #000'}} />
);

export const lerp = (p: number, a: number, b: number) => interpolate(p, [0, 1], [a, b]);

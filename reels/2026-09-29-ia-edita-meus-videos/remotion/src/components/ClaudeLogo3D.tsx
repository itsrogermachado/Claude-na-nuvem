import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import {PANEL_TRACK, T, camera, toScreen} from '../camera';
import {CLAUDE_COLOR, CLAUDE_PATH} from '../claudePath';
import {clamp01, easeOut, springAt} from '../theme';
import {FPS, handPresence, palm} from '../timeline';
import {CHIP} from './Hook';

const CANVAS = 520;

const useClaudeGeometry = () =>
	useMemo(() => {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g transform="scale(1,-1)"><path d="${CLAUDE_PATH}"/></g></svg>`;
		const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => p.toShapes());
		const geo = new THREE.ExtrudeGeometry(shapes, {depth: 2.6, bevelEnabled: true, bevelThickness: 0.55, bevelSize: 0.28, bevelSegments: 6, curveSegments: 18});
		geo.center();
		geo.computeVertexNormals();
		const box = new THREE.Box3().setFromBufferAttribute(geo.attributes.position as THREE.BufferAttribute);
		const size = new THREE.Vector3();
		box.getSize(size);
		const k = 2 / Math.max(size.x, size.y);
		geo.scale(k, k, k);
		return geo;
	}, []);

const Logo: React.FC<{rot: [number, number, number]}> = ({rot}) => {
	const geo = useClaudeGeometry();
	return (
		<mesh geometry={geo} rotation={rot}>
			<meshPhysicalMaterial color={CLAUDE_COLOR} roughness={0.38} metalness={0} clearcoat={0.6} clearcoatRoughness={0.2} />
		</mesh>
	);
};

export const Logo3D: React.FC<{size: number; rot: [number, number, number]}> = ({size, rot}) => (
	<div style={{position: 'absolute', left: -CANVAS / 2, top: -CANVAS / 2, width: CANVAS, height: CANVAS, transform: `scale(${size / (CANVAS * 0.78)})`}}>
		<ThreeCanvas flat width={CANVAS} height={CANVAS} camera={{fov: 30, position: [0, 0, 5.2]}} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
			<hemisphereLight args={['#FFF4EC', '#4A2216', 0.95]} />
			<directionalLight position={[-3, 4, 5]} intensity={2.3} />
			<directionalLight position={[4, -2, 3]} intensity={0.35} color={'#FFD2B8'} />
			<directionalLight position={[3, 2, -4]} intensity={1.6} color={'#FFFFFF'} />
			<Logo rot={rot} />
		</ThreeCanvas>
	</div>
);

const Sparkles: React.FC<{t: number; t0: number; r: number; color?: string}> = ({t, t0, r, color = '#FFE3C8'}) => {
	const p = clamp01((t - t0) / 0.7);
	if (p <= 0 || p >= 1) return null;
	return (
		<>
			{Array.from({length: 10}).map((_, i) => {
				const a = (i / 10) * Math.PI * 2 + 0.4;
				const d = r * (0.55 + 0.8 * easeOut(p)) * (0.85 + (0.3 * ((i * 37) % 7)) / 7);
				const s = (1 - p) * (10 + (i % 3) * 7);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: Math.cos(a) * d - s,
							top: Math.sin(a) * d - s,
							width: s * 2,
							height: s * 2,
							background: i % 2 ? color : '#FFFFFF',
							clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)',
							opacity: 1 - p * 0.6,
						}}
					/>
				);
			})}
		</>
	);
};

type Appearance = {tIn: number; tFly: number; target: () => {x: number; y: number}; endScale: number; burst: boolean};
const APPEARANCES: Appearance[] = [
	// "o Claude Opus 5.5 ... nenhum editor de vídeo" (clip 1) -> into the chip icon
	{tIn: T.claude1 - 0.05, tFly: T.claudeWinOut - 0.87, target: () => ({x: CHIP.iconX, y: CHIP.y}), endScale: 0.18, burst: false},
	// "sabe essa logo aqui que está acompanhando a minha mão?" (clip 4) -> up into the tracking panel on "incrível"
	{tIn: T.trackIn + 0.1, tFly: T.incrivel - 0.35, target: () => ({x: 540, y: PANEL_TRACK * 0.47}), endScale: 1.35, burst: true},
];
const FLY = 0.42;

export const ClaudeLogo3D: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const a = APPEARANCES.find((x) => t >= x.tIn - 0.02 && t < x.tFly + FLY + (x.burst ? 0.35 : 0));
	if (!a) return null;

	const cam = camera(frame);
	const p = palm(frame);
	const hand = Number.isNaN(p.x) ? null : toScreen(cam, p.x, p.y);
	const pres = handPresence(frame);
	const base = hand ? Math.min(330, Math.max(220, p.size * cam.s * 1.5)) : 260;

	const pop = springAt(frame, a.tIn, {damping: 10, stiffness: 120, mass: 0.8});
	const spinIn = springAt(frame, a.tIn, {damping: 17, stiffness: 115});
	const fly = interpolate(t, [a.tFly, a.tFly + FLY], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
	const tgt = a.target();
	const from = hand ?? tgt;
	const x = from.x + (tgt.x - from.x) * fly;
	const y = from.y + (tgt.y - from.y) * fly - Math.sin(fly * Math.PI) * 140;
	// after a "burst" landing the logo keeps floating in the panel, then shrinks away at the cut
	const outro = a.burst ? interpolate(t, [a.tFly + FLY + 0.12, a.tFly + FLY + 0.32], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : fly >= 1 ? 0 : 1;
	const scaleEnd = interpolate(fly, [0, 1], [1, a.endScale]);
	const size = base * pop * scaleEnd * outro * (fly > 0 ? 1 : interpolate(pres, [0, 1], [0.35, 1]));
	if (size < 2) return null;

	const bob = Math.sin(t * 3.1) * 6 * (1 - fly);
	const rot: [number, number, number] = [
		Math.sin(t * 1.7) * 0.16 - 0.22,
		(1 - spinIn) * -Math.PI * 2 + Math.sin(t * 2.4) * 0.55 + fly * Math.PI * 2,
		(-p.angle * Math.PI) / 180 * 0.3 * (1 - fly) + Math.sin(t * 1.3) * 0.05,
	];
	const glow = clamp01(pop) * (a.burst ? 1 : 1 - fly);
	return (
		<div style={{position: 'absolute', left: x, top: y + bob, width: 0, height: 0}}>
			<div
				style={{
					position: 'absolute',
					left: -size * 0.95,
					top: -size * 0.95,
					width: size * 1.9,
					height: size * 1.9,
					borderRadius: '50%',
					background: `radial-gradient(circle, rgba(255,175,125,${0.6 * glow}) 0%, rgba(217,119,87,${0.32 * glow}) 40%, rgba(217,119,87,0) 70%)`,
					mixBlendMode: 'screen',
				}}
			/>
			{fly < 0.5 && (
				<div
					style={{
						position: 'absolute',
						left: -size * 0.32,
						top: -size * 0.26,
						width: size * 0.84,
						height: size * 0.84,
						borderRadius: '50%',
						background: `radial-gradient(closest-side, rgba(60,20,5,${0.3 * glow * (1 - fly * 2)}), rgba(60,20,5,0))`,
						mixBlendMode: 'multiply',
					}}
				/>
			)}
			<Sparkles t={t} t0={a.tIn + 0.08} r={size * 0.7} />
			{a.burst && <Sparkles t={t} t0={a.tFly + FLY - 0.05} r={size * 0.75} color="#FFB48F" />}
			<Logo3D size={size} rot={rot} />
		</div>
	);
};

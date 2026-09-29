import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useEffect, useMemo} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import {T, camera, toScreen} from '../camera';
import {CLAUDE_COLOR, CLAUDE_PATH} from '../claudePath';
import {C, clamp01, easeOut, springAt} from '../theme';
import {FPS, palm} from '../timeline';
import {CHIP_ICON} from './Hook';

const CANVAS = 520; // px, rendered then scaled down with CSS -> stays crisp

const useClaudeGeometry = () =>
	useMemo(() => {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g transform="scale(1,-1)"><path d="${CLAUDE_PATH}"/></g></svg>`;
		const parsed = new SVGLoader().parse(svg);
		const shapes = parsed.paths.flatMap((p) => SVGLoader.createShapes(p));
		const geo = new THREE.ExtrudeGeometry(shapes, {
			depth: 2.6,
			bevelEnabled: true,
			bevelThickness: 0.55,
			bevelSize: 0.28,
			bevelSegments: 6,
			curveSegments: 18,
		});
		geo.center();
		geo.computeVertexNormals();
		const box = new THREE.Box3().setFromBufferAttribute(geo.attributes.position as THREE.BufferAttribute);
		const size = new THREE.Vector3();
		box.getSize(size);
		const k = 2 / Math.max(size.x, size.y);
		geo.scale(k, k, k);
		return geo;
	}, []);

const Env: React.FC = () => {
	const {gl, scene} = useThree();
	// built synchronously so the very first rendered frame already has reflections
	const env = useMemo(() => {
		const pmrem = new THREE.PMREMGenerator(gl);
		const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		pmrem.dispose();
		return tex;
	}, [gl]);
	scene.environment = env;
	useEffect(() => () => env.dispose(), [env]);
	return null;
};

const Logo: React.FC<{rotX: number; rotY: number; rotZ: number}> = ({rotX, rotY, rotZ}) => {
	const geo = useClaudeGeometry();
	return (
		<mesh geometry={geo} rotation={[rotX, rotY, rotZ]}>
			<meshPhysicalMaterial color={CLAUDE_COLOR} roughness={0.26} metalness={0.12} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.35} />
		</mesh>
	);
};

/** Small 4-point sparkles that burst out when the logo lands in the hand */
const Sparkles: React.FC<{t: number; t0: number; r: number}> = ({t, t0, r}) => {
	const p = clamp01((t - t0) / 0.7);
	if (p <= 0 || p >= 1) return null;
	return (
		<>
			{Array.from({length: 9}).map((_, i) => {
				const a = (i / 9) * Math.PI * 2 + 0.4;
				const d = r * (0.55 + 0.75 * easeOut(p)) * (0.85 + 0.3 * ((i * 37) % 7) / 7);
				const s = (1 - p) * (10 + (i % 3) * 6);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: Math.cos(a) * d - s,
							top: Math.sin(a) * d - s,
							width: s * 2,
							height: s * 2,
							background: i % 2 ? '#FFE3C8' : '#FFFFFF',
							clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)',
							opacity: 1 - p * 0.6,
						}}
					/>
				);
			})}
		</>
	);
};

export const ClaudeLogo3D: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < T.logoIn - 0.02 || t > T.logoFly + 0.5) return null;

	const cam = camera(frame);
	const p = palm(frame);
	const onHand = toScreen(cam, p.x, p.y);
	const handPx = p.size * cam.s; // wrist -> middle knuckle, on screen
	const diameter = Math.min(340, Math.max(230, handPx * 1.55));

	const pop = springAt(frame, T.logoIn, {damping: 10, stiffness: 120, mass: 0.8});
	const spinIn = springAt(frame, T.logoIn, {damping: 17, stiffness: 115});

	// fly into the chip icon when the hand goes down
	const fly = interpolate(t, [T.logoFly, T.logoFly + 0.42], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
	const x = onHand.x + (CHIP_ICON.x - onHand.x) * fly;
	const y = onHand.y + (CHIP_ICON.y - onHand.y) * fly - Math.sin(fly * Math.PI) * 120;
	const size = diameter * pop * (1 - fly * 0.82);
	if (size < 2 || fly >= 1) return null;

	const bob = Math.sin(t * 3.1) * 6 * (1 - fly);
	const rotY = (1 - spinIn) * -Math.PI * 2 + Math.sin(t * 2.4) * 0.55 + fly * Math.PI * 2;
	const rotX = Math.sin(t * 1.7) * 0.16 - 0.22;
	const rotZ = (-p.angle * Math.PI) / 180 * 0.35 * (1 - fly) + Math.sin(t * 1.3) * 0.05;
	const k = size / (CANVAS * 0.78);
	const glow = clamp01(pop) * (1 - fly);

	return (
		<div style={{position: 'absolute', left: x, top: y + bob, width: 0, height: 0}}>
			{/* warm light the logo casts on the palm */}
			<div
				style={{
					position: 'absolute',
					left: -size * 0.95,
					top: -size * 0.95,
					width: size * 1.9,
					height: size * 1.9,
					borderRadius: '50%',
					background: `radial-gradient(circle, rgba(255,175,125,${0.62 * glow}) 0%, rgba(217,119,87,${0.34 * glow}) 40%, rgba(217,119,87,0) 70%)`,
					mixBlendMode: 'screen',
				}}
			/>
			{/* soft contact shadow on the hand */}
			<div
				style={{
					position: 'absolute',
					left: -size * 0.42 + size * 0.1,
					top: -size * 0.42 + size * 0.16,
					width: size * 0.84,
					height: size * 0.84,
					borderRadius: '50%',
					background: `radial-gradient(closest-side, rgba(60,20,5,${0.32 * glow}), rgba(60,20,5,0))`,
					mixBlendMode: 'multiply',
				}}
			/>
			<Sparkles t={t} t0={T.logoIn + 0.08} r={size * 0.7} />
			<div style={{position: 'absolute', left: -CANVAS / 2, top: -CANVAS / 2, width: CANVAS, height: CANVAS, transform: `scale(${k})`}}>
				<ThreeCanvas width={CANVAS} height={CANVAS} camera={{fov: 30, position: [0, 0, 5.2]}} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
					<Env />
					<ambientLight intensity={0.22} />
					<directionalLight position={[-3, 4, 5]} intensity={2.6} />
					<directionalLight position={[4, -2, 3]} intensity={0.55} color={'#FFD2B8'} />
					<directionalLight position={[3, 2, -4]} intensity={2.2} color={'#FFFFFF'} />
					<pointLight position={[0, 0, -3]} intensity={6} color={C.claude} />
					<Logo rotX={rotX} rotY={rotY} rotZ={rotZ} />
				</ThreeCanvas>
			</div>
		</div>
	);
};

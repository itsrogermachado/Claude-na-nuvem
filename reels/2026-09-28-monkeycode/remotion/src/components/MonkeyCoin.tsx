import {ThreeCanvas} from '@remotion/three';
import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {T} from '../camera';
import {C, MONO, SANS, clamp01, easeOut, prog, springAt} from '../theme';
import {FPS, H, W} from '../timeline';
import {DarkBg} from './Panels';

const CANVAS = 760;

/** Coin face: MonkeyCode logo on a dark disc with a green ring, drawn once into a canvas texture */
let coinTexture: THREE.CanvasTexture | null = null;
let coinPromise: Promise<THREE.CanvasTexture> | null = null;
const loadCoinTexture = () => {
	if (!coinPromise) {
		coinPromise = new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const c = document.createElement('canvas');
				c.width = c.height = 1024;
				const g = c.getContext('2d')!;
				const grd = g.createRadialGradient(512, 440, 60, 512, 512, 512);
				grd.addColorStop(0, '#1C2B23');
				grd.addColorStop(1, '#070E0A');
				g.fillStyle = grd;
				g.beginPath();
				g.arc(512, 512, 512, 0, Math.PI * 2);
				g.fill();
				g.lineWidth = 34;
				g.strokeStyle = C.green;
				g.beginPath();
				g.arc(512, 512, 470, 0, Math.PI * 2);
				g.stroke();
				g.drawImage(img, 512 - 330, 512 - 330, 660, 662);
				const t = new THREE.CanvasTexture(c);
				t.colorSpace = THREE.SRGBColorSpace;
				t.anisotropy = 8;
				// cylinder cap UVs run sideways once the coin is turned to face the camera
				t.center.set(0.5, 0.5);
				t.rotation = Math.PI / 2;
				coinTexture = t;
				resolve(t);
			};
			img.onerror = reject;
			img.src = staticFile('img/logo-light.png');
		});
	}
	return coinPromise;
};

/** Waits (delayRender) until the coin texture exists, so the 3D canvas is only mounted fully dressed */
const useCoinTexture = (active: boolean) => {
	const [tex, setTex] = useState<THREE.CanvasTexture | null>(coinTexture);
	useEffect(() => {
		if (!active || tex) return;
		const handle = delayRender('coin texture');
		loadCoinTexture().then((t) => {
			setTex(t);
			continueRender(handle);
		});
	}, [active, tex]);
	return tex;
};

const Coin: React.FC<{rotY: number; rotX: number; tex: THREE.CanvasTexture}> = ({rotY, rotX, tex}) => {
	const mats = useMemo(() => {
		const rim = new THREE.MeshStandardMaterial({color: '#2BD487', metalness: 0.85, roughness: 0.28});
		const face = new THREE.MeshStandardMaterial({map: tex, metalness: 0.15, roughness: 0.45});
		return [rim, face, face];
	}, [tex]);
	return (
		<group rotation={[rotX, rotY, 0]}>
			<mesh rotation={[Math.PI / 2, 0, 0]} material={mats}>
				<cylinderGeometry args={[1, 1, 0.18, 128]} />
			</mesh>
		</group>
	);
};

export const MonkeyReveal: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const t0 = T.reveal - 0.02;
	const badgeEnd = T.search - 0.08;
	const active = t >= t0 && t <= badgeEnd + 0.4;
	const tex = useCoinTexture(active);
	if (!active) return null;

	const bgIn = prog(t, t0, 0.12);
	const bgOut = prog(t, T.revealOut - 0.02, 0.24);
	const bg = bgIn * (1 - bgOut);

	const pop = springAt(frame, t0, {damping: 11, stiffness: 150});
	const spin = springAt(frame, t0, {damping: 18, stiffness: 55});
	// after the cut the coin becomes a small badge at the top while he keeps talking
	const toBadge = prog(t, T.revealOut - 0.05, 0.45, easeOut);
	const leave = prog(t, badgeEnd, 0.3);
	const cx = interpolate(toBadge, [0, 1], [W / 2, 250]);
	const cy = interpolate(toBadge, [0, 1], [760, 330]);
	const size = interpolate(toBadge, [0, 1], [560, 150]) * pop * (1 - leave);
	const rotY = (1 - spin) * Math.PI * 4 + Math.sin(t * 2) * 0.25 + toBadge * Math.PI * 2;
	const rotX = Math.sin(t * 1.4) * 0.12;
	const k = size / (CANVAS * 0.74);

	const word = springAt(frame, t0 + 0.14, {damping: 14, stiffness: 160});
	const sub = prog(t, t0 + 0.3, 0.3);
	const badgeText = clamp01((toBadge - 0.5) * 2) * (1 - leave);

	return (
		<div style={{position: 'absolute', inset: 0}}>
			{bg > 0.001 && (
				<div style={{position: 'absolute', inset: 0, opacity: bg}}>
					<DarkBg t={t} h={H} glowY={0.4} />
					<div
						style={{
							position: 'absolute',
							top: 1080,
							width: W,
							textAlign: 'center',
							fontFamily: MONO,
							fontWeight: 800,
							fontSize: 120,
							transform: `translateY(${(1 - word) * 60}px)`,
							opacity: clamp01(word * 1.6),
						}}
					>
						<span style={{color: C.white}}>Monkey</span>
						<span style={{color: C.green}}>Code</span>
					</div>
					<div style={{position: 'absolute', top: 1238, width: W, textAlign: 'center', opacity: sub}}>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#CDEBDD'}}>PLATAFORMA DE IA PARA CÓDIGO</div>
						<div style={{fontFamily: MONO, fontSize: 34, color: '#8FC2A8', marginTop: 16}}>open source • by Chaitin</div>
					</div>
				</div>
			)}
			{badgeText > 0.001 && (
				<div
					style={{
						position: 'absolute',
						left: 170,
						top: 330 - 62,
						height: 124,
						width: 740 * badgeText,
						borderRadius: 62,
						background: 'rgba(7,14,10,0.9)',
						border: `3px solid ${C.green}`,
						overflow: 'hidden',
						display: 'flex',
						alignItems: 'center',
						paddingLeft: 170,
						boxSizing: 'border-box',
						fontFamily: MONO,
						fontWeight: 800,
						fontSize: 62,
						whiteSpace: 'nowrap',
					}}
				>
					<span style={{color: C.white}}>Monkey</span>
					<span style={{color: C.green}}>Code</span>
				</div>
			)}
			{size > 1 && tex && (
				<div style={{position: 'absolute', left: cx - CANVAS / 2, top: cy - CANVAS / 2, width: CANVAS, height: CANVAS, transform: `scale(${k})`}}>
					<div
						style={{
							position: 'absolute',
							inset: 60,
							borderRadius: '50%',
							background: `radial-gradient(closest-side, rgba(61,242,154,${0.55 * (1 - toBadge)}), rgba(61,242,154,0))`,
						}}
					/>
					<ThreeCanvas width={CANVAS} height={CANVAS} camera={{fov: 30, position: [0, 0, 4.3]}} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
						<ambientLight intensity={1.1} />
						<directionalLight position={[2, 3, 5]} intensity={2.4} />
						<directionalLight position={[-3, -2, 3]} intensity={0.8} color={'#BFFFE0'} />
						<Coin rotY={rotY} rotX={rotX} tex={tex} />
					</ThreeCanvas>
				</div>
			)}
		</div>
	);
};

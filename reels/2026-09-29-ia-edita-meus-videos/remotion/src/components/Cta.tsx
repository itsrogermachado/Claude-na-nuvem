import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {T} from '../camera';
import {C, SANS, clamp01, outlined, prog, springAt} from '../theme';
import {DURATION, FPS, W} from '../timeline';

/** "Resumindo: eu gravo, a IA edita" */
export const Summary: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < T.trackOut || t >= T.passo) return null;
	const lab = springAt(frame, T.trackOut + 0.02, {damping: 14});
	const a = springAt(frame, T.gravo2 - 0.12, {damping: 10, stiffness: 200});
	const b = springAt(frame, T.ia - 0.1, {damping: 10, stiffness: 200});
	const out = prog(t, T.passo - 0.22, 0.2);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `translateY(${-out * 40}px)`}}>
			<div style={{position: 'absolute', top: 200, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: 6, color: C.white, opacity: clamp01(lab * 2), ...outlined(7)}}>RESUMINDO</div>
			{a > 0.001 && (
				<div style={{position: 'absolute', top: 262, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 118, lineHeight: 1, color: C.white, transform: `scale(${interpolate(a, [0, 1], [0.5, 1])})`, ...outlined(12)}}>
					EU GRAVO.
				</div>
			)}
			{b > 0.001 && (
				<div style={{position: 'absolute', top: 392, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 118, lineHeight: 1, color: C.green, transform: `scale(${interpolate(b, [0, 1], [0.5, 1])})`, ...outlined(12)}}>
					A IA EDITA.
				</div>
			)}
		</div>
	);
};

const Plane: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
		<path d="M22 3 11 14" />
		<path d="M22 3 15 21l-4-7-7-4z" />
	</svg>
);

/** "me manda uma mensagem no direct, que eu te ensino" */
export const DirectCard: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < T.passo - 0.15) return null;
	const card = springAt(frame, T.passo - 0.15, {damping: 14, stiffness: 170});
	const msg = 'Quero o passo a passo!';
	const typed = msg.slice(0, Math.floor(msg.length * prog(t, T.passo + 0.35, 0.7, (x) => x)));
	const sent = springAt(frame, T.direct - 0.05, {damping: 11, stiffness: 220});
	const planeFly = prog(t, T.direct - 0.05, 0.4);
	const typing = t >= T.direct + 0.2 && t < T.ensino - 0.05;
	const reply = springAt(frame, T.ensino - 0.05, {damping: 11, stiffness: 220});
	const end = prog(t, DURATION / FPS - 0.25, 0.25);
	return (
		<div
			style={{
				position: 'absolute',
				left: 70,
				top: 190,
				width: W - 140,
				height: 470,
				borderRadius: 40,
				background: 'rgba(16,16,18,0.92)',
				border: '2px solid rgba(255,255,255,0.14)',
				boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
				transform: `translateY(${(1 - card) * -70}px) scale(${interpolate(card, [0, 1], [0.9, 1])})`,
				opacity: clamp01(card * 2) * (1 - end),
				overflow: 'hidden',
			}}
		>
			<div style={{height: 100, display: 'flex', alignItems: 'center', gap: 20, padding: '0 34px', borderBottom: '2px solid rgba(255,255,255,0.08)'}}>
				<div style={{width: 60, height: 60, borderRadius: 30, background: 'linear-gradient(45deg,#FEDA75,#FA7E1E,#D62976,#962FBF,#4F5BD5)', padding: 4, boxSizing: 'border-box'}}>
					<div style={{width: '100%', height: '100%', borderRadius: 30, background: '#101012'}} />
				</div>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: C.white}}>Direct</div>
				<div style={{marginLeft: 'auto', transform: `translate(${planeFly * 40}px, ${-planeFly * 40}px) scale(${1 + 0.2 * Math.sin(planeFly * Math.PI)})`}}>
					<Plane size={50} color={C.white} />
				</div>
			</div>
			{/* viewer's message */}
			<div style={{position: 'absolute', right: 34, top: 140, maxWidth: 700, padding: '22px 30px', borderRadius: 34, background: t >= T.direct - 0.05 ? 'linear-gradient(90deg,#6A3DF0,#A63BE0)' : 'rgba(255,255,255,0.1)', fontFamily: SANS, fontWeight: 700, fontSize: 42, color: C.white, transform: `scale(${t >= T.direct - 0.05 ? 1 + 0.06 * (1 - sent) : 1})`, transformOrigin: '100% 50%', minHeight: 58}}>
				{typed || ' '}
				{t < T.direct - 0.05 && <span style={{opacity: Math.floor(t * 3) % 2 ? 1 : 0}}>|</span>}
			</div>
			{/* his reply */}
			{typing && (
				<div style={{position: 'absolute', left: 34, top: 280, padding: '24px 30px', borderRadius: 34, background: '#26262B', display: 'flex', gap: 10}}>
					{[0, 1, 2].map((i) => (
						<div key={i} style={{width: 16, height: 16, borderRadius: 8, background: '#9A9AA0', transform: `translateY(${Math.sin(t * 10 - i) * 5}px)`}} />
					))}
				</div>
			)}
			{reply > 0.001 && (
				<div style={{position: 'absolute', left: 34, top: 280, padding: '22px 30px', borderRadius: 34, background: '#26262B', fontFamily: SANS, fontWeight: 700, fontSize: 42, color: C.white, transform: `scale(${reply})`, transformOrigin: '0 50%'}}>
					Bora, te ensino!
				</div>
			)}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 34, color: C.green, letterSpacing: 2}}>ME CHAMA NO DIRECT</div>
		</div>
	);
};

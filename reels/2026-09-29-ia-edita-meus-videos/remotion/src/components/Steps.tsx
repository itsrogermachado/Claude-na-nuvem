import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import React from 'react';
import {interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PANEL_STEPS, T} from '../camera';
import {C, MONO, SANS, clamp01, easeOut, prog, springAt} from '../theme';
import {FPS, SEGMENTS, W, WORDS} from '../timeline';
import {ClaudeGlyph} from './Hook';
import {PanelSlot} from './Panels';

const RAW = {c1: 10.8333, c2: 8.4833, c3: 22.55, c4: 26.3} as Record<string, number>;
const RAW_TOTAL = Object.values(RAW).reduce((a, b) => a + b, 0);
const EDIT_TOTAL = SEGMENTS.reduce((a, s) => a + s.len, 0) / FPS;
const fmtS = (s: number) => `${s.toFixed(1).replace('.', ',')} s`;

const Header: React.FC<{step: number; t: number}> = ({step, t}) => (
	<div style={{position: 'absolute', top: 150, left: 70, right: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
		<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.green, letterSpacing: 2}}>{'// COMO FUNCIONA'}</div>
		<div style={{display: 'flex', gap: 14}}>
			{[1, 2, 3].map((n) => {
				const on = n === step;
				return (
					<div
						key={n}
						style={{
							width: 62,
							height: 62,
							borderRadius: 31,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: SANS,
							fontWeight: 900,
							fontSize: 32,
							background: on ? C.green : n < step ? 'rgba(61,242,154,0.25)' : 'rgba(255,255,255,0.08)',
							color: on ? C.black : C.white,
							transform: `scale(${on ? 1.12 : 1})`,
						}}
					>
						{n < step ? '✓' : n}
					</div>
				);
			})}
		</div>
	</div>
);

const Title: React.FC<{n: string; text: string; sub: string; frame: number; t0: number}> = ({n, text, sub, frame, t0}) => {
	const s = springAt(frame, t0, {damping: 12, stiffness: 180});
	return (
		<div style={{position: 'absolute', top: 250, left: 70, right: 70, height: 170, display: 'flex', alignItems: 'center', gap: 34, opacity: clamp01(s * 2), transform: `translateX(${(1 - s) * 80}px)`}}>
			<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 190, lineHeight: 1, color: C.green, textShadow: '0 0 40px rgba(61,242,154,0.45)'}}>{n}</div>
			<div>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 66, color: C.white, lineHeight: 1.05}}>{text}</div>
				<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: 'rgba(205,235,220,0.85)', marginTop: 8}}>{sub}</div>
			</div>
		</div>
	);
};

/** 1 — listens and transcribes: live spectrum of his voice + the words appearing */
const Step1: React.FC<{frame: number; t: number}> = ({frame, t}) => {
	const audio = useAudioData(staticFile('voice.wav'));
	// 24 low/mid bands of his voice, mirrored around the centre
	const bands = audio ? visualizeAudio({fps: FPS, frame, audioData: audio, numberOfSamples: 64, optimizeFor: 'speed'}).slice(1, 25) : new Array(24).fill(0);
	const bars = [...bands.slice().reverse(), ...bands];
	const words = WORDS.filter((w) => w.start >= T.step1 - 0.05 && w.start <= t && w.start < T.step2 - 0.05)
		.filter((w, i, arr) => !(i > 0 && w.text === 'o' && arr[i - 1].text === 'o'))
		.map((w) => w.text);
	const shown = words.slice(-9).join(' ');
	return (
		<>
			<Title n="1" text="TRANSCREVE" sub="ouve o vídeo, palavra por palavra" frame={frame} t0={T.step1} />
			<div style={{position: 'absolute', top: 460, left: 70, right: 70, height: 150, display: 'flex', alignItems: 'center', gap: 7}}>
				{bars.map((v, i) => {
					const h = Math.max(8, Math.min(150, Math.pow(v, 0.45) * 330));
					return <div key={i} style={{flex: 1, height: h, borderRadius: 6, background: i % 2 ? C.green : '#2BD487'}} />;
				})}
			</div>
			<div style={{position: 'absolute', top: 640, left: 70, right: 70, height: 130, borderRadius: 22, background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(61,242,154,0.3)', padding: '18px 26px', boxSizing: 'border-box', fontFamily: MONO, fontSize: 38, lineHeight: 1.25, color: C.white, overflow: 'hidden'}}>
				<span style={{color: C.green}}>&gt; </span>
				{shown}
				<span style={{opacity: Math.floor(t * 3) % 2 ? 1 : 0, color: C.green}}>▍</span>
			</div>
		</>
	);
};

/** 2 — cuts silences and mistakes: the real edit, raw clips collapsing into the final length */
const Step2: React.FC<{frame: number; t: number}> = ({frame, t}) => {
	const red = prog(t, T.silencios - 0.1, 0.3);
	const collapse = prog(t, T.pausas - 0.1, 0.9, easeOut);
	const barW = W - 140;
	const total = interpolate(collapse, [0, 1], [RAW_TOTAL, EDIT_TOTAL]);
	const pieces: {kept: boolean; dur: number}[] = [];
	for (const c of ['c1', 'c2', 'c3', 'c4']) {
		let cur = 0;
		const segs = SEGMENTS.filter((s) => s.clip === c).sort((a, b) => a.srcStart - b.srcStart);
		for (const s of segs) {
			if (s.srcStart / FPS > cur) pieces.push({kept: false, dur: s.srcStart / FPS - cur});
			pieces.push({kept: true, dur: s.len / FPS});
			cur = s.srcEnd / FPS;
		}
		if (RAW[c] > cur) pieces.push({kept: false, dur: RAW[c] - cur});
	}
	const scale = barW / RAW_TOTAL;
	return (
		<>
			<Title n="2" text="CORTA" sub="silêncios, erros e pausas" frame={frame} t0={T.step2} />
			<div style={{position: 'absolute', top: 470, left: 70, fontFamily: MONO, fontSize: 30, color: 'rgba(205,235,220,0.8)'}}>SEU VÍDEO BRUTO → EDITADO</div>
			<div style={{position: 'absolute', top: 525, left: 70, width: barW, height: 110, display: 'flex', gap: 0, overflow: 'hidden', borderRadius: 16}}>
				{pieces.map((p, i) => {
					const w = p.dur * scale * (p.kept ? 1 : 1 - collapse);
					return (
						<div
							key={i}
							style={{
								width: w,
								height: 110,
								flexShrink: 0,
								boxSizing: 'border-box',
								borderRight: w > 3 ? '3px solid #070E0A' : 'none',
								background: p.kept ? (red > 0 ? C.green : '#E8E8E8') : red > 0 ? `rgba(255,77,77,${0.35 + 0.55 * red})` : '#E8E8E8',
								backgroundImage: !p.kept && red > 0 ? 'repeating-linear-gradient(45deg, rgba(0,0,0,0.25) 0 8px, transparent 8px 16px)' : undefined,
							}}
						/>
					);
				})}
			</div>
			<div style={{position: 'absolute', top: 660, left: 70, right: 70, display: 'flex', alignItems: 'baseline', gap: 24}}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, color: collapse > 0 ? C.green : C.white}}>{fmtS(total)}</div>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: 'rgba(205,235,220,0.85)'}}>{collapse > 0.98 ? `de ${fmtS(RAW_TOTAL)} gravados` : 'gravados'}</div>
			</div>
		</>
	);
};

const CODE = [
	['const ', 'pop', ' = ', 'spring', '({'],
	['  frame, fps: ', '60', ','],
	['  config: {damping: ', '13', '},'],
	['});'],
	['<', 'span', ' style={{scale: pop}}>'],
	['  EDITADO POR IA'],
	['</', 'span', '>'],
];
const COLORS = ['#C792EA', '#82AAFF', '#E6EDF3', '#82AAFF', '#E6EDF3'];
/** 3 — writes the animations in JavaScript: code typing + the element it produces */
const Step3: React.FC<{frame: number; t: number}> = ({frame, t}) => {
	const full = CODE.map((l) => l.join('')).join('');
	const typed = Math.floor(full.length * prog(t, T.step3 + 0.25, 1.5, (x) => x));
	// how many characters of each token are visible
	let budget = typed;
	const visible = CODE.map((line) =>
		line.map((tok) => {
			const n = Math.max(0, Math.min(tok.length, budget));
			budget -= tok.length;
			return tok.slice(0, n);
		}),
	);
	const done = typed >= full.length;
	const loop = t > T.javascript ? (t - T.javascript) % 0.9 : -1;
	const demo = loop >= 0 ? springAt(Math.round(loop * FPS), 0, {damping: 9, stiffness: 220}) : 0;
	return (
		<>
			<Title n="3" text="PROGRAMA" sub="as animações em JavaScript" frame={frame} t0={T.step3} />
			<div style={{position: 'absolute', top: 440, left: 60, width: 640, height: 380, borderRadius: 22, background: '#0D1117', border: '2px solid rgba(255,255,255,0.12)', padding: '20px 24px', boxSizing: 'border-box', fontFamily: MONO, fontSize: 31, lineHeight: 1.4, whiteSpace: 'pre'}}>
				{visible.map((line, li) => (
					<div key={li} style={{minHeight: 43}}>
						{line.map((tok, ti) => (
							<span key={ti} style={{color: li === 5 ? C.green : COLORS[ti % COLORS.length]}}>
								{tok}
							</span>
						))}
					</div>
				))}
				{!done && <span style={{color: C.green, opacity: Math.floor(t * 3) % 2 ? 1 : 0}}>▍</span>}
			</div>
			<div style={{position: 'absolute', top: 440, left: 720, width: 300, height: 380, borderRadius: 22, background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(61,242,154,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{position: 'absolute', top: 14, fontFamily: MONO, fontSize: 22, color: 'rgba(205,235,220,0.7)'}}>preview</div>
				<div style={{padding: '14px 22px', borderRadius: 18, background: C.green, fontFamily: SANS, fontWeight: 900, fontSize: 36, color: C.black, transform: `scale(${loop >= 0 ? demo : 0.001})`, textAlign: 'center', lineHeight: 1.1}}>
					EDITADO
					<br />
					POR IA
				</div>
			</div>
		</>
	);
};

const SCRIPT_LINES = [
	['h', 'Roteiro de Reels: "Uma IA edita meus vídeos"'],
	['m', 'Duração alvo: 35–40 s · Tom: conversa, energia alta'],
	['b', 'Bloco 1: Hook (0–3 s)'],
	['p', '"Esse vídeo foi editado inteiro por uma IA."'],
	['b', 'Bloco 2: Contexto (3–9 s)'],
	['p', '"Eu só gravo, mando o arquivo pro Claude Code…"'],
	['b', 'Bloco 3: Como funciona (9–22 s)'],
	['p', '1 dedo · 2 dedos · 3 dedos'],
	['b', 'Bloco 4: Prova (22–30 s)'],
	['b', 'Bloco 5: CTA (30–37 s)'],
];
/** "ele montou também esse roteiro pra mim" — the actual script, as a document */
const Script: React.FC<{frame: number; t: number}> = ({frame, t}) => {
	const s = springAt(frame, T.scriptIn, {damping: 14, stiffness: 150});
	const scroll = prog(t, T.scriptIn + 0.8, 2.4) * 140;
	return (
		<>
			<div style={{position: 'absolute', top: 165, left: 70, right: 70, display: 'flex', alignItems: 'center', gap: 18, opacity: clamp01(s * 2)}}>
				<div style={{width: 64, height: 64, borderRadius: 32, background: C.claude, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<ClaudeGlyph size={40} color={C.white} />
				</div>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 48, color: C.white}}>
					ROTEIRO <span style={{color: C.claude}}>ESCRITO PELA IA</span>
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					top: 260,
					left: 110,
					width: W - 220,
					height: 540,
					borderRadius: 20,
					background: '#FBFAF7',
					boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
					overflow: 'hidden',
					transform: `translateY(${(1 - s) * 200}px) rotate(${(1 - s) * 4 - 1.2}deg)`,
					opacity: clamp01(s * 1.6),
				}}
			>
				<div style={{position: 'absolute', left: 50, right: 50, top: 40 - scroll}}>
					{SCRIPT_LINES.map(([k, txt], i) => (
						<div
							key={i}
							style={{
								fontFamily: SANS,
								fontWeight: k === 'h' ? 900 : k === 'b' ? 800 : 500,
								fontSize: k === 'h' ? 40 : k === 'b' ? 32 : 28,
								color: k === 'b' ? '#B5532F' : k === 'm' ? '#6B6B6B' : '#1A1A1A',
								marginTop: k === 'b' ? 26 : 10,
								lineHeight: 1.2,
							}}
						>
							{txt}
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export const StepsPanel: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < T.stepsIn || t >= T.trackIn) return null;
	const step = t < T.step2 - 0.1 ? 1 : t < T.step3 - 0.1 ? 2 : 3;
	const isScript = t >= T.scriptIn - 0.03;
	return (
		<PanelSlot height={PANEL_STEPS}>
			{!isScript && <Header step={step} t={t} />}
			{isScript ? <Script frame={frame} t={t} /> : step === 1 ? <Step1 frame={frame} t={t} /> : step === 2 ? <Step2 frame={frame} t={t} /> : <Step3 frame={frame} t={t} />}
		</PanelSlot>
	);
};

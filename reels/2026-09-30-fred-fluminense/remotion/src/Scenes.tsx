import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Crest, Photo, Ranking, Score, Stamp, Title, Trophy} from './Kit';
import {C, DISPLAY, FPS, SANS, SERIF, W, clamp01, easeOut, prog, springAt, w} from './lib';

/** Scene boundaries (seconds), taken from the narration's word timestamps */
export const CUTS = [0, w(13) - 0.04, w(23) - 0.04, w(33) - 0.06, w(42) - 0.04, w(53) - 0.06, w(67) - 0.06, w(94) - 0.05, w(103) - 0.04, w(122) - 0.04, w(131) - 0.05, w(153) - 0.05,
	w(170) - 0.05, w(180) - 0.05, w(190) - 0.05, w(213) - 0.05, w(227) - 0.05, w(239) - 0.05, w(251) - 0.05, w(279) - 0.05, w(304) - 0.05, w(327) - 0.05, w(357) - 0.05, w(390) - 0.05, 93.55];

const Scene: React.FC<{i: number; children: (t: number, frame: number) => React.ReactNode}> = ({i, children}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const a = CUTS[i],
		b = CUTS[i + 1];
	if (t < a || t >= b) return null;
	// quick punch-in + blur on every cut
	const k = prog(t, a, 0.22, easeOut);
	return <div style={{position: 'absolute', inset: 0, transform: `scale(${interpolate(k, [0, 1], [1.08, 1])})`, filter: k < 1 ? `blur(${(1 - k) * 14}px)` : undefined}}>{children(t, frame)}</div>;
};

const Label: React.FC<{t0: number; top: number; text: string; color?: string; size?: number}> = ({t0, top, text, color = C.gold, size = 40}) => {
	const frame = useCurrentFrame();
	if (frame / FPS < t0 - 0.02) return null;
	const s = springAt(frame, t0, {damping: 13});
	return (
		<div style={{position: 'absolute', top, width: W, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: 5, color, opacity: clamp01(s * 2), transform: `translateY(${(1 - s) * 20}px)`}}>{text}</div>
	);
};

const BigNumber: React.FC<{t0: number; top: number; value: number; suffix?: string; size?: number; color?: string; dur?: number}> = ({t0, top, value, suffix = '', size = 300, color = C.white, dur = 0.8}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < t0 - 0.02) return null;
	const s = springAt(frame, t0, {damping: 11, stiffness: 180});
	const v = Math.round(value * prog(t, t0, dur, easeOut));
	return (
		<div style={{position: 'absolute', top, width: W, textAlign: 'center', fontFamily: DISPLAY, fontSize: size, lineHeight: 1, color, transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})`, textShadow: '0 20px 60px rgba(0,0,0,0.7)'}}>
			{v}
			{suffix}
		</div>
	);
};

const Heart: React.FC<{x: number; y: number; t0: number; size: number}> = ({x, y, t0, size}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (t < t0) return null;
	const p = clamp01((t - t0) / 2.2);
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: x + Math.sin(t * 3 + x) * 20, top: y - p * 420, opacity: 1 - p, transform: `scale(${0.6 + p * 0.6})`}}>
			<path d="M12 21s-7.5-4.6-10-9.3C.6 8.9 2.2 5 6 5c2.2 0 3.6 1.3 4.5 2.6h3C14.4 6.3 15.8 5 18 5c3.8 0 5.4 3.9 4 6.7C19.5 16.4 12 21 12 21z" fill={C.grenaLight} />
		</svg>
	);
};

export const Scenes: React.FC = () => (
	<>
		{/* 1 — maior artilheiro dos pontos corridos */}
		<Scene i={0}>
			{() => (
				<>
					<Photo src="fred_grito.jpg" t0={0} t1={CUTS[1]} x={150} y={520} w={780} h={640} pos="55% 28%" />
					<Title t0={0.1} top={220} big="Nº1" accent="dos pontos corridos" size={170} accentColor={C.gold} />
					<BigNumber t0={w(5)} top={1180} value={158} size={150} />
					<Label t0={w(5) + 0.1} top={1345} text="GOLS NO BRASILEIRÃO" />
				</>
			)}
		</Scene>
		{/* 2 — 2º maior artilheiro do Brasileiro */}
		<Scene i={1}>
			{() => <Ranking t0={CUTS[1]} top={420} title="ARTILHEIROS DO BRASILEIRÃO" sub="toda a história" rows={[{pos: 1, name: 'Roberto Dinamite', value: 190}, {pos: 2, name: 'FRED', value: 158, hl: true, at: w(15)}]} />}
		</Scene>
		{/* 3 — maior artilheiro da Copa do Brasil */}
		<Scene i={2}>
			{() => (
				<Ranking
					t0={CUTS[2]}
					top={380}
					title="ARTILHEIROS DA COPA DO BRASIL"
					sub="o maior de todos os tempos"
					rows={[{pos: 1, name: 'FRED', value: 37, hl: true, at: w(25)}, {pos: 2, name: 'Romário', value: 36, at: w(25) + 0.25}, {pos: 3, name: 'Viola', value: 29, at: w(25) + 0.4}]}
				/>
			)}
		</Scene>
		{/* 4 — 199 gols pelo Fluminense */}
		<Scene i={3}>
			{(t) => (
				<>
					<Photo src="fred_comemora.jpg" t0={CUTS[3]} t1={CUTS[4]} x={120} y={560} w={840} h={500} pos="25% 40%" gray={0.2} />
					<Crest t0={CUTS[3] + 0.05} x={540} y={350} size={270} />
					<BigNumber t0={w(35)} top={1070} value={199} size={190} color={C.white} dur={0.9} />
					<Label t0={w(36)} top={1270} text="GOLS PELO FLUMINENSE" color={C.gold} />
					{t > w(38) && <Title t0={w(38)} top={1315} big="" accent="o clube que ele ama" size={110} accentColor={C.white} />}
				</>
			)}
		</Scene>
		{/* 5 — cone, pipoqueiro e fraco */}
		<Scene i={4}>
			{(t) => (
				<div style={{position: 'absolute', inset: 0, transform: t > w(49) ? `translate(${Math.sin(t * 60) * 4}px, ${Math.cos(t * 55) * 3}px)` : undefined}}>
					<Photo src="copa14_croacia.jpg" t0={CUTS[4]} t1={CUTS[5]} x={90} y={420} w={900} h={900} pos="55% 45%" gray={1} border="rgba(255,255,255,0.5)" />
					<Label t0={CUTS[4] + 0.1} top={300} text="E MESMO ASSIM FOI CHAMADO DE..." color={C.white} size={42} />
					<Stamp t0={w(49)} text="CONE" x={330} y={620} rot={-10} />
					<Stamp t0={w(50)} text="PIPOQUEIRO" x={560} y={880} rot={6} size={132} />
					<Stamp t0={w(52)} text="FRACO" x={700} y={1140} rot={-6} />
				</div>
			)}
		</Scene>
		{/* 6 — mentiram pra você sobre Fred */}
		<Scene i={5}>
			{(t) => (
				<>
					<Photo src="fred_capitao.jpg" t0={CUTS[5]} t1={CUTS[6]} x={160} y={760} w={760} h={600} pos="50% 25%" />
					{t < w(62) - 0.05 && (
						<div style={{position: 'absolute', top: 300, width: W, textAlign: 'center', opacity: prog(t, CUTS[5] + 0.05, 0.25)}}>
							<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: 6, color: C.gold}}>NESSE VÍDEO</div>
							{t > w(60) - 0.05 && <div style={{fontFamily: DISPLAY, fontSize: 150, color: C.white, lineHeight: 1.1, transform: `scale(${interpolate(springAt(Math.round(t * FPS), w(60) - 0.05, {damping: 11}), [0, 1], [0.6, 1])})`}}>O PORQUÊ</div>}
						</div>
					)}
					<Title t0={w(62)} top={250} big="MENTIRAM" accent="pra você sobre" size={190} color={C.red} accentColor={C.white} />
					{t > w(66) - 0.05 && (
						<div style={{position: 'absolute', top: 560, width: W, textAlign: 'center', fontFamily: DISPLAY, fontSize: 170, color: C.white, lineHeight: 1, transform: `scale(${interpolate(springAt(Math.round(t * FPS), w(66) - 0.05, {damping: 9, stiffness: 260}), [0, 1], [2, 1])})`}}>
							FRED
						</div>
					)}
				</>
			)}
		</Scene>
		{/* 7 — Ronaldo e Romário vs Fred como 9 */}
		<Scene i={6}>
			{(t) => (
				<>
					<div style={{position: 'absolute', top: 330, width: W, textAlign: 'center', fontFamily: DISPLAY, fontSize: 560, lineHeight: 1, color: 'rgba(255,223,0,0.10)', opacity: 1 - prog(t, w(75), 0.3)}}>9</div>
					<Title t0={CUTS[6] + 0.05} top={170} big="CAMISA 9" accent="da seleção" size={120} accentColor={C.gold} />
					<Photo src="ronaldo.jpg" t0={w(75)} t1={CUTS[7]} x={110} y={430} w={400} h={430} pos="50% 25%" from="left" />
					<Photo src="romario.jpg" t0={w(77)} t1={CUTS[7]} x={570} y={430} w={400} h={430} pos="50% 18%" from="right" />
					{t > w(75) && <div style={{position: 'absolute', left: 110, top: 878, width: 400, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: 5, color: C.white}}>RONALDO</div>}
					{t > w(77) && <div style={{position: 'absolute', left: 570, top: 878, width: 400, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: 5, color: C.white}}>ROMÁRIO</div>}
					{t > w(86) - 0.05 && (
						<>
							<svg width={90} height={110} viewBox="0 0 24 28" style={{position: 'absolute', left: 150, top: 960, opacity: prog(t, w(86) - 0.05, 0.2)}}>
								<path d="M12 2v20M4 15l8 9 8-9" stroke={C.red} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							<div style={{position: 'absolute', left: 90, top: 1080, width: 220, textAlign: 'center', fontFamily: DISPLAY, fontSize: 60, color: C.red, opacity: prog(t, w(86) - 0.05, 0.2)}}>DECLÍNIO</div>
						</>
					)}
					<Photo src="fred_chuteira.jpg" t0={w(91) - 0.08} t1={CUTS[7]} x={380} y={960} w={560} h={430} pos="50% 18%" from="down" />
				</>
			)}
		</Scene>
		{/* 8 — mas isso não tira a qualidade */}
		<Scene i={7}>
			{() => (
				<>
					<Photo src="fred_chuteira.jpg" t0={CUTS[7]} t1={CUTS[8]} x={160} y={420} w={760} h={940} pos="50% 20%" />
					<Stamp t0={w(99)} text="QUALIDADE" x={540} y={1260} rot={-4} color={C.verdeLight} size={120} />
				</>
			)}
		</Scene>
		{/* 9 — a Copa de 2014 */}
		<Scene i={8}>
			{(t) => (
				<>
					<Title t0={CUTS[8] + 0.05} top={190} big="COPA 2014" accent="não foi boa, é inegável" size={150} accentColor={C.mute} />
					<Photo src="copa14_croacia.jpg" t0={w(107)} t1={CUTS[9]} x={80} y={500} w={620} h={440} rot={-4} from="left" />
					<Photo src="copa14_mexico.jpg" t0={w(110)} t1={CUTS[9]} x={380} y={760} w={620} h={440} rot={3} from="right" />
					{t > w(119) && <Title t0={w(119)} top={1230} big="E AÍ?" accent="queria que ele fizesse o quê?" size={120} accentFirst={false} accentColor={C.gold} />}
				</>
			)}
		</Scene>
		{/* 10 — um camisa 9 que sabe fazer gol */}
		<Scene i={9}>
			{(t) => (
				<>
					<div style={{position: 'absolute', top: 120, width: W, textAlign: 'center', fontFamily: DISPLAY, fontSize: 620, lineHeight: 1, color: 'rgba(255,255,255,0.08)', transform: `scale(${1 + 0.05 * prog(t, CUTS[9], 1.7)})`}}>9</div>
					<Photo src="copa14_gol.jpg" t0={CUTS[9]} t1={CUTS[10]} x={90} y={520} w={900} h={640} pos="45% 50%" />
					<Title t0={w(128)} top={1200} big="SABE FAZER GOL" size={120} color={C.gold} />
				</>
			)}
		</Scene>
		{/* 11 — não é o Ronaldo / não dribla como o Neymar */}
		<Scene i={10}>
			{(t) => (
				<>
					<Photo src="ronaldo.jpg" t0={CUTS[10]} t1={CUTS[11]} x={110} y={330} w={400} h={520} pos="50% 25%" gray={t > w(135) ? 0.7 : 0} />
					{t > w(135) && <Stamp t0={w(135)} text="NÃO É O RONALDO" x={540} y={260} rot={-3} size={78} color={C.white} />}
					{t > w(139) && (
						<svg width={900} height={560} style={{position: 'absolute', left: 90, top: 880}}>
							<rect x={0} y={0} width={900} height={560} rx={26} fill="rgba(14,122,69,0.35)" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
							<line x1={450} y1={0} x2={450} y2={560} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
							<rect x={780} y={170} width={120} height={220} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
							{[[260, 230], [420, 360], [560, 210], [690, 330]].map(([cx, cy], k) => (
								<circle key={k} cx={cx} cy={cy} r={22} fill={C.red} opacity={prog(t, w(139) + k * 0.1, 0.2)} />
							))}
							{(() => {
								const path = 'M 70 300 C 180 300 200 180 300 200 S 380 400 480 330 S 540 170 620 240 S 700 380 820 280';
								const k = prog(t, w(145), 1.1, easeOut);
								return <path d={path} stroke={C.gold} strokeWidth={10} fill="none" strokeDasharray="1400" strokeDashoffset={1400 * (1 - k)} strokeLinecap="round" />;
							})()}
							<text x={450} y={530} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill="#fff">
								pegar lá atrás e driblar todo mundo
							</text>
						</svg>
					)}
					<Photo src="neymar.jpg" t0={w(151) - 0.05} t1={CUTS[11]} x={590} y={330} w={400} h={520} pos="50% 20%" from="right" />
					{t > w(151) && <Label t0={w(151)} top={860} text="NEYMAR" color={C.gold} size={44} />}
				</>
			)}
		</Scene>
		{/* 12 — Copa das Confederações 2013 */}
		<Scene i={11}>
			{() => (
				<>
					<Label t0={w(160)} top={230} text="UM ANO ANTES" color={C.gold} size={44} />
					<Title t0={w(165)} top={290} big="COPA DAS" accent="Confederações 2013" size={150} accentColor={C.white} />
					<Photo src="fred_taca.jpg" t0={w(153)} t1={CUTS[12]} x={120} y={640} w={840} h={720} pos="45% 30%" />
				</>
			)}
		</Scene>
		{/* 13 — acabou com a Espanha, fez gol na Itália */}
		<Scene i={12}>
			{() => (
				<>
					<Photo src="confed_torcida9.jpg" t0={CUTS[12]} t1={CUTS[13]} x={0} y={0} w={1080} h={1920} pos="42% 50%" radius={0} border="transparent" gray={0.35} zoom={[1.1, 1.2]} />
					<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,7,13,0.55), rgba(5,7,13,0.2) 45%, rgba(5,7,13,0.75))'}} />
					<Score t0={w(172)} top={260} away="esp" score={[3, 0]} label="FINAL • MARACANÃ" note="2 gols de Fred" />
					<Score t0={w(177)} top={870} away="ita" score={[4, 2]} label="FASE DE GRUPOS • SALVADOR" note="2 gols de Fred" />
				</>
			)}
		</Scene>
		{/* 14 — um dos melhores do campeonato */}
		<Scene i={13}>
			{() => (
				<>
					<Photo src="fred_chuteira.jpg" t0={CUTS[13]} t1={CUTS[14]} x={200} y={250} w={680} h={820} pos="50% 25%" />
					<BigNumber t0={w(183)} top={1100} value={5} suffix=" GOLS" size={150} color={C.gold} dur={0.4} />
					<Label t0={w(186)} top={1285} text="CHUTEIRA DE PRATA DA COMPETIÇÃO" color={C.white} size={38} />
				</>
			)}
		</Scene>
		{/* 15 — o maior ídolo da história do Fluminense? */}
		<Scene i={14}>
			{(t) => (
				<>
					<Photo src="torcida_maracana.jpg" t0={CUTS[14]} t1={CUTS[15]} x={0} y={0} w={1080} h={1920} pos="50% 50%" radius={0} border="transparent" gray={0.3} zoom={[1.05, 1.15]} />
					<div style={{position: 'absolute', inset: 0, background: 'rgba(5,7,13,0.62)'}} />
					{t > w(199) - 0.05 && <Stamp t0={w(199) - 0.05} text="“ABSURDO”" x={540} y={330} rot={-5} size={120} color={C.white} />}
					<Crest t0={w(206)} x={540} y={800} size={360} />
					<Title t0={w(207)} top={1030} big="MAIOR ÍDOLO" accent="da história do Fluminense?" size={150} accentColor={C.gold} />
				</>
			)}
		</Scene>
		{/* 16 — "só ganhou dois brasileiros" */}
		<Scene i={15}>
			{() => (
				<>
					<Title t0={w(220) - 0.1} top={300} big="SÓ 2" accent="campeonatos brasileiros?" size={220} accentColor={C.white} />
					<Trophy t0={w(222)} x={330} y={780} size={300} year="2010" />
					<Trophy t0={w(222) + 0.2} x={750} y={780} size={300} year="2012" />
				</>
			)}
		</Scene>
		{/* 17 — torcedores, calma */}
		<Scene i={16}>
			{(t) => (
				<>
					<Title t0={w(228) - 0.05} top={330} big="CALMA" accent="torcedores," accentFirst size={260} accentColor={C.mute} />
					{t > w(232) - 0.05 && (
						<>
							<Label t0={w(232) - 0.05} top={760} text="O PESO DE" color={C.gold} size={52} />
							<Title t0={w(236)} top={830} big="2 BRASILEIROS" size={140} />
							<Trophy t0={w(237)} x={330} y={1030} size={220} year="2010" />
							<Trophy t0={w(237) + 0.12} x={750} y={1030} size={220} year="2012" />
						</>
					)}
				</>
			)}
		</Scene>
		{/* 18 — virou coisa banal? */}
		<Scene i={17}>
			{(t) => (
				<>
					<Title t0={w(239)} top={330} big="VIROU FÁCIL?" size={150} />
					{t > w(246) - 0.05 && <Stamp t0={w(246) - 0.05} text="BANAL?" x={540} y={720} rot={-8} size={180} color={C.gold} />}
					{t > w(249) - 0.05 && (
						<>
							<Title t0={w(249) - 0.05} top={960} big="BICAMPEÃO" accent="brasileiro" size={170} color={C.white} accentColor={C.gold} />
							<div style={{position: 'absolute', top: 1260, width: W, textAlign: 'center', fontSize: 90, color: C.gold, letterSpacing: 20, opacity: prog(t, w(249) + 0.1, 0.3)}}>★★</div>
						</>
					)}
				</>
			)}
		</Scene>
		{/* 19 — idolatria: não é só ganhar títulos */}
		<Scene i={18}>
			{(t) => {
				const tilt = interpolate(prog(t, w(275), 0.6, easeOut), [0, 1], [0, -14]);
				return (
					<>
						<Photo src="torcida_bravo.jpg" t0={CUTS[18]} t1={CUTS[19]} x={0} y={0} w={1080} h={1920} pos="50% 50%" radius={0} border="transparent" gray={0.2} zoom={[1.05, 1.18]} />
						<div style={{position: 'absolute', inset: 0, background: 'rgba(5,7,13,0.66)'}} />
						<Title t0={w(256)} top={250} big="IDOLATRIA" size={190} color={C.white} />
						{t > w(266) - 0.05 && (
							<div style={{position: 'absolute', left: 90, top: 700, width: 900, height: 500, transform: `rotate(${tilt}deg)`, transformOrigin: '50% 30%'}}>
								<div style={{position: 'absolute', left: 30, right: 30, top: 140, height: 12, borderRadius: 6, background: C.white}} />
								<div style={{position: 'absolute', left: 0, top: 170, width: 360, textAlign: 'center', fontFamily: DISPLAY, fontSize: 84, color: C.mute}}>TÍTULOS</div>
								{t > w(275) - 0.05 && (
									<div style={{position: 'absolute', right: 0, top: 170, width: 420, textAlign: 'center', fontFamily: DISPLAY, fontSize: 84, color: C.gold, lineHeight: 1}}>
										O QUE VOCÊ
										<br />
										REPRESENTA
									</div>
								)}
							</div>
						)}
						{t > w(278) - 0.1 && <Label t0={w(278) - 0.1} top={1260} text="PARA UMA TORCIDA" color={C.white} size={48} />}
					</>
				);
			}}
		</Scene>
		{/* 20 — a maior arrancada */}
		<Scene i={19}>
			{() => (
				<>
					<Photo src="fred_corre.jpg" t0={CUTS[19]} t1={CUTS[20]} x={90} y={560} w={900} h={660} pos="65% 40%" />
					<Title t0={w(293)} top={210} big="A MAIOR ARRANCADA" accent="da história?" size={120} accentColor={C.gold} />
					<Label t0={w(301)} top={1260} text="PARA FUGIR DO REBAIXAMENTO" color={C.red} size={44} />
				</>
			)}
		</Scene>
		{/* 21 — 2009: 99% de chance de cair, escapou e foi campeão em 2010 */}
		<Scene i={20}>
			{(t) => {
				const drain = prog(t, w(319), 0.9, easeOut);
				const pct = t < w(319) ? Math.round(99 * prog(t, w(309) - 0.1, 0.6, easeOut)) : Math.round(99 * (1 - drain));
				const col = t < w(319) ? C.red : C.verdeLight;
				return (
					<>
						<Label t0={w(305) - 0.05} top={220} text="BRASILEIRÃO 2009" color={C.gold} size={48} />
						<div style={{position: 'absolute', left: 190, top: 330, width: 700, height: 700}}>
							<svg width={700} height={700} viewBox="0 0 100 100">
								<circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={9} fill="none" />
								<circle cx={50} cy={50} r={42} stroke={col} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 263.9} 263.9`} transform="rotate(-90 50 50)" />
							</svg>
							<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
								<div style={{fontFamily: DISPLAY, fontSize: 210, color: col, lineHeight: 1}}>{pct}%</div>
								<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: C.white, letterSpacing: 3}}>{t < w(319) ? 'CHANCE DE REBAIXAMENTO' : 'ESCAPOU!'}</div>
							</div>
						</div>
						{t > w(319) && <Label t0={w(319) + 0.3} top={1060} text="11 JOGOS • 7 VITÓRIAS • 4 EMPATES" color={C.white} size={40} />}
						{t > w(325) - 0.1 && (
							<>
								<Trophy t0={w(325) - 0.1} x={540} y={1110} size={190} year="2010" />
								<Label t0={w(325)} top={1395} text="NO ANO SEGUINTE: CAMPEÃO" color={C.gold} size={42} />
							</>
						)}
					</>
				);
			}}
		</Scene>
		{/* 22 — 2014: recebido com carinho pela torcida */}
		<Scene i={21}>
			{(t) => (
				<>
					<Photo src="fred_treino_jul14.jpg" t0={CUTS[21]} t1={CUTS[22]} x={90} y={520} w={900} h={640} pos="62% 45%" />
					<Title t0={w(334)} top={200} big="2014" accent="de volta pra casa" size={200} accentColor={C.gold} />
					<Label t0={w(340)} top={1185} text="29/07/2014 • TREINO NAS LARANJEIRAS" color={C.mute} size={34} />
					{t > w(344) &&
						[0, 1, 2, 3, 4, 5, 6].map((k) => <Heart key={k} x={150 + k * 120} y={1300} t0={w(344) + k * 0.2} size={70 + (k % 3) * 20} />)}
				</>
			)}
		</Scene>
		{/* 23 — ídolo vai além de título: conexão */}
		<Scene i={22}>
			{(t) => (
				<>
					<Photo src="torcida_panorama.jpg" t0={CUTS[22]} t1={CUTS[23]} x={0} y={0} w={1080} h={1920} pos={`${interpolate(t, [CUTS[22], CUTS[23]], [20, 80])}% 50%`} radius={0} border="transparent" gray={0.15} zoom={[1.0, 1.08]} />
					<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,7,13,0.75), rgba(5,7,13,0.45) 50%, rgba(5,7,13,0.8))'}} />
					<Title t0={w(361)} top={260} big="ÍDOLO" accent="vai muito além de título" size={220} accentColor={C.mute} />
					{t > w(371) - 0.08 && (
						<div style={{position: 'absolute', top: 760, width: W, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 900, fontSize: 190, color: C.gold, textShadow: '0 0 60px rgba(242,193,78,0.5)', transform: `scale(${interpolate(springAt(Math.round(t * FPS), w(371) - 0.08, {damping: 10}), [0, 1], [0.4, 1])})`}}>
							conexão
						</div>
					)}
					{t > w(380) - 0.1 && <Crest t0={w(380) - 0.1} x={540} y={1180} size={240} />}
				</>
			)}
		</Scene>
		{/* 24 — se gostou, segue aí */}
		<Scene i={23}>
			{(t) => {
				const s = springAt(Math.round(t * FPS), CUTS[23] + 0.05, {damping: 11, stiffness: 200});
				const done = t > w(392) + 0.1;
				return (
					<>
						<Crest t0={CUTS[23]} x={540} y={640} size={300} />
						<div style={{position: 'absolute', top: 900, width: W, display: 'flex', justifyContent: 'center'}}>
							<div style={{padding: '26px 70px', borderRadius: 70, background: done ? C.verde : C.white, color: done ? C.white : '#000', fontFamily: DISPLAY, fontSize: 90, transform: `scale(${s})`, boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}}>{done ? '✓ SEGUINDO' : '+ SEGUE AÍ'}</div>
						</div>
					</>
				);
			}}
		</Scene>
	</>
);

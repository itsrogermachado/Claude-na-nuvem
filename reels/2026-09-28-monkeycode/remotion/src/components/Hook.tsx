import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {CUTS} from '../timeline';
import {T} from '../camera';
import {CLAUDE_PATH} from '../claudePath';
import {C, SANS, clamp01, easeOut, outlined, prog, springAt} from '../theme';
import {FPS, W} from '../timeline';

const CHIP_W = 600;
const CHIP_Y = 468;
/** Screen position of the Claude icon inside the chip (the 3D logo flies here) */
export const CHIP_ICON = {x: W / 2 - CHIP_W / 2 + 56, y: CHIP_Y};

export const ClaudeGlyph: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path d={CLAUDE_PATH} fill={color} />
	</svg>
);

export const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const OUT = CUTS[2] - 0.35;
	if (t > OUT + 0.4) return null;
	const exit = prog(t, OUT, 0.32);

	const l1 = springAt(frame, 0.0, {damping: 16, stiffness: 200});
	const l2 = springAt(frame, 0.1, {damping: 11, stiffness: 190});
	const under = prog(t, 0.35, 0.45, easeOut);

	const chipIn = springAt(frame, T.claudeWord1 - 0.04, {damping: 12, stiffness: 200});
	const swap = prog(t, T.cutB - 0.02, 0.22, easeOut);
	const arrive = T.logoFly + 0.42;
	const pulse = t >= arrive ? Math.sin(clamp01((t - arrive) / 0.3) * Math.PI) : 0;

	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - exit, transform: `translateY(${-40 * exit}px)`}}>
			<div
				style={{
					position: 'absolute',
					top: 212,
					width: W,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 900,
					fontSize: 62,
					color: C.white,
					transform: `translateY(${(1 - l1) * -30}px)`,
					opacity: clamp01(l1 * 2),
					...outlined(8),
				}}
			>
				ESTE VÍDEO FOI
			</div>
			<div
				style={{
					position: 'absolute',
					top: 280,
					width: W,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 900,
					fontSize: 104,
					letterSpacing: -1,
					color: C.green,
					transform: `scale(${interpolate(l2, [0, 1], [0.6, 1])})`,
					opacity: clamp01(l2 * 2),
					...outlined(11),
				}}
			>
				EDITADO POR IA
			</div>
			<div
				style={{
					position: 'absolute',
					top: 410,
					left: W / 2 - 330 * under,
					width: 660 * under,
					height: 10,
					borderRadius: 5,
					background: C.green,
					boxShadow: '0 0 0 4px #000',
					opacity: 1 - clamp01((t - T.claudeWord1 + 0.3) / 0.2),
				}}
			/>
			{chipIn > 0.001 && (
				<div
					style={{
						position: 'absolute',
						left: W / 2 - CHIP_W / 2,
						top: CHIP_Y - 46,
						width: CHIP_W,
						height: 92,
						borderRadius: 46,
						background: C.claude,
						boxShadow: '0 10px 30px rgba(0,0,0,0.35), 0 0 0 4px #000',
						transform: `scale(${chipIn})`,
						display: 'flex',
						alignItems: 'center',
						overflow: 'hidden',
					}}
				>
					<div style={{position: 'absolute', left: 56 - 28, top: 46 - 28, transform: `scale(${1 + 0.35 * pulse}) rotate(${pulse * 40}deg)`}}>
						<ClaudeGlyph size={56} color={C.white} />
					</div>
					<div style={{position: 'absolute', left: 100, right: 20, top: 0, bottom: 0}}>
						{['CLAUDE CODE', 'CLAUDE OPUS 5.5'].map((label, i) => {
							const v = i === 0 ? 1 - swap : swap;
							return (
								<div
									key={label}
									style={{
										position: 'absolute',
										inset: 0,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontFamily: SANS,
										fontWeight: 900,
										fontSize: 48,
										color: C.white,
										letterSpacing: 0.5,
										opacity: v,
										transform: `translateY(${(i === 0 ? -1 : 1) * (1 - v) * 40}px)`,
									}}
								>
									{label}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

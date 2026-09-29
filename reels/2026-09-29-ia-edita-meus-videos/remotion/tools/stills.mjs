// Renders preview stills for a list of output seconds: node tools/stills.mjs 0.5 2.8 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Reel', chromiumOptions: {gl: 'swangle'}});
for (const t of times) {
	const frame = Math.round(t * 60);
	const output = `out/still_${String(frame).padStart(4, '0')}.png`;
	const t0 = Date.now();
	await renderStill({serveUrl, composition, frame, output, chromiumOptions: {gl: 'swangle'}, imageFormat: 'png'});
	console.log(output, Date.now() - t0, 'ms');
}

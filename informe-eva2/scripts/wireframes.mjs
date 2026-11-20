// Render low-fidelity wireframes: src/wireframes/*.html -> src/assets/wireframes/<name>.png (2x).
// Shared styles live in src/wireframes/_base.css and are inlined into every page.
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { launchBrowser } from './lib/browser.mjs';
import { SRC } from './lib/paths.mjs';

const SOURCE = resolve(SRC, 'wireframes');
const TARGET = resolve(SRC, 'assets/wireframes');
const FONT_DIR = resolve(SRC, '..', 'node_modules/@fontsource/roboto/files');

const names = (await readdir(SOURCE)).filter(
	(name) => name.endsWith('.html') && !name.startsWith('_'),
);
await mkdir(TARGET, { recursive: true });

const base = await readFile(resolve(SOURCE, '_base.css'), 'utf8');
const fonts = [];
for (const weight of [400, 700]) {
	const data = await readFile(
		resolve(FONT_DIR, `roboto-latin-${weight}-normal.woff2`),
	);
	fonts.push(
		`@font-face{font-family:Roboto;font-weight:${weight};src:url(data:font/woff2;base64,${data.toString('base64')}) format('woff2')}`,
	);
}

const browser = await launchBrowser();
try {
	const page = await browser.newPage({
		deviceScaleFactor: 2,
		viewport: { height: 900, width: 1100 },
	});
	for (const name of names) {
		const body = await readFile(resolve(SOURCE, name), 'utf8');
		await page.setContent(`<style>${fonts.join('')}${base}</style>${body}`);
		await page.evaluate(() => document.fonts.ready);
		await page.locator('.wf').screenshot({
			path: resolve(TARGET, `${basename(name, '.html')}.png`),
		});
		console.log(`Wireframe → ${name}`);
	}
} finally {
	await browser.close();
}

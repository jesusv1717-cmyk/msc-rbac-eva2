import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { launchBrowser } from './browser.mjs';
import { ROOT, SRC } from './paths.mjs';

const DIAGRAMS = resolve(SRC, 'diagramas');
const OUT = resolve(SRC, 'assets/diagramas');
const FONT_DIR = resolve(ROOT, 'node_modules/@fontsource/roboto/files');

const mtime = async (file) => {
	try {
		return (await stat(file)).mtimeMs;
	} catch {
		return 0;
	}
};

/** Mermaid theme built from the brand tokens (no raw hex outside tokens.json). */
function themeVariables({ colors }) {
	return {
		fontFamily: 'Roboto, Arial, sans-serif',
		lineColor: colors.secondary[700],
		primaryBorderColor: colors.primary[700],
		primaryColor: colors.primary[100],
		primaryTextColor: colors.secondary[900],
		secondaryColor: colors.secondary[100],
		tertiaryColor: colors.white,
		actorBkg: colors.primary[100],
		actorBorder: colors.primary[700],
		noteBkgColor: colors.secondary[50],
		noteBorderColor: colors.secondary[300],
		signalColor: colors.secondary[700],
		activationBkgColor: colors.primary[200],
		// Solid label backgrounds so lines never run through text.
		edgeLabelBackground: colors.white,
	};
}

/** Halo injected into each SVG: white outline behind sequence texts so lifelines never cross the letters. */
function haloCss({ colors }) {
	const halo = `paint-order: stroke !important; stroke: ${colors.white} !important; stroke-width: 6px !important; stroke-linejoin: round !important;`;
	return `.messageText, .loopText, .labelText, .noteText, .loopText tspan { ${halo} }`;
}

/** Extra CSS: a white halo behind message and edge text keeps labels legible over lines. */
function themeCss({ colors }) {
	const halo = `paint-order: stroke; stroke: ${colors.white}; stroke-width: 5px; stroke-linejoin: round;`;
	return `.messageText, .loopText, .labelText, .noteText { ${halo} } .edgeLabel { background-color: ${colors.white}; padding: 2px 4px; }`;
}

async function robotoCss() {
	const faces = [];
	for (const weight of [400, 700]) {
		const data = await readFile(
			resolve(FONT_DIR, `roboto-latin-${weight}-normal.woff2`),
		);
		faces.push(
			`@font-face{font-family:Roboto;font-weight:${weight};src:url(data:font/woff2;base64,${data.toString('base64')}) format('woff2')}`,
		);
	}
	return faces.join('');
}

/**
 * Render every src/diagramas/*.mmd to src/assets/diagramas/<name>.png (2x).
 * Skips diagrams whose PNG is newer than the source.
 * Returns the names that were rendered.
 */
export async function renderDiagrams(tokens) {
	let names = [];
	try {
		names = (await readdir(DIAGRAMS)).filter((name) =>
			name.endsWith('.mmd'),
		);
	} catch {
		return [];
	}
	await mkdir(OUT, { recursive: true });
	const stale = [];
	for (const name of names) {
		const target = resolve(OUT, `${basename(name, '.mmd')}.png`);
		if ((await mtime(target)) < (await mtime(resolve(DIAGRAMS, name)))) {
			stale.push(name);
		}
	}
	if (stale.length === 0) return [];

	const browser = await launchBrowser();
	try {
		const page = await browser.newPage({
			deviceScaleFactor: 2,
			viewport: { height: 1200, width: 1400 },
		});
		await page.setContent(
			`<style>${await robotoCss()} body{margin:0;background:#fff} #box{display:block;width:max-content;padding:12px;background:#fff} #box svg{max-width:none !important}</style><div id="box"></div>`,
		);
		await page.addScriptTag({
			content: await readFile(
				resolve(ROOT, 'node_modules/mermaid/dist/mermaid.min.js'),
				'utf8',
			),
		});
		await page.evaluate(
			({ css, variables }) =>
				globalThis.mermaid.initialize({
					startOnLoad: false,
					theme: 'base',
					flowchart: {
						nodeSpacing: 45,
						rankSpacing: 60,
						padding: 12,
					},
					sequence: {
						actorMargin: 90,
						messageMargin: 42,
						boxMargin: 12,
						noteMargin: 14,
						mirrorActors: false,
					},
					class: { padding: 6 },
					themeCSS: css,
					themeVariables: variables,
				}),
			{ css: themeCss(tokens), variables: themeVariables(tokens) },
		);
		for (const name of stale) {
			const code = await readFile(resolve(DIAGRAMS, name), 'utf8');
			await page.evaluate(
				async ({ haloCss, source }) => {
					const { svg } = await globalThis.mermaid.render(
						'diagram',
						source,
					);
					const box = document.querySelector('#box');
					box.innerHTML = svg;
					// Halo behind labels, injected last so it wins over Mermaid's own rules.
					const style = document.createElementNS(
						'http://www.w3.org/2000/svg',
						'style',
					);
					style.textContent = haloCss;
					box.querySelector('svg').append(style);
					// Lifelines are drawn after the messages: send them to the back so text stays on top.
					const root = box.querySelector('svg');
					for (const line of [
						...box.querySelectorAll('.actor-line'),
					].reverse()) {
						root.prepend(line);
					}
					// White box behind each message/loop label so no line crosses the letters.
					await document.fonts.ready;
					for (const text of box.querySelectorAll(
						'text.messageText, text.loopText',
					)) {
						const bounds = text.getBBox();
						if (!bounds.width) continue;
						const pad = 3;
						const rect = document.createElementNS(
							'http://www.w3.org/2000/svg',
							'rect',
						);
						rect.setAttribute('x', String(bounds.x - pad));
						rect.setAttribute('y', String(bounds.y - 1));
						rect.setAttribute(
							'width',
							String(bounds.width + pad * 2),
						);
						rect.setAttribute('height', String(bounds.height + 2));
						rect.setAttribute('fill', 'white');
						text.before(rect);
					}
					// Mermaid emits width="100%": pin the natural size from the viewBox.
					const element = box.querySelector('svg');
					const { height, width } = element.viewBox.baseVal;
					element.setAttribute('width', String(width));
					element.setAttribute('height', String(height));
					await document.fonts.ready;
				},
				{ haloCss: haloCss(tokens), source: code },
			);
			await page.locator('#box').screenshot({
				omitBackground: false,
				path: resolve(OUT, `${basename(name, '.mmd')}.png`),
			});
		}
	} finally {
		await browser.close();
	}
	return stale;
}

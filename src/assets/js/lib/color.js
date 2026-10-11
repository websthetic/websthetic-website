// ─────────────────────────────────────────────────────────────────────────────
// COLOUR HELPERS
// Shared colour maths: hex parsing, mixing, and the WCAG 2.x relative
// luminance and contrast formulas. Used by the contrast checker and the
// Wada palette switcher (theme-switcher.js).
// ─────────────────────────────────────────────────────────────────────────────

// "#abc" / "abc" / "#aabbcc" -> "#AABBCC", or null if it isn't a valid colour
export const normalizeHex = (value) => {
	let v = String(value).trim().replace(/^#/, "");
	if (/^[0-9a-f]{3}$/i.test(v)) v = v.split("").map((c) => c + c).join("");
	return /^[0-9a-f]{6}$/i.test(v) ? `#${v.toUpperCase()}` : null;
};

export const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export const rgbToHex = (rgb) => `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("").toUpperCase()}`;

// blend a toward b by amount (0 = a, 1 = b)
export const mix = (a, b, amount) => {
	const ca = hexToRgb(a);
	const cb = hexToRgb(b);
	return rgbToHex(ca.map((c, i) => c + (cb[i] - c) * amount));
};

// WCAG relative luminance
export const luminance = (hex) => {
	const [r, g, b] = hexToRgb(hex).map((v) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a, b) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

// nudge a colour toward a target (usually black or white) until a test passes
const stepToward = (hex, target, passes) => {
	for (let t = 0; t <= 1.0001; t += 0.02) {
		const candidate = mix(hex, target, t);
		if (passes(candidate)) return candidate;
	}
	return target;
};

const WHITE = "#FFFFFF";
const BLACK = "#000000";

// how colourful a colour is (0 - 255), used to pick the button colour
const chroma = (hex) => {
	const rgb = hexToRgb(hex);
	return Math.max(...rgb) - Math.min(...rgb);
};

/**
 * Turn a Wada combination (2 - 4 hex colours) into the site's accent colours.
 * Backgrounds, dark sections and body text keep the Websthetic colours - only
 * the accents change, tuned so everything stays readable (WCAG AA or better):
 * - --accent-1…4 are the combination's colours, lightened into pastels so they
 *   carry black text and read as text on the black sections
 *   (cards, highlighted words, illustrations, buttons on dark sections)
 * - --button-bg is the combination's most colourful colour, deepened until
 *   white text on it passes AA (the solid buttons on light sections)
 */
export const themeFromCombination = (colors) => {
	const accents = [0, 1, 2, 3].map((i) => stepToward(colors[i % colors.length], WHITE, (c) => luminance(c) >= 0.5));
	const vivid = [...colors].sort((a, b) => chroma(b) - chroma(a))[0];
	const buttonBg = stepToward(vivid, BLACK, (c) => contrast(c, WHITE) >= 4.6);

	return {
		"--accent-1": accents[0],
		"--accent-2": accents[1],
		"--accent-3": accents[2],
		"--accent-4": accents[3],
		"--button-bg": buttonBg,
	};
};

// the Websthetic colours that stay fixed - the accents are checked against them
export const FIXED = {
	"--background": "#FFFFFF",
	"--background-soft": "#F9F9F9",
	"--dark": "#000000",
	"--dark-2": "#141414",
	"--text-on-accent": "#3D4148",
	"--button-text": "#FFFFFF",
};

// the role/background pairs the site relies on, with the contrast each must meet
export const ROLE_CHECKS = [
	["--dark", "--accent-1", 4.5],
	["--dark", "--accent-2", 4.5],
	["--dark", "--accent-3", 4.5],
	["--dark", "--accent-4", 4.5],
	["--accent-1", "--dark-2", 4.5],
	["--accent-4", "--dark-2", 4.5],
	["--text-on-accent", "--accent-1", 4.5],
	["--text-on-accent", "--accent-2", 4.5],
	["--text-on-accent", "--accent-3", 4.5],
	["--text-on-accent", "--accent-4", 4.5],
	["--button-text", "--button-bg", 4.5],
	["--button-bg", "--background-soft", 3],
];

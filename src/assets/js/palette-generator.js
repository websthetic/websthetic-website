// ─────────────────────────────────────────────────────────────────────────────
// COLOUR PALETTE GENERATOR
// Resources > Colour Palette Generator. Builds five-colour palettes from a
// colour harmony (complementary, monochromatic, analogous, triadic, random).
// Locked swatches keep their colour; the rest are regenerated. Palettes can
// be copied as CSS variables or HEX codes, or downloaded as a PNG.
// ─────────────────────────────────────────────────────────────────────────────

import { contrast, rgbToHex, normalizeHex } from "./lib/color.js";

(() => {
	const tool = document.getElementById("palette-tool");
	if (!tool) return;

	// Configuration
	const CONFIG = {
		COPIED_MS: 1400, // how long "Copied!" shows on a swatch
		PNG: { WIDTH: 1500, HEIGHT: 700, LABEL_HEIGHT: 110 }, // size of the downloaded image
		CSS_PREFIX: "--palette", // CSS variable names: --palette-1 … --palette-5
	};

	const el = (id) => document.getElementById(id);
	const generateButton = el("palette-generate");
	const exportButton = el("palette-export");
	const exportMenu = el("palette-export-menu");
	const harmonySelect = el("palette-harmony");
	const status = el("palette-status");
	const swatchEls = [...tool.querySelectorAll(".cs-swatch")];

	// the current palette - starts from the swatches in the page
	const palette = swatchEls.map((swatch) => ({
		hex: normalizeHex(swatch.style.getPropertyValue("--swatch")) || "#000000",
		locked: false,
	}));

	// Colour helpers
	const wrap = (h) => ((h % 360) + 360) % 360;
	const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
	const rand = (min, max) => min + Math.random() * (max - min);

	// h 0-360, s and l 0-100
	const hsl = (h, s, l) => {
		s = clamp(s, 0, 100) / 100;
		l = clamp(l, 0, 100) / 100;
		const k = (n) => (n + wrap(h) / 30) % 12;
		const a = s * Math.min(l, 1 - l);
		const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
		return rgbToHex([f(0), f(8), f(4)].map((v) => v * 255));
	};

	// black or white, whichever reads better on the colour
	const textFor = (hex) => (contrast(hex, "#000000") >= contrast(hex, "#FFFFFF") ? "dark" : "light");

	// Harmonies - each returns five colours from a random base hue and saturation
	const HARMONIES = {
		// a strong colour, its pale tint, then a deep, pale and soft version of the opposite hue
		complementary: (h, s) => [hsl(h, s, rand(36, 46)), hsl(h, s * 0.85, rand(86, 91)), hsl(h + 180, s * 0.6, rand(9, 14)), hsl(h + 180, s * 0.75, rand(87, 92)), hsl(h + 160, s * 0.35, rand(90, 94))],
		// one hue from dark to light
		monochromatic: (h, s) => [14, 30, 48, 70, 90].map((l, i) => hsl(h, s * (i === 0 ? 0.7 : 1 - i * 0.08), l + rand(-3, 3))),
		// neighbouring hues, spread from dark to light
		analogous: (h, s) => [-36, -18, 0, 18, 36].map((offset, i) => hsl(h + offset, s * rand(0.75, 1), [28, 45, 58, 76, 90][i] + rand(-3, 3))),
		// three hues a third of the wheel apart, plus a pale and a deep neutral
		triadic: (h, s) => [hsl(h, s, rand(44, 52)), hsl(h + 120, s * 0.9, rand(48, 58)), hsl(h + 240, s * 0.9, rand(40, 50)), hsl(h, s * 0.35, rand(90, 94)), hsl(h + 240, s * 0.4, rand(10, 15))],
		// anything goes
		random: () => Array.from({ length: 5 }, () => hsl(rand(0, 360), rand(30, 90), rand(15, 90))),
	};

	const render = () => {
		palette.forEach(({ hex, locked }, i) => {
			const swatch = swatchEls[i];
			swatch.style.setProperty("--swatch", hex);
			swatch.dataset.text = textFor(hex);
			swatch.classList.toggle("cs-locked", locked);
			const lock = swatch.querySelector(".cs-lock");
			lock.setAttribute("aria-pressed", locked);
			lock.setAttribute("aria-label", `${locked ? "Unlock" : "Lock"} ${hex}`);
			const code = swatch.querySelector(".cs-hex");
			code.textContent = hex;
			code.setAttribute("aria-label", `Copy ${hex}`);
		});
	};

	const generate = () => {
		const colours = HARMONIES[harmonySelect.value](rand(0, 360), rand(45, 85));
		palette.forEach((swatch, i) => {
			if (!swatch.locked) swatch.hex = colours[i];
		});
		render();
		status.textContent = `New ${harmonySelect.value} palette: ${palette.map((s) => s.hex).join(", ")}`;
	};

	// Clipboard, with a fallback for browsers that block the async API
	const copy = async (text) => {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			const area = document.createElement("textarea");
			area.value = text;
			area.setAttribute("readonly", "");
			area.style.position = "fixed";
			area.style.opacity = "0";
			document.body.appendChild(area);
			area.select();
			const ok = document.execCommand("copy");
			area.remove();
			return ok;
		}
	};

	// Exports
	const EXPORTS = {
		css: async () => {
			const css = `:root {\n${palette.map((s, i) => `\t${CONFIG.CSS_PREFIX}-${i + 1}: ${s.hex};`).join("\n")}\n}`;
			status.textContent = (await copy(css)) ? "CSS variables copied" : "Couldn’t copy - your browser blocked the clipboard";
		},
		hex: async () => {
			status.textContent = (await copy(palette.map((s) => s.hex).join(", "))) ? "HEX codes copied" : "Couldn’t copy - your browser blocked the clipboard";
		},
		png: () => {
			const { WIDTH, HEIGHT, LABEL_HEIGHT } = CONFIG.PNG;
			const canvas = document.createElement("canvas");
			canvas.width = WIDTH;
			canvas.height = HEIGHT;
			const ctx = canvas.getContext("2d");
			const w = WIDTH / palette.length;
			const font = getComputedStyle(document.body).fontFamily;
			palette.forEach(({ hex }, i) => {
				ctx.fillStyle = hex;
				ctx.fillRect(i * w, 0, Math.ceil(w), HEIGHT);
				ctx.fillStyle = textFor(hex) === "dark" ? "#000000" : "#FFFFFF";
				ctx.font = `600 34px ${font}`;
				ctx.textAlign = "center";
				ctx.fillText(hex, i * w + w / 2, HEIGHT - LABEL_HEIGHT / 2);
			});
			const link = document.createElement("a");
			link.download = `websthetic-palette-${palette.map((s) => s.hex.slice(1)).join("-").toLowerCase()}.png`;
			link.href = canvas.toDataURL("image/png");
			link.click();
			status.textContent = "Palette downloaded as a PNG";
		},
	};

	const setMenu = (open) => {
		exportMenu.hidden = !open;
		exportButton.setAttribute("aria-expanded", open);
	};

	// Events
	generateButton.addEventListener("click", generate);
	harmonySelect.addEventListener("change", generate);

	swatchEls.forEach((swatch, i) => {
		swatch.querySelector(".cs-lock").addEventListener("click", () => {
			palette[i].locked = !palette[i].locked;
			render();
			status.textContent = `${palette[i].hex} ${palette[i].locked ? "locked" : "unlocked"}`;
		});

		const code = swatch.querySelector(".cs-hex");
		code.addEventListener("click", async () => {
			const hex = palette[i].hex;
			if (!(await copy(hex))) return;
			code.textContent = "Copied!";
			status.textContent = `${hex} copied`;
			clearTimeout(code.timer);
			code.timer = setTimeout(() => (code.textContent = palette[i].hex), CONFIG.COPIED_MS);
		});
	});

	exportButton.addEventListener("click", () => setMenu(exportMenu.hidden));
	exportMenu.addEventListener("click", (event) => {
		const option = event.target.closest("[data-export]");
		if (!option) return;
		setMenu(false);
		exportButton.focus();
		EXPORTS[option.dataset.export]();
	});
	document.addEventListener("click", (event) => {
		if (!exportMenu.hidden && !event.target.closest(".cs-export")) setMenu(false);
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !exportMenu.hidden) {
			setMenu(false);
			exportButton.focus();
			return;
		}
		// Space generates - unless it's pressing a button, typing, or picking from the dropdown
		if (event.code !== "Space" || event.target.closest("button, a, input, select, textarea, summary, [contenteditable]")) return;
		event.preventDefault();
		generate();
	});

	render();
})();

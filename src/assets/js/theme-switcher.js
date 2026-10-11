// ─────────────────────────────────────────────────────────────────────────────
// WADA PALETTE SWITCHER
// "Change Colour" re-colours the site's accents (pastel cards, highlighted
// words, illustrations, buttons) with a random one of the 348 combinations
// from Sanzo Wada's "A Dictionary of Color Combinations". Backgrounds keep the
// Websthetic colours. themeFromCombination() turns a combination into the
// accent tokens from root.less, keeping text at WCAG AA contrast or better. The choice is saved, and the
// inline script in base.html applies it before the next page draws.
// ─────────────────────────────────────────────────────────────────────────────

import { COLORS, COMBINATIONS } from "./data/wada-combinations.js";
import { themeFromCombination } from "./lib/color.js";

(() => {
	const switcher = document.getElementById("cs-theme-switcher");
	if (!switcher) return;

	// Configuration
	const CONFIG = {
		// keep in sync with the inline script in base.html. v2: only accents are themed now, so older saved themes (which also set backgrounds) are ignored
		STORAGE_KEY: "websthetic-wada-theme-v2",
		ANIMATING_CLASS: "cs-theme-animating",
		ANIMATION_MS: 450,
		DEFAULT: -1, // the Websthetic palette (no combination)
	};

	const root = document.documentElement;
	const swatches = switcher.querySelector(".cs-ts-swatches");
	const shuffleButton = switcher.querySelector("[data-theme-action=shuffle]");
	const resetButton = switcher.querySelector("[data-theme-action=reset]");
	const live = switcher.querySelector("[aria-live]");
	const total = COMBINATIONS.length;

	// the token names a combination sets, so they can all be cleared on reset
	const TOKENS = Object.keys(themeFromCombination(["#000000", "#FFFFFF"]));

	const pad = (n) => String(n).padStart(3, "0");
	const hexesFor = (index) => COMBINATIONS[index].map((i) => COLORS[i].hex);

	const load = () => {
		try {
			const saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY));
			return saved && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < total ? saved.index : CONFIG.DEFAULT;
		} catch {
			return CONFIG.DEFAULT;
		}
	};

	const save = (index, roles) => {
		try {
			if (index === CONFIG.DEFAULT) localStorage.removeItem(CONFIG.STORAGE_KEY);
			else localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({ index, roles }));
		} catch {
			// storage is blocked (private mode etc.) - the colours still change, they just aren't remembered
		}
	};

	// the current colours in the pill, and a tooltip naming the combination
	const render = (index) => {
		const isDefault = index === CONFIG.DEFAULT;
		const colors = isDefault ? ["--accent-1", "--accent-2", "--accent-3", "--accent-4"].map((t) => `var(${t})`) : hexesFor(index);
		swatches.replaceChildren(
			...colors.map((color) => {
				const dot = document.createElement("span");
				dot.className = "cs-ts-swatch";
				dot.style.backgroundColor = color;
				return dot;
			})
		);
		shuffleButton.title = isDefault ? "Websthetic colours" : `Sanzo Wada, combination ${pad(index + 1)}: ${COMBINATIONS[index].map((i) => COLORS[i].name).join(", ")}`;
		// keep focus on the pill if reset hides itself
		if (isDefault && document.activeElement === resetButton) shuffleButton.focus();
		resetButton.hidden = isDefault;
	};

	let current = load();

	const apply = (index, { animate = true, announce = true } = {}) => {
		current = index;
		const roles = index === CONFIG.DEFAULT ? null : themeFromCombination(hexesFor(index));

		// a short colour fade, skipped under prefers-reduced-motion in root.less
		if (animate) {
			root.classList.add(CONFIG.ANIMATING_CLASS);
			clearTimeout(apply.timer);
			apply.timer = setTimeout(() => root.classList.remove(CONFIG.ANIMATING_CLASS), CONFIG.ANIMATION_MS);
		}

		TOKENS.forEach((token) => (roles ? root.style.setProperty(token, roles[token]) : root.style.removeProperty(token)));
		save(index, roles);
		render(index);
		if (announce) live.textContent = index === CONFIG.DEFAULT ? "Websthetic colours restored" : `Colour combination ${index + 1} of ${total}`;
		document.dispatchEvent(new CustomEvent("themechange", { detail: { index, roles } }));
	};

	const actions = {
		shuffle: () => {
			let index;
			do index = Math.floor(Math.random() * total);
			while (index === current);
			apply(index);
		},
		reset: () => apply(CONFIG.DEFAULT),
	};

	switcher.addEventListener("click", (event) => {
		const button = event.target.closest("[data-theme-action]");
		if (button) actions[button.dataset.themeAction]();
	});

	// re-apply the saved choice with fresh values (the inline script used the stored copy)
	apply(current, { animate: false, announce: false });
	switcher.hidden = false;
})();

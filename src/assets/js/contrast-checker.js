// ─────────────────────────────────────────────────────────────────────────────
// COLOUR CONTRAST CHECKER
// Live WCAG contrast ratio for the Resources > Colour Contrast Checker page.
// Uses the WCAG 2.x relative luminance formula (shared maths in lib/color.js).
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeHex as normalize, contrast } from "./lib/color.js";

(() => {
	const tool = document.getElementById("contrast-tool");
	if (!tool) return;

	const el = (id) => document.getElementById(id);
	const fields = {
		bg: { picker: el("bg-picker"), hex: el("bg-hex") },
		fg: { picker: el("fg-picker"), hex: el("fg-hex") },
	};
	const preview = el("contrast-preview");
	const ratioEl = el("contrast-ratio");
	const ratingEl = el("contrast-rating");
	const checks = tool.querySelectorAll(".cs-check");

	const rating = (ratio) => {
		if (ratio >= 7) return "Excellent!";
		if (ratio >= 4.5) return "Good";
		if (ratio >= 3) return "Large text only";
		return "Poor contrast";
	};

	const update = () => {
		const bg = normalize(fields.bg.hex.value);
		const fg = normalize(fields.fg.hex.value);
		if (!bg || !fg) return;

		preview.style.backgroundColor = bg;
		preview.style.color = fg;
		preview.style.setProperty("--preview-fg", fg);
		preview.style.setProperty("--preview-bg", bg);

		const ratio = contrast(bg, fg);
		// round down so a ratio is never shown as passing when it narrowly doesn't
		const shown = Math.floor(ratio * 100) / 100;
		ratioEl.textContent = `${shown.toFixed(2)}:1`;
		ratingEl.textContent = rating(ratio);
		// the dial fills in proportion to the ratio, out of the maximum of 21
		tool.style.setProperty("--score", Math.min(ratio / 21, 1).toFixed(3));
		tool.dataset.level = ratio >= 7 ? "excellent" : ratio >= 4.5 ? "good" : ratio >= 3 ? "fair" : "poor";

		checks.forEach((row) => {
			const pass = ratio >= parseFloat(row.dataset.min);
			row.classList.toggle("cs-fail", !pass);
			row.querySelector(".cs-result").textContent = pass ? "Pass" : "Fail";
		});
	};

	Object.values(fields).forEach(({ picker, hex }) => {
		// picker -> text box
		picker.addEventListener("input", () => {
			hex.value = picker.value.toUpperCase();
			hex.removeAttribute("aria-invalid");
			update();
		});
		// text box -> picker, only once it's a valid colour
		hex.addEventListener("input", () => {
			const value = normalize(hex.value);
			hex.toggleAttribute("aria-invalid", !value);
			if (value) {
				picker.value = value.toLowerCase();
				update();
			}
		});
		// tidy the format when leaving the field
		hex.addEventListener("blur", () => {
			const value = normalize(hex.value);
			if (value) hex.value = value;
		});
	});

	el("contrast-swap").addEventListener("click", () => {
		const bg = fields.bg.hex.value;
		fields.bg.hex.value = fields.fg.hex.value;
		fields.fg.hex.value = bg;
		fields.bg.picker.value = normalize(fields.bg.hex.value).toLowerCase();
		fields.fg.picker.value = normalize(fields.fg.hex.value).toLowerCase();
		update();
	});

	tool.querySelectorAll("[data-copy]").forEach((button) => {
		button.addEventListener("click", async () => {
			const value = el(button.dataset.copy).value;
			try {
				await navigator.clipboard.writeText(value);
				button.classList.add("cs-copied");
				setTimeout(() => button.classList.remove("cs-copied"), 1200);
			} catch (error) {
				// clipboard unavailable (e.g. not on https) - select the text so it can be copied manually
				el(button.dataset.copy).select();
			}
		});
	});

	update();
})();

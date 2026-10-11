// ─────────────────────────────────────────────────────────────────────────────
// SECTION SCROLL BLUR
// Like the hero: as each section scrolls off the top of the screen, its content
// blurs, fades, and drifts up. Scrolling back up clears it again.
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	// visitors who prefer reduced motion keep everything static
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	// Configuration
	const CONFIG = {
		// the content inside each section that blurs - add or remove sections here
		SELECTORS: ["#work", "#what-we-do", "#who-we-work-with", "#how-we-work", "#why-websthetic", "#cta-51"],
		// the blur starts once the section's bottom edge is above this point of the screen (0 = top, 1 = bottom),
		// and is complete when the bottom edge reaches the top of the screen
		START: 0.35,
		MAX_BLUR: 10, // px
		MIN_OPACITY: 0.2,
		LIFT: 40, // px the content drifts up
	};

	const sections = CONFIG.SELECTORS.map((selector) => {
		const section = document.querySelector(selector);
		const content = section && section.querySelector(".cs-container");
		return content ? { section, content, active: false } : null;
	}).filter(Boolean);
	if (!sections.length) return;

	let ticking = false;

	const update = () => {
		ticking = false;
		const start = window.innerHeight * CONFIG.START;

		sections.forEach((item) => {
			const bottom = item.section.getBoundingClientRect().bottom;
			const progress = Math.min(1, Math.max(0, 1 - bottom / start));

			if (progress === 0) {
				// only clear the styles once, when it comes back into full view
				if (item.active) {
					item.content.style.filter = "";
					item.content.style.opacity = "";
					item.content.style.transform = "";
					item.active = false;
				}
				return;
			}

			item.active = true;
			item.content.style.filter = `blur(${(progress * CONFIG.MAX_BLUR).toFixed(2)}px)`;
			item.content.style.opacity = (1 - progress * (1 - CONFIG.MIN_OPACITY)).toFixed(3);
			item.content.style.transform = `translateY(${(-progress * CONFIG.LIFT).toFixed(1)}px)`;
		});
	};

	window.addEventListener(
		"scroll",
		() => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		},
		{ passive: true },
	);
	window.addEventListener("resize", update);
	update();
})();

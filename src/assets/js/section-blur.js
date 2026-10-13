// ─────────────────────────────────────────────────────────────────────────────
// SECTION SCROLL BLUR
// Like the hero: as each section scrolls off the top of the screen, its content
// blurs, fades, and drifts up. Scrolling back up clears it again.
// Runs on every page (loaded in base.html) - it picks up each top-level section
// of <main> that has a .cs-container, including the inner page banners.
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	// visitors who prefer reduced motion keep everything static
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	// Configuration
	const CONFIG = {
		// which sections blur - every top-level section of the page
		SELECTORS: "#main > section[id], #main > div[id]",
		// sections left out - the home hero has its own version in hero-scroll.js
		SKIP: ["hero-143"],
		// the blur starts once the section's bottom edge is above this point of the screen (0 = top, 1 = bottom),
		// and is complete when the bottom edge reaches the top of the screen
		START: 0.35,
		MAX_BLUR: 10, // px
		MIN_OPACITY: 0.2,
		LIFT: 40, // px the content drifts up
	};

	const sections = [...document.querySelectorAll(CONFIG.SELECTORS)]
		.filter((section) => !CONFIG.SKIP.includes(section.id))
		.map((section) => {
			const content = section.querySelector(":scope > .cs-container");
			return content ? { section, content, active: false } : null;
		})
		.filter(Boolean);
	if (!sections.length) return;

	// phones get the fade and drift without the blur, like the hero - blurring while scrolling makes them stutter
	const mobile = window.matchMedia("(max-width: 47.9375rem)");

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
			item.content.style.filter = mobile.matches ? "" : `blur(${(progress * CONFIG.MAX_BLUR).toFixed(2)}px)`;
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

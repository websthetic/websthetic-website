// ─────────────────────────────────────────────────────────────────────────────
// HERO SCROLL EFFECTS
// As the visitor scrolls past the home page hero:
// - the starry background and globe move slower than the page (parallax)
// - after a short delay, the content blurs, fades, and drifts up
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	const hero = document.getElementById("hero-143");
	const content = hero && hero.querySelector(".cs-container");
	if (!content) return;

	// visitors who prefer reduced motion keep everything static
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	// Configuration
	const CONFIG = {
		// parallax - how fast each layer moves compared to the page (0 = fixed in place, 1 = normal scroll)
		BACKGROUND_SPEED: 0.4,
		GLOBE_SPEED: 0.25,
		// blur - starts once scrolled this fraction of the hero's height, fully blurred by END
		START: 0.25,
		END: 0.75,
		MAX_BLUR: 10, // px
		MIN_OPACITY: 0.2,
		LIFT: 40, // px the content drifts up
	};

	const mobile = window.matchMedia("(max-width: 47.9375rem)");
	let ticking = false;

	const update = () => {
		ticking = false;
		const y = window.scrollY;
		const height = hero.offsetHeight;

		// stop working once the hero is fully off screen
		if (y > height) return;

		// parallax - the layers are pushed down so they appear to move up more slowly than the page
		hero.style.setProperty("--parallax-bg", `${(y * (1 - CONFIG.BACKGROUND_SPEED)).toFixed(1)}px`);
		hero.style.setProperty("--parallax-globe", `${(y * (1 - CONFIG.GLOBE_SPEED)).toFixed(1)}px`);

		// delayed blur
		const progress = Math.min(1, Math.max(0, (y / height - CONFIG.START) / (CONFIG.END - CONFIG.START)));
		if (progress === 0) {
			content.style.filter = "";
			content.style.opacity = "";
			content.style.transform = "";
			return;
		}
		// skip the blur on phones - blurring the whole hero while scrolling is what makes it stutter there, the fade and drift still run
		content.style.filter = mobile.matches ? "" : `blur(${(progress * CONFIG.MAX_BLUR).toFixed(2)}px)`;
		content.style.opacity = (1 - progress * (1 - CONFIG.MIN_OPACITY)).toFixed(3);
		content.style.transform = `translateY(${(-progress * CONFIG.LIFT).toFixed(1)}px)`;
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
	update();
})();

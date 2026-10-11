// ─────────────────────────────────────────────────────────────────────────────
// HERO ROTATOR
// Cycles the highlighted phrase in the home page headline. The phrases come
// from the data-words attribute on .cs-rotator in index.html.
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	const rotator = document.querySelector("#hero-143 .cs-rotator");
	if (!rotator) return;

	// Configuration
	const CONFIG = {
		INTERVAL: 2500, // ms each phrase stays on screen
		TRANSITION: 450, // ms for the slide out / slide in (match the transition in critical.less)
	};

	// visitors who prefer reduced motion keep the first phrase
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	let words = [];
	try {
		words = JSON.parse(rotator.dataset.words || "[]");
	} catch (error) {
		return;
	}
	if (words.length < 2) return;

	let index = 0;

	const next = () => {
		// slide the current phrase up and out
		rotator.classList.add("cs-out");

		setTimeout(() => {
			index = (index + 1) % words.length;
			rotator.textContent = words[index];

			// jump below without animating, then slide up into place
			rotator.classList.remove("cs-out");
			rotator.classList.add("cs-in");
			void rotator.offsetWidth; // forces the browser to apply the start position before animating
			rotator.classList.remove("cs-in");
		}, CONFIG.TRANSITION);
	};

	let timer = setInterval(next, CONFIG.INTERVAL);

	// pause while the tab is hidden so it doesn't race through phrases when you come back
	document.addEventListener("visibilitychange", () => {
		clearInterval(timer);
		if (!document.hidden) timer = setInterval(next, CONFIG.INTERVAL);
	});
})();

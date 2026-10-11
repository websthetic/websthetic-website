// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE PROGRESS
// Fills the "How We Work" timeline line as the visitor scrolls, and marks
// each step's dot as active once the line reaches it.
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	const timeline = document.querySelector("#how-we-work .cs-timeline");
	if (!timeline) return;

	const dots = [...timeline.querySelectorAll(".cs-dot")];
	if (!dots.length) return;

	// Configuration
	const CONFIG = {
		// the line fills up to this point of the screen (0 = top, 1 = bottom)
		TRIGGER: 0.6,
	};

	let trackTop = 0;
	let trackHeight = 0;
	let dotCenters = [];
	let ticking = false;

	// the track runs from the center of the first dot to the center of the last one.
	// Uses layout positions (offsetTop) rather than on-screen positions, so the fade-up
	// animation shifting the steps while they reveal doesn't throw the line off.
	const measure = () => {
		dotCenters = dots.map((dot) => {
			let top = dot.offsetHeight / 2;
			for (let el = dot; el && el !== timeline; el = el.offsetParent) top += el.offsetTop;
			return top;
		});
		trackTop = dotCenters[0];
		trackHeight = dotCenters[dotCenters.length - 1] - trackTop;
		timeline.style.setProperty("--track-top", `${trackTop}px`);
		timeline.style.setProperty("--track-height", `${trackHeight}px`);
	};

	const update = () => {
		ticking = false;
		const box = timeline.getBoundingClientRect();
		const trigger = window.innerHeight * CONFIG.TRIGGER - box.top;
		const progress = trackHeight ? Math.min(1, Math.max(0, (trigger - trackTop) / trackHeight)) : 0;
		timeline.style.setProperty("--progress", progress.toFixed(4));
		dots.forEach((dot, i) => dot.classList.toggle("cs-active", trigger >= dotCenters[i] - 1));
	};

	const requestUpdate = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(update);
	};

	measure();
	update();
	timeline.classList.add("cs-ready");

	window.addEventListener("scroll", requestUpdate, { passive: true });
	window.addEventListener("resize", () => {
		measure();
		requestUpdate();
	});
	// fonts loading can change the step heights, so measure again once they're in
	document.fonts && document.fonts.ready.then(() => {
		measure();
		update();
	});
})();

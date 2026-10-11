// ─────────────────────────────────────────────────────────────────────────────
// HOVER PREVIEWS
// Hovering a row reveals its illustration, which eases after the cursor:
// - Businesses page: "One Team From Idea To Launch" service rows (.cs-preview)
// - Home page: "Built For Different Kinds Of Teams" rows (.cs-row-art)
// - Agencies page: "Built Around The Way Your Agency Works" rows (.cs-preview)
// Without this script (or with reduced motion) the preview just appears in a
// fixed spot set in the stylesheets.
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	const rows = document.querySelectorAll("#one-team .cs-item, #who-we-work-with .cs-item, #agency-services .cs-item");
	if (!rows.length) return;

	// only for mouse/trackpad users who are fine with motion
	const canFollow = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (!canFollow) return;

	// Configuration
	const CONFIG = {
		OFFSET_X: 32, // px gap between the cursor and the preview's left edge
		EASE: 0.14, // 0 - 1, how quickly the preview catches up to the cursor
	};

	rows.forEach((row) => {
		const preview = row.querySelector(".cs-preview, .cs-row-art");
		if (!preview) return;

		let targetX = 0;
		let targetY = 0;
		let x = 0;
		let y = 0;
		let frame = 0;

		const target = (event) => {
			const box = row.getBoundingClientRect();
			// keep the preview inside the row so it never pushes past the screen edge
			const maxX = box.width - preview.offsetWidth;
			targetX = Math.min(maxX, Math.max(0, event.clientX - box.left + CONFIG.OFFSET_X));
			targetY = event.clientY - box.top;
		};

		const tick = () => {
			x += (targetX - x) * CONFIG.EASE;
			y += (targetY - y) * CONFIG.EASE;
			preview.style.setProperty("--px", `${x.toFixed(1)}px`);
			preview.style.setProperty("--py", `${y.toFixed(1)}px`);
			frame = requestAnimationFrame(tick);
		};

		row.addEventListener("mouseenter", (event) => {
			target(event);
			// start right where the cursor is, then follow
			x = targetX;
			y = targetY;
			row.classList.add("cs-following");
			cancelAnimationFrame(frame);
			tick();
		});
		row.addEventListener("mousemove", target);
		row.addEventListener("mouseleave", () => cancelAnimationFrame(frame));
	});
})();

// ─────────────────────────────────────────────────────────────────────────────
// CAROUSELS
// Arrow buttons and progress line for any carousel track marked with
// data-carousel (the "Our Work" projects, the Businesses page steps, etc).
// Each track is a native horizontal scroller, so swiping and trackpad
// scrolling work on their own. The arrows and progress line are looked up
// inside the track's section.
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	document.querySelectorAll("[data-carousel]").forEach((track) => {
		const section = track.closest("section") || document;
		const prev = section.querySelector(".cs-prev");
		const next = section.querySelector(".cs-next");
		const fill = section.querySelector(".cs-progress-fill");

		// how far one arrow click moves - one card plus the gap between cards
		const step = () => {
			const card = track.firstElementChild;
			if (!card) return track.clientWidth;
			const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
			return card.getBoundingClientRect().width + gap;
		};

		const update = () => {
			const max = track.scrollWidth - track.clientWidth;
			// the line shows how much of the row has been seen so far
			const seen = track.scrollWidth ? (track.scrollLeft + track.clientWidth) / track.scrollWidth : 1;
			if (fill) fill.style.transform = `scaleX(${Math.min(1, seen).toFixed(4)})`;
			if (prev) prev.disabled = track.scrollLeft <= 1;
			if (next) next.disabled = track.scrollLeft >= max - 1;
		};

		prev && prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
		next && next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

		track.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update);
		update();
	});
})();

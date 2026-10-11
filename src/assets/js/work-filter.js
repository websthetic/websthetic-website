// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO FILTER
// The filter pills on the Work page show only the projects in that filter.
// Cards come from _data/projects.js; the "Your Project Could Be Next" card
// (data-category="all") always stays.
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	const section = document.getElementById("portfolio");
	if (!section) return;

	// Configuration
	const CONFIG = {
		ACTIVE_CLASS: "cs-active",
		HIDING_CLASS: "cs-hiding",
		FADE_MS: 200, // match the transition on .cs-project-card in work.less
	};

	const buttons = section.querySelectorAll(".cs-filter");
	const cards = section.querySelectorAll(".cs-project-card");
	const status = section.querySelector("#portfolio-status");
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	const show = (filter, label) => {
		buttons.forEach((button) => {
			const on = button.dataset.filter === filter;
			button.classList.toggle(CONFIG.ACTIVE_CLASS, on);
			button.setAttribute("aria-pressed", on);
		});

		const matches = (card) => filter === "all" || card.dataset.category === filter || card.dataset.category === "all";

		// fade the grid out, swap the cards, fade back in
		section.classList.add(CONFIG.HIDING_CLASS);
		setTimeout(() => {
			cards.forEach((card) => (card.hidden = !matches(card)));
			section.classList.remove(CONFIG.HIDING_CLASS);
		}, reduceMotion ? 0 : CONFIG.FADE_MS);

		const count = [...cards].filter((card) => matches(card) && card.dataset.category !== "all").length;
		status.textContent = `Showing ${count} ${count === 1 ? "project" : "projects"}: ${label}`;
	};

	buttons.forEach((button) => button.addEventListener("click", () => show(button.dataset.filter, button.textContent.trim())));
})();

// ─────────────────────────────────────────────────────────────────────────────
// FADE UP ON SCROLL
// Section headings, cards, and steps fade up as they scroll into view, on
// every page (loaded in base.html).
// Items that come into view together are staggered slightly.
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	// visitors who prefer reduced motion just see everything
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	// Configuration
	const CONFIG = {
		// what fades up - add selectors here to animate more elements
		SELECTORS: [
			// inner page banners (the breadcrumb, text and illustration fade up on load)
			"#banner-310 .cs-breadcrumb",
			"#banner-310 .cs-banner-text",
			"#banner-310 .cs-banner-art",

			// home
			"#work .cs-content",
			"#work .cs-project",
			"#work .cs-more-button",
			"#what-we-do .cs-content",
			"#what-we-do .cs-item",
			"#who-we-work-with .cs-content",
			"#who-we-work-with .cs-item",
			"#how-we-work .cs-content",
			"#how-we-work .cs-step",
			"#why-websthetic .cs-content",
			"#why-websthetic .cs-item",

			// businesses
			"#everything-handled .cs-content",
			"#everything-handled .cs-item",
			"#one-team .cs-content",
			"#one-team .cs-list > li",
			"#accessibility .cs-content",
			"#accessibility .cs-a11y",
			"#accessibility .cs-list-group",
			"#steps .cs-content",
			"#steps .cs-card-group",
			"#steps .cs-carousel-controls",
			"#redesign .cs-panel",

			// agencies
			"#capacity .cs-content",
			"#capacity .cs-item",
			"#agency-services .cs-content",
			"#agency-services .cs-list > li",
			"#agency-process .cs-content",
			"#agency-process .cs-step",
			"#capabilities .cs-content",
			"#capabilities .cs-tile",

			// agencies + businesses
			"#faq .cs-content",
			"#faq .cs-faq-item",

			// about
			"#why-us .cs-content",
			"#why-us .cs-item",
			"#meet-crew .cs-content",

			// work
			"#portfolio .cs-filters",
			"#portfolio .cs-project-card",

			// resources + blog + reviews
			"#resources .cs-content",
			"#resources .cs-card",
			"#blog-listing .cs-article",
			"#reviews-67 .cs-content",
			"#reviews-67 .cs-item",
			"#reviews-67 .cs-container > .cs-button-solid",

			// contact
			"#cs-contact-265 .cs-content",
			"#cs-form-265",
			"#cs-contact-265 .cs-right-section",

			// colour palette generator
			"#palette-tool .cs-toolbar",
			"#palette-tool .cs-palette",
			"#palette-tool .cs-info",

			// website launch checklist
			"#launch-checklist .cs-progress-card",
			"#launch-checklist .cs-group",

			// colour contrast checker
			"#contrast-tool .cs-controls",
			"#contrast-tool .cs-tool",
			"#contrast-tool .cs-info",

			// thank you
			"#next-steps .cs-content",
			"#next-steps .cs-step",

			// shared call to action
			"#cta-51 .cs-container",
		],
		TRIGGER: 0.9, // reveal once the top of an element passes this point of the screen (0 = top, 1 = bottom)
		STAGGER: 100, // ms between items that appear together
		MAX_STAGGER: 500, // ms - caps the delay so a big group (e.g. after jumping down the page) doesn't crawl in
		DURATION: 700, // ms - match the transition in root.less
	};

	let pending = [...document.querySelectorAll(CONFIG.SELECTORS.join(","))];
	if (!pending.length) return;

	pending.forEach((el) => el.classList.add("cs-reveal"));

	const reveal = (el, delay) => {
		el.style.transitionDelay = `${delay}ms`;
		el.classList.add("cs-revealed");

		// once finished, hand the element back to its normal styles (so hover effects work as usual)
		setTimeout(() => {
			el.classList.remove("cs-reveal", "cs-revealed");
			el.style.transitionDelay = "";
		}, delay + CONFIG.DURATION + 50);
	};

	let ticking = false;

	const check = () => {
		ticking = false;
		const line = window.innerHeight * CONFIG.TRIGGER;
		let batch = 0;

		pending = pending.filter((el) => {
			// anything at or above the trigger line is revealed, including things already scrolled past
			if (el.getBoundingClientRect().top > line) return true;
			reveal(el, Math.min(batch++ * CONFIG.STAGGER, CONFIG.MAX_STAGGER));
			return false;
		});

		if (!pending.length) {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		}
	};

	const onScroll = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(check);
	};

	window.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener("resize", onScroll);
	check();
})();

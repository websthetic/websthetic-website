// ─────────────────────────────────────────────────────────────────────────────
// HERO PROJECT FORM
// Clicking an idea chip under the home page hero form fills the input with
// that idea so the visitor can edit it or send it straight away.
// "Let's Talk" opens the contact popup (sections/contact-modal.html) with the
// idea already in the message field. Without JavaScript (or <dialog> support)
// the form still goes to the Contact page as ?project=... (contact-prefill.js).
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	const form = document.querySelector("#hero-143 .cs-project-form");
	const input = document.querySelector("#hero-143 .cs-project-input");
	const ideas = document.querySelectorAll("#hero-143 .cs-idea");
	if (!form || !input) return;

	// Configuration
	const CONFIG = {
		OPEN_CLASS: "cs-modal-open", // on <html> while the popup is open - stops the page scrolling (contact-modal.less)
	};

	ideas.forEach((idea) => {
		idea.addEventListener("click", () => {
			input.value = idea.dataset.value || idea.textContent.trim();
			input.focus();
			// put the cursor at the end so they can keep typing
			input.setSelectionRange(input.value.length, input.value.length);
		});
	});

	// Contact popup
	const modal = document.getElementById("contact-modal");
	if (!modal || typeof modal.showModal !== "function") return;

	const message = modal.querySelector("#message-265");
	const firstField = modal.querySelector("#first-name-265");
	let lastIdea = "";

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const idea = input.value.trim();
		// fill the message, unless they've already written something of their own in the popup
		if (message && (!message.value.trim() || message.value === lastIdea)) message.value = idea;
		lastIdea = idea;

		modal.showModal();
		document.documentElement.classList.add(CONFIG.OPEN_CLASS);
		modal.scrollTop = 0;
		firstField && firstField.focus();
	});

	modal.querySelectorAll("[data-modal-close]").forEach((button) => button.addEventListener("click", () => modal.close()));

	// clicking the dark backdrop closes it (the popup itself fills the dialog, so only backdrop clicks land on it)
	modal.addEventListener("click", (event) => {
		if (event.target === modal) modal.close();
	});

	// the close event arrives a moment later, so check it hasn't been reopened since
	modal.addEventListener("close", () => {
		if (!modal.open) document.documentElement.classList.remove(CONFIG.OPEN_CLASS);
	});
})();

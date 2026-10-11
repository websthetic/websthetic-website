// ─────────────────────────────────────────────────────────────────────────────
// CONTACT PREFILL
// If the visitor came from the home page project form (?project=...), drop
// their idea into the message field so they don't have to type it again.
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	const message = document.getElementById("message-265");
	const project = new URLSearchParams(window.location.search).get("project");
	if (!message || !project || message.value) return;

	message.value = project.trim();
})();

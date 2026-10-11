// ─────────────────────────────────────────────────────────────────────────────
// WEBSITE LAUNCH CHECKLIST
// Resources > Website Launch Checklist. Keeps the overall and per-category
// progress up to date as checks are ticked, remembers the ticks in this
// browser, and opens / closes the categories. The checks themselves come
// from _data/launchChecklist.js.
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	const section = document.getElementById("launch-checklist");
	if (!section) return;

	// Configuration
	const CONFIG = {
		STORAGE_KEY: "websthetic-launch-checklist",
		// the message under the progress ring, by percentage complete
		MESSAGES: [
			[100, "Everything’s checked. You’re ready to launch! 🚀"],
			[75, "Almost there. Just a few checks to go."],
			[40, "Great progress. Keep going!"],
			[1, "Good start. Work through each category below."],
			[0, "Let’s get your site ready to launch."],
		],
	};

	const el = (id) => document.getElementById(id);
	const boxes = [...section.querySelectorAll(".cs-checkbox")];
	const groups = [...section.querySelectorAll(".cs-group")];
	const toggleAll = el("checklist-toggle-all");
	const status = el("checklist-status");
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// Saving - wrapped in try/catch since storage can be blocked (private mode etc.)
	const load = () => {
		try {
			return new Set(JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || []);
		} catch {
			return new Set();
		}
	};

	const save = () => {
		try {
			localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(boxes.filter((b) => b.checked).map((b) => b.value)));
		} catch {
			// the ticks still work, they just aren't remembered
		}
	};

	const percent = (done, total) => (total ? Math.round((done / total) * 100) : 0);

	// Progress
	const update = () => {
		const done = boxes.filter((b) => b.checked).length;
		const overall = percent(done, boxes.length);

		section.querySelector(".cs-progress-ring").style.setProperty("--p", overall);
		el("checklist-percent").textContent = `${overall}%`;
		el("checklist-done").textContent = done;
		el("checklist-message").textContent = CONFIG.MESSAGES.find(([min]) => overall >= min)[1];
		section.classList.toggle("cs-complete", overall === 100);

		groups.forEach((group) => {
			const id = group.dataset.group;
			const groupBoxes = boxes.filter((b) => b.dataset.group === id);
			const groupDone = groupBoxes.filter((b) => b.checked).length;
			const p = percent(groupDone, groupBoxes.length);
			section.querySelector(`[data-group-count="${id}"]`).textContent = groupDone;
			section.querySelector(`[data-group-percent="${id}"]`).textContent = `${p}%`;
			section.querySelector(`[data-group-ring="${id}"]`).style.setProperty("--p", p);
			section.querySelector(`[data-group-bar="${id}"]`).style.setProperty("--p", p);
			section.querySelector(`[data-group-fraction="${id}"]`).textContent = `${groupDone}/${groupBoxes.length}`;
			group.classList.toggle("cs-group-done", groupDone === groupBoxes.length);
		});

		return done;
	};

	// Opening and closing categories
	const setOpen = (group, open) => {
		group.querySelector(".cs-group-toggle").setAttribute("aria-expanded", open);
		group.querySelector(".cs-group-panel").hidden = !open;
		group.classList.toggle("cs-open", open);
	};

	const updateToggleAll = () => {
		const allOpen = groups.every((g) => g.classList.contains("cs-open"));
		toggleAll.textContent = allOpen ? "Collapse All" : "Expand All";
	};

	groups.forEach((group) => {
		group.querySelector(".cs-group-toggle").addEventListener("click", () => {
			setOpen(group, !group.classList.contains("cs-open"));
			updateToggleAll();
		});
	});

	toggleAll.addEventListener("click", () => {
		const open = !groups.every((g) => g.classList.contains("cs-open"));
		groups.forEach((group) => setOpen(group, open));
		updateToggleAll();
	});

	// the category links in the progress card open that category and scroll to it
	section.querySelectorAll("[data-group-link]").forEach((link) => {
		link.addEventListener("click", (event) => {
			event.preventDefault();
			const group = el(`group-${link.dataset.groupLink}`);
			setOpen(group, true);
			updateToggleAll();
			group.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
			group.querySelector(".cs-group-toggle").focus({ preventScroll: true });
		});
	});

	// Ticking
	boxes.forEach((box) => {
		box.addEventListener("change", () => {
			save();
			const done = update();
			const title = box.closest(".cs-check").querySelector(".cs-check-title").textContent;
			status.textContent = `${title} ${box.checked ? "checked" : "unchecked"}. ${done} of ${boxes.length} done.`;
		});
	});

	el("checklist-reset").addEventListener("click", () => {
		if (!boxes.some((b) => b.checked)) return;
		if (!window.confirm("Clear all of your ticks and start the checklist again?")) return;
		boxes.forEach((box) => (box.checked = false));
		save();
		update();
		status.textContent = "Progress reset. 0 checks done.";
	});

	// Start: restore saved ticks, then open the first category that still has work to do
	const saved = load();
	boxes.forEach((box) => (box.checked = saved.has(box.value)));
	update();
	const firstOpen = groups.find((g) => !g.classList.contains("cs-group-done")) || groups[0];
	groups.forEach((group) => setOpen(group, group === firstOpen));
	updateToggleAll();
})();

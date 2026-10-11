// ─────────────────────────────────────────────────────────────────────────────
// HERO GLOBE
// Draws the slowly rotating dotted globe behind the home page hero, with
// glowing city nodes and a few thin arcs that carry "data" between them.
// The canvas is sized and positioned in critical.less (.cs-globe).
// ─────────────────────────────────────────────────────────────────────────────

(() => {
	const canvas = document.querySelector("#hero-143 .cs-globe");
	if (!canvas || !canvas.getContext) return;
	const ctx = canvas.getContext("2d");

	// Configuration
	const CONFIG = {
		RADIUS: 0.35, // globe radius as a fraction of the canvas width (keep in sync with .cs-globe in critical.less)
		TILT: (18 * Math.PI) / 180, // tips the north pole toward the viewer
		START_LON: 75, // longitude facing the viewer on load (75 = the Americas)
		SECONDS_PER_TURN: 120, // full rotation time
		MAX_ARCS: 3, // connections visible at once
		ARC_SPAWN_MIN: 1400, // ms between new connections
		ARC_SPAWN_MAX: 2600,
		ARC_DURATION: 4200, // ms for one connection from fade in to fade out
		// "r, g, b" strings, read from the site colour tokens in root.less - see readColors()
		COLORS: {},
	};

	// each part of the globe and the colour token it's drawn in
	const COLOR_TOKENS = {
		dot: "--on-dark",
		arc: "--accent-1",
		pulse: "--accent-4",
		node: "--accent-2",
	};

	// turns a token's hex value into the "r, g, b" the canvas strings below use
	const readColors = () => {
		const styles = getComputedStyle(document.documentElement);
		Object.entries(COLOR_TOKENS).forEach(([part, token]) => {
			let hex = styles.getPropertyValue(token).trim().replace("#", "");
			if (hex.length === 3) hex = hex.replace(/./g, "$&$&");
			CONFIG.COLORS[part] = /^[0-9a-f]{6}$/i.test(hex) ? [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ") : "255, 255, 255";
		});
	};
	readColors();

	// Land dots - an even grid of points around the sphere (fibonacci lattice), with one bit per point saying whether it's land. Generated from a global land mask, Antarctica left out.
	const LAND_POINTS = 20000;
	const LAND_MASK = "AAAAAAAAAAAgACQEhISQmBASAkhCCAgoCSklICUEwIQQkJADAmBCrAyACSEwABYG4IAQGAEaI3AAjMyEgRkyA2dGwkiMGaEzs2Ymz4ye0d472mZ/7WgvPe27v/W3pf7+3d5663Nv/29v/e29/XW3tt7/3t7723P7f25Pvf2pvXW3pv7/1J76e1N7e25P/f2pvX+3pvb29Ny+W1N7f05Ozf2ptX83p+b+lJqa01Nyd85Mzf0pPTlnpuTOnJqYs9NyZs5Nyd1pPTFnpuXsnJ+Qs/NyYs5Nydk5PyFn5uXunJuRM/N2Q87Py5k5OyFn5+TMnJ+Xs/N2Ss7Oy9k5Oydn5+ysnJ+Xs/N2Ts7O21k5Oydn5+y8nJ2Xs3J2Xs7OyVk5Oydn5+SsnJ2zs3J2Xs7KyVk5O2dn5eSsnJ23s3JyXs7KyXk5O29n5eSsnJ2Ts2J23s7KyVk5Oydn5eSsnJWTs3J2TszK2Vk5Oydn5eSsmJWT82J2TszKyVkxMyfnxeSsmJWTs2JiTs7JyVkxKy/nxMSsmJGTs2JiVs6IyVkxIy9nxMSsmBGTs3JyVs6IiVk5Iyfn5OSsnJGTs3JCVszIiVk5KSdnZMSsmJERs3JCVszJiVk5IydmZISsmJERs3JCTs7JSFk5IyNm5ISsmJETs3JSTszJCVkxKyNmxIScmBUTcmJWRsyLCRkxKyPmxKScmBcRsmJWRsyKCRkxKyPkxaSMmBUTsmJWRsiLCRkxKybkxaSMkBUTsmJWRsiKSRk5KyblxaSMkBWTsnJWTsiKSRkpKybl5aSMkJWTMnJWTsrKSRkhKydlpaSMlJSTMlJWTsrKSRkpKSdl5aycFJWTMlJSTkpKSRkpKCclpaSclJSTMlJSTkrKWRkpKSclpaSclJSTMlJQTkpKWTEpKSVlpaCclJSiMlJSTkpKQTkpKSdlpaSclJSSIlJSSkpKQTkoKQVlpKQclJSSMlBSispKQTkoKSXFpKQUlJSSMlBSSopKSSkoKSXloKQclJSSMlBSyopCSQkoKSVloKSUBZWSElBSSsJCSQkoKSVloKSUBJWyElBSQsJAWQkICyVloKSEhIWyElRSQsJASQkICiUloKSEhIGyEhBUSkJQSSkICiUloKyEhKGyEhSUSkJAWQkJB2UlIKiUhICyEhAWSkJAWQkIAWUlICiUhICwEhAaSkpAUSkIAWUlICSUhICQEhAKykJAQCgKAWUlICSUhYCAUhACykpASCgKASElIDQUhYCQUBQCSkpAaCgKAQGlIBQEhICQUBQCQkpASCgIASGhIAQUlICQUBQCAkpBSAoIASGhKAQFlICQEBICQkJBCAoIAaGhKAQFlIAQEBICQlJRCCopAaEpIASFhIAQFBICQlNRCAopASEoJASFpKAQVBKCQlBACApJQSEopASFpoAQVBICQlFACApJASGopASFooAQFJICQlFACApJASEoJAWEoIAQFJICQlBJCQpBASEoJAWEoIAUVIICQFBICghBAaioJAWAoAIUFIICQFAICghBBagoBAWAoAAUBIICUFEJCgBBBagoBAWAoBIUAIICUFEIKgBBAagIBAWgoBIUAIIKUFEICgBBBagIBAWgohBUAIIKUBEICkBBBagIBAWgohAUAIoKUBEICkBBAagIBBWgolAUAIoCUBEICkBFAagABBWgIhAUgIICUREKKkBFASgAFQWiIhQUiIICURAKKkDFASgQFQWgIhRUiIoCUCAqCkRFCKgQBQWiIBRUiIoQUCAqCkBBKKgQBSWgYFQUgIIQUCAKSkDBKKgABSGgQBSUgIIRUCEKSkDBKCgABSGgQBSUgIJRUAAKRkCBKCgBBSOgAhSUgIpRcAAqQkCFKCgBFSPgABSEgApRUAIKRkCBKCgBFaGgABSEgAJRUQIKQkQBqAgBBaKgABSMgAJQUAIKQkUBKBgBBaCgBBSEgAJQUAIKQEEBKAgBBaCgBBSEggJQEAIKREEBKAgBBaCgBBSAggJQEAIKQEGBKAgBBaAgRBSIggJREAIKQEGBKAAFBaAgBBSIgkJREAIKQEGBKAAFBaAgBBSAgkJRAAoKQEGJKBAFhaIgRBSAggJRICoKQEGIKBAFhaIARBSAglJRIAoKxAGIKAAFhaJARBSIAlJRIAoKRAGIKAAFhaJARBSIAhBRIAoKRYGYKBAFhKJARBSIAhBRIAoKRYGIKBAFoKJARBSIAhFRIAoIxYGIKBAFIKJARBSKAhFRIAoARYGIKBAFIqJAVBCKAhFRICoERYGIKBAHIqJAVACKAhFRICpERIGoKBQFIqJAVAiKAhFRICoERIGoABQFIqJAVAiIAhFRIAoERIGoEBQFIqJAVAiIAhExIAoERIGoEBAFAqJAFAiIAhEhIAoERIGoEBAFIuJAFAiIAlEhIAoERIGoEBAFImJAFAiIAlEhIApERIEoEBAFIkJAFAiIAlEhIApExIAoEBAFIkJAFAiIAFEgIApExIAoEBAFIkJAFAiIAFEgIApEhIAoEBABokBAFAiIAVEgIApEhAAoEBABokBAFAgIAVAgIAJEgAAoEBABoEAAFAgIAVAgIAJAgAAoEBABIEAAFIgIARAgAAJAgAAIABADIEAABAAAARAgAAJAgAAIEAACIEAIBAAAARAAAAJAgAAIAAACIEAABIAAARAAAAJAgBAIAAACIAAABIAAIRAAAABAAAAIAAAAIAAABAAAIBAAAABAAAAIAAAAIAAABAAAABAAAABAAAAIAAAAIAAAAAAAIBAAAAQAAAAIAAAAIAAACAAAIBAAAABAAAAAAAAAIAAAAAAAIBAEAABAABAAAAAAIAAAAAAAIBAAAABAABAAAAAAIAAAAAAAIAAAAABAAAAAAAAAIAAAAIAAAAAAAABAAAAAAAAAIAAAAIAAAAAAAABAAAAAAAAAAAAAAIAAAAAAAABAAAAAAAAAAAAAAIAAAAAAAABAAAAAAAAAAAAAAIAAAAAAAABAAAAAAAEAAAAAAIAAAAAAAgAAAAAAAAEAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

	// City nodes [name, latitude, longitude]
	const CITIES = [
		["Denver", 39.7, -105.0],
		["San Francisco", 37.8, -122.4],
		["New York", 40.7, -74.0],
		["Toronto", 43.7, -79.4],
		["Mexico City", 19.4, -99.1],
		["São Paulo", -23.5, -46.6],
		["London", 51.5, -0.1],
		["Berlin", 52.5, 13.4],
		["Lagos", 6.5, 3.4],
		["Nairobi", -1.3, 36.8],
		["Dubai", 25.2, 55.3],
		["Mumbai", 19.1, 72.9],
		["Singapore", 1.35, 103.8],
		["Tokyo", 35.7, 139.7],
		["Seoul", 37.6, 127.0],
		["Sydney", -33.9, 151.2],
	];

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// Utilities
	const toVector = (lat, lon) => {
		const la = (lat * Math.PI) / 180;
		const lo = (lon * Math.PI) / 180;
		return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
	};

	const decodeLand = () => {
		const bytes = atob(LAND_MASK);
		const golden = Math.PI * (3 - Math.sqrt(5));
		const points = [];
		for (let i = 0; i < LAND_POINTS; i++) {
			if (!(bytes.charCodeAt(i >> 3) & (1 << (i & 7)))) continue;
			const y = 1 - (i / (LAND_POINTS - 1)) * 2;
			const r = Math.sqrt(Math.max(0, 1 - y * y));
			const t = golden * i;
			points.push([Math.cos(t) * r, y, Math.sin(t) * r]);
		}
		return points;
	};

	const land = decodeLand();
	const cities = CITIES.map(([name, lat, lon]) => ({ name, v: toVector(lat, lon), flash: 0 }));

	// Spherical interpolation between two unit vectors
	const slerp = (a, b, t, angle) => {
		const s = Math.sin(angle);
		const k1 = Math.sin((1 - t) * angle) / s;
		const k2 = Math.sin(t * angle) / s;
		return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
	};

	const angleBetween = (a, b) => Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));

	// Sizing
	let size = 0;
	let dpr = 1;
	let center = 0;
	let radius = 0;
	let scale = 1;

	const resize = () => {
		const rect = canvas.getBoundingClientRect();
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		size = rect.width;
		canvas.width = Math.round(size * dpr);
		canvas.height = Math.round(size * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		center = size / 2;
		radius = size * CONFIG.RADIUS;
		scale = size / 1000;
	};

	// Rotation - spin around the vertical axis, then tilt toward the viewer
	let rotation = 0;
	let cosR = 1;
	let sinR = 0;
	const cosT = Math.cos(CONFIG.TILT);
	const sinT = Math.sin(CONFIG.TILT);

	const setRotation = (r) => {
		rotation = r;
		cosR = Math.cos(r);
		sinR = Math.sin(r);
	};

	const rotate = (v) => {
		const x = v[0] * cosR - v[2] * sinR;
		const z1 = v[0] * sinR + v[2] * cosR;
		const y = v[1] * cosT - z1 * sinT;
		const z = v[1] * sinT + z1 * cosT;
		return [x, y, z];
	};

	const toScreen = (p) => [center + p[0] * radius, center - p[1] * radius];

	// Arcs
	const arcs = [];
	let nextSpawn = 0;

	const spawnArc = (now) => {
		// only connect cities that are comfortably on the visible side
		const visible = cities.filter((c) => rotate(c.v)[2] > 0.3);
		for (let attempt = 0; attempt < 12; attempt++) {
			const a = visible[Math.floor(Math.random() * visible.length)];
			const b = visible[Math.floor(Math.random() * visible.length)];
			if (!a || !b || a === b) continue;
			const angle = angleBetween(a.v, b.v);
			if (angle < 0.35 || angle > 1.6) continue;
			if (arcs.some((arc) => (arc.a === a && arc.b === b) || (arc.a === b && arc.b === a))) continue;
			arcs.push({ a, b, angle, start: now, height: 0.04 + angle * 0.1 });
			return;
		}
	};

	// point along an arc, lifted off the surface so it curves above the globe
	const arcPoint = (arc, t) => {
		const p = slerp(arc.a.v, arc.b.v, t, arc.angle);
		const lift = 1 + Math.sin(Math.PI * t) * arc.height;
		return rotate([p[0] * lift, p[1] * lift, p[2] * lift]);
	};

	// a point is visible if it's on the front of the globe, or lifted far enough to clear the edge
	const isVisible = (p) => p[2] > 0 || p[0] * p[0] + p[1] * p[1] > 1;

	const drawArc = (arc, now) => {
		const age = (now - arc.start) / CONFIG.ARC_DURATION;
		if (age >= 1) return false;

		// fade in over the first 15%, out over the last 20%
		const fade = Math.min(1, age / 0.15, (1 - age) / 0.2);
		const steps = 48;
		const pts = [];
		for (let i = 0; i <= steps; i++) pts.push(arcPoint(arc, i / steps));

		// thin base line
		ctx.lineWidth = 1 * scale + 0.4;
		ctx.strokeStyle = `rgba(${CONFIG.COLORS.arc}, ${0.35 * fade})`;
		ctx.beginPath();
		let drawing = false;
		pts.forEach((p) => {
			if (!isVisible(p)) {
				drawing = false;
				return;
			}
			const [sx, sy] = toScreen(p);
			drawing ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
			drawing = true;
		});
		ctx.stroke();

		// travelling pulse with a short fading tail, moves between 10% and 85% of the arc's life
		const travel = Math.min(1, Math.max(0, (age - 0.1) / 0.75));
		if (travel > 0 && travel < 1) {
			const tail = 0.18;
			const segs = 14;
			for (let i = 0; i < segs; i++) {
				const t0 = Math.max(0, travel - tail + (tail * i) / segs);
				const t1 = Math.max(0, travel - tail + (tail * (i + 1)) / segs);
				const p0 = arcPoint(arc, t0);
				const p1 = arcPoint(arc, t1);
				if (!isVisible(p0) || !isVisible(p1)) continue;
				const [x0, y0] = toScreen(p0);
				const [x1, y1] = toScreen(p1);
				ctx.strokeStyle = `rgba(${CONFIG.COLORS.pulse}, ${((i + 1) / segs) * 0.9 * fade})`;
				ctx.lineWidth = 1.6 * scale + 0.6;
				ctx.beginPath();
				ctx.moveTo(x0, y0);
				ctx.lineTo(x1, y1);
				ctx.stroke();
			}
			const head = arcPoint(arc, travel);
			if (isVisible(head)) {
				const [hx, hy] = toScreen(head);
				glow(hx, hy, 9 * scale + 3, CONFIG.COLORS.pulse, 0.55 * fade);
			}
		}

		// let the destination glow briefly when the pulse arrives
		if (travel >= 1 && !arc.arrived) {
			arc.arrived = true;
			arc.b.flash = 1;
		}
		return true;
	};

	const glow = (x, y, r, color, alpha) => {
		const g = ctx.createRadialGradient(x, y, 0, x, y, r);
		g.addColorStop(0, `rgba(${color}, ${alpha})`);
		g.addColorStop(1, `rgba(${color}, 0)`);
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	};

	// Drawing
	const BUCKETS = 6;

	const drawGlobe = () => {
		// soft blue glow and faint outline
		glow(center, center, radius * 1.25, "228, 211, 255", 0.1);
		ctx.strokeStyle = `rgba(${CONFIG.COLORS.dot}, 0.16)`;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(center, center, radius, 0, Math.PI * 2);
		ctx.stroke();

		// land dots, grouped by brightness so each group is one draw call
		const paths = Array.from({ length: BUCKETS }, () => new Path2D());
		const dotBase = 1.1 * scale + 0.3;
		for (let i = 0; i < land.length; i++) {
			const p = rotate(land[i]);
			if (p[2] <= 0.02) continue;
			const bucket = Math.min(BUCKETS - 1, Math.floor(p[2] * BUCKETS));
			const [sx, sy] = toScreen(p);
			const r = dotBase * (0.55 + 0.6 * p[2]);
			paths[bucket].moveTo(sx + r, sy);
			paths[bucket].arc(sx, sy, r, 0, Math.PI * 2);
		}
		paths.forEach((path, i) => {
			ctx.fillStyle = `rgba(${CONFIG.COLORS.dot}, ${0.1 + 0.42 * ((i + 0.5) / BUCKETS)})`;
			ctx.fill(path);
		});
	};

	const drawCities = (now) => {
		cities.forEach((c, i) => {
			const p = rotate(c.v);
			if (p[2] <= 0.05) return;
			const [sx, sy] = toScreen(p);
			// gentle breathing so nodes feel alive without flashing
			const breathe = 0.75 + 0.25 * Math.sin(now / 1400 + i * 1.7);
			const depth = Math.min(1, p[2] * 1.4);
			glow(sx, sy, (7 + c.flash * 8) * scale + 3, CONFIG.COLORS.node, (0.35 + c.flash * 0.4) * breathe * depth);
			ctx.fillStyle = `rgba(${CONFIG.COLORS.pulse}, ${0.9 * depth})`;
			ctx.beginPath();
			ctx.arc(sx, sy, 1.6 * scale + 0.6, 0, Math.PI * 2);
			ctx.fill();
			c.flash = Math.max(0, c.flash - 0.02);
		});
	};

	const render = (now) => {
		ctx.clearRect(0, 0, size, size);
		drawGlobe();
		for (let i = arcs.length - 1; i >= 0; i--) {
			if (!drawArc(arcs[i], now)) arcs.splice(i, 1);
		}
		drawCities(now);
	};

	// Animation loop - only runs while the hero is on screen
	const startRotation = (-CONFIG.START_LON * Math.PI) / 180;
	let running = false;
	let startTime = 0;
	let frame = 0;

	const tick = (now) => {
		if (!running) return;
		if (!startTime) startTime = now;
		setRotation(startRotation - ((now - startTime) / 1000 / CONFIG.SECONDS_PER_TURN) * Math.PI * 2);

		if (now >= nextSpawn && arcs.length < CONFIG.MAX_ARCS) {
			spawnArc(now);
			nextSpawn = now + CONFIG.ARC_SPAWN_MIN + Math.random() * (CONFIG.ARC_SPAWN_MAX - CONFIG.ARC_SPAWN_MIN);
		}

		render(now);
		frame = requestAnimationFrame(tick);
	};

	const start = () => {
		if (running || reduceMotion) return;
		running = true;
		// keep the rotation where it left off
		startTime = performance.now() + ((rotation - startRotation) / (Math.PI * 2)) * CONFIG.SECONDS_PER_TURN * 1000;
		frame = requestAnimationFrame(tick);
	};

	const stop = () => {
		running = false;
		cancelAnimationFrame(frame);
	};

	// Static frame for reduced motion: no rotation, two quiet arcs
	const renderStill = () => {
		const now = 0;
		arcs.length = 0;
		const pick = (a, b) => {
			const ca = cities.find((c) => c.name === a);
			const cb = cities.find((c) => c.name === b);
			arcs.push({ a: ca, b: cb, angle: angleBetween(ca.v, cb.v), start: now - CONFIG.ARC_DURATION * 0.5, height: 0.04 + angleBetween(ca.v, cb.v) * 0.1, arrived: true });
		};
		pick("Denver", "New York");
		pick("New York", "São Paulo");
		render(now);
	};

	// Setup
	setRotation(startRotation);
	resize();

	// the Wada palette switcher (theme-switcher.js) changed the colours
	document.addEventListener("themechange", () => {
		readColors();
		if (reduceMotion) renderStill();
	});

	if (reduceMotion) {
		renderStill();
		new ResizeObserver(() => {
			resize();
			renderStill();
		}).observe(canvas);
		return;
	}

	new ResizeObserver(resize).observe(canvas);
	new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(canvas);
})();

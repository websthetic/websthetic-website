// ============================================
//              Register Plugins
// ============================================
gsap.registerPlugin(ScrollTrigger);

// ============================================
//                   Hero
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  (function () {
    const heroEl = document.querySelector('.hero');
    const cta    = document.querySelector('.cta');

    if (!heroEl) return;

    const line1Spans = heroEl.querySelectorAll('.line-1 span');
    const line2Spans = heroEl.querySelectorAll('.line-2 .sans-bold, .line-2 .serif-italic');
    const line3Spans = heroEl.querySelectorAll('.line-3 span');
    const tagline    = heroEl.querySelector('.right-col--mobile') || heroEl.querySelector('.right-col');
    const scrollInd  = heroEl.querySelector('.scroll-indicator');

    gsap.set([line1Spans, line2Spans, line3Spans, tagline, scrollInd], { opacity: 0, y: 40 });
    if (cta) gsap.set(cta, { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(line1Spans, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },  0.05)
      .to(line2Spans, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },  0.25)
      .to(line3Spans, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },  0.35)
      .to(tagline,    { opacity: 1, y: 0, duration: 0.8 },                 0.45)
      .to(cta,        { opacity: 1, y: 0, duration: 0.8 },                 0.55)
      .to(scrollInd,  { opacity: 1, y: 0, duration: 0.8 },                 1.0);

    // Scroll fade overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      inset: 0;
      background: #000;
      opacity: 0;
      pointer-events: none;
      z-index: 50;
      transition: opacity 0.1s linear;
    `;
    heroEl.appendChild(overlay);

    window.addEventListener('scroll', () => {
      const progress = Math.min(window.scrollY / (heroEl.offsetHeight * 0.75), 1);
      overlay.style.opacity = progress;
    }, { passive: true });

  })();
});

// ============================================
//               Text Section
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  Splitting({ target: '#text-section .cs-text-large' });

  const words = document.querySelectorAll('#text-section .cs-text-large .word');
  if (!words.length) return;

  gsap.set(words, { color: '#3a3a3a' });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#text-section',
      start: 'top top',
      end: () => `+=${words.length * 80}`,
      scrub: 1,
      pin: true,
    }
  });

  words.forEach((word, i) => {
    const isHighlight = word.querySelector('.cs-highlight') || word.classList.contains('cs-highlight');
    const targetColor = isHighlight ? '#ff6a3e' : '#e4e3db';
    tl.to(word, { color: targetColor, duration: 0.3, ease: 'none' }, i * 0.3);
  });
});

// ============================================
//                  Process
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth < 768) return;

  const track       = document.querySelector('#our-process .cs-track');
  const stickyOuter = document.querySelector('#our-process .cs-sticky-outer');

  if (!track || !stickyOuter) return;

  const getTotalScroll = () => track.scrollWidth - window.innerWidth;

  const setHeight = () => {
    stickyOuter.style.height = `${getTotalScroll() + window.innerHeight}px`;
  };

  setHeight();
  window.addEventListener('resize', setHeight);

  gsap.to(track, {
    x: () => -getTotalScroll(),
    ease: 'none',
    scrollTrigger: {
      trigger: stickyOuter,
      start: 'top top',
      end: () => `+=${getTotalScroll()}`,
      scrub: 1,
      pin: false,
      anticipatePin: 0,
      invalidateOnRefresh: true,
    }
  });
});

// ============================================
//               Text Rotator
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  const track = document.querySelector('.rotator-track');
  const words = document.querySelectorAll('.rotator-word');
  const total = words.length;
  let current = 0;

  if (!track || !words.length) return;

  const wordHeight = words[0].offsetHeight;

  track.style.transition = 'none';
  track.style.transform  = 'translateY(0px)';

  setInterval(() => {
    current++;

    track.style.transition = 'transform 0.65s cubic-bezier(0.76, 0, 0.24, 1)';
    track.style.transform  = `translateY(${-(current * wordHeight)}px)`;

    // When we land on the duplicate word, snap back to the first
    if (current === total - 1) {
      setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform  = 'translateY(0px)';
        current = 0;
      }, 700);
    }
  }, 2000);
});

// ============================================
//            Services Accordion
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  const csItems = document.querySelectorAll('#our-services .cs-item');
  const isMobile = () => window.innerWidth < 1024;

  csItems.forEach((item) => {
    const accordion = item.querySelector('.cs-accordion');
    if (!accordion) return;

    // Desktop hover
    item.addEventListener('mouseenter', () => {
      if (isMobile()) return;
      accordion.style.maxHeight = accordion.scrollHeight + 'px';
      accordion.style.opacity   = '1';
      accordion.style.marginTop = '1rem';
    });

    item.addEventListener('mouseleave', () => {
      if (isMobile()) return;
      accordion.style.maxHeight = '0';
      accordion.style.opacity   = '0';
      accordion.style.marginTop = '0';
    });

    // Mobile click
    item.addEventListener('click', () => {
      if (!isMobile()) return;
      const isActive = item.classList.contains('cs-active');

      // Close all
      csItems.forEach((el) => {
        el.classList.remove('cs-active');
        const acc = el.querySelector('.cs-accordion');
        if (acc) {
          acc.style.maxHeight = '0';
          acc.style.opacity   = '0';
          acc.style.marginTop = '0';
        }
      });

      // Open clicked if it wasn't already open
      if (!isActive) {
        item.classList.add('cs-active');
        accordion.style.maxHeight = accordion.scrollHeight + 'px';
        accordion.style.opacity   = '1';
        accordion.style.marginTop = '1rem';
      }
    });
  });
});

// ============================================
//         Refresh ScrollTriggers on Load
// ============================================
window.addEventListener('load', () => ScrollTrigger.refresh());

// ============================================
//            Smooth Anchor Scroll
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    // Close mobile menu if open
    const nav = document.getElementById('cs-navigation');
    const body = document.body;
    if (body.classList.contains('cs-open')) {
      body.classList.remove('cs-open');
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ============================================
//                 Hero Globe
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById("heroGlobe");
    if (!canvas) return;

    var ctx    = canvas.getContext("2d");
    var W      = 900;
    var H      = 900;
    var CX     = W / 2;
    var CY     = H / 2;
    var R      = 360;

    canvas.width  = W;
    canvas.height = H;

    var continentRings = null;
    var angle = 0;

    function offWhite(a) { return "rgba(228,223,213," + a + ")"; }
    function orange(a)   { return "rgba(255,73,37,"   + a + ")"; }

    var NODES = [
        { lat: 40.7,  lng: -74    },
        { lat: 51.5,  lng: -0.1   },
        { lat: 35.7,  lng: 139.7  },
        { lat: -33.9, lng: 151.2  },
        { lat: 48.9,  lng: 2.3    },
        { lat: 1.3,   lng: 103.8  },
        { lat: 19.1,  lng: 72.9   },
        { lat: 55.8,  lng: 37.6   },
        { lat: -23.5, lng: -46.6  },
        { lat: 25.2,  lng: 55.3   },
        { lat: 37.6,  lng: -122.4 },
        { lat: -1.3,  lng: 36.8   },
    ];

    function project(lat, lng, rot) {
        var phi   = (90 - lat) * Math.PI / 180;
        var theta = (lng + rot) * Math.PI / 180;
        var x = R * Math.sin(phi) * Math.cos(theta);
        var y = -R * Math.cos(phi);
        var z = R * Math.sin(phi) * Math.sin(theta);
        return { x: CX + x, y: CY + y, z: z };
    }

    function drawGrid() {
        [-60, -30, 0, 30, 60].forEach(function (lat) {
            ctx.beginPath();
            var first = true;
            for (var lng = -180; lng <= 180; lng += 4) {
                var p = project(lat, lng, angle);
                if (p.z < 0) { first = true; continue; }
                first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
                first = false;
            }
            ctx.strokeStyle = offWhite(0.1);
            ctx.lineWidth   = 0.5;
            ctx.stroke();
        });
        [-120, -60, 0, 60, 120, 180].forEach(function (lng) {
            ctx.beginPath();
            var first = true;
            for (var lat = -85; lat <= 85; lat += 4) {
                var p = project(lat, lng, angle);
                if (p.z < 0) { first = true; continue; }
                first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
                first = false;
            }
            ctx.strokeStyle = offWhite(0.1);
            ctx.lineWidth   = 0.5;
            ctx.stroke();
        });
    }

    function drawContinents() {
        if (!continentRings) return;
        continentRings.forEach(function (ring) {
            ctx.beginPath();
            var prevVis = false;
            ring.forEach(function (coord) {
                var p = project(coord[1], coord[0], angle);
                if (p.z < 0) { prevVis = false; return; }
                prevVis ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
                prevVis = true;
            });
            ctx.strokeStyle = offWhite(0.1);
            ctx.lineWidth   = 0.5;
            ctx.stroke();
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        ctx.beginPath();
        ctx.arc(CX, CY, R, 0, Math.PI * 2);
        ctx.fillStyle   = offWhite(0.02);
        ctx.fill();
        ctx.strokeStyle = offWhite(0.15);
        ctx.lineWidth   = 0.5;
        ctx.stroke();

        drawGrid();
        drawContinents();

        var projected = NODES.map(function (n) { return project(n.lat, n.lng, angle); });
        var visible   = projected.filter(function (p) { return p.z > 0; });

        visible.forEach(function (a, i) {
            visible.slice(i + 1).forEach(function (b) {
                var dist = Math.hypot(a.x - b.x, a.y - b.y);
                if (dist < 260) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = orange(Math.max(0, (1 - dist / 260) * 0.3));
                    ctx.lineWidth   = 0.7;
                    ctx.stroke();
                }
            });
        });

        visible.forEach(function (p) {
            var depth = (p.z + R) / (2 * R);
            var r     = 3 + depth * 2;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fillStyle = orange(0.5 + depth * 0.5);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
            ctx.strokeStyle = orange(0.12 + depth * 0.2);
            ctx.lineWidth   = 0.8;
            ctx.stroke();
        });

        angle += 0.1;
        requestAnimationFrame(draw);
    }

    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(function (r) { return r.json(); })
        .then(function (world) {
            var land = topojson.feature(world, world.objects.land);
            continentRings = [];
            land.features.forEach(function (f) {
                var geom  = f.geometry;
                var polys = geom.type === "Polygon"      ? [geom.coordinates]
                          : geom.type === "MultiPolygon" ?  geom.coordinates
                          : [];
                polys.forEach(function (poly) {
                    poly.forEach(function (ring) { continentRings.push(ring); });
                });
            });
            draw();
        })
        .catch(function () { draw(); });
});
(() => {
	// Configuration
	const CONFIG = {
		BREAKPOINTS: {
			MOBILE: 1023.5,
		},
		SELECTORS: {
			body: "body",
			navigation: "#cs-navigation",
			hamburger: "#cs-navigation .cs-toggle",
			menuWrapper: ".cs-ul-wrapper",
			dropdownToggle: ".cs-dropdown-toggle",
			dropdown: ".cs-dropdown",
			dropdownMenu: ".cs-drop-ul",
			navButton: ".cs-nav-button",
			darkModeToggle: "#dark-mode-toggle",
		},
		CLASSES: {
			active: "cs-active",
			menuOpen: "cs-open",
		},
	};

	// DOM Elements
	const elements = {
		body: document.querySelector(CONFIG.SELECTORS.body),
		navigation: document.querySelector(CONFIG.SELECTORS.navigation),
		hamburger: document.querySelector(CONFIG.SELECTORS.hamburger),
		menuWrapper: document.querySelector(CONFIG.SELECTORS.menuWrapper),
		navButton: document.querySelector(CONFIG.SELECTORS.navButton),
		darkModeToggle: document.querySelector(CONFIG.SELECTORS.darkModeToggle),
	};

	// Utilities
	const isMobile = () => window.matchMedia(`(max-width: ${CONFIG.BREAKPOINTS.MOBILE}px)`).matches;

	const toggleAttribute = (element, attribute, value1 = "true", value2 = "false") => {
		if (!element) return;
		const current = element.getAttribute(attribute);
		element.setAttribute(attribute, current === value1 ? value2 : value1);
	};

	const toggleInert = (element) => element && (element.inert = !element.inert);

	// Dropdown Management
	const dropdownManager = {
		close(dropdown, shouldFocus = false) {
			if (!dropdown || !dropdown.classList.contains(CONFIG.CLASSES.active)) return false;

			dropdown.classList.remove(CONFIG.CLASSES.active);
			const button = dropdown.querySelector(CONFIG.SELECTORS.dropdownToggle);
			const menu = dropdown.querySelector(CONFIG.SELECTORS.dropdownMenu);

			if (button) {
				button.setAttribute("aria-expanded", "false");
				shouldFocus && button.focus();
			}

			if (menu) {
				menu.inert = true;
			}

			return true;
		},

		toggle(element) {
			element.classList.toggle(CONFIG.CLASSES.active);
			const button = element.querySelector(CONFIG.SELECTORS.dropdownToggle);
			const menu = element.querySelector(CONFIG.SELECTORS.dropdownMenu);

			button && toggleAttribute(button, "aria-expanded");
			menu && toggleInert(menu);
		},

		closeAll() {
			if (!elements.navigation) return false;
			let closed = false;

			elements.navigation.querySelectorAll(`${CONFIG.SELECTORS.dropdown}.${CONFIG.CLASSES.active}`).forEach((dropdown) => {
				this.close(dropdown, true);
				closed = true;
			});

			return closed;
		},
	};

	// Menu Management
	const menuManager = {
		toggle() {
			if (!elements.hamburger || !elements.navigation) return;

			const isClosing = elements.body.classList.contains(CONFIG.CLASSES.menuOpen);

			elements.hamburger.classList.toggle(CONFIG.CLASSES.active);
			elements.body.classList.toggle(CONFIG.CLASSES.menuOpen);
			toggleAttribute(elements.hamburger, "aria-expanded");

			if (elements.menuWrapper && isMobile()) {
				toggleInert(elements.menuWrapper);
			}

			isClosing && dropdownManager.closeAll();
		},
	};

	// Keyboard Management
	const keyboardManager = {
		handleEscape() {
			if (!elements.navigation) return;

			const dropdownsClosed = dropdownManager.closeAll();
			if (dropdownsClosed) return;

			if (elements.body && elements.body.classList.contains(CONFIG.CLASSES.menuOpen)) {
				menuManager.toggle();
				elements.hamburger.focus();
			}
		},
	};

	// Event Management
	const eventManager = {
		handleDropdownClick(event) {
			if (!isMobile()) return;

			const button = event.target.closest(CONFIG.SELECTORS.dropdownToggle);
			if (!button) return;

			event.preventDefault();
			const dropdown = button.closest(CONFIG.SELECTORS.dropdown);
			if (dropdown) {
				dropdownManager.toggle(dropdown);
			}
		},

		handleDropdownKeydown(event) {
			if (event.key !== "Enter" && event.key !== " ") return;

			const button = event.target.closest(CONFIG.SELECTORS.dropdownToggle);
			if (!button) return;

			event.preventDefault();
			const dropdown = button.closest(CONFIG.SELECTORS.dropdown);
			if (dropdown) {
				dropdownManager.toggle(dropdown);
			}
		},

		handleFocusOut(event) {
			setTimeout(() => {
				if (!event.relatedTarget) return;

				const dropdown = event.target.closest(CONFIG.SELECTORS.dropdown);
				if (dropdown?.classList.contains(CONFIG.CLASSES.active) && !dropdown.contains(event.relatedTarget)) {
					dropdownManager.close(dropdown);
				}
			}, 10);
		},

		handleMobileFocus(event) {
			if (!isMobile() || !elements.body.classList.contains(CONFIG.CLASSES.menuOpen)) return;
			if (elements.menuWrapper.contains(event.target) || elements.hamburger.contains(event.target)) return;

			menuManager.toggle();
		},

		handleDropdownHover(event) {
			if (isMobile()) return;

			const dropdown = event.target.closest(CONFIG.SELECTORS.dropdown);
			if (!dropdown) return;

			const menu = dropdown.querySelector(CONFIG.SELECTORS.dropdownMenu);
			if (!menu) return;

			if (event.type === "mouseenter") {
				menu.inert = false;
			} else if (event.type === "mouseleave") {
				setTimeout(() => {
					if (!dropdown.matches(":hover")) {
						menu.inert = true;
					}
				}, 1);
			}
		},
	};

	// Initialization & Setup
	const init = {
		inertState() {
			if (!elements.menuWrapper) return;

			elements.menuWrapper.inert = isMobile();

			if (elements.navigation) {
				const dropdownMenus = elements.navigation.querySelectorAll(CONFIG.SELECTORS.dropdownMenu);
				dropdownMenus.forEach((dropdown) => {
					dropdown.inert = true;
				});
			}
		},

		eventListeners() {
			if (!elements.hamburger || !elements.navigation) return;

			elements.hamburger.addEventListener("click", menuManager.toggle);
			elements.navigation.addEventListener("click", (e) => {
				if (e.target === elements.navigation && elements.body.classList.contains(CONFIG.CLASSES.menuOpen)) {
					menuManager.toggle();
				}
			});

			elements.navigation.addEventListener("click", eventManager.handleDropdownClick);
			elements.navigation.addEventListener("keydown", eventManager.handleDropdownKeydown);
			elements.navigation.addEventListener("focusout", eventManager.handleFocusOut);

			elements.navigation.addEventListener("mouseenter", eventManager.handleDropdownHover, true);
			elements.navigation.addEventListener("mouseleave", eventManager.handleDropdownHover, true);

			document.addEventListener("keydown", (e) => e.key === "Escape" && keyboardManager.handleEscape());
			document.addEventListener("focusin", eventManager.handleMobileFocus);

			window.addEventListener("resize", () => {
				this.inertState();
				if (!isMobile() && elements.body.classList.contains(CONFIG.CLASSES.menuOpen)) {
					menuManager.toggle();
				}
			});
		},
	};

	init.inertState();
	init.eventListeners();
})();


// ============================================
//           GSAP Nav Animations
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.cs-li-link');
    
    links.forEach(link => {
        const wrapper = link.querySelector('.cs-link-wrapper');
        if (!wrapper) return;
        
        const originalText = link.textContent.trim();
        wrapper.innerHTML = '';
        
        const layer1 = document.createElement('span');
        layer1.className = 'cs-link-text';
        const layer2 = document.createElement('span');
        layer2.className = 'cs-link-text';
        
        originalText.split('').forEach(char => {
            const char1 = document.createElement('span');
            char1.className = 'cs-link-char';
            char1.textContent = char === ' ' ? '\u00A0' : char;
            layer1.appendChild(char1);
            
            const char2 = document.createElement('span');
            char2.className = 'cs-link-char';
            char2.textContent = char === ' ' ? '\u00A0' : char;
            layer2.appendChild(char2);
        });
        
        wrapper.appendChild(layer1);
        wrapper.appendChild(layer2);
        
        const chars1 = layer1.querySelectorAll('.cs-link-char');
        const chars2 = layer2.querySelectorAll('.cs-link-char');
        
        link.addEventListener('mouseenter', () => {
            gsap.to(chars1, {
                y: '-100%',
                duration: 0.3,
                ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
                stagger: 0.03
            });
            gsap.to(chars2, {
                y: '0%',
                duration: 0.3,
                ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
                stagger: 0.03
            });
        });
        
        link.addEventListener('mouseleave', () => {
            gsap.to(chars1, {
                y: '0%',
                duration: 0.3,
                ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
                stagger: 0.03
            });
            gsap.to(chars2, {
                y: '100%',
                duration: 0.3,
                ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
                stagger: 0.03
            });
        });
    });

    // Logo hover animation
    const logo = document.querySelector('.cs-logo');
    if (logo) {
        const logoTexts = logo.querySelectorAll('.cs-logo-text');
        
        logo.addEventListener('mouseenter', () => {
            gsap.to(logoTexts[0], { y: '-100%', duration: 0.5, ease: 'power2.out' });
            gsap.to(logoTexts[1], { y: '0%',    duration: 0.5, ease: 'power2.out' });
        });
        
        logo.addEventListener('mouseleave', () => {
            gsap.to(logoTexts[0], { y: '0%',    duration: 0.5, ease: 'power2.out' });
            gsap.to(logoTexts[1], { y: '100%',  duration: 0.5, ease: 'power2.out' });
        });
    }

    // Button animation
    const buttons = document.querySelectorAll('.cs-button-solid');
    buttons.forEach(button => {
        const buttonTexts = button.querySelectorAll('.cs-button-text');
        if (buttonTexts.length < 2) return;
        
        button.addEventListener('mouseenter', () => {
            gsap.to(buttonTexts[0], { y: '-100%', duration: 0.5, ease: 'power2.out' });
            gsap.to(buttonTexts[1], { y: '0%',    duration: 0.5, ease: 'power2.out' });
        });
        
        button.addEventListener('mouseleave', () => {
            gsap.to(buttonTexts[0], { y: '0%',    duration: 0.5, ease: 'power2.out' });
            gsap.to(buttonTexts[1], { y: '100%',  duration: 0.5, ease: 'power2.out' });
        });
    });
});


// ============================================
//           Scroll Nav Background
// ============================================
let navScrolled = false;

window.addEventListener('scroll', function() {
    const nav = document.querySelector('#cs-navigation');
    const scrollThreshold = 100;
    
    if (window.scrollY > scrollThreshold && !navScrolled) {
        nav.classList.add('nav-scrolled');
        navScrolled = true;
    } else if (window.scrollY <= scrollThreshold && navScrolled) {
        nav.classList.remove('nav-scrolled');
        navScrolled = false;
    }
});


// ============================================
//           Hamburger Ripple Effect
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.cs-toggle');
    
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            this.classList.remove('rippling');
            void this.offsetWidth;
            this.classList.add('rippling');
            setTimeout(() => this.classList.remove('rippling'), 500);
        });
    }
});

window.addEventListener('scroll', () => {
    const nav = document.getElementById('cs-navigation');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});


// ============================================
//         Active Nav Link on Scroll
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const sections = [
        { id: 'home',          link: document.querySelector('.cs-li-link[href="/"]') },
        { id: 'our-process',   link: document.querySelector('.cs-li-link[href="/#our-process"]') },
        { id: 'our-portfolio', link: document.querySelector('.cs-li-link[href="/#our-portfolio"]') },
        { id: 'our-services',  link: document.querySelector('.cs-li-link[href="/#our-services"]') },
    ];

    function setActive(link) {
        document.querySelectorAll('.cs-li-link').forEach(l => l.classList.remove('cs-active'));
        if (link) link.classList.add('cs-active');
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const match = sections.find(s => s.id === entry.target.id);
                if (match) setActive(match.link);
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
    });

    // Contact page
    if (window.location.pathname.includes('/contact')) {
        setActive(document.querySelector('.cs-li-link[href="/contact/"]'));
    }
});
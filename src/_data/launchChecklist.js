// ─────────────────────────────────────────────────────────────────────────────
// WEBSITE LAUNCH CHECKLIST
// The checks on Resources > Website Launch Checklist, grouped by category.
// Each check needs a unique id - it's how a visitor's ticks are remembered
// (launch-checklist.js), so don't rename an id once the page is live.
//
// group: id, title, icon (one of the icons in website-launch-checklist.html)
// check: id, title, text, and an optional link { label, url }
// ─────────────────────────────────────────────────────────────────────────────

module.exports = [
    {
        id: "accessibility",
        title: "Accessibility",
        icon: "eye",
        checks: [
            {
                id: "contrast",
                title: "Colour Contrast Checked",
                text: "Body text has a contrast ratio of at least 4.5:1 against its background, and large text at least 3:1.",
                link: { label: "Use our Contrast Checker", url: "/resources/colour-contrast-checker/" },
            },
            {
                id: "keyboard",
                title: "Works With A Keyboard",
                text: "Every link, button, and field can be reached with the Tab key, shows a clear focus style, and nothing traps the keyboard.",
                link: { label: "WCAG quick reference", url: "https://www.w3.org/WAI/WCAG22/quickref/" },
            },
            {
                id: "alt-text",
                title: "Images Have Alt Text",
                text: "Meaningful images describe what they show. Decorative images use empty alt text so screen readers skip them.",
            },
            {
                id: "headings",
                title: "Headings Are In Order",
                text: "Each page has one H1, and headings follow a logical order without skipping levels.",
            },
            {
                id: "form-labels",
                title: "Forms Are Labelled",
                text: "Every field has a visible label, required fields are marked, and error messages explain how to fix the problem.",
            },
            {
                id: "motion",
                title: "Motion Can Be Reduced",
                text: "Animations respect the reduced motion setting, and nothing flashes more than three times a second.",
            },
        ],
    },
    {
        id: "content",
        title: "Content",
        icon: "file",
        checks: [
            {
                id: "placeholder",
                title: "Placeholder Content Removed",
                text: "No lorem ipsum, sample images, or “coming soon” text is left anywhere on the site.",
            },
            {
                id: "proofread",
                title: "Spelling & Grammar Proofread",
                text: "Every page has been read through carefully, with short paragraphs that are easy to scan.",
            },
            {
                id: "contact-details",
                title: "Contact Details Are Correct",
                text: "Phone numbers, email addresses, locations, hours, and social links are accurate and consistent everywhere.",
            },
            {
                id: "links",
                title: "Links Are Clear & Working",
                text: "Link text says where it goes, and links to other websites open safely with rel=\"noopener\".",
            },
            {
                id: "legal",
                title: "Legal Pages In Place",
                text: "A privacy policy, terms, and cookie consent are in place where your region requires them (e.g. PIPEDA or GDPR).",
            },
            {
                id: "not-found",
                title: "Custom 404 Page",
                text: "A friendly “page not found” screen points visitors back to the main sections of the site.",
            },
        ],
    },
    {
        id: "seo",
        title: "SEO",
        icon: "search",
        checks: [
            {
                id: "meta",
                title: "Titles & Meta Descriptions Written",
                text: "Every page has a unique title (around 60 characters) and meta description (around 155 characters).",
            },
            {
                id: "search-console",
                title: "Search Console & Analytics Connected",
                text: "Google Search Console and your analytics tool are set up, so you can see how people find and use the site.",
                link: { label: "Open Search Console", url: "https://search.google.com/search-console" },
            },
            {
                id: "sitemap",
                title: "XML Sitemap Submitted",
                text: "An up-to-date sitemap lists every public page and has been submitted to the search engines.",
            },
            {
                id: "robots",
                title: "Robots.txt Checked",
                text: "Robots.txt points to the sitemap, and any “noindex” rules from the staging site have been removed.",
            },
            {
                id: "canonical",
                title: "Canonical URLs Set",
                text: "Each page has one main address (https, with or without www) and every other version redirects to it.",
            },
            {
                id: "redirects",
                title: "Old URLs Redirected",
                text: "If this replaces an older site, its old pages permanently (301) redirect to the matching new pages.",
            },
            {
                id: "social-previews",
                title: "Social Sharing Previews Added",
                text: "Open Graph titles, descriptions, and images make links look good when they’re shared.",
            },
            {
                id: "structured-data",
                title: "Structured Data Added",
                text: "Structured data describes your business and pages, so search engines can show richer results.",
                link: { label: "Test with Rich Results", url: "https://search.google.com/test/rich-results" },
            },
        ],
    },
    {
        id: "functionality",
        title: "Functionality",
        icon: "zap",
        checks: [
            {
                id: "browsers",
                title: "Tested In Major Browsers",
                text: "The site looks and works right in Chrome, Safari, Firefox, and Edge, on desktop and mobile.",
            },
            {
                id: "responsive",
                title: "Responsive On Every Screen",
                text: "Layouts hold up on every screen size, from small phones (360px wide) to large desktop monitors.",
            },
            {
                id: "forms",
                title: "Forms Send & Confirm",
                text: "Every form has been submitted for real: messages arrive, spam protection works, and visitors see a confirmation.",
            },
            {
                id: "inputs",
                title: "Mobile-Friendly Inputs",
                text: "Fields use the right input type (email, tel, number), so phones show the right keyboard.",
            },
            {
                id: "favicon",
                title: "Favicon & App Icons Added",
                text: "The site has a favicon and home screen icons, so it’s easy to spot in tabs and bookmarks.",
                link: { label: "Generate favicons", url: "https://realfavicongenerator.net/" },
            },
            {
                id: "integrations",
                title: "Integrations Working",
                text: "Booking tools, maps, payments, and newsletter sign-ups have been tested end to end.",
            },
        ],
    },
    {
        id: "performance",
        title: "Performance",
        icon: "gauge",
        checks: [
            {
                id: "images",
                title: "Images Compressed & Sized",
                text: "Images use modern formats like WebP or AVIF, are sized for how they’re shown, and lazy load below the fold.",
                link: { label: "Compress with Squoosh", url: "https://squoosh.app/" },
            },
            {
                id: "fonts",
                title: "Fonts Kept Lean",
                text: "Only the font weights you use are loaded, as WOFF2 files with font-display: swap.",
            },
            {
                id: "scripts",
                title: "Scripts Deferred & Minified",
                text: "JavaScript and CSS are minified, and scripts load with defer or async so they don’t block the page.",
            },
            {
                id: "caching",
                title: "Caching & Compression On",
                text: "The server compresses files (Brotli or Gzip) and sends cache headers so repeat visits load faster.",
            },
            {
                id: "page-weight",
                title: "Page Weight Checked",
                text: "Pages stay light, with few third-party scripts and requests, so they load quickly on mobile data.",
            },
            {
                id: "vitals",
                title: "Core Web Vitals Pass",
                text: "Key pages pass Google’s Core Web Vitals for loading, responsiveness, and visual stability.",
                link: { label: "Run PageSpeed Insights", url: "https://pagespeed.web.dev/" },
            },
        ],
    },
    {
        id: "security",
        title: "Security",
        icon: "shield",
        checks: [
            {
                id: "https",
                title: "HTTPS Everywhere",
                text: "An SSL certificate is installed, http redirects to https, and there’s no mixed content.",
                link: { label: "Test your SSL", url: "https://www.ssllabs.com/ssltest/" },
            },
            {
                id: "security-headers",
                title: "Security Headers Set",
                text: "Headers like Content-Security-Policy, Strict-Transport-Security, and X-Frame-Options are in place.",
                link: { label: "Check your headers", url: "https://securityheaders.com/" },
            },
            {
                id: "updates",
                title: "Software Up To Date",
                text: "The CMS, plugins, and themes are on their latest versions, and anything unused has been removed.",
            },
            {
                id: "logins",
                title: "Logins Locked Down",
                text: "Accounts use strong, unique passwords and two-factor sign-in, and old test accounts are deleted.",
            },
            {
                id: "backups",
                title: "Backups & Recovery Plan",
                text: "Automatic backups are running, and you know how to restore the site if something goes wrong.",
            },
        ],
    },
];

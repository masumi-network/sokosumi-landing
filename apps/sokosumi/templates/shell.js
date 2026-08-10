// Shared chrome for every server-rendered Sokosumi sub-page: <head>, header,
// footer, breadcrumbs, and the small HTML utilities templates build with.
// Design language matches the landing page (index.html): Inter, ink + paper,
// hairlines, light display weights. Styles live in /assets/styles.css.

const cms = require("../lib/cms");

const APP = "https://app.sokosumi.com";
const SITE = "https://sokosumi.com";
// Contact is one section with two doors; /talk-to-sales and /support are
// kept alive as 301s in server.js so old links and any printed material
// still land in the right place.
const SALES_URL = "/contact/sales";
const SUPPORT_URL = "/contact/support";

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
}
const attr = esc;

// Word-boundary truncation for meta descriptions: never cuts mid-word,
// never leaves trailing space or punctuation fragments.
function truncate(s, n) {
  const str = String(s || "").trim();
  const max = n || 155;
  if (str.length <= max) return str;
  const cut = str.slice(0, max + 1);
  const atWord = cut.slice(0, cut.lastIndexOf(" "));
  return (atWord || cut.slice(0, max)).replace(/[\s,;:.–—-]+$/, "");
}

function slugify(s) {
  return (
    String(s || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

// ---- icons (lucide-ish, stroke inherits currentColor) ----
const ICONS = {
  "arrow-up-right": '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "arrow-left": '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  "file-text":
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  presentation: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  window: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/>',
  building:
    '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
};
function icon(name, size) {
  size = size || 14;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

// Output-type labels for offers (CMS `output` select).
const OUTPUT = {
  pdf: { label: "PDF", icon: "file-text" },
  doc: { label: "Document", icon: "file-text" },
  slides: { label: "Slides", icon: "presentation" },
  sheet: { label: "Sheet", icon: "table" },
  image: { label: "Image", icon: "image" },
  text: { label: "Text", icon: "file-text" },
  html: { label: "Web", icon: "window" },
};
function outputMeta(type) {
  return OUTPUT[type] || OUTPUT.text;
}

// ---- tiny safe Markdown (headings, bold, lists, paragraphs) ----
function markdownLite(src) {
  const lines = String(src || "").replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let list = null;
  const closeList = () => {
    if (list) {
      html += `</${list}>`;
      list = null;
    }
  };
  const inline = (t) =>
    esc(t)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) {
      closeList();
      continue;
    }
    if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
      closeList();
      html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`;
    } else if ((m = /^[-*]\s+(.*)$/.exec(line))) {
      if (list !== "ul") {
        closeList();
        html += "<ul>";
        list = "ul";
      }
      html += `<li>${inline(m[1])}</li>`;
    } else if ((m = /^\d+\.\s+(.*)$/.exec(line))) {
      if (list !== "ol") {
        closeList();
        html += "<ol>";
        list = "ol";
      }
      html += `<li>${inline(m[1])}</li>`;
    } else {
      closeList();
      html += `<p>${inline(line)}</p>`;
    }
  }
  closeList();
  return html;
}

function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => {
      const el = { "@type": "ListItem", position: i + 1, name: it.label };
      if (it.href) el.item = SITE + it.href;
      return el;
    }),
  };
}

// ---- shared chrome ----
function head(opts) {
  const title = esc(opts.title);
  const desc = esc(opts.description || "");
  const canonical = SITE + opts.path;
  const schemas = [];
  if (opts.breadcrumb && opts.breadcrumb.length) schemas.push(breadcrumbLd(opts.breadcrumb));
  if (opts.jsonld) schemas.push(opts.jsonld);
  const jsonld = schemas
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, "\\u003c")}</script>`)
    .join("\n    ");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    ${opts.noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${attr(canonical)}" />`}
    <meta property="og:site_name" content="Sokosumi" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${attr(canonical)}" />
    <meta property="og:image" content="${attr(opts.ogImage || SITE + "/assets/og-image.jpg")}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${attr(opts.ogImage || SITE + "/assets/og-image.jpg")}" />
    <link rel="icon" href="/assets/favicon.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/styles.css" />
    <link rel="stylesheet" href="/assets/nav.css" />
    <!-- reveals start at opacity 0 and are switched on by site.js; without JS
         that would leave the page blank -->
    <noscript><style>[data-reveal] { opacity: 1 !important; transform: none !important; }</style></noscript>
    ${jsonld}
  </head>
  <body>`;
}

// Nav model (top vendors + industries) for the dropdown menus. It is the
// same for every visitor, so a module-level cache is safe: the server calls
// setNav() with the freshly built model before rendering.
let NAV_MODEL = { vendors: [], industries: [], popularUseCases: [], faces: [] };
function setNav(model) {
  if (model) NAV_MODEL = model;
}

// A few coworker portraits to warm up the ink CTA bands. Rotated by a seed so
// the same band is not always the same three faces, but stable within a render.
function ctaFaces(seed, count) {
  const pool = NAV_MODEL.faces || [];
  const n = Math.min(count || 4, pool.length);
  if (!n) return "";
  const start = Math.abs(seed || 0) % pool.length;
  const picked = [];
  for (let i = 0; i < n; i++) picked.push(pool[(start + i) % pool.length]);
  return `<span class="cta-faces" aria-hidden="true">${picked
    .map((c) => `<img src="${attr(c.image)}" alt="" loading="lazy" />`)
    .join("")}</span>`;
}

// The four product renders the landing page carousel uses. Sub-pages reach
// for these whenever a page would otherwise be a wall of text, and they are
// the fallback artwork for CMS entries that have no image of their own.
const SHOTS = {
  roster: {
    src: "/assets/shot-roster.webp",
    alt: "The Sokosumi roster: five named AI coworkers from Serviceplan, with Elena's profile open beside them",
    caption: "Your coworkers, in one roster. Each has a name, a role, the models it runs on, and the region it runs in.",
  },
  brief: {
    src: "/assets/shot-brief.webp",
    alt: "The Sokosumi briefing bar asking what you want to get done, with suggested campaign tasks below it",
    caption: "Start from the work, not the tool. Say what you want done and Sokosumi points you at the coworkers who do it.",
  },
  board: {
    src: "/assets/shot-board.webp",
    alt: "The Sokosumi task board: running tasks with the coworkers assigned to each",
    caption: "Watch it move. Every task shows who picked it up and where it stands, from running to input required to done.",
  },
  chat: {
    src: "/assets/shot-chat2.webp",
    alt: "The Sokosumi chat: a team channel where a coworker is mentioned and replies in the same thread",
    caption: "Brief them like colleagues. Mention a coworker in the channel and it answers in the thread.",
  },
};
const SHOT_KEYS = Object.keys(SHOTS);

// Stable per-page pick, so the same page always shows the same shot but two
// neighbouring pages do not show the same one.
function shotFor(seed) {
  const n = typeof seed === "string" ? seed.length + (seed.charCodeAt(0) || 0) : Number(seed) || 0;
  return SHOTS[SHOT_KEYS[Math.abs(n) % SHOT_KEYS.length]];
}

function shotFigure(shot, opts) {
  const o = opts || {};
  if (!shot) return "";
  return `<figure class="shot-fig${o.wide ? " wide" : ""}">
      <img src="${attr(shot.src)}" alt="${attr(shot.alt)}" width="2400" height="1350" loading="lazy" decoding="async" />
      ${o.caption === false ? "" : `<figcaption>${esc(shot.caption)}</figcaption>`}
    </figure>`;
}

// One customer quote, large. A grid of them reads as filler and repeats the
// same names on every page; a single quote given room reads as a statement.
// `t` is a testimonials doc (or a populated relationship from a quote block).
function quoteSection(t, opts) {
  if (!t || !t.quote) return "";
  const o = opts || {};
  const av = cms.mediaUrl(t.avatar);
  return `<section class="page-section${o.flush ? " flush" : ""} quote-section" data-reveal>
      ${o.heading ? `<p class="quote-kicker">${esc(o.heading)}</p>` : ""}
      <figure class="pull-quote">
        <blockquote>&ldquo;${esc(t.quote)}&rdquo;</blockquote>
        <figcaption>
          ${av ? `<span class="pq-avatar"><img src="${attr(av)}" alt="" loading="lazy" /></span>` : ""}
          <span class="pq-who"><strong>${esc(t.name)}</strong>${t.role ? `<small>${esc(t.role)}</small>` : ""}</span>
        </figcaption>
      </figure>
    </section>`;
}

// Deterministic pick for pages that are not editor-composed, so /pricing and
// the use-cases hub do not both show the same person.
function pickQuote(list, seed) {
  const items = (list || []).filter((t) => t && t.quote);
  if (!items.length) return null;
  return items[Math.abs(seed || 0) % items.length];
}

// Card grid class for a list whose length is known: one or two cards get a
// capped track instead of sitting in a three-column grid with empty columns.
function gridCls(n) {
  return n >= 3 ? "card-grid" : `card-grid cols-${n}`;
}

// A gallery of every shot, for pages that are about the product itself.
function shotGallery(keys) {
  const list = (keys && keys.length ? keys : SHOT_KEYS).map((k) => SHOTS[k]).filter(Boolean);
  return `<div class="shot-gallery">${list.map((s) => shotFigure(s)).join("")}</div>`;
}

// The ink end-cap every page closes with, same shape as the landing page's.
// Lives here rather than in blocks.js so templates that render no CMS blocks
// can use it too; blocks.ctaBand() delegates to this so a CMS-authored band
// and a hand-built one are the same markup.
// Sits under any button that starts a signup. The nav is the one exception —
// a bar of chrome is not the place for a reassurance line.
const NO_CARD = `<p class="no-card">*No Credit Card required</p>`;
// Same line, but as a span so it can sit inside an existing note paragraph
// instead of becoming another item in a gapped flex column.
const NO_CARD_LINE = `<span class="no-card">*No Credit Card required</span>`;

// True when a CTA sends the visitor into the app, i.e. it is a signup. Bands
// that link somewhere else on the site (the blog's "Browse the roster") get
// no fine print, because nothing is being signed up for.
function isSignupHref(href) {
  return !href || href === APP || href.startsWith(APP + "/");
}

function ctaBand(b) {
  const heading = b.heading || "Put an AI coworker on it";
  const label = b.ctaLabel || "Start free";
  const href = b.ctaHref || APP;
  // Two blocks, always: copy on the left, action on the right. The old markup
  // put the heading, subheading, faces and button in one grid and positioned
  // the button with an explicit row span, which only lined up when all three
  // optional pieces happened to be present.
  return `<section class="blk blk-cta" data-reveal><div class="cta-inner">
      <div class="cta-copy">
        <h2>${esc(heading)}</h2>
        ${b.subheading ? `<p>${esc(b.subheading)}</p>` : ""}
        ${ctaFaces(b.seed != null ? b.seed : heading.length, 4)}
      </div>
      <div class="cta-action">
        <a class="btn btn-primary btn-lg" href="${attr(href)}">${esc(label)}</a>
        ${isSignupHref(href) ? NO_CARD : ""}
      </div>
    </div></section>`;
}

const CHEV =
  '<svg class="nav-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

// The AI Coworkers mega menu: the top vendors with their wordmark, a few
// curated coworkers each, and the two catch-all links.
function agentsPanel() {
  const cols = NAV_MODEL.vendors
    .map(
      (v) => `<div class="nav-col">
        <a class="nav-col-head${v.logo ? " has-logo" : ""}" href="/vendors/${encodeURIComponent(v.slug)}">${
          v.logo
            ? `<span class="nav-col-logo${v.logo.invert ? " invert" : ""}"><img src="${attr(
                v.logo.url,
              )}" alt="${attr(v.name)}" loading="lazy" /></span>`
            : esc(v.name)
        }</a>
        ${v.picks
          .map(
            (p) =>
              `<a class="nav-col-link has-face" href="/coworkers/${encodeURIComponent(p.slug)}">${
                p.image
                  ? `<span class="nav-face"><img src="${attr(p.image)}" alt="" loading="lazy" /></span>`
                  : `<span class="nav-face is-blank"></span>`
              }<span class="nav-face-text"><span>${esc(p.name)}</span>${
                p.role ? `<small>${esc(p.role)}</small>` : ""
              }</span></a>`,
          )
          .join("")}
      </div>`,
    )
    .join("");
  if (!cols) return "";
  return `<div class="nav-panel nav-panel-wide" role="group" aria-label="AI Coworkers">
      <div class="nav-cols" style="--nav-cols:${NAV_MODEL.vendors.length}">${cols}</div>
      <div class="nav-panel-foot">
        <a href="/vendors">Show all vendors ${icon("arrow-up-right", 13)}</a>
        <a href="/coworkers">Show all coworkers ${icon("arrow-up-right", 13)}</a>
      </div>
    </div>`;
}

// The Use cases menu: pick an industry, or open the hub.
// The Product menu: the deep-dives under /product, straight from the CMS,
// so a page added there shows up here without a code change.
function productPanel() {
  const pages = NAV_MODEL.productPages || [];
  if (!pages.length) return "";
  const rows = pages
    .map(
      (p) =>
        `<a class="nav-col-link" href="/${p.slug.split("/").map(encodeURIComponent).join("/")}"><span>${esc(
          p.title,
        )}</span>${p.description ? `<small>${esc(shell_truncate(p.description, 62))}</small>` : ""}</a>`,
    )
    .join("");
  return `<div class="nav-panel" role="group" aria-label="Product">
      <div class="nav-col">${rows}</div>
      <div class="nav-panel-foot">
        <a href="/product">Product overview ${icon("arrow-up-right", 13)}</a>
        <a href="/pricing">Pricing ${icon("arrow-up-right", 13)}</a>
      </div>
    </div>`;
}

// A short label for the menu: the SEO description is a sentence, the menu
// wants a phrase.
function shell_truncate(s, n) {
  const t = String(s || "").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n + 1);
  const at = cut.lastIndexOf(" ");
  return cut.slice(0, at > 20 ? at : n).replace(/[\s,;:.–—-]+$/, "") + "\u2026";
}

// The Use cases menu: one column per industry, each showing the work that
// industry actually runs, plus a "Most used" column for visitors who do not
// think of their problem as belonging to a vertical. An industry name on its
// own told nobody whether what they needed was behind it.
function useCasesPanel() {
  const industries = NAV_MODEL.industries || [];
  const popular = NAV_MODEL.popularUseCases || [];
  if (!industries.length && !popular.length) return "";

  const cols = industries
    .map(
      (i) => `<div class="nav-col">
        <a class="nav-col-head" href="/use-cases/industries/${encodeURIComponent(i.slug)}">${esc(i.name)}</a>
        ${i.picks
          .map(
            (p) =>
              `<a class="nav-col-link" href="/use-cases/${encodeURIComponent(p.slug)}"><span>${esc(p.title)}</span></a>`,
          )
          .join("")}
      </div>`,
    )
    .join("");

  const popularCol = popular.length
    ? `<div class="nav-col nav-col-popular">
        <span class="nav-col-head">Most used</span>
        ${popular
          .map(
            (p) =>
              `<a class="nav-col-link" href="/use-cases/${encodeURIComponent(p.slug)}"><span>${esc(p.title)}</span></a>`,
          )
          .join("")}
      </div>`
    : "";

  const total = industries.length + (popularCol ? 1 : 0);
  return `<div class="nav-panel nav-panel-wide nav-panel-mega" role="group" aria-label="Use cases">
      <p class="nav-panel-label">By industry</p>
      <div class="nav-cols" style="--nav-cols:${total}">${cols}${popularCol}</div>
      <div class="nav-panel-foot">
        <a href="/use-cases">All use cases ${icon("arrow-up-right", 13)}</a>
        <a href="/tasks">Browse template tasks ${icon("arrow-up-right", 13)}</a>
      </div>
    </div>`;
}

function navItems(currentPath) {
  const isCurrent = (href) =>
    currentPath === href || (currentPath && currentPath.startsWith(href + "/")) ? ' aria-current="page"' : "";

  const agents = agentsPanel();
  const useCases = useCasesPanel();
  const product = productPanel();

  const item = (href, label, panel, extraMatch) => {
    const current = isCurrent(href) || (extraMatch && isCurrent(extraMatch));
    const trigger = `<a href="${href}"${current}>${label}${panel ? CHEV : ""}</a>`;
    return panel ? `<div class="nav-drop">${trigger}${panel}</div>` : trigger;
  };

  // Three items only. Guides and Releases are reference material, not paths
  // into the product, and they live in the footer.
  return [
    item("/coworkers", "AI Coworkers", agents, "/vendors"),
    item("/product", "Product", product),
    item("/use-cases", "Use cases", useCases),
    item("/pricing", "Pricing", ""),
  ].join("\n            ");
}

// The drawer the burger opens below 900px. Same links as index.html's copy —
// both surfaces share /assets/nav.css and /assets/nav.js.
const MOBILE_LINKS = [
  ["/coworkers", "AI Coworkers", "Named specialists you can hire"],
  ["/vendors", "Vendors", "The teams behind them"],
  ["/tasks", "Template tasks", "Ready-to-run work"],
  ["/product", "Product", "How it works, end to end"],
  ["/use-cases", "Use cases", "By job and by industry"],
  ["/pricing", "Pricing", "Plans and credits per seat"],
];

function mobileNav() {
  const links = MOBILE_LINKS.map(
    ([href, label, hint]) =>
      `<a class="m-link" href="${href}">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ""}</a>`,
  ).join("");
  return `<div class="mobile-nav" id="mobileNav" hidden>
        ${links}
        <div class="m-actions">
          <a class="btn btn-primary" href="${APP}">Sign Up</a>
          <a class="btn btn-outline" href="${SALES_URL}">Talk to Sales</a>
          <a class="btn btn-ghost" href="${APP}/signin">Log In</a>
        </div>
      </div>`;
}

const BURGER = `<button class="nav-burger" id="navBurger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav"><span></span><span></span></button>`;

function header(currentPath) {
  return `<header class="site-header">
      <div class="container-app bar">
        <div class="nav-left">
          <a href="/" aria-label="Sokosumi"><img class="mark" src="/assets/sokosumi-wordmark.svg" alt="Sokosumi" width="144" height="17" /></a>
          <nav class="site-nav" aria-label="Primary">
            ${navItems(currentPath)}
          </nav>
        </div>
        <div class="actions">
          <a class="btn btn-sm btn-ghost" href="${APP}/signin">Log In</a>
          <a class="btn btn-sm btn-outline" href="${SALES_URL}">Talk to Sales</a>
          <a class="btn btn-sm btn-primary" href="${APP}">Sign Up</a>
          ${BURGER}
        </div>
      </div>
    </header>
    ${mobileNav()}`;
}

function footer() {
  return `<footer class="site">
      <div class="container-app">
        <div class="foot-top">
          <a href="/" aria-label="Sokosumi">
            <img class="foot-mark" src="/assets/sokosumi-wordmark.svg" alt="Sokosumi" width="121" height="16" />
          </a>
          <nav class="foot-links" aria-label="Footer">
            <a href="/coworkers">AI Coworkers</a>
            <a href="/vendors">Vendors</a>
            <a href="/tasks">Template tasks</a>
            <a href="/product">Product</a>
            <a href="/use-cases">Use cases</a>
            <a href="/pricing">Pricing</a>
            <a href="/guides">Guides</a>
            <a href="/releases">Releases</a>
            <a href="/blog">Blog</a>
          </nav>
        </div>
        <div class="foot-secondary">
          <a href="/compare">Compare</a>
          <a href="/contact">Contact</a>
          <a href="${SUPPORT_URL}">Support</a>
          <a href="https://www.masumi.network/dev/sokosumi/documentation" target="_blank" rel="noreferrer">Developers</a>
          <a href="/press">Press</a>
          <a href="https://linkedin.com/company/sokosumi/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://x.com/sokosumi" target="_blank" rel="noreferrer">X</a>
          <a href="https://masumi.network" target="_blank" rel="noreferrer">Masumi</a>
        </div>
        <div class="foot-bottom">
          <p class="foot-copy">&copy; ${new Date().getFullYear()} Sokosumi. All rights reserved.</p>
        </div>
      </div>
    </footer>
    <script src="/assets/site.js" defer></script>
    <script src="/assets/nav.js" defer></script>
  </body>
</html>`;
}

function crumbs(items) {
  const parts = items
    .map((it, i) => {
      const last = i === items.length - 1;
      const label = esc(it.label);
      return last || !it.href
        ? `<span class="current">${label}</span>`
        : `<a href="${attr(it.href)}">${label}</a>`;
    })
    .join(' <span class="sep">/</span> ');
  return `<nav class="crumbs container-app" aria-label="Breadcrumb">${parts}</nav>`;
}

// Standard page opening: head + header + breadcrumbs + <main>. Close with
// pageEnd(). `cr` doubles as the BreadcrumbList JSON-LD source.
function pageStart(opts) {
  return (
    head(opts) +
    header(opts.path) +
    (opts.breadcrumb ? crumbs(opts.breadcrumb) : "") +
    `<main class="page container-app">`
  );
}
function pageEnd() {
  return `</main>` + footer();
}

function avatar(entity, cls) {
  const img = entity && entity.image;
  // Marketplace listings are represented by a line-art icon, not a portrait,
  // so it gets contained and inset instead of cropped to fill the circle.
  const icon = entity && entity.kind === "agent" ? " is-icon" : "";
  if (img) {
    return `<span class="avatar ${cls || ""}${icon}"><img src="${attr(img)}" alt="" loading="lazy" /></span>`;
  }
  const initial = esc((entity && entity.name ? entity.name : "?").charAt(0));
  return `<span class="avatar ${cls || ""}" style="background:var(--ink)">${initial}</span>`;
}

// A vendor wordmark. Two sources with opposite polarity: an editor's upload and
// the product's own vendor artwork are dark on transparent, while the synced
// marketplace wordmarks are white on transparent and would vanish on paper.
// `.invert` flattens those to ink — the mirror of the landing page's
// `.band-dark .trust-logo { filter: brightness(0) invert(1) }`.
// Returns "" when there is no artwork: the vendor name always carries the page,
// so a missing logo must leave no empty box behind.
function vendorLogo(v, cls) {
  if (!v) return "";
  const uploaded = cms.mediaUrl(v.logo);
  const url = uploaded || v.logoUrl || null;
  if (!url) return "";
  const invert = !uploaded && v.logoInvert ? " invert" : "";
  return `<span class="vendor-logo ${cls || ""}${invert}"><img src="${attr(url)}" alt="${attr(
    v.name || "",
  )}" loading="lazy" /></span>`;
}

module.exports = {
  APP,
  SITE,
  SALES_URL,
  SUPPORT_URL,
  setNav,
  esc,
  attr,
  slugify,
  truncate,
  icon,
  outputMeta,
  markdownLite,
  head,
  header,
  footer,
  crumbs,
  pageStart,
  pageEnd,
  avatar,
  vendorLogo,
  ctaFaces,
  ctaBand,
  quoteSection,
  pickQuote,
  NO_CARD,
  NO_CARD_LINE,
  gridCls,
  SHOTS,
  shotFor,
  shotFigure,
  shotGallery,
};

// Shared chrome for every server-rendered Sokosumi sub-page: <head>, header,
// footer, breadcrumbs, and the small HTML utilities templates build with.
// Design language matches the landing page (index.html): Inter, ink + paper,
// hairlines, light display weights. Styles live in /assets/styles.css.

const cms = require("../lib/cms");

const APP = "https://app.sokosumi.com";
const SITE = "https://sokosumi.com";
const SALES_URL = "/talk-to-sales";

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
    ${jsonld}
  </head>
  <body>`;
}

// Nav model (top vendors + industries) for the dropdown menus. It is the
// same for every visitor, so a module-level cache is safe: the server calls
// setNav() with the freshly built model before rendering.
let NAV_MODEL = { vendors: [], industries: [] };
function setNav(model) {
  if (model) NAV_MODEL = model;
}

const CHEV =
  '<svg class="nav-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

// The AI Coworkers mega menu: the top vendors, a few of their agents each, and
// the two catch-all links.
function agentsPanel() {
  const cols = NAV_MODEL.vendors
    .map(
      (v) => `<div class="nav-col">
        <a class="nav-col-head" href="/vendors/${encodeURIComponent(v.slug)}">${esc(v.name)}</a>
        ${v.picks
          .map(
            (p) =>
              `<a class="nav-col-link" href="/coworkers/${encodeURIComponent(p.slug)}"><span>${esc(p.name)}</span>${
                p.role ? `<small>${esc(p.role)}</small>` : ""
              }</a>`,
          )
          .join("")}
      </div>`,
    )
    .join("");
  if (!cols) return "";
  return `<div class="nav-panel nav-panel-wide" role="group" aria-label="AI Coworkers">
      <div class="nav-cols">${cols}</div>
      <div class="nav-panel-foot">
        <a href="/vendors">Show all vendors ${icon("arrow-up-right", 13)}</a>
        <a href="/coworkers">Show all coworkers ${icon("arrow-up-right", 13)}</a>
      </div>
    </div>`;
}

// The Use cases menu: pick an industry, or open the hub.
function useCasesPanel() {
  const rows = NAV_MODEL.industries
    .map(
      (i) =>
        `<a class="nav-col-link" href="/use-cases/industries/${encodeURIComponent(i.slug)}"><span>${esc(i.name)}</span>${
          i.count ? `<small>${i.count} use case${i.count > 1 ? "s" : ""}</small>` : ""
        }</a>`,
    )
    .join("");
  if (!rows) return "";
  return `<div class="nav-panel" role="group" aria-label="Use cases by industry">
      <div class="nav-col">${rows}</div>
      <div class="nav-panel-foot">
        <a href="/use-cases">All use cases ${icon("arrow-up-right", 13)}</a>
      </div>
    </div>`;
}

function navItems(currentPath) {
  const isCurrent = (href) =>
    currentPath === href || (currentPath && currentPath.startsWith(href + "/")) ? ' aria-current="page"' : "";

  const agents = agentsPanel();
  const useCases = useCasesPanel();

  const item = (href, label, panel, extraMatch) => {
    const current = isCurrent(href) || (extraMatch && isCurrent(extraMatch));
    const trigger = `<a href="${href}"${current}>${label}${panel ? CHEV : ""}</a>`;
    return panel ? `<div class="nav-drop">${trigger}${panel}</div>` : trigger;
  };

  return [
    item("/coworkers", "AI Coworkers", agents, "/vendors"),
    item("/use-cases", "Use cases", useCases),
    item("/guides", "Guides", ""),
    item("/releases", "Releases", ""),
  ].join("\n            ");
}

function header(currentPath) {
  return `<header class="site-header">
      <div class="container-app bar">
        <div class="nav-left">
          <a href="/" aria-label="Sokosumi"><img class="mark" src="/assets/sokosumi-wordmark.svg" alt="Sokosumi" width="152" height="18" /></a>
          <nav class="site-nav" aria-label="Primary">
            ${navItems(currentPath)}
          </nav>
        </div>
        <div class="actions">
          <a class="btn btn-sm btn-ghost" href="${APP}/signin">Log In</a>
          <a class="btn btn-sm btn-outline" href="/talk-to-sales">Talk to Sales</a>
          <a class="btn btn-sm btn-primary" href="${APP}">Sign Up</a>
        </div>
      </div>
    </header>`;
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
            <a href="/use-cases">Use cases</a>
            <a href="/guides">Guides</a>
            <a href="/releases">Releases</a>
            <a href="/blog">Blog</a>
          </nav>
        </div>
        <div class="foot-secondary">
          <a href="/compare">Compare</a>
          <a href="/contact">Contact</a>
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
  if (img) {
    return `<span class="avatar ${cls || ""}"><img src="${attr(img)}" alt="" loading="lazy" /></span>`;
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
};

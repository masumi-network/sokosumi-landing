// Zero-dependency server-side templates for coworker + pre-built task pages.
// Pure string building from the in-memory catalog (see server.js). Everything
// from the API is escaped; the only rich rendering is a small, safe Markdown
// subset for text sample outputs and a sandboxed iframe for html samples.

const APP = "https://app.sokosumi.com";
const SITE = "https://sokosumi.com";

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
}
function attr(s) { return esc(s); }

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

// ---- icons (lucide-ish) ----
const ICONS = {
  "bar-chart": '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  "list-checks": '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  "pen-line": '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  presentation: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  "trending-up": '<path d="M22 7 13.5 15.5l-5-5L2 17"/><path d="M16 7h6v6"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 1.03 1.75l3 1.65a2 2 0 0 0 1.94 0L10 20.09"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/>',
  "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  "arrow-up-right": '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  window: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/>',
};
function icon(name, size) {
  size = size || 14;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

// ---- category taxonomy (mirrors the product's offer-card colour cues) ----
const CATEGORY = {
  Research: { icon: "bar-chart", mock: "chart", chart: 1 },
  "Market research": { icon: "bar-chart", mock: "chart", chart: 1 },
  Planning: { icon: "list-checks", mock: "checklist", chart: 4 },
  Coordination: { icon: "list-checks", mock: "checklist", chart: 5 },
  Reporting: { icon: "trending-up", mock: "chart", chart: 5 },
  Engineering: { icon: "code", mock: "code", chart: 3 },
  Presentations: { icon: "presentation", mock: "slides", chart: 2 },
  Prototyping: { icon: "boxes", mock: "wireframe", chart: 1 },
  Writing: { icon: "pen-line", mock: "text", chart: 3 },
  "Content creation": { icon: "pen-line", mock: "text", chart: 2 },
  Social: { icon: "image", mock: "text", chart: 2 },
};
function catMeta(cat) { return CATEGORY[cat] || { icon: "file-text", mock: "text", chart: 0 }; }
function chartColor(n) { return n ? `var(--chart-${n})` : "var(--foreground)"; }

// ---- output types ----
const OUTPUT = {
  pdf: { label: "PDF", icon: "file-text" },
  doc: { label: "Document", icon: "file-text" },
  slides: { label: "Slides", icon: "presentation" },
  sheet: { label: "Sheet", icon: "table" },
  image: { label: "Image", icon: "image" },
  text: { label: "Text", icon: "file-text" },
  html: { label: "Web", icon: "window" },
};
function outputMeta(type) { return OUTPUT[type] || OUTPUT.text; }
function offerOutputs(offer) {
  const outs = (offer.outputs || []).filter(Boolean);
  return outs.length ? outs : [{ type: "text" }];
}

function avatar(entity, cls) {
  if (entity && entity.image) {
    return `<span class="avatar ${cls || ""}"><img src="${attr(entity.image)}" alt="" loading="lazy" /></span>`;
  }
  const initial = esc((entity && entity.name ? entity.name : "?").charAt(0));
  return `<span class="avatar ${cls || ""}" style="background:var(--primary)">${initial}</span>`;
}

// ---- tiny safe Markdown (headings, bold, lists, paragraphs) ----
function markdownLite(src) {
  const lines = String(src || "").replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let list = null; // 'ul' | 'ol'
  const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
  const inline = (t) =>
    esc(t)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { closeList(); continue; }
    if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
      closeList();
      const lvl = m[1].length;
      html += `<h${lvl}>${inline(m[2])}</h${lvl}>`;
    } else if ((m = /^[-*]\s+(.*)$/.exec(line))) {
      if (list !== "ul") { closeList(); html += "<ul>"; list = "ul"; }
      html += `<li>${inline(m[1])}</li>`;
    } else if ((m = /^\d+\.\s+(.*)$/.exec(line))) {
      if (list !== "ol") { closeList(); html += "<ol>"; list = "ol"; }
      html += `<li>${inline(m[1])}</li>`;
    } else {
      closeList();
      html += `<p>${inline(line)}</p>`;
    }
  }
  closeList();
  return html;
}

// BreadcrumbList JSON-LD built from the SAME items the visible breadcrumb uses,
// so the two can never drift. Linked crumbs carry their URL; the current (last)
// crumb omits the URL, matching the non-linked visible current item.
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
    ${opts.noindex ? '<meta name="robots" content="noindex" />' : ""}
    <link rel="canonical" href="${attr(canonical)}" />
    <meta property="og:site_name" content="Sokosumi" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${attr(canonical)}" />
    <meta property="og:image" content="${attr(opts.ogImage || SITE + "/assets/hero-poster.jpg")}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${attr(opts.ogImage || SITE + "/assets/hero-poster.jpg")}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/styles.css" />
    ${jsonld}
  </head>
  <body>`;
}

function header() {
  return `<header class="site-header">
      <div class="container-app bar">
        <div class="nav-left">
          <a href="/" aria-label="Sokosumi"><img class="mark" src="/assets/sokosumi-wordmark.svg" alt="Sokosumi" width="152" height="18" /></a>
          <nav class="site-nav" aria-label="Primary">
            <a href="/coworkers">Coworkers</a>
            <a href="/tasks">Pre-built tasks</a>
          </nav>
        </div>
        <div class="actions">
          <a class="btn btn-sm btn-ghost" href="${APP}/signin">Log in</a>
          <a class="btn btn-sm btn-primary" href="${APP}">Sign up</a>
        </div>
      </div>
    </header>`;
}

function footer() {
  return `<footer class="site">
      <div class="container-app foot-row">
        <img class="foot-mark" src="/assets/sokosumi-wordmark.svg" alt="Sokosumi" width="121" height="16" />
        <nav class="foot-links" aria-label="Footer">
          <a href="/">Home</a>
          <a href="/coworkers">Coworkers</a>
          <a href="/tasks">Tasks</a>
          <a href="${APP}">Sign up</a>
          <a href="https://www.masumi.network">Masumi</a>
        </nav>
        <span class="foot-copy">&copy; 2026 Sokosumi &middot; Built with NMKR &amp; Serviceplan Group</span>
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

function profileTags(coworker) {
  const p = coworker.profile || {};
  const tags = [];
  (p.llm || []).slice(0, 3).forEach((m) => tags.push(`<span class="chip">${esc(m)}</span>`));
  if (p.hosting) tags.push(`<span class="chip">${esc(p.hosting)}</span>`);
  return tags.length ? `<div class="cw-tags">${tags.join("")}</div>` : "";
}

// ---- offer card (used on coworker page) ----
function offerMock(kind, color) {
  if (kind === "chart") {
    return `<div class="mock"><div class="mock-card"><div class="mock-bar" style="width:50%"></div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:44px;margin-top:8px">
      <div style="flex:1;height:40%;background:rgba(10,10,10,.15);border-radius:2px"></div>
      <div style="flex:1;height:70%;background:rgba(10,10,10,.15);border-radius:2px"></div>
      <div style="flex:1;height:55%;background:rgba(10,10,10,.15);border-radius:2px"></div>
      <div style="flex:1;height:90%;background:${color};border-radius:2px"></div>
      <div style="flex:1;height:60%;background:rgba(10,10,10,.15);border-radius:2px"></div></div></div></div>`;
  }
  if (kind === "checklist") {
    return `<div class="mock" style="flex-direction:column;justify-content:center;gap:9px;align-items:flex-start;padding-left:16%">
      ${["80%", "100%", "60%", "72%"].map((w) => `<div style="display:flex;align-items:center;gap:8px;width:72%"><span style="width:12px;height:12px;border-radius:999px;border:2px solid ${color};flex-shrink:0"></span><span class="mock-line" style="width:${w};margin:0"></span></div>`).join("")}</div>`;
  }
  if (kind === "code") {
    return `<div class="mock"><div class="mock-card"><div class="mock-bar" style="width:38%;background:${color}"></div>
      <div class="mock-line" style="width:56%;margin-left:14px"></div><div class="mock-line" style="width:48%;margin-left:14px"></div>
      <div class="mock-line" style="width:36%;margin-left:28px"></div><div class="mock-line" style="width:26%"></div></div></div>`;
  }
  if (kind === "slides") {
    return `<div class="mock"><div class="mock-card" style="max-width:76%"><div style="height:10px;border-radius:4px;background:${color}"></div>
      <div class="mock-line" style="width:66%;margin-top:8px"></div><div class="mock-line" style="width:100%"></div><div class="mock-line" style="width:80%"></div></div></div>`;
  }
  if (kind === "wireframe") {
    return `<div class="mock"><div class="mock-card"><div style="height:14px;border-radius:4px;background:${color}"></div>
      <div style="display:flex;gap:6px;margin-top:8px"><div style="flex:1;height:34px;background:rgba(10,10,10,.1);border-radius:4px"></div><div style="flex:1;height:34px;background:rgba(10,10,10,.1);border-radius:4px"></div></div></div></div>`;
  }
  return `<div class="mock" style="flex-direction:column;justify-content:center;gap:7px;align-items:flex-start;padding-left:16%">
    <div class="mock-bar" style="width:38%;background:${color}"></div><div class="mock-line" style="width:78%;margin:0"></div>
    <div class="mock-line" style="width:70%;margin:0"></div><div class="mock-line" style="width:60%;margin:0"></div></div>`;
}

function offerCard(coworker, offer) {
  const cm = catMeta(offer.category);
  const color = chartColor(cm.chart);
  const outs = offerOutputs(offer);
  const om = outputMeta(outs[0].type);
  const outLabel = outs.length > 1 ? `${om.label} +${outs.length - 1}` : om.label;
  const href = `/coworkers/${encodeURIComponent(coworker.slug)}/tasks/${encodeURIComponent(offer.slug)}`;
  const catChip = offer.category
    ? `<span class="offer-cat-chip" style="background:color-mix(in oklab, ${color} 15%, white); color:${color}">${icon(cm.icon, 12)}${esc(offer.category)}</span>`
    : "";
  return `<a class="offer-card" href="${attr(href)}">
    <div class="offer-thumb">${offerMock(cm.mock, color)}${catChip}
      <span class="offer-out-chip">${icon(om.icon, 12)}${esc(outLabel)}</span></div>
    <div class="offer-body">
      <div class="offer-title">${esc(offer.title)}</div>
      ${offer.description ? `<div class="offer-desc">${esc(offer.description)}</div>` : ""}
      <div class="offer-foot"><span>View task</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
    </div>
  </a>`;
}

// Card for the cross-coworker /tasks browse grid — shows who runs it and carries
// filter metadata (category / output / searchable text).
function taskBrowseCard(coworker, offer) {
  const cm = catMeta(offer.category);
  const color = chartColor(cm.chart);
  const outs = offerOutputs(offer);
  const om = outputMeta(outs[0].type);
  const outLabel = outs.length > 1 ? `${om.label} +${outs.length - 1}` : om.label;
  const href = `/coworkers/${encodeURIComponent(coworker.slug)}/tasks/${encodeURIComponent(offer.slug)}`;
  const searchText = `${offer.title} ${offer.description || ""} ${offer.category || ""} ${coworker.name} ${coworker.role || ""}`.toLowerCase();
  const catChip = offer.category
    ? `<span class="offer-cat-chip" style="background:color-mix(in oklab, ${color} 15%, white); color:${color}">${icon(cm.icon, 12)}${esc(offer.category)}</span>`
    : "";
  return `<a class="offer-card task-hit" href="${attr(href)}" data-cat="${attr(offer.category || "")}" data-out="${attr(outs[0].type)}" data-text="${attr(searchText)}">
    <div class="offer-thumb">${offerMock(cm.mock, color)}${catChip}
      <span class="offer-out-chip">${icon(om.icon, 12)}${esc(outLabel)}</span></div>
    <div class="offer-body">
      <div class="offer-title">${esc(offer.title)}</div>
      ${offer.description ? `<div class="offer-desc">${esc(offer.description)}</div>` : ""}
      <div class="offer-foot task-by">${avatar(coworker, "")}<span>${esc(coworker.name)}</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
    </div>
  </a>`;
}

// ---- sample output renderer (ports the product's OfferEmbed) ----
// Office docs need the Microsoft viewer (the browser would download them);
// PDFs render natively with their chrome hidden; html runs in a sandboxed
// iframe; text renders as a titled document; images show inline.
const OFFICE_EXT = { doc: "docx", slides: "pptx", sheet: "xlsx" };
function isOfficeFile(url) { return /\.(pptx?|docx?|xlsx?)(\?|#|$)/i.test(url); }
function officeViewerUrl(url, type) {
  let src = url;
  if (!isOfficeFile(url)) {
    const ext = OFFICE_EXT[type] || "docx";
    src = url + (url.includes("?") ? "&" : "?") + "filename=file." + ext;
  }
  return "https://view.officeapps.live.com/op/embed.aspx?src=" + encodeURIComponent(src);
}

// Render a single output into the preview panel.
function embedOutput(output, title) {
  const type = output.type || "text";
  const url = output.url;
  const text = output.text;
  if (url && type === "image") {
    return `<img class="embed-image" src="${attr(url)}" alt="${attr(title)}" loading="lazy" />`;
  }
  if (type === "html" && (text || url)) {
    const s = text ? ` srcdoc="${attr(text)}"` : ` src="${attr(url)}"`;
    return `<iframe class="embed-frame" title="${attr(title)}" sandbox="allow-scripts" loading="lazy"${s}></iframe>`;
  }
  if (url) {
    const src =
      type in OFFICE_EXT || isOfficeFile(url)
        ? officeViewerUrl(url, type)
        : url + "#toolbar=0&navpanes=0&scrollbar=0&view=FitH";
    return `<iframe class="embed-frame" title="${attr(title)}" src="${attr(src)}" loading="lazy"></iframe>`;
  }
  if (text) {
    return `<div class="embed-doc-scroll"><article class="task-doc">
      <div class="task-doc-head">${icon("file-text", 16)}<span>${esc(output.label || title)}</span></div>
      <div class="task-doc-body">${markdownLite(text)}</div>
    </article></div>`;
  }
  return `<div class="embed-empty">${icon("file-text", 28)}<span>The sample output is generated when you run this task.</span></div>`;
}

// Preview shell — one output fills the frame; multiple outputs get CSS-only tabs.
function samplePreview(offer) {
  const outs = offerOutputs(offer);
  if (outs.length <= 1) {
    return `<div class="task-preview">${embedOutput(outs[0], offer.title)}</div>`;
  }
  const gid = "out";
  const rules = outs
    .map(
      (o, i) =>
        `#${gid}-${i}:checked~.embed-panels>.embed-panel:nth-child(${i + 1}){display:block}` +
        `#${gid}-${i}:checked~.embed-tabs>label[for="${gid}-${i}"]{background:var(--foreground);color:#fff}`,
    )
    .join("");
  const radios = outs.map((o, i) => `<input class="embed-radio" type="radio" name="${gid}" id="${gid}-${i}"${i === 0 ? " checked" : ""} />`).join("");
  const tabs = outs
    .map((o, i) => {
      const om = outputMeta(o.type);
      return `<label for="${gid}-${i}">${icon(om.icon, 13)}${esc(o.label || om.label)}</label>`;
    })
    .join("");
  const panels = outs.map((o) => `<div class="embed-panel">${embedOutput(o, offer.title)}</div>`).join("");
  return `<div class="task-preview has-tabs">
    <style>.embed-panels>.embed-panel{display:none}${rules}</style>
    ${radios}<div class="embed-tabs">${tabs}</div><div class="embed-panels">${panels}</div>
  </div>`;
}

// ================= PAGES =================

function renderCoworkersIndex(catalog) {
  const coworkers = catalog.coworkers || [];
  const tiles = coworkers
    .map((c, i) => {
      const n = (c.offers || []).length;
      return `<a class="cw-tile" href="/coworkers/${encodeURIComponent(c.slug)}" data-reveal style="--i:${i % 4}">
        ${avatar(c, "")}
        <h3>${esc(c.name)}</h3>
        ${c.role ? `<span class="role">${esc(c.role)}${c.company ? " &middot; " + esc(c.company) : ""}</span>` : ""}
        <span class="count">${n ? n + " pre-built task" + (n > 1 ? "s" : "") : "Meet the coworker"}</span>
      </a>`;
    })
    .join("");
  const cr = [{ label: "Home", href: "/" }, { label: "Coworkers" }];
  return (
    head({
      title: "AI coworkers on Sokosumi",
      description: "Browse every AI coworker on Sokosumi: marketing specialists you can hire to run real work.",
      path: "/coworkers",
      breadcrumb: cr,
    }) +
    header() +
    crumbs(cr) +
    `<main class="container-app">
      <div class="page-head" data-reveal>
        <span class="eyebrow">Live from the marketplace</span>
        <h1>Meet your <span class="serif-accent">AI coworkers</span></h1>
        <p class="sub">${coworkers.length} specialists you can hire today, each with a real role, a public profile, and ready-to-run work.</p>
      </div>
      <div class="page-section" style="border-top:none;padding-top:24px">
        <div class="cw-grid">${tiles}</div>
      </div>
    </main>` +
    footer()
  );
}

function renderTasksBrowse(catalog, params) {
  params = params || {};
  const hits = [];
  (catalog.coworkers || []).forEach((c) => (c.offers || []).forEach((o) => hits.push({ c, o })));

  const catCounts = {};
  hits.forEach(({ o }) => {
    const k = o.category || "Other";
    catCounts[k] = (catCounts[k] || 0) + 1;
  });
  const cats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

  const catChips =
    `<button type="button" class="fchip" data-cat="">All <span>${hits.length}</span></button>` +
    cats
      .map(([name, n]) => {
        const cm = catMeta(name);
        return `<button type="button" class="fchip" data-cat="${attr(name)}" style="--fc:${chartColor(cm.chart)}">${icon(cm.icon, 13)}${esc(name)} <span>${n}</span></button>`;
      })
      .join("");

  const cards = hits.map(({ c, o }) => taskBrowseCard(c, o)).join("");
  const init = JSON.stringify({ category: params.category || "", q: params.q || "" }).replace(/</g, "\\u003c");

  // Category is a client-side FILTER of this one page, not a distinct page — so it
  // never becomes a breadcrumb level / H1 / canonical (the active filter shows via
  // the chip + count instead). Canonical always points at the unfiltered /tasks.
  const cr = [{ label: "Home", href: "/" }, { label: "Pre-built tasks" }];
  return (
    head({
      title: "Pre-built tasks | Sokosumi",
      description: "Browse ready-to-run pre-built tasks from Sokosumi's AI coworkers. Filter by category and open any task to see a sample output.",
      path: "/tasks",
      breadcrumb: cr,
    }) +
    header() +
    crumbs(cr) +
    `<main class="container-app">
      <div class="tasks-head page-head" data-reveal>
        <span class="eyebrow">Browse the catalog</span>
        <h1>Pre-built tasks, <span class="serif-accent">ready to run</span></h1>
        <p class="muted" id="taskCount">${hits.length} ready-to-run tasks across ${(catalog.coworkers || []).length} coworkers</p>
        <form class="tasks-search" id="taskSearchForm" role="search">
          <span class="ts-icon">${icon("search", 18)}</span>
          <input id="taskSearch" type="text" placeholder="Search pre-built tasks…" aria-label="Search pre-built tasks" autocomplete="off" />
        </form>
      </div>
      <div class="tasks-filters" id="catChips">${catChips}</div>
      <div class="offers-grid tasks-grid" id="taskGrid">${cards}</div>
      <div class="tasks-empty" id="taskEmpty" hidden>
        <p>No tasks match your filters.</p>
        <button type="button" class="btn btn-outline btn-sm" id="clearFilters">Clear filters</button>
      </div>
      <script>window.__TASK_INIT__=${init};</script>
      <script src="/assets/tasks-filter.js"></script>
    </main>` +
    footer()
  );
}

function renderCoworkerPage(catalog, coworker) {
  const offers = coworker.offers || [];
  const companyRow = coworker.company
    ? `<div class="company-row">${coworker.companyLogo ? `<img src="${attr(coworker.companyLogo)}" alt="${attr(coworker.company)}" />` : ""}<span>${esc(coworker.company)}</span></div>`
    : "";
  const offersSection = offers.length
    ? `<section class="page-section" id="tasks">
        <h2>Pre-built tasks</h2>
        <p class="sub">Ready-to-run work ${esc(coworker.name)} can pick up today. Open one to see what you get.</p>
        <div class="offers-grid">${offers.map((o) => offerCard(coworker, o)).join("")}</div>
      </section>`
    : `<section class="page-section" id="tasks">
        <h2>Pre-built tasks</h2>
        <p class="sub">${esc(coworker.name)}'s ready-to-run tasks are on the way. Start a task in the app to brief ${esc(coworker.name)} directly.</p>
      </section>`;

  const cr = [{ label: "Home", href: "/" }, { label: "Coworkers", href: "/coworkers" }, { label: coworker.name }];
  return (
    head({
      title: `${coworker.name} | ${coworker.role || "AI coworker"} on Sokosumi`,
      description: (coworker.description || `Hire ${coworker.name}, an AI coworker on Sokosumi.`).slice(0, 155),
      path: `/coworkers/${coworker.slug}`,
      ogImage: coworker.image || undefined,
      breadcrumb: cr,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: coworker.name,
        jobTitle: coworker.role || undefined,
        worksFor: coworker.company ? { "@type": "Organization", name: coworker.company } : undefined,
        image: coworker.image || undefined,
        description: coworker.description || undefined,
        url: `${SITE}/coworkers/${coworker.slug}`,
      },
    }) +
    header() +
    crumbs(cr) +
    `<main class="container-app">
      <div class="cw-hero">
        <div class="cw-portrait" data-reveal><span class="inner">${coworker.image ? `<img src="${attr(coworker.image)}" alt="${attr(coworker.name)}" />` : ""}</span></div>
        <div class="cw-info" data-reveal style="--i:1">
          <span class="eyebrow">AI coworker${coworker.company ? " &middot; " + esc(coworker.company) : ""}</span>
          <h1>${esc(coworker.name)}</h1>
          ${coworker.role ? `<div class="role">${esc(coworker.role)}</div>` : ""}
          ${profileTags(coworker)}
          ${coworker.description ? `<p class="cw-desc">${esc(coworker.description)}</p>` : ""}
          <a class="btn btn-primary btn-lg has-orb cw-cta" href="${APP}">Start a task with ${esc(coworker.name)}<span class="orb" aria-hidden="true">${icon("arrow-up-right", 14)}</span></a>
        </div>
      </div>
      ${offersSection}
    </main>` +
    footer()
  );
}

function renderTaskPage(catalog, coworker, offer) {
  const cm = catMeta(offer.category);
  const outs = offerOutputs(offer);
  const om = outputMeta(outs[0].type);
  const outChip = `<span class="chip">${icon(om.icon, 13)}${esc(om.label)}</span>`;
  const catChip = offer.category ? `<span class="kicker">${esc(offer.category)}</span>` : "";
  const openUrl = outs.find((o) => o.url);

  const cr = [
    { label: "Home", href: "/" },
    { label: "Coworkers", href: "/coworkers" },
    { label: coworker.name, href: `/coworkers/${coworker.slug}` },
    { label: offer.title },
  ];
  return (
    head({
      title: `${offer.title} | ${coworker.name} on Sokosumi`,
      description: (offer.description || `${offer.title}, a pre-built task run by ${coworker.name} on Sokosumi.`).slice(0, 155),
      path: `/coworkers/${coworker.slug}/tasks/${offer.slug}`,
      breadcrumb: cr,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: offer.title,
        description: offer.description || undefined,
        category: offer.category || undefined,
        provider: { "@type": "Person", name: coworker.name, url: `${SITE}/coworkers/${coworker.slug}` },
        url: `${SITE}/coworkers/${coworker.slug}/tasks/${offer.slug}`,
      },
    }) +
    header() +
    crumbs(cr) +
    `<main class="container-app">
      <div class="task-layout">
        <div data-reveal>${samplePreview(offer)}</div>
        <aside class="task-side" data-reveal style="--i:1">
          <div>
            <div class="meta-row">${catChip}${outChip}</div>
            <h1 style="margin-top:8px">${esc(offer.title)}</h1>
          </div>
          ${offer.description ? `<p class="lede">${esc(offer.description)}</p>` : ""}
          ${offer.deliverable ? `<div class="deliverable"><div class="label">What you get</div><p>${esc(offer.deliverable)}</p></div>` : ""}
          <div>
            <div class="label muted" style="font-size:12px;font-weight:500;margin-bottom:8px">Delivered by</div>
            <a class="by-row" href="/coworkers/${encodeURIComponent(coworker.slug)}">
              ${avatar(coworker, "")}
              <span class="who">${esc(coworker.name)}<small>${esc(coworker.role || "")}${coworker.company ? " &middot; " + esc(coworker.company) : ""}</small></span>
            </a>
          </div>
          <div class="task-actions">
            <a class="btn btn-primary btn-lg has-orb" href="${APP}">Start this task<span class="orb" aria-hidden="true">${icon("arrow-right", 14)}</span></a>
            ${openUrl ? `<a class="btn btn-outline" href="${attr(openUrl.url)}" target="_blank" rel="noreferrer">Open sample output${icon("arrow-up-right", 14)}</a>` : ""}
          </div>
        </aside>
      </div>
    </main>` +
    footer()
  );
}

function renderNotFound(message) {
  return (
    head({ title: "Not found | Sokosumi", description: "", path: "/404", noindex: true }) +
    header() +
    `<main class="container-app"><div class="notice">
      <h1>We couldn't find that</h1>
      <p>${esc(message || "This page may have moved or the coworker isn't listed yet.")}</p>
      <a class="btn btn-primary" href="/coworkers">Browse coworkers</a>
    </div></main>` +
    footer()
  );
}

function renderRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
}

function renderSitemap(catalog) {
  const urls = ["/", "/coworkers", "/tasks"];
  (catalog.coworkers || []).forEach((c) => {
    urls.push(`/coworkers/${c.slug}`);
    (c.offers || []).forEach((o) => urls.push(`/coworkers/${c.slug}/tasks/${o.slug}`));
  });
  const body = urls.map((u) => `  <url><loc>${esc(SITE + u)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

module.exports = {
  slugify,
  renderCoworkersIndex,
  renderTasksBrowse,
  renderCoworkerPage,
  renderTaskPage,
  renderNotFound,
  renderRobots,
  renderSitemap,
};

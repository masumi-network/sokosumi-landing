// /tasks (browse) and /coworkers/<slug>/tasks/<offerSlug> (detail) — CMS
// `offers` joined with `coworkers` by agentSlug. Every card is server-
// rendered; the browse page filters client-side via /assets/tasks-filter.js
// (category chips + search), so ?category= and ?q= never change the
// canonical, which always points at the unfiltered /tasks.

const shell = require("./shell");
const cms = require("../lib/cms");
const { esc, attr, icon, avatar, outputMeta, markdownLite, pageStart, pageEnd, APP } = shell;

function offerOutputs(offer) {
  const outs = (offer.outputs || []).filter(Boolean);
  return outs.length ? outs : [{ type: "text" }];
}

// ---- sample output renderer (ports the product's OfferEmbed) ----
// Office docs need the Microsoft viewer (the browser would download them);
// PDFs render natively with their chrome hidden; html runs in a sandboxed
// iframe; text renders as a titled document; images show inline.
const OFFICE_EXT = { doc: "docx", slides: "pptx", sheet: "xlsx" };
function isOfficeFile(url) {
  return /\.(pptx?|docx?|xlsx?)(\?|#|$)/i.test(url);
}
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
  const radios = outs
    .map((o, i) => `<input class="embed-radio" type="radio" name="${gid}" id="${gid}-${i}"${i === 0 ? " checked" : ""} />`)
    .join("");
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

// ---- /tasks (browse) ----

function taskCard(offer, coworker) {
  const om = outputMeta(offer.output);
  const href = `/coworkers/${encodeURIComponent(coworker.slug)}/tasks/${encodeURIComponent(offer.slug)}`;
  const searchText = [offer.title, offer.description, offer.category, coworker.name, coworker.role]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return `<a class="offer-card task-hit" href="${attr(href)}" data-cat="${attr(offer.category || "")}" data-out="${attr(offer.output || "text")}" data-text="${attr(searchText)}">
    <div class="offer-meta"><span>${esc(offer.category || "Task")}</span><span class="dot"></span><span>${esc(om.label)}</span></div>
    <div class="offer-title">${esc(offer.title)}</div>
    ${offer.description ? `<div class="offer-desc">${esc(offer.description)}</div>` : ""}
    <div class="offer-foot">${avatar(coworker, "sm")}<span>${esc(coworker.name)}</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
  </a>`;
}

async function browse(ctx) {
  const opts = { draft: ctx.preview };
  const [offers, coworkers] = await Promise.all([cms.getOffers(opts), cms.getCoworkers(opts)]);

  const bySlug = new Map();
  for (const c of coworkers) {
    bySlug.set(c.slug, c);
    if (c.catalogSlug) bySlug.set(c.catalogSlug, c);
  }

  const hits = [];
  for (const o of offers) {
    if (o.active === false) continue;
    const c = bySlug.get(o.agentSlug);
    if (!c) continue;
    hits.push({ o, c });
  }

  const catCounts = {};
  for (const { o } of hits) {
    if (o.category) catCounts[o.category] = (catCounts[o.category] || 0) + 1;
  }
  const cats = Object.entries(catCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const chips =
    `<button type="button" class="fchip" data-cat="">All <span>${hits.length}</span></button>` +
    cats.map(([name, n]) => `<button type="button" class="fchip" data-cat="${attr(name)}">${esc(name)} <span>${n}</span></button>`).join("");

  const coworkerCount = new Set(hits.map(({ c }) => c.slug)).size;
  const countLine = `${hits.length} ready-to-run task${hits.length === 1 ? "" : "s"} across ${coworkerCount} coworker${coworkerCount === 1 ? "" : "s"}`;

  const q = ctx.query || {};
  const getQ = (k) => (typeof q.get === "function" ? q.get(k) : q[k]) || "";
  const init = JSON.stringify({ category: getQ("category"), q: getQ("q") }).replace(/</g, "\\u003c");

  const cr = [{ label: "Home", href: "/" }, { label: "Template tasks" }];
  return (
    pageStart({
      title: "Template tasks | Sokosumi",
      description:
        "Browse ready-to-run template tasks from Sokosumi's AI coworkers. Filter by category and open any task to see a sample output.",
      path: "/tasks",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>Template tasks, ready to run</h1>
      <p class="sub">Every task is a fixed brief with a clear deliverable and a sample output you can inspect before you start. Pick one, add your details, and the coworker takes it from there.</p>
      <p class="muted" id="taskCount">${countLine}</p>
      <form class="tasks-search" id="taskSearchForm" role="search">
        <span class="ts-icon">${icon("search", 18)}</span>
        <input id="taskSearch" type="text" placeholder="Search template tasks…" aria-label="Search template tasks" autocomplete="off" />
      </form>
    </div>` +
    (hits.length
      ? `<div class="page-section flush">
          <div class="tasks-filters" id="catChips">${chips}</div>
          <div class="offers-grid tasks-grid" id="taskGrid">${hits.map(({ o, c }) => taskCard(o, c)).join("")}</div>
          <div class="tasks-empty" id="taskEmpty" hidden>
            <p>No tasks match your filters.</p>
            <button type="button" class="btn btn-outline btn-sm" id="clearFilters">Clear filters</button>
          </div>
          <script>window.__TASK_INIT__=${init};</script>
          <script src="/assets/tasks-filter.js"></script>
        </div>`
      : `<div class="page-section flush"><p class="muted">Template tasks are on the way. In the meantime, <a href="/coworkers" style="text-decoration:underline">meet the coworkers</a>.</p></div>`) +
    shell.ctaBand({
      heading: "Run your first task today",
      subheading: "Pick a template, add your brief, and get the finished file back. Signing up is free.",
      ctaLabel: "Start free",
      seed: hits.length,
    }) +
    pageEnd()
  );
}

// ---- /coworkers/<slug>/tasks/<offerSlug> (detail) ----

async function detail(ctx) {
  const opts = { draft: ctx.preview };
  const c = await cms.getCoworker(ctx.params.slug, opts);
  if (!c || c.active === false) return null;
  // Offers join on the product's slug (catalogSlug), not the public one.
  const offer = await cms.getOffer(c.catalogSlug || c.slug, ctx.params.offerSlug, opts);
  if (!offer || offer.active === false) return null;

  const outs = offerOutputs(offer);
  const om = outputMeta(offer.output || outs[0].type);
  const openUrl = outs.find((o) => o && o.url);
  const vn = c.vendor && typeof c.vendor === "object" ? c.vendor.name : null;
  const whoSmall = [c.role, vn].filter(Boolean).map(esc).join(" &middot; ");

  const cr = [
    { label: "Home", href: "/" },
    { label: "Coworkers", href: "/coworkers" },
    { label: c.name, href: `/coworkers/${c.slug}` },
    { label: offer.title },
  ];
  return (
    pageStart({
      title: `${offer.title} | ${c.name} on Sokosumi`,
      description: (offer.description || `${offer.title}, a template task run by ${c.name} on Sokosumi.`).slice(0, 155),
      path: `/coworkers/${c.slug}/tasks/${offer.slug}`,
      breadcrumb: cr,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: offer.title,
        description: offer.description || undefined,
        category: offer.category || undefined,
        provider: { "@type": "Person", name: c.name, url: `${shell.SITE}/coworkers/${c.slug}` },
        url: `${shell.SITE}/coworkers/${c.slug}/tasks/${offer.slug}`,
      },
    }) +
    `<div class="task-layout">
      <div data-reveal>${samplePreview(offer)}</div>
      <aside class="task-side" data-reveal style="--i:1">
        <div>
          <div class="meta-row">${offer.category ? `<span class="kicker">${esc(offer.category)}</span>` : ""}<span class="chip">${icon(om.icon, 13)}${esc(om.label)}</span></div>
          <h1 style="margin-top:8px">${esc(offer.title)}</h1>
        </div>
        ${offer.description ? `<p class="lede">${esc(offer.description)}</p>` : ""}
        ${offer.deliverable ? `<div class="deliverable"><div class="label">What you get</div><p>${esc(offer.deliverable)}</p></div>` : ""}
        ${offer.prompt ? `<div class="prompt-box"><div class="label">The briefing template</div><pre>${esc(offer.prompt)}</pre></div>` : ""}
        <div>
          <div class="kicker" style="margin-bottom:8px">Delivered by</div>
          <a class="by-row" href="/coworkers/${encodeURIComponent(c.slug)}">
            ${avatar(c, "")}
            <span class="who">${esc(c.name)}${whoSmall ? `<small>${whoSmall}</small>` : ""}</span>
          </a>
        </div>
        <div class="task-actions">
          <a class="btn btn-primary btn-lg" href="${APP}">Try this task on Sokosumi</a>
          ${openUrl ? `<a class="btn btn-outline" href="${attr(openUrl.url)}" target="_blank" rel="noreferrer">Open sample output ${icon("arrow-up-right", 14)}</a>` : ""}
          ${shell.NO_CARD}
        </div>
      </aside>
    </div>` +
    shell.ctaBand({
      heading: `Run "${offer.title}" with ${c.name}`,
      subheading: "Pick a template, add your brief, and collect the finished file.",
      ctaLabel: "Try this task free",
      seed: offer.title.length,
    }) +
    pageEnd()
  );
}

module.exports = { browse, detail };

// /tasks (browse) and /ai-coworkers/<slug>/tasks/<offerSlug> (detail) — CMS
// `offers` joined with `coworkers` by agentSlug. Every card is server-
// rendered; the browse page filters client-side via /assets/tasks-filter.js
// (category chips + search), so ?category= and ?q= never change the
// canonical, which always points at the unfiltered /tasks.

const shell = require("./shell");
const cms = require("../lib/cms");
const { t, tp, locale } = require("../lib/i18n");
const { esc, attr, icon, avatar, outputMeta, markdownLite, pageStart, pageEnd, APP, APP_SIGNUP } = shell;

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

// Remote samples (IPFS pins, the Office viewer) can take seconds, and a bare
// lazy iframe looks like a hung panel until then. Each img/iframe embed gets a
// veil on top: the asset's own load event lifts it (an inline handler, so it
// needs no external JS and cannot break the CSS-only tabs), and a delayed CSS
// animation lifts it anyway after 15s if the load never fires — a dead pin or
// a blocked viewer must not spin forever. With JS off, a <noscript> rule in
// samplePreview() hides the veil outright and the embed shows as before.
const LIFT_VEIL = ` onload="this.parentElement.removeAttribute('data-loading')"`;
function withVeil(inner) {
  return `<div class="embed-wrap" data-loading>
    <div class="embed-loading" aria-hidden="true"><span class="embed-spinner"></span><span>${esc(t("Loading the sample…"))}</span></div>
    ${inner}
  </div>`;
}

// Render a single output into the preview panel.
function embedOutput(output, title) {
  const type = output.type || "text";
  const url = output.url;
  const text = output.text;
  if (url && type === "image") {
    return withVeil(
      `<img class="embed-image" src="${attr(url)}" alt="${attr(title)}" loading="lazy"${LIFT_VEIL} onerror="this.parentElement.removeAttribute('data-loading')" />`,
    );
  }
  if (type === "html" && (text || url)) {
    const s = text ? ` srcdoc="${attr(text)}"` : ` src="${attr(url)}"`;
    return withVeil(
      `<iframe class="embed-frame" title="${attr(title)}" sandbox="allow-scripts" loading="lazy"${LIFT_VEIL}${s}></iframe>`,
    );
  }
  if (url) {
    const src =
      type in OFFICE_EXT || isOfficeFile(url)
        ? officeViewerUrl(url, type)
        : url + "#toolbar=0&navpanes=0&scrollbar=0&view=FitH";
    return withVeil(`<iframe class="embed-frame" title="${attr(title)}" src="${attr(src)}" loading="lazy"${LIFT_VEIL}></iframe>`);
  }
  if (text) {
    return `<div class="embed-doc-scroll"><article class="task-doc">
      <div class="task-doc-head">${icon("file-text", 16)}<span>${esc(output.label || title)}</span></div>
      <div class="task-doc-body">${markdownLite(text)}</div>
    </article></div>`;
  }
  return `<div class="embed-empty">${icon("file-text", 28)}<span>${esc(t("The sample output is generated when you run this task."))}</span></div>`;
}

// Without JS the veil's inline lift never runs; hide the veil so the embed
// (which renders fine on its own) is never covered.
const VEIL_NOSCRIPT = `<noscript><style>.embed-loading{display:none}</style></noscript>`;

// Preview shell — one output fills the frame; multiple outputs get CSS-only tabs.
function samplePreview(offer) {
  const outs = offerOutputs(offer);
  if (outs.length <= 1) {
    return `<div class="task-preview">${VEIL_NOSCRIPT}${embedOutput(outs[0], offer.title)}</div>`;
  }
  const gid = "out";
  // Per-radio rules: checked drives which panel shows and which label reads
  // selected; focus-visible paints the ring on the VISIBLE label — the radio
  // itself is transparent, so without this keyboard focus has no indicator.
  const rules = outs
    .map(
      (o, i) =>
        `#${gid}-${i}:checked~.embed-panels>.embed-panel:nth-child(${i + 1}){display:block}` +
        `#${gid}-${i}:checked~.embed-tabs>label[for="${gid}-${i}"]{background:var(--foreground);color:#fff}` +
        `#${gid}-${i}:focus-visible~.embed-tabs>label[for="${gid}-${i}"]{outline:2px solid var(--primary);outline-offset:2px}`,
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
  // The fieldset/legend names the radio group for assistive tech ("Sample
  // output" + the labels), while radios, tabs, and panels stay siblings so
  // the ~ combinator selectors above keep working without any JS.
  return `<div class="task-preview has-tabs">
    ${VEIL_NOSCRIPT}<style>.embed-panels>.embed-panel{display:none}${rules}</style>
    <fieldset class="embed-tabset">
      <legend class="sr-only">${esc(t("Sample outputs for this task"))}</legend>
      ${radios}<div class="embed-tabs">${tabs}</div><div class="embed-panels">${panels}</div>
    </fieldset>
  </div>`;
}

// ---- /tasks (browse) ----

function taskCard(offer, coworker) {
  const om = outputMeta(offer.output);
  const href = `/ai-coworkers/${encodeURIComponent(coworker.slug)}/tasks/${encodeURIComponent(offer.slug)}`;
  const searchText = [offer.title, offer.description, offer.category, coworker.name, coworker.role]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return `<a class="offer-card task-hit" href="${attr(href)}" data-cat="${attr(offer.category || "")}" data-out="${attr(offer.output || "text")}" data-text="${attr(searchText)}">
    <div class="offer-meta"><span>${esc(offer.category ? t(offer.category) : t("Task"))}</span><span class="offer-type" data-out="${attr(offer.output || "text")}">${icon(om.icon, 12)}${esc(om.label)}</span></div>
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
    `<button type="button" class="fchip" data-cat="">${esc(t("All"))} <span>${hits.length}</span></button>` +
    cats.map(([name, n]) => `<button type="button" class="fchip" data-cat="${attr(name)}">${esc(t(name))} <span>${n}</span></button>`).join("");

  const coworkerCount = new Set(hits.map(({ c }) => c.slug)).size;
  const countLine = tp(
    hits.length,
    "{n} ready-to-run task across {c} coworker",
    "{n} ready-to-run tasks across {c} coworkers",
    { c: coworkerCount },
  );

  const q = ctx.query || {};
  const getQ = (k) => (typeof q.get === "function" ? q.get(k) : q[k]) || "";
  const init = JSON.stringify({ category: getQ("category"), q: getQ("q") }).replace(/</g, "\\u003c");

  const cr = [{ label: "Home", href: "/" }, { label: "Template tasks" }];
  return (
    pageStart({
      title: "Template tasks | Sokosumi",
      description:
        "Browse ready-to-run template tasks from Sokosumi's AI coworkers. Filter by category and open any task to see its brief and deliverable.",
      path: "/tasks",
      breadcrumb: cr,
      jsonld: shell.itemListLd(
        "Template tasks on Sokosumi",
        "/tasks",
        hits.map(({ o, c }) => ({ name: o.title, path: `/ai-coworkers/${c.slug}/tasks/${o.slug}` })),
      ),
    }) +
    `<div class="page-head" data-reveal>
      <h1>${esc(t("Template tasks, ready to run"))}</h1>
      <p class="sub">${esc(t("Every task is a fixed brief with a clear deliverable, and most include a sample output you can inspect before you start. Pick one, add your details, and the coworker takes it from there."))}</p>
      <p class="muted" id="taskCount">${esc(countLine)}</p>
      <form class="tasks-search" id="taskSearchForm" role="search">
        <span class="ts-icon">${icon("search", 18)}</span>
        <input id="taskSearch" type="text" placeholder="${attr(t("Search template tasks…"))}" aria-label="${attr(t("Search template tasks"))}" autocomplete="off" />
      </form>
    </div>` +
    (hits.length
      ? `<div class="page-section flush">
          <div class="tasks-filters" id="catChips">${chips}</div>
          <div class="offers-grid tasks-grid" id="taskGrid">${hits.map(({ o, c }) => taskCard(o, c)).join("")}</div>
          <div class="tasks-empty" id="taskEmpty" hidden>
            <p>${esc(t("No tasks match your filters."))}</p>
            <button type="button" class="btn btn-outline btn-sm" id="clearFilters">${esc(t("Clear filters"))}</button>
          </div>
          <script>window.__TASK_INIT__=${init};</script>
          <script src="/assets/tasks-filter.js"></script>
        </div>`
      : `<div class="page-section flush"><p class="muted">${esc(t("Template tasks are on the way. In the meantime,"))} <a href="/ai-coworkers" style="text-decoration:underline">${esc(t("meet the coworkers"))}</a>.</p></div>`) +
    shell.logoRow() +
    shell.ctaBand({
      heading: t("Run your first task today"),
      subheading: t("Pick a template, add your brief, and get the finished file back. Signing up is free."),
      ctaLabel: t("Start free"),
      seed: hits.length,
    }) +
    pageEnd()
  );
}

// ---- "What you get" (detail sidebar) ----
// The CMS `deliverable` is a short phrase at best and empty on many offers,
// so this section never leans on it alone: it is composed from what every
// offer reliably has — the output type, the sample outputs rendered on this
// page, and the coworker who runs it. Nothing here claims more than the data
// states. `longDeliverable` is a proposed editorial CMS field; the moment it
// exists it becomes the lead paragraph with no markup change.
const OUTPUT_PHRASE = {
  pdf: "a finished PDF, ready to share or print",
  doc: "an editable document file",
  slides: "a slide deck",
  sheet: "a spreadsheet",
  image: "an image file",
  text: "a written text deliverable",
  html: "a working web page that runs in your browser",
};

function whatYouGet(offer, c, om, outs) {
  const lead = offer.longDeliverable || offer.deliverable || "";
  const samples = outs.filter((o) => o && (o.url || o.text));
  const many = samples.length > 1;
  // The label list is dropped from the German sentence shape; both locales
  // read naturally without contorting the grammar around an inline list.
  const sampleLine = samples.length
    ? t(
        many
          ? "Real samples are on this page, so you can inspect the output before you run the task."
          : "A real sample is on this page, so you can inspect the output before you run the task.",
      )
    : t("The sample output appears on this page after the task's first run.");
  const phrase = t(OUTPUT_PHRASE[offer.output] || OUTPUT_PHRASE[outs[0].type] || OUTPUT_PHRASE.text);
  const who = c.role ? `${c.name}, ${c.role}` : c.name;
  const facts = [
    `<li>${icon(om.icon, 15)}<span>${esc(t("Delivered as {what}.", { what: phrase }))}</span></li>`,
    `<li>${icon("search", 15)}<span>${esc(sampleLine)}</span></li>`,
    `<li>${icon("check", 15)}<span>${esc(t("A fixed brief run by {who} — add your details and collect the finished file from your task board.", { who }))}</span></li>`,
  ];
  return `<div class="deliverable wyg">
    <div class="label">${esc(t("What you get"))}</div>
    ${lead ? `<p class="wyg-lead">${esc(lead)}</p>` : ""}
    <ul class="wyg-facts">${facts.join("")}</ul>
  </div>`;
}

// The task as attribute/value pairs — the same facts the card and the
// "what you get" block state, in the one structure people and retrieval
// systems read identically. Only what the catalog provides; nothing inferred.
function taskFacts(offer, c, om, vn, vs) {
  const rows = [[t("Type"), t("Template task")]];
  rows.push([t("Run by"), `<a href="/ai-coworkers/${encodeURIComponent(c.slug)}">${esc(c.name)}</a>${c.role ? `, ${esc(c.role)}` : ""}`]);
  if (vn) rows.push([t("Vendor"), vs ? `<a href="/vendors/${encodeURIComponent(vs)}">${esc(vn)}</a>` : esc(vn)]);
  if (offer.category) rows.push([t("Category"), esc(t(offer.category))]);
  rows.push([t("Output format"), esc(om.label)]);
  if (offer.deliverable) rows.push([t("Deliverable"), esc(offer.deliverable)]);
  rows.push([t("Marketplace"), `<a href="/">Sokosumi</a>`]);
  const synced = offer.syncedAt || offer.updatedAt;
  if (synced) {
    const d = new Date(synced);
    const label = new Intl.DateTimeFormat(locale() === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
    rows.push([t("Task data as of"), `<time datetime="${d.toISOString().slice(0, 10)}">${esc(label)}</time>`]);
  }
  return `<section class="task-facts">
        <h2 class="kicker" style="margin-bottom:8px">${esc(t("{title} at a glance", { title: offer.title }))}</h2>
        <dl class="data-grid">${rows.map(([k, v]) => `<div class="dg-row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>
      </section>`;
}

// ---- /ai-coworkers/<slug>/tasks/<offerSlug> (detail) ----

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
  const vs = c.vendor && typeof c.vendor === "object" ? c.vendor.slug : null;
  const whoSmall = [c.role, vn].filter(Boolean).map(esc).join(" &middot; ");

  const cr = [
    { label: "Home", href: "/" },
    { label: "AI Coworkers", href: "/ai-coworkers" },
  ];
  if (vn) cr.push(vs ? { label: vn, href: `/vendors/${encodeURIComponent(vs)}` } : { label: vn });
  cr.push({ label: c.name, href: `/ai-coworkers/${c.slug}` }, { label: offer.title });
  return (
    pageStart({
      title: t("{name} | {role}", { name: offer.title, role: c.name }),
      description: shell.describe(offer.description || t("{title}, a template task run by {name} on Sokosumi.", { title: offer.title, name: c.name }), t("A template task by {name} on Sokosumi: brief it in plain language, follow it on the board, get the file back.", { name: c.name })),
      path: `/ai-coworkers/${c.slug}/tasks/${offer.slug}`,
      breadcrumb: cr,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: offer.title,
        description: offer.description || undefined,
        category: offer.category || undefined,
        provider: { "@id": `${shell.SITE}/ai-coworkers/${c.slug}#app` },
        url: `${shell.SITE}/ai-coworkers/${c.slug}/tasks/${offer.slug}`,
      },
    }) +
    `<div class="task-layout">
      <div data-reveal>${samplePreview(offer)}</div>
      <aside class="task-side" data-reveal style="--i:1">
        <div>
          <div class="meta-row">${offer.category ? `<span class="kicker">${esc(t(offer.category))}</span>` : ""}<span class="offer-type" data-out="${attr(offer.output || outs[0].type || "text")}">${icon(om.icon, 13)}${esc(om.label)}</span></div>
          <h1 style="margin-top:8px">${esc(offer.title)}</h1>
        </div>
        ${offer.description ? `<p class="lede">${esc(offer.description)}</p>` : ""}
        ${whatYouGet(offer, c, om, outs)}
        ${taskFacts(offer, c, om, vn, vs)}
        <div>
          <div class="kicker" style="margin-bottom:8px">${esc(t("Delivered by"))}</div>
          <a class="by-row" href="/ai-coworkers/${encodeURIComponent(c.slug)}">
            ${avatar(c, "")}
            <span class="who">${esc(c.name)}${whoSmall ? `<small>${whoSmall}</small>` : ""}</span>
          </a>
        </div>
        <div class="task-actions">
          <a class="btn btn-primary btn-lg" href="${APP_SIGNUP}" data-analytics="sign_up_click" data-analytics-location="task_detail">${esc(t("Try this task on Sokosumi"))}</a>
          ${openUrl ? `<a class="btn btn-outline" href="${attr(openUrl.url)}" target="_blank" rel="noreferrer">${esc(t("Open sample output"))} ${icon("arrow-up-right", 14)}</a>` : ""}
          ${shell.NO_CARD}
        </div>
      </aside>
    </div>` +
    shell.logoRow() +
    shell.ctaBand({
      heading: t('Run "{title}" with {name}', { title: offer.title, name: c.name }),
      subheading: t("Pick a template, add your brief, and collect the finished file."),
      ctaLabel: t("Try this task free"),
      seed: offer.title.length,
    }) +
    pageEnd()
  );
}

module.exports = { browse, detail };

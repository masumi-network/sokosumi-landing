// /guides (index) and /guides/<slug> (detail) — CMS `guides` collection.
// contentHtml is pre-rendered by the CMS at save time.

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const i18n = require("../lib/i18n");
const { t } = i18n;
const { esc, attr, icon, pageStart, pageEnd } = shell;

const CATEGORY_LABELS = {
  "getting-started": "Getting started",
  integrations: "Integrations",
  workflows: "Workflows",
  advanced: "Advanced",
};

// "How to use <tool> for <job>" guides: CMS guides whose slug is listed in
// content/tool-guides.json. The JSON adds what the CMS lacks: the tool's
// logo key (shared with the comparison pages), the job, and the matching
// Sokosumi-vs page for the bridge at the end.
const fs = require("fs");
const path = require("path");
const pairs = require("./comparePairs");
const TOOL_GUIDES = path.join(__dirname, "..", "content", "tool-guides.json");
let tgCache = { at: 0, map: new Map() };
function toolGuides() {
  if (Date.now() - tgCache.at < 60000) return tgCache.map;
  let list = [];
  try {
    list = JSON.parse(fs.readFileSync(TOOL_GUIDES, "utf8")).guides || [];
  } catch {}
  tgCache = { at: Date.now(), map: new Map(list.map((x) => [x.slug, x])) };
  return tgCache.map;
}
const toolMeta = (g) => toolGuides().get(g.slug) || null;

function toolLogo(tg, size) {
  const url = pairs.logoUrl(tg.tool.key);
  return url
    ? `<img src="${attr(url)}" alt="${attr(tg.tool.name)}" width="${size}" height="${size}" loading="lazy">`
    : `<b>${esc(tg.tool.name.slice(0, 1))}</b>`;
}

function toolGuideCard(g) {
  const tg = toolMeta(g);
  return `<a class="card tg-card" href="/guides/${encodeURIComponent(g.slug)}">
    <span class="tg-logo">${toolLogo(tg, 28)}<span>${esc(tg.tool.name)}</span></span>
    <h3>${esc(g.title)}</h3>
    <p>${esc(g.description || "")}</p>
    <div class="card-foot"><span>${esc(t("Read the guide"))}</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
  </a>`;
}

// Table of contents from the rendered h2s (ids are added on the way out).
function toc(html) {
  const items = [];
  const out = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, a, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = "s-" + text.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
    items.push({ id, text });
    return `<h2 id="${id}"${a}>${inner}</h2>`;
  });
  return { html: out, items };
}

function toolBridge(tg, g) {
  const cmp = tg.compare ? `/compare/${tg.compare}` : "/compare";
  return `<section class="page-section tg-bridge" data-reveal>
    <div class="pair-bridge-box">
      <div class="pair-bridge-head"><span class="eyebrow">${esc(t("When you outgrow it"))}</span><span class="cmp-mark cmp-mark-logo"><img src="/assets/apple-touch-icon.png" alt="" width="24" height="24">Sokosumi</span></div>
      <h2>${esc(t("{tool} gives one person a place to prompt. Sokosumi gives the team a file back.", { tool: tg.tool.name }))}</h2>
      <p>${esc(t("Everything above still needs someone to write the prompt, check the answer and paste it somewhere. On Sokosumi you brief a named coworker for the same job; the task shows on a shared board and comes back as a PDF, deck, spreadsheet or dashboard. Credits are only used when a task runs, and the free plan needs no card."))}</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="${attr(shell.APP_SIGNUP)}" data-analytics="sign_up_click" data-analytics-location="tool_guide_bridge">${esc(t("Start free"))}</a>
        <a class="btn btn-outline" href="${attr(cmp)}">${esc(t("Compare {name} with alternatives", { name: tg.tool.name }))}</a>
        ${tg.coworker ? `<a class="btn btn-outline" href="/ai-coworkers/${attr(tg.coworker)}">${esc(t("Meet the coworker for this job"))}</a>` : ""}
      </div>
    </div>
  </section>`;
}

function guideRow(g) {
  return `<a class="row-item" href="/guides/${encodeURIComponent(g.slug)}">
    <h3>${esc(g.title)}</h3>
    <p>${esc(g.description || "")}</p>
    <span class="row-go">${esc(t("Read"))} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function index(ctx) {
  const guides = await cms.getGuides({ draft: ctx.preview });
  const tool = guides.filter((g) => toolMeta(g));
  const byTool = new Map();
  for (const g of tool) {
    const k = toolMeta(g).tool.name;
    if (!byTool.has(k)) byTool.set(k, []);
    byTool.get(k).push(g);
  }
  const toolSection = tool.length
    ? `<div class="page-section tg-index" id="tool-guides">
      <div class="blk-head"><h2>${esc(t("How to use AI tools for marketing and sales"))}</h2><p class="sub">${esc(t("Honest how-tos for the tools you already have: what each one does well for a marketing job, real prompts, real limits, and where a coworker takes over."))}</p></div>
      ${[...byTool.entries()].map(([name, list]) => `<h3 class="tg-tool-head">${esc(name)}</h3><div class="${shell.gridCls(list.length)}">${list.map(toolGuideCard).join("")}</div>`).join("")}
    </div>`
    : "";
  const byCat = new Map();
  for (const g of guides) {
    if (toolMeta(g)) continue;
    const key = g.category || "getting-started";
    if (!byCat.has(key)) byCat.set(key, []);
    byCat.get(key).push(g);
  }

  const sections = [...byCat.entries()]
    .map(
      ([cat, list]) => `<div class="page-section">
      <h2>${esc(t(CATEGORY_LABELS[cat] || cat))}</h2>
      <div class="row-list">${list.map(guideRow).join("")}</div>
    </div>`,
    )
    .join("");

  const cr = [{ label: "Home", href: "/" }, { label: "Guides" }];
  return (
    pageStart({
      title: t("Guides to AI marketing and AI coworkers | Sokosumi"),
      description: t("Guides for marketing teams on Sokosumi: set up a workspace, write a briefing that works, run and schedule AI coworkers, use the files that come back."),
      path: "/guides",
      breadcrumb: cr,
      jsonld: shell.itemListLd("Sokosumi guides", "/guides", guides.map((g) => ({ name: g.title, path: `/guides/${g.slug}` }))),
    }) +
    `<div class="page-head" data-reveal>
      <h1>${esc(t("Guides"))}</h1>
      <p class="sub">${esc(t("Instructions for AI coworkers, from the first briefing to recurring workflows."))}</p>
    </div>
    <section class="page-section flush" data-reveal>
      <div class="shot-split">
        <div class="copy">
          <h2>${esc(t("It starts with one good brief"))}</h2>
          <p>${esc(t("Say what you want done in plain language. Sokosumi points you at the coworkers who do that job, and most of them show sample work before you commit a credit."))}</p>
          <a class="btn btn-outline" href="/tasks">${esc(t("Browse template tasks"))}</a>
        </div>
        ${shell.shotFigure(shell.SHOTS.brief, { caption: false })}
      </div>
    </section>` +
    (guides.length
      ? toolSection + sections
      : `<div class="page-section flush"><p class="muted">${esc(t("Guides are on the way. In the meantime,"))} <a href="/ai-coworkers" style="text-decoration:underline">${esc(t("meet the coworkers"))}</a>.</p></div>`) +
    shell.logoRow() +
    shell.ctaBand({
      heading: t("Run a task from a guide"),
      subheading: t("Create a free account, choose a task, and apply the instructions."),
      ctaLabel: t("Start free"),
      seed: guides.length,
    }) +
    pageEnd()
  );
}

// Reading time from the rendered text (200 words a minute) and the last
// edit, so a reader knows what they are getting into before they scroll.
function guideMeta(g) {
  const words = String(g.contentHtml || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  const parts = [t("{n} min read", { n: mins })];
  if (g.updatedAt) {
    const d = new Date(g.updatedAt);
    parts.push(t("Updated {date}", { date: new Intl.DateTimeFormat(i18n.locale() === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d) }));
  }
  return `<p class="guide-meta">${parts.map((x) => `<span>${esc(x)}</span>`).join("")}</p>`;
}

async function detail(ctx) {
  const g = await cms.getGuide(ctx.params.slug, { draft: ctx.preview });
  if (!g) return null;
  const related = (g.related || []).filter((r) => typeof r === "object" && r.slug);
  const coverUrl = cms.mediaUrl(g.coverImage);
  const cover = coverUrl
    ? `<div class="post-cover" data-reveal><img src="${attr(coverUrl)}" alt="${attr(g.title)}" width="1600" height="900" loading="eager" fetchpriority="high" decoding="async" /></div>`
    : "";

  const cr = [{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: g.title }];
  const tg = toolMeta(g);
  const body = toc(g.contentHtml || "");
  const siblings = tg
    ? (await cms.getGuides({ draft: ctx.preview })).filter((x) => x.slug !== g.slug && toolMeta(x) && (toolMeta(x).tool.key === tg.tool.key || toolMeta(x).job === tg.job)).slice(0, 3)
    : [];
  return (
    pageStart({
      title: g.title,
      description: shell.describe(g.description, t("A Sokosumi guide for marketing teams: what to do, in which order, with examples.")),
      path: `/guides/${g.slug}`,
      og: tg
        ? { type: "pair", a: tg.tool.name, b: "Sokosumi", logoA: pairs.logoUrl(tg.tool.key) || "", logoB: `${shell.SITE}/assets/apple-touch-icon.png`, title: g.title, sub: g.description || "" }
        : { type: "article", eyebrow: t("Guide"), title: g.title, sub: g.description || "", img: coverUrl || "" },
      breadcrumb: cr,
      article: { published: g.publishedAt || g.createdAt || undefined, modified: g.updatedAt || undefined },
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${shell.SITE}/guides/${g.slug}#article`,
        headline: g.title,
        description: g.description || undefined,
        datePublished: g.publishedAt || g.createdAt || undefined,
        dateModified: g.updatedAt || undefined,
        author: { "@id": `${shell.SITE}/#organization` },
        publisher: { "@id": `${shell.SITE}/#organization` },
        image: coverUrl || undefined,
        mainEntityOfPage: { "@type": "WebPage", "@id": `${shell.SITE}/guides/${g.slug}` },
        isPartOf: { "@id": `${shell.SITE}/#website` },
        url: `${shell.SITE}/guides/${g.slug}`,
      },
    }) +
    `<div class="page-head" data-reveal>
      ${tg ? `<span class="tg-head-logo">${toolLogo(tg, 40)}<span>${esc(t("{tool} guide", { tool: tg.tool.name }))}</span></span>` : `<span class="eyebrow">${esc(t(CATEGORY_LABELS[g.category] || "Guide"))}</span>`}
      <h1>${esc(g.title)}</h1>
      ${g.description ? `<p class="sub">${esc(g.description)}</p>` : ""}
      ${guideMeta(g)}
    </div>
    ${cover}
    ${tg && body.items.length > 2 ? `<nav class="tg-toc" aria-label="${attr(t("In this guide"))}"><span class="tg-toc-label">${esc(t("In this guide"))}</span><ol>${body.items.map((it) => `<li><a href="#${it.id}">${esc(it.text)}</a></li>`).join("")}</ol></nav>` : ""}
    <article class="page-section flush${tg ? " tg-article" : ""}" data-reveal>
      <div class="prose">${body.html}</div>
    </article>
    ${tg ? toolBridge(tg, g) : ""}
    ${blocks.renderBlocks(g.sections)}` +
    (siblings.length
      ? `<section class="page-section"><h2>${esc(t("More guides like this"))}</h2><div class="${shell.gridCls(siblings.length)}">${siblings.map(toolGuideCard).join("")}</div></section>`
      : "") +
    (related.length
      ? `<section class="page-section">
          <h2>${esc(t("Related guides"))}</h2>
          <div class="row-list">${related.map(guideRow).join("")}</div>
        </section>`
      : "") +
    shell.logoRow() +
    shell.ctaBand({
      heading: t("Put this into practice"),
      subheading: t("Brief a coworker with what you just read and see what comes back. Signing up is free."),
      ctaLabel: t("Start free"),
      seed: g.title.length,
    }) +
    pageEnd()
  );
}

module.exports = { index, detail };

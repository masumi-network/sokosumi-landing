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

function guideRow(g) {
  return `<a class="row-item" href="/guides/${encodeURIComponent(g.slug)}">
    <h3>${esc(g.title)}</h3>
    <p>${esc(g.description || "")}</p>
    <span class="row-go">${esc(t("Read"))} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function index(ctx) {
  const guides = await cms.getGuides({ draft: ctx.preview });
  const byCat = new Map();
  for (const g of guides) {
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
      title: "Guides | Sokosumi",
      description: "Instructions for setting up, briefing, and running AI coworkers on Sokosumi.",
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
      ? sections
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
  return (
    pageStart({
      title: t("{title} | Sokosumi guides", { title: g.title }),
      description: (g.description || "").slice(0, 155),
      path: `/guides/${g.slug}`,
      og: { type: "article", eyebrow: t("Guide"), title: g.title, sub: g.description || "", img: coverUrl || "" },
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
      <span class="eyebrow">${esc(t(CATEGORY_LABELS[g.category] || "Guide"))}</span>
      <h1>${esc(g.title)}</h1>
      ${g.description ? `<p class="sub">${esc(g.description)}</p>` : ""}
      ${guideMeta(g)}
    </div>
    ${cover}
    <article class="page-section flush" data-reveal>
      <div class="prose">${g.contentHtml || ""}</div>
    </article>
    ${blocks.renderBlocks(g.sections)}` +
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

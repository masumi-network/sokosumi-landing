// /guides (index) and /guides/<slug> (detail) — CMS `guides` collection.
// contentHtml is pre-rendered by the CMS at save time.

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
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
    <span class="row-go">Read ${icon("arrow-up-right", 15)}</span>
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
      <h2>${esc(CATEGORY_LABELS[cat] || cat)}</h2>
      <div class="row-list">${list.map(guideRow).join("")}</div>
    </div>`,
    )
    .join("");

  const cr = [{ label: "Home", href: "/" }, { label: "Guides" }];
  return (
    pageStart({
      title: "Guides | Sokosumi",
      description: "How to get the most out of your AI coworkers: setup, workflows, and advanced patterns.",
      path: "/guides",
      breadcrumb: cr,
      jsonld: shell.itemListLd("Sokosumi guides", "/guides", guides.map((g) => ({ name: g.title, path: `/guides/${g.slug}` }))),
    }) +
    `<div class="page-head" data-reveal>
      <h1>Guides</h1>
      <p class="sub">How to get the most out of your AI coworkers, from the first briefing to advanced workflows.</p>
    </div>
    <section class="page-section flush" data-reveal>
      <div class="shot-split">
        <div class="copy">
          <h2>It starts with one good brief</h2>
          <p>Say what you want done in plain language. Sokosumi points you at the coworkers who do that job, and every one of them shows the work before you commit a credit.</p>
          <a class="btn btn-outline" href="/tasks">Browse template tasks</a>
        </div>
        ${shell.shotFigure(shell.SHOTS.brief, { caption: false })}
      </div>
    </section>` +
    (guides.length
      ? sections
      : `<div class="page-section flush"><p class="muted">Guides are on the way. In the meantime, <a href="/coworkers" style="text-decoration:underline">meet the coworkers</a>.</p></div>`) +
    shell.ctaBand({
      heading: "Try it on a real task",
      subheading: "The fastest way through any guide is to run the thing it describes. Signing up is free.",
      ctaLabel: "Start free",
      seed: guides.length,
    }) +
    pageEnd()
  );
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
      title: `${g.title} | Sokosumi guides`,
      description: (g.description || "").slice(0, 155),
      path: `/guides/${g.slug}`,
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
      <span class="eyebrow">${esc(CATEGORY_LABELS[g.category] || "Guide")}</span>
      <h1>${esc(g.title)}</h1>
      ${g.description ? `<p class="sub">${esc(g.description)}</p>` : ""}
    </div>
    ${cover}
    <article class="page-section flush" data-reveal>
      <div class="prose">${g.contentHtml || ""}</div>
    </article>
    ${blocks.renderBlocks(g.sections)}` +
    (related.length
      ? `<section class="page-section">
          <h2>Related guides</h2>
          <div class="row-list">${related.map(guideRow).join("")}</div>
        </section>`
      : "") +
    shell.ctaBand({
      heading: "Put this into practice",
      subheading: "Brief a coworker with what you just read and see what comes back. Signing up is free.",
      ctaLabel: "Start free",
      seed: g.title.length,
    }) +
    pageEnd()
  );
}

module.exports = { index, detail };

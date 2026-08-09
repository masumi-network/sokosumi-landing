// /guides (index) and /guides/<slug> (detail) — CMS `guides` collection.
// contentHtml is pre-rendered by the CMS at save time.

const shell = require("./shell");
const cms = require("../lib/cms");
const { esc, icon, pageStart, pageEnd } = shell;

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
      ([cat, list], i) => `<div class="page-section${i === 0 ? " flush" : ""}">
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
    }) +
    `<div class="page-head" data-reveal>
      <h1>Guides</h1>
      <p class="sub">How to get the most out of your AI coworkers, from the first briefing to advanced workflows.</p>
    </div>` +
    (guides.length
      ? sections
      : `<div class="page-section flush"><p class="muted">Guides are on the way. In the meantime, <a href="/coworkers" style="text-decoration:underline">meet the coworkers</a>.</p></div>`) +
    pageEnd()
  );
}

async function detail(ctx) {
  const g = await cms.getGuide(ctx.params.slug, { draft: ctx.preview });
  if (!g) return null;
  const related = (g.related || []).filter((r) => typeof r === "object" && r.slug);

  const cr = [{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: g.title }];
  return (
    pageStart({
      title: `${g.title} | Sokosumi guides`,
      description: (g.description || "").slice(0, 155),
      path: `/guides/${g.slug}`,
      breadcrumb: cr,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: g.title,
        description: g.description || undefined,
        dateModified: g.updatedAt || undefined,
        author: { "@type": "Organization", name: "Sokosumi" },
        url: `${shell.SITE}/guides/${g.slug}`,
      },
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">${esc(CATEGORY_LABELS[g.category] || "Guide")}</span>
      <h1>${esc(g.title)}</h1>
      ${g.description ? `<p class="sub">${esc(g.description)}</p>` : ""}
    </div>
    <article class="page-section flush" data-reveal>
      <div class="prose">${g.contentHtml || ""}</div>
    </article>` +
    (related.length
      ? `<section class="page-section">
          <h2>Related guides</h2>
          <div class="row-list">${related.map(guideRow).join("")}</div>
        </section>`
      : "") +
    pageEnd()
  );
}

module.exports = { index, detail };

// /product (hub for CMS pages under product/*) and the generic CMS
// landing-page renderer used by the catch-all route. Pages are block-based
// (payload `pages` collection); blocks render via templates/blocks.js.

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const productDemo = require("./productDemo");
const { t } = require("../lib/i18n");
const { esc, pageStart, pageEnd } = shell;

function pagePath(slug) {
  return (
    "/" +
    String(slug || "")
      .split("/")
      .map(encodeURIComponent)
      .join("/")
  );
}

async function productHub(ctx) {
  const [pages, coworkers, testimonials] = await Promise.all([
    cms.getPages({ draft: ctx.preview }),
    cms.getCoworkers({ draft: ctx.preview }).catch(() => []),
    cms.getTestimonials({ draft: ctx.preview }).catch(() => []),
  ]);
  // A reading order, not an alphabetical one: what a coworker is, how you
  // brief it, where the work shows up, what you get back. Anything added
  // later that is not in the list falls to the end.
  const ORDER = [
    "product/ai-coworkers",
    "product/briefing",
    "product/chat",
    "product/task-board",
    "product/outputs",
    "product/scheduled-tasks",
  ];
  const rank = (p) => {
    const i = ORDER.indexOf(p.slug);
    return i === -1 ? ORDER.length : i;
  };
  const productPages = pages
    .filter((p) => typeof p.slug === "string" && p.slug.startsWith("product/"))
    .sort((a, b) => rank(a) - rank(b) || String(a.title || "").localeCompare(String(b.title || "")));

  const cr = [{ label: "Home", href: "/" }, { label: "Product" }];
  return (
    pageStart({
      title: "Product | Sokosumi",
      description:
        "Brief a named AI coworker, follow the work on a shared board, and get finished files back. See how Sokosumi actually works.",
      path: "/product",
      breadcrumb: cr,
      mainClass: "product-page",
      stylesheets: ["/assets/product.css"],
      jsonld: {
        "@type": "WebApplication",
        "@id": `${shell.SITE}/#app`,
        name: "Sokosumi",
        url: "https://app.sokosumi.com",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        publisher: { "@id": `${shell.SITE}/#organization` },
        description: t("What an AI coworker is, how you brief one, where the work shows up, and what you get back."),
      },
    }) +
    productDemo.render({ coworkers, productPages }) +
    shell.proof(testimonials, 1) +
    shell.ctaBand({
      heading: t("Start with one task"),
      subheading: t("Brief a coworker today and see what comes back."),
      ctaLabel: t("Start free"),
      seed: 7,
    }) +
    pageEnd({ scripts: ["/assets/product-demo.js"] })
  );
}


// ---- /product/* surface pages -------------------------------------------
// The surfaces are CMS pages. This layer adds what only the code can add:
// the live demo visual for each surface, a query-targeting <title>, and
// cross-links between the surfaces. Everything a reader sees — hero, blocks,
// FAQ, CTA — comes from the page document in the CMS.
const SURFACES = {
  "product/ai-coworkers": {
    feat: "home",
    metaTitle: "What is an AI coworker? | Sokosumi",
    related: [["product/briefing", "How you brief one"], ["product/task-board", "Where the work shows up"], ["ai-coworkers", "Meet the roster"]],
  },
  "product/briefing": {
    feat: "agents",
    metaTitle: "How to brief an AI coworker | Sokosumi",
    related: [["product/ai-coworkers", "Who you are briefing"], ["product/outputs", "What comes back"], ["tasks", "Browse template tasks"]],
  },
  "product/task-board": {
    feat: "tasks",
    metaTitle: "A task board for AI work | Sokosumi",
    related: [["product/briefing", "How work gets onto the board"], ["product/outputs", "What a finished task hands back"], ["use-cases", "Boards in real workflows"]],
  },
  "product/outputs": {
    feat: "outputs",
    metaTitle: "Finished files, not chat transcripts | Sokosumi",
    related: [["product/task-board", "Where outputs land"], ["product/ai-coworkers", "Who makes them"], ["tasks", "Outputs by template task"]],
  },
  "product/chat": {
    feat: "chat",
    metaTitle: "AI coworkers in your team chat | Sokosumi",
    related: [["product/briefing", "Writing the brief itself"], ["product/task-board", "Where chat briefs land"], ["product/ai-coworkers", "Who answers"]],
  },
  "product/scheduled-tasks": {
    feat: "schedule",
    metaTitle: "Recurring AI tasks and automated reports | Sokosumi",
    related: [["product/briefing", "Writing a brief that repeats well"], ["product/outputs", "The files that come back"], ["use-cases", "Recurring workflows by industry"]],
  },
};

async function surfacePage(doc, slug, ctx) {
  const testimonials = await cms.getTestimonials({ draft: ctx.preview }).catch(() => []);
  const cfg = SURFACES[slug];
  const cr = [
    { label: "Home", href: "/" },
    { label: "Product", href: "/product" },
    { label: doc.title },
  ];
  const layout = doc.layout || [];
  const hero = layout.find((b) => b.blockType === "hero");
  const band = layout.find((b) => b.blockType === "ctaBand");
  const middle = blocks.renderBlocks(layout.filter((b) => b.blockType !== "hero" && b.blockType !== "ctaBand"));
  const related = cfg.related
    .map(([slugPath, label]) => `<a class="row-item" href="/${slugPath}"><h3>${esc(label)}</h3><span class="row-go">${shell.icon("arrow-up-right", 15)}</span></a>`)
    .join("");
  return (
    pageStart({
      title: cfg.metaTitle,
      description: (doc.description || "").slice(0, 160),
      path: "/" + slug,
      breadcrumb: cr,
      stylesheets: ["/assets/product.css"],
      mainClass: "surface-page",
      jsonld: blocks.faqJsonLd(blocks.collectFaqs(layout)),
    }) +
    `<section class="blk blk-hero surface-hero" data-reveal>
      ${hero && hero.eyebrow ? `<span class="eyebrow">${esc(hero.eyebrow)}</span>` : ""}
      <h1>${esc((hero && hero.heading) || doc.title)}</h1>
      ${hero && hero.subheading ? `<p class="sub">${esc(hero.subheading)}</p>` : ""}
      <div class="cta-row"><a class="btn btn-primary btn-lg" href="${shell.APP_SIGNUP}" data-analytics="sign_up_click" data-analytics-location="surface_hero">${esc(t("Start free"))}</a><a class="btn btn-outline btn-lg" href="/product">${esc(t("See the interactive demo"))}</a></div>
      ${shell.NO_CARD}
    </section>
    <section class="blk surface-feat" data-reveal>${productDemo.featBand(cfg.feat)}</section>` +
    middle +
    `<section class="page-section"><h2>${esc(t("Keep reading"))}</h2><div class="row-list">${related}</div></section>` +
    shell.proof(testimonials, slug.length, { mode: "logos" }) +
    (band
      ? blocks.renderBlocks([band])
      : shell.ctaBand({
          heading: t("Start with one task"),
          subheading: t("Brief a coworker today and see what comes back."),
          ctaLabel: t("Start free"),
          seed: slug.length,
        })) +
    pageEnd({ scripts: ["/assets/product-feat.js"] })
  );
}

async function cmsPage(ctx) {
  const doc = await cms.getPage(ctx.params.slug, { draft: ctx.preview });
  if (!doc) return null;
  if (SURFACES[doc.slug]) return surfacePage(doc, doc.slug, ctx);

  const cr = [{ label: "Home", href: "/" }];
  if (doc.parent && typeof doc.parent === "object" && doc.parent.title && doc.parent.slug) {
    cr.push({ label: doc.parent.title, href: pagePath(doc.parent.slug) });
  }
  cr.push({ label: doc.title });

  return (
    pageStart({
      title: t("{title} | Sokosumi", { title: doc.title }),
      description: (doc.description || "").slice(0, 155),
      path: "/" + doc.slug,
      breadcrumb: cr,
      jsonld: blocks.faqJsonLd(blocks.collectFaqs(doc.layout)),
    }) +
    blocks.renderBlocks(doc.layout) +
    pageEnd()
  );
}

module.exports = { productHub, cmsPage };

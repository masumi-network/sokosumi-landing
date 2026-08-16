// /product (hub for CMS pages under product/*) and the generic CMS
// landing-page renderer used by the catch-all route. Pages are block-based
// (payload `pages` collection); blocks render via templates/blocks.js.

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const { esc, attr, icon, pageStart, pageEnd } = shell;

function pagePath(slug) {
  return (
    "/" +
    String(slug || "")
      .split("/")
      .map(encodeURIComponent)
      .join("/")
  );
}

function pageCard(p) {
  return `<a class="card" href="${attr(pagePath(p.slug))}">
    <h3>${esc(p.title)}</h3>
    ${p.description ? `<p>${esc(p.description)}</p>` : ""}
    <div class="card-foot"><span>Read more</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
  </a>`;
}

const SURFACES = [
  {
    href: "/ai-coworkers",
    title: "Coworkers",
    text: "Named specialists with real roles, public profiles, and work you can inspect before you hire.",
  },
  {
    href: "/tasks",
    title: "Template tasks",
    text: "Ready-to-run work with a fixed brief, a known output, and a sample you can open first.",
  },
  {
    href: "/vendors",
    title: "Vendors",
    text: "The teams behind the coworkers on the marketplace, with everything they ship in one place.",
  },
];

function surfaceRow(s) {
  return `<a class="row-item" href="${attr(s.href)}">
    <h3>${esc(s.title)}</h3>
    <p>${esc(s.text)}</p>
    <span class="row-go">Explore ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function productHub(ctx) {
  const pages = await cms.getPages({ draft: ctx.preview });
  // A reading order, not an alphabetical one: what a coworker is, how you
  // brief it, where the work shows up, what you get back. Anything added
  // later that is not in the list falls to the end.
  const ORDER = ["product/ai-coworkers", "product/briefing", "product/task-board", "product/outputs"];
  const rank = (p) => {
    const i = ORDER.indexOf(p.slug);
    return i === -1 ? ORDER.length : i;
  };
  const productPages = pages
    .filter((p) => typeof p.slug === "string" && p.slug.startsWith("product/"))
    .sort((a, b) => rank(a) - rank(b) || String(a.title || "").localeCompare(String(b.title || "")));

  const cardsSection = productPages.length
    ? `<section class="page-section flush" data-reveal>
      <div class="${shell.gridCls(productPages.length)}">${productPages.map(pageCard).join("")}</div>
    </section>`
    : "";

  const surfacesSection = `<section class="page-section">
      <h2>Explore the platform</h2>
      <div class="row-list">${SURFACES.map(surfaceRow).join("")}</div>
    </section>`;

  // A product page with no picture of the product was the emptiest page on
  // the site; these are the same four renders the landing page shows.
  const shotsSection = `<section class="page-section${productPages.length ? "" : " flush"}" data-reveal>
      <h2>What it looks like</h2>
      <p class="sub">Four views of the same working day: the roster, the briefing bar, the task board, and the channel your coworkers answer in.</p>
      ${shell.shotGallery()}
    </section>`;

  const cr = [{ label: "Home", href: "/" }, { label: "Product" }];
  return (
    pageStart({
      title: "Product | Sokosumi",
      description: "Deep dives into what your AI coworkers can do: the surfaces, workflows, and guarantees behind Sokosumi.",
      path: "/product",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>The Sokosumi product</h1>
      <p class="sub">What an AI coworker is, how you brief one, where the work shows up, and what you get back.</p>
    </div>` +
    cardsSection +
    shotsSection +
    surfacesSection +
    shell.ctaBand({
      heading: "Start with one task",
      subheading: "Brief a coworker today and see what comes back.",
      ctaLabel: "Start free",
      seed: 7,
    }) +
    pageEnd()
  );
}

async function cmsPage(ctx) {
  const doc = await cms.getPage(ctx.params.slug, { draft: ctx.preview });
  if (!doc) return null;

  const cr = [{ label: "Home", href: "/" }];
  if (doc.parent && typeof doc.parent === "object" && doc.parent.title && doc.parent.slug) {
    cr.push({ label: doc.parent.title, href: pagePath(doc.parent.slug) });
  }
  cr.push({ label: doc.title });

  return (
    pageStart({
      title: `${doc.title} | Sokosumi`,
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

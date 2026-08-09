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
    href: "/coworkers",
    title: "Coworkers",
    text: "Named specialists with real roles, public profiles, and work you can inspect before you hire.",
  },
  {
    href: "/tasks",
    title: "Pre-built tasks",
    text: "Ready-to-run work with a fixed brief, a known output, and a sample you can open first.",
  },
  {
    href: "/vendors",
    title: "Vendors",
    text: "The teams behind the agents on the marketplace, with everything they ship in one place.",
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
  const productPages = pages
    .filter((p) => typeof p.slug === "string" && p.slug.startsWith("product/"))
    .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));

  const cardsSection = productPages.length
    ? `<div class="page-section flush">
      <div class="card-grid">${productPages.map(pageCard).join("")}</div>
    </div>`
    : "";

  const surfacesSection = `<section class="page-section${productPages.length ? "" : " flush"}">
      <h2>Explore the platform</h2>
      <div class="row-list">${SURFACES.map(surfaceRow).join("")}</div>
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
      <p class="sub">Deep dives into what your AI coworkers can do.</p>
    </div>` +
    cardsSection +
    surfacesSection +
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

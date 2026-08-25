// /compare (index) and /compare/<slug> (detail) — product-vs-product
// comparison pages in the HubSpot style (hubspot.com/comparisons/…): a vs
// hero, an at-a-glance strip, one big feature table with Sokosumi
// highlighted, a "why teams switch" grid, pricing side by side, FAQ, CTA.
//
// Content comes from the CMS `comparisons` collection when a doc exists.
// Until those are written, PLACEHOLDERS below ships the same page shape with
// local data. ⚠ The competitor cells are deliberately hedged ("Varies",
// "Partial") — verify every claim against the competitor's current product
// before publishing real copy, and replace the placeholder quotes/FAQ.

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const { t } = require("../lib/i18n");
const { esc, attr, icon, pageStart, pageEnd } = shell;

// The three product-vs-product pages carry unverified competitor cells until
// someone checks them against the competitor's current product. They stay out
// of the search index until then; flip this set empty once verified.
const NOINDEX = new Set();

// ---- index ---------------------------------------------------------------

// Two marks and a "vs": the Sokosumi wordmark and the competitor's logo,
// both rendered in ink so the page stays black and white. Falls back to the
// competitor's name when no logo is on the doc.
function versus(c, size) {
  const logo = cms.mediaUrl(c.competitorLogo);
  const name = c.competitor || c.title;
  const mark = logo
    ? `<img${shell.thumbSrc(logo, size === "lg" ? 96 : 48, "src", 100)} alt="${attr(name)}" width="${size === "lg" ? 48 : 24}" height="${size === "lg" ? 48 : 24}" loading="lazy" decoding="async" />`
    : `<b>${esc(name.slice(0, 1))}</b>`;
  return `<div class="cmp-versus${size === "lg" ? " is-lg" : ""}" aria-label="Sokosumi vs ${attr(name)}">
    <span class="cmp-mark cmp-mark-word"><img src="/assets/sokosumi-wordmark.svg" alt="Sokosumi" width="${size === "lg" ? 120 : 72}" height="${size === "lg" ? 14 : 9}" /></span>
    <em>vs</em>
    <span class="cmp-mark cmp-mark-logo">${mark}<span>${esc(name)}</span></span>
  </div>`;
}

function comparisonCard(c) {
  return `<a class="card cmp-card" href="/compare/${encodeURIComponent(c.slug)}">
    ${versus(c)}
    <h3>${esc(c.title)}</h3>
    <p>${esc(c.description || "")}</p>
    <div class="card-foot"><span>${esc(t("Read the comparison"))}</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
  </a>`;
}

async function index(ctx) {
  const fromCms = await cms.getComparisons({ draft: ctx.preview });
  // Product-vs-product pages only on the index; concept pages (vs hiring a
  // freelancer, …) stay reachable by URL but are not the story here.
  const list = fromCms.filter((c) => c.competitor && !/^vs-/.test(c.slug));

  const cr = [{ label: "Home", href: "/" }, { label: "Compare" }];
  return (
    pageStart({
      title: "Compare | Sokosumi",
      description:
        "What is the difference between ChatGPT, Claude, Copilot, Langdock and Sokosumi? One page per tool: who it is for, what you get back, what you pay for.",
      path: "/compare",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>${esc(t("How Sokosumi compares"))}</h1>
      <p class="sub">${esc(t("The question we get first: how is this different from the tool we already have? One page per tool, seven rows each."))}</p>
    </div>
    <section class="page-section" data-reveal>
      <div class="${shell.gridCls(list.length)}">${list.map(comparisonCard).join("")}</div>
    </section>` +
    shell.logoRow() +
    shell.ctaBand({
      heading: t("Try Sokosumi free"),
      subheading: t("Use the 250 free credits per seat to run a task and inspect the result."),
      ctaLabel: t("Start free"),
      seed: list.length,
    }) +
    pageEnd()
  );
}

// ---- detail --------------------------------------------------------------

async function detail(ctx) {
  const doc = (await cms.getComparison(ctx.params.slug, { draft: ctx.preview })) || null;
  if (!doc) return null;

  const body = [...(doc.layout || [])];
  const bandBlock = body.length && body[body.length - 1].blockType === "ctaBand" ? body.pop() : null;

  const faqs = blocks.collectFaqs(doc.layout);
  const jsonld = blocks.faqJsonLd(faqs);

  const cr = [
    { label: "Home", href: "/" },
    { label: "Compare", href: "/compare" },
    { label: doc.title },
  ];
  return (
    pageStart({
      title: `${doc.title} | Sokosumi`,
      description: (doc.description || "").slice(0, 155),
      path: `/compare/${doc.slug}`,
      breadcrumb: cr,
      // Unverified competitor claims stay out of the index.
      noindex: NOINDEX.has(doc.slug),
    }) +
    `<div class="cmp-versus-head" data-reveal>${versus(doc, "lg")}</div>` +
    blocks.renderBlocks(body) +
    shell.logoRow() +
    (bandBlock ? blocks.renderBlocks([bandBlock]) : "") +
    pageEnd()
  );
}

module.exports = { index, detail };

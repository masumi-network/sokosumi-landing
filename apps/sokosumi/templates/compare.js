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
const i18n = require("../lib/i18n");
const { t } = i18n;
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
    <span class="cmp-mark cmp-mark-logo"><img src="/assets/apple-touch-icon.png" alt="" width="${size === "lg" ? 48 : 24}" height="${size === "lg" ? 48 : 24}" decoding="async" /><span>Sokosumi</span></span>
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
  // The tools people already have come first; the rest alphabetically.
  const FIRST = ["sokosumi-vs-chatgpt", "sokosumi-vs-claude", "sokosumi-vs-claude-code", "sokosumi-vs-microsoft-365-copilot", "sokosumi-vs-google-gemini", "sokosumi-vs-langdock"];
  const rank = (c) => (FIRST.includes(c.slug) ? FIRST.indexOf(c.slug) : FIRST.length);
  const list = fromCms
    .filter((c) => c.competitor && !/^vs-/.test(c.slug))
    .sort((a, b) => rank(a) - rank(b) || String(a.competitor).localeCompare(String(b.competitor)));

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

// ---- the parts every comparison page shares ----
// Modelled on hubspot.com/comparisons: a question, numbers, one table, what
// makes the product different (with pictures), customers, questions, links.
// The competitor-specific copy comes from the CMS doc; these come from the
// catalog and the site so they are always current and never invented.

// One sentence that says what the numbers mean, built from the live catalog.
// Counts only what the marketplace records: coworkers, vendors, tasks run.
// No hours-saved figure, because nothing measures it yet.
function valueLine(coworkers) {
  const live = (coworkers || []).filter((c) => c.active !== false);
  if (!live.length) return "";
  const runs = live.reduce((a, c) => a + (Number(c.runs) || 0), 0);
  const vendors = new Set(live.map((c) => (c.vendor && typeof c.vendor === "object" ? c.vendor.slug : c.vendor)).filter(Boolean)).size;
  const nf = (n) => n.toLocaleString(i18n.locale() === "de" ? "de-DE" : "en-US");
  const runsText = runs >= 1000 ? nf(Math.floor(runs / 100) * 100) + "+" : nf(runs);
  const b = (v) => `<strong>${esc(v)}</strong>`;
  const line = t("Marketing teams have handed {runs} tasks to {coworkers} coworkers and agents from {vendors} vendors. Each one came back as a file.", {
    runs: b(runsText),
    coworkers: b(nf(live.length)),
    vendors: b(nf(vendors)),
  });
  return `<section class="page-section flush cmp-value" data-reveal>
    <p class="cmp-value-line">${line}</p>
    <p class="cmp-value-note">${esc(t("Live numbers from the marketplace."))}</p>
  </section>`;
}

// The three "in practice" points from the CMS doc, competitor-specific, each
// next to the product view it talks about: roster, board, chat.
const SHOT_ORDER = ["roster", "board", "chat"];
function different(name, items) {
  const list = (items || []).slice(0, 3);
  if (!list.length) return "";
  return `<section class="page-section cmp-different">
    <h2>${esc(t("What makes Sokosumi different from {name}", { name }))}</h2>
    ${list.map((it, i) => {
      const shot = shell.SHOTS[SHOT_ORDER[i % SHOT_ORDER.length]];
      return `<div class="blk-media-text${i % 2 ? " media-left" : ""} cmp-mt" data-reveal>
        <div class="mt-copy"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div>
        <div class="mt-media"><img${shell.thumbSrc(shot.src, 1200)} alt="${attr(shot.alt)}" width="2400" height="1350" loading="lazy" decoding="async" /></div>
      </div>`;
    }).join("")}
  </section>`;
}

const RELATED = [
  { href: "/ai-coworkers", title: "Meet the coworkers", text: "Every coworker and agent on the marketplace, with role, vendor, models and sample work." },
  { href: "/tasks", title: "Template tasks", text: "Ready-to-run work with a fixed brief, a known deliverable and the credit price up front." },
  { href: "/pricing", title: "Pricing", text: "Free with 250 credits per seat. Paid seats from €25 a month; credits only go on work that runs." },
];

function related() {
  return `<section class="page-section" data-reveal>
    <h2>${esc(t("See it for yourself"))}</h2>
    <div class="card-grid">${RELATED.map(
      (r) => `<a class="card" href="${r.href}"><h3>${esc(t(r.title))}</h3><p>${esc(t(r.text))}</p><div class="card-foot"><span>${esc(t("Explore"))}</span><span class="go">${icon("arrow-up-right", 15)}</span></div></a>`,
    ).join("")}</div>
  </section>`;
}

async function detail(ctx) {
  const opts = { draft: ctx.preview };
  const [doc, coworkers, testimonials] = await Promise.all([
    cms.getComparison(ctx.params.slug, opts),
    cms.getCoworkers(opts).catch(() => []),
    cms.getTestimonials(opts).catch(() => []),
  ]);
  if (!doc) return null;
  const name = doc.competitor || doc.title;

  // CMS layout: hero, table, "in practice" grid, faq, cta band — in that order.
  const body = [...(doc.layout || [])];
  const bandBlock = body.length && body[body.length - 1].blockType === "ctaBand" ? body.pop() : null;
  const hero = body.filter((b) => b.blockType === "hero");
  const table = body.filter((b) => b.blockType === "comparisonTable");
  const grid = body.filter((b) => b.blockType === "featureGrid");
  const faq = body.filter((b) => b.blockType === "faq");
  const rest = body.filter((b) => !["hero", "comparisonTable", "featureGrid", "faq"].includes(b.blockType));

  const cr = [
    { label: "Home", href: "/" },
    { label: "Compare", href: "/compare" },
    { label: doc.title },
  ];
  return (
    pageStart({
      // The search phrase people type, then the promise. The h1 asks the question.
      title: t("{name} vs Sokosumi: the difference for marketing teams", { name }),
      description: (doc.description || "").slice(0, 155),
      path: `/compare/${doc.slug}`,
      breadcrumb: cr,
      noindex: NOINDEX.has(doc.slug),
    }) +
    `<div class="cmp-versus-head" data-reveal>${versus(doc, "lg")}</div>` +
    blocks.renderBlocks(hero) +
    valueLine(coworkers) +
    blocks.renderBlocks(table) +
    different(name, grid.flatMap((g) => g.items || [])) +
    shell.proof(testimonials, name.length, { heading: t("Teams already on Sokosumi") }) +
    blocks.renderBlocks(faq) +
    blocks.renderBlocks(rest) +
    related() +
    (bandBlock ? blocks.renderBlocks([bandBlock]) : "") +
    pageEnd()
  );
}

module.exports = { index, detail };

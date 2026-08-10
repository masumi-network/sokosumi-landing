// /compare (index) and /compare/<slug> (detail) — CMS `comparisons`
// collection. Detail pages are built entirely from CMS layout blocks
// (hero, comparisonTable, faq, ...) rendered by templates/blocks.js.

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const { esc, attr, icon, pageStart, pageEnd } = shell;

function comparisonCard(c) {
  const logo = cms.mediaUrl(c.competitorLogo);
  const top = logo
    ? `<img src="${attr(logo)}" alt="${attr(c.competitor || c.title)}" style="height:20px;width:auto" loading="lazy" />`
    : `<span class="kicker">VS</span>`;
  return `<a class="card" href="/compare/${encodeURIComponent(c.slug)}">
    <div class="card-top">${top}</div>
    <h3>${esc(c.title)}</h3>
    <p>${esc(c.description || "")}</p>
    <div class="card-foot"><span>Read the comparison</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
  </a>`;
}

async function index(ctx) {
  const comparisons = await cms.getComparisons({ draft: ctx.preview });

  const cr = [{ label: "Home", href: "/" }, { label: "Compare" }];
  return (
    pageStart({
      title: "Compare | Sokosumi",
      description:
        "How Sokosumi compares to other AI platforms and agent tools, side by side.",
      path: "/compare",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>How Sokosumi compares</h1>
      <p class="sub">Honest, side by side looks at Sokosumi and the tools you might be weighing it against.</p>
    </div>
    <section class="page-section flush" data-reveal>
      <div class="shot-split">
        <div class="copy">
          <h2>What you are actually comparing</h2>
          <p>Not a chat window and not a prompt library. Named coworkers with real roles, a task board your whole team can see, and finished files at the end of it.</p>
          <a class="btn btn-outline" href="/coworkers">Meet the coworkers</a>
        </div>
        ${shell.shotFigure(shell.SHOTS.board, { caption: false })}
      </div>
    </section>` +
    (comparisons.length
      ? `<div class="page-section">
          <h2>Side by side</h2>
          <div class="${shell.gridCls(comparisons.length)}" style="margin-top:22px">${comparisons.map(comparisonCard).join("")}</div>
        </div>`
      : `<div class="page-section flush"><p class="muted">Comparison pages are on the way. In the meantime, <a href="/coworkers" style="text-decoration:underline">meet the coworkers</a>.</p></div>`) +
    shell.ctaBand({
      heading: "The shortest comparison is a trial",
      subheading: "Run one real task and judge the output for yourself.",
      ctaLabel: "Start free",
      seed: comparisons.length,
    }) +
    pageEnd()
  );
}

async function detail(ctx) {
  const doc = await cms.getComparison(ctx.params.slug, { draft: ctx.preview });
  if (!doc) return null;

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
      jsonld: jsonld || undefined,
    }) +
    blocks.renderBlocks(doc.layout) +
    pageEnd()
  );
}

module.exports = { index, detail };

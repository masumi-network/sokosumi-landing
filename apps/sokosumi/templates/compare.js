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

// ---- placeholder comparison docs (same shape as CMS docs) ----------------

function placeholderLayout(name) {
  const vs = `Sokosumi vs. ${name}`;
  return [
    {
      blockType: "hero",
      eyebrow: "Comparison",
      heading: vs,
      subheading: `Both give your team AI that does real work. This page shows where they differ: named coworkers vs. built agents, a shared task board, and finished files at the end of a job. Placeholder copy — final comparison in progress.`,
      ctaLabel: "Start free with Sokosumi",
      ctaHref: shell.APP_SIGNUP,
      secondaryCtaLabel: "Talk to sales",
      secondaryCtaHref: shell.SALES_URL,
    },
    {
      blockType: "comparisonTable",
      heading: "Side by side",
      subheading: `What you get out of the box. ${name} cells are placeholders — verified comparison coming.`,
      columns: [{ label: "Sokosumi", highlight: true }, { label: name }],
      rows: [
        { label: "Named AI coworkers with roles and profiles", cells: [{ value: "yes" }, { value: "Varies" }] },
        { label: "Ready-to-run template tasks", note: "Fixed brief, known output, sample to inspect first", cells: [{ value: "yes" }, { value: "Varies" }] },
        { label: "Shared task board for the whole team", cells: [{ value: "yes" }, { value: "Partial" }] },
        { label: "Finished files as deliverables (PDF, slides, web)", cells: [{ value: "yes" }, { value: "Varies" }] },
        { label: "Chat channels where coworkers answer in-thread", cells: [{ value: "yes" }, { value: "Partial" }] },
        { label: "Scheduled, recurring tasks", cells: [{ value: "yes" }, { value: "Varies" }] },
        { label: "Multi-vendor marketplace of coworkers", cells: [{ value: "yes" }, { value: "no" }] },
        { label: "Works without building your own agents", cells: [{ value: "yes" }, { value: "Varies" }] },
        { label: "EU hosting available", cells: [{ value: "yes" }, { value: "Varies" }] },
        { label: "Free plan to try with real work", cells: [{ value: "yes" }, { value: "Varies" }] },
      ],
    },
    {
      blockType: "featureGrid",
      heading: "Why teams pick Sokosumi",
      subheading: "The three differences that show up in the first week.",
      items: [
        { title: "Hire, don't build", text: "Coworkers arrive finished: a role, a bio, template tasks, and work you can open before you spend a credit. There is no agent-builder to learn first." },
        { title: "Work lands on a board", text: "Every task shows who has it and whether it is running, waiting on you, or done. Your team sees the same board, not one person's chat history." },
        { title: "Deliverables, not chats", text: "A job ends with a file you can send: a report, a deck, a live dashboard. The transcript is the receipt, not the product." },
      ],
    },
    {
      blockType: "comparisonTable",
      heading: "Pricing",
      subheading: `List prices, per month. ${name} pricing is a placeholder — check their current pricing page before relying on this.`,
      columns: [{ label: "Sokosumi", highlight: true }, { label: name }],
      rows: [
        { label: "Free tier", cells: [{ value: "Free · 250 credits/seat" }, { value: "Varies" }] },
        { label: "Entry plan", cells: [{ value: "€25 / month" }, { value: "TBD" }] },
        { label: "Team plan", cells: [{ value: "€75 / month" }, { value: "TBD" }] },
        { label: "Enterprise", cells: [{ value: "Custom" }, { value: "Custom" }] },
        { label: "Credit card required to start", cells: [{ value: "no" }, { value: "Varies" }] },
      ],
    },
    {
      blockType: "faq",
      heading: "Questions we get",
      items: [
        { question: `Can I move from ${name} to Sokosumi?`, answer: "There is nothing to migrate: sign up, pick a coworker, and hand over the first brief. Your documents attach to tasks as context. (Placeholder answer — expand with a real migration note.)" },
        { question: "Do I have to build or train agents?", answer: "No. Coworkers come from vendors finished and tested. If you want something custom, vendors can build and list it for your workspace." },
        { question: "Where does my data live?", answer: "Sokosumi offers EU hosting; coworker profiles state the models they run on and the hosting region before you hire them." },
        { question: "Can I try it before paying?", answer: "Yes — the free plan includes credits, no card required. Run one real task and judge the output." },
      ],
    },
    {
      blockType: "ctaBand",
      heading: "The shortest comparison is a trial",
      subheading: "Run one real task on the free plan and compare the file that comes back.",
      ctaLabel: "Start free",
      ctaHref: shell.APP_SIGNUP,
    },
  ];
}

const PLACEHOLDERS = [
  { slug: "sokosumi-vs-relevance-ai", competitor: "Relevance AI", tagline: "Build an AI workforce vs. hire one that already exists." },
  { slug: "sokosumi-vs-lindy", competitor: "Lindy", tagline: "Personal AI assistants vs. a marketplace of specialist coworkers for the whole team." },
  { slug: "sokosumi-vs-manus", competitor: "Manus", tagline: "A general autonomous agent vs. named specialists with a shared board." },
].map((p) => ({
  ...p,
  title: `Sokosumi vs. ${p.competitor}`,
  description: `${p.tagline} Placeholder comparison — side-by-side features, pricing and FAQ.`,
  layout: placeholderLayout(p.competitor),
  placeholder: true,
}));

// ---- index ---------------------------------------------------------------

function comparisonCard(c) {
  return `<a class="card cmp-card" href="/compare/${encodeURIComponent(c.slug)}">
    <div class="cmp-lockup" aria-hidden="true"><span>Sokosumi</span><em>vs</em><span>${esc(c.competitor || c.title)}</span></div>
    <h3>${esc(c.title)}</h3>
    <p>${esc(c.description || "")}</p>
    <div class="card-foot"><span>${esc(t("Read the comparison"))}</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
  </a>`;
}

async function index(ctx) {
  const fromCms = await cms.getComparisons({ draft: ctx.preview });
  // Product-vs-product pages only on the index; concept pages (vs hiring a
  // freelancer, …) stay reachable by URL but are not the story here.
  const CONCEPT = new Set(["vs-hiring-a-freelancer", "vs-hiring-an-agency", "vs-chatgpt-alone"]);
  const products = fromCms.filter((c) => c.competitor && !CONCEPT.has(c.slug) && !/^vs-/.test(c.slug));
  const seen = new Set(products.map((c) => c.slug));
  const list = products.concat(PLACEHOLDERS.filter((p) => !seen.has(p.slug)));

  const cr = [{ label: "Home", href: "/" }, { label: "Compare" }];
  return (
    pageStart({
      title: "Compare | Sokosumi",
      description:
        "How Sokosumi compares to Relevance AI, Lindy, Manus and other AI agent platforms, side by side: features, pricing, and what you actually get back.",
      path: "/compare",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>${esc(t("How Sokosumi compares"))}</h1>
      <p class="sub">${esc(t("Compare Sokosumi with the other ways to get the same work done."))}</p>
    </div>
    <section class="page-section" data-reveal>
      <div class="${shell.gridCls(list.length)}">${list.map(comparisonCard).join("")}</div>
    </section>` +
    shell.logoRow() +
    shell.ctaBand({
      heading: t("The shortest comparison is a trial"),
      subheading: t("Run one real task and judge the output for yourself."),
      ctaLabel: t("Start free"),
      seed: list.length,
    }) +
    pageEnd()
  );
}

// ---- detail --------------------------------------------------------------

async function detail(ctx) {
  const doc =
    (await cms.getComparison(ctx.params.slug, { draft: ctx.preview })) ||
    PLACEHOLDERS.find((p) => p.slug === ctx.params.slug) ||
    null;
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
      // Placeholder pages must not enter the index until the claims are
      // verified and the copy is real.
      noindex: !!doc.placeholder,
    }) +
    blocks.renderBlocks(body) +
    shell.logoRow() +
    (bandBlock ? blocks.renderBlocks([bandBlock]) : "") +
    pageEnd()
  );
}

module.exports = { index, detail };

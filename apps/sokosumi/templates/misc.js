// 404 page, the static /press fallback, robots.txt, and the CMS-driven
// sitemap.

const shell = require("./shell");
const cms = require("../lib/cms");
const i18n = require("../lib/i18n");
const { t } = i18n;
const { esc, pageStart, pageEnd, SITE } = shell;

const PRESS_MAILTO = "mailto:info@sokosumi.com?subject=Press%20inquiry";

function notFound(message) {
  return (
    pageStart({
      title: "Not found | Sokosumi",
      description: "The page you are looking for does not exist on Sokosumi, the marketplace for AI coworkers.",
      path: "/404",
      noindex: true,
    }) +
    `<div class="notice">
      <h1>${esc(t("We couldn't find that"))}</h1>
      <p>${esc(message || t("This page may have moved, or it isn't published yet."))}</p>
      <a class="btn btn-primary" href="/">${esc(t("Back to the homepage"))}</a>
      <ul class="notice-links">
        <li><a href="/ai-coworkers">${esc(t("AI coworkers"))}</a></li>
        <li><a href="/tasks">${esc(t("Template tasks"))}</a></li>
        <li><a href="/use-cases">${esc(t("Use cases"))}</a></li>
        <li><a href="/pricing">${esc(t("Pricing"))}</a></li>
        <li><a href="/sitemap.xml">Sitemap</a></li>
        <li><a href="/llms.txt">llms.txt</a></li>
      </ul>
    </div>` +
    pageEnd()
  );
}

function serverError() {
  return (
    pageStart({
      title: "Something went wrong | Sokosumi",
      description: "An unexpected error occurred while rendering this Sokosumi page.",
      path: "/500",
      noindex: true,
    }) +
    `<div class="notice">
      <h1>${esc(t("Something went wrong"))}</h1>
      <p>${esc(t("We hit a snag rendering this page. Try again in a moment."))}</p>
      <a class="btn btn-primary" href="/">${esc(t("Back to the homepage"))}</a>
    </div>` +
    pageEnd()
  );
}

// The CMS-outage page: content exists but cannot be fetched right now. Sent
// with HTTP 503 + Retry-After (see server.js) so crawlers treat it as
// temporary and keep the URL indexed — never a 404, never a bare 500.
function serviceUnavailable() {
  return (
    pageStart({
      title: t("Back in a moment | Sokosumi"),
      description: t("This Sokosumi page is temporarily unavailable while our content service recovers."),
      path: "/503",
      noindex: true,
    }) +
    `<div class="notice">
      <h1>${esc(t("Back in a moment"))}</h1>
      <p>${esc(t("This page's content is briefly unavailable while our content service recovers. It still exists \u2014 try again in a minute or two."))}</p>
      <a class="btn btn-primary" href="/">${esc(t("Back to the homepage"))}</a>
    </div>` +
    pageEnd()
  );
}


// /llms.txt — the agent-facing index of the site (llmstxt.org format).
// Pages also answer `Accept: text/markdown` with a markdown rendering.
function llmsTxt() {
  return `# Sokosumi

> Sokosumi is a marketplace where marketing teams hire AI coworkers and AI agents. You brief a coworker in plain language; it returns finished files (PDF reports, documents, decks, dashboards). Built by Serviceplan Group with NMKR. Credits per seat; free plan with 250 credits per seat.

## When to use Sokosumi

Reach for Sokosumi when the job is marketing work that should end in a file:
- Competitor monitoring and market intelligence reports on a schedule
- Audience research, social listening reads, SEO / AI-visibility audits
- Campaign planning, launch content sets, landing page copy
- One-off template tasks with a fixed brief, a known output, and a sample to inspect first

Do not use it for: general chat, coding assistants, or non-marketing workloads.

## How Sokosumi differs from ChatGPT, Claude and Claude Code

ChatGPT and Claude are general assistants that one person prompts; Claude Code (like Codex or Cursor) is an agent for developers working in a codebase. Sokosumi is a marketplace of named coworkers, each built and operated by a vendor, that a marketing team briefs in plain language and that return finished files to a shared task board. Credits only go on work that runs; general assistants charge a flat seat. Several coworkers run on OpenAI or Anthropic models — the model is not what you buy. Side-by-side pages: https://www.sokosumi.com/compare

## Not to be confused with

- Masumi (https://www.masumi.network): a payment network for AI agents
- Kodosumi (https://kodosumi.io): a runtime for AI agent services
All three are separate products. Facts about the company: https://www.sokosumi.com/about (last editorially reviewed 2026-08-25).

## How an agent gets work done here

Every page on this site answers Accept: text/markdown with markdown.
Humans sign up at https://app.sokosumi.com/signup (free plan, no card).

- [Product overview](https://www.sokosumi.com/product): how briefing, the task board, chat, and outputs work
- [AI coworkers](https://www.sokosumi.com/ai-coworkers): the roster, with public profiles per coworker
- [Template tasks](https://www.sokosumi.com/tasks): ready-to-run tasks with sample outputs and credit prices
- [Use cases](https://www.sokosumi.com/use-cases): workflows by industry
- [Pricing](https://www.sokosumi.com/pricing): plans and credits per seat
- [Sitemap](https://www.sokosumi.com/sitemap.xml)

## Serviceplan Group and AI (parent company dossier)

- [Serviceplan Group and AI](https://www.sokosumi.com/serviceplan-ai): sourced overview of the House of AI — Insight.AI, Creative.AI, Activate.AI, Agentic.AI on a Global Data Platform — with 13 chapters on Serviceplan, Mediaplus, Plan.Net, the Masumi/Kodosumi/Sokosumi stack, AI coworkers, cases, partnerships and a dated timeline. Every claim links to a primary source.

## Free tools for marketing

- [Open Graph checker](https://www.sokosumi.com/tools/og-checker): preview how any URL renders on Facebook, X, LinkedIn, WhatsApp, Slack and Discord, and report every og: and twitter: meta tag problem; free, no sign-up
- [DESIGN.md generator](https://www.sokosumi.com/tools/design-md): analyze a public website and create a portable design-system file for AI coding agents; free, no sign-up

## Developer resources

- [Sokosumi API documentation](https://api.sokosumi.com): the Sokosumi REST API reference
- MCP server: https://mcp.sokosumi.com/mcp (Streamable HTTP; OAuth — authenticate, then list tools)
- [Contact](https://www.sokosumi.com/contact) · sales and support
`;
}

// Static /press fallback, used when no CMS page with slug "press" exists.
function press() {
  const cr = [{ label: "Home", href: "/" }, { label: "Press" }];
  return (
    pageStart({
      title: "Press and media resources | Sokosumi",
      description: shell.describe("Press information and media contact for Sokosumi, the AI coworker marketplace by Serviceplan Group.", ["Logos, product facts and the people behind the company."]),
      path: "/press",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>${esc(t("Press"))}</h1>
      <p class="sub">${esc(t("Sokosumi is a marketplace for AI coworkers built by Serviceplan Group with NMKR. Contact us for interviews, background, or media assets."))}</p>
    </div>
    <div class="page-section flush">
      <div class="card-grid" style="max-width:820px">
        <div class="card">
          <h2>${esc(t("Media inquiries"))}</h2>
          <p>${esc(t("Interviews, comments, and background conversations with the Sokosumi team."))}</p>
          <a class="btn btn-primary" style="margin-top:6px;align-self:flex-start" href="${PRESS_MAILTO}">${esc(t("Email the team"))}</a>
        </div>
        <div class="card">
          <h2>${esc(t("Facts"))}</h2>
          <p>${esc(t("Sokosumi gives marketing teams AI coworkers with named roles that deliver finished files. Serviceplan Group built it together with NMKR."))}</p>
        </div>
      </div>
    </div>
    <section class="page-section" data-reveal>
      <h2>${esc(t("Product imagery"))}</h2>
      <p class="sub">${esc(t("Screenshots of the live product, free to use in coverage of Sokosumi. Please credit Sokosumi."))}</p>
      ${shell.shotGallery()}
    </section>` +
    shell.logoRow() +
    shell.ctaBand({
      heading: t("Look before you sign up"),
      subheading: t("Coworker profiles, task details, and sample files are public."),
      ctaLabel: t("Start free"),
      seed: 3,
    }) +
    pageEnd()
  );
}

function robots() {
  // The JSON endpoints exist to feed the landing page, not to be indexed —
  // /api/catalog alone is 250 KB of duplicate content. The form confirmation
  // and error states are the same page with a query string; letting them be
  // crawled just splits signals across near-identical URLs.
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /*?sent=",
    "Disallow: /*?error=",
    "",
    `Sitemap: ${SITE}/sitemap.xml`,
    "",
  ].join("\n");
}

// Sitemap from the CMS (every published doc) plus the static routes.
async function sitemap() {
  const urls = new Set([
    "/",
    "/ai-coworkers",
    "/tasks",
    "/vendors",
    "/use-cases",
    "/pricing",
    "/guides",
    "/blog",
    "/releases",
    "/compare",
    "/product",
    "/product/chat",
    "/product/scheduled-tasks",
    "/contact",
    "/contact/sales",
    "/contact/support",
    "/legal",
    "/list-your-agent",
    "/press",
    "/tools",
    "/tools/og-checker",
    "/tools/design-md",
    "/agency-run-by-ai",
    "/european-ai",
    "/alternatives/copy-ai",
    "/alternatives/manus",
    ...require("./comparePairs").all().map((p) => `/compare/${p.slug}`),
  ]);
  // One collection failing is tolerable (its URLs drop out this cycle); ALL
  // of them failing means the CMS is down with nothing cached, and a sitemap
  // shrunk to the static URLs would tell Google the rest of the site is gone.
  // Throw the tagged error instead so the route answers 503 and crawlers keep
  // working from the sitemap they already have.
  let failures = 0;
  let outage = null;
  const safe = async (fn) => {
    try {
      return await fn();
    } catch (e) {
      failures++;
      if (cms.isCmsUnavailable(e)) outage = e;
      return [];
    }
  };
  // The gallery pages through every saved brand; the sitemap publishes the
  // newest slice of them. These are real analyses rather than thin pages, but
  // most are one-off submissions of small personal sites, and putting every
  // one of several hundred into the index is not what this sitemap is for.
  const SITEMAP_ANALYSES = 250;
  const analyses = await require("../lib/designMdArchive")
    .list()
    .then((l) => l.slice(0, SITEMAP_ANALYSES).map((e) => `/tools/design-md/analysis/${e.slug}`))
    .catch(() => []);
  analyses.forEach((u) => urls.add(u));
  const fetchers = [
    cms.getCoworkers,
    cms.getOffers,
    cms.getVendors,
    cms.getUseCases,
    cms.getIndustries,
    cms.getGuides,
    cms.getPosts,
    cms.getReleases,
    cms.getComparisons,
    cms.getPages,
  ];
  const [coworkers, offers, vendors, useCases, industries, guides, posts, releases, comparisons, pages] =
    await Promise.all(fetchers.map(safe));
  if (outage && failures === fetchers.length) throw outage;

  // Task URLs use the coworker's PUBLIC slug; offers join on catalogSlug.
  const publicSlugByAgent = new Map();
  for (const c of coworkers) {
    if (c.active === false) continue;
    publicSlugByAgent.set(c.catalogSlug || c.slug, c.slug);
    urls.add(`/ai-coworkers/${c.slug}`);
  }
  for (const o of offers) {
    const pub = publicSlugByAgent.get(o.agentSlug);
    if (o.active === false || !pub) continue;
    urls.add(`/ai-coworkers/${pub}/tasks/${o.slug}`);
  }
  for (const v of vendors) urls.add(`/vendors/${v.slug}`);
  const industriesWithUseCases = new Set();
  for (const u of useCases) {
    urls.add(`/use-cases/${u.slug}`);
    for (const ind of u.industries || []) {
      if (ind && typeof ind === "object" && ind.slug) industriesWithUseCases.add(ind.slug);
    }
  }
  for (const ind of industries) {
    if (industriesWithUseCases.has(ind.slug)) urls.add(`/use-cases/industries/${ind.slug}`);
  }
  for (const g of guides) urls.add(`/guides/${g.slug}`);
  for (const p of posts) urls.add(`/blog/${p.slug}`);
  for (const r of releases) urls.add(`/releases/${r.slug}`);
  for (const c of comparisons) urls.add(`/compare/${c.slug}`);
  for (const p of pages) urls.add(`/${p.slug}`);
  for (const slug of require("./legal").SLUGS) urls.add(`/legal/${slug}`);

  // Both locales of every page, each carrying the full hreflang cluster —
  // Google wants the alternates repeated on every member of the pair.
  const dePath = (u) => (u === "/" ? "/de" : `/de${u}`);
  const entry = (loc, u) => {
    const en = esc(SITE + u);
    const de = esc(SITE + dePath(u));
    // An hreflang cluster claims both members are the same page in different
    // languages, so it is only emitted where the German really is German.
    const alternates = !u.startsWith("/tools") && i18n.deIndexable(u)
      ? `<xhtml:link rel="alternate" hreflang="en" href="${en}"/>` +
        `<xhtml:link rel="alternate" hreflang="de" href="${de}"/>` +
        `<xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`
      : "";
    return `  <url><loc>${loc === "de" ? de : en}</loc>${alternates}</url>`;
  };
  const body = [...urls]
    .flatMap((u) => (!u.startsWith("/tools") && i18n.deIndexable(u) ? [entry("en", u), entry("de", u)] : [entry("en", u)]))
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}

module.exports = {
  llmsTxt, notFound, serverError, serviceUnavailable, press, robots, sitemap };

// 404 page, the static /press fallback, robots.txt, and the CMS-driven
// sitemap.

const shell = require("./shell");
const cms = require("../lib/cms");
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
      <h1>We couldn't find that</h1>
      <p>${esc(message || "This page may have moved, or it isn't published yet.")}</p>
      <a class="btn btn-primary" href="/">Back to the homepage</a>
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
      <h1>Something went wrong</h1>
      <p>We hit a snag rendering this page. Try again in a moment.</p>
      <a class="btn btn-primary" href="/">Back to the homepage</a>
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
      title: "Back in a moment | Sokosumi",
      description: "This Sokosumi page is temporarily unavailable while our content service recovers.",
      path: "/503",
      noindex: true,
    }) +
    `<div class="notice">
      <h1>Back in a moment</h1>
      <p>This page's content is briefly unavailable while our content service recovers. It still exists &mdash; try again in a minute or two.</p>
      <a class="btn btn-primary" href="/">Back to the homepage</a>
    </div>` +
    pageEnd()
  );
}

// Static /press fallback, used when no CMS page with slug "press" exists.
function press() {
  const cr = [{ label: "Home", href: "/" }, { label: "Press" }];
  return (
    pageStart({
      title: "Press | Sokosumi",
      description: "Press information and media contact for Sokosumi, the AI coworker marketplace by Serviceplan Group.",
      path: "/press",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>Press</h1>
      <p class="sub">Sokosumi is the marketplace for AI coworkers, built by Serviceplan Group. For interviews, background, or assets, reach out and we will get back to you quickly.</p>
    </div>
    <div class="page-section flush">
      <div class="card-grid" style="max-width:820px">
        <div class="card">
          <h2>Media inquiries</h2>
          <p>Interviews, comments, and background conversations with the Sokosumi team.</p>
          <a class="btn btn-primary" style="margin-top:6px;align-self:flex-start" href="${PRESS_MAILTO}">Email the team</a>
        </div>
        <div class="card">
          <h2>Facts</h2>
          <p>Sokosumi gives marketing teams AI coworkers with real roles that deliver finished files. It is built by Serviceplan Group, one of the world's leading agency groups, together with NMKR.</p>
        </div>
      </div>
    </div>
    <section class="page-section" data-reveal>
      <h2>Product imagery</h2>
      <p class="sub">Screenshots of the live product, free to use in coverage of Sokosumi. Please credit Sokosumi.</p>
      ${shell.shotGallery()}
    </section>` +
    shell.ctaBand({
      heading: "See the product for yourself",
      subheading: "The whole marketplace is browsable before you spend a credit.",
      ctaLabel: "Start free",
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
    "/contact",
    "/contact/sales",
    "/contact/support",
    "/legal",
    "/list-your-agent",
    "/press",
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

  const body = [...urls].map((u) => `  <url><loc>${esc(SITE + u)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

module.exports = { notFound, serverError, serviceUnavailable, press, robots, sitemap };

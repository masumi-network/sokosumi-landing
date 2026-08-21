// The navigation model shared by the landing page and every sub-page: the top
// vendors with a few of their coworkers, and the industry list for the use-case
// menu. Built from the CMS reads in lib/cms.js, which are already cached with
// stale-on-error, so calling this per request is cheap.
//
// The menu shows CURATED coworkers only (kind = "coworker"). Marketplace
// listings outnumber them ten to one and would bury them; the panel's
// "Show all coworkers" link is the way through to the full catalog.

const cms = require("./cms");

// Serviceplan Group leads the roster, the CTA faces, and the nav menu —
// regardless of headcount. Ranking the menu purely by coworker count put
// utxo AG (8 curated) above them (5). /ai-coworkers already leads with this
// same slug; keep the two in step.
const FEATURED_VENDOR = "serviceplan-group";
const TOP_VENDORS = 3;
const PICKS_PER_VENDOR = 4;
const TOP_INDUSTRIES = 6;
const PICKS_PER_INDUSTRY = 3;
// Six jobs is the whole Use cases menu: two columns of three face+title rows.
const POPULAR_USE_CASES = 6;

function vendorSlugOf(c) {
  return c.vendor && typeof c.vendor === "object" ? c.vendor.slug : null;
}

async function buildNav(opts) {
  const [vendors, coworkers, industries, useCases, pages] = await Promise.all([
    cms.getVendors(opts).catch(() => []),
    cms.getCoworkers(opts).catch(() => []),
    cms.getIndustries(opts).catch(() => []),
    cms.getUseCases(opts).catch(() => []),
    cms.getPages(opts).catch(() => []),
  ]);

  const byVendor = new Map();
  for (const c of coworkers) {
    if (c.kind !== "coworker") continue;
    const slug = vendorSlugOf(c);
    if (!slug) continue;
    if (!byVendor.has(slug)) byVendor.set(slug, []);
    byVendor.get(slug).push(c);
  }

  // The menu carries the wordmark, so it needs the same source precedence the
  // pages use: an editor's upload wins, otherwise the synced artwork plus the
  // flag that says it is white and needs flattening.
  const logoOf = (v) => {
    const uploaded = cms.mediaUrl(v.logo);
    const url = uploaded || v.logoUrl || null;
    if (!url) return null;
    return { url, invert: Boolean(!uploaded && v.logoInvert) };
  };

  const ranked = vendors
    .map((v) => {
      const mine = byVendor.get(v.slug) || [];
      return {
        name: v.name,
        slug: v.slug,
        total: mine.length,
        score: mine.length,
        logo: logoOf(v),
        picks: mine.slice(0, PICKS_PER_VENDOR).map((c) => ({
          name: c.name,
          slug: c.slug,
          role: c.role || "",
          image: c.image || null,
        })),
      };
    })
    .filter((v) => v.picks.length)
    .sort((a, b) => {
      const af = a.slug === FEATURED_VENDOR;
      const bf = b.slug === FEATURED_VENDOR;
      if (af !== bf) return af ? -1 : 1;
      return b.score - a.score || a.name.localeCompare(b.name);
    })
    .slice(0, TOP_VENDORS);

  // Industries that actually have use cases, so the menu never dead-ends.
  // Each carries a few of its own use cases: an industry name alone tells a
  // visitor nothing about whether the work they need is on the other side.
  const byIndustry = new Map();
  for (const uc of useCases) {
    for (const ind of uc.industries || []) {
      if (!ind || typeof ind !== "object" || !ind.slug) continue;
      if (!byIndustry.has(ind.slug)) byIndustry.set(ind.slug, []);
      byIndustry.get(ind.slug).push({ title: uc.title, slug: uc.slug });
    }
  }
  const withCases = industries.filter((i) => (byIndustry.get(i.slug) || []).length);
  const shownIndustries = (withCases.length ? withCases : industries)
    .map((i) => {
      const picks = byIndustry.get(i.slug) || [];
      return { name: i.name, slug: i.slug, count: picks.length, picks: picks.slice(0, PICKS_PER_INDUSTRY) };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, TOP_INDUSTRIES);

  // The jobs list that IS the Use cases menu: each use case with its primary
  // industry (the first industry on the doc — same convention the breadcrumb
  // and card eyebrow use). No coworker faces here: a use case is a piece of
  // work run by a team, not one person's act. Most cross-industry work
  // first, so the menu leads with the jobs the widest audience recognises;
  // the full industry taxonomy lives on /use-cases where the filter bar has
  // room for it.
  const popular = [...useCases]
    .sort((a, b) => (b.industries || []).length - (a.industries || []).length || String(a.title).localeCompare(String(b.title)))
    .slice(0, POPULAR_USE_CASES)
    .map((uc) => {
      const inds = (uc.industries || []).filter((i) => i && typeof i === "object" && i.name);
      return { title: uc.title, slug: uc.slug, industry: inds.length ? inds[0].name : "" };
    });

  // Portraits for the CTA bands. Curated coworkers only — marketplace listings
  // are line icons that read as clip art at avatar size. The featured vendor's
  // people lead, because the point of the faces is to look friendly and those
  // are the drawn portraits rather than the statue avatars.
  const portraits = coworkers
    .filter((c) => c.kind === "coworker" && c.image)
    .sort((a, b) => (a.order || 100) - (b.order || 100) || a.name.localeCompare(b.name));
  // The featured vendor's roster is the set of drawn human portraits; the rest
  // are statue avatars that read cold on an ink band. Use the people when there
  // are enough of them, otherwise take whatever portraits exist.
  const featured = portraits.filter((c) => vendorSlugOf(c) === FEATURED_VENDOR);
  const faces = (featured.length >= 3 ? featured : portraits).map((c) => ({
    name: c.name,
    image: c.image,
    slug: c.slug,
  }));

  // The product deep-dives, in the reading order the hub uses.
  const PRODUCT_ORDER = ["product/ai-coworkers", "product/briefing", "product/task-board", "product/outputs"];
  const productPages = pages
    .filter((p) => typeof p.slug === "string" && p.slug.startsWith("product/"))
    .sort((a, b) => {
      const ai = PRODUCT_ORDER.indexOf(a.slug);
      const bi = PRODUCT_ORDER.indexOf(b.slug);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map((p) => ({ title: p.title, slug: p.slug, description: p.description || "" }));

  return { vendors: ranked, industries: shownIndustries, popularUseCases: popular, productPages, faces };
}

module.exports = { buildNav };

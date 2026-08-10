// The navigation model shared by the landing page and every sub-page: the top
// vendors with a few of their coworkers, and the industry list for the use-case
// menu. Built from the CMS reads in lib/cms.js, which are already cached with
// stale-on-error, so calling this per request is cheap.
//
// The menu shows CURATED coworkers only (kind = "coworker"). Marketplace
// listings outnumber them ten to one and would bury them; the panel's
// "Show all coworkers" link is the way through to the full catalog.

const cms = require("./cms");

const TOP_VENDORS = 3;
// Serviceplan Group leads the roster and the CTA faces.
const FEATURED_VENDOR = "serviceplan-group";
const PICKS_PER_VENDOR = 4;

function vendorSlugOf(c) {
  return c.vendor && typeof c.vendor === "object" ? c.vendor.slug : null;
}

async function buildNav(opts) {
  const [vendors, coworkers, industries, useCases] = await Promise.all([
    cms.getVendors(opts).catch(() => []),
    cms.getCoworkers(opts).catch(() => []),
    cms.getIndustries(opts).catch(() => []),
    cms.getUseCases(opts).catch(() => []),
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
        })),
      };
    })
    .filter((v) => v.picks.length)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, TOP_VENDORS);

  // Industries that actually have use cases, so the menu never dead-ends.
  const counts = {};
  for (const uc of useCases) {
    for (const ind of uc.industries || []) {
      if (ind && typeof ind === "object" && ind.slug) counts[ind.slug] = (counts[ind.slug] || 0) + 1;
    }
  }
  const withCases = industries.filter((i) => counts[i.slug]);
  const shownIndustries = (withCases.length ? withCases : industries)
    .slice(0, 6)
    .map((i) => ({ name: i.name, slug: i.slug, count: counts[i.slug] || 0 }));

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

  return { vendors: ranked, industries: shownIndustries, faces };
}

module.exports = { buildNav };

// The navigation model shared by the landing page and every sub-page:
// the top vendors with a few of their agents, and the industry list for the
// use-case menu. Built from the CMS reads in lib/cms.js, which are already
// cached with stale-on-error, so calling this per request is cheap.

const cms = require("./cms");

const TOP_VENDORS = 3;
const AGENTS_PER_VENDOR = 3;

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

  // Rank vendors by how much of the catalog they actually supply, with
  // curated coworkers weighted above marketplace agents.
  const byVendor = new Map();
  for (const c of coworkers) {
    const slug = vendorSlugOf(c);
    if (!slug) continue;
    if (!byVendor.has(slug)) byVendor.set(slug, []);
    byVendor.get(slug).push(c);
  }

  const ranked = vendors
    .map((v) => {
      const mine = byVendor.get(v.slug) || [];
      const curated = mine.filter((c) => c.kind === "coworker");
      const agents = mine.filter((c) => c.kind !== "coworker");
      return {
        name: v.name,
        slug: v.slug,
        total: mine.length,
        score: curated.length * 10 + agents.length,
        // Curated coworkers lead: they are the ones with template tasks.
        picks: [...curated, ...agents].slice(0, AGENTS_PER_VENDOR).map((c) => ({
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

  return { vendors: ranked, industries: shownIndustries };
}

module.exports = { buildNav };

// /vendors (index) and /vendors/<slug> (detail) — the teams that build and
// operate the AI coworkers on the marketplace. CMS `vendors` collection;
// coworkers are joined client-side by vendor slug.

const shell = require("./shell");
const cms = require("../lib/cms");
const { esc, attr, icon, avatar, vendorLogo, pageStart, pageEnd } = shell;

function vendorSlugOf(c) {
  return c.vendor && typeof c.vendor === "object" ? c.vendor.slug : null;
}

function countLabel(total) {
  if (!total) return "View";
  return `${total} coworker${total === 1 ? "" : "s"}`;
}

function vendorRow(v) {
  const total = v.curatedCount + v.agentCount;
  const desc =
    v.description ||
    `${total} AI coworker${total === 1 ? "" : "s"} on Sokosumi.`;
  return `<a class="row-item" href="/vendors/${encodeURIComponent(v.slug)}">
    <span class="row-title">${vendorLogo(v, "sm")}${esc(v.name)}</span>
    <p>${esc(desc)}</p>
    <span class="row-go">${esc(countLabel(v.curatedCount + v.agentCount))} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function index(ctx) {
  const opts = { draft: ctx.preview };
  const [vendors, coworkers] = await Promise.all([cms.getVendors(opts), cms.getCoworkers(opts)]);

  const rows = vendors
    .map((v) => {
      const mine = coworkers.filter((c) => vendorSlugOf(c) === v.slug);
      return {
        ...v,
        curatedCount: mine.filter((c) => c.kind === "coworker").length,
        agentCount: mine.filter((c) => c.kind === "agent").length,
      };
    })
    .filter((v) => v.curatedCount + v.agentCount > 0 || v.description);

  const cr = [{ label: "Home", href: "/" }, { label: "Vendors" }];
  return (
    pageStart({
      title: "Vendors | Sokosumi",
      description:
        "The teams that build and operate the AI coworkers on the Sokosumi marketplace.",
      path: "/vendors",
      breadcrumb: cr,
      jsonld: shell.itemListLd("Vendors on Sokosumi", "/vendors", rows.map((v) => ({ name: v.name, path: `/vendors/${v.slug}` }))),
    }) +
    `<div class="page-head" data-reveal>
      <h1>The vendors behind the coworkers</h1>
      <p class="sub">Every AI coworker on Sokosumi is built and operated by a vendor: a team that ships it, keeps it running, and stands behind its work.</p>
    </div>` +
    (rows.length
      ? `<div class="page-section flush">
          <div class="row-list vendor-list">${rows.map(vendorRow).join("")}</div>
        </div>`
      : `<div class="page-section flush"><p class="muted">Vendor profiles are on the way. In the meantime, <a href="/coworkers" style="text-decoration:underline">meet the coworkers</a>.</p></div>`) +
    shell.ctaBand({
      heading: "Hire from any of them, in one place",
      subheading: "One account, one credit balance, every vendor on the marketplace. Signing up is free.",
      ctaLabel: "Start free",
      seed: rows.length,
    }) +
    pageEnd()
  );
}

function tile(c, i) {
  const img = c.image
    ? `<span class="portrait${c.kind === "agent" ? " is-icon" : ""}"><img src="${attr(c.image)}" alt="${attr(c.name)}" loading="lazy" /></span>`
    : `<span class="portrait"></span>`;
  return `<a class="cw-tile" href="/coworkers/${encodeURIComponent(c.slug)}" data-reveal style="--i:${i % 4}">
    ${img}
    <h3>${esc(c.name)}</h3>
    ${c.role ? `<span class="role">${esc(c.role)}</span>` : ""}
    <span class="count">Meet the coworker</span>
  </a>`;
}

function agentRow(c) {
  return `<a class="row-item" href="/coworkers/${encodeURIComponent(c.slug)}">
    <span style="display:flex;align-items:center;gap:12px">${avatar(c, "sm")}<span class="row-title">${esc(c.name)}</span></span>
    <p>${esc((c.description || "").slice(0, 160))}</p>
    <span class="row-go">View ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function detail(ctx) {
  const opts = { draft: ctx.preview };
  const [v, coworkers] = await Promise.all([
    cms.getVendor(ctx.params.slug, opts),
    cms.getCoworkers(opts),
  ]);
  if (!v) return null;

  const mine = coworkers.filter((c) => vendorSlugOf(c) === v.slug);
  const curated = mine.filter((c) => c.kind === "coworker");
  const agents = mine.filter((c) => c.kind === "agent");

  let website = "";
  if (v.website) {
    const href = /^https?:\/\//.test(v.website) ? v.website : `https://${v.website}`;
    const label = v.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
    website = `<div class="meta-row"><a href="${attr(href)}" target="_blank" rel="noreferrer" style="text-decoration:underline">${esc(label)}</a></div>`;
  }

  const coworkersSection = curated.length
    ? `<section class="page-section flush">
        <h2>Featured coworkers</h2>
        <p class="sub">Named specialists from ${esc(v.name)}, each with a real role and a public profile.</p>
        <div class="cw-grid">${curated.map(tile).join("")}</div>
      </section>`
    : "";

  const agentsSection = agents.length
    ? `<section class="page-section${curated.length ? "" : " flush"}">
        <h2>More from ${esc(v.name)}</h2>
        <p class="sub">${agents.length} specialist coworker${agents.length === 1 ? "" : "s"} on the marketplace, ready to run in the app.</p>
        <div class="row-list">${agents.map(agentRow).join("")}</div>
      </section>`
    : "";

  const empty =
    !curated.length && !agents.length
      ? `<div class="page-section flush"><p class="muted">${esc(v.name)} has no listings on Sokosumi yet. In the meantime, <a href="/coworkers" style="text-decoration:underline">meet the coworkers</a>.</p></div>`
      : "";

  const cr = [
    { label: "Home", href: "/" },
    { label: "Vendors", href: "/vendors" },
    { label: v.name },
  ];
  return (
    pageStart({
      title: `${v.name} | Vendors on Sokosumi`,
      description: (v.description || `${v.name} builds and operates AI coworkers on Sokosumi.`).slice(0, 155),
      path: `/vendors/${v.slug}`,
      breadcrumb: cr,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${shell.SITE}/vendors/${v.slug}#org`,
        name: v.name,
        // `url` is the company's own homepage. Pointing it at their profile on
        // this site claimed sokosumi.com/vendors/x IS their website.
        url: v.website || undefined,
        mainEntityOfPage: { "@type": "WebPage", "@id": `${shell.SITE}/vendors/${v.slug}` },
        description: v.description || undefined,
        logo: v.logoLight || v.logoDark || undefined,
      },
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">Vendor</span>
      ${vendorLogo(v, "lg")}
      <h1>${esc(v.name)}</h1>
      ${v.description ? `<p class="sub">${esc(v.description)}</p>` : ""}
      ${website}
    </div>
    ${coworkersSection}
    ${agentsSection}
    ${empty}` +
    shell.ctaBand({
      heading: `Work with ${v.name} on Sokosumi`,
      subheading: "One account covers every vendor on the marketplace.",
      ctaLabel: "Start free",
      seed: v.name.length,
    }) +
    pageEnd()
  );
}

module.exports = { index, detail };

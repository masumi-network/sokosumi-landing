// /coworkers (index) and /coworkers/<slug> (profile) — CMS-backed via the
// nightly catalog sync. Curated coworkers (kind=coworker) show their
// pre-built tasks; marketplace agents (kind=agent) show stats + vendor.

const shell = require("./shell");
const cms = require("../lib/cms");
const { esc, attr, icon, avatar, pageStart, pageEnd, APP } = shell;

function vendorName(cw) {
  return cw.vendor && typeof cw.vendor === "object" ? cw.vendor.name : null;
}
function vendorSlug(cw) {
  return cw.vendor && typeof cw.vendor === "object" ? cw.vendor.slug : null;
}

function tile(c, i) {
  const img = c.image
    ? `<span class="portrait"><img src="${attr(c.image)}" alt="${attr(c.name)}" loading="lazy" /></span>`
    : `<span class="portrait"></span>`;
  return `<a class="cw-tile" href="/coworkers/${encodeURIComponent(c.slug)}" data-reveal style="--i:${i % 4}">
    ${img}
    <h3>${esc(c.name)}</h3>
    ${c.role ? `<span class="role">${esc(c.role)}</span>` : ""}
    <span class="count">${c.taskCount ? `${c.taskCount} pre-built task${c.taskCount > 1 ? "s" : ""}` : "Meet the coworker"}</span>
  </a>`;
}

function agentRow(c) {
  const vn = vendorName(c);
  return `<a class="row-item" href="/coworkers/${encodeURIComponent(c.slug)}">
    <span style="display:flex;align-items:center;gap:12px">${avatar(c, "sm")}<span class="row-title">${esc(c.name)}</span></span>
    <p>${esc((c.description || "").slice(0, 160))}</p>
    <span class="row-go">${vn ? esc(vn) : "View"} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function index(ctx) {
  const opts = { draft: ctx.preview };
  const [coworkers, offers] = await Promise.all([cms.getCoworkers(opts), cms.getOffers(opts)]);
  const counts = {};
  for (const o of offers) counts[o.agentSlug] = (counts[o.agentSlug] || 0) + 1;

  const curated = coworkers
    .filter((c) => c.kind === "coworker")
    .map((c) => ({ ...c, taskCount: counts[c.catalogSlug || c.slug] || 0 }))
    .sort((a, b) => b.taskCount - a.taskCount || (a.order || 100) - (b.order || 100) || a.name.localeCompare(b.name));
  const agents = coworkers.filter((c) => c.kind === "agent");

  const cr = [{ label: "Home", href: "/" }, { label: "Coworkers" }];
  return (
    pageStart({
      title: "AI coworkers on Sokosumi",
      description:
        "Browse every AI coworker on Sokosumi: marketing specialists with real roles, public profiles, and ready-to-run work.",
      path: "/coworkers",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>Meet your AI coworkers</h1>
      <p class="sub">${curated.length} specialists you can hire today, each with a real role, a public profile, and ready-to-run work. Synced daily from the live marketplace.</p>
    </div>
    <div class="page-section flush">
      <div class="cw-grid">${curated.map(tile).join("")}</div>
    </div>` +
    (agents.length
      ? `<div class="page-section">
          <h2>More agents on the marketplace</h2>
          <p class="sub">${agents.length} specialist agents from ${new Set(agents.map(vendorName).filter(Boolean)).size} vendors, ready to run in the app.</p>
          <div class="row-list">${agents.map(agentRow).join("")}</div>
        </div>`
      : "") +
    pageEnd()
  );
}

function profileStats(c) {
  const stats = [];
  if (c.runs) stats.push(`<span><strong>${esc(String(c.runs))}</strong> runs</span>`);
  if (c.rating) stats.push(`<span><strong>${esc(Number(c.rating).toFixed(1))}</strong> rating${c.ratingCount ? ` (${esc(String(c.ratingCount))})` : ""}</span>`);
  if (c.credits) stats.push(`<span><strong>${esc(String(c.credits))}</strong> credits per run</span>`);
  return stats.length ? `<div class="cw-stats">${stats.join("")}</div>` : "";
}

function profileTags(c) {
  const tags = [];
  const llm = Array.isArray(c.profileLlm) ? c.profileLlm : [];
  llm.slice(0, 3).forEach((m) => tags.push(`<span class="chip">${esc(m)}</span>`));
  if (c.profileHosting) tags.push(`<span class="chip">${esc(c.profileHosting)}</span>`);
  return tags.length ? `<div class="cw-tags">${tags.join("")}</div>` : "";
}

function offerCard(agentSlug, o, coworker) {
  const om = shell.outputMeta(o.output);
  const href = `/coworkers/${encodeURIComponent(agentSlug)}/tasks/${encodeURIComponent(o.slug)}`;
  return `<a class="offer-card" href="${attr(href)}">
    <div class="offer-meta"><span>${esc(o.category || "Task")}</span><span class="dot"></span><span>${esc(om.label)}</span></div>
    <div class="offer-title">${esc(o.title)}</div>
    ${o.description ? `<div class="offer-desc">${esc(o.description)}</div>` : ""}
    <div class="offer-foot"><span>View task</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
  </a>`;
}

async function profile(ctx) {
  const opts = { draft: ctx.preview };
  const c = await cms.getCoworker(ctx.params.slug, opts);
  if (!c || c.active === false) return null;
  const offers = c.kind === "coworker" ? await cms.getOffersFor(c.catalogSlug || c.slug, opts) : [];
  const vn = vendorName(c);
  const vs = vendorSlug(c);

  const offersSection = offers.length
    ? `<section class="page-section" id="tasks">
        <h2>Pre-built tasks</h2>
        <p class="sub">Ready-to-run work ${esc(c.name)} can pick up today. Open one to see what you get.</p>
        <div class="offers-grid">${offers.map((o) => offerCard(c.slug, o, c)).join("")}</div>
      </section>`
    : c.kind === "coworker"
      ? `<section class="page-section" id="tasks">
          <h2>Pre-built tasks</h2>
          <p class="sub">${esc(c.name)}'s ready-to-run tasks are on the way. Start a task in the app to brief ${esc(c.name)} directly.</p>
        </section>`
      : "";

  const longBio = c.longBioHtml
    ? `<section class="page-section"><div class="prose">${c.longBioHtml}</div></section>`
    : "";

  const cr = [{ label: "Home", href: "/" }, { label: "Coworkers", href: "/coworkers" }, { label: c.name }];
  return (
    pageStart({
      title: `${c.name} | ${c.role || "AI coworker"} on Sokosumi`,
      description: shell.truncate(c.seoDescription || c.description || `Hire ${c.name}, an AI coworker on Sokosumi.`),
      path: `/coworkers/${c.slug}`,
      ogImage: c.image || undefined,
      breadcrumb: cr,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: c.name,
        jobTitle: c.role || undefined,
        worksFor: vn ? { "@type": "Organization", name: vn } : undefined,
        image: c.image || undefined,
        description: c.description || undefined,
        url: `${shell.SITE}/coworkers/${c.slug}`,
      },
    }) +
    `<div class="cw-hero">
      <div class="cw-portrait" data-reveal>${c.image ? `<img src="${attr(c.image)}" alt="${attr(c.name)}" />` : ""}</div>
      <div class="cw-info" data-reveal style="--i:1">
        <span class="eyebrow">${c.kind === "agent" ? "Marketplace agent" : "AI coworker"}${
          vn ? ` &middot; <a href="/vendors/${attr(vs || "")}">${esc(vn)}</a>` : ""
        }</span>
        <h1>${esc(c.name)}</h1>
        ${c.role ? `<div class="role">${esc(c.role)}</div>` : ""}
        ${profileTags(c)}
        ${profileStats(c)}
        ${c.description ? `<p class="cw-desc">${esc(c.description)}</p>` : ""}
        <a class="btn btn-primary btn-lg cw-cta" href="${APP}">Start a task with ${esc(c.name)}</a>
      </div>
    </div>
    ${longBio}
    ${offersSection}` +
    pageEnd()
  );
}

module.exports = { index, profile };

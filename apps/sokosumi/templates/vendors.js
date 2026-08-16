// /vendors (index) and /vendors/<slug> (detail) — the teams that build and
// operate the AI coworkers on the marketplace. CMS `vendors` collection;
// coworkers are joined client-side by vendor slug, offers by the coworkers'
// catalog slug — so every number on these pages is computed from the live
// catalog and stays true without editing.

const shell = require("./shell");
const cms = require("../lib/cms");
const { esc, attr, icon, avatar, vendorLogo, truncate, pageStart, pageEnd } = shell;

function vendorSlugOf(c) {
  return c.vendor && typeof c.vendor === "object" ? c.vendor.slug : null;
}

// Join key between a coworker and its offers: the product's internal slug,
// falling back to the public one (see lib/cms.js getCoworkerByCatalogSlug).
function offerKey(c) {
  return c.catalogSlug || c.slug;
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// "AI coworkers & agents" / "AI coworkers" / "AI agents" — whatever the
// vendor actually ships, so a heading never claims a thing that is not on
// the page below it. HTML-escaped, for direct use in the h1.
function kindLabel(curatedCount, agentCount) {
  if (curatedCount && agentCount) return "AI coworkers &amp; agents";
  if (curatedCount) return "AI coworkers";
  if (agentCount) return "AI agents";
  return "";
}

// ── index ────────────────────────────────────────────────────────────────

function vendorRow(v) {
  const bits = [];
  if (v.curatedCount) bits.push(plural(v.curatedCount, "coworker"));
  if (v.agentCount) bits.push(plural(v.agentCount, "agent"));
  const label = bits.join(" · ") || "View";
  const desc = v.description
    ? truncate(v.description, 160)
    : `Builds and operates ${[
        v.curatedCount ? plural(v.curatedCount, "AI coworker") : "",
        v.agentCount ? plural(v.agentCount, "specialist AI agent") : "",
      ]
        .filter(Boolean)
        .join(" and ")}${v.taskCount ? `, with ${plural(v.taskCount, "ready-to-run template task")}` : ""} on Sokosumi.`;
  return `<a class="row-item" href="/vendors/${encodeURIComponent(v.slug)}">
    <span class="row-title">${vendorLogo(v, "sm")}${esc(v.name)}</span>
    <p>${esc(desc)}</p>
    <span class="row-go">${esc(label)} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function index(ctx) {
  const opts = { draft: ctx.preview };
  const [vendors, coworkers, offers] = await Promise.all([
    cms.getVendors(opts),
    cms.getCoworkers(opts),
    // Only feeds the per-vendor task counts; the page must render without it.
    cms.getOffers(opts).catch(() => []),
  ]);

  const rows = vendors
    .map((v) => {
      const mine = coworkers.filter((c) => vendorSlugOf(c) === v.slug);
      const keys = new Set(mine.map(offerKey));
      return {
        ...v,
        curatedCount: mine.filter((c) => c.kind === "coworker").length,
        agentCount: mine.filter((c) => c.kind === "agent").length,
        taskCount: offers.filter((o) => keys.has(o.agentSlug)).length,
      };
    })
    .filter((v) => v.curatedCount + v.agentCount > 0 || v.description)
    // CMS `order` first, so an editor can pin a vendor to the top. Everyone
    // still on the default (100) sorts by substance: curated roster, then
    // marketplace footprint.
    .sort(
      (a, b) =>
        (a.order || 100) - (b.order || 100) ||
        b.curatedCount - a.curatedCount ||
        b.agentCount - a.agentCount ||
        a.name.localeCompare(b.name),
    );

  const totals = rows.reduce(
    (t, v) => ({ curated: t.curated + v.curatedCount, agents: t.agents + v.agentCount }),
    { curated: 0, agents: 0 },
  );
  const facts = [];
  if (rows.length) facts.push(`<span><strong>${rows.length}</strong> vendors</span>`);
  if (totals.curated) facts.push(`<span><strong>${totals.curated}</strong> AI coworkers</span>`);
  if (totals.agents) facts.push(`<span><strong>${totals.agents}</strong> marketplace agents</span>`);

  const cr = [{ label: "Home", href: "/" }, { label: "Vendors" }];
  return (
    pageStart({
      title: "AI Coworker & Agent Vendors | Sokosumi",
      description:
        "Meet the vendors behind Sokosumi's AI coworkers and agents: the teams that build them, operate them, and stand behind their work.",
      path: "/vendors",
      breadcrumb: cr,
      jsonld: shell.itemListLd("Vendors on Sokosumi", "/vendors", rows.map((v) => ({ name: v.name, path: `/vendors/${v.slug}` }))),
    }) +
    `<div class="page-head" data-reveal>
      <h1>The vendors behind the AI coworkers</h1>
      <p class="sub">Every AI coworker and agent on Sokosumi is built and operated by a vendor: a team that ships it, keeps it running, and stands behind its work. Pick a vendor to see who they ship, what those coworkers can do, and the models they run on.</p>
      ${facts.length ? `<div class="cw-stats vendor-facts">${facts.join("")}</div>` : ""}
    </div>` +
    (rows.length
      ? `<div class="page-section flush">
          <div class="row-list vendor-list">${rows.map(vendorRow).join("")}</div>
        </div>`
      : `<div class="page-section flush"><p class="muted">Vendor profiles are on the way. In the meantime, <a href="/ai-coworkers" style="text-decoration:underline">meet the coworkers</a>.</p></div>`) +
    shell.ctaBand({
      heading: "Hire from any of them, in one place",
      subheading: "One account, one credit balance, every vendor on the marketplace. Signing up is free.",
      ctaLabel: "Start free",
      seed: rows.length,
    }) +
    pageEnd()
  );
}

// ── detail ───────────────────────────────────────────────────────────────

// A curated coworker, presented as a colleague rather than a link: portrait,
// role, what it actually does, the model it runs on, and how much of its work
// is ready to start.
function coworkerCard(c, taskCount, i) {
  const models = (Array.isArray(c.profileLlm) ? c.profileLlm : []).filter(Boolean);
  const chips = models.slice(0, 2).map((m) => `<span class="chip">${esc(m)}</span>`);
  if (taskCount) chips.push(`<span class="chip">${esc(plural(taskCount, "template task"))}</span>`);
  const face = c.image
    ? `<span class="vcw-face"><img src="${attr(c.image)}" alt="${attr(c.name)}" loading="lazy" /></span>`
    : `<span class="vcw-face"></span>`;
  return `<a class="card vcw-card" href="/ai-coworkers/${encodeURIComponent(c.slug)}" data-reveal style="--i:${i % 3}">
    <span class="vcw-head">
      ${face}
      <span class="vcw-id"><h3>${esc(c.name)}</h3>${c.role ? `<span class="role">${esc(c.role)}</span>` : ""}</span>
    </span>
    ${c.description ? `<p>${esc(truncate(c.description, 170))}</p>` : ""}
    <span class="vcw-foot">${chips.join("")}<span class="go">${icon("arrow-up-right", 15)}</span></span>
  </a>`;
}

// One capability column: an offer category, how many tasks the vendor's
// coworkers carry in it, and the first few — each linking to its task page.
function capabilityCol(category, offers, ownerOf, i) {
  const shown = offers.slice(0, 4);
  const rest = offers.length - shown.length;
  const links = shown
    .map((o) => {
      const owner = ownerOf(o);
      if (!owner) return "";
      const href = `/ai-coworkers/${encodeURIComponent(owner.slug)}/tasks/${encodeURIComponent(o.slug)}`;
      return `<a class="cap-task" href="${attr(href)}">${esc(o.title)} <small>${esc(owner.name)}</small></a>`;
    })
    .join("");
  return `<div class="cap-col" data-reveal style="--i:${i % 4}">
    <span class="cap-label">${esc(category)} <em>${offers.length}</em></span>
    ${links}
    ${rest > 0 ? `<span class="cap-more">+ ${rest} more</span>` : ""}
  </div>`;
}

function agentRow(c) {
  const stats = [];
  const runCount = Number(c.runs);
  if (Number.isFinite(runCount) && runCount > 0) stats.push(`${runCount.toLocaleString("en-US")} runs`);
  if (c.rating && c.ratingCount) stats.push(`rated ${Number(c.rating).toFixed(1)}/5`);
  if (c.credits) stats.push(`${c.credits} credits per run`);
  return `<a class="row-item" href="/ai-coworkers/${encodeURIComponent(c.slug)}">
    <span style="display:flex;align-items:center;gap:12px">${avatar(c, "sm")}<span class="row-title">${esc(c.name)}</span></span>
    <p>${esc(truncate(c.description || "", 160))}${stats.length ? `<span class="row-stats">${esc(stats.join(" · "))}</span>` : ""}</p>
    <span class="row-go">View ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function detail(ctx) {
  const opts = { draft: ctx.preview };
  const [v, coworkers, offers] = await Promise.all([
    cms.getVendor(ctx.params.slug, opts),
    cms.getCoworkers(opts),
    // Feeds the capability section and task counts; the page renders without it.
    cms.getOffers(opts).catch(() => []),
  ]);
  if (!v) return null;

  const mine = coworkers.filter((c) => vendorSlugOf(c) === v.slug);
  const curated = mine.filter((c) => c.kind === "coworker");
  const agents = mine.filter((c) => c.kind === "agent");

  const byKey = new Map(mine.map((c) => [offerKey(c), c]));
  const myOffers = offers.filter((o) => byKey.has(o.agentSlug));
  const taskCountOf = (c) => myOffers.filter((o) => o.agentSlug === offerKey(c)).length;

  // Aggregates, all derived from the catalog: what the coworkers run on,
  // where they run, and how much the marketplace agents have actually done.
  const models = [...new Set(mine.flatMap((c) => (Array.isArray(c.profileLlm) ? c.profileLlm : [])).filter(Boolean))];
  const regions = [...new Set(mine.map((c) => String(c.profileHosting || "").trim()).filter(Boolean))];
  const totalRuns = agents.reduce((n, c) => n + (Number(c.runs) || 0), 0);

  const kindsH = kindLabel(curated.length, agents.length);

  // ── hero ──
  const facts = [];
  if (curated.length) facts.push(`<span><strong>${curated.length}</strong> AI coworker${curated.length === 1 ? "" : "s"}</span>`);
  if (agents.length) facts.push(`<span><strong>${agents.length}</strong> marketplace agent${agents.length === 1 ? "" : "s"}</span>`);
  if (myOffers.length) facts.push(`<span><strong>${myOffers.length}</strong> template task${myOffers.length === 1 ? "" : "s"}</span>`);
  if (totalRuns) facts.push(`<span><strong>${totalRuns.toLocaleString("en-US")}</strong> tasks run</span>`);

  const subParts = [
    curated.length ? plural(curated.length, "named AI coworker") : "",
    agents.length ? plural(agents.length, "specialist AI agent") : "",
  ].filter(Boolean);
  const computedSub = subParts.length
    ? `${v.name} builds and operates ${subParts.join(" and ")} on the Sokosumi marketplace — hire them with one free account and pay only for the work they run.`
    : "";
  const sub = v.description || computedSub;

  let website = "";
  if (v.website) {
    const href = /^https?:\/\//.test(v.website) ? v.website : `https://${v.website}`;
    const label = v.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
    website = `<div class="meta-row"><a href="${attr(href)}" target="_blank" rel="noreferrer" style="text-decoration:underline">${esc(label)}</a></div>`;
  }

  // ── sections; the first one present sits flush under the hero ──
  let firstSection = true;
  const flush = () => {
    const f = firstSection ? " flush" : "";
    firstSection = false;
    return f;
  };

  const coworkersSection = curated.length
    ? `<section class="page-section${flush()}">
        <h2>AI coworkers from ${esc(v.name)}</h2>
        <p class="sub">Named specialists with real roles and public profiles. Brief them like colleagues; they carry ready-to-run work.</p>
        <div class="${shell.gridCls(curated.length)}">${curated.map((c, i) => coworkerCard(c, taskCountOf(c), i)).join("")}</div>
      </section>`
    : "";

  const catMap = new Map();
  for (const o of myOffers) {
    const key = o.category || "Other";
    if (!catMap.has(key)) catMap.set(key, []);
    catMap.get(key).push(o);
  }
  const cats = [...catMap.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  const capabilitiesSection = cats.length
    ? `<section class="page-section${flush()}">
        <h2>What ${esc(v.name)}&rsquo;s listings can do</h2>
        <p class="sub">${myOffers.length} ready-to-run template task${myOffers.length === 1 ? "" : "s"} across ${cats.length} categor${cats.length === 1 ? "y" : "ies"}. Open one to see the deliverable and a sample of the output.</p>
        <div class="cap-grid">${cats.map(([cat, list], i) => capabilityCol(cat, list, (o) => byKey.get(o.agentSlug), i)).join("")}</div>
        <a class="cap-browse" href="/tasks">Browse all template tasks ${icon("arrow-up-right", 14)}</a>
      </section>`
    : "";

  const stackRows = [
    models.length
      ? `<div class="stack-row"><span class="stack-label">Models</span><span class="stack-chips">${models.map((m) => `<span class="chip">${esc(m)}</span>`).join("")}</span></div>`
      : "",
    regions.length
      ? `<div class="stack-row"><span class="stack-label">Hosting</span><span class="stack-chips">${regions.map((r) => `<span class="chip">${esc(r)}</span>`).join("")}</span></div>`
      : "",
  ].filter(Boolean);
  const stackSection = stackRows.length
    ? `<section class="page-section${flush()}">
        <h2>Models and hosting, stated up front</h2>
        <p class="sub">The ${models.length && regions.length ? "models and hosting regions" : models.length ? "models" : "hosting regions"} on file for ${esc(v.name)}&rsquo;s listings — visible before you spend a credit.</p>
        <div class="stack-rows">${stackRows.join("")}</div>
      </section>`
    : "";

  const agentsSection = agents.length
    ? `<section class="page-section${flush()}">
        <h2>${esc(v.name)} AI agents on the marketplace</h2>
        <p class="sub">${plural(agents.length, "single-purpose specialist agent")} from ${esc(v.name)}${totalRuns ? `, with ${totalRuns.toLocaleString("en-US")} tasks run between them` : ""}. Each one does one job and shows its price in credits before you start.</p>
        <div class="row-list">${agents.map(agentRow).join("")}</div>
      </section>`
    : "";

  const empty =
    !curated.length && !agents.length
      ? `<div class="page-section flush"><p class="muted">${esc(v.name)} has no listings on Sokosumi yet. In the meantime, <a href="/ai-coworkers" style="text-decoration:underline">meet the coworkers</a>.</p></div>`
      : "";

  // ── head ──
  // Title case for the <title>; the h1 keeps sentence case like the rest of
  // the site. Both carry the "<Vendor> AI Coworkers / AI Agents" phrasing the
  // page is meant to answer for — computed from what the vendor actually ships.
  const titleKinds =
    curated.length && agents.length
      ? "AI Coworkers & Agents"
      : curated.length
        ? "AI Coworkers"
        : agents.length
          ? "AI Agents"
          : "";
  const title = titleKinds ? `${v.name} ${titleKinds} | Sokosumi` : `${v.name} | Vendors on Sokosumi`;
  const metaDesc = v.description
    ? truncate(v.description, 155)
    : subParts.length
      ? truncate(`Hire ${subParts.join(" and ")} built and operated by ${v.name} on the Sokosumi marketplace. Free to sign up; credits only go on work you run.`, 155)
      : `${v.name} is a vendor on Sokosumi, the AI coworker marketplace.`;

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${shell.SITE}/vendors/${v.slug}#org`,
    name: v.name,
    // `url` is the company's own homepage. Pointing it at their profile on
    // this site claimed sokosumi.com/vendors/x IS their website.
    url: v.website || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${shell.SITE}/vendors/${v.slug}` },
    description: v.description || undefined,
    logo: cms.mediaUrl(v.logo) || v.logoUrl || undefined,
  };
  const jsonld = [orgLd];
  const listLd = shell.itemListLd(
    `AI coworkers and agents from ${v.name}`,
    `/vendors/${v.slug}`,
    [...curated, ...agents].map((c) => ({ name: c.name, path: `/ai-coworkers/${c.slug}` })),
  );
  if (listLd) jsonld.push(listLd);

  // ctaBand escapes its heading, so this is plain text (curly apostrophe
  // included) — entities here would render literally.
  const ctaHeading = curated.length
    ? `Put ${v.name}’s AI coworkers to work`
    : agents.length
      ? `Run ${v.name}’s AI agents on Sokosumi`
      : `Work with ${v.name} on Sokosumi`;

  const cr = [
    { label: "Home", href: "/" },
    { label: "Vendors", href: "/vendors" },
    { label: v.name },
  ];
  return (
    pageStart({
      title,
      description: metaDesc,
      path: `/vendors/${v.slug}`,
      breadcrumb: cr,
      jsonld,
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">Vendor on Sokosumi</span>
      ${vendorLogo(v, "lg")}
      <h1>${esc(v.name)}${kindsH ? ` ${kindsH}` : ""}</h1>
      ${sub ? `<p class="sub">${esc(sub)}</p>` : ""}
      ${facts.length ? `<div class="cw-stats vendor-facts">${facts.join("")}</div>` : ""}
      ${website}
    </div>
    ${coworkersSection}
    ${capabilitiesSection}
    ${stackSection}
    ${agentsSection}
    ${empty}` +
    shell.ctaBand({
      heading: ctaHeading,
      subheading: "One free account covers every vendor on the marketplace. Credits only go on work you run.",
      ctaLabel: "Start free",
      seed: v.name.length,
    }) +
    pageEnd()
  );
}

module.exports = { index, detail };

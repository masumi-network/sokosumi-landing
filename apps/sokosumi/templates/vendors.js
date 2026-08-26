// /vendors (index) and /vendors/<slug> (detail) — the teams that build and
// operate the AI coworkers on the marketplace. CMS `vendors` collection;
// coworkers are joined client-side by vendor slug, offers by the coworkers'
// catalog slug — so every number on these pages is computed from the live
// catalog and stays true without editing.

const shell = require("./shell");
const cms = require("../lib/cms");
const { t, tp, locale } = require("../lib/i18n");
const { esc, attr, icon, avatar, vendorLogo, truncate, pageStart, pageEnd } = shell;

function vendorSlugOf(c) {
  return c.vendor && typeof c.vendor === "object" ? c.vendor.slug : null;
}

// Join key between a coworker and its offers: the product's internal slug,
// falling back to the public one (see lib/cms.js getCoworkerByCatalogSlug).
function offerKey(c) {
  return c.catalogSlug || c.slug;
}

// "AI coworkers & agents" / "AI coworkers" / "AI agents" — whatever the
// vendor actually ships, so a heading never claims a thing that is not on
// the page below it. HTML-escaped, for direct use in the h1.
function kindLabel(curatedCount, agentCount) {
  if (curatedCount && agentCount) return t("AI coworkers &amp; agents");
  if (curatedCount) return t("AI Coworkers");
  if (agentCount) return t("AI agents");
  return "";
}

// ── index ────────────────────────────────────────────────────────────────

function vendorRow(v) {
  const bits = [];
  if (v.curatedCount) bits.push(tp(v.curatedCount, "{n} coworker", "{n} coworkers"));
  if (v.agentCount) bits.push(tp(v.agentCount, "{n} agent", "{n} agents"));
  const label = bits.join(" · ") || t("View");
  // The computed fallback sentence composes English grammar; in German it is
  // rebuilt from the same facts rather than glued word for word.
  const parts = [
    v.curatedCount ? tp(v.curatedCount, "{n} AI coworker", "{n} AI coworkers") : "",
    v.agentCount ? tp(v.agentCount, "{n} specialist AI agent", "{n} specialist AI agents") : "",
  ].filter(Boolean);
  const desc = v.description
    ? truncate(v.description, 160)
    : t("Builds and operates {what}{tasks} on Sokosumi.", {
        what: parts.join(t(" and ")),
        tasks: v.taskCount ? t(", with {n} ready-to-run template tasks", { n: v.taskCount }) : "",
      });
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
    // A vendor with nothing listed is not shown — an empty storefront reads
    // as broken, and inactive/placeholder records never render.
    .filter((v) => v.curatedCount + v.agentCount > 0)
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
  if (rows.length) facts.push(`<span><strong>${rows.length}</strong> ${esc(t("Vendors"))}</span>`);
  if (totals.curated) facts.push(`<span><strong>${totals.curated}</strong> ${esc(t("AI Coworkers"))}</span>`);
  if (totals.agents) facts.push(`<span><strong>${totals.agents}</strong> ${esc(t("marketplace agents"))}</span>`);

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
      <h1>${esc(t("The vendors behind the AI coworkers"))}</h1>
      <p class="sub">${esc(t("Every AI coworker and agent on Sokosumi is built and operated by a vendor: a team that ships it, keeps it running, and stands behind its work. Pick a vendor to see who they ship, what their listings can do, and the models and hosting on file."))}</p>
      ${facts.length ? `<div class="cw-stats vendor-facts">${facts.join("")}</div>` : ""}
    </div>` +
    (rows.length
      ? `<div class="page-section flush">
          <div class="row-list vendor-list">${rows.map(vendorRow).join("")}</div>
        </div>`
      : `<div class="page-section flush"><p class="muted">${esc(t("Vendor profiles are on the way. In the meantime,"))} <a href="/ai-coworkers" style="text-decoration:underline">${esc(t("meet the coworkers"))}</a>.</p></div>`) +
    shell.logoRow() +
    shell.ctaBand({
      heading: t("Hire from any of them, in one place"),
      subheading: t("One account, one credit balance, every vendor on the marketplace. Signing up is free."),
      ctaLabel: t("Start free"),
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
  if (taskCount) chips.push(`<span class="chip">${esc(tp(taskCount, "{n} template task", "{n} template tasks"))}</span>`);
  const face = c.image
    ? `<span class="vcw-face"><img${shell.thumbSrc(c.image, 192, "src", 100)} alt="${attr(c.name)}" width="56" height="56" loading="lazy" decoding="async" /></span>`
    : `<span class="vcw-face"></span>`;
  return `<a class="card vcw-card" href="/ai-coworkers/${encodeURIComponent(c.slug)}" data-reveal style="--i:${i % 3}">
    <span class="vcw-head">
      ${face}
      <span class="vcw-id"><h3>${esc(c.name)}</h3>${c.role ? `<span class="role">${esc(c.role)}</span>` : ""}</span>
    </span>
    ${
      /* seoDescription is the purpose-written short blurb (complete sentence,
         card-sized) — verbatim when present; truncating the bio is the fallback */
      c.seoDescription
        ? `<p>${esc(c.seoDescription)}</p>`
        : c.description
          ? `<p>${esc(truncate(c.description, 170))}</p>`
          : ""
    }
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
    ${rest > 0 ? `<span class="cap-more">${esc(t("+ {n} more", { n: rest }))}</span>` : ""}
  </div>`;
}

function agentRow(c) {
  const stats = [];
  const nf = () => (locale() === "de" ? "de-DE" : "en-US");
  const runCount = Number(c.runs);
  if (Number.isFinite(runCount) && runCount > 0) stats.push(t("{n} runs", { n: runCount.toLocaleString(nf()) }));
  if (c.rating && c.ratingCount) stats.push(t("rated {r}/5", { r: Number(c.rating).toFixed(1) }));
  if (c.credits) stats.push(t("{n} credits per run", { n: c.credits }));
  const summary = c.seoDescription || c.description || "";
  return `<a class="row-item" href="/ai-coworkers/${encodeURIComponent(c.slug)}">
    <span style="display:flex;align-items:center;gap:12px">${avatar(c, "sm")}<span class="row-title">${esc(c.name)}</span></span>
    <p>${esc(truncate(summary, 160))}${stats.length ? `<span class="row-stats">${esc(stats.join(" · "))}</span>` : ""}</p>
    <span class="row-go">${esc(t("View"))} ${icon("arrow-up-right", 15)}</span>
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
  const nf = locale() === "de" ? "de-DE" : "en-US";
  const factWord = (n, singular, pluralKey) => tp(n, singular, pluralKey).replace(/^[\d.,]+\s*/, "");
  const facts = [];
  if (curated.length) facts.push(`<span><strong>${curated.length}</strong> ${esc(factWord(curated.length, "{n} AI coworker", "{n} AI coworkers"))}</span>`);
  if (agents.length) facts.push(`<span><strong>${agents.length}</strong> ${esc(factWord(agents.length, "{n} marketplace agent", "{n} marketplace agents"))}</span>`);
  if (myOffers.length) facts.push(`<span><strong>${myOffers.length}</strong> ${esc(factWord(myOffers.length, "{n} template task", "{n} template tasks"))}</span>`);
  if (totalRuns) facts.push(`<span><strong>${totalRuns.toLocaleString(nf)}</strong> ${esc(t("tasks run"))}</span>`);

  const subParts = [
    curated.length ? tp(curated.length, "{n} named AI coworker", "{n} named AI coworkers") : "",
    agents.length ? tp(agents.length, "{n} specialist AI agent", "{n} specialist AI agents") : "",
  ].filter(Boolean);
  const computedSub = subParts.length
    ? t("{vendor} builds and operates {what} on the Sokosumi marketplace — hire them with one free account and pay only for the work they run.", {
        vendor: v.name,
        what: subParts.join(t(" and ")),
      })
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
        <h2>${esc(t("AI coworkers from {vendor}", { vendor: v.name }))}</h2>
        <p class="sub">${esc(t("Named specialists with real roles and public profiles. Brief them like colleagues; most carry ready-to-run work."))}</p>
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
        <h2>${t("What {vendor}’s listings can do", { vendor: esc(v.name) })}</h2>
        <p class="sub">${esc(
          t("{tasks} across {cats}. Open one to see the deliverable; most include a sample of the output.", {
            tasks: tp(myOffers.length, "{n} ready-to-run template task", "{n} ready-to-run template tasks"),
            cats: tp(cats.length, "{n} category", "{n} categories"),
          }),
        )}</p>
        <div class="cap-grid">${cats.map(([cat, list], i) => capabilityCol(cat, list, (o) => byKey.get(o.agentSlug), i)).join("")}</div>
        <a class="cap-browse" href="/tasks">${esc(t("Browse all template tasks"))} ${icon("arrow-up-right", 14)}</a>
      </section>`
    : "";

  const stackRows = [
    models.length
      ? `<div class="stack-row"><span class="stack-label">${esc(t("Models"))}</span><span class="stack-chips">${models.map((m) => `<span class="chip">${esc(m)}</span>`).join("")}</span></div>`
      : "",
    regions.length
      ? `<div class="stack-row"><span class="stack-label">${esc(t("Hosting"))}</span><span class="stack-chips">${regions.map((r) => `<span class="chip">${esc(r)}</span>`).join("")}</span></div>`
      : "",
  ].filter(Boolean);
  const stackWhat = models.length && regions.length ? t("models and hosting regions") : models.length ? t("models") : t("hosting regions");
  const stackSection = stackRows.length
    ? `<section class="page-section${flush()}">
        <h2>${esc(t("Models and hosting, stated up front"))}</h2>
        <p class="sub">${esc(t("The {what} on file for {vendor}’s listings — visible before you spend a credit.", { what: stackWhat, vendor: v.name }))}</p>
        <div class="stack-rows">${stackRows.join("")}</div>
      </section>`
    : "";

  const agentsSection = agents.length
    ? `<section class="page-section${flush()}">
        <h2>${esc(t("{vendor} AI agents on the marketplace", { vendor: v.name }))}</h2>
        <p class="sub">${esc(
          t("{agents} from {vendor}{runs}. Each one does one job and shows its price in credits before you start.", {
            agents: tp(agents.length, "{n} single-purpose specialist agent", "{n} single-purpose specialist agents"),
            vendor: v.name,
            runs: totalRuns ? t(", with {n} tasks run between them", { n: totalRuns.toLocaleString(nf) }) : "",
          }),
        )}</p>
        <div class="row-list">${agents.map(agentRow).join("")}</div>
      </section>`
    : "";

  const empty =
    !curated.length && !agents.length
      ? `<div class="page-section flush"><p class="muted">${esc(t("{vendor} has no listings on Sokosumi yet. In the meantime,", { vendor: v.name }))} <a href="/ai-coworkers" style="text-decoration:underline">${esc(t("meet the coworkers"))}</a>.</p></div>`
      : "";

  // ── head ──
  // Title case for the <title>; the h1 keeps sentence case like the rest of
  // the site. Both carry the "<Vendor> AI Coworkers / AI Agents" phrasing the
  // page is meant to answer for — computed from what the vendor actually ships.
  const titleKinds =
    curated.length && agents.length
      ? t("AI Coworkers & Agents")
      : curated.length
        ? t("AI Coworkers")
        : agents.length
          ? t("AI Agents")
          : "";
  const title = titleKinds
    ? t("{vendor} {kinds} | Sokosumi", { vendor: v.name, kinds: titleKinds })
    : t("{vendor} | Vendors on Sokosumi", { vendor: v.name });
  const metaDesc = v.description
    ? truncate(v.description, 155)
    : subParts.length
      ? truncate(
          t("Hire {what} built and operated by {vendor} on the Sokosumi marketplace. Free to sign up; credits only go on work you run.", {
            what: subParts.join(t(" and ")),
            vendor: v.name,
          }),
          155,
        )
      : t("{vendor} is a vendor on Sokosumi, the AI coworker marketplace.", { vendor: v.name });

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
    t("AI coworkers from {vendor}", { vendor: v.name }),
    `/vendors/${v.slug}`,
    [...curated, ...agents].map((c) => ({ name: c.name, path: `/ai-coworkers/${c.slug}` })),
  );
  if (listLd) jsonld.push(listLd);

  // ctaBand escapes its heading, so this is plain text (curly apostrophe
  // included) — entities here would render literally.
  //
  // A vendor with nothing listed cannot be hired, so the empty case does not
  // sell the vendor — it points at the coworkers you actually can hire.
  const hasListings = curated.length > 0 || agents.length > 0;
  const ctaHeading = curated.length
    ? t("Put {vendor}’s AI coworkers to work", { vendor: v.name })
    : agents.length
      ? t("Run {vendor}’s AI agents on Sokosumi", { vendor: v.name })
      : t("Meet the AI coworkers on Sokosumi");

  // The same counts as the stats row, as attribute/value pairs a person and a
  // retrieval system read identically. Only what the catalog states.
  const dlRows = [];
  dlRows.push([t("Type"), t("Vendor on Sokosumi")]);
  if (v.website) dlRows.push([t("Website"), `<a href="${attr(v.website)}" rel="noreferrer">${esc(v.website.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a>`]);
  if (curated.length) dlRows.push([t("AI coworkers"), esc(String(curated.length))]);
  if (agents.length) dlRows.push([t("Marketplace agents"), esc(String(agents.length))]);
  if (myOffers.length) dlRows.push([t("Template tasks"), esc(String(myOffers.length))]);
  if (totalRuns) dlRows.push([t("Tasks run"), esc(totalRuns.toLocaleString(nf))]);
  dlRows.push([t("Marketplace"), `<a href="/">Sokosumi</a>`]);
  const synced = v.syncedAt || v.updatedAt;
  if (synced) {
    const d = new Date(synced);
    const label = new Intl.DateTimeFormat(locale() === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
    dlRows.push([t("Profile data as of"), `<time datetime="${d.toISOString().slice(0, 10)}">${esc(label)}</time>`]);
  }
  const factsDl = `<section class="page-section flush" data-reveal>
      <h2>${esc(t("{name} at a glance", { name: v.name }))}</h2>
      <dl class="data-grid">${dlRows.map(([k, val]) => `<div class="dg-row"><dt>${esc(k)}</dt><dd>${val}</dd></div>`).join("")}</dl>
    </section>`;

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
      <span class="eyebrow">${esc(t("Vendor on Sokosumi"))}${kindsH ? ` &middot; ${kindsH}` : ""}</span>
      ${vendorLogo(v, "lg")}
      <h1>${esc(v.name)}</h1>
      ${sub ? `<p class="sub">${esc(sub)}</p>` : ""}
      ${facts.length ? `<div class="cw-stats vendor-facts">${facts.join("")}</div>` : ""}
      ${website}
    </div>
    ${factsDl}
    ${coworkersSection}
    ${capabilitiesSection}
    ${stackSection}
    ${agentsSection}
    ${empty}` +
    shell.logoRow() +
    shell.ctaBand({
      heading: ctaHeading,
      subheading: t("One free account covers every vendor on the marketplace. Credits only go on work you run."),
      ctaLabel: hasListings ? t("Start free") : t("Browse AI coworkers"),
      ctaHref: hasListings ? undefined : "/ai-coworkers",
      seed: v.name.length,
    }) +
    pageEnd()
  );
}

module.exports = { index, detail };

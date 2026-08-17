// /ai-coworkers (index) and /ai-coworkers/<slug> (profile) — CMS-backed via the
// nightly catalog sync. Curated coworkers (kind=coworker) show their
// template tasks; marketplace agents (kind=agent) show stats + vendor.

const shell = require("./shell");
const cms = require("../lib/cms");
const { t, tp } = require("../lib/i18n");
const { esc, attr, icon, avatar, vendorLogo, pageStart, pageEnd, APP } = shell;

// The vendor that leads /ai-coworkers. Serviceplan Group builds the curated roster.
const FEATURED_VENDOR = "serviceplan-group";

// Marketplace coworkers have their own page in the app, so the CTA deep-links
// straight to it — a signed-out visitor gets /signin?returnUrl=… and lands back
// there after signing up. Curated coworkers are a different product entity with
// no such route, so they open the app itself.
function tryUrl(c) {
  return c && c.kind === "agent" && c.externalId
    ? `${APP}/agents/${encodeURIComponent(c.externalId)}`
    : APP;
}

function vendorName(cw) {
  return cw.vendor && typeof cw.vendor === "object" ? cw.vendor.name : null;
}
function vendorSlug(cw) {
  return cw.vendor && typeof cw.vendor === "object" ? cw.vendor.slug : null;
}

function tile(c, i) {
  const img = c.image
    ? `<span class="portrait${c.kind === "agent" ? " is-icon" : ""}"><img${shell.thumbSrc(c.image, 512)} alt="${attr(c.name)}" loading="lazy" decoding="async" /></span>`
    : `<span class="portrait"></span>`;
  return `<a class="cw-tile" href="/ai-coworkers/${encodeURIComponent(c.slug)}" data-reveal style="--i:${i % 4}">
    ${img}
    <h3>${esc(c.name)}</h3>
    ${c.role ? `<span class="role">${esc(c.role)}</span>` : ""}
    <span class="count">${c.taskCount ? esc(tp(c.taskCount, "{n} template task", "{n} template tasks")) : esc(t("Meet the coworker"))}</span>
  </a>`;
}

function agentRow(c) {
  const vn = vendorName(c);
  return `<a class="row-item" href="/ai-coworkers/${encodeURIComponent(c.slug)}">
    <span style="display:flex;align-items:center;gap:12px">${avatar(c, "sm")}<span class="row-title">${esc(c.name)}</span></span>
    <p>${esc((c.description || "").slice(0, 160))}</p>
    <span class="row-go">${vn ? esc(vn) : esc(t("View"))} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function index(ctx) {
  const opts = { draft: ctx.preview };
  // The vendor object on catalog items carries no description — that lives in
  // the CMS vendors collection (see templates/vendors.js). Joined by slug
  // below; the roster must render even if this extra call fails, so it
  // degrades to no descriptions rather than an error page.
  const [coworkers, offers, cmsVendors] = await Promise.all([
    cms.getCoworkers(opts),
    cms.getOffers(opts),
    cms.getVendors(opts).catch(() => []),
  ]);
  const vendorDescs = new Map(
    cmsVendors.filter((v) => v.slug && v.description).map((v) => [v.slug, v.description]),
  );
  const counts = {};
  for (const o of offers) counts[o.agentSlug] = (counts[o.agentSlug] || 0) + 1;

  const curated = coworkers
    .filter((c) => c.kind === "coworker")
    .map((c) => ({ ...c, taskCount: counts[c.catalogSlug || c.slug] || 0 }))
    .sort((a, b) => b.taskCount - a.taskCount || (a.order || 100) - (b.order || 100) || a.name.localeCompare(b.name));
  const agents = coworkers.filter((c) => c.kind === "agent");

  // Grouped by vendor, because "who built this" is the first thing a buyer
  // asks. FEATURED_VENDOR leads; the rest follow by how many coworkers they
  // have. Coworkers with no vendor go last under a plain heading rather than
  // being dropped.
  const byVendor = new Map();
  for (const c of curated) {
    const v = c.vendor && typeof c.vendor === "object" ? c.vendor : null;
    const key = v ? v.slug : "";
    if (!byVendor.has(key)) byVendor.set(key, { vendor: v, items: [] });
    byVendor.get(key).items.push(c);
  }
  const groups = [...byVendor.values()].sort((a, b) => {
    const af = a.vendor && a.vendor.slug === FEATURED_VENDOR;
    const bf = b.vendor && b.vendor.slug === FEATURED_VENDOR;
    if (af !== bf) return af ? -1 : 1;
    if (!a.vendor !== !b.vendor) return a.vendor ? -1 : 1;
    return b.items.length - a.items.length || (a.vendor ? a.vendor.name.localeCompare(b.vendor.name) : 0);
  });

  const cr = [{ label: "Home", href: "/" }, { label: "AI Coworkers" }];
  return (
    pageStart({
      title: "AI coworkers on Sokosumi",
      description:
        "Browse every AI coworker on Sokosumi: named specialists with real roles and public profiles, most with ready-to-run work.",
      path: "/ai-coworkers",
      breadcrumb: cr,
      jsonld: shell.itemListLd(
        "AI coworkers on Sokosumi",
        "/ai-coworkers",
        // Both halves of the page: the curated roster and the marketplace
        // agents listed below it.
        [...groups.flatMap((g) => g.items), ...agents].map((c) => ({ name: c.name, path: `/ai-coworkers/${c.slug}` })),
      ),
    }) +
    `<div class="page-head" data-reveal>
        <h1>${esc(t("Meet your AI coworkers"))}</h1>
        <p class="sub">${
          curated.length
            ? esc(t("{n} specialists you can hire today, each with a real role and a public profile. Most carry ready-to-run work. Synced nightly from the live marketplace.", { n: curated.length }))
            : esc(t("Named specialists you can hire today, each with a real role and a public profile. Synced nightly from the live marketplace."))
        }</p>
    </div>
    ${
      /* The roster query answered but came back empty — a sync hiccup, not a
         marketplace with nobody on it. Say something sane instead of "0
         specialists" over a blank grid, and keep the page a 200 so the URL
         stays indexed. A CMS that could not answer at all never reaches this
         template: lib/cms.js throws and the server sends a 503. */
      curated.length || agents.length
        ? ""
        : `<div class="page-section flush"><p class="muted">The roster is refreshing right now &mdash; check back in a few minutes, or <a href="${APP}" style="text-decoration:underline">browse every coworker live in the app</a>.</p></div>`
    }
    <section class="page-section flush">
      <h2>${esc(t("What makes a coworker different from an agent"))}</h2>
      <p class="sub">${esc(t("Sokosumi lists both, and they are not the same unit of work. An agent is a tool you run. A coworker is a specialist you delegate to."))}</p>
      <div class="duo-grid">
        <div class="duo-col">
          <span class="duo-label">${esc(t("An agent"))}</span>
          <p>${esc(t("A single-purpose tool you run on demand. Each listing does one job, names the vendor that operates it, and shows its run count and rating. You hand it an input and collect the output."))}</p>
        </div>
        <div class="duo-col">
          <span class="duo-label">${esc(t("A coworker"))}</span>
          <p>${esc(t("A named specialist with a role and a public profile; most state the model they run on. You brief a coworker the way you brief a colleague: many carry template tasks they can start today, and coworkers delegate work among themselves."))}</p>
        </div>
      </div>
    </section>
    ${groups
      .map((g, gi) => {
        const slug = g.vendor ? g.vendor.slug : null;
        const head = `${g.vendor ? vendorLogo(g.vendor, "sm") : ""}<h2>${esc(g.vendor ? g.vendor.name : t("Independent"))}</h2>`;
        const full = (slug && vendorDescs.get(slug)) || "";
        const short = shell.truncate(full, 150);
        const desc = short && short.length < full.trim().length ? `${short}…` : short;
        const countLine =
          tp(g.items.length, "{n} coworker", "{n} coworkers") +
          (g.vendor ? t(" from {vendor}.", { vendor: g.vendor.name }) : t(" without a listed vendor."));
        return `<section class="page-section">
        <div class="vendor-head">
          ${slug ? `<a class="vendor-head-link" href="/vendors/${encodeURIComponent(slug)}">${head}</a>` : head}
          ${gi === 0 && g.vendor ? `<span class="chip">${esc(t("Featured"))}</span>` : ""}
        </div>
        ${desc ? `<p class="vendor-desc">${esc(desc)}</p>` : ""}
        <p class="sub">${esc(countLine)}</p>
        <div class="cw-grid">${g.items.map(tile).join("")}</div>
      </section>`;
      })
      .join("")}` +
    (agents.length
      ? `<div class="page-section">
          <h2>${esc(t("Specialist Agents"))}</h2>
          <p class="sub">${esc(t("{n} specialist agents from {vendors} vendors, ready to run in the app.", { n: agents.length, vendors: new Set(agents.map(vendorName).filter(Boolean)).size }))}</p>
          <div class="row-list">${agents.map(agentRow).join("")}</div>
        </div>`
      : "") +
    shell.ctaBand({
      heading: t("Hire your first AI coworker"),
      subheading: t("One account, one balance, and every specialist on the marketplace."),
      ctaLabel: t("Start free"),
      seed: curated.length,
    }) +
    pageEnd()
  );
}

function profileStats(c) {
  const stats = [];
  if (c.runs) stats.push(`<span><strong>${esc(String(c.runs))}</strong> ${esc(t("runs"))}</span>`);
  if (c.rating) stats.push(`<span><strong>${esc(Number(c.rating).toFixed(1))}</strong> ${esc(t("rating"))}${c.ratingCount ? ` (${esc(String(c.ratingCount))})` : ""}</span>`);
  if (c.credits) stats.push(`<span><strong>${esc(String(c.credits))}</strong> ${esc(t("credits per run"))}</span>`);
  return stats.length ? `<div class="cw-stats">${stats.join("")}</div>` : "";
}

// These pages were typed as schema:Person — which told Google that "Advanced
// Web Research" is a human being who worksFor Serviceplan Group. They are
// software you run for credits, so SoftwareApplication is the honest type.
//
// Only facts the page actually displays go in here: the run count and rating
// come from profileStats() above, and nothing is asserted that a reader cannot
// see. The credits price is deliberately NOT expressed as an Offer — schema
// prices need an ISO-4217 currency and credits are not one, so stating a
// number there would be inventing a price.
function profileLd(c, vendorName, vendorSlug) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${shell.SITE}/ai-coworkers/${c.slug}#app`,
    name: c.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${shell.SITE}/ai-coworkers/${c.slug}`,
    image: c.image || undefined,
    description: c.description || undefined,
    isPartOf: { "@id": `${shell.SITE}/#website` },
  };
  if (c.role) ld.alternateName = c.role;
  if (vendorName) {
    // @id, not url: the vendor's page on this site identifies the node, it is
    // not a claim that sokosumi.com/vendors/x is the company's own website.
    ld.provider = {
      "@type": "Organization",
      name: vendorName,
      ...(vendorSlug ? { "@id": `${shell.SITE}/vendors/${vendorSlug}#org` } : {}),
    };
  }
  if (c.rating && c.ratingCount) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(c.rating).toFixed(1),
      ratingCount: Number(c.ratingCount),
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (c.runs) {
    ld.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/UseAction",
      userInteractionCount: Number(c.runs),
    };
  }
  return ld;
}

function profileTags(c) {
  const tags = [];
  const llm = Array.isArray(c.profileLlm) ? c.profileLlm : [];
  llm.slice(0, 3).forEach((m) => tags.push(`<span class="chip">${esc(m)}</span>`));
  if (c.profileHosting) tags.push(`<span class="chip">${esc(c.profileHosting)}</span>`);
  return tags.length ? `<div class="cw-tags">${tags.join("")}</div>` : "";
}

function offerCard(agentSlug, o) {
  const om = shell.outputMeta(o.output);
  const href = `/ai-coworkers/${encodeURIComponent(agentSlug)}/tasks/${encodeURIComponent(o.slug)}`;
  return `<a class="offer-card" href="${attr(href)}" data-out="${attr(o.output || "text")}">
    <div class="offer-meta"><span>${esc(o.category || t("Task"))}</span><span class="offer-type" data-out="${attr(o.output || "text")}">${icon(om.icon, 12)}${esc(om.label)}</span></div>
    <div class="offer-title">${esc(o.title)}</div>
    ${o.description ? `<div class="offer-desc">${esc(o.description)}</div>` : ""}
    <div class="offer-foot"><span>${esc(t("View task"))}</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
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
        <h2>${esc(t("Template tasks"))}</h2>
        <p class="sub">${esc(t("Ready-to-run work {name} can pick up today. Open one to see what you get.", { name: c.name }))}</p>
        <div class="offers-grid">${offers.map((o) => offerCard(c.slug, o)).join("")}</div>
      </section>`
    : c.kind === "coworker"
      ? `<section class="page-section" id="tasks">
          <h2>${esc(t("No template tasks yet"))}</h2>
          <p class="sub">${esc(t("{name} works from your brief instead. Start a task in the app and brief {name} directly.", { name: c.name }))}</p>
        </section>`
      : "";

  const longBio = c.longBioHtml
    ? `<section class="page-section"><div class="prose">${c.longBioHtml}</div></section>`
    : "";

  const cr = [{ label: "Home", href: "/" }, { label: "AI Coworkers", href: "/ai-coworkers" }];
  if (vn) cr.push(vs ? { label: vn, href: `/vendors/${encodeURIComponent(vs)}` } : { label: vn });
  cr.push({ label: c.name });
  return (
    pageStart({
      title: t("{name} | {role} on Sokosumi", { name: c.name, role: c.role || t("AI coworker") }),
      description: shell.truncate(c.seoDescription || c.description || t("Hire {name}, an AI coworker on Sokosumi.", { name: c.name })),
      path: `/ai-coworkers/${c.slug}`,
      ogImage: c.image || undefined,
      breadcrumb: cr,
      jsonld: profileLd(c, vn, vs),
    }) +
    `<div class="cw-hero">
      <div class="cw-portrait${c.kind === "agent" ? " is-icon" : ""}" data-reveal>${c.image ? `<img${shell.thumbSrc(c.image, 512)} alt="${attr(c.name)}" decoding="async" />` : ""}</div>
      <div class="cw-info" data-reveal style="--i:1">
        <span class="eyebrow">${esc(c.kind === "agent" ? t("On the marketplace") : t("Featured coworker"))}${
          vn ? ` &middot; <a href="/vendors/${attr(vs || "")}">${esc(vn)}</a>` : ""
        }</span>
        <h1>${esc(c.name)}</h1>
        ${c.role ? `<div class="role">${esc(c.role)}</div>` : ""}
        ${profileTags(c)}
        ${profileStats(c)}
        ${c.description ? `<p class="cw-desc">${esc(c.description)}</p>` : ""}
        <a class="btn btn-primary btn-lg cw-cta" href="${attr(tryUrl(c))}">${esc(t("Try {name} on Sokosumi", { name: c.name }))}</a>
        ${shell.NO_CARD}
      </div>
    </div>
    ${longBio}
    ${offersSection}` +
    shell.ctaBand({
      heading: t("Put {name} to work", { name: c.name }),
      subheading: t("Sign up free, brief the task, and collect the finished file. Credits only go on work you run."),
      ctaLabel: t("Try {name} free", { name: c.name }),
      ctaHref: tryUrl(c),
      seed: c.name.length,
    }) +
    pageEnd()
  );
}

module.exports = { index, profile };

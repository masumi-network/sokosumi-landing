// /ai-coworkers (index) and /ai-coworkers/<slug> (profile) — CMS-backed via the
// nightly catalog sync. Curated coworkers (kind=coworker) show their
// template tasks; marketplace agents (kind=agent) show stats + vendor.

const shell = require("./shell");
const blocks = require("./blocks");
const cms = require("../lib/cms");
const { t, tp, locale } = require("../lib/i18n");
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
    ? `<span class="portrait${c.kind === "agent" ? " is-icon" : ""}"><img${shell.thumbSrc(c.image, 512, "src", 100)} alt="${attr(c.name)}" loading="lazy" decoding="async" /></span>`
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
  const summary = c.seoDescription || c.description || "";
  return `<a class="row-item" href="/ai-coworkers/${encodeURIComponent(c.slug)}">
    <span style="display:flex;align-items:center;gap:12px">${avatar(c, "sm")}<span class="row-title">${esc(c.name)}</span></span>
    <p>${esc(summary.slice(0, 160))}</p>
    <span class="row-go">${vn ? esc(vn) : esc(t("View"))} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}


// The agent-vs-coworker explainer. The terms overlap and there is no settled
// technical line, so this does not pretend there is one — it is the product
// distinction in the fewest words that still land: one line per side, four
// contrasts that read across the split, one example each. Agent on paper,
// coworker on ink: the contrast is the point, and ink is the house emphasis
// (btn-primary is ink too), so the coworker side reads as the subject of the
// page without a winner's badge. A full table was tried and was a wall of text.
function cmpSplit() {
  const pairs = [
    [t("Does a task"), t("Owns a role")],
    [t("Runs once when you start it"), t("Can run recurring tasks")],
    [t("Has one defined capability"), t("Has a public profile and task list")],
    [t("A specialist you run"), t("A coworker you brief")],
  ];
  const side = (cls, label, line, example) => `<div class="cw-split-side ${cls}">
      <span class="cw-split-label">${esc(label)}</span>
      <p class="cw-split-line">${esc(line)}</p>
      <ul class="cw-split-list">${pairs.map((pr) => `<li>${esc(cls === "is-agent" ? pr[0] : pr[1])}</li>`).join("")}</ul>
      <p class="cw-split-eg"><span>${esc(t("e.g."))}</span> ${esc(example)}</p>
    </div>`;
  return `<div class="grad-band g4" data-reveal><div class="cw-split">
    ${side("is-agent", t("AI agent"), t("Runs one defined capability."), t("\u201cFind keyword opportunities for sokosumi.com.\u201d"))}
    ${side("is-coworker", t("AI coworker"), t("Works in a named role."), t("\u201cRun our recurring SEO checks.\u201d"))}
  </div></div>`;
}

// The questions people type before they search for a product. Answered in
// plain words here and mirrored as FAQPage data.
function INDEX_FAQ() {
  return [
    { question: t("What is an AI marketing agent?"), answer: t("Software that does one marketing job on its own from a brief: a competitor scan, a weekly performance report, a social calendar. On Sokosumi an agent has a name, a vendor and a price in credits you see before it runs.") },
    { question: t("What is the difference between an AI agent and an AI coworker?"), answer: t("An agent does one task. A coworker holds a role, such as research or creative, and is usually built from several agents. You brief a coworker like a colleague and it returns a file.") },
    { question: t("How do marketing teams use AI agents day to day?"), answer: t("They hand over the recurring and the well-defined work: market and competitor research, reporting, first drafts, campaign plans, dashboards. The team keeps judgement, brand and the client.") },
    { question: t("What does an AI agent for marketing cost?"), answer: t("On Sokosumi, credits only when a task runs. The free plan has 250 credits per seat every month; paid seats are €25, €75 or €200 a month. Each task shows its credit price first.") },
    { question: t("Is my data safe with AI marketing agents?"), answer: t("Each coworker profile states its models and hosting as the vendor provides them. EU hosting is available. You decide what you attach to a task.") },
  ];
}
function indexFaqSection() {
  return `<section class="blk" data-reveal><div class="blk-head"><h2>${esc(t("AI agents for marketing: questions"))}</h2></div><div class="blk-faq">${INDEX_FAQ()
    .map((f) => `<details class="faq-item"><summary>${esc(f.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(f.answer)}</p></details>`)
    .join("")}</div></section>`;
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
      title: t("AI agents for marketing and AI coworkers | Sokosumi"),
      description: t("AI agents and coworkers for marketing teams: {n} named specialists with a role, a vendor and a credit price you see first. Brief one; get a file back.", { n: curated.length + agents.length }),
      path: "/ai-coworkers",
      breadcrumb: cr,
      og: { type: "page", eyebrow: t("AI coworkers"), title: t("AI agents for marketing, with names and roles"), sub: t("{n} specialists from {v} vendors. Brief one; get a file back.", { n: curated.length + agents.length, v: new Set([...curated, ...agents].map(vendorName).filter(Boolean)).size }) },
      jsonld: [
        shell.itemListLd(
          "AI coworkers on Sokosumi",
          "/ai-coworkers",
          // Both halves of the page: the curated roster and the marketplace
          // agents listed below it.
          [...groups.flatMap((g) => g.items), ...agents].map((c) => ({ name: c.name, path: `/ai-coworkers/${c.slug}` })),
        ),
        blocks.faqJsonLd(INDEX_FAQ()),
      ],
    }) +
    `<div class="page-head" data-reveal>
        <span class="eyebrow">${esc(t("AI coworkers"))}</span>
        <h1>${esc(t("AI agents for marketing, with names and roles"))}</h1>
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
      <p class="sub">${esc(t("Sokosumi lists both. An agent is a capability you hire for a task. A coworker is a persistent AI worker you hire for a role \u2014 usually built from several agents."))}</p>
      ${cmpSplit()}
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
        <p class="sub">${esc(countLine)}${slug === FEATURED_VENDOR ? ` <a href="/serviceplan-ai">${esc(t("How Serviceplan builds AI →"))}</a>` : ""}</p>
        <div class="cw-grid">${g.items.map(tile).join("")}</div>
      </section>`;
      })
      .join("")}` +
    (agents.length
      ? `<div class="page-section">
          <h2>${esc(t("Specialist Agents"))}</h2>
          <p class="sub">${esc(t("{n} specialist agents from {vendors} vendors, ready to run in the app.", { n: agents.length, vendors: new Set(agents.map(vendorName).filter(Boolean)).size }))}</p>
          <div class="row-list" data-collapsible="12">${agents.map(agentRow).join("")}</div>
          ${
            agents.length > 12
              ? `<button type="button" class="row-more" data-collapse-toggle hidden>
                   <span data-more-label>${esc(t("Show all {n} specialist agents", { n: agents.length }))}</span>
                   <span data-less-label hidden>${esc(t("Show fewer"))}</span>
                 </button>`
              : ""
          }
        </div>`
      : "") +
    shell.logoRow() +
    indexFaqSection() +
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
  if (c.credits) {
    const usd = usdForCredits(c.credits);
    stats.push(
      `<span><strong>${esc(String(c.credits))}</strong> ${esc(t("credits per run"))}${usd !== null ? ` <span class="cw-stat-alt">(${esc(fmtUsd(usd))})</span>` : ""}</span>`,
    );
  }
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
    description: c.seoDescription || c.description || undefined,
    isPartOf: { "@id": `${shell.SITE}/#website` },
  };
  if (c.role) ld.alternateName = c.role;
  // A run is priced in credits; the offer states the same amount in the currency
  // those credits are sold in, so the markup matches the price on the page.
  const usd = usdForCredits(c.credits);
  if (usd !== null) {
    ld.offers = {
      "@type": "Offer",
      price: usd.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${shell.SITE}/ai-coworkers/${c.slug}`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: usd.toFixed(2),
        priceCurrency: "USD",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "task run" },
      },
    };
  }
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


// ---- vendor-written listing copy -------------------------------------------
// The marketplace record carries the maker's own markdown description. It is
// third-party text, so it is escaped first and only a fixed set of constructs
// is rebuilt afterwards — headings, emphasis, lists, links and paragraphs.
// Anything else survives as plain text rather than as markup.
function vendorMarkdown(src) {
  const raw = String(src || "").trim();
  if (!raw) return "";
  const inline = (line) =>
    esc(line)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // only absolute http(s) targets become links
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="nofollow noopener">$1</a>');
  const out = [];
  let list = null;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  const cells = (line) => line.replace(/^\||\|$/g, "").split("|").map((x) => x.trim());
  const isDivider = (line) => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(line);
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const lineRaw = lines[i];
    const line = lineRaw.trim();
    if (!line) { closeList(); continue; }
    // GFM table: a header row, a divider, then body rows. Makers use these for
    // the facts worth having — hosting, retention, models — so they are worth
    // rebuilding rather than dumping as pipes.
    if (line.includes("|") && lines[i + 1] && isDivider(lines[i + 1].trim())) {
      closeList();
      const head = cells(line);
      const body = [];
      let j = i + 2;
      for (; j < lines.length; j++) {
        const row = lines[j].trim();
        if (!row || !row.includes("|")) break;
        body.push(cells(row));
      }
      i = j - 1;
      out.push(
        `<div class="cw-table-wrap"><table><thead><tr>${head.map((x) => `<th>${inline(x)}</th>`).join("")}</tr></thead>` +
          `<tbody>${body.map((r) => `<tr>${head.map((_, k) => `<td>${inline(r[k] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
      );
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      closeList();
      // the section owns the h2, so the maker's own top level nests beneath it
      const level = Math.min(5, Math.max(3, h[1].length + 1));
      out.push(`<h${level}>${inline(h[2].replace(/[:\s]+$/, ""))}</h${level}>`);
      continue;
    }
    const ul = /^[-*+]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      const want = ul ? "ul" : "ol";
      if (list !== want) { closeList(); out.push(`<${want}>`); list = want; }
      out.push(`<li>${inline((ul || ol)[1])}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}

// The catalog record behind a CMS listing. The CMS stores a short summary; the
// maker's full copy, its categories and its legal links only exist here.
function catalogAgent(c, ctx) {
  const agents = (ctx && ctx.catalog && ctx.catalog.agents) || [];
  if (!c || !agents.length) return null;
  return agents.find((a) => a.id && a.id === c.externalId) || agents.find((a) => a.name === c.name) || null;
}

// 100 credits = US$1.00, the marketplace's stated credit price. Everything that
// shows money for a listing derives from this one constant so the page and its
// structured data can never drift apart.
const CREDITS_PER_USD = 100;
const usdForCredits = (credits) => {
  const n = Number(credits);
  if (!isFinite(n) || n <= 0) return null;
  return n / CREDITS_PER_USD;
};
const fmtUsd = (n) =>
  new Intl.NumberFormat(locale() === "de" ? "de-DE" : "en-US", { style: "currency", currency: "USD" }).format(n);

function profileTags(c) {
  const tags = [];
  const llm = Array.isArray(c.profileLlm) ? c.profileLlm : [];
  llm.slice(0, 3).forEach((m) => tags.push(`<span class="chip">${esc(m)}</span>`));
  if (c.profileHosting) tags.push(`<span class="chip">${esc(c.profileHosting)}</span>`);
  return tags.length ? `<div class="cw-tags">${tags.join("")}</div>` : "";
}

// The facts a profile states, as a <dl>: the same attributes the chips and
// stats show, in a form a person and a retrieval system read identically.
// Only what the catalog actually provides appears; nothing is inferred.
function profileFacts(c, vn, vs, cat, cats) {
  const rows = [];
  rows.push([t("Type"), c.kind === "agent" ? t("AI agent (single-purpose)") : t("AI coworker")]);
  if (c.role) rows.push([t("Role"), esc(c.role)]);
  if (vn) rows.push([t("Vendor"), vs ? `<a href="/vendors/${attr(vs)}">${esc(vn)}</a>` : esc(vn)]);
  const llm = Array.isArray(c.profileLlm) ? c.profileLlm.filter(Boolean) : [];
  if (llm.length) rows.push([t("Models"), esc(llm.join(", "))]);
  if (c.profileHosting) rows.push([t("Hosting"), esc(c.profileHosting)]);
  if (c.credits) {
    const usd = usdForCredits(c.credits);
    rows.push([
      t("Price per run"),
      esc(usd !== null ? t("{credits} credits ({usd})", { credits: String(c.credits), usd: fmtUsd(usd) }) : t("{credits} credits", { credits: String(c.credits) })),
    ]);
  }
  if (c.runs) rows.push([t("Tasks run"), esc(Number(c.runs).toLocaleString(locale() === "de" ? "de-DE" : "en-US"))]);
  if (c.rating && c.ratingCount) rows.push([t("Rating"), esc(`${Number(c.rating).toFixed(1)} / 5 (${c.ratingCount})`)]);
  if (cats && cats.length) rows.push([t("Category"), esc(cats.map((x) => x.name).join(", "))]);
  if (cat && cat.legal && (cat.legal.terms || cat.legal.privacy)) {
    const links = [
      cat.legal.terms ? `<a href="${attr(cat.legal.terms)}" rel="nofollow noopener">${esc(t("Terms"))}</a>` : "",
      cat.legal.privacy ? `<a href="${attr(cat.legal.privacy)}" rel="nofollow noopener">${esc(t("Privacy"))}</a>` : "",
    ].filter(Boolean);
    rows.push([t("Vendor policies"), links.join(" &middot; ")]);
  }
  const synced = c.syncedAt || c.updatedAt;
  if (synced) {
    const d = new Date(synced);
    const label = new Intl.DateTimeFormat(locale() === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
    rows.push([t("Profile data as of"), `<time datetime="${d.toISOString().slice(0, 10)}">${esc(label)}</time>`]);
  }
  return `<section class="page-section flush" data-reveal>
        <h2>${esc(t("{name} at a glance", { name: c.name }))}</h2>
        <dl class="data-grid">${rows.map(([k, v]) => `<div class="dg-row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>
      </section>`;
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


// The maker's own description of the listing. Rendered under its own heading so
// it reads as the vendor's words rather than as Sokosumi copy.
function vendorSection(c, cat) {
  const md = cat && cat.description ? String(cat.description) : "";
  // A stub like "## Overview" on its own carries nothing; require real prose.
  const body = md.replace(/^#+.*$/gm, "").trim().length > 80 ? vendorMarkdown(md) : "";
  if (!body) return "";
  const who = c.vendorName || (c.vendor && c.vendor.name) || "";
  return `<section class="page-section" id="about">
      <h2>${esc(t("What {name} does", { name: c.name }))}</h2>
      <p class="sub">${esc(who ? t("As described by {vendor}, the maker of this listing.", { vendor: who }) : t("As described by the maker of this listing."))}</p>
      <div class="prose cw-vendor-copy">${body}</div>
    </section>`;
}

// Other listings in the same category. Gives a thin listing somewhere to go and
// the category a second route in, instead of every agent page being a dead end.
// Categories come from the catalog, slugs from the CMS, joined on externalId.
function relatedAgents(c, cats, ctx, siblings) {
  const all = (ctx && ctx.catalog && ctx.catalog.agents) || [];
  const names = new Set(cats.map((x) => x.name));
  if (!names.size || !all.length) return "";
  const inCategory = new Set(
    all.filter((a) => (a.categories || []).some((x) => names.has(x.name))).map((a) => a.id),
  );
  const near = (siblings || [])
    .filter((s) => s.slug !== c.slug && s.externalId && inCategory.has(s.externalId))
    .slice(0, 6);
  if (near.length < 2) return "";
  const label = cats[0].name;
  return `<section class="page-section" id="related">
      <h2>${esc(t("More in {category}", { category: label }))}</h2>
      <div class="row-list">${near
        .map(
          (a) => `<a class="row-item" href="/ai-coworkers/${encodeURIComponent(a.slug)}">
            <span class="row-title">${esc(a.name)}</span>
            <p>${esc(String(a.seoDescription || a.description || "").slice(0, 150))}</p>
            <span class="row-go">${esc(vendorName(a) || t("View"))} ${icon("arrow-up-right", 15)}</span>
          </a>`,
        )
        .join("")}</div>
    </section>`;
}

async function profile(ctx) {
  const opts = { draft: ctx.preview };
  const c = await cms.getCoworker(ctx.params.slug, opts);
  if (!c || c.active === false) return null;
  const offers = c.kind === "coworker" ? await cms.getOffersFor(c.catalogSlug || c.slug, opts) : [];
  const vn = vendorName(c);
  const vs = vendorSlug(c);
  // Marketplace listings carry the maker's own copy in the catalog, not the CMS.
  const cat = catalogAgent(c, ctx);
  const cats = (cat && cat.categories) || [];
  const siblings = cats.length ? await cms.getCoworkers(opts).catch(() => []) : [];

  const offersSection = offers.length
    ? `<section class="page-section" id="tasks">
        <h2>${esc(t("Template tasks for {name}", { name: c.name }))}</h2>
        <p class="sub">${esc(t("Ready-to-run work {name} can pick up today. Open one to see what you get.", { name: c.name }))}</p>
        <div class="offers-grid">${offers.map((o) => offerCard(c.slug, o)).join("")}</div>
      </section>`
    : c.kind === "coworker"
      ? `<section class="page-section" id="tasks">
          <h2>${esc(t("{name} works from your brief", { name: c.name }))}</h2>
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
      title:
        c.slug === "instagram-page-analysis"
          ? t("Instagram analyzer for posts and pages | Sokosumi")
          : t("{name} | {role} on Sokosumi", { name: c.name, role: c.role || t("AI coworker") }),
      description: shell.describe(c.seoDescription || c.description || t("Hire {name}, an AI coworker on Sokosumi.", { name: c.name }), [
        t("Brief {name} in plain language; the task shows on a shared board and comes back as a file. Credit price shown first.", { name: c.name }),
        t("Brief {name} in plain language and get a finished file back.", { name: c.name }),
        t("Hire {name} on Sokosumi.", { name: c.name }),
      ]),
      path: `/ai-coworkers/${c.slug}`,
      og: { type: "coworker", title: c.name, sub: c.role || "", eyebrow: c.kind === "agent" ? t("Specialist agent on Sokosumi") : t("AI coworker on Sokosumi"), meta: [vn, c.profileHosting].filter(Boolean).join(" · "), img: c.image || "" },
      breadcrumb: cr,
      jsonld: profileLd(c, vn, vs),
    }) +
    `<div class="cw-hero">
      <div class="cw-portrait${c.kind === "agent" ? " is-icon" : ""}" data-reveal>${c.image ? `<img${shell.thumbSrc(c.image, 512, "src", 100)} alt="${attr(c.name)}" decoding="async" />` : ""}</div>
      <div class="cw-info" data-reveal style="--i:1">
        <span class="eyebrow">${esc(c.kind === "agent" ? t("On the marketplace") : t("Featured coworker"))}${
          vn ? ` &middot; <a href="/vendors/${attr(vs || "")}">${esc(vn)}</a>` : ""
        }</span>
        <h1>${esc(c.name)}</h1>
        ${c.role ? `<div class="role">${esc(c.role)}</div>` : ""}
        ${profileTags(c)}
        ${profileStats(c)}
        ${c.seoDescription || c.description ? `<p class="cw-desc">${esc(c.seoDescription || c.description)}</p>` : ""}
        <a class="btn btn-primary btn-lg cw-cta" href="${attr(tryUrl(c))}" data-analytics="sign_up_click" data-analytics-location="coworker_profile">${esc(t("Try {name} on Sokosumi", { name: c.name }))}</a>
        ${shell.NO_CARD}
      </div>
    </div>
    ${profileFacts(c, vn, vs, cat, cats)}
    ${vendorSection(c, cat)}
    ${longBio}
    ${offersSection}
    ${relatedAgents(c, cats, ctx, siblings)}` +
    shell.logoRow() +
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

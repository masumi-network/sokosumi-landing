// /use-cases (hub), /use-cases/industries/<slug> (industry hub), and
// /use-cases/<slug> (detail) — CMS `use-cases` collection plus the shared
// `industries` taxonomy. Detail pages are block-based (see blocks.js).

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const art = require("./art");
const { esc, attr, icon, avatar, pageStart, pageEnd } = shell;

// Populated industry relations only (depth 1 gives objects; ids are skipped).
function industriesOf(uc) {
  return (uc.industries || []).filter((i) => i && typeof i === "object" && i.slug);
}

// A use case card: the industry it is for, the outcome, and how many
// coworkers are on it. The banner is the page's own abstract field at
// thumbnail size, so the card previews the page it links to — no single
// coworker fronts the work. `crew` (the resolved coworker docs behind
// relatedAgents) is optional; the card degrades to text without it.
function useCaseCard(uc, crew) {
  const ind = industriesOf(uc)[0];
  const svg = art.field(uc.slug, { w: 600, h: 240 });
  const media = svg ? `<span class="uc-art" aria-hidden="true">${svg}</span>` : "";
  const n = (crew || []).length;
  const foot = n ? `${n} coworker${n === 1 ? "" : "s"} on it` : "Read the workflow";
  return `<a class="card uc-card${media ? " has-art" : ""}" href="/use-cases/${encodeURIComponent(uc.slug)}">
    ${media}
    <span class="uc-eyebrow">${esc(ind ? ind.name : "Use case")}</span>
    <h3>${esc(uc.title)}</h3>
    <p>${esc(uc.description || "")}</p>
    <div class="card-foot"><span class="tag-quiet">${esc(foot)}</span><span class="go">${icon(
      "arrow-up-right",
      15,
    )}</span></div>
  </a>`;
}

// An industry is a lens on the same work, not a piece of work — so it reads
// as a control rather than a card. When both were bordered white cards in a
// grid, there was nothing to tell a reader which was which.
function industryPill(ind, count) {
  return `<a class="ind-pill" href="/use-cases/industries/${encodeURIComponent(ind.slug)}">
    <span>${esc(ind.name)}</span>${count ? `<em>${count}</em>` : ""}
  </a>`;
}

const HOW = [
  ["Pick the work", "Start from a use case that matches the job, not from a blank prompt."],
  ["Hand it over", "The coworkers behind it already know the brief, the sources, and the format."],
  ["Get the file", "A finished deliverable lands in the app: a report, a deck, a sheet, a dashboard."],
];

function howItRuns() {
  return `<section class="page-section">
    <h2>How a use case runs</h2>
    <p class="sub">Every use case on this page is a real workflow you can start today.</p>
    <ol class="uc-steps">
      ${HOW.map(
        ([t, d], i) => `<li><span class="n">${String(i + 1).padStart(2, "0")}</span><strong>${esc(
          t,
        )}</strong><span>${esc(d)}</span></li>`,
      ).join("")}
    </ol>
  </section>`;
}

// Resolve relatedAgents (product slugs) to coworker docs, once per request.
function crewResolver(coworkers) {
  const bySlug = new Map();
  for (const c of coworkers) {
    bySlug.set(c.slug, c);
    if (c.catalogSlug) bySlug.set(c.catalogSlug, c);
  }
  return (uc) =>
    (uc.relatedAgents || [])
      .map((r) => r && bySlug.get(r.agentSlug))
      .filter(Boolean);
}

async function hub(ctx) {
  const opts = { draft: ctx.preview };
  const [useCases, industries, coworkers, testimonials] = await Promise.all([
    cms.getUseCases(opts),
    cms.getIndustries(opts),
    cms.getCoworkers(opts),
    cms.getTestimonials(opts).catch(() => []),
  ]);
  const crewOf = crewResolver(coworkers);

  const counts = {};
  for (const uc of useCases) {
    for (const ind of industriesOf(uc)) counts[ind.slug] = (counts[ind.slug] || 0) + 1;
  }
  const withCases = industries.filter((i) => counts[i.slug]);
  const shown = withCases.length ? withCases : industries;

  const industrySection = shown.length
    ? `<div class="page-section flush filter-bar" id="industries" data-reveal>
        <p class="filter-label">Filter by industry</p>
        <div class="ind-bar">${shown.map((i) => industryPill(i, counts[i.slug] || 0)).join("")}</div>
      </div>`
    : "";

  const casesSection = `<section class="page-section flush">
      <h2>${useCases.length === 1 ? "One workflow" : `${useCases.length} workflows`}</h2>
      <p class="sub">Each one is a real job, start to finished file, run by a team of coworkers.</p>
      ${
        useCases.length
          ? `<div class="card-grid uc-grid">${useCases.map((uc) => useCaseCard(uc, crewOf(uc))).join("")}</div>`
          : `<p class="muted">Use cases are on the way. In the meantime, <a href="/tasks" style="text-decoration:underline">browse the template tasks</a>.</p>`
      }
    </section>`;

  const cr = [{ label: "Home", href: "/" }, { label: "Use cases" }];
  return (
    pageStart({
      title: "Use cases | Sokosumi",
      description:
        "What teams get done with AI coworkers on Sokosumi, organized by industry: real workflows with the coworkers and template tasks to run them.",
      path: "/use-cases",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>What teams get done with Sokosumi</h1>
      <p class="sub">Real workflows, mapped to your industry and handed to coworkers that already know the job.</p>
    </div>` +
    industrySection +
    casesSection +
    (useCases.length ? howItRuns() : "") +
    shell.quoteSection(shell.pickQuote(testimonials, 3), { heading: "What it is like once they are running" }) +
    blocks.ctaBand({
      heading: "Put a coworker on one of these this week",
      subheading: "Create an account, pick the use case closest to your job, and hand over the first brief.",
      ctaLabel: "Get started",
      ctaHref: shell.APP_SIGNUP,
    }) +
    pageEnd()
  );
}

async function industry(ctx) {
  const opts = { draft: ctx.preview };
  const ind = await cms.getIndustry(ctx.params.slug, opts);
  if (!ind) return null;
  const [allCases, coworkers] = await Promise.all([cms.getUseCases(opts), cms.getCoworkers(opts)]);
  const useCases = allCases.filter((uc) => industriesOf(uc).some((i) => i.slug === ind.slug));
  const crewOf = crewResolver(coworkers);

  const cr = [
    { label: "Home", href: "/" },
    { label: "Use cases", href: "/use-cases" },
    { label: ind.name },
  ];
  return (
    pageStart({
      title: `${ind.name} use cases | Sokosumi`,
      description: (ind.description || `How ${ind.name} teams put AI coworkers to work on Sokosumi.`).slice(0, 155),
      path: `/use-cases/industries/${ind.slug}`,
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">Use cases for</span>
      <h1>${esc(ind.name)}</h1>
      ${ind.description ? `<p class="sub">${esc(ind.description)}</p>` : ""}
      <p class="meta-row">${useCases.length} of the ${allCases.length} workflows on Sokosumi apply here. <a href="/use-cases" style="text-decoration:underline">See all use cases</a></p>
    </div>
    <div class="page-section flush">
      ${
        useCases.length
          ? `<div class="card-grid uc-grid">${useCases.map((uc) => useCaseCard(uc, crewOf(uc))).join("")}</div>`
          : `<p class="muted">Use cases for this industry are on the way. In the meantime, <a href="/use-cases" style="text-decoration:underline">browse all use cases</a>.</p>`
      }
    </div>` +
    blocks.ctaBand({
      heading: `Bring a coworker into your ${ind.name.toLowerCase()} team`,
      subheading: "Create an account and hand over the first brief today.",
      ctaLabel: "Get started",
      ctaHref: shell.APP_SIGNUP,
    }) +
    pageEnd()
  );
}

// ── detail page ──────────────────────────────────────────────────────────
// HubSpot's use-case shape (hubspot.com/use-case/generate-leads), translated
// to ink-on-paper: breadcrumb, a centred outcome-led hero over an abstract
// field with two CTAs, a centred value-prop intro, numbered capability
// chapters, the audience/segment grids the editors wrote, a results slot and
// a customer-quote slot that render nothing until real data exists, a
// mid-page CTA restating the outcome, the team as a supporting section, FAQ,
// related use cases, and the single closing band. No section leads with one
// coworker; every section renders nothing at all when its data is missing.

// Centred hero. The visual is a seeded abstract field (templates/art.js)
// behind the copy — deterministic per slug, different across the eight
// pages, and absent (a plain hero) if generation fails. Industry rides the
// eyebrow; both CTAs always present (the block's own when set, the site
// defaults when not).
function heroSection(doc, blk, inds) {
  const b = blk || {};
  const base = b.eyebrow || "Use case";
  const eyebrow = base === "Use case" && inds[0] ? `Use case · ${esc(inds[0].name)}` : esc(base);
  const heading = b.heading || doc.title;
  const sub = b.subheading || doc.description || "";

  const btn = (label, href, cls, analytics) =>
    `<a class="btn ${cls} btn-lg" href="${attr(href)}"${analytics ? ` data-analytics="sign_up_click" data-analytics-location="use_case_hero"` : ""}>${esc(label)}</a>`;
  const primaryHref = b.ctaHref || shell.APP_SIGNUP;
  const ctas =
    btn(b.ctaLabel || "Get started", primaryHref, "btn-primary", primaryHref.startsWith(shell.APP)) +
    btn(b.secondaryCtaLabel || "Talk to sales", b.secondaryCtaHref || shell.SALES_URL, "btn-outline");

  const svg = art.field(doc.slug, { w: 1200, h: 460, bias: "edges" });

  return `<section class="blk blk-hero uc-hero-hs" data-reveal>
    ${svg ? `<div class="uc-hero-art" aria-hidden="true">${svg}</div>` : ""}
    <div class="uc-hero-copy">
      <span class="eyebrow">${eyebrow}</span>
      <h1>${esc(heading)}</h1>
      ${sub ? `<p class="sub">${esc(sub)}</p>` : ""}
      <div class="cta-row">${ctas}</div>
      ${primaryHref.startsWith(shell.APP) ? shell.NO_CARD : ""}
    </div>
  </section>`;
}

// The first rich text block, hoisted under the hero as the centred
// value-prop intro — HubSpot's "Use Marketing Hub to…" paragraph. Pages
// whose editors wrote no rich text simply have no intro.
function introSection(b) {
  if (!b || !b.contentHtml) return "";
  return `<section class="blk uc-intro" data-reveal><div class="prose">${b.contentHtml}</div></section>`;
}

// The steps block, promoted from three small cards to the numbered spine of
// the page — one substantial chapter per step, HubSpot's "1. 2. 3." pattern
// in Sokosumi's language. Other collections keep the compact rendering in
// blocks.js.
function chapterSteps(b) {
  const items = b.items || [];
  if (!items.length) return "";
  const head =
    b.heading || b.subheading
      ? `<div class="blk-head">${b.heading ? `<h2>${esc(b.heading)}</h2>` : ""}${
          b.subheading ? `<p class="sub">${esc(b.subheading)}</p>` : ""
        }</div>`
      : "";
  return `<section class="blk blk-chapters" data-reveal>${head}
    <ol class="chapters">${items
      .map(
        (it, i) => `<li class="chapter">
        <span class="ch-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <div class="ch-body"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div>
      </li>`,
      )
      .join("")}</ol>
  </section>`;
}

// The mid-page CTA HubSpot places after the capability sections: the outcome
// restated, with the same pair of doors as the hero. Built entirely from the
// doc, so it never needs an editor and never invents a claim.
function midCta(doc, heroBlk) {
  const b = heroBlk || {};
  const primaryHref = b.ctaHref || shell.APP_SIGNUP;
  const signup = primaryHref.startsWith(shell.APP);
  return `<section class="page-section uc-mid-cta" data-reveal>
    <h2>${esc(doc.title)}</h2>
    <p class="sub">Create an account and hand over the first brief today.</p>
    <div class="cta-row">
      <a class="btn btn-primary btn-lg" href="${attr(primaryHref)}"${signup ? ` data-analytics="sign_up_click" data-analytics-location="use_case_mid"` : ""}>${esc(b.ctaLabel || "Get started")}</a>
      <a class="btn btn-outline btn-lg" href="${attr(shell.SALES_URL)}">Talk to sales</a>
    </div>
    ${signup ? shell.NO_CARD : ""}
  </section>`;
}

// The team is a supporting section, not the headline act: named coworkers
// with real template tasks a visitor can open and run — the proof this site
// can honestly make today. Absent crew, absent section.
function teamSection(crew, offers) {
  if (!crew.length) return "";
  const byAgent = new Map();
  for (const o of offers || []) {
    if (!byAgent.has(o.agentSlug)) byAgent.set(o.agentSlug, []);
    byAgent.get(o.agentSlug).push(o);
  }
  const cards = crew
    .map((c) => {
      const tasks = (byAgent.get(c.catalogSlug) || byAgent.get(c.slug) || []).slice(0, 2);
      return `<div class="uc-mate">
      <a class="by-row" href="/ai-coworkers/${encodeURIComponent(c.slug)}">
        ${avatar(c, "lg")}
        <span class="who">${esc(c.name)}${c.role ? `<small>${esc(c.role)}</small>` : ""}</span>
      </a>
      ${
        tasks.length
          ? `<div class="uc-mate-tasks">${tasks
              .map(
                (t) =>
                  `<a href="/ai-coworkers/${encodeURIComponent(c.slug)}/tasks/${encodeURIComponent(t.slug)}">${icon(
                    "arrow-up-right",
                    12,
                  )}<span>${esc(t.title)}</span></a>`,
              )
              .join("")}</div>`
          : ""
      }
    </div>`;
    })
    .join("");
  return `<section class="page-section" data-reveal>
    <h2>The coworkers who run it</h2>
    <p class="sub">Each one comes with template tasks behind this workflow, ready to brief. Open a task to see the deliverable before you start.</p>
    <div class="uc-team">${cards}</div>
  </section>`;
}

// Related work in the same industries — the "keep exploring" close HubSpot
// ends with, built from data that already exists on every doc.
function relatedSection(doc, inds, allCases, crewOf) {
  const mine = new Set(inds.map((i) => i.slug));
  const related = allCases
    .filter((uc) => uc.slug !== doc.slug && industriesOf(uc).some((i) => mine.has(i.slug)))
    .slice(0, 3);
  if (!related.length) return "";
  return `<section class="page-section" data-reveal>
    <h2>Related use cases</h2>
    <div class="card-grid uc-grid">${related.map((uc) => useCaseCard(uc, crewOf(uc))).join("")}</div>
  </section>`;
}

async function detail(ctx) {
  const opts = { draft: ctx.preview };
  const doc = await cms.getUseCase(ctx.params.slug, opts);
  if (!doc) return null;

  const inds = industriesOf(doc);
  const [coworkers, offers, allCases] = await Promise.all([
    cms.getCoworkers(opts).catch(() => []),
    cms.getOffers(opts).catch(() => []),
    cms.getUseCases(opts).catch(() => []),
  ]);
  const crewOf = crewResolver(coworkers);
  const crew = crewOf(doc);

  // Split the layout into the pieces the page re-orders around its own
  // sections: the opening hero, the closing band, the first rich text
  // (hoisted to the centred intro under the hero), and the FAQ (which reads
  // best after the team, as the last objection before the close). Whatever
  // an editor composed in between renders in their order — steps promoted
  // to numbered chapters, everything else exactly as on any CMS page. A
  // stats block is the results band and a quote block is the customer
  // story; neither exists until an editor has real numbers or a named
  // customer, so those HubSpot sections render nothing today.
  const layout = [...(doc.layout || [])];
  const heroBlock = layout[0] && layout[0].blockType === "hero" ? layout.shift() : null;
  const bandBlock = layout.length && layout[layout.length - 1].blockType === "ctaBand" ? layout.pop() : null;
  const introIdx = layout.findIndex((b) => b.blockType === "richText");
  const introBlock = introIdx >= 0 ? layout.splice(introIdx, 1)[0] : null;
  const faqIdx = layout.findIndex((b) => b.blockType === "faq");
  const faqBlock = faqIdx >= 0 ? layout.splice(faqIdx, 1)[0] : null;

  const middle = layout
    .map((b) => (b.blockType === "steps" ? chapterSteps(b) : blocks.renderBlocks([b])))
    .join("\n");

  const band = blocks.ctaBand(
    bandBlock || {
      heading: "Put a coworker on this",
      subheading: "Create an account, pick this use case, and hand over the first brief.",
    },
  );

  const cr = [{ label: "Home", href: "/" }, { label: "Use cases", href: "/use-cases" }];
  if (inds.length) {
    cr.push({ label: inds[0].name, href: `/use-cases/industries/${inds[0].slug}` });
  }
  cr.push({ label: doc.title });

  return (
    pageStart({
      title: `${doc.title} | Sokosumi use cases`,
      description: (doc.description || "").slice(0, 155),
      path: `/use-cases/${doc.slug}`,
      breadcrumb: cr,
      jsonld: blocks.faqJsonLd(blocks.collectFaqs(doc.layout)) || undefined,
    }) +
    heroSection(doc, heroBlock, inds) +
    introSection(introBlock) +
    middle +
    midCta(doc, heroBlock) +
    teamSection(crew, offers) +
    (faqBlock ? blocks.renderBlocks([faqBlock]) : "") +
    relatedSection(doc, inds, allCases, crewOf) +
    band +
    pageEnd()
  );
}

module.exports = { hub, industry, detail };

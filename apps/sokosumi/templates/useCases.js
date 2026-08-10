// /use-cases (hub), /use-cases/industries/<slug> (industry hub), and
// /use-cases/<slug> (detail) — CMS `use-cases` collection plus the shared
// `industries` taxonomy. Detail pages are block-based (see blocks.js).

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const { esc, icon, avatar, pageStart, pageEnd } = shell;

// Populated industry relations only (depth 1 gives objects; ids are skipped).
function industriesOf(uc) {
  return (uc.industries || []).filter((i) => i && typeof i === "object" && i.slug);
}

// A use case card carries the two things a reader actually wants: which
// industry it is for, and who does the work. `crew` is the resolved coworker
// docs behind relatedAgents; it is optional, so the card degrades to text.
function useCaseCard(uc, crew) {
  const ind = industriesOf(uc)[0];
  const team = (crew || []).slice(0, 4);
  const faces = team.length
    ? `<span class="uc-crew">${team.map((c) => avatar(c, "xs")).join("")}<em>${esc(
        team.length === 1 ? team[0].name : `${team.length} coworkers`,
      )}</em></span>`
    : "";
  return `<a class="card uc-card" href="/use-cases/${encodeURIComponent(uc.slug)}">
    <span class="uc-eyebrow">${esc(ind ? ind.name : "Use case")}</span>
    <h3>${esc(uc.title)}</h3>
    <p>${esc(uc.description || "")}</p>
    <div class="card-foot">${faces || `<span class="tag-quiet">Read the workflow</span>`}<span class="go">${icon(
      "arrow-up-right",
      15,
    )}</span></div>
  </a>`;
}

// Industries read as a grid of destinations rather than a thin list: the
// count is the point, so it gets the display weight.
function industryCard(ind, count) {
  return `<a class="ind-card" href="/use-cases/industries/${encodeURIComponent(ind.slug)}">
    <span class="ind-count">${count || 0}</span>
    <span class="ind-body">
      <strong>${esc(ind.name)}</strong>
      ${ind.description ? `<span>${esc(ind.description)}</span>` : ""}
    </span>
    <span class="ind-go">${icon("arrow-up-right", 15)}</span>
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
  const [useCases, industries, coworkers] = await Promise.all([
    cms.getUseCases(opts),
    cms.getIndustries(opts),
    cms.getCoworkers(opts),
  ]);
  const crewOf = crewResolver(coworkers);

  const counts = {};
  for (const uc of useCases) {
    for (const ind of industriesOf(uc)) counts[ind.slug] = (counts[ind.slug] || 0) + 1;
  }
  const withCases = industries.filter((i) => counts[i.slug]);
  const shown = withCases.length ? withCases : industries;

  const industrySection = shown.length
    ? `<div class="page-section flush">
        <h2>Start with your industry</h2>
        <p class="sub">The same coworkers, briefed for the way your market actually works.</p>
        <div class="ind-grid">${shown.map((i) => industryCard(i, counts[i.slug] || 0)).join("")}</div>
      </div>`
    : `<div class="page-section flush"><p class="muted">Industry pages are on the way. In the meantime, <a href="/coworkers" style="text-decoration:underline">meet the coworkers</a>.</p></div>`;

  const casesSection = `<section class="page-section">
      <h2>All use cases</h2>
      <p class="sub">${
        useCases.length === 1
          ? "One workflow, start to finished file."
          : `${useCases.length} workflows, each one start to finished file.`
      }</p>
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
    blocks.ctaBand({
      heading: "Put a coworker on one of these this week",
      subheading: "Create an account, pick the use case closest to your job, and hand over the first brief.",
      ctaLabel: "Get started",
      ctaHref: shell.APP,
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
      <span class="eyebrow">Industry</span>
      <h1>${esc(ind.name)}</h1>
      ${ind.description ? `<p class="sub">${esc(ind.description)}</p>` : ""}
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
      ctaHref: shell.APP,
    }) +
    pageEnd()
  );
}

async function detail(ctx) {
  const opts = { draft: ctx.preview };
  const doc = await cms.getUseCase(ctx.params.slug, opts);
  if (!doc) return null;

  const layout = doc.layout || [];
  const inds = industriesOf(doc);
  const relatedSlugs = (doc.relatedAgents || []).map((r) => r && r.agentSlug).filter(Boolean);

  let coworkerSection = "";
  if (relatedSlugs.length) {
    const coworkers = await cms.getCoworkers(opts);
    const bySlug = new Map();
    for (const c of coworkers) {
      bySlug.set(c.slug, c);
      if (c.catalogSlug) bySlug.set(c.catalogSlug, c);
    }
    const matched = relatedSlugs.map((s) => bySlug.get(s)).filter(Boolean);
    if (matched.length) {
      const rows = matched
        .map(
          (c) => `<a class="by-row" href="/coworkers/${encodeURIComponent(c.slug)}">
          ${avatar(c, "sm")}
          <span class="who">${esc(c.name)}${c.role ? `<small>${esc(c.role)}</small>` : ""}</span>
        </a>`,
        )
        .join("");
      coworkerSection = `<section class="page-section">
        <h2>Coworkers for this</h2>
        <p class="sub">Coworkers who already run this kind of work. Open a profile to see their template tasks.</p>
        <div style="display:flex;flex-wrap:wrap;gap:16px 32px">${rows}</div>
      </section>`;
    }
  }

  // Block layouts open with their own hero, so no page-head here. Fall back
  // to a plain head when a doc has no layout yet.
  const body = layout.length
    ? blocks.renderBlocks(layout)
    : `<div class="page-head" data-reveal>
        <h1>${esc(doc.title)}</h1>
        ${doc.description ? `<p class="sub">${esc(doc.description)}</p>` : ""}
      </div>`;

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
      jsonld: blocks.faqJsonLd(blocks.collectFaqs(layout)) || undefined,
    }) +
    body +
    coworkerSection +
    pageEnd()
  );
}

module.exports = { hub, industry, detail };

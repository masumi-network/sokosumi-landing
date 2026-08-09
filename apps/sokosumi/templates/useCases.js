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

function useCaseCard(uc) {
  const tags = industriesOf(uc)
    .map((i) => `<span class="tag-quiet">${esc(i.name)}</span>`)
    .join("");
  return `<a class="card" href="/use-cases/${encodeURIComponent(uc.slug)}">
    <h3>${esc(uc.title)}</h3>
    <p>${esc(uc.description || "")}</p>
    <div class="card-foot">${tags || `<span class="tag-quiet">Use case</span>`}<span class="go">${icon("arrow-up-right", 15)}</span></div>
  </a>`;
}

function industryRow(ind, count) {
  return `<a class="row-item" href="/use-cases/industries/${encodeURIComponent(ind.slug)}">
    <h3>${esc(ind.name)}</h3>
    <p>${esc(ind.description || "")}</p>
    <span class="row-go">${count ? `${count} use case${count > 1 ? "s" : ""}` : "View"} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function hub(ctx) {
  const opts = { draft: ctx.preview };
  const [useCases, industries] = await Promise.all([cms.getUseCases(opts), cms.getIndustries(opts)]);

  const counts = {};
  for (const uc of useCases) {
    for (const ind of industriesOf(uc)) counts[ind.slug] = (counts[ind.slug] || 0) + 1;
  }
  const withCases = industries.filter((i) => counts[i.slug]);
  const shown = withCases.length ? withCases : industries;

  const industrySection = shown.length
    ? `<div class="page-section flush">
        <h2>By industry</h2>
        <div class="row-list">${shown.map((i) => industryRow(i, counts[i.slug] || 0)).join("")}</div>
      </div>`
    : `<div class="page-section flush"><p class="muted">Industry pages are on the way. In the meantime, <a href="/coworkers" style="text-decoration:underline">meet the coworkers</a>.</p></div>`;

  const casesSection = `<section class="page-section">
      <h2>All use cases</h2>
      ${
        useCases.length
          ? `<div class="card-grid">${useCases.map(useCaseCard).join("")}</div>`
          : `<p class="muted">Use cases are on the way. In the meantime, <a href="/tasks" style="text-decoration:underline">browse the pre-built tasks</a>.</p>`
      }
    </section>`;

  const cr = [{ label: "Home", href: "/" }, { label: "Use cases" }];
  return (
    pageStart({
      title: "Use cases | Sokosumi",
      description:
        "What teams get done with AI coworkers on Sokosumi, organized by industry: real workflows with the coworkers and pre-built tasks to run them.",
      path: "/use-cases",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>What teams get done with Sokosumi</h1>
      <p class="sub">Real workflows, mapped to your industry and handed to coworkers that already know the job.</p>
    </div>` +
    industrySection +
    casesSection +
    pageEnd()
  );
}

async function industry(ctx) {
  const opts = { draft: ctx.preview };
  const ind = await cms.getIndustry(ctx.params.slug, opts);
  if (!ind) return null;
  const useCases = (await cms.getUseCases(opts)).filter((uc) =>
    industriesOf(uc).some((i) => i.slug === ind.slug),
  );

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
          ? `<div class="card-grid">${useCases.map(useCaseCard).join("")}</div>`
          : `<p class="muted">Use cases for this industry are on the way. In the meantime, <a href="/use-cases" style="text-decoration:underline">browse all use cases</a>.</p>`
      }
    </div>` +
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
    const bySlug = new Map(coworkers.map((c) => [c.slug, c]));
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
        <p class="sub">Coworkers who already run this kind of work. Open a profile to see their pre-built tasks.</p>
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

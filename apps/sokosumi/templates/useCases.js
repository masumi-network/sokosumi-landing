// /use-cases (hub), /use-cases/industries/<slug> (industry hub), and
// /use-cases/<slug> (detail) — CMS `use-cases` collection plus the shared
// `industries` taxonomy. Detail pages are block-based (see blocks.js).

const shell = require("./shell");
const deliverable = require("./deliverable");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const art = require("./art");

// Pick a gradient from the shared pool (assets/gradients/), seeded by the
// slug so a page always gets the same one. Same FNV idea as art.rng.
const GRAD_POOL = [2, 3, 4, 5, 6, 7, 8, 9, 10];
function gradFor(seed) {
  let h = 2166136261 >>> 0;
  const str = String(seed || "sokosumi");
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return "/assets/gradients/g" + GRAD_POOL[(h >>> 0) % GRAD_POOL.length] + ".webp";
}

// Generated line-collage images per workflow (assets/use-case-img/<slug>.webp,
// see IMAGERY.md for the prompt recipe;
// people at work in the brand's light office world). Slugs without a photo
// fall back to the gradient pool.
const UC_PHOTOS = new Set([
  "always-on-social-listening",
  "audience-research-sprint",
  "competitor-monitoring",
  "seo-and-ai-visibility",
  "agency-new-business-research",
  "launch-content-engine",
  "seasonal-campaign-planning",
  "market-intelligence-briefings",
]);
function ucVisual(slug) {
  return UC_PHOTOS.has(slug) ? "/assets/use-case-img/" + slug + ".webp" : gradFor(slug);
}
const { t, tp } = require("../lib/i18n");
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
// What the workflow hands back, read off the copy. Honest and cheap: no
// invented metrics, just the noun the brief already uses.
function deliverableOf(uc) {
  return t(deliverable.LABELS[deliverable.kindOf(uc)]);
}

// The study card: what comes back, and who does it. Sits on the stage in
// place of stock imagery — the visual is the product, not a mood.
function studyCard(uc, crew, opts) {
  const o = opts || {};
  const people = (crew || []).slice(0, o.compact ? 4 : 5);
  const n = (crew || []).length;
  const roster = o.compact
    ? ""
    : `<ul class="uc-study-crew">${people
        .map((c) => `<li>${shell.avatar(c)}<span><strong>${esc(c.name)}</strong><small>${esc(c.role || c.tagline || "")}</small></span></li>`)
        .join("")}</ul>`;
  return `<span class="uc-stage${o.compact ? " is-compact" : ""}" aria-hidden="true">
    <span class="uc-study">
      <span class="uc-study-head">
        ${deliverable.svg(deliverable.kindOf(uc), "uc-mock")}
        <span class="uc-study-title"><strong>${esc(deliverableOf(uc))}</strong><small>${esc(t("What comes back"))}</small></span>
        
      </span>
      ${roster}
      ${n ? `<span class="uc-study-foot">${esc(tp(n, "{n} coworker on it", "{n} coworkers on it"))}</span>` : ""}
    </span>
  </span>`;
}

function useCaseCard(uc, crew, i) {
  const ind = industriesOf(uc)[0];
  const media = studyCard(uc, crew, { compact: true });
  const n = (crew || []).length;
  const foot = n ? tp(n, "{n} coworker on it", "{n} coworkers on it") : t("Read the workflow");
  return `<a class="card uc-card${media ? " has-art" : ""}" href="/use-cases/${encodeURIComponent(uc.slug)}">
    ${media}
    <span class="uc-eyebrow">${esc(ind ? ind.name : t("Use case"))}</span>
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
  ["Hand it over", "Each workflow lists its coworkers, sources, and output format."],
  ["Get the file", "A finished deliverable lands in the app: a report, a deck, a sheet, a dashboard."],
];

function howItRuns() {
  return `<section class="page-section">
    <h2>${esc(t("How a use case runs"))}</h2>
    <p class="sub">${esc(t("Each use case lists the coworkers and tasks that run it."))}</p>
    <ol class="uc-steps">
      ${HOW.map(
        ([title, d], i) => `<li><span class="n">${String(i + 1).padStart(2, "0")}</span><strong>${esc(
          t(title),
        )}</strong><span>${esc(t(d))}</span></li>`,
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
        <p class="filter-label">${esc(t("Filter by industry"))}</p>
        <div class="ind-bar">${shown.map((i) => industryPill(i, counts[i.slug] || 0)).join("")}</div>
      </div>`
    : "";

  const casesSection = `<section class="page-section flush">
      <h2>${esc(useCases.length === 1 ? t("One workflow") : t("{n} workflows", { n: useCases.length }))}</h2>
      <p class="sub">${esc(t("Each workflow shows the brief, the coworkers, and the file you get back."))}</p>
      ${
        useCases.length
          ? `<div class="card-grid uc-grid">${useCases.map((uc, i) => useCaseCard(uc, crewOf(uc), i)).join("")}</div>`
          : `<p class="muted">${esc(t("Use cases are on the way. In the meantime,"))} <a href="/tasks" style="text-decoration:underline">${esc(t("browse the template tasks"))}</a>.</p>`
      }
    </section>`;

  const cr = [{ label: "Home", href: "/" }, { label: "Use cases" }];
  return (
    pageStart({
      title: t("Use cases | Sokosumi"),
      description:
        "What teams get done with AI coworkers on Sokosumi, organized by industry: real workflows with the coworkers and template tasks to run them.",
      path: "/use-cases",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>${esc(t("What teams get done with Sokosumi"))}</h1>
      <p class="sub">${esc(t("Real workflows, mapped to your industry and handed to coworkers that already know the job."))}</p>
    </div>` +
    industrySection +
    casesSection +
    (useCases.length ? howItRuns() : "") +
    shell.logoRow() +
    shell.quoteSection(shell.pickQuote(testimonials, 3), { heading: t("What it is like once they are running") }) +
    blocks.ctaBand({
      heading: t("Put a coworker on one of these this week"),
      subheading: t("Create an account, pick the use case closest to your job, and hand over the first brief."),
      ctaLabel: t("Get started"),
      ctaHref: shell.APP,
    }) +
    pageEnd()
  );
}


// ── industry SEO content ─────────────────────────────────────────────────
// Each industry page targets its head query ("AI for agencies", "AI coworkers
// for agencies") with real content: a query-led h1, what that industry uses
// coworkers for, an FAQ (FAQPage JSON-LD), and the use-case cards as the path
// to the long-tail pages ("AI for SEO automation" → seo-and-ai-visibility).
// Copy is page content in the CMS style — English on both locales — and a CMS
// doc with the same slug keeps working underneath: name/description come from
// the CMS, this layer wraps it. Facts stay Sokosumi-true: no invented stats.
const INDUSTRY_CONTENT = {
  agencies: {
    why: "Where agencies use Sokosumi",
    cta: "Bring a coworker into your agency",
    metaTitle: "AI for agencies: AI coworkers for agency teams | Sokosumi",
    metaDesc: "AI coworkers for agencies: pitch research from public sources, competitive sets per client, and production at retainer scale.",
    h1: "AI coworkers for agencies",
    sub: "Use named AI specialists for research, strategy, and production across client accounts. Sokosumi was built with Serviceplan Group.",
    split: {
      today: { label: "Your agency today", line: "The pitch is Thursday and the research is unbillable.", items: [
        "Pitch research eats senior hours nobody invoices",
        "Every new account restarts the same competitive analysis",
        "Juniors spend days compiling decks clients skim in minutes",
        "Retainer scope grows; headcount cannot",
      ], eg: "Three people, two evenings, one prospect deck." },
      withS: { label: "With Sokosumi", line: "Brief it once. A sourced file comes back as a task you review.", items: [
        "A prospect brief before every first call, as a sourced PDF",
        "Competitive sets per client, refreshed on a schedule",
        "Content calendars and variants in each client's voice",
        "Coworkers cost credits per run, not salaries",
      ], eg: "\u201cHannah — before the 11:00: their market, their vendors, and the procurement angle to lead with.\u201d" },
    },
    week: { heading: "What agencies put on a schedule", sub: "One way to set it up.", items: [
      { title: "Weekly", text: "Performance and competitor reports per account, as scheduled tasks." },
      { title: "Before a pitch", text: "New-business research: market, site, campaigns, gaps." },
      { title: "Per client", text: "Content calendars and campaign plans, drafted for your team to shape." },
    ] },
    deliver: { heading: "What lands on your desk", items: [
      { title: "Prospect briefs", text: "Two pages before the first call: their market, their tooling, the angle — with sources." },
      { title: "Per-client competitive sets", text: "Pricing, positioning and gaps as a PDF your strategists annotate, not rebuild." },
      { title: "Production files", text: "Calendars, copy variants and campaign plans as documents, in the client's format." },
    ] },
    faq: [
      ["What does AI for agencies actually look like on Sokosumi?", "Named AI coworkers join your channels and task board. Account leads brief them like junior colleagues — research, strategy drafts, production — and get finished files back per client."],
      ["Can each client account get its own setup?", "Yes. Projects hold per-client context, briefs and outputs."],
      ["Who builds the coworkers agencies use?", "Sokosumi is built with Serviceplan Group. Every vendor builds and runs its own coworkers."],
      ["How do agencies charge for coworker output?", "Coworkers run on credits. Review each output before it goes into client work. Start on the free plan with one live account."],
    ],
  },
  "e-commerce-retail": {
    why: "Where e-commerce teams use Sokosumi",
    cta: "Bring a coworker into your e-commerce team",
    metaTitle: "AI for e-commerce marketing | Sokosumi",
    metaDesc: "AI coworkers for e-commerce and retail: weekly competitor pricing memos, a written read of your customers, and seasonal campaign plans before the peak.",
    h1: "AI coworkers for e-commerce & retail",
    sub: "Watch your market, your competitors and your seasons — with AI specialists that deliver reports and campaign plans, not dashboards you still have to read.",
    split: {
      today: { label: "Your team today", line: "The season starts before the plan is ready.", items: [
        "Seasonal planning that starts late",
        "Competitor price moves surface after your campaign shipped",
        "Reviews and social mentions pile up unread",
        "Reporting that eats the start of the week",
      ], eg: "The autumn campaign brief, finalized in October." },
      withS: { label: "With Sokosumi", line: "The plan is done before the buying window opens.", items: [
        "Seasonal plan and creative briefs ahead of every peak",
        "A weekly competitor memo: launches, pricing, ads",
        "A written read of what customers actually say",
        "A weekly report on the schedule you set",
      ], eg: "\u201cWatch our top five competitors — weekly memo on pricing moves and what to do about them.\u201d" },
    },
    week: { heading: "A week with coworkers on the team", sub: "Set once; the files keep coming.", items: [
      { title: "Weekly", text: "Performance report and competitor pricing memo, side by side." },
      { title: "Midweek", text: "The social listening read: sentiment, themes, and the reviews worth answering." },
      { title: "Before each season", text: "Demand signals turned into a campaign plan, calendar and creative briefs — before the window." },
    ] },
    deliver: { heading: "What lands on your desk", items: [
      { title: "Weekly performance report", text: "Reach, sign-ups and what changed vs. last week — one page, ready to forward." },
      { title: "Competitor pricing memo", text: "Price moves, launches and ad angles across your set, sourced and dated." },
      { title: "Seasonal campaign pack", text: "Plan, calendar and creative briefs as documents your team executes." },
    ] },
    faq: [
      ["How is this different from an e-commerce analytics tool?", "Tools show dashboards you still have to read. Coworkers deliver the reading: a written report of what changed and what to do, on a schedule you set."],
      ["Can it watch competitors' pricing and ads?", "Yes — competitor monitoring runs as a scheduled task and lands as a weekly sourced memo covering launches, pricing moves and messaging."],
      ["Does it work for seasonal peaks?", "That is a core workflow: brief the seasonal plan once and coworkers deliver the plan, calendar and creative briefs ahead of the peak."],
      ["What do we get back, concretely?", "Files: PDF reports, documents, spreadsheets and live dashboards — attached to tasks your whole team can see."],
    ],
  },
  "financial-services": {
    why: "Where financial teams use Sokosumi",
    cta: "Bring a coworker into your marketing team",
    metaTitle: "AI for financial services marketing | Sokosumi",
    metaDesc: "AI coworkers for financial services: sourced market briefings on a schedule, run history on every task, and EU hosting stated up front.",
    h1: "AI coworkers for financial services",
    sub: "Market intelligence and marketing production for teams that answer to compliance — with coworkers that state their models and hosting region before you hire them.",
    split: {
      today: { label: "Your team today", line: "Every briefing costs analyst hours; every tool is a compliance question first.", items: [
        "Market briefings depend on scarce analyst time",
        "Every claim needs provenance before it ships",
        "New tools stall in data-residency review",
        "Who-asked-for-what lives in inboxes",
      ], eg: "A quarterly competitor review, compiled by hand." },
      withS: { label: "With Sokosumi", line: "A sourced briefing on schedule, with the run history built in.", items: [
        "Recurring market briefings with sources attached",
        "Files reviewed in your flow — nothing publishes itself",
        "Models and hosting region stated on every coworker profile; EU hosting available",
        "Every run logged in History: brief, coworker, cost, output",
      ], eg: "\u201cWeekly market briefing: rates, competitors, regulation-driven shifts — with sources.\u201d" },
    },
    week: { heading: "A week with coworkers on the team", sub: "Intelligence as a schedule, not a project.", items: [
      { title: "Monday", text: "The market briefing lands: competitors, rates context, regulatory shifts — sourced." },
      { title: "Continuous", text: "Competitor monitoring logs launches and pricing changes as they appear." },
      { title: "On demand", text: "Deep-dives for board decks and product launches, briefed like any other task." },
    ] },
    deliver: { heading: "What lands on your desk", items: [
      { title: "Sourced market briefings", text: "A recurring document with references — readable by compliance, forwardable to the board." },
      { title: "Competitor log", text: "Product launches, pricing and positioning across your set, dated and sourced." },
      { title: "Run history", text: "History keeps every run: who briefed it, which coworker ran it, what it cost, what came back." },
    ] },
    faq: [
      ["Where does our data live?", "Coworker profiles state the models they run on and the hosting region before you hire them; EU hosting is available, and the Personal Assistant runs Swiss-hosted open-source models."],
      ["Is every run logged?", "Yes. Every task run is logged in History with its status, coworker and credit cost, and files stay attached to the task that produced them."],
      ["Can compliance review the output before it ships?", "Outputs land on a shared board as files — nothing publishes itself. Review happens in your normal flow, with comments on the task."],
      ["What do financial teams start with?", "Market intelligence briefings on a schedule: one brief, a recurring sourced document."],
    ],
  },
  "media-publishing": {
    why: "Where publishers use Sokosumi",
    cta: "Bring a coworker into your newsroom",
    metaTitle: "AI for media & publishing teams | Sokosumi",
    metaDesc: "AI coworkers for media and publishing: launch coverage drafts from one brief, search and AI-answer visibility measured, editors keep approval.",
    h1: "AI coworkers for media & publishing",
    sub: "Volume without losing the desk: coworkers draft, research and measure — your editors decide what ships.",
    split: {
      today: { label: "Your desk today", line: "Fewer editors, more surfaces, and AI answers taking the search traffic.", items: [
        "Every vertical needs more coverage than the desk can draft",
        "Search traffic is shifting to AI answers you cannot see",
        "Audience research is guesswork between analytics tools",
        "Launch pushes drown the week they land in",
      ], eg: "One launch, one exhausted content team." },
      withS: { label: "With Sokosumi", line: "One brief becomes a stack of coverage drafts.", items: [
        "Launch brief in, coverage drafts out",
        "Rankings and AI-answer visibility measured together",
        "Sourced audience profiles as documents",
        "Editors keep approval; coworkers hand back drafts",
      ], eg: "\u201cTurn the spring vertical launch into four weeks of coverage: positioning, landing copy, social variants.\u201d" },
    },
    week: { heading: "A week with coworkers on the desk", sub: "Drafts arrive; judgment stays yours.", items: [
      { title: "Monday", text: "The visibility report: what ranks, what AI assistants cite, where the gaps are." },
      { title: "Per launch", text: "The content engine turns one brief into a coverage calendar with drafts attached." },
      { title: "Per vertical", text: "Audience research sprints before you commission — sourced profiles, message tests." },
    ] },
    deliver: { heading: "What lands on the desk", items: [
      { title: "Coverage calendars with drafts", text: "Planned pieces per launch, each with a working draft to edit." },
      { title: "Search & AI visibility reports", text: "Rankings plus how AI assistants answer questions about your titles — measured monthly." },
      { title: "Audience profiles", text: "Sourced reader profiles and message tests as documents, per vertical." },
    ] },
    faq: [
      ["Will the output match our editorial voice?", "Workspace context carries your style guide into every task, and edits run as follow-ups on the same task until the voice is right."],
      ["Can it help with SEO at publishing scale?", "Yes — the SEO & AI visibility workflow tracks rankings and AI-assistant visibility and returns a prioritized read, on a monthly schedule if you want it."],
      ["Do editors keep control?", "Coworkers deliver drafts and files to the board; editors review, comment and approve in their normal flow."],
      ["What team size does this fit?", "The free plan works for a single desk; credits per seat scale it to a newsroom."],
    ],
  },
  "saas-technology": {
    why: "Where SaaS teams use Sokosumi",
    cta: "Bring a coworker into your marketing team",
    metaTitle: "AI for SaaS marketing teams | Sokosumi",
    metaDesc: "AI coworkers for SaaS teams: the Monday competitor memo, AI-answer visibility next to rankings, and a launch content kit from one brief.",
    h1: "AI coworkers for SaaS & technology",
    sub: "Give the recurring marketing jobs to coworkers and keep the judgment calls.",
    split: {
      today: { label: "Your team today", line: "Competitors ship weekly. You find out monthly.", items: [
        "Competitor moves surface late and anecdotally",
        "AI assistants describe your category — without you in the answer",
        "Every launch needs a content push you cannot staff",
        "Reporting is a chore that slips",
      ], eg: "A competitor pricing change, discovered in a lost deal." },
      withS: { label: "With Sokosumi", line: "The Monday memo knows before the lost deal does.", items: [
        "Weekly competitor memo: launches, pricing, positioning",
        "AI-answer visibility measured next to search rankings",
        "A launch kit from one brief: positioning, copy, one-pagers",
        "The weekly report writes itself, on schedule",
      ], eg: "\u201cWeekly memo on our top three competitors — what launched, what changed in pricing, what it means.\u201d" },
    },
    week: { heading: "A week with coworkers on the team", sub: "Recurring work runs itself; launches get a kit.", items: [
      { title: "Weekly", text: "Competitor memo and performance report, side by side." },
      { title: "Monthly", text: "Search and AI visibility measured: where you rank, how assistants describe you." },
      { title: "Per launch", text: "One brief in — positioning, landing copy, social variants and a sales one-pager out." },
    ] },
    deliver: { heading: "What lands on your desk", items: [
      { title: "The Monday memo", text: "Competitor launches, pricing changes and positioning shifts — short, sourced, scheduled." },
      { title: "Visibility reports", text: "Rankings plus AI-assistant answers about your category, as a monthly document." },
      { title: "Launch kits", text: "Positioning doc, landing copy, social variants and a one-pager, from a single brief." },
    ] },
    faq: [
      ["How is this different from hiring a contractor?", "Coworkers start in minutes, keep your context between tasks, and cost credits per run — with sample outputs you can inspect before spending anything."],
      ["Can it track how AI assistants talk about us?", "Yes — AI visibility is part of the SEO workflow: how assistants answer questions about your category and where you appear."],
      ["Does it integrate with our stack?", "Work arrives as files and live web deliverables; the Personal Assistant connects mail, calendar, docs and chat tools."],
      ["What does a lean team start with?", "One scheduled task — usually the weekly competitor memo or the weekly performance report — then the launch workflows."],
    ],
  },
  "travel-hospitality": {
    why: "Where travel teams use Sokosumi",
    cta: "Bring a coworker into your team",
    metaTitle: "AI for travel & hospitality marketing | Sokosumi",
    metaDesc: "AI coworkers for travel and hospitality: seasonal campaign plans before the booking window, a weekly read of guest sentiment, demand signals turned into plans.",
    h1: "AI coworkers for travel & hospitality",
    sub: "Seasons, reviews and demand signals, read and turned into plans before the booking window closes. The credit price shows before each task.",
    split: {
      today: { label: "Your team today", line: "The booking window closes while the plan is in review.", items: [
        "Season planning trails the booking window",
        "Guest reviews pile up across five platforms",
        "Demand shifts show up in bookings — too late",
        "Two people carry the seasonal workload spike",
      ], eg: "Summer campaign approved in June." },
      withS: { label: "With Sokosumi", line: "The season is planned before the window opens.", items: [
        "Campaign plan, calendar and briefs ahead of each season",
        "A weekly written read of guest sentiment and reviews worth answering",
        "Demand signals read early and turned into plans",
        "Coworkers absorb the spike; the team keeps the judgment",
      ], eg: "\u201cRead this season's demand signals and draft the campaign plan — before bookings open.\u201d" },
    },
    week: { heading: "A week with coworkers on the team", sub: "Small team, steady output.", items: [
      { title: "Monday", text: "The guest sentiment read: what reviews say across platforms, and which to answer." },
      { title: "Monthly", text: "A market briefing: destination trends, competitor offers, pricing moves." },
      { title: "Per season", text: "Demand signals turned into the campaign plan, calendar and creative briefs." },
    ] },
    deliver: { heading: "What lands on your desk", items: [
      { title: "Sentiment reads", text: "A weekly written summary of reviews and mentions — themes, tone, and replies worth making." },
      { title: "Seasonal campaign packs", text: "Plan, calendar and creative briefs, delivered before the booking window." },
      { title: "Market briefings", text: "Destination trends and competitor offers as a recurring, sourced document." },
    ] },
    faq: [
      ["Can it plan around our seasons?", "Yes — seasonal campaign planning is a core workflow: brief it once per season and the plan, calendar and briefs come back before the booking window."],
      ["Does it read reviews and social mentions?", "Social listening covers the platforms your guests use and returns a written read: sentiment, emerging themes, and posts worth a reply."],
      ["We are a small team — is this overkill?", "The free plan fits a small team. Start with one scheduled listening or briefing task."],
      ["What languages does it work in?", "Coworkers brief and deliver in the language you use — English and German are first-class on Sokosumi."],
    ],
  },
};


async function industry(ctx) {
  const opts = { draft: ctx.preview };
  const ind = await cms.getIndustry(ctx.params.slug, opts);
  if (!ind) return null;
  const [allCases, coworkers, testimonials] = await Promise.all([
    cms.getUseCases(opts),
    cms.getCoworkers(opts),
    cms.getTestimonials(opts).catch(() => []),
  ]);
  const useCases = allCases.filter((uc) => industriesOf(uc).some((i) => i.slug === ind.slug));
  const crewOf = crewResolver(coworkers);

  const cr = [
    { label: "Home", href: "/" },
    { label: "Use cases", href: "/use-cases" },
    { label: ind.name },
  ];
  const cc = INDUSTRY_CONTENT[ind.slug];
  // The why: the industry's week today vs. with coworkers, as the same
  // paper/ink split panel /ai-coworkers uses — four contrasts that read
  // across, one example under each side.
  const splitSide = (cls, d) => `<div class="cw-split-side ${cls}">
      <span class="cw-split-label">${esc(d.label)}</span>
      <p class="cw-split-line">${esc(d.line)}</p>
      <ul class="cw-split-list">${d.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>
      <p class="cw-split-eg"><span>${esc(cls === "is-agent" ? t("e.g.") : t("the brief"))}</span> ${esc(d.eg)}</p>
    </div>`;
  const splitBlock = cc
    ? `<section class="page-section" data-reveal>
        <h2>${esc(cc.why)}</h2>
        <div class="cw-split ind-split">${splitSide("is-agent", cc.split.today)}${splitSide("is-coworker", cc.split.withS)}</div>
      </section>`
    : "";
  const weekBlock = cc
    ? blocks.renderBlocks([{ blockType: "steps", heading: cc.week.heading, subheading: cc.week.sub, items: cc.week.items }])
    : "";
  const deliverBlock = cc
    ? blocks.renderBlocks([{ blockType: "featureGrid", heading: cc.deliver.heading, items: cc.deliver.items }])
    : "";
  const faqBlock = cc
    ? blocks.renderBlocks([{ blockType: "faq", heading: "Questions we get", items: cc.faq.map(([q, a]) => ({ question: q, answer: a })) }])
    : "";
  return (
    pageStart({
      title: cc ? t(cc.metaTitle) : t("{name} use cases | Sokosumi", { name: ind.name }),
      description: cc ? t(cc.metaDesc) : (ind.description || t("How {name} teams put AI coworkers to work on Sokosumi.", { name: ind.name })).slice(0, 155),
      path: `/use-cases/industries/${ind.slug}`,
      breadcrumb: cr,
      jsonld: cc ? blocks.faqJsonLd(cc.faq.map(([q, a]) => ({ question: q, answer: a }))) : undefined,
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">${esc(t("Use cases for"))} ${esc(ind.name)}</span>
      <h1>${esc(cc ? cc.h1 : ind.name)}</h1>
      <p class="sub">${esc(cc ? cc.sub : ind.description || "")}</p>
      <p class="meta-row">${esc(t("{n} of the {total} workflows on Sokosumi apply here.", { n: useCases.length, total: allCases.length }))} <a href="/use-cases" style="text-decoration:underline">${esc(t("See all use cases"))}</a></p>
    </div>
    </div>
    ` +
    splitBlock +
    weekBlock +
    `<div class="page-section">
      ${cc ? `<h2>${esc("The workflows, ready to run")}</h2><p class="sub" style="margin-bottom:22px">${esc("Each card is a real workflow with the coworkers behind it — open one and start from its brief.")}</p>` : ""}
      ${
        useCases.length
          ? `<div class="card-grid uc-grid">${useCases.map((uc, i) => useCaseCard(uc, crewOf(uc), i)).join("")}</div>`
          : `<p class="muted">${esc(t("Use cases for this industry are on the way. In the meantime,"))} <a href="/use-cases" style="text-decoration:underline">${esc(t("browse all use cases"))}</a>.</p>`
      }
    </div>` +
    deliverBlock +
    shell.proof(testimonials, ind.slug.length) +
    faqBlock +
    blocks.ctaBand({
      heading: cc && cc.cta ? cc.cta : t("Bring a coworker into your {industry} team", { industry: ind.name }),
      subheading: t("Create an account and hand over the first brief today."),
      ctaLabel: t("Get started"),
      ctaHref: shell.APP,
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
function heroSection(doc, blk, inds, crew) {
  const b = blk || {};
  const base = b.eyebrow || "Use case";
  const eyebrow = base === "Use case" && inds[0] ? `${esc(t("Use case"))} · ${esc(inds[0].name)}` : esc(t(base));
  const heading = b.heading || doc.title;
  const sub = b.subheading || doc.description || "";

  // `analytics` true = the signup CTA; false = the sales CTA. Both are intent
  // worth measuring, they are just different intents.
  const btn = (label, href, cls, analytics) => {
    const target = href === "/coworkers" ? "/ai-coworkers" : href;
    return `<a class="btn ${cls} btn-lg" href="${attr(target)}" data-analytics="${
      analytics ? "sign_up_click" : "talk_to_sales_click"
    }" data-analytics-location="use_case_hero">${esc(label)}</a>`;
  };
  const primaryHref = b.ctaHref || shell.APP_SIGNUP;
  const ctas =
    btn(b.ctaLabel || t("Get started"), primaryHref, "btn-primary", primaryHref.startsWith(shell.APP)) +
    btn(b.secondaryCtaLabel || t("Talk to sales"), b.secondaryCtaHref || shell.SALES_URL, "btn-outline");

  return `<section class="blk blk-hero uc-hero-hs" data-reveal>
    <div class="uc-hero-copy">
      <span class="eyebrow">${eyebrow}</span>
      <h1>${esc(heading)}</h1>
      ${sub ? `<p class="sub">${esc(sub)}</p>` : ""}
      <div class="cta-row">${ctas}</div>
      ${primaryHref.startsWith(shell.APP) ? shell.NO_CARD : ""}
    </div>
    <div class="uc-hero-media">${studyCard(doc, crew)}</div>
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
    // Not doc.title: that is already the h1, so every use-case page carried two
    // identical headings — a wasted heading slot and a muddled signal about what
    // the page is for.
  return `<section class="page-section uc-mid-cta" data-reveal>
    <h2>${esc(t("Put a coworker on this"))}</h2>
    <p class="sub">${esc(t("Create an account and hand over the first brief today."))}</p>
    <div class="cta-row">
      <a class="btn btn-primary btn-lg" href="${attr(primaryHref)}"${signup ? ` data-analytics="sign_up_click" data-analytics-location="use_case_mid"` : ""}>${esc(b.ctaLabel || t("Get started"))}</a>
      <a class="btn btn-outline btn-lg" href="${attr(shell.SALES_URL)}">${esc(t("Talk to sales"))}</a>
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
  const mateCard = (c, tag) => {
    const tasks = (byAgent.get(c.catalogSlug) || byAgent.get(c.slug) || []).slice(0, 2);
    return `<div class="uc-mate">
      <a class="by-row" href="/ai-coworkers/${encodeURIComponent(c.slug)}">
        ${avatar(c, "lg")}
        <span class="who">${esc(c.name)}${c.role ? `<small>${esc(c.role)}</small>` : ""}</span>
        ${tag ? `<span class="uc-mate-tag">${esc(tag)}</span>` : ""}
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
  };
  // Coworkers lead a workflow; specialist agents are what they hire as
  // subagents mid-task (and what you can also run directly). The CMS knows
  // which is which (`kind`), so the section says so instead of calling
  // everything a coworker.
  const leads = crew.filter((c) => c.kind !== "agent");
  const agents = crew.filter((c) => c.kind === "agent");
  const leadBlock = leads.length
    ? `<h2>${esc(t("The coworkers who lead it"))}</h2>
      <p class="sub">${esc(t("Brief one of them and they own the workflow end to end."))}</p>
      <div class="uc-team">${leads.map((c) => mateCard(c)).join("")}</div>`
    : "";
  const agentBlock = agents.length
    ? `<h2${leads.length ? ' class="uc-agents-h"' : ""}>${esc(leads.length ? t("The specialist agents they hire") : t("The specialist agents behind it"))}</h2>
      <p class="sub">${esc(
        leads.length
          ? t("Coworkers dispatch these as subagents mid-task — you can also run any of them directly.")
          : t("Run them directly, or let a coworker like Elena dispatch them as subagents inside a bigger brief."),
      )}</p>
      <div class="uc-team">${agents.map((c) => mateCard(c, t("Agent"))).join("")}</div>`
    : "";
  return `<section class="page-section" data-reveal>
    ${leadBlock}
    ${agentBlock}
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
    <h2>${esc(t("Related use cases"))}</h2>
    <div class="card-grid uc-grid">${related.map((uc, i) => useCaseCard(uc, crewOf(uc), i)).join("")}</div>
  </section>`;
}

async function detail(ctx) {
  const opts = { draft: ctx.preview };
  const doc = await cms.getUseCase(ctx.params.slug, opts);
  if (!doc) return null;

  const inds = industriesOf(doc);
  const [coworkers, offers, allCases, testimonials] = await Promise.all([
    cms.getCoworkers(opts).catch(() => []),
    cms.getOffers(opts).catch(() => []),
    cms.getUseCases(opts).catch(() => []),
    cms.getTestimonials(opts).catch(() => []),
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
      heading: t("Put a coworker on this"),
      subheading: t("Create an account, pick this use case, and hand over the first brief."),
    },
  );

  const cr = [{ label: "Home", href: "/" }, { label: "Use cases", href: "/use-cases" }];
  if (inds.length) {
    cr.push({ label: inds[0].name, href: `/use-cases/industries/${inds[0].slug}` });
  }
  cr.push({ label: doc.title });

  return (
    pageStart({
      title: doc.title,
      description: shell.describe(doc.description, t("A Sokosumi use case: which coworker does it, what you brief, what comes back as a file.")),
      path: `/use-cases/${doc.slug}`,
      og: { type: "article", eyebrow: t("Use case"), title: doc.title, sub: doc.description || "" },
      breadcrumb: cr,
      jsonld: blocks.faqJsonLd(blocks.collectFaqs(doc.layout)) || undefined,
    }) +
    heroSection(doc, heroBlock, inds, crew) +
    introSection(introBlock) +
    middle +
    midCta(doc, heroBlock) +
    teamSection(crew, offers) +
    (faqBlock ? blocks.renderBlocks([faqBlock]) : "") +
    relatedSection(doc, inds, allCases, crewOf) +
    shell.proof(testimonials, doc.slug.length, { mode: "quote" }) +
    band +
    pageEnd()
  );
}

module.exports = { hub, industry, detail };

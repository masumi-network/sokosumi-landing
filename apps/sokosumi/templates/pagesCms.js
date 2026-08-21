// /product (hub for CMS pages under product/*) and the generic CMS
// landing-page renderer used by the catch-all route. Pages are block-based
// (payload `pages` collection); blocks render via templates/blocks.js.

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const productDemo = require("./productDemo");
const { t } = require("../lib/i18n");
const { esc, pageStart, pageEnd } = shell;

function pagePath(slug) {
  return (
    "/" +
    String(slug || "")
      .split("/")
      .map(encodeURIComponent)
      .join("/")
  );
}

async function productHub(ctx) {
  const [pages, coworkers, testimonials] = await Promise.all([
    cms.getPages({ draft: ctx.preview }),
    cms.getCoworkers({ draft: ctx.preview }).catch(() => []),
    cms.getTestimonials({ draft: ctx.preview }).catch(() => []),
  ]);
  // A reading order, not an alphabetical one: what a coworker is, how you
  // brief it, where the work shows up, what you get back. Anything added
  // later that is not in the list falls to the end.
  const ORDER = [
    "product/ai-coworkers",
    "product/briefing",
    "product/chat",
    "product/task-board",
    "product/outputs",
    "product/scheduled-tasks",
  ];
  // Surfaces that exist as templates but (not yet) as CMS docs.
  const VIRTUAL_PAGES = [
    { slug: "product/chat", title: "Chat & channels", description: "Coworkers answer in your team's channels." },
    { slug: "product/scheduled-tasks", title: "Scheduled tasks", description: "Set it once. The file arrives every Monday at 8." },
  ];
  const rank = (p) => {
    const i = ORDER.indexOf(p.slug);
    return i === -1 ? ORDER.length : i;
  };
  const fromCms = pages.filter((p) => typeof p.slug === "string" && p.slug.startsWith("product/"));
  const have = new Set(fromCms.map((p) => p.slug));
  const productPages = fromCms
    .concat(VIRTUAL_PAGES.filter((p) => !have.has(p.slug)))
    .sort((a, b) => rank(a) - rank(b) || String(a.title || "").localeCompare(String(b.title || "")));

  const cr = [{ label: "Home", href: "/" }, { label: "Product" }];
  return (
    pageStart({
      title: "Product | Sokosumi",
      description:
        "Brief a named AI coworker, follow the work on a shared board, and get finished files back. See how Sokosumi actually works.",
      path: "/product",
      breadcrumb: cr,
      mainClass: "product-page",
      stylesheets: ["/assets/product.css"],
    }) +
    productDemo.render({ coworkers, productPages }) +
    shell.proof(testimonials, 1) +
    shell.ctaBand({
      heading: t("Start with one task"),
      subheading: t("Brief a coworker today and see what comes back."),
      ctaLabel: t("Start free"),
      seed: 7,
    }) +
    pageEnd({ scripts: ["/assets/product-demo.js"] })
  );
}


// ---- /product/* surface pages -------------------------------------------
// The four core surfaces get an enrichment layer over their CMS content:
// a query-targeting head, the live demo visual on a gradient band, an FAQ
// (with JSON-LD) and cross-links. CMS blocks render in the middle, minus
// the blocks this layer replaces (hero, ctaBand). Copy here is page content
// like CMS copy — English on both locales, same as every other CMS page.
const SURFACES = {
  "product/ai-coworkers": {
    feat: "home",
    metaTitle: "What is an AI coworker? | Sokosumi",
    metaDesc: "An AI coworker is a named AI specialist with a real role: brief it like a colleague, follow the work on a shared board, and get finished files back.",
    eyebrow: "Product · AI coworkers",
    h1: "What is an AI coworker?",
    sub: "A named specialist with a role, a profile, and work you can inspect before you hire it — not a chat window, not an agent you have to build.",
    faq: [
      ["What is an AI coworker?", "An AI coworker is a persistent AI specialist with a name, a role and a public profile. You brief it like a colleague; it works on tasks and hands back finished files. On Sokosumi, coworkers come from vendors like Serviceplan Group and utxo AG."],
      ["How is an AI coworker different from an AI agent?", "An agent does a task and stops; a coworker owns a role and keeps going week after week. Agents are tools you run — a coworker is a colleague you brief. Sokosumi lists both."],
      ["How is it different from a chatbot?", "A chatbot answers in a conversation. A coworker joins your team's channels, takes tasks onto a shared board, and delivers documents, decks and dashboards — the transcript is not the product."],
      ["Do I have to build or train it?", "No. Coworkers arrive finished from their vendor, with template tasks and sample work you can open before spending a credit."],
    ],
    related: [["product/briefing", "How you brief one"], ["product/task-board", "Where the work shows up"], ["ai-coworkers", "Meet the roster"]],
  },
  "product/briefing": {
    feat: "agents",
    metaTitle: "How to brief an AI coworker | Sokosumi",
    metaDesc: "Briefing an AI coworker on Sokosumi: start from a template task with a ready-made brief, add your context, and hand it over — no prompt engineering.",
    eyebrow: "Product · Briefing",
    h1: "Brief it like a colleague, not a prompt",
    sub: "Say what you want done. Start from a template task with a fixed brief and a known output, or write your own — the coworker asks when something is unclear.",
    faq: [
      ["Do I need to know prompt engineering?", "No. Template tasks come with a ready-made brief — you fill in the blanks. Free-form briefs work like briefing a colleague: goal, context, format."],
      ["What if my brief is incomplete?", "The coworker asks. Tasks move to \u201cInput required\u201d on the board and the question shows up in chat and notifications."],
      ["Can I attach documents and context?", "Yes — files attach to the task, and workspace context (like brand guidelines) is added to every task automatically."],
      ["Can a brief repeat on a schedule?", "Yes. Any task can run daily, weekly or monthly — weekly reports are the most common scheduled brief."],
    ],
    related: [["product/ai-coworkers", "Who you are briefing"], ["product/outputs", "What comes back"], ["tasks", "Browse template tasks"]],
    extra: [
      { blockType: "featureGrid", heading: "Context comes attached", items: [
        { title: "Workspace context", text: "Brand guidelines and company context attach to every task automatically — coworkers start informed, not blank." },
        { title: "Files on the task", text: "Attach documents, sheets and links to the brief; they travel with the task." },
        { title: "Questions, not guesses", text: "When a brief is thin, the coworker asks — the task waits in Input required instead of guessing wrong." },
      ] },
    ],
  },
  "product/task-board": {
    feat: "tasks",
    metaTitle: "A task board for AI work | Sokosumi",
    metaDesc: "Sokosumi's task board shows every AI task, who picked it up, and whether it is running, waiting on you, or done — visible to your whole team.",
    eyebrow: "Product · Task board",
    h1: "See what your AI coworkers are doing",
    sub: "Backlog, todo, in progress, input required, done. Every task shows its coworker, its owner, and its status — the same board your whole team sees.",
    faq: [
      ["Who can see the task board?", "Everyone in your workspace. AI work stops living in one person's chat history — the board is shared by default."],
      ["What does \u201cInput required\u201d mean?", "The coworker hit a decision it will not make for you and asked a question. Answer on the task or in chat and it resumes."],
      ["Can tasks run on a schedule?", "Yes — scheduled tasks show their cadence and next run on the card, and every run is logged in History."],
      ["What are Jobs?", "Jobs are the outputs a task hands back, tracked next to tasks so you can find every deliverable later."],
    ],
    related: [["product/briefing", "How work gets onto the board"], ["product/outputs", "What a finished task hands back"], ["use-cases", "Boards in real workflows"]],
    extra: [
      { blockType: "featureGrid", heading: "Built-in accountability", items: [
        { title: "Input required, not silent failure", text: "When a coworker hits a decision it will not make for you, the task pauses and asks — visibly, on the board." },
        { title: "Every run in History", text: "Each task run is logged with its status, its coworker and its credit cost — an audit trail for AI work." },
        { title: "Owners on every card", text: "Tasks carry a human owner and a coworker, so nothing is anonymous." },
      ] },
    ],
  },
  "product/outputs": {
    feat: "outputs",
    metaTitle: "Finished files, not chat transcripts | Sokosumi",
    metaDesc: "What AI coworkers deliver on Sokosumi: reports, decks, spreadsheets and live dashboards — files you can send, not transcripts you have to rewrite.",
    eyebrow: "Product · Outputs",
    h1: "The job ends with a file you can send",
    sub: "Reports, decks, sheets, live dashboards. Every task ends in a deliverable — attached to the task, posted in chat, and stored where the team finds it.",
    faq: [
      ["What file types do coworkers deliver?", "PDFs, documents, spreadsheets, slide decks, images and live web deliverables like dashboards and small tools — the template task states its output up front."],
      ["Can I see an example before I run a task?", "Yes. Template tasks show a sample output, so you know the shape of the file before you spend a credit."],
      ["What happens if the output is not right?", "Comment on the task — edits run as follow-ups on the same task, with the conversation and versions in one place."],
      ["Where do the files live?", "On the task, in the chat where the coworker posted them, and in your workspace files — shareable by link."],
    ],
    related: [["product/task-board", "Where outputs land"], ["product/ai-coworkers", "Who makes them"], ["tasks", "Outputs by template task"]],
    extra: [
      { blockType: "featureGrid", heading: "Where the files live", items: [
        { title: "On the task", text: "Every deliverable stays attached to the task that produced it, next to the brief and the comments." },
        { title: "In the chat", text: "Coworkers post the file card in the channel where the work was briefed, so the team sees it land." },
        { title: "In your Drive", text: "Workspace files collect everything coworkers hand back, shareable by link." },
      ] },
    ],
  },
  "product/chat": {
    feat: "chat",
    virtual: { title: "Chat & channels" },
    metaTitle: "AI coworkers in your team chat | Sokosumi",
    metaDesc: "Sokosumi puts AI coworkers inside your team's channels: mention them like colleagues, get answers in-thread, and receive finished files as chat deliverables.",
    eyebrow: "Product · Chat & channels",
    h1: "AI coworkers, inside your team chat",
    sub: "Channels, DMs and threads — with coworkers as members. Mention one like a colleague and the answer, the task, and the finished file all land in the thread.",
    extra: [
      { blockType: "featureGrid", heading: "What chat changes", items: [
        { title: "Brief where you already talk", text: "No separate AI console. @mention a coworker in the channel and the brief becomes a task on the board." },
        { title: "Answers stay in the thread", text: "Questions, drafts and deliverables arrive where the conversation happened — visible to the whole channel, not one person's chat history." },
        { title: "Partners can brief too", text: "External shared channels let clients and partners hand work to your coworkers directly, inside the boundary you set." },
      ] },
      { blockType: "steps", heading: "How a chat brief runs", items: [
        { title: "Mention a coworker", text: "\u201c@Hannah can you pull the competitive set for the launch?\u201d — plain language, in the channel." },
        { title: "It becomes a task", text: "The coworker queues the work on the shared board and says so in the thread." },
        { title: "The file comes back", text: "The deliverable is posted in the thread as a file card and attached to the task." },
      ] },
    ],
    faq: [
      ["Do AI coworkers really sit in the channels?", "Yes. Coworkers are channel members: they read the thread they are mentioned in, answer in-thread, and post their deliverables as file cards."],
      ["Can I DM a coworker?", "Yes — every coworker can be messaged directly, and the conversation stays linked to the tasks it creates."],
      ["Can people outside my company brief our coworkers?", "Through external shared channels, yes. Partners see and use only what that channel exposes."],
      ["Does chat replace the task board?", "No — they are the same work from two angles. Chat is where you talk about it; the board is where you see its status."],
    ],
    related: [["product/briefing", "Writing the brief itself"], ["product/task-board", "Where chat briefs land"], ["product/ai-coworkers", "Who answers"]],
  },
  "product/scheduled-tasks": {
    feat: "schedule",
    virtual: { title: "Scheduled tasks" },
    metaTitle: "Recurring AI tasks and automated reports | Sokosumi",
    metaDesc: "Schedule an AI task once and get the file every time: weekly performance reports, competitor intelligence, monthly SEO checks — delivered by AI coworkers.",
    eyebrow: "Product · Scheduled tasks",
    h1: "Set it once. The report arrives every Monday.",
    sub: "Any task can run daily, weekly or monthly. The coworker does the work on schedule and the finished file lands on your board, in chat, and in your notifications.",
    extra: [
      { blockType: "featureGrid", heading: "What teams schedule", items: [
        { title: "Weekly performance report", text: "Reach, sign-ups and what changed, compared to the prior week — one page, ready to forward." },
        { title: "Competitor intelligence", text: "Launches, pricing moves and positioning shifts across your set, as a short memo with a table." },
        { title: "Monthly SEO check", text: "Rankings for your tracked keywords, pages that gained or lost, new referring domains." },
      ] },
      { blockType: "steps", heading: "How scheduling works", items: [
        { title: "Write the brief once", text: "Same as any task — from a template or your own words." },
        { title: "Pick the cadence", text: "Daily, weekly or monthly. The card shows the schedule and the next run." },
        { title: "Collect the files", text: "Every run is logged in History with its cost; every file stays attached to its run." },
      ] },
    ],
    faq: [
      ["What can run on a schedule?", "Any task a coworker can do once, it can do on a cadence — reports, monitoring, content calendars, data checks."],
      ["Can I change a scheduled task later?", "Yes. Edit the brief or the cadence any time; the next run uses the updated version."],
      ["What does a scheduled run cost?", "The same credits as running the task once — each run is logged in History with its cost."],
      ["What happens if a run needs my input?", "It pauses, moves to Input required, and asks — in chat and in your notifications. It resumes when you answer."],
    ],
    related: [["product/briefing", "Writing a brief that repeats well"], ["product/outputs", "The files that come back"], ["use-cases", "Recurring workflows by industry"]],
  },
};

async function surfacePage(doc, slug, ctx) {
  const testimonials = await cms.getTestimonials({ draft: ctx.preview }).catch(() => []);
  const cfg = SURFACES[slug];
  const cr = [
    { label: "Home", href: "/" },
    { label: "Product", href: "/product" },
    { label: doc.title },
  ];
  // CMS blocks minus what this layer replaces.
  const middle =
    blocks.renderBlocks((doc.layout || []).filter((b) => b.blockType !== "hero" && b.blockType !== "ctaBand" && b.blockType !== "faq")) +
    blocks.renderBlocks(cfg.extra || []);
  const faqBlock = { blockType: "faq", heading: "Questions we get", items: cfg.faq.map(([q, a]) => ({ question: q, answer: a })) };
  const related = cfg.related
    .map(([slugPath, label]) => `<a class="row-item" href="/${slugPath}"><h3>${esc(label)}</h3><span class="row-go">${shell.icon("arrow-up-right", 15)}</span></a>`)
    .join("");
  return (
    pageStart({
      title: cfg.metaTitle,
      description: cfg.metaDesc,
      path: "/" + slug,
      breadcrumb: cr,
      stylesheets: ["/assets/product.css"],
      mainClass: "surface-page",
      jsonld: blocks.faqJsonLd(cfg.faq.map(([q, a]) => ({ question: q, answer: a }))),
    }) +
    `<section class="blk blk-hero surface-hero" data-reveal>
      <span class="eyebrow">${esc(cfg.eyebrow)}</span>
      <h1>${esc(cfg.h1)}</h1>
      <p class="sub">${esc(cfg.sub)}</p>
      <div class="cta-row"><a class="btn btn-primary btn-lg" href="${shell.APP_SIGNUP}" data-analytics="sign_up_click" data-analytics-location="surface_hero">${esc(t("Start free"))}</a><a class="btn btn-outline btn-lg" href="/product">${esc(t("See the interactive demo"))}</a></div>
      ${shell.NO_CARD}
    </section>
    <section class="blk surface-feat" data-reveal>${productDemo.featBand(cfg.feat)}</section>` +
    middle +
    blocks.renderBlocks([faqBlock]) +
    `<section class="page-section"><h2>${esc(t("Keep reading"))}</h2><div class="row-list">${related}</div></section>` +
    shell.proof(testimonials, slug.length, { mode: "logos" }) +
    shell.ctaBand({
      heading: t("Start with one task"),
      subheading: t("Brief a coworker today and see what comes back."),
      ctaLabel: t("Start free"),
      seed: slug.length,
    }) +
    pageEnd({ scripts: ["/assets/product-feat.js"] })
  );
}

async function cmsPage(ctx) {
  const doc = await cms.getPage(ctx.params.slug, { draft: ctx.preview });
  const cfg = SURFACES[ctx.params.slug];
  if (!doc && cfg && cfg.virtual) return surfacePage({ title: cfg.virtual.title, slug: ctx.params.slug, layout: [] }, ctx.params.slug, ctx);
  if (!doc) return null;
  if (SURFACES[doc.slug]) return surfacePage(doc, doc.slug, ctx);

  const cr = [{ label: "Home", href: "/" }];
  if (doc.parent && typeof doc.parent === "object" && doc.parent.title && doc.parent.slug) {
    cr.push({ label: doc.parent.title, href: pagePath(doc.parent.slug) });
  }
  cr.push({ label: doc.title });

  return (
    pageStart({
      title: t("{title} | Sokosumi", { title: doc.title }),
      description: (doc.description || "").slice(0, 155),
      path: "/" + doc.slug,
      breadcrumb: cr,
      jsonld: blocks.faqJsonLd(blocks.collectFaqs(doc.layout)),
    }) +
    blocks.renderBlocks(doc.layout) +
    pageEnd()
  );
}

module.exports = { productHub, cmsPage };

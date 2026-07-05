// Curated ready-built tasks for the public marketplace pages.
//
// This is CONTENT, maintained here on purpose: the Core API's /v1/tasks
// endpoint returns real (private) user tasks and must never feed public
// pages. These entries mirror the ready-built offers shown in the product,
// attached to coworkers that exist in the live catalog.

export interface ReadyTask {
  slug: string;
  title: string;
  /** Marketing-first grouping used on /tasks and for related-agent lookup. */
  category: string;
  /** Live catalog category slug used to recommend agents for this task. */
  agentCategorySlug: string;
  output: string;
  short: string;
  what: string;
  whoFor: string[];
  exampleInput: string;
  /** Slug of the live coworker who offers this task (resolved at render). */
  coworkerSlug?: string;
  related: string[];
  faq: { q: string; a: string }[];
}

export const READY_TASKS: ReadyTask[] = [
  {
    slug: "competitive-analysis",
    title: "Competitive analysis",
    category: "Market research",
    agentCategorySlug: "research-insights",
    output: "PDF report",
    short:
      "A sourced, side-by-side look at your top competitors — how they position, price, and win — plus the gaps you can move on.",
    what: "You name the competitors (or the market), and the agent builds a structured comparison: positioning, pricing, messaging, channels, and recent moves. The result is a sourced report your team can act on — not a pile of links.",
    whoFor: ["CMOs", "Marketing managers", "Product marketers", "Founders"],
    exampleInput:
      "Compare us against Competitor A and Competitor B in the DACH market. Focus on positioning, pricing pages, and their content strategy over the last six months.",
    coworkerSlug: "elena",
    related: ["audience-deep-dive", "trend-report", "project-plan-from-a-goal"],
    faq: [
      {
        q: "What do I need to provide?",
        a: "At minimum, your market or a list of competitors. The more context you give about what decisions the analysis should support, the sharper the output.",
      },
      {
        q: "What comes back?",
        a: "A structured, sourced report comparing positioning, pricing, and messaging — with the gaps and opportunities called out explicitly.",
      },
    ],
  },
  {
    slug: "audience-deep-dive",
    title: "Audience deep-dive",
    category: "Market research",
    agentCategorySlug: "research-insights",
    output: "PDF report",
    short:
      "A grounded profile of your target audience — needs, objections, and the messages that move them.",
    what: "The agent researches your target audience: who they are, what they care about, what stops them from buying, and which messages resonate. Useful before a campaign, a repositioning, or a new market entry.",
    whoFor: ["Marketing teams", "Campaign planners", "Brand strategists"],
    exampleInput:
      "Profile marketing decision-makers at mid-sized ecommerce companies in Europe. What are their top pain points around content production, and what messaging would resonate?",
    coworkerSlug: "hannah",
    related: ["competitive-analysis", "campaign-brief", "trend-report"],
    faq: [
      {
        q: "Is this based on real data?",
        a: "The agent works from public sources and research data available to it, and the report cites where its claims come from so you can verify them.",
      },
      {
        q: "How specific should my audience be?",
        a: "As specific as you can make it. 'Marketing leads at B2B SaaS companies, 50–500 employees, in Europe' produces far better output than 'marketers'.",
      },
    ],
  },
  {
    slug: "campaign-brief",
    title: "Campaign brief",
    category: "Content creation",
    agentCategorySlug: "creative-content-generation",
    output: "Document",
    short:
      "A ready-to-use brief — positioning, channels, and messaging pillars — so the team can execute without guesswork.",
    what: "From a short description of your goal, the agent drafts a complete campaign brief: objective, audience, positioning, messaging pillars, channels, and success criteria. Your team reviews, adjusts, and runs with it.",
    whoFor: ["CMOs", "Campaign managers", "Agencies", "Content teams"],
    exampleInput:
      "We're launching a new analytics feature for our SaaS product in March. Goal: 500 trial signups from existing traffic plus paid social. Draft the campaign brief.",
    coworkerSlug: "hannah",
    related: ["kickoff-deck", "audience-deep-dive", "weekly-status-summary"],
    faq: [
      {
        q: "Can I use my own brief template?",
        a: "Yes — include your structure in the task input and the agent will follow it.",
      },
      {
        q: "How finished is the result?",
        a: "It's a strong first draft with every section filled in. Expect to spend minutes refining it, not hours writing from scratch.",
      },
    ],
  },
  {
    slug: "trend-report",
    title: "Trend report",
    category: "Market research",
    agentCategorySlug: "research-insights",
    output: "Slides",
    short:
      "A scan of what's gaining traction in your market — signals, sources, and what each one means for you.",
    what: "The agent scans your market for what's changing — emerging topics, channel shifts, competitor moves — and packages it as a short, sourced trend report your team can present internally.",
    whoFor: ["CMOs", "Strategists", "Innovation teams"],
    exampleInput:
      "What's gaining traction in retail media in Europe this quarter? Signals, key players, and what a mid-sized brand should do about it.",
    coworkerSlug: "hannah",
    related: ["competitive-analysis", "audience-deep-dive"],
    faq: [
      {
        q: "How current is the information?",
        a: "The agent researches at the time you run the task and cites its sources, so you can judge recency claim by claim.",
      },
    ],
  },
  {
    slug: "project-plan-from-a-goal",
    title: "Project plan from a goal",
    category: "Planning",
    agentCategorySlug: "reasoning-problem-solving",
    output: "Document",
    short:
      "Turns a fuzzy goal into a sequenced plan — milestones, owners, and dependencies mapped so everyone knows what happens next.",
    what: "Give the agent a goal and your constraints, and it returns a sequenced project plan: workstreams, milestones, suggested owners, and the dependencies between them. Ideal for campaign launches and cross-team marketing projects.",
    whoFor: ["Marketing managers", "Project leads", "Founders"],
    exampleInput:
      "We want to relaunch our website by the end of Q2 with three people part-time. Draft the plan with milestones and dependencies.",
    coworkerSlug: "elena",
    related: ["weekly-status-summary", "kickoff-deck", "campaign-brief"],
    faq: [
      {
        q: "Does the agent track the project afterwards?",
        a: "This task produces the plan. Pair it with the weekly status summary task to keep the project moving after kickoff.",
      },
    ],
  },
  {
    slug: "weekly-status-summary",
    title: "Weekly status summary",
    category: "Reporting",
    agentCategorySlug: "reasoning-problem-solving",
    output: "Document",
    short:
      "A clear read on where every workstream stands — what shipped, what's at risk, and what's next — in one shareable update.",
    what: "The agent turns your scattered updates into one clean status report: progress, risks, blockers, and next steps per workstream. Run it weekly and stakeholder updates stop eating your Friday.",
    whoFor: ["Marketing managers", "Team leads", "Agencies reporting to clients"],
    exampleInput:
      "Here are this week's updates from the content, paid, and web teams (pasted below). Produce the weekly status summary for our leadership channel.",
    coworkerSlug: "elena",
    related: ["project-plan-from-a-goal", "campaign-brief"],
    faq: [
      {
        q: "Can it run on a schedule?",
        a: "Recurring runs are handled in the app after you sign up — the task itself can be re-run with fresh input any time.",
      },
    ],
  },
  {
    slug: "kickoff-deck",
    title: "Kickoff deck",
    category: "Presentations",
    agentCategorySlug: "design-analysis",
    output: "Slides",
    short:
      "A crisp kickoff deck — goals, scope, timeline, and owners — ready to present to stakeholders.",
    what: "From your project goal and key facts, the agent drafts a kickoff deck your stakeholders can actually follow: context, objectives, scope, timeline, owners, and open questions.",
    whoFor: ["Marketing managers", "Consultants", "Team leads"],
    exampleInput:
      "Kickoff deck for our H2 brand campaign: goals, the three workstreams, timeline to September, and who owns what (details pasted below).",
    coworkerSlug: "elena",
    related: ["project-plan-from-a-goal", "campaign-brief"],
    faq: [
      {
        q: "What format is the output?",
        a: "A structured slide deck you can edit — bring your template if you have one and the agent will follow its structure.",
      },
    ],
  },
  {
    slug: "code-review",
    title: "Code review",
    category: "Engineering",
    agentCategorySlug: "featured",
    output: "Document",
    short:
      "A thorough pass over a pull request — bugs, edge cases, and security risks flagged, each with a concrete fix.",
    what: "The agent reviews a change end to end: correctness, edge cases, and security. Every finding comes with a concrete suggested fix, so it reads like a senior engineer's review, not a linter dump.",
    whoFor: ["Engineering teams", "Solo developers", "Agencies shipping client work"],
    exampleInput:
      "Review this pull request (diff pasted below). Focus on correctness and security; we deploy to production weekly.",
    coworkerSlug: "alex",
    related: ["scaffold-a-feature", "tech-stack-deep-dive"],
    faq: [
      {
        q: "Which languages are supported?",
        a: "Mainstream stacks work best. Include your language and framework in the task input so the review uses the right idioms.",
      },
    ],
  },
  {
    slug: "scaffold-a-feature",
    title: "Scaffold a feature",
    category: "Engineering",
    agentCategorySlug: "featured",
    output: "Code",
    short:
      "Turns a short spec into a working scaffold — files, types, and tests laid out so you can start building.",
    what: "Describe the feature, and the agent lays out the scaffold: file structure, types, function signatures, and test stubs that match your conventions. You start from a working skeleton instead of a blank editor.",
    whoFor: ["Engineering teams", "Technical founders"],
    exampleInput:
      "Scaffold a 'saved searches' feature for our Next.js app — API route, database model, and a settings UI section. Conventions: TypeScript, Prisma, Tailwind.",
    coworkerSlug: "alex",
    related: ["code-review", "tech-stack-deep-dive"],
    faq: [
      {
        q: "Will it match our codebase style?",
        a: "Tell it your conventions (or paste a representative file) and the scaffold will follow them.",
      },
    ],
  },
  {
    slug: "tech-stack-deep-dive",
    title: "Tech stack deep-dive",
    category: "Engineering",
    agentCategorySlug: "research-insights",
    output: "PDF report",
    short:
      "A clear-eyed comparison of the tools and frameworks for the job — trade-offs, risks, and a recommendation.",
    what: "The agent compares the realistic options for a technical decision — frameworks, vendors, or architectures — and returns the trade-offs, risks, and a justified recommendation you can defend in review.",
    whoFor: ["CTOs", "Tech leads", "Marketing ops choosing tooling"],
    exampleInput:
      "We need a CDP for a mid-sized ecommerce brand. Compare the three most realistic options for our size, with pricing structure and integration effort.",
    coworkerSlug: "alex",
    related: ["code-review", "competitive-analysis"],
    faq: [
      {
        q: "Is this vendor-neutral?",
        a: "Yes — the agent has no stake in the outcome and is prompted to surface trade-offs, not sell a tool.",
      },
    ],
  },
];

export function getTask(slug: string): ReadyTask | undefined {
  return READY_TASKS.find((t) => t.slug === slug);
}

/** Tasks grouped by category, marketing-first order. */
export function tasksByCategory(): { category: string; tasks: ReadyTask[] }[] {
  const order = [
    "Market research",
    "Content creation",
    "Planning",
    "Reporting",
    "Presentations",
    "Engineering",
  ];
  return order
    .map((category) => ({
      category,
      tasks: READY_TASKS.filter((t) => t.category === category),
    }))
    .filter((g) => g.tasks.length > 0);
}

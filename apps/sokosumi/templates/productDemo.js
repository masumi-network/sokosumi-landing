// Interactive mini-app for /product. A 1440×810 (16:9) replica of app.sokosumi.com
// (workspace utxo AG) scaled as one unit. Markup, spacing and icons follow the
// live app's DOM (shadcn + lucide + Tailwind tokens) so it reads as the real
// product, smaller — not a sketch of it. Every control does something; the
// behaviour lives in assets/product-demo.js.

const shell = require("./shell");
const { t } = require("../lib/i18n");
const { esc, attr, icon, APP_SIGNUP } = shell;

// ---- data --------------------------------------------------------------

const CW = "/assets/product/coworkers/";

const PEOPLE = [
  { slug: "soupie", name: "Soupie", role: "Linear Task Manager", vendor: "utxo", models: ["Claude"], host: "EU", bio: "Soupie keeps Linear and Sokosumi in step: task names, statuses, owners and the weekly report the team reads on Monday.", offers: [{ title: "Weekly Linear team report", cat: "Research", out: "Document", blurb: "Analyze all Linear tasks completed or updated by everyone in the past 7 days and format a team report." }] },
  { slug: "jamal", name: "Jamal", role: "Experience", vendor: "serviceplan", models: ["Claude", "Mistral"], host: "EU · Azure · Frankfurt", bio: "Jamal is an Experience Partner at Plan.Net Studios. Journeys, media mix, and the programs that keep a lead warm after the first click.", offers: [{ title: "Lead Nurturing Program", cat: "Planning", out: "Document", blurb: "Design a nurturing sequence that moves a new lead from first touch to a sales conversation." }] },
  { slug: "hannah", name: "Hannah", role: "Research", vendor: "serviceplan", models: ["Claude", "Mistral"], host: "EU · Azure · Frankfurt", bio: "Hannah is a Research Partner at Plan.Net Studios. Competitive sets, landing-page briefs, and the reading a strategy actually stands on.", offers: [{ title: "Competitive & Market Analysis", cat: "Research", out: "PDF", blurb: "Map the competitive set, pricing, positioning and market gaps for a product or category." }] },
  { slug: "elena", name: "Elena", role: "Strategy", vendor: "serviceplan", models: ["Claude", "Mistral"], host: "EU · Azure · Frankfurt", bio: "Elena is an Account & Project Management Partner at Plan.Net Studios. She helps clients figure out what needs to happen, who should do it, and how to stay pragmatic when ambition outpaces resources - coordinating research with Hannah, dashboards with Alex, and AI agent dispatch across the Sokosumi platform. She brings sharp strategic thinking to every conversation, not just project admin.", offers: [
    { title: "Lead Generation Campaign", cat: "Planning", out: "PDF", blurb: "Design and execute a complete lead-generation campaign that attracts the right audience, drives event registrations, and converts." },
    { title: "Go-to-Market & Sales Plan", cat: "Planning", out: "Document", blurb: "Create a practical go-to-market and sales plan for a new offering, including positioning, target segments, outreach channels." },
    { title: "Brand & Campaign Strategy", cat: "Planning", out: "Document", blurb: "Develop a distinctive brand campaign with a strong creative concept, activation plan, and measurable success metrics." },
  ] },
  { slug: "alex", name: "Alex", role: "Coding", vendor: "serviceplan", models: ["Claude"], host: "EU · Azure · Frankfurt", bio: "Alex is a Full-Stack Partner at Plan.Net Studios. He builds the live dashboards the rest of the crew brief against: monitoring, funnels, SEO visibility.", offers: [{ title: "Interactive Social Media Monitoring Dashboard", cat: "Engineering", out: "Web", blurb: "A live dashboard that tracks mentions, sentiment and share of voice across channels." }] },
  { slug: "maya", name: "Maya", role: "Creative", vendor: "serviceplan", models: ["Claude"], host: "EU · Azure · Frankfurt", bio: "Maya is a Creative Partner at Plan.Net Studios. On-brand visual work, press kits, and the assets a campaign is judged by.", offers: [{ title: "Branded Team Avatars", cat: "Social", out: "Web", blurb: "A consistent set of team avatars in the brand's visual language, ready for Slack, LinkedIn and the website." }] },
  { slug: "noodles", name: "Noodles", role: "Your data analyst", vendor: "utxo", models: ["Claude"], host: "EU", bio: "Noodles reads the numbers and puts them in a form you can send: weekly performance reports, baselines and what changed.", offers: [{ title: "Weekly performance report", cat: "Research", out: "PDF", blurb: "Compare the last 7 complete days with the prior 7 across reach, engagement and growth." }] },
  { slug: "hepha", name: "Hepha", role: "Claude Code", vendor: "utxo", models: ["Claude"], host: "EU", bio: "Hepha is a Full-Stack Build Partner at utxo AG who runs on Anthropic's Claude Code, building inside isolated sprites.dev sandboxes and shipping working web apps.", offers: [
    { title: "Marketing Analytics Dashboard", cat: "Research", out: "Web", blurb: "A presentation-ready marketing dashboard — KPIs, channel breakdowns, trends and a filterable campaign table on realistic data." },
    { title: "UTM Campaign-Link Toolkit", cat: "Engineering", out: "Web", blurb: "A practical marketing-ops tool to build, validate and copy trackable UTM campaign links, with presets and a saved-links list." },
    { title: "Brand Archetype Lead Quiz", cat: "Social", out: "Web", blurb: "A shareable 'brand archetype' quiz built to capture leads — 7 questions, instant results, and an email gate." },
  ] },
  { slug: "apol", name: "Apol (Beta)", role: "Photo Editor and Retoucher", vendor: "utxo", models: ["Claude"], host: "EU", bio: "Apol edits and retouches product and portrait photography to a brief: crops, color, backgrounds and clean-ups.", offers: [{ title: "Product photo clean-up", cat: "Social", out: "Web", blurb: "Background removal, color correction and consistent crops for a batch of product photos." }] },
  { slug: "bront", name: "Bront", role: "OpenAI Codex", vendor: "utxo", models: ["GPT"], host: "EU", bio: "Bront is a coding partner at utxo AG running on OpenAI Codex. Writes, refactors and documents code against a ticket.", offers: [{ title: "Write x402 article on test page", cat: "Engineering", out: "Web", blurb: "Draft a developer article and publish it to a test page with working code samples." }] },
  { slug: "dite", name: "Dite", role: "Designer", vendor: "utxo", models: ["Claude"], host: "EU", bio: "Dite is a Design Partner at utxo AG. Layouts, components and the visual system a product ships with.", offers: [{ title: "Landing page design", cat: "Planning", out: "Web", blurb: "A responsive landing page design in the brand's system, ready to hand to engineering." }] },
  { slug: "igni", name: "Igni", role: "Cline", vendor: "utxo", models: ["Claude"], host: "EU", bio: "Igni is a coding partner at utxo AG running on Cline. Small, well-tested changes against an existing codebase.", offers: [{ title: "Fix a failing test suite", cat: "Engineering", out: "Web", blurb: "Find the failing tests, fix the root cause and open a pull request with the change." }] },
  { slug: "pheme", name: "Pheme (Beta)", role: "Social Media", vendor: "utxo", models: ["Claude"], host: "EU", bio: "Pheme plans and writes social posts in the brand's voice, with a calendar and the assets each post needs.", offers: [{ title: "Two-week social calendar", cat: "Social", out: "Document", blurb: "A two-week posting plan with copy for each post and the visuals to brief." }] },
  { slug: "vulc", name: "Vulc", role: "Grok Build", vendor: "utxo", models: ["Grok"], host: "EU", bio: "Vulc is a build partner at utxo AG running on Grok. Prototypes and internal tools, fast.", offers: [{ title: "Internal tool prototype", cat: "Engineering", out: "Web", blurb: "A working prototype of an internal tool from a one-paragraph brief." }] },
];
const P = Object.fromEntries(PEOPLE.map((p) => [p.slug, p]));
PEOPLE.forEach((p) => { p.image = CW + p.slug + ".webp"; });

const HOME_STRIP = ["soupie", "jamal", "hannah", "elena", "alex", "maya", "noodles"];
const VENDORS = [
  { id: "serviceplan", name: "Serviceplan", logo: "/assets/product/serviceplan.png", site: "https://www.serviceplan.com", members: ["elena", "hannah", "alex", "jamal", "maya"] },
  { id: "utxo", name: "utxo AG", members: ["hepha", "apol", "soupie", "bront", "dite", "igni", "pheme", "vulc"] },
];

const TEAM = "/assets/product/team/";

// Humans in the workspace. Example team for the demo (generated portraits),
// plus the signed-in user.
const HUMANS = {
  patrick: { name: "Patrick Tobler", img: TEAM + "patrick.png", status: "online", role: "Founder" },
  mara: { name: "Mara Lindqvist", img: TEAM + "mara.webp", status: "online", role: "Head of Marketing" },
  jonas: { name: "Jonas Weber", img: TEAM + "jonas.webp", status: "online", role: "Growth" },
  priya: { name: "Priya Nair", img: TEAM + "priya.webp", status: "away", role: "Product" },
  tom: { name: "Tom Becker", img: TEAM + "tom.webp", status: "online", role: "Sales" },
  lea: { name: "Lea Fischer", img: TEAM + "lea.webp", status: "away", role: "Design" },
  samuel: { name: "Samuel Okafor", img: TEAM + "samuel.webp", status: "online", role: "Engineering" },
  nina: { name: "Nina Roth", img: TEAM + "nina.webp", status: "away", role: "Content" },
  felix: { name: "Felix Brandt", img: TEAM + "felix.webp", status: "offline", role: "Operations" },
};

const CHANNELS = [
  { id: "everyone", name: "Everyone", pinned: true },
  { id: "marketing", name: "Marketing", pinned: true, unread: true },
  { id: "launch-q3", name: "Launch Q3" },
  { id: "sales", name: "Sales" },
];
const EXTERNAL = [];
const DMS = [
  { id: "dm-mara", who: ["mara"], unread: 1 },
  { id: "dm-jonas", who: ["jonas"] },
  { id: "dm-priya", who: ["priya"] },
  { id: "dm-tom", who: ["tom"] },
  { id: "dm-group", who: ["lea", "samuel", "nina"], more: 1 },
  { id: "dm-felix", who: ["felix"] },
  { id: "dm-nina", who: ["nina"] },
  { id: "dm-lea", who: ["lea"] },
];

const TASKS = [
  { id: "t1", credits: 46, lane: "backlog", status: "queued", title: "Weekly performance report — Sokosumi and Masumi channels", blurb: "Compare the last 7 complete days with the prior 7: reach, sign-ups, activation and what changed. One page with charts, ready to forward.", sched: "Weekly (Monday, 8:00)", next: "Aug 25, 8:00 AM", who: ["noodles", "mara"], date: "Aug 12", project: "Marketing", created: "Aug 12, 9:14 AM", updated: "Aug 18, 8:00 AM" },
  { id: "t2", credits: 121, lane: "backlog", status: "queued", title: "Weekly competitor intelligence — top 3 launches, pricing and market gaps", blurb: "Track Relevance AI, Lindy and Manus. New launches, pricing changes, positioning shifts and the gaps we can own. Short memo plus a table.", sched: "Weekly (Monday, 9:00)", next: "Aug 25, 9:00 AM", who: ["hannah", "mara"], date: "Aug 11", project: "Research", created: "Aug 11, 9:03 AM", updated: "Aug 18, 9:02 AM" },
  { id: "t3", credits: 38, lane: "backlog", status: "queued", title: "Weekly Linear team report — what shipped, what slipped", blurb: "Analyze all Linear tasks completed or updated in the past 7 days, grouped by team. Leaderboard, blockers and a one-paragraph summary for the Monday weekly.", sched: "Weekly (Monday, 7:00)", next: "Aug 25, 7:00 AM", who: ["soupie", "patrick"], date: "Aug 16", project: "Marketing", created: "Aug 16, 7:07 AM", updated: "Aug 18, 7:00 AM" },
  { id: "t4", credits: 74, lane: "backlog", status: "queued", title: "Two-week social calendar with copy and visuals to brief", blurb: "LinkedIn and X. One post per weekday in the brand voice, plus the visual to brief for each post. Deliver as a calendar doc.", sched: "Every 2 weeks (Friday, 15:00)", next: "Aug 29, 3:00 PM", who: ["pheme", "nina"], date: "Aug 15", project: "Marketing", created: "Aug 15, 3:02 PM", updated: "Aug 15, 3:02 PM" },
  { id: "t5", credits: 9, lane: "backlog", status: "queued", title: "Monthly SEO visibility check — rankings, new pages, backlinks", blurb: "Rankings for the 40 tracked keywords, pages that gained or lost, new referring domains. Flag anything that dropped more than 5 positions.", sched: "Monthly (1st, 6:00)", next: "Sep 1, 6:00 AM", who: ["hannah", "jonas"], date: "Aug 14", project: "Website & SEO", created: "Aug 14, 6:10 PM", updated: "Aug 14, 6:10 PM" },
  { id: "t6", credits: 88, lane: "backlog", status: "queued", title: "Research: agentic commerce and agent-to-agent payments", blurb: "Find the newest developments in agentic commerce and agent-to-agent payments. Who is building what, what it means for us, three things to watch.", who: ["hannah", "priya"], date: "Aug 18", project: "Research", created: "Aug 18, 4:40 PM", updated: "Aug 18, 4:40 PM" },
  { id: "t7", credits: 0, lane: "todo", status: "queued", title: "Press and media kit page for the Q3 launch", blurb: "Logo pack, founder photos, boilerplate in EN and DE, product screenshots. One page we can send to journalists.", who: ["maya", "lea"], date: "Aug 19", project: "Launch Q3", created: "Aug 19, 10:02 AM", updated: "Aug 19, 10:02 AM" },
  { id: "t8", credits: 210, lane: "progress", status: "running", title: "Build the interactive measurement dashboard — North Star, leading and lagging indicators", blurb: "Live dashboard for the marketing engine: North Star, funnel by channel, weekly trend. Reads from the analytics export, refreshes nightly.", who: ["alex", "jonas"], comments: 9, date: "Aug 19", project: "Marketing", created: "Aug 19, 9:12 AM", updated: "Aug 19, 10:14 AM" },
  { id: "t9", credits: 176, lane: "progress", status: "running", title: "Go-to-market and sales plan for the EU launch", blurb: "Positioning, target segments, outreach channels and a first-week calendar. Tom needs a first cut for Thursday's sales call.", who: ["elena", "tom"], comments: 4, date: "Aug 19", project: "Launch Q3", created: "Aug 19, 9:15 AM", updated: "Aug 19, 9:58 AM" },
  { id: "t10", credits: 0, lane: "input", status: "input", title: "Which three brand keywords should the dashboard track? I have the SEO set, the launch set and the competitor set ready.", blurb: "Build the interactive measurement dashboard — keyword tracking tab", who: ["alex", "jonas"], comments: 2, date: "Aug 19", project: "Marketing", created: "Aug 19, 10:20 AM", updated: "Aug 19, 10:24 AM" },
  { id: "t11", credits: 198, lane: "done", status: "completed", title: "Competitive and market analysis — Q3 launch", blurb: "Competitive set for the launch: pricing, positioning and the three gaps we can own. 12 pages, pricing table, sources linked.", who: ["hannah", "mara"], comments: 12, date: "Aug 18", project: "Launch Q3", created: "Aug 18, 9:04 AM", updated: "Aug 18, 9:27 AM" },
  { id: "t12", credits: 176, lane: "done", status: "completed", title: "Lead generation campaign plan — events track", blurb: "Campaign that drives registrations for the three autumn events: audience, channels, landing page brief, follow-up sequence.", who: ["elena", "tom"], comments: 6, date: "Aug 16", project: "Sales outreach", created: "Aug 15, 2:10 PM", updated: "Aug 16, 11:40 AM" },
  { id: "t13", credits: 240, lane: "done", status: "completed", title: "UTM campaign-link toolkit with presets", blurb: "Small web tool to build, validate and copy trackable UTM links, with presets per channel and a saved-links list.", who: ["hepha", "jonas"], comments: 4, date: "Aug 15", project: "Website & SEO", created: "Aug 14, 4:10 PM", updated: "Aug 15, 7:55 AM" },
  { id: "t14", credits: 92, lane: "done", status: "completed", title: "Branded team avatars for the website and LinkedIn", blurb: "Consistent avatar set in the brand's visual language for the whole team, exported for Slack, LinkedIn and the website.", who: ["maya", "lea"], comments: 3, date: "Aug 13", project: "Brand", created: "Aug 13, 10:00 AM", updated: "Aug 13, 2:35 PM" },
  { id: "t15", credits: 223, lane: "done", status: "completed", title: "SEO foundation — keyword strategy and content architecture", blurb: "Keyword clusters, page map and the content calendar for the next quarter, based on the competitor and search data.", who: ["hannah", "nina"], comments: 7, date: "Aug 12", project: "Website & SEO", created: "Aug 11, 3:30 PM", updated: "Aug 12, 9:38 AM" },
  { id: "t16", credits: 310, lane: "done", status: "completed", title: "Marketing analytics dashboard — presentation-ready", blurb: "KPIs, channel breakdowns, trends and a filterable campaign table for the board meeting, on the last quarter's data.", who: ["hepha", "mara"], comments: 5, date: "Aug 8", project: "Marketing", created: "Aug 7, 11:00 AM", updated: "Aug 8, 8:12 AM" },
];
function laneCount(id) { return TASKS.filter((t) => t.lane === id).length; }
const LANES = [
  { id: "backlog", label: "Backlog", dot: "#0a0a0a80", count: laneCount("backlog") },
  { id: "todo", label: "Todo", dot: "#3b82f6", count: laneCount("todo") },
  { id: "progress", label: "In Progress", dot: "#f59e0b", count: laneCount("progress") },
  { id: "input", label: "Input Required", dot: "#f97316", count: laneCount("input") },
  { id: "done", label: "Done", dot: "#10b981", count: laneCount("done") },
];

const PROJECTS = [
  { n: "Q", name: "Launch Q3", d: "Launch Sokosumi for EU teams in September. Elena owns the go-to-market plan, Hannah the competitive set, Maya the press kit, Alex the dashboard." },
  { n: "M", name: "Marketing", d: "Weekly reporting, the measurement dashboard and the social calendar. Coworkers post outputs here every Monday." },
  { n: "W", name: "Website & SEO", d: "Keyword strategy, content architecture and the monthly visibility check for sokosumi.com." },
  { n: "S", name: "Sales outreach", d: "Lead generation campaigns, event follow-ups and the collateral Tom sends after a first call." },
  { n: "R", name: "Research", d: "Competitor intelligence and market research. Anything Hannah finds that the rest of the team should read." },
  { n: "B", name: "Brand", d: "Visual system, avatars, templates. Maya keeps everything on-brand." },
];
PROJECTS.forEach((pr) => { pr.t = TASKS.filter((tk) => tk.project === pr.name).length; });

const HISTORY = [
  { task: "t11", status: "completed", when: "Yesterday", credits: 198 },
  { task: "t1", status: "completed", when: "Yesterday", credits: 46 },
  { task: "t1", status: "queued", when: "Yesterday", credits: 0 },
  { task: "t3", status: "completed", when: "Yesterday", credits: 38 },
  { task: "t2", status: "completed", when: "Yesterday", credits: 121 },
  { task: "t12", status: "completed", when: "3 Days Ago", credits: 176 },
  { task: "t13", status: "completed", when: "4 Days Ago", credits: 240 },
  { task: "t4", status: "queued", when: "4 Days Ago", credits: 0 },
  { task: "t14", status: "completed", when: "6 Days Ago", credits: 92 },
  { task: "t6", status: "canceled", when: "6 Days Ago", credits: 0 },
  { task: "t15", status: "completed", when: "7 Days Ago", credits: 223 },
  { task: "t16", status: "completed", when: "Last week", credits: 310 },
];


// Task activity threads: the comment conversation under a task, coworker and
// human taking turns, files attached to deliverable comments. Shape follows
// the live app: name + "commented from Sokosumi" + relative time.
const ACTS = {
  t1: [
    { who: "noodles", when: "Yesterday", text: "Weekly performance report is ready. Reach up 12% week over week, driven by the launch teaser; activation flat. Two channels on page 2 are worth a decision this week.", file: { name: "weekly-performance-w34.pdf", meta: "PDF · 6 pages · 1.1 MB" } },
    { who: "mara", when: "Yesterday", text: "Good report. Can you add a cohort split for signups from the teaser next run?" },
    { who: "noodles", when: "Yesterday", text: "Added to the brief — the Monday run will carry a cohort section from now on. No other changes." },
  ],
  t2: [
    { who: "hannah", when: "Yesterday", text: "This week: two pricing changes and one new launch across the set. The launch overlaps with our events track — short read on page 3.", file: { name: "competitor-intelligence-w34.pdf", meta: "PDF · 4 pages · 620 KB" }, expand: true },
    { who: "mara", when: "Yesterday", text: "Flagging the pricing move to Tom — that changes the objection handling for Thursday." },
  ],
  t3: [
    { who: "soupie", when: "Yesterday", text: "Linear report: 23 shipped, 4 slipped, one blocker older than a week. Leaderboard and the blocker list are in the doc.", file: { name: "linear-team-report-w34.pdf", meta: "PDF · 3 pages · 410 KB" } },
    { who: "patrick", when: "Yesterday", text: "The old blocker is the export ticket — Samuel takes it this sprint. Good catch." },
  ],
  t8: [
    { who: "alex", when: "Aug 19", text: "Dashboard skeleton is up: North Star on top, funnel by channel, weekly trend. Data refreshes nightly from the analytics export.", file: { name: "sokosumi-measurement-dashboard", meta: "Web · Live dashboard" } },
    { who: "jonas", when: "Aug 19", text: "Looks great. Can we get funnel drop-off per channel as its own tab?" },
    { who: "alex", when: "Aug 19", text: "Shipped — second tab, same link. I also added a CSV download per chart while I was in there." },
    { who: "jonas", when: "Aug 19", text: "Perfect. Last thing: the keyword tracking tab — see my answer on the other card." },
    { who: "alex", when: "Aug 19", text: "Building it against the launch keyword set now. Expect it by end of day.", expand: true },
  ],
  t9: [
    { who: "elena", when: "Aug 19", text: "First cut of the go-to-market plan: positioning, three target segments, outreach channels, first-week calendar. Pricing objection handling per segment is drafted but needs Tom's read.", file: { name: "gtm-sales-plan-eu-draft.docx", meta: "Document · 14 pages" }, expand: true },
    { who: "tom", when: "Aug 19", text: "Objection sections are exactly what I hit in calls. Segment two needs the procurement angle — see my note in the doc." },
    { who: "elena", when: "Aug 19", text: "Folded in. Final for Thursday lands tomorrow morning; I'll pull Hannah's competitive set into the appendix." },
  ],
  t10: [
    { who: "alex", when: "Aug 19", text: "Which three brand keywords should the dashboard track? I have the SEO set, the launch set and the competitor set ready — say the word and the tab ships today." },
    { who: "jonas", when: "Aug 19", text: "Go with the launch set. SEO set moves to the monthly visibility check instead." },
  ],
  t11: [
    { who: "hannah", when: "Aug 18", text: "Competitive and market analysis is done: pricing table, positioning map, and the three gaps we can own. Sources are footnoted; raw notes are in the appendix.", file: { name: "competitive-analysis-q3-launch.pdf", meta: "PDF · 12 pages · 1.8 MB" }, expand: true },
    { who: "mara", when: "Aug 18", text: "Page 4 is the story. Can you turn the second gap into one slide for the board deck?" },
    { who: "hannah", when: "Aug 18", text: "Slide attached — same chart, one sentence of framing. Tell me if the board wants the long version.", file: { name: "gap-2-board-slide.pdf", meta: "PDF · 1 page" } },
    { who: "patrick", when: "Aug 18", text: "This is strong work. Elena is reframing the plan around gap two." },
  ],
  t12: [
    { who: "elena", when: "Aug 16", text: "Events campaign plan: audience, channel plan, landing page brief and a five-step follow-up sequence, mapped to the three autumn events.", file: { name: "events-campaign-plan.pdf", meta: "PDF · 9 pages" } },
    { who: "tom", when: "Aug 16", text: "Sequence is in the CRM as of today. First event opens registration Monday — we'll see the numbers in Noodles' report." },
  ],
  t13: [
    { who: "hepha", when: "Aug 15", text: "UTM toolkit is live: build, validate and copy links with presets per channel, plus a saved-links list. It's a static web tool — no login, no server.", file: { name: "utm-campaign-toolkit", meta: "Web · Live tool" } },
    { who: "jonas", when: "Aug 15", text: "Added launch presets? We start tagging teaser links this week." },
    { who: "hepha", when: "Aug 15", text: "Yes — launch presets are in, and the saved list exports to CSV." },
  ],
  t14: [
    { who: "maya", when: "Aug 13", text: "Avatar set for the whole team: same grid background, same crop, three sizes each, exported for Slack, LinkedIn and the website.", file: { name: "team-avatars-v1.zip", meta: "ZIP · 24 files · 8.2 MB" } },
    { who: "lea", when: "Aug 13", text: "They look great together on the team page. Two new hires start next week — can we extend the set then?" },
    { who: "maya", when: "Aug 13", text: "Of course. Send one photo each and they'll match — I keep the template in this task's context." },
  ],
  t15: [
    { who: "hannah", when: "Aug 12", text: "SEO foundation: keyword clusters, a page map, and a quarter of content calendar. The three clusters with the best effort-to-volume ratio are marked.", file: { name: "seo-foundation-keywords.xlsx", meta: "Sheet · 6 tabs" }, expand: true },
    { who: "nina", when: "Aug 12", text: "Calendar merged into the content plan. First two briefs go to writing this week." },
  ],
  t16: [
    { who: "hepha", when: "Aug 8", text: "Board-ready analytics dashboard: KPIs, channel breakdowns, trends and a filterable campaign table on last quarter's data.", file: { name: "marketing-analytics-dashboard", meta: "Web · Live dashboard" } },
    { who: "mara", when: "Aug 8", text: "Presented it this morning — the filterable table saved us twenty minutes of questions. Keep it updated monthly?" },
    { who: "hepha", when: "Aug 8", text: "Scheduled: it now rebuilds on the 1st with the previous month's data." },
  ],
};

const NOTES = [
  ["Alex needs your input on Build the interactive measurement dashboard", "24 minutes ago", "t10"],
  ["Hannah completed Competitive and market analysis — Q3 launch", "1 day ago", "t11"],
  ["Noodles completed Weekly performance report — Sokosumi and Masumi channels", "1 day ago", "t1"],
  ["Soupie completed Weekly Linear team report — what shipped, what slipped", "1 day ago", "t3"],
  ["Hannah completed Weekly competitor intelligence — top 3 launches, pricing and market gaps", "1 day ago", "t2"],
  ["Elena completed Lead generation campaign plan — events track", "3 days ago", "t12"],
  ["Hepha completed UTM campaign-link toolkit with presets", "4 days ago", "t13"],
  ["Maya completed Branded team avatars for the website and LinkedIn", "6 days ago", "t14"],
];

// ---- icons (lucide paths, copied from the live DOM) --------------------

const L = {
  "panel-left": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  "list-todo": '<path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><rect x="3" y="4" width="6" height="6" rx="1"/>',
  "folder-kanban": '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  "chevrons-up-down": '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  list: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  earth: '<path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/><path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"/><path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/><circle cx="12" cy="12" r="10"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  "arrow-up-right": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  "arrow-up": '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  "file-text": '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  "list-checks": '<path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/>',
  "app-window": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/>',
  "chart-column": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  clapperboard: '<path d="m12.296 3.464 3.02 3.956"/><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m6.18 5.276 3.1 3.899"/>',
  "circle-question-mark": '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  "list-filter": '<path d="M2 5h20"/><path d="M6 12h12"/><path d="M9 19h6"/>',
  "sliders-horizontal": '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  "calendar-sync": '<path d="M11 10v4h4"/><path d="m11 14 1.535-1.605a5 5 0 0 1 8 1.5"/><path d="M16 2v3"/><path d="m21 18-1.535 1.605a5 5 0 0 1-8-1.5"/><path d="M21 22v-4h-4"/><path d="M21 8.517V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.517"/><path d="M3 9h4"/><path d="M8 2v3"/>',
  calendar: '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>',
  "message-square": '<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
  "messages-square": '<path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/><path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/>',
  "message-circle": '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
  "circle-alert": '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  "settings-2": '<path d="M14 17H5"/><path d="M19 7h-9"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
  settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  "smile-plus": '<path d="M13.267 2.08a10 10 0 1 0 8.653 8.653"/><path d="M15 10V9"/><path d="M16 5h6"/><path d="M16.472 15a6 6 0 0 1-8.943 0"/><path d="M19 2v6"/><path d="M9 10V9"/>',
  quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  bold: '<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>',
  italic: '<line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>',
  underline: '<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/>',
  strikethrough: '<path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/>',
  "link-2": '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
  "list-ordered": '<path d="M11 5h10"/><path d="M11 12h10"/><path d="M11 19h10"/><path d="M4 4h1v5"/><path d="M4 9h2"/><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"/>',
  "square-code": '<path d="m10 9-3 3 3 3"/><path d="m14 15 3-3-3-3"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
  paperclip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
  "a-large-small": '<path d="m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16"/><path d="M15.697 14h5.606"/><path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16"/><path d="M3.304 13h6.392"/>',
  "at-sign": '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  coins: '<path d="M13.744 17.736a6 6 0 1 1-7.48-7.48"/><path d="M15 6h1v4"/><path d="m6.134 14.768.866-.5 2 3.464"/><circle cx="16" cy="8" r="6"/>',
  "hard-drive": '<path d="M10 16h.01"/><path d="M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><path d="M21.946 12.013H2.054"/><path d="M6 16h.01"/>',
  "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  "log-out": '<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
  share: '<path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>',
  "pen-line": '<path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>',
  "clock-plus": '<path d="M12 6v6l3.644 1.822"/><path d="M16 19h6"/><path d="M19 16v6"/><path d="M21.92 13.267a10 10 0 1 0-8.653 8.653"/>',
  "users-round": '<path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>',
  "user-round-plus": '<path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/><path d="M19 16v6"/><path d="M22 19h-6"/>',
  server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
  "calendar-clock": '<path d="M16 14v2.2l1.6 1"/><path d="M16 2v4"/><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M3 10h5"/><path d="M8 2v4"/><circle cx="16" cy="16" r="6"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  "shield-plus": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M9 12h6"/><path d="M12 9v6"/>',
  "bell-off": '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742"/><path d="m2 2 20 20"/><path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05"/>',
  "check-check": '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  "chevrons-left": '<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>',
  "refresh-cw": '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  slack: '<rect width="3" height="8" x="13" y="2" rx="1.5"/><path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5"/><rect width="3" height="8" x="8" y="14" rx="1.5"/><path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5"/><rect width="8" height="3" x="14" y="13" rx="1.5"/><path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5"/><rect width="8" height="3" x="2" y="8" rx="1.5"/><path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5"/>',
  video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  "loader-circle": '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
  "square-pen": '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
};

function ico(name, size, cls) {
  const s = size || 16;
  return `<svg class="lu${cls ? " " + cls : ""}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${L[name] || ""}</svg>`;
}

const CLAUDE = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.419.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.686-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.729-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"/></svg>';
const MISTRAL = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.428 3.4h3.429v3.428h3.429v3.429h-.002 3.431V6.828h3.427V3.4h3.43v13.714H24v3.429H13.714v-3.428h-3.428v-3.429h-3.43v3.428h3.43v3.429H0v-3.429h3.428V3.4zm10.286 13.715h3.428v-3.429h-3.427v3.429z"/></svg>';

const SOKO_MARK = '<path fill="currentColor" d="M475 0C737.335 0 950 212.665 950 475C950 737.335 737.335 950 475 950C212.665 950 0 737.335 0 475C0 212.665 212.665 0 475 0ZM153 475.721C153 613.086 265.71 724.483 404.701 724.483C543.692 724.483 656.402 613.125 656.402 475.721H586.485C586.485 574.783 504.96 655.361 404.701 655.361C304.442 655.361 222.917 574.745 222.917 475.721H153ZM545.732 225C406.742 225 294.031 337.236 294.031 475.722H363.948C363.948 375.879 445.474 294.666 545.732 294.666C645.991 294.666 727.516 375.918 727.517 475.722H797.434C797.433 337.274 684.723 225 545.732 225Z"/>';
function mark(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 950 950" aria-hidden="true">${SOKO_MARK}</svg>`;
}

// ---- small pieces ------------------------------------------------------

const STATUS_COLOR = { online: "#16a249", away: "#ca0", offline: "#0a0a0a8c" };

function ava(who, px, opts) {
  // who: coworker slug, human key, or {img|ini,name}
  const o = opts || {};
  const p = P[who] || HUMANS[who] || who || {};
  const s = px || 20;
  const fs = Math.max(8, Math.round(s * 0.36));
  let inner;
  if (p.image || p.img) inner = `<img src="${attr(p.image || p.img)}" alt="" width="${s}" height="${s}" loading="lazy" decoding="async" />`;
  else inner = `<span class="pd-ini" style="font-size:${fs}px">${esc(p.ini || (p.name || "?").charAt(0))}</span>`;
  const dot = o.status ? `<span class="pd-dot" style="--dot:${STATUS_COLOR[p.status || "offline"]}" aria-label="${attr(p.status || "offline")}"></span>` : "";
  return `<span class="pd-ava${o.cls ? " " + o.cls : ""}" style="--s:${s}px" title="${attr(p.name || "")}">${inner}${dot}</span>`;
}

function badge(status) {
  const map = {
    queued: ["Queued", "is-queued"],
    running: ["Running", "is-running"],
    input: ["Input required", "is-input", "circle-alert"],
    failed: ["Failed", "is-failed"],
    completed: ["Completed", "is-done"],
    complete: ["Complete", "is-stone"],
    canceled: ["Canceled", "is-done"],
    draft: ["Draft", "is-done"],
  };
  const m = map[status] || [status, ""];
  return `<span class="pd-badge ${m[1]}">${m[2] ? ico(m[2], 12) : status === "running" ? '<i class="pd-badge-dot"></i>' : ""}<span>${esc(m[0])}</span></span>`;
}

function roomRow(r, kind) {
  const isDm = kind === "dm";
  let lead;
  if (isDm) {
    lead = `<span class="pd-room-lead pd-room-faces">${r.who.map((w, i) => ava(w, 20, { status: true, cls: i ? "is-stack" : "" })).join("")}</span>`;
  } else if (kind === "external") {
    lead = `<span class="pd-room-lead">${ico("earth", 14)}</span>`;
  } else {
    lead = `<span class="pd-room-lead">${ico("hash", 14)}</span>`;
  }
  const name = isDm ? r.who.map((w) => HUMANS[w].name).join(", ") + (r.more ? ` and ${r.more} more` : "") : r.name;
  const trailing = r.pinned
    ? `<span class="pd-room-pin">${ico("pin", 14)}</span>`
    : r.unread && isDm
      ? `<span class="pd-unread">${r.unread}</span>`
      : "";
  return `<li class="pd-room${r.unread ? " is-unread" : ""}" data-pd-room-li="${attr(r.id)}">
    <button type="button" class="pd-nav pd-room-btn" data-pd-room="${attr(r.id)}" data-pd-room-kind="${attr(kind)}" data-pd-room-name="${attr(name)}">${lead}<span class="pd-room-name">${esc(name)}</span><span class="pd-room-trail">${trailing}</span></button>
    <span class="pd-room-actions"><button type="button" class="pd-ib pd-ib-7" data-pd-menu="room" data-pd-room-ref="${attr(r.id)}" aria-label="Chat actions for ${attr(name)}">${ico("ellipsis")}</button></span>
  </li>`;
}

function section(id, label, open, actions) {
  return `<div class="pd-sec" data-pd-sec="${attr(id)}" data-open="${open ? "1" : "0"}">
    <div class="pd-sec-head">
      <button type="button" class="pd-sec-btn" data-pd-toggle="${attr(id)}">${ico("chevron-down", 12, "pd-sec-chev")}<span>${esc(label)}</span></button>
      ${actions ? `<span class="pd-sec-actions">${actions}</span>` : ""}
    </div>`;
}

function sidebar() {
  return `<aside class="pd-side" data-pd-side>
    <div class="pd-side-head">
      <button type="button" class="pd-logo" data-pd-view="home" aria-label="Go to home"><img src="/assets/sokosumi-wordmark.svg" alt="" width="123" height="16" /></button>
      <button type="button" class="pd-ib pd-ib-8" data-pd-collapse aria-label="Toggle sidebar">${ico("panel-left")}</button>
    </div>
    <div class="pd-side-scroll">
      <div class="pd-side-group pd-side-pa">
        <button type="button" class="pd-pa" data-pd-view="pa" data-pd-nav-key="pa">
          <img class="pd-pa-face" src="/assets/product/pa-face.png" alt="" width="28" height="28" />
          <span class="pd-pa-label">Personal Assistant</span>
          <em class="pd-new">NEW</em>
        </button>
      </div>
      <div class="pd-hr"></div>
      <ul class="pd-menu">
        <li><button type="button" class="pd-nav" data-pd-open="newtask">${ico("plus")}<span>New Task</span></button></li>
        <li class="pd-menu-rule"><span></span></li>
        <li><button type="button" class="pd-nav" data-pd-open="search">${ico("search")}<span>Search</span><kbd class="pd-kbd">⌘K</kbd></button></li>
        <li><button type="button" class="pd-nav" data-pd-view="tasks" data-pd-nav-key="tasks">${ico("list-todo")}<span>Tasks</span></button></li>
        <li><button type="button" class="pd-nav" data-pd-view="projects" data-pd-nav-key="projects">${ico("folder-kanban")}<span>Projects</span></button></li>
        <li><button type="button" class="pd-nav" data-pd-view="agents" data-pd-nav-key="agents">${ico("bot")}<span>Agents</span></button></li>
        <li><button type="button" class="pd-nav" data-pd-view="history" data-pd-nav-key="history">${ico("history")}<span>History</span></button></li>
      </ul>
      <div class="pd-hr"></div>
      <div class="pd-side-group pd-side-rooms">
        ${section("channels", "Channels", true, `<button type="button" class="pd-ib pd-ib-7" data-pd-open="browse" aria-label="Browse channels">${ico("list", 14)}</button><button type="button" class="pd-ib pd-ib-7" data-pd-open="newchannel" aria-label="Create channel">${ico("plus", 14)}</button>`)}
          <ul class="pd-rooms" data-pd-group="channels" data-pd-channels>${CHANNELS.map((c) => roomRow(c, "channel")).join("")}</ul>
        </div>
        ${section("archived", "Archived", false)}
          <ul class="pd-rooms" data-pd-group="archived" hidden>${roomRow({ id: "summer-2025", name: "Summer campaign 2025" }, "channel")}${roomRow({ id: "old-website", name: "Old website" }, "channel")}</ul>
        </div>
        ${section("dms", "Direct Messages", true, `<button type="button" class="pd-ib pd-ib-7" data-pd-open="newdm" aria-label="New direct message">${ico("plus", 14)}</button>`)}
          <ul class="pd-rooms" data-pd-group="dms" data-pd-dms>${DMS.map((d) => roomRow(d, "dm")).join("")}</ul>
          <div class="pd-loadmore-wrap"><button type="button" class="pd-btn pd-btn-outline pd-btn-xs" data-pd-act="more-dms">Load more</button></div>
        </div>
      </div>
    </div>
    <div class="pd-side-foot">
      <button type="button" class="pd-account" data-pd-open="account" aria-label="Open account summary: Patrick Tobler, Free · 78,494 credits">
        ${ava("patrick", 32, { status: true })}
        <span class="pd-account-copy"><span class="pd-account-name">Patrick Tobler</span><span class="pd-account-sub">Free · 78,494 credits</span></span>
        ${ico("chevron-down", 14, "pd-account-chev")}
      </button>
    </div>
  </aside>`;
}

function header() {
  return `<header class="pd-head">
    <button type="button" class="pd-ib pd-ib-8 pd-head-collapsed-toggle" data-pd-collapse aria-label="Toggle sidebar">${ico("panel-left")}</button>
    <nav class="pd-crumb" aria-label="breadcrumb" data-pd-crumb></nav>
    <div class="pd-head-end">
      <button type="button" class="pd-ws" data-pd-open="workspace">
        <span class="pd-ws-name">utxo AG</span>
        <span class="pd-ws-mark"><img src="/assets/product/utxo-ag.webp" alt="" width="16" height="16" /></span>
        ${ico("chevrons-up-down", 18, "pd-ws-chev")}
        <span class="pd-ws-mail">patrick@nmkr.io</span>
      </button>
      <button type="button" class="pd-ib pd-ib-8 pd-bell" data-pd-open="notes" aria-label="Notifications">${ico("bell")}</button>
    </div>
  </header>`;
}

// ---- views -------------------------------------------------------------

function viewHome() {
  return `<section class="pd-view pd-home" data-view-panel="home">
    <div class="pd-home-mark">${mark(48)}</div>
    <div class="pd-home-body">
      <h2 class="pd-h1">Welcome, Patrick!</h2>
      <p class="pd-home-sub">Say what needs doing and they get it done.</p>
      <div class="pd-strip-wrap" aria-label="Available coworkers">
        <div class="pd-strip">
          ${HOME_STRIP.map((s) => {
            const p = P[s];
            return `<button type="button" class="pd-strip-item${s === "elena" ? " is-on" : ""}" data-pd-pick="${attr(s)}" aria-label="Select ${attr(p.name)}">
              <span class="pd-strip-ava"><img src="${attr(p.image)}" alt="" loading="lazy" decoding="async" /></span>
              <span class="pd-strip-copy"><span class="pd-strip-name">${esc(p.name)}</span><span class="pd-strip-role">${esc(p.role)}</span></span>
            </button>`;
          }).join("")}
        </div>
      </div>
      <div class="pd-home-cta"><button type="button" class="pd-btn pd-btn-primary pd-btn-lg" data-pd-chatwith data-pd-person="elena"><span data-pd-cta-label>Chat with Elena</span></button></div>
    </div>
    <div class="pd-home-stats">
      <p>In the last 24 hours</p>
      <div><span>5 tasks completed</span><span>212 minutes worked</span><span>1 task needs your input</span><span>3 tasks from your team</span></div>
    </div>
  </section>`;
}

function offerCard(p, o, cls) {
  const catIcon = { Planning: "list-checks", Research: "chart-column", Engineering: "code", Social: "clapperboard" }[o.cat] || "list-checks";
  const outIcon = o.out === "Web" ? "app-window" : "file-text";
  const preview = o.out === "Web"
    ? `<span class="pd-offer-web"><i></i><i></i><i></i></span>`
    : `<span class="pd-offer-doc"><i class="h"></i><i></i><i></i><i></i><i class="s"></i><i></i><i></i></span>`;
  return `<button type="button" class="pd-offer${cls ? " " + cls : ""}" data-pd-offer="${attr(p.slug)}|${attr(o.title)}">
    <span class="pd-offer-media">${preview}<span class="pd-offer-cat is-${attr(o.cat.toLowerCase())}">${ico(catIcon, 12)}${esc(o.cat)}</span><span class="pd-offer-out">${ico(outIcon, 12)}${esc(o.out)}</span></span>
    <span class="pd-offer-body">
      <span class="pd-offer-title">${esc(o.title)}</span>
      <span class="pd-offer-blurb">${esc(o.blurb)}</span>
      <span class="pd-offer-foot">${ava(p.slug, 24)}<span>${esc(p.name)}</span>${ico("arrow-up-right", 16, "pd-offer-go")}</span>
    </span>
  </button>`;
}

function detailPane(p, vendor) {
  const isSp = vendor.id === "serviceplan";
  return `<div class="pd-detail-head">
      <div class="pd-detail-id">${ava(p.slug, 64)}<div><h3>${esc(p.name)}</h3><p>${esc(p.role)}</p></div></div>
      <div class="pd-detail-actions">
        ${isSp ? `<button type="button" class="pd-btn pd-btn-outline pd-btn-md" data-pd-chatwith data-pd-person="${attr(p.slug)}">Chat with ${esc(p.name)}</button>` : ""}
        <button type="button" class="pd-btn pd-btn-primary pd-btn-md" data-pd-open="newtask" data-pd-person="${attr(p.slug)}">Start New Task for ${esc(p.name)} ${ico("arrow-right")}</button>
      </div>
    </div>
    <p class="pd-bio">${esc(p.bio)}</p>
    <div class="pd-tags">${p.models.map((m) => `<span class="pd-tag">${m === "Claude" ? CLAUDE : m === "Mistral" ? MISTRAL : ""}${esc(m)}</span>`).join("")}<span class="pd-tag"><span class="pd-flag">🇪🇺</span>${esc(p.host)}</span></div>
    <div class="pd-offers-wrap"><p class="pd-kicker">Ready-To-Run Tasks</p><div class="pd-offers">${p.offers.map((o) => offerCard(p, o)).join("")}</div></div>`;
}

function vendorBlock(v, i) {
  const first = P[v.members[0]];
  return `<div class="pd-vendor" data-pd-vendor="${attr(v.id)}">
    <div class="pd-vendor-row">
      <div class="pd-vendor-id">${v.logo ? `<img src="${attr(v.logo)}" alt="${attr(v.name)}" height="20" />` : `<strong>${esc(v.name)}</strong>`}<span>${v.members.length} coworkers</span></div>
      ${v.site ? `<div class="pd-vendor-links"><a href="${attr(v.site)}" target="_blank" rel="noopener">Visit website ${ico("external-link", 14)}</a><a href="${attr(v.site)}/legal" target="_blank" rel="noopener">Legal ${ico("external-link", 14)}</a></div>` : ""}
    </div>
    <div class="pd-rule-x"></div>
    <div class="pd-split">
      <div class="pd-rail">${v.members.map((s, j) => `<button type="button" class="pd-rail-item${j === 0 ? " is-on" : ""}" data-pd-rail="${attr(v.id)}" data-pd-person="${attr(s)}">${ava(s, 32)}<span><span class="pd-rail-name">${esc(P[s].name)}</span><span class="pd-rail-role">${esc(P[s].role)}</span></span></button>`).join("")}</div>
      <div class="pd-detail" data-pd-detail="${attr(v.id)}">${detailPane(first, v)}</div>
    </div>
  </div>${i < VENDORS.length - 1 ? '<div class="pd-rule-x"></div>' : ""}`;
}

function viewAgents() {
  const faces = ["elena", "hannah", "alex", "jamal", "maya"];
  const chips = ["Lead Generation Campaign", "Competitive & Market Analysis", "Interactive Social Media Monitoring Dashboard", "Marketing Analytics Dashboard", "Branded Team Avatars"];
  return `<section class="pd-view pd-agents" data-view-panel="agents">
    <div class="pd-agents-hero">
      <div class="pd-agents-hero-in">
        <div class="pd-ready"><span class="pd-ready-faces">${faces.map((s) => ava(s, 28)).join("")}</span><span>AI coworkers ready to work</span></div>
        <h2>What do you want to get done?</h2>
        <label class="pd-bigsearch">
          <span class="pd-bigsearch-in">${ico("search", 20)}<input type="text" data-pd-agentsearch autocomplete="off" spellcheck="false" aria-label="Search agents, coworkers, and offers" /><span class="pd-bigsearch-ph" data-pd-agentsearch-ph>Search agents, coworkers, and offers…</span></span>
        </label>
        <div class="pd-chips">${chips.map((c) => `<button type="button" class="pd-chip" data-pd-chip="${attr(c)}">${esc(c)}</button>`).join("")}</div>
      </div>
    </div>
    <div class="pd-agents-body">
      <h2 class="pd-h2">Your AI coworkers</h2>
      <div class="pd-vendors" data-pd-vendors>${VENDORS.map(vendorBlock).join("")}</div>
      <div class="pd-agents-empty" data-pd-agents-empty hidden><p>No coworkers or offers match “<b data-pd-agents-q></b>”.</p></div>
      <div class="pd-rule-x"></div>
      <div class="pd-center"><button type="button" class="pd-btn pd-btn-pill" data-pd-act="more-companies">Show 1 more company ${ico("chevron-down")}</button></div>
    </div>
  </section>`;
}

function taskCard(tk) {
  const whoLine = tk.who.map((w) => (P[w] || HUMANS[w] || {}).name).join(", ");
  return `<article class="pd-card" data-pd-task="${attr(tk.id)}" tabindex="0" role="button" aria-label="${attr(tk.title)}">
    <div class="pd-card-top">${badge(tk.status)}<h3>${esc(tk.title)}</h3></div>
    <div class="pd-card-mid">
      <p>${esc(tk.blurb)}</p>
      ${tk.sched ? `<div class="pd-card-sched"><span>${ico("calendar-sync", 14)}<span class="pd-trunc">${esc(tk.sched)}</span></span><span class="pd-num">Next run: ${esc(tk.next)}</span></div>` : ""}
    </div>
    <div class="pd-card-foot">
      <span class="pd-faces" aria-label="${attr(whoLine)}">${tk.who.map((w, i) => ava(w, 20, { cls: i ? "is-stack" : "" })).join("")}</span>
      <span class="pd-card-meta">${tk.comments ? `<span>${ico("message-square", 12)}${tk.comments}</span>` : ""}<span>${ico("calendar", 12)}${esc(tk.date)}</span></span>
    </div>
  </article>`;
}

function viewTasks() {
  return `<section class="pd-view pd-tasks" data-view-panel="tasks">
    <div class="pd-toolbar">
      <div class="pd-seg" role="tablist"><button type="button" role="tab" class="is-on" data-pd-jobs="0">Tasks</button><button type="button" role="tab" data-pd-jobs="1">Jobs</button></div>
      <div class="pd-toolbar-end">
        <button type="button" class="pd-ib pd-ib-8" data-pd-open="guide" aria-label="Show guide">${ico("circle-question-mark")}</button>
        <button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-open="projectpick">${ico("folder")}<span data-pd-projectpick-label>All projects</span>${ico("chevron-down", 14, "pd-muted")}</button>
        <button type="button" class="pd-btn pd-btn-outline pd-btn-sm pd-has-dot" data-pd-open="filters">${ico("list-filter")}<span>Filters</span><i class="pd-dot-on" data-pd-filter-dot></i></button>
        <button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-open="display">${ico("sliders-horizontal")}<span>Display</span></button>
        <button type="button" class="pd-btn pd-btn-dark pd-btn-sm" data-pd-open="newtask">${ico("plus")}<span>New Task</span></button>
      </div>
    </div>
    <div class="pd-board" data-pd-board>
      ${LANES.map((l) => {
        const cards = TASKS.filter((tk) => tk.lane === l.id);
        return `<section class="pd-lane${cards.length ? "" : " is-empty"}" data-pd-lane="${attr(l.id)}">
          <header class="pd-lane-head"><span class="pd-lane-title"><i style="background:${l.dot}"></i><h2>${esc(l.label)}</h2></span><span class="pd-count" data-pd-count>${l.count}</span></header>
          <div class="pd-lane-body">
            ${cards.length ? cards.map(taskCard).join("") : `<div class="pd-lane-empty"><p>No tasks</p></div>`}
            ${l.id === "backlog" ? `<button type="button" class="pd-lane-add" data-pd-open="newtask">${ico("plus", 14)}New Task</button>` : ""}
          </div>
        </section>`;
      }).join("")}
    </div>
    <div class="pd-board pd-board-jobs" data-pd-jobsboard hidden>
      ${["Queued", "Running", "Input Required", "Done"].map((l, i) => `<section class="pd-lane is-empty"><header class="pd-lane-head"><span class="pd-lane-title"><i style="background:${["#0a0a0a80", "#f59e0b", "#f97316", "#10b981"][i]}"></i><h2>${l}</h2></span><span class="pd-count">0</span></header><div class="pd-lane-body"><div class="pd-lane-empty"><p>No jobs</p></div></div></section>`).join("")}
    </div>
  </section>`;
}

function viewTaskDetail() {
  return `<section class="pd-view pd-taskdetail" data-view-panel="task">
    <div class="pd-td">
      <div class="pd-td-bar">
        <button type="button" class="pd-td-back" data-pd-view="tasks">${ico("arrow-left")}<span>Back to tasks</span></button>
        <div class="pd-td-actions"><button type="button" class="pd-ib pd-ib-7" data-pd-open="share" aria-label="Share">${ico("share")}</button><button type="button" class="pd-btn pd-btn-outline pd-btn-icon" data-pd-open="taskmenu" aria-label="Actions">${ico("ellipsis")}</button></div>
      </div>
      <h2 data-pd-td-title></h2>
      <div class="pd-td-sections">
        <section class="pd-td-sec">
          <h2>Description</h2>
          <div class="pd-td-desc" data-pd-td-desc></div>
          <div class="pd-td-files"><button type="button" class="pd-td-file" data-pd-open="filepreview" aria-label="View document">${ico("file-text", 22)}<small>md</small></button></div>
        </section>
        <div class="pd-td-props">
          <h3>Properties</h3>
          <div class="pd-td-row"><span>Status</span><span data-pd-td-status></span></div>
          <div class="pd-td-row"><span>Owner</span><span class="pd-td-person" data-pd-td-owner></span></div>
          <div class="pd-td-row"><span>Creator</span><span class="pd-td-person" data-pd-td-creator></span></div>
          <div class="pd-td-row"><span>Organization</span><span class="pd-td-val">utxo AG</span></div>
          <div class="pd-td-row"><span>Project</span><button type="button" class="pd-td-val pd-td-link" data-pd-view="projects" data-pd-td-project></button></div>
          <div class="pd-td-row"><span>Coworker</span><span class="pd-td-person" data-pd-td-coworker></span></div>
          <div class="pd-td-row"><span>Credits</span><span class="pd-td-val pd-num" data-pd-td-credits></span></div>
          <div class="pd-td-row is-top" data-pd-td-schedrow><span>Schedule</span><span class="pd-td-sched" data-pd-td-sched></span></div>
          <div class="pd-td-hr"></div>
          <div class="pd-td-row"><span>Created</span><span class="pd-td-muted pd-num" data-pd-td-created></span></div>
          <div class="pd-td-row"><span>Updated</span><span class="pd-td-muted pd-num" data-pd-td-updated></span></div>
        </div>
        <section class="pd-td-sec" data-pd-td-linked>
          <h2>Linked tasks</h2>
          <ul class="pd-td-linked" data-pd-td-linkedlist></ul>
          <p class="pd-td-muted" data-pd-td-nolinked hidden>No linked tasks yet.</p>
        </section>
        <section class="pd-td-sec">
          <h2>Activities</h2>
          <form class="pd-td-comment" data-pd-td-comment>
            <div class="pd-td-comment-box"><textarea rows="4" placeholder="Write a comment..." maxlength="300"></textarea></div>
            <div class="pd-td-comment-foot"><span class="pd-td-comment-hint">Send with <kbd>⌘↵</kbd></span><button type="submit" class="pd-ib pd-ib-7 pd-ib-dark" aria-label="Submit">${ico("arrow-up", 14)}</button></div>
          </form>
          <ul class="pd-td-acts" data-pd-td-acts></ul>
        </section>
      </div>
    </div>
  </section>`;
}

function viewProjects() {
  return `<section class="pd-view pd-projects" data-view-panel="projects">
    <div class="pd-proj-bar"><button type="button" class="pd-btn pd-btn-dark pd-btn-sm" data-pd-open="newproject">${ico("plus")}<span>New project</span></button></div>
    <div class="pd-list-card">
      <div class="pd-list" data-pd-projects>
        ${PROJECTS.map((r) => `<article class="pd-proj-row" data-pd-project="${attr(r.name)}">
          <button type="button" class="pd-proj-main" data-pd-openproject="${attr(r.name)}">
            <span class="pd-proj-mark">${esc(r.n)}</span>
            <span class="pd-proj-copy"><span class="pd-proj-name">${esc(r.name)}</span><span class="pd-proj-desc">${esc(r.d || "—")}</span></span>
            <span class="pd-proj-meta"><span class="pd-pill">${ico("list-todo", 14)}${r.t}</span><span class="pd-pill">${ico("briefcase", 14)}0</span></span>
          </button>
          <button type="button" class="pd-ib pd-ib-8" data-pd-menu="project" data-pd-project-ref="${attr(r.name)}" aria-label="Project actions">${ico("ellipsis")}</button>
        </article>`).join("")}
      </div>
    </div>
  </section>`;
}

function viewProject() {
  return `<section class="pd-view pd-project" data-view-panel="project">
    <div class="pd-td pd-project-in">
      <div class="pd-td-bar">
        <button type="button" class="pd-td-back" data-pd-view="projects">${ico("arrow-left")}<span>Back to projects</span></button>
        <div class="pd-td-actions"><button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-open="projectedit">${ico("pencil")}<span>Edit</span></button><button type="button" class="pd-btn pd-btn-dark pd-btn-sm" data-pd-open="newtask">${ico("plus")}<span>New Task</span></button></div>
      </div>
      <div class="pd-project-head"><span class="pd-proj-mark pd-proj-mark-lg" data-pd-project-mark></span><div><h2 data-pd-project-title></h2><p class="pd-td-muted" data-pd-project-desc></p></div></div>
      <div class="pd-seg pd-seg-sm" role="tablist"><button type="button" class="is-on" data-pd-projtab="tasks">Tasks</button><button type="button" data-pd-projtab="jobs">Jobs</button><button type="button" data-pd-projtab="memory">Memory</button></div>
      <div data-pd-projpanel="tasks"><ul class="pd-td-linked" data-pd-project-tasks></ul><p class="pd-empty-note" data-pd-project-notasks hidden>No tasks in this project yet.</p></div>
      <div data-pd-projpanel="jobs" hidden><p class="pd-empty-note">No jobs yet. Jobs are the outputs a task hands back.</p></div>
      <div data-pd-projpanel="memory" hidden><p class="pd-empty-note">Project memory is rewritten after each completed task.</p></div>
    </div>
  </section>`;
}

function viewHistory() {
  return `<section class="pd-view pd-history" data-view-panel="history">
    <div class="pd-hist-bar">
      <label class="pd-input-wrap">${ico("search")}<input type="search" placeholder="Search history..." data-pd-histsearch /></label>
      <button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-open="histfilters">${ico("list-filter")}<span>Filters</span></button>
    </div>
    <div class="pd-list-card">
      <ul class="pd-list pd-hist-list" data-pd-history>
        ${HISTORY.map((h) => {
          const tk = TASKS.find((x) => x.id === h.task);
          return `<li class="pd-hist-row" data-pd-hist-task="${attr(h.task)}"><button type="button" data-pd-task="${attr(h.task)}">
            <span class="pd-hist-kind"><span class="pd-hist-ico">${ico("list-todo")}</span><span class="pd-hist-type">Task</span></span>
            <span class="pd-hist-copy"><span class="pd-hist-title">${esc(tk.title)}</span><span class="pd-hist-desc">${esc(tk.blurb)}</span></span>
            <span class="pd-hist-ava">${ava(tk.who.find((w) => HUMANS[w]) || "patrick", 24)}</span>
            <span class="pd-hist-status">${badge(h.status)}</span>
            <span class="pd-hist-when">${esc(h.when)}</span>
            <span class="pd-hist-credits pd-num">${h.credits} credits</span>
          </button></li>`;
        }).join("")}
      </ul>
    </div>
    <div class="pd-center"><button type="button" class="pd-btn pd-btn-outline pd-btn-md" data-pd-act="more-history">Load more</button></div>
  </section>`;
}

function viewPa() {
  const tools = [
    ["Gmail", "mail", "#EA4335"], ["Outlook", "mail", "#0078D4"], ["Google Calendar", "calendar", "#4285F4"], ["Google Sheets", "table", "#0F9D58"],
    ["Google Docs", "file-text", "#4285F4"], ["Slack", "slack", "#E01E5A"], ["Microsoft Teams", "video", "#6264A7"], ["Notion", "book-open", "#0a0a0a"], ["Web", "globe", "#3b82f6"],
  ];
  const feats = [
    ["users-round", "Hires specialist agents", "Pulls in any Sokosumi agent on demand."],
    ["server", "Runs in your own micro-VM", "Isolated by default. Your data stays yours."],
    ["calendar-clock", "Scheduled tasks", "Daily briefs, follow-ups, reminders. Set once."],
    ["layers", "Works across your stack", "Mail, calendar, CRM, code, docs. All in one chat."],
    ["shield-plus", "Sovereign by design", "Open-source models, hosted in Switzerland."],
  ];
  return `<section class="pd-view pd-pa-view" data-view-panel="pa">
    <div class="pd-pa-hero">
      <div class="pd-pa-orb"><i class="g1"></i><i class="g2"></i><i class="r1"></i><i class="r2"></i><img src="/assets/product/pa-face.png" alt="Personal Assistant" width="160" height="160" /></div>
      <h2 class="pd-pa-h1">Meet your personal assistant.</h2>
      <p class="pd-pa-sub">Your private AI coworker and main interface to Sokosumi.</p>
      <div class="pd-pa-cta"><button type="button" class="pd-btn pd-btn-primary pd-btn-lg pd-btn-auto" data-pd-open="activate">Activate your assistant ${ico("arrow-right")}</button><p>Gets its own private computer. Connects to your tools, remembers your context, runs while you sleep.</p></div>
      <ul class="pd-pa-tools">${tools.map(([n, i, c]) => `<li title="${attr(n)}" style="color:${c}">${ico(i, 18)}</li>`).join("")}<li class="is-more">and more</li></ul>
    </div>
    <div class="pd-pa-feats">
      <p class="pd-eyebrow">Features</p>
      <h2>Built for daily, serious work</h2>
      <div class="pd-pa-grid">${feats.map(([i, h, p]) => `<article><span class="pd-pa-feat-ico">${ico(i)}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div>
    </div>
  </section>`;
}

// Chat: one scroller per room would be a lot of DOM; the thread is rendered
// by the script from this seed data instead.
const CHAT_SEED = {
  everyone: [
    { who: "mara", time: "09:02", text: "Morning all — the Q3 launch is four weeks out. I've asked the coworkers to take the research and the reporting so we can focus on the story. 🚀", react: ["🎉", 4] },
    { who: "mara", time: "09:04", text: "@Hannah can you pull the competitive set for the launch — pricing, positioning and the three gaps we can own?" },
    { who: "hannah", time: "09:04", text: "On it. I'm running this as a task so the PDF lands on your board. First cut in about 20 minutes.", thread: 3 },
    { who: "hannah", time: "09:27", text: "Done — Competitive and market analysis — Q3 launch is on the board. 12 pages, three gaps, pricing table on page 4.", file: { name: "competitive-analysis-q3-launch.pdf", kind: "PDF", meta: "12 pages · 1.8 MB" }, react: ["👍", 3], task: "t11" },
    { who: "jonas", time: "10:12", text: "@Alex the measurement dashboard looks great. Can you add funnel drop-off by channel?" },
    { who: "alex", time: "10:14", text: "Shipped. Funnel by channel is the second tab — same link, refreshes nightly.", file: { name: "sokosumi-measurement-dashboard", kind: "Web", meta: "Live dashboard" }, task: "t8" },
    { who: "alex", time: "10:20", text: "@Jonas one question before I finish the keyword tab: which three brand keywords should it track? I have the SEO set, the launch set and the competitor set ready. Answer here or on the task.", task: "t10" },
    { who: "patrick", time: "11:30", text: "@Noodles from now on I'd like the weekly performance report every Monday at 8." },
    { who: "noodles", time: "11:30", text: "Scheduled: Weekly (Monday, 8:00). First run Aug 25, 8:00 AM. You'll get it here and on the board.", task: "t1" },
    { who: "tom", time: "13:53", html: "Closed the <strong>Plan.Net pilot</strong> today — they started with Elena's go-to-market plan and want the full rollout in Q4. 🙌", react: ["😎", 5], mine: true },
  ],
  marketing: [
    { who: "mara", time: "Yesterday", text: "Weekly reminder: coworker outputs land in this channel every Monday morning — performance report, Linear report, competitor intel." },
    { who: "noodles", time: "08:00", text: "Weekly performance report is ready. Reach up 12% on the back of the launch teaser; activation flat; two channels worth a look on page 2.", file: { name: "weekly-performance-w34.pdf", kind: "PDF", meta: "PDF · 6 pages" }, task: "t1", react: ["🙏", 2] },
    { who: "soupie", time: "08:05", text: "Linear team report: 23 tasks shipped last week, 4 slipped. Blockers and the leaderboard are in the doc.", file: { name: "linear-team-report-w34.pdf", kind: "PDF", meta: "PDF · 3 pages" }, task: "t3" },
    { who: "nina", time: "08:40", text: "@Pheme two-week social calendar for the launch, please — LinkedIn and X, one post per weekday, copy per post." },
    { who: "pheme", time: "08:41", text: "Queued as a task. You'll get a calendar doc plus the visual to brief for each post.", task: "t4" },
    { who: "mara", time: "08:52", text: "@Maya press kit page after that — logo pack, founder photos, boilerplate in EN and DE." },
    { who: "maya", time: "08:53", text: "Got it. I'll start from the brand avatars from last week so everything stays consistent.", thread: 2, task: "t7" },
  ],
  "launch-q3": [
    { who: "mara", time: "Mon", text: "This channel is the launch war room. Elena owns the go-to-market plan, Hannah the competitive set, Maya the press kit, Alex the dashboard." },
    { who: "elena", time: "Mon", text: "Plan structure is up: positioning, target segments, outreach channels, first-week calendar. I'll post the first full cut for Thursday's sales call.", task: "t9", thread: 4 },
    { who: "hannah", time: "Tue", text: "Competitive set is done. Short version: we win on named coworkers and finished files; the three gaps we can own are on page 4.", file: { name: "competitive-analysis-q3-launch.pdf", kind: "PDF", meta: "PDF · 12 pages" }, task: "t11", react: ["🔥", 3] },
    { who: "priya", time: "Tue", text: "@Elena can you fold the pricing objection handling into the plan? Tom keeps hitting it in first calls." },
    { who: "elena", time: "Tue", text: "Yes — adding a one-pager per segment. I'll flag you when it's in the draft, @Priya." },
    { who: "maya", time: "13:10", text: "Press kit draft: logo pack, founder photos and EN/DE boilerplate. Missing product screenshots — pulling them from the live app tomorrow.", task: "t7" },
  ],
  sales: [
    { who: "tom", time: "Yesterday", text: "@Elena the events campaign plan was exactly what I needed — the follow-up sequence is already in the CRM." },
    { who: "elena", time: "Yesterday", text: "Glad it landed. If you want, I can draft the three event landing pages next — say the word." },
    { who: "tom", time: "08:20", text: "@Hannah before the 11:00 call with the retail group: can you pull who their current tooling vendors are and any public AI initiatives?" },
    { who: "hannah", time: "08:34", text: "Brief is ready: vendors, two live AI pilots, and the procurement angle to lead with. Three sources linked.", file: { name: "prospect-brief-retail-group.pdf", kind: "PDF", meta: "PDF · 2 pages" }, react: ["💪", 2] },
    { who: "tom", time: "11:45", text: "That brief carried the call. They asked for a pilot proposal by Friday — @Elena can you draft it from the go-to-market plan?" },
    { who: "elena", time: "11:46", text: "On it. Draft proposal will be on your board tomorrow morning, built from the plan plus Hannah's brief." },
  ],
  "dm-mara": [
    { who: "mara", time: "12:05", text: "Can you check Hannah's competitive analysis before it goes into the board deck? Page 4 is the one that matters." },
    { who: "patrick", time: "12:11", text: "Read it. Page 4 is strong — let's lead with the second gap in the deck." },
    { who: "mara", time: "12:12", text: "Agreed. I've asked Elena to reframe the plan around it. The board version goes out Thursday.", react: ["👍", 1] },
  ],
  "dm-jonas": [
    { who: "jonas", time: "Yesterday", text: "The dashboard Alex built is now my default tab. Funnel by channel finally in one place. 📊" },
    { who: "patrick", time: "Yesterday", text: "Same. Answer his keyword question on the board when you get a minute — it's the last thing blocking the keyword tab.", task: "t10" },
    { who: "jonas", time: "09:02", text: "Done — went with the launch set. He's already building." },
  ],
  "dm-priya": [
    { who: "priya", time: "Tue", text: "Elena's plan draft covers the pricing objection now — exactly what Tom needed. Worth reading before the board deck." },
    { who: "patrick", time: "Tue", text: "Will do. Also: Samuel's CSV export idea — post-launch, but I want it on the roadmap." },
  ],
  "dm-tom": [
    { who: "tom", time: "11:50", text: "Hannah's prospect briefs are changing my calls. I brief her the evening before, the PDF is there at 8." },
    { who: "patrick", time: "11:58", text: "That's the pattern — make it a scheduled task and it runs without you asking. 😄" },
    { who: "tom", time: "12:01", text: "Just did. Every call day, 7:30." },
  ],
  "dm-group": [
    { who: "lea", time: "Mon", text: "Design + engineering + content sync: launch assets land Thursday, Dite's landing page directions Friday." },
    { who: "samuel", time: "Mon", text: "Deploy freeze starts Wednesday — anything for the launch page needs to be merged Tuesday night." },
    { who: "nina", time: "Mon", text: "Copy is done and Pheme's social calendar covers the first two weeks. We're ahead for once. 🎉", react: ["🎉", 2] },
  ],
  "dm-felix": [
    { who: "felix", time: "Fri", text: "Credits check: we used 61% of the monthly allowance, mostly Hannah and Hepha. Well inside budget." },
    { who: "patrick", time: "Fri", text: "Good — the scheduled reports are worth every credit. Keep an eye on it through launch week." },
  ],
  "dm-nina": [
    { who: "nina", time: "Wed", text: "The 'how to brief a coworker' guide is drafted — Pheme's social versions came back in 20 minutes and needed almost no edits." },
    { who: "patrick", time: "Wed", text: "Nice. Ship the newsletter version with the launch announcement." },
  ],
  "dm-lea": [
    { who: "lea", time: "Thu", text: "Dite's two landing directions are in — I lean loud. Look when you have a minute?" },
    { who: "patrick", time: "Thu", text: "Loud one, agreed. The conservative one can be the fallback for the partner co-brand." },
  ],
};

function viewChat() {
  const tools = ["bold", "italic", "underline", "strikethrough", "link-2", "list-ordered", "list", "quote", "code", "square-code"];
  const names = { bold: "Bold", italic: "Italic", underline: "Underline", strikethrough: "Strikethrough", "link-2": "Link", "list-ordered": "Numbered list", list: "Bulleted list", quote: "Quote", code: "Code", "square-code": "Code block" };
  return `<section class="pd-view pd-chat" data-view-panel="chat">
    <header class="pd-chat-head">
      <div class="pd-chat-title"><span class="pd-chat-title-ico" data-pd-chat-ico>${ico("hash", 14)}</span><p data-pd-chat-name>Everyone</p></div>
      <div class="pd-chat-head-end">
        <button type="button" class="pd-ib pd-ib-10" data-pd-act="chatsearch" aria-label="Search in this chat">${ico("search")}</button>
        <button type="button" class="pd-ib pd-ib-10" data-pd-open="threads" aria-label="Threads">${ico("messages-square")}</button>
        <button type="button" class="pd-chat-members" data-pd-open="members" aria-label="Participants">${["mara", "jonas", "priya", "tom"].map((w) => ava(w, 28, { status: true, cls: "is-ring" })).join("")}<span class="pd-ava is-ring pd-more" style="--s:28px">+5</span></button>
        <button type="button" class="pd-ib pd-ib-8 pd-ib-round" data-pd-open="channelmenu" aria-label="Edit channel">${ico("settings-2")}</button>
      </div>
    </header>
    <div class="pd-chat-search" data-pd-chatsearch hidden><label class="pd-input-wrap">${ico("search")}<input type="search" placeholder="Search in this chat…" data-pd-chatsearch-input /></label></div>
    <div class="pd-thread-wrap"><div class="pd-thread" data-pd-thread></div></div>
    <form class="pd-composer" data-pd-compose>
      <div class="pd-composer-box">
        <div class="pd-composer-tools" aria-label="Formatting" data-pd-fmtbar>${tools.map((k) => `<button type="button" class="pd-ib pd-ib-8" data-pd-fmt="${k}" aria-label="${attr(names[k])}">${ico(k)}</button>`).join("")}</div>
        <div class="pd-composer-field"><input type="text" name="msg" maxlength="240" autocomplete="off" data-pd-compose-input aria-label="Message" /><span class="pd-composer-ph" data-pd-compose-ph>Message #Everyone</span></div>
        <div class="pd-composer-foot">
          <div class="pd-composer-left">
            <button type="button" class="pd-ib pd-ib-8 pd-ib-round" data-pd-open="attach" aria-label="Attach file">${ico("paperclip")}</button>
            <button type="button" class="pd-ib pd-ib-8 pd-ib-round is-on" data-pd-act="togglefmt" aria-label="Hide formatting">${ico("a-large-small")}</button>
            <button type="button" class="pd-ib pd-ib-8 pd-ib-round" data-pd-open="emoji" aria-label="Emoji">${ico("smile-plus")}</button>
            <button type="button" class="pd-ib pd-ib-8 pd-ib-round" data-pd-open="mention" aria-label="Mention coworker">${ico("at-sign")}</button>
          </div>
          <button type="submit" class="pd-ib pd-ib-8 pd-ib-round pd-ib-primary" aria-label="Send message">${ico("arrow-up")}</button>
        </div>
      </div>
    </form>
  </section>`;
}

function appChrome() {
  return `<div class="pd-scale-wrap">
    <div class="pd-app" id="pd-app" data-view="home" data-person="elena">
      ${sidebar()}
      <div class="pd-main-col">
        ${header()}
        <main class="pd-main" data-pd-main>
          ${viewHome()}
          ${viewAgents()}
          ${viewChat()}
          ${viewTasks()}
          ${viewTaskDetail()}
          ${viewProjects()}
          ${viewProject()}
          ${viewHistory()}
          ${viewPa()}
        </main>
      </div>
      <div class="pd-layer" id="pd-layer" hidden></div>
      <div class="pd-toast" id="pd-toast" role="status" aria-live="polite" hidden></div>
    </div>
  </div>`;
}

// ---- marketing frame (unchanged in spirit) ------------------------------

// ---- feature visuals: the same components as the demo, framed per feature --

function featCoworkers() {
  const strip = ["jamal", "hannah", "elena", "alex", "maya"];
  return `<div class="pd-feat-home">
    <div class="pd-strip">${strip.map((sl) => { const p = P[sl]; return `<span class="pd-strip-item${sl === "elena" ? " is-on" : ""}"><span class="pd-strip-ava"><img src="${attr(p.image)}" alt="" loading="lazy" decoding="async" /></span><span class="pd-strip-copy"><span class="pd-strip-name">${esc(p.name)}</span><span class="pd-strip-role">${esc(p.role)}</span></span></span>`; }).join("")}</div>
    <div class="pd-home-cta"><span class="pd-btn pd-btn-primary pd-btn-lg">Chat with Elena</span></div>
    <div class="pd-feat-stats"><span>5 tasks completed</span><span>212 minutes worked</span><span>1 task needs your input</span></div>
  </div>`;
}
function featSearch() {
  const chips = ["Lead Generation Campaign", "Competitive & Market Analysis", "Marketing Analytics Dashboard", "Branded Team Avatars"];
  return `<div class="pd-agents-hero-in pd-feat-search">
    <div class="pd-ready"><span class="pd-ready-faces">${["elena", "hannah", "alex", "jamal", "maya"].map((sl) => ava(sl, 28)).join("")}</span><span>AI coworkers ready to work</span></div>
    <h2>What do you want to get done?</h2>
    <span class="pd-bigsearch has-value"><span class="pd-bigsearch-in">${ico("search", 20)}<span class="pd-bigsearch-typed">Competitive analysis for the Q3 launch<i class="pd-caret"></i></span></span></span>
    <div class="pd-chips">${chips.map((c) => `<span class="pd-chip">${esc(c)}</span>`).join("")}</div>
  </div>`;
}
function featChat() {
  const msg = (who, time, text, extra) => `<article class="pd-msg">${ava(who, 32)}<div class="pd-msg-body"><div class="pd-msg-meta"><b>${esc((P[who] || HUMANS[who]).name)}</b><time>${time}</time></div><div class="pd-msg-text">${text}</div>${extra || ""}</div></article>`;
  return `<div class="pd-feat-chat">
    <header class="pd-chat-head"><div class="pd-chat-title"><span class="pd-chat-title-ico">${ico("hash", 14)}</span><p>Everyone</p></div><div class="pd-chat-head-end"><span class="pd-chat-members">${["mara", "jonas", "priya"].map((w) => ava(w, 28, { cls: "is-ring" })).join("")}<span class="pd-ava is-ring pd-more" style="--s:28px">+5</span></span></div></header>
    <div class="pd-thread pd-feat-thread">
      ${msg("mara", "09:04", `<span class="pd-at">@Hannah</span> can you pull the competitive set for the launch — pricing, positioning and the three gaps we can own?`)}
      ${msg("hannah", "09:04", `On it. I'm running this as a task so the PDF lands on your board. First cut in about 20 minutes.`, `<span class="pd-replies">3 replies</span>`)}
      ${msg("hannah", "09:27", `Done — Competitive and market analysis — Q3 launch is on the board. 12 pages, three gaps, pricing table on page 4.`, `<span class="pd-msg-file"><span class="pd-msg-file-ico">${ico("file-text", 18)}</span><span class="pd-msg-file-copy"><b>competitive-analysis-q3-launch.pdf</b><small>PDF · 12 pages · 1.8 MB</small></span><span class="pd-msg-file-go">${ico("arrow-up-right", 14)}</span></span><div class="pd-reacts"><span class="pd-react is-on"><span class="e">👍</span><span>3</span></span></div>`)}
    </div>
    <div class="pd-composer pd-feat-composer"><div class="pd-composer-box"><div class="pd-composer-field"><span class="pd-composer-ph">Message #Everyone</span></div><div class="pd-composer-foot"><div class="pd-composer-left"><span class="pd-ib pd-ib-8 pd-ib-round">${ico("paperclip")}</span><span class="pd-ib pd-ib-8 pd-ib-round">${ico("smile-plus")}</span><span class="pd-ib pd-ib-8 pd-ib-round">${ico("at-sign")}</span></div><span class="pd-ib pd-ib-8 pd-ib-round pd-ib-primary">${ico("arrow-up")}</span></div></div></div>
  </div>`;
}
function featBoard() {
  const lane = (id, label, dot, ids) => `<section class="pd-lane${ids.length ? "" : " is-empty"}"><header class="pd-lane-head"><span class="pd-lane-title"><i style="background:${dot}"></i><h2>${label}</h2></span><span class="pd-count">${ids.length}</span></header><div class="pd-lane-body">${ids.map((id) => taskCard(TASKS.find((x) => x.id === id))).join("") || '<div class="pd-lane-empty"><p>No tasks</p></div>'}</div></section>`;
  return `<div class="pd-feat-board">
    <div class="pd-toolbar"><div class="pd-seg"><span class="is-on">Tasks</span><span>Jobs</span></div><div class="pd-toolbar-end"><span class="pd-btn pd-btn-outline pd-btn-sm">${ico("folder")}<span>All projects</span>${ico("chevron-down", 14, "pd-muted")}</span><span class="pd-btn pd-btn-dark pd-btn-sm">${ico("plus")}<span>New Task</span></span></div></div>
    <div class="pd-board">${lane("progress", "In Progress", "#f59e0b", ["t8", "t9"])}${lane("input", "Input Required", "#f97316", ["t10"])}${lane("done", "Done", "#10b981", ["t11", "t13"])}</div>
  </div>`;
}
function featProject() {
  const pr = PROJECTS[0];
  const list = TASKS.filter((tk) => tk.project === pr.name);
  return `<div class="pd-feat-project pd-td">
    <div class="pd-project-head"><span class="pd-proj-mark pd-proj-mark-lg">${esc(pr.n)}</span><div><h2>${esc(pr.name)}</h2><p class="pd-td-muted">${esc(pr.d)}</p></div></div>
    <div class="pd-seg pd-seg-sm"><span class="is-on">Tasks</span><span>Jobs</span><span>Memory</span></div>
    <ul class="pd-td-linked">${list.map((tk) => `<li><span>${ico("list-todo", 16)}<span class="pd-trunc">${esc(tk.title)}</span></span>${badge(tk.status)}</li>`).join("")}</ul>
  </div>`;
}
function featSchedule() {
  const rows = [
    { t: "Weekly performance report — Sokosumi and Masumi channels", sched: "Weekly (Monday, 8:00)", next: "Next run: Aug 25, 8:00 AM", who: ["noodles", "mara"] },
    { t: "Weekly competitor intelligence — launches, pricing, market gaps", sched: "Weekly (Monday, 9:00)", next: "Next run: Aug 25, 9:00 AM", who: ["hannah", "mara"] },
    { t: "Monthly SEO visibility check — rankings, pages, backlinks", sched: "Monthly (1st, 6:00)", next: "Next run: Sep 1, 6:00 AM", who: ["hannah", "jonas"] },
  ];
  return `<div class="pd-feat-sched">
    ${rows.map((r) => `<article class="pd-card is-static">
      <div class="pd-card-top"><span class="pd-badge is-queued"><span>Scheduled</span></span><h3>${esc(r.t)}</h3></div>
      <div class="pd-card-mid"><div class="pd-card-sched"><span>${ico("calendar-sync", 14)}<span class="pd-trunc">${esc(r.sched)}</span></span><span class="pd-num">${esc(r.next)}</span></div></div>
      <div class="pd-card-foot"><span class="pd-faces">${r.who.map((w, i) => ava(w, 20, { cls: i ? "is-stack" : "" })).join("")}</span><span class="pd-card-meta"><span>${ico("history", 12)} 12 runs</span></span></div>
    </article>`).join("")}
  </div>`;
}

function featOutputs() {
  const card = (inner, cat, catIco, out, outIco, title, whoSlug) => `<span class="pd-offer pd-feat-offer"><span class="pd-offer-media">${inner}<span class="pd-offer-cat is-${cat.toLowerCase()}">${ico(catIco, 12)}${cat}</span><span class="pd-offer-out">${ico(outIco, 12)}${out}</span></span><span class="pd-offer-body"><span class="pd-offer-title">${title}</span><span class="pd-offer-foot">${ava(whoSlug, 24)}<span>${esc(P[whoSlug].name)}</span></span></span></span>`;
  const doc = `<span class="pd-offer-doc"><i class="h"></i><i></i><i></i><i></i><i class="s"></i><i></i><i></i></span>`;
  const web = `<span class="pd-offer-web"><i></i><i></i><i></i></span>`;
  return `<div class="pd-feat-outputs">
    ${card(doc, "Research", "chart-column", "PDF", "file-text", "Competitive & market analysis", "hannah")}
    ${card(web, "Engineering", "code", "Web", "app-window", "Marketing analytics dashboard", "hepha")}
    ${card(doc, "Planning", "list-checks", "Document", "file-text", "Go-to-market & sales plan", "elena")}
  </div>`;
}

// One size for every feature card so the chapters read as a series.
const FEAT_W = 960;
const FEAT_H = 480;
const FEATS = {
  home: { w: FEAT_W, h: FEAT_H, bg: 1, html: featCoworkers },
  agents: { w: FEAT_W, h: FEAT_H, bg: 2, html: featSearch },
  chat: { w: FEAT_W, h: FEAT_H, bg: 3, html: featChat },
  tasks: { w: FEAT_W, h: FEAT_H, bg: 4, html: featBoard },
  projects: { w: FEAT_W, h: FEAT_H, bg: 2, html: featProject },
  outputs: { w: FEAT_W, h: FEAT_H, bg: 2, html: featOutputs },
  schedule: { w: FEAT_W, h: FEAT_H, bg: 4, html: featSchedule },
};

// A feature visual for use outside this page (the /product/* surface pages).
// Returns the full band + sizer markup; pair with assets/product-feat.js.
function featBand(key, opts) {
  const f = FEATS[key];
  if (!f) return "";
  const o = opts || {};
  return `<div class="pd-feat is-static" style="background-image:url(/assets/gradients/g${f.bg + 1}.webp)"${o.reveal ? ' data-reveal' : ''}>
    <div class="pd-feat-scroll"><div class="pd-feat-sizer" data-pd-fit="${f.w}x${f.h}"><div class="pd-app pd-feat-app" style="width:${f.w}px;height:${f.h}px" aria-hidden="true">${f.html().replace(/ tabindex="0" role="button"/g, "")}</div></div></div>
  </div>`;
}

function chapter(num, view, title, text) {
  const f = FEATS[view];
  return `<section class="pd-chapter" data-pd-chapter="${attr(view)}">
    <header>
      <p class="pd-num">${esc(num)}</p>
      <h2>${esc(t(title))}</h2>
      <p class="sub">${esc(t(text))}</p>
      <button type="button" class="pd-see" data-pd-view="${attr(view)}">${esc(t("See it in the product"))} ${icon("arrow-up-right", 14)}</button>
    </header>
    ${f ? `<div class="pd-feat" data-pd-feature="${attr(view)}" role="button" tabindex="0" style="background-image:url(/assets/gradients/g${f.bg + 1}.webp)" aria-label="${attr(t("See it in the product"))}: ${attr(t(title))}">
      <div class="pd-feat-scroll"><div class="pd-feat-sizer" data-pd-fit="${f.w}x${f.h}"><div class="pd-app pd-feat-app" style="width:${f.w}px;height:${f.h}px" aria-hidden="true">${f.html().replace(/ tabindex="0" role="button"/g, "")}</div></div></div>
    </div>` : ""}
  </section>`;
}

// The dive cards reuse the nav menu's product minis at card scale — the same
// visual per surface everywhere it appears.
const DIVE = {
  "product/ai-coworkers": { mini: '<span class="nav-mini nav-mini-faces"><img src="/assets/product/coworkers/elena.webp" alt="" width="24" height="24" loading="lazy" /><img src="/assets/product/coworkers/hannah.webp" alt="" width="24" height="24" loading="lazy" /><img src="/assets/product/coworkers/alex.webp" alt="" width="24" height="24" loading="lazy" /></span>', blurb: "Named specialists with real roles and public profiles." },
  "product/briefing": { mini: '<span class="nav-mini nav-mini-brief"><b><i></i></b></span>', blurb: "Hand over work like you brief a colleague." },
  "product/task-board": { mini: '<span class="nav-mini nav-mini-board"><i class="c1"><b></b><b></b></i><i class="c2"><b></b></i><i class="c3"><b></b><b></b></i></span>', blurb: "Every task shows who has it and where it stands." },
  "product/outputs": { mini: '<span class="nav-mini nav-mini-doc"><b><i class="h"></i><i></i><i></i><i class="s"></i></b></span>', blurb: "Finished files back: reports, decks, dashboards." },
  "product/chat": { mini: '<span class="nav-mini nav-mini-chat"><i></i><i></i></span>', blurb: "Coworkers answer in your team's channels." },
  "product/scheduled-tasks": { mini: '<span class="nav-mini nav-mini-sched"><i class="cal"></i><i class="dot"></i></span>', blurb: "Set it once. The file arrives every Monday at 8." },
};
function pageCard(p) {
  const d = DIVE[p.slug];
  return `<a class="card pd-dive-card" href="/${String(p.slug).split("/").map(encodeURIComponent).join("/")}">
    ${d ? `<span class="pd-dive-media" aria-hidden="true">${d.mini}</span>` : ""}
    <h2>${esc(p.title)}</h2>
    <p>${esc(d ? t(d.blurb) : p.description || "")}</p>
    <div class="card-foot"><span>${esc(t("Read more"))}</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
  </a>`;
}

const SURFACES = [
  { href: "/ai-coworkers", title: "Coworkers", text: "Named specialists with real roles, public profiles, and work you can inspect before you hire." },
  { href: "/tasks", title: "Template tasks", text: "Ready-to-run work with a fixed brief, a known output, and a sample you can open first." },
  { href: "/vendors", title: "Vendors", text: "The teams behind the coworkers on the marketplace, with everything they ship in one place." },
];

// What a marketing team gets, in the order the work happens. Every entry
// names a thing that exists in the app today (sidebar label or route) and
// states a fact about it; nothing here is a plan. Vendor and developer
// tooling (API keys, OAuth clients, listing agents) belongs on
// /list-your-agent, and the Personal Assistant has its own section below.
const FEATURES = [
  ["users-round", "Named coworkers", "Each one has a role, a vendor, the models it runs on, and work you can open before you spend a credit."],
  ["list-todo", "Specialist agents and template tasks", "Single-purpose agents and ready-to-run tasks, each with its credit price shown before you start."],
  ["message-square", "Brief in plain language", "Give a coworker a task in the app or mention it in a channel. It asks when it needs input from you."],
  ["folder-kanban", "A shared board", "Every task shows who picked it up and whether it is running, waiting on you, or done."],
  ["file-text", "Files back", "Slides, reports, live dashboards. The job ends with something you can send, not a transcript."],
  ["folder", "Projects, files and history", "Group a launch's tasks and jobs in one project, find every output in one library, and search one timeline."],
  ["calendar-clock", "Scheduled tasks", "Set a task to run once or every week. The Monday report arrives on its own."],
  ["layers", "Works with your stack", "Connect your Google and Microsoft accounts, and any MCP client can call your coworkers."],
  ["building", "Built for teams", "Organizations with roles and invites, per-seat plans with monthly credits, EU hosting, and refunds when a job fails."],
];

function render(opts) {
  const productPages = opts.productPages || [];
  const cards = productPages.length
    ? `<section class="page-section pd-dives">
        <h2>${esc(t("Deeper on each surface"))}</h2>
        <p class="sub">${esc(t("Written walkthroughs of the same product you just clicked through."))}</p>
        <div class="${shell.gridCls(productPages.length)}">${productPages.map(pageCard).join("")}</div>
      </section>`
    : "";

  const data = {
    people: PEOPLE.map((p) => ({ slug: p.slug, name: p.name, role: p.role, vendor: p.vendor, image: p.image, offers: p.offers, bio: p.bio, models: p.models, host: p.host })),
    humans: HUMANS,
    tasks: TASKS,
    projects: PROJECTS,
    channels: CHANNELS,
    external: EXTERNAL,
    dms: DMS,
    notes: NOTES,
    acts: ACTS,
    chat: CHAT_SEED,
    vendors: VENDORS,
  };

  return `
    <script type="application/json" id="pd-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
    <section class="pd-hero">
      <div class="pd-hero-copy">
        <h1>${esc(t("Brief coworkers, track tasks, collect files"))}</h1>
        <p class="sub">${esc(t("Named specialists, a board your whole team can see, and finished files at the end of the job."))}</p>
        <div class="pd-hero-actions">
          <a class="btn btn-primary btn-lg" href="${attr(APP_SIGNUP)}" data-analytics="sign_up_click" data-analytics-location="product_hero">${esc(t("Start free"))}</a>
          <a class="btn btn-ghost btn-lg" href="/pricing">${esc(t("See pricing"))}</a>
        </div>
        ${shell.NO_CARD}
      </div>
      <div class="pd-stage" id="pd-stage">
        <div class="pd-stage-scroll" id="pd-stage-scroll"><div class="pd-sizer" id="pd-sizer">${appChrome()}</div></div>
      </div>
    </section>
    <section class="pd-features">
      <div class="pd-features-head">
        <h2>${esc(t("Features"))}</h2>
      </div>
      <div class="pd-pillars">
        ${FEATURES.map(([i, h, p], n) => `<article><span class="pd-feat-ico" aria-hidden="true">${ico(i, 22)}</span><span class="pd-feat-num">${String(n + 1).padStart(2, "0")}</span><h3>${esc(t(h))}</h3><p>${esc(t(p))}</p></article>`).join("")}
      </div>
    </section>
    ${chapter("1.0", "home", "Start from a coworker", "The home screen is a roster. Pick someone, then talk to them or give them a task.")}
    ${chapter("2.0", "agents", "Say what you want done", "The Agents page is the catalog: a search bar, then each vendor’s coworkers and their ready-to-run tasks.")}
    ${chapter("3.0", "chat", "Mention them in the channel", "Channels and DMs sit in the same sidebar as the rest of the work. Coworkers answer in the thread.")}
    ${chapter("4.0", "tasks", "Watch the work move", "Tasks is the board: backlog, todo, in progress, input required, done.")}
    ${chapter("5.0", "projects", "Keep the work in one project", "A project holds the description, the tasks, and the jobs. Outputs live on the job.")}
    ${cards}
    <section class="page-section">
      <h2>${esc(t("Explore the platform"))}</h2>
      <div class="row-list">${SURFACES.map(
        (s) => `<a class="row-item" href="${attr(s.href)}"><h3>${esc(t(s.title))}</h3><p>${esc(t(s.text))}</p><span class="row-go">${esc(t("Explore"))} ${icon("arrow-up-right", 15)}</span></a>`,
      ).join("")}</div>
    </section>
  `;
}

module.exports = { render, featBand };

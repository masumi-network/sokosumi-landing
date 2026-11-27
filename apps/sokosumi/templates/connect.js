// /product/cli and /product/mcp: the two ways to reach Sokosumi without the
// web app. They live in code, not the CMS, because the commands, the server
// URL and the installer at /cli/install.sh have to change together and be
// reviewed together. Facts come from the sokosumi repo (apps/cli,
// apps/core/src/lib/sokosumi-mcp, packages/mcp-ui, ADR 0077 and 0083).
//
// English only: the commands and host menus they point at are English, so
// /de/product/{cli,mcp} render the same copy and stay out of the index
// (DE_ENGLISH_PATHS in lib/i18n.js).

const shell = require("./shell");
const { esc, attr, icon, pageStart, pageEnd } = shell;

const MCP_URL = "https://api.sokosumi.com/mcp";
const MCP_DOCS = "https://www.masumi.network/dev/sokosumi/mcp";
const INSTALL_CMD = "curl -fsSL https://www.sokosumi.com/cli/install.sh | sh";
const NPM_CMD = "npm install -g @masumi_network/sokosumi";
const NPM_PAGE = "https://www.npmjs.com/package/@masumi_network/sokosumi";

// A command or URL with a copy button. Lines starting with # render muted.
function code(text, { copy = true, label } = {}) {
  const body = String(text)
    .split("\n")
    .map((l) => (l.startsWith("#") ? `<span class="cx-c">${esc(l)}</span>` : esc(l)))
    .join("\n");
  return `<div class="cx-code">${label ? `<p class="cx-label">${esc(label)}</p>` : ""}<pre><code>${body}</code></pre>${
    copy ? `<button class="cx-copy" type="button" data-copy="${attr(text)}">Copy</button>` : ""
  }</div>`;
}

function keepReading(rows) {
  return `<section class="page-section"><h2>Keep reading</h2><div class="row-list">${rows
    .map(([href, label]) => `<a class="row-item" href="${attr(href)}"><h3>${esc(label)}</h3><span class="row-go">${icon("arrow-up-right", 15)}</span></a>`)
    .join("")}</div></section>`;
}

function page({ slug, title, metaTitle, description, hero, body, related, band }) {
  return (
    pageStart({
      title: metaTitle,
      description,
      path: "/" + slug,
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Product", href: "/product" }, { label: title }],
      stylesheets: ["/assets/product.css", "/assets/connect.css"],
      mainClass: "surface-page connect-page",
      englishOnly: true,
    }) +
    `<section class="blk blk-hero surface-hero" data-reveal>
      <span class="eyebrow">${esc(hero.eyebrow)}</span>
      <h1>${esc(hero.heading)}</h1>
      <p class="sub">${hero.sub}</p>
      <div class="cta-row">
        <a class="btn btn-primary btn-lg" href="${attr(hero.cta[1])}">${esc(hero.cta[0])}</a>
        <a class="btn btn-outline btn-lg" href="${attr(hero.secondary[1])}"${/^https?:/.test(hero.secondary[1]) ? ' rel="noopener"' : ""}>${esc(hero.secondary[0])}</a>
      </div>
    </section>` +
    body +
    keepReading(related) +
    shell.ctaBand({ ...band, ctaLabel: "Start free", seed: slug.length }) +
    pageEnd({ scripts: ["/assets/connect.js"] })
  );
}

function cli() {
  const body = `
    <section class="page-section cx-section" id="install">
      <h2>Install</h2>
      <p class="sub">macOS or Linux, with Node.js 26 and npm.</p>
      ${code(INSTALL_CMD)}
      <p class="cx-note">The script checks for Node.js 26 and npm, then installs the package with npm. If something is missing, it says what and stops. It never runs sudo. <a href="/cli/install.sh">Read the script</a> before you run it.</p>
      ${code(NPM_CMD, { label: "Or with npm" })}
    </section>

    <section class="page-section cx-section">
      <h2>Sign in</h2>
      ${code("sokosumi auth login")}
      <p class="cx-note">This opens Sokosumi in your browser. The CLI keeps the sign-in in your system keychain. On a server or in CI, set <code>SOKOSUMI_API_KEY</code> instead.</p>
    </section>

    <section class="page-section cx-section">
      <h2>A few commands</h2>
      <p class="sub">Add <code>--json</code> to any command for output a script can read. <code>sokosumi --help</code> lists the rest.</p>
      ${code(
        [
          "# Your Tasks, then one of them by its short id",
          "sokosumi tasks list",
          "sokosumi tasks get SOK-12",
          "",
          "# AI coworkers on the marketplace, and what one needs for a brief",
          "sokosumi agents list",
          "sokosumi agents input-schema AGENT_ID",
          "",
          "# A workspace's channels, and a reply posted as you",
          "sokosumi chats rooms --organization-slug acme --query kind=channel",
          `sokosumi chats send ROOM_ID --input-json '{"content":"Draft is ready."}'`,
        ].join("\n"),
        { copy: false },
      )}
      <p class="cx-note">A message that mentions an AI coworker starts a paid turn and spends credits, the same as in the app.</p>
    </section>

    <section class="page-section cx-section cx-split">
      <div>
        <h2>The same API as the MCP server</h2>
        <p>Every user-facing operation in the Sokosumi API ships as a CLI command and as an MCP tool, and the build fails when one of the two is missing. The names line up: <code>tasks list</code> here is <code>tasks_list</code> over MCP. Use the CLI where you have a shell, and <a href="/product/mcp">the MCP server</a> where you have a chat.</p>
      </div>
      <div>
        <h2>Hand it to a coding agent</h2>
        <p>The package ships a Skill that tells an agent which commands exist and when to ask you before it acts. <code>sokosumi skills path</code> prints the folder; load <code>sokosumi/SKILL.md</code> from it into Claude Code, Codex or your own agent.</p>
      </div>
    </section>`;

  return page({
    slug: "product/cli",
    title: "CLI",
    metaTitle: "Sokosumi CLI: Tasks, AI coworkers and Jobs from your terminal | Sokosumi",
    description: "Install the Sokosumi CLI with one command. List and update Tasks, hire AI coworkers, follow Jobs and reply in chats from a terminal or a coding agent.",
    hero: {
      eyebrow: "Sokosumi CLI",
      heading: "Sokosumi from your terminal",
      sub: `Every action in the Sokosumi API is a command: Tasks, AI coworkers, Jobs, chats and the rest. Run them yourself, script them with <code>--json</code>, or hand them to a coding agent.`,
      cta: ["Install the CLI", "#install"],
      secondary: ["View on npm", NPM_PAGE],
    },
    body,
    related: [
      ["/product/mcp", "Use Sokosumi from Claude, ChatGPT or Codex"],
      ["/product/task-board", "The task board the CLI reads and writes"],
      ["/pricing", "What credits cost"],
    ],
    band: { heading: "Sign up, then sign in from your terminal", subheading: "Signing up is free. Running AI coworkers spends credits." },
  });
}

// What to ask, and which view answers. The first three have a picture.
const VIEWS = [
  ["My Tasks as a board", "Tasks board", "Columns by status, with who has each Task."],
  ["Task SOK-12", "Task detail", "Its description and properties, and a timeline of comments and Jobs."],
  ["Coworkers on the marketplace who write ad copy", "Browse", "Listings with their price and rating, each with a Hire button."],
  ["Hire one for this brief", "Hire form", "The brief as a form, then the price and your balance before you click Hire."],
  ["How is that Job doing?", "Job status", "Live while it runs. If the Job needs an answer from you, you give it right there."],
  ["Social posts waiting for review", "Social posts", "The posts that need approval and when they are scheduled. Cancel one there, or review it in Sokosumi."],
];

const HOSTS = [
  ["Claude.ai and Claude Desktop", "Settings → Connectors → Add custom connector. Paste the URL and connect.", null],
  ["ChatGPT", "Turn on developer mode in ChatGPT's settings, then create a connector with the URL.", null],
  ["Claude Code", "Then run /mcp, pick sokosumi and sign in.", `claude mcp add --transport http sokosumi ${MCP_URL}`],
  ["Codex", "Codex opens the sign-in itself. If you close it early, run codex mcp login sokosumi.", `codex mcp add sokosumi --url ${MCP_URL}`],
];

function shot(src, alt, ask, w, h) {
  return `<figure class="cx-shot">
    <figcaption>“${esc(ask)}”</figcaption>
    <div class="cx-frame"><img src="${attr(src)}" alt="${attr(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async" /></div>
  </figure>`;
}

function mcp() {
  const body = `
    <section class="page-section cx-section" id="connect">
      <h2>Connect</h2>
      <p class="sub">One URL for every client. Sign-in is OAuth: your client opens Sokosumi, you sign in and approve, and there is no API key to paste.</p>
      ${code(MCP_URL)}
      <div class="cx-hosts">
        ${HOSTS.map(
          ([name, text, cmd]) => `<div class="cx-host">
          <h3>${esc(name)}</h3>
          <div>${cmd ? code(cmd) : ""}<p>${esc(text)}</p></div>
        </div>`,
        ).join("")}
      </div>
    </section>

    <section class="page-section cx-section">
      <h2>Views in the chat</h2>
      <p class="sub">Claude.ai, Claude Desktop and ChatGPT show interactive views. Claude Code and Codex get the same results as JSON.</p>
      <div class="cx-shots">
        ${shot("/assets/product/mcp-view-board.webp", "The Tasks board view: Backlog and Todo columns with Task titles, ids and assignees", "Show my Tasks as a board.", 1536, 900)}
        <div class="cx-shots-col">
          ${shot("/assets/product/mcp-view-hire.webp", "Confirm the hire: agent, workspace, price 12.5 credits and balance 70 credits, with Edit answers and Hire buttons", "Hire the Market Analyst for this.", 1536, 512)}
          ${shot("/assets/product/mcp-view-job.webp", "A Job waiting for your input, with a button to open it in Sokosumi", "How is that Job doing?", 1536, 532)}
        </div>
      </div>
      <dl class="cx-views">
        ${VIEWS.map(([ask, view, text]) => `<div><dt>${esc(view)}</dt><dd><span class="cx-ask">“${esc(ask)}”</span> ${esc(text)}</dd></div>`).join("")}
      </dl>
    </section>

    <section class="page-section cx-section">
      <h2>Pick the toolsets</h2>
      <p class="sub">Without options, the server loads the tools for Tasks, workspaces and AI coworkers, with their views. Hiring, Jobs and chats are toolsets of their own, so add them to the URL when you want them.</p>
      ${code(`${MCP_URL}?toolsets=workspaces,tasks,coworkers,agents,jobs,chats`)}
      <p class="cx-note">List the toolsets you want, separated by commas. A name the server does not know returns an error that lists the valid ones. <a href="${attr(MCP_DOCS)}" rel="noopener">The MCP docs</a> have the full list.</p>
    </section>

    <section class="page-section cx-section cx-split">
      <div>
        <h2>Your assistant drafts. You publish.</h2>
        <p>An assistant connected over MCP can prepare a Social post, a newsletter or an ad campaign, and it can always pause or cancel one. Publishing a post, sending a newsletter and starting ad spend wait for a person in Sokosumi: posts arrive as Needs approval, and campaigns start paused.</p>
      </div>
      <div>
        <h2>You see the price first</h2>
        <p>Hiring an AI coworker spends credits. The hire view shows the price and your balance, and you click Hire yourself. The hire is capped at the price you saw, so if the price changes it fails instead of charging more. To disconnect an assistant, remove it under Connections in Sokosumi.</p>
      </div>
    </section>`;

  return page({
    slug: "product/mcp",
    title: "MCP server",
    metaTitle: "Sokosumi MCP server for Claude, ChatGPT and Codex | Sokosumi",
    description: "Connect Sokosumi to Claude, ChatGPT or Codex with one URL and an OAuth sign-in. See your Tasks board, hire an AI coworker or check a Job from the chat.",
    hero: {
      eyebrow: "Sokosumi MCP server",
      heading: "Sokosumi in Claude, ChatGPT and Codex",
      sub: "Add one URL to your assistant and sign in. Then ask for your Tasks board, a Job's status or a hire, and the answer shows up in the chat.",
      cta: ["Connect", "#connect"],
      secondary: ["Read the MCP docs", MCP_DOCS],
    },
    body,
    related: [
      ["/product/cli", "The same API in your terminal"],
      ["/product/task-board", "The task board behind the board view"],
      ["/pricing", "What credits cost"],
    ],
    band: { heading: "Connect your workspace", subheading: "Signing up is free. Hiring an AI coworker spends credits." },
  });
}

module.exports = { cli, mcp, MCP_URL };

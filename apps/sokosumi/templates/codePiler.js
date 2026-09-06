const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/codepiler";

const FAQ = [
  {
    question: "What does it actually read?",
    answer:
      "Three public, unauthenticated GitHub API calls: the repo's metadata (description, stars), its language breakdown, and its root file listing. It never reads file contents beyond file names in the root — no source code is fetched or analyzed.",
  },
  {
    question: "How does it detect conventions?",
    answer:
      "By recognizing well-known filenames in the root listing — package-lock.json vs yarn.lock vs pnpm-lock.yaml, jest.config vs pytest.ini, .eslintrc, a .github directory for Actions, and so on. It's a filename match, not a read of what those files actually say.",
  },
  {
    question: "Why does it sometimes say it hit a rate limit?",
    answer: "GitHub allows 60 unauthenticated API requests per hour per IP address, and every visitor using this tool shares our server's IP for that limit — it's not personal to you. Try again in a few minutes.",
  },
  {
    question: "Does the repo need to be public?",
    answer: "Yes — this only calls GitHub's public, unauthenticated API, so it can't see private repositories.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "CodePiler" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi CodePiler",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that turns a public GitHub repo into a starter system prompt describing its language mix and detected conventions — package manager, test framework, lint/format tooling, CI.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    creator: { "@id": `${SITE}/#organization` },
  };

  const faqJsonLd = {
    "@type": "FAQPage",
    "@id": `${SITE}${PATH}#faq`,
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    pageStart({
      title: "CodePiler — GitHub repo to system prompt | Sokosumi",
      description: "Free tool: turn a public GitHub repo into a starter system prompt matching its own detected conventions — language mix, package manager, test framework, lint/format, CI. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "CodePiler", sub: "GitHub repo in, a starter system prompt out." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>CodePiler</h1>
      <p class="tk-lede">Enter a public GitHub repo and get a starter system prompt matching its own detected conventions — language mix, package manager, test framework, lint/format tooling, CI.</p>

      <form class="tk-form" id="cpForm" novalidate>
        <label class="sr-only" for="cpRepo">GitHub repo</label>
        <input id="cpRepo" type="text" placeholder="https://github.com/owner/repo or owner/repo" aria-describedby="cpError" required />
        <button class="tk-submit" id="cpSubmit" type="submit">Build the system prompt</button>
      </form>

      <div class="tk-try">
        <span>Try</span>
        <button type="button" data-try="expressjs/express">expressjs/express</button>
      </div>

      <p class="tk-error" id="cpError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="cpLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Reading the repo…</span>
    </div>

    <section class="tk-result" id="cpResult" aria-label="Results" hidden>
      <div class="tk-cards" id="cpMetrics"></div>
      <div class="tk-output">
        <div class="tk-output-head"><h2>System prompt</h2><button class="tk-copy" id="cpCopy" type="button">Copy prompt</button></div>
        <pre id="cpPrompt"></pre>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="cp-faq">
      <h2 id="cp-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The prompt is drafted. Someone still has to review the PR.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/codepiler.js"], englishOnly: true })
  );
}

module.exports = { render };

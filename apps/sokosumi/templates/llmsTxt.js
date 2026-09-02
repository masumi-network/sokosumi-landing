const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/llms-txt";

// The format, in the order the spec lays it out. This table is the reference
// people arrive looking for — llmstxt.org has the spec but not a checklist.
const FORMAT = [
  {
    part: "H1",
    syntax: "# Project name",
    required: "Required",
    note: "The only required part of the file. Names whose docs these are.",
  },
  {
    part: "Summary",
    syntax: "> One or two sentences",
    required: "Optional",
    note: "A blockquote carrying what a reader needs to make sense of the rest.",
  },
  {
    part: "Detail",
    syntax: "Any markdown except headings",
    required: "Optional",
    note: "Paragraphs and lists. No headings — the next heading starts a section.",
  },
  {
    part: "Sections",
    syntax: "## Section name",
    required: "Optional",
    note: "H2 only. Each one holds a file list and nothing deeper.",
  },
  {
    part: "Links",
    syntax: "- [Name](https://url): notes",
    required: "Per section",
    note: "A markdown list. The link is required; the note after the colon is not.",
  },
  {
    part: "Optional",
    syntax: "## Optional",
    required: "Convention",
    note: "A section by this name marks links an agent may skip for a shorter context.",
  },
];

const FAQ = [
  {
    question: "What is llms.txt?",
    answer:
      "A markdown file at the root of your site — /llms.txt — that tells a language model which of your pages are worth reading and what each one covers. It exists because an LLM landing on your docs has to guess what matters; the file is you answering that directly, in a format small enough to sit in a context window.",
  },
  {
    question: "What does this llms.txt checker look at?",
    answer:
      "It fetches your /llms.txt and checks it against the format at llmstxt.org. Is the H1 there, and the summary? Are the sections and links shaped correctly? Is the file small enough to be useful? Then it follows every link to see if it resolves — the part nothing else in your stack tests.",
  },
  {
    question: "Does llms.txt help my SEO?",
    answer:
      "Not directly. No search engine has said it uses the file as a ranking signal, and Google has said publicly that it does not. What it does is give assistants that fetch your site a curated route through it instead of a guess. Treat it as documentation for machines, not as a ranking tactic.",
  },
  {
    question: "Where does the file go?",
    answer:
      "At the root: https://example.com/llms.txt. Serve it as text/plain or text/markdown. The common failure is a catch-all route returning your app's HTML shell instead of the file — this checker flags that, because it looks fine in a browser.",
  },
  {
    question: "What is llms-full.txt?",
    answer:
      "The companion file. Where llms.txt is an index of links, llms-full.txt carries the expanded content inline so a reader can take everything in one fetch. It is optional, and this checker tells you whether you have one.",
  },
  {
    question: "How many links should it have?",
    answer:
      "As many as are genuinely worth reading, and no more — the file is supposed to fit in a context window alongside whatever else the agent is holding. Past a dozen or so links, add an \"Optional\" section and move the secondary ones there, which is the format's own way of saying what can be skipped.",
  },
];

const STARTER = `<span class="lt-cmt"># Your Project</span>

&gt; One or two sentences on what this is and who it is for. A reader
&gt; uses this to decide whether the rest is worth fetching.

Anything else worth knowing before the links: how the docs are
organised, what is out of date, what to read first.

<span class="lt-cmt">## Docs</span>

- [Quickstart](https://example.com/docs/quickstart): The 10-minute path
- [API reference](https://example.com/docs/api): Every endpoint and field
- [Guides](https://example.com/docs/guides): Task-shaped walkthroughs

<span class="lt-cmt">## Optional</span>

- [Changelog](https://example.com/changelog): Release history
- [Blog](https://example.com/blog): Background and announcements`;

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "llms.txt checker" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi llms.txt Checker",
    alternateName: "llms.txt validator and generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free llms.txt checker that fetches any site's /llms.txt, validates it against the llmstxt.org format, and tests whether the links inside it resolve.",
    featureList: [
      "llms.txt format validation against the llmstxt.org spec",
      "Broken link detection inside llms.txt",
      "llms-full.txt detection",
      "Starter llms.txt generator",
    ],
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
      title: "llms.txt checker — validate your llms.txt file free | Sokosumi",
      description:
        "Free llms.txt checker and validator. Paste a domain to see whether its /llms.txt exists, follows the llmstxt.org format, and whether the links inside it actually resolve. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "llms-tool-page",
      stylesheets: ["/assets/llms-txt.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "llms.txt checker",
        sub: "Validate the file, and find the links inside it that no longer resolve.",
      },
    }) +
    `<section class="lt-head" id="checker">
      <p class="lt-overline">Free · no sign-up</p>
      <h1>llms.txt checker</h1>
      <p class="lt-lede">Paste a domain. We fetch its <code>/llms.txt</code>, check it against the format, and follow the links inside it — because a file full of 404s is the one failure nothing else in your stack will ever tell you about.</p>

      <form class="lt-bar" id="ltForm" novalidate>
        <label class="sr-only" for="ltUrl">Site to check</label>
        <input id="ltUrl" name="url" type="text" inputmode="url" autocomplete="url" spellcheck="false" placeholder="example.com" aria-describedby="ltError" required />
        <button class="lt-submit" id="ltSubmit" type="submit">Check</button>
      </form>

      <div class="lt-try">
        <span>Try</span>
        <button type="button" data-try="https://llmstxt.org">llmstxt.org</button>
        <button type="button" data-try="https://docs.anthropic.com">Anthropic docs</button>
        <button type="button" data-try="https://www.sokosumi.com">Sokosumi</button>
      </div>

      <p class="lt-error" id="ltError" role="alert" hidden></p>
    </section>

    <div class="lt-loading" id="ltLoading" hidden>
      <span class="lt-spin" aria-hidden="true"></span>
      <span>Fetching the file and following its links…</span>
    </div>

    <section class="lt-result" id="ltResult" aria-label="Results" hidden>
      <div class="lt-summary">
        <p class="lt-summary-url" id="ltSummaryUrl"></p>
        <div class="lt-scores" id="ltScores" role="group" aria-label="Filter checks"></div>
      </div>
      <div class="lt-grid">
        <div class="lt-panel">
          <div class="lt-tabs" id="ltTabs" role="tablist" aria-label="Views"></div>
          <div class="lt-stage" id="ltStage"></div>
        </div>
        <div class="lt-inspector">
          <div class="lt-inspector-head">
            <h2>Report</h2>
            <span id="ltChecksCount"></span>
          </div>
          <div class="lt-checks" id="ltChecks" data-filter=""></div>
        </div>
      </div>
    </section>

    <section class="lt-section" aria-labelledby="lt-format">
      <h2 id="lt-format">The llms.txt format</h2>
      <p class="lt-sub">Six parts, in this order. Only the first is required — everything the checker reports is measured against this.</p>
      <div class="lt-table-wrap">
        <table class="lt-table">
          <thead>
            <tr><th scope="col">Part</th><th scope="col">Syntax</th><th scope="col">Status</th><th scope="col">What it does</th></tr>
          </thead>
          <tbody>
            ${FORMAT.map(
              (r) =>
                `<tr><th scope="row">${esc(r.part)}</th><td><code>${esc(r.syntax)}</code></td><td>${esc(r.required)}</td><td>${esc(r.note)}</td></tr>`,
            ).join("")}
          </tbody>
        </table>
      </div>
      <p class="lt-sub" style="margin-top:18px">The full specification lives at <a href="https://llmstxt.org/" rel="noopener noreferrer">llmstxt.org</a>.</p>
    </section>

    <section class="lt-section" aria-labelledby="lt-starter">
      <h2 id="lt-starter">A starter file</h2>
      <p class="lt-sub">Valid as it stands. Swap the URLs, put it at the root of your domain, serve it as <code>text/plain</code>.</p>
      <div class="lt-snippet-wrap">
        <button class="lt-copy" id="ltCopyStarter" type="button" data-starter>Copy</button>
        <pre class="lt-snippet" id="ltStarter">${STARTER}</pre>
      </div>
    </section>

    <section class="lt-section" id="faq" aria-labelledby="lt-faq">
      <h2 id="lt-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The file is for machines. The work still isn't.",
      subheading:
        "Sokosumi's AI coworkers turn a brief into a finished file: the launch copy, the social set, the landing page.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/llms-txt.js"], englishOnly: true })
  );
}

module.exports = { render };

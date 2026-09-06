const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/landing-page-copy-analyzer";

const FAQ = [
  {
    question: "What does the landing page copy analyzer check?",
    answer:
      "Paste the copy from a landing page — the hero, a section, or the whole page — and it scores four things: clarity (sentence length, jargon, passive voice), benefit focus (whether the copy talks to the reader or about the company), specificity (concrete numbers vs vague qualifiers), and CTA strength (whether there's a clear, specific next step).",
  },
  {
    question: "Does it check design or layout?",
    answer: "No — it only reads the text you paste. It has no idea what the page looks like, where the CTA button sits, or how it's styled. Pair it with the Landing Page Conversion Teardown for a layout-aware pass.",
  },
  {
    question: "Why does it flag \"we/our\" language?",
    answer:
      "Copy that talks about the company (\"we built\", \"our platform\") converts worse than copy that talks about the reader's outcome (\"you'll save\", \"your team gets\"). The ratio of you/your to we/our is a simple, well-documented proxy for that.",
  },
  {
    question: "Is my copy stored anywhere?",
    answer: "No. It's scored in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Landing Page Copy Analyzer" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Landing Page Copy Analyzer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free landing page copy analyzer that scores pasted copy on clarity, benefit focus, specificity, and CTA strength, with a full breakdown and fixes.",
    featureList: [
      "Sentence length, jargon, and passive-voice detection",
      "You/your vs we/our benefit-focus ratio",
      "Concrete-number and vague-qualifier detection",
      "CTA presence and strength scoring",
      "Prioritized, ranked list of fixes",
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
      title: "Landing Page Copy Analyzer — score your copy | Sokosumi",
      description:
        "Free landing page copy analyzer. Paste your hero copy or full page and get scores on clarity, benefit focus, specificity, and CTA strength, plus a ranked list of fixes. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Landing Page Copy Analyzer",
        sub: "Score your copy's clarity, benefit focus, specificity and CTA strength.",
      },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Landing Page Copy Analyzer</h1>
      <p class="tk-lede">Paste your hero copy, a section, or the whole page and get a score on its clarity, its benefit focus, its specificity, and its CTA — with the exact lines that are costing you conversions.</p>

      <form class="tk-form is-stacked" id="lcaForm" novalidate>
        <label class="sr-only" for="lcaText">Landing page copy</label>
        <textarea id="lcaText" name="text" maxlength="6000" placeholder="Paste your landing page copy here…" aria-describedby="lcaError" required></textarea>
        <button class="tk-submit" id="lcaSubmit" type="submit">Score my copy</button>
      </form>

      <div class="tk-try">
        <span>Try</span>
        <button type="button" data-try="weak">Weak copy</button>
        <button type="button" data-try="strong">Strong copy</button>
      </div>

      <p class="tk-error" id="lcaError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="lcaLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Scoring your copy…</span>
    </div>

    <section class="tk-result" id="lcaResult" aria-label="Results" hidden>
      <div class="tk-summary">
        <p class="tk-summary-score" id="lcaSummaryScore"></p>
        <div class="tk-scores" id="lcaScores" role="group" aria-label="Filter checks"></div>
        <button class="tk-copy" id="lcaCopy" type="button">Copy report</button>
      </div>
      <div class="tk-dims" id="lcaDims" data-filter=""></div>
    </section>

    <section class="tk-section" aria-labelledby="lca-how">
      <h2 id="lca-how">What gets scored</h2>
      <p class="tk-sub">Four dimensions, each built from concrete, checkable signals — not a guess at how a reader will feel.</p>
      <div class="tk-cards">
        <div class="tk-card"><h3>Clarity</h3><p>Sentence length, corporate jargon, and passive voice — the things that make copy exhausting to read.</p></div>
        <div class="tk-card"><h3>Benefit focus</h3><p>Whether the copy talks to the reader ("you'll save") or about the company ("we built").</p></div>
        <div class="tk-card"><h3>Specificity</h3><p>Concrete numbers and timeframes vs vague qualifiers like "various" or "best-in-class".</p></div>
        <div class="tk-card"><h3>CTA strength</h3><p>Whether there's a clear, specific next step rather than a generic "learn more".</p></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="lca-faq">
      <h2 id="lca-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The copy is scored. Someone still has to write the page it goes on.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/landing-copy-analyzer.js"], englishOnly: true })
  );
}

module.exports = { render };

const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/headline-analyzer";

const FAQ = [
  {
    question: "What does the headline analyzer check?",
    answer:
      "Paste a headline — a blog title, ad headline, email subject line, or social hook — and it reads the text for four things: length (does it fit before search results or previews truncate it), emotional pull (does it use a power word without overloading on them), specificity (a number, a how-to, or a question that promises a concrete payoff), and clarity (no overused clickbait templates, no shouting).",
  },
  {
    question: "Is this predicting my click-through rate?",
    answer:
      "No — it isn't a black-box CTR predictor and has no access to your audience or platform. It checks concrete, well-documented copywriting signals: truncation length, presence of a specific hook, power-word density, and overused templates. Think of it as a headline linter, not a crystal ball.",
  },
  {
    question: "What counts as a \"power word\"?",
    answer:
      "Words with an established track record in copywriting for signaling urgency, exclusivity, or a strong outcome — free, proven, secret, guaranteed, instantly, and similar. A headline with none of these usually reads as purely descriptive; a headline stacked with several reads as spam.",
  },
  {
    question: "Why does it flag \"everything you need to know\" and similar phrases?",
    answer:
      "These are widely recognized template phrases that readers — and increasingly platform algorithms — have seen thousands of times. They signal generic content even when the underlying piece isn't. Naming the actual, specific claim usually outperforms the wrapper phrase.",
  },
  {
    question: "Is my headline stored anywhere?",
    answer:
      "No. It's scored in memory for that one request and nothing is written to a database or log beyond the standard request logging any web server does.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Headline Analyzer" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Headline Analyzer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free headline analyzer that scores a pasted headline, ad headline, or subject line on length, emotional pull, specificity, and clarity, with a full breakdown and fixes.",
    featureList: [
      "Length scoring against search-result and preview truncation points",
      "Power-word / emotional-pull detection",
      "Specificity checks for numbers, how-to framing and questions",
      "Overused clickbait-template and shouting detection",
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
      title: "Headline Analyzer — score your headline or ad copy | Sokosumi",
      description:
        "Free headline analyzer. Paste a blog title, ad headline, or email subject line and get scores on length, emotional pull, specificity, and clarity, plus a ranked list of fixes. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "ha-tool-page",
      stylesheets: ["/assets/headline-analyzer.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Headline Analyzer",
        sub: "Score your headline's length, emotional pull, specificity and clarity.",
      },
    }) +
    `<section class="ha-head" id="analyzer">
      <p class="ha-overline">Free · no sign-up</p>
      <h1>Headline Analyzer</h1>
      <p class="ha-lede">Paste a headline, an ad line, or a subject line and get a score on its length, its emotional pull, its specificity, and its clarity — with the exact words that are costing you clicks.</p>

      <form class="ha-form" id="haForm" novalidate>
        <label class="sr-only" for="haText">Headline</label>
        <input id="haText" name="text" type="text" maxlength="300" placeholder="Paste your headline here…" aria-describedby="haError" required />
        <button class="ha-submit" id="haSubmit" type="submit">Score my headline</button>
      </form>

      <div class="ha-try">
        <span>Try</span>
        <button type="button" data-try="weak">A weak headline</button>
        <button type="button" data-try="strong">A strong headline</button>
      </div>

      <p class="ha-error" id="haError" role="alert" hidden></p>
    </section>

    <div class="ha-loading" id="haLoading" hidden>
      <span class="ha-spin" aria-hidden="true"></span>
      <span>Scoring your headline…</span>
    </div>

    <section class="ha-result" id="haResult" aria-label="Results" hidden>
      <div class="ha-summary">
        <p class="ha-summary-score" id="haSummaryScore"></p>
        <div class="ha-scores" id="haScores" role="group" aria-label="Filter checks"></div>
        <button class="ha-copy" id="haCopy" type="button">Copy report</button>
      </div>
      <div class="ha-dims" id="haDims" data-filter=""></div>
    </section>

    <section class="ha-section" aria-labelledby="ha-how">
      <h2 id="ha-how">What gets scored</h2>
      <p class="ha-sub">Four dimensions, each built from concrete, checkable signals — not a guess at how a reader will feel.</p>
      <div class="ha-cards">
        <div class="ha-card"><h3>Length</h3><p>Does it fit before search results, social cards, or subject-line previews truncate it, without running so short it makes no promise at all.</p></div>
        <div class="ha-card"><h3>Emotional pull</h3><p>Does it use a power word — free, proven, secret, guaranteed — without stacking so many it reads as spam.</p></div>
        <div class="ha-card"><h3>Specificity</h3><p>A number, a how-to framing, or a question that promises a concrete, checkable payoff rather than a vague claim.</p></div>
        <div class="ha-card"><h3>Clarity</h3><p>No overused clickbait template phrasing, no shouting in all-caps or stacked punctuation.</p></div>
      </div>
    </section>

    <section class="ha-section" id="faq" aria-labelledby="ha-faq">
      <h2 id="ha-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The headline is scored. Someone still has to write the piece under it.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the headline, the copy, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/headline-analyzer.js"], englishOnly: true })
  );
}

module.exports = { render };

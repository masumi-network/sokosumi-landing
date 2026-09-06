const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/brand-voice-analyzer";

const FAQ = [
  {
    question: "How many posts do I need to paste?",
    answer: "At least 2, but 5-10 gives a much more reliable read. Separate each post with a blank line, or a line containing just \"---\".",
  },
  {
    question: "What does it actually measure?",
    answer:
      "Sentence length, contraction rate, the balance of \"you\" vs \"we\" vs \"I\", emoji and punctuation habits, and the words that show up most often across everything you pasted. It turns those numbers into a short, reusable voice spec you can hand to a writer or paste into a prompt.",
  },
  {
    question: "Is this reading tone with an LLM?",
    answer: "No — every measurement here is a word count, a regex, or a ratio. Nothing is sent to a model, and nothing here is a subjective read of \"tone\" beyond what those numbers imply.",
  },
  {
    question: "Are my posts stored anywhere?",
    answer: "No. They're analyzed in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Brand Voice Analyzer" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Brand Voice Analyzer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free tool that extracts a reusable brand-voice spec from 5-10 pasted posts: sentence length, contraction rate, pronoun balance, punctuation habits and recurring vocabulary.",
    featureList: [
      "Sentence-length and contraction-rate measurement",
      "You/we/I pronoun balance",
      "Emoji, exclamation and hashtag habits",
      "Recurring-vocabulary extraction",
      "A copyable, reusable voice spec",
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
      title: "Brand Voice Analyzer — extract a voice spec from your posts | Sokosumi",
      description:
        "Free brand voice analyzer. Paste 5-10 existing posts and get a reusable voice spec: sentence length, contraction rate, pronoun balance, punctuation habits and recurring vocabulary. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Brand Voice Analyzer",
        sub: "Extract a reusable voice spec from your existing posts.",
      },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Brand Voice Analyzer</h1>
      <p class="tk-lede">Paste 5-10 posts you've already published, separated by a blank line, and get back a reusable voice spec — sentence style, pronoun balance, punctuation habits, and the vocabulary you actually use.</p>

      <form class="tk-form is-stacked" id="bvaForm" novalidate>
        <label class="sr-only" for="bvaText">Existing posts</label>
        <textarea id="bvaText" name="text" maxlength="12000" style="min-height:220px" placeholder="Paste your posts here, one per paragraph, separated by a blank line…" aria-describedby="bvaError" required></textarea>
        <button class="tk-submit" id="bvaSubmit" type="submit">Extract my voice</button>
      </form>

      <div class="tk-try">
        <span>Try</span>
        <button type="button" data-try="sample">A sample set of posts</button>
      </div>

      <p class="tk-error" id="bvaError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="bvaLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Reading your posts…</span>
    </div>

    <section class="tk-result" id="bvaResult" aria-label="Results" hidden>
      <div class="tk-summary">
        <p class="tk-summary-score" id="bvaSummary"></p>
      </div>
      <div class="tk-cards" id="bvaMetrics"></div>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Recurring vocabulary</h2></div>
        <div class="tk-cloud" id="bvaCloud"></div>
      </div>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Voice spec</h2><button class="tk-copy" id="bvaCopy" type="button">Copy spec</button></div>
        <pre id="bvaSpec"></pre>
      </div>
    </section>

    <section class="tk-section" aria-labelledby="bva-how">
      <h2 id="bva-how">What gets measured</h2>
      <p class="tk-sub">Every number below is a word count, a regex match, or a ratio — no model reads or guesses your tone.</p>
      <div class="tk-cards">
        <div class="tk-card"><h3>Sentence style</h3><p>Average words per sentence and per post, across everything you paste.</p></div>
        <div class="tk-card"><h3>Pronoun balance</h3><p>Whether the voice talks to the reader ("you"), as a collective ("we"), or as a narrator ("I").</p></div>
        <div class="tk-card"><h3>Punctuation habits</h3><p>Contraction rate, emoji use, exclamation and question marks, hashtag frequency.</p></div>
        <div class="tk-card"><h3>Vocabulary</h3><p>The words that show up most often, once common stopwords are stripped out.</p></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="bva-faq">
      <h2 id="bva-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The voice is extracted. Someone still has to write the next hundred posts in it.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file, in your voice.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/brand-voice-analyzer.js"], englishOnly: true })
  );
}

module.exports = { render };

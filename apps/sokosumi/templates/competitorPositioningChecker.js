const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/competitor-positioning";

const FAQ = [
  {
    question: "What does this compare?",
    answer:
      "Enter your URL and a competitor's URL and it fetches both pages, then compares title, meta description, H1, word count, CTA presence, pricing/plan mentions, social proof, and the vocabulary each page emphasizes that the other doesn't.",
  },
  {
    question: "What counts as a \"gap\"?",
    answer: "Something the other site has that yours doesn't, from the list above — no H1, no meta description, thinner content, no CTA, no pricing shown, no social proof. It's a checklist of loopholes to look at, not a verdict on which site is better.",
  },
  {
    question: "Is this reading with an LLM?",
    answer: "No — every signal is a word count, a regex match, or a set difference between the two pages' vocabulary. Nothing is sent to a model.",
  },
  {
    question: "Are the URLs or page content stored anywhere?",
    answer: "No. Both pages are fetched and compared in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Competitor Positioning Teardown" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Competitor Positioning Teardown",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that compares two URLs' title, meta description, H1, content depth, CTA, pricing and social proof, and flags what each is missing that the other has.",
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
      title: "Competitor Positioning Teardown | Sokosumi",
      description: "Free competitor positioning teardown. Enter two URLs and see side by side what each page says, and what each is missing that the other has. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Competitor Positioning Teardown", sub: "Compare two pages side by side." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Competitor Positioning Teardown</h1>
      <p class="tk-lede">Enter your URL and a competitor's URL and see side by side what each page says — and the exact loopholes each one leaves open.</p>

      <form class="tk-form" id="cptForm" novalidate>
        <div class="tk-field"><label for="cptUrlA">Your URL</label><input id="cptUrlA" type="url" placeholder="https://yoursite.com" required /></div>
        <div class="tk-field"><label for="cptUrlB">Competitor URL</label><input id="cptUrlB" type="url" placeholder="https://competitor.com" required /></div>
        <button class="tk-submit" id="cptSubmit" type="submit">Compare</button>
      </form>

      <p class="tk-error" id="cptError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="cptLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Fetching both pages…</span>
    </div>

    <section class="tk-result" id="cptResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Side by side</h2></div>
        <div id="cptTable"></div>
      </div>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Gaps and loopholes</h2></div>
        <div class="tk-groups" id="cptGroups"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="cpt-faq">
      <h2 id="cpt-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The gaps are found. Someone still has to close them.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/competitor-positioning.js"], englishOnly: true })
  );
}

module.exports = { render };

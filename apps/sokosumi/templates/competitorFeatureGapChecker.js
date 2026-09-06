const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/competitor-feature-gap";

const FAQ = [
  {
    question: "How does it find \"features\"?",
    answer:
      "It pulls short list items (2-14 words) from each page's HTML — the way most feature lists, pricing tables and \"what's included\" sections are actually marked up — and filters out obvious footer/nav junk. It's a proxy for a feature list, not a guarantee every real feature is a bulleted list item on the page.",
  },
  {
    question: "Why does it miss a feature I know both sites have?",
    answer: "Grouping is exact-match on normalized text, so \"Real-time sync\" and \"Syncs in real time\" are treated as two different rows, not one. It only recognizes near-identical phrasing across sites — a real limitation of a no-LLM, deterministic approach.",
  },
  {
    question: "How many sites can I compare?",
    answer: "Between 2 and 5. Paste one URL per line.",
  },
  {
    question: "Is any of this stored?",
    answer: "No. Each page is fetched and analyzed in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Competitor Feature Gap" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Competitor Feature Gap",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that builds a yes/no feature matrix from 2-5 competitor URLs' list items, sorted so the features most competitors share surface first.",
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
      title: "Competitor Feature Gap | Sokosumi",
      description: "Free competitor feature gap finder. Paste 2-5 URLs and get a yes/no feature matrix built from each page's list items, sorted by how many competitors share each one. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Competitor Feature Gap", sub: "Build a feature matrix from competitor pages." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Competitor Feature Gap</h1>
      <p class="tk-lede">Paste 2-5 competitor URLs, one per line, and get a normalized feature matrix built from each page's list items — the features most of them share, and the ones only some of them mention.</p>

      <form class="tk-form is-stacked" id="cfgForm" novalidate>
        <label class="sr-only" for="cfgUrls">URLs, one per line</label>
        <textarea id="cfgUrls" style="min-height:120px" placeholder="https://yoursite.com&#10;https://competitor-one.com&#10;https://competitor-two.com" required></textarea>
        <button class="tk-submit" id="cfgSubmit" type="submit">Build the matrix</button>
      </form>

      <p class="tk-error" id="cfgError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="cfgLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Fetching every page…</span>
    </div>

    <section class="tk-result" id="cfgResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Feature matrix</h2></div>
        <p class="tk-sub" id="cfgNote" style="margin-bottom:14px"></p>
        <div id="cfgTable"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="cfg-faq">
      <h2 id="cfg-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The gaps are on the table. Someone still has to ship them.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/competitor-feature-gap.js"], englishOnly: true })
  );
}

module.exports = { render };

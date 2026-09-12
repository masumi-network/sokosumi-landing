const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const FAQ = [
  {
    question: "How long should a meta title be?",
    answer:
      "Google truncates titles by pixel width, not characters — roughly 580 pixels, which is usually 50 to 60 characters. This generator measures both and marks anything that would be cut. Shorter is fine; a title that gets cut mid-claim is not.",
  },
  {
    question: "How long should a meta description be?",
    answer:
      "About 120 to 155 characters. Google rewrites descriptions it does not like, and cuts the rest around 990 pixels on desktop. A description that states what the page offers, with one concrete fact, gets kept and clicked more often than a vague one.",
  },
  {
    question: "Does the meta description affect rankings?",
    answer:
      "Not directly — Google has said so for years. It affects clicks: the description is your ad copy on the results page, and a better one raises click-through rate on the position you already have.",
  },
  {
    question: "Why does Google show a different title than the one I set?",
    answer:
      "Google rewrites titles it considers too long, keyword-stuffed, boilerplate, or mismatched with the query. Titles that describe the page plainly and match the H1 mostly get kept. This is also why three honest options beat one clever one.",
  },
];

function render() {
  const path = "/tools/meta-description-generator";
  const crumbs = [{ label: "Home", href: "/" }, { label: "Free tools", href: "/tools" }, { label: "Meta tag generator" }];
  const faqJsonLd = {
    "@type": "FAQPage",
    "@id": `${SITE}${path}#faq`,
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  const appJsonLd = {
    "@type": "WebApplication",
    "@id": `${SITE}${path}#software`,
    name: "Sokosumi Meta Title & Description Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE}${path}`,
    description:
      "A free meta description and meta title generator: reads your page, writes three options each, measures them in pixels, and previews the Google result. No sign-up.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    creator: { "@id": `${SITE}/#organization` },
  };

  return (
    pageStart({
      title: "Free Meta Description Generator (with titles & SERP preview)",
      description:
        "Generate meta descriptions and meta titles from your page URL or a topic: three options each, pixel-width checks against Google's limits, and a live SERP preview. Free, no sign-up.",
      path,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "design-tool-page",
      stylesheets: ["/assets/design-md.css", "/assets/meta-tags.css", "/assets/email-gate.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Meta description generator",
        sub: "Three titles, three descriptions, measured in pixels.",
      },
    }) +
    `<section class="dm-tool" id="generator">
      <header class="dm-tool-head">
        <div>
          <p class="dm-overline">Free tool · No sign-up</p>
          <h1>Meta Title &amp; Description Generator</h1>
        </div>
        <p class="dm-tool-meta"><span class="dm-live">Live</span></p>
      </header>
      <p class="dm-tool-sub">Point it at a page and it writes tags that match what is actually on it — three titles, three descriptions, each measured against Google's real pixel limits. No page yet? Describe it instead.</p>

      <form class="mtg-form" id="mtgForm" novalidate>
        <div class="mtg-fields">
          <div class="mtg-field mtg-field-wide">
            <label for="mtgUrl">Page URL <span>or describe the page below</span></label>
            <input id="mtgUrl" name="url" type="text" inputmode="url" placeholder="https://your-site.com/pricing" autocomplete="url" />
          </div>
          <div class="mtg-field mtg-field-wide">
            <label for="mtgTopic">What the page is about <span>optional when a URL is set</span></label>
            <input id="mtgTopic" name="topic" type="text" placeholder="Pricing page for a project management app" />
          </div>
          <div class="mtg-field">
            <label for="mtgKeyword">Main keyword <span>optional</span></label>
            <input id="mtgKeyword" name="keyword" type="text" placeholder="project management pricing" />
          </div>
          <div class="mtg-field">
            <label for="mtgBrand">Brand <span>optional</span></label>
            <input id="mtgBrand" name="brand" type="text" placeholder="Acme" />
          </div>
        </div>
        <button class="dm-submit btn btn-primary" id="mtgSubmit" type="submit">
          <span class="dm-submit-label">Generate tags</span>
          <span class="dm-submit-loading" hidden>Writing…</span>
        </button>
      </form>
      <p class="dm-error" id="mtgError" role="alert" hidden></p>

      <div class="mtg-output" id="mtgOutput" hidden>
        <div class="mtg-serp" aria-label="Google result preview">
          <p class="mtg-serp-label">Result preview — click any option below to load it</p>
          <div class="mtg-serp-card">
            <span class="mtg-serp-url" id="mtgSerpUrl">your-site.com</span>
            <span class="mtg-serp-title" id="mtgSerpTitle"></span>
            <span class="mtg-serp-desc" id="mtgSerpDesc"></span>
          </div>
        </div>
        <div class="mtg-cols">
          <section aria-labelledby="mtg-titles-h">
            <h2 id="mtg-titles-h">Titles</h2>
            <ol class="mtg-options" id="mtgTitles"></ol>
          </section>
          <section aria-labelledby="mtg-descs-h">
            <h2 id="mtg-descs-h">Descriptions</h2>
            <ol class="mtg-options" id="mtgDescs"></ol>
          </section>
        </div>
        <section class="mtg-snippet" aria-labelledby="mtg-snippet-h">
          <h2 id="mtg-snippet-h">HTML</h2>
          <pre><code id="mtgHtml"></code></pre>
          <button class="btn btn-outline" id="mtgCopyHtml" type="button">Copy HTML</button>
        </section>
        <p class="mtg-model-note" id="mtgModelNote"></p>
      </div>
    </section>

    <section class="dm-how" aria-labelledby="mtg-how">
      <p class="dm-overline">How it works</p>
      <h2 id="mtg-how">Written from the page, measured like Google measures.</h2>
      <ol>
        <li><span>01</span><h3>It reads the page</h3><p>Title, headings and body text are fetched server-side, so the tags describe what is really there — no invented claims.</p></li>
        <li><span>02</span><h3>Three angles each</h3><p>What it is, what you get, who it is for. Three honest options beat one clever one, because Google rewrites titles it distrusts.</p></li>
        <li><span>03</span><h3>Pixels, not just characters</h3><p>Google cuts titles near 580px and descriptions near 990px. Every option is measured, and anything that would be cut is flagged.</p></li>
      </ol>
    </section>

    <section class="dm-faq" id="faq" aria-labelledby="mtg-faq-title">
      <h2 id="mtg-faq-title">Questions</h2>
      <div class="faq-list">
        ${FAQ.map(
          (item) => `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "Meta tags for one page, or for all of them.",
      subheading: "Sokosumi's AI coworkers rewrite metadata across a whole site — and check it with the SEO.md tool.",
      ctaLabel: "Start free",
    }) +
    pageEnd({ scripts: ["/assets/meta-tags.js", "/assets/email-gate.js"], englishOnly: true })
  );
}

module.exports = { render };

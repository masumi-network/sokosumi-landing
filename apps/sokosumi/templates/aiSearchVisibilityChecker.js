const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/ai-search-visibility";

const FAQ = [
  {
    question: "Does this tell me where I'm actually mentioned in ChatGPT or Perplexity?",
    answer:
      "No: it has no access to any AI search engine's index, training data, or answer logs, and can't tell you where you're mentioned, where a competitor is mentioned instead, or which queries you're invisible for. That would need direct access to those systems, which no free tool has.",
  },
  {
    question: "So what does it actually check?",
    answer:
      "Three groups of signals this tool CAN see. AI crawler access: whether your robots.txt blocks the crawlers that feed these engines (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others), whether it blocks all crawlers site-wide, and whether the homepage is set to noindex. Brand disambiguation: whether the homepage gives an engine a clean brand signal: title, a single H1, meta description, canonical URL, Organization and WebSite schema, sameAs links, and a declared logo. Discoverability: a sitemap.xml, a Sitemap: line in robots.txt, llms.txt and llms-full.txt, and HTTPS. It's a readiness proxy, not a visibility measurement.",
  },
  {
    question: "Why does it check for llms.txt?",
    answer: "It's an emerging, informal convention: a plain-text index some sites publish specifically for LLM-based crawlers and assistants. Having one is a low-cost signal that you've thought about AI discoverability; not having one isn't a penalty most engines apply today.",
  },
  {
    question: "Is the URL or page content stored anywhere?",
    answer: "No. The page and its robots.txt/sitemap.xml/llms.txt are fetched and checked in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Website AI Readiness Analyzer" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Website AI Readiness Analyzer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that checks whether your robots.txt blocks known AI crawlers, whether your homepage gives an engine a clean brand signal, and whether you have a sitemap and llms.txt. A readiness proxy, not a measurement of where you're actually mentioned in AI search.",
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
      title: "Website AI Readiness Analyzer | Sokosumi",
      description: "Free AI search visibility readiness checker. Enter your site and see whether AI crawlers are blocked, whether your brand is disambiguated, and whether you're discoverable. Not a measurement of live AI search results. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css", "/assets/ai-search-visibility.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Website AI Readiness Analyzer", sub: "A readiness proxy, not a live AI search measurement." },
    }) +
    `<section class="tk-head" id="analyzer">
      <h1>Website AI Readiness Analyzer</h1>
      <p class="tk-lede">Check if AI search engines can access and understand your website. Enter your website URL and we test if crawlers are blocked, if your brand is clearly identified, and if your site is easy to discover.</p>

      <form class="tk-form" id="asvForm" novalidate>
        <label class="sr-only" for="asvUrl">Website URL</label>
        <input id="asvUrl" type="url" placeholder="https://example.com" aria-describedby="asvError" required />
        <button class="tk-submit" id="asvSubmit" type="submit">Check readiness</button>
      </form>

      <div class="tk-try">
        <span>Try</span>
        <button type="button" data-try="sokosumi">sokosumi.com</button>
        <button type="button" data-try="stripe">stripe.com</button>
        <button type="button" data-try="notion">notion.so</button>
        <button type="button" data-try="vercel">vercel.com</button>
      </div>

      <p class="tk-error" id="asvError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="asvLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Checking robots.txt, schema, sitemap and llms.txt…</span>
    </div>

    <section class="tk-result" id="asvResult" aria-label="Results" hidden>
      <div class="tk-summary">
        <p class="tk-summary-score" id="asvSummaryScore"></p>
        <div class="tk-scores" id="asvScores" role="group" aria-label="Filter checks"></div>
        <button class="tk-copy" id="asvCopy" type="button">Copy report</button>
      </div>
      <div class="asv-viz" id="asvViz" hidden></div>
      <div class="tk-dims tk-dims-balanced tk-dims-notag" id="asvDims" data-filter=""></div>
      <p class="tk-sibling">Missing an llms.txt or want to check the one you have? <a href="/tools/llms-txt">Use the llms.txt Validator</a>.</p>
    </section>

    <section class="tk-section" aria-labelledby="asv-how">
      <h2 id="asv-how">What gets checked</h2>
      <p class="tk-sub">Three groups of signals: whether AI crawlers can reach you, whether your brand is clearly identified, and whether your site is easy to discover. Run a check above for the full breakdown with fixes.</p>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="asv-faq">
      <h2 id="asv-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The readiness is checked. Someone still has to write what gets found.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/ai-search-visibility.js"], englishOnly: true })
  );
}

module.exports = { render };

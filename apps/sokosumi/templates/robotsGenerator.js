const shell = require("./shell");

const { esc, attr, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/robots-txt-generator";

// value, label, and the short "why block this one" line shown next to it.
const AI_BOTS = [
  ["GPTBot", "OpenAI's crawler for training data"],
  ["ChatGPT-User", "OpenAI's live-browsing agent, used when ChatGPT fetches a page for a user"],
  ["CCBot", "Common Crawl, whose dataset feeds many other models' training data"],
  ["Google-Extended", "Controls use in Google's Gemini/AI features, separate from normal Googlebot search indexing"],
  ["anthropic-ai", "Anthropic's crawler for training data"],
  ["ClaudeBot", "Anthropic's crawler for training data (current identifier)"],
  ["Bytespider", "ByteDance's crawler for training data"],
  ["PerplexityBot", "Perplexity's crawler, used for both search and training"],
];

const FAQ = [
  {
    question: "What does a robots.txt file actually do?",
    answer:
      "It tells well-behaved crawlers which parts of your site they may fetch. It's an honor-system request, not a lock — a search engine or AI company that respects robots.txt will stay out of the Disallow'd paths, but nothing stops a crawler that ignores it.",
  },
  {
    question: "Why does the AI-bot list matter if llms.txt exists too?",
    answer:
      "They answer different questions. robots.txt says who may crawl your site at all. llms.txt (see our llms.txt checker) is for the crawlers you do allow — it tells them which pages matter most. Blocking GPTBot's training crawl while still shipping an llms.txt is a coherent, common position: opt out of being training data, opt in to being cited accurately when an agent does visit.",
  },
  {
    question: "Will blocking these bots hurt my SEO?",
    answer:
      "No — none of the bots in the AI-training list are the crawlers that power a search engine's actual results ranking (that's Googlebot, Bingbot, etc., which this tool doesn't touch). Blocking GPTBot or CCBot opts you out of AI training datasets; it has no effect on Google or Bing search rankings.",
  },
  {
    question: "Where does this file need to live?",
    answer:
      "At the root of your domain — https://yourdomain.com/robots.txt — and nowhere else. A robots.txt in a subfolder is ignored.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Robots.txt Generator" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Robots.txt Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free robots.txt generator with a built-in checklist of AI-training crawlers (GPTBot, CCBot, Google-Extended and others) to block, plus custom Allow/Disallow rules and a sitemap line. Runs entirely in the browser.",
    featureList: [
      "Custom Allow/Disallow rules for User-agent: *",
      "One-click checklist of AI-training crawlers to block",
      "Sitemap and crawl-delay lines",
      "Runs entirely client-side — nothing sent to a server",
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
      title: "Free Robots.txt Generator — with an AI-bot blocklist | Sokosumi",
      description:
        "Generate a robots.txt for free: custom Allow/Disallow rules, a sitemap line, and a one-click checklist to block AI-training crawlers like GPTBot and CCBot. Runs in your browser, no sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "rg-tool-page",
      stylesheets: ["/assets/robots-generator.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Robots.txt Generator",
        sub: "Custom crawl rules, plus a one-click AI-bot blocklist.",
      },
    }) +
    `<section class="rg-head" id="generator">
      <p class="rg-overline">Free · no sign-up</p>
      <h1>Robots.txt Generator</h1>
      <p class="rg-lede">Set your crawl rules, tick off any AI-training bots you want to keep out, and get a ready-to-paste robots.txt. Runs entirely in your browser.</p>

      <div class="rg-layout">
        <form class="rg-form" id="rgForm" novalidate>
          <div class="rg-field">
            <label for="rgDisallow">Disallow paths <span>one per line</span></label>
            <textarea id="rgDisallow" rows="4" placeholder="/admin/&#10;/cart/&#10;/*?sid="></textarea>
          </div>
          <div class="rg-field">
            <label for="rgAllow">Allow paths <span>optional, one per line</span></label>
            <textarea id="rgAllow" rows="2" placeholder="/"></textarea>
          </div>
          <div class="rg-row">
            <div class="rg-field">
              <label for="rgSitemap">Sitemap URL <span>optional</span></label>
              <input id="rgSitemap" type="text" inputmode="url" spellcheck="false" placeholder="https://example.com/sitemap.xml" />
            </div>
            <div class="rg-field rg-field-narrow">
              <label for="rgCrawlDelay">Crawl-delay <span>optional, seconds</span></label>
              <input id="rgCrawlDelay" type="number" min="0" step="1" placeholder="10" />
            </div>
          </div>

          <fieldset class="rg-bots">
            <legend>Block AI-training crawlers</legend>
            ${AI_BOTS.map(
              ([name, why]) =>
                `<label class="rg-bot"><input type="checkbox" name="aiBot" value="${attr(name)}" /><span><b>${esc(name)}</b><i>${esc(why)}</i></span></label>`,
            ).join("")}
          </fieldset>
        </form>

        <div class="rg-preview">
          <div class="rg-preview-head">
            <span>robots.txt</span>
            <div class="rg-preview-actions">
              <button class="rg-btn" id="rgCopy" type="button">Copy</button>
              <button class="rg-btn" id="rgDownload" type="button">Download</button>
            </div>
          </div>
          <pre class="rg-preview-body" id="rgOutput"></pre>
        </div>
      </div>
    </section>

    <section class="rg-section" aria-labelledby="rg-how">
      <h2 id="rg-how">Why block AI crawlers separately</h2>
      <p class="rg-sub">Search crawlers, AI-training crawlers and AI browsing agents are three different things, and robots.txt lets you treat them differently.</p>
      <div class="rg-cards">
        <div class="rg-card"><h3>Search crawlers</h3><p>Googlebot, Bingbot — untouched by this tool. Blocking these hides you from search entirely.</p></div>
        <div class="rg-card"><h3>AI-training crawlers</h3><p>GPTBot, CCBot and others scrape pages to train future models. Blocking them has no effect on search rankings.</p></div>
        <div class="rg-card"><h3>AI browsing agents</h3><p>ChatGPT-User and similar fetch a page live, on a person's behalf, when they ask an assistant about it — a different trust decision than training.</p></div>
      </div>
    </section>

    <section class="rg-section" id="faq" aria-labelledby="rg-faq">
      <h2 id="rg-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The crawlers are sorted. Someone still has to write what they find.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the page, the sitemap, the whole site.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/robots-generator.js"], englishOnly: true })
  );
}

module.exports = { render };

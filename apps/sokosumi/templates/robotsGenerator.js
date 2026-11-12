const shell = require("./shell");

const { esc, attr, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/robots-txt-generator";

// name, provider (drives the coloured badge), group, and the short "why block
// this one" line shown next to it.
const AI_BOTS = [
  // Training & dataset crawlers
  { name: "GPTBot", provider: "OpenAI", group: "training", why: "OpenAI's crawler for training data" },
  { name: "CCBot", provider: "Common Crawl", group: "training", why: "Common Crawl, whose dataset feeds many other models' training data" },
  { name: "Google-Extended", provider: "Google", group: "training", why: "Controls use in Google's Gemini/AI features, separate from Googlebot search indexing" },
  { name: "anthropic-ai", provider: "Anthropic", group: "training", why: "Anthropic's crawler for training data (legacy identifier)" },
  { name: "ClaudeBot", provider: "Anthropic", group: "training", why: "Anthropic's crawler for training data (current identifier)" },
  { name: "Applebot-Extended", provider: "Apple", group: "training", why: "Controls use of your pages to train Apple Intelligence" },
  { name: "Amazonbot", provider: "Amazon", group: "training", why: "Amazon's crawler, used to improve Alexa and AI answers" },
  { name: "Meta-ExternalAgent", provider: "Meta", group: "training", why: "Meta's crawler for training its Llama / Meta AI models" },
  { name: "Bytespider", provider: "ByteDance", group: "training", why: "ByteDance's crawler for training data" },
  { name: "PerplexityBot", provider: "Perplexity", group: "training", why: "Perplexity's crawler, used for both search and training" },
  { name: "cohere-ai", provider: "Cohere", group: "training", why: "Cohere's crawler for training data" },
  { name: "Diffbot", provider: "Diffbot", group: "training", why: "Builds a structured knowledge graph resold to AI and data products" },
  { name: "Omgilibot", provider: "Webz.io", group: "training", why: "Webz.io's crawler, which packages web data into training datasets" },

  // Live browsing agents
  { name: "ChatGPT-User", provider: "OpenAI", group: "agent", why: "OpenAI's live-browsing agent, used when ChatGPT fetches a page for a user" },
  { name: "OAI-SearchBot", provider: "OpenAI", group: "agent", why: "Indexes pages for ChatGPT's built-in search results" },
  { name: "Perplexity-User", provider: "Perplexity", group: "agent", why: "Fetches a page live when a Perplexity user asks about it" },
  { name: "Meta-ExternalFetcher", provider: "Meta", group: "agent", why: "Fetches a page live on behalf of a Meta AI user" },

  // SEO & backlink crawlers
  { name: "AhrefsBot", provider: "Ahrefs", group: "seo", why: "Maps your backlinks for Ahrefs' SEO research tools" },
  { name: "SemrushBot", provider: "Semrush", group: "seo", why: "Crawls for Semrush's competitor and backlink analysis" },
  { name: "MJ12bot", provider: "Majestic", group: "seo", why: "Builds Majestic's backlink index" },
  { name: "DotBot", provider: "Moz", group: "seo", why: "Feeds Moz's link index (Link Explorer)" },
  { name: "rogerbot", provider: "Moz", group: "seo", why: "Moz's site-audit campaign crawler" },
  { name: "DataForSeoBot", provider: "DataForSEO", group: "seo", why: "Collects SERP and backlink data resold through DataForSEO" },
  { name: "BLEXBot", provider: "WebMeUp", group: "seo", why: "WebMeUp / SEOkicks backlink crawler" },
  { name: "Barkrowler", provider: "Babbar", group: "seo", why: "Babbar.tech's crawler for its SEO link metrics" },
];

const PROVIDER_COLOR = {
  OpenAI: "#10a37f",
  Anthropic: "#c9663b",
  Google: "#4285f4",
  "Common Crawl": "#5b6470",
  ByteDance: "#111827",
  Perplexity: "#20808d",
  Apple: "#333333",
  Amazon: "#ff9900",
  Meta: "#1877f2",
  Cohere: "#39594d",
  Diffbot: "#1a8fe3",
  "Webz.io": "#2d6cdf",
  Ahrefs: "#ff6a00",
  Semrush: "#ff642d",
  Majestic: "#2a9d8f",
  Moz: "#00a0d2",
  DataForSEO: "#2f6fed",
  WebMeUp: "#5b6470",
  Babbar: "#6c5ce7",
};

function botCard(b) {
  const color = PROVIDER_COLOR[b.provider] || "#666";
  const initial = b.provider.charAt(0).toUpperCase();
  return `<label class="rg-bot">
    <input type="checkbox" name="aiBot" value="${attr(b.name)}" />
    <span class="rg-bot-badge" style="--rg-badge:${color}" title="${attr(b.provider)}" aria-hidden="true">${esc(initial)}</span>
    <span class="rg-bot-text"><b>${esc(b.name)}</b><i>${esc(b.why)}</i></span>
    <span class="rg-bot-check" aria-hidden="true">✓</span>
  </label>`;
}

// One-tap presets for the areas most sites hide from every crawler, so a
// visitor picks instead of knowing the robots.txt path syntax. The paths ride
// in a data-attribute so the JS stays dumb: it just reads what's ticked.
const QUICK_BLOCKS = [
  { id: "admin", label: "Admin & dashboards", paths: ["/admin/", "/wp-admin/"] },
  { id: "cart", label: "Cart & checkout", paths: ["/cart/", "/checkout/"] },
  { id: "account", label: "Login & account", paths: ["/login", "/account/"] },
  { id: "search", label: "Search & filtered URLs", paths: ["/search", "/*?*"] },
  { id: "api", label: "API & internal", paths: ["/api/"] },
  { id: "thanks", label: "Thank-you pages", paths: ["/thank-you", "/order-confirmation"] },
];

function quickChip(b) {
  return `<label class="rg-chip">
    <input type="checkbox" name="rgPreset" value="${attr(b.id)}" data-paths="${attr(b.paths.join("|"))}" />
    <span class="rg-chip-box" aria-hidden="true"></span>
    <span class="rg-chip-label">${esc(b.label)}</span>
    <span class="rg-chip-paths">${esc(b.paths.join("  "))}</span>
  </label>`;
}

const FAQ = [
  {
    question: "What does a robots.txt file actually do?",
    answer:
      "It tells well-behaved crawlers which parts of your site they may fetch. It's an honor-system request, not a lock: a search engine or AI company that respects robots.txt will stay out of the Disallow'd paths, but nothing stops a crawler that ignores it.",
  },
  {
    question: "Why does the AI-bot list matter if llms.txt exists too?",
    answer:
      "They answer different questions. robots.txt says who may crawl your site at all. llms.txt (see our llms.txt checker) is for the crawlers you do allow: it tells them which pages matter most. Blocking GPTBot's training crawl while still shipping an llms.txt is a coherent, common position: opt out of being training data, opt in to being cited accurately when an agent does visit.",
  },
  {
    question: "Will blocking these bots hurt my SEO?",
    answer:
      "No: none of the bots in the AI-training list are the crawlers that power a search engine's actual results ranking (that's Googlebot, Bingbot, etc., which this tool doesn't touch). Blocking GPTBot or CCBot opts you out of AI training datasets; it has no effect on Google or Bing search rankings.",
  },
  {
    question: "Where does this file need to live?",
    answer:
      "At the root of your domain: https://yourdomain.com/robots.txt: and nowhere else. A robots.txt in a subfolder is ignored.",
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
      "A free robots.txt generator with a built-in checklist of AI crawlers (GPTBot, CCBot, Google-Extended, ClaudeBot and more) and SEO crawlers (AhrefsBot, SemrushBot, MJ12bot and others) to block, plus one-tap quick blocks for common paths and a sitemap line. Runs entirely in the browser.",
    featureList: [
      "One-tap quick blocks for admin, cart, login, search and API paths",
      "Checklist of AI-training, AI-agent and SEO/backlink crawlers to block",
      "Custom Allow/Disallow rules and crawl-delay",
      "Sitemap line",
      "Runs entirely client-side: nothing sent to a server",
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
      title: "Free Robots.txt Generator: with an AI-bot blocklist | Sokosumi",
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
      <p class="rg-lede">Pick what to hide and which AI crawlers to keep out, no syntax to learn: and get a ready-to-paste robots.txt. Runs entirely in your browser.</p>

      <div class="rg-layout">
        <form class="rg-form" id="rgForm" novalidate>
          <div class="rg-block">
            <span class="rg-block-title">Crawl policy</span>
            <div class="rg-policy" role="radiogroup" aria-label="Crawl policy">
              <label class="rg-seg"><input type="radio" name="rgPolicy" value="allow" /><span>Allow all</span></label>
              <label class="rg-seg"><input type="radio" name="rgPolicy" value="except" checked /><span>Allow except</span></label>
              <label class="rg-seg"><input type="radio" name="rgPolicy" value="block" /><span>Block all</span></label>
            </div>
            <p class="rg-policy-note" id="rgPolicyNote"></p>
          </div>

          <div class="rg-block rg-quick" id="rgQuick">
            <span class="rg-block-title">Quick blocks <span class="rg-block-hint">tap what to hide from every crawler</span></span>
            <div class="rg-chips">${QUICK_BLOCKS.map(quickChip).join("")}</div>
          </div>

          <div class="rg-bots" role="group" aria-label="Block AI and SEO crawlers">
            <div class="rg-bots-head">
              <span class="rg-bots-title">Block AI &amp; SEO crawlers</span>
              <div class="rg-bots-actions">
                <span class="rg-bots-count" id="rgBotCount">None blocked</span>
                <button class="rg-mini" id="rgBlockAll" type="button">Block all</button>
                <button class="rg-mini" id="rgClearBots" type="button">Clear</button>
              </div>
            </div>
            <p class="rg-bots-group">Training &amp; dataset crawlers</p>
            ${AI_BOTS.filter((b) => b.group === "training").map(botCard).join("")}
            <p class="rg-bots-group">Live browsing agents</p>
            ${AI_BOTS.filter((b) => b.group === "agent").map(botCard).join("")}
            <p class="rg-bots-group">SEO &amp; backlink crawlers</p>
            ${AI_BOTS.filter((b) => b.group === "seo").map(botCard).join("")}
          </div>

          <div class="rg-field">
            <label for="rgSitemap">Sitemap URL <span>optional</span></label>
            <input id="rgSitemap" type="text" inputmode="url" spellcheck="false" placeholder="https://example.com/sitemap.xml" />
          </div>

          <details class="rg-advanced" id="rgAdvanced">
            <summary>Advanced: custom paths &amp; crawl-delay</summary>
            <div class="rg-advanced-body">
              <div class="rg-field">
                <label for="rgDisallow">Extra Disallow paths <span>one per line</span></label>
                <textarea id="rgDisallow" rows="3" placeholder="/private/&#10;/tmp/"></textarea>
              </div>
              <div class="rg-field">
                <label for="rgAllow">Allow paths <span>optional, one per line</span></label>
                <textarea id="rgAllow" rows="2" placeholder="/"></textarea>
              </div>
              <div class="rg-field rg-field-narrow">
                <label for="rgCrawlDelay">Crawl-delay <span>optional, seconds</span></label>
                <input id="rgCrawlDelay" type="number" min="0" step="1" placeholder="10" />
              </div>
            </div>
          </details>
        </form>

        <div class="rg-preview">
          <div class="rg-preview-head">
            <span class="rg-preview-title">
              <span class="rg-dots" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="rg-preview-name">robots.txt</span>
            </span>
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
      <h2 id="rg-how">Which crawlers you're actually choosing between</h2>
      <p class="rg-sub">Search crawlers, AI-training crawlers, AI browsing agents and SEO crawlers are four different things, and robots.txt lets you treat each one differently.</p>
      <div class="rg-cards">
        <div class="rg-card"><h3>Search crawlers</h3><p>Googlebot, Bingbot: untouched by this tool. Blocking these hides you from search entirely.</p></div>
        <div class="rg-card"><h3>AI-training crawlers</h3><p>GPTBot, CCBot and others scrape pages to train future models. Blocking them has no effect on search rankings.</p></div>
        <div class="rg-card"><h3>AI browsing agents</h3><p>ChatGPT-User and similar fetch a page live, on a person's behalf, when they ask an assistant about it: a different trust decision than training.</p></div>
        <div class="rg-card"><h3>SEO &amp; backlink crawlers</h3><p>AhrefsBot, SemrushBot and others map your links for competitors' research tools. Blocking them won't touch your own Google ranking.</p></div>
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

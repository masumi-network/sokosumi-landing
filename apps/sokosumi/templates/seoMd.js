const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const FAQ = [
  {
    question: "What is an SEO.md file?",
    answer:
      "SEO.md is a plain-text SEO specification for AI agents and developers. It captures a page's real search signals — title, meta description, canonical, Open Graph, structured data, heading structure, keywords, brand entities, navigation and indexing rules — plus SEO, content, brand-clarity and AI-readiness scores and prioritized fixes, in one file you can drop into a repo.",
  },
  {
    question: "How does the Website SEO Analyzer work?",
    answer:
      "Paste a public URL. The analyzer fetches the page and its robots.txt on the server, parses the on-page SEO signals directly from the HTML, scores them against best-practice rules, and produces a structured SEO.md you can review, edit, copy, or download. No sign-up, no browser extension, no API key.",
  },
  {
    question: "Which AI agents can use SEO.md?",
    answer:
      "Any coding or content agent that reads repository files — Claude Code, Cursor, Codex, Copilot, Gemini CLI. Commit SEO.md to your project and tell your agent to follow it when writing metadata, titles, or on-page copy, so its output matches your actual SEO state.",
  },
  {
    question: "Is the analysis accurate?",
    answer:
      "The generator reports exactly what the page's HTML contains at fetch time — it does not guess or invent values. It reads the raw markup, so client-side-rendered content that only appears after JavaScript runs may not be counted. The score is a deterministic rule-based check, not a Google ranking prediction.",
  },
];

function render() {
  const path = "/tools/seo-md";
  const crumbs = [{ label: "Home", href: "/" }, { label: "Free tools", href: "/tools" }, { label: "Website SEO Analyzer" }];
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
    "@type": "SoftwareApplication",
    "@id": `${SITE}${path}#software`,
    name: "Sokosumi Website SEO Analyzer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${path}`,
    description:
      "A free website SEO analyzer that scores a public URL's on-page signals — title, meta, Open Graph, structured data, headings — and generates an SEO.md specification for use with AI agents.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    creator: { "@id": `${SITE}/#organization` },
  };

  return (
    pageStart({
      title: "Free Website SEO Analyzer | Sokosumi",
      description:
        "Analyze any website's on-page SEO: title, meta description, canonical, Open Graph, structured data, headings and a scored checklist — exported as an SEO.md for Claude Code, Cursor and other AI agents.",
      path,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "design-tool-page",
      stylesheets: ["/assets/design-md.css", "/assets/seo-md.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Free Website SEO Analyzer",
        sub: "Turn any website into an AI-readable SEO specification.",
      },
    }) +
    `<section class="dm-tool" id="generator">
      <header class="dm-tool-head">
        <div>
          <p class="dm-overline">Tool · Free</p>
          <h1>Website SEO Analyzer</h1>
        </div>
        <p class="dm-tool-meta"><span class="dm-live">Live</span></p>
      </header>

      <form class="dm-bar" id="seoMdForm" novalidate>
        <label for="seoMdUrl">URL</label>
        <input id="seoMdUrl" name="url" type="url" inputmode="url" autocomplete="url" placeholder="https://your-brand.com" aria-describedby="seoMdError" required />
        <button class="dm-submit" id="seoMdSubmit" type="submit">
          <span class="dm-submit-label">Generate <kbd aria-hidden="true">↵</kbd></span>
          <span class="dm-submit-loading" hidden>Analyzing…</span>
        </button>
      </form>
      <div class="dm-try">
        <span>Try</span>
        <button type="button" data-try="https://stripe.com">Stripe</button>
        <button type="button" data-try="https://linear.app">Linear</button>
        <button type="button" data-try="https://vercel.com">Vercel</button>
        <button type="button" data-try="https://notion.so">Notion</button>
      </div>
      <p class="dm-error" id="seoMdError" role="alert" hidden></p>

      <div class="dm-output" id="seoMdOutput" data-state="empty">
        <div class="dm-output-empty" id="seoMdEmpty">
          <span aria-hidden="true">↑</span>
          <strong>Output will appear here.</strong>
          <small>Paste a URL to read its title, meta, Open Graph, headings, keywords, important pages and declared entities, score them, and get an SEO.md you can edit, copy or download.</small>
        </div>

        <div class="dm-progress" id="seoMdProgress" aria-live="polite" hidden>
          <div class="dm-progress-line" aria-hidden="true"><span></span></div>
          <ol>
            <li data-step="queued"><span>1</span>Fetching the page</li>
            <li data-step="running"><span>2</span>Reading SEO signals</li>
            <li data-step="finishing"><span>3</span>Scoring &amp; writing SEO.md</li>
          </ol>
          <p id="seoMdStatus">Fetching…</p>
        </div>

        <section class="dm-result" id="seoMdResult" hidden aria-labelledby="seoMdResultTitle">
          <header class="dm-result-head">
            <span id="seoMdBrand"></span>
            <div>
              <p class="dm-result-label">Generated file</p>
              <h2 id="seoMdResultTitle">SEO.md</h2>
              <a id="seoMdSource" href="#" target="_blank" rel="noopener noreferrer nofollow"></a>
            </div>
            <div class="dm-result-actions">
              <button class="btn btn-outline" id="seoMdCopy" type="button">Copy</button>
              <button class="btn btn-primary" id="seoMdDownload" type="button">Download</button>
            </div>
          </header>
          <div class="dm-tabs" role="tablist" aria-label="SEO.md result views">
            <button id="seoMdPreviewTab" type="button" role="tab" aria-selected="true" aria-controls="seoMdPreview">Report</button>
            <button id="seoMdFileTab" type="button" role="tab" aria-selected="false" aria-controls="seoMdFile">Edit</button>
          </div>
          <div class="dm-preview" id="seoMdPreview" role="tabpanel" aria-labelledby="seoMdPreviewTab"></div>
          <div class="dm-file" id="seoMdFile" role="tabpanel" aria-labelledby="seoMdFileTab" hidden>
            <label for="seoMdEditor" class="sr-only">SEO.md contents</label>
            <textarea id="seoMdEditor" spellcheck="false" aria-describedby="seoMdEditorHelp"></textarea>
            <p id="seoMdEditorHelp">Edit, then copy or download.</p>
          </div>
          <button class="dm-another" id="seoMdAnother" type="button">Analyze another website</button>
        </section>
      </div>
    </section>

    <section class="dm-how" aria-labelledby="seo-md-how">
      <p class="dm-overline">How it works</p>
      <h2 id="seo-md-how">One file that tells your AI agents the real SEO state.</h2>
      <ol>
        <li><span>01</span><h3>Paste a URL</h3><p>The page and its robots.txt are fetched server-side and parsed straight from the HTML.</p></li>
        <li><span>02</span><h3>Get the report</h3><p>Title, meta, Open Graph, headings, keywords, important pages, brand entities, navigation and discoverability — with SEO, content, brand and AI-readiness scores.</p></li>
        <li><span>03</span><h3>Edit and download</h3><p>Drop SEO.md in your repo. Claude Code, Cursor, Codex and Copilot follow it when writing metadata and copy.</p></li>
      </ol>
    </section>

    <section class="dm-faq" id="faq" aria-labelledby="seo-md-faq-title">
      <h2 id="seo-md-faq-title">Questions</h2>
      <div class="faq-list">
        ${FAQ.map(
          (item) => `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    pageEnd({ scripts: ["/assets/seo-md.js"], englishOnly: true })
  );
}

module.exports = { render };

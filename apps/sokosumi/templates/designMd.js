const shell = require("./shell");
const i18n = require("../lib/i18n");

const { esc, pageStart, pageEnd, SITE } = shell;

const FAQ = [
  {
    question: "What is a DESIGN.md file?",
    answer:
      "DESIGN.md is a plain-text design-system file for AI coding agents. It combines machine-readable tokens with human-readable guidance for colors, typography, spacing, shapes, components, and the visual decisions behind them.",
  },
  {
    question: "How does the DESIGN.md generator work?",
    answer:
      "Enter a public website URL. The generator opens the page in a remote browser, reads its visual signals, and produces a structured DESIGN.md that you can review, edit, copy, or download.",
  },
  {
    question: "Which AI coding agents can use DESIGN.md?",
    answer:
      "DESIGN.md is designed as durable repository context for coding agents and tools. Add the file to your project and tell your agent—such as Claude Code, Cursor, Codex, Copilot, or Gemini CLI—to follow it when implementing interface work.",
  },
];

function render() {
  const path = "/tools/design-md";
  const crumbs = [{ label: "Home", href: "/" }, { label: "Free tools", href: "/tools" }, { label: "DESIGN.md generator" }];
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
    name: "Sokosumi DESIGN.md Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${path}`,
    description:
      "A free web tool that generates a DESIGN.md design-system file from a public website URL for use with AI coding agents.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    creator: { "@id": `${SITE}/#organization` },
  };

  return (
    pageStart({
      title: "Free DESIGN.md generator for AI coding agents | Sokosumi",
      description:
        "Generate a DESIGN.md from any website URL. Extract colors, typography, spacing, components, and design guidance for Claude Code, Cursor, Codex, and other AI coding agents.",
      path,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "design-tool-page",
      stylesheets: ["/assets/design-md.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Free DESIGN.md generator",
        sub: "Turn a website into portable design context for AI coding agents.",
      },
    }) +
    `<section class="dm-tool" id="generator">
      <header class="dm-tool-head">
        <div>
          <p class="dm-overline">Tool · Free</p>
          <h1>DESIGN.md Generator</h1>
        </div>
        <p class="dm-tool-meta"><span class="dm-live">Live</span><a href="https://github.com/google-labs-code/design.md" rel="noopener noreferrer">Spec <span aria-hidden="true">↗</span></a></p>
      </header>

      <form class="dm-bar" id="designMdForm" novalidate>
        <label for="designMdUrl">URL</label>
        <input id="designMdUrl" name="url" type="url" inputmode="url" autocomplete="url" placeholder="https://your-brand.com" aria-describedby="designMdError" required />
        <button class="dm-submit" id="designMdSubmit" type="submit">
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
        <i aria-hidden="true"></i>
        <button type="button" id="designMdExample">Open example</button>
      </div>
      <p class="dm-error" id="designMdError" role="alert" hidden></p>

      <div class="dm-output" id="designMdOutput" data-state="empty">
        <div class="dm-output-empty" id="designMdEmpty">
          <span aria-hidden="true">↑</span>
          <strong>Output will appear here.</strong>
          <small>Paste a URL to extract colors, typography, spacing and components. Edit, copy or download the DESIGN.md.</small>
        </div>

        <div class="dm-progress" id="designMdProgress" aria-live="polite" hidden>
          <div class="dm-progress-line" aria-hidden="true"><span></span></div>
          <ol>
            <li data-step="queued"><span>1</span>Opening the page</li>
            <li data-step="running"><span>2</span>Reading the visual system</li>
            <li data-step="finishing"><span>3</span>Writing DESIGN.md</li>
          </ol>
          <p id="designMdStatus">Queued.</p>
        </div>

        <section class="dm-result" id="designMdResult" hidden aria-labelledby="designMdResultTitle">
          <header class="dm-result-head">
            <div>
              <p class="dm-result-label">Generated file</p>
              <h2 id="designMdResultTitle">DESIGN.md</h2>
              <a id="designMdSource" href="#" target="_blank" rel="noopener noreferrer"></a>
            </div>
            <div class="dm-result-actions">
              <button class="btn btn-outline" id="designMdCopy" type="button">Copy</button>
              <button class="btn btn-primary" id="designMdDownload" type="button">Download</button>
            </div>
          </header>
          <div class="dm-tabs" role="tablist" aria-label="DESIGN.md result views">
            <button id="designMdPreviewTab" type="button" role="tab" aria-selected="true" aria-controls="designMdPreview">Preview</button>
            <button id="designMdFileTab" type="button" role="tab" aria-selected="false" aria-controls="designMdFile">Edit</button>
          </div>
          <div class="dm-preview" id="designMdPreview" role="tabpanel" aria-labelledby="designMdPreviewTab"></div>
          <div class="dm-file" id="designMdFile" role="tabpanel" aria-labelledby="designMdFileTab" hidden>
            <label for="designMdEditor" class="sr-only">DESIGN.md contents</label>
            <textarea id="designMdEditor" spellcheck="false" aria-describedby="designMdEditorHelp"></textarea>
            <p id="designMdEditorHelp">Edit, then copy or download.</p>
          </div>
          <button class="dm-another" id="designMdAnother" type="button">Analyze another website</button>
        </section>
      </div>
    </section>

    <section class="dm-gallery-section" id="analyzed-pages" aria-labelledby="analyzed-pages-title">
      <header class="dm-section-head">
        <h2 id="analyzed-pages-title">Already generated</h2>
        <p class="dm-gallery-count" id="designMdGalleryCount" aria-live="polite">Loading…</p>
      </header>
      <div class="dm-gallery" id="designMdGallery" aria-live="polite"></div>
      <button class="btn btn-outline dm-gallery-more" id="designMdGalleryMore" type="button" hidden>Show all</button>
    </section>

    <section class="dm-how" aria-labelledby="design-md-how">
      <p class="dm-overline">How it works</p>
      <h2 id="design-md-how">One file your AI agents read in every coding session.</h2>
      <ol>
        <li><span>01</span><h3>Paste a URL</h3><p>A remote browser opens the page and reads its computed styles.</p></li>
        <li><span>02</span><h3>Get the spec</h3><p>Colors, type, spacing, components and the reasoning behind them, in the open <a href="https://github.com/google-labs-code/design.md" rel="noopener noreferrer">DESIGN.md format</a>.</p></li>
        <li><span>03</span><h3>Edit and download</h3><p>Drop the file in your repo. Claude Code, Cursor, Codex and Copilot follow it.</p></li>
      </ol>
    </section>

    <section class="dm-faq" id="faq" aria-labelledby="design-md-faq-title">
      <h2 id="design-md-faq-title">Questions</h2>
      <div class="faq-list">
        ${FAQ.map(
          (item) => `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    pageEnd({ scripts: ["/assets/design-md.js"], englishOnly: true })
  );
}

module.exports = { render };

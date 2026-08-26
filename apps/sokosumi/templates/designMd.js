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
  {
    question: "Does DESIGN.md replace a full design system?",
    answer:
      "No. It gives AI agents a portable description of the system: exact tokens plus the reasoning for how to use them. Your source components, accessibility standards, and product requirements remain authoritative.",
  },
];

function homeSection() {
  const de = i18n.locale() === "de";
  const copy = de
    ? {
        title: "Kostenlose Tools für Marketing",
        intro: "Kleine Werkzeuge, die wiederkehrende Vorarbeit in eine nützliche Datei verwandeln. Ohne Account.",
        label: "Kostenlos, ohne Registrierung",
        heading: "DESIGN.md Generator",
        body: "Analysieren Sie eine öffentliche Website und erstellen Sie portable Design-Vorgaben für KI-Coding-Agents – mit Farben, Typografie, Komponenten und den visuellen Entscheidungen dahinter.",
        action: "DESIGN.md erstellen",
        colors: "Farben",
        typography: "Typografie",
        components: "Komponenten",
      }
    : {
        title: "Free tools for marketing",
        intro: "Small utilities that turn repetitive preparation into a useful file. No account required.",
        label: "Free, no sign-up",
        heading: "DESIGN.md generator",
        body: "Analyze a public website and create portable design context for AI coding agents—with colors, typography, components, and the visual decisions behind them.",
        action: "Generate a DESIGN.md",
        colors: "Colors",
        typography: "Typography",
        components: "Components",
      };
  const href = de ? "/en/tools/design-md" : "/tools/design-md";

  return `<section class="block free-tools" id="free-tools" aria-labelledby="free-tools-title">
    <div class="container-app">
      <header class="free-tools-head" data-reveal>
        <h2 id="free-tools-title">${esc(copy.title)}</h2>
        <p>${esc(copy.intro)}</p>
      </header>
      <a class="free-tool-feature" href="${href}" data-reveal>
        <span class="free-tool-copy">
          <span class="free-tool-label">${esc(copy.label)}</span>
          <span class="free-tool-title">${esc(copy.heading)}</span>
          <span class="free-tool-body">${esc(copy.body)}</span>
          <span class="free-tool-action">${esc(copy.action)} <span aria-hidden="true">→</span></span>
        </span>
        <span class="free-tool-doc" aria-hidden="true">
          <span>DESIGN.md</span>
          <span>---</span>
          <span>${esc(copy.colors)}: #6400ff · #0f0e0d · #fafaf9</span>
          <span>${esc(copy.typography)}: Inter · 400 · 1.5</span>
          <span>${esc(copy.components)}: buttons · cards · navigation</span>
          <span>---</span>
          <span>## Brand style</span>
        </span>
      </a>
    </div>
  </section>`;
}

function render() {
  const path = "/tools/design-md";
  const crumbs = [{ label: "Home", href: "/" }, { label: "Free tools", href: "/#free-tools" }, { label: "DESIGN.md generator" }];
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
    `<section class="dm-hero">
      <div class="dm-intro">
        <p class="dm-overline">Free tools for marketing</p>
        <h1>Turn any website into a DESIGN.md</h1>
        <p class="dm-lede">Give AI coding agents the colors, type, spacing, components, and design reasoning they need to build on-brand pages—without rewriting the same prompt for every session.</p>
        <p class="dm-standard">Based on the open <a href="https://github.com/google-labs-code/design.md" rel="noopener noreferrer">Google Labs DESIGN.md format</a>. The format is currently alpha and under active development.</p>
      </div>

      <div class="dm-workbench" id="generator">
        <form class="dm-form" id="designMdForm" novalidate>
          <label for="designMdUrl">Public website URL</label>
          <div class="dm-form-row">
            <input id="designMdUrl" name="url" type="url" inputmode="url" autocomplete="url" placeholder="https://example.com" aria-describedby="designMdHelp designMdError" required />
            <button class="btn btn-primary dm-submit" id="designMdSubmit" type="submit">
              <span class="dm-submit-label">Generate DESIGN.md</span>
              <span class="dm-submit-loading" hidden>Analyzing website…</span>
            </button>
          </div>
          <p class="dm-help" id="designMdHelp">Free to use. A fresh analysis usually takes under two minutes.</p>
          <p class="dm-error" id="designMdError" role="alert" hidden></p>
        </form>

        <div class="dm-progress" id="designMdProgress" aria-live="polite" hidden>
          <div class="dm-progress-line" aria-hidden="true"><span></span></div>
          <ol>
            <li data-step="queued"><span>1</span>Preparing a remote browser</li>
            <li data-step="running"><span>2</span>Reading the page’s visual system</li>
            <li data-step="finishing"><span>3</span>Writing the DESIGN.md file</li>
          </ol>
          <p id="designMdStatus">Your analysis is queued.</p>
        </div>

        <section class="dm-result" id="designMdResult" hidden aria-labelledby="designMdResultTitle">
          <header class="dm-result-head">
            <div>
              <p class="dm-result-label">Generated file</p>
              <h2 id="designMdResultTitle">DESIGN.md</h2>
              <a id="designMdSource" href="#" target="_blank" rel="noopener noreferrer"></a>
            </div>
            <div class="dm-result-actions">
              <button class="btn btn-outline" id="designMdCopy" type="button">Copy file</button>
              <button class="btn btn-primary" id="designMdDownload" type="button">Download</button>
            </div>
          </header>

          <div class="dm-tabs" role="tablist" aria-label="DESIGN.md result views">
            <button id="designMdPreviewTab" type="button" role="tab" aria-selected="true" aria-controls="designMdPreview">Preview</button>
            <button id="designMdFileTab" type="button" role="tab" aria-selected="false" aria-controls="designMdFile">Edit file</button>
          </div>
          <div class="dm-preview" id="designMdPreview" role="tabpanel" aria-labelledby="designMdPreviewTab"></div>
          <div class="dm-file" id="designMdFile" role="tabpanel" aria-labelledby="designMdFileTab" hidden>
            <label for="designMdEditor">DESIGN.md contents</label>
            <textarea id="designMdEditor" spellcheck="false" aria-describedby="designMdEditorHelp"></textarea>
            <p id="designMdEditorHelp">You can edit this text before copying or downloading it.</p>
          </div>
          <button class="dm-another" id="designMdAnother" type="button">Analyze another website</button>
        </section>
      </div>
    </section>

    <section class="dm-explainer" aria-labelledby="what-is-design-md">
      <header>
        <h2 id="what-is-design-md">What is DESIGN.md?</h2>
        <p>DESIGN.md is a self-contained, plain-text representation of a visual system. It lives with the code, so a human or AI agent can read the same rules in a new session, on another page, or in another tool.</p>
      </header>
      <dl class="dm-spec-list">
        <div><dt>Tokens</dt><dd>Exact colors, type styles, spacing, radii, elevation, layout, and component values in YAML frontmatter.</dd></div>
        <div><dt>Guidance</dt><dd>Plain-language decisions for brand style, color use, typography, layout, shapes, components, and what to avoid.</dd></div>
        <div><dt>Handoff</dt><dd>One readable file that travels with the project instead of disappearing inside a prompt or a design review.</dd></div>
      </dl>
    </section>

    <section class="dm-process" aria-labelledby="design-md-process">
      <header>
        <h2 id="design-md-process">From a live page to agent-ready context</h2>
        <p>The generator does the mechanical first pass. You keep the final editorial say.</p>
      </header>
      <ol>
        <li><span>01</span><div><h3>Open the real website</h3><p>A remote browser captures the page and its computed visual signals, including the styles that are difficult to recover from a screenshot alone.</p></div></li>
        <li><span>02</span><div><h3>Extract the system</h3><p>The model organizes colors, typography, spacing, layout, elevation, shapes, components, and design rationale into the DESIGN.md structure.</p></div></li>
        <li><span>03</span><div><h3>Review the file</h3><p>Inspect the preview, edit the text, then copy or download the file into the project where your coding agent can use it.</p></div></li>
      </ol>
    </section>

    <section class="dm-gallery-section" id="analyzed-pages" aria-labelledby="analyzed-pages-title">
      <header class="dm-section-head">
        <div>
          <h2 id="analyzed-pages-title">Previously analyzed websites</h2>
          <p>Open any saved analysis to inspect, copy, edit, or download its generated DESIGN.md.</p>
        </div>
        <p class="dm-gallery-count" id="designMdGalleryCount" aria-live="polite">Loading the archive…</p>
      </header>
      <div class="dm-gallery" id="designMdGallery" aria-live="polite"></div>
      <button class="btn btn-outline dm-gallery-more" id="designMdGalleryMore" type="button" hidden>Show all analyses</button>
    </section>

    <section class="dm-marketing" aria-labelledby="design-md-marketing">
      <div>
        <h2 id="design-md-marketing">Why this matters for marketing teams</h2>
        <p>A landing page is not only copy. It is a repeatable visual language: how campaign colors are used, which type hierarchy carries the message, how CTAs behave, and what the brand never does. DESIGN.md makes that language available to the coding agents producing the next campaign page.</p>
      </div>
      <ul>
        <li>Start a microsite from an existing brand instead of a blank prompt.</li>
        <li>Keep AI-generated campaign pages visually consistent across sessions.</li>
        <li>Give agencies, internal teams, and coding agents one portable reference.</li>
      </ul>
    </section>

    <section class="dm-faq" id="faq" aria-labelledby="design-md-faq-title">
      <h2 id="design-md-faq-title">DESIGN.md questions</h2>
      <div class="faq-list">
        ${FAQ.map(
          (item) => `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    pageEnd({ scripts: ["/assets/design-md.js"], englishOnly: true })
  );
}

module.exports = { homeSection, render };

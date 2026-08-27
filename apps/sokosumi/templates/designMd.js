const shell = require("./shell");
const i18n = require("../lib/i18n");
const archive = require("../lib/designMdArchive");

const { esc, attr, pageStart, pageEnd, SITE } = shell;

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

async function render() {
  // The analysis pages were reachable only after this gallery had been filled by
  // script, which left 100+ indexable pages with no link to them in the HTML.
  // They are rendered server-side now and collapsed with CSS — the same pattern
  // the agent and guide lists use, so a crawler sees every one while a reader
  // still gets twelve.
  const archiveList = await archive.list().catch(() => []);
  const galleryHtml = archiveList.map(galleryCard).join("");
  const countLabel = archiveList.length
    ? `${archiveList.length} ${archiveList.length === 1 ? "saved analysis" : "saved analyses"}`
    : "No saved analyses yet";
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
        "Generate a DESIGN.md from any website URL: colors, typography, spacing, components and design guidance for Claude Code, Cursor, Codex and other coding agents.",
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
          <p class="dm-tool-sub">Paste any website and get a DESIGN.md back: its colours, type, spacing and components written up as context you can hand to an AI coding agent.</p>
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
            <span id="designMdBrand"></span>
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
        <p class="dm-gallery-count" id="designMdGalleryCount" aria-live="polite">${countLabel}</p>
      </header>
      <div class="dm-gallery${archiveList.length > 12 ? " is-collapsed" : ""}" id="designMdGallery" aria-live="polite">${galleryHtml}</div>
      <button class="btn btn-outline dm-gallery-more" id="designMdGalleryMore" type="button"${archiveList.length > 12 ? "" : " hidden"}>Show all</button>
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


// ---------------------------------------------------------------------------
// Server-rendered preview (mirrors assets/design-md.js so the analysis pages
// carry their content without JavaScript).

const safeColor = (v) => (/^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)|[a-z]+)$/i.test(String(v || "").trim()) ? String(v).trim() : "");
const valuesText = (v) => (v && typeof v === "object" ? Object.entries(v).map(([k, x]) => `${k}: ${x}`).join(" · ") : String(v ?? ""));

function proseHtml(body) {
  const out = [];
  let para = [];
  let list = null;
  const flush = () => {
    if (para.length) out.push(`<p>${esc(para.join(" "))}</p>`);
    para = [];
  };
  for (const line of String(body || "").split(/\r?\n/)) {
    const text = line.trim();
    const bullet = /^[-*]\s+(.+)/.exec(text);
    if (bullet) {
      flush();
      if (!list) {
        list = [];
        out.push(list);
      }
      list.push(`<li>${esc(bullet[1])}</li>`);
      continue;
    }
    list = null;
    if (!text) {
      flush();
      continue;
    }
    para.push(text.replace(/^#{1,6}\s+/, ""));
  }
  flush();
  return out.map((x) => (Array.isArray(x) ? `<ul>${x.join("")}</ul>` : x)).join("");
}

function previewHtml(data) {
  const fm = data.frontmatter || {};
  const colors = Object.entries(fm.colors || {});
  const type = Object.entries(fm.typography || {});
  const prose = Array.isArray(data.prose) ? data.prose : [];
  return `<section class="dm-preview-block"><h3>${esc(fm.name || "Extracted design system")}</h3><p>${esc(fm.description || "A structured visual system ready to use as repository context.")}</p></section>
    ${colors.length ? `<section class="dm-preview-block"><h3>Colors</h3><div class="dm-swatches">${colors.map(([k, v]) => `<div class="dm-swatch"><span class="dm-swatch-color"${safeColor(v) ? ` style="background-color:${attr(safeColor(v))}"` : ""}></span><strong>${esc(k)}</strong><small>${esc(String(v))}</small></div>`).join("")}</div></section>` : ""}
    ${type.length ? `<section class="dm-preview-block"><h3>Typography</h3><dl class="dm-type-list">${type.map(([k, v]) => `<div class="dm-type-row"><dt>${esc(k)}</dt><dd>${esc(valuesText(v))}</dd></div>`).join("")}</dl></section>` : ""}
    ${prose.length ? `<section class="dm-preview-block"><h3>Design guidance</h3><div class="dm-prose-sections">${prose.map((sec) => `<section class="dm-prose-section"><h3>${esc(sec.heading || "Guidance")}</h3>${proseHtml(sec.body)}</section>`).join("")}</div></section>` : ""}`;
}

function brandTile(entry, size) {
  const color = safeColor(entry.primaryColor) || "#f0f0f0";
  return `<span class="dm-brand" style="--brand:${attr(color)}">${
    entry.logoUrl ? `<img src="${attr(entry.logoUrl)}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async">` : `<b>${esc(String(entry.name || entry.hostname || "?").slice(0, 1).toUpperCase())}</b>`
  }</span>`;
}

function galleryCard(entry) {
  return `<a class="dm-gallery-card" href="${attr(archive.pathFor(entry))}">
    <span class="dm-gallery-shot"${entry.primaryColor && safeColor(entry.primaryColor) ? ` style="background:${attr(safeColor(entry.primaryColor))}"` : ""}>${entry.screenshotUrl ? `<img src="${attr(entry.screenshotUrl)}" alt="" loading="lazy" decoding="async">` : ""}</span>
    <span class="dm-gallery-meta">${brandTile(entry, 28)}<span><strong>${esc(entry.name || entry.hostname)}</strong><small>${esc(entry.hostname)}</small></span></span>
  </a>`;
}

async function analysis(ctx) {
  const entry = await archive.bySlug(ctx.params.slug).catch(() => null);
  if (!entry) return null;
  if (entry.slug !== String(ctx.params.slug).toLowerCase()) return { redirect: archive.pathFor(entry) };
  const data = await archive.extraction(entry.id);
  const path = archive.pathFor(entry);
  const name = data.name || entry.name || entry.hostname;
  const fm = data.frontmatter || {};
  const colorCount = Object.keys(fm.colors || {}).length;
  const fontFamilies = [...new Set(Object.values(fm.typography || {}).map((t) => t && t.fontFamily).filter(Boolean))];
  const description = `${name} DESIGN.md: ${colorCount} color tokens${fontFamilies.length ? `, ${fontFamilies.slice(0, 2).join(" and ")} typography` : ""}, spacing, shapes and component rules extracted from ${entry.hostname} for AI coding agents. Copy or download the file.`;
  // A rotating window, not the first eight every time: taking the head of the
  // list gave those eight entries every inbound link on the site and left the
  // rest with one apiece. Starting after this entry and wrapping around spreads
  // the links evenly and is still deterministic per page.
  const all = await archive.list().catch(() => []);
  const here = Math.max(0, all.findIndex((e) => e.id === entry.id));
  const others = all.filter((e) => e.id !== entry.id);
  const start = others.length ? here % others.length : 0;
  const related = others.length ? others.slice(start).concat(others.slice(0, start)).slice(0, 8) : [];
  const created = data.createdAt ? new Date(Number(data.createdAt)) : null;
  const jsonld = [
    {
      "@type": "CreativeWork",
      "@id": `${SITE}${path}#file`,
      name: `${name} DESIGN.md`,
      headline: `${name} design system as DESIGN.md`,
      description,
      url: `${SITE}${path}`,
      encodingFormat: "text/markdown",
      isBasedOn: data.url || `https://${entry.hostname}/`,
      about: { "@type": "Organization", name, url: data.url || `https://${entry.hostname}/` },
      ...(created && !Number.isNaN(created.getTime()) ? { dateCreated: created.toISOString().slice(0, 10) } : {}),
      creator: { "@id": `${SITE}/#organization` },
      isPartOf: { "@type": "WebPage", "@id": `${SITE}/tools/design-md#page`, name: "DESIGN.md Generator" },
    },
  ];
  return (
    pageStart({
      title: `${name} DESIGN.md: colors, type, components | Sokosumi`,
      description: description.slice(0, 160),
      path,
      englishOnly: true,
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Free tools", href: "/tools" }, { label: "DESIGN.md generator", href: "/tools/design-md" }, { label: name }],
      mainClass: "design-tool-page dm-analysis-page",
      stylesheets: ["/assets/design-md.css"],
      jsonld,
      og: { type: "page", eyebrow: "DESIGN.md", title: `${name} design system`, sub: `Extracted from ${entry.hostname}` },
    }) +
    `<section class="dm-analysis">
      <header class="dm-analysis-head">
        ${brandTile({ ...entry, logoUrl: data.logoProxyUrl || entry.logoUrl }, 44)}
        <div>
          <p class="dm-overline">DESIGN.md · Analysis</p>
          <h1>${esc(name)}</h1>
          <p class="dm-analysis-source"><a href="${attr(data.url || `https://${entry.hostname}/`)}" rel="noopener noreferrer nofollow">${esc(entry.hostname)}</a>${created && !Number.isNaN(created.getTime()) ? ` · ${esc(created.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }))}` : ""}${colorCount ? ` · ${colorCount} colors` : ""}${fontFamilies.length ? ` · ${esc(fontFamilies.slice(0, 2).join(", "))}` : ""}</p>
        </div>
        <div class="dm-result-actions">
          <button class="btn btn-outline" id="designMdCopy" type="button">Copy</button>
          <button class="btn btn-primary" id="designMdDownload" type="button">Download</button>
        </div>
      </header>

      <div class="dm-analysis-grid">
        <div class="dm-output" data-state="result">
          <div class="dm-result">
            <div class="dm-tabs" role="tablist" aria-label="DESIGN.md views">
              <button id="designMdPreviewTab" type="button" role="tab" aria-selected="true" aria-controls="designMdPreview">Preview</button>
              <button id="designMdFileTab" type="button" role="tab" aria-selected="false" aria-controls="designMdFile">Edit</button>
            </div>
            <div class="dm-preview" id="designMdPreview" role="tabpanel" aria-labelledby="designMdPreviewTab">${previewHtml(data)}</div>
            <div class="dm-file" id="designMdFile" role="tabpanel" aria-labelledby="designMdFileTab" hidden>
              <label for="designMdEditor" class="sr-only">DESIGN.md contents</label>
              <textarea id="designMdEditor" spellcheck="false">${esc(String(data.designMd || ""))}</textarea>
              <p>Edit, then copy or download.</p>
            </div>
          </div>
        </div>
        <aside class="dm-analysis-side">
          ${data.screenshotUrl ? `<figure class="dm-analysis-shot"><img src="${attr(data.screenshotUrl)}" alt="Screenshot of ${attr(entry.hostname)}" width="1200" height="750" loading="lazy" decoding="async"><figcaption>${esc(entry.hostname)} at analysis time</figcaption></figure>` : ""}
          <a class="dm-analysis-cta" href="/tools/design-md#generator">Generate one for your site <span aria-hidden="true">→</span></a>
        </aside>
      </div>
    </section>

    ${related.length ? `<section class="dm-gallery-section" aria-labelledby="dm-related-title">
      <header class="dm-section-head"><h2 id="dm-related-title">More analyses</h2><a class="dm-gallery-all" href="/tools/design-md#analyzed-pages">All ${all.length} →</a></header>
      <div class="dm-gallery">${related.map(galleryCard).join("")}</div>
    </section>` : ""}` +
    pageEnd({ scripts: ["/assets/design-md-analysis.js"], englishOnly: true })
  );
}

module.exports = { render, analysis, galleryCard };

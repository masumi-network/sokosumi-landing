const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const FAQ = [
  {
    question: "How does bold text work on LinkedIn?",
    answer:
      "LinkedIn has no bold button for posts, so formatters swap normal letters for Unicode characters that look bold — 𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀. They are different characters, not styling, which is why they survive pasting into LinkedIn, X, WhatsApp or anywhere else text goes.",
  },
  {
    question: "Does formatted text hurt reach or accessibility?",
    answer:
      "Screen readers often spell Unicode-formatted words letter by letter or skip them, and search inside LinkedIn may not match them. Use bold for a few words of emphasis, not whole paragraphs, and never for names people might search for.",
  },
  {
    question: "How long can a LinkedIn post be?",
    answer:
      "3,000 characters. Readers see roughly the first 210 characters on desktop (about 140 on mobile) before the “…see more” fold, so the first sentence decides whether the rest gets read. The counter and preview above track both.",
  },
  {
    question: "Why do my line breaks disappear on LinkedIn?",
    answer:
      "LinkedIn keeps single line breaks but collapses runs of blank lines. Write with one empty line between paragraphs and check the preview — what you see there is what the feed shows.",
  },
];

function render() {
  const path = "/tools/linkedin-formatter";
  const crumbs = [{ label: "Home", href: "/" }, { label: "Free tools", href: "/tools" }, { label: "LinkedIn text formatter" }];
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
    name: "Sokosumi LinkedIn Text Formatter",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE}${path}`,
    description:
      "A free LinkedIn text formatter: bold and italic Unicode text, bullet points, a live post preview with the “see more” fold, and a character counter against the 3,000 limit.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    creator: { "@id": `${SITE}/#organization` },
  };

  return (
    pageStart({
      title: "LinkedIn Text Formatter — bold, italics & post preview",
      description:
        "Free LinkedIn text formatter: make text bold or italic, add bullets, preview the “…see more” fold and count characters against the 3,000 limit. Works for posts, comments and your headline. No sign-up.",
      path,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "design-tool-page",
      stylesheets: ["/assets/design-md.css", "/assets/linkedin-formatter.css", "/assets/email-gate.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "LinkedIn text formatter",
        sub: "Bold, italics, bullets — with the “see more” fold preview.",
      },
    }) +
    `<section class="dm-tool" id="formatter">
      <header class="dm-tool-head">
        <div>
          <p class="dm-overline">Free tool · No sign-up</p>
          <h1>LinkedIn Text Formatter</h1>
        </div>
      </header>
      <p class="dm-tool-sub">Select text, make it bold or italic, and see the post the way the feed shows it — fold included. Then copy and paste into LinkedIn.</p>

      <div class="lif-grid">
        <div class="lif-editor-col">
          <div class="lif-toolbar" role="toolbar" aria-label="Formatting">
            <button type="button" id="lifBold" title="Bold selection"><strong>B</strong></button>
            <button type="button" id="lifItalic" title="Italic selection"><em>I</em></button>
            <button type="button" id="lifBoldItalic" title="Bold italic selection"><strong><em>BI</em></strong></button>
            <button type="button" id="lifBullet" title="Bullet the selected lines">• List</button>
            <button type="button" id="lifPlain" title="Remove formatting from selection">Clear</button>
          </div>
          <label class="sr-only" for="lifInput">Your post</label>
          <textarea id="lifInput" spellcheck="true" placeholder="Write or paste your post, select the words to format…"></textarea>
          <div class="lif-meta">
            <span id="lifCount">0 / 3,000 characters</span>
            <span id="lifFold">Fold after ~210 characters (desktop)</span>
          </div>
          <button class="btn btn-primary lif-copy" id="lifCopy" type="button">Copy formatted text</button>
        </div>

        <div class="lif-preview-col" aria-label="LinkedIn preview">
          <p class="lif-preview-label">Feed preview</p>
          <div class="lif-card">
            <div class="lif-card-head">
              <span class="lif-avatar" aria-hidden="true"></span>
              <span class="lif-id"><strong>Your Name</strong><small>Marketing · 2h</small></span>
            </div>
            <div class="lif-card-body">
              <p class="lif-text" id="lifPreviewText"></p>
              <button type="button" class="lif-seemore" id="lifSeeMore" hidden>…see more</button>
            </div>
          </div>
          <p class="lif-preview-note">Desktop cuts at about 210 characters, mobile at about 140. What sits above the fold decides the click.</p>
        </div>
      </div>
    </section>

    <section class="lif-section" aria-labelledby="lif-limits-h">
      <h2 id="lif-limits-h">LinkedIn character limits</h2>
      <div class="lif-table-wrap"><table class="lif-table">
        <thead><tr><th>Field</th><th>Limit</th></tr></thead>
        <tbody>
          <tr><td>Post</td><td>3,000 characters</td></tr>
          <tr><td>Comment</td><td>1,250 characters</td></tr>
          <tr><td>Headline</td><td>220 characters</td></tr>
          <tr><td>About section</td><td>2,600 characters</td></tr>
          <tr><td>Visible before "…see more"</td><td>~210 desktop · ~140 mobile</td></tr>
        </tbody>
      </table></div>
      <p>The formatter counts against the 3,000-character post limit and marks the fold in the preview.</p>
    </section>

    <section class="dm-faq" id="faq" aria-labelledby="lif-faq-title">
      <h2 id="lif-faq-title">Questions</h2>
      <div class="faq-list">
        ${FAQ.map(
          (item) => `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "Formatting is the easy part.",
      subheading: "Sokosumi's AI coworkers draft the LinkedIn posts — you make the final call.",
      ctaLabel: "Start free",
    }) +
    pageEnd({ scripts: ["/assets/linkedin-formatter.js", "/assets/email-gate.js"], englishOnly: true })
  );
}

module.exports = { render };

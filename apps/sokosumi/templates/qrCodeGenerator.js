const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/qr-code-generator";

const FAQ = [
  {
    question: "What can I encode into a QR code?",
    answer:
      "Any text up to 1,500 characters — a URL, a Wi-Fi password, a vCard, plain text, whatever you need. The code just carries text; it isn't a link shortener or a tracker.",
  },
  {
    question: "What does the error-correction level do?",
    answer:
      "It trades code density for damage tolerance. Higher levels (Q, H) can still scan even if part of the code is smudged, scratched, or covered by a logo, but they pack in less data per size — so very long text may need a lower level (L, M) to fit at all.",
  },
  {
    question: "Can I use custom colors, or put a logo on it?",
    answer:
      "Custom foreground and background colors, yes — pick them below. There's no logo overlay here: a logo covering part of the code needs a high error-correction level and enough contrast to still scan, and getting that wrong produces a code that looks right but fails at the register. Low-contrast color choices carry the same risk — test any custom-colored code with a real phone camera before printing it anywhere.",
  },
  {
    question: "Is my data sent anywhere or stored?",
    answer:
      "The text you enter is sent once to generate the image and is never fetched, parsed, logged, or stored — even when what you encode is a URL, nothing requests it. The generated image itself isn't saved either; refreshing the page clears it.",
  },
  {
    question: "PNG or SVG — which should I pick?",
    answer:
      "SVG for anything printed (flyers, packaging, business cards) — it scales to any size with no pixelation. PNG for anything screen-based (a slide, a social post, a webpage) where a fixed-size raster is simpler to drop in.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "QR Code Generator" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi QR Code Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free QR code generator: encode a URL, Wi-Fi password, or any text into a PNG or SVG QR code, with adjustable size, error-correction level, and colors. No sign-up, nothing stored.",
    featureList: [
      "PNG or SVG output",
      "Adjustable size and error-correction level",
      "Custom foreground and background colors",
      "Nothing encoded is fetched, logged, or stored",
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
      title: "Free QR Code Generator — PNG or SVG | Sokosumi",
      description:
        "Generate a free QR code from any URL or text. PNG or SVG output, adjustable size, error-correction level and colors. No sign-up, nothing stored.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "qg-tool-page",
      stylesheets: ["/assets/qr-code-generator.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Free QR Code Generator",
        sub: "Any URL or text, as a scannable PNG or SVG.",
      },
    }) +
    `<section class="qg-head" id="generator">
      <p class="qg-overline">Free · no sign-up</p>
      <h1>QR Code Generator</h1>
      <p class="qg-lede">Enter a URL or any text, pick a format, size and color, and download a scannable QR code. Nothing you enter is fetched, logged, or stored.</p>

      <div class="qg-layout">
        <form class="qg-form" id="qgForm" novalidate>
          <div class="qg-field">
            <label for="qgData">Text or URL</label>
            <textarea id="qgData" rows="3" maxlength="1500" placeholder="https://your-brand.com" required></textarea>
          </div>
          <div class="qg-row">
            <div class="qg-field">
              <label for="qgFormat">Format</label>
              <select id="qgFormat">
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>
            </div>
            <div class="qg-field">
              <label for="qgEc">Error correction</label>
              <select id="qgEc">
                <option value="L">Low (L)</option>
                <option value="M" selected>Medium (M)</option>
                <option value="Q">Quartile (Q)</option>
                <option value="H">High (H)</option>
              </select>
            </div>
            <div class="qg-field">
              <label for="qgSize">Size <span id="qgSizeValue">320px</span></label>
              <input id="qgSize" type="range" min="128" max="1024" step="32" value="320" />
            </div>
          </div>
          <div class="qg-row">
            <div class="qg-field">
              <label for="qgFg">Foreground</label>
              <input id="qgFg" type="color" value="#0f0e0d" />
            </div>
            <div class="qg-field">
              <label for="qgBg">Background</label>
              <input id="qgBg" type="color" value="#ffffff" />
            </div>
            <button class="qg-submit" id="qgSubmit" type="button">Generate</button>
          </div>
          <p class="qg-error" id="qgError" role="alert" hidden></p>
        </form>

        <div class="qg-preview">
          <div class="qg-preview-stage" id="qgStage">
            <span class="qg-preview-empty" id="qgEmpty">Your QR code will appear here.</span>
            <img id="qgImage" alt="Generated QR code" hidden />
            <div class="qg-preview-loading" id="qgLoading" hidden><span class="qg-spin" aria-hidden="true"></span></div>
          </div>
          <a class="btn btn-primary" id="qgDownload" download hidden>Download</a>
        </div>
      </div>
    </section>

    <section class="qg-section" aria-labelledby="qg-how">
      <h2 id="qg-how">Picking the right settings</h2>
      <div class="qg-cards">
        <div class="qg-card"><h3>Error correction</h3><p>Higher levels survive smudging or partial damage, at the cost of a denser code for the same size. Medium is a solid default for most uses.</p></div>
        <div class="qg-card"><h3>Size &amp; format</h3><p>SVG for anything printed — it scales without pixelating. PNG for anything on a screen, where a fixed size is simpler.</p></div>
        <div class="qg-card"><h3>Colors</h3><p>Keep strong contrast between foreground and background. Low-contrast custom colors can produce a code that looks fine but won't scan.</p></div>
      </div>
    </section>

    <section class="qg-section" id="faq" aria-labelledby="qg-faq">
      <h2 id="qg-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The code is generated. Someone still has to design what it's printed on.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the flyer, the packaging, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/qr-code-generator.js"], englishOnly: true })
  );
}

module.exports = { render };

const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/image-compressor";

const FAQ = [
  {
    question: "What does the image compressor do?",
    answer:
      "Drop in a JPEG, PNG, WebP, AVIF or GIF and it re-encodes it with real compression — not a size estimate — so you get an actual smaller file back, plus its before/after size and the percentage saved.",
  },
  {
    question: "Is my image uploaded anywhere or stored?",
    answer:
      "It's processed in memory for that one request and sent straight back — never written to disk, a database, or a log. Nothing is kept after the response is sent.",
  },
  {
    question: "Which output format should I pick?",
    answer:
      "Auto picks JPEG for photos and PNG for images with transparency, which is a safe default. WebP is a smaller, modern choice supported by every current browser. AVIF compresses further still but takes longer to encode and has slightly less universal support in older tools.",
  },
  {
    question: "What does the quality slider control?",
    answer:
      "How much detail the encoder is allowed to discard — lower keeps the file smaller at the cost of visible artifacting, higher preserves more detail at a larger size. 75 is a reasonable default for web use; drag it up if you see banding or blockiness in the result.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Uploads are capped at 15MB. Most exported photos and screenshots are well under that; a source file already larger than 15MB should be downsized before compressing.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Image Compressor" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Image Compressor",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free image compressor that re-encodes a JPEG, PNG, WebP, AVIF or GIF to a smaller file size, with a live before/after size comparison and a choice of output format and quality.",
    featureList: [
      "Real re-encoding, not an estimate — an actual smaller file back",
      "JPEG, PNG, WebP and AVIF output",
      "Adjustable quality with a live before/after size comparison",
      "Processed in memory, never stored",
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
      title: "Free Image Compressor — reduce file size online | Sokosumi",
      description:
        "Compress a JPEG, PNG, WebP, AVIF or GIF online for free. Pick an output format and quality, and get a smaller file back instantly with a before/after size comparison. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "ic-tool-page",
      stylesheets: ["/assets/image-compressor.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Free Image Compressor",
        sub: "Reduce any image's file size, with a live before/after comparison.",
      },
    }) +
    `<section class="ic-head" id="compressor">
      <p class="ic-overline">Free · no sign-up</p>
      <h1>Image Compressor</h1>
      <p class="ic-lede">Drop in an image, pick a format and quality, and get a real compressed file back with the exact size you saved.</p>

      <div class="ic-drop" id="icDrop" tabindex="0" role="button" aria-label="Choose or drop an image to compress">
        <input id="icFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" hidden />
        <span class="ic-drop-icon" aria-hidden="true">↑</span>
        <strong>Drop an image here, or click to choose one</strong>
        <small>JPEG, PNG, WebP, AVIF or GIF · up to 15MB</small>
      </div>

      <div class="ic-controls" id="icControls" hidden>
        <div class="ic-field">
          <label for="icFormat">Output format</label>
          <select id="icFormat">
            <option value="auto">Auto</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
            <option value="avif">AVIF</option>
          </select>
        </div>
        <div class="ic-field ic-field-slider">
          <label for="icQuality">Quality <span id="icQualityValue">75</span></label>
          <input id="icQuality" type="range" min="10" max="95" step="1" value="75" />
        </div>
        <button class="ic-submit" id="icSubmit" type="button">Compress</button>
      </div>

      <p class="ic-error" id="icError" role="alert" hidden></p>
    </section>

    <div class="ic-loading" id="icLoading" hidden>
      <span class="ic-spin" aria-hidden="true"></span>
      <span>Compressing…</span>
    </div>

    <section class="ic-result" id="icResult" aria-label="Result" hidden>
      <div class="ic-compare">
        <figure class="ic-figure">
          <img id="icBeforeImg" alt="Original image" />
          <figcaption><span>Original</span><b id="icBeforeStats"></b></figcaption>
        </figure>
        <figure class="ic-figure">
          <img id="icAfterImg" alt="Compressed image" />
          <figcaption><span>Compressed</span><b id="icAfterStats"></b></figcaption>
        </figure>
      </div>
      <div class="ic-summary">
        <p class="ic-summary-savings" id="icSavings"></p>
        <div class="ic-summary-actions">
          <a class="btn btn-primary" id="icDownload" download>Download</a>
          <button class="btn btn-outline" id="icAnother" type="button">Compress another image</button>
        </div>
      </div>
    </section>

    <section class="ic-section" aria-labelledby="ic-how">
      <h2 id="ic-how">How it works</h2>
      <p class="ic-sub">Real re-encoding via the same image library the site's own Open Graph checker uses — not a size estimate.</p>
      <div class="ic-cards">
        <div class="ic-card"><h3>1. Drop an image</h3><p>Processed in your browser session only — never uploaded to storage or logged.</p></div>
        <div class="ic-card"><h3>2. Pick format &amp; quality</h3><p>Auto picks a sensible default; WebP and AVIF push file size down further for browsers that support them.</p></div>
        <div class="ic-card"><h3>3. Download the result</h3><p>See the exact before/after size and percentage saved, then download the compressed file.</p></div>
      </div>
    </section>

    <section class="ic-section" id="faq" aria-labelledby="ic-faq">
      <h2 id="ic-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The image is smaller. Someone still has to make a hundred more of them.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: resized, re-exported, on-brand.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/image-compressor.js"], englishOnly: true })
  );
}

module.exports = { render };

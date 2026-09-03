const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/image-audit";

const FAQ = [
  {
    question: "What does the image audit check?",
    answer:
      "It crawls a site — starting from its sitemap, or its homepage links when there is no sitemap — and reads every <img> and <picture> it finds on each page. For each image it records whether the image has alt text, which format it is served in (AVIF, WebP, JPEG, PNG, GIF or SVG), and every page the image appears on.",
  },
  {
    question: "Why does missing alt text matter?",
    answer:
      "Alt text is what a screen reader announces in place of an image, and it is one of the signals search engines use to understand what an image shows. An <img> with no alt attribute, or an empty one on an image that isn't purely decorative, is invisible to both.",
  },
  {
    question: "Why flag JPEG, PNG and GIF as legacy?",
    answer:
      "AVIF and WebP compress photographic and graphic images to a fraction of the size of an equivalent JPEG or PNG at the same visual quality, which is a direct hit to page load time. SVG isn't flagged — it's a vector format solving a different problem, not a raster codec to replace.",
  },
  {
    question: "How many pages does it crawl?",
    answer:
      "Up to 20, prioritizing the homepage and shallower paths. Large sites will have more pages than that in their sitemap; this is meant as a sample audit, not a complete site crawl.",
  },
  {
    question: "Does it fetch each image to check its format?",
    answer:
      "Only when it has to. Most sites give away an image's format in its file extension. For the handful that serve images from an extensionless CDN path, a capped number get a real request so the format comes from the actual Content-Type header rather than a guess.",
  },
  {
    question: "How is the size savings estimated?",
    answer:
      "For legacy JPEG/PNG/GIF images, we request the real file size and apply typical WebP savings at equivalent visual quality (roughly 30% off JPEG, 45% off PNG, 40% off GIF, based on Google's own WebP studies). Nothing is actually re-encoded, so treat it as a directional estimate, not a guarantee — and it only covers images we could get a size for.",
  },
  {
    question: "What do the layout-shift and lazy-loading checks look for?",
    answer:
      "Layout shift flags any <img> missing a width and height attribute — without both, the browser reserves no space for it before it loads, so the page jumps underneath it. Lazy-loading flags images (other than the first on a page, which is usually the one you want loading immediately) missing loading=\"lazy\".",
  },
];

function render() {
  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Image Audit",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free tool that crawls a website and lists every image missing alt text, plus every image still served as JPEG, PNG or GIF instead of AVIF or WebP — with the page each one was found on.",
    featureList: [
      "Site-wide image crawl from a sitemap or homepage links",
      "Missing and empty alt text detection",
      "AVIF / WebP format detection against legacy JPEG, PNG and GIF",
      "Estimated file-size savings from converting legacy images",
      "Missing width/height (layout shift) and missing lazy-loading checks",
      "Per-image list of every page it appears on, with thumbnails, search, sort and pagination",
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
      title: "Free image audit — alt text & AVIF/WebP checker | Sokosumi",
      description:
        "Crawl any website and get a list of every image missing alt text and every image still in a legacy JPEG/PNG/GIF format instead of AVIF or WebP, with the page each one is on. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Free tools", href: "/tools" }, { label: "Image audit" }],
      mainClass: "ia-tool-page",
      stylesheets: ["/assets/image-audit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Free image audit",
        sub: "Every image missing alt text, and every image still in a legacy format.",
      },
    }) +
    `<section class="ia-head" id="auditor">
      <p class="ia-overline">Free · no sign-up</p>
      <h1>Image audit</h1>
      <p class="ia-lede">Paste a domain. We crawl the site, read every image on it, and hand back the list: which ones have no alt text, and which ones are still JPEG or PNG when AVIF or WebP would load faster — with the page each one lives on.</p>

      <form class="ia-bar" id="iaForm" novalidate>
        <label class="sr-only" for="iaUrl">Site to audit</label>
        <input id="iaUrl" name="url" type="text" inputmode="url" autocomplete="url" spellcheck="false" placeholder="example.com" aria-describedby="iaError" required />
        <button class="ia-submit" id="iaSubmit" type="submit">Audit images</button>
      </form>

      <div class="ia-try">
        <span>Try</span>
        <button type="button" data-try="https://stripe.com">Stripe</button>
        <button type="button" data-try="https://vercel.com">Vercel</button>
        <button type="button" data-try="https://www.sokosumi.com">Sokosumi</button>
      </div>

      <p class="ia-error" id="iaError" role="alert" hidden></p>
    </section>

    <div class="ia-loading" id="iaLoading" hidden>
      <span class="ia-spin" aria-hidden="true"></span>
      <span id="iaLoadingText">Crawling the site and reading its images — this can take up to a minute…</span>
    </div>

    <section class="ia-result" id="iaResult" aria-label="Results" hidden>
      <div class="ia-summary" id="iaSummary"></div>

      <div class="ia-checks" id="iaChecks"></div>

      <div class="ia-images" id="iaImages" hidden>
        <div class="ia-images-head">
          <div class="ia-tabs" id="iaTabs" role="tablist" aria-label="Image list"></div>
          <div class="ia-images-actions">
            <label class="sr-only" for="iaSearch">Filter by URL</label>
            <input class="ia-search" id="iaSearch" type="search" placeholder="Filter by URL or page…" autocomplete="off" />
            <button class="ia-btn" id="iaCopy" type="button">Copy list</button>
            <button class="ia-btn" id="iaDownload" type="button">Download .txt</button>
          </div>
        </div>
        <div class="ia-table-wrap">
          <table class="ia-table">
            <thead>
              <tr>
                <th scope="col" class="ia-th-thumb"></th>
                <th scope="col"><button type="button" class="ia-sort" data-sort="url">Image<span class="ia-sort-arrow"></span></button></th>
                <th scope="col"><button type="button" class="ia-sort" data-sort="format">Format<span class="ia-sort-arrow"></span></button></th>
                <th scope="col"><button type="button" class="ia-sort" data-sort="size">Size<span class="ia-sort-arrow"></span></button></th>
                <th scope="col"><button type="button" class="ia-sort" data-sort="alt">Alt text<span class="ia-sort-arrow"></span></button></th>
                <th scope="col"><button type="button" class="ia-sort" data-sort="pages">Found on<span class="ia-sort-arrow"></span></button></th>
              </tr>
            </thead>
            <tbody id="iaTableBody"></tbody>
          </table>
        </div>
        <p class="ia-empty" id="iaTableEmpty" hidden>Nothing in this list.</p>
        <div class="ia-pagination" id="iaPagination" hidden>
          <button class="ia-btn" id="iaPrev" type="button">Prev</button>
          <span class="ia-page-status" id="iaPageStatus"></span>
          <button class="ia-btn" id="iaNext" type="button">Next</button>
        </div>
      </div>
    </section>

    <section class="ia-section" aria-labelledby="ia-how">
      <h2 id="ia-how">How it works</h2>
      <p class="ia-sub">No headless browser, no LLM — it reads the HTML each page actually sends, the same way a search crawler does. Images that only appear after client-side JavaScript runs will not be counted.</p>
      <div class="ia-cards">
        <div class="ia-card"><h3>1. Find the pages</h3><p>Starts from the site's sitemap.xml, or a sitemap index's child sitemaps. No sitemap? Falls back to the links on the homepage.</p></div>
        <div class="ia-card"><h3>2. Read the images</h3><p>Every &lt;img&gt; and &lt;picture&gt; on up to 20 pages, resolved to an absolute URL, deduplicated across the whole site.</p></div>
        <div class="ia-card"><h3>3. Flag the gaps</h3><p>No alt attribute, an empty one, or a legacy JPEG/PNG/GIF where AVIF or WebP would do — sorted so the worst offenders are first.</p></div>
      </div>
    </section>

    <section class="ia-section" id="faq" aria-labelledby="ia-faq">
      <h2 id="ia-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The audit finds the gaps. Someone still has to fix them.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: rewritten alt text, re-exported images, the whole pass.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/image-audit.js"], englishOnly: true })
  );
}

module.exports = { render };

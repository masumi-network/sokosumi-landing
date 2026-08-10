// Renders CMS layout blocks (payload's shared 15-block library — see
// payload-cms/src/blocks/layout.ts) to static HTML in the site's design
// language. richText arrives pre-rendered as contentHtml (a save-time hook
// in the CMS), so no Lexical parsing happens at request time.
//
// Block HTML is trusted for structure but every FIELD value is escaped;
// contentHtml is CMS-rendered HTML from a locked editor and is inserted
// as-is (same trust model as masumi.network).

const shell = require("./shell");
const { esc, attr, icon } = shell;
const { mediaUrl } = require("../lib/cms");

function ctaLink(label, href, cls) {
  if (!label || !href) return "";
  return `<a class="btn ${cls || "btn-primary"}" href="${attr(href)}">${esc(label)}</a>`;
}

function blkHead(block) {
  if (!block.heading && !block.subheading) return "";
  return `<div class="blk-head">
    ${block.heading ? `<h2>${esc(block.heading)}</h2>` : ""}
    ${block.subheading ? `<p class="sub">${esc(block.subheading)}</p>` : ""}
  </div>`;
}

const RENDER = {
  hero(b) {
    return `<section class="blk blk-hero" data-reveal>
      ${b.eyebrow ? `<span class="eyebrow">${esc(b.eyebrow)}</span>` : ""}
      <h1>${esc(b.heading)}</h1>
      ${b.subheading ? `<p class="sub">${esc(b.subheading)}</p>` : ""}
      ${
        b.ctaLabel || b.secondaryCtaLabel
          ? `<div class="cta-row">${ctaLink(b.ctaLabel, b.ctaHref, "btn-primary btn-lg")}${ctaLink(
              b.secondaryCtaLabel,
              b.secondaryCtaHref,
              "btn-outline btn-lg",
            )}</div>`
          : ""
      }
    </section>`;
  },

  richText(b) {
    return `<section class="blk" data-reveal><div class="prose">${b.contentHtml || ""}</div></section>`;
  },

  featureGrid(b) {
    const items = (b.items || [])
      .map(
        (it) => `<div class="card">
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.text)}</p>
      </div>`,
      )
      .join("");
    const cols = (b.items || []).length % 3 === 0 || (b.items || []).length > 4 ? " cols-3" : "";
    return `<section class="blk" data-reveal>${blkHead(b)}<div class="blk-grid${cols}">${items}</div></section>`;
  },

  logoStrip(b) {
    const logos = (b.logos || [])
      .map((m) => {
        const url = mediaUrl(m);
        return url ? `<img src="${attr(url)}" alt="${attr(m.alt || "")}" loading="lazy" />` : "";
      })
      .join("");
    return `<section class="blk" data-reveal>${blkHead(b)}<div class="blk-logos">${logos}</div></section>`;
  },

  faq(b) {
    const items = (b.items || [])
      .map(
        (it) => `<details class="faq-item">
        <summary>${esc(it.question)}<span class="faq-x">+</span></summary>
        <p class="faq-a">${esc(it.answer)}</p>
      </details>`,
      )
      .join("");
    return `<section class="blk" data-reveal>${blkHead(b)}<div class="blk-faq">${items}</div></section>`;
  },

  comparisonTable(b) {
    const cols = b.columns || [];
    const ths = cols
      .map((c) => `<th class="${c.highlight ? "hl" : ""}">${esc(c.label)}</th>`)
      .join("");
    const rows = (b.rows || [])
      .map((r) => {
        const cells = (r.cells || [])
          .map((cell, i) => {
            const v = String(cell.value || "").trim();
            const inner =
              v.toLowerCase() === "yes"
                ? `<span class="cmp-yes">${icon("check", 12)}</span>`
                : v.toLowerCase() === "no"
                  ? `<span class="cmp-no"></span>`
                  : esc(v);
            return `<td class="${cols[i] && cols[i].highlight ? "hl" : ""}">${inner}</td>`;
          })
          .join("");
        return `<tr><td class="row-label">${esc(r.label)}${
          r.note ? `<span class="row-note">${esc(r.note)}</span>` : ""
        }</td>${cells}</tr>`;
      })
      .join("");
    return `<section class="blk" data-reveal>${blkHead(b)}
      <div class="cmp-table-wrap"><table class="cmp-table">
        <thead><tr><th></th>${ths}</tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </section>`;
  },

  ctaBand(b) {
    return shell.ctaBand(b);
  },

  stats(b) {
    const items = (b.items || [])
      .map(
        (it) => `<div class="stat">
        <div class="value">${esc(it.value)}</div>
        <div class="label">${esc(it.label)}</div>
      </div>`,
      )
      .join("");
    return `<section class="blk" data-reveal>${blkHead(b)}<div class="blk-stats" style="--n:${
      (b.items || []).length || 4
    }">${items}</div></section>`;
  },

  steps(b) {
    const items = (b.items || [])
      .map(
        (it, i) => `<div class="step">
        <span class="num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.text)}</p>
      </div>`,
      )
      .join("");
    return `<section class="blk" data-reveal>${blkHead(b)}<div class="blk-steps" style="--n:${Math.min(
      (b.items || []).length || 3,
      4,
    )}">${items}</div></section>`;
  },

  testimonials(b) {
    const items = (b.items || [])
      .map((it) => {
        const av = mediaUrl(it.avatar);
        return `<figure class="tq">
        <blockquote>&ldquo;${esc(it.quote)}&rdquo;</blockquote>
        <figcaption class="who">
          ${av ? `<span class="avatar"><img src="${attr(av)}" alt="" loading="lazy" /></span>` : ""}
          <span class="meta"><strong>${esc(it.name)}</strong>${
            it.role ? `<small>${esc(it.role)}</small>` : ""
          }</span>
        </figcaption>
      </figure>`;
      })
      .join("");
    return `<section class="blk" data-reveal>${blkHead(b)}<div class="blk-quote-grid">${items}</div></section>`;
  },

  mediaText(b) {
    const img = mediaUrl(b.image);
    return `<section class="blk" data-reveal><div class="blk-media-text${
      b.mediaSide === "left" ? " media-left" : ""
    }">
      <div class="mt-copy">
        <h2>${esc(b.heading)}</h2>
        <p>${esc(b.text)}</p>
        ${ctaLink(b.ctaLabel, b.ctaHref, "btn-outline")}
      </div>
      <div class="mt-media">${img ? `<img src="${attr(img)}" alt="${attr(b.heading)}" loading="lazy" />` : ""}</div>
    </div></section>`;
  },

  checklist(b) {
    const items = (b.items || [])
      .map((it) => `<li>${icon("check", 15)}<span>${esc(it.text)}</span></li>`)
      .join("");
    return `<section class="blk blk-checklist" data-reveal>${blkHead(b)}
      ${b.intro ? `<p class="sub" style="max-width:60ch;color:var(--muted-foreground);margin-bottom:18px">${esc(b.intro)}</p>` : ""}
      <ul>${items}</ul>
    </section>`;
  },

  pricing(b) {
    const plans = (b.plans || [])
      .map((p) => {
        const feats = (p.features || [])
          .map((f) => `<li>${icon("check", 13)}<span>${esc(f.text)}</span></li>`)
          .join("");
        return `<div class="plan${p.highlight ? " highlight" : ""}">
        <div class="name">${esc(p.name)}</div>
        <div class="price">${esc(p.price)}${p.per ? `<small>${esc(p.per)}</small>` : ""}</div>
        ${p.description ? `<p class="desc">${esc(p.description)}</p>` : ""}
        ${feats ? `<ul>${feats}</ul>` : ""}
        ${ctaLink(p.ctaLabel, p.ctaHref, p.highlight ? "btn-primary" : "btn-outline")}
      </div>`;
      })
      .join("");
    return `<section class="blk" data-reveal>${blkHead(b)}<div class="blk-pricing" style="--n:${
      (b.plans || []).length || 3
    }">${plans}</div></section>`;
  },

  videoEmbed(b) {
    const url = String(b.url || "");
    let src = null;
    let m;
    if ((m = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/.exec(url))) {
      src = `https://www.youtube-nocookie.com/embed/${m[1]}`;
    } else if ((m = /vimeo\.com\/(\d+)/.exec(url))) {
      src = `https://player.vimeo.com/video/${m[1]}`;
    }
    if (!src) return "";
    return `<section class="blk blk-video" data-reveal>${blkHead(b)}
      <div class="video-frame"><iframe src="${attr(src)}" title="${attr(
        b.heading || b.caption || "Video",
      )}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
      ${b.caption ? `<p class="caption">${esc(b.caption)}</p>` : ""}
    </section>`;
  },

  image(b) {
    const img = mediaUrl(b.image);
    if (!img) return "";
    return `<section class="blk blk-image" data-reveal>
      <div class="img-frame"><img src="${attr(img)}" alt="${attr(b.caption || "")}" loading="lazy" /></div>
      ${b.caption ? `<p class="caption">${esc(b.caption)}</p>` : ""}
    </section>`;
  },
};

// Render a CMS layout (blocks array) to HTML. Unknown block types are
// skipped rather than crashing the page.
function renderBlocks(layout) {
  return (layout || [])
    .map((block) => {
      const fn = RENDER[block.blockType];
      try {
        return fn ? fn(block) : "";
      } catch (e) {
        console.error(`[blocks] failed to render ${block.blockType}:`, e.message);
        return "";
      }
    })
    .join("\n");
}

// FAQPage JSON-LD source: every faq block's items across the layout.
function collectFaqs(layout) {
  const out = [];
  for (const block of layout || []) {
    if (block.blockType === "faq") {
      for (const it of block.items || []) out.push({ question: it.question, answer: it.answer });
    }
  }
  return out;
}

function faqJsonLd(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

// ctaBand is exported on its own so hand-built pages (the use-case hub,
// industry pages) can close with the same band a CMS page would.
module.exports = { renderBlocks, collectFaqs, faqJsonLd, ctaBand: (b) => RENDER.ctaBand(b) };

// The "Serviceplan Group and AI" section: a CMS hub page plus CMS chapter
// pages (slug prefix serviceplan-ai/). The CMS holds every word; this layer
// adds what only code can: the chapter navigation with agency logos,
// previous/next links, the Sokosumi bridge, and the structured data that
// names Serviceplan Group as the subject.
//
// Chapter order and logos live in content/serviceplan-ai/section.json so
// editors add a CMS page and one line here.

const fs = require("fs");
const path = require("path");
const shell = require("./shell");
const blocks = require("./blocks");
const cms = require("../lib/cms");
const i18n = require("../lib/i18n");
const { t } = i18n;

const { esc, attr, icon, pageStart, pageEnd } = shell;
const CONFIG = path.join(__dirname, "..", "content", "serviceplan-ai", "section.json");

let cache = { at: 0, cfg: null };
function config() {
  if (Date.now() - cache.at < 60000 && cache.cfg) return cache.cfg;
  try {
    cache = { at: Date.now(), cfg: JSON.parse(fs.readFileSync(CONFIG, "utf8")) };
  } catch {
    cache = { at: Date.now(), cfg: { hub: "serviceplan-ai", chapters: [] } };
  }
  return cache.cfg;
}

const HUB = () => config().hub;
const isSection = (slug) => typeof slug === "string" && (slug === HUB() || slug.startsWith(HUB() + "/"));

function logoImg(ch, size) {
  if (!ch.logo) return `<b>${esc(String(ch.short || ch.slug).slice(0, 1).toUpperCase())}</b>`;
  return `<img src="${attr(ch.logo)}" alt="${attr(ch.short || "")}" width="${size}" height="${size}" loading="lazy">`;
}

// CMS docs for every chapter, in configured order (missing ones skipped).
async function chapters(ctx) {
  const pages = await cms.getPages({ draft: ctx.preview });
  const bySlug = new Map(pages.map((p) => [p.slug, p]));
  return config()
    .chapters.map((ch) => ({ ...ch, doc: bySlug.get(`${HUB()}/${ch.slug}`) }))
    .filter((ch) => ch.doc);
}

function chapterCard(ch, i) {
  return `<a class="sp-chapter" href="/${attr(ch.doc.slug)}">
    <span class="sp-chapter-num">${String(i + 1).padStart(2, "0")}</span>
    <span class="sp-chapter-logo">${logoImg(ch, 40)}</span>
    <span class="sp-chapter-body">
      <span class="sp-chapter-title">${esc(ch.doc.title)}</span>
      <span class="sp-chapter-desc">${esc(ch.doc.description || "")}</span>
    </span>
    <span class="go">${icon("arrow-up-right", 15)}</span>
  </a>`;
}

function chapterNav(list, current) {
  return `<nav class="sp-nav" aria-label="${attr(t("Chapters"))}">
    <a href="/${attr(HUB())}" class="${current === HUB() ? "is-current" : ""}">${esc(t("Overview"))}</a>
    ${list.map((ch) => `<a href="/${attr(ch.doc.slug)}" class="${ch.doc.slug === current ? "is-current" : ""}">${ch.logo ? logoImg(ch, 18) : ""}${esc(ch.short || ch.doc.title)}</a>`).join("")}
  </nav>`;
}

function prevNext(list, current) {
  const i = list.findIndex((ch) => ch.doc.slug === current);
  const prev = i > 0 ? list[i - 1] : null;
  const next = i < list.length - 1 ? list[i + 1] : null;
  const link = (ch, label, cls) =>
    ch
      ? `<a class="sp-pn ${cls}" href="/${attr(ch.doc.slug)}"><span class="sp-pn-label">${esc(label)}</span><span class="sp-pn-title">${esc(ch.doc.title)}</span></a>`
      : `<span class="sp-pn ${cls}"></span>`;
  return `<div class="sp-prevnext">${link(prev, t("Previous chapter"), "is-prev")}${link(next, t("Next chapter"), "is-next")}</div>`;
}

// Every page in the section ends the same way: Serviceplan's AI product.
function bridge(seed) {
  return `<section class="page-section sp-bridge" data-reveal>
    <div class="sp-bridge-box">
      <div class="sp-bridge-head"><span class="eyebrow">${esc(t("Serviceplan Group's AI product for marketing teams"))}</span><span class="cmp-mark cmp-mark-logo"><img src="/assets/apple-touch-icon.png" alt="" width="24" height="24">Sokosumi</span></div>
      <h2>${esc(t("What the House of Communication learned about AI, as a product you can use on Monday"))}</h2>
      <p>${esc(t("Sokosumi is the marketplace of named AI coworkers built by Serviceplan Group with NMKR. You brief a coworker like a colleague; the task shows on a shared board and comes back as a file: a PDF, a deck, a spreadsheet or a dashboard."))}</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="${attr(shell.APP_SIGNUP)}" data-analytics="sign_up_click" data-analytics-location="serviceplan_bridge">${esc(t("Start free"))}</a>
        <a class="btn btn-outline" href="/ai-coworkers">${esc(t("Meet the coworkers"))}</a>
        <a class="btn btn-outline" href="/product">${esc(t("See how it works"))}</a>
      </div>
    </div>
  </section>`;
}

function organizationLd() {
  return {
    "@type": "Organization",
    "@id": "https://www.serviceplan.com/#organization",
    name: "Serviceplan Group",
    alternateName: ["Serviceplan Group SE & Co. KG", "House of Communication"],
    url: "https://www.serviceplan.com/",
    foundingDate: "1970",
    foundingLocation: { "@type": "Place", name: "Munich, Germany" },
    address: { "@type": "PostalAddress", addressLocality: "Munich", addressCountry: "DE" },
    sameAs: ["https://www.linkedin.com/company/serviceplan-group/", "https://de.wikipedia.org/wiki/Serviceplan"],
  };
}

async function render(doc, ctx) {
  const list = await chapters(ctx);
  const isHub = doc.slug === HUB();
  const hubDoc = isHub ? doc : await cms.getPage(HUB(), { draft: ctx.preview });
  const cr = [{ label: "Home", href: "/" }];
  if (!isHub && hubDoc) cr.push({ label: hubDoc.title, href: "/" + HUB() });
  cr.push({ label: doc.title });

  const layout = doc.layout || [];
  const hero = layout.find((b) => b.blockType === "hero");
  const rest = layout.filter((b) => b.blockType !== "hero" && b.blockType !== "ctaBand");
  const faqs = blocks.collectFaqs(layout);
  const chapter = list.find((ch) => ch.doc.slug === doc.slug);

  const jsonld = [
    {
      "@type": isHub ? "CollectionPage" : "Article",
      "@id": `${shell.SITE}/${doc.slug}#page`,
      headline: doc.title,
      description: doc.description || "",
      url: `${shell.SITE}/${doc.slug}`,
      inLanguage: i18n.locale() === "de" ? "de" : "en",
      dateModified: String(doc.updatedAt || "").slice(0, 10),
      about: organizationLd(),
      author: { "@id": `${shell.SITE}/#organization` },
      publisher: { "@id": `${shell.SITE}/#organization` },
      ...(isHub
        ? { hasPart: list.map((ch) => ({ "@type": "WebPage", name: ch.doc.title, url: `${shell.SITE}/${ch.doc.slug}` })) }
        : { isPartOf: { "@type": "CollectionPage", name: hubDoc ? hubDoc.title : "Serviceplan Group and AI", url: `${shell.SITE}/${HUB()}` } }),
    },
    faqs.length ? blocks.faqJsonLd(faqs) : null,
  ].filter(Boolean);

  return (
    pageStart({
      title: doc.metaTitle || t("{title} | Sokosumi", { title: doc.title }),
      description: (doc.description || "").slice(0, 160),
      path: "/" + doc.slug,
      breadcrumb: cr,
      mainClass: "sp-page",
      og: { type: "page", eyebrow: hubDoc && !isHub ? hubDoc.title : t("Serviceplan Group and AI"), title: (hero && hero.heading) || doc.title, sub: doc.description || "" },
      jsonld,
    }) +
    `<div class="page-head sp-head" data-reveal>
      ${chapter && chapter.logo ? `<span class="sp-head-logo">${logoImg(chapter, 56)}</span>` : ""}
      ${hero && hero.eyebrow ? `<span class="eyebrow">${esc(hero.eyebrow)}</span>` : ""}
      <h1>${esc((hero && hero.heading) || doc.title)}</h1>
      ${hero && hero.subheading ? `<p class="sub">${esc(hero.subheading)}</p>` : ""}
      <p class="meta-row"><span>${esc(t("Reviewed {date}", { date: String(doc.updatedAt || "").slice(0, 10) }))}</span><span>${esc(t("Sources linked in the text"))}</span></p>
    </div>
    ${chapterNav(list, doc.slug)}` +
    blocks.renderBlocks(rest) +
    (isHub
      ? `<section class="page-section sp-chapters" data-reveal><div class="blk-head"><h2>${esc(t("The chapters"))}</h2></div><div class="sp-chapter-list">${list.map(chapterCard).join("")}</div></section>`
      : prevNext(list, doc.slug)) +
    bridge(doc.slug.length) +
    pageEnd()
  );
}

module.exports = { render, isSection, config };

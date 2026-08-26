const fs = require("fs");
const path = require("path");
const shell = require("./shell");
const blocks = require("./blocks");
const cms = require("../lib/cms");
const i18n = require("../lib/i18n");

const { esc, attr, icon, pageStart, pageEnd } = shell;
const CONFIG = path.join(__dirname, "..", "content", "serviceplan-ai", "section.json");

let cache = { at: 0, cfg: null };

function config() {
  if (Date.now() - cache.at < 60000 && cache.cfg) return cache.cfg;
  try {
    cache = { at: Date.now(), cfg: JSON.parse(fs.readFileSync(CONFIG, "utf8")) };
  } catch {
    cache = { at: Date.now(), cfg: { hub: "serviceplan-ai", groups: [], chapters: [] } };
  }
  return cache.cfg;
}

const ui = (en, de) => (i18n.locale() === "de" ? de : en);
const localText = (value) => (value && typeof value === "object" ? value[i18n.locale()] || value.en || "" : value || "");
const HUB = () => config().hub;
const isSection = (slug) => typeof slug === "string" && (slug === HUB() || slug.startsWith(`${HUB()}/`));

function chapterLogos(chapter) {
  if (Array.isArray(chapter.logos) && chapter.logos.length) return chapter.logos;
  return chapter.logo ? [{ src: chapter.logo, name: chapter.short }] : [];
}

function logoClass(chapter) {
  return "sp-logo-count-" + Math.min(chapterLogos(chapter).length || 1, 3);
}

function logoImg(chapter, context) {
  const logos = chapterLogos(chapter);
  if (!logos.length) {
    return '<b aria-hidden="true">' + esc(String(chapter.short || chapter.slug).slice(0, 1).toUpperCase()) + "</b>";
  }
  const multiple = logos.length > 1;
  const dimensions =
    context === "hero"
      ? { width: multiple ? 112 : 124, height: multiple ? 14 : 28, loading: "eager" }
      : { width: multiple ? 96 : 110, height: multiple ? 12 : 24, loading: "lazy" };
  return logos
    .map(
      (logo) =>
        '<img src="' +
        attr(logo.src) +
        '" alt="" width="' +
        dimensions.width +
        '" height="' +
        dimensions.height +
        '" loading="' +
        dimensions.loading +
        '">',
    )
    .join("");
}

async function chapters(ctx) {
  const pages = await cms.getPages({ draft: ctx.preview });
  const bySlug = new Map(pages.map((page) => [page.slug, page]));
  return config()
    .chapters.map((chapter) => ({ ...chapter, doc: bySlug.get(`${HUB()}/${chapter.slug}`) }))
    .filter((chapter) => chapter.doc);
}

function groupsFor(list) {
  const known = (config().groups || [])
    .map((group) => ({ ...group, chapters: list.filter((chapter) => chapter.group === group.id) }))
    .filter((group) => group.chapters.length);
  const grouped = new Set(known.flatMap((group) => group.chapters));
  const remaining = list.filter((chapter) => !grouped.has(chapter));
  if (remaining.length) {
    known.push({
      id: "more",
      label: { en: "More", de: "Weitere Themen" },
      description: { en: "Additional chapters in this dossier.", de: "Weitere Kapitel dieses Dossiers." },
      chapters: remaining,
    });
  }
  return known;
}

function groupFor(chapter) {
  return (config().groups || []).find((group) => group.id === chapter?.group);
}

function sourceUrls(layout) {
  const matches = String(JSON.stringify(layout || [])).match(/https?:\/\/[^"\\\s)]+/g) || [];
  return [...new Set(matches.map((url) => url.replace(/[.,;]+$/, "")))];
}

function plainText(layout) {
  return JSON.stringify(layout || [])
    .replace(/https?:\/\/[^"\\\s]+/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function readingMinutes(layout) {
  const words = plainText(layout).split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 210));
}

function headingFor(block) {
  if (block.heading) return block.heading;
  const htmlHeading = /<h2[^>]*>(.*?)<\/h2>/i.exec(block.contentHtml || "");
  if (htmlHeading) return htmlHeading[1].replace(/<[^>]+>/g, "").trim();
  const markdownHeading = /^##\s+(.+)$/m.exec(block.content || "");
  return markdownHeading ? markdownHeading[1].replace(/[*_\[\]]/g, "").trim() : "";
}

function idFor(value, index) {
  const id = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return id || `section-${index + 1}`;
}

function renderArticle(layout) {
  const used = new Set();
  const outline = [];
  const html = layout
    .map((block, index) => {
      const heading = headingFor(block);
      let id = idFor(heading || block.blockType, index);
      let suffix = 2;
      while (used.has(id)) id = `${idFor(heading || block.blockType, index)}-${suffix++}`;
      used.add(id);
      if (heading) outline.push({ id, heading });
      return `<div class="sp-block sp-block-${attr(block.blockType || "unknown")}" id="${attr(id)}">${blocks.renderBlocks([block])}</div>`;
    })
    .join("");
  return { html, outline };
}

function citedSources(html) {
  const urls = [];
  const pattern = /<a\s+[^>]*href=["'](https?:\/\/[^"']+)["']/gi;
  let match;
  while ((match = pattern.exec(html))) urls.push(match[1]);
  return [...new Set(urls)].map((url) => {
    try {
      return { url, domain: new URL(url).hostname.replace(/^www\./, "") };
    } catch {
      return { url, domain: url };
    }
  });
}

function chapterCard(chapter, index) {
  const sources = sourceUrls(chapter.doc.layout).length;
  const group = groupFor(chapter);
  return `<a class="sp-chapter" href="/${attr(chapter.doc.slug)}">
    <span class="sp-chapter-num">${String(index + 1).padStart(2, "0")}</span>
    <span class="sp-chapter-logo ${logoClass(chapter)}">${logoImg(chapter, "chapter")}</span>
    <span class="sp-chapter-body">
      <span class="sp-chapter-kicker">${esc(localText(group?.label))} · ${sources} ${esc(ui(sources === 1 ? "source" : "sources", sources === 1 ? "Quelle" : "Quellen"))}</span>
      <span class="sp-chapter-title">${esc(chapter.doc.title)}</span>
      <span class="sp-chapter-desc">${esc(chapter.doc.description || "")}</span>
    </span>
    <span class="sp-chapter-go" aria-hidden="true">${icon("arrow-up-right", 16)}</span>
  </a>`;
}

function groupedChapters(list) {
  let index = 0;
  return `<section class="sp-directory" aria-labelledby="sp-directory-title">
    <header class="sp-section-intro">
      <span class="eyebrow">${esc(ui("Authority dossier", "Authority-Dossier"))}</span>
      <h2 id="sp-directory-title">${esc(ui("Choose a way into the system", "Wählen Sie Ihren Einstieg ins System"))}</h2>
      <p>${esc(ui(
        "The chapters move from organisational architecture to usable products, buyer guidance and primary-source evidence.",
        "Die Kapitel führen von der Organisationsarchitektur über nutzbare Produkte und Buyer-Guides bis zu den Primärquellen.",
      ))}</p>
    </header>
    <div class="sp-groups">
      ${groupsFor(list)
        .map(
          (group, groupIndex) => `<section class="sp-group" aria-labelledby="sp-group-${attr(group.id)}">
            <header class="sp-group-head">
              <span class="sp-group-index">${String(groupIndex + 1).padStart(2, "0")}</span>
              <div>
                <h3 id="sp-group-${attr(group.id)}">${esc(localText(group.label))}</h3>
                <p>${esc(localText(group.description))}</p>
              </div>
            </header>
            <div class="sp-chapter-list">
              ${group.chapters.map((chapter) => chapterCard(chapter, index++)).join("")}
            </div>
          </section>`,
        )
        .join("")}
    </div>
  </section>`;
}

function indexLinks(list, current) {
  return groupsFor(list)
    .map(
      (group) => `<div class="sp-index-group">
        <span>${esc(localText(group.label))}</span>
        ${group.chapters
          .map(
            (chapter) =>
              `<a href="/${attr(chapter.doc.slug)}"${chapter.doc.slug === current ? ' aria-current="page"' : ""}>${esc(chapter.short || chapter.doc.title)}</a>`,
          )
          .join("")}
      </div>`,
    )
    .join("");
}

function contents(outline) {
  if (!outline.length) return "";
  return `<nav class="sp-contents" aria-label="${attr(ui("On this page", "Auf dieser Seite"))}">
    <span>${esc(ui("On this page", "Auf dieser Seite"))}</span>
    ${outline.map((item) => `<a href="#${attr(item.id)}">${esc(item.heading)}</a>`).join("")}
  </nav>`;
}

function readingRail(list, current, outline) {
  return `<aside class="sp-reading-rail">
    ${contents(outline)}
    <nav class="sp-dossier-index" aria-label="${attr(ui("Dossier chapters", "Dossier-Kapitel"))}">
      <span>${esc(ui("Dossier index", "Dossier-Index"))}</span>
      <a href="/${attr(HUB())}">${esc(ui("Overview", "Übersicht"))}</a>
      ${indexLinks(list, current)}
    </nav>
  </aside>`;
}

function mobileIndex(list, current, outline) {
  return `<details class="sp-mobile-index">
    <summary>${esc(ui("Contents and dossier index", "Inhalt und Dossier-Index"))}<span aria-hidden="true">+</span></summary>
    <div>${contents(outline)}<nav class="sp-dossier-index" aria-label="${attr(ui("Dossier chapters", "Dossier-Kapitel"))}">
      <span>${esc(ui("Dossier index", "Dossier-Index"))}</span>
      <a href="/${attr(HUB())}">${esc(ui("Overview", "Übersicht"))}</a>
      ${indexLinks(list, current)}
    </nav></div>
  </details>`;
}

function systemMap() {
  const nodes = [
    ["01", "Insight.AI", ui("Research and direction", "Research und Orientierung"), "Serviceplan · Mediaplus"],
    ["02", "Creative.AI", ui("Ideas and production", "Ideen und Produktion"), "Serviceplan"],
    ["03", "Activate.AI", ui("Media and optimisation", "Media und Optimierung"), "Mediaplus"],
    ["04", "Agentic.AI", ui("Agents and orchestration", "Agents und Orchestrierung"), "Plan.Net"],
  ];
  return `<figure class="sp-system-map" aria-labelledby="sp-system-title">
    <figcaption>
      <span>${esc(ui("Serviceplan's public model", "Serviceplans öffentliches Modell"))}</span>
      <strong id="sp-system-title">${esc(ui("One marketing system, four connected layers", "Ein Marketingsystem, vier verbundene Ebenen"))}</strong>
    </figcaption>
    <div class="sp-map-flow">
      ${nodes
        .map(
          ([number, name, purpose, owner]) => `<div class="sp-map-node">
            <span>${number}</span>
            <strong>${name}</strong>
            <small>${esc(purpose)}</small>
            <em>${owner}</em>
          </div>`,
        )
        .join("")}
    </div>
    <div class="sp-map-foundation">
      <span>${esc(ui("Foundation", "Fundament"))}</span>
      <strong>Global Data Platform</strong>
      <small>${esc(ui("Shared data and compliance layer", "Gemeinsame Daten- und Compliance-Schicht"))}</small>
    </div>
  </figure>`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "").slice(0, 10);
  return new Intl.DateTimeFormat(i18n.locale() === "de" ? "de-DE" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function heroProof(doc, chapter, outline) {
  const group = groupFor(chapter);
  const sources = sourceUrls(doc.layout).length;
  const minutes = readingMinutes(doc.layout);
  return `<aside class="sp-hero-proof" aria-label="${attr(ui("Page evidence", "Seitennachweis"))}">
    <span class="sp-proof-label">${esc(ui("Authority dossier", "Authority-Dossier"))}</span>
    <dl>
      <div><dt>${esc(ui("Focus", "Fokus"))}</dt><dd>${esc(localText(group?.label))}</dd></div>
      <div><dt>${esc(ui("Reading time", "Lesezeit"))}</dt><dd>${minutes} min</dd></div>
      <div><dt>${esc(ui("Linked sources", "Verlinkte Quellen"))}</dt><dd>${sources}</dd></div>
      <div><dt>${esc(ui("Reviewed", "Geprüft"))}</dt><dd>${esc(formatDate(doc.updatedAt))}</dd></div>
    </dl>
    ${outline.length ? `<ol>${outline.slice(0, 3).map((item) => `<li><a href="#${attr(item.id)}">${esc(item.heading)}</a></li>`).join("")}</ol>` : ""}
  </aside>`;
}

function evidenceLedger(sources, updatedAt) {
  if (!sources.length) return "";
  return `<section class="sp-evidence" aria-labelledby="sp-evidence-title">
    <header>
      <span class="eyebrow">${esc(ui("Evidence ledger", "Quellenverzeichnis"))}</span>
      <h2 id="sp-evidence-title">${esc(ui("Primary sources cited on this page", "Auf dieser Seite zitierte Primärquellen"))}</h2>
      <p>${esc(ui(
        `Reviewed ${formatDate(updatedAt)}. Claims remain attributed to the organisations that published them.`,
        `Geprüft am ${formatDate(updatedAt)}. Aussagen bleiben den Organisationen zugeordnet, die sie veröffentlicht haben.`,
      ))}</p>
    </header>
    <ol>
      ${sources
        .map(
          (source, index) => `<li>
            <span>${String(index + 1).padStart(2, "0")}</span>
            <a href="${attr(source.url)}" rel="noopener">
              <strong>${esc(source.domain)}</strong>
              <small>${esc(source.url.replace(/^https?:\/\//, ""))}</small>
            </a>
            <span aria-hidden="true">${icon("arrow-up-right", 14)}</span>
          </li>`,
        )
        .join("")}
    </ol>
  </section>`;
}

function prevNext(list, current) {
  const index = list.findIndex((chapter) => chapter.doc.slug === current);
  const previous = index > 0 ? list[index - 1] : null;
  const next = index < list.length - 1 ? list[index + 1] : null;
  const link = (chapter, label, direction) =>
    chapter
      ? `<a class="sp-pn sp-pn-${direction}" href="/${attr(chapter.doc.slug)}">
          <span>${esc(label)}</span><strong>${esc(chapter.doc.title)}</strong>
        </a>`
      : `<span class="sp-pn sp-pn-${direction}" aria-hidden="true"></span>`;
  return `<nav class="sp-prevnext" aria-label="${attr(ui("Adjacent chapters", "Benachbarte Kapitel"))}">
    ${link(previous, ui("Previous chapter", "Vorheriges Kapitel"), "prev")}
    ${link(next, ui("Next chapter", "Nächstes Kapitel"), "next")}
  </nav>`;
}

function bridge() {
  return `<section class="sp-bridge">
    <div>
      <span class="eyebrow">${esc(ui("From agency practice to a product", "Von der Agenturpraxis zum Produkt"))}</span>
      <h2>${esc(ui("Put the operating model to work", "Setzen Sie das Betriebsmodell praktisch ein"))}</h2>
      <p>${esc(ui(
        "Sokosumi gives teams direct access to named AI coworkers built for bounded marketing work — with briefs, deliverables and costs visible on one shared board.",
        "Sokosumi gibt Teams direkten Zugang zu benannten AI Coworkern für klar abgegrenzte Marketingaufgaben – mit Briefings, Ergebnissen und Kosten auf einem gemeinsamen Board.",
      ))}</p>
    </div>
    <div class="sp-bridge-actions">
      <a class="btn btn-primary" href="${attr(shell.APP_SIGNUP)}" data-analytics="sign_up_click" data-analytics-location="serviceplan_bridge">${esc(ui("Start free", "Kostenlos starten"))}</a>
      <a href="/ai-coworkers">${esc(ui("Meet the coworkers", "AI Coworker kennenlernen"))} ${icon("arrow-up-right", 14)}</a>
      <a href="/product">${esc(ui("See how it works", "So funktioniert es"))} ${icon("arrow-up-right", 14)}</a>
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
  const chapter = list.find((item) => item.doc.slug === doc.slug);
  const layout = doc.layout || [];
  const hero = layout.find((block) => block.blockType === "hero");
  const bodyLayout = layout.filter((block) => block.blockType !== "hero" && block.blockType !== "ctaBand");
  const article = renderArticle(bodyLayout);
  const sources = citedSources(article.html);
  const faqs = blocks.collectFaqs(layout);
  const breadcrumbs = [{ label: "Home", href: "/" }];
  if (!isHub && hubDoc) breadcrumbs.push({ label: hubDoc.title, href: `/${HUB()}` });
  breadcrumbs.push({ label: doc.title });

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
        ? { hasPart: list.map((item) => ({ "@type": "WebPage", name: item.doc.title, url: `${shell.SITE}/${item.doc.slug}` })) }
        : {
            isPartOf: {
              "@type": "CollectionPage",
              name: hubDoc ? hubDoc.title : "Serviceplan Group and AI",
              url: `${shell.SITE}/${HUB()}`,
            },
          }),
    },
    faqs.length ? blocks.faqJsonLd(faqs) : null,
  ].filter(Boolean);

  const head =
    pageStart({
      title: doc.metaTitle || `${doc.title} | Sokosumi`,
      description: (doc.description || "").slice(0, 160),
      path: `/${doc.slug}`,
      breadcrumb: breadcrumbs,
      mainClass: "sp-page",
      stylesheets: ["/assets/serviceplan-ai.css"],
      og: {
        type: "page",
        eyebrow: hubDoc && !isHub ? hubDoc.title : ui("Serviceplan Group and AI", "Serviceplan Group und KI"),
        title: hero?.heading || doc.title,
        sub: doc.description || "",
      },
      jsonld,
    }) +
    `<header class="sp-hero ${isHub ? "sp-hero-hub" : "sp-hero-chapter"}">
      <div class="sp-hero-copy">
        ${chapter ? `<span class="sp-hero-logo ${logoClass(chapter)}">${logoImg(chapter, "hero")}</span>` : ""}
        ${hero?.eyebrow ? `<span class="eyebrow">${esc(hero.eyebrow)}</span>` : ""}
        <h1>${esc(hero?.heading || doc.title)}</h1>
        ${hero?.subheading ? `<p>${esc(hero.subheading)}</p>` : ""}
        <div class="sp-hero-meta">
          <span>${esc(ui("Reviewed", "Geprüft"))} ${esc(formatDate(doc.updatedAt))}</span>
          <span>${sourceUrls(layout).length} ${esc(ui("linked sources", "verlinkte Quellen"))}</span>
        </div>
      </div>
      ${isHub ? systemMap() : heroProof(doc, chapter, article.outline)}
    </header>`;

  if (isHub) {
    return (
      head +
      `<article class="sp-hub-body">${article.html}</article>` +
      groupedChapters(list) +
      evidenceLedger(sources, doc.updatedAt) +
      bridge() +
      pageEnd()
    );
  }

  return (
    head +
    mobileIndex(list, doc.slug, article.outline) +
    `<div class="sp-reading-layout">
      ${readingRail(list, doc.slug, article.outline)}
      <article class="sp-article">${article.html}${evidenceLedger(sources, doc.updatedAt)}</article>
    </div>` +
    prevNext(list, doc.slug) +
    bridge() +
    pageEnd()
  );
}

module.exports = { render, isSection, config };

// Shared chrome for every server-rendered Sokosumi sub-page: <head>, header,
// footer, breadcrumbs, and the small HTML utilities templates build with.
// Design language matches the landing page (index.html): Inter, ink + paper,
// hairlines, light display weights. Styles live in /assets/styles.css.

const cms = require("../lib/cms");
const art = require("./art");
const i18n = require("../lib/i18n");
const { t } = i18n;

const APP = "https://app.sokosumi.com";
// The app serves a dedicated page for each half of the auth split: /signup is
// "Register", /signin is "Login". Linking to the bare origin instead sends a
// logged-out visitor through the auth guard to /signin?returnUrl=/ — i.e. a
// "Sign Up" button that lands on the login form. Point conversion CTAs at
// SIGNUP and the header's "Log In" at SIGNIN; keep bare APP only for links
// that mean "open the product" (existing users), where the guard's returnUrl
// round-trip is the behaviour you want.
const APP_SIGNUP = `${APP}/signup`;
const APP_SIGNIN = `${APP}/signin`;

// Analytics: one GTM container (GTM-N7GC8SFT) and one GA4 property
// (G-G4BW0XC76M) span this marketing site AND app.sokosumi.com. See
// TRACKING.md for the whole design. These IDs are public — they ship in every
// page's HTML — so keeping them in source is fine.
const GTM_ID = "GTM-N7GC8SFT";

// Runs in <head> BEFORE the GTM loader. Establishes Google Consent Mode v2 in
// its denied-by-default state (Basic Consent Mode: no analytics/ads leave the
// browser until the visitor opts in), then re-applies a stored choice so a
// returning visitor is not blocked for a frame. assets/consent.js draws the
// banner and flips the state on a choice. This snippet is mirrored in the app
// (apps/web) — keep the two in sync.
const ANALYTICS_HEAD = `<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      analytics_storage: 'denied', functionality_storage: 'granted',
      security_storage: 'granted', wait_for_update: 500
    });
    try {
      var _m = document.cookie.match(/(?:^|; )sokosumi_consent=([^;]+)/);
      if (_m) {
        var _c = JSON.parse(decodeURIComponent(_m[1]));
        gtag('consent', 'update', {
          analytics_storage: _c.analytics ? 'granted' : 'denied',
          ad_storage: _c.marketing ? 'granted' : 'denied',
          ad_user_data: _c.marketing ? 'granted' : 'denied',
          ad_personalization: _c.marketing ? 'granted' : 'denied'
        });
        window.dataLayer.push({
          event: 'consent_status',
          consent_analytics: _c.analytics ? 'granted' : 'denied',
          consent_marketing: _c.marketing ? 'granted' : 'denied'
        });
      }
    } catch (_e) {}
    gtag('set', 'url_passthrough', true);
    gtag('set', 'ads_data_redaction', true);
  </script>
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');</script>`;

const GTM_NOSCRIPT = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`;
// The canonical origin. www, not the apex: sokosumi.com 301s to www, so
// publishing the apex in canonicals and the sitemap points every one of them
// at a redirect. Overridable so a staging deploy cannot advertise production.
const SITE = process.env.SITE_URL || "https://www.sokosumi.com";
// Contact is one section with two doors; /talk-to-sales and /support are
// kept alive as 301s in server.js so old links and any printed material
// still land in the right place.
const SALES_URL = "/contact/sales";
const SUPPORT_URL = "/contact/support";

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
}
const attr = esc;

// Word-boundary truncation for meta descriptions: never cuts mid-word,
// never leaves trailing space or punctuation fragments.
function truncate(s, n) {
  const str = String(s || "").trim();
  const max = n || 155;
  if (str.length <= max) return str;
  const cut = str.slice(0, max + 1);
  const atWord = cut.slice(0, cut.lastIndexOf(" "));
  return (atWord || cut.slice(0, max)).replace(/[\s,;:.–—-]+$/, "");
}

function slugify(s) {
  return (
    String(s || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

// ---- icons (lucide-ish, stroke inherits currentColor) ----
const ICONS = {
  "arrow-up-right": '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "arrow-left": '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  "file-text":
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  presentation: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  window: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/>',
  building:
    '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
};
function icon(name, size) {
  size = size || 14;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

// Output-type labels for offers (CMS `output` select). The label goes
// through t() at lookup time, so it follows the request's locale.
const OUTPUT = {
  pdf: { label: "PDF", icon: "file-text" },
  doc: { label: "Document", icon: "file-text" },
  slides: { label: "Slides", icon: "presentation" },
  sheet: { label: "Sheet", icon: "table" },
  image: { label: "Image", icon: "image" },
  text: { label: "Text", icon: "file-text" },
  html: { label: "Web", icon: "window" },
};
function outputMeta(type) {
  const o = OUTPUT[type] || OUTPUT.text;
  return { ...o, label: t(o.label) };
}

// ---- tiny safe Markdown (headings, bold, lists, paragraphs) ----
function markdownLite(src) {
  const lines = String(src || "").replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let list = null;
  const closeList = () => {
    if (list) {
      html += `</${list}>`;
      list = null;
    }
  };
  const inline = (t) =>
    esc(t)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) {
      closeList();
      continue;
    }
    if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
      closeList();
      html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`;
    } else if ((m = /^[-*]\s+(.*)$/.exec(line))) {
      if (list !== "ul") {
        closeList();
        html += "<ul>";
        list = "ul";
      }
      html += `<li>${inline(m[1])}</li>`;
    } else if ((m = /^\d+\.\s+(.*)$/.exec(line))) {
      if (list !== "ol") {
        closeList();
        html += "<ol>";
        list = "ol";
      }
      html += `<li>${inline(m[1])}</li>`;
    } else {
      closeList();
      html += `<p>${inline(line)}</p>`;
    }
  }
  closeList();
  return html;
}

function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => {
      // Labels run through t(): chrome labels ("Home", "Vendors") translate,
      // dynamic names (coworkers, post titles) pass through unchanged.
      const el = { "@type": "ListItem", position: i + 1, name: t(it.label) };
      if (it.href) el.item = SITE + i18n.localizePath(it.href);
      return el;
    }),
  };
}

// ---- shared chrome ----

// The designed 1200x630 card. Everything that cannot supply a real share image
// falls back to it.
const OG_FALLBACK = { url: `${SITE}/assets/og-image.jpg`, width: 1200, height: 630 };

// A share image has to survive Facebook, LinkedIn, X and Slack fetching it
// from the open internet. Three things disqualify a candidate:
//   * SVG — every major platform rejects it outright, so the card renders
//     blank. 39 coworker pages were pointing at one.
//   * a hostname only reachable from a dev environment.
//   * a relative path, which a crawler on another origin cannot resolve.
const DEV_HOST = /(?:^|\.)(?:localhost|127\.0\.0\.1|.*-dev\.)|\.internal(?:$|\/)/i;
function shareImage(candidate) {
  if (!candidate) return OG_FALLBACK;
  const url = String(candidate.url || candidate);
  if (!/^https?:\/\//i.test(url)) return OG_FALLBACK;
  if (/\.svgs?(?:$|[?#])/i.test(url)) return OG_FALLBACK;
  try {
    if (DEV_HOST.test(new URL(url).hostname)) return OG_FALLBACK;
  } catch {
    return OG_FALLBACK;
  }
  return { url, width: candidate.width || null, height: candidate.height || null, alt: candidate.alt || null };
}

// Listing pages describe a collection; without this a crawler sees a page of
// links and has to infer what it is a list OF. `items` is [{name, path}] in
// the order they are rendered.
function itemListLd(name, path, items) {
  if (!items || !items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE}${path}#list`,
    name,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: SITE + it.path,
    })),
  };
}

// Templates each build a standalone object with its own @context; inside an
// @graph the context belongs to the document, not the node.
function stripContext(node) {
  if (!node || typeof node !== "object") return node;
  const { "@context": _drop, ...rest } = node;
  return rest;
}

const SOCIALS = [
  "https://x.com/sokosumi",
  "https://linkedin.com/company/sokosumi/",
  "https://discord.com/invite/aj4QfnTS92",
  "https://t.me/+igMz0AazR-cwMzJi",
  "https://github.com/masumi-network",
];

const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "Sokosumi",
  legalName: "Plan.Net Germany GmbH & Co KG",
  url: `${SITE}/`,
  logo: { "@type": "ImageObject", url: `${SITE}/assets/sokosumi-wordmark.svg` },
  image: `${SITE}/assets/og-image.jpg`,
  vatID: "DE222163784",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Friedenstr. 24",
    postalCode: "81671",
    addressLocality: "Munich",
    addressCountry: "DE",
  },
  parentOrganization: { "@type": "Organization", name: "Serviceplan Group", url: "https://www.serviceplan.com" },
  sameAs: SOCIALS,
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  name: "Sokosumi",
  url: `${SITE}/`,
  publisher: { "@id": `${SITE}/#organization` },
  inLanguage: "en",
};

// hreflang alternates for one page, both directions. Every indexable page
// exists in both locales; x-default points at English (the ranking URLs).
function hreflangLinks(path) {
  // Until German content is real, do not advertise a de alternate at all: a
  // half-translated page claimed as the German equivalent is worse for the
  // English original than having no alternate.
  if (!i18n.DE_INDEXABLE) return "";
  const en = SITE + path;
  const de = SITE + i18n.localizePath(path, "de");
  return [
    `<link rel="alternate" hreflang="en" href="${attr(en)}" />`,
    `<link rel="alternate" hreflang="de" href="${attr(de)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${attr(en)}" />`,
  ].join("\n    ");
}

function head(opts) {
  const locale = i18n.locale();
  const title = esc(t(opts.title));
  const desc = esc(t(opts.description || ""));
  // The canonical points at the page's OWN locale; hreflang links the pair.
  const canonical = SITE + i18n.localizePath(opts.path);
  const og = shareImage(opts.ogImage);
  // Blog posts, guides and release notes are articles. og:type article unlocks
  // the published/modified timestamps, which "website" silently discards.
  const article = opts.article || null;
  // One @graph per page rather than a pile of loose blocks, so the page's own
  // entity can point at the organization and the site by @id instead of
  // repeating them.
  const graph = [ORGANIZATION, { ...WEBSITE, inLanguage: locale }];
  if (opts.breadcrumb && opts.breadcrumb.length) graph.push(breadcrumbLd(opts.breadcrumb));
  if (opts.jsonld) graph.push(...(Array.isArray(opts.jsonld) ? opts.jsonld : [opts.jsonld]));
  const doc = { "@context": "https://schema.org", "@graph": graph.map(stripContext) };
  const jsonld = `<script type="application/ld+json">${JSON.stringify(doc).replace(/</g, "\\u003c")}</script>`;
  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${ANALYTICS_HEAD}
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    ${opts.noindex || (locale === "de" && !i18n.DE_INDEXABLE) ? '<meta name="robots" content="noindex,follow" />' : `<link rel="canonical" href="${attr(canonical)}" />\n    ${hreflangLinks(opts.path)}`}
    <meta property="og:site_name" content="Sokosumi" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="${article ? "article" : "website"}" />
    <meta property="og:locale" content="${locale === "de" ? "de_DE" : "en_US"}" />
    <meta property="og:locale:alternate" content="${locale === "de" ? "en_US" : "de_DE"}" />
    <meta property="og:url" content="${attr(canonical)}" />
    <meta property="og:image" content="${attr(og.url)}" />
    ${og.width ? `<meta property="og:image:width" content="${og.width}" />` : ""}
    ${og.height ? `<meta property="og:image:height" content="${og.height}" />` : ""}
    <meta property="og:image:alt" content="${attr(og.alt || opts.title)}" />
    ${article && article.published ? `<meta property="article:published_time" content="${attr(article.published)}" />` : ""}
    ${article && article.modified ? `<meta property="article:modified_time" content="${attr(article.modified)}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${attr(og.url)}" />
    <meta name="twitter:image:alt" content="${attr(og.alt || opts.title)}" />
    <link rel="icon" href="/assets/favicon.ico" sizes="32x32" />
    <link rel="icon" href="/assets/favicon.png" type="image/png" sizes="48x48" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <meta name="theme-color" content="#ffffff" />
    <link rel="preload" href="/assets/fonts/inter-400-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/assets/fonts.css" />
    <link rel="stylesheet" href="/assets/styles.css" />
    <link rel="stylesheet" href="/assets/nav.css" />
    <!-- reveals start at opacity 0 and are switched on by site.js; without JS
         that would leave the page blank -->
    <noscript><style>[data-reveal] { opacity: 1 !important; transform: none !important; }</style></noscript>
    ${jsonld}
  </head>
  <body>
    ${GTM_NOSCRIPT}`;
}

// Nav model (top vendors + industries) for the dropdown menus. It now lives
// on the request's AsyncLocalStorage store when one exists: with two locales
// the model is NOT the same for every visitor any more, and a module-level
// variable would let a concurrent German request's nav bleed into an English
// render mid-await (and vice versa). The module-level copy remains only as a
// fallback for renders outside a request context.
let NAV_FALLBACK = { vendors: [], industries: [], popularUseCases: [], faces: [] };
function setNav(model) {
  if (!model) return;
  const s = i18n.store();
  if (s) s.nav = model;
  else NAV_FALLBACK = model;
}
function navModel() {
  const s = i18n.store();
  return (s && s.nav) || NAV_FALLBACK;
}

// A few coworker portraits to warm up the ink CTA bands. Rotated by a seed so
// the same band is not always the same three faces, but stable within a render.
function ctaFaces(seed, count) {
  const pool = navModel().faces || [];
  const n = Math.min(count || 4, pool.length);
  if (!n) return "";
  const start = Math.abs(seed || 0) % pool.length;
  const picked = [];
  for (let i = 0; i < n; i++) picked.push(pool[(start + i) % pool.length]);
  return `<span class="cta-faces" aria-hidden="true">${picked
    .map((c) => `<img src="${attr(c.image)}" alt="" loading="lazy" />`)
    .join("")}</span>`;
}

// The four product renders the landing page carousel uses. Sub-pages reach
// for these whenever a page would otherwise be a wall of text, and they are
// the fallback artwork for CMS entries that have no image of their own.
const SHOTS = {
  roster: {
    src: "/assets/shot-roster.webp",
    alt: "The Sokosumi roster: five named AI coworkers from Serviceplan, with Elena's profile open beside them",
    caption: "Your coworkers, in one roster. Each has a name and a role; profiles show the models a coworker runs on and the region it runs in.",
  },
  brief: {
    src: "/assets/shot-brief.webp",
    alt: "The Sokosumi briefing bar asking what you want to get done, with suggested campaign tasks below it",
    caption: "Start from the work, not the tool. Say what you want done and Sokosumi points you at the coworkers who do it.",
  },
  board: {
    src: "/assets/shot-board.webp",
    alt: "The Sokosumi task board: running tasks with the coworkers assigned to each",
    caption: "Watch it move. Every task shows who picked it up and where it stands, from running to input required to done.",
  },
  chat: {
    src: "/assets/shot-chat2.webp",
    alt: "The Sokosumi chat: a team channel where a coworker is mentioned and replies in the same thread",
    caption: "Brief them like colleagues. Mention a coworker in the channel and it answers in the thread.",
  },
};
const SHOT_KEYS = Object.keys(SHOTS);

// Stable per-page pick, so the same page always shows the same shot but two
// neighbouring pages do not show the same one.
function shotFor(seed) {
  const n = typeof seed === "string" ? seed.length + (seed.charCodeAt(0) || 0) : Number(seed) || 0;
  return SHOTS[SHOT_KEYS[Math.abs(n) % SHOT_KEYS.length]];
}

function shotFigure(shot, opts) {
  const o = opts || {};
  if (!shot) return "";
  return `<figure class="shot-fig${o.wide ? " wide" : ""}">
      <img src="${attr(shot.src)}" alt="${attr(shot.alt)}" width="2400" height="1350" loading="lazy" decoding="async" />
      ${o.caption === false ? "" : `<figcaption>${esc(shot.caption)}</figcaption>`}
    </figure>`;
}

// One customer quote, large. A grid of them reads as filler and repeats the
// same names on every page; a single quote given room reads as a statement.
// `t` is a testimonials doc (or a populated relationship from a quote block).
function quoteSection(t, opts) {
  if (!t || !t.quote) return "";
  const o = opts || {};
  const av = cms.mediaUrl(t.avatar);
  return `<section class="page-section${o.flush ? " flush" : ""} quote-section" data-reveal>
      ${o.heading ? `<p class="quote-kicker">${esc(o.heading)}</p>` : ""}
      <figure class="pull-quote">
        <blockquote>&ldquo;${esc(t.quote)}&rdquo;</blockquote>
        <figcaption>
          ${av ? `<span class="pq-avatar"><img src="${attr(av)}" alt="" loading="lazy" /></span>` : ""}
          <span class="pq-who"><strong>${esc(t.name)}</strong>${t.role ? `<small>${esc(t.role)}</small>` : ""}</span>
        </figcaption>
      </figure>
    </section>`;
}

// Deterministic pick for pages that are not editor-composed, so /pricing and
// the use-cases hub do not both show the same person.
function pickQuote(list, seed) {
  const items = (list || []).filter((t) => t && t.quote);
  if (!items.length) return null;
  return items[Math.abs(seed || 0) % items.length];
}

// Card grid class for a list whose length is known: one or two cards get a
// capped track instead of sitting in a three-column grid with empty columns.
function gridCls(n) {
  return n >= 3 ? "card-grid" : `card-grid cols-${n}`;
}

// A gallery of every shot, for pages that are about the product itself.
function shotGallery(keys) {
  const list = (keys && keys.length ? keys : SHOT_KEYS).map((k) => SHOTS[k]).filter(Boolean);
  return `<div class="shot-gallery">${list.map((s) => shotFigure(s)).join("")}</div>`;
}

// The ink end-cap every page closes with, same shape as the landing page's.
// Lives here rather than in blocks.js so templates that render no CMS blocks
// can use it too; blocks.ctaBand() delegates to this so a CMS-authored band
// and a hand-built one are the same markup.
// Sits under any button that starts a signup. The nav is the one exception —
// a bar of chrome is not the place for a reassurance line.
// Locale-dependent, so functions — exported through getters below to keep
// every `shell.NO_CARD` call site working unchanged.
const noCard = () => `<p class="no-card">${esc(t("*No Credit Card required"))}</p>`;
// Same line, but as a span so it can sit inside an existing note paragraph
// instead of becoming another item in a gapped flex column.
const noCardLine = () => `<span class="no-card">${esc(t("*No Credit Card required"))}</span>`;

// True when a CTA sends the visitor into the app, i.e. it is a signup. Bands
// that link somewhere else on the site (the blog's "Browse the roster") get
// no fine print, because nothing is being signed up for.
function isSignupHref(href) {
  return !href || href === APP || href.startsWith(APP + "/");
}

function ctaBand(b) {
  const heading = b.heading || t("Put an AI coworker on it");
  const label = b.ctaLabel || t("Start free");
  const href = b.ctaHref || APP_SIGNUP;
  // Two blocks, always: copy on the left, action on the right. The old markup
  // put the heading, subheading, faces and button in one grid and positioned
  // the button with an explicit row span, which only lined up when all three
  // optional pieces happened to be present.
  return `<section class="blk blk-cta" data-reveal><div class="cta-inner">
      <div class="cta-copy">
        <h2>${esc(heading)}</h2>
        ${b.subheading ? `<p>${esc(b.subheading)}</p>` : ""}
        ${ctaFaces(b.seed != null ? b.seed : heading.length, 4)}
      </div>
      <div class="cta-action">
        <a class="btn btn-primary btn-lg" href="${attr(href)}"${isSignupHref(href) ? ' data-analytics="sign_up_click" data-analytics-location="cta_band"' : ""}>${esc(label)}</a>
        ${isSignupHref(href) ? noCard() : ""}
      </div>
    </div></section>`;
}

const CHEV =
  '<svg class="nav-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

// The picture at the bottom of each panel's intro rail. The base .nav-visual
// is a finished-looking tinted dot-grid panel on its own, so a rail whose
// imagery is missing (or whose <img> fails and is removed by nav.js) degrades
// to a deliberate texture, never a broken image. Decorative throughout, so
// aria-hidden; images ship as data-src and are hydrated by nav.js on first
// open, exactly like the coworker faces, so a page view costs nothing.
function navVisual(variant, inner) {
  return `<div class="nav-visual${variant ? ` nav-visual-${variant}` : ""}" aria-hidden="true">${inner || ""}</div>`;
}

// A few coworker portraits for the AI Coworkers rail — the same drawn faces
// the CTA bands use, which are the imagery this menu is actually about.
function navVisualFaces() {
  const pool = (navModel().faces || []).slice(0, 4);
  return navVisual(
    "people",
    pool
      .map(
        (c) =>
          `<span class="nav-visual-face"><img data-src="${attr(c.image)}" alt="" width="56" height="56" /></span>`,
      )
      .join(""),
  );
}

// A zoomed crop of a product render for the Product rail.
function navVisualShot(src) {
  return navVisual("shot", `<img data-src="${attr(src)}" alt="" width="2400" height="1350" />`);
}

// The AI Coworkers mega menu: the top vendors with their wordmark, a few
// curated coworkers each, and the two catch-all links.
function agentsPanel() {
  const cols = navModel().vendors
    .map(
      (v) => `<div class="nav-col">
        <a class="nav-col-head${v.logo ? " has-logo" : ""}" href="/vendors/${encodeURIComponent(v.slug)}">${
          v.logo
            ? `<span class="nav-col-logo${v.logo.invert ? " invert" : ""}"><img src="${attr(
                v.logo.url,
              )}" alt="${attr(v.name)}" loading="lazy" /></span>`
            : esc(v.name)
        }</a>
        ${v.picks
          .map(
            (p) =>
              `<a class="nav-col-link has-face" href="/ai-coworkers/${encodeURIComponent(p.slug)}">${
                p.image
                  // data-src, not src: these are full-size portraits painted
                  // at 30px inside a closed menu. loading="lazy" does NOT stop
                  // the fetch — the hidden panel still has geometry, so every
                  // desktop page view pulled ~7 MB of avatars for a menu most
                  // visitors never open. nav.js promotes them on first open.
                  ? `<span class="nav-face"><img data-src="${attr(p.image)}" alt="" width="30" height="30" /></span>`
                  : `<span class="nav-face is-blank"></span>`
              }<span class="nav-face-text"><span>${esc(p.name)}</span>${
                p.role ? `<small>${esc(p.role)}</small>` : ""
              }</span></a>`,
          )
          .join("")}
      </div>`,
    )
    .join("");
  if (!cols) return "";
  return `<div class="nav-panel" role="group" aria-label="AI Coworkers">
      <div class="nav-panel-body">
        <div class="nav-intro">
          <p class="nav-intro-label">AI Coworkers</p>
          <p class="nav-intro-desc">${esc(t("Specialist AI agents with a name, a role and a vendor behind them. Brief one like a colleague and get finished work back."))}</p>
          ${navVisualFaces()}
        </div>
        <div class="nav-cols">${cols}</div>
      </div>
      <div class="nav-panel-foot">
        <a href="/vendors">${esc(t("Show all vendors"))} ${icon("arrow-up-right", 13)}</a>
        <a class="nav-foot-accent" href="/ai-coworkers">${esc(t("Show all coworkers"))} ${icon("arrow-up-right", 13)}</a>
      </div>
    </div>`;
}

// The Use cases menu: pick an industry, or open the hub.
// The Product menu: the deep-dives under /product, straight from the CMS,
// so a page added there shows up here without a code change.
function productPanel() {
  const pages = navModel().productPages || [];
  if (!pages.length) return "";
  const rows = pages
    .map(
      (p) =>
        `<a class="nav-col-link" href="/${p.slug.split("/").map(encodeURIComponent).join("/")}"><span>${esc(
          p.title,
        )}</span>${p.description ? `<small>${esc(shell_truncate(p.description, 62))}</small>` : ""}</a>`,
    )
    .join("");
  return `<div class="nav-panel" role="group" aria-label="${attr(t("Product"))}">
      <div class="nav-panel-body">
        <div class="nav-intro">
          <p class="nav-intro-label">${esc(t("Product"))}</p>
          <p class="nav-intro-desc">${esc(t("How work moves through Sokosumi: brief a coworker, follow it on the task board, collect the output."))}</p>
          ${navVisualShot("/assets/shot-board.webp")}
        </div>
        <div class="nav-grid">${rows}</div>
      </div>
      <div class="nav-panel-foot">
        <a href="/product">${esc(t("Product overview"))} ${icon("arrow-up-right", 13)}</a>
        <a class="nav-foot-accent" href="/pricing">${esc(t("Pricing"))} ${icon("arrow-up-right", 13)}</a>
      </div>
    </div>`;
}

// A short label for the menu: the SEO description is a sentence, the menu
// wants a phrase.
function shell_truncate(s, n) {
  const t = String(s || "").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n + 1);
  const at = cut.lastIndexOf(" ");
  return cut.slice(0, at > 20 ? at : n).replace(/[\s,;:.–—-]+$/, "") + "\u2026";
}

// The Use cases menu: six jobs, each with its primary industry under the
// title and a seeded abstract swatch beside it — the same field the page's
// own hero and card carry (templates/art.js), so the menu previews the page
// rather than fronting one coworker's face. The industry caption is what
// tells a visitor which vertical each job belongs to without leaving the
// menu; the full taxonomy still lives on /use-cases behind the left foot
// link. Geometry is untouched: same 880x356 panel as the other two menus.
function useCasesPanel() {
  const jobs = (navModel().popularUseCases || []).slice(0, 6);
  if (!jobs.length) return "";

  const rows = jobs
    .map((p) => {
      const swatch = art.field(p.slug, { w: 68, h: 68 });
      return `<a class="nav-col-link has-face" href="/use-cases/${encodeURIComponent(p.slug)}">${
        swatch ? `<span class="nav-swatch" aria-hidden="true">${swatch}</span>` : `<span class="nav-swatch is-blank" aria-hidden="true"></span>`
      }<span class="nav-face-text"><span>${esc(p.title)}</span>${
        p.industry ? `<small>${esc(p.industry)}</small>` : ""
      }</span></a>`;
    })
    .join("");

  return `<div class="nav-panel" role="group" aria-label="${attr(t("Use cases"))}">
      <div class="nav-panel-body">
        <div class="nav-intro">
          <p class="nav-intro-label">${esc(t("Use cases"))}</p>
          <p class="nav-intro-desc">${esc(t("Real jobs, start to finished file, organized by industry. Pick one and the coworkers behind it already know the brief."))}</p>
          ${navVisual("abstract", art.field("use-cases", { w: 400, h: 230 }))}
        </div>
        <div class="nav-jobs">${rows}</div>
      </div>
      <div class="nav-panel-foot">
        <a href="/use-cases#industries">${esc(t("Browse by industry"))} ${icon("arrow-up-right", 13)}</a>
        <a class="nav-foot-accent" href="/use-cases">${esc(t("All use cases"))} ${icon("arrow-up-right", 13)}</a>
      </div>
    </div>`;
}

function navItems(currentPath) {
  const isCurrent = (href) =>
    currentPath === href || (currentPath && currentPath.startsWith(href + "/")) ? ' aria-current="page"' : "";

  const agents = agentsPanel();
  const useCases = useCasesPanel();
  const product = productPanel();

  // Each dropdown trigger needs to say that it controls a panel and whether
  // that panel is open; nav.js keeps aria-expanded in sync as it opens and
  // closes. Without these a screen reader announced three plain links and
  // gave no way to know a menu existed.
  let panelSeq = 0;
  const item = (href, label, panel, extraMatch) => {
    // Both branches must yield a string: `extraMatch && …` is undefined when
    // there is no extraMatch, and interpolating that emits a literal
    // "undefined" into the tag (<a href="/pricing"undefined>).
    const current = isCurrent(href) || (extraMatch ? isCurrent(extraMatch) : "");
    if (!panel) return `<a href="${href}"${current}>${label}</a>`;
    const panelId = `nav-panel-${++panelSeq}`;
    const trigger = `<a href="${href}"${current} aria-haspopup="true" aria-expanded="false" aria-controls="${panelId}">${label}${CHEV}</a>`;
    return `<div class="nav-drop">${trigger}${panel.replace("<div class=\"nav-panel", `<div id="${panelId}" class="nav-panel`)}</div>`;
  };

  // Three items only. Guides and Releases are reference material, not paths
  // into the product, and they live in the footer.
  return [
    item("/ai-coworkers", esc(t("AI Coworkers")), agents, "/vendors"),
    item("/product", esc(t("Product")), product),
    item("/use-cases", esc(t("Use cases")), useCases),
    item("/pricing", esc(t("Pricing")), ""),
  ].join("\n            ");
}

// The drawer the burger opens below 900px. Same links as index.html's copy —
// both surfaces share /assets/nav.css and /assets/nav.js.
const MOBILE_LINKS = [
  ["/ai-coworkers", "AI Coworkers", "Named specialists you can hire"],
  ["/vendors", "Vendors", "The teams behind them"],
  ["/tasks", "Template tasks", "Ready-to-run work"],
  ["/product", "Product", "How it works, end to end"],
  ["/use-cases", "Use cases", "By job and by industry"],
  ["/pricing", "Pricing", "Plans and credits per seat"],
];

function mobileNav() {
  const links = MOBILE_LINKS.map(
    ([href, label, hint]) =>
      `<a class="m-link" href="${href}">${esc(t(label))}${hint ? `<small>${esc(t(hint))}</small>` : ""}</a>`,
  ).join("");
  return `<div class="mobile-nav" id="mobileNav" hidden>
        ${links}
        <div class="m-actions">
          <a class="btn btn-primary" href="${APP_SIGNUP}" data-analytics="sign_up_click" data-analytics-location="mobile_nav">${esc(t("Sign Up"))}</a>
          <a class="btn btn-outline" href="${SALES_URL}">${esc(t("Talk to Sales"))}</a>
          <a class="btn btn-ghost" href="${APP_SIGNIN}">${esc(t("Log In"))}</a>
        </div>
      </div>`;
}

const burger = () =>
  `<button class="nav-burger" id="navBurger" type="button" aria-label="${attr(t("Open menu"))}" aria-expanded="false" aria-controls="mobileNav"><span></span><span></span></button>`;

// The ONE site header. Sub-pages render it directly; the homepage gets the
// exact same markup injected by server.js (serveIndex) in place of the
// <!--SSR:HEADER--> placeholder in index.html, so the two surfaces cannot
// drift. `opts.overlay` adds the homepage treatment: transparent over the
// dark video hero, flipping to the standard paper bar once the hero scrolls
// away (assets/nav.js toggles .scrolled; assets/nav.css holds both states).
function header(currentPath, opts) {
  const overlay = opts && opts.overlay;
  return `<header class="site-header${overlay ? " is-overlay" : ""}">
      <div class="container-app bar">
        <div class="nav-left">
          <a href="/" aria-label="Sokosumi"><img class="mark" src="/assets/sokosumi-wordmark.svg" alt="Sokosumi" width="144" height="17" /></a>
          <nav class="site-nav" aria-label="Primary">
            ${navItems(currentPath)}
          </nav>
        </div>
        <div class="actions">
          <a class="btn btn-sm btn-ghost" href="${APP_SIGNIN}">${esc(t("Log In"))}</a>
          <a class="btn btn-sm btn-outline" href="${SALES_URL}">${esc(t("Talk to Sales"))}</a>
          <a class="btn btn-sm btn-primary" href="${APP_SIGNUP}" data-analytics="sign_up_click" data-analytics-location="nav">${esc(t("Sign Up"))}</a>
          ${burger()}
        </div>
      </div>
    </header>
    ${mobileNav()}`;
}

// The footer markup, shared the same way as header(): sub-pages get it from
// footer() below, the homepage gets this exact markup injected by server.js
// (serveIndex) in place of index.html's <!--SSR:FOOTER--> placeholder, so the
// two surfaces cannot drift. Styles live in /assets/nav.css — the one chrome
// stylesheet both surfaces load.
// The language switcher: same page, other locale. The EN link is written as
// /en/<path> — a marker lib/i18n.js localizeHtml() collapses to /<path>
// AFTER the /de link-rewrite pass, so it can never be double-prefixed.
function langSwitcher() {
  const path = i18n.currentPath();
  const cur = i18n.locale();
  const enHref = path === "/" ? "/en" : `/en${path}`;
  const deHref = path === "/" ? "/de" : `/de${path}`;
  const link = (loc, href, label) =>
    cur === loc
      ? `<span aria-current="true" lang="${loc}">${label}</span>`
      : `<a href="${attr(href)}" hreflang="${loc}" lang="${loc}" rel="alternate">${label}</a>`;
  return `<nav class="foot-lang" aria-label="Language">
            ${link("en", enHref, "English")}
            <span class="sep" aria-hidden="true">/</span>
            ${link("de", deHref, "Deutsch")}
          </nav>`;
}

function footerHtml() {
  return `<footer class="site">
      <div class="container-app">
        <div class="foot-grid">
          <div class="foot-brand">
            <a href="/" aria-label="Sokosumi">
              <img class="foot-mark" src="/assets/sokosumi-wordmark.svg" alt="Sokosumi" width="121" height="16" />
            </a>
            <p class="foot-tag">${esc(t("The marketplace where you hire AI coworkers for real marketing work — research, social, planning, and writing, delivered as finished files."))}</p>
          </div>
          <nav class="foot-cols" aria-label="Footer">
            <div class="foot-col">
              <h2 class="foot-h">${esc(t("Marketplace"))}</h2>
              <ul>
                <li><a href="/ai-coworkers">${esc(t("AI Coworkers"))}</a></li>
                <li><a href="/vendors">${esc(t("Vendors"))}</a></li>
                <li><a href="/tasks">${esc(t("Template tasks"))}</a></li>
                <li><a href="/list-your-agent">${esc(t("List your agent"))}</a></li>
              </ul>
            </div>
            <div class="foot-col">
              <h2 class="foot-h">${esc(t("Product"))}</h2>
              <ul>
                <li><a href="/product">${esc(t("How it works"))}</a></li>
                <li><a href="/use-cases">${esc(t("Use cases"))}</a></li>
                <li><a href="/pricing">${esc(t("Pricing"))}</a></li>
                <li><a href="/compare">${esc(t("Compare"))}</a></li>
              </ul>
            </div>
            <div class="foot-col">
              <h2 class="foot-h">${esc(t("Resources"))}</h2>
              <ul>
                <li><a href="/guides">${esc(t("Guides"))}</a></li>
                <li><a href="/blog">${esc(t("Blog"))}</a></li>
                <li><a href="/releases">${esc(t("Releases"))}</a></li>
                <li><a href="https://www.masumi.network/dev/sokosumi/documentation" target="_blank" rel="noreferrer">${esc(t("Developers"))}</a></li>
              </ul>
            </div>
            <div class="foot-col">
              <h2 class="foot-h">${esc(t("Company"))}</h2>
              <ul>
                <li><a href="/contact">${esc(t("Contact"))}</a></li>
                <li><a href="${SUPPORT_URL}">${esc(t("Support"))}</a></li>
                <li><a href="/press">${esc(t("Press"))}</a></li>
                <li><a href="https://masumi.network" target="_blank" rel="noreferrer">Masumi</a></li>
              </ul>
            </div>
          </nav>
        </div>
        <div class="foot-meta">
          <div class="foot-ai">
            <img src="/assets/ai-generated.png" alt="AI-generated content mark" width="32" height="32" loading="lazy" />
            <p>${esc(t("Some of the content on this site is AI generated."))}</p>
          </div>
          <nav class="foot-social" aria-label="Social">
            <a href="https://discord.com/invite/aj4QfnTS92" target="_blank" rel="noreferrer">Discord</a>
            <a href="https://x.com/sokosumi" target="_blank" rel="noreferrer">X</a>
            <a href="https://github.com/masumi-network" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://t.me/+igMz0AazR-cwMzJi" target="_blank" rel="noreferrer">Telegram</a>
            <a href="https://linkedin.com/company/sokosumi/" target="_blank" rel="noreferrer">LinkedIn</a>
          </nav>
        </div>
        <div class="foot-bottom">
          <p class="foot-copy">&copy; ${new Date().getFullYear()} Sokosumi. ${esc(t("All rights reserved."))}</p>
          ${langSwitcher()}
          <nav class="foot-legal" aria-label="${attr(t("Legal"))}">
            <a href="/legal/terms-of-service">${esc(t("Terms"))}</a>
            <a href="/legal/privacy-policy">${esc(t("Privacy"))}</a>
            <a href="/legal/cookie-policy">${esc(t("Cookies"))}</a>
            <a href="/legal/imprint">${esc(t("Imprint"))}</a>
            <a href="/legal">${esc(t("All legal"))}</a>
            <a href="#" data-cc-open>${esc(t("Cookie settings"))}</a>
          </nav>
        </div>
      </div>
    </footer>`;
}

function footer() {
  return `${footerHtml()}
    <script src="/assets/site.js" defer></script>
    <script src="/assets/nav.js" defer></script>
    <script src="/assets/consent.js" defer></script>
    <script src="/assets/track.js" defer></script>
  </body>
</html>`;
}

function crumbs(items) {
  const parts = items
    .map((it, i) => {
      const last = i === items.length - 1;
      // t() translates the chrome labels ("Home", "Vendors", "Use cases");
      // dynamic names pass through untouched.
      const label = esc(t(it.label));
      return last || !it.href
        ? `<span class="current">${label}</span>`
        : `<a href="${attr(it.href)}">${label}</a>`;
    })
    .join(' <span class="sep">/</span> ');
  return `<nav class="crumbs container-app" aria-label="Breadcrumb">${parts}</nav>`;
}

// Standard page opening: head + skip link + header + breadcrumbs + <main>.
// Close with pageEnd(). `cr` doubles as the BreadcrumbList JSON-LD source.
// The skip link is the first focusable thing on the page and targets the
// shared <main id="main"> — same mechanism as the landing page's own link.
function pageStart(opts) {
  return (
    head(opts) +
    `<a class="skip-link" href="#main">${esc(t("Skip to content"))}</a>` +
    header(opts.path) +
    (opts.breadcrumb ? crumbs(opts.breadcrumb) : "") +
    `<main id="main" tabindex="-1" class="page container-app">`
  );
}
function pageEnd() {
  return `</main>` + footer();
}

function avatar(entity, cls) {
  const img = entity && entity.image;
  // Marketplace listings are represented by a line-art icon, not a portrait,
  // so it gets contained and inset instead of cropped to fill the circle.
  const icon = entity && entity.kind === "agent" ? " is-icon" : "";
  if (img) {
    return `<span class="avatar ${cls || ""}${icon}"><img src="${attr(img)}" alt="" loading="lazy" /></span>`;
  }
  const initial = esc((entity && entity.name ? entity.name : "?").charAt(0));
  return `<span class="avatar ${cls || ""}" style="background:var(--ink)">${initial}</span>`;
}

// A vendor wordmark. Two sources with opposite polarity: an editor's upload and
// the product's own vendor artwork are dark on transparent, while the synced
// marketplace wordmarks are white on transparent and would vanish on paper.
// `.invert` flattens those to ink — the mirror of the landing page's
// `.band-dark .trust-logo { filter: brightness(0) invert(1) }`.
// Returns "" when there is no artwork: the vendor name always carries the page,
// so a missing logo must leave no empty box behind.
function vendorLogo(v, cls) {
  if (!v) return "";
  const uploaded = cms.mediaUrl(v.logo);
  const url = uploaded || v.logoUrl || null;
  if (!url) return "";
  const invert = !uploaded && v.logoInvert ? " invert" : "";
  return `<span class="vendor-logo ${cls || ""}${invert}"><img src="${attr(url)}" alt="${attr(
    v.name || "",
  )}" loading="lazy" /></span>`;
}

module.exports = {
  APP,
  APP_SIGNUP,
  APP_SIGNIN,
  SITE,
  itemListLd,
  SALES_URL,
  SUPPORT_URL,
  setNav,
  esc,
  attr,
  slugify,
  truncate,
  icon,
  outputMeta,
  markdownLite,
  head,
  header,
  footer,
  footerHtml,
  crumbs,
  pageStart,
  pageEnd,
  avatar,
  vendorLogo,
  ctaFaces,
  ctaBand,
  quoteSection,
  pickQuote,
  gridCls,
  SHOTS,
  shotFor,
  shotFigure,
  shotGallery,
};

// Locale-dependent snippets, kept as properties so every existing
// `shell.NO_CARD` interpolation keeps working — the getter renders for the
// locale of the request that is reading it.
Object.defineProperties(module.exports, {
  NO_CARD: { enumerable: true, get: noCard },
  NO_CARD_LINE: { enumerable: true, get: noCardLine },
});

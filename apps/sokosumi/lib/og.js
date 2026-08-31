// Generated Open Graph images: /og.png?type=…&… → 1200×630 PNG.
//
// Rendered with Satori (HTML-ish element tree → SVG) and resvg (SVG → PNG),
// no browser involved, so it runs inside the Vercel function. Layouts use
// the same ingredients as the pages: Inter, ink on paper, the Sokosumi mark,
// competitor logos from the CMS, coworker portraits from the catalog.
//
// Everything is derived from the query string so the CDN can cache each
// image by URL; the process also keeps a small in-memory cache.

const fs = require("fs");
const path = require("path");
const satori = require("satori").default || require("satori");
const { Resvg } = require("@resvg/resvg-js");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const W = 1200;
const H = 630;
const INK = "#0f0e0d";
const PAPER = "#f5f5f5";
const MUTED = "#6b6a68";
const HAIR = "rgba(15,14,13,0.14)";
const PURPLE = "#2b5c78";
const STAGE_DEEP = "linear-gradient(180deg, #0a0a0a 0%, #0f1c25 45%, #2c4452 100%)";
// The same ramp turned across the diagonal, which suits a 1.91:1 frame better
// than a vertical one: the light lands in the bottom-right, away from the text.
const STAGE_ANGLED = "linear-gradient(118deg, #0a0a0a 0%, #0f1c25 44%, #24485c 78%, #2c4452 100%)";

const FONTS = [300, 400, 500].map((weight) => ({
  name: "Inter",
  weight,
  style: "normal",
  data: fs.readFileSync(path.join(root, "assets", "fonts", "og", `inter-${weight}.woff`)),
}));

// The shipped app icon is still Wisteria purple. assets/og-mark.png is the
// same glyph with the purple field knocked out to white, so it reads on the
// deep stage band these cards close with. The app icon itself is untouched.
const markUri = (f) => "data:image/png;base64," + fs.readFileSync(path.join(root, "assets", f)).toString("base64");
// Two knockouts of the same glyph: the field drops out on the dark closing
// band, and becomes ink when the mark sits on a white tile.
const MARK = markUri("og-mark.png");
const MARK_INK = markUri("og-mark-ink.png");

// ---- remote images (logos, portraits) as data URIs, cached ----
const imgCache = new Map();
async function dataUri(url) {
  if (!url) return null;
  if (imgCache.has(url)) return imgCache.get(url);
  let out = null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      let type = (res.headers.get("content-type") || "image/png").split(";")[0];
      let buf = Buffer.from(await res.arrayBuffer());
      // Satori/resvg read PNG, JPEG and SVG. Portraits and covers arrive as
      // WebP or AVIF, so anything else is converted (and downsized) here.
      if (!/^image\/(png|jpeg|svg\+xml)$/.test(type)) {
        buf = await sharp(buf).resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true }).png().toBuffer();
        type = "image/png";
      }
      out = `data:${type};base64,${buf.toString("base64")}`;
    }
  } catch {
    out = null;
  }
  if (imgCache.size > 300) imgCache.delete(imgCache.keys().next().value);
  imgCache.set(url, out);
  return out;
}

// ---- tiny element helpers (Satori takes React-shaped objects) ----
const h = (type, style, children, extra) => ({ type, props: { style, ...(extra || {}), children } });
const text = (s, style) => h("div", { display: "flex", ...style }, String(s));

function clamp(s, n) {
  s = String(s || "").trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

// The card ground. Every layout sits on the same deep stage the site uses for
// its CTA bands and product stages, which is the most recognisable thing
// Sokosumi owns — and a dark card is the one that stops a thumb in a feed of
// white ones. The old frame was grey paper with a 104px near-black bar welded
// to the bottom: bottom-heavy, and it spent a sixth of the card repeating the
// wordmark next to the domain.
// The wordmark is already on the card, so a tag that only repeats it is noise.
// The homepage ships eyebrow=Sokosumi and coworker pages ship
// "AI coworker on Sokosumi"; both lose the brand here and keep the rest.
function tagLabel(raw) {
  const t = String(raw || "").replace(/\s+on\s+Sokosumi\s*$/i, "").trim();
  return !t || /^sokosumi$/i.test(t) ? "" : clamp(t, 28);
}

function frame(children, opts) {
  const o = opts || {};
  return h(
    "div",
    {
      width: W,
      height: H,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      color: "#ffffff",
      fontFamily: "Inter",
      padding: "56px 72px",
      backgroundColor: "#0f1c25",
      // Two stops of light: the stage ramp across the diagonal, and a soft
      // steel bloom off the top-right so the field is not a flat wash.
      backgroundImage: `radial-gradient(900px 520px at 88% 6%, rgba(0,164,250,0.20) 0%, rgba(0,164,250,0) 62%), ${STAGE_ANGLED}`,
    },
    [
      // ---- top rail: who this is, and what kind of page it is
      h("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
        h("div", { display: "flex", alignItems: "center", gap: 14 }, [
          h("img", { width: 38, height: 38, borderRadius: 10 }, null, { src: MARK }),
          text("Sokosumi", { fontSize: 23, fontWeight: 500, color: "#ffffff", letterSpacing: -0.2 }),
        ]),
        tagLabel(o.tag)
          ? h(
              "div",
              {
                display: "flex",
                alignItems: "center",
                padding: "7px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.22)",
                fontSize: 17,
                fontWeight: 500,
                color: "rgba(255,255,255,0.78)",
              },
              tagLabel(o.tag),
            )
          : null,
      ].filter(Boolean)),

      // ---- the card's actual content, given the whole middle
      h("div", { display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", paddingTop: 28, paddingBottom: 28 }, children),

      // ---- bottom rail: a hairline, then the URL. No second wordmark.
      h("div", { display: "flex", flexDirection: "column" }, [
        h("div", { display: "flex", height: 1, backgroundColor: "rgba(255,255,255,0.16)", marginBottom: 22 }, []),
        h("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
          text(o.right || "sokosumi.com", { fontSize: 21, color: "rgba(255,255,255,0.66)" }),
          o.note ? text(clamp(o.note, 40), { fontSize: 19, color: "rgba(255,255,255,0.42)" }) : null,
        ].filter(Boolean)),
      ]),
    ],
  );
}

// Competitor logos arrive as full-colour marks made for white, so they sit on
// a white tile rather than being dropped straight onto the dark ground.
function tile(src, name, size) {
  const s = size || 92;
  return h("div", { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }, [
    src
      ? h("img", { width: s, height: s, borderRadius: s * 0.24, backgroundColor: "#ffffff", objectFit: "contain", padding: s * 0.14 }, null, { src })
      : h(
          "div",
          { width: s, height: s, borderRadius: s * 0.24, backgroundColor: "#ffffff", color: INK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: s * 0.42, fontWeight: 500 },
          String(name || "?").slice(0, 1),
        ),
    text(clamp(name, 22), { fontSize: 30, fontWeight: 500, letterSpacing: -0.4, color: "#ffffff" }),
  ]);
}

const vsPill = () =>
  h(
    "div",
    { display: "flex", alignItems: "center", justifyContent: "center", width: 54, height: 54, borderRadius: 999, border: "1px solid rgba(255,255,255,0.24)", fontSize: 17, fontWeight: 500, letterSpacing: 1.5, color: "rgba(255,255,255,0.7)", marginTop: 19 },
    "VS",
  );

// A headline sized to its own length, so a short title fills the card and a
// long one still fits on three lines.
const headline = (t, opts) => {
  const o = opts || {};
  const n = String(t || "").length;
  const size = o.max ? Math.min(o.max, n > 62 ? 54 : n > 42 ? 66 : 80) : n > 62 ? 54 : n > 42 ? 66 : 80;
  return text(clamp(t, 110), { fontSize: size, fontWeight: 300, lineHeight: 1.06, letterSpacing: -2.2, color: "#ffffff", maxWidth: o.width || 1000 });
};

const sub = (t, width) =>
  text(clamp(t, 150), { fontSize: 26, color: "rgba(255,255,255,0.66)", marginTop: 26, lineHeight: 1.4, maxWidth: width || 880 });

// ---- layouts ----
async function layoutCompare(q) {
  const logo = await dataUri(q.logo);
  return frame(
    [
      h("div", { display: "flex", alignItems: "flex-start", gap: 30, marginBottom: 36 }, [tile(MARK_INK, "Sokosumi"), vsPill(), tile(logo, q.b || "")]),
      headline(q.title, { max: 56 }),
      q.sub ? text(clamp(q.sub, 90), { fontSize: 24, color: "rgba(255,255,255,0.66)", marginTop: 20, lineHeight: 1.35, maxWidth: 860 }) : null,
    ].filter(Boolean),
    { right: "sokosumi.com/compare", tag: "Comparison" },
  );
}

async function layoutPair(q) {
  const [la, lb] = await Promise.all([dataUri(q.logoA), dataUri(q.logoB)]);
  return frame(
    [
      h("div", { display: "flex", alignItems: "flex-start", gap: 30, marginBottom: 36 }, [tile(la, q.a || ""), vsPill(), tile(lb, q.b || "")]),
      headline(q.title, { max: 56 }),
      q.sub ? text(clamp(q.sub, 90), { fontSize: 24, color: "rgba(255,255,255,0.66)", marginTop: 20, lineHeight: 1.35, maxWidth: 860 }) : null,
    ].filter(Boolean),
    { right: "sokosumi.com/compare", tag: "Comparison" },
  );
}

async function layoutArticle(q) {
  const cover = await dataUri(q.img);
  return frame(
    [
      h("div", { display: "flex", gap: 56, alignItems: "center", width: "100%" }, [
        h(
          "div",
          { display: "flex", flexDirection: "column", width: cover ? 620 : 1056 },
          [headline(q.title, { width: cover ? 620 : 1000, max: cover ? 60 : 80 }), q.sub ? sub(q.sub, cover ? 620 : 880) : null].filter(Boolean),
        ),
        cover ? h("img", { width: 348, height: 348, borderRadius: 22, objectFit: "cover" }, null, { src: cover }) : null,
      ].filter(Boolean)),
    ],
    { right: q.right || "sokosumi.com", tag: q.eyebrow || null },
  );
}

async function layoutCoworker(q) {
  const portrait = await dataUri(q.img);
  return frame(
    [
      h("div", { display: "flex", gap: 56, alignItems: "center", width: "100%" }, [
        portrait
          ? h("img", { width: 292, height: 292, borderRadius: 146, objectFit: "cover" }, null, { src: portrait })
          : h(
              "div",
              { width: 292, height: 292, borderRadius: 146, backgroundColor: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 116, fontWeight: 300, color: "#ffffff" },
              String(q.title || "?").slice(0, 1),
            ),
        h("div", { display: "flex", flexDirection: "column", width: 660 }, [
          text(clamp(q.title, 40), { fontSize: 92, fontWeight: 300, lineHeight: 1, letterSpacing: -3, color: "#ffffff" }),
          q.sub ? text(clamp(q.sub, 60), { fontSize: 34, marginTop: 20, color: "rgba(255,255,255,0.9)", fontWeight: 400 }) : null,
          q.meta ? text(clamp(q.meta, 90), { fontSize: 23, marginTop: 16, color: "rgba(255,255,255,0.58)" }) : null,
        ].filter(Boolean)),
      ]),
    ],
    { right: "sokosumi.com/ai-coworkers", tag: q.eyebrow || "AI coworker" },
  );
}

async function layoutPage(q) {
  return frame([headline(q.title), q.sub ? sub(q.sub, 940) : null].filter(Boolean), {
    right: q.right || "sokosumi.com",
    tag: q.eyebrow || null,
  });
}

const LAYOUTS = { compare: layoutCompare, pair: layoutPair, article: layoutArticle, coworker: layoutCoworker, page: layoutPage };

// ---- render + cache ----
const pngCache = new Map();
async function render(query) {
  const key = JSON.stringify(query);
  if (pngCache.has(key)) return pngCache.get(key);
  const layout = LAYOUTS[query.type] || layoutPage;
  const tree = await layout(query);
  const svg = await satori(tree, { width: W, height: H, fonts: FONTS });
  const raw = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
  // resvg emits full-colour PNG, and the stage gradient does not compress in
  // that form: 259 KB for a card that is one gradient and some text. Quantised
  // to a palette it is 44 KB with no banding I can see at 1200×630, which
  // matters because a crawler that times out fetching the image renders the
  // card without one. Falls back to the raw PNG if sharp throws.
  let png = raw;
  try {
    png = await sharp(raw).png({ palette: true, quality: 100, compressionLevel: 9 }).toBuffer();
  } catch {
    png = raw;
  }
  if (pngCache.size > 200) pngCache.delete(pngCache.keys().next().value);
  pngCache.set(key, png);
  return png;
}

// Bump when the card design changes. The rendered image is cached for a week
// at the CDN with a month of stale-while-revalidate, and the key is derived
// only from the page's own copy — so without this a redesign keeps serving the
// old card until that expires. It rides in the key, so every card gets a new
// URL, which is also what nudges the social platforms to re-scrape.
const CARD_VERSION = "2";

// Build the /og.png URL for a page. Only short, public strings go in.
function url(site, q) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v != null && v !== "") params.set(k, String(v).slice(0, 200));
  params.set("v", CARD_VERSION);
  const key = Buffer.from(params.toString()).toString("base64url");
  return `${site}/og/${key}.png`;
}
// /og/<base64url(query)>.png → query object. Scrapers treat a path that
// ends in .png with no query string most reliably.
function parsePath(urlPath) {
  const m = urlPath.match(/^\/og\/([A-Za-z0-9_-]+)\.png$/);
  if (!m) return null;
  try {
    return Object.fromEntries(new URLSearchParams(Buffer.from(m[1], "base64url").toString("utf8")));
  } catch {
    return null;
  }
}

module.exports = { render, url, parsePath, W, H };

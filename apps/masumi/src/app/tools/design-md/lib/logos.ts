import type { Cheerio, CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import type { Logo } from "./design-md";

export type LogoCandidate = {
  source:
    | "header-svg"
    | "header-img"
    | "icon-svg"
    | "apple-touch-icon"
    | "icon-png"
    | "mask-icon"
    | "og-image";
  /** An http(s) address, or a `data:image/svg+xml` URL for an inline SVG. */
  url: string;
  format: "svg" | "png" | "jpg" | "ico" | "webp" | "unknown";
  /** A lockup carries the name; a mark is the square symbol alone. */
  shape: "lockup" | "mark" | "unknown";
  /** The background it is drawn for, when the page says so. */
  theme?: "light" | "dark";
  /** The same inline SVG in white, for a dark background. */
  darkUrl?: string;
  /** How sure we are that a page element is the site's own logo. */
  score?: number;
  size?: string;
  alt?: string;
  className?: string;
};

/** Inline SVGs above this are illustrations, not logos. */
const MAX_SVG_CHARS = 60_000;
const MAX_CANDIDATES = 12;
/** Below this an element is a picture near the header, not the logo. */
const MIN_SCORE = 6;

const HOME_PATH = /^\/(home(page)?\/?|index\.html?|[a-z]{2}([-_][a-z]{2})?\/?)?$/i;
const HOME_HASH = /^#(top|home|start)?$/i;
/** "logo" and its like as a word of its own: "logos" is a wall of other brands. */
const LOGO_WORD = /(^|[^a-z])(logo|wordmark|lockup|brand(mark)?)(?![a-rt-z])(?!s\b)/i;
/** Sections that show other companies' logos. */
const OTHER_BRANDS =
  /partner|client|customer|sponsor|testimonial|trusted|press|payment|social|investor|backer|integration|badge|award|app-?store|google-?play|marquee|carousel|slider/i;
const WHITE_FILE = /(^|[-_./])(white|inverse|inverted|negative|reversed?|on-?dark)([-_.]|$)/i;
const BLACK_FILE = /(^|[-_./])(black|on-?light|positive)([-_.]|$)/i;

/**
 * Every logo the page offers, best first: the logo in its header (an image or
 * inline SVG in the link home, or one named after the brand), then the icons
 * its head declares, then its share card.
 */
export function extractLogos(
  $: CheerioAPI,
  baseUrl: string,
  brandNames: string[] = [],
): LogoCandidate[] {
  const out: LogoCandidate[] = [];
  const seen = new Set<string>();
  const push = (candidate: LogoCandidate) => {
    if (!candidate.url || seen.has(candidate.url)) return;
    seen.add(candidate.url);
    out.push(candidate);
  };

  for (const candidate of pageLogos($, baseUrl, brandNames)) push(candidate);

  $('link[rel="icon"][href]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const svg = $(el).attr("type") === "image/svg+xml" || detectFormat(href) === "svg";
    push({
      source: svg ? "icon-svg" : "icon-png",
      url: absolutize(href, baseUrl),
      format: svg ? "svg" : detectFormat(href),
      shape: "mark",
      size: $(el).attr("sizes"),
    });
  });
  $('link[rel="apple-touch-icon"][href], link[rel="apple-touch-icon-precomposed"][href]').each(
    (_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      push({
        source: "apple-touch-icon",
        url: absolutize(href, baseUrl),
        format: detectFormat(href),
        shape: "mark",
        size: $(el).attr("sizes"),
      });
    },
  );
  $('link[rel="mask-icon"][href]').each((_, el) => {
    const href = $(el).attr("href");
    if (href)
      push({ source: "mask-icon", url: absolutize(href, baseUrl), format: "svg", shape: "mark" });
  });
  const og = $('meta[property="og:image"]').attr("content");
  if (og) {
    push({
      source: "og-image",
      url: absolutize(og, baseUrl),
      format: detectFormat(og),
      shape: "unknown",
    });
  }

  return out.sort((a, b) => rank(a) - rank(b)).slice(0, MAX_CANDIDATES);
}

/**
 * The logo for the front matter: `src` is the fullest logo the site shows,
 * `srcDark` its version for a dark background, and `mark` the square symbol
 * when `src` is a lockup.
 */
export function pickLogo(candidates: LogoCandidate[]): Logo | undefined {
  const ordered = [...candidates].sort((a, b) => rank(a) - rank(b));
  const best = ordered[0];
  if (!best) return undefined;
  const onPage = ordered.filter((candidate) => candidate.score !== undefined);
  // A white logo cannot be the main one while the page also has a dark one.
  const main =
    best.theme === "dark"
      ? (onPage.find((candidate) => candidate.theme !== "dark" && sameShape(candidate, best)) ??
        best)
      : best;
  const dark =
    main.darkUrl ??
    onPage.find(
      (candidate) => candidate !== main && candidate.theme === "dark" && sameShape(candidate, main),
    )?.url;
  const mark =
    main.shape === "mark"
      ? undefined
      : ordered.find((candidate) => candidate !== main && candidate.shape === "mark");
  return {
    src: main.url,
    ...(dark && dark !== main.url ? { srcDark: dark } : {}),
    ...(mark ? { mark: mark.url } : {}),
    ...(main.alt ? { alt: main.alt } : {}),
  };
}

const SOURCE_ORDER: LogoCandidate["source"][] = [
  "header-svg",
  "header-img",
  "icon-svg",
  "apple-touch-icon",
  "icon-png",
  "mask-icon",
  "og-image",
];

/** Lower is better: a logo on the page by its score, then the declared icons. */
function rank(candidate: LogoCandidate): number {
  if (candidate.score !== undefined) {
    // A lockup says more than a mark with the same evidence.
    return -candidate.score - (candidate.shape === "lockup" ? 0.5 : 0);
  }
  return SOURCE_ORDER.indexOf(candidate.source) * 10 - declaredSize(candidate.size) / 1000;
}

function declaredSize(size: string | undefined): number {
  const match = size?.match(/(\d+)x(\d+)/i);
  return match ? Math.min(Number(match[1]), 999) : 0;
}

function sameShape(a: LogoCandidate, b: LogoCandidate): boolean {
  return a.shape === b.shape || a.shape === "unknown" || b.shape === "unknown";
}

function pageLogos($: CheerioAPI, baseUrl: string, brandNames: string[]): LogoCandidate[] {
  const base = URL.canParse(baseUrl) ? new URL(baseUrl) : null;
  const names = brandNames
    .map((name) => name.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((name) => name.length > 1);
  const found: LogoCandidate[] = [];

  $("img, svg").each((_, node) => {
    const $el = $(node);
    if ($el.parents("svg").length > 0) return;
    const $link = $el.closest("a[href]");
    const region =
      $el.closest("header, nav, [role=banner]").length > 0
        ? "header"
        : $el.closest("footer, [role=contentinfo]").length > 0
          ? "footer"
          : "body";
    const home = $link.length > 0 && isHomeLink($link.attr("href") ?? "", base, region);

    const ancestors = $el.parents().slice(0, 4).toArray();
    const around = [node, ...ancestors]
      .map((el) => `${$(el).attr("class") ?? ""} ${$(el).attr("id") ?? ""}`)
      .join(" ")
      .toLowerCase();
    if (OTHER_BRANDS.test(around)) return;

    const src = node.tagName === "img" ? imageSource($el) : "";
    const fileName = src.startsWith("data:") ? "" : (src.split(/[?#]/)[0].split("/").pop() ?? "");
    const labels = [
      $el.attr("alt"),
      $el.attr("aria-label"),
      $el.attr("title"),
      $el.children("title").first().text(),
      $link.attr("aria-label"),
      $link.attr("title"),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const squashed = `${labels} ${fileName}`.replace(/[^a-z0-9]/g, "");
    const ours = names.some((name) => squashed.includes(name));
    const named = ours || /\b(logo|home(page)?)\b/.test(labels);
    const logoWord = LOGO_WORD.test(around) || LOGO_WORD.test(fileName);
    // Off the link home, a "logo" is ours only in the header or under our name:
    // a customer's logo further down is called a logo too.
    if (!home && !(logoWord && (region === "header" || ours))) return;

    const score =
      (home ? 4 : 0) +
      (region === "header" ? 3 : region === "footer" ? 1 : 0) +
      (logoWord ? 3 : 0) +
      (named ? 2 : 0);
    if (score < MIN_SCORE) return;

    const className = ($el.attr("class") ?? "").toLowerCase();
    const alt = $el.attr("alt") || $el.attr("aria-label") || $link.attr("aria-label") || undefined;
    if (node.tagName === "svg") {
      const svg = serialiseSvg($, $el);
      if (!svg) return;
      found.push({
        source: "header-svg",
        url: svgDataUrl(svg.light),
        format: "svg",
        shape: shapeOf(svg.width, svg.height),
        ...(svg.dark
          ? { darkUrl: svgDataUrl(svg.dark) }
          : svg.white
            ? { theme: "dark" as const }
            : {}),
        score,
        alt,
        className: className || undefined,
      });
      return;
    }
    if (!src) return;
    const theme = imageTheme(className, fileName);
    const shape = shapeOf(Number($el.attr("width")), Number($el.attr("height")));
    found.push({
      source: "header-img",
      url: absolutize(src, baseUrl),
      format: detectFormat(src),
      // A header image without sizes is almost always the full logo.
      shape: shape === "unknown" && /wordmark|lockup|logo/i.test(fileName) ? "lockup" : shape,
      ...(theme ? { theme } : {}),
      score,
      alt,
      className: className || undefined,
    });
    // <picture> names the dark-mode file itself.
    const darkSource = $el
      .closest("picture")
      .find('source[media*="prefers-color-scheme: dark"]')
      .attr("srcset");
    if (darkSource) {
      found.push({
        source: "header-img",
        url: absolutize(firstOfSrcset(darkSource), baseUrl),
        format: detectFormat(darkSource),
        shape,
        theme: "dark",
        score: score - 1,
        alt,
      });
    }
  });

  return found;
}

function isHomeLink(href: string, base: URL | null, region: string): boolean {
  const value = href.trim();
  if (value.startsWith("#")) return region === "header" && HOME_HASH.test(value);
  if (!base) return false;
  const url = URL.parse(value, base);
  if (!url) return false;
  const host = (u: URL) => u.hostname.replace(/^www\./, "");
  return host(url) === host(base) && HOME_PATH.test(url.pathname);
}

function imageSource($el: Cheerio<Element>): string {
  const src = $el.attr("src") ?? "";
  // A 1x1 placeholder stands in until the real file lazy-loads.
  if (src && !(src.startsWith("data:") && !src.startsWith("data:image/svg"))) return src;
  const lazy = $el.attr("data-src") ?? $el.attr("srcset") ?? $el.attr("data-srcset") ?? "";
  return firstOfSrcset(lazy);
}

function firstOfSrcset(srcset: string): string {
  return srcset.split(",")[0]?.trim().split(/\s+/)[0] ?? "";
}

/** Which background an image logo is for, from Tailwind's `dark:` classes or its file name. */
function imageTheme(className: string, fileName: string): "light" | "dark" | undefined {
  if (/(^|\s)dark:(hidden|invisible|opacity-0)(\s|$)/.test(className)) return "light";
  if (/(^|\s)dark:(block|inline|inline-block|flex|visible|opacity-100)(\s|$)/.test(className))
    return "dark";
  if (WHITE_FILE.test(fileName)) return "dark";
  if (BLACK_FILE.test(fileName)) return "light";
  return undefined;
}

function shapeOf(width: number, height: number): LogoCandidate["shape"] {
  if (!(width > 0) || !(height > 0)) return "unknown";
  const aspect = width / height;
  if (aspect >= 1.6) return "lockup";
  if (aspect <= 1.3 && aspect >= 0.77) return "mark";
  return "unknown";
}

const UNSAFE_ELEMENTS = "script, foreignObject, iframe, object, embed, audio, video, image, a";
const WHITE = /^(#fff(fff)?|white|rgb\(255,\s*255,\s*255\))$/i;
const INHERITED = /currentColor|var\((?:[^()]|\([^()]*\))*\)/gi;

/**
 * An inline SVG as a file of its own: symbols it `<use>`s pulled in, anything
 * that could run or load removed, and colours it inherits from the page drawn
 * in black (`light`) and in white (`dark`). Null when it is not a usable logo.
 */
export function serialiseSvg(
  $: CheerioAPI,
  $svg: Cheerio<Element>,
): { light: string; dark?: string; white: boolean; width: number; height: number } | null {
  const $copy = $svg.clone();
  let viewBox = $copy.attr("viewBox") ?? $copy.attr("viewbox");
  $copy.find("use").each((_, use) => {
    const id = ($(use).attr("href") ?? $(use).attr("xlink:href") ?? "").replace(/^#/, "");
    const $target = id ? $(`[id="${id.replace(/"/g, "")}"]`).first() : null;
    if (!$target || $target.length === 0) {
      $(use).remove();
      return;
    }
    viewBox ??= $target.attr("viewBox") ?? $target.attr("viewbox");
    const inner = $target.is("symbol") ? ($target.html() ?? "") : $.html($target);
    $(use).replaceWith(`<g>${inner}</g>`);
  });
  $copy.find(UNSAFE_ELEMENTS).remove();
  $copy.find("style").each((_, style) => {
    if (/@import|url\(/i.test($(style).text())) $(style).remove();
  });
  for (const el of [$copy.get(0), ...$copy.find("*").toArray()]) {
    if (!el) continue;
    for (const name of Object.keys(el.attribs)) {
      const value = el.attribs[name];
      const external = /^(xlink:)?href$/i.test(name) && !value.startsWith("#");
      if (/^on/i.test(name) || external || /javascript:/i.test(value)) delete el.attribs[name];
    }
  }
  if ($copy.find("path, polygon, rect, circle, ellipse, text, line, polyline").length === 0)
    return null;

  const width = Number.parseFloat($copy.attr("width") ?? "");
  const height = Number.parseFloat($copy.attr("height") ?? "");
  const box = viewBox?.trim().split(/[\s,]+/).map(Number);
  const size =
    box?.length === 4 && box[2] > 0 && box[3] > 0
      ? { width: box[2], height: box[3] }
      : width > 0 && height > 0
        ? { width, height }
        : null;
  if (!size) return null;
  for (const name of ["class", "style", "width", "height", "viewbox", "viewBox", "color"])
    $copy.removeAttr(name);
  $copy.attr("xmlns", "http://www.w3.org/2000/svg");
  $copy.attr("viewBox", viewBox?.trim() ?? `0 0 ${size.width} ${size.height}`);

  const markup = $.html($copy);
  if (markup.length > MAX_SVG_CHARS) return null;
  // Colours the SVG sets itself; what it inherits from the page is ours to pick.
  const own = [...markup.matchAll(/\b(?:fill|stroke)\s*[=:]\s*["']?\s*([^"';\s>]+)/gi)]
    .map((match) => match[1])
    .filter((value) => value !== "none" && !/^(currentColor|var\()/i.test(value));
  const inherits = own.length === 0;
  return {
    light: markup.replace(INHERITED, "#000000"),
    ...(inherits ? { dark: recolour(markup, "#ffffff") } : {}),
    white: own.length > 0 && own.every((value) => WHITE.test(value)),
    ...size,
  };
}

/** An SVG that sets no colour of its own, drawn in `colour`. */
function recolour(markup: string, colour: string): string {
  const drawn = markup.replace(INHERITED, colour);
  // With no fill anywhere, shapes are black by default.
  return /\bfill\s*[=:]/i.test(drawn) ? drawn : drawn.replace(/^<svg\b/i, `<svg fill="${colour}"`);
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function detectFormat(url: string): LogoCandidate["format"] {
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".svg") || lower.startsWith("data:image/svg")) return "svg";
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpg";
  if (lower.endsWith(".webp")) return "webp";
  if (lower.endsWith(".ico")) return "ico";
  return "unknown";
}

function absolutize(href: string, base: string): string {
  if (href.startsWith("data:")) return href;
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

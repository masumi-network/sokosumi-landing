import Browserbase from "@browserbasehq/sdk";
import { chromium, type Page } from "playwright-core";

const VIEWPORT = { width: 1280, height: 800 };
// Three viewports of page for the vision pass. Tall enough to reach the
// second and third section on most marketing sites, short enough that the
// downscale still leaves component shapes legible.
const VISION_MAX_HEIGHT = 2400;
const NAV_TIMEOUT_MS = 25_000;

export type ComputedStyle = {
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  borderRadius?: string;
  padding?: string;
};

export type RenderedPage = {
  url: string;
  html: string;
  // Screenshot fed to the LLM as vision input, clipped to VISION_MAX_HEIGHT
  // so it stays well inside Claude's 8000px image dimension limit. It used to
  // be viewport-only (800px), which meant the model never saw a footer, a
  // card, a form or a table — everything below the hero was invisible to the
  // pass that is supposed to describe layout and rhythm. Optional: if capture
  // fails we keep the HTML + computed styles and the LLM runs text-only.
  screenshotBase64?: string;
  screenshotMime?: "image/jpeg";
  // Taller clipped capture used for the gallery thumbnail.
  thumbnailBase64?: string;
  thumbnailMime?: "image/jpeg";
  computed: {
    body?: ComputedStyle;
    h1?: ComputedStyle;
    header?: ComputedStyle;
    primaryCta?: ComputedStyle;
    secondaryCta?: ComputedStyle;
    firstCard?: ComputedStyle;
    firstInput?: ComputedStyle;
  };
};

export async function renderWithBrowserbase(
  rawUrl: string,
): Promise<RenderedPage | null> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;
  if (!apiKey || !projectId) return null;

  const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  const bb = new Browserbase({ apiKey });

  let browser: Awaited<ReturnType<typeof chromium.connectOverCDP>> | null = null;

  try {
    const session = await bb.sessions.create({ projectId });
    browser = await chromium.connectOverCDP(session.connectUrl);

    const context = browser.contexts()[0] ?? (await browser.newContext());
    const page = context.pages()[0] ?? (await context.newPage());

    await page.setViewportSize(VIEWPORT);
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });
    // Best-effort wait for network idle to let CSS-in-JS settle
    await page
      .waitForLoadState("networkidle", { timeout: 6_000 })
      .catch(() => {});
    // Give animations / fade-ins a moment
    await page.waitForTimeout(800);

    // Cheap steps first — HTML + computed styles. If these succeed we
    // already have most of what the LLM needs.
    const computed = await collectComputed(page);
    const html = await page.content();

    // Screenshot best-effort. Two-stage capture:
    // 1. Viewport-only (1280×800) for the LLM vision input. Claude / Bedrock
    //    rejects images whose longest dimension exceeds 8000px, so full-page
    //    captures on tall sites blow up. Viewport-only is always safe AND
    //    captures the hero/CTA region, which is the most brand-informative.
    // 2. A capped full-page capture for the gallery thumbnail (purely
    //    visual, never sent to the LLM).
    let screenshotBase64: string | undefined;
    let thumbnailBase64: string | undefined;
    try {
      const docHeightForVision = await page
        .evaluate(() => document.documentElement.scrollHeight)
        .catch(() => VIEWPORT.height);
      const visionHeight = Math.min(docHeightForVision, VISION_MAX_HEIGHT);
      const viewportShot = await page.screenshot({
        type: "jpeg",
        quality: 80,
        clip: { x: 0, y: 0, width: VIEWPORT.width, height: visionHeight },
        timeout: 12_000,
      });
      screenshotBase64 = viewportShot.toString("base64");
    } catch (e) {
      console.warn(
        `[render] viewport screenshot failed for ${url}, continuing without vision:`,
        e instanceof Error ? e.message : e,
      );
    }

    // Gallery thumbnail — clipped full-page so we don't run into the 8000px
    // limit (which doesn't apply here since we're not sending to LLM, but
    // huge images bloat the DB BLOB anyway).
    try {
      const docHeight = await page
        .evaluate(() => document.documentElement.scrollHeight)
        .catch(() => VIEWPORT.height);
      const clipHeight = Math.min(docHeight, 4000);
      const thumb = await page.screenshot({
        type: "jpeg",
        quality: 75,
        clip: { x: 0, y: 0, width: VIEWPORT.width, height: clipHeight },
        timeout: 15_000,
      });
      thumbnailBase64 = await trimScreenshot(thumb);
    } catch (e) {
      console.warn(
        `[render] thumbnail capture failed for ${url}:`,
        e instanceof Error ? e.message : e,
      );
      // Fall back to using the viewport shot as the thumbnail too
      thumbnailBase64 = screenshotBase64;
    }

    return {
      url,
      html,
      ...(screenshotBase64
        ? { screenshotBase64, screenshotMime: "image/jpeg" as const }
        : {}),
      ...(thumbnailBase64
        ? { thumbnailBase64, thumbnailMime: "image/jpeg" as const }
        : {}),
      computed,
    };
  } catch (err) {
    console.error(`[render] browserbase error for ${url}:`, err);
    return null;
  } finally {
    // Closing the browser drops the WS connection and Browserbase releases
    // the session shortly after. No explicit session.update needed.
    try {
      await browser?.close();
    } catch {}
  }
}

async function collectComputed(page: Page): Promise<RenderedPage["computed"]> {
  // Run in browser context. Inline to avoid TS narrowing issues.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await page.evaluate(() => {
    const props = [
      "backgroundColor",
      "color",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "borderRadius",
      "padding",
    ] as const;
    const get = (sel: string) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      const out: Record<string, string> = {};
      for (const p of props) out[p] = cs.getPropertyValue(p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()));
      return out;
    };

    // Heuristic primary CTA: large prominent button-like element
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        'a[href], button, [role="button"]',
      ),
    );
    const scored = candidates
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const txt = (el.textContent || "").trim().toLowerCase();
        const cls = (el.className || "").toString().toLowerCase();
        const bg = window.getComputedStyle(el).backgroundColor;
        const hasBg = bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
        const isPromo =
          /\b(get started|sign up|start free|try free|book|join|launch|start now|buy|subscribe)\b/.test(
            txt,
          ) || /(primary|cta|brand|button-primary)/.test(cls);
        const visible =
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top < window.innerHeight * 1.2;
        const area = rect.width * rect.height;
        return { el, area, hasBg, isPromo, visible };
      })
      .filter((c) => c.visible && c.hasBg)
      .sort((a, b) => {
        const score = (c: typeof a) =>
          (c.isPromo ? 1e6 : 0) + Math.min(c.area, 40000);
        return score(b) - score(a);
      });

    const primary = scored[0]?.el;
    const secondary = scored[1]?.el;
    const fromEl = (el?: HTMLElement | null) => {
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      const out: Record<string, string> = {};
      for (const p of props) out[p] = cs.getPropertyValue(p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()));
      return out;
    };

    return {
      body: get("body"),
      h1: get("h1"),
      header: get("header, [role=banner], nav"),
      primaryCta: fromEl(primary),
      secondaryCta: fromEl(secondary),
      firstCard: get('[class*="card"], article, section [class*="container"]'),
      firstInput: get("input[type=text], input[type=email], input:not([type])"),
    };
  });

  return remapKeys(result);
}

// browser sends back kebab-case keys (e.g. background-color); remap to camelCase
function remapKeys(raw: Record<string, Record<string, string> | null> | null) {
  if (!raw) return {};
  const camel = (s: string) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const out: Record<string, ComputedStyle> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!v) continue;
    const obj: ComputedStyle = {};
    for (const [pk, pv] of Object.entries(v)) {
      if (typeof pv === "string" && pv) {
        (obj as Record<string, string>)[camel(pk)] = pv;
      }
    }
    out[k] = obj;
  }
  return out;
}

async function trimScreenshot(buffer: Buffer): Promise<string> {
  // Cap base64 size by truncating the buffer if extremely large (>1.5MB).
  // We rely on JPEG having most useful brand info near the top of the page,
  // so truncating the bottom of a tall full-page capture is fine for vision.
  // If buffer is reasonable, just return it.
  // Note: we don't have sharp/canvas; just bound the byte size of base64.
  const MAX_BYTES = 1_500_000;
  if (buffer.byteLength <= MAX_BYTES) {
    return buffer.toString("base64");
  }
  // JPEG can't be cleanly truncated; safer: return what we have anyway. The
  // model accepts large images; this is just a soft cap.
  return buffer.toString("base64");
}

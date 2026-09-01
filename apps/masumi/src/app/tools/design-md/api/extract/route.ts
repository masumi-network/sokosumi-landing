import { NextResponse } from "next/server";
import { extractFromUrl } from "../../lib/extract-from-url";
import { getRecentByUrl, saveExtraction } from "../../lib/extractions-db";
import { serializeDesignMd, parseDesignMd } from "../../lib/design-md";
import { BlockedUrlError, normalizeUrl } from "../../lib/url-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Persistent cache TTL — same URL within this window returns the saved
// extraction instantly, saving the Browserbase + LLM round-trip. Brand
// identity rarely changes in a week; Regenerate (force=true) bypasses.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Per-IP rate limit. Every uncached call spends a Browserbase session and a
// Haiku call with max_tokens 7000, on an endpoint with no auth — so without a
// ceiling a single loop runs up the bill. In-memory, so it is per-instance:
// enough to stop a naive loop, not a distributed one. Move to a shared store
// if this ever needs to hold against real abuse.
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 12 };
const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    const retryAfterSec = Math.ceil((RATE_LIMIT.windowMs - (now - recent[0])) / 1000);
    hits.set(ip, recent);
    return { limited: true, retryAfterSec };
  }
  recent.push(now);
  hits.set(ip, recent);
  // keep the map from growing without bound on a long-lived instance
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < RATE_LIMIT.windowMs)) hits.delete(k);
    }
  }
  return { limited: false, retryAfterSec: 0 };
}

export async function POST(req: Request) {
  let url: string | undefined;
  let force = false;
  try {
    const body = await req.json();
    url = typeof body?.url === "string" ? body.url : undefined;
    force = body?.force === true;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "Missing 'url' field" }, { status: 400 });
  }

  // Normalise before anything else, so the cache lookup below and the
  // extractor agree on one spelling of the URL: stripe.com,
  // https://stripe.com, https://stripe.com/ and https://www.stripe.com/ were
  // four separate cache entries and four full extractions of one site.
  try {
    url = normalizeUrl(url);
  } catch (e) {
    const message = e instanceof BlockedUrlError ? e.message : "Invalid URL";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { limited, retryAfterSec } = rateLimited(clientIp(req));
  if (limited) {
    return NextResponse.json(
      { error: "Too many analyses from this address. Try again shortly." },
      { status: 429, headers: { "retry-after": String(retryAfterSec) } },
    );
  }

  // Persistent cache: check SQLite for a recent successful extraction of
  // this exact URL before spending Browserbase + LLM cycles. Skipped on
  // explicit Regenerate.
  if (!force) {
    try {
      const cached = getRecentByUrl(url, CACHE_TTL_MS);
      if (cached) {
        const parsed = parseDesignMd(cached.designMd);
        const ageMs = Date.now() - cached.createdAt;
        return NextResponse.json({
          frontmatter: parsed.frontmatter,
          prose: parsed.sections.map((s) => ({
            heading: s.heading,
            body: s.body,
          })),
          source: cached.source,
          meta: { model: "cached", latencyMs: 0, ageMs },
          cached: true,
          savedId: cached.id,
        });
      }
    } catch (e) {
      console.error("[extract] cache lookup error:", e);
      // Fall through to fresh extraction
    }
  }

  try {
    const result = await extractFromUrl(url, { force });

    // Persist successful LLM-extracted entries so they appear in the public
    // gallery + can be reloaded instantly. Don't save heuristic fallbacks —
    // they're low quality and would clutter the gallery.
    let savedId: number | undefined;
    if (result.source === "llm") {
      try {
        const md = serializeFromExtract(result);
        savedId = saveExtraction({
          url,
          name: result.frontmatter.name ?? null,
          primaryColor: result.frontmatter.colors?.primary ?? null,
          logoUrl: result.frontmatter.logo?.src ?? null,
          screenshot: result.screenshot ?? null,
          designMd: md,
          source: result.source,
        });
      } catch (e) {
        console.error("[extract] save error:", e);
      }
    }

    return NextResponse.json({ ...result, savedId });
  } catch (e) {
    // A blocked target is the caller's mistake, not ours — 400 with the real
    // reason, so the UI can say why instead of showing a server error.
    if (e instanceof BlockedUrlError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : "Failed to extract";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function serializeFromExtract(result: {
  frontmatter: Record<string, unknown>;
  prose: { heading: string; body: string }[];
}): string {
  // Use the same parse+serialize round-trip so saved files match what users
  // download. parseDesignMd canonicalises section ordering.
  const proseText = result.prose
    .map((p) => `## ${p.heading}\n\n${p.body}`)
    .join("\n\n");
  // Build a minimal markdown text and re-serialize through the parser.
  // Easier: just emit YAML frontmatter + prose using serializeDesignMd on a
  // hand-rolled DesignSystem.
  return serializeDesignMd({
    frontmatter: result.frontmatter as Parameters<
      typeof serializeDesignMd
    >[0]["frontmatter"],
    sections: result.prose.map((p) => ({ heading: p.heading, body: p.body })),
    raw: "",
  });
}

// Silence unused-import warning if linter ever flags parseDesignMd.
void parseDesignMd;

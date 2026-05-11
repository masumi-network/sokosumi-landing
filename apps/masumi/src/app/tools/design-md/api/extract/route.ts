import { NextResponse } from "next/server";
import { extractFromUrl } from "../../lib/extract-from-url";
import { getRecentByUrl, saveExtraction } from "../../lib/extractions-db";
import { serializeDesignMd, parseDesignMd } from "../../lib/design-md";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Persistent cache TTL — same URL within this window returns the saved
// extraction instantly, saving the Browserbase + LLM round-trip. Brand
// identity rarely changes in a week; Regenerate (force=true) bypasses.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

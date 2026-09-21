import { NextResponse } from "next/server";
import { parseDesignMd } from "../../../lib/design-md";
import { getById } from "../../../lib/extractions-db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await ctx.params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const entry = getById(id);
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = parseDesignMd(entry.designMd);
  return NextResponse.json({
    id: entry.id,
    url: entry.url,
    hostname: entry.hostname,
    name: entry.name,
    primaryColor: entry.primaryColor,
    logoUrl: entry.logoUrl,
    designMd: entry.designMd,
    frontmatter: parsed.frontmatter,
    prose: parsed.sections.map((section) => ({
      heading: section.heading,
      body: section.body,
    })),
    source: entry.source,
    screenshotUrl: entry.hasScreenshot
      ? `/tools/design-md/api/screenshots/${entry.id}`
      : null,
    createdAt: entry.createdAt,
  });
}

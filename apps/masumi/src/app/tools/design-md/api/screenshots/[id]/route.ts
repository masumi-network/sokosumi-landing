import { NextResponse } from "next/server";
import { getScreenshot } from "../../../lib/extractions-db";

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
  const shot = getScreenshot(id);
  if (!shot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new Response(new Uint8Array(shot.buffer), {
    headers: {
      "content-type": shot.mime,
      "cache-control": "public, max-age=86400, immutable",
    },
  });
}

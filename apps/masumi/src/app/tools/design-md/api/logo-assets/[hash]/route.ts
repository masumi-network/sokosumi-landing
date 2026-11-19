import { NextResponse } from "next/server";
import { getLogoAsset } from "../../../lib/extractions-db";

export const runtime = "nodejs";

// An inline SVG logo a site's header drew, stored by extract-from-url. The
// markup came from someone else's page: the policy keeps it from running or
// loading anything when it is opened on its own.
export async function GET(_req: Request, ctx: { params: Promise<{ hash: string }> }) {
  const { hash } = await ctx.params;
  const svg = /^[0-9a-f]{32}$/.test(hash) ? getLogoAsset(hash) : null;
  if (!svg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "x-content-type-options": "nosniff",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

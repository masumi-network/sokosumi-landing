import { NextResponse } from "next/server";
import { getById } from "../../../lib/extractions-db";

export const runtime = "nodejs";

const MAX_BYTES = 1_500_000;
const HEADERS = {
  "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
};

async function fetchImage(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "image/svg+xml,image/*;q=0.9,*/*;q=0.5", "User-Agent": "Mozilla/5.0 (compatible; DesignMdLogoProxy/1.0)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length || buf.length > MAX_BYTES) return null;
    return new Response(new Uint8Array(buf), { headers: { ...HEADERS, "content-type": type } });
  } catch {
    return null;
  }
}

// Serves the analysed site's logo from our origin: upstream logos are often
// http://, on third-party CDNs, or data: URIs, none of which a gallery should
// hotlink. Falls back to Google's favicon service so every card gets a mark.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await ctx.params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const entry = getById(id);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const src = entry.logoUrl || "";
  if (src.startsWith("data:image/")) {
    const match = /^data:(image\/[a-z+.-]+)(;base64)?,(.*)$/i.exec(src);
    if (match) {
      const body = match[2] ? Buffer.from(match[3], "base64") : Buffer.from(decodeURIComponent(match[3]));
      return new Response(new Uint8Array(body), { headers: { ...HEADERS, "content-type": match[1] } });
    }
  }
  if (/^https?:\/\//i.test(src)) {
    const direct = await fetchImage(src.replace(/^http:\/\//i, "https://"));
    if (direct) return direct;
  }
  const fallback = await fetchImage(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(entry.hostname)}&sz=128`);
  if (fallback) return fallback;
  return NextResponse.json({ error: "No logo" }, { status: 404 });
}

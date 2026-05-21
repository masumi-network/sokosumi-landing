import { NextResponse } from "next/server";

export function requireApiKey(req: Request): NextResponse | null {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "INTERNAL_API_KEY not configured on server" },
      { status: 503 },
    );
  }
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

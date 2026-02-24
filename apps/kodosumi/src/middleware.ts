import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (host === "kodosumi.io") {
    const url = request.nextUrl.clone();
    url.host = "www.kodosumi.io";
    return NextResponse.redirect(url, 301);
  }
}

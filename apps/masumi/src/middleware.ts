import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { HOMEPAGE_LINK_HEADER } from "@/lib/homepage-link-header";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  if (host === "masumi.network") {
    const url = request.nextUrl.clone();
    url.host = "www.masumi.network";
    const response = NextResponse.redirect(url, 301);
    if (pathname === "/") {
      response.headers.set("Link", HOMEPAGE_LINK_HEADER);
    }
    return response;
  }

  if (pathname === "/") {
    const response = NextResponse.next();
    response.headers.set("Link", HOMEPAGE_LINK_HEADER);
    return response;
  }
}

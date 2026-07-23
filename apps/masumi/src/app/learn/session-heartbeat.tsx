"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const protectedRoots = ["/learn/course", "/learn/account"];

export function SessionHeartbeat() {
  const pathname = usePathname();
  const authenticatedRoute = protectedRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
  useEffect(() => {
    if (authenticatedRoute) void fetch("/api/learn/session", { method: "POST", headers: { "content-type": "application/json" }, cache: "no-store" });
  }, [authenticatedRoute, pathname]);
  return null;
}

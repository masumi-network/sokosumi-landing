"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const protectedRoots = ["/learn/course", "/learn/assessment", "/learn/dashboard", "/learn/account", "/learn/completion", "/learn/builder"];
const lessonSlugs = new Set(["agentic-economy", "masumi-fundamentals", "blockchain-basics", "trust-and-payments"]);

export function SessionHeartbeat() {
  const pathname = usePathname();
  const segment = pathname.split("/")[2];
  const authenticatedRoute = protectedRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`)) || lessonSlugs.has(segment);
  useEffect(() => {
    if (authenticatedRoute) void fetch("/api/learn/session", { method: "POST", headers: { "content-type": "application/json" }, cache: "no-store" });
  }, [authenticatedRoute, pathname]);
  return null;
}

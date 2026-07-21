"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionUser = { displayName: string | null; email: string | null };

export function LearnAccountNav() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void fetch("/api/learn/session", { cache: "no-store" })
      .then(async (response) => response.ok ? (await response.json()).user as SessionUser : null)
      .then((sessionUser) => { if (active) setUser(sessionUser); })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  if (user === undefined) return <div className="h-9 w-28 shrink-0" aria-hidden="true" />;
  if (!user) return <Link href="/learn/login" className="mx-1 shrink-0 rounded-full bg-black px-4 py-2 text-xs font-medium text-white">Sign in</Link>;

  const name = user.displayName || user.email?.split("@")[0] || "learner";
  return <div className="ml-1 flex shrink-0 items-center gap-2 border-l border-black/10 pl-2">
    <Link href="/learn/account" className="max-w-40 truncate rounded-full px-3 py-2 text-xs font-medium text-black/65" title={`Hello, ${name}`}>Hello, {name}</Link>
    <form action="/api/learn/auth/logout" method="post"><button className="rounded-full border border-black/15 px-4 py-2 text-xs font-medium hover:border-black/35">Log out</button></form>
  </div>;
}

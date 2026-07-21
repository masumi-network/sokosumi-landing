"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionUser = { displayName: string | null; email: string | null };

export function LearnAccountNav() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void fetch("/api/learn/session", { cache: "no-store" })
      .then(async (response) => (response.ok ? ((await response.json()).user as SessionUser) : null))
      .then((sessionUser) => {
        if (active) setUser(sessionUser);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (user === undefined) return <div className="h-9 w-28 shrink-0" aria-hidden="true" />;
  if (!user) {
    return (
      <Link href="/learn/login" className="mx-1 shrink-0 rounded-full bg-black px-4 py-2 text-xs font-medium text-white">
        Sign in
      </Link>
    );
  }

  const name = (user.displayName && user.displayName.trim()) || user.email?.split("@")[0] || "learner";
  return (
    <div className="ml-1 flex shrink-0 items-center gap-1.5 border-l border-black/10 pl-2 sm:gap-2">
      <Link
        href="/learn/dashboard"
        className="hidden rounded-full px-3 py-2 text-xs font-medium text-black/65 hover:bg-black/5 sm:inline"
      >
        My learning
      </Link>
      <Link
        href="/learn/account"
        className="max-w-36 truncate rounded-full bg-black/[0.04] px-3 py-2 text-xs font-medium text-black/75 hover:bg-black/10 sm:max-w-44"
        title={`Account for ${name}`}
      >
        Hello, {name}
      </Link>
      <form action="/api/learn/auth/logout" method="post" className="contents">
        <button type="submit" className="rounded-full border border-black/15 px-3 py-2 text-xs font-medium hover:border-black/35 sm:px-4">
          Log out
        </button>
      </form>
    </div>
  );
}

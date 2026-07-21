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

  if (user === undefined) return <div className="h-[30px] w-24 shrink-0" aria-hidden="true" />;
  if (!user) {
    return (
      <Link href="/learn/login" className="ml-1 shrink-0 rounded-full bg-[#6400FF] px-4 py-[7px] text-[13px] font-medium leading-[1.2] text-white transition-colors duration-200 hover:bg-[#5200d0]">
        Sign in
      </Link>
    );
  }

  const name = (user.displayName && user.displayName.trim()) || user.email?.split("@")[0] || "learner";
  return (
    <div className="ml-1 flex shrink-0 items-center gap-1.5 border-l border-black/10 pl-2.5">
      <Link
        href="/learn/account"
        className="hidden max-w-36 truncate rounded-full px-3 py-[7px] text-[13px] leading-[1.2] text-black/[0.62] transition-colors duration-200 hover:bg-white hover:text-black sm:block sm:max-w-44"
        title={`Account for ${name}`}
      >
        Hello, {name}
      </Link>
      <form action="/api/learn/auth/logout" method="post" className="contents">
        <button type="submit" className="rounded-full border border-[#bbbbbb] bg-white px-3.5 py-[6px] text-[13px] font-medium leading-[1.2] text-black transition-colors duration-200 hover:bg-[#f5f5f5]">
          Log out
        </button>
      </form>
    </div>
  );
}

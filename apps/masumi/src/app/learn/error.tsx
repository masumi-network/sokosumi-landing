"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function LearnError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[learn]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm sm:p-12">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A50045]">Masumi Learn</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">Something went wrong</h1>
      <p className="mt-4 text-sm leading-6 text-black/60">
        This screen could not be loaded. Your session may still be active—try again, open My learning, or sign in again.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="rounded-full bg-black px-5 py-3 text-sm text-white">
          Try again
        </button>
        <Link href="/learn/dashboard" className="rounded-full border border-black/15 px-5 py-3 text-sm">
          My learning
        </Link>
        <Link href="/learn/login" className="rounded-full border border-black/15 px-5 py-3 text-sm">
          Sign in
        </Link>
      </div>
      {error.digest && <p className="mt-5 text-xs text-black/35">Reference: {error.digest}</p>}
    </div>
  );
}

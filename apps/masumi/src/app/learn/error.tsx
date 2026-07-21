"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function LearnError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[learn]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl border border-black/[0.04] bg-white p-8 text-center sm:p-12">
      <p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Masumi Learn</p>
      <h1 className="mt-3 text-[28px] font-normal leading-[1.2] tracking-[-0.4px] md:text-[40px]">Something went wrong</h1>
      <p className="mt-4 text-[16px] leading-[24px] text-[#5b5b5b]">
        This screen could not be loaded. Your session may still be active—try again, open My learning, or sign in again.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="rounded-full bg-[#6400FF] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-[#5200d0]">
          Try again
        </button>
        <Link href="/learn/course" className="rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-black transition-colors duration-200 hover:bg-[#f5f5f5]">
          My learning
        </Link>
        <Link href="/learn/login" className="rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-black transition-colors duration-200 hover:bg-[#f5f5f5]">
          Sign in
        </Link>
      </div>
      {error.digest && <p className="mt-5 text-xs text-[#5b5b5b]">Reference: {error.digest}</p>}
    </div>
  );
}

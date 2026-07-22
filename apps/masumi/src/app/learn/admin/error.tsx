"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminDashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[learn-admin-dashboard]", error); }, [error]);

  return (
    <section className="mx-auto max-w-xl border border-black/[0.04] bg-white p-8 text-center sm:p-12" aria-labelledby="admin-error-title">
      <p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Learn operations</p>
      <h1 id="admin-error-title" className="mt-3 text-[28px] font-normal leading-[1.2] tracking-[-0.4px] md:text-[40px]">Analytics could not be loaded</h1>
      <p className="mt-4 text-[16px] leading-6 text-[#5b5b5b]">No dashboard data is shown when the report is unavailable. Try again or return to your Learn account.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="rounded-full bg-[#6400FF] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors hover:bg-[#5200d0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]">Try again</button>
        <Link href="/learn/account" className="rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-black transition-colors hover:bg-[#f5f5f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]">Learn account</Link>
      </div>
      {error.digest && <p className="mt-5 text-xs text-[#5b5b5b]">Reference: {error.digest}</p>}
    </section>
  );
}

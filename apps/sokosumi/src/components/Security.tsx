import Link from "next/link";
import { FadeIn } from "@summation/shared";

export default function Security() {
  return (
    <section className="pt-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="bg-black p-8 md:p-12 lg:p-20 pb-16 md:pb-20 lg:pb-[120px] relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute right-[10%] top-[5%] w-[320px] h-[320px] rounded-full border border-white/[0.06]" />
          <div className="absolute right-[25%] top-[5%] w-[320px] h-[320px] rounded-full border border-white/[0.06]" />
          <div className="absolute right-[5%] top-[30%] w-[200px] h-[200px] rounded-full border border-white/[0.04]" />

          {/* Grid pattern */}
          <div className="absolute right-[8%] bottom-[10%] grid grid-cols-4 gap-2 opacity-[0.06]">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white" />
            ))}
          </div>

          <FadeIn>
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-10">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white">
                <rect x="3" y="9" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6.5 9V5.5a3.5 3.5 0 017 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="10" cy="14" r="1.5" fill="currentColor" />
              </svg>
              <span className="text-white text-[23px] font-normal">Security</span>
            </div>

            <h2 className="text-[24px] md:text-[32px] font-normal tracking-[-0.32px] leading-[1.2] text-white max-w-[500px]">
              Built in Europe. Built for Trust.
            </h2>
            <p className="mt-5 text-[20px] text-[#797979] max-w-[420px] leading-[1.31]">
              Sokosumi is GDPR-compliant and EU AI Act aligned. Decision logging
              for auditability, clear accountability, and transparency-first by
              design.
            </p>

            <Link
              href="/security"
              className="mt-10 inline-flex items-center gap-2 text-[16px] text-white hover:text-white/80 transition-colors"
            >
              Explore Security
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1L6 6L1 11" />
              </svg>
            </Link>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <div className="border border-white/20 rounded-lg px-5 py-2.5 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.2">
                  <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" />
                  <path d="M5.5 8l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-white text-[16px] font-normal">
                  GDPR
                </span>
              </div>
              <div className="border border-white/20 rounded-lg px-5 py-2.5 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.2">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M4 6h8M4 10h8" />
                  <ellipse cx="8" cy="8" rx="3" ry="6" />
                </svg>
                <span className="text-white text-[16px] font-normal">
                  EU AI Act
                </span>
              </div>
              <div className="border border-white/20 rounded-lg px-5 py-2.5 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.2">
                  <rect x="2" y="3" width="12" height="10" rx="1.5" />
                  <path d="M5 7h6M5 10h3" />
                </svg>
                <span className="text-white text-[16px] font-normal">
                  Audit Logs
                </span>
              </div>
            </div>
          </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

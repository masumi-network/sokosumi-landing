import Link from "next/link";
import { FadeIn } from "@summation/shared";

export default function CTA() {
  return (
    <section className="pt-24 pb-0">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="bg-black p-12 md:p-16 lg:p-24 relative overflow-hidden">
          <FadeIn>
            <div className="relative z-10 flex flex-col items-center text-center">
              <p className="text-[14px] text-white/40 uppercase tracking-[0.15em] mb-6">
                Early access is open
              </p>
              <h2 className="text-[32px] md:text-[56px] font-normal tracking-[-0.8px] leading-[1.1] text-white max-w-[700px]">
                Your team, amplified.
              </h2>
              <p className="mt-6 text-[16px] md:text-[20px] text-white/40 max-w-[460px] leading-[1.4]">
                Give your team AI coworkers that research, plan, write, and optimize. So you can focus on strategy.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <Link
                  href="https://app.sokosumi.com"
                  className="bg-white text-black text-[16px] font-normal px-8 py-3.5 rounded-full hover:bg-white/90 transition-colors"
                >
                  Get started
                </Link>
                <Link
                  href="https://app.sokosumi.com/auth/google"
                  className="border border-white/20 text-white text-[16px] font-normal px-8 py-3.5 rounded-full hover:border-white/40 transition-colors"
                >
                  Book a demo
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

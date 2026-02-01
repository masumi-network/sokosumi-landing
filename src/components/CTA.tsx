import Link from "next/link";

export default function CTA() {
  return (
    <section className="pt-24 pb-0">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="bg-black rounded-xl p-12 md:p-16 lg:p-20 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full border border-white/[0.06]" />
          <div className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] rounded-full border border-white/[0.04]" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-white max-w-[500px]">
                Your marketing team, amplified.
              </h2>
              <p className="mt-4 text-[18px] text-[#797979] max-w-[400px] leading-[1.4]">
                Start working with AI agents that actually deliver. Early access available now.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/get-started"
                className="bg-white text-black text-[14px] md:text-[16px] font-normal px-7 py-3 rounded-full hover:bg-white/90 transition-colors flex-shrink-0"
              >
                Get started
              </Link>
              <Link
                href="/product"
                className="text-white/70 text-[14px] md:text-[16px] font-normal px-4 py-3 hover:text-white transition-colors flex-shrink-0"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

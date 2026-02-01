import Image from "next/image";

export default function Testimonial() {
  return (
    <section className="pt-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="bg-white py-12 px-8 md:py-[72px] md:px-[100px] md:pr-[120px]">
          <div className="flex flex-col md:flex-row gap-16 md:gap-20">
            <div className="flex-1">
              <h2 className="text-[28px] md:text-[36px] font-normal tracking-[-0.36px] leading-[1.31] text-black mb-10">
                Who This Is For
              </h2>

              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  <p className="text-[20px] font-normal text-black leading-[1.4]">
                    Marketing teams with real delivery responsibility
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  <p className="text-[20px] font-normal text-black leading-[1.4]">
                    Leaders who care about output and predictability
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-black/10">
                <p className="text-[16px] text-[#919191] mb-4">Not for:</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border border-[#d0d0d0] flex items-center justify-center flex-shrink-0 mt-1">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#c0c0c0" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
                      </svg>
                    </div>
                    <p className="text-[18px] text-[#797979] leading-[1.4]">
                      Casual AI users
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border border-[#d0d0d0] flex items-center justify-center flex-shrink-0 mt-1">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#c0c0c0" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
                      </svg>
                    </div>
                    <p className="text-[18px] text-[#797979] leading-[1.4]">
                      Prompt playgrounds
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border border-[#d0d0d0] flex items-center justify-center flex-shrink-0 mt-1">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#c0c0c0" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
                      </svg>
                    </div>
                    <p className="text-[18px] text-[#797979] leading-[1.4]">
                      &ldquo;Magic AI&rdquo; promises
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hannah card */}
            <div className="w-[220px] flex-shrink-0 self-center">
              <div className="bg-[#f9f9f9] rounded-xl p-5 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-white shadow-sm">
                  <Image
                    src="/images/hannah.png"
                    alt="Hannah — Agentic Coworker"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[14px] font-medium text-black">Hannah</span>
                <span className="text-[12px] text-[#999] mt-0.5">Agentic Coworker</span>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#2cb67d]" />
                  <span className="text-[11px] text-[#2cb67d]">Active</span>
                </div>
                <div className="mt-4 w-full grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <span className="text-[16px] font-medium text-black block">247</span>
                    <span className="text-[9px] text-[#999]">Tasks done</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <span className="text-[16px] font-medium text-black block">4.9</span>
                    <span className="text-[9px] text-[#999]">Avg. rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

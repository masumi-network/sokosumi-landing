import type { Metadata } from "next";
import { Header, Footer } from "@summation/shared";

export const metadata: Metadata = {
  title: "Press",
};

export default function PressPage() {
  return (
    <>
      <Header product="sokosumi" />
      <main className="pt-[140px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black mb-16">
            Press
          </h1>

          <div className="flex flex-col gap-12 text-[16px] text-[#333] leading-[1.7]">
            <section>
              <p>
                For press inquiries, logos, and brand assets, please visit our
                press kit.
              </p>
              <a
                href="https://drive.google.com/drive/u/1/folders/1WbjV0HBr9ztn1C5Zyc7_xeuya3az3FEY"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-black underline underline-offset-2 hover:text-black/60 transition-colors"
              >
                Press Kit on Google Drive
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                  <path d="M5.5 2.5H3.5C2.94772 2.5 2.5 2.94772 2.5 3.5V10.5C2.5 11.0523 2.94772 11.5 3.5 11.5H10.5C11.0523 11.5 11.5 11.0523 11.5 10.5V8.5M8.5 2.5H11.5V5.5M11.5 2.5L6.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer product="sokosumi" />
    </>
  );
}

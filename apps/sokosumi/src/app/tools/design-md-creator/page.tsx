import type { Metadata } from "next";
import { Header, Footer } from "@summation/shared";
import Creator from "./Creator";

export const metadata: Metadata = {
  title: "DESIGN.md Creator — visual design systems for AI agents",
  description:
    "Generate, edit, and download a DESIGN.md file for your brand. Paste a URL or upload an existing file. Built by Sokosumi.",
};

export default function Page() {
  return (
    <>
      <Header product="sokosumi" />
      <main className="pt-[140px] pb-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-[760px] mb-14">
            <p className="text-[12px] text-[#999] uppercase tracking-[0.15em] mb-5">
              Free tool · DESIGN.md
            </p>
            <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-0.8px] leading-[1.1] text-black">
              Create a design system your AI agents can read
            </h1>
            <p className="mt-6 text-[16px] md:text-[18px] text-[#5b5b5b] leading-[1.5]">
              <a
                href="https://github.com/google-labs-code/design.md"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-black"
              >
                DESIGN.md
              </a>{" "}
              is an open spec by Google Labs that gives coding agents a structured,
              persistent understanding of a brand. Generate one from your website,
              tweak it visually, and download — no code required.
            </p>
          </div>

          <Creator />
        </div>
      </main>
      <Footer product="sokosumi" />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";

export const metadata: Metadata = {
  title: "API documentation",
  description:
    "Entry point for Masumi protocol and site API documentation. Machine-readable catalog at /.well-known/api-catalog.",
};

export default function ApiDocsPage() {
  return (
    <>
      <Header product="masumi" />
      <main className="pt-[140px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black mb-6">
            API documentation
          </h1>
          <p className="text-black/80 text-[17px] leading-relaxed mb-8">
            Protocol APIs, payment flows, and the Agentic Service (MIP-003) standard are documented on the Masumi docs
            site. This marketing site also exposes read-only HTTP endpoints for the on-page explorer; their machine-readable
            catalog is available at{" "}
            <Link href="/.well-known/api-catalog" className="underline underline-offset-2 hover:text-black/70">
              /.well-known/api-catalog
            </Link>
            .
          </p>
          <a
            href="https://docs.masumi.network/api-reference.md"
            className="inline-flex items-center text-[17px] text-black underline underline-offset-4 hover:text-black/70"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open full API reference — docs.masumi.network
          </a>
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

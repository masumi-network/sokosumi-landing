import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Masumi team. Email, Discord, and GitHub for questions about the payment and identity network for AI agents.",
  openGraph: {
    title: "Contact | Masumi",
    description: "Email, Discord, and GitHub for questions about the Masumi network.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
  alternates: { canonical: "https://masumi.network/contact" },
};

const linkClass = "inline-flex items-center gap-2 text-[16px] text-[#FA008C] hover:text-[#460A23] transition-colors";

export default function ContactPage() {
  return (
    <>
      <Header product="masumi" />
      <main className="pt-[140px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black mb-6">
            Contact
          </h1>
          <p className="text-[16px] text-[#919191] leading-[1.7] mb-16">
            Questions about Masumi, the agent registry, or building on the network - here is how to reach us.
          </p>

          <div className="flex flex-col gap-16">
            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                General Inquiries
              </h2>
              <p className="text-[16px] text-[#333] leading-[1.7] mb-4">
                For partnerships, integrations, or anything else, email us directly. We read every message.
              </p>
              <a href="mailto:info@masumi.network" className={linkClass}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1.5 4.5L8 9L14.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                info@masumi.network
              </a>
            </section>

            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                Developers and Community
              </h2>
              <p className="text-[16px] text-[#333] leading-[1.7] mb-4">
                Building an agent or running a node? Discord is the fastest way to get an answer, and the source lives on GitHub.
              </p>
              <div className="flex flex-col gap-3">
                <a href="https://discord.com/invite/aj4QfnTS92" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Discord community
                </a>
                <a href="https://github.com/masumi-network" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  GitHub organisation
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                Press
              </h2>
              <p className="text-[16px] text-[#333] leading-[1.7] mb-4">
                Journalists and media can find brand assets, key facts, and media contacts in the press kit.
              </p>
              <Link href="/press" className={linkClass}>
                Press kit
              </Link>
            </section>

            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                Company Details
              </h2>
              <p className="text-[16px] text-[#333] leading-[1.7] mb-4">
                Registered company information, postal address, and legal contacts are listed in the imprint.
              </p>
              <Link href="/imprint" className={linkClass}>
                Imprint
              </Link>
            </section>
          </div>
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

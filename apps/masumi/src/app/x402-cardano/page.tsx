import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import VendingHero from "./VendingHero";
import UserTypeToggle from "@/components/UserTypeToggle";

const URL_BASE = "https://www.masumi.network";
const PAGE_PATH = "/x402-cardano";
const SPEC_URL = "https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md";

// Per the exact-scheme specs: EVM (EIP-3009 / Permit2 / ERC-7710) and Solana's
// sponsor model are all one payment shape — a direct, signed transfer to
// payTo, final the moment it settles. Cardano's exact scheme adds script
// payments and the Masumi Smart Contract, whose escrow lifecycle carries
// refunds, decision logging, and a dispute window (extra.* timestamps).
const COMPARISON_ROWS = [
  {
    label: "Normal Address Payments",
    note: "A direct payment to a wallet address — the baseline every chain supports.",
    otherChains: true,
    cardanoRegular: true,
    cardanoMasumi: true,
    highlight: false,
  },
  {
    label: "Refunds",
    note: "Nothing delivered? The escrowed payment goes back to the client — automatically.",
    otherChains: false,
    cardanoRegular: false,
    cardanoMasumi: true,
    highlight: true,
  },
  {
    label: "Decision Logging",
    note: "Payment decisions are recorded on-chain, decentralised and auditable.",
    otherChains: false,
    cardanoRegular: false,
    cardanoMasumi: true,
    highlight: true,
  },
] as const;

// The standard greyscale Ethereum mark — official octahedron geometry.
function EthMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 417" className={className} aria-label="Ethereum" role="img">
      <path fill="#8C8C8C" d="M127.96 0l-2.8 9.5v275.7l2.8 2.8 127.96-75.6z" />
      <path fill="#B8B8B8" d="M127.96 0L0 212.4l127.96 75.6V0z" />
      <path fill="#9F9F9F" d="M127.96 312.2l-1.58 1.9v98.2l1.58 4.6L256 236.6z" />
      <path fill="#B8B8B8" d="M127.96 417v-104.8L0 236.6z" />
      <path fill="#6E6E6E" d="M127.96 288l127.96-75.6-127.96-58.1z" />
      <path fill="#8C8C8C" d="M0 212.4l127.96 75.6v-133.7z" />
    </svg>
  );
}

// The Solana mark — official three-bar geometry, monochrome to match the column.
function SolMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 398 312" className={className} aria-label="Solana" role="img">
      <path fill="#9a9a9a" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
      <path fill="#9a9a9a" d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
      <path fill="#9a9a9a" d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
    </svg>
  );
}

// What interoperating with Masumi additionally unlocks — taken from the Masumi
// protocol's own pillars (Registry + Identity) on the homepage.
const INTEROP_ROWS = [
  {
    label: "Discovery",
    note: "A public registry of every agent — search by what they do, check their track record, and call them through the API.",
  },
  {
    label: "Identity",
    note: "Every agent gets a decentralized ID and a reputation score, so you can verify who you are working with.",
  },
] as const;

function PayDot({ on, pink }: { on: boolean; pink?: boolean }) {
  if (!on) {
    return <span className="inline-flex w-[18px] h-[18px] rounded-full border-[1.5px] border-black/[0.15]" aria-hidden />;
  }
  return (
    <span
      className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-white text-[10px]"
      style={{ background: pink ? "#FA008C" : "#0a0a0a" }}
      aria-hidden
    >
      ✓
    </span>
  );
}

export const metadata: Metadata = {
  title: "x402 on Cardano — Masumi",
  description:
    "Try x402 on Cardano with a real vending machine: a live 402 Payment Required response, a real Cardano mainnet payment, and on-chain settlement.",
  alternates: { canonical: `${URL_BASE}${PAGE_PATH}` },
  openGraph: {
    type: "website",
    title: "x402 on Cardano — Masumi",
    description:
      "Try x402 on Cardano with a real vending machine: a live 402 Payment Required response, a real Cardano mainnet payment, and on-chain settlement.",
    url: `${URL_BASE}${PAGE_PATH}`,
    siteName: "Masumi",
    images: [
      {
        url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt",
        width: 1920,
        height: 1080,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "x402 on Cardano — Masumi",
    description: "Try x402 on Cardano with a real vending machine and a real mainnet payment.",
    images: [
      "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt",
    ],
  },
  robots: { index: true, follow: true },
};

export default function X402Page() {
  return (
    <>
      <Header product="masumi" />
      <main className="overflow-x-clip">
        <VendingHero />

        {/* ── What is x402? ── */}
        <section className="pt-20 pb-24">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#FA008C] mb-3 text-center">
              what is x402?
            </p>
            <h2 className="text-[28px] md:text-[40px] font-normal leading-[1.31] text-black max-w-[700px] mx-auto mb-10 text-center" style={{ overflowWrap: "anywhere" }}>
              Payments, built into the internet itself.
            </h2>

            <div className="border border-black/[0.04] bg-white overflow-hidden hover:border-black/10 transition-colors">
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center min-w-0">
                  <p className="text-[15px] md:text-[16px] text-[#5b5b5b] leading-[1.6] max-w-[480px]">
                    The internet was never built to move money — that&apos;s its original sin. x402
                    fixes it: an open, neutral standard that makes payments possible directly
                    between clients and servers, no middleman required. It creates win-win
                    economies and lets agents pay agents at scale. The goal is a freer, fairer
                    internet.
                  </p>
                  <Link
                    href="https://www.linuxfoundation.org/x402foundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#FA008C] hover:underline w-fit"
                  >
                    Learn about the x402 Foundation
                    <span aria-hidden>→</span>
                  </Link>
                </div>
                <div className="flex-1 min-h-[240px] lg:min-h-0 bg-[#0a0a0a] flex flex-col items-center justify-center p-10">
                  <div className="flex flex-col items-center gap-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/x402-logo.svg"
                      alt="x402"
                      className="h-10 md:h-14 w-auto"
                      style={{ filter: "invert(1)" }}
                    />
                    <div className="h-px w-28 bg-white/15" aria-hidden />
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
                        part of
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/linux-foundation-logo.svg"
                        alt="Linux Foundation"
                        className="h-6 md:h-7 w-auto opacity-85"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cardano vs. other chains ── */}
        <section className="pt-0 pb-24">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#FA008C] mb-3 text-center">
              cardano vs. other chains
            </p>
            <h2 className="text-[28px] md:text-[40px] font-normal leading-[1.31] text-black max-w-[760px] mx-auto text-center">
              x402 on Cardano is more powerful than x402 on any other chain.
            </h2>

            {/* the unlock — x402 + Masumi, natively */}
            <div className="mt-8 border border-[#FA008C]/20 bg-[#FA008C]/[0.03] hover:border-[#FA008C]/40 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center gap-7 md:gap-12 px-7 py-8 md:px-12 md:py-10">
                <div className="flex h-10 md:h-12 items-center flex-nowrap gap-x-3 md:gap-x-4 flex-shrink-0">
                  <span className="inline-flex h-8 w-16 md:h-10 md:w-20 items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/x402-logo.svg" alt="x402" width={80} height={32} className="h-6 md:h-8 w-auto max-w-full object-contain" />
                  </span>
                  <span className="inline-flex h-8 md:h-10 items-center text-[20px] md:text-[24px] font-light text-[#FA008C]/50" aria-hidden>+</span>
                  <span className="inline-flex h-8 w-8 md:h-10 md:w-10 items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/cardano-ada-logo.png" alt="Cardano" width={40} height={40} className="h-full w-full object-contain" />
                  </span>
                  <span className="inline-flex h-8 md:h-10 items-center text-[20px] md:text-[24px] font-light text-[#FA008C]/50" aria-hidden>+</span>
                  <span className="inline-flex h-8 w-8 md:h-10 md:w-10 items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/masumi-favicon.svg" alt="Masumi" width={40} height={40} className="h-full w-full object-contain" />
                  </span>
                </div>
                <div className="hidden md:block w-[1px] self-stretch bg-[#FA008C]/15" aria-hidden />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#FA008C] mb-2.5">
                    native support
                  </p>
                  <p className="text-[20px] md:text-[24px] font-normal leading-snug text-black max-w-[560px]">
                    x402 on Cardano natively supports the{" "}
                    <span className="text-[#FA008C]">Masumi Smart Contract</span>.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-[15px] md:text-[16px] text-[#5b5b5b] leading-[1.6] max-w-[560px] mx-auto text-center">
              The Masumi Smart Contract escrows every payment — releasing funds when the work is
              delivered, refunding when it isn&apos;t, with every decision logged on-chain.
            </p>

            <div className="mt-10 border border-black/[0.04] bg-white overflow-hidden hover:border-black/10 transition-colors">
              {/* header row */}
              <div className="grid grid-cols-[1fr_60px_62px_62px] md:grid-cols-[1.4fr_1fr_1fr_1fr] items-stretch">
                <div className="p-3 md:p-6" />
                <div className="px-1.5 py-3 md:p-6 border-l border-black/[0.04] flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <EthMark className="h-4 md:h-5 w-auto" />
                    <SolMark className="h-3 md:h-3.5 w-auto" />
                  </div>
                  <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.06em] text-[#9a9a9a] leading-[1.4] text-center">
                    EVM · Solana
                    <br className="md:hidden" /> · others{" "}
                    <br className="md:hidden" />x402
                  </p>
                </div>
                <div className="px-1.5 py-3 md:p-6 border-l border-black/[0.04] flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/cardano-ada-logo.png" alt="" aria-hidden className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.06em] text-[#9a9a9a] leading-[1.4] text-center">
                    Cardano
                    <br className="md:hidden" /> Regular{" "}
                    <br className="md:hidden" />x402
                  </p>
                </div>
                <div className="px-1.5 py-3 md:p-6 border-l border-black/[0.04] flex flex-col items-center justify-center bg-[#FA008C]/[0.03]">
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/cardano-ada-logo.png" alt="" aria-hidden className="h-4 w-4 md:h-5 md:w-5" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/masumi-favicon.svg" alt="" aria-hidden className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.06em] text-[#FA008C] leading-[1.4] text-center">
                    Cardano +
                    <br className="md:hidden" /> Masumi{" "}
                    <br className="md:hidden" />x402
                  </p>
                </div>
              </div>

              {/* rows */}
              {COMPARISON_ROWS.map((row) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1fr_60px_62px_62px] md:grid-cols-[1.4fr_1fr_1fr_1fr] items-center border-t border-black/[0.04] ${
                    row.highlight ? "bg-[#FA008C]/[0.03]" : ""
                  }`}
                >
                  <div className="p-3 md:p-6 min-w-0">
                    <p className="text-[13px] md:text-[14px] font-medium text-black">{row.label}</p>
                    <p className="mt-1 text-[12px] md:text-[13px] text-[#8a8a8a] leading-[1.5] max-w-[440px]">
                      {row.note}
                    </p>
                  </div>
                  <div className="px-1.5 py-4 md:p-6 border-l border-black/[0.04] flex items-center justify-center">
                    <PayDot on={row.otherChains} />
                  </div>
                  <div className="px-1.5 py-4 md:p-6 border-l border-black/[0.04] flex items-center justify-center">
                    <PayDot on={row.cardanoRegular} />
                  </div>
                  <div className="px-1.5 py-4 md:p-6 border-l border-black/[0.04] flex items-center justify-center">
                    <PayDot on={row.cardanoMasumi} pink />
                  </div>
                </div>
              ))}
            </div>

            {/* connector — what interoperating with Masumi additionally unlocks */}
            <div className="mt-4 flex flex-col items-center gap-1">
              <span className="text-[26px] font-light text-[#FA008C]/50 leading-none" aria-hidden>
                +
              </span>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#FA008C] text-center px-4">
                works with other Masumi features
              </p>
            </div>

            <div className="mt-4 border border-black/[0.04] bg-white overflow-hidden hover:border-black/10 transition-colors">
              {INTEROP_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1fr_60px_62px_62px] md:grid-cols-[1.4fr_1fr_1fr_1fr] items-center bg-[#FA008C]/[0.03] ${
                    i > 0 ? "border-t border-black/[0.04]" : ""
                  }`}
                >
                  <div className="p-3 md:p-6 min-w-0">
                    <p className="text-[13px] md:text-[14px] font-medium text-black">{row.label}</p>
                    <p className="mt-1 text-[12px] md:text-[13px] text-[#8a8a8a] leading-[1.5] max-w-[440px]">
                      {row.note}
                    </p>
                  </div>
                  <div className="px-1.5 py-4 md:p-6 border-l border-black/[0.04] flex items-center justify-center">
                    <PayDot on={false} />
                  </div>
                  <div className="px-1.5 py-4 md:p-6 border-l border-black/[0.04] flex items-center justify-center">
                    <PayDot on={false} />
                  </div>
                  <div className="px-1.5 py-4 md:p-6 border-l border-black/[0.04] flex items-center justify-center">
                    <PayDot on pink />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href={SPEC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#FA008C] hover:underline w-fit"
            >
              Read the exact scheme specs
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </section>

        <section className="pt-0 pb-24">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#FA008C] mb-3">
              agent handoff
            </p>
            <h2 className="text-[28px] md:text-[40px] font-normal leading-[1.31] text-black max-w-[680px] mx-auto">
              Give your agents the Masumi skill.
            </h2>
            <p className="mx-auto mt-4 text-[15px] md:text-[16px] text-[#5b5b5b] leading-[1.6] max-w-[620px]">
              Building agents that need to understand Masumi? Give them the Masumi skill directly
              so they can read the current protocol context, endpoints, and integration guidance.
            </p>
            <div className="mt-7">
              <UserTypeToggle initialUserType="agent" />
            </div>
          </div>
        </section>
      </main>
      <Footer product="masumi" />
    </>
  );
}

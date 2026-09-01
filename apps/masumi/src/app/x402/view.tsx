import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import VendingHero from "./VendingHero";
import { type Locale, localePath, alternatesFor } from "@/lib/i18n";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { t as copy } from "./copy";

const URL_BASE = "https://www.masumi.network";
const PAGE_PATH = "/x402";
const SPEC_URL = "https://github.com/x402-foundation/x402/tree/main/specs/schemes/exact";

// Per the exact-scheme specs: EVM (EIP-3009 / Permit2 / ERC-7710) and Solana's
// sponsor model are all one payment shape — a direct, signed transfer to
// payTo, final the moment it settles. Cardano's exact scheme adds script
// payments and the Masumi Smart Contract, whose escrow lifecycle carries
// refunds, decision logging, and a dispute window (extra.* timestamps).
const COMPARISON_ROWS = [
  {
    key: "CMP1",
    otherChains: true,
    cardanoRegular: true,
    cardanoMasumi: true,
    highlight: false,
  },
  {
    key: "CMP2",
    otherChains: false,
    cardanoRegular: false,
    cardanoMasumi: true,
    highlight: true,
  },
  {
    key: "CMP3",
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
    key: "INT1",
  },
  {
    key: "INT2",
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

export function buildMetadata(locale: Locale): Metadata {
  const t = copy(locale);
  const title = t("TITLE");
  const description = t("DESCRIPTION");
  const image = "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt";
  return {
    title,
    description,
    alternates: alternatesFor(locale, PAGE_PATH),
    openGraph: {
      type: "website",
      title,
      description,
      url: `${URL_BASE}${localePath(locale, PAGE_PATH)}`,
      siteName: "Masumi",
      locale: locale === "de" ? "de_DE" : "en_US",
      images: [{ url: image, width: 1920, height: 1080 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t("TWITTER_DESC"),
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export function X402View({ locale }: { locale: Locale }) {
  const t = copy(locale);
  return (
    <>
      <Header product="masumi" locale={locale} />
      <main className="overflow-x-clip">
        <VendingHero locale={locale} />

        {/* ── What is x402? ── */}
        <section className="pt-20 pb-24">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="border border-black/[0.04] bg-white overflow-hidden hover:border-black/10 transition-colors">
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#FA008C] font-mono mb-3">
                    {t("EYEBROW_WHATIS")}
                  </p>
                  <h2 className="text-[26px] md:text-[34px] font-normal tracking-[-0.6px] leading-[1.15] text-black max-w-[480px]" style={{ overflowWrap: "anywhere" }}>
                    {t("TXT1")}
                  </h2>
                  <p className="mt-5 text-[15px] md:text-[16px] text-[#5b5b5b] leading-[1.6] max-w-[480px]">
                    {t("TXT2")}
                  </p>
                  <Link
                    href="https://www.linuxfoundation.org/x402foundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#FA008C] hover:underline w-fit"
                  >
                    {t("TXT3")}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
                <div className="flex-1 min-h-[220px] lg:min-h-0 bg-[#0a0a0a] flex flex-col items-center justify-center gap-5 p-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/linux-foundation-logo.svg"
                    alt="Linux Foundation"
                    className="h-9 md:h-11 w-auto"
                  />
                  <p className="text-[12px] text-white/40 text-center max-w-[280px] leading-[1.5]">
                    {t("TXT4")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cardano vs. other chains ── */}
        <section className="pt-0 pb-24">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#FA008C] font-mono mb-3">
              {t("EYEBROW_VS")}
            </p>
            <h2 className="text-[26px] md:text-[34px] font-normal tracking-[-0.6px] leading-[1.15] text-black max-w-[720px]">
              {t("H2_VS")}
            </h2>

            {/* the unlock — x402 + Masumi, natively */}
            <div className="mt-8 border border-[#FA008C]/20 bg-[#FA008C]/[0.03] hover:border-[#FA008C]/40 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center gap-7 md:gap-12 px-7 py-8 md:px-12 md:py-10">
                <div className="flex items-center gap-5 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/x402-logo.svg" alt="x402" className="h-9 md:h-11 w-auto" />
                  <span className="text-[26px] md:text-[30px] font-light text-[#FA008C]/50" aria-hidden>+</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/masumi-wordmark.png" alt="Masumi" className="h-7 md:h-8 w-auto" />
                </div>
                <div className="hidden md:block w-[1px] self-stretch bg-[#FA008C]/15" aria-hidden />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#FA008C] font-mono mb-2.5">
                    {t("EYEBROW_NATIVE")}
                  </p>
                  <p className="text-[20px] md:text-[26px] font-normal tracking-[-0.4px] leading-[1.3] text-black max-w-[560px]">
                    {t("NATIVE_LINE")}{" "}
                    <span className="text-[#FA008C]">Masumi Smart Contract</span>.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-[15px] md:text-[16px] text-[#5b5b5b] leading-[1.6] max-w-[640px]">
              {t("MASUMI_SC_BODY")}
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
                  <p className="text-[9px] md:text-[11px] font-mono uppercase tracking-[0.06em] text-[#9a9a9a] leading-[1.4] text-center">
                    EVM · Solana
                    <br className="md:hidden" /> {t("COL_OTHERS")}{" "}
                    <br className="md:hidden" />x402
                  </p>
                </div>
                <div className="px-1.5 py-3 md:p-6 border-l border-black/[0.04] flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/cardano-ada-logo.png" alt="" aria-hidden className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <p className="text-[9px] md:text-[11px] font-mono uppercase tracking-[0.06em] text-[#9a9a9a] leading-[1.4] text-center">
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
                  <p className="text-[9px] md:text-[11px] font-mono uppercase tracking-[0.06em] text-[#FA008C] font-semibold leading-[1.4] text-center">
                    Cardano +
                    <br className="md:hidden" /> Masumi{" "}
                    <br className="md:hidden" />x402
                  </p>
                </div>
              </div>

              {/* rows */}
              {COMPARISON_ROWS.map((row) => (
                <div
                  key={row.key}
                  className={`grid grid-cols-[1fr_60px_62px_62px] md:grid-cols-[1.4fr_1fr_1fr_1fr] items-center border-t border-black/[0.04] ${
                    row.highlight ? "bg-[#FA008C]/[0.03]" : ""
                  }`}
                >
                  <div className="p-3 md:p-6 min-w-0">
                    <p className="text-[13.5px] md:text-[14px] font-medium text-black">{t(`${row.key}_LABEL`)}</p>
                    <p className="mt-1 text-[12px] md:text-[12.5px] text-[#8a8a8a] leading-[1.5] max-w-[440px]">
                      {t(`${row.key}_NOTE`)}
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
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#FA008C] font-mono text-center px-4">
                {t("EYEBROW_INTEROP")}
              </p>
            </div>

            <div className="mt-4 border border-black/[0.04] bg-white overflow-hidden hover:border-black/10 transition-colors">
              {INTEROP_ROWS.map((row, i) => (
                <div
                  key={row.key}
                  className={`grid grid-cols-[1fr_60px_62px_62px] md:grid-cols-[1.4fr_1fr_1fr_1fr] items-center bg-[#FA008C]/[0.03] ${
                    i > 0 ? "border-t border-black/[0.04]" : ""
                  }`}
                >
                  <div className="p-3 md:p-6 min-w-0">
                    <p className="text-[13.5px] md:text-[14px] font-medium text-black">{t(`${row.key}_LABEL`)}</p>
                    <p className="mt-1 text-[12px] md:text-[12.5px] text-[#8a8a8a] leading-[1.5] max-w-[440px]">
                      {t(`${row.key}_NOTE`)}
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
              {t("SPEC_LINK")}
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer product="masumi" locale={locale} />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import { buildPaymentRequirements } from "../api/x402/demo/requirements";
import LiveDemo from "./LiveDemo";
import Walkthrough from "./Walkthrough";
import VendingHero from "./VendingHero";

const URL_BASE = "https://www.masumi.network";
const PAGE_PATH = "/x402";

// Render at request time so the served JSON matches the live endpoint's timestamps.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "x402 on Cardano — Masumi",
  description:
    "Spec-compliant x402 'exact' scheme on Cardano via the Masumi Smart Protocol. /api/x402/demo returns a real 402 PaymentRequirementsResponse — sign it with any CIP-30 wallet.",
  alternates: { canonical: `${URL_BASE}${PAGE_PATH}` },
  openGraph: {
    type: "website",
    title: "x402 on Cardano — Masumi",
    description:
      "Live x402 demo endpoint. Real 402 response. Sign with any CIP-30 wallet and watch the PAYMENT-SIGNATURE header round-trip.",
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
    description: "Live x402 demo endpoint with a real 402 response and CIP-30 wallet integration.",
    images: [
      "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt",
    ],
  },
  robots: { index: true, follow: true },
};

const SPEC_URL =
  "https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md";

// Illustrative seller-side shape — the wrapper turns a route into a paid
// resource; the facilitator (Masumi Payment Service) does verify + settle.
const MIDDLEWARE_CODE = `// illustrative — wire the requirements into your framework's middleware
export const middleware = paymentMiddleware({
  "GET /api/x402/demo": {
    scheme: "exact",
    network: "cardano:preprod",
    amount: "10000",                       // smallest unit of the asset
    asset: "16a55b…ddde.0014df105553444d", // USDM (CIP-68)
    payTo: "addr_test1w…",                  // Masumi escrow script
    maxTimeoutSeconds: 600,
    extra: { assetTransferMethod: "masumi", paymentType: "Web3CardanoV1" },
  },
});`;

// The seven fields a client reads off accepts[0] to build a payment.
const FIELDS = [
  ["scheme", '"exact"', "value transfer of a fixed amount"],
  ["network", '"cardano:preprod"', "cardano:mainnet · preprod · preview"],
  ["amount", '"10000"', "smallest indivisible unit of the asset"],
  ["asset", "policyId.assetNameHex", "USDM (CIP-68 fungible token)"],
  ["payTo", "addr_test1w…", "the Masumi escrow script address"],
  ["maxTimeoutSeconds", "600", "client must submit within this window"],
  ["extra.assetTransferMethod", '"masumi"', "default · masumi · script"],
] as const;

// Escrow lifecycle timestamps carried in extra.* (unix seconds).
const ESCROW = [
  ["payByTime", "deadline to lock the funds"],
  ["submitResultTime", "deadline for the seller to deliver"],
  ["unlockTime", "earliest seller withdrawal"],
  ["externalDisputeUnlockTime", "arbitration window close"],
] as const;

// The six facilitator checks from the Cardano exact-scheme spec. A real
// facilitator runs all six against a node; THIS demo structurally enforces the
// first four (string/BigInt equality on the client-echoed fields) and leaves
// nonce + ttl unenforced.
const CHECKS = [
  ["network", "tx targets the declared Cardano network", true],
  ["asset", "policyId + assetName match exactly", true],
  ["amount", "output value ≥ accepts[0].amount", true],
  ["recipient", "an output sends funds to payTo", true],
  ["nonce", "payload.nonce is an unspent UTXO and a tx input", false],
  ["ttl", "tx TTL has not lapsed", false],
] as const;

export default function X402Page() {
  // Built per request (the page is force-dynamic) so timestamps track the endpoint.
  // The same object feeds the raw 402 block AND the interactive machine, so the
  // screen can never contradict the JSON below it.
  const now = Math.floor(Date.now() / 1000);
  const requirements = buildPaymentRequirements(now);
  const requirementsJson = JSON.stringify(requirements, null, 2);

  return (
    <>
      <Header product="masumi" />
      <main className="overflow-x-clip">
        <VendingHero />

        {/* ── What x402 is + the real 402 return ── */}
        <section className="pt-16 pb-0">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#FA008C] font-mono mb-3">
              x402 · exact scheme · cardano
            </p>
            <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-1px] leading-[1.05] text-black max-w-[720px]">
              HTTP 402, paid in native Cardano tokens.
            </h2>
            <p className="mt-5 text-[15px] md:text-[16px] text-[#5b5b5b] max-w-[600px] leading-[1.6]">
              <span className="text-black">402 Payment Required</span> has sat unused in HTTP
              since 1997. x402 wires it up: an unpaid request gets a machine-readable price,
              the client pays, retries, and gets the resource. The endpoint{" "}
              <Link
                href="/api/x402/demo"
                className="font-mono text-black underline decoration-[#FA008C]/40 hover:decoration-[#FA008C] underline-offset-2"
              >
                /api/x402/demo
              </Link>{" "}
              is a real one — play it through below, then read it on the wire.
            </p>

            <div className="mt-7 flex items-center gap-3 text-[12.5px] font-mono">
              <Link href={SPEC_URL} target="_blank" rel="noopener noreferrer" className="text-black/70 hover:text-black">
                spec ↗
              </Link>
              <span className="text-black/15">·</span>
              <Link href="https://docs.masumi.network" target="_blank" rel="noopener noreferrer" className="text-black/70 hover:text-black">
                docs ↗
              </Link>
            </div>

          </div>
        </section>

        {/* ── Gamified walkthrough — the centerpiece ── */}
        <section className="pt-14 md:pt-16">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#FA008C] font-mono mb-3">
              see it work
            </p>
            <h2 className="text-[26px] md:text-[34px] font-normal tracking-[-0.7px] leading-[1.08] text-black max-w-[640px]">
              A payment, start to finish.
            </h2>
            <p className="mt-4 text-[14px] md:text-[15px] text-[#5b5b5b] mb-7 max-w-[640px] leading-[1.6]">
              The whole handshake as a vending machine — step through all eight beats, or hit play
              and watch the coin go in and the data drop out.
            </p>
            <Walkthrough req={requirements} />
          </div>
        </section>

        {/* ── Live round-trip ── */}
        <section className="pt-20">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <h2 className="text-[15px] font-medium text-black mb-1">Round-trip it live</h2>
            <p className="text-[12.5px] text-[#888] mb-5 max-w-[680px] leading-[1.55]">
              Connect a CIP-30 wallet (Lace, Eternl, …) to sign the requirements and retry the
              request with a <span className="font-mono text-black">PAYMENT-SIGNATURE</span> header.
            </p>
            <LiveDemo />
            <p className="mt-3 text-[11.5px] text-[#888] leading-[1.55] max-w-[760px] font-mono">
              note · here the wallet signs a CIP-8 auth payload via{" "}
              <span className="text-black">wallet.signData()</span> — not a signed tx CBOR — so it
              works without test ADA. Production clients put a base64 signed{" "}
              <span className="text-black">lucid</span> /{" "}
              <span className="text-black">cardano-cli</span> tx in{" "}
              <span className="text-black">payload.transaction</span>. A real facilitator runs all
              six checks below against a Cardano node; this demo structurally enforces four and
              accepts with a <span className="text-black">demo</span> status.
            </p>
          </div>
        </section>

        {/* ── Technical: raw 402 · fields · checks · middleware ── */}
        <section className="pt-20 pb-4">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#FA008C] font-mono mb-3">
              the technical bit
            </p>
            <h2 className="text-[15px] font-medium text-black mb-1">The raw exchange</h2>
            <p className="text-[12.5px] text-[#888] mb-5 max-w-[680px] leading-[1.55]">
              Everything above, on the wire.{" "}
              <Link
                href="/api/x402/demo"
                className="font-mono text-black underline decoration-[#FA008C]/40 hover:decoration-[#FA008C] underline-offset-2"
              >
                /api/x402/demo
              </Link>{" "}
              is a real endpoint — this is its live 402, built from the same code the route runs.
            </p>
            <div className="bg-[#0a0a0a] overflow-hidden font-mono text-[11.5px] leading-[1.7]">
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-white">
                  <span className="text-white/40">$</span> curl -i /api/x402/demo
                </span>
                <span className="text-[10.5px] text-white/30 uppercase tracking-widest">
                  402 response
                </span>
              </div>
              <div className="p-5">
                <div className="mb-3">
                  <span className="text-white/40">HTTP/1.1</span>{" "}
                  <span className="text-[#FA008C]">402</span>{" "}
                  <span className="text-white">Payment Required</span>
                </div>
                <pre className="text-white/80 whitespace-pre-wrap break-all">
                  <code>{requirementsJson}</code>
                </pre>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-x-12 gap-y-12">
              {/* fields */}
              <div>
              <h2 className="text-[15px] font-medium text-black mb-1">accepts[0]</h2>
              <p className="text-[12px] text-[#888] font-mono mb-4">what the client reads to pay</p>
              <div className="border-t border-black/[0.08]">
                {FIELDS.map(([k, v, note]) => (
                  <div key={k} className="grid grid-cols-[1.2fr_1fr] gap-x-4 py-2.5 border-b border-black/[0.05] text-[12px]">
                    <div>
                      <div className="font-mono text-[#FA008C]">{k}</div>
                      <div className="text-[#888] mt-0.5 leading-[1.5]">{note}</div>
                    </div>
                    <div className="font-mono text-black/85 break-all self-start">{v}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] text-[#888] leading-[1.55]">
                <span className="font-mono text-black">extra.*</span> also carries the escrow
                lifecycle (unix seconds):{" "}
                {ESCROW.map(([k], i) => (
                  <span key={k}>
                    {i > 0 && " · "}
                    <span className="font-mono text-[#FA008C]">{k}</span>
                  </span>
                ))}
                .
              </p>
            </div>

            {/* checks + middleware */}
            <div className="space-y-10">
              <div>
                <h2 className="text-[15px] font-medium text-black mb-1">Facilitator checks</h2>
                <p className="text-[12px] text-[#888] font-mono mb-4">
                  spec §Verification — a real facilitator runs all six; this demo enforces four
                </p>
                <ol className="space-y-2">
                  {CHECKS.map(([k, v, enforced], i) => (
                    <li key={k} className="flex items-start gap-3 text-[12px]" style={{ opacity: enforced ? 1 : 0.55 }}>
                      <span className="font-mono w-4 flex-shrink-0" style={{ color: enforced ? "#16a34a" : "#bbb" }}>
                        {enforced ? "✓" : String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="font-mono text-[#FA008C]">{k}</span>{" "}
                        <span className="text-[#5b5b5b] leading-[1.55]">— {v}</span>
                        {!enforced && <span className="text-[#aaa]"> · demo · not enforced</span>}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h2 className="text-[15px] font-medium text-black mb-1">Sell a resource</h2>
                <p className="text-[12px] text-[#888] font-mono mb-4">illustrative — the seller side</p>
                <div className="bg-[#0a0a0a] overflow-hidden">
                  <pre className="p-5 font-mono text-[11px] leading-[1.7] text-white/80 overflow-x-auto">
                    <code>{MIDDLEWARE_CODE}</code>
                  </pre>
                </div>
                <div className="mt-4 flex items-center gap-4 text-[12px] font-mono">
                  <Link href="https://github.com/x402-foundation/x402" target="_blank" rel="noopener noreferrer" className="text-black/70 hover:text-black">
                    x402-foundation/x402 ↗
                  </Link>
                  <Link href="https://github.com/masumi-network" target="_blank" rel="noopener noreferrer" className="text-black/70 hover:text-black">
                    masumi-network ↗
                  </Link>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* ── Soft CTA: run the real facilitator ── */}
        <section className="pt-20 pb-24">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <h2 className="text-[15px] font-medium text-black mb-1">Run the real thing</h2>
            <p className="text-[12.5px] text-[#888] mb-5 max-w-[680px] leading-[1.55]">
              The demo&apos;s facilitator is stubbed. The real one is open source and self-hosted — it
              verifies, settles, and runs the escrow + dispute lifecycle for you.
            </p>
            <div className="bg-[#0a0a0a] overflow-hidden font-mono text-[11.5px] leading-[1.8] max-w-[680px]">
              <pre className="p-5 text-white/80 overflow-x-auto">
                <code>{`git clone https://github.com/masumi-network/masumi-services-dev-quickstart.git
cd masumi-services-dev-quickstart
cp .env.example .env          # add a Blockfrost preprod key
docker compose up -d          # Payment Service → http://localhost:3001/docs`}</code>
              </pre>
            </div>
            <div className="mt-4 flex items-center gap-4 text-[12px] font-mono">
              <Link href="https://docs.masumi.network" target="_blank" rel="noopener noreferrer" className="text-black/70 hover:text-black">
                docs.masumi.network ↗
              </Link>
              <span className="text-black/15">·</span>
              <Link href="https://github.com/masumi-network/masumi-payment-service" target="_blank" rel="noopener noreferrer" className="text-black/70 hover:text-black">
                masumi-payment-service ↗
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer product="masumi" />
    </>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PaymentRequirements } from "../api/x402/demo/requirements";

const PINK = "#FA008C";
const GREEN = "#36d399";

function shortMid(s: string, head = 10, tail = 6): string {
  if (!s || s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

// The demo 200 body, mirrored from the route so the chute shows the real payload.
const DELIVERED = {
  summary:
    "AI agents on Cardano transacted 4.21M ADA across 12,839 escrow contracts in Q3 2026, up 187% QoQ.",
  sample: [
    { agent: "research-agent-001", calls: 1204 },
    { agent: "seo-optimizer", calls: 892 },
    { agent: "copy-writer", calls: 2341 },
  ],
};

// The facilitator checks. The route ENFORCES the first four (in this order, with
// these exact error strings); nonce + ttl are spec-only / demo-accepted.
const CHECKS = [
  { key: "network", enforced: true, desc: "tx targets the declared network", err: "Network mismatch: expected cardano:preprod" },
  { key: "asset", enforced: true, desc: "policyId + assetName match exactly", err: "Asset mismatch" },
  { key: "amount", enforced: true, desc: "output value ≥ the price", err: "Amount below required minimum" },
  { key: "recipient", enforced: true, desc: "an output pays payTo", err: "Recipient mismatch" },
  { key: "nonce", enforced: false, desc: "payload.nonce is an unspent UTXO" },
  { key: "ttl", enforced: false, desc: "tx TTL has not lapsed" },
] as const;
const ENFORCED = CHECKS.filter((c) => c.enforced).length;

type StepDef = { n: number; key: string; part: string; title: string; cta: string };
const STEPS: StepDef[] = [
  { n: 1, key: "ask", part: "agent", title: "You ask the machine", cta: "Name a price →" },
  { n: 2, key: "price", part: "screen", title: "It names a price", cta: "Sign a coin →" },
  { n: 3, key: "sign", part: "coin", title: "You sign a coin", cta: "Drop it in →" },
  { n: 4, key: "pay", part: "slot", title: "Drop it in the slot", cta: "Check the coin →" },
  { n: 5, key: "verify", part: "vault", title: "The coin gets checked", cta: "Settle it →" },
  { n: 6, key: "settle", part: "vault", title: "Money moves on Cardano", cta: "Get the receipt →" },
  { n: 7, key: "confirm", part: "vault", title: "A receipt comes back", cta: "Collect →" },
  { n: 8, key: "deliver", part: "chute", title: "Out drops your data", cta: "Replay ↻" },
];

export default function Walkthrough({ req }: { req: PaymentRequirements }) {
  const a = req.accepts[0];
  const usdm = "0.01 USDM"; // 10000 smallest units, gloss for the convention

  const [mode, setMode] = useState<"play" | "explore">("play");
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<string>("screen");
  const [checksDone, setChecksDone] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // autoplay
  useEffect(() => {
    if (mode !== "play" || !playing) return;
    if (step >= 8) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(8, s + 1)), 2100);
    return () => clearTimeout(t);
  }, [playing, step, mode]);

  // verify cascade — enforced checks tick green one by one on entering step 5
  useEffect(() => {
    if (mode !== "play") return;
    if (step < 5) {
      setChecksDone(0);
      return;
    }
    if (step > 5) {
      setChecksDone(ENFORCED);
      return;
    }
    if (reduced.current) {
      setChecksDone(ENFORCED);
      return;
    }
    setChecksDone(0);
    const timers = Array.from({ length: ENFORCED }, (_, i) =>
      setTimeout(() => setChecksDone(i + 1), 220 + i * 320),
    );
    return () => timers.forEach(clearTimeout);
  }, [step, mode]);

  const s = STEPS[step - 1];
  const next = () => {
    setPlaying(false);
    setStep((v) => (v >= 8 ? 1 : v + 1));
  };
  const back = () => setStep((v) => Math.max(1, v - 1));

  // visual state (play only)
  const coinAtSlot = mode === "play" && step >= 4;
  const paid = mode === "play" && step >= 8;
  const vaultSpin = mode === "play" && step >= 5 && step <= 7;
  const focus = mode === "explore" ? active : s.part;
  const hl = (id: string) => focus === id;

  // explore hotspots — each maps to a part, a spec term, and a LIVE value
  const HOTSPOTS: { id: string; name: string; term: string; role: string; value: string }[] = [
    { id: "agent", name: "The agent", term: "client", role: "The AI agent paying for the resource on its own.", value: `GET ${req.resource.url.replace("https://www.masumi.network", "")}` },
    { id: "screen", name: "The readout", term: "402 · accepts[0]", role: "The price tag the server returns instead of the data.", value: `${a.amount} units = ${usdm} · ${a.network}` },
    { id: "coin", name: "The signed coin", term: "PAYMENT-SIGNATURE", role: "The payment, signed with a CIP-30 wallet — proof you authorised it.", value: `signData("x402:${a.network}:${a.amount}:…")` },
    { id: "slot", name: "The slot", term: "request header", role: "Where the signed payment is handed back with the retried request.", value: `PAYMENT-SIGNATURE: <base64>` },
    { id: "glass", name: "The goods", term: "resource", role: "The data you're actually buying.", value: `"${req.resource.description}"` },
    { id: "vault", name: "The vault", term: "§Verification + escrow", role: "Where the payment is checked, then settled on Cardano.", value: `${ENFORCED} checks enforced · payTo ${shortMid(a.payTo, 12, 6)}` },
    { id: "facilitator", name: "The facilitator", term: "verify / settle", role: "Validates + submits the tx, so the seller runs no node.", value: `POST /verify → POST /settle` },
    { id: "chute", name: "The chute", term: "200 + PAYMENT-RESPONSE", role: "The resource drops with a receipt header proving payment.", value: `{ success: true, status: "demo" }` },
  ];
  const activeHot = HOTSPOTS.find((h) => h.id === active) || HOTSPOTS[1];

  // per-step "on the wire" line (play)
  const WIRE: Record<string, string> = {
    ask: `GET /api/x402/demo`,
    price: `HTTP/1.1 402 · accepts[0].amount "${a.amount}"`,
    sign: `signData("x402:${a.network}:${a.amount}:…")`,
    pay: `PAYMENT-SIGNATURE: eyJ4NDAyVmVy…`,
    verify: `${ENFORCED}/6 enforced: network · asset · amount · recipient`,
    settle: `demo · settlement stubbed — no tx submitted`,
    confirm: `PAYMENT-RESPONSE { status: "demo", transaction: "demo_2f9a…" }`,
    deliver: `HTTP/1.1 200 · PAYMENT-RESPONSE { status: "demo" }`,
  };
  const BODY: Record<string, ReactNode> = {
    ask: "The agent requests the resource. No payment attached yet — it just knocks on the door.",
    price: (
      <>
        Instead of the data, the machine flashes the price: <Mono>{a.amount}</Mono> smallest units
        (<Mono>{usdm}</Mono>), in USDM, to the Masumi escrow on <Mono>{a.network}</Mono>.
      </>
    ),
    sign: (
      <>
        You build a payment and sign it with a Cardano wallet — a CIP-8 signature over{" "}
        <Mono>x402:{a.network}:{a.amount}:…</Mono> proving you authorised the spend.
      </>
    ),
    pay: (
      <>
        Same request, retried — now carrying the signed payment in a{" "}
        <Mono>PAYMENT-SIGNATURE</Mono> header. The coin goes in the slot.
      </>
    ),
    verify: "A facilitator validates the payment against the served requirements — four checks the endpoint actually enforces, in order.",
    settle: (
      <>
        In production the signed tx is submitted to Cardano, locking funds into the Masumi escrow at{" "}
        <Mono>{shortMid(a.payTo, 12, 8)}</Mono>. In this demo settlement is stubbed — no tx is sent.
      </>
    ),
    confirm: (
      <>
        The server returns the result in a <Mono>PAYMENT-RESPONSE</Mono> header. Here it carries a
        demo hash and <Mono>status: &quot;demo&quot;</Mono> — a real facilitator returns a confirmed
        on-chain txHash.
      </>
    ),
    deliver:
      "Out drops HTTP 200 with the resource and the receipt header. One request, fully paid. (The sample payload is demo content.)",
  };

  // What is Masumi-specific at each step — taught inline so the x402-vs-Masumi delta is unmissable.
  const MASUMI: Record<string, string> = {
    ask: "",
    price:
      "payTo is an escrow SCRIPT address, not a wallet — and extra.* carries the agent-job id + escrow timestamps that vanilla x402 has no concept of.",
    sign:
      "On Cardano the nonce is a real unspent UTXO (eUTXO replay defense) and payload.transaction is a full signed tx — not an EVM off-chain signature. (This demo stands in a CIP-8 signature + a fixed example nonce.)",
    pay: "",
    verify: "A Masumi facilitator additionally checks the escrow + dispute terms that standard x402 lacks.",
    settle:
      'assetTransferMethod "masumi" routes funds to the escrow CONTRACT — held until the agent delivers and the dispute window passes. Vanilla x402 transfers straight to the seller, instantly and unconditionally.',
    confirm: "",
    deliver: "",
  };

  return (
    <div className="border border-black/[0.1] bg-white">
      {/* progress (play only) */}
      <div className="flex h-1.5" aria-hidden={mode !== "play"}>
        {STEPS.map((st) => (
          <button
            key={st.n}
            aria-label={`Step ${st.n}: ${st.title}`}
            onClick={() => {
              setMode("play");
              setPlaying(false);
              setStep(st.n);
            }}
            className="h-full flex-1 transition-colors"
            style={{ background: mode === "play" && st.n <= step ? PINK : "rgba(0,0,0,0.08)" }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        {/* ── stage ── */}
        <div className="relative border-b border-black/[0.06] lg:border-b-0 lg:border-r p-4 md:p-6">
          <svg viewBox="0 0 720 340" className="w-full h-auto" role="img">
            <title>Interactive x402 vending-machine — bound to the live demo endpoint</title>
            <defs>
              <marker id="wt-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>

            {/* ── THE MASUMI MACHINE — figure-ground inversion ── */}
            <g style={{ transition: "opacity .3s" }}>
              {/* floor anchors — keep the masses 'floating' */}
              <ellipse cx="358" cy="295" rx="122" ry="6" fill="#f4f4f4" />
              <ellipse cx="616" cy="234" rx="58" ry="5" fill="#f4f4f4" />
              {/* AGENT — a filled charcoal bust */}
              <g opacity={mode === "explore" ? (hl("agent") ? 1 : 0.4) : step <= 4 ? 1 : 0.5} style={{ transition: "opacity .3s" }}>
                <line x1="90" y1="131" x2="90" y2="120" stroke="#0a0a0a" strokeWidth="1.6" />
                <circle cx="90" cy="117" r="3.4" fill={PINK} />
                <rect x="62" y="131" width="56" height="44" rx="13" fill="#0a0a0a" />
                <rect x="73" y="146" width="34" height="13" rx="6" fill="#242424" />
                <circle cx="84" cy="152.5" r="2.6" fill="#fff" />
                <circle cx="100" cy="152.5" r="2.6" fill="#fff" />
                <path d="M60 234 L60 193 Q60 181 72 181 L108 181 Q120 181 120 193 L120 234 Z" fill="#0a0a0a" />
                <rect x="76" y="201" width="28" height="9" rx="3" fill="#1c1c1c" />
              </g>
              <text x="90" y="256" fontSize="12" textAnchor="middle" fill="#888">client / agent</text>

              {/* ASK arrow */}
              <line x1="124" y1="140" x2="246" y2="140" stroke={mode === "play" && step === 1 ? PINK : "#cfcfcf"} strokeWidth={mode === "play" && step === 1 ? 2 : 1.5} markerEnd="url(#wt-arr)" style={{ transition: "stroke .3s" }} />

              {/* MACHINE — a solid charcoal slab with a lighter inset fascia */}
              <g opacity={mode === "explore" && !["screen", "glass", "slot", "chute"].includes(focus) ? 0.45 : 1} style={{ transition: "opacity .3s" }}>
                <rect x="250" y="40" width="216" height="250" rx="16" fill="#0a0a0a" />
                <rect x="256" y="46" width="204" height="238" rx="12" fill="#1c1c1c" />
              </g>

              {/* SCREEN — recessed LCD knocked into the fascia */}
              <g opacity={mode === "explore" ? (hl("screen") ? 1 : 0.4) : 1} style={{ transition: "opacity .3s" }}>
                <rect x="266" y="54" width="184" height="44" rx="7" fill="#0a0a0a" />
                <rect x="266.5" y="54.5" width="183" height="43" rx="6.5" fill="none" stroke="#2a2a2a" strokeWidth="1" />
                <g style={{ transition: "opacity .35s", opacity: paid ? 0 : 1 }}>
                  <text x="280" y="76" fontSize="16" fontWeight="500" fill={PINK}>402</text>
                  <text x="314" y="76" fontSize="10.5" fill="#9a9a9a">Payment Required</text>
                  <text x="280" y="91" fontSize="9.5" fill="#cfcfcf">{a.amount} units = {usdm}</text>
                </g>
                <g style={{ transition: "opacity .35s", opacity: paid ? 1 : 0 }}>
                  <text x="280" y="76" fontSize="16" fontWeight="500" fill={GREEN}>200</text>
                  <text x="314" y="76" fontSize="10.5" fill="#9a9a9a">OK · paid ✓</text>
                  <text x="280" y="91" fontSize="9.5" fill="#cfcfcf">resource delivered</text>
                </g>
              </g>

              {/* GLASS — a bright window knocked out of the slab, stocked with data cartridges */}
              <g opacity={mode === "explore" ? (hl("glass") ? 1 : 0.4) : 1} style={{ transition: "opacity .3s" }}>
                <rect x="266" y="108" width="184" height="104" rx="7" fill="#ffffff" />
                <rect x="269.5" y="111.5" width="177" height="97" rx="5" fill="none" stroke="#ececec" strokeWidth="1" />
                {/* lit shelves */}
                <line x1="270" y1="155" x2="446" y2="155" stroke="#eeeeee" strokeWidth="1" />
                <line x1="270" y1="201" x2="446" y2="201" stroke="#eeeeee" strokeWidth="1" />
                {/* cartridges */}
                {[0, 1, 2].map((c) =>
                  [0, 1].map((r) => {
                    const x = 278 + c * 56;
                    const y = 117 + r * 46;
                    if (c === 1 && r === 0) return null;
                    return (
                      <g key={`${c}-${r}`}>
                        <rect x={x} y={y} width="42" height="34" rx="4" fill="#fff" stroke="#cfcfcf" strokeWidth="1.25" />
                        <path d={`M${x} ${y + 9} L${x} ${y + 4} Q${x} ${y} ${x + 4} ${y} L${x + 38} ${y} Q${x + 42} ${y} ${x + 42} ${y + 4} L${x + 42} ${y + 9} Z`} fill="#c9c9c9" />
                        <line x1={x + 8} y1={y + 21} x2={x + 30} y2={y + 21} stroke="#dcdcdc" strokeWidth="1.4" />
                        <line x1={x + 8} y1={y + 27} x2={x + 24} y2={y + 27} stroke="#e6e6e6" strokeWidth="1.4" />
                      </g>
                    );
                  }),
                )}
                {/* the bought item — drops into the chute on delivery, flips pink mid-fall */}
                <g style={{ transition: "transform .7s cubic-bezier(.5,1.2,.4,1)", transform: paid ? "translate(0px,138px)" : "none" }}>
                  <rect x="334" y="117" width="42" height="34" rx="4" fill="#fff" stroke={paid ? PINK : "#cfcfcf"} strokeWidth="1.25" />
                  <path d="M334 126 L334 121 Q334 117 338 117 L372 117 Q376 117 376 121 L376 126 Z" fill={paid ? PINK : "#c9c9c9"} />
                  <line x1="342" y1="138" x2="364" y2="138" stroke={paid ? "#f6a6d2" : "#dcdcdc"} strokeWidth="1.4" />
                </g>
              </g>

              {/* SLOT — a milled aperture in a paper strip, with a coin-return */}
              <g opacity={mode === "explore" ? (hl("slot") ? 1 : 0.4) : 1} style={{ transition: "opacity .3s" }}>
                <rect x="266" y="222" width="184" height="20" rx="6" fill="#ffffff" />
                <rect x="344" y="229" width="44" height="7" rx="3.5" fill="#0a0a0a" className={mode === "play" && step < 4 ? "wt-slot" : ""} />
                <rect x="346" y="229.5" width="40" height="1.4" rx="0.7" fill="#777" />
                <circle cx="410" cy="232" r="4.5" fill="#fff" stroke="#d8d8d8" strokeWidth="1.2" />
                <text x="276" y="236.5" fontSize="9" fill="#9a9a9a">payment-signature</text>
              </g>

              {/* CHUTE — a delivery tray cut from the slab base, with an overhang lip */}
              <g opacity={mode === "explore" ? (hl("chute") ? 1 : 0.4) : 1} style={{ transition: "opacity .3s" }}>
                <rect x="266" y="252" width="184" height="34" rx="7" fill="#ffffff" />
                <rect x="266" y="252" width="184" height="5" rx="2.5" fill="#1c1c1c" />
                <line x1="278" y1="279" x2="438" y2="279" stroke="#ededed" strokeWidth="1" />
                <text x="358" y="306" fontSize="11" textAnchor="middle" fill="#888">server · the API</text>
              </g>

              {/* VERIFY / CONFIRM arrows + facilitator */}
              <g opacity={mode === "explore" ? (hl("facilitator") ? 1 : 0.4) : 1} style={{ transition: "opacity .3s" }}>
                <line x1="468" y1="162" x2="495" y2="162" stroke={mode === "play" && (step === 5 || step === 6) ? PINK : "#cfcfcf"} strokeWidth={mode === "play" && (step === 5 || step === 6) ? 2 : 1.5} markerEnd="url(#wt-arr)" style={{ transition: "stroke .3s" }} />
                <line x1="529" y1="162" x2="556" y2="162" stroke={mode === "play" && (step === 5 || step === 6) ? PINK : "#cfcfcf"} strokeWidth={mode === "play" && (step === 5 || step === 6) ? 2 : 1.5} markerEnd="url(#wt-arr)" style={{ transition: "stroke .3s" }} />
                <line x1="556" y1="186" x2="468" y2="186" stroke={mode === "play" && step === 7 ? PINK : "#cfcfcf"} strokeWidth={mode === "play" && step === 7 ? 2 : 1.5} markerEnd="url(#wt-arr)" style={{ transition: "stroke .3s" }} />
                <polygon points="497,162 504.5,150 519.5,150 527,162 519.5,174 504.5,174" fill="#0a0a0a" />
                <circle cx="512" cy="162" r="3" fill={mode === "play" && step >= 5 && step <= 7 ? PINK : "#fff"} />
                <text x="512" y="140" fontSize="9" textAnchor="middle" fill="#888">verify / settle</text>
              </g>

              {/* VAULT */}
              <g opacity={mode === "explore" ? (hl("vault") ? 1 : 0.4) : 1} style={{ transition: "opacity .3s" }}>
                <rect x="560" y="110" width="112" height="120" rx="14" fill="#0a0a0a" />
                <rect x="566" y="116" width="100" height="108" rx="10" fill="#1c1c1c" />
                <circle cx="616" cy="160" r="31" fill="#ffffff" />
                <g className={vaultSpin ? "wt-dial wt-spin" : "wt-dial"} style={{ transformOrigin: "616px 160px" }}>
                  <circle cx="616" cy="160" r="26" fill="none" stroke="#cdcdcd" strokeWidth="1.5" />
                  <circle cx="616" cy="160" r="19" fill="none" stroke="#e6e6e6" strokeWidth="1" />
                  <line x1="616" y1="134" x2="616" y2="142" stroke="#0a0a0a" strokeWidth="1.5" />
                  <line x1="616" y1="178" x2="616" y2="186" stroke="#0a0a0a" strokeWidth="1.5" />
                  <line x1="590" y1="160" x2="598" y2="160" stroke="#0a0a0a" strokeWidth="1.5" />
                  <line x1="634" y1="160" x2="642" y2="160" stroke="#0a0a0a" strokeWidth="1.5" />
                  <circle cx="634" cy="142" r="1.1" fill="#aaa" />
                  <circle cx="598" cy="142" r="1.1" fill="#aaa" />
                  <circle cx="634" cy="178" r="1.1" fill="#aaa" />
                  <circle cx="598" cy="178" r="1.1" fill="#aaa" />
                  <line x1="616" y1="160" x2="616" y2="137" stroke={PINK} strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="616" cy="160" r="4.5" fill={vaultSpin || paid ? PINK : "#0a0a0a"} />
                </g>
                <text x="616" y="252" fontSize="11" textAnchor="middle" fill="#888">Cardano vault</text>
              </g>

              {/* COIN */}
              <g style={{ transition: "transform .7s cubic-bezier(.5,1.3,.4,1)", transform: coinAtSlot ? "translate(216px,72px)" : "none", opacity: mode === "explore" ? (hl("coin") ? 1 : 0.4) : (step >= 3 ? 1 : 0.5) }}>
                <circle cx="150" cy="160" r="14" fill={PINK} />
                <circle cx="150" cy="160" r="10" fill="none" stroke="#fff" strokeWidth="1" opacity="0.55" />
                <text x="150" y="163.5" fontSize="7.5" fontWeight="600" letterSpacing="0.5" textAnchor="middle" fill="#fff">SIG</text>
              </g>

              {/* highlight box on the focused part */}
              {focus && <HLBox id={focus} />}
            </g>

            {/* explore hit-rects (interactive only in explore mode) */}
            <g style={{ pointerEvents: mode === "explore" ? "all" : "none" }}>
              {HIT.map((h) => (
                <rect
                  key={h.id}
                  x={h.x}
                  y={h.y}
                  width={h.w}
                  height={h.h}
                  fill="transparent"
                  tabIndex={mode === "explore" ? 0 : -1}
                  role="button"
                  aria-label={h.id}
                  onMouseEnter={() => setActive(h.id)}
                  onFocus={() => setActive(h.id)}
                  onClick={() => setActive(h.id)}
                  style={{ cursor: "pointer", outline: "none" }}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* ── panel ── */}
        <div className="flex flex-col p-5 md:p-6">
          {/* mode toggle */}
          <div className="flex items-center justify-between">
            <div className="inline-flex border border-black/[0.12] text-[11px] font-mono uppercase tracking-widest">
              {(["play", "explore"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-2.5 py-1 transition-colors"
                  style={mode === m ? { background: "#0a0a0a", color: "#fff" } : { color: "#888" }}
                >
                  {m}
                </button>
              ))}
            </div>
            {mode === "play" ? (
              <button
                onClick={() => {
                  if (step >= 8) setStep(1);
                  setPlaying((p) => !p);
                }}
                className="font-mono text-[11px] uppercase tracking-widest text-black/50 hover:text-black transition-colors"
              >
                {playing ? "⏸ pause" : "▶ play"}
              </button>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-widest text-black/35">tap a part</span>
            )}
          </div>

          {mode === "play" ? (
            <>
              <span className="mt-4 font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: PINK }}>
                Step {String(step).padStart(2, "0")} / 08
              </span>
              <h3 className="mt-2 text-[22px] md:text-[25px] font-normal tracking-[-0.5px] text-black leading-[1.15]">
                {s.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-[#5b5b5b]">{BODY[s.key]}</p>

              {/* what's Masumi-specific here */}
              {MASUMI[s.key] && (
                <div className="mt-3 border-l-2 pl-3 py-0.5" style={{ borderColor: PINK }}>
                  <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: PINK }}>
                    vs. standard x402
                  </span>
                  <p className="mt-0.5 text-[12.5px] leading-[1.5] text-[#5b5b5b]">{MASUMI[s.key]}</p>
                </div>
              )}

              {/* verify checklist */}
              {(step === 5 || step === 6) && (
                <ul className="mt-4 space-y-1.5">
                  {CHECKS.map((c, i) => {
                    const done = c.enforced && i < checksDone;
                    return (
                      <li key={c.key} className="flex items-center gap-2.5 text-[12px] font-mono" style={{ opacity: c.enforced ? 1 : 0.6 }}>
                        <span
                          className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-[10px]"
                          style={{
                            border: `1.4px solid ${done ? GREEN : "rgba(0,0,0,0.2)"}`,
                            color: done ? GREEN : "transparent",
                            transition: "border-color .2s, color .2s",
                          }}
                        >
                          ✓
                        </span>
                        <span style={{ color: done ? "#0a0a0a" : "#5b5b5b" }}>{c.key}</span>
                        <span className="text-black/30">— {c.desc}</span>
                        {!c.enforced && <span className="ml-auto text-[10px] text-black/30">demo · not enforced</span>}
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* on the wire */}
              <div className="mt-5 bg-[#0a0a0a] px-3 py-2 font-mono text-[11px] leading-[1.5] text-white/80 break-all">
                <span className="text-white/30">$ </span>
                {WIRE[s.key]}
              </div>

              <div className="mt-auto pt-6 flex items-center gap-3">
                <button onClick={back} disabled={step === 1} className="font-mono text-[13px] px-3 py-2 text-black/55 hover:text-black disabled:opacity-30 transition-colors">
                  ← back
                </button>
                <button onClick={next} className="flex-1 text-[14px] font-medium text-white px-5 py-3 transition-opacity hover:opacity-90" style={{ background: PINK }}>
                  {s.cta}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 text-[13px] leading-[1.55] text-[#5b5b5b]">
                Every part of the machine maps to a piece of the protocol — tap any of them, or the
                hotspots on the diagram, to see the spec term and the real value behind it.
              </p>
              {/* legend */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {HOTSPOTS.map((h) => (
                  <button
                    key={h.id}
                    onMouseEnter={() => setActive(h.id)}
                    onClick={() => setActive(h.id)}
                    className="px-2.5 py-1 text-[12px] font-mono border transition-colors"
                    style={active === h.id ? { borderColor: PINK, color: PINK, background: "rgba(250,0,140,0.06)" } : { borderColor: "rgba(0,0,0,0.12)", color: "#5b5b5b" }}
                  >
                    {h.name.replace(/^The /, "")}
                  </button>
                ))}
              </div>
              {/* callout */}
              <div key={active} className="wt-callout mt-5 border-l-2 pl-4" style={{ borderColor: PINK }}>
                <div className="text-[18px] font-normal tracking-[-0.3px] text-black">{activeHot.name}</div>
                <div className="mt-1 font-mono text-[12px]" style={{ color: PINK }}>{activeHot.term}</div>
                <p className="mt-2 text-[13px] leading-[1.55] text-[#5b5b5b]">{activeHot.role}</p>
                <div className="mt-3 bg-[#0a0a0a] px-3 py-2 font-mono text-[11px] leading-[1.5] text-white/80 break-all">
                  {activeHot.value}
                </div>
              </div>
              <p className="mt-auto pt-6 text-[11px] text-black/35 font-mono">
                all values live from <span className="text-black/55">/api/x402/demo</span>
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.wt-spin) {
          animation: wt-spin 1.8s linear infinite;
        }
        :global(.wt-slot) {
          animation: wt-slot 1.6s ease-in-out infinite;
        }
        .wt-callout {
          animation: wt-callout 0.18s ease-out;
        }
        @keyframes wt-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes wt-slot {
          0%, 100% {
            fill: #0a0a0a;
          }
          50% {
            fill: ${PINK};
          }
        }
        @keyframes wt-callout {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.wt-spin),
          :global(.wt-slot),
          .wt-callout {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-black">{children}</span>;
}

// highlight boxes per focusable part
const BOX: Record<string, { x: number; y: number; w: number; h: number }> = {
  agent: { x: 50, y: 124, w: 92, h: 120 },
  screen: { x: 260, y: 48, w: 196, h: 56 },
  glass: { x: 260, y: 104, w: 196, h: 112 },
  slot: { x: 260, y: 218, w: 196, h: 28 },
  chute: { x: 260, y: 248, w: 196, h: 44 },
  coin: { x: 130, y: 142, w: 40, h: 40 },
  vault: { x: 554, y: 104, w: 124, h: 132 },
  facilitator: { x: 466, y: 138, w: 92, h: 60 },
};
function HLBox({ id }: { id: string }) {
  const b = BOX[id];
  if (!b) return null;
  return (
    <rect
      x={b.x}
      y={b.y}
      width={b.w}
      height={b.h}
      rx="10"
      fill="rgba(250,0,140,0.05)"
      stroke={PINK}
      strokeWidth="1.6"
      pointerEvents="none"
      style={{ transition: "all .2s" }}
    />
  );
}

const HIT = Object.entries(BOX).map(([id, b]) => ({ id, ...b }));

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const PINK = "#FA008C";
const INK = "#0a0a0a";
// Match masumi's type: Inter for UI text (inherited from <body>), this mono
// stack only for code / data (hashes, JSON, HTTP tokens).
const MONO = `"SF Mono", Monaco, "Cascadia Code", monospace`;
const MACHINE_IMG = "/images/vending-machine-new.png";
const ENDPOINT = "/vending-machine";
const RUN_REQUEST_RESPONSE_DWELL_MS = 3400;
const VERIFY_REQUEST_DWELL_MS = 1600;
const VERIFY_RESULT_DWELL_MS = 3200;
const SETTLE_REQUEST_DWELL_MS = 1600;
const SETTLE_RESULT_DWELL_MS = 2600;
const CONFIRM_RESULT_DWELL_MS = 2200;
const DISPENSE_DWELL_MS = 1250;
const DESKTOP_STEPS_WINDOW_HEIGHT = 560;
const MOCK_WALLET_ID = "mock-wallet";
const MOCK_SIGNED_TX =
  "mock_signed_cardano_tx_7a31f5e8d26b4c91a9f0e6c3b5d2847f011be9aa6e522647f7c0b38d18f29c44";
const MOCK_TX_HASH =
  "mock_tx_2d9f0c7a8b31e64d93a5f0b24c81a7f2";
// centre of the keypad (% of the square machine image)

type Wallet = { id: string; name: string; icon?: string };
type Cip30Provider = {
  name?: unknown;
  icon?: unknown;
  apiVersion?: unknown;
  enable?: unknown;
};
type Stage = "choose" | "verify" | "settle" | "confirm" | "done";
type NodeStatus = "done" | "active" | "pending";
type PaymentReq = { scheme?: string; network?: string; maxAmountRequired?: string; asset?: string; payTo?: string };
type PaymentResponse = { success?: boolean; network?: string; transaction?: string };

// the real exchanges shown inside the validate / settle steps
type VerifyData = { reqBody: string; status?: number; resp?: unknown };
type SettleData = { xPayment: string; status?: number };
type ConfirmPoll = { n: number; found: boolean; confirmations?: number; block?: number };

const truncMid = (s: string, head = 24, tail = 8) =>
  s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function shortAddr(a?: string) {
  if (!a) return "";
  return a.length > 18 ? `${a.slice(0, 12)}…${a.slice(-5)}` : a;
}
function adaFromLovelace(l?: string) {
  if (!l) return "";
  return `${Number(l) / 1_000_000} ADA`;
}
function shortHash(h: unknown) {
  const s = String(h ?? "");
  return s.length > 20 ? `${s.slice(0, 10)}…${s.slice(-6)}` : s;
}

function isCip30Provider(provider: unknown): provider is { name: string; icon: string; apiVersion: string; enable: () => unknown } {
  if (!provider || typeof provider !== "object") return false;
  const w = provider as Cip30Provider;
  return (
    typeof w.name === "string" &&
    w.name.trim().length > 0 &&
    typeof w.icon === "string" &&
    w.icon.length > 0 &&
    typeof w.apiVersion === "string" &&
    w.apiVersion.trim().length > 0 &&
    typeof w.enable === "function"
  );
}

// Wallet (CIP-30) errors are plain { code, info } objects, not Error instances —
// stringify them readably instead of getting "[object Object]".
function errText(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    if (typeof o.info === "string") return o.info;
    if (typeof o.message === "string") return o.message;
    try {
      return JSON.stringify(e);
    } catch {
      return "Unknown wallet error";
    }
  }
  return String(e);
}

// Plain global stylesheet for the interactive hero. (Injected once, not via
// styled-jsx — its SWC transform deadlocks Turbopack on this much CSS.)
const VH_CSS = `
.wt-pulse { animation: wt-pulse 1.5s ease-in-out infinite; }
@keyframes wt-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(250, 0, 140, 0.45); }
  50% { box-shadow: 0 0 0 7px rgba(250, 0, 140, 0); }
}
.vh-seq { animation: vhSeq 0.95s cubic-bezier(0.6, 0, 0.3, 1) both; }
@keyframes vhSeq { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.vh-pop { animation: vhPop 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes vhPop { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: none; } }
.vh-drink { animation: vhDrop 1.55s cubic-bezier(0.34, 1.45, 0.64, 1) both; }
@keyframes vhDrop {
  0% { opacity: 0; transform: translate(-50%, -260%) scale(0.7); }
  55% { opacity: 1; }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
.vh-shake { animation: vhShake 1.05s ease-in-out 1; }
@keyframes vhShake {
  0%, 100% { transform: none; }
  25% { transform: translateX(-2px) rotate(-0.5deg); }
  50% { transform: translateX(2px) rotate(0.5deg); }
  75% { transform: translateX(-1.5px); }
}
.vh-flash { animation: vhFlash 1.25s ease-out forwards; }
@keyframes vhFlash { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }

.msg-desc { font-size: 13px; line-height: 1.55; color: #6b6b6b; max-width: 560px; }
.code { font-family: ${MONO}; font-size: 12px; color: #0a0a0a; }
.tgl { display: inline-flex; align-items: center; gap: 6px; margin-top: 11px; margin-right: 7px; padding: 4px 10px 4px 9px; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; background: #fafafa; font-size: 11px; font-weight: 500; color: #666; cursor: pointer; transition: border-color .15s, color .15s, background .15s; }
.tgl:hover { border-color: rgba(250,0,140,0.45); color: #0a0a0a; }
.tgl-open { background: rgba(250,0,140,0.05); border-color: rgba(250,0,140,0.4); color: ${PINK}; }
.tgl-chev { flex-shrink: 0; transition: transform .18s; }
.tgl-open .tgl-chev { transform: rotate(90deg); }
.json-block { margin-top: 9px; background: #0a0a0a; color: rgba(255, 255, 255, 0.8); font-family: ${MONO}; font-size: 11px; line-height: 1.6; padding: 13px; max-height: 440px; overflow-y: auto; overflow-x: hidden; white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 9px; }
.code-block { margin-top: 10px; background: #0f0f12; color: #e7e7e9; font-family: ${MONO}; font-size: 11px; line-height: 1.6; padding: 12px 13px; border-radius: 9px; white-space: pre-wrap; overflow-wrap: anywhere; }
.run-btn { margin-top: 11px; display: inline-flex; align-items: center; gap: 7px; padding: 8px 15px; border-radius: 9px; background: ${PINK}; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
.run-btn:hover { opacity: 0.9; }
.run-btn:disabled { opacity: 0.6; cursor: wait; }
.run-spin { width: 11px; height: 11px; border: 2px solid rgba(255,255,255,0.45); border-top-color: #fff; border-radius: 50%; animation: vhSpin 0.7s linear infinite; }
@keyframes vhSpin { to { transform: rotate(360deg); } }
.run-out-label { margin-top: 12px; font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #9a9a9a; }
.http-status { margin-top: 13px; display: flex; align-items: stretch; overflow: hidden; border-radius: 10px; border: 1px solid rgba(250,0,140,0.28); background: rgba(250,0,140,0.035); }
.http-status-code { display: flex; align-items: center; justify-content: center; min-width: 52px; padding: 8px 11px; background: #0a0a0a; color: ${PINK}; font-family: ${MONO}; font-size: 16px; line-height: 1; font-weight: 800; }
.http-status-meta { min-width: 0; flex: 1; padding: 8px 11px 9px; }
.http-status-k { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.09em; color: ${PINK}; }
.http-status-v { margin-top: 2px; font-size: 13px; font-weight: 600; color: #0a0a0a; }
.run-response-body { max-height: 160px; }
.resp-bubble { position: absolute; z-index: 30; pointer-events: none; }
.resp-bubble-machine { top: 8%; left: 6%; }
.resp-bubble-inner { display: inline-flex; align-items: center; gap: 8px; background: #0a0a0a; border-radius: 11px; padding: 9px 13px; box-shadow: 0 12px 26px rgba(0,0,0,0.24); white-space: nowrap; }
.resp-code { font-family: ${MONO}; font-size: 13px; font-weight: 700; color: ${PINK}; }
.resp-code[data-ok="true"] { color: #4ade80; }
.resp-name { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.92); }
.resp-tail { position: absolute; right: -4px; top: 50%; width: 11px; height: 11px; background: #0a0a0a; transform: translateY(-50%) rotate(45deg); border-radius: 2px; }
.vh-bubble { animation: vhBubble 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes vhBubble { from { opacity: 0; transform: translateX(10px) scale(0.9); } to { opacity: 1; transform: none; } }
.vh-coin { position: absolute; z-index: 25; left: 84%; top: 40%; width: 12%; transform: translate(-50%, -50%); pointer-events: none; animation: vhCoin 1.85s cubic-bezier(0.4, 0, 0.35, 1) forwards; }
@keyframes vhCoin {
  0% { opacity: 0; transform: translate(-950%, -150%) scale(1.05) rotate(-25deg); }
  18% { opacity: 1; }
  60% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(210deg); }
  100% { opacity: 0; transform: translate(-50%, 70%) scale(0.4) rotate(380deg); }
}
.vh-steps-track { position: relative; transition: transform 1.7s cubic-bezier(0.5, 0, 0.15, 1); }
.vh-nav { display: none; align-items: center; justify-content: center; gap: 10px; margin-bottom: 0; }
.vh-nav-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.14); background: #fff; color: #0a0a0a; cursor: pointer; transition: border-color .15s, background .15s, opacity .15s; }
.vh-nav-btn:hover:not(:disabled) { border-color: ${PINK}; color: ${PINK}; }
.vh-nav-btn:disabled { opacity: 0.32; cursor: default; }
.vh-nav-label { font-family: ${MONO}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: #9a9a9a; min-width: 88px; text-align: center; }
@media (min-width: 1024px) {
  .vh-stepswin {
    height: 480px; /* fallback; the component sets an exact height that fits the focused step */
    overflow: hidden;
    /* px-based so it's height-independent: completed steps fade out over the top
       80px (= FOCAL_TOP, where the active step begins fully opaque); a short fade
       at the very bottom sits below the focused step's content, never over it */
    -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 80px, #000 calc(100% - 36px), transparent 100%);
    mask-image: linear-gradient(to bottom, transparent 0, #000 80px, #000 calc(100% - 36px), transparent 100%);
  }
  .vh-nav { display: flex; position: absolute; left: 0; right: 0; top: -44px; z-index: 5; }
}
@media (min-width: 640px) {
  .resp-bubble-machine { top: 13%; left: auto; right: 92%; }
}
.wallet-options { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 12px; }
.wallet-btn { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; padding: 7px 13px; border: 1px solid rgba(0, 0, 0, 0.14); border-radius: 8px; cursor: pointer; transition: border-color 0.15s, background 0.15s; color: #0a0a0a; }
.wallet-btn:hover { border-color: ${PINK}; }
.wallet-btn:disabled { cursor: wait; opacity: 0.74; }
.wallet-on { border-color: ${PINK}; background: rgba(250, 0, 140, 0.06); color: ${PINK}; }
.wallet-btn-spin { width: 11px; height: 11px; border: 2px solid rgba(250,0,140,0.24); border-top-color: ${PINK}; border-radius: 50%; animation: vhSpin 0.8s linear infinite; }
.wallet-or { display: flex; align-items: center; gap: 10px; width: min(100%, 360px); margin: 13px auto 1px; color: #9a9a9a; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
.wallet-or::before, .wallet-or::after { content: ""; flex: 1; height: 1px; background: rgba(0,0,0,0.08); }
.mock-wallet-btn { margin-top: 12px; display: inline-flex; align-items: center; gap: 8px; max-width: 100%; padding: 7px 13px; border: 1px solid rgba(0,0,0,0.14); border-radius: 8px; background: #fff; color: #0a0a0a; font-size: 13px; font-weight: 500; line-height: 1.35; cursor: pointer; transition: border-color .15s, background .15s, color .15s; text-align: left; }
.mock-wallet-btn:hover { border-color: rgba(250,0,140,0.5); background: rgba(250,0,140,0.035); color: ${PINK}; }
.mock-wallet-btn:disabled { cursor: wait; opacity: 0.7; }
.mock-wallet-label { min-width: 0; overflow-wrap: anywhere; }
.mock-note { margin-top: 7px; max-width: 440px; font-size: 12px; line-height: 1.45; color: #8a8a8a; }
.mock-wallet-wrap { text-align: center; }
.mock-wallet-wrap .mock-note { margin-left: auto; margin-right: auto; }
.wallet-action { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-width: 122px; }
.wallet-action:disabled { cursor: wait; opacity: 0.78; }
.wallet-spin { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.45); border-top-color: #fff; border-radius: 50%; animation: vhSpin 0.75s linear infinite; }

/* checklist (facilitator) + settle steps share one calm style */
.tick-row { display: flex; align-items: center; gap: 9px; font-size: 13px; line-height: 1.5; padding: 3px 0; }
.tick { flex-shrink: 0; width: 15px; height: 15px; border-radius: 50%; background: ${INK}; color: #fff; font-size: 9px; display: inline-flex; align-items: center; justify-content: center; }
.tick-label { color: #0a0a0a; }
.tick-detail { margin-left: auto; color: #9a9a9a; font-family: ${MONO}; font-size: 11px; }
.hash-chip { margin-top: 10px; display: inline-flex; align-items: center; gap: 9px; background: #f6f6f7; border: 1px solid rgba(0,0,0,0.07); border-radius: 8px; padding: 7px 11px; font-family: ${MONO}; font-size: 11px; text-decoration: none; transition: border-color .15s; }
.hash-chip:hover { border-color: rgba(250,0,140,0.4); }
.hash-k { color: #9a9a9a; }
.hash-v { color: #0a0a0a; }
.hash-ext { color: ${PINK}; }
.result-link { color: ${PINK}; text-decoration: none; }
.result-link:hover { text-decoration: underline; }
.pay-error { margin-top: 11px; font-size: 13px; line-height: 1.45; color: #c0245f; background: rgba(250,0,140,0.05); border: 1px solid rgba(250,0,140,0.22); border-radius: 8px; padding: 8px 11px; }

/* "waiting" / "broadcasting" pulse while an in-flight request is mid-air */
.vh-dots { animation: vhDots 1.6s ease-in-out infinite; }
@keyframes vhDots { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* confirmation polling (S4b) */
.confirm-box { margin-top: 13px; border-top: 1px dashed rgba(0,0,0,0.1); padding-top: 12px; }
.confirm-head { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.confirm-title { font-weight: 500; color: #0a0a0a; }
.confirm-spin { flex-shrink: 0; width: 13px; height: 13px; border: 2px solid rgba(250,0,140,0.25); border-top-color: ${PINK}; border-radius: 50%; animation: vhSpin 0.7s linear infinite; }
.confirm-badge { flex-shrink: 0; width: 15px; height: 15px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; border: 1.5px solid rgba(0,0,0,0.15); }
.confirm-badge.ok { background: #16a34a; color: #fff; border: none; }
.confirm-attempt { margin-left: auto; font-family: ${MONO}; font-size: 10px; color: #9a9a9a; }
.confirm-code { margin-top: 9px; }
.confirm-log { margin-top: 8px; display: flex; flex-direction: column; gap: 3px; }
.confirm-row { display: flex; gap: 9px; align-items: baseline; font-family: ${MONO}; font-size: 11px; line-height: 1.4; }
.confirm-n { color: #bcbcbc; min-width: 22px; flex-shrink: 0; }
.confirm-pending { color: #9a9a9a; }
.confirm-found { color: #16a34a; }
.confirm-done { margin-top: 9px; font-size: 13px; line-height: 1.5; color: #16a34a; }

/* dispensed result */
.result { margin-top: 10px; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; overflow: hidden; }
.result-row { display: flex; gap: 10px; padding: 8px 12px; font-family: ${MONO}; font-size: 12px; border-top: 1px solid rgba(0,0,0,0.05); }
.result-row:first-child { border-top: none; }
.result-k { color: #9a9a9a; min-width: 92px; }
.result-v { color: #0a0a0a; word-break: break-all; }
.vend-cue { margin-top: 11px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: #0a0a0a; }
.vend-cue .arrow { color: ${PINK}; font-size: 15px; }

/* state machine */
.sd-machine { display: flex; flex-direction: column; }
.sd-init { display: flex; align-items: center; justify-content: center; gap: 8px; }
.sd-init i { width: 11px; height: 11px; border-radius: 50%; background: ${INK}; box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05); }
.sd-init-label { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.16em; color: #b0b0b0; }
.sd-trans { position: relative; height: 30px; display: flex; align-items: center; justify-content: center; }
.sd-trans::before { content: ""; position: absolute; left: 50%; top: 0; bottom: 7px; width: 1.5px; transform: translateX(-50%); background: rgba(0,0,0,0.55); }
.sd-trans.pending::before { background: none; border-left: 1.5px dashed rgba(0, 0, 0, 0.14); }
.sd-trans::after { content: ""; position: absolute; left: 50%; bottom: 1px; transform: translateX(-50%); width: 0; height: 0; border-left: 4.5px solid transparent; border-right: 4.5px solid transparent; border-top: 6px solid rgba(0,0,0,0.55); }
.sd-trans.pending::after { border-top-color: rgba(0, 0, 0, 0.18); }
.sd-tlabel { position: relative; z-index: 1; background: #fff; border-radius: 999px; padding: 1px 9px; font-family: ${MONO}; font-size: 10px; color: #777; white-space: nowrap; }
.sd-trans.pending .sd-tlabel { color: #bcbcbc; }
.sd-node { border: 1px solid rgba(0, 0, 0, 0.11); border-radius: 13px; padding: 11px 14px; background: #fff; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
.sd-node.sd-active { border-color: ${PINK}; background: rgba(250, 0, 140, 0.02); box-shadow: 0 0 0 3px rgba(250, 0, 140, 0.06); }
.sd-node.sd-pending { border-style: dashed; border-color: rgba(0, 0, 0, 0.12); background: #fcfcfc; }
.sd-node.sd-final.sd-done { box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05); }
.sd-head { display: flex; align-items: center; gap: 9px; }
.sd-num { font-family: ${MONO}; font-size: 9px; color: #bcbcbc; letter-spacing: 0.05em; }
.sd-name { flex: 1; font-size: 14px; font-weight: 600; color: #0a0a0a; }
.sd-node.sd-pending .sd-name { color: #a6a6a6; font-weight: 500; }
.sd-badge { flex-shrink: 0; width: 17px; height: 17px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; }
.sd-badge.done { background: ${INK}; color: #fff; }
.sd-badge.pending { border: 1.5px solid rgba(0, 0, 0, 0.15); }
.sd-cur { flex-shrink: 0; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: ${PINK}; background: rgba(250, 0, 140, 0.09); border-radius: 999px; padding: 2px 8px; }
.sd-body { margin-top: 8px; }

@media (prefers-reduced-motion: reduce) {
  .wt-pulse, .vh-seq, .vh-pop, .vh-shake, .vh-flash, .vh-dots, .vh-coin { animation: none !important; }
  .vh-dots { opacity: 0.7; }
  /* stop the perpetual spinners — show them as static pending rings instead */
  .confirm-spin, .run-spin, .wallet-spin, .wallet-btn-spin { animation: none !important; }
  .vh-drink { animation: none !important; opacity: 1; transform: translate(-50%, -50%); }
}
`;

export default function VendingHero() {
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<{ status: number; body: unknown } | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [walletSigning, setWalletSigning] = useState(false);
  const [mocking, setMocking] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [stage, setStage] = useState<Stage>("choose");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: number; body: unknown; payment: PaymentResponse | null } | null>(null);
  const [vended, setVended] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const shake = () => setShaking(true); // reset on the img's animationend
  const [coin, setCoin] = useState(false);

  // the actual requests/responses each step makes, surfaced in the UI
  const [verifyData, setVerifyData] = useState<VerifyData | null>(null);
  const [settleData, setSettleData] = useState<SettleData | null>(null);
  const [confirms, setConfirms] = useState<ConfirmPoll[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  // the machine stays put; the steps slide up so the active one sits beside it,
  // with completed steps drifting up and fading out (a focal window).
  const winRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [stepsY, setStepsY] = useState(0);
  const [winH, setWinH] = useState(0); // lg window height; adapts to the focused step (0 = mobile/auto)
  const [focusIndex, setFocusIndex] = useState(0); // which step the window is parked on
  const FOCAL_TOP = 80; // where the focused step rests inside the window

  // detect CIP-30 wallets
  useEffect(() => {
    if (typeof window === "undefined") return;
    const detect = () => {
      const c = (window as unknown as { cardano?: Record<string, unknown> }).cardano;
      if (!c || typeof c !== "object") {
        setWallets([]);
        return;
      }
      const found: Wallet[] = Object.entries(c).flatMap(([id, provider]) => {
        if (!isCip30Provider(provider)) return [];
        return [{ id, name: provider.name, icon: provider.icon }];
      });
      setWallets(found);
    };
    detect();
    const i = setInterval(detect, 800);
    const t = setTimeout(() => clearInterval(i), 5000);
    return () => { clearInterval(i); clearTimeout(t); };
  }, []);

  // which step the flow is currently on (0-based: S1…S5). "settle" and "confirm"
  // are two phases of the same step (S4), so both park the window there.
  const activeIndex = !started
    ? 0
    : stage === "choose"
      ? 1
      : stage === "verify"
        ? 2
        : stage === "settle" || stage === "confirm"
          ? 3
          : 4;

  // the window auto-follows the flow; the user can override with the nav arrows
  useEffect(() => {
    setFocusIndex(activeIndex);
  }, [activeIndex]);

  // slide the steps track so the focused step rests at FOCAL_TOP inside the window
  useEffect(() => {
    const trackEl = stepsRef.current;
    if (!trackEl) return;
    const measure = () => {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setStepsY(0);
        setWinH(0);
        return;
      }
      const nodes = trackEl.querySelectorAll<HTMLElement>(".sd-node");
      const target = nodes[focusIndex] ?? nodes[nodes.length - 1];
      if (!target) {
        setStepsY(0);
        setWinH(0);
        return;
      }
      // offsetTop is layout-relative (ignores the track's transform)
      setStepsY(FOCAL_TOP - target.offsetTop);
      setWinH(DESKTOP_STEPS_WINDOW_HEIGHT);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackEl);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [focusIndex, started, stage, vended]);

  // Step 1's "Run request" — the real GET. The machine shakes and returns 402.
  async function runRequest() {
    if (busy || started) return;
    setBusy(true);
    setResp(null);
    shake();
    try {
      const r = await fetch(ENDPOINT, { method: "GET", cache: "no-store" });
      const body = await r.json();
      setResp({ status: r.status, body });
    } catch {
      setResp({ status: 0, body: { error: "Network error" } });
    } finally {
      shake();
      await delay(RUN_REQUEST_RESPONSE_DWELL_MS);
      setStarted(true);
      setBusy(false);
    }
  }

  function selectWallet(id: string) {
    if (stage !== "choose") return;
    setMockMode(false);
    setChosen(id);
    setWalletSigning(false);
    setSigning(true);
  }

  // The real thing: connect the wallet, build + sign a Cardano tx paying the
  // required amount to the machine's address, hand the signed tx to the
  // facilitator (server), which submits it to mainnet and returns the txHash.
  // Mesh is imported lazily — a static import of its WASM crashes under Turbopack.
  async function signAndPay() {
    if (stage !== "choose" || !chosen || walletSigning) return;
    const req = acc;
    if (!req?.payTo || !req?.maxAmountRequired) {
      setError("Missing payment requirements from the machine.");
      return;
    }
    setError(null);
    setMockMode(false);
    setVerifyData(null);
    setSettleData(null);
    setConfirms([]);
    setConfirmed(false);
    // Close our modal before the wallet opens its own signing UI; some wallets
    // render in-page prompts that need to sit above the app.
    setWalletSigning(true);
    setSigning(false);
    try {
      await delay(80);
      const { BrowserWallet, Transaction } = await import("@meshsdk/core");
      const wallet = await BrowserWallet.enable(chosen);
      const tx = new Transaction({ initiator: wallet });
      tx.sendLovelace(req.payTo, req.maxAmountRequired);
      const unsigned = await tx.build();
      const signed = await wallet.signTx(unsigned); // full signed tx, ready to submit
      setWalletSigning(false);
      setCoin(true); // a coin flies into the machine

      // ── S3 · VALIDATE ──────────────────────────────────────────────
      // The facilitator decodes the signed tx and checks it pays the right
      // amount to the right address (no chain call yet). Surface the real POST.
      setStage("verify");
      setVerifyData({ reqBody: signed });
      await delay(VERIFY_REQUEST_DWELL_MS); // let the request register before its reply lands
      const vr = await fetch("/api/x402/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transaction: signed }),
      });
      const vb = (await vr.json()) as { isValid?: boolean; invalidReason?: string };
      setVerifyData({ reqBody: signed, status: vr.status, resp: vb });
      if (!vb.isValid) throw new Error(vb.invalidReason || "Payment failed verification");
      await delay(VERIFY_RESULT_DWELL_MS); // dwell so the validation result is readable

      // ── S4a · SETTLE (broadcast) ───────────────────────────────────
      // The resource server re-verifies, then broadcasts to mainnet via Blockfrost.
      setStage("settle");
      const xPayment = btoa(
        JSON.stringify({ x402Version: 1, scheme: "exact", network: req.network ?? "cardano:mainnet", payload: { transaction: signed } })
      );
      setSettleData({ xPayment });
      await delay(SETTLE_REQUEST_DWELL_MS);
      const r = await fetch(ENDPOINT, { method: "GET", cache: "no-store", headers: { "X-PAYMENT": xPayment } });
      const body = (await r.json()) as { error?: string; detail?: unknown; payment?: PaymentResponse };
      const pr = r.headers.get("x-payment-response");
      // prefer the X-PAYMENT-RESPONSE header; fall back to the body (in case a
      // proxy strips custom headers) so a real settlement is never lost.
      let payment: PaymentResponse | null = null;
      try {
        payment = pr ? (JSON.parse(atob(pr)) as PaymentResponse) : null;
      } catch {
        payment = null;
      }
      payment = payment ?? body?.payment ?? null;
      setSettleData({ xPayment, status: r.status });
      if (!r.ok || !payment?.success) {
        const detail = typeof body?.detail === "string" ? body.detail : body?.detail ? JSON.stringify(body.detail) : "";
        throw new Error([body?.error, detail].filter(Boolean).join(" — ") || "Settlement failed");
      }
      const settledHash = typeof payment.transaction === "string" ? payment.transaction : null;
      setTxHash(settledHash);
      setResult({ status: r.status, body, payment });
      await delay(SETTLE_RESULT_DWELL_MS); // dwell on the on-chain receipt

      // ── S4b · CONFIRM ──────────────────────────────────────────────
      // Submission ≠ confirmation. Poll the chain until the tx lands in a block;
      // a 404 just means "accepted, not yet mined". Each poll is shown live.
      setStage("confirm");
      if (settledHash) {
        // ~24 polls × 6s ≈ 144s — comfortably past the 120s maxTimeoutSeconds,
        // and ~3 checks per ~20s Cardano block (not a flood).
        for (let n = 1; n <= 24; n++) {
          let c: { found?: boolean; confirmations?: number; blockHeight?: number; error?: string } = { found: false };
          try {
            const cr = await fetch(`/api/x402/confirm?hash=${settledHash}`, { cache: "no-store" });
            c = await cr.json();
          } catch {
            c = { found: false };
          }
          if (c.found) {
            setConfirms((prev) => [...prev, { n, found: true, confirmations: c.confirmations, block: c.blockHeight }]);
            setConfirmed(true);
            break;
          }
          setConfirms((prev) => [...prev, { n, found: false }]);
          if (c.error) break; // upstream error / rate-limited — stop hammering Blockfrost
          await delay(6000);
        }
      }
      await delay(CONFIRM_RESULT_DWELL_MS); // let the confirmation settle in before dispensing

      // ── S5 · DISPENSE ──────────────────────────────────────────────
      setStage("done");
      await delay(DISPENSE_DWELL_MS);
      setVended(true);
      shake();
    } catch (e) {
      console.error("[x402] payment error:", e);
      const msg = errText(e);
      setWalletSigning(false);
      setSigning(false);
      // user-declined signing shouldn't read like a crash
      setError(/declin|cancel|user|reject|no longer/i.test(msg) ? "Payment cancelled in your wallet." : msg);
      setStage("choose");
    }
  }

  async function mockTransaction() {
    if (stage !== "choose" || mocking || walletSigning) return;
    const req = acc;
    const network = req?.network ?? "cardano:mainnet";
    const xPayment = btoa(
      JSON.stringify({
        x402Version: 1,
        scheme: req?.scheme ?? "exact",
        network,
        payload: { transaction: MOCK_SIGNED_TX, mode: "mock" },
      })
    );

    setError(null);
    setSigning(false);
    setWalletSigning(false);
    setMocking(true);
    setMockMode(true);
    setChosen(MOCK_WALLET_ID);
    setVerifyData(null);
    setSettleData(null);
    setConfirms([]);
    setConfirmed(false);
    setTxHash(null);
    setResult(null);
    setVended(false);
    setCoin(true);

    try {
      setStage("verify");
      setVerifyData({ reqBody: MOCK_SIGNED_TX });
      await delay(VERIFY_REQUEST_DWELL_MS);
      setVerifyData({
        reqBody: MOCK_SIGNED_TX,
        status: 200,
        resp: {
          isValid: true,
          mode: "mock",
          checks: ["amount", "recipient", "signature"],
        },
      });
      await delay(VERIFY_RESULT_DWELL_MS);

      setStage("settle");
      setSettleData({ xPayment });
      await delay(SETTLE_REQUEST_DWELL_MS);
      setSettleData({ xPayment, status: 200 });
      const payment: PaymentResponse = { success: true, network, transaction: MOCK_TX_HASH };
      setTxHash(MOCK_TX_HASH);
      setResult({
        status: 200,
        body: {
          ok: true,
          snack: "dispensed",
          mode: "mock",
          payment,
        },
        payment,
      });
      await delay(SETTLE_RESULT_DWELL_MS);

      setStage("confirm");
      setConfirms([{ n: 1, found: false }]);
      await delay(900);
      setConfirms((prev) => [...prev, { n: 2, found: true, confirmations: 1, block: 9876543 }]);
      setConfirmed(true);
      await delay(CONFIRM_RESULT_DWELL_MS);

      setStage("done");
      await delay(DISPENSE_DWELL_MS);
      setVended(true);
      shake();
    } catch {
      setError("Mock transaction failed.");
      setMockMode(false);
      setChosen(null);
      setStage("choose");
    } finally {
      setMocking(false);
    }
  }

  const acc = (resp?.body as { accepts?: PaymentReq[] })?.accepts?.[0];
  const walletName = mockMode ? "Mock wallet" : wallets.find((w) => w.id === chosen)?.name || chosen || "wallet";
  const walletIcon = mockMode ? undefined : wallets.find((w) => w.id === chosen)?.icon;

  // what the machine says — keep the 402 bubble scoped to step 1
  const machineResp = result
    ? { code: "200", name: "OK", ok: true }
    : resp && focusIndex === 0
      ? { code: String(resp.status), name: resp.status === 402 ? "Payment Required" : "Response", ok: false }
      : null;

  return (
    <section className="pt-[140px] pb-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#FA008C] mb-3">
          Agent Payments
        </p>
        <h1 className="mx-auto text-[40px] md:text-[64px] font-normal leading-[1.15] text-black max-w-[860px]">
          Try x402 on Cardano with our virtual vending machine.
        </h1>

        <div className="relative w-full mt-10 border border-black/[0.04] bg-white hover:border-black/10 transition-colors">
          <div className="px-6 py-9 md:px-10 md:py-12">
            {/* intro — collapses once the first request runs */}
            <div
              className={`overflow-hidden text-center mb-6 transition-opacity duration-[550ms] ease-[cubic-bezier(.6,0,.3,1)] ${
                started ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: PINK }}>
                Run it yourself
              </p>
              <p className="mx-auto mt-2 text-[15px] md:text-[16px] text-[#5b5b5b] leading-[1.6] max-w-[540px]">
                Every step below is a real request. Run them one at a time and watch the machine react.
              </p>
            </div>

            <div className="flex flex-col items-center lg:flex-row lg:justify-center lg:items-start">
              {/* ── runnable steps, inside a focal window ── */}
              <div className="relative order-2 lg:order-1 w-full lg:w-[700px] flex-shrink-0 mt-8 lg:mt-0">
                {started && (
                  <div className="vh-nav" aria-label="Step navigation">
                    <button
                      type="button"
                      className="vh-nav-btn"
                      onClick={() => setFocusIndex((i) => Math.max(0, i - 1))}
                      disabled={focusIndex <= 0}
                      aria-label="Earlier step"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M4 10 L8 6 L12 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <span className="vh-nav-label">Step {focusIndex + 1} / 5</span>
                    <button
                      type="button"
                      className="vh-nav-btn"
                      onClick={() => setFocusIndex((i) => Math.min(activeIndex, i + 1))}
                      disabled={focusIndex >= activeIndex}
                      aria-label="Later step"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6 L8 10 L12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                <div ref={winRef} className="vh-stepswin" style={winH ? { height: winH } : undefined}>
                  <div ref={stepsRef} className="vh-steps-track w-full lg:w-[652px] lg:mr-12 text-left" style={{ transform: `translateY(${stepsY}px)` }}>
                    <Steps
                      resp={resp}
                      wallets={wallets}
                      chosen={chosen}
                      onSelectWallet={selectWallet}
                      onRunRequest={runRequest}
                      onMockTransaction={mockTransaction}
                      walletSigning={walletSigning}
                      mocking={mocking}
                      mockMode={mockMode}
                      busy={busy}
                      started={started}
                      stage={stage}
                      txHash={txHash}
                      result={result}
                      acc={acc}
                      error={error}
                      verifyData={verifyData}
                      settleData={settleData}
                      confirms={confirms}
                      confirmed={confirmed}
                    />
                  </div>
                </div>
              </div>

              {/* ── machine: a fixed, reactive display the steps slide past ── */}
              <div className="order-1 lg:order-2 flex-shrink-0 lg:self-start">
                <div className="relative mx-auto select-none aspect-square w-[260px] sm:w-[340px] lg:w-[400px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={MACHINE_IMG}
                    alt="x402 virtual vending machine"
                    draggable={false}
                    onAnimationEnd={() => setShaking(false)}
                    className={`absolute inset-0 w-full h-full object-contain ${shaking ? "vh-shake" : ""}`}
                  />

                  {/* the machine's reply — a speech bubble popping out of it */}
                  {machineResp && (
                    <div key={machineResp.code} className="resp-bubble resp-bubble-machine vh-bubble">
                      <div className="resp-bubble-inner">
                        <span className="resp-code" data-ok={machineResp.ok}>{machineResp.code}</span>
                        <span className="resp-name">{machineResp.name}</span>
                      </div>
                      <span className="resp-tail" />
                    </div>
                  )}

                  {/* a coin flies into the machine's slot the moment you sign & pay */}
                  {coin && (
                    <div className="vh-coin" onAnimationEnd={() => setCoin(false)}>
                      <CoinSvg />
                    </div>
                  )}

                  {/* dispenser glow + the snack that drops out on a successful vend */}
                  {vended && (
                    <>
                      <span
                        className="vh-flash absolute rounded-full pointer-events-none"
                        style={{ left: "35%", top: "85%", width: "46%", height: "20%", transform: "translate(-50%,-50%)", background: "radial-gradient(closest-side, rgba(250,0,140,0.85), rgba(250,0,140,0.25) 55%, transparent)" }}
                      />
                      <div
                        className="vh-drink absolute pointer-events-none"
                        style={{ left: "35%", top: "83%", width: "16%", transform: "translate(-50%,-50%)", zIndex: 20 }}
                      >
                        <SnackCan />
                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>
          </div>

          {/* ── wallet signing prompt ── */}
          {signing && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
              <button
                aria-label="Close"
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px] disabled:cursor-wait"
                disabled={walletSigning}
                onClick={() => setSigning(false)}
              />
              <div className="vh-pop relative w-full max-w-[420px] rounded-2xl bg-white border border-black/10 shadow-[0_24px_60px_rgba(0,0,0,0.22)] p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5f5f6] border border-black/[0.06] overflow-hidden">
                    {walletIcon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={walletIcon} alt="" className="h-6 w-6" />
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="#0a0a0a" strokeWidth="1.6" /><path d="M3 9h18" stroke="#0a0a0a" strokeWidth="1.6" /><circle cx="16.5" cy="13.5" r="1.4" fill={PINK} /></svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#999] capitalize">{walletName}</p>
                    <p className="text-[16px] font-medium text-[#0a0a0a]">Signature request</p>
                  </div>
                </div>
                <p className="mt-4 text-[13px] leading-[1.55] text-[#5b5b5b]">
                  This is a <b className="text-black font-medium">real Cardano mainnet</b> payment. Your
                  wallet will build and sign the transaction — then the facilitator submits it on-chain.
                </p>
                <dl className="mt-4 rounded-xl bg-[#f7f7f8] border border-black/[0.06] p-3.5 text-[12px] font-mono">
                  <SignRow k="Amount" v={adaFromLovelace(acc?.maxAmountRequired) || "1 ADA"} strong />
                  <SignRow k="To" v={shortAddr(acc?.payTo)} />
                  <SignRow k="Network" v="Cardano mainnet" last />
                </dl>
                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSigning(false)}
                    disabled={walletSigning}
                    className="text-[13px] font-medium px-4 py-2 rounded-full text-[#555] hover:bg-black/[0.04] transition disabled:cursor-wait disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={signAndPay}
                    disabled={walletSigning}
                    aria-busy={walletSigning}
                    className="wallet-action text-[13px] font-medium px-5 py-2 rounded-full text-white transition hover:opacity-90 disabled:hover:opacity-80"
                    style={{ background: PINK }}
                  >
                    {walletSigning && <span className="wallet-spin" aria-hidden />}
                    {walletSigning ? "Waiting for signature…" : "Sign & pay"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: VH_CSS }} />
    </section>
  );
}

/* ───────── states ───────── */

function Steps({
  resp,
  wallets,
  chosen,
  onSelectWallet,
  onRunRequest,
  onMockTransaction,
  walletSigning,
  mocking,
  mockMode,
  busy,
  started,
  stage,
  txHash,
  result,
  acc,
  error,
  verifyData,
  settleData,
  confirms,
  confirmed,
}: {
  resp: { status: number; body: unknown } | null;
  wallets: Wallet[];
  chosen: string | null;
  onSelectWallet: (id: string) => void;
  onRunRequest: () => void;
  onMockTransaction: () => void;
  walletSigning: boolean;
  mocking: boolean;
  mockMode: boolean;
  busy: boolean;
  started: boolean;
  stage: Stage;
  txHash: string | null;
  result: { status: number; body: unknown; payment: PaymentResponse | null } | null;
  acc?: PaymentReq;
  error?: string | null;
  verifyData: VerifyData | null;
  settleData: SettleData | null;
  confirms: ConfirmPoll[];
  confirmed: boolean;
}) {
  const [showResult, setShowResult] = useState(false);

  const ada = adaFromLovelace(acc?.maxAmountRequired) || "1 ADA";
  const paid = stage !== "choose";
  const reachedVerify = stage === "verify" || stage === "settle" || stage === "confirm" || stage === "done";
  const reachedSettle = stage === "settle" || stage === "confirm" || stage === "done";
  const reachedDone = stage === "done";
  const walletLabel = mockMode ? "mock wallet" : chosen || "wallet";
  const hash = txHash ?? result?.payment?.transaction ?? null;
  const verifyOk = (verifyData?.resp as { isValid?: boolean } | undefined)?.isValid === true;
  const settleOk = settleData?.status === 200;
  const st = (active: boolean, reached: boolean): NodeStatus => (active ? "active" : reached ? "done" : "pending");

  return (
    <div className="sd-machine">
      <div className="sd-init">
        <i />
        <span className="sd-init-label">start</span>
      </div>

      {/* S1 — request the resource (runnable) */}
      <Transition fired />
      <StateNode n={1} name="Payment required" status={started ? "done" : "active"}>
        <p className="msg-desc">
          Ask the machine for a snack with no payment attached. Run it — the machine refuses with{" "}
          <span className="code">402 Payment Required</span>.
        </p>
        <pre className="code-block">
          <code>curl -i https://www.masumi.network/vending-machine</code>
        </pre>
        <div className="run-slot">
          {!started && !resp ? (
            <RunButton onClick={onRunRequest} busy={busy} label="Run request" />
          ) : (
            <>
              <HttpStatus status={resp?.status ?? 0} />
              <p className="run-out-label">response body</p>
              <pre className="json-block run-response-body">
                <code>{resp ? JSON.stringify(resp.body, null, 2) : ""}</code>
              </pre>
            </>
          )}
        </div>
      </StateNode>

      {/* S2 — sign & pay */}
      <Transition label="choose how to pay" fired={started} />
      <StateNode n={2} name={paid ? (mockMode ? "Mocked payment" : "Paid") : "Sign & pay"} status={started ? st(!paid, paid) : "pending"}>
        {paid ? (
          <p className="msg-desc">
            {mockMode ? (
              <>
                Mocked a <b className="text-black font-medium">{ada}</b> Cardano payment. No wallet opened
                and no real funds moved.
              </>
            ) : (
              <>
                Paid <b className="text-black font-medium">{ada}</b> on mainnet, signed with{" "}
                <span className="text-black capitalize">{walletLabel}</span>.
              </>
            )}
          </p>
        ) : (
          <>
            <p className="msg-desc">
              Pay <b className="text-black font-medium">{ada}</b> on Cardano mainnet — connect a wallet to
              build and sign the transaction. (Real funds.)
            </p>
            {wallets.length > 0 ? (
              <div className="wallet-options">
                {wallets.map((w) => {
                  const waitingForSignature = walletSigning && chosen === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => onSelectWallet(w.id)}
                      disabled={walletSigning || mocking}
                      aria-busy={waitingForSignature}
                      className={`wallet-btn ${chosen === w.id ? "wallet-on" : ""}`}
                    >
                      {w.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={w.icon} alt="" width={16} height={16} className="w-4 h-4 rounded" />
                      ) : null}
                      <span className="capitalize">{w.name}</span>
                      {waitingForSignature && <span className="wallet-btn-spin" aria-hidden />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2.5 text-[13px] text-[#8a8a8a]">
                No Cardano wallet detected — install one (Eternl, Lace, Begin, Vespr…) and reload.
              </p>
            )}
            {wallets.length > 0 && (
              <div className="wallet-or" aria-hidden>
                <span>Or</span>
              </div>
            )}
            <div className="mock-wallet-wrap">
              <button
                type="button"
                onClick={onMockTransaction}
                disabled={walletSigning || mocking}
                aria-busy={mocking}
                className="mock-wallet-btn"
              >
                {mocking ? <span className="wallet-btn-spin" aria-hidden /> : null}
                <span className="mock-wallet-label">
                  {mocking ? "Mocking transaction..." : "I don't have a Cardano wallet - mock the transaction"}
                </span>
              </button>
              <p className="mock-note">
                Runs the same visual flow with simulated payment data. No wallet opens and no funds move.
              </p>
            </div>
            {error && <p className="pay-error">{error}</p>}
          </>
        )}
      </StateNode>

      {/* S3 — facilitator validates (its own step) */}
      <Transition label="POST /verify" fired={reachedVerify} />
      <StateNode
        n={3}
        name={stage === "verify" ? "Validating" : reachedVerify ? "Validated" : "Validate"}
        status={st(stage === "verify", reachedVerify)}
      >
        {reachedVerify && (
          <>
            <p className="msg-desc">
              {mockMode
                ? "The mock facilitator checks the simulated transaction against the same amount, recipient, and signature requirements."
                : "The facilitator decodes your signed transaction and confirms it really pays the right amount to the right address - before anything is broadcast."}
            </p>
            {verifyData && (
              <>
                <pre className="code-block">
                  <code>{`POST /api/x402/verify\ncontent-type: application/json\n\n{ "transaction": "${truncMid(verifyData.reqBody, 28, 8)}" }`}</code>
                </pre>
                {verifyData.resp ? (
                  <>
                    <p className="run-out-label">{verifyData.status ?? 200} · verification</p>
                    <pre className="json-block">
                      <code>{JSON.stringify(verifyData.resp, null, 2)}</code>
                    </pre>
                  </>
                ) : (
                  <p className="run-out-label vh-dots">waiting for the facilitator</p>
                )}
              </>
            )}
            {verifyOk && (
              <div className="mt-2.5">
                <Tick i={0} label="Amount" detail={`≥ ${ada}`} />
                <Tick i={1} label="Recipient" detail={shortAddr(acc?.payTo)} />
                <Tick i={2} label="Signature" detail={mockMode ? "mocked" : "present"} />
              </div>
            )}
          </>
        )}
      </StateNode>

      {/* S4 — settle (broadcast) then confirm on-chain */}
      <Transition label="valid" fired={reachedSettle} />
      <StateNode
        n={4}
        name={stage === "confirm" ? "Confirming" : stage === "settle" ? "Settling" : reachedDone ? "Settled" : "Settle"}
        status={st(stage === "settle" || stage === "confirm", reachedSettle)}
      >
        {reachedSettle && (
          <>
            <p className="msg-desc">
              {mockMode
                ? "The client retries the request with a simulated X-PAYMENT header. The mock facilitator accepts it so you can see the full x402 flow."
                : "The client retries the request with the signed payment attached. The facilitator re-verifies, then broadcasts the transaction to Cardano mainnet via Blockfrost."}
            </p>
            {settleData && (
              <pre className="code-block">
                <code>{`GET /vending-machine\nX-PAYMENT: ${truncMid(settleData.xPayment, 30, 8)}`}</code>
              </pre>
            )}
            {settleOk ? (
              <>
                <div className="mt-2.5">
                  <Tick i={0} label={mockMode ? "Simulated Cardano submission" : "Submitted to Cardano mainnet"} />
                  <Tick i={1} label={mockMode ? "Accepted by the mock network" : "Accepted by the network"} />
                </div>
                {hash && mockMode ? (
                  <span className="hash-chip">
                    <span className="hash-k">tx</span>
                    <span className="hash-v">{shortHash(hash)}</span>
                    <span className="hash-ext">mock</span>
                  </span>
                ) : hash ? (
                  <a className="hash-chip" href={`https://cardanoscan.io/transaction/${hash}`} target="_blank" rel="noopener noreferrer">
                    <span className="hash-k">tx</span>
                    <span className="hash-v">{shortHash(hash)}</span>
                    <span className="hash-ext">Cardanoscan ↗</span>
                  </a>
                ) : null}
              </>
            ) : (
              <p className="run-out-label vh-dots">broadcasting to the network</p>
            )}
            {(stage === "confirm" || stage === "done") && hash && (
              <ConfirmCheck hash={hash} confirms={confirms} confirmed={confirmed} active={stage === "confirm"} mockMode={mockMode} />
            )}
          </>
        )}
      </StateNode>

      {/* S5 — dispensed (accepting state) */}
      <Transition label={confirmed ? "confirmed" : "settled"} fired={reachedDone} />
      <StateNode n={5} name="Dispensed" status={reachedDone ? "done" : "pending"} final>
        {reachedDone && (
          <>
            <p className="msg-desc">
              {mockMode ? (
                <>
                  Mocked and accepted - the machine returns your snack with a <span className="code">200 OK</span>.
                  No real funds moved.
                </>
              ) : confirmed ? (
                <>
                  Paid and confirmed on-chain — the machine returns your snack with a <span className="code">200 OK</span>.
                </>
              ) : (
                <>
                  Paid and accepted by the network — the machine returns your snack with a <span className="code">200 OK</span>.
                  On-chain confirmation is still settling.
                </>
              )}
            </p>
            <div className="result vh-seq" style={{ animationDelay: "80ms" }}>
              <div className="result-row"><span className="result-k">status</span><span className="result-v">success</span></div>
              <div className="result-row">
                <span className="result-k">network</span>
                <span className="result-v">{result?.payment?.network ?? "cardano:mainnet"}{mockMode ? " (mock)" : ""}</span>
              </div>
              <div className="result-row">
                <span className="result-k">transaction</span>
                {hash && mockMode ? (
                  <span className="result-v">{shortHash(hash)} (mock)</span>
                ) : hash ? (
                  <a className="result-v result-link" href={`https://cardanoscan.io/transaction/${hash}`} target="_blank" rel="noopener noreferrer">
                    {shortHash(hash)} ↗
                  </a>
                ) : (
                  <span className="result-v">—</span>
                )}
              </div>
            </div>
            <div className="vend-cue">
              <SnackMini />
              <span>your snack drops into the tray</span>
              <span className="arrow">→</span>
            </div>
            <Toggle open={showResult} onClick={() => setShowResult(!showResult)} label="Full 200 response" />
            <div />

            {showResult && result && (
              <pre className="json-block">
                <code>{JSON.stringify(result.body, null, 2)}</code>
              </pre>
            )}
          </>
        )}
      </StateNode>
    </div>
  );
}

function HttpStatus({ status }: { status: number }) {
  const isPaymentRequired = status === 402;
  return (
    <div className="http-status vh-seq" role="status" aria-live="polite">
      <div className="http-status-code">{status || "ERR"}</div>
      <div className="http-status-meta">
        <div className="http-status-k">HTTP response type</div>
        <div className="http-status-v">
          {isPaymentRequired ? "402 Payment Required" : status ? `${status} Response` : "Network error"}
        </div>
      </div>
    </div>
  );
}

function RunButton({ onClick, busy, label }: { onClick: () => void; busy: boolean; label: string }) {
  return (
    <div>
      <button onClick={onClick} disabled={busy} className="run-btn">
        {busy ? (
          <span className="run-spin" />
        ) : (
          <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor" aria-hidden>
            <path d="M1 1.2 L10 6 L1 10.8 Z" />
          </svg>
        )}
        {busy ? "Running…" : label}
      </button>
    </div>
  );
}

function Toggle({ open, onClick, label }: { open: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`tgl ${open ? "tgl-open" : ""}`}>
      <svg className="tgl-chev" width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="M3.5 1.5 L7 5 L3.5 8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}

function Tick({ label, detail, i }: { label: string; detail?: string; i: number }) {
  return (
    <div className="tick-row vh-seq" style={{ animationDelay: `${140 + i * 150}ms` }}>
      <span className="tick">✓</span>
      <span className="tick-label">{label}</span>
      {detail && <span className="tick-detail">{detail}</span>}
    </div>
  );
}

// Settlement only proves the tx was accepted into the mempool. This polls the
// chain (via the facilitator) until it lands in a block, showing each real check.
function ConfirmCheck({
  hash,
  confirms,
  confirmed,
  active,
  mockMode,
}: {
  hash: string;
  confirms: ConfirmPoll[];
  confirmed: boolean;
  active: boolean;
  mockMode: boolean;
}) {
  const recent = confirms.slice(-3);
  const conf = confirms.find((p) => p.found);
  const short = shortHash(hash);
  // active poll → checking; resolved → confirmed; ran out of polls → pending
  const title = mockMode
    ? confirmed
      ? "Mock confirmation complete"
      : active
        ? "Simulating confirmation..."
        : "Mock confirmation pending"
    : confirmed
      ? "Confirmed on-chain"
      : active
        ? "Checking for confirmations…"
        : "Confirmation pending";
  return (
    <div className="confirm-box" role="status" aria-live="polite">
      <div className="confirm-head">
        {confirmed ? (
          <span className="confirm-badge ok" aria-hidden>✓</span>
        ) : active ? (
          <span className="confirm-spin" aria-hidden />
        ) : (
          <span className="confirm-badge" aria-hidden />
        )}
        <span className="confirm-title">{title}</span>
        {!confirmed && confirms.length > 0 && <span className="confirm-attempt">poll {confirms.length}</span>}
      </div>
      {/* the browser polls our own route; the facilitator queries Blockfrost
          server-side, so the metered key is never exposed to the client */}
      <pre className="code-block confirm-code">
        <code>
          {mockMode
            ? `GET /api/x402/confirm?hash=${short}\n    ↳ simulated confirmation ledger`
            : `GET /api/x402/confirm?hash=${short}\n    ↳ facilitator → blockfrost.io/api/v0/txs/${short}`}
        </code>
      </pre>
      {recent.length > 0 && (
        <div className="confirm-log">
          {recent.map((p) => (
            <div key={p.n} className="confirm-row">
              <span className="confirm-n">#{p.n}</span>
              {p.found ? (
                <span className="confirm-found">
                  200 · {mockMode ? "mock block" : "in block"}{p.block ? ` #${p.block.toLocaleString()}` : ""} · {p.confirmations ?? 1} confirmation
                  {(p.confirmations ?? 1) === 1 ? "" : "s"}
                </span>
              ) : (
                <span className="confirm-pending">{mockMode ? "202 · waiting in mock mempool" : "404 · not yet in a block"}</span>
              )}
            </div>
          ))}
        </div>
      )}
      {confirmed && conf && (
        <p className="confirm-done vh-seq">
          {mockMode ? "Mock block" : "Block"} {conf.block ? `#${conf.block.toLocaleString()}` : "found"} · {conf.confirmations ?? 1} confirmation
          {(conf.confirmations ?? 1) === 1 ? "" : "s"} — releasing your snack.
        </p>
      )}
    </div>
  );
}

// One transition arrow between two states, carrying the event that fires it.
function Transition({ label, fired }: { label?: string; fired?: boolean }) {
  return (
    <div className={`sd-trans ${fired ? "fired" : "pending"}`}>
      {label && <span className="sd-tlabel">{label}</span>}
    </div>
  );
}

// One state in the payment's lifecycle: pending (dashed, collapsed), current
// (pink, pulsing) or done (checked). The final state gets an accepting ring.
function StateNode({
  n,
  name,
  status,
  final,
  children,
}: {
  n: number;
  name: string;
  status: NodeStatus;
  final?: boolean;
  children?: ReactNode;
}) {
  const active = status === "active";
  const pending = status === "pending";
  return (
    <div className={`sd-node sd-${status}${final ? " sd-final" : ""}`}>
      <div className="sd-head">
        <span className="sd-num">S{n}</span>
        <span className="sd-name">{name}</span>
        {active ? (
          <span className="sd-cur">current</span>
        ) : status === "done" ? (
          <span className="sd-badge done">✓</span>
        ) : (
          <span className="sd-badge pending" />
        )}
      </div>
      {!pending && <div className="sd-body">{children}</div>}
    </div>
  );
}

function SignRow({ k, v, strong, last }: { k: string; v: string; strong?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${last ? "" : "mb-1.5"}`}>
      <span className="text-[#999]">{k}</span>
      <span className={strong ? "text-[#0a0a0a] font-semibold" : "text-[#0a0a0a]"}>{v}</span>
    </div>
  );
}

function CoinSvg() {
  return (
    <svg viewBox="0 0 40 40" width="100%" aria-hidden style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.32))" }}>
      <defs>
        <linearGradient id="vhcoin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe79a" />
          <stop offset="0.5" stopColor="#f5c23e" />
          <stop offset="1" stopColor="#d99a25" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18.5" fill="url(#vhcoin)" stroke="#a9761a" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      <text x="20" y="26.5" textAnchor="middle" fontSize="17" fontWeight="700" fill="#8a5e0f" fontFamily="ui-sans-serif, system-ui">
        ₳
      </text>
    </svg>
  );
}

function SnackMini() {
  return (
    <svg width="13" height="18" viewBox="0 0 44 72" aria-hidden>
      <rect x="8" y="7" width="28" height="58" rx="7" fill="#fff" stroke="#0a0a0a" strokeWidth="2.5" />
      <rect x="8.8" y="28" width="26.4" height="17" fill={PINK} />
    </svg>
  );
}

function SnackCan() {
  return (
    <svg viewBox="0 0 44 72" width="100%" aria-hidden style={{ filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.45)) drop-shadow(0 0 7px rgba(250,0,140,0.55))" }}>
      <defs>
        <linearGradient id="vhcan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ececed" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfcfd4" />
        </linearGradient>
      </defs>
      <rect x="8" y="7" width="28" height="58" rx="7" fill="url(#vhcan)" stroke="#0a0a0a" strokeWidth="1.5" />
      <rect x="8.8" y="27" width="26.4" height="19" fill={PINK} />
      <ellipse cx="22" cy="9" rx="13.6" ry="3.2" fill="#dededf" stroke="#0a0a0a" strokeWidth="1.2" />
      <text x="22" y="40.5" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#fff" fontFamily="ui-monospace, monospace">
        x402
      </text>
    </svg>
  );
}

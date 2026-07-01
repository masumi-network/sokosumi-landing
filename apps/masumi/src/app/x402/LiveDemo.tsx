"use client";

import { useCallback, useEffect, useState } from "react";

type CardanoWalletApi = {
  getNetworkId: () => Promise<number>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses?: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  signData: (
    addr: string,
    payload: string
  ) => Promise<{ signature: string; key: string }>;
};

type CardanoWallet = {
  name: string;
  icon?: string;
  apiVersion?: string;
  enable: () => Promise<CardanoWalletApi>;
};

// Read window.cardano via a local cast — a global `declare` here would clash
// with the Mesh SDK's own Window.cardano typing.
const cardanoWallets = (): Record<string, CardanoWallet> | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window as unknown as { cardano?: Record<string, CardanoWallet> }).cardano;

type Requirements = {
  x402Version: 2;
  error: string;
  resource: { url: string; description: string; mimeType: string };
  accepts: Array<{
    scheme: "exact";
    network: string;
    amount: string;
    asset: string;
    payTo: string;
    maxTimeoutSeconds: number;
    extra: Record<string, unknown>;
  }>;
};

const ENDPOINT = "/api/x402/demo";

function shortAddr(addr: string, head = 12, tail = 8): string {
  if (!addr) return "";
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

function toHex(s: string): string {
  return Array.from(new TextEncoder().encode(s))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function b64encode(s: string): string {
  if (typeof window === "undefined") return "";
  return btoa(unescape(encodeURIComponent(s)));
}

function b64decode(s: string): string {
  if (typeof window === "undefined") return "";
  try {
    return decodeURIComponent(escape(atob(s)));
  } catch {
    return "";
  }
}

export default function LiveDemo() {
  const [step1Resp, setStep1Resp] = useState<{ status: number; body: Requirements | null } | null>(null);
  const [wallets, setWallets] = useState<{ id: string; wallet: CardanoWallet }[]>([]);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [api, setApi] = useState<CardanoWalletApi | null>(null);
  const [address, setAddress] = useState("");
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [signature, setSignature] = useState<{ signature: string; key: string } | null>(null);
  const [paymentHeader, setPaymentHeader] = useState<string>("");
  const [step2Resp, setStep2Resp] = useState<{ status: number; body: unknown; paymentResponse: unknown | null } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const detect = () => {
      const cardano = cardanoWallets();
      if (!cardano) return;
      const found: { id: string; wallet: CardanoWallet }[] = [];
      for (const key of Object.keys(cardano)) {
        const w = cardano[key];
        if (w && typeof w.enable === "function") found.push({ id: key, wallet: w });
      }
      setWallets(found);
    };
    detect();
    const id = setInterval(detect, 800);
    const stop = setTimeout(() => clearInterval(id), 5000);
    return () => { clearInterval(id); clearTimeout(stop); };
  }, []);

  const sendUnpaid = useCallback(async () => {
    setError("");
    setBusy(true);
    try {
      const r = await fetch(ENDPOINT, { method: "GET", cache: "no-store" });
      const body = (await r.json()) as Requirements;
      setStep1Resp({ status: r.status, body });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }, []);

  // Auto-fire the unpaid request on mount so the 402 is the first thing visible.
  useEffect(() => { void sendUnpaid(); }, [sendUnpaid]);

  async function connectWallet(id: string) {
    setError("");
    setBusy(true);
    try {
      const w = cardanoWallets()?.[id];
      if (!w) throw new Error("Wallet not found");
      const enabled = await w.enable();
      const net = await enabled.getNetworkId();
      let addrs = await enabled.getUsedAddresses();
      if ((!addrs || addrs.length === 0) && enabled.getUnusedAddresses) {
        addrs = await enabled.getUnusedAddresses();
      }
      if (!addrs || addrs.length === 0) addrs = [await enabled.getChangeAddress()];
      setApi(enabled);
      setWalletId(id);
      setNetworkId(net);
      setAddress(addrs[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to connect to wallet");
    } finally {
      setBusy(false);
    }
  }

  async function signAndRetry() {
    if (!api || !address || !step1Resp?.body) return;
    setError("");
    setBusy(true);
    try {
      const accepted = step1Resp.body.accepts[0];

      // CIP-8 sign of a canonical authorisation message. In production this
      // field is the base64-encoded signed Cardano tx CBOR from wallet.signTx().
      const authMessage = `x402:${accepted.network}:${accepted.amount}:${accepted.asset}:${accepted.payTo}`;
      const sig = await api.signData(address, toHex(authMessage));
      setSignature(sig);

      // Construct the PAYMENT-SIGNATURE payload per spec.
      const paymentSignature = {
        x402Version: 2,
        resource: step1Resp.body.resource,
        accepted,
        payload: {
          // Demo: COSE_Sign1 signature substitutes for the signed-tx CBOR.
          transaction: sig.signature,
          // Demo nonce. A real client supplies an unspent UTXO it owns.
          nonce: "662cbf645fcd8914eb89115b83970a950493dd2fbaf39dea3b96e8cbdc132939#0",
        },
      };
      const headerValue = b64encode(JSON.stringify(paymentSignature));
      setPaymentHeader(headerValue);

      // Retry the request with the header.
      const r = await fetch(ENDPOINT, {
        method: "GET",
        cache: "no-store",
        headers: { "PAYMENT-SIGNATURE": headerValue },
      });
      const body = await r.json();
      const pr = r.headers.get("payment-response");
      const paymentResponse = pr ? JSON.parse(b64decode(pr)) : null;
      setStep2Resp({ status: r.status, body, paymentResponse });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signing was cancelled");
    } finally {
      setBusy(false);
    }
  }

  // No-wallet path: build a well-formed PAYMENT-SIGNATURE with a synthetic
  // transaction and run the SAME real round-trip. The endpoint's four checks are
  // genuinely exercised; only the signature is mock (the real-wallet path is also
  // only a CIP-8 stand-in here, so the honesty boundary is identical).
  async function mockPayAndRetry() {
    if (!step1Resp?.body) return;
    setError("");
    setBusy(true);
    try {
      const accepted = step1Resp.body.accepts[0];
      const paymentSignature = {
        x402Version: 2,
        resource: step1Resp.body.resource,
        accepted,
        payload: {
          transaction: `mock-no-wallet-signature-${accepted.payTo.slice(-8)}`,
          nonce: "662cbf645fcd8914eb89115b83970a950493dd2fbaf39dea3b96e8cbdc132939#0",
        },
      };
      const headerValue = b64encode(JSON.stringify(paymentSignature));
      setSignature({ signature: paymentSignature.payload.transaction, key: "mock" });
      setPaymentHeader(headerValue);

      const r = await fetch(ENDPOINT, {
        method: "GET",
        cache: "no-store",
        headers: { "PAYMENT-SIGNATURE": headerValue },
      });
      const body = await r.json();
      const pr = r.headers.get("payment-response");
      const paymentResponse = pr ? JSON.parse(b64decode(pr)) : null;
      setStep2Resp({ status: r.status, body, paymentResponse });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mock request failed");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setSignature(null);
    setPaymentHeader("");
    setStep2Resp(null);
    setError("");
    void sendUnpaid();
  }

  const netLabel = networkId === 1 ? "mainnet" : networkId === 0 ? "testnet" : "—";
  const networkOk = !!networkId !== null && (
    step1Resp?.body?.accepts[0].network === "cardano:preprod" ? networkId === 0 :
    step1Resp?.body?.accepts[0].network === "cardano:mainnet" ? networkId === 1 : true
  );

  return (
    <div className="bg-[#0a0a0a] overflow-hidden font-mono text-[12.5px] text-white/85 leading-[1.65]">
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.06]">
        <span className="text-[10.5px] text-white/30 tracking-widest uppercase">x402 playground · live</span>
        {(step2Resp || signature) && (
          <button onClick={reset} className="text-[10.5px] text-white/40 hover:text-white transition-colors uppercase tracking-widest">
            reset
          </button>
        )}
      </div>

      <div className="p-5 md:p-7 space-y-7">
        {/* ── Request 1: unpaid ── */}
        <Block>
          <Prompt cmd={`curl -i ${ENDPOINT}`} />
          {!step1Resp ? (
            <Line dim>requesting…</Line>
          ) : (
            <>
              <StatusLine status={step1Resp.status} text="Payment Required" tone="warn" />
              <Line dim>content-type: application/json</Line>
              <Line dim>&nbsp;</Line>
              {step1Resp.body && <JsonBlock value={step1Resp.body} />}
            </>
          )}
        </Block>

        {/* ── Action: wallet ── */}
        {step1Resp?.body && !step2Resp && (
          <Block dim>
            <Comment>$ # connect a CIP-30 wallet to construct PAYMENT-SIGNATURE</Comment>
            {!api ? (
              <>
                {wallets.length === 0 ? (
                  <Line className="text-white/60">
                    No CIP-30 wallet detected. Install{" "}
                    <a className="text-[#FA008C] underline" href="https://www.lace.io/" target="_blank" rel="noopener noreferrer">Lace</a>
                    {", "}
                    <a className="text-[#FA008C] underline" href="https://eternl.io/" target="_blank" rel="noopener noreferrer">Eternl</a>
                    {" — or skip it:"}
                  </Line>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {wallets.map(({ id, wallet }) => (
                      <button
                        key={id}
                        onClick={() => connectWallet(id)}
                        disabled={busy}
                        className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:border-[#FA008C]/60 hover:bg-[#FA008C]/[0.05] transition-colors disabled:opacity-50"
                      >
                        {wallet.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={wallet.icon} alt="" width={16} height={16} className="w-4 h-4 rounded" />
                        ) : null}
                        <span className="text-[12px] text-white capitalize">{wallet.name || id}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={mockPayAndRetry}
                    disabled={busy}
                    className="bg-white text-black px-4 py-1.5 text-[12px] hover:bg-white/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {busy && <span className="w-3 h-3 rounded-full border-[1.5px] border-black/30 border-t-black animate-spin" />}
                    use a mock wallet →
                  </button>
                  <span className="text-[10.5px] text-white/35">mock signature — not a real authorization</span>
                </div>
              </>
            ) : (
              <>
                <Line><Key>wallet</Key> {walletId}</Line>
                <Line><Key>network</Key> {netLabel} {!networkOk && <span className="text-[#FFB347]">(does not match requirements)</span>}</Line>
                <Line><Key>address</Key> {shortAddr(address, 16, 10)}</Line>
                <div className="mt-3">
                  <button
                    onClick={signAndRetry}
                    disabled={busy}
                    className="bg-white text-black px-4 py-1.5 text-[12px] hover:bg-white/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {busy && <span className="w-3 h-3 rounded-full border-[1.5px] border-black/30 border-t-black animate-spin" />}
                    sign &amp; retry →
                  </button>
                </div>
              </>
            )}
          </Block>
        )}

        {/* ── Request 2: paid ── */}
        {signature && (
          <Block>
            <Comment>$ # build PAYMENT-SIGNATURE per spec §payload</Comment>
            <Line><Key>payload.transaction</Key> {signature.signature.slice(0, 56)}…</Line>
            <Line><Key>payload.nonce</Key> 662cbf64…dc132939#0</Line>
            <Line>&nbsp;</Line>
            <Prompt cmd={`curl -i -H "PAYMENT-SIGNATURE: ${paymentHeader.slice(0, 38)}…" \\\n     ${ENDPOINT}`} />
            {!step2Resp ? (
              <Line dim>retrying…</Line>
            ) : (
              <>
                <StatusLine
                  status={step2Resp.status}
                  text={step2Resp.status === 200 ? "OK" : "Payment Required"}
                  tone={step2Resp.status === 200 ? "ok" : "warn"}
                />
                {step2Resp.paymentResponse != null && (
                  <Line>
                    <Key>payment-response</Key>
                    <span className="text-white/50"> (base64 → )</span>{" "}
                    <span className="text-white/80">{JSON.stringify(step2Resp.paymentResponse)}</span>
                  </Line>
                )}
                <Line dim>content-type: application/json</Line>
                <Line dim>&nbsp;</Line>
                <JsonBlock value={step2Resp.body} />
              </>
            )}
          </Block>
        )}

        {error && (
          <Block>
            <Line className="text-[#FA140A]">error: {error}</Line>
          </Block>
        )}
      </div>
    </div>
  );
}

/* ───────── primitives ───────── */

function Block({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return <div className={dim ? "opacity-90" : ""}>{children}</div>;
}

function Prompt({ cmd }: { cmd: string }) {
  return (
    <pre className="whitespace-pre-wrap break-all">
      <span className="text-white/30">$</span>{" "}
      <span className="text-white">{cmd}</span>
    </pre>
  );
}

function StatusLine({
  status,
  text,
  tone,
}: {
  status: number;
  text: string;
  tone: "ok" | "warn" | "err";
}) {
  const color = tone === "ok" ? "#5BE49B" : tone === "warn" ? "#FA008C" : "#FA140A";
  return (
    <div className="mt-1">
      <span className="text-white/40">HTTP/1.1</span>{" "}
      <span style={{ color }}>{status}</span>{" "}
      <span className="text-white">{text}</span>
    </div>
  );
}

function Line({ children, dim, className = "" }: { children: React.ReactNode; dim?: boolean; className?: string }) {
  return <div className={`${dim ? "text-white/40" : ""} ${className}`}>{children}</div>;
}

function Comment({ children }: { children: React.ReactNode }) {
  return <div className="text-white/30">{children}</div>;
}

function Key({ children }: { children: React.ReactNode }) {
  return <span className="text-[#FA008C]">{children}</span>;
}

function JsonBlock({ value }: { value: unknown }) {
  const json = JSON.stringify(value, null, 2);
  return (
    <pre className="text-white/80 whitespace-pre-wrap break-all">
      <code>{json}</code>
    </pre>
  );
}

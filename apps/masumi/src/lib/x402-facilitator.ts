import "server-only";
import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";

// The x402 facilitator for the vending machine, on Cardano mainnet.
// verifyPayment() decodes a signed transaction and asserts it really pays the
// required amount to the machine's address (no chain call). submitToMainnet()
// broadcasts it via Blockfrost.

export const PAY_TO =
  "addr1q9wapm42u20tlr86jwh7sdcm7frlev8t2dul82jg9yrskra9wx4mex0c3puhjrl794v677cdchz2rj47d62c9esdcjgs30nt5z";
export const MIN_LOVELACE = BigInt(1_000_000); // 1 ADA
export const NETWORK = "cardano:mainnet";
const BLOCKFROST = "https://cardano-mainnet.blockfrost.io/api/v0";

export type VerifyResult = {
  valid: boolean;
  reason?: string;
  paidLovelace: string; // total sent to PAY_TO by this tx
  signed: boolean;
};

// Decode the signed CBOR and confirm an output of >= MIN_LOVELACE to PAY_TO,
// and that the transaction carries at least one signature.
export function verifyPayment(signedTxHex: string): VerifyResult {
  let tx: CSL.Transaction;
  try {
    tx = CSL.Transaction.from_bytes(Buffer.from(signedTxHex, "hex"));
  } catch {
    return { valid: false, reason: "Could not decode the transaction", paidLovelace: "0", signed: false };
  }

  let total = BigInt(0);
  try {
    const outputs = tx.body().outputs();
    for (let i = 0; i < outputs.len(); i++) {
      const out = outputs.get(i);
      let bech: string;
      try {
        bech = out.address().to_bech32();
      } catch {
        continue;
      }
      if (bech === PAY_TO) total += BigInt(out.amount().coin().to_str());
    }
  } catch {
    return { valid: false, reason: "Could not read the transaction outputs", paidLovelace: "0", signed: false };
  }

  const vkeys = tx.witness_set().vkeys();
  const signed = !!vkeys && vkeys.len() > 0;

  if (!signed) return { valid: false, reason: "Transaction is not signed", paidLovelace: total.toString(), signed };
  if (total < MIN_LOVELACE) {
    return {
      valid: false,
      reason: `Pays ${total} lovelace to the machine, requires ${MIN_LOVELACE}`,
      paidLovelace: total.toString(),
      signed,
    };
  }
  return { valid: true, paidLovelace: total.toString(), signed };
}

export const BLOCKFROST_TX_URL = (hash: string) => `${BLOCKFROST}/txs/${hash}`;

export type ConfirmResult =
  // `error` distinguishes a genuine "not yet mined" (404 → keep polling) from an
  // upstream failure (bad key / rate-limit / outage → stop polling).
  | { found: false; error?: "upstream"; status?: number }
  | { found: true; blockHeight: number; block: string; tipHeight: number; confirmations: number };

// The chain tip moves ~every 20s, so one cached height serves every
// concurrent confirm poll instead of re-fetching /blocks/latest per call.
let tipCache: { height: number; at: number } | null = null;
const TIP_TTL_MS = 15_000;

// Poll the chain for inclusion: Blockfrost only indexes a tx once it lands in a
// block, so a 404 means "submitted but not yet confirmed". When it's found we
// derive confirmations from the current tip height.
export async function getConfirmations(txHash: string): Promise<ConfirmResult> {
  const projectId = process.env.BLOCKFROST_MAINNET_PROJECT_ID;
  if (!projectId) return { found: false, error: "upstream", status: 500 };
  const headers = { project_id: projectId };

  let txRes: Response;
  try {
    txRes = await fetch(BLOCKFROST_TX_URL(txHash), { headers, cache: "no-store" });
  } catch {
    return { found: false, error: "upstream", status: 502 };
  }
  if (txRes.status === 404) return { found: false }; // not yet in a block — keep polling
  if (!txRes.ok) return { found: false, error: "upstream", status: txRes.status }; // bad key / 429 / 5xx
  const tx = (await txRes.json()) as { block_height?: number; block?: string };
  const blockHeight = tx.block_height ?? 0;
  if (!blockHeight) return { found: false };

  let tipHeight = blockHeight;
  if (tipCache && Date.now() - tipCache.at < TIP_TTL_MS) {
    tipHeight = tipCache.height;
  } else {
    try {
      const tipRes = await fetch(`${BLOCKFROST}/blocks/latest`, { headers, cache: "no-store" });
      if (tipRes.ok) {
        const h = ((await tipRes.json()) as { height?: number }).height;
        if (h) {
          tipHeight = h;
          tipCache = { height: h, at: Date.now() };
        }
      }
    } catch {
      /* fall back to the tx's own block height */
    }
  }

  // Inclusive convention: the including block counts as confirmation #1. The
  // client only gates on `found`, so this value is display-only.
  const depth = tipHeight - blockHeight;
  return {
    found: true,
    blockHeight,
    block: tx.block ?? "",
    tipHeight,
    confirmations: depth >= 0 ? depth + 1 : 1,
  };
}

export type SubmitResult =
  | { ok: true; txHash: string }
  | { ok: false; status: number; detail: unknown };

// Broadcast the signed transaction to Cardano mainnet via Blockfrost.
export async function submitToMainnet(signedTxHex: string): Promise<SubmitResult> {
  const projectId = process.env.BLOCKFROST_MAINNET_PROJECT_ID;
  if (!projectId) return { ok: false, status: 500, detail: "Facilitator is not configured (missing Blockfrost key)" };
  let res: Response;
  try {
    res = await fetch(`${BLOCKFROST}/tx/submit`, {
      method: "POST",
      headers: { project_id: projectId, "Content-Type": "application/cbor" },
      body: new Uint8Array(Buffer.from(signedTxHex, "hex")),
    });
  } catch (e) {
    return { ok: false, status: 502, detail: String(e) };
  }
  const text = await res.text();
  if (!res.ok) {
    let detail: unknown = text.slice(0, 300);
    try {
      detail = JSON.parse(text);
    } catch {
      /* keep raw text */
    }
    return { ok: false, status: 402, detail };
  }
  return { ok: true, txHash: (JSON.parse(text) as string).replace(/"/g, "") };
}

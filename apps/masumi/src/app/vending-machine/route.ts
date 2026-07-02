import type { NextRequest } from "next/server";
import { PAY_TO, MIN_LOVELACE, NETWORK, verifyPayment, submitToMainnet } from "@/lib/x402-facilitator";

export const dynamic = "force-dynamic";

// The vending machine = the x402 resource server, on Cardano mainnet.
//
//   GET without X-PAYMENT  → 402 + PaymentRequirements (pay 1 ADA to PAY_TO)
//   GET with    X-PAYMENT  → the facilitator VERIFIES the signed tx really pays
//                            1 ADA to PAY_TO, then SETTLES it (submits to mainnet
//                            via Blockfrost) and returns 200 + the txHash.

const RESOURCE_URL = "https://www.masumi.network/vending-machine";
const AMOUNT = MIN_LOVELACE.toString(); // "1000000"

const requirements = {
  x402Version: 1 as const,
  error: "X-PAYMENT header is required",
  accepts: [
    {
      scheme: "exact" as const,
      network: NETWORK,
      maxAmountRequired: AMOUNT,
      resource: RESOURCE_URL,
      description: "One snack from the x402 vending machine",
      mimeType: "application/json",
      payTo: PAY_TO,
      asset: "lovelace",
      maxTimeoutSeconds: 120,
    },
  ],
} as const;

function json(body: unknown, init: ResponseInit) {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}

export async function GET(req: NextRequest) {
  const header = req.headers.get("x-payment");
  if (!header) return json(requirements, { status: 402 });

  // Decode the x402 PaymentPayload: base64(JSON) carrying the signed Cardano tx.
  let signedTxHex: string | undefined;
  try {
    const decoded = JSON.parse(Buffer.from(header, "base64").toString("utf-8")) as {
      payload?: { transaction?: string };
    };
    signedTxHex = decoded?.payload?.transaction;
  } catch {
    return json({ error: "Malformed X-PAYMENT header" }, { status: 400 });
  }
  if (!signedTxHex || typeof signedTxHex !== "string" || !/^[0-9a-fA-F]+$/.test(signedTxHex)) {
    return json({ error: "X-PAYMENT is missing a valid signed transaction" }, { status: 400 });
  }

  // 1) VERIFY — decode the tx and assert it pays >= 1 ADA to PAY_TO and is signed.
  const v = verifyPayment(signedTxHex);
  if (!v.valid) {
    return json({ error: "Payment failed verification", detail: v.reason }, { status: 402 });
  }

  // 2) SETTLE — broadcast to Cardano mainnet via Blockfrost.
  const s = await submitToMainnet(signedTxHex);
  if (!s.ok) {
    return json({ error: "Settlement rejected by the network", detail: s.detail }, { status: s.status });
  }

  // Paid + on-chain → return the resource. Settlement goes in the standard
  // X-PAYMENT-RESPONSE header AND the body (so a header-stripping proxy can't lose it).
  const paymentResponse = { success: true, network: NETWORK, transaction: s.txHash };
  return json(
    {
      snack: "ZAPPO chips",
      servedAt: new Date().toISOString(),
      note: "Paid with 1 ADA via x402 (exact scheme, Cardano mainnet).",
      payment: paymentResponse,
    },
    {
      status: 200,
      headers: {
        "x-payment-response": Buffer.from(JSON.stringify(paymentResponse)).toString("base64"),
      },
    }
  );
}

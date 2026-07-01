import type { NextRequest } from "next/server";
import { buildPaymentRequirements, type Accepted } from "./requirements";

export const dynamic = "force-dynamic";

// Spec-compliant x402 "exact" demo endpoint on Cardano (preprod).
// Reference: https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md
//
// Behaviour:
//   GET without PAYMENT-SIGNATURE  → 402 + PaymentRequirementsResponse
//   GET with valid PAYMENT-SIGNATURE → 200 + protected resource + PAYMENT-RESPONSE header
//
// The header is decoded and structurally validated. The six on-chain facilitator
// checks (network/recipient/amount/asset/nonce/TTL) would normally run against a
// Cardano node — here they are accepted with a "demo" status so the flow is
// reproducible without test ADA.

type PaymentSignature = {
  x402Version: number;
  resource: { url: string; description?: string; mimeType?: string };
  accepted: Accepted;
  payload: { transaction: string; nonce: string };
};

function jsonResponse(body: unknown, init: ResponseInit) {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}

function decodeHeader(header: string): PaymentSignature | null {
  try {
    const json = Buffer.from(header, "base64").toString("utf-8");
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return null;
    if (parsed.x402Version !== 2) return null;
    if (!parsed.accepted || parsed.accepted.scheme !== "exact") return null;
    if (!parsed.payload || typeof parsed.payload.transaction !== "string") return null;
    if (typeof parsed.payload.nonce !== "string") return null;
    return parsed as PaymentSignature;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const header = req.headers.get("payment-signature");
  const now = Math.floor(Date.now() / 1000);

  if (!header) {
    return jsonResponse(buildPaymentRequirements(now), { status: 402 });
  }

  const decoded = decodeHeader(header);
  if (!decoded) {
    return jsonResponse(
      { error: "Malformed PAYMENT-SIGNATURE header" },
      { status: 400 }
    );
  }

  // Structural checks against the served requirements
  const req0 = buildPaymentRequirements(now).accepts[0];
  if (decoded.accepted.network !== req0.network) {
    return jsonResponse(
      { error: `Network mismatch: expected ${req0.network}` },
      { status: 402 }
    );
  }
  if (decoded.accepted.asset !== req0.asset) {
    return jsonResponse(
      { error: "Asset mismatch" },
      { status: 402 }
    );
  }
  if (BigInt(decoded.accepted.amount) < BigInt(req0.amount)) {
    return jsonResponse(
      { error: "Amount below required minimum" },
      { status: 402 }
    );
  }
  if (decoded.accepted.payTo !== req0.payTo) {
    return jsonResponse(
      { error: "Recipient mismatch" },
      { status: 402 }
    );
  }

  // Production: a facilitator would now verify the UTXO `nonce` is unspent,
  // the transaction TTL has not lapsed, the outputs satisfy payTo/amount/asset,
  // and submit the tx. Here we accept it with a "demo" status.
  const paymentResponse = {
    success: true,
    network: req0.network,
    transaction:
      "demo_2f9a7b3c8e1d4a6b9c0f1e2d3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    extensions: { status: "demo" as const },
  };

  return jsonResponse(
    {
      resource: req0.extra.agentIdentifier,
      generatedAt: new Date().toISOString(),
      summary:
        "AI agents on Cardano transacted 4.21M ADA across 12,839 escrow contracts in Q3 2026, up 187% QoQ.",
      sample: [
        { agent: "research-agent-001", calls: 1204, volume: "612.4 ADA" },
        { agent: "seo-optimizer", calls: 892, volume: "318.0 ADA" },
        { agent: "copy-writer", calls: 2341, volume: "1,104.2 ADA" },
      ],
    },
    {
      status: 200,
      headers: {
        "payment-response": Buffer.from(JSON.stringify(paymentResponse)).toString("base64"),
      },
    }
  );
}

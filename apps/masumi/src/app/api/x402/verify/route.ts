import type { NextRequest } from "next/server";
import { verifyPayment, PAY_TO, MIN_LOVELACE } from "@/lib/x402-facilitator";

export const dynamic = "force-dynamic";

// x402 facilitator: /verify. Decodes a signed transaction and confirms it pays
// the required amount to the machine — WITHOUT broadcasting it. No chain call.
export async function POST(req: NextRequest) {
  let transaction: unknown;
  try {
    ({ transaction } = await req.json());
  } catch {
    return Response.json({ isValid: false, invalidReason: "Malformed request body" }, { status: 400 });
  }
  if (!transaction || typeof transaction !== "string" || !/^[0-9a-fA-F]+$/.test(transaction)) {
    return Response.json({ isValid: false, invalidReason: "Missing or malformed signed transaction" }, { status: 400 });
  }

  const v = verifyPayment(transaction);
  return Response.json(
    {
      isValid: v.valid,
      invalidReason: v.reason,
      payTo: PAY_TO,
      requiredLovelace: MIN_LOVELACE.toString(),
      paidLovelace: v.paidLovelace,
      signed: v.signed,
    },
    { status: 200, headers: { "cache-control": "no-store" } }
  );
}

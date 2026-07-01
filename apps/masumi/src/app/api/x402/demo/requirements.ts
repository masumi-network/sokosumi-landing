// Single source of truth for the x402 "exact" Cardano PaymentRequirements.
// Imported by the live route (GET /api/x402/demo) AND server-rendered on the
// /x402 page, so the JSON shown on the page is exactly what the endpoint emits.
//
// Spec: https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md

export const RESOURCE_URL = "https://www.masumi.network/api/x402/demo";

// USDM (Mehen) — CIP-68 fungible token: policyId.(0014df10 prefix + "USDM" hex)
export const USDM_PREPROD =
  "16a55b2a349361ff88c03788f93e1e966e5d689605d044fef722ddde.0014df105553444d";

// Masumi escrow script address (preprod).
export const PAY_TO =
  "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8";

export const buildPaymentRequirements = (now: number) =>
  ({
    x402Version: 2 as const,
    error: "PAYMENT-SIGNATURE header is required",
    resource: {
      url: RESOURCE_URL,
      description: "Q3 2026 Cardano AI agent market summary",
      mimeType: "application/json",
    },
    accepts: [
      {
        scheme: "exact" as const,
        network: "cardano:preprod" as const,
        amount: "10000",
        asset: USDM_PREPROD,
        payTo: PAY_TO,
        maxTimeoutSeconds: 600,
        extra: {
          assetTransferMethod: "masumi" as const,
          paymentType: "Web3CardanoV1" as const,
          agentIdentifier: "agent_masumi_research_demo",
          blockchainIdentifier: "ms_x402_demo_q3_2026",
          identifierFromPurchaser: "purchaser_demo_000001",
          sellerVkey:
            "5c8e0a4d1f7b2c9e3a6d8f0b1c4e7a9d2f5b8c0e3a6d9f2b5c8e1a4d7f0b3c6e",
          payByTime: String(now + 300),
          submitResultTime: String(now + 3600),
          unlockTime: String(now + 86400),
          externalDisputeUnlockTime: String(now + 259200),
          inputHash:
            "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        },
      },
    ],
  }) as const;

export type PaymentRequirements = ReturnType<typeof buildPaymentRequirements>;
export type Accepted = PaymentRequirements["accepts"][number];

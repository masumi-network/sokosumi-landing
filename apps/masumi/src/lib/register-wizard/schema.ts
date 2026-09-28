import type { UseFormSetError } from "react-hook-form";
import { z } from "zod";

import { x402PaymentDraftSchema } from "@/lib/x402/schemas";
import { defaultEvmChainForCardanoNetwork } from "@/lib/x402/evm-chains";
import {
  emptyX402PaymentDraft,
  type X402PaymentDraft,
} from "@/lib/x402/types";

export const registerWizardSchema = z.object({
  name: z.string(),
  email: z.string(),
  termsAccepted: z.boolean(),
  agentName: z.string(),
  description: z.string(),
  apiBaseUrl: z.string(),
  capabilityTags: z.string(),
  cardanoPayoutAddress: z.string(),
  includeX402: z.boolean(),
  x402: z.custom<X402PaymentDraft>(),
});

export type RegisterWizardFormValues = z.infer<typeof registerWizardSchema>;

export function createRegisterWizardDefaultValues(
  cardanoNetwork: "Preprod" | "Mainnet",
): RegisterWizardFormValues {
  const defaultChain = defaultEvmChainForCardanoNetwork(cardanoNetwork);
  return {
    name: "",
    email: "",
    termsAccepted: false,
    agentName: "",
    description: "",
    apiBaseUrl: "",
    capabilityTags: "",
    cardanoPayoutAddress: "",
    includeX402: false,
    x402: emptyX402PaymentDraft(defaultChain),
  };
}

function cardanoPayoutAddressError(
  network: "Preprod" | "Mainnet",
): string {
  return network === "Mainnet"
    ? "Enter a Mainnet Cardano address (addr1…)."
    : "Enter a Preprod Cardano address (addr_test…).";
}

function isValidCardanoPayoutAddress(
  address: string,
  network: "Preprod" | "Mainnet",
): boolean {
  const trimmed = address.trim();
  if (!trimmed) return false;
  if (network === "Preprod") return trimmed.startsWith("addr_test");
  return trimmed.startsWith("addr1");
}

export const accountStepSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("Enter a valid email."),
  termsAccepted: z.literal(true, {
    message: "You must accept the Privacy Policy.",
  }),
});

export function createAgentStepSchema(cardanoNetwork: "Preprod" | "Mainnet") {
  return z
    .object({
      agentName: z.string().trim().min(1, "Agent name is required.").max(250),
      description: z.string().trim().max(250, "Use at most 250 characters."),
      apiBaseUrl: z.httpUrl("Enter a valid HTTP or HTTPS API URL.").trim(),
      capabilityTags: z.string().trim().min(1, "Add at least one tag."),
      cardanoPayoutAddress: z
        .string()
        .trim()
        .min(1, "Cardano payout address is required."),
      includeX402: z.boolean(),
      x402: z.custom<X402PaymentDraft>(),
    })
    .superRefine((values, ctx) => {
      if (
        !isValidCardanoPayoutAddress(
          values.cardanoPayoutAddress,
          cardanoNetwork,
        )
      ) {
        ctx.addIssue({
          code: "custom",
          message: cardanoPayoutAddressError(cardanoNetwork),
          path: ["cardanoPayoutAddress"],
        });
      }
      if (!values.includeX402) return;
      const result = x402PaymentDraftSchema.safeParse(values.x402);
      if (result.success) return;
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          ctx.addIssue({
            code: "custom",
            message: issue.message,
            path: ["x402", key],
          });
        }
      }
    });
}

/** Preprod-shaped schema for scripts that do not pass a network. */
export const agentStepSchema = createAgentStepSchema("Preprod");

export function applyZodErrors(
  error: z.ZodError,
  setError: UseFormSetError<RegisterWizardFormValues>,
) {
  for (const issue of error.issues) {
    if (issue.path.length === 0) continue;
    const name = issue.path.join(".");
    setError(name as Parameters<UseFormSetError<RegisterWizardFormValues>>[0], {
      type: issue.code,
      message: issue.message,
    });
  }
}

export function firstZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed.";
}

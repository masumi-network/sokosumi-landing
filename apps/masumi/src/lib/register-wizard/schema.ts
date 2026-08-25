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
    includeX402: false,
    x402: emptyX402PaymentDraft(defaultChain),
  };
}

export const accountStepSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email."),
  termsAccepted: z.literal(true, {
    message: "You must accept the Privacy Policy.",
  }),
});

export const agentStepSchema = z
  .object({
    agentName: z.string().trim().min(1, "Agent name is required."),
    description: z.string(),
    apiBaseUrl: z.string().trim().url("Enter a valid API URL."),
    capabilityTags: z.string().trim().min(1, "Add at least one tag."),
    includeX402: z.boolean(),
    x402: z.custom<X402PaymentDraft>(),
  })
  .superRefine((values, ctx) => {
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

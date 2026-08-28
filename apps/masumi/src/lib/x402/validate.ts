import type { X402PaymentDraft } from "./types";
import { x402PaymentDraftSchema } from "./schemas";

export type X402FieldErrors = Partial<Record<keyof X402PaymentDraft, string>>;

export function getX402PaymentFieldErrors(
  draft: X402PaymentDraft,
): X402FieldErrors {
  const result = x402PaymentDraftSchema.safeParse(draft);
  if (result.success) return {};

  const errors: X402FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key as keyof X402PaymentDraft]) {
      errors[key as keyof X402PaymentDraft] = issue.message;
    }
  }
  return errors;
}

export function validateX402PaymentDraft(
  draft: X402PaymentDraft,
): string | null {
  const result = x402PaymentDraftSchema.safeParse(draft);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "Invalid x402 payment option.";
}

export { x402PaymentDraftSchema } from "./schemas";

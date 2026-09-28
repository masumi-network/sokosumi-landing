import { z } from "zod";

export const caip2Eip155Schema = z
  .string()
  .regex(/^eip155:\d+$/, "Select an EVM chain.");

export const evmAddressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid EVM address (0x…).");

export const positiveUintStringSchema = z
  .string()
  .trim()
  .regex(
    /^\d+$/,
    "Enter a positive price. It is stored as token base units on-chain.",
  )
  .refine((value) => /[1-9]/.test(value), {
    message:
      "Enter a positive price. It is stored as token base units on-chain.",
  });

export const tokenDecimalsStringSchema = z.string().refine((value) => {
  const decimals = Number(value);
  return /^\d+$/.test(value) && Number.isInteger(decimals) && decimals >= 0 && decimals <= 255;
}, "Decimals must be a whole number from 0 to 255.");

export const optionalHttpUrlSchema = z.union([
  z.literal(""),
  z.httpUrl("Resource must be a valid HTTP or HTTPS URL.").max(500),
]).transform((value) => value.trim());

export const x402PaymentDraftSchema = z.object({
  network: caip2Eip155Schema,
  asset: evmAddressSchema,
  amount: positiveUintStringSchema,
  decimals: tokenDecimalsStringSchema,
  payTo: evmAddressSchema,
  resource: optionalHttpUrlSchema,
});

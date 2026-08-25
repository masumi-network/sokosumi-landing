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
  .refine((value) => value !== "0", {
    message:
      "Enter a positive price. It is stored as token base units on-chain.",
  });

export const tokenDecimalsStringSchema = z.string().refine((value) => {
  const decimals = Number(value);
  return Number.isInteger(decimals) && decimals >= 0 && decimals <= 255;
}, "Decimals must be a whole number from 0 to 255.");

export const optionalHttpUrlSchema = z
  .string()
  .refine((value) => value.trim() === "" || /^https?:\/\//.test(value.trim()), {
    message: "Resource must be an http(s) URL when provided.",
  });

export const x402PaymentDraftSchema = z.object({
  network: caip2Eip155Schema,
  asset: evmAddressSchema,
  amount: positiveUintStringSchema,
  decimals: tokenDecimalsStringSchema,
  payTo: evmAddressSchema,
  resource: optionalHttpUrlSchema,
});

import { MASUMI_REGISTRY_NETWORK } from "@/lib/config/register";

export type X402FieldProbeStatus = "idle" | "checking" | "valid" | "invalid";

export function buildX402ResourceProbeKey(resourceUrl: string): string {
  return `${MASUMI_REGISTRY_NETWORK}|${resourceUrl.trim()}`;
}

export function isProbeableResourceUrl(resourceUrl: string): boolean {
  try {
    const url = new URL(resourceUrl.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

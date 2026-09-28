/**
 * Public agent registry (masumi.network/register).
 *
 * Network: set `MASUMI_REGISTRY_NETWORK` or `NEXT_PUBLIC_MASUMI_REGISTRY_NETWORK`
 * on the sokosumi-landing / masumi deployment (`Mainnet` or `Preprod`).
 *
 * SaaS API: set `NEXT_PUBLIC_SAAS_URL` to the masumi-saas origin.
 */

export type RegistryNetwork = "Preprod" | "Mainnet";

const REGISTRY_NETWORKS = new Set<RegistryNetwork>(["Preprod", "Mainnet"]);

export function parseRegistryNetwork(raw: string | undefined): RegistryNetwork {
  const normalized = raw?.trim();
  if (!normalized) return "Mainnet";

  if (REGISTRY_NETWORKS.has(normalized as RegistryNetwork)) {
    return normalized as RegistryNetwork;
  }

  const lower = normalized.toLowerCase();
  if (
    lower === "preprod" ||
    lower === "testnet" ||
    lower === "preview"
  ) {
    return "Preprod";
  }

  if (lower === "mainnet") return "Mainnet";
  throw new Error("Registry network must be Mainnet or Preprod.");
}

export const MASUMI_REGISTRY_NETWORK = parseRegistryNetwork(
  process.env.NEXT_PUBLIC_MASUMI_REGISTRY_NETWORK,
);

export function parseSaasOrigin(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  try {
    const url = new URL(raw.trim());
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
        url.pathname !== "/" || url.search || url.hash) return "";
    return url.origin;
  } catch {
    return "";
  }
}

export const MASUMI_SAAS_URL = parseSaasOrigin(process.env.NEXT_PUBLIC_SAAS_URL);

export function registrationApiUrl(path: string): string {
  if (!MASUMI_SAAS_URL) throw new Error("Registration is unavailable. Please try again later.");
  return `${MASUMI_SAAS_URL}/api/public/network/register${path}`;
}

export const MASUMI_SUPPORT_URL =
  process.env.NEXT_PUBLIC_SUPPORT_URL?.trim() ||
  "https://www.masumi.network/contact";

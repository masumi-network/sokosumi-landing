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

  return "Mainnet";
}

export const MASUMI_REGISTRY_NETWORK = parseRegistryNetwork(
  process.env.NEXT_PUBLIC_MASUMI_REGISTRY_NETWORK,
);

export const MASUMI_SAAS_URL =
  process.env.NEXT_PUBLIC_SAAS_URL?.replace(/\/$/, "") ||
  "http://localhost:2999";

export const MASUMI_SUPPORT_URL =
  process.env.NEXT_PUBLIC_SUPPORT_URL?.trim() ||
  "https://masumi.network/support";

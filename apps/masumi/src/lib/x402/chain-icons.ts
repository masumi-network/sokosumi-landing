import { getEvmChainByCaip2Id, type EvmChainIconSlug } from "@/lib/x402/evm-chains";

const EVM_CHAIN_ICON_BASE_PATH = "/assets/chains";

/** Public path for a curated preset chain logo, or null when unknown. */
export function getEvmChainIconPath(caip2Id: string): string | null {
  const icon = getEvmChainByCaip2Id(caip2Id)?.icon;
  return icon ? `${EVM_CHAIN_ICON_BASE_PATH}/${icon}.png` : null;
}

const REMOTE_CHAIN_ICON_BASE_URL = "https://icons.llamao.fi/icons/chains/rsz";

export function resolveChainIconSource(
  caip2Id: string,
  iconSlug?: string | null,
  displayName?: string | null,
): { src: string; remote: boolean } | null {
  const local = getEvmChainIconPath(caip2Id);
  if (local) return { src: local, remote: false };

  const slug =
    iconSlug?.trim().toLowerCase() ||
    inferIconSlugFromDisplayName(displayName);
  if (!slug) return null;

  return { src: `${REMOTE_CHAIN_ICON_BASE_URL}_${slug}.jpg`, remote: true };
}

function inferIconSlugFromDisplayName(
  displayName?: string | null,
): string | null {
  const trimmed = displayName?.trim();
  if (!trimmed || trimmed.includes(" ")) return null;
  const slug = trimmed.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return slug || null;
}

export type EvmTokenIconId = "usdc" | "usdt";

const TOKEN_ICON_PATHS: Record<EvmTokenIconId, string> = {
  usdc: "/assets/tokens/usdc.png",
  usdt: "/assets/tokens/usdt.png",
};

export function getEvmTokenIconPath(
  tokenId: EvmTokenIconId | string,
): string | null {
  if (tokenId === "usdc" || tokenId === "usdt") {
    return TOKEN_ICON_PATHS[tokenId];
  }
  return null;
}

export type { EvmChainIconSlug };

export type EvmStablecoinAddresses = {
  usdc?: string;
  usdt?: string;
};

export type EvmChainIconSlug = "base" | "ethereum" | "arbitrum" | "optimism";

export type EvmChainConfig = {
  id: string;
  caip2Id: string;
  displayName: string;
  /** Vendored logo under /assets/chains/{icon}.png */
  icon: EvmChainIconSlug;
  isTestnet: boolean;
  stablecoins: EvmStablecoinAddresses;
};

/** Curated EVM chains aligned with masumi-saas x402 presets. */
export const EVM_CHAINS: readonly EvmChainConfig[] = [
  {
    id: "base",
    caip2Id: "eip155:8453",
    displayName: "Base",
    icon: "base",
    isTestnet: false,
    stablecoins: {
      usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      usdt: "0xfde4C96c8593536E31F229EA8f367978e6E846242",
    },
  },
  {
    id: "ethereum",
    caip2Id: "eip155:1",
    displayName: "Ethereum",
    icon: "ethereum",
    isTestnet: false,
    stablecoins: {
      usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
  },
  {
    id: "arbitrum",
    caip2Id: "eip155:42161",
    displayName: "Arbitrum One",
    icon: "arbitrum",
    isTestnet: false,
    stablecoins: {
      usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      usdt: "0xFd086bC7CD5C481DCC9EC4eb50fF96488b4766Ae",
    },
  },
  {
    id: "optimism",
    caip2Id: "eip155:10",
    displayName: "Optimism",
    icon: "optimism",
    isTestnet: false,
    stablecoins: {
      usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      usdt: "0x94b008aA00563869d9A0c8D4C5b327f130FcBd832",
    },
  },
  {
    id: "base-sepolia",
    caip2Id: "eip155:84532",
    displayName: "Base Sepolia",
    icon: "base",
    isTestnet: true,
    stablecoins: {
      usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    },
  },
  {
    id: "sepolia",
    caip2Id: "eip155:11155111",
    displayName: "Ethereum Sepolia",
    icon: "ethereum",
    isTestnet: true,
    stablecoins: {
      usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    },
  },
] as const;

export function getEvmChainByCaip2Id(
  caip2Id: string,
): EvmChainConfig | undefined {
  return EVM_CHAINS.find((chain) => chain.caip2Id === caip2Id);
}

export function getDefaultStablecoinForChain(caip2Id: string): string | null {
  const stablecoins = getEvmChainByCaip2Id(caip2Id)?.stablecoins ?? {};
  return stablecoins.usdc ?? stablecoins.usdt ?? null;
}

export function defaultEvmChainForCardanoNetwork(
  cardanoNetwork: "Preprod" | "Mainnet",
): string {
  return cardanoNetwork === "Mainnet" ? "eip155:8453" : "eip155:84532";
}

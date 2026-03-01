export type NetworkId = "mainnet" | "preprod";

export interface NetworkConfig {
  id: NetworkId;
  label: string;
  blockfrostBase: string;
  blockfrostKey: string;
  escrowAddress: string;
  policyId: string;
  usdmPrefix: string;
  dbFilename: string;
  cardanoscanBase: string;
  proxyBase: string | null;
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  mainnet: {
    id: "mainnet",
    label: "Mainnet",
    blockfrostBase: "https://cardano-mainnet.blockfrost.io/api/v0",
    blockfrostKey: "mainnetD813pPbW5SjD3oa6HbNVcy72eDJTsxgF",
    escrowAddress: "addr1wx7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsq87ujx7",
    policyId: "ad6424e3ce9e47bbd8364984bd731b41de591f1d11f6d7d43d0da9b9",
    usdmPrefix: "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402",
    dbFilename: "explorer-mainnet.db",
    cardanoscanBase: "https://cardanoscan.io",
    proxyBase: "https://masumi-production.up.railway.app",
  },
  preprod: {
    id: "preprod",
    label: "Preprod",
    blockfrostBase: "https://cardano-preprod.blockfrost.io/api/v0",
    blockfrostKey: "preprodyAaq0Es1UnScwBp5vxdBH7ks2IbBaRro",
    escrowAddress: "addr_test1wz7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsqukgwfm",
    policyId: "7e8bdaf2b2b919a3a4b94002cafb50086c0c845fe535d07a77ab7f77",
    usdmPrefix: "16a55b2a349361ff88c03788f93e1e966e5d689605d044fef722ddde0014df10745553444d",
    dbFilename: "explorer-preprod.db",
    cardanoscanBase: "https://preprod.cardanoscan.io",
    proxyBase: null,
  },
};

export const DEFAULT_NETWORK: NetworkId = "mainnet";

export function getNetworkConfig(network?: string | null): NetworkConfig {
  if (network === "preprod") return NETWORKS.preprod;
  return NETWORKS.mainnet;
}

export function parseNetworkParam(searchParams: URLSearchParams): NetworkId {
  const val = searchParams.get("network");
  if (val === "preprod") return "preprod";
  return "mainnet";
}

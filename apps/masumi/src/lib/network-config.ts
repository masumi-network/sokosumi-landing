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
    escrowAddress: "addr_test1wqwryqpm70ldtryqr2fa9y72ex9e6pyq0k5z4p5260wq0zq8yrz6n",
    policyId: "c7842ba56912a2df2f2e1b89f8e11751c6ec2318520f4d312423a272",
    usdmPrefix: "",
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

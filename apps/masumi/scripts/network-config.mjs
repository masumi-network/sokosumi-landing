import "./load-env.mjs";

export const NETWORKS = {
  mainnet: {
    id: "mainnet",
    label: "Mainnet",
    blockfrostBase: "https://cardano-mainnet.blockfrost.io/api/v0",
    blockfrostKey: process.env.BLOCKFROST_MAINNET_KEY ?? "",
    escrowAddress: "addr1wx7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsq87ujx7",
    policyId: "ad6424e3ce9e47bbd8364984bd731b41de591f1d11f6d7d43d0da9b9",
    usdmPrefix: "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402",
    dbFilename: "explorer-mainnet.db",
  },
  preprod: {
    id: "preprod",
    label: "Preprod",
    blockfrostBase: "https://cardano-preprod.blockfrost.io/api/v0",
    blockfrostKey: process.env.BLOCKFROST_PREPROD_KEY ?? "",
    escrowAddress: "addr_test1wz7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsqukgwfm",
    policyId: "7e8bdaf2b2b919a3a4b94002cafb50086c0c845fe535d07a77ab7f77",
    usdmPrefix: "16a55b2a349361ff88c03788f93e1e966e5d689605d044fef722ddde0014df10745553444d",
    dbFilename: "explorer-preprod.db",
  },
};

export const DEFAULT_NETWORK = "mainnet";

export const NETWORKS = {
  mainnet: {
    id: "mainnet",
    label: "Mainnet",
    blockfrostBase: "https://cardano-mainnet.blockfrost.io/api/v0",
    blockfrostKey: "mainnetD813pPbW5SjD3oa6HbNVcy72eDJTsxgF",
    escrowAddress: "addr1wx7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsq87ujx7",
    policyId: "ad6424e3ce9e47bbd8364984bd731b41de591f1d11f6d7d43d0da9b9",
    usdmPrefix: "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402",
    dbFilename: "explorer-mainnet.db",
  },
  preprod: {
    id: "preprod",
    label: "Preprod",
    blockfrostBase: "https://cardano-preprod.blockfrost.io/api/v0",
    blockfrostKey: "preprodyAaq0Es1UnScwBp5vxdBH7ks2IbBaRro",
    escrowAddress: "addr_test1wz7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsqukgwfm",
    policyId: "7e8bdaf2b2b919a3a4b94002cafb50086c0c845fe535d07a77ab7f77",
    usdmPrefix: "",
    dbFilename: "explorer-preprod.db",
  },
};

export const DEFAULT_NETWORK = "mainnet";

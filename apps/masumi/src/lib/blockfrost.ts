export const BLOCKFROST_BASE = "https://cardano-mainnet.blockfrost.io/api/v0";
export const BLOCKFROST_KEY = "mainnetD813pPbW5SjD3oa6HbNVcy72eDJTsxgF";
export const ADDRESS =
  "addr1wx7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsq87ujx7";
export const POLICY_ID =
  "ad6424e3ce9e47bbd8364984bd731b41de591f1d11f6d7d43d0da9b9";

export const USDM_PREFIX =
  "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402";

export async function bfFetch(path: string, revalidate = 300) {
  const res = await fetch(`${BLOCKFROST_BASE}${path}`, {
    headers: { project_id: BLOCKFROST_KEY },
    next: { revalidate },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Blockfrost ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

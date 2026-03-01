import { type NetworkId, getNetworkConfig } from "./network-config";

export function getEscrowAddress(network: NetworkId = "mainnet"): string {
  return getNetworkConfig(network).escrowAddress;
}

export function getUsdmPrefix(network: NetworkId = "mainnet"): string {
  return getNetworkConfig(network).usdmPrefix;
}

export async function bfFetch(path: string, revalidate = 300, network: NetworkId = "mainnet") {
  const config = getNetworkConfig(network);
  const res = await fetch(`${config.blockfrostBase}${path}`, {
    headers: { project_id: config.blockfrostKey },
    next: { revalidate },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Blockfrost ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

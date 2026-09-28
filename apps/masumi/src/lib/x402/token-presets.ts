import {
  getDefaultStablecoinForChain,
  getEvmChainByCaip2Id,
  type EvmStablecoinAddresses,
} from "./evm-chains";

export type EvmTokenPreset = {
  id: "usdc" | "usdt";
  label: string;
  address: string;
  decimals: number;
};

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

function stablecoinPresets(
  stablecoins: EvmStablecoinAddresses,
): EvmTokenPreset[] {
  const presets: EvmTokenPreset[] = [];
  if (stablecoins.usdc) {
    presets.push({
      id: "usdc",
      label: "USDC",
      address: stablecoins.usdc,
      decimals: 6,
    });
  }
  if (stablecoins.usdt) {
    presets.push({
      id: "usdt",
      label: "USDT",
      address: stablecoins.usdt,
      decimals: 6,
    });
  }
  return presets;
}

export function getEvmTokenPresetsForChain(caip2Id: string): EvmTokenPreset[] {
  const chain = getEvmChainByCaip2Id(caip2Id);
  if (!chain) return [];
  return stablecoinPresets(chain.stablecoins);
}

export function resolveDefaultAssetForChain(caip2Id: string): {
  asset: string;
  decimals: string;
} | null {
  const asset = getDefaultStablecoinForChain(caip2Id);
  if (!asset || !EVM_ADDRESS.test(asset)) return null;
  return { asset, decimals: "6" };
}

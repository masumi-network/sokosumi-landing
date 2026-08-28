import { MASUMI_SAAS_URL } from "@/lib/config/register";

export type RegisterSettleableX402Network = {
  caip2Id: string;
  displayName: string;
  isTestnet: boolean;
  defaultAsset: string | null;
};

export type RegisterCapabilities = {
  browserWalletMintSupported: boolean;
  x402SettleableNetworks: RegisterSettleableX402Network[];
};

export async function fetchRegisterCapabilities(): Promise<RegisterCapabilities> {
  const res = await fetch(
    `${MASUMI_SAAS_URL}/api/public/network/register/capabilities`,
    {
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Could not load registration capabilities.");
  }

  const data = (await res.json()) as RegisterCapabilities;
  return {
    browserWalletMintSupported: data.browserWalletMintSupported === true,
    x402SettleableNetworks: Array.isArray(data.x402SettleableNetworks)
      ? data.x402SettleableNetworks
      : [],
  };
}

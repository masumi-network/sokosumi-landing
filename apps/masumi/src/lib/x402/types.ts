export type X402PaymentDraft = {
  network: string;
  asset: string;
  amount: string;
  decimals: string;
  payTo: string;
  resource: string;
};

export function emptyX402PaymentDraft(
  network = "eip155:84532",
  asset = "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
): X402PaymentDraft {
  return {
    network,
    asset,
    amount: "2000000",
    decimals: "6",
    payTo: "",
    resource: "",
  };
}

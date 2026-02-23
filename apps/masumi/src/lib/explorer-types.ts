export type TransactionType =
  | "SubmitResult"
  | "PaymentBatched"
  | "CollectCompleted"
  | "CollectRefund"
  | "RequestRefund"
  | "other";

export interface TransactionSummary {
  hash: string;
  block_height: number;
  block_time: number;
  fees: string;
  type: TransactionType;
  usdm_amount: number;
}

export interface AmountEntry {
  unit: string;
  quantity: string;
  is_usdm: boolean;
}

export interface UTXOEntry {
  address: string;
  is_escrow: boolean;
  amounts: AmountEntry[];
}

export interface TransactionDetail {
  hash: string;
  block_height: number;
  block_time: number;
  fees: string;
  size: number;
  type: TransactionType;
  inputs: UTXOEntry[];
  outputs: UTXOEntry[];
  metadata: Record<string, unknown>[] | null;
  input_total_ada: number;
  output_total_ada: number;
  input_total_usdm: number;
  output_total_usdm: number;
}

export interface Agent {
  asset: string;
  name: string;
  description: string | null;
  author: string | null;
  organization: string | null;
  capability: string | null;
  version: string | null;
  pricingType: string | null;
  image: string | null;
  fingerprint: string | null;
  mintedAt: number | null;
}

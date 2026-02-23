import { bfFetch, ADDRESS } from "@/lib/blockfrost";
import { NextRequest } from "next/server";
import type { TransactionDetail, UTXOEntry, AmountEntry, TransactionType } from "@/lib/explorer-types";

const USDM_PREFIX = "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402";

const KNOWN_TYPES = new Set<string>([
  "SubmitResult",
  "PaymentBatched",
  "CollectCompleted",
  "CollectRefund",
  "RequestRefund",
]);

interface BfAmount {
  unit: string;
  quantity: string;
}

interface BfUTXOEntry {
  address: string;
  amount: BfAmount[];
}

interface BfMetadataEntry {
  label: string;
  json_metadata: { msg?: string[] };
}

function detectTypeFromMetadata(metadata: BfMetadataEntry[] | null): TransactionType {
  if (!metadata || !Array.isArray(metadata)) return "other";
  for (const entry of metadata) {
    if (entry.label === "674" && entry.json_metadata?.msg) {
      const msg = entry.json_metadata.msg;
      if (msg[0] === "Masumi" && msg[1] && KNOWN_TYPES.has(msg[1])) {
        return msg[1] as TransactionType;
      }
    }
  }
  return "other";
}

function mapUtxo(entry: BfUTXOEntry): UTXOEntry {
  return {
    address: entry.address,
    is_escrow: entry.address === ADDRESS,
    amounts: entry.amount.map((a): AmountEntry => ({
      unit: a.unit,
      quantity: a.quantity,
      is_usdm: a.unit.startsWith(USDM_PREFIX),
    })),
  };
}

function sumAda(entries: UTXOEntry[]): number {
  let total = 0;
  for (const e of entries) {
    for (const a of e.amounts) {
      if (a.unit === "lovelace") total += parseInt(a.quantity, 10);
    }
  }
  return total / 1_000_000;
}

function sumUsdm(entries: UTXOEntry[]): number {
  let total = 0;
  for (const e of entries) {
    for (const a of e.amounts) {
      if (a.is_usdm) total += parseInt(a.quantity, 10);
    }
  }
  return total / 1_000_000;
}

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash) {
    return Response.json({ error: "Missing hash parameter" }, { status: 400 });
  }

  try {
    const [txData, utxos, metadata] = await Promise.all([
      bfFetch(`/txs/${hash}`, 86400),
      bfFetch(`/txs/${hash}/utxos`, 86400),
      bfFetch(`/txs/${hash}/metadata`, 86400),
    ]);

    if (!txData || !utxos) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    const inputs = (utxos.inputs || []).map(mapUtxo);
    const outputs = (utxos.outputs || []).map(mapUtxo);
    const metadataArray = Array.isArray(metadata) && metadata.length > 0 ? metadata : null;

    const detail: TransactionDetail = {
      hash,
      block_height: txData.block_height,
      block_time: txData.block_time,
      fees: txData.fees,
      size: txData.size,
      type: detectTypeFromMetadata(metadataArray),
      inputs,
      outputs,
      metadata: metadataArray,
      input_total_ada: sumAda(inputs),
      output_total_ada: sumAda(outputs),
      input_total_usdm: sumUsdm(inputs),
      output_total_usdm: sumUsdm(outputs),
    };

    return Response.json(detail);
  } catch (err) {
    console.error("explorer/tx-detail error:", err);
    return Response.json(
      { error: "Failed to fetch transaction detail" },
      { status: 500 }
    );
  }
}

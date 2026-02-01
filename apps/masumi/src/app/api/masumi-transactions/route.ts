import { bfFetch, ADDRESS } from "@/lib/blockfrost";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get("page") || "1");

  try {
    const txs = await bfFetch(
      `/addresses/${ADDRESS}/transactions?count=10&page=${page}&order=desc`,
      60
    );

    if (!txs || !Array.isArray(txs) || txs.length === 0) {
      return Response.json({ transactions: [], page });
    }

    const transactions = txs.map(
      (tx: { tx_hash: string; block_height: number; block_time: number }) => ({
        tx_hash: tx.tx_hash,
        block_height: tx.block_height,
        block_time: tx.block_time,
      })
    );

    return Response.json({ transactions, page });
  } catch (err) {
    console.error("masumi-transactions error:", err);
    return Response.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

import { getDb, hasData } from "@/lib/explorer-db";
import { parseNetworkParam } from "@/lib/network-config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const network = parseNetworkParam(req.nextUrl.searchParams);
  const page = Number(req.nextUrl.searchParams.get("page") || "1");
  const pageSize = 10;

  try {
    if (!hasData(network)) {
      return Response.json({ transactions: [], page });
    }

    const d = getDb(network);
    const offset = (Math.max(1, page) - 1) * pageSize;

    const rows = d
      .prepare(
        `SELECT hash, block_height, block_time
         FROM transactions
         ORDER BY block_time DESC, block_height DESC
         LIMIT ? OFFSET ?`
      )
      .all(pageSize, offset) as { hash: string; block_height: number; block_time: number }[];

    const transactions = rows.map((r) => ({
      tx_hash: r.hash,
      block_height: r.block_height,
      block_time: r.block_time,
    }));

    return Response.json({ transactions, page });
  } catch (err) {
    console.error("masumi-transactions error:", err);
    return Response.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

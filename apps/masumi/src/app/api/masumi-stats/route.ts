import { hasData, getTotalVolume, getDb } from "@/lib/explorer-db";
import { parseNetworkParam, getNetworkConfig } from "@/lib/network-config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const network = parseNetworkParam(req.nextUrl.searchParams);

    if (!hasData(network)) {
      // No local data (e.g. local dev) → serve the production backend's stats.
      const base = getNetworkConfig(network).proxyBase;
      if (base) {
        try {
          const res = await fetch(`${base}/api/masumi-stats?network=${network}`);
          if (res.ok) return Response.json(await res.json());
        } catch {
          /* fall through */
        }
      }
      return Response.json({ error: "No data available" }, { status: 503 });
    }

    const d = getDb(network);

    const totalTransactions = (
      d.prepare("SELECT COUNT(*) as c FROM transactions").get() as { c: number }
    ).c;

    const registeredAgents = (
      d.prepare("SELECT COUNT(*) as c FROM agent_wallets").get() as { c: number }
    ).c;

    const latestRow = d
      .prepare("SELECT block_time FROM transactions ORDER BY block_time DESC LIMIT 1")
      .get() as { block_time: number } | undefined;

    const lastTransactionTime = latestRow
      ? new Date(latestRow.block_time * 1000).toISOString()
      : null;

    const volumeUsdm = getTotalVolume(network);

    return Response.json({
      totalTransactions,
      registeredAgents,
      lastTransactionTime,
      volumeUsdm,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    return Response.json({ error: "Stats temporarily unavailable" }, { status: 503 });
  }
}

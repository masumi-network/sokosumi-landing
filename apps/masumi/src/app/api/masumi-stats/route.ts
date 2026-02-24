import { bfFetch, ADDRESS, POLICY_ID } from "@/lib/blockfrost";
import { hasData, getTotalVolume } from "@/lib/explorer-db";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cached: { data: Record<string, unknown>; fetchedAt: number } | null = null;
let fetching: Promise<Record<string, unknown>> | null = null;

async function countAssets(): Promise<number> {
  let total = 0;
  for (let page = 1; page <= 50; page++) {
    const data = await bfFetch(
      `/assets/policy/${POLICY_ID}?count=100&page=${page}&order=asc`,
      86400
    );
    if (!data || !Array.isArray(data) || data.length === 0) break;
    total += data.length;
    if (data.length < 100) break;
  }
  return total;
}

async function fetchStats(): Promise<Record<string, unknown>> {
  const [addressTotal, latestTx, registeredAgents] = await Promise.all([
    bfFetch(`/addresses/${ADDRESS}/total`, 86400),
    bfFetch(`/addresses/${ADDRESS}/transactions?count=1&order=desc`, 86400),
    countAssets(),
  ]);

  const totalTransactions = addressTotal?.tx_count ?? 0;

  let lastTransactionTime: string | null = null;
  if (latestTx && Array.isArray(latestTx) && latestTx.length > 0) {
    const blockData = await bfFetch(`/blocks/${latestTx[0].block_height}`, 86400);
    if (blockData?.time) {
      lastTransactionTime = new Date(blockData.time * 1000).toISOString();
    }
  }

  let volumeUsdm: number | null = null;
  if (hasData()) {
    volumeUsdm = getTotalVolume();
  }

  return {
    totalTransactions,
    registeredAgents,
    lastTransactionTime,
    volumeUsdm,
    updatedAt: new Date().toISOString(),
  };
}

async function getStats(): Promise<Record<string, unknown>> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.data;
  }

  // Deduplicate concurrent requests — only one fetch at a time
  if (!fetching) {
    fetching = fetchStats()
      .then((data) => {
        cached = { data, fetchedAt: Date.now() };
        fetching = null;
        return data;
      })
      .catch((err) => {
        fetching = null;
        throw err;
      });
  }

  return fetching;
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getStats();
    return Response.json(stats);
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    // Serve stale cache if available
    if (cached) return Response.json(cached.data);
    // Fall back to static file
    try {
      const { readFile } = await import("fs/promises");
      const { join } = await import("path");
      const raw = await readFile(join(process.cwd(), "public", "data", "stats.json"), "utf-8");
      return Response.json(JSON.parse(raw));
    } catch {
      return Response.json({ error: "Stats temporarily unavailable" }, { status: 503 });
    }
  }
}

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
      return Response.json({ agents: [], page, hasMore: false, total: 0 });
    }

    const d = getDb(network);
    const offset = (Math.max(1, page) - 1) * pageSize;

    const total = (
      d.prepare("SELECT COUNT(*) as c FROM agent_wallets").get() as { c: number }
    ).c;

    const rows = d
      .prepare(
        `SELECT asset, name, address FROM agent_wallets
         ORDER BY name ASC
         LIMIT ? OFFSET ?`
      )
      .all(pageSize + 1, offset) as { asset: string; name: string; address: string }[];

    const hasMore = rows.length > pageSize;
    const agents = rows.slice(0, pageSize).map((r) => ({
      asset: r.asset,
      name: r.name,
      walletAddress: r.address,
    }));

    return Response.json({ agents, page, hasMore, total });
  } catch (err) {
    console.error("masumi-agents error:", err);
    return Response.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

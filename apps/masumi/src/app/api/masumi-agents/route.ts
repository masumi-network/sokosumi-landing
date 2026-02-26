import { getDb, hasData } from "@/lib/explorer-db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get("page") || "1");
  const pageSize = 10;

  try {
    if (!hasData()) {
      return Response.json({ agents: [], page, hasMore: false });
    }

    const d = getDb();
    const offset = (Math.max(1, page) - 1) * pageSize;

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

    return Response.json({ agents, page, hasMore });
  } catch (err) {
    console.error("masumi-agents error:", err);
    return Response.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

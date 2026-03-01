import { getChartDataOrProxy, type ChartRange } from "@/lib/explorer-db";
import { parseNetworkParam } from "@/lib/network-config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const VALID_RANGES = new Set(["30", "90", "365", "all"]);

export async function GET(req: NextRequest) {
  try {
    const network = parseNetworkParam(req.nextUrl.searchParams);
    const rangeParam = req.nextUrl.searchParams.get("range") || "30";
    const range: ChartRange = VALID_RANGES.has(rangeParam)
      ? (rangeParam as ChartRange)
      : "30";
    return Response.json(await getChartDataOrProxy(network, range));
  } catch (err) {
    console.error("explorer/chart-data error:", err);
    return Response.json(
      { error: "Failed to compute chart data" },
      { status: 500 }
    );
  }
}

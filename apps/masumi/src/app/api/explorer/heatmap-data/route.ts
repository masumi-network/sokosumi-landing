import { getHeatmapDataOrProxy } from "@/lib/explorer-db";
import { parseNetworkParam } from "@/lib/network-config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const network = parseNetworkParam(req.nextUrl.searchParams);
    return Response.json(await getHeatmapDataOrProxy(network));
  } catch (err) {
    console.error("explorer/heatmap-data error:", err);
    return Response.json(
      { error: "Failed to compute heatmap data" },
      { status: 500 }
    );
  }
}

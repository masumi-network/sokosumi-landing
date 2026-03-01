import { getVolumeSeriesOrProxy } from "@/lib/explorer-db";
import { parseNetworkParam } from "@/lib/network-config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const network = parseNetworkParam(req.nextUrl.searchParams);
    return Response.json(await getVolumeSeriesOrProxy(network));
  } catch (err) {
    console.error("explorer/volume-series error:", err);
    return Response.json(
      { error: "Failed to compute volume series" },
      { status: 500 }
    );
  }
}

import { getAgentMap, hasData } from "@/lib/explorer-db";
import { parseNetworkParam } from "@/lib/network-config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const network = parseNetworkParam(req.nextUrl.searchParams);
    if (hasData(network)) {
      return Response.json(getAgentMap(network));
    }
    return Response.json({});
  } catch (err) {
    console.error("explorer/agent-map error:", err);
    return Response.json({});
  }
}

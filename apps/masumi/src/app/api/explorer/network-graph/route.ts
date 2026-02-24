import { getNetworkGraph, hasData } from "@/lib/explorer-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (hasData()) {
      return Response.json(getNetworkGraph());
    }
    return Response.json({ nodes: [], edges: [] });
  } catch (err) {
    console.error("explorer/network-graph error:", err);
    return Response.json({ nodes: [], edges: [] });
  }
}

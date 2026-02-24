import { getAgentMap, hasData } from "@/lib/explorer-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (hasData()) {
      return Response.json(getAgentMap());
    }
    return Response.json({});
  } catch (err) {
    console.error("explorer/agent-map error:", err);
    return Response.json({});
  }
}

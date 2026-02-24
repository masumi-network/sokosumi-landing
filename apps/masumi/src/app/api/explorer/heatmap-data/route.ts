import { getHeatmapDataOrProxy } from "@/lib/explorer-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getHeatmapDataOrProxy());
  } catch (err) {
    console.error("explorer/heatmap-data error:", err);
    return Response.json(
      { error: "Failed to compute heatmap data" },
      { status: 500 }
    );
  }
}

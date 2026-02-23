import { getChartDataOrProxy } from "@/lib/explorer-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getChartDataOrProxy());
  } catch (err) {
    console.error("explorer/chart-data error:", err);
    return Response.json(
      { error: "Failed to compute chart data" },
      { status: 500 }
    );
  }
}

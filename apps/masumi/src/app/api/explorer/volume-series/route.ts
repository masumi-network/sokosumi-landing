import { getVolumeSeriesOrProxy } from "@/lib/explorer-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getVolumeSeriesOrProxy());
  } catch (err) {
    console.error("explorer/volume-series error:", err);
    return Response.json(
      { error: "Failed to compute volume series" },
      { status: 500 }
    );
  }
}

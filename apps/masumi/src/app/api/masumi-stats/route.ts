import { readFile } from "fs/promises";
import path from "path";

const STATS_PATH = path.join(process.cwd(), "public", "data", "stats.json");

export async function GET() {
  try {
    const raw = await readFile(STATS_PATH, "utf-8");
    const stats = JSON.parse(raw);
    return Response.json(stats);
  } catch {
    return Response.json(
      { error: "Stats not available yet. Run: node scripts/update-stats.mjs" },
      { status: 503 }
    );
  }
}

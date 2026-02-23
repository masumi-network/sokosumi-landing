import { NextRequest } from "next/server";
import { getTxPageOrProxy } from "@/lib/explorer-db";
import type { TransactionType } from "@/lib/explorer-types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1"));
  const search = (req.nextUrl.searchParams.get("search") || "").trim();
  const typeFilter = req.nextUrl.searchParams.get("type") as TransactionType | null;

  try {
    const result = await getTxPageOrProxy(page, search || undefined, typeFilter || undefined);
    return Response.json(result);
  } catch (err) {
    console.error("explorer/transactions error:", err);
    return Response.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

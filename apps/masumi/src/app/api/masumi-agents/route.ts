import { bfFetch, POLICY_ID } from "@/lib/blockfrost";
import { NextRequest } from "next/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

function str(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.join("");
  if (typeof v === "object" && v !== null && "name" in v)
    return str((v as any).name);
  return String(v);
}

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get("page") || "1");

  try {
    const assets = await bfFetch(
      `/assets/policy/${POLICY_ID}?count=10&page=${page}&order=desc`,
      300
    );

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return Response.json({ agents: [], page });
    }

    const agents = await Promise.all(
      assets.map(async (a: { asset: string; quantity: string }) => {
        const detail = await bfFetch(`/assets/${a.asset}`, 300);
        const meta: any = detail?.onchain_metadata || detail?.metadata || {};

        const author = meta.author;
        let authorName: string | null = null;
        let orgName: string | null = null;
        if (author && typeof author === "object" && !Array.isArray(author)) {
          authorName = str(author.name);
          orgName = str(author.organization);
        } else {
          authorName = str(author);
          orgName = str(meta.organization);
        }

        const cap = meta.capability;
        let capName: string | null = null;
        let capVersion: string | null = null;
        if (cap && typeof cap === "object" && !Array.isArray(cap)) {
          capName = str(cap.name);
          capVersion = str(cap.version);
        } else {
          capName = str(cap);
          capVersion = str(meta.version);
        }

        let mintedAt: number | null = null;
        if (detail?.initial_mint_tx_hash) {
          const mintTx = await bfFetch(
            `/txs/${detail.initial_mint_tx_hash}`,
            86400
          );
          if (mintTx?.block_time) mintedAt = mintTx.block_time;
        }

        const holders = await bfFetch(`/assets/${a.asset}/addresses`, 300);
        const walletAddress = holders?.[0]?.address || null;

        return {
          asset: a.asset,
          name: str(meta.name) || detail?.asset_name || a.asset.slice(0, 16),
          description: str(meta.description),
          author: authorName,
          organization: orgName,
          capability: capName,
          version: capVersion,
          pricingType: str(meta.pricingType),
          image: str(meta.image),
          fingerprint: detail?.fingerprint || null,
          mintedAt,
          walletAddress,
        };
      })
    );

    return Response.json({ agents, page });
  } catch (err) {
    console.error("masumi-agents error:", err);
    return Response.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

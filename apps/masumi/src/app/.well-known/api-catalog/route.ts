import { NextResponse } from "next/server";

/**
 * Machine-readable catalog of HTTP APIs this site exposes (RFC 9727 api-catalog).
 * Protocol-level Masumi APIs are documented at docs.masumi.network.
 */
export async function GET() {
  const body = {
    title: "Masumi marketing site — public HTTP APIs",
    site: "https://www.masumi.network",
    endpoints: [
      {
        path: "/api/masumi-stats",
        description: "Aggregate statistics for the Masumi network explorer.",
      },
      {
        path: "/api/masumi-agents",
        description: "Paginated list of registered agents (explorer data).",
      },
      {
        path: "/api/masumi-transactions",
        description: "Recent Masumi-related transactions (explorer data).",
      },
      {
        path: "/api/explorer/transactions",
        description: "Explorer transaction feed.",
      },
      {
        path: "/api/explorer/chart-data",
        description: "Chart series for the explorer dashboard.",
      },
      {
        path: "/api/explorer/volume-series",
        description: "Volume time series for charts.",
      },
      {
        path: "/api/explorer/heatmap-data",
        description: "Activity heatmap data.",
      },
      {
        path: "/api/explorer/network-graph",
        description: "Network graph data for visualization.",
      },
      {
        path: "/api/explorer/agent-map",
        description: "Agent map positions for the explorer.",
      },
      {
        path: "/api/explorer/tx-detail",
        description: "Transaction detail lookup.",
      },
    ],
    protocolDocumentation: "https://docs.masumi.network/api-reference.md",
    agentSkill: "https://www.masumi.network/skill.md",
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

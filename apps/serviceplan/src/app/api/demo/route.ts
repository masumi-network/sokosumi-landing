import { NextRequest, NextResponse } from "next/server";
import { appendSignupRow } from "@/lib/sheets";

const INBOUND_API_URL = "https://inbound.new/api/e2/emails";
const INBOUND_API_KEY = process.env.INBOUND_API_KEY || "";
const NOTIFICATION_FROM = "notifications@agents.utxoag.com";
const NOTIFICATION_TO = process.env.DEMO_NOTIFY_TO || "patrick@nmkr.io";
const NOTIFICATION_CC =
  process.env.DEMO_NOTIFY_CC || "agentic@house-of-communication.com";

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function detectLocale(req: NextRequest): string {
  const referer = req.headers.get("referer") || "";
  return referer.includes("/de/") || referer.endsWith("/de") ? "de" : "en";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const locale =
      body.locale === "de" || body.locale === "en"
        ? body.locale
        : body.source === "agenturen"
          ? "de"
          : detectLocale(req);

    appendSignupRow([
      new Date().toISOString(),
      "demo",
      body.name ?? "",
      body.email ?? "",
      body.websiteUrl ?? "",
      body.category ?? "",
      locale,
      body.source ?? "request-a-demo",
    ]).catch(() => {});

    // On the audience LPs the second field is an organization name, not a URL.
    const websiteLabel =
      body.source === "agenturen" || body.source === "agencies"
        ? "Agency"
        : body.source === "enterprise"
          ? "Company"
          : "Website";
    const rows: [string, string][] = [
      ["Name", body.name ?? ""],
      ["Email", body.email ?? ""],
      [websiteLabel, body.websiteUrl ?? ""],
      ["Support Area", body.category ?? ""],
    ];

    const res = await fetch(INBOUND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${INBOUND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFICATION_FROM,
        to: NOTIFICATION_TO,
        cc: NOTIFICATION_CC,
        subject: `Demo Request: ${body.name} (${body.email})`,
        html: `<h2>New Demo Request</h2>
<table style="border-collapse:collapse;width:100%;max-width:500px;">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:8px;font-weight:bold;">${label}</td><td style="padding:8px;">${escapeHtml(value)}</td></tr>`
  )
  .join("\n")}
</table>`,
        text: `New Demo Request\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: res.ok, id: data.id });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to send" },
      { status: 500 }
    );
  }
}

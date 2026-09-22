import { NextRequest, NextResponse } from "next/server";
import { appendSignupRow } from "@/lib/sheets";

// Demo requests notify via Resend. The sender domain must be verified in
// Resend (sokosumi.com is); recipients are overridable per environment.
// Until RESEND_API_KEY is set in the environment, the previous inbound.new
// path keeps working as fallback.
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const INBOUND_API_KEY = process.env.INBOUND_API_KEY || "";
const NOTIFICATION_FROM =
  process.env.DEMO_NOTIFY_FROM || "Serviceplan Agents <noreply@sokosumi.com>";
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
    const locale = body.source === "agenturen" ? "de" : detectLocale(req);

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

    // On the /agenturen LP the second field is the agency name, not a URL.
    const websiteLabel = body.source === "agenturen" ? "Agentur" : "Website";
    const rows: [string, string][] = [
      ["Name", body.name ?? ""],
      ["Email", body.email ?? ""],
      [websiteLabel, body.websiteUrl ?? ""],
      ["Support Area", body.category ?? ""],
    ];

    const html = `<h2>New Demo Request</h2>
<table style="border-collapse:collapse;width:100%;max-width:500px;">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:8px;font-weight:bold;">${label}</td><td style="padding:8px;">${escapeHtml(value)}</td></tr>`
  )
  .join("\n")}
</table>`;
    const text = `New Demo Request\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}`;
    const subject = `Demo Request: ${body.name} (${body.email})`;

    const res = RESEND_API_KEY
      ? await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: NOTIFICATION_FROM,
            to: [NOTIFICATION_TO],
            ...(NOTIFICATION_CC ? { cc: [NOTIFICATION_CC] } : {}),
            reply_to: body.email || undefined,
            subject,
            html,
            text,
          }),
        })
      : await fetch("https://inbound.new/api/e2/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${INBOUND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "notifications@agents.utxoag.com",
            to: NOTIFICATION_TO,
            cc: NOTIFICATION_CC,
            subject,
            html,
            text,
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

import { NextRequest, NextResponse } from "next/server";
import { appendSignupRow } from "@/lib/sheets";

const INBOUND_API_URL = "https://inbound.new/api/e2/emails";
const INBOUND_API_KEY = process.env.INBOUND_API_KEY || "";
const NOTIFICATION_FROM = "notifications@agents.utxoag.com";
const NOTIFICATION_TO = "patrick@nmkr.io";
const NOTIFICATION_CC = "agentic@house-of-communication.com";

function detectLocale(req: NextRequest): string {
  const referer = req.headers.get("referer") || "";
  return referer.includes("/de/") || referer.endsWith("/de") ? "de" : "en";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const locale = detectLocale(req);

    appendSignupRow([
      new Date().toISOString(),
      "demo",
      body.name ?? "",
      body.email ?? "",
      body.websiteUrl ?? "",
      body.category ?? "",
      locale,
      "request-a-demo",
    ]).catch(() => {});

    const res = await fetch(INBOUND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${INBOUND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFICATION_FROM,
        to: NOTIFICATION_TO,
        cc: NOTIFICATION_CC,
        subject: `Demo Request: ${body.name} (${body.email})`,
        html: `<h2>New Demo Request</h2>
<table style="border-collapse:collapse;width:100%;max-width:500px;">
<tr><td style="padding:8px;font-weight:bold;">Name</td><td style="padding:8px;">${body.name}</td></tr>
<tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${body.email}</td></tr>
<tr><td style="padding:8px;font-weight:bold;">Website</td><td style="padding:8px;">${body.websiteUrl}</td></tr>
<tr><td style="padding:8px;font-weight:bold;">Support Area</td><td style="padding:8px;">${body.category}</td></tr>
</table>`,
        text: `New Demo Request\n\nName: ${body.name}\nEmail: ${body.email}\nWebsite: ${body.websiteUrl}\nSupport Area: ${body.category}`,
      }),
    });
    const data = await res.json();
    return NextResponse.json({ ok: res.ok, id: data.id });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to send" }, { status: 500 });
  }
}

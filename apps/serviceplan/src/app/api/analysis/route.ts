import { NextRequest, NextResponse } from "next/server";
import { appendSignupRow } from "@/lib/sheets";

const ONBOARDING_URL = "https://elena.serviceplan-agents.com/onboarding/submit";
const INBOUND_API_URL = "https://inbound.new/api/e2/emails";
const INBOUND_API_KEY = process.env.INBOUND_API_KEY || "";
const NOTIFICATION_FROM = "notifications@agents.utxoag.com";
const NOTIFICATION_TO = "patrick@nmkr.io";

function detectLocale(req: NextRequest): string {
  const referer = req.headers.get("referer") || "";
  return referer.includes("/de/") || referer.endsWith("/de") ? "de" : "en";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, website_url } = body;
    const locale = detectLocale(req);

    appendSignupRow([
      new Date().toISOString(),
      "analysis",
      "",
      email ?? "",
      website_url ?? "",
      "",
      locale,
      "free-analysis",
    ]).catch(() => {});

    // Submit to elena onboarding
    const res = await fetch(ONBOARDING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, website_url }),
    });

    // Send notification email (fire and forget)
    fetch(INBOUND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${INBOUND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFICATION_FROM,
        to: NOTIFICATION_TO,
        subject: `New Free Analysis: ${email}`,
        html: `<h2>New Free Analysis Request</h2>
<table style="border-collapse:collapse;width:100%;max-width:500px;">
<tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${email}</td></tr>
<tr><td style="padding:8px;font-weight:bold;">Website</td><td style="padding:8px;">${website_url}</td></tr>
</table>`,
        text: `New Free Analysis Request\n\nEmail: ${email}\nWebsite: ${website_url}`,
      }),
    }).catch(() => {});

    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to submit" }, { status: 500 });
  }
}

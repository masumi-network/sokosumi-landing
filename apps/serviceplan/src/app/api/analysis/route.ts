import { NextRequest, NextResponse } from "next/server";
import { appendSignupRow } from "@/lib/sheets";
import { guardLead } from "@/lib/leadGuard";
import { normalizeWebsite } from "@/lib/leadRules";

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
    // The audience LPs (/agencies, /enterprise) post their source and locale.
    const LP_SOURCES = new Set(["agenturen", "agencies", "enterprise"]);
    const fromLandingPage = LP_SOURCES.has(body.source);
    const source = fromLandingPage ? body.source : "free-analysis";

    const check = await guardLead(req, body, {
      fromLandingPage,
      rejectFreemail: fromLandingPage,
      website: body.website_url,
    });
    if (!check.ok) {
      return NextResponse.json(check, { status: check.code === "rate_limited" ? 429 : 400 });
    }
    const email = String(body.email).trim();
    const website_url = normalizeWebsite(body.website_url) as string;
    const locale =
      body.locale === "de" || body.locale === "en"
        ? body.locale
        : source === "agenturen"
          ? "de"
          : detectLocale(req);

    appendSignupRow([
      new Date().toISOString(),
      "analysis",
      "",
      email ?? "",
      website_url ?? "",
      "",
      locale,
      source,
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

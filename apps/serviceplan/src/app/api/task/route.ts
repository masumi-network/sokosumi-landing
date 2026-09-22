import { NextRequest, NextResponse } from "next/server";
import { appendSignupRow } from "@/lib/sheets";

const INBOUND_API_URL = "https://inbound.new/api/e2/emails";
const INBOUND_API_KEY = process.env.INBOUND_API_KEY || "";
const NOTIFICATION_FROM = "notifications@agents.utxoag.com";
const NOTIFICATION_TO = "patrick@nmkr.io";
const NOTIFICATION_CC = "agentic@house-of-communication.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Task-start submissions from the /agenturen ads landing page. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "");
    const task = String(body.task ?? "");
    const topic = String(body.topic ?? "");

    if (!email || !task) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    appendSignupRow([
      new Date().toISOString(),
      "task",
      "",
      email,
      "",
      topic,
      "de",
      "agenturen",
      task,
    ]).catch(() => {});

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
        subject: `New Task Start: ${email}`,
        html: `<h2>New Task Start (Agenturen LP)</h2>
<table style="border-collapse:collapse;width:100%;max-width:600px;">
<tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${escapeHtml(email)}</td></tr>
<tr><td style="padding:8px;font-weight:bold;">Topic</td><td style="padding:8px;">${escapeHtml(topic)}</td></tr>
<tr><td style="padding:8px;font-weight:bold;vertical-align:top;">Task</td><td style="padding:8px;white-space:pre-wrap;">${escapeHtml(task)}</td></tr>
</table>`,
        text: `New Task Start (Agenturen LP)\n\nEmail: ${email}\nTopic: ${topic}\n\nTask:\n${task}`,
      }),
    });

    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to submit" },
      { status: 500 }
    );
  }
}

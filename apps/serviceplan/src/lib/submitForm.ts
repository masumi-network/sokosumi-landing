import { HONEYPOT_FIELD, type LeadErrorCode, type LeadField } from "@/lib/leadRules";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function pushDataLayerEvent(event: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event });
}

export async function submitAnalysisForm(
  email: string,
  websiteUrl: string
): Promise<boolean> {
  try {
    const res = await fetch("/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, website_url: websiteUrl }),
    });
    const data = await res.json();
    if (data.ok) pushDataLayerEvent("free_analysis_request");
    return data.ok;
  } catch {
    return false;
  }
}

export type LpResult =
  | { ok: true }
  | { ok: false; field: LeadField; code: LeadErrorCode };

async function postLead(
  url: string,
  payload: Record<string, unknown>,
  event: string
): Promise<LpResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) {
      pushDataLayerEvent(event);
      return { ok: true };
    }
    return data.code
      ? { ok: false, field: data.field ?? "form", code: data.code }
      : { ok: false, field: "form", code: "rejected" };
  } catch {
    return { ok: false, field: "form", code: "rejected" };
  }
}

/** Primary conversion of the audience LPs (/agencies, /enterprise): the
 *  free competitive analysis (same endpoint as the homepage form). Pushes
 *  the LPs' own `task_start_request` event — only after the server accepted
 *  the lead — so the published GTM/Meta Lead tag fires. */
export function submitLpAnalysis(payload: {
  email: string;
  website_url: string;
  source: "agencies" | "enterprise";
  locale: "de" | "en";
  [HONEYPOT_FIELD]: string;
}): Promise<LpResult> {
  return postLead("/api/analysis", payload, "task_start_request");
}

export function submitLpDemo(payload: {
  name: string;
  email: string;
  websiteUrl: string;
  category: string;
  source: "agencies" | "enterprise";
  locale: "de" | "en";
  [HONEYPOT_FIELD]: string;
}): Promise<LpResult> {
  return postLead("/api/demo", payload, "demo_request");
}

export async function sendDemoNotification(formData: {
  name: string;
  email: string;
  websiteUrl: string;
  category: string;
  source?: string;
  locale?: string;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.ok) pushDataLayerEvent("demo_request");
    return data.ok;
  } catch {
    return false;
  }
}

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

/** Primary conversion of the audience LPs (/agencies, /enterprise): the
 *  free competitive analysis (same endpoint as the homepage form). Pushes
 *  the LPs' own `task_start_request` event so the published GTM/Meta Lead
 *  tag fires. */
export async function submitLpAnalysis(
  email: string,
  websiteUrl: string,
  source: "agencies" | "enterprise",
  locale: "de" | "en"
): Promise<boolean> {
  try {
    const res = await fetch("/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, website_url: websiteUrl, source, locale }),
    });
    const data = await res.json();
    if (data.ok) pushDataLayerEvent("task_start_request");
    return data.ok;
  } catch {
    return false;
  }
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

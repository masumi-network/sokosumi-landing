import { draftMode } from "next/headers";

// Payload CMS client. Content is edited at the CMS admin panel and fetched
// here with ISR (5 min) so publishing never requires a deploy. When Next.js
// draft mode is enabled (via /api/preview) detail lookups fetch the latest
// draft version instead, authenticated with CMS_PREVIEW_KEY and uncached.
export const CMS_URL =
  process.env.CMS_URL || "https://payload-production-6f43.up.railway.app";

export async function isDraftModeEnabled(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    // Outside a request scope (e.g. generateStaticParams at build time).
    return false;
  }
}

export async function cmsFetch<T>(
  apiPath: string,
  opts?: { draft?: boolean },
): Promise<T | null> {
  try {
    const url = `${CMS_URL}/api${apiPath}${
      opts?.draft ? (apiPath.includes("?") ? "&" : "?") + "draft=true" : ""
    }`;
    const res = await fetch(
      url,
      opts?.draft
        ? {
            cache: "no-store",
            headers: {
              Authorization: `users API-Key ${process.env.CMS_PREVIEW_KEY}`,
            },
          }
        : { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function cmsFileUrl(url: string | undefined | null): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `${CMS_URL}${url}`;
}

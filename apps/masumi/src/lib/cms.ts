// Payload CMS client. Content is edited at the CMS admin panel and fetched
// here with ISR (5 min) so publishing never requires a deploy.
export const CMS_URL =
  process.env.CMS_URL || "https://payload-production-6f43.up.railway.app";

export async function cmsFetch<T>(apiPath: string): Promise<T | null> {
  try {
    const res = await fetch(`${CMS_URL}/api${apiPath}`, {
      next: { revalidate: 300 },
    });
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

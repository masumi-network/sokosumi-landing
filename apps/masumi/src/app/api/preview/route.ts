import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

// Enables Next.js draft mode so CMS editors can preview unpublished drafts.
// Called from the Payload admin preview button:
//   /api/preview?secret=<PREVIEW_SECRET>&path=/use-cases/foo

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const path = searchParams.get("path") ?? "";

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }
  if (!path.startsWith("/") || path.startsWith("//")) {
    return Response.json({ error: "Invalid path" }, { status: 400 });
  }

  (await draftMode()).enable();
  redirect(path);
}

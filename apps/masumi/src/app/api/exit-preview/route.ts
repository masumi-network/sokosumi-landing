import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

// Disables draft mode and returns to the published site.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "";

  (await draftMode()).disable();
  redirect(path.startsWith("/") && !path.startsWith("//") ? path : "/");
}

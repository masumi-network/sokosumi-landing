import { NextResponse } from "next/server";
import { getCurrentLearnUser } from "@/lib/learn-auth";
import { consumeRateLimit, getCredentialForUser, getCredentialForUserById, getCredentialsForUser } from "@/lib/learn-db";
import { mintCredential, reconcileCredentialMint } from "@/lib/learn-credentials";
import { isSameOrigin } from "@/lib/learn-api";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ credential: getCredentialForUser(user.id), credentials: getCredentialsForUser(user.id) }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { credentialId?: string } | null;
  const credential = body?.credentialId ? getCredentialForUserById(user.id, body.credentialId) : getCredentialForUser(user.id);
  if (!credential) return NextResponse.json({ error: "No credential" }, { status: 404 });
  if (!consumeRateLimit(`${user.id}:mint-status:${credential.id}`, 30, 3600)) return NextResponse.json({ error: "Too many status requests. Try again later." }, { status: 429 });
  try { return NextResponse.json({ credential: await reconcileCredentialMint(credential) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to refresh mint status", credential }, { status: 503 }); }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { credentialId?: string } | null;
  const credential = body?.credentialId ? getCredentialForUserById(user.id, body.credentialId) : getCredentialForUser(user.id);
  if (!credential) return NextResponse.json({ error: "No eligible credential" }, { status: 404 });
  if (!consumeRateLimit(`${user.id}:mint:${credential.id}`, 5, 3600)) return NextResponse.json({ error: "Too many mint requests. Try again later." }, { status: 429 });
  try { return NextResponse.json({ credential: await mintCredential(credential) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Minting failed", credential: getCredentialForUserById(user.id, credential.id) }, { status: 503 }); }
}

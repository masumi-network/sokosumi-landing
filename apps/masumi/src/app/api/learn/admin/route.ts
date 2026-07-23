import { NextRequest, NextResponse } from "next/server";
import { bearerAccess } from "@/lib/learn-api";
import { invalidateCredentialOwnerSessions, revokeCredential } from "@/lib/learn-db";

export const runtime = "nodejs";

const reasons = ["account_compromise", "fraudulent_proof", "issuer_incident", "operator_request", "policy_violation"] as const;
type Reason = typeof reasons[number];

export async function POST(request: NextRequest) {
  const access = bearerAccess(request, "MASUMI_LEARN_ADMIN_TOKEN");
  if (access == null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { action?: "revoke_credential" | "invalidate_owner_sessions"; credentialId?: string; reason?: Reason; invalidateOwnerSessions?: boolean; cascadeDependentCredentials?: boolean } | null;
  if (!body?.action || !body.credentialId || !/^[A-Za-z0-9:_-]{1,128}$/.test(body.credentialId) || !body.reason || !reasons.includes(body.reason)) {
    return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
  }
  if (body.action === "revoke_credential") {
    const result = revokeCredential(body.credentialId, body.reason, body.invalidateOwnerSessions === true, body.cascadeDependentCredentials !== false);
    return result ? NextResponse.json(result) : NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }
  if (body.action === "invalidate_owner_sessions") {
    const result = invalidateCredentialOwnerSessions(body.credentialId, body.reason);
    return result ? NextResponse.json(result) : NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }
  return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
}

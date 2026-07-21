import { NextResponse } from "next/server";
import { publicCredential } from "@/lib/learn-credentials";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) { const credential = publicCredential((await params).id); return credential ? NextResponse.json(credential) : NextResponse.json({ error: "Credential not found" }, { status: 404 }); }

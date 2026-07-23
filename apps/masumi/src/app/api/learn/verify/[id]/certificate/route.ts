import { NextResponse } from "next/server";
import { credentialCertificateSvg } from "@/lib/learn-credentials";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certificate = credentialCertificateSvg(id);
  if (!certificate) return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  return new NextResponse(certificate, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "content-disposition": `attachment; filename="masumi-learn-${id}.svg"`,
      "cache-control": "public, max-age=300",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}

import { NextResponse } from "next/server";

export const dynamic = "force-static";

const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://www.masumi.network/learn/credentials/v1",
  title: "Masumi Learn on-chain credential metadata v1",
  description: "Non-PII facts sent to the approved Cardano issuer for a Masumi Learn credential.",
  type: "object",
  additionalProperties: false,
  required: ["schema", "credentialId", "credentialType", "course", "courseVersion", "issuer", "score", "verificationUrl", "metadataHash"],
  properties: {
    schema: { const: "https://www.masumi.network/learn/credentials/v1" },
    credentialId: { type: "string", format: "uuid", description: "Opaque application-generated credential identifier." },
    credentialType: { enum: ["fundamentals", "builder"] },
    course: { enum: ["Masumi Fundamentals", "Masumi Builder"] },
    courseVersion: { type: "string", pattern: "^[a-z0-9-]+-v[0-9]+$" },
    issuer: { const: "Masumi Network" },
    score: { type: "integer", minimum: 0, maximum: 100 },
    verificationUrl: { type: "string", format: "uri", pattern: "^https://www\\.masumi\\.network/learn/verify/" },
    metadataHash: { type: "string", pattern: "^[a-f0-9]{64}$", description: "SHA-256 hash of the approved off-chain credential facts before this field is added." },
  },
} as const;

export function GET() {
  return NextResponse.json(schema, { headers: { "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } });
}

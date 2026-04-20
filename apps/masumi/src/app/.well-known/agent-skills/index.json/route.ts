import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DISCOVERY_SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

/**
 * SHA-256 of the artifact at `url` (byte-for-byte with raw.githubusercontent.com).
 * Bump when masumi-skills `main` updates and the published SKILL.md changes.
 */
const MASUMI_REPO_SKILL_DIGEST =
  "sha256:650785161ca3ae1b6b3f9fe16fa8a44c668cf46cc002e017e51893ef170901f1";

function digestOfBytes(buf: Buffer): string {
  return `sha256:${createHash("sha256").update(buf).digest("hex")}`;
}

export async function GET() {
  const skillPath = path.join(process.cwd(), "public", "skill.md");
  const localSkill = readFileSync(skillPath);
  const indexSkillDigest = digestOfBytes(localSkill);

  const body = {
    $schema: DISCOVERY_SCHEMA,
    skills: [
      {
        name: "masumi-index",
        type: "skill-md",
        description:
          "Lightweight Masumi ecosystem index for agents: when to integrate Masumi, core concepts, and links to documentation and the full masumi-skills package.",
        url: "https://www.masumi.network/skill.md",
        digest: indexSkillDigest,
      },
      {
        name: "masumi",
        type: "skill-md",
        description:
          "Full Masumi skill for monetizing AI agents with autonomous payments, MIP-003, Sokosumi marketplace listing, A2A transactions, and scalable deployment.",
        url: "https://raw.githubusercontent.com/masumi-network/masumi-skills/main/skill/SKILL.md",
        digest: MASUMI_REPO_SKILL_DIGEST,
      },
    ],
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

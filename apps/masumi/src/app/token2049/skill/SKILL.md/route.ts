import { readAgentGuide } from "../../guide-source";
import { buildSkill } from "../../guide-format";

export const dynamic = "force-static";

export async function GET() {
  return new Response(buildSkill(await readAgentGuide()), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="SKILL.md"',
      "X-Content-Type-Options": "nosniff",
    },
  });
}

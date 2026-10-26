import { readAgentGuide } from '../../guide-source';

export const dynamic = 'force-static';

export async function GET() {
  const markdown = await readAgentGuide();
  return new Response(`---
name: tum-hackathon-agent
description: Set up the TUM hackathon template, run a Sokosumi Task, and add an optional payment test on Cardano Preprod.
---

${markdown}`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'attachment; filename="SKILL.md"',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

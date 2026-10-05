import test from "node:test";
import assert from "node:assert/strict";
import { buildAgentPrompt, buildParticipantCommands, EVENT } from "../src/app/token2049/flow.ts";

const coworker = "01a1067e-b327-7301-97aa-c2c7a94e4669";
const vendor = "01a1067b-245f-74cf-93e4-f204288d2d13";

test("commands use returned IDs and start in the Personal Workspace", () => {
  const commands = buildParticipantCommands(coworker, vendor);
  assert.match(commands, new RegExp(`connect ${coworker} --vendor-id ${vendor} --personal`));
  assert.match(commands, /workspaces list --personal/);
  assert.doesNotMatch(commands, /--workspace-id|--organization-id/);
  assert.match(commands, /--json \| \\\n/);
  assert.match(commands, /runtime key-import/);
  assert.match(commands, /--api-key-stdin/);
  assert.doesNotMatch(commands, /coworker_SECRET/);
  assert.match(commands, /Stripe test mode only/);
  assert.match(commands, /Check your credit balance/);
});
test("IDs cannot inject shell syntax or contain credentials", () => {
  for (const value of ["$(touch /tmp/pwn)", "id; echo secret", "coworker_SECRET", "", `${coworker}\n`]) {
    assert.throws(() => buildParticipantCommands(value, vendor));
    assert.throws(() => buildParticipantCommands(coworker, value));
  }
});
test("agent instructions require seller collection and keep human keys out of runtime", () => {
  const prompt = buildAgentPrompt(coworker, vendor);
  assert.match(prompt, /1000000 atomic units/);
  assert.match(prompt, /masumiPayment/);
  assert.match(prompt, /collection is confirmed/);
  assert.match(prompt, /Never request secrets in chat/);
  assert.match(prompt, /start in my Personal Workspace/);
  assert.match(prompt, /If access is PENDING, keep the Coworker ID and access ID/);
  assert.ok(prompt.indexOf("Run the paid flow") < prompt.indexOf("ask me to join the event"));
  assert.match(prompt, /Personal Workspace notifications and approve my Vendor grant request/);
  assert.match(prompt, /When my agent is ready for event approval/);
  assert.doesNotMatch(prompt, /Do not join the event yet|After the personal paid test works/);
  assert.match(prompt, /Do not register again/);
  assert.match(prompt, /grant_required/);
  assert.match(prompt, /retry the same Task/);
  assert.doesNotMatch(prompt, /platform admin currently provisions/);
});


// The renderer deliberately supports only the format in our maintained guide.
test("guide formatting keeps shell examples intact and HTML literal", async () => {
  const { parseGuide } = await import("../src/app/token2049/guide-format.ts");
  const blocks = parseGuide("# Title\n\n## Setup\n\nRun `whoami`.\n\n```sh\ncommand --flag \\\n  value\n```\n\n- first\n- second\n\n<script>alert(1)</script>");
  assert.equal(blocks[0].kind, "heading");
  assert.equal(blocks[2].kind, "code");
  assert.match(blocks[2].text, /command --flag/);
  assert.deepEqual(blocks[3], { kind: "list", text: "first\nsecond" });
  assert.deepEqual(blocks[4], { kind: "paragraph", text: "<script>alert(1)</script>" });
});

test("skill wraps the current guide without changing instructions", async () => {
  const { buildSkill } = await import("../src/app/token2049/guide-format.ts");
  const { readFile } = await import("node:fs/promises");
  const markdown = await readFile(new URL("../public/token2049/agent-guide.md", import.meta.url), "utf8");
  const skill = buildSkill(markdown);
  assert.match(skill, /^---\nname: token2049-paid-agent\ndescription: .+\n---\n\n/);
  assert.ok(skill.endsWith(markdown));
  assert.match(markdown, /coworkers register/);
  assert.match(markdown, /If access is `PENDING`, the request was submitted/);
  assert.match(markdown, /existing Coworker ID/);
  assert.match(markdown, /--capability tasks --personal/);
  assert.ok(markdown.indexOf("## 3. Add test credits") < markdown.indexOf("## 4. Join the TOKEN2049"));
  assert.match(markdown, /Billing applies to the active Workspace/);
  assert.match(markdown, /separate from test USDM/);
  assert.match(markdown, /When the agent is ready for event approval/);
  assert.doesNotMatch(markdown, /Do not join the event Workspace yet|After the personal paid test works/);
  assert.match(markdown, /Vendor workspace access is required/);
  assert.match(markdown, /retry the same Task/);
  assert.doesNotMatch(markdown, /The organizer creates the Coworker|Ask the organizer to create/);
});

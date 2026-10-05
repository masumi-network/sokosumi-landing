import test from "node:test";
import * as flow from "../src/app/token2049/flow.ts";
import assert from "node:assert/strict";
import { buildAgentPrompt, buildParticipantCommands, EVENT } from "../src/app/token2049/flow.ts";

const coworker = "01a1067e-b327-7301-97aa-c2c7a94e4669";
const vendor = "01a1067b-245f-74cf-93e4-f204288d2d13";

test("commands use returned IDs and start in the Personal Workspace", () => {
  const commands = buildParticipantCommands(coworker, vendor).join("\n");
  assert.match(commands, new RegExp(`connect ${coworker} --vendor-id ${vendor} --personal`));
  assert.match(commands, /workspaces list --personal/);
  assert.doesNotMatch(commands, /--workspace-id|--organization-id/);
  assert.match(commands, /--json \| \\\n/);
  assert.match(commands, /runtime key-import/);
  assert.match(commands, /--api-key-stdin/);
  assert.doesNotMatch(commands, /coworker_SECRET/);
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
  assert.match(prompt, /approve the Vendor grant in Personal Workspace notifications/);
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
  assert.ok(markdown.indexOf("## 4. Add test credits") < markdown.indexOf("## 5. Join the TOKEN2049"));
  assert.match(markdown, /Billing applies to the active Workspace/);
  assert.match(markdown, /separate from test USDM/);
  assert.match(markdown, /When the agent is ready for event approval/);
  assert.doesNotMatch(markdown, /Do not join the event Workspace yet|After the personal paid test works/);
  assert.match(markdown, /Vendor workspace access is required/);
  assert.match(markdown, /retry the same Task/);
  assert.doesNotMatch(markdown, /The organizer creates the Coworker|Ask the organizer to create/);
});


test("event commands reuse the Coworker and validate IDs before shell output", () => {
  assert.equal(typeof flow.buildEventCommands, "function");
  const commands = flow.buildEventCommands(coworker, vendor).join("\n");
  assert.match(commands, new RegExp(`connect ${coworker} --vendor-id ${vendor} --workspace-id ${EVENT.organizationId}`));
  assert.match(commands, new RegExp(`workspaces check ${EVENT.organizationId}`));
  assert.doesNotMatch(commands, /register|api-key|--personal/);
  for (const value of ["$(touch /tmp/pwn)", `${coworker}\n`, "", "id; echo secret"]) {
    assert.throws(() => flow.buildEventCommands(value, vendor));
    assert.throws(() => flow.buildEventCommands(coworker, value));
  }
});

test("the complete guide separates rehearsal, payment proof, and event approval checkpoints", async () => {
  const { readFile } = await import("node:fs/promises");
  const markdown = await readFile(new URL("../public/token2049/agent-guide.md", import.meta.url), "utf8");
  assert.equal((markdown.match(/^## [1-6]\. /gm) ?? []).length, 6);
  assert.match(markdown, /^## How to use this guide$/m);
  assert.match(markdown, /Vendor membership role is `admin`, not a platform admin role/);
  assert.match(markdown, /Checkpoint: save/);
  assert.match(markdown, /First run: execution only/);
  assert.match(markdown, /Second run: paid Task/);
  assert.match(markdown, /System notification preferences/);
  assert.match(markdown, /approved for/);
  assert.match(markdown, /runtimeAccessStatus/);
  assert.match(markdown, /exact UTF-8 result/);
  assert.match(markdown, /1000000/);
  assert.match(markdown, /masumiPayment/);
  assert.match(markdown, /independent/);
  assert.match(markdown, /sokosumi --preprod runtime complete/);
  assert.doesNotMatch(markdown, /sokosumi runtime (?:start|complete)/);
});

test("guide subsections retain heading levels and code fences", async () => {
  const { parseGuide } = await import("../src/app/token2049/guide-format.ts");
  const blocks = parseGuide("## Payment\n\n### Database\n\n```sh\npg_isready\n```\n\n### Registration\n");
  assert.deepEqual(blocks.filter(block => block.kind === "heading").map(block => [block.text, block.level]), [
    ["Payment", 2], ["Database", 3], ["Registration", 3],
  ]);
  assert.deepEqual(blocks.find(block => block.kind === "code"), { kind: "code", text: "pg_isready" });
});

test("copy actions keep secure key import as one pipe and exclude commentary", () => {
  const personal = buildParticipantCommands(coworker, vendor);
  assert.equal(personal.length, 4);
  assert.ok(personal.every(command => !command.includes("#")));
  assert.match(personal[3], /api-key.+--json \| \\\n  sokosumi --preprod runtime key-import/);
  assert.match(personal[3], /--api-key-stdin$/);
  const event = flow.buildEventCommands(coworker, vendor);
  assert.equal(event.length, 2);
  assert.ok(event.every(command => !command.includes("#") && !command.includes("\n")));
});


test("inline guide labels render as emphasis while code and HTML stay literal", async () => {
  const { parseGuideInline } = await import("../src/app/token2049/guide-format.ts");
  assert.deepEqual(parseGuideInline("**Selling wallet address:** `**literal**` <script>alert(1)</script>"), [
    { kind: "text", text: "" },
    { kind: "strong", text: "Selling wallet address:" },
    { kind: "text", text: " " },
    { kind: "code", text: "**literal**" },
    { kind: "text", text: " <script>alert(1)</script>" },
  ]);
  assert.deepEqual(parseGuideInline("**unfinished label"), [{ kind: "text", text: "**unfinished label" }]);
  assert.deepEqual(parseGuideInline("https://example.com/guide."), [
    { kind: "text", text: "" },
    { kind: "link", text: "https://example.com/guide" },
    { kind: "text", text: "." },
    { kind: "text", text: "" },
  ]);
});

test("documented key setup preserves settings, reuses keys, and keeps secret output private", async () => {
  const fs = await import("node:fs/promises");
  const { spawnSync } = await import("node:child_process");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { parseGuide } = await import("../src/app/token2049/guide-format.ts");
  const markdown = await fs.readFile(new URL("../public/token2049/agent-guide.md", import.meta.url), "utf8");
  const prefix = "node --input-type=module -e '\n";
  const command = parseGuide(markdown).find(block => block.kind === "code" && block.text.startsWith(prefix)).text;
  const program = command.slice(prefix.length, -2).replace('"COWORKER_ID"', JSON.stringify(coworker));
  const dir = await fs.mkdtemp(join(tmpdir(), "token-key-setup-"));
  const key = "coworker_synthetic_test_only";
  try {
    assert.equal(spawnSync("git", ["init", "--quiet"], { cwd: dir }).status, 0);
    await fs.mkdir(join(dir, "bin"));
    await fs.writeFile(join(dir, ".gitignore"), ".env.local\n");
    await fs.writeFile(join(dir, ".env.local"), "MODEL_SETTING=preserved");
    await fs.writeFile(join(dir, "bin", "sokosumi"), `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
if (args[1] === "coworkers") {
  fs.appendFileSync(process.env.MOCK_CALLS, "create\\n");
  console.log(JSON.stringify({ coworkerId: args[3], apiKey: { token: ${JSON.stringify(key)} } }));
} else {
  const received = fs.readFileSync(0, "utf8");
  if (received !== ${JSON.stringify(key)} || process.env.MOCK_VAULT_FAIL) {
    console.error(${JSON.stringify(key)});
    process.exit(1);
  }
}
`, { mode: 0o755 });
    const env = { ...process.env, PATH: `${join(dir, "bin")}:${process.env.PATH}`, MOCK_CALLS: join(dir, "calls") };
    const run = (extra = {}) => spawnSync(process.execPath, ["--input-type=module", "-e", program], {
      cwd: dir, env: { ...env, ...extra }, encoding: "utf8",
    });
    const first = run();
    assert.equal(first.status, 0, first.stderr);
    const contents = await fs.readFile(join(dir, ".env.local"), "utf8");
    assert.ok(contents.startsWith("MODEL_SETTING=preserved\n"));
    assert.ok(contents.includes(`SOKOSUMI_COWORKER_API_KEY=${JSON.stringify(key)}\n`));
    assert.equal((await fs.stat(join(dir, ".env.local"))).mode & 0o777, 0o600);
    const resumed = run({ SOKOSUMI_COWORKER_API_KEY: "coworker_wrong_inherited_key" });
    assert.equal(resumed.status, 0, resumed.stderr);
    assert.equal(await fs.readFile(join(dir, ".env.local"), "utf8"), contents);
    const failedImport = run({ MOCK_VAULT_FAIL: "1" });
    assert.equal(failedImport.status, 1);
    for (const result of [first, resumed, failedImport]) assert.ok(!(result.stdout + result.stderr).includes(key));
    assert.equal(await fs.readFile(join(dir, "calls"), "utf8"), "create\n");
    await fs.writeFile(join(dir, ".gitignore"), "");
    assert.equal(run().status, 1);
    assert.equal(await fs.readFile(join(dir, "calls"), "utf8"), "create\n");
    await fs.writeFile(join(dir, ".gitignore"), ".env.local\n");
    await fs.unlink(join(dir, ".env.local"));
    await fs.symlink(join(dir, "missing-target"), join(dir, ".env.local"));
    assert.equal(run().status, 1);
    assert.equal(await fs.readFile(join(dir, "calls"), "utf8"), "create\n");
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});


test("documented MPS environment setup preserves existing secrets and creates a private file", async () => {
  const fs = await import("node:fs/promises");
  const { spawnSync } = await import("node:child_process");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { parseGuide } = await import("../src/app/token2049/guide-format.ts");
  const markdown = await fs.readFile(new URL("../public/token2049/agent-guide.md", import.meta.url), "utf8");
  const command = parseGuide(markdown).find(block => block.kind === "code" && block.text.includes("cp .env.example .env")).text;
  const dir = await fs.mkdtemp(join(tmpdir(), "token-mps-env-"));
  try {
    await fs.writeFile(join(dir, ".env.example"), "ENCRYPTION_KEY=example\n");
    const run = () => spawnSync("sh", ["-c", command], { cwd: dir });
    assert.equal(run().status, 0);
    assert.equal(await fs.readFile(join(dir, ".env"), "utf8"), "ENCRYPTION_KEY=example\n");
    assert.equal((await fs.stat(join(dir, ".env"))).mode & 0o777, 0o600);
    await fs.writeFile(join(dir, ".env"), "ENCRYPTION_KEY=preserved\n");
    assert.equal(run().status, 0);
    assert.equal(await fs.readFile(join(dir, ".env"), "utf8"), "ENCRYPTION_KEY=preserved\n");
    await fs.unlink(join(dir, ".env"));
    await fs.symlink("missing-secret-file", join(dir, ".env"));
    assert.equal(run().status, 0);
    assert.equal(await fs.readlink(join(dir, ".env")), "missing-secret-file");
    await assert.rejects(fs.stat(join(dir, "missing-secret-file")), { code: "ENOENT" });
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});


test("agent guide loads on demand, shares requests, and retries failed loads", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  let resolveResponse;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "/token2049/agent-guide.md");
    assert.equal(options.cache, "no-store");
    calls++;
    if (calls === 1) return new Response("Unavailable", { status: 503 });
    if (calls === 2) throw new Error("Network unavailable");
    return new Promise(resolve => { resolveResponse = resolve; });
  };
  try {
    const { loadAgentGuide } = await import("../src/app/token2049/guide-client.ts");
    assert.equal(calls, 0);
    await assert.rejects(loadAgentGuide(), /Could not load the agent guide/);
    await assert.rejects(loadAgentGuide(), /Network unavailable/);
    const first = loadAgentGuide();
    const second = loadAgentGuide();
    assert.strictEqual(first, second);
    assert.equal(calls, 3);
    resolveResponse(new Response("# Complete agent brief"));
    assert.equal(await first, "# Complete agent brief");
    assert.equal(await loadAgentGuide(), "# Complete agent brief");
    assert.equal(calls, 3);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

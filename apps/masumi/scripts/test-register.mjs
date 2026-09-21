import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const cache = new Map();
function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file);
  const output = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const compiledModule = { exports: {} };
  cache.set(file, compiledModule.exports);
  new Function("require", "module", "exports", output)((id) => {
    if (id.startsWith("@/")) return load(`${id.slice(2)}.ts`);
    if (id.startsWith(".")) return load(path.resolve(path.dirname(file), `${id}.ts`));
    return require(id);
  }, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}

const { parseHumanAmountToBaseUnits: parse, formatBaseUnitsToHuman: format } = load("lib/x402/amount.ts");
assert.equal(parse("2.01", 6), "2010000");
assert.equal(parse("12345678901234567890.123456", 6), "12345678901234567890123456");
assert.equal(parse("2", 0), "2");
assert.equal(format("2", 0), "2");
assert.equal(format("2010000", 6), "2.01");
for (const value of ["0", "00", "-1", "1e6", "1.0000001", "", "2."]) assert.equal(parse(value, 6), null);
for (const decimals of [-1, 256, Infinity, NaN, 1.5]) assert.equal(parse("2", decimals), null);

const { x402PaymentDraftSchema } = load("lib/x402/schemas.ts");
const payment = { network: "eip155:84532", asset: `0x${"1".repeat(40)}`, payTo: `0x${"2".repeat(40)}`, amount: "2", decimals: "0", resource: "" };
assert.equal(x402PaymentDraftSchema.safeParse(payment).success, true);
for (const change of [{ amount: "00" }, { decimals: "" }, { decimals: "256" }, { resource: "https://" }, { resource: "javascript:alert(1)" }]) {
  assert.equal(x402PaymentDraftSchema.safeParse({ ...payment, ...change }).success, false);
}
const { agentStepSchema, accountStepSchema } = load("lib/register-wizard/schema.ts");
const agent = { agentName: "Fixture", description: "", apiBaseUrl: "https://example.test", capabilityTags: "research", includeX402: false, x402: {} };
assert.equal(agentStepSchema.safeParse(agent).success, true);
assert.equal(agentStepSchema.safeParse({ ...agent, includeX402: true }).success, false);
assert.equal(agentStepSchema.safeParse({ ...agent, description: "x".repeat(251) }).success, false);
assert.equal(agentStepSchema.safeParse({ ...agent, apiBaseUrl: "javascript:alert(1)" }).success, false);
assert.equal(accountStepSchema.safeParse({ name: "Fixture", email: "fixture@example.test", termsAccepted: false }).success, false);

const { registrationDestination } = load("lib/register-response.ts");
assert.throws(() => registrationDestination({}, "Fixture"));
assert.throws(() => registrationDestination({ status: "pending", agentId: "a" }, "Fixture"));
const pending = registrationDestination({ status: "pending", agentId: "a", draftId: "d", pollToken: "fixture-secret", continueUrl: "https://example.test" }, "Fixture");
assert.equal(pending, "/register/success?agentId=a&agentName=Fixture&draftId=d");
assert.ok(!pending.includes("fixture-secret"));
assert.equal(registrationDestination({ status: "registered", agentId: "a", successPath: "javascript:alert(1)" }, "Fixture"), "/register/success?agentId=a&agentName=Fixture");
const { parseSaasOrigin, parseRegistryNetwork } = load("lib/config/register.ts");
for (const value of [undefined, "bad", "javascript:alert(1)", "https://u:p@example.test", "https://example.test/api"]) assert.equal(parseSaasOrigin(value), "");
assert.equal(parseSaasOrigin(" https://example.test/ "), "https://example.test");
assert.equal(parseRegistryNetwork("preprod"), "Preprod");
assert.throws(() => parseRegistryNetwork("preprdo"));
console.log("Registration validation, amounts, response routing, and configuration checks passed.");

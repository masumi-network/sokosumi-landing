import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import Database from "better-sqlite3";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const tempRoot = await mkdtemp(path.join(tmpdir(), "masumi-learn-test-"));
const dbPath = path.join(tempRoot, "learn.db");
const legacyDb = new Database(dbPath);
const legacyCreatedAt = new Date().toISOString();
legacyDb.exec(`
  CREATE TABLE learn_users (id TEXT PRIMARY KEY, provider_subject TEXT NOT NULL UNIQUE, display_name TEXT, email TEXT, avatar_url TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE learn_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES learn_users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL);
`);
legacyDb.prepare("INSERT INTO learn_users (id, provider_subject, created_at, updated_at) VALUES ('legacy-user', 'deleted:legacy-seed', ?, ?)").run(legacyCreatedAt, legacyCreatedAt);
legacyDb.prepare("INSERT INTO learn_sessions (token_hash, user_id, expires_at, created_at) VALUES ('legacy-session-hash', 'legacy-user', ?, ?)").run(new Date(Date.now() + 24 * 60 * 60_000).toISOString(), legacyCreatedAt);
legacyDb.close();
const oauthRequests = [];
let mintRequests = 0;
const mintPayloads = [];
const builderVerifyRequests = [];

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

const mockServer = createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://mock.test");
  if (url.pathname === "/token" && request.method === "POST") {
    assert.equal(request.headers["content-type"], "application/x-www-form-urlencoded");
    const payload = Object.fromEntries(new URLSearchParams(await readBody(request)));
    oauthRequests.push(payload);
    if (payload.code === "token-fail") {
      response.writeHead(401, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "invalid_grant" }));
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ access_token: `access:${payload.code}`, token_type: "Bearer" }));
    return;
  }
  if (url.pathname === "/userinfo") {
    const code = String(request.headers.authorization || "").replace("Bearer access:", "");
    // Mirror production: openid userinfo returns only the stable subject.
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ sub: `subject:${code}` }));
    return;
  }
  if (url.pathname === "/v1/users/me") {
    const code = String(request.headers.authorization || "").replace("Bearer access:", "");
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({
      data: {
        id: `subject:${code}`,
        name: `Learner ${code}`,
        email: `${code}@example.test`,
        image: `https://example.test/avatar/${code}.png`,
        role: "user",
      },
    }));
    return;
  }
  if (url.pathname === "/mint" && request.method === "POST") {
    mintRequests += 1;
    assert.equal(request.headers.authorization, "Bearer test-mint-token");
    assert.ok(request.headers["idempotency-key"]);
    const payload = JSON.parse(await readBody(request));
    mintPayloads.push(payload);
    if (payload.credentialType === "builder") {
      response.writeHead(503, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "temporary issuer failure" }));
      return;
    }
    response.writeHead(202, { "content-type": "application/json" });
    response.end(JSON.stringify({ accepted: true, status: "pending", network: "preprod" }));
    return;
  }
  if (url.pathname.startsWith("/mint-status/") && request.method === "GET") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "minted", txHash: "c".repeat(64), assetId: "test-policy.test-asset", network: "preprod", explorerUrl: `https://preprod.cardanoscan.io/transaction/${"c".repeat(64)}` }));
    return;
  }
  if (url.pathname === "/builder-verify" && request.method === "POST") {
    assert.equal(request.headers.authorization, "Bearer test-builder-token");
    assert.ok(request.headers["idempotency-key"]);
    const body = JSON.parse(await readBody(request));
    builderVerifyRequests.push(body);
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(body.transactionHash.startsWith("b") ? { status: "pending", reference: "queued-proof" } : { status: "verified", reference: "verified-proof" }));
    return;
  }
  response.writeHead(404).end();
});

const mockPort = await listen(mockServer);
const portServer = createServer();
const appPort = await listen(portServer);
await new Promise((resolve) => portServer.close(resolve));
const baseUrl = `http://localhost:${appPort}`;
const mockUrl = `http://127.0.0.1:${mockPort}`;
const nextBin = path.join(path.dirname(require.resolve("next/package.json")), "dist", "bin", "next");
const app = spawn(process.execPath, [nextBin, "dev", "-p", String(appPort)], {
  cwd: appRoot,
  env: {
    ...process.env,
    MASUMI_LEARN_DB_PATH: dbPath,
    SOKOSUMI_OAUTH_CLIENT_ID: "test-client",
    SOKOSUMI_OAUTH_CLIENT_SECRET: "test-secret",
    SOKOSUMI_OAUTH_AUTHORIZE_URL: `${mockUrl}/authorize`,
    SOKOSUMI_OAUTH_TOKEN_URL: `${mockUrl}/token`,
    SOKOSUMI_OAUTH_USERINFO_URL: `${mockUrl}/userinfo`,
    SOKOSUMI_API_ORIGIN: mockUrl,
    SOKOSUMI_OAUTH_REDIRECT_URI: `${baseUrl}/api/learn/auth/callback`,
    SOKOSUMI_OAUTH_END_SESSION_URL: `${mockUrl}/end-session`,
    SOKOSUMI_OAUTH_POST_LOGOUT_REDIRECT_URI: `${baseUrl}/learn`,
    MASUMI_LEARN_MINT_URL: `${mockUrl}/mint`,
    MASUMI_LEARN_MINT_STATUS_URL: `${mockUrl}/mint-status/{id}`,
    MASUMI_LEARN_MINT_TOKEN: "test-mint-token",
    MASUMI_LEARN_MINT_NETWORK: "preprod",
    MASUMI_LEARN_REPORT_TOKEN: "test-report-token",
    MASUMI_LEARN_REPORT_MIN_COHORT: "1",
    MASUMI_LEARN_BUILDER_VERIFY_URL: `${mockUrl}/builder-verify`,
    MASUMI_LEARN_BUILDER_VERIFY_TOKEN: "test-builder-token",
    MASUMI_LEARN_REVIEW_TOKEN: "test-review-token",
    MASUMI_LEARN_ADMIN_TOKEN: "test-admin-token",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let appOutput = "";
app.stdout.on("data", (chunk) => { appOutput += chunk; });
app.stderr.on("data", (chunk) => { appOutput += chunk; });

const cookieJar = () => new Map();
function cookieHeader(jar) { return [...jar].map(([name, value]) => `${name}=${value}`).join("; "); }
function absorbCookies(jar, headers) {
  const values = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [headers.get("set-cookie")].filter(Boolean);
  for (const value of values) {
    const [pair, ...attributes] = value.split(";");
    const separator = pair.indexOf("=");
    const name = pair.slice(0, separator);
    const cookieValue = pair.slice(separator + 1);
    const deleted = cookieValue === "" || attributes.some((attribute) => /^\s*max-age=0\s*$/i.test(attribute));
    if (deleted) jar.delete(name); else jar.set(name, cookieValue);
  }
}

async function request(jar, pathname, options = {}) {
  const headers = new Headers(options.headers || {});
  if (jar.size) headers.set("cookie", cookieHeader(jar));
  if (options.mutate !== false && options.method && options.method !== "GET" && !headers.has("origin")) headers.set("origin", baseUrl);
  if (options.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(`${baseUrl}${pathname}`, { ...options, headers, redirect: "manual" });
  absorbCookies(jar, response.headers);
  return response;
}

async function json(response) {
  const value = await response.json();
  return value;
}

async function waitForApp() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (app.exitCode != null) throw new Error(`Next.js exited early:\n${appOutput}`);
    try { if ((await fetch(`${baseUrl}/learn`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Next.js did not become ready:\n${appOutput}`);
}

async function login(jar, code, returnTo = "/learn/course") {
  const start = await request(jar, `/api/learn/auth/start?returnTo=${encodeURIComponent(returnTo)}`);
  assert.equal(start.status, 307);
  const authorization = new URL(start.headers.get("location"));
  assert.equal(start.headers.get("cache-control"), "no-store");
  assert.equal(authorization.origin, mockUrl);
  assert.equal(authorization.searchParams.get("response_type"), "code");
  assert.equal(authorization.searchParams.get("client_id"), "test-client");
  assert.equal(authorization.searchParams.get("code_challenge_method"), "S256");
  const state = authorization.searchParams.get("state");
  const challenge = authorization.searchParams.get("code_challenge");
  assert.equal(jar.get("masumi_learn_oauth_state"), state);
  const callback = await request(jar, `/api/learn/auth/callback?state=${encodeURIComponent(state)}&code=${encodeURIComponent(code)}`);
  assert.equal(callback.status, 307);
  assert.equal(callback.headers.get("cache-control"), "no-store");
  const expectedReturn = returnTo === "/learn" || returnTo === "/learn/"
    ? "/learn/course"
    : returnTo.startsWith("/learn/")
      ? returnTo
      : "/learn/course";
  assert.equal(new URL(callback.headers.get("location")).pathname, expectedReturn);
  assert.ok(jar.get("masumi_learn_session"));
  const tokenRequest = oauthRequests.at(-1);
  assert.equal(tokenRequest.client_secret, "test-secret");
  assert.ok(tokenRequest.code_verifier);
  assert.equal(createHash("sha256").update(tokenRequest.code_verifier).digest("base64url"), challenge);
}

function postJson(jar, pathname, body, method = "POST") {
  return request(jar, pathname, { method, body: JSON.stringify(body) });
}

const quizAnswers = {
  "agentic-economy": { u1q1: 1, u1q2: 2, u1q3: 1, u1q4: 1 },
  "masumi-fundamentals": { u2q1: 1, u2q2: 1, u2q3: 0, u2q4: 3 },
  "blockchain-basics": { u3q1: 1, u3q2: 1, u3q3: 1, u3q4: 1 },
  "trust-and-payments": { u4q1: 1, u4q2: 1, u4q3: 0, u4q4: 1 },
};
const assessmentAnswers = { u1q2: 2, u1q3: 1, u2q2: 1, u2q3: 0, u3q2: 1, u3q3: 1, u4q2: 1, u4q3: 0 };
const builderAssessmentAnswers = { bq1: 1, bq2: 2, bq3: 1, bq4: 1, bq5: 1 };

try {
  await waitForApp();
  const anonymous = cookieJar();
  for (const route of ["/learn", "/learn/library", "/learn/library/sumi-ecosystem", "/learn/library/utxo", "/learn/library/x402", "/learn/course", "/learn/course/agentic-economy"]) {
    assert.equal((await request(anonymous, route)).status, 200);
  }
  const publicHealth = await json(await request(anonymous, "/api/learn/health"));
  assert.equal(publicHealth.status, "ok");
  assert.equal(publicHealth.readiness, undefined);
  assert.equal((await request(anonymous, "/api/learn/health", { headers: { authorization: "Bearer wrong-token" } })).status, 401);
  const privateHealth = await json(await request(anonymous, "/api/learn/health", { headers: { authorization: "Bearer test-admin-token" } }));
  assert.equal(privateHealth.readiness.launchConfigured, true);
  assert.equal(Object.values(privateHealth.readiness.checks).every(Boolean), true);
  assert.doesNotMatch(JSON.stringify(privateHealth), /test-(admin|mint|review|report|builder|secret)/);
  const credentialSchema = await json(await request(anonymous, "/learn/credentials/v1"));
  assert.equal(credentialSchema.$id, "https://www.masumi.network/learn/credentials/v1");
  assert.deepEqual(credentialSchema.properties.credentialType.enum, ["fundamentals", "builder"]);
  assert.equal(credentialSchema.required.includes("metadataHash"), true);
  assert.doesNotMatch(JSON.stringify(credentialSchema), /email|oauth|wallet|subject/i);
  const protectedQuiz = await request(anonymous, "/learn/course/agentic-economy/quiz");
  assert.equal(protectedQuiz.status, 307);
  assert.match(protectedQuiz.headers.get("location"), /^\/learn\/login\?returnTo=/);
  const protectedAssessment = await request(anonymous, "/learn/course/assessment");
  assert.equal(protectedAssessment.status, 307);
  assert.match(protectedAssessment.headers.get("location"), /^\/learn\/login\?returnTo=/);
  assert.equal((await request(anonymous, "/api/learn/progress")).status, 401);

  const invalidJar = cookieJar();
  const invalidStart = await request(invalidJar, "/api/learn/auth/start");
  const invalidUrl = new URL(invalidStart.headers.get("location"));
  const invalidCallback = await request(invalidJar, `/api/learn/auth/callback?state=wrong-${invalidUrl.searchParams.get("state")}&code=bad`);
  assert.equal(invalidCallback.status, 307);
  assert.equal(new URL(invalidCallback.headers.get("location")).searchParams.get("error"), "This sign-in request expired or could not be verified. Please start again.");
  assert.equal(invalidJar.has("masumi_learn_oauth_state"), false);
  const failedTokenJar = cookieJar();
  const failedTokenStart = await request(failedTokenJar, "/api/learn/auth/start");
  const failedTokenState = new URL(failedTokenStart.headers.get("location")).searchParams.get("state");
  const failedTokenCallback = await request(failedTokenJar, `/api/learn/auth/callback?state=${failedTokenState}&code=token-fail`);
  assert.equal(new URL(failedTokenCallback.headers.get("location")).searchParams.get("error"), "Sokosumi could not complete the secure token exchange. Please try again.");
  assert.ok(!failedTokenJar.has("masumi_learn_session"));
  const deniedJar = cookieJar();
  const deniedStart = await request(deniedJar, "/api/learn/auth/start");
  const deniedState = new URL(deniedStart.headers.get("location")).searchParams.get("state");
  const deniedCallback = await request(deniedJar, `/api/learn/auth/callback?state=${deniedState}&error=access_denied`);
  assert.equal(new URL(deniedCallback.headers.get("location")).searchParams.get("error"), "Sign-in was cancelled. You can try again when you are ready.");
  assert.equal(new URL(deniedCallback.headers.get("location")).searchParams.get("reason"), "access_denied");
  assert.equal(deniedJar.has("masumi_learn_oauth_state"), false);
  const forwardedCallback = await fetch(`http://127.0.0.1:${appPort}/api/learn/auth/callback?error=invalid_request&error_description=${encodeURIComponent("redirect rejected")}`, { redirect: "manual" });
  const forwardedLocation = new URL(forwardedCallback.headers.get("location"));
  assert.equal(forwardedLocation.origin, new URL(baseUrl).origin);
  assert.equal(forwardedLocation.searchParams.get("reason"), "invalid_request");
  const invalidSessionJar = new Map([["masumi_learn_session", "not-a-real-session"]]);
  assert.equal((await request(invalidSessionJar, "/api/learn/session")).status, 401);

  const learnerA = cookieJar();
  await login(learnerA, "learner-a", "//evil.example/steal");
  assert.equal((await request(learnerA, "/learn/course")).status, 200);
  const crossOrigin = await request(learnerA, "/api/learn/progress", { method: "POST", body: JSON.stringify({ action: "complete_lesson", unit: "agentic-economy" }), headers: { origin: "https://evil.example", "content-type": "application/json" } });
  assert.equal(crossOrigin.status, 403);
  const crossSite = await request(learnerA, "/api/learn/progress", { method: "POST", body: JSON.stringify({ action: "complete_lesson", unit: "agentic-economy" }), headers: { origin: baseUrl, "sec-fetch-site": "cross-site", "content-type": "application/json" } });
  assert.equal(crossSite.status, 403);

  const db = new Database(dbPath);
  const migratedLegacySession = db.prepare("SELECT absolute_expires_at FROM learn_sessions WHERE token_hash='legacy-session-hash'").get();
  assert.match(migratedLegacySession.absolute_expires_at, /^\d{4}-\d{2}-\d{2}T/);
  const sessionHash = createHash("sha256").update(learnerA.get("masumi_learn_session")).digest("hex");
  const expiryBefore = db.prepare("SELECT expires_at FROM learn_sessions WHERE token_hash=?").pluck().get(sessionHash);
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal((await request(learnerA, "/api/learn/session", { method: "POST", body: "{}" })).status, 200);
  const expiryAfter = db.prepare("SELECT expires_at FROM learn_sessions WHERE token_hash=?").pluck().get(sessionHash);
  assert.ok(expiryAfter > expiryBefore);
  const absoluteExpiry = db.prepare("SELECT absolute_expires_at FROM learn_sessions WHERE token_hash=?").pluck().get(sessionHash);
  assert.ok(absoluteExpiry > expiryAfter);
  const absoluteExpiryLearner = cookieJar();
  await login(absoluteExpiryLearner, "absolute-expiry-learner");
  const absoluteExpiryHash = createHash("sha256").update(absoluteExpiryLearner.get("masumi_learn_session")).digest("hex");
  db.prepare("UPDATE learn_sessions SET absolute_expires_at='2000-01-01T00:00:00.000Z' WHERE token_hash=?").run(absoluteExpiryHash);
  assert.equal((await request(absoluteExpiryLearner, "/api/learn/session", { method: "POST", body: "{}" })).status, 401);

  const migrated = await postJson(learnerA, "/api/learn/progress", { action: "import_local_lessons", units: ["agentic-economy", "agentic-economy", "not-a-unit"] });
  assert.equal(migrated.status, 200);
  const migratedProgress = await json(migrated);
  assert.deepEqual(migratedProgress.completedLessons, ["agentic-economy"]);
  assert.deepEqual(migratedProgress.passedQuizzes, []);

  const earlyAssessment = await postJson(learnerA, "/api/learn/assessment", { answers: assessmentAnswers });
  assert.equal(earlyAssessment.status, 403);
  const failedQuiz = await postJson(learnerA, "/api/learn/quiz", { unit: "agentic-economy", answers: { u1q1: 0, u1q2: 0, u1q3: 0, u1q4: 0 } });
  assert.equal(failedQuiz.status, 200);
  assert.equal((await json(failedQuiz)).passed, false);
  for (const [unit, answers] of Object.entries(quizAnswers)) {
    const lesson = await postJson(learnerA, "/api/learn/progress", { action: "complete_lesson", unit });
    assert.equal(lesson.status, 200);
    const quiz = await postJson(learnerA, "/api/learn/quiz", { unit, answers });
    assert.equal(quiz.status, 200);
    assert.deepEqual(await json(quiz).then(({ score, passed }) => ({ score, passed })), { score: 100, passed: true });
  }

  const learnerASecondDevice = cookieJar();
  await login(learnerASecondDevice, "learner-a");
  const resumedProgress = await json(await request(learnerASecondDevice, "/api/learn/progress"));
  assert.equal(resumedProgress.passedQuizzes.length, 4);
  assert.equal(resumedProgress.quizAttempts.length, 5);

  const learnerB = cookieJar();
  await login(learnerB, "learner-b");
  const progressB = await json(await request(learnerB, "/api/learn/progress"));
  assert.deepEqual(progressB.completedLessons, []);
  assert.deepEqual(progressB.quizAttempts, []);

  const learnerAId = db.prepare("SELECT user_id FROM learn_sessions WHERE token_hash=?").pluck().get(sessionHash);
  const oldCredentialId = "superseded-test-credential";
  const timestamp = new Date().toISOString();
  db.prepare("INSERT INTO learn_credentials (id, user_id, course_version, score, status, issued_at, tx_hash, asset_id, metadata_hash, updated_at) VALUES (?, ?, 'fundamentals-v0', 100, 'minted', ?, 'old-tx', 'old-asset', 'old-hash', ?)")
    .run(oldCredentialId, learnerAId, timestamp, timestamp);

  const [assessment, repeatedAssessmentResponse] = await Promise.all([
    postJson(learnerA, "/api/learn/assessment", { answers: assessmentAnswers }),
    postJson(learnerA, "/api/learn/assessment", { answers: assessmentAnswers }),
  ]);
  assert.equal(assessment.status, 200);
  assert.equal(repeatedAssessmentResponse.status, 200);
  const assessmentResult = await json(assessment);
  assert.equal(assessmentResult.score, 100);
  assert.equal(assessmentResult.passed, true);
  const credentialId = assessmentResult.credential.id;
  const superseded = db.prepare("SELECT status, superseded_by FROM learn_credentials WHERE id=?").get(oldCredentialId);
  assert.deepEqual(superseded, { status: "superseded", superseded_by: credentialId });
  const repeatedAssessment = await json(repeatedAssessmentResponse);
  assert.equal(repeatedAssessment.credential.id, credentialId);

  const progressA = await json(await request(learnerA, "/api/learn/progress"));
  assert.equal(progressA.quizAttempts.length, 5);
  assert.equal(progressA.assessmentAttempts.length, 2);
  assert.equal(progressA.assessmentScore, 100);
  const publicBeforeMint = await json(await request(anonymous, `/api/learn/verify/${credentialId}`));
  assert.equal(publicBeforeMint.status, "ready_to_mint");
  const publicPayload = JSON.stringify(publicBeforeMint);
  assert.doesNotMatch(publicPayload, /learner-a|example\.test|subject:/);
  const certificate = await request(anonymous, `/api/learn/verify/${credentialId}/certificate`);
  assert.equal(certificate.status, 200);
  assert.match(certificate.headers.get("content-type"), /^image\/svg\+xml/);
  assert.match(await certificate.text(), /Masumi Fundamentals/);
  assert.equal((await json(await request(anonymous, `/api/learn/verify/${oldCredentialId}`))).status, "superseded");
  assert.equal((await request(anonymous, "/api/learn/admin", { method: "POST", headers: { authorization: "Bearer wrong-token" }, body: JSON.stringify({ action: "revoke_credential", credentialId: oldCredentialId, reason: "operator_request" }) })).status, 401);
  const adminRevocation = await json(await request(anonymous, "/api/learn/admin", { method: "POST", headers: { authorization: "Bearer test-admin-token" }, body: JSON.stringify({ action: "revoke_credential", credentialId: oldCredentialId, reason: "operator_request" }) }));
  assert.equal(adminRevocation.credential.status, "revoked");
  assert.equal((await json(await request(anonymous, `/api/learn/verify/${oldCredentialId}`))).status, "revoked");
  assert.equal((await request(anonymous, "/api/learn/verify/unknown-credential")).status, 404);

  const mint = await request(learnerA, "/api/learn/credential", { method: "POST", body: "{}" });
  assert.equal(mint.status, 200);
  assert.equal((await json(mint)).credential.status, "minting");
  const reconciled = await request(learnerA, "/api/learn/credential", { method: "PATCH", body: "{}" });
  assert.equal(reconciled.status, 200);
  assert.equal((await json(reconciled)).credential.status, "minted");
  assert.equal(mintRequests, 1);

  assert.equal((await request(anonymous, "/api/learn/report", { headers: { authorization: "Bearer wrong-token" } })).status, 401);
  const report = await json(await request(anonymous, "/api/learn/report", { headers: { authorization: "Bearer test-report-token" } }));
  assert.equal(report.privacy.aggregateOnly, true);
  assert.equal(report.privacy.minimumTimingCohort, 1);
  assert.equal(report.funnel.quizAttempts, 5);
  assert.equal(report.funnel.assessmentAttempts, 2);
  assert.equal(report.questions.find(({ questionId }) => questionId === "u1q1").incorrectCount, 1);
  assert.equal((await request(learnerA, "/api/learn/credential", { method: "POST", body: "{}" })).status, 200);
  assert.equal(mintRequests, 1);

  const builderStart = await json(await request(learnerA, "/api/learn/builder"));
  assert.equal(builderStart.eligible, true);
  assert.deepEqual(builderStart.progress.completedSteps, []);
  assert.equal((await postJson(learnerA, "/api/learn/builder/assessment", { answers: builderAssessmentAnswers })).status, 403);
  assert.equal((await postJson(learnerA, "/api/learn/builder", { action: "submit_proof", transactionHash: "a".repeat(64), agentIdentifier: "agent:test-service" })).status, 403);
  for (const step of ["integration_path", "node_started", "wallets_funded", "service_registered", "payment_executed"]) {
    assert.equal((await postJson(learnerA, "/api/learn/builder", { action: "complete_step", step })).status, 200);
  }
  assert.equal((await postJson(learnerA, "/api/learn/builder", { action: "submit_proof", transactionHash: "not-a-hash", agentIdentifier: "agent:test-service" })).status, 400);
  const verifiedProof = await json(await postJson(learnerA, "/api/learn/builder", { action: "submit_proof", transactionHash: "a".repeat(64), agentIdentifier: "agent:test-service" }));
  assert.equal(verifiedProof.submission.status, "verified");
  assert.equal(verifiedProof.progress.submission.status, "verified");
  assert.doesNotMatch(JSON.stringify(builderVerifyRequests[0]), /learner-a|example\.test|subject:/);
  await new Promise((resolve) => setTimeout(resolve, 5));
  const pendingProof = await json(await postJson(learnerA, "/api/learn/builder", { action: "submit_proof", transactionHash: "b".repeat(64), agentIdentifier: "agent:test-service" }));
  assert.equal(pendingProof.submission.status, "pending_review");
  assert.equal(pendingProof.progress.submission.status, "verified");
  assert.equal((await request(anonymous, "/api/learn/builder/review", { headers: { authorization: "Bearer wrong-token" } })).status, 401);
  const reviewQueue = await json(await request(anonymous, "/api/learn/builder/review", { headers: { authorization: "Bearer test-review-token" } }));
  assert.equal(reviewQueue.submissions.some(({ id }) => id === pendingProof.submission.id), true);
  assert.doesNotMatch(JSON.stringify(reviewQueue), /learner-a|example\.test|subject:/);
  assert.equal((await request(anonymous, "/api/learn/builder/review", { method: "PATCH", headers: { authorization: "Bearer test-review-token", "content-type": "application/json" }, body: JSON.stringify({ submissionId: pendingProof.submission.id, status: "verified", note: "learner@example.test" }) })).status, 400);
  const manualReview = await request(anonymous, "/api/learn/builder/review", { method: "PATCH", headers: { authorization: "Bearer test-review-token", "content-type": "application/json" }, body: JSON.stringify({ submissionId: pendingProof.submission.id, status: "verified", reviewCode: "preprod_match" }) });
  assert.equal(manualReview.status, 200);
  assert.equal((await json(manualReview)).submission.status, "verified");
  assert.equal((await postJson(learnerA, "/api/learn/builder", { action: "complete_step", step: "operating_plan" })).status, 200);
  db.prepare("UPDATE learn_credentials SET status='revoked', revoked_at=? WHERE id=?").run(new Date().toISOString(), credentialId);
  assert.equal((await postJson(learnerA, "/api/learn/builder/assessment", { answers: builderAssessmentAnswers })).status, 403);
  db.prepare("UPDATE learn_credentials SET status='minted', revoked_at=NULL WHERE id=?").run(credentialId);
  const [builderAssessment, repeatedBuilderAssessment] = await Promise.all([
    postJson(learnerA, "/api/learn/builder/assessment", { answers: builderAssessmentAnswers }),
    postJson(learnerA, "/api/learn/builder/assessment", { answers: builderAssessmentAnswers }),
  ]);
  assert.equal(builderAssessment.status, 200);
  assert.equal(repeatedBuilderAssessment.status, 200);
  const builderResult = await json(builderAssessment);
  const repeatedBuilderResult = await json(repeatedBuilderAssessment);
  assert.equal(builderResult.score, 100);
  assert.equal(builderResult.credential.id, repeatedBuilderResult.credential.id);
  assert.equal(builderResult.credential.credentialType, "builder");
  const builderCredentialId = builderResult.credential.id;
  const publicBuilder = await json(await request(anonymous, `/api/learn/verify/${builderCredentialId}`));
  assert.equal(publicBuilder.course, "Masumi Builder");
  assert.doesNotMatch(JSON.stringify(publicBuilder), /learner-a|example\.test|subject:/);
  const builderCertificate = await request(anonymous, `/api/learn/verify/${builderCredentialId}/certificate`);
  assert.match(await builderCertificate.text(), /Masumi Builder/);
  const builderMint = await request(learnerA, "/api/learn/credential", { method: "POST", body: JSON.stringify({ credentialId: builderCredentialId }) });
  assert.equal(builderMint.status, 503);
  assert.equal((await json(builderMint)).credential.status, "mint_failed");
  const builderReconciled = await request(learnerA, "/api/learn/credential", { method: "PATCH", body: JSON.stringify({ credentialId: builderCredentialId }) });
  assert.equal(builderReconciled.status, 200);
  assert.equal((await json(builderReconciled)).credential.status, "minted");
  assert.equal(mintRequests, 2);
  assert.equal(mintPayloads.length, 2);
  for (const payload of mintPayloads) {
    assert.deepEqual(Object.keys(payload).sort(), [...credentialSchema.required].sort());
    assert.match(payload.metadataHash, /^[a-f0-9]{64}$/);
    assert.doesNotMatch(JSON.stringify(payload), /learner-a|example\.test|subject:|oauth|wallet/i);
  }
  const credentialList = await json(await request(learnerA, "/api/learn/credential"));
  assert.equal(credentialList.credentials.some(({ credentialType }) => credentialType === "builder"), true);

  const builderReport = await json(await request(anonymous, "/api/learn/report", { headers: { authorization: "Bearer test-report-token" } }));
  assert.equal(builderReport.funnel.builderActiveLearners, 1);
  assert.equal(builderReport.funnel.verifiedBuilderProofs, 1);
  assert.equal(builderReport.funnel.builderAssessmentAttempts, 2);
  assert.equal(builderReport.funnel.builderAssessmentPasses, 2);
  assert.equal(builderReport.funnel.validFundamentalsCredentials, 1);
  assert.equal(builderReport.funnel.validBuilderCredentials, 1);
  assert.equal(builderReport.funnel.fundamentalsToBuilderConversionRate, 100);
  assert.equal(builderReport.funnel.timeToFirstVerifiedPreprodProof.cohortSize, 1);
  assert.equal(builderReport.funnel.timeToFirstVerifiedPreprodProof.suppressed, false);
  assert.equal(Number.isInteger(builderReport.funnel.timeToFirstVerifiedPreprodProof.medianMinutes), true);
  assert.equal(builderReport.questions.find(({ questionId }) => questionId === "bq1").courseVersion, "builder-v1");
  assert.equal(builderReport.questions.find(({ questionId }) => questionId === "u1q1").courseVersion, "fundamentals-v1");
  const cascadedRevocation = await json(await request(anonymous, "/api/learn/admin", { method: "POST", headers: { authorization: "Bearer test-admin-token" }, body: JSON.stringify({ action: "revoke_credential", credentialId, reason: "policy_violation" }) }));
  assert.equal(cascadedRevocation.credential.status, "revoked");
  assert.deepEqual(cascadedRevocation.cascadedCredentials, [builderCredentialId]);
  assert.equal((await json(await request(anonymous, `/api/learn/verify/${builderCredentialId}`))).status, "revoked");

  const quizColumns = db.prepare("PRAGMA table_info(learn_quiz_attempts)").all().map(({ name }) => name);
  assert.ok(!quizColumns.some((name) => name.includes("answer")));
  const builderAssessmentColumns = db.prepare("PRAGMA table_info(learn_builder_assessment_attempts)").all().map(({ name }) => name);
  assert.ok(!builderAssessmentColumns.some((name) => name.includes("answer")));
  const auditDetails = db.prepare("SELECT detail_json FROM learn_audit_events").all().map(({ detail_json }) => detail_json).join(" ");
  assert.doesNotMatch(auditDetails, /answers/i);

  const maintenanceScript = path.join(appRoot, "scripts", "learn-db-maintenance.mjs");
  const verifyDatabase = spawnSync(process.execPath, [maintenanceScript, "verify"], { cwd: appRoot, env: { ...process.env, MASUMI_LEARN_DB_PATH: dbPath }, encoding: "utf8" });
  assert.equal(verifyDatabase.status, 0, verifyDatabase.stderr);
  assert.equal(JSON.parse(verifyDatabase.stdout).integrity, "ok");
  const backupPath = path.join(tempRoot, "learn-backup.db");
  const backupDatabase = spawnSync(process.execPath, [maintenanceScript, "backup", "--output", backupPath], { cwd: appRoot, env: { ...process.env, MASUMI_LEARN_DB_PATH: dbPath }, encoding: "utf8" });
  assert.equal(backupDatabase.status, 0, backupDatabase.stderr);
  assert.equal(JSON.parse(backupDatabase.stdout).integrity, "ok");
  const backupDb = new Database(backupPath, { readonly: true });
  assert.equal(backupDb.prepare("SELECT COUNT(*) FROM learn_credentials").pluck().get() >= 2, true);
  backupDb.close();

  const accountExport = await request(learnerA, "/api/learn/account");
  assert.equal(accountExport.status, 200);
  assert.match(accountExport.headers.get("content-disposition"), /attachment/);
  const exportedAccount = await json(accountExport);
  assert.equal(exportedAccount.progress.quizAttempts.length, 5);
  assert.equal(exportedAccount.builder.credential.id, builderCredentialId);
  const revokedBeforeDelete = db.prepare("SELECT id, revoked_at FROM learn_credentials WHERE user_id=? ORDER BY id").all(exportedAccount.user.id);
  const deleted = await postJson(learnerA, "/api/learn/account", { confirm: "DELETE" }, "DELETE");
  assert.equal(deleted.status, 200);
  assert.equal((await request(learnerA, "/api/learn/session")).status, 401);
  const publicAfterDelete = await json(await request(anonymous, `/api/learn/verify/${credentialId}`));
  assert.equal(publicAfterDelete.status, "revoked");
  assert.equal((await json(await request(anonymous, `/api/learn/verify/${builderCredentialId}`))).status, "revoked");
  const revokedAfterDelete = db.prepare("SELECT id, revoked_at FROM learn_credentials WHERE user_id=? ORDER BY id").all(exportedAccount.user.id);
  assert.deepEqual(revokedAfterDelete, revokedBeforeDelete);
  assert.equal(db.prepare("SELECT COUNT(*) FROM learn_quiz_attempts").pluck().get(), 0);
  assert.equal(db.prepare("SELECT COUNT(*) FROM learn_builder_steps").pluck().get(), 0);
  assert.equal(db.prepare("SELECT COUNT(*) FROM learn_builder_submissions").pluck().get(), 0);

  const sessionBHash = createHash("sha256").update(learnerB.get("masumi_learn_session")).digest("hex");
  const learnerBId = db.prepare("SELECT user_id FROM learn_sessions WHERE token_hash=?").pluck().get(sessionBHash);
  const operationsCredentialId = "learner-b-operations-test";
  db.prepare("INSERT INTO learn_credentials (id, user_id, course_version, score, status, issued_at, metadata_hash, updated_at) VALUES (?, ?, 'operations-test-v1', 100, 'ready_to_mint', ?, 'operations-test-hash', ?)")
    .run(operationsCredentialId, learnerBId, timestamp, timestamp);
  const invalidated = await json(await request(anonymous, "/api/learn/admin", { method: "POST", headers: { authorization: "Bearer test-admin-token" }, body: JSON.stringify({ action: "invalidate_owner_sessions", credentialId: operationsCredentialId, reason: "account_compromise" }) }));
  assert.equal(invalidated.invalidated, 1);
  assert.equal((await request(learnerB, "/api/learn/session")).status, 401);
  const logoutLearner = cookieJar();
  await login(logoutLearner, "logout-learner", "/learnevil");
  const logout = await request(logoutLearner, "/api/learn/auth/logout", { method: "POST", body: "" });
  assert.equal(logout.status, 303);
  assert.equal(logout.headers.get("cache-control"), "no-store");
  const logoutLocation = new URL(logout.headers.get("location"));
  // Local session logout is the default: Sokosumi end-session requires id_token_hint,
  // which Learn intentionally never stores.
  assert.equal(logoutLocation.origin + logoutLocation.pathname, `${baseUrl}/learn`);
  assert.equal(logoutLocation.searchParams.get("signedOut"), "1");
  assert.ok(!logoutLearner.has("masumi_learn_session"));
  assert.equal((await request(logoutLearner, "/api/learn/session")).status, 401);

  process.env.SOKOSUMI_OAUTH_LOGOUT_VIA_PROVIDER = "true";
  const providerLogoutLearner = cookieJar();
  await login(providerLogoutLearner, "provider-logout-learner", "/learn/course");
  const providerLogout = await request(providerLogoutLearner, "/api/learn/auth/logout", { method: "POST", body: "" });
  assert.equal(providerLogout.status, 303);
  const providerLogoutLocation = new URL(providerLogout.headers.get("location"));
  assert.equal(providerLogoutLocation.href.startsWith(`${mockUrl}/end-session?`), true);
  assert.equal(providerLogoutLocation.searchParams.get("client_id"), "test-client");
  assert.equal(providerLogoutLocation.searchParams.get("post_logout_redirect_uri"), `${baseUrl}/learn`);
  assert.ok(providerLogoutLocation.searchParams.get("state"));
  assert.ok(!providerLogoutLearner.has("masumi_learn_session"));
  delete process.env.SOKOSUMI_OAUTH_LOGOUT_VIA_PROVIDER;
  db.close();

  console.log("Masumi Learn integration tests passed: OAuth/PKCE, sessions/logout/operational invalidation, isolation, migration, Fundamentals and Builder grading, proof verification/manual review, concurrent issuance, supersession, privacy-thresholded funnel reporting, health/readiness, credential schema/mint payload, database verification/backup, multi-credential mint reconciliation, export, deletion, and revocation.");
} finally {
  if (app.exitCode == null) {
    app.kill("SIGTERM");
    await Promise.race([
      new Promise((resolve) => app.once("exit", resolve)),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ]);
    if (app.exitCode == null) app.kill("SIGKILL");
  }
  await new Promise((resolve) => mockServer.close(resolve));
  await rm(tempRoot, { recursive: true, force: true });
}

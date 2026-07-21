#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";

const API_ORIGIN = process.env.SOKOSUMI_API_ORIGIN || "https://api.sokosumi.com";
const SERVICE = process.env.RAILWAY_SERVICE || "masumi";
const ENVIRONMENT = process.env.RAILWAY_ENVIRONMENT_NAME || "production";
const dryRun = process.argv.includes("--dry-run");

const payload = {
  redirect_uris: [
    "http://localhost:3001/api/learn/auth/callback",
    "https://www.masumi.network/api/learn/auth/callback",
  ],
  post_logout_redirect_uris: [
    "http://localhost:3001/learn",
    "https://www.masumi.network/learn",
  ],
  scope: "openid",
  client_name: "Masumi Learn",
  client_uri: "https://www.masumi.network/learn",
  policy_uri: "https://www.masumi.network/privacy",
  software_id: "masumi-learn",
  software_version: "1",
  token_endpoint_auth_method: "client_secret_post",
  grant_types: ["authorization_code"],
  response_types: ["code"],
  type: "web",
};

if (dryRun) {
  console.log(JSON.stringify({
    listUrl: `${API_ORIGIN}/auth/oauth2/get-clients`,
    createUrl: `${API_ORIGIN}/auth/oauth2/create-client`,
    railway: { service: SERVICE, environment: ENVIRONMENT },
    payload,
  }, null, 2));
  process.exit(0);
}

const apiToken = process.env.SOKOSUMI_API_TOKEN;
if (!apiToken) fail("SOKOSUMI_API_TOKEN is required. Supply it only for this command; do not save it in the repository.");

const railwayVariables = readRailwayVariables();
const clientsResponse = await apiRequest("/auth/oauth2/get-clients", { method: "GET" });
const clients = clientList(clientsResponse);
const existing = clients.find((client) => client?.software_id === payload.software_id || client?.client_name === payload.client_name);

if (existing) {
  if (existing.client_id && railwayVariables.SOKOSUMI_OAUTH_CLIENT_ID === existing.client_id && railwayVariables.SOKOSUMI_OAUTH_CLIENT_SECRET) {
    console.log(`Masumi Learn OAuth client ${existing.client_id} already exists and is configured on Railway; no changes made.`);
    process.exit(0);
  }
  fail(`Masumi Learn OAuth client ${existing.client_id || "(unknown id)"} already exists, but its secret is not fully configured on Railway. Rotate/recover that client secret instead of creating a duplicate.`);
}

const created = await apiRequest("/auth/oauth2/create-client", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});

if (!created?.client_id || !created?.client_secret) fail("Sokosumi created a client without returning both client_id and client_secret; Railway was not changed.");

setRailwayVariable("SOKOSUMI_OAUTH_CLIENT_SECRET", created.client_secret);
setRailwayVariable("SOKOSUMI_OAUTH_CLIENT_ID", created.client_id);
console.log(`Created Masumi Learn OAuth client ${created.client_id} and stored its credentials directly on Railway without deploying.`);
if (created.client_secret_expires_at) console.log(`Client-secret expiry timestamp: ${created.client_secret_expires_at}`);

async function apiRequest(path, init) {
  let response;
  try {
    response = await fetch(new URL(path, API_ORIGIN), {
      ...init,
      headers: { authorization: `Bearer ${apiToken}`, accept: "application/json", ...init.headers },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    fail(`Sokosumi request failed before receiving a response: ${error instanceof Error ? error.message : "network error"}`);
  }
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) {
    const providerMessage = typeof data?.message === "string" ? `: ${data.message.slice(0, 200)}` : "";
    fail(`Sokosumi ${path} returned HTTP ${response.status}${providerMessage}`);
  }
  return data;
}

function clientList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.clients)) return value.clients;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function readRailwayVariables() {
  try {
    return JSON.parse(execFileSync("railway", ["variable", "list", "--service", SERVICE, "--environment", ENVIRONMENT, "--json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }));
  } catch {
    fail(`Unable to read Railway variables for ${SERVICE}/${ENVIRONMENT}; OAuth registration was not attempted.`);
  }
}

function setRailwayVariable(name, value) {
  const result = spawnSync("railway", ["variable", "set", name, "--stdin", "--skip-deploys", "--service", SERVICE, "--environment", ENVIRONMENT], {
    input: value,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.status !== 0) fail(`Unable to store ${name} on Railway. No secret value was printed.`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

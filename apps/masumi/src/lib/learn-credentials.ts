import "server-only";

import { createHash } from "crypto";
import { BUILDER_COURSE_VERSION, COURSE_VERSION, createCredential, getCredential, updateCredentialMint, type LearnCredential } from "./learn-db";
import { learnOutboundSignal } from "./learn-api";

const credentialDefinitions = {
  fundamentals: { course: "Masumi Fundamentals", courseVersion: COURSE_VERSION },
  builder: { course: "Masumi Builder", courseVersion: BUILDER_COURSE_VERSION },
} as const;

export function credentialMetadata(id: string, score: number, credentialType: LearnCredential["credentialType"] = "fundamentals", courseVersion: string = credentialDefinitions[credentialType].courseVersion) {
  return {
    schema: "https://www.masumi.network/learn/credentials/v1",
    credentialId: id,
    credentialType,
    course: credentialDefinitions[credentialType].course,
    courseVersion,
    issuer: "Masumi Network",
    score,
    verificationUrl: `https://www.masumi.network/learn/verify/${id}`,
  };
}

export function issueCredential(userId: string, score: number) {
  const provisionalId = crypto.randomUUID();
  const hash = createHash("sha256").update(JSON.stringify(credentialMetadata(provisionalId, score))).digest("hex");
  return createCredential({ userId, score, metadataHash: hash, credentialId: provisionalId });
}

export function issueBuilderCredential(userId: string, score: number) {
  const provisionalId = crypto.randomUUID();
  const metadata = credentialMetadata(provisionalId, score, "builder", BUILDER_COURSE_VERSION);
  const hash = createHash("sha256").update(JSON.stringify(metadata)).digest("hex");
  return createCredential({ userId, score, metadataHash: hash, credentialId: provisionalId, courseVersion: BUILDER_COURSE_VERSION, credentialType: "builder" });
}

type MintResult = { status?: "pending" | "minted" | "failed" | "dropped"; accepted?: boolean; txHash?: string; assetId?: string; error?: string; network?: string; explorerUrl?: string };

function validatedMintValues(result: MintResult, requireAsset = false) {
  if (result.txHash && !/^[a-f0-9]{64}$/i.test(result.txHash)) throw new Error("Minting service returned an invalid Cardano transaction hash");
  if (requireAsset && (!result.txHash || !result.assetId)) throw new Error("Minting service returned incomplete minted-asset data");
  if (result.assetId && !/^[A-Za-z0-9._-]{1,200}$/.test(result.assetId)) throw new Error("Minting service returned an invalid asset identifier");
  if (result.network && !["preview", "preprod", "mainnet"].includes(result.network)) throw new Error("Minting service returned an unsupported Cardano network");
  const expectedNetwork = process.env.MASUMI_LEARN_MINT_NETWORK;
  if (expectedNetwork && result.network !== expectedNetwork) throw new Error(`Minting service network did not match ${expectedNetwork}`);
  if (result.explorerUrl) {
    try { if (new URL(result.explorerUrl).protocol !== "https:") throw new Error(); }
    catch { throw new Error("Minting service returned an invalid explorer URL"); }
  }
  return { txHash: result.txHash, assetId: result.assetId, network: result.network, explorerUrl: result.explorerUrl };
}

export async function mintCredential(credential: LearnCredential) {
  if (credential.status === "minted") return credential;
  if (credential.status === "revoked" || credential.status === "superseded") throw new Error(`A ${credential.status} credential cannot be minted`);
  const url = process.env.MASUMI_LEARN_MINT_URL;
  const token = process.env.MASUMI_LEARN_MINT_TOKEN;
  if (!url || !token) throw new Error("Credential minting is not configured");
  updateCredentialMint(credential.id, "minting");
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "idempotency-key": credential.id },
      body: JSON.stringify({ ...credentialMetadata(credential.id, credential.score, credential.credentialType, credential.courseVersion), metadataHash: credential.metadataHash }),
      cache: "no-store",
      signal: learnOutboundSignal(),
    });
    if (!response.ok) throw new Error(`Minting service returned ${response.status}`);
    const result = await response.json() as MintResult;
    if (result.status === "failed" || result.status === "dropped") throw new Error(result.error || `Mint transaction ${result.status}`);
    if (result.status === "minted" || (result.txHash && result.assetId)) return updateCredentialMint(credential.id, "minted", validatedMintValues(result, true))!;
    if (result.status === "pending" || result.accepted === true || response.status === 202) return updateCredentialMint(credential.id, "minting", validatedMintValues(result))!;
    throw new Error("Minting service response is incomplete");
  } catch (error) {
    updateCredentialMint(credential.id, "mint_failed", { error: error instanceof Error ? error.message : "Unknown minting error" });
    throw error;
  }
}

export async function reconcileCredentialMint(credential: LearnCredential) {
  if (credential.status !== "minting" && credential.status !== "mint_failed") return credential;
  const template = process.env.MASUMI_LEARN_MINT_STATUS_URL;
  const token = process.env.MASUMI_LEARN_MINT_TOKEN;
  if (!template || !token) throw new Error("Mint status reconciliation is not configured");
  const response = await fetch(template.replace("{id}", encodeURIComponent(credential.id)), {
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    cache: "no-store",
    signal: learnOutboundSignal(),
  });
  if (!response.ok) throw new Error(`Mint status service returned ${response.status}`);
  const result = await response.json() as MintResult;
  if (result.status === "minted") return updateCredentialMint(credential.id, "minted", validatedMintValues(result, true))!;
  if (result.status === "failed" || result.status === "dropped") return updateCredentialMint(credential.id, "mint_failed", { ...result, error: result.error || `Mint transaction ${result.status}` })!;
  return updateCredentialMint(credential.id, "minting", validatedMintValues(result))!;
}

export function publicCredential(id: string) {
  const credential = getCredential(id);
  if (!credential) return null;
  return { ...credentialMetadata(credential.id, credential.score, credential.credentialType, credential.courseVersion), status: credential.status, issuedAt: credential.issuedAt, revokedAt: credential.revokedAt, supersededBy: credential.supersededBy, txHash: credential.txHash, assetId: credential.assetId, network: credential.network, explorerUrl: credential.explorerUrl, metadataHash: credential.metadataHash };
}

function xml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);
}

export function credentialCertificateSvg(id: string) {
  const credential = publicCredential(id);
  if (!credential) return null;
  const status = credential.status.replaceAll("_", " ");
  const issued = new Date(credential.issuedAt).toISOString().slice(0, 10);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title desc">
  <title id="title">${xml(credential.course)} credential</title>
  <desc id="desc">Credential ${xml(credential.credentialId)}, status ${xml(status)}, score ${credential.score} percent.</desc>
  <rect width="1200" height="675" rx="40" fill="#111111"/>
  <circle cx="1080" cy="100" r="160" fill="#FA008C" opacity="0.9"/>
  <circle cx="1050" cy="620" r="240" fill="#6D28D9" opacity="0.55"/>
  <text x="80" y="105" fill="#FA008C" font-family="Arial, sans-serif" font-size="24" letter-spacing="5">MASUMI LEARN</text>
  <text x="80" y="235" fill="white" font-family="Arial, sans-serif" font-size="72" font-weight="600">${xml(credential.course)}</text>
  <text x="80" y="300" fill="#BDBDBD" font-family="Arial, sans-serif" font-size="30">Account-linked completion credential</text>
  <line x1="80" y1="365" x2="1120" y2="365" stroke="#444"/>
  <text x="80" y="430" fill="#888" font-family="Arial, sans-serif" font-size="20">ISSUED</text>
  <text x="80" y="470" fill="white" font-family="Arial, sans-serif" font-size="28">${issued}</text>
  <text x="330" y="430" fill="#888" font-family="Arial, sans-serif" font-size="20">SCORE</text>
  <text x="330" y="470" fill="white" font-family="Arial, sans-serif" font-size="28">${credential.score}%</text>
  <text x="530" y="430" fill="#888" font-family="Arial, sans-serif" font-size="20">STATUS</text>
  <text x="530" y="470" fill="white" font-family="Arial, sans-serif" font-size="28">${xml(status)}</text>
  <text x="80" y="570" fill="#888" font-family="monospace" font-size="18">${xml(credential.credentialId)}</text>
  <text x="80" y="615" fill="#BDBDBD" font-family="Arial, sans-serif" font-size="18">Verify at ${xml(credential.verificationUrl)}</text>
</svg>`;
}

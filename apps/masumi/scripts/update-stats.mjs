#!/usr/bin/env node

/**
 * Fetches Masumi on-chain stats from Blockfrost and writes to public/data/stats.json.
 * Run on a cron (every 5 min) or manually: node scripts/update-stats.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const BLOCKFROST_BASE = "https://cardano-mainnet.blockfrost.io/api/v0";
const BLOCKFROST_KEY = "mainnetETlxBHnzbvUa1yCD398EUu7FJpwdMbAM";
const ADDRESS = "addr1wx7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsq87ujx7";
const POLICY_ID = "ad6424e3ce9e47bbd8364984bd731b41de591f1d11f6d7d43d0da9b9";
const USDM_PREFIX = "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402";

const OUTPUT_PATH = path.join(ROOT, "public", "data", "stats.json");
const VOLUME_CACHE_PATH = path.join(ROOT, "data", "volume-cache.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function bf(endpoint, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(`${BLOCKFROST_BASE}${endpoint}`, {
      headers: { project_id: BLOCKFROST_KEY },
    });
    if (res.ok) return res.json();
    if (res.status === 404) return null;
    if (res.status === 429 && attempt < retries) {
      const wait = (attempt + 1) * 2000;
      console.log(`  Rate limited, waiting ${wait}ms...`);
      await sleep(wait);
      continue;
    }
    throw new Error(`Blockfrost ${res.status}: ${await res.text()}`);
  }
}

async function paginateCount(basePath) {
  let total = 0;
  for (let page = 1; page <= 50; page++) {
    const data = await bf(`${basePath}?count=100&page=${page}&order=asc`);
    if (!data || !Array.isArray(data) || data.length === 0) break;
    total += data.length;
    if (data.length < 100) break;
    await sleep(150);
  }
  return total;
}

async function getAllTxHashes() {
  const all = [];
  for (let page = 1; page <= 300; page++) {
    const txs = await bf(`/addresses/${ADDRESS}/transactions?count=100&page=${page}&order=asc`);
    if (!txs || !Array.isArray(txs) || txs.length === 0) break;
    all.push(...txs.map((t) => t.tx_hash));
    if (txs.length < 100) break;
    await sleep(150);
  }
  return all;
}

function readVolumeCache() {
  try {
    return JSON.parse(fs.readFileSync(VOLUME_CACHE_PATH, "utf-8"));
  } catch {
    return { totalVolumeUsdm: 0, processedTxHashes: [], lastUpdated: 0, processedCount: 0 };
  }
}

function writeVolumeCache(cache) {
  fs.mkdirSync(path.dirname(VOLUME_CACHE_PATH), { recursive: true });
  fs.writeFileSync(VOLUME_CACHE_PATH, JSON.stringify(cache));
}

async function processUsdmVolume(hash) {
  let volume = 0;
  const utxos = await bf(`/txs/${hash}/utxos`);
  if (utxos) {
    for (const out of utxos.outputs || []) {
      if (out.address === ADDRESS) {
        for (const a of out.amount) {
          if (a.unit.startsWith(USDM_PREFIX)) {
            volume += parseInt(a.quantity, 10);
          }
        }
      }
    }
  }
  return volume;
}

async function calculateVolume() {
  const cache = readVolumeCache();
  console.log(`  Cache has ${cache.processedCount || 0} processed txs`);

  const allHashes = await getAllTxHashes();
  console.log(`  Found ${allHashes.length} total tx hashes`);

  const processedSet = new Set(cache.processedTxHashes);
  const newHashes = allHashes.filter((h) => !processedSet.has(h));

  if (newHashes.length === 0) {
    console.log("  No new transactions to process");
    cache.lastUpdated = Date.now();
    writeVolumeCache(cache);
    return cache.totalVolumeUsdm / 1_000_000;
  }

  console.log(`  Processing ${newHashes.length} new transactions...`);
  let added = 0;
  let processed = 0;
  for (const hash of newHashes) {
    added += await processUsdmVolume(hash);
    processedSet.add(hash);
    processed++;
    await sleep(120);
    if (processed % 50 === 0) {
      console.log(`  Processed ${processed}/${newHashes.length}`);
      writeVolumeCache({
        totalVolumeUsdm: cache.totalVolumeUsdm + added,
        processedTxHashes: Array.from(processedSet),
        lastUpdated: 0,
        processedCount: processedSet.size,
      });
    }
  }

  const updated = {
    totalVolumeUsdm: cache.totalVolumeUsdm + added,
    processedTxHashes: Array.from(processedSet),
    lastUpdated: Date.now(),
    processedCount: processedSet.size,
  };
  writeVolumeCache(updated);
  return updated.totalVolumeUsdm / 1_000_000;
}

async function main() {
  console.log("Fetching Masumi stats...");

  // Run sequentially to avoid rate limits
  console.log("1/4 Address total...");
  const addressTotal = await bf(`/addresses/${ADDRESS}/total`);

  console.log("2/4 Latest transaction...");
  const latestTx = await bf(`/addresses/${ADDRESS}/transactions?count=1&order=desc`);

  console.log("3/4 Registered agents...");
  const registeredAgents = await paginateCount(`/assets/policy/${POLICY_ID}`);

  console.log("4/4 USDM volume...");
  const volumeUsdm = await calculateVolume();

  const totalTransactions = addressTotal?.tx_count ?? 0;

  let lastTransactionTime = null;
  if (latestTx && Array.isArray(latestTx) && latestTx.length > 0) {
    const blockData = await bf(`/blocks/${latestTx[0].block_height}`);
    if (blockData?.time) {
      lastTransactionTime = new Date(blockData.time * 1000).toISOString();
    }
  }

  const stats = {
    totalTransactions,
    registeredAgents,
    lastTransactionTime,
    volumeUsdm,
    updatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(stats, null, 2));

  console.log("Stats written to public/data/stats.json:");
  console.log(JSON.stringify(stats, null, 2));
}

main().catch((err) => {
  console.error("Failed to update stats:", err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Syncs explorer transaction data from Blockfrost into SQLite.
 * Run on a cron (every 5 min) or manually: node scripts/sync-explorer.mjs [mainnet|preprod|all]
 *
 * Phase 1: Fetch all tx refs (fast, ~220 API calls for 22K txs)
 * Phase 2: Enrich unenriched txs with metadata/utxos/fees (slow first run, fast incremental)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { NETWORKS } from "./network-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const KNOWN_TYPES = new Set([
  "SubmitResult",
  "PaymentBatched",
  "CollectCompleted",
  "CollectRefund",
  "RequestRefund",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeBf(config) {
  return async function bf(endpoint, retries = 3) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const res = await fetch(`${config.blockfrostBase}${endpoint}`, {
        headers: { project_id: config.blockfrostKey },
      });
      if (res.ok) return res.json();
      if (res.status === 404) return null;
      if (res.status === 429 && attempt < retries) {
        const wait = Math.min((attempt + 1) * 2000, 10000);
        console.log(`  Rate limited, waiting ${wait}ms...`);
        await sleep(wait);
        continue;
      }
      throw new Error(`Blockfrost ${res.status}: ${await res.text()}`);
    }
  };
}

function openDb(config) {
  const dataDir = path.join(ROOT, "data");
  const dbPath = path.join(dataDir, config.dbFilename);

  fs.mkdirSync(dataDir, { recursive: true });

  // Auto-migrate: rename old explorer.db to explorer-mainnet.db
  if (config.id === "mainnet") {
    const oldPath = path.join(dataDir, "explorer.db");
    if (fs.existsSync(oldPath) && !fs.existsSync(dbPath)) {
      console.log(`Migrating explorer.db -> ${config.dbFilename}`);
      fs.renameSync(oldPath, dbPath);
    }
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      hash TEXT PRIMARY KEY,
      block_time INTEGER NOT NULL,
      block_height INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'other',
      usdm_amount REAL NOT NULL DEFAULT 0,
      fees TEXT NOT NULL DEFAULT '0',
      enriched INTEGER NOT NULL DEFAULT 0,
      sender_address TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_block_time ON transactions(block_time);
    CREATE INDEX IF NOT EXISTS idx_type ON transactions(type);
  `);

  // Migration: add sender_address column if missing
  const cols = db.pragma("table_info(transactions)").map((c) => c.name);
  if (!cols.includes("sender_address")) {
    db.exec("ALTER TABLE transactions ADD COLUMN sender_address TEXT");
  }

  // Migration: fix double-counted USDM volume on withdrawal transactions
  const needsVolumeFix = db.prepare(
    "SELECT COUNT(*) as c FROM transactions WHERE type IN ('CollectCompleted', 'CollectRefund') AND usdm_amount > 0"
  ).get().c;
  if (needsVolumeFix > 0) {
    console.log(`Fixing ${needsVolumeFix} withdrawal txs with double-counted volume...`);
    db.exec("UPDATE transactions SET usdm_amount = 0 WHERE type IN ('CollectCompleted', 'CollectRefund')");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_wallets (
      address TEXT NOT NULL,
      name TEXT NOT NULL,
      asset TEXT PRIMARY KEY
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  return db;
}

function detectTypeFromMetadata(metadata) {
  if (!metadata || !Array.isArray(metadata)) return "other";
  for (const entry of metadata) {
    if (entry.label === "674" && entry.json_metadata?.msg) {
      const msg = entry.json_metadata.msg;
      if (msg[0] === "Masumi" && msg[1] && KNOWN_TYPES.has(msg[1])) {
        return msg[1];
      }
    }
  }
  return "other";
}

function makeExtractSenderAddress(config) {
  return function extractSenderAddress(utxos) {
    if (!utxos) return null;
    for (const inp of utxos.inputs || []) {
      if (inp.address !== config.escrowAddress) return inp.address;
    }
    for (const out of utxos.outputs || []) {
      if (out.address !== config.escrowAddress) return out.address;
    }
    return null;
  };
}

function makeComputeUsdmAmount(config) {
  return function computeUsdmAmount(utxos) {
    if (!utxos || !config.usdmPrefix) return 0;
    let total = 0;
    for (const out of utxos.outputs || []) {
      if (out.address === config.escrowAddress) {
        for (const a of out.amount) {
          if (a.unit.startsWith(config.usdmPrefix)) {
            total += parseInt(a.quantity, 10) / 1_000_000;
          }
        }
      }
    }
    return total;
  };
}

// Phase 1: Fetch new tx refs — stops when it hits a known hash
async function syncTxRefs(db, bf, config) {
  const existingCount = db.prepare("SELECT COUNT(*) as c FROM transactions").get().c;
  const isFirstRun = existingCount === 0;

  console.log(`Phase 1: Syncing transaction references (${isFirstRun ? "full" : "incremental"})...`);

  const insert = db.prepare(
    `INSERT OR IGNORE INTO transactions (hash, block_time, block_height)
     VALUES (?, ?, ?)`
  );
  const exists = db.prepare("SELECT 1 FROM transactions WHERE hash = ?");

  let totalInserted = 0;
  let page = 1;

  while (true) {
    const txs = await bf(
      `/addresses/${config.escrowAddress}/transactions?count=100&page=${page}&order=desc`
    );
    if (!txs || !Array.isArray(txs) || txs.length === 0) break;

    let hitKnown = false;

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        if (!isFirstRun && exists.get(row.tx_hash)) {
          hitKnown = true;
          return;
        }
        const result = insert.run(row.tx_hash, row.block_time, row.block_height);
        if (result.changes > 0) totalInserted++;
      }
    });
    insertMany(txs);

    if (hitKnown) break;

    if (page % 10 === 0) {
      console.log(`  Page ${page}, ${totalInserted} new so far...`);
    }

    if (txs.length < 100) break;
    page++;
    await sleep(120);
  }

  console.log(`  Done. ${page} pages fetched, ${totalInserted} new transactions inserted.`);
  return totalInserted;
}

// Phase 2: Enrich unenriched rows
async function enrichTransactions(db, bf, config) {
  const extractSenderAddress = makeExtractSenderAddress(config);
  const computeUsdmAmount = makeComputeUsdmAmount(config);

  const unenriched = db
    .prepare("SELECT hash FROM transactions WHERE enriched = 0")
    .all();

  if (unenriched.length === 0) {
    console.log("Phase 2: All transactions already enriched.");
    return;
  }

  console.log(`Phase 2: Enriching ${unenriched.length} transactions...`);

  const update = db.prepare(
    `UPDATE transactions SET type = ?, usdm_amount = ?, fees = ?, sender_address = ?, enriched = 1
     WHERE hash = ?`
  );

  let processed = 0;
  const BATCH_SIZE = 10;

  for (let i = 0; i < unenriched.length; i += BATCH_SIZE) {
    const batch = unenriched.slice(i, i + BATCH_SIZE);

    for (const { hash } of batch) {
      try {
        const [txData, utxos, metadata] = await Promise.all([
          bf(`/txs/${hash}`),
          bf(`/txs/${hash}/utxos`),
          bf(`/txs/${hash}/metadata`),
        ]);

        const type = detectTypeFromMetadata(metadata);
        const usdmAmount = computeUsdmAmount(utxos);
        const fees = txData?.fees ?? "0";
        const senderAddress = extractSenderAddress(utxos);

        update.run(type, usdmAmount, fees, senderAddress, hash);
      } catch (err) {
        console.error(`  Failed to enrich ${hash}: ${err.message}`);
      }

      processed++;
      await sleep(120);
    }

    if (processed % 100 === 0 || processed === unenriched.length) {
      console.log(
        `  ${processed}/${unenriched.length} enriched (${((processed / unenriched.length) * 100).toFixed(1)}%)`
      );
    }
  }

  console.log(`  Done. ${processed} transactions enriched.`);
}

// Throttle helper: returns true if enough time has passed since last run
function shouldRun(db, key, intervalMs) {
  const row = db.prepare("SELECT value FROM sync_meta WHERE key = ?").get(key);
  if (!row) return true;
  return Date.now() - Number(row.value) >= intervalMs;
}

function markRan(db, key) {
  db.prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)").run(key, String(Date.now()));
}

// Phase 3: Backfill sender_address for enriched txs missing it (500 per sync cycle, once per hour)
async function backfillSenderAddresses(db, bf, config) {
  const extractSenderAddress = makeExtractSenderAddress(config);

  if (!shouldRun(db, "backfill_sender", 60 * 60 * 1000)) {
    console.log("Phase 3: Skipping backfill (ran less than 1h ago).");
    return;
  }
  const missing = db
    .prepare("SELECT hash FROM transactions WHERE enriched = 1 AND sender_address IS NULL LIMIT 500")
    .all();

  if (missing.length === 0) return;

  console.log(`Phase 3: Backfilling sender_address for ${missing.length} transactions...`);

  const update = db.prepare("UPDATE transactions SET sender_address = ? WHERE hash = ?");
  let processed = 0;

  for (const { hash } of missing) {
    try {
      const utxos = await bf(`/txs/${hash}/utxos`);
      const addr = extractSenderAddress(utxos);
      if (addr) update.run(addr, hash);
    } catch (err) {
      console.error(`  Failed to backfill ${hash}: ${err.message}`);
    }
    processed++;
    if (processed % 100 === 0) {
      console.log(`  ${processed}/${missing.length} backfilled`);
    }
    await sleep(120);
  }

  console.log(`  Done. ${processed} sender addresses backfilled.`);
  markRan(db, "backfill_sender");
}

// Phase 4: Sync agent wallet addresses (runs once every 6 hours)
async function syncAgentWallets(db, bf, config) {
  if (!shouldRun(db, "sync_agent_wallets", 6 * 60 * 60 * 1000)) {
    console.log("Phase 4: Skipping agent wallet sync (ran less than 6h ago).");
    return;
  }
  console.log("Phase 4: Syncing agent wallets...");

  const upsert = db.prepare(
    "INSERT OR REPLACE INTO agent_wallets (address, name, asset) VALUES (?, ?, ?)"
  );
  let count = 0;

  for (let page = 1; page <= 50; page++) {
    const assets = await bf(`/assets/policy/${config.policyId}?count=100&page=${page}&order=asc`);
    if (!assets || !Array.isArray(assets) || assets.length === 0) break;

    // Process in batches of 10 to limit concurrency
    for (let i = 0; i < assets.length; i += 10) {
      const batch = assets.slice(i, i + 10);
      await Promise.all(
        batch.map(async (a) => {
          try {
            const [detail, holders] = await Promise.all([
              bf(`/assets/${a.asset}`),
              bf(`/assets/${a.asset}/addresses`),
            ]);
            const meta = detail?.onchain_metadata || detail?.metadata || {};
            let name = null;
            if (meta.name) {
              name = Array.isArray(meta.name) ? meta.name.join("") : String(meta.name);
            }
            name = name || detail?.asset_name || a.asset.slice(0, 16);
            const address = holders?.[0]?.address;
            if (address) {
              upsert.run(address, name, a.asset);
              count++;
            }
          } catch {
            // skip
          }
        })
      );
      await sleep(200);
    }

    if (assets.length < 100) break;
  }

  console.log(`  Done. ${count} agent wallets synced.`);
  markRan(db, "sync_agent_wallets");
}

async function syncNetwork(networkId, config) {
  console.log(`\n=== Syncing ${config.label} (${networkId}) ===`);
  const start = Date.now();

  const bf = makeBf(config);
  const db = openDb(config);

  const existingCount = db
    .prepare("SELECT COUNT(*) as c FROM transactions")
    .get().c;
  console.log(`Database has ${existingCount} existing transactions.`);

  await syncTxRefs(db, bf, config);

  const totalCount = db
    .prepare("SELECT COUNT(*) as c FROM transactions")
    .get().c;
  const enrichedCount = db
    .prepare("SELECT COUNT(*) as c FROM transactions WHERE enriched = 1")
    .get().c;
  console.log(`Total: ${totalCount}, Enriched: ${enrichedCount}, Unenriched: ${totalCount - enrichedCount}`);

  await enrichTransactions(db, bf, config);
  await backfillSenderAddresses(db, bf, config);
  await syncAgentWallets(db, bf, config);

  db.close();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`${config.label} sync completed in ${elapsed}s`);
}

async function main() {
  const arg = process.argv[2] || "all";
  console.log("Explorer sync starting...");

  if (arg === "all") {
    for (const [id, config] of Object.entries(NETWORKS)) {
      if (!config.escrowAddress || config.escrowAddress === "TBD") {
        console.log(`Skipping ${id}: no escrow address configured.`);
        continue;
      }
      await syncNetwork(id, config);
    }
  } else if (NETWORKS[arg]) {
    const config = NETWORKS[arg];
    if (!config.escrowAddress || config.escrowAddress === "TBD") {
      console.log(`Skipping ${arg}: no escrow address configured.`);
      return;
    }
    await syncNetwork(arg, config);
  } else {
    console.error(`Unknown network: ${arg}. Use mainnet, preprod, or all.`);
    process.exit(1);
  }

  console.log("\nAll syncs completed.");
}

main().catch((err) => {
  console.error("Explorer sync failed:", err);
  process.exit(1);
});

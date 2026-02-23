#!/usr/bin/env node

/**
 * Wrapper start script for Railway:
 * 1. Runs initial explorer sync
 * 2. Schedules sync every 5 minutes
 * 3. Starts Next.js server
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SYNC_SCRIPT = path.join(__dirname, "sync-explorer.mjs");
const SYNC_INTERVAL = 5 * 60 * 1000;

let syncing = false;

function runSync() {
  if (syncing) {
    console.log("[sync] Already running, skipping...");
    return;
  }
  syncing = true;
  console.log("[sync] Starting explorer sync...");

  const child = spawn("node", [SYNC_SCRIPT], {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  child.on("close", (code) => {
    syncing = false;
    if (code === 0) {
      console.log("[sync] Completed successfully");
    } else {
      console.error(`[sync] Exited with code ${code}`);
    }
  });

  child.on("error", (err) => {
    syncing = false;
    console.error("[sync] Failed to spawn:", err.message);
  });
}

// Run initial sync, then schedule
runSync();
setInterval(runSync, SYNC_INTERVAL);

// Start Next.js
const nextServer = spawn("npm", ["-w", "@summation/masumi", "run", "start"], {
  stdio: "inherit",
  cwd: path.resolve(__dirname, "../../.."),
});

nextServer.on("close", (code) => {
  console.log(`[next] Exited with code ${code}`);
  process.exit(code ?? 1);
});

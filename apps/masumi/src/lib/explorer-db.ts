import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { TransactionType } from "./explorer-types";
import { type NetworkId, getNetworkConfig } from "./network-config";

const dbMap = new Map<NetworkId, Database.Database>();

export function getDb(network: NetworkId = "mainnet"): Database.Database {
  const existing = dbMap.get(network);
  if (existing) return existing;

  const config = getNetworkConfig(network);
  const dataDir = path.join(process.cwd(), "data");
  const dbPath = path.join(dataDir, config.dbFilename);

  fs.mkdirSync(dataDir, { recursive: true });

  // Auto-migrate: rename old explorer.db to explorer-mainnet.db
  if (network === "mainnet") {
    const oldPath = path.join(dataDir, "explorer.db");
    if (fs.existsSync(oldPath) && !fs.existsSync(dbPath)) {
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
  const cols = (db.pragma("table_info(transactions)") as { name: string }[]).map((c) => c.name);
  if (!cols.includes("sender_address")) {
    db.exec("ALTER TABLE transactions ADD COLUMN sender_address TEXT");
  }

  // Migration: fix double-counted USDM volume on withdrawal transactions
  const needsVolumeFix = (db.prepare(
    "SELECT COUNT(*) as c FROM transactions WHERE type IN ('CollectCompleted', 'CollectRefund') AND usdm_amount > 0"
  ).get() as { c: number }).c;
  if (needsVolumeFix > 0) {
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

  dbMap.set(network, db);
  return db;
}

export function hasData(network: NetworkId = "mainnet"): boolean {
  try {
    const d = getDb(network);
    const row = d.prepare("SELECT COUNT(*) as c FROM transactions").get() as { c: number };
    return row.c > 0;
  } catch {
    return false;
  }
}

const PAGE_SIZE = 10;

interface TxRow {
  hash: string;
  block_time: number;
  block_height: number;
  type: string;
  usdm_amount: number;
  fees: string;
  enriched: number;
  sender_address: string | null;
}

export function getTxPage(
  network: NetworkId,
  page: number,
  search?: string,
  typeFilter?: string
): {
  transactions: {
    hash: string;
    block_height: number;
    block_time: number;
    fees: string;
    type: TransactionType;
    usdm_amount: number;
    sender_address: string | null;
  }[];
  page: number;
  totalCount: number;
  totalPages: number;
} {
  const d = getDb(network);
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (typeFilter) {
    conditions.push("type = ?");
    params.push(typeFilter);
  }

  if (search) {
    const s = `%${search.toLowerCase()}%`;
    conditions.push("(LOWER(hash) LIKE ? OR LOWER(type) LIKE ?)");
    params.push(s, s);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = d.prepare(`SELECT COUNT(*) as cnt FROM transactions ${where}`).get(...params) as { cnt: number };
  const totalCount = countRow.cnt;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const offset = (Math.max(1, page) - 1) * PAGE_SIZE;

  const rows = d
    .prepare(
      `SELECT hash, block_time, block_height, type, usdm_amount, fees, sender_address
       FROM transactions ${where}
       ORDER BY block_time DESC, block_height DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, PAGE_SIZE, offset) as TxRow[];

  const transactions = rows.map((r) => ({
    hash: r.hash,
    block_height: r.block_height,
    block_time: r.block_time,
    fees: r.fees,
    type: r.type as TransactionType,
    usdm_amount: r.usdm_amount,
    sender_address: r.sender_address,
  }));

  return { transactions, page: Math.max(1, page), totalCount, totalPages };
}

export type ChartRange = "30" | "90" | "365" | "all";

export function getChartData(network: NetworkId, range: ChartRange = "30"): {
  periodCounts: {
    day: number; dayPrev: number;
    week: number; weekPrev: number;
    month: number; monthPrev: number;
    total: number;
  };
  volumeStats: {
    total: number;
    month: number;
    monthPrev: number;
  };
  totalFeesAda: number;
  bars: { date: string; count: number; byType: Record<string, number> }[];
  typeBreakdown: { type: TransactionType; count: number; percentage: number }[];
} {
  const d = getDb(network);
  const now = Math.floor(Date.now() / 1000);
  const dayAgo = now - 86400;
  const twoDaysAgo = now - 2 * 86400;
  const weekAgo = now - 7 * 86400;
  const twoWeeksAgo = now - 14 * 86400;
  const monthAgo = now - 30 * 86400;
  const twoMonthsAgo = now - 60 * 86400;

  const cnt = (where: string, ...p: number[]) =>
    (d.prepare(`SELECT COUNT(*) as c FROM transactions WHERE ${where}`).get(...p) as { c: number }).c;

  const periodCounts = {
    day: cnt("block_time >= ?", dayAgo),
    dayPrev: cnt("block_time >= ? AND block_time < ?", twoDaysAgo, dayAgo),
    week: cnt("block_time >= ?", weekAgo),
    weekPrev: cnt("block_time >= ? AND block_time < ?", twoWeeksAgo, weekAgo),
    month: cnt("block_time >= ?", monthAgo),
    monthPrev: cnt("block_time >= ? AND block_time < ?", twoMonthsAgo, monthAgo),
    total: (d.prepare("SELECT COUNT(*) as c FROM transactions").get() as { c: number }).c,
  };

  const vol = (where: string, ...p: number[]) =>
    (d.prepare(`SELECT COALESCE(SUM(usdm_amount), 0) as v FROM transactions WHERE enriched = 1 AND ${where}`).get(...p) as { v: number }).v;

  const volumeStats = {
    total: getTotalVolume(network),
    month: vol("block_time >= ?", monthAgo),
    monthPrev: vol("block_time >= ? AND block_time < ?", twoMonthsAgo, monthAgo),
  };

  let cutoff: number | null = null;
  let groupExpr: string;

  if (range === "all") {
    cutoff = null;
    groupExpr = "strftime('%Y-%m', block_time, 'unixepoch')";
  } else if (range === "365") {
    cutoff = now - 365 * 86400;
    groupExpr = "strftime('%Y-%W', block_time, 'unixepoch')";
  } else if (range === "90") {
    cutoff = now - 90 * 86400;
    groupExpr = "date(block_time, 'unixepoch')";
  } else {
    cutoff = monthAgo;
    groupExpr = "date(block_time, 'unixepoch')";
  }

  const whereClause = cutoff != null ? `WHERE block_time >= ?` : "";
  const params = cutoff != null ? [cutoff] : [];

  const rows = d
    .prepare(
      `SELECT ${groupExpr} as dt, type, COUNT(*) as cnt
       FROM transactions
       ${whereClause}
       GROUP BY dt, type
       ORDER BY dt ASC`
    )
    .all(...params) as { dt: string; type: string; cnt: number }[];

  const barMap = new Map<string, { count: number; byType: Record<string, number> }>();

  if (range === "30" || range === "90") {
    const days = range === "30" ? 30 : 90;
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date((now - i * 86400) * 1000);
      const key = dt.toISOString().slice(0, 10);
      barMap.set(key, { count: 0, byType: {} });
    }
  } else if (range === "365") {
    for (let i = 51; i >= 0; i--) {
      const dt = new Date((now - i * 7 * 86400) * 1000);
      const year = dt.getUTCFullYear();
      const startOfYear = Date.UTC(year, 0, 1);
      const dayOfYear = Math.floor((dt.getTime() - startOfYear) / 86400000);
      const week = String(Math.floor(dayOfYear / 7)).padStart(2, "0");
      const key = `${year}-${week}`;
      barMap.set(key, { count: 0, byType: {} });
    }
  }

  for (const row of rows) {
    let entry = barMap.get(row.dt);
    if (!entry) {
      entry = { count: 0, byType: {} };
      barMap.set(row.dt, entry);
    }
    entry.count += row.cnt;
    entry.byType[row.type] = (entry.byType[row.type] || 0) + row.cnt;
  }

  const bars = Array.from(barMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      count: data.count,
      byType: data.byType,
    }));

  const typeRows = d
    .prepare(
      `SELECT type, COUNT(*) as cnt
       FROM transactions
       ${cutoff != null ? "WHERE block_time >= ? AND enriched = 1" : "WHERE enriched = 1"}
       GROUP BY type
       ORDER BY cnt DESC`
    )
    .all(...params) as { type: string; cnt: number }[];

  const enrichedTotal = typeRows.reduce((sum, r) => sum + r.cnt, 0);

  const typeBreakdown = typeRows.map((r) => ({
    type: r.type as TransactionType,
    count: r.cnt,
    percentage: enrichedTotal > 0 ? (r.cnt / enrichedTotal) * 100 : 0,
  }));

  const totalFeesLovelace = (d.prepare(
    "SELECT COALESCE(SUM(CAST(fees AS INTEGER)), 0) as total FROM transactions WHERE enriched = 1"
  ).get() as { total: number }).total;
  const totalFeesAda = totalFeesLovelace / 1_000_000;

  return { periodCounts, volumeStats, totalFeesAda, bars, typeBreakdown };
}

export function getHeatmapData(network: NetworkId): { days: { date: string; count: number }[] } {
  const d = getDb(network);
  const yearAgo = Math.floor(Date.now() / 1000) - 365 * 86400;
  const rows = d
    .prepare(
      `SELECT date(block_time, 'unixepoch') as dt, COUNT(*) as cnt
       FROM transactions WHERE block_time >= ?
       GROUP BY dt ORDER BY dt ASC`
    )
    .all(yearAgo) as { dt: string; cnt: number }[];
  return { days: rows.map((r) => ({ date: r.dt, count: r.cnt })) };
}

export function getAgentMap(network: NetworkId): Record<string, string[]> {
  const d = getDb(network);
  const rows = d.prepare("SELECT address, name FROM agent_wallets").all() as { address: string; name: string }[];
  const map: Record<string, string[]> = {};
  for (const r of rows) {
    if (!map[r.address]) map[r.address] = [];
    map[r.address].push(r.name);
  }
  return map;
}

export function getTotalVolume(network: NetworkId = "mainnet"): number {
  const d = getDb(network);
  const row = d
    .prepare(`SELECT SUM(usdm_amount) as total FROM transactions WHERE enriched = 1 AND usdm_amount > 0`)
    .get() as { total: number | null };
  return row.total ?? 0;
}

export function getVolumeSeries(network: NetworkId): { points: { date: string; volume: number }[] } {
  const d = getDb(network);
  const rows = d
    .prepare(
      `SELECT strftime('%Y-%m', block_time, 'unixepoch') as dt,
              SUM(usdm_amount) as vol
       FROM transactions WHERE enriched = 1 AND usdm_amount > 0
       GROUP BY dt ORDER BY dt ASC`
    )
    .all() as { dt: string; vol: number }[];
  return { points: rows.map((r) => ({ date: r.dt, volume: r.vol })) };
}

interface NetworkNode {
  id: string;
  label: string;
  agents: string[];
  txCount: number;
  volume: number;
  types: Record<string, number>;
}

interface NetworkEdge {
  source: string;
  target: string;
  txCount: number;
  volume: number;
}

export function getNetworkGraph(network: NetworkId): {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
} {
  const d = getDb(network);
  const ESCROW_ID = "escrow";

  const rows = d.prepare(
    `SELECT sender_address, COUNT(*) as cnt, COALESCE(SUM(usdm_amount), 0) as vol
     FROM transactions
     WHERE enriched = 1 AND sender_address IS NOT NULL
     GROUP BY sender_address
     ORDER BY cnt DESC
     LIMIT 30`
  ).all() as { sender_address: string; cnt: number; vol: number }[];

  const addresses = rows.map((r) => r.sender_address);

  const typeRows = addresses.length > 0
    ? d.prepare(
        `SELECT sender_address, type, COUNT(*) as cnt
         FROM transactions
         WHERE enriched = 1 AND sender_address IN (${addresses.map(() => "?").join(",")})
         GROUP BY sender_address, type`
      ).all(...addresses) as { sender_address: string; type: string; cnt: number }[]
    : [];

  const typeMap = new Map<string, Record<string, number>>();
  for (const r of typeRows) {
    if (!typeMap.has(r.sender_address)) typeMap.set(r.sender_address, {});
    typeMap.get(r.sender_address)![r.type] = r.cnt;
  }

  const agentMap = getAgentMap(network);

  const nodes: NetworkNode[] = [
    { id: ESCROW_ID, label: "Masumi Escrow", agents: [], txCount: 0, volume: 0, types: {} },
  ];

  const edges: NetworkEdge[] = [];
  let totalTx = 0;
  let totalVol = 0;

  for (const r of rows) {
    const names = agentMap[r.sender_address] || [];
    const label = names.length > 0
      ? names[0]
      : r.sender_address.slice(0, 8) + "..." + r.sender_address.slice(-4);

    nodes.push({
      id: r.sender_address,
      label,
      agents: names,
      txCount: r.cnt,
      volume: r.vol,
      types: typeMap.get(r.sender_address) || {},
    });

    edges.push({
      source: r.sender_address,
      target: ESCROW_ID,
      txCount: r.cnt,
      volume: r.vol,
    });

    totalTx += r.cnt;
    totalVol += r.vol;
  }

  nodes[0].txCount = totalTx;
  nodes[0].volume = totalVol;

  return { nodes, edges };
}

// Proxy to production when no local DB data (for local dev)

export async function getTxPageOrProxy(
  network: NetworkId,
  page: number,
  search?: string,
  typeFilter?: string
): Promise<ReturnType<typeof getTxPage>> {
  if (hasData(network)) return getTxPage(network, page, search, typeFilter);
  const config = getNetworkConfig(network);
  if (!config.proxyBase) return getTxPage(network, page, search, typeFilter);
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  if (typeFilter) params.set("type", typeFilter);
  const res = await fetch(`${config.proxyBase}/api/explorer/transactions?${params}`);
  return res.json();
}

export async function getChartDataOrProxy(network: NetworkId, range: ChartRange = "30"): Promise<ReturnType<typeof getChartData>> {
  if (hasData(network)) return getChartData(network, range);
  const config = getNetworkConfig(network);
  if (!config.proxyBase) return getChartData(network, range);
  const res = await fetch(`${config.proxyBase}/api/explorer/chart-data?range=${range}`);
  return res.json();
}

export async function getHeatmapDataOrProxy(network: NetworkId): Promise<ReturnType<typeof getHeatmapData>> {
  if (hasData(network)) return getHeatmapData(network);
  const config = getNetworkConfig(network);
  if (!config.proxyBase) return getHeatmapData(network);
  const res = await fetch(`${config.proxyBase}/api/explorer/heatmap-data`);
  return res.json();
}

export async function getVolumeSeriesOrProxy(network: NetworkId): Promise<ReturnType<typeof getVolumeSeries>> {
  if (hasData(network)) return getVolumeSeries(network);
  const config = getNetworkConfig(network);
  if (!config.proxyBase) return getVolumeSeries(network);
  const res = await fetch(`${config.proxyBase}/api/explorer/volume-series`);
  return res.json();
}

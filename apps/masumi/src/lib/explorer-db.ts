import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { TransactionType } from "./explorer-types";

const DB_PATH = path.join(process.cwd(), "data", "explorer.db");
const PROD_BASE = "https://masumi-production.up.railway.app";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  db = new Database(DB_PATH);
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

  return db;
}

export function hasData(): boolean {
  try {
    const d = getDb();
    const row = d.prepare("SELECT COUNT(*) as c FROM transactions").get() as { c: number };
    return row.c > 0;
  } catch {
    return false;
  }
}

const PAGE_SIZE = 10;

const TYPE_LABELS: Record<TransactionType, string> = {
  SubmitResult: "Submit Result",
  PaymentBatched: "Payment Batched",
  CollectCompleted: "Collect Completed",
  CollectRefund: "Collect Refund",
  RequestRefund: "Request Refund",
  other: "Other",
};

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
  }[];
  page: number;
  totalCount: number;
  totalPages: number;
} {
  const d = getDb();
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

export function getChartData(range: ChartRange = "30"): {
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
  bars: { date: string; count: number; byType: Record<string, number> }[];
  typeBreakdown: { type: TransactionType; count: number; percentage: number }[];
} {
  const d = getDb();
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
    total: getTotalVolume(),
    month: vol("block_time >= ?", monthAgo),
    monthPrev: vol("block_time >= ? AND block_time < ?", twoMonthsAgo, monthAgo),
  };

  // Determine range cutoff and aggregation
  let cutoff: number | null = null;
  let groupExpr: string;
  let numBars: number;

  if (range === "all") {
    cutoff = null;
    groupExpr = "strftime('%Y-%m', block_time, 'unixepoch')";
    numBars = 0; // dynamic
  } else if (range === "365") {
    cutoff = now - 365 * 86400;
    groupExpr = "strftime('%Y-%W', block_time, 'unixepoch')";
    numBars = 52;
  } else if (range === "90") {
    cutoff = now - 90 * 86400;
    groupExpr = "date(block_time, 'unixepoch')";
    numBars = 90;
  } else {
    cutoff = monthAgo;
    groupExpr = "date(block_time, 'unixepoch')";
    numBars = 30;
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

  // Build bar map with empty slots for daily/weekly ranges
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
  // For "all", we just use whatever months appear in the data

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

  // Type breakdown scoped to selected range (enriched only)
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

  return { periodCounts, volumeStats, bars, typeBreakdown };
}

export function getHeatmapData(): { days: { date: string; count: number }[] } {
  const d = getDb();
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

export function getAgentMap(): Record<string, string[]> {
  const d = getDb();
  const rows = d.prepare("SELECT address, name FROM agent_wallets").all() as { address: string; name: string }[];
  const map: Record<string, string[]> = {};
  for (const r of rows) {
    if (!map[r.address]) map[r.address] = [];
    map[r.address].push(r.name);
  }
  return map;
}

export function getTotalVolume(): number {
  const d = getDb();
  const row = d
    .prepare(`SELECT SUM(usdm_amount) as total FROM transactions WHERE enriched = 1 AND usdm_amount > 0`)
    .get() as { total: number | null };
  return row.total ?? 0;
}

export function getVolumeSeries(): { points: { date: string; volume: number }[] } {
  const d = getDb();
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

// Proxy to production when no local DB data (for local dev)

export async function getTxPageOrProxy(
  page: number,
  search?: string,
  typeFilter?: string
): Promise<ReturnType<typeof getTxPage>> {
  if (hasData()) return getTxPage(page, search, typeFilter);
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  if (typeFilter) params.set("type", typeFilter);
  const res = await fetch(`${PROD_BASE}/api/explorer/transactions?${params}`);
  return res.json();
}

export async function getChartDataOrProxy(range: ChartRange = "30"): Promise<ReturnType<typeof getChartData>> {
  if (hasData()) return getChartData(range);
  const res = await fetch(`${PROD_BASE}/api/explorer/chart-data?range=${range}`);
  return res.json();
}

export async function getHeatmapDataOrProxy(): Promise<ReturnType<typeof getHeatmapData>> {
  if (hasData()) return getHeatmapData();
  const res = await fetch(`${PROD_BASE}/api/explorer/heatmap-data`);
  return res.json();
}

export async function getVolumeSeriesOrProxy(): Promise<ReturnType<typeof getVolumeSeries>> {
  if (hasData()) return getVolumeSeries();
  const res = await fetch(`${PROD_BASE}/api/explorer/volume-series`);
  return res.json();
}

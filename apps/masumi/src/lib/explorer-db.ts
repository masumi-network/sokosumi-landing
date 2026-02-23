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
      enriched INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_block_time ON transactions(block_time);
    CREATE INDEX IF NOT EXISTS idx_type ON transactions(type);
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
      `SELECT hash, block_time, block_height, type, usdm_amount, fees
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
  }));

  return { transactions, page: Math.max(1, page), totalCount, totalPages };
}

export function getChartData(): {
  periodCounts: { day: number; week: number; month: number };
  daily: { date: string; count: number; byType: Record<string, number> }[];
  typeBreakdown: { type: TransactionType; count: number; percentage: number }[];
} {
  const d = getDb();
  const now = Math.floor(Date.now() / 1000);
  const dayAgo = now - 86400;
  const weekAgo = now - 7 * 86400;
  const monthAgo = now - 30 * 86400;

  const periodCounts = {
    day: (d.prepare("SELECT COUNT(*) as c FROM transactions WHERE block_time >= ?").get(dayAgo) as { c: number }).c,
    week: (d.prepare("SELECT COUNT(*) as c FROM transactions WHERE block_time >= ?").get(weekAgo) as { c: number }).c,
    month: (d.prepare("SELECT COUNT(*) as c FROM transactions WHERE block_time >= ?").get(monthAgo) as { c: number }).c,
  };

  // Daily activity (last 30 days) with type breakdown
  const dailyRows = d
    .prepare(
      `SELECT date(block_time, 'unixepoch') as dt, type, COUNT(*) as cnt
       FROM transactions
       WHERE block_time >= ?
       GROUP BY dt, type
       ORDER BY dt ASC`
    )
    .all(monthAgo) as { dt: string; type: string; cnt: number }[];

  // Build a map of all 30 days
  const dailyMap = new Map<string, { count: number; byType: Record<string, number> }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date((now - i * 86400) * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { count: 0, byType: {} });
  }

  for (const row of dailyRows) {
    const entry = dailyMap.get(row.dt);
    if (entry) {
      entry.count += row.cnt;
      entry.byType[row.type] = (entry.byType[row.type] || 0) + row.cnt;
    }
  }

  const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    count: data.count,
    byType: data.byType,
  }));

  // Type breakdown (last 30 days, enriched only)
  const typeRows = d
    .prepare(
      `SELECT type, COUNT(*) as cnt
       FROM transactions
       WHERE block_time >= ? AND enriched = 1
       GROUP BY type
       ORDER BY cnt DESC`
    )
    .all(monthAgo) as { type: string; cnt: number }[];

  const enrichedTotal = typeRows.reduce((sum, r) => sum + r.cnt, 0);

  const typeBreakdown = typeRows.map((r) => ({
    type: r.type as TransactionType,
    count: r.cnt,
    percentage: enrichedTotal > 0 ? (r.cnt / enrichedTotal) * 100 : 0,
  }));

  return { periodCounts, daily, typeBreakdown };
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

export async function getChartDataOrProxy(): Promise<ReturnType<typeof getChartData>> {
  if (hasData()) return getChartData();
  const res = await fetch(`${PROD_BASE}/api/explorer/chart-data`);
  return res.json();
}

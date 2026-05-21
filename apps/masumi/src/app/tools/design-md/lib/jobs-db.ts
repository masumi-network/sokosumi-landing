import Database from "better-sqlite3";
import crypto from "crypto";
import fs from "fs";
import path from "path";

let _db: Database.Database | null = null;

function db(): Database.Database {
  if (_db) return _db;

  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "design-md.db");

  const conn = new Database(dbPath);
  conn.pragma("journal_mode = WAL");
  conn.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      force INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      extraction_id INTEGER,
      result_md TEXT,
      result_source TEXT,
      error TEXT,
      created_at INTEGER NOT NULL,
      started_at INTEGER,
      finished_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_jobs_status_created
      ON jobs(status, created_at);
  `);

  _db = conn;
  return conn;
}

export type JobStatus = "queued" | "running" | "done" | "failed";

export type Job = {
  id: string;
  url: string;
  force: boolean;
  status: JobStatus;
  extractionId: number | null;
  resultMd: string | null;
  resultSource: string | null;
  error: string | null;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
};

type JobRow = {
  id: string;
  url: string;
  force: number;
  status: string;
  extraction_id: number | null;
  result_md: string | null;
  result_source: string | null;
  error: string | null;
  created_at: number;
  started_at: number | null;
  finished_at: number | null;
};

function rowToJob(r: JobRow): Job {
  return {
    id: r.id,
    url: r.url,
    force: r.force === 1,
    status: r.status as JobStatus,
    extractionId: r.extraction_id,
    resultMd: r.result_md,
    resultSource: r.result_source,
    error: r.error,
    createdAt: r.created_at,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
  };
}

export function enqueueJob(url: string, force: boolean): string {
  const id = crypto.randomUUID();
  db()
    .prepare(
      `INSERT INTO jobs (id, url, force, status, created_at)
       VALUES (?, ?, ?, 'queued', ?)`,
    )
    .run(id, url, force ? 1 : 0, Date.now());
  return id;
}

// Atomically claim the oldest queued job. Returns null if none.
export function claimNextJob(): Job | null {
  const conn = db();
  const txn = conn.transaction(() => {
    const row = conn
      .prepare(
        `SELECT * FROM jobs WHERE status='queued'
         ORDER BY created_at ASC LIMIT 1`,
      )
      .get() as JobRow | undefined;
    if (!row) return null;
    conn
      .prepare(
        `UPDATE jobs SET status='running', started_at=? WHERE id=? AND status='queued'`,
      )
      .run(Date.now(), row.id);
    return rowToJob({ ...row, status: "running", started_at: Date.now() });
  });
  return txn();
}

export function completeJob(
  id: string,
  extractionId: number | null,
  resultMd: string,
  resultSource: string,
): void {
  db()
    .prepare(
      `UPDATE jobs SET status='done', extraction_id=?, result_md=?, result_source=?, finished_at=? WHERE id=?`,
    )
    .run(extractionId, resultMd, resultSource, Date.now(), id);
}

export function failJob(id: string, error: string): void {
  db()
    .prepare(
      `UPDATE jobs SET status='failed', error=?, finished_at=? WHERE id=?`,
    )
    .run(error.slice(0, 2000), Date.now(), id);
}

export function getJob(id: string): Job | null {
  const row = db()
    .prepare(`SELECT * FROM jobs WHERE id=?`)
    .get(id) as JobRow | undefined;
  return row ? rowToJob(row) : null;
}

// Reset jobs left in 'running' after a process restart. Called once on
// first worker kick after boot.
export function resetOrphanedRunning(): number {
  const result = db()
    .prepare(`UPDATE jobs SET status='queued', started_at=NULL WHERE status='running'`)
    .run();
  return result.changes;
}

// Mark long-running jobs as failed. Safety net for jobs that hung inside
// extractFromUrl past the natural Browserbase + LLM ceiling.
export function failStaleRunning(maxAgeMs: number): number {
  const cutoff = Date.now() - maxAgeMs;
  const result = db()
    .prepare(
      `UPDATE jobs SET status='failed', error='Job timed out', finished_at=?
       WHERE status='running' AND started_at < ?`,
    )
    .run(Date.now(), cutoff);
  return result.changes;
}

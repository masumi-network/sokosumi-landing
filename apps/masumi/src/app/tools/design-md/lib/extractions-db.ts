import Database from "better-sqlite3";
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
    CREATE TABLE IF NOT EXISTS extractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      hostname TEXT NOT NULL,
      name TEXT,
      primary_color TEXT,
      logo_url TEXT,
      screenshot BLOB,
      screenshot_mime TEXT,
      design_md TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_extractions_created
      ON extractions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_extractions_hostname
      ON extractions(hostname);
  `);

  // Idempotent one-off migration via PRAGMA user_version. Each version
  // bump runs its block exactly once across the lifetime of the DB file.
  const current = Number(
    (conn.pragma("user_version") as { user_version: number }[])[0]
      ?.user_version ?? 0,
  );
  if (current < 1) {
    // v1: dedupe by URL, keeping the most-recent row. Earlier versions
    // of /api/extract didn't check the persistent cache, so the same
    // URL could land in the table multiple times.
    const before = (conn.prepare("SELECT COUNT(*) as c FROM extractions").get() as { c: number }).c;
    conn.exec(`
      DELETE FROM extractions
      WHERE id NOT IN (
        SELECT MAX(id) FROM extractions GROUP BY url
      );
    `);
    const after = (conn.prepare("SELECT COUNT(*) as c FROM extractions").get() as { c: number }).c;
    console.log(`[extractions-db] dedup v1: ${before} → ${after} rows`);
    conn.pragma("user_version = 1");
  }

  _db = conn;
  return conn;
}

export type SavedExtraction = {
  id: number;
  url: string;
  hostname: string;
  name: string | null;
  primaryColor: string | null;
  logoUrl: string | null;
  hasScreenshot: boolean;
  source: string;
  createdAt: number;
};

export type SavedExtractionFull = SavedExtraction & {
  designMd: string;
};

export function saveExtraction(input: {
  url: string;
  name: string | null;
  primaryColor: string | null;
  logoUrl: string | null;
  screenshot: { mime: string; base64: string } | null;
  designMd: string;
  source: string;
}): number {
  const hostname = (() => {
    try {
      return new URL(input.url).hostname.replace(/^www\./, "");
    } catch {
      return input.url;
    }
  })();
  const buf = input.screenshot
    ? Buffer.from(input.screenshot.base64, "base64")
    : null;

  const stmt = db().prepare(`
    INSERT INTO extractions
      (url, hostname, name, primary_color, logo_url, screenshot, screenshot_mime, design_md, source, created_at)
    VALUES
      (@url, @hostname, @name, @primaryColor, @logoUrl, @screenshot, @screenshotMime, @designMd, @source, @createdAt)
  `);
  const result = stmt.run({
    url: input.url,
    hostname,
    name: input.name,
    primaryColor: input.primaryColor,
    logoUrl: input.logoUrl,
    screenshot: buf,
    screenshotMime: input.screenshot?.mime ?? null,
    designMd: input.designMd,
    source: input.source,
    createdAt: Date.now(),
  });
  return Number(result.lastInsertRowid);
}

/**
 * Returns the most recent extractions, deduplicated by hostname so the
 * gallery shows a variety of sites instead of the same one repeatedly.
 */
export function getRecent(limit = 12): SavedExtraction[] {
  const rows = db()
    .prepare(
      `
      SELECT id, url, hostname, name, primary_color, logo_url, screenshot, source, created_at
      FROM extractions e
      WHERE id IN (
        SELECT MAX(id) FROM extractions GROUP BY hostname
      )
      ORDER BY created_at DESC
      LIMIT ?
    `,
    )
    .all(limit) as Array<{
    id: number;
    url: string;
    hostname: string;
    name: string | null;
    primary_color: string | null;
    logo_url: string | null;
    screenshot: Buffer | null;
    source: string;
    created_at: number;
  }>;

  return rows.map((r) => ({
    id: r.id,
    url: r.url,
    hostname: r.hostname,
    name: r.name,
    primaryColor: r.primary_color,
    logoUrl: r.logo_url,
    hasScreenshot: !!r.screenshot,
    source: r.source,
    createdAt: r.created_at,
  }));
}

/**
 * Look up the most recent saved extraction for a URL. Used by /api/extract
 * as a persistent cache so repeat URL submissions don't burn Browserbase +
 * LLM costs. The in-memory LLM cache (lib/llm-extract.ts) only covers ~1h
 * and dies on every deploy; this one persists in the Railway volume.
 */
export function getRecentByUrl(
  url: string,
  maxAgeMs: number,
): SavedExtractionFull | null {
  const row = db()
    .prepare(
      `
      SELECT id, url, hostname, name, primary_color, logo_url, screenshot, source, design_md, created_at
      FROM extractions
      WHERE url = ? AND created_at > ?
      ORDER BY created_at DESC
      LIMIT 1
    `,
    )
    .get(url, Date.now() - maxAgeMs) as
    | {
        id: number;
        url: string;
        hostname: string;
        name: string | null;
        primary_color: string | null;
        logo_url: string | null;
        screenshot: Buffer | null;
        source: string;
        design_md: string;
        created_at: number;
      }
    | undefined;

  if (!row) return null;
  return {
    id: row.id,
    url: row.url,
    hostname: row.hostname,
    name: row.name,
    primaryColor: row.primary_color,
    logoUrl: row.logo_url,
    hasScreenshot: !!row.screenshot,
    source: row.source,
    designMd: row.design_md,
    createdAt: row.created_at,
  };
}

/**
 * Returns every extraction (LLM-source only), most recent first. Used by
 * the /tools/design-md/gallery "all entries" view. Caps at `limit` for
 * sanity; we can paginate later if the table grows huge.
 */
export function getAll(limit = 100): SavedExtraction[] {
  const rows = db()
    .prepare(
      `
      SELECT id, url, hostname, name, primary_color, logo_url, screenshot, source, created_at
      FROM extractions
      ORDER BY created_at DESC
      LIMIT ?
    `,
    )
    .all(limit) as Array<{
    id: number;
    url: string;
    hostname: string;
    name: string | null;
    primary_color: string | null;
    logo_url: string | null;
    screenshot: Buffer | null;
    source: string;
    created_at: number;
  }>;

  return rows.map((r) => ({
    id: r.id,
    url: r.url,
    hostname: r.hostname,
    name: r.name,
    primaryColor: r.primary_color,
    logoUrl: r.logo_url,
    hasScreenshot: !!r.screenshot,
    source: r.source,
    createdAt: r.created_at,
  }));
}

export function getById(id: number): SavedExtractionFull | null {
  const row = db()
    .prepare(
      `
      SELECT id, url, hostname, name, primary_color, logo_url, screenshot, source, design_md, created_at
      FROM extractions WHERE id = ?
    `,
    )
    .get(id) as
    | {
        id: number;
        url: string;
        hostname: string;
        name: string | null;
        primary_color: string | null;
        logo_url: string | null;
        screenshot: Buffer | null;
        source: string;
        design_md: string;
        created_at: number;
      }
    | undefined;

  if (!row) return null;
  return {
    id: row.id,
    url: row.url,
    hostname: row.hostname,
    name: row.name,
    primaryColor: row.primary_color,
    logoUrl: row.logo_url,
    hasScreenshot: !!row.screenshot,
    source: row.source,
    designMd: row.design_md,
    createdAt: row.created_at,
  };
}

export function getScreenshot(
  id: number,
): { buffer: Buffer; mime: string } | null {
  const row = db()
    .prepare(
      `SELECT screenshot, screenshot_mime FROM extractions WHERE id = ?`,
    )
    .get(id) as { screenshot: Buffer | null; screenshot_mime: string | null } | undefined;
  if (!row || !row.screenshot) return null;
  return { buffer: row.screenshot, mime: row.screenshot_mime ?? "image/jpeg" };
}

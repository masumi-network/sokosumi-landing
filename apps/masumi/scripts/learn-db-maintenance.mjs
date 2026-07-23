import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import path from "node:path";

function sourcePath() {
  const configured = process.env.MASUMI_LEARN_DB_PATH;
  if (!configured) throw new Error("MASUMI_LEARN_DB_PATH must identify the database explicitly");
  const resolved = path.resolve(configured);
  if (!existsSync(resolved)) throw new Error(`Learn database does not exist: ${resolved}`);
  return resolved;
}

function verify(databasePath) {
  const db = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    const integrity = db.pragma("integrity_check")?.[0]?.integrity_check;
    const foreignKeyErrors = db.pragma("foreign_key_check");
    if (integrity !== "ok") throw new Error(`SQLite integrity check failed: ${integrity || "unknown"}`);
    if (foreignKeyErrors.length) throw new Error(`SQLite foreign-key check returned ${foreignKeyErrors.length} error(s)`);
    return { integrity, foreignKeyErrors: 0 };
  } finally {
    db.close();
  }
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const command = process.argv[2];
const source = sourcePath();

if (command === "verify") {
  console.log(JSON.stringify({ database: source, ...verify(source) }));
} else if (command === "backup") {
  const configuredOutput = argument("--output");
  if (!configuredOutput) throw new Error("backup requires --output /absolute/or/relative/file.db");
  const output = path.resolve(configuredOutput);
  if (output === source) throw new Error("Backup output must differ from the source database");
  if (existsSync(output)) throw new Error(`Refusing to overwrite existing backup: ${output}`);
  const db = new Database(source, { readonly: true, fileMustExist: true });
  try { await db.backup(output); } finally { db.close(); }
  console.log(JSON.stringify({ source, backup: output, ...verify(output) }));
} else {
  throw new Error("Usage: learn-db-maintenance.mjs verify | backup --output FILE.db");
}

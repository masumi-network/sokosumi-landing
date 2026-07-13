// Loads apps/masumi/.env.local into process.env for manual local runs.
// On Railway the real service variables are already set and take precedence.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const envFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".env.local",
);

if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

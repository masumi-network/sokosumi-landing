// Refreshes src/lib/disposable-domains.json from the maintained blocklist
// at github.com/disposable-email-domains/disposable-email-domains.
// Run: node scripts/update-disposable-domains.mjs
import { writeFileSync } from "node:fs";

const SOURCE =
  "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf";

const text = await (await fetch(SOURCE)).text();
const domains = text
  .split("\n")
  .map((l) => l.trim().toLowerCase())
  .filter((l) => l && !l.startsWith("#"));
writeFileSync(
  new URL("../src/lib/disposable-domains.json", import.meta.url),
  JSON.stringify(domains) + "\n"
);
console.log(`${domains.length} domains`);

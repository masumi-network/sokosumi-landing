import { readFile } from "node:fs/promises";
import path from "node:path";

export function readAgentGuide() {
  return readFile(path.join(process.cwd(), "public/token2049/agent-guide.md"), "utf8");
}

import { readFile } from "node:fs/promises";
import path from "node:path";

export function readAgentGuide() {
  return readFile(path.join(process.cwd(), "public/tum-hackathon/agent-guide.md"), "utf8");
}

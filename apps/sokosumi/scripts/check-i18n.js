// Guards the DE dictionary against the two mistakes that are easy to make when
// several people append to one object literal: a duplicate key (the later one
// silently wins, so a fix can be undone by an older entry further down) and a
// key whose German is identical to the English (usually a placeholder someone
// meant to come back to — the deliberate ones are listed below).
const path = require("path");
const { DE } = require(path.join(__dirname, "..", "lib", "i18n"));
const fs = require("fs");
const src = fs.readFileSync(path.join(__dirname, "..", "lib", "i18n.js"), "utf8");

const lines = src.split("\n");
const start = lines.findIndex((l) => l.startsWith("const DE = {"));
const end = lines.findIndex((l, i) => i > start && l.trimEnd() === "};");
const seen = new Map();
const dupes = [];
for (let i = start + 1; i < end; i++) {
  const m = /^\s*"((?:[^"\\]|\\.)*)":/.exec(lines[i]);
  if (!m) continue;
  if (seen.has(m[1])) dupes.push({ key: m[1], first: seen.get(m[1]) + 1, again: i + 1 });
  else seen.set(m[1], i);
}

// Terms that are the same word in German, or that we keep in English on purpose.
const INTENTIONAL = new Set([
  // Loanwords a German marketing team already uses, or words German spells the
  // same way. Adding to this list is a decision, not a formality: it silences
  // the check for that key forever.
  "AI Coworkers", "Briefing", "Task", "Credits", "Seat", "Use Case", "Research",
  "Social", "Roster", "Guides", "Releases", "Blog", "Support", "Sokosumi",
  "Design", "Marketing", "Engineering", "Prototyping", "Tech Stack", "Website",
  "Cookies", "Slides", "Text", "Web", "Hosting", "Workflows", "Guide",
  "Details", "Highlights", "Sokosumi Agent Listing",
  "Strategy", "Coding", "Experience", "Designer", "Coworker", "Todo",
  "Memory", "Board", "Output", "Outputs", "Workspace", "Channels", "Chat", "Brief",
  "Agents", "Personal Assistant", "New Task", "Tasks", "Free", "Planning",
  "Jobs", "Backlog", "Queued", "Agent", "Lead Generation Campaign",
  "Interactive Social Media Monitoring Dashboard", "Marketing Analytics Dashboard",
  // Page titles keep the English section name before the brand.
  "Support | Sokosumi", "Guides | Sokosumi", "Blog | Sokosumi", "Releases | Sokosumi",
]);
const identical = Object.entries(DE).filter(([k, v]) => k === v && !INTENTIONAL.has(k));

for (const d of dupes) console.error(`DUPLICATE key ${JSON.stringify(d.key)} at lines ${d.first} and ${d.again}`);
for (const [k] of identical) console.error(`UNTRANSLATED (German === English): ${JSON.stringify(k)}`);
const bad = dupes.length + identical.length;
console.log(bad ? `FAIL — ${dupes.length} duplicate(s), ${identical.length} untranslated` : `OK — ${seen.size} keys, no duplicates, no accidental pass-throughs`);
process.exit(bad ? 1 : 0);

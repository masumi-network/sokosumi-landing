// The AI visibility checker. We ask the model five buyer questions about a
// category and report which brands it names — the same thing a prospect sees
// when they ask an assistant "what's the best X". This is deliberately honest
// about what it is: one model, five questions, at the time of the run. The
// page says which model was asked; we never present it as "your ranking in
// ChatGPT".
//
// Forcing the answers into a JSON array of names (instead of prose we then
// have to mine) keeps parsing deterministic and the token bill tiny.

const llm = require("./llm");

const QUESTIONS = [
  (c) => `What are the best ${c} right now? Name specific products or companies.`,
  (c) => `I need to pick ${c} for my company. Which would you recommend?`,
  (c) => `Give me a shortlist of ${c} worth evaluating.`,
  (c) => `What are the most popular ${c}?`,
  (c) => `Which ${c} would you suggest to someone on a small budget?`,
];

const SYSTEM =
  "You answer buyer questions. Reply ONLY with a JSON array of up to 8 brand or product names, " +
  "ranked in the order you would actually mention them, best first. Real names only — no " +
  "descriptions, no markdown, no text outside the JSON array.";

// "Sokosumi", "sokosumi.com", "Sokosumi AI" should all count as the same
// brand. Compare on lowercase alphanumerics only.
function norm(name) {
  return String(name || "").toLowerCase().replace(/\.(com|io|ai|co|app|net|org|de)$/i, "").replace(/[^a-z0-9]/g, "");
}

// Like norm, but keeps word boundaries: "HubSpot CRM" → "hubspot crm".
function words(name) {
  return String(name || "").toLowerCase().replace(/\.(com|io|ai|co|app|net|org|de)$/i, "").replace(/[^a-z0-9]+/g, " ").trim();
}

// Exact match on the squashed form, or whole-word containment either way.
// Substring containment is not enough: "Meta" must not count as a mention
// inside "Metabase", and a brand called "AI" must not appear in half the
// answers.
function matches(candidate, brandKeys) {
  const squashed = norm(candidate);
  const wordy = ` ${words(candidate)} `;
  if (!squashed) return false;
  return brandKeys.some((b) => {
    if (!b || !b.squashed) return false;
    if (squashed === b.squashed) return true;
    if (wordy.includes(` ${b.words} `)) return true;
    if (` ${b.words} `.includes(wordy)) return true;
    return false;
  });
}

function brandKey(name) {
  return { squashed: norm(name), words: words(name) };
}

// ── result cache ─────────────────────────────────────────────────────────
// The same brand+category within an hour answers from memory: reruns while
// someone tweaks their page cost nothing, and a shared link doesn't re-bill.
const cache = new Map();
const TTL_MS = 60 * 60 * 1000;

// Timeouts are per attempt and the retry gets a shorter one, so the worst
// case (every question retried) stays inside the Vercel function limit.
async function ask(question, attempt = 0) {
  const text = await llm.chat({
    system: SYSTEM,
    user: question,
    maxTokens: 200,
    temperature: 0.4,
    timeoutMs: attempt === 0 ? 15000 : 10000,
  });
  const parsed = llm.parseJson(text);
  if (!Array.isArray(parsed)) {
    // One more try — a single flaky answer should not put a "failed" row in
    // every report that hits it.
    if (attempt === 0) return ask(question, 1);
    return null;
  }
  return parsed
    .map((n) => (typeof n === "string" ? n.trim() : ""))
    .filter((n) => n && n.length <= 80)
    .slice(0, 8);
}

async function check({ brand, category, website }) {
  const cleanBrand = String(brand || "").trim().slice(0, 80);
  const cleanCategory = String(category || "").trim().slice(0, 120);
  if (!cleanBrand) throw new Error("Add your brand or product name.");
  if (!cleanCategory || cleanCategory.length < 3) {
    throw new Error("Describe your category, like “email marketing tools” or “running shoes”.");
  }

  const host = String(website || "").trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").split(/[/?#]/)[0];
  const cacheKey = `${norm(cleanBrand)}|${cleanCategory.toLowerCase()}|${norm(host)}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < TTL_MS) return hit.result;

  const brandKeys = [brandKey(cleanBrand)];
  if (host) brandKeys.push(brandKey(host.split(".").slice(0, -1).join(".") || host));

  const questions = QUESTIONS.map((q) => q(cleanCategory));
  // A systemic failure (no API key, provider outage, timeouts) must surface
  // as itself, not hide behind the "could not answer" message meant for odd
  // categories — that one is only right when the model answered but not in
  // the shape we asked for.
  let keyError = null;
  let upstreamError = null;
  const answers = await Promise.all(
    questions.map((q) =>
      ask(q).catch((error) => {
        if (error.code === "no-key" || error.status === 401 || error.status === 402) keyError = error;
        else upstreamError = error;
        return null;
      }),
    ),
  );
  const usable = answers.filter(Boolean);
  if (usable.length < 3) {
    if (keyError) throw keyError;
    if (upstreamError) {
      const err = new Error("The model service is having trouble right now. Try again in a few minutes.");
      err.status = 502;
      throw err;
    }
    throw new Error("The model could not answer enough questions for this category. Try a plainer category description.");
  }

  const competitorCounts = new Map();
  const prompts = questions.map((question, i) => {
    const brands = answers[i];
    if (!brands) return { question, failed: true, brands: [], mentioned: false, rank: null };
    let rank = null;
    brands.forEach((name, index) => {
      if (matches(name, brandKeys)) {
        if (rank === null) rank = index + 1;
        return;
      }
      const key = norm(name);
      const existing = competitorCounts.get(key);
      if (existing) existing.count++;
      else competitorCounts.set(key, { name, count: 1 });
    });
    return { question, failed: false, brands, mentioned: rank !== null, rank };
  });

  const answered = prompts.filter((p) => !p.failed);
  const mentioned = answered.filter((p) => p.mentioned);
  const competitors = [...competitorCounts.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8)
    .map((c) => ({ name: c.name, count: c.count, of: answered.length }));

  const result = {
    brand: cleanBrand,
    category: cleanCategory,
    model: llm.MODEL,
    checkedAt: Date.now(),
    asked: answered.length,
    mentionedCount: mentioned.length,
    bestRank: mentioned.length ? Math.min(...mentioned.map((p) => p.rank)) : null,
    prompts,
    competitors,
  };
  cache.set(cacheKey, { ts: Date.now(), result });
  if (cache.size > 500) {
    for (const [key, entry] of cache) {
      if (Date.now() - entry.ts > TTL_MS) cache.delete(key);
    }
  }
  return result;
}

module.exports = { check };

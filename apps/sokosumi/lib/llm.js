// One small OpenRouter client for the free tools that need a model (the AI
// visibility checker and the meta tag generator). Same endpoint and model
// family as the DESIGN.md extractor on the masumi side: Claude Haiku is the
// cheap tier, and these tools make short, capped calls, so a run costs well
// under a cent. TOOLS_LLM_MODEL overrides the model without a deploy.

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.TOOLS_LLM_MODEL || "anthropic/claude-haiku-4.5";

function available() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

// Returns the assistant text. Throws on missing key, HTTP errors, timeouts.
async function chat({ system, user, maxTokens = 500, temperature = 0.4, timeoutMs = 20000 }) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    const err = new Error("The tool is temporarily unavailable.");
    err.code = "no-key";
    throw err;
  }
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://www.sokosumi.com",
      "X-Title": "Sokosumi free tools",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    const err = new Error(`The model returned HTTP ${response.status}.`);
    err.status = response.status;
    throw err;
  }
  const data = await response.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message
    ? String(data.choices[0].message.content || "")
    : "";
  if (!text.trim()) throw new Error("The model returned an empty answer.");
  return text;
}

// Models love to wrap JSON in fences or a sentence. Dig the first JSON value
// out of the text instead of trusting the whole reply to parse.
function parseJson(text) {
  const cleaned = String(text).replace(/```(?:json)?/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch { /* fall through to the bracket scan */ }
  const start = cleaned.search(/[[{]/);
  if (start === -1) return null;
  const open = cleaned[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === open) depth++;
    else if (cleaned[i] === close && --depth === 0) {
      try {
        return JSON.parse(cleaned.slice(start, i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

module.exports = { chat, parseJson, available, MODEL };

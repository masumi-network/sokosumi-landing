"use strict";

// Deterministic GitHub-repo-to-system-prompt builder for /tools/codepiler.
// Only ever talks to api.github.com — the host is fixed, not user-supplied,
// so this doesn't need lib/safeFetch.js's SSRF guard the way a
// user-URL-crawling tool does. It reads repo metadata, the language
// breakdown, and the root file listing (three unauthenticated GitHub API
// calls), then builds a system-prompt describing the repo's own detected
// conventions from what's actually in the root — no LLM, no repo content
// beyond the root listing is read.
//
// GitHub's unauthenticated rate limit (60 requests/hour) is shared across
// every visitor hitting this tool from our server's IP, not per-visitor —
// that's why server.js caps this one much lower than the other checkers.

const REPO_PATTERN = /^[A-Za-z0-9._-]+$/;
const UA = "Mozilla/5.0 (compatible; SokosumiCodePiler/1.0; +https://sokosumi.com/tools/codepiler)";

function parseRepo(input) {
  const trimmed = String(input || "").trim();
  let match = /github\.com\/([^/]+)\/([^/#?]+)/i.exec(trimmed);
  if (!match) match = /^([^/\s]+)\/([^/\s]+)$/.exec(trimmed);
  if (!match) return null;
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");
  if (!REPO_PATTERN.test(owner) || !REPO_PATTERN.test(repo)) return null;
  return { owner, repo };
}

async function ghFetch(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: { "User-Agent": UA, Accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(8000),
  });
  if (response.status === 404) {
    const error = new Error("That repository wasn't found — check it's spelled right and public.");
    error.status = 404;
    throw error;
  }
  if (response.status === 403 || response.status === 429) {
    const error = new Error("GitHub's public API rate limit was hit for this tool. Try again in a few minutes.");
    error.status = 429;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(`GitHub's API responded with HTTP ${response.status}.`);
    error.status = 502;
    throw error;
  }
  return response.json();
}

function detectFromFileList(names) {
  const has = (re) => names.some((n) => re.test(n));
  const packageManager = has(/^pnpm-lock\.yaml$/i)
    ? "pnpm"
    : has(/^yarn\.lock$/i)
      ? "Yarn"
      : has(/^package-lock\.json$/i)
        ? "npm"
        : has(/^package\.json$/i)
          ? "npm (no lockfile found)"
          : has(/^requirements\.txt$/i) || has(/^pyproject\.toml$/i)
            ? "pip / Poetry"
            : has(/^Cargo\.toml$/i)
              ? "Cargo"
              : has(/^go\.mod$/i)
                ? "Go modules"
                : has(/^Gemfile$/i)
                  ? "Bundler"
                  : null;
  const testFramework = has(/^jest\.config/i)
    ? "Jest"
    : has(/^vitest\.config/i)
      ? "Vitest"
      : has(/^pytest\.ini$/i) || has(/^tox\.ini$/i)
        ? "pytest"
        : has(/^__tests__$/i) || has(/^tests?$/i) || has(/^spec$/i)
          ? "a tests/spec directory (framework not identified from the root listing)"
          : null;
  const lintFormat = [];
  if (has(/^\.eslintrc/i)) lintFormat.push("ESLint");
  if (has(/^\.prettierrc/i) || has(/^prettier\.config/i)) lintFormat.push("Prettier");
  if (has(/^ruff\.toml$/i) || has(/^\.ruff\.toml$/i)) lintFormat.push("Ruff");
  if (has(/^\.rubocop\.yml$/i)) lintFormat.push("RuboCop");
  const ci = has(/^\.github$/i) ? "GitHub Actions" : has(/^\.gitlab-ci\.yml$/i) ? "GitLab CI" : has(/^\.circleci$/i) ? "CircleCI" : null;
  const hasLicense = has(/^licen[cs]e/i);
  const hasTypescript = has(/^tsconfig\.json$/i);
  return { packageManager, testFramework, lintFormat, ci, hasLicense, hasTypescript };
}

function buildSystemPrompt({ owner, repo, description, languages, detected }) {
  const lines = [];
  lines.push(`You are working in the ${owner}/${repo} repository.`);
  if (description) lines.push(description);
  if (languages.length) lines.push(`Primary language(s): ${languages.map((l) => `${l.name} (${l.pct}%)`).join(", ")}.`);
  if (detected.hasTypescript) lines.push("This is a TypeScript codebase — keep new code typed, don't introduce `any` without reason.");
  if (detected.packageManager) lines.push(`Package manager: ${detected.packageManager}. Use it for installs — don't mix package managers.`);
  if (detected.testFramework) lines.push(`Tests use ${detected.testFramework}. Run the existing test suite before considering a change done.`);
  if (detected.lintFormat.length) lines.push(`Formatting/linting is enforced with ${detected.lintFormat.join(" and ")} — match the existing config, don't introduce a competing one.`);
  if (detected.ci) lines.push(`CI runs on ${detected.ci} — a change that breaks the pipeline isn't done.`);
  lines.push("Match the existing code style and conventions in the surrounding files rather than introducing a new pattern.");
  return lines.join("\n");
}

async function analyze(input) {
  const repoInput = (input && (input.repo || input.url)) || "";
  const parsed = parseRepo(repoInput);
  if (!parsed) {
    const error = new Error("Enter a GitHub repo as a URL (https://github.com/owner/repo) or owner/repo.");
    error.status = 400;
    throw error;
  }
  const { owner, repo } = parsed;

  const [meta, languageBytes, contents] = await Promise.all([
    ghFetch(`/repos/${owner}/${repo}`),
    ghFetch(`/repos/${owner}/${repo}/languages`),
    ghFetch(`/repos/${owner}/${repo}/contents`),
  ]);

  const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(languageBytes)
    .map(([name, bytes]) => ({ name, pct: Math.round((bytes / totalBytes) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  const names = Array.isArray(contents) ? contents.map((c) => c.name) : [];
  const detected = detectFromFileList(names);

  const systemPrompt = buildSystemPrompt({ owner, repo, description: meta.description, languages, detected });

  return {
    repo: `${owner}/${repo}`,
    description: meta.description || "",
    stars: meta.stargazers_count,
    languages,
    detected,
    rootFiles: names.slice(0, 30),
    systemPrompt,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze };

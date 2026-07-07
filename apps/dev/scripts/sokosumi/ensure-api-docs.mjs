/**
 * Generated API MDX lives under content/sokosumi/api-reference/ (nested folders) and
 * is gitignored. Without running the OpenAPI generator, meta.json still lists pages
 * that do not exist, which breaks the docs tree and routes like /api-reference and
 * the Projects section.
 *
 * Runs generate-openapi when the projects folder has no MDX yet (fresh clone).
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const projectsDir = join(root, 'content/sokosumi/api-reference/projects');

/** True if any .mdx exists under dir (nested, e.g. projects/projects/get.mdx). */
function dirContainsMdx(dir) {
  try {
    if (!existsSync(dir)) return false;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (name.endsWith('.mdx')) return true;
      try {
        if (statSync(full).isDirectory() && dirContainsMdx(full)) return true;
      } catch {
        // ignore
      }
    }
  } catch {
    return false;
  }
  return false;
}

if (!dirContainsMdx(projectsDir)) {
  console.log(
    '[api-docs] Generated API pages missing under api-reference/projects. Running scripts/generate-openapi.mjs …',
  );
  execSync(`node "${join(root, 'scripts', 'sokosumi', 'generate-openapi.mjs')}"`, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
}

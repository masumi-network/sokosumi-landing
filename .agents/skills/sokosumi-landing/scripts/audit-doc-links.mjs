#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();
const contentRoot = path.join(repoRoot, 'apps/dev/content');
const legacyHosts = /https?:\/\/(?:www\.)?(?:docs\.masumi\.network|docs\.sokosumi\.com)(?:[^\s"'`<>)]*)?/g;
const sourceExtensions = new Set(['.css', '.html', '.js', '.json', '.jsx', '.md', '.mdx', '.mjs', '.ts', '.tsx']);

// These files intentionally recognize or explain legacy URLs. Additions deserve review.
const legacyAllowlist = new Set([
  'apps/dev/README.md',
  'apps/dev/app/api/nori/chat/route.ts',
  'apps/dev/lib/base-path.ts',
  'apps/dev/next.config.mjs',
  'apps/dev/scripts/fetch-readme.mjs',
  'docs/CODEBASE_MAP.md',
  'docs/DEV_HUB_MAP.md',
]);

function trackedSourceFiles() {
  const output = execFileSync('git', ['ls-files', '-c', '-o', '--exclude-standard'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  const tracked = output
    .split('\n')
    .filter(Boolean)
    .filter((file) => sourceExtensions.has(path.extname(file)))
    .filter((file) => !file.includes('/.next/') && !file.includes('/node_modules/'));

  // Generated docs are git-ignored but served at runtime, so audit their links too.
  const runtimeDocs = walkMdx(contentRoot).map((file) => path.relative(repoRoot, file));
  return [...new Set([...tracked, ...runtimeDocs])];
}

function lineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}

function walkMdx(directory, files = []) {
  if (!existsSync(directory)) return files;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walkMdx(absolute, files);
    else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) files.push(absolute);
  }
  return files;
}

function routeForMdx(file) {
  let relative = path.relative(contentRoot, file).split(path.sep).join('/');
  relative = relative.replace(/\/(?:\([^/]+\))\//g, '/');
  relative = relative.replace(/\.(?:md|mdx)$/, '');
  relative = relative.replace(/\/index$/, '');
  return `/${relative}`.replace(/\/$/, '');
}

function docsRoutes() {
  const routes = new Set(['/masumi', '/sokosumi']);
  for (const product of ['masumi', 'sokosumi']) {
    for (const file of walkMdx(path.join(contentRoot, product))) routes.add(routeForMdx(file));
  }
  return routes;
}

function normalizeDocsTarget(target) {
  let normalized = target.replace('https://www.masumi.network/dev', '');
  normalized = normalized.split(/[?#]/, 1)[0];
  normalized = normalized.replace(/\.(?:md|markdown)$/, '');
  normalized = normalized.replace(/\/$/, '');
  return normalized || '/';
}

function extractDocsTargets(content) {
  const patterns = [
    /\]\(\s*((?:https:\/\/www\.masumi\.network\/dev)?\/(?:masumi|sokosumi)(?:[^)\s]*))/g,
    /\bhref\s*[:=]\s*["']((?:https:\/\/www\.masumi\.network\/dev)?\/(?:masumi|sokosumi)(?:[^"']*)?)["']/g,
    /(https:\/\/www\.masumi\.network\/dev\/(?:masumi|sokosumi)(?:[^\s"'`<>)]*)?)/g,
  ];
  const matches = new Map();

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const target = match[1].replace(/[.,;:`]+$/, '');
      if (/[$*{}]|\.\.\./.test(target)) continue;
      matches.set(`${match.index}:${target}`, { index: match.index, target });
    }
  }

  return matches.values();
}

const files = trackedSourceFiles();
const routes = docsRoutes();
const stale = [];
const broken = [];

for (const file of files) {
  const absolute = path.join(repoRoot, file);
  if (!existsSync(absolute)) continue;
  const content = readFileSync(absolute, 'utf8');

  if (!legacyAllowlist.has(file)) {
    for (const match of content.matchAll(legacyHosts)) {
      stale.push(`${file}:${lineNumber(content, match.index)} ${match[0]}`);
    }
  }

  for (const match of extractDocsTargets(content)) {
    const { target } = match;
    const route = normalizeDocsTarget(target);
    if (!routes.has(route)) {
      broken.push(`${file}:${lineNumber(content, match.index)} ${target} -> ${route}`);
    }
  }
}

if (stale.length === 0 && broken.length === 0) {
  console.log(`Documentation link audit passed (${routes.size} local routes checked).`);
  process.exit(0);
}

if (stale.length > 0) {
  console.error(`\nLegacy public documentation destinations (${stale.length}):`);
  for (const item of stale) console.error(`  ${item}`);
}

if (broken.length > 0) {
  console.error(`\nDocumentation targets without a matching local MDX route (${broken.length}):`);
  for (const item of broken) console.error(`  ${item}`);
}

console.error('\nAudit failed. Update public destinations or repair the referenced docs route.');
process.exit(1);

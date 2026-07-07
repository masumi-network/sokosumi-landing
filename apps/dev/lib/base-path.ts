/**
 * The portal is served under a basePath (see next.config.mjs) so it can live
 * at masumi.network/dev. Next.js automatically prefixes <Link>, router
 * navigation, and headers/redirects — but NOT next/image string `src`,
 * plain <img>, or client-side fetch() calls. Use these helpers for those.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Origin the portal is served from (the masumi.network website). */
export const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.masumi.network';

/** Fully-qualified base URL of the developer portal, e.g. https://www.masumi.network/dev */
export const portalUrl = `${siteOrigin}${basePath}`;

/** Prefix an absolute site path (e.g. `/assets/logo.png`) with the basePath. */
export function withBasePath(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (basePath && path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}

const masumiLegacySections = new Set([
  'documentation',
  'core-concepts',
  'api-reference',
  'n8n-node',
  'mips',
]);

const sokosumiLegacySections = new Set([
  'documentation',
  'api-reference',
  'cli_docs',
  'mcp',
]);

function stripMarkdownExtension(path: string) {
  return path.replace(/\.(mdx|md)$/i, '');
}

function appendSearchAndHash(path: string, search = '', hash = '') {
  return `${path}${search}${hash}`;
}

function withPortalOrigin(path: string) {
  if (basePath && path.startsWith(`${basePath}/`)) return `${siteOrigin}${path}`;
  if (basePath && path === basePath) return `${siteOrigin}${path}`;
  return `${portalUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function docsPathFromRelativePath(path: string, search = '', hash = ''): string | null {
  const clean = stripMarkdownExtension(path.trim())
    .replace(/^apps\/dev\//, '')
    .replace(/^\.?\//, '')
    .replace(/^content\//, '')
    .replace(/^docs\//, '')
    .replace(/\/index$/i, '');

  if (!clean) return null;

  const segments = clean.split('/').filter(Boolean);
  const [first, ...rest] = segments;
  if (!first) return null;

  if (first === 'dev') {
    return appendSearchAndHash(`/${segments.join('/')}`, search, hash);
  }

  if (first === 'masumi' || first === 'sokosumi') {
    return appendSearchAndHash(`/${segments.join('/')}`, search, hash);
  }

  if (masumiLegacySections.has(first)) {
    return appendSearchAndHash(`/masumi/${segments.join('/')}`, search, hash);
  }

  if (sokosumiLegacySections.has(first)) {
    return appendSearchAndHash(`/sokosumi/${segments.join('/')}`, search, hash);
  }

  return null;
}

function canonicalPathFromAbsoluteUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const path = stripMarkdownExtension(url.pathname).replace(/\/index$/i, '');

  if (host === 'docs.masumi.network') {
    if (path === '/' || path === '') return basePath || '/dev';
    if (path === '/ask') return basePath || '/dev';
    return appendSearchAndHash(`${basePath}/masumi${path}`, url.search, url.hash);
  }

  if (host === 'docs.sokosumi.com') {
    if (path === '/' || path === '') return `${basePath}/sokosumi`;
    return appendSearchAndHash(`${basePath}/sokosumi${path}`, url.search, url.hash);
  }

  if (
    host === 'masumi.network' ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0'
  ) {
    if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) {
      return appendSearchAndHash(path, url.search, url.hash);
    }

    const relativeDocsPath = docsPathFromRelativePath(path, url.search, url.hash);
    if (relativeDocsPath) {
      return basePath && relativeDocsPath.startsWith(`${basePath}/`)
        ? relativeDocsPath
        : appendSearchAndHash(`${basePath}${relativeDocsPath}`, '', '');
    }
  }

  return null;
}

/**
 * Canonicalize known documentation links to the production DevHub host.
 * Unknown external links are returned unchanged.
 */
export function canonicalDocsUrl(value: string): string {
  const href = value.trim();
  if (!href || href.startsWith('#')) return href;

  try {
    const url = new URL(href);
    const path = canonicalPathFromAbsoluteUrl(url);
    return path ? `${siteOrigin}${path}` : href;
  } catch {
    const path = href.startsWith('/')
      ? docsPathFromRelativePath(href)
      : docsPathFromRelativePath(href);

    return path ? withPortalOrigin(path) : href;
  }
}

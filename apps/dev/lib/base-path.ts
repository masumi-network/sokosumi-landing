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

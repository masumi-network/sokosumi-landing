'use client';

const STORAGE_KEY = 'masumi-portal:last-product';

export type PortalProduct = 'masumi' | 'sokosumi';

export function productFromPathname(pathname: string | null): PortalProduct | null {
  if (pathname?.startsWith('/masumi')) return 'masumi';
  if (pathname?.startsWith('/sokosumi')) return 'sokosumi';
  return null;
}

export function getLastProduct(): PortalProduct {
  if (typeof window === 'undefined') return 'masumi';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'sokosumi' ? 'sokosumi' : 'masumi';
}

export function rememberProduct(product: PortalProduct) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, product);
}

export function productHome(product: PortalProduct): string {
  return `/${product}/documentation`;
}

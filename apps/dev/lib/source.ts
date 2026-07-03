import { masumiDocs, sokosumiDocs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createOpenAPI, openapiPlugin } from 'fumadocs-openapi/server';
import { icons } from 'lucide-react';
import { createElement } from 'react';

export const paymentOpenApiSpecUrl =
  'https://raw.githubusercontent.com/masumi-network/masumi-payment-service/5fccf58b0f30873085b59ee540c67b4ae8433cd0/src/utils/generator/swagger-generator/openapi-docs.json';

export const registryOpenApiSpecUrl =
  'https://raw.githubusercontent.com/masumi-network/masumi-registry-service/refs/heads/main/src/utils/swagger-generator/openapi-docs.json';

function resolveIcon(icon: string | undefined) {
  if (!icon) return;
  if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
}

// See https://fumadocs.dev/docs/headless/source-api for more info
export const masumiSource = loader({
  baseUrl: '/masumi',
  source: masumiDocs.toFumadocsSource(),
  plugins: [openapiPlugin()],
  icon: resolveIcon,
});

export const sokosumiSource = loader({
  baseUrl: '/sokosumi',
  source: sokosumiDocs.toFumadocsSource(),
  plugins: [openapiPlugin()],
  icon: resolveIcon,
});

/** Product registry: maps the URL segment to its content source. */
export const productSources = {
  masumi: masumiSource,
  sokosumi: sokosumiSource,
} as const;

export type ProductId = keyof typeof productSources;

export function isProductId(value: string): value is ProductId {
  return value in productSources;
}

/** All pages across every product (page.url already includes the product prefix). */
export function getAllPages() {
  return Object.values(productSources).flatMap((src) => src.getPages());
}

/**
 * Resolve a page from URL segments that include the product prefix,
 * e.g. ['masumi', 'core-concepts', 'payments'].
 */
export function getPageByUrlSegments(slug: string[]) {
  const [product, ...rest] = slug;
  if (!product || !isProductId(product)) return undefined;
  const src = productSources[product];
  return src.getPage(rest) ?? src.getPage([...rest, 'index']);
}

// OpenAPI configuration for generated docs
export const openapi = createOpenAPI({
  input: [paymentOpenApiSpecUrl, registryOpenApiSpecUrl],
});

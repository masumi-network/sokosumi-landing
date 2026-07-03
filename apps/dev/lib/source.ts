import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createOpenAPI, openapiPlugin } from 'fumadocs-openapi/server';
import { icons } from 'lucide-react';
import { createElement } from 'react';

export const paymentOpenApiSpecUrl =
  'https://raw.githubusercontent.com/masumi-network/masumi-payment-service/5fccf58b0f30873085b59ee540c67b4ae8433cd0/src/utils/generator/swagger-generator/openapi-docs.json';

export const registryOpenApiSpecUrl =
  'https://raw.githubusercontent.com/masumi-network/masumi-registry-service/refs/heads/main/src/utils/swagger-generator/openapi-docs.json';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  plugins: [openapiPlugin()],
  icon(icon) {
    if (!icon) {
      // You may set a default icon
      return;
    }
    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
});

// OpenAPI configuration for generated docs
export const openapi = createOpenAPI({
  input: [paymentOpenApiSpecUrl, registryOpenApiSpecUrl],
});

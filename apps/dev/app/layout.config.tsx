import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { ProductSwitcher } from "@/components/product-switcher";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    // The brand mark doubles as the product dropdown (logo + dev badge + caret),
    // mirroring the masumi.network logo menu.
    title: (
      <span className="masumi-brand-mark">
        <ProductSwitcher />
      </span>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [],
  githubUrl: 'https://github.com/masumi-network',
};

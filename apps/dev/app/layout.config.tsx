import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import { ModeSwitcher } from "@/components/mode-switcher";
import { withBasePath } from "@/lib/base-path";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="masumi-brand-mark">
        <Image
          src={withBasePath("/assets/masumi_logo.png")}
          alt="Masumi Logo"
          width={130}
          height={50}
          className="masumi-brand-logo dark:hidden"
        />
        <Image
          src={withBasePath("/assets/masumi_logo_dark.png")}
          alt="Masumi Logo"
          width={130}
          height={50}
          className="masumi-brand-logo hidden dark:block"
        />
      </span>
    ),
    children: <ModeSwitcher className="masumi-mode-switcher--nav" />,
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [],
  githubUrl: 'https://github.com/masumi-network',
};

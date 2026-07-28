'use client';

import { Header } from '@summation/shared';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteOrigin } from '@/lib/base-path';

const devHubLinks = [
  {
    href: '/map',
    label: 'Map',
    description: 'Choose a path through the Masumi ecosystem.',
    match: (path: string) => path === '/' || path === '/map' || path === '/roadmap',
  },
  {
    href: '/ask',
    label: 'Ask Nori',
    description: 'Ask questions across Masumi and Sokosumi.',
    match: (path: string) => path === '/ask',
  },
  {
    href: '/masumi/documentation',
    label: 'Masumi documentation',
    description: 'Identity, registry, wallets, payments, and APIs.',
    match: (path: string) => path.startsWith('/masumi'),
  },
  {
    href: '/sokosumi/documentation',
    label: 'Sokosumi documentation',
    description: 'Agents, coworkers, tasks, jobs, and organizations.',
    match: (path: string) => path.startsWith('/sokosumi'),
  },
  {
    href: '/agents',
    label: 'Agents',
    description: 'Machine-readable docs, indexes, skills, and MCP.',
    match: (path: string) => path === '/agents',
  },
] as const;

const docsSectionLinks = {
  masumi: [
    {
      href: '/masumi/documentation',
      label: 'Documentation',
      match: (path: string) => path.startsWith('/masumi/documentation'),
    },
    {
      href: '/masumi/core-concepts',
      label: 'Core Concepts',
      match: (path: string) => path.startsWith('/masumi/core-concepts'),
    },
    {
      href: '/masumi/api-reference',
      label: 'API Reference',
      match: (path: string) => path.startsWith('/masumi/api-reference'),
    },
    {
      href: '/masumi/n8n-node',
      label: 'N8N Node',
      match: (path: string) => path.startsWith('/masumi/n8n-node'),
    },
    {
      href: '/masumi/mips',
      label: 'MIPs',
      match: (path: string) => path.startsWith('/masumi/mips'),
    },
  ],
  sokosumi: [
    {
      href: '/sokosumi/documentation',
      label: 'Documentation',
      match: (path: string) => path.startsWith('/sokosumi/documentation'),
    },
    {
      href: '/sokosumi/api-reference',
      label: 'API',
      match: (path: string) => path.startsWith('/sokosumi/api-reference'),
    },
    {
      href: '/sokosumi/cli_docs',
      label: 'Sokosumi CLI',
      match: (path: string) => path.startsWith('/sokosumi/cli_docs'),
    },
    {
      href: '/sokosumi/mcp',
      label: 'MCP',
      match: (path: string) => path.startsWith('/sokosumi/mcp'),
    },
  ],
} as const;

export function DevSiteChrome() {
  const pathname = usePathname();
  const normalizedPath = pathname?.replace(/^\/dev(?=\/|$)/, '') || '/';
  const docsLinks = normalizedPath.startsWith('/masumi')
    ? docsSectionLinks.masumi
    : normalizedPath.startsWith('/sokosumi')
      ? docsSectionLinks.sokosumi
      : null;
  const documentationMenuItems = devHubLinks.map((item) => ({
    href: item.href,
    label: item.label,
    description: item.description,
    active: item.match(normalizedPath),
  }));

  return (
    <>
      <Header
        product="masumi"
        siteRootHref={siteOrigin}
        assetBaseUrl={siteOrigin}
        documentationHref="/dev"
        documentationCtaHref="/dev/masumi/documentation"
        documentationMenuItems={documentationMenuItems}
      />
      {docsLinks && (
        <nav className="devhub-docs-context" aria-label="Documentation sections">
          <div className="devhub-docs-subnav">
            {docsLinks.map((item) => {
              const isActive = item.match(normalizedPath);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="devhub-docs-subnav-link"
                  aria-current={isActive ? 'page' : undefined}
                  data-active={isActive ? 'true' : 'false'}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Braces,
  Check,
  Code2,
  Copy,
  DatabaseZap,
  ExternalLink,
  FileText,
  ListTree,
  Server,
  Sparkles,
} from 'lucide-react';
import { portalUrl, withBasePath } from '@/lib/base-path';

interface DocsPage {
  title?: string;
  description?: string;
  url: string;
}

const baseUrl = portalUrl;

const openApiLinks = [
  {
    label: 'Payment Service OpenAPI',
    href: 'https://raw.githubusercontent.com/masumi-network/masumi-payment-service/5fccf58b0f30873085b59ee540c67b4ae8433cd0/src/utils/generator/swagger-generator/openapi-docs.json',
  },
  {
    label: 'Registry Service OpenAPI',
    href: 'https://raw.githubusercontent.com/masumi-network/masumi-registry-service/refs/heads/main/src/utils/swagger-generator/openapi-docs.json',
  },
];

const skillLinks = [
  {
    label: 'Masumi skills',
    href: '/masumi/documentation/integrations/masumi-skills',
    description: 'Installable agent skills and docs setup for Masumi-aware assistants.',
  },
  {
    label: 'Masumi MCP Server',
    href: '/masumi/documentation/technical-documentation/_masumi-mcp-server',
    description: 'Live Masumi Network actions for agent discovery, hiring, jobs, and payments.',
  },
  {
    label: 'Sokosumi MCP Server',
    href: '/sokosumi/mcp',
    description: 'Marketplace tools for listing agents, creating jobs, and monitoring work.',
  },
  {
    label: 'Sokosumi CLI skills',
    href: '/sokosumi/cli_docs',
    description: 'Command-line and plugin workflows for agents that work with Sokosumi.',
  },
];

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="agents-copy-button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function EndpointCard({
  icon: Icon,
  title,
  description,
  url,
  children,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  url: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="agents-endpoint-card">
      <div className="agents-endpoint-icon">
        <Icon aria-hidden="true" />
      </div>
      <div className="agents-endpoint-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="agents-url-row">
          <code>{url}</code>
          <CopyButton value={url} />
        </div>
        {children}
      </div>
    </article>
  );
}

export function AgentsHub({ pages }: { pages: DocsPage[] }) {
  const featuredPages = useMemo(
    () =>
      pages
        .filter((page) =>
          [
            '/masumi/documentation/get-started/install-masumi-node',
            '/masumi/documentation/get-started/register-agent',
            '/masumi/documentation/how-to-guides/how-to-enable-agent-collaboration',
            '/masumi/documentation/technical-documentation/agentic-service-api',
            '/masumi/api-reference',
          ].includes(page.url),
        )
        .slice(0, 5),
    [pages],
  );

  const agentContext = [
    'Use Masumi documentation as the source of truth.',
    `Concise index: ${baseUrl}/llms.txt`,
    `Full corpus: ${baseUrl}/llms-full.txt`,
    `Markdown index: ${baseUrl}/md-index`,
    `Per-page Markdown pattern: ${baseUrl}/{path}.md`,
    'Cite the relevant docs URL when answering.',
  ].join('\n');

  return (
    <section className="agents-shell">
      <div className="agents-hero">
        <p className="agents-kicker">
          <Bot aria-hidden="true" />
          Machine-readable mode
        </p>
        <h1>Masumi docs for humans and agents.</h1>
        <p>
          The same documentation corpus is available as rendered pages, concise LLM indexes, full-corpus text, per-page
          Markdown, Context7 metadata, API specs, and MCP guidance.
        </p>
        <div className="agents-hero-actions">
          <a href={withBasePath('/llms.txt')}>Open llms.txt</a>
          <a href={withBasePath('/llms-full.txt')}>Open full corpus</a>
          <CopyButton value={agentContext} label="Copy agent context" />
        </div>
      </div>

      <div className="agents-stat-grid">
        <div>
          <strong>{pages.length}</strong>
          <span>Docs pages indexed</span>
        </div>
        <div>
          <strong>3</strong>
          <span>Primary machine formats</span>
        </div>
        <div>
          <strong>CORS</strong>
          <span>Enabled Markdown access</span>
        </div>
      </div>

      <div className="agents-endpoint-grid">
        <EndpointCard
          icon={ListTree}
          title="llms.txt"
          description="Concise overview for system prompts, agent bootstrapping, and docs discovery."
          url={`${baseUrl}/llms.txt`}
        />
        <EndpointCard
          icon={DatabaseZap}
          title="llms-full.txt"
          description="Complete concatenated corpus for deep context, retrieval ingestion, or offline indexing."
          url={`${baseUrl}/llms-full.txt`}
        />
        <EndpointCard
          icon={FileText}
          title="Per-page Markdown"
          description="Append .md to any documentation URL to retrieve clean Markdown for a specific page."
          url={`${baseUrl}/masumi/documentation/get-started/install-masumi-node.md`}
        />
        <EndpointCard
          icon={Braces}
          title="Markdown index"
          description="A complete generated inventory of all page Markdown URLs."
          url={`${baseUrl}/md-index`}
        />
        <EndpointCard
          icon={Server}
          title="Context7"
          description="Public Context7 metadata for assistant tools that support Context7 libraries."
          url="https://context7.com/masumi-network/masumi-docs"
        />
        <EndpointCard
          icon={Code2}
          title="OpenAPI specs"
          description="Machine-readable service specifications for SDK generation, inspection, and API-aware agents."
          url={openApiLinks[0].href}
        >
          <div className="agents-link-list">
            {openApiLinks.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
                <ExternalLink aria-hidden="true" />
              </a>
            ))}
          </div>
        </EndpointCard>
      </div>

      <div className="agents-two-column">
        <section className="agents-panel">
          <p className="agents-panel-label">Featured Markdown pages</p>
          <div className="agents-page-list">
            {featuredPages.map((page) => (
              <a key={page.url} href={withBasePath(`${page.url}.md`)}>
                <span>
                  <strong>{page.title || page.url}</strong>
                  {page.description && <small>{page.description}</small>}
                </span>
                <code>{page.url}.md</code>
              </a>
            ))}
          </div>
        </section>

        <section className="agents-panel">
          <p className="agents-panel-label">Agent skills</p>
          <h2>Give assistants the right surface area.</h2>
          <p>
            Start with Markdown context for answers, then add skills, MCP tools, and CLI workflows when agents need to
            take actions.
          </p>
          <div className="agents-skill-list">
            {skillLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="agents-skill-icon">
                  <Sparkles aria-hidden="true" />
                </span>
                <span>
                  <strong>{link.label}</strong>
                  <small>{link.description}</small>
                </span>
                <ExternalLink aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

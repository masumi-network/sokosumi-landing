'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
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

const surfaceSteps = ['llms.txt', 'full corpus', 'page.md', 'MCP tools', 'OpenAPI'];

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
  index,
  title,
  description,
  url,
  children,
}: {
  icon: typeof FileText;
  index: string;
  title: string;
  description: string;
  url: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="agents-endpoint-card">
      <div className="agents-endpoint-top">
        <span className="agents-endpoint-index">{index}</span>
        <span className="agents-endpoint-icon">
          <Icon aria-hidden="true" />
        </span>
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
      <section className="agents-hero" aria-labelledby="agents-title">
        <img
          className="agents-hero-kanji"
          src={withBasePath('/assets/masumi-kanji-black.png')}
          alt=""
          aria-hidden="true"
        />
        <p className="agents-kicker">
          <Bot aria-hidden="true" />
          Agent-ready documentation
        </p>
        <h1 id="agents-title">Masumi docs that agents can read, index, and act on.</h1>
        <p className="agents-hero-copy">
          One source of truth for builders and autonomous systems: rendered docs, LLM indexes, Markdown pages,
          Context7 metadata, OpenAPI specs, MCP guidance, and agent skills.
        </p>
        <div className="agents-hero-actions">
          <a className="agents-primary-action" href={withBasePath('/llms.txt')}>
            Open llms.txt
            <ArrowRight aria-hidden="true" />
          </a>
          <a href={withBasePath('/llms-full.txt')}>Open full corpus</a>
          <CopyButton value={agentContext} label="Copy agent context" />
        </div>
      </section>

      <section className="agents-command-band" aria-label="Agent context quick start">
        <div className="agents-command-copy">
          <p className="agents-panel-label">Context path</p>
          <h2>Start with text. Add tools when the agent needs to move money or call services.</h2>
          <p>
            Give an assistant the concise index for orientation, pull exact Markdown pages for citation, then attach MCP
            and OpenAPI surfaces for action.
          </p>
        </div>
        <div className="agents-command-preview" aria-label="Example agent context commands">
          <div className="agents-command-window">
            <div className="agents-command-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>
              <span>$</span> curl {baseUrl}/llms.txt
            </p>
            <p>
              <span>$</span> curl {baseUrl}/masumi/api-reference.md
            </p>
            <p>
              <span>$</span> use masumi mcp for jobs, agents, payments
            </p>
          </div>
        </div>
        <div className="agents-surface-flow" aria-label="Machine-readable route map">
          {surfaceSteps.map((step, index) => (
            <div key={step} className="agents-surface-node">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="agents-stat-grid" aria-label="Developer portal coverage">
        <div>
          <strong>{pages.length}</strong>
          <span>Docs pages indexed</span>
        </div>
        <div>
          <strong>5</strong>
          <span>Agent-readable surfaces</span>
        </div>
        <div>
          <strong>CORS</strong>
          <span>Enabled Markdown access</span>
        </div>
      </div>

      <section className="agents-section" aria-labelledby="agents-surfaces-title">
        <div className="agents-section-header">
          <p className="agents-panel-label">Machine surfaces</p>
          <h2 id="agents-surfaces-title">Point an agent at a single URL.</h2>
          <p>Each surface is generated from the same corpus, so answers and actions stay aligned with the docs.</p>
        </div>

        <div className="agents-endpoint-grid">
          <EndpointCard
            index="01"
            icon={ListTree}
            title="llms.txt"
            description="Concise overview for system prompts, agent bootstrapping, and docs discovery."
            url={`${baseUrl}/llms.txt`}
          />
          <EndpointCard
            index="02"
            icon={DatabaseZap}
            title="llms-full.txt"
            description="Complete concatenated corpus for deep context, retrieval ingestion, or offline indexing."
            url={`${baseUrl}/llms-full.txt`}
          />
          <EndpointCard
            index="03"
            icon={FileText}
            title="Per-page Markdown"
            description="Append .md to any documentation URL to retrieve clean Markdown for a specific page."
            url={`${baseUrl}/masumi/documentation/get-started/install-masumi-node.md`}
          />
          <EndpointCard
            index="04"
            icon={Braces}
            title="Markdown index"
            description="A complete generated inventory of all page Markdown URLs."
            url={`${baseUrl}/md-index`}
          />
          <EndpointCard
            index="05"
            icon={Server}
            title="Context7"
            description="Public Context7 metadata for assistant tools that support Context7 libraries."
            url="https://context7.com/masumi-network/masumi-docs"
          />
          <EndpointCard
            index="06"
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
      </section>

      <div className="agents-two-column">
        <section className="agents-panel">
          <p className="agents-panel-label">Featured Markdown pages</p>
          <h2>
            <BookOpen aria-hidden="true" />
            High-signal entrypoints
          </h2>
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

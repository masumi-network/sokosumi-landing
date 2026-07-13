import type { Metadata } from 'next';
import { AgentsHub } from '@/components/agents-hub';
import { getAllPages } from '@/lib/source';

export const metadata: Metadata = {
  title: 'Agent Docs Hub | Masumi Developer Portal',
  description: 'Machine-readable Masumi and Sokosumi docs, agent skills, MCP surfaces, and OpenAPI entrypoints.',
};

export default function AgentsPage() {
  const pages = getAllPages().map((page) => ({
    title: page.data.title,
    description: page.data.description,
    url: page.url,
  }));

  return (
    <main className="masumi-agents-page">
      <AgentsHub pages={pages} />
    </main>
  );
}

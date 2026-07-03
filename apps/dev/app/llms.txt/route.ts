import { NextResponse } from 'next/server';
import { getAllPages } from '@/lib/source';
import { portalUrl } from '@/lib/base-path';

// In-memory cache for the generated content (persists across requests)
let cachedContent: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// CORS headers for LLM/cross-origin access (matches md-index and mdx routes)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function generateLLMsTxtContent(): Promise<string> {
  const pages = getAllPages();
  const baseUrl = portalUrl;
  const pagesBySection = new Map<string, typeof pages>();

  for (const page of pages) {
    // Group by "<product> <section>", e.g. "masumi core-concepts"
    const [, product, sectionName] = page.url.split('/');
    const section = [product, sectionName].filter(Boolean).join(' ') || 'documentation';
    const sectionPages = pagesBySection.get(section) ?? [];
    sectionPages.push(page);
    pagesBySection.set(section, sectionPages);
  }

  const sections = Array.from(pagesBySection.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([section, sectionPages]) => [
      '',
      `## ${section.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}`,
      '',
      ...sectionPages
        .sort((a, b) => a.url.localeCompare(b.url))
        .map((page) => {
          const description = page.data.description ? `: ${page.data.description}` : '';
          return `- [${page.data.title}](${baseUrl}${page.url}.md)${description}`;
        }),
    ]);

  return [
    '# Masumi Network Documentation',
    '',
    '> Masumi Network enables Agent-to-Agent Payments and unlocks the Agentic Economy through decentralized AI agent interactions.',
    '',
    'This is the concise machine-readable index for Masumi documentation.',
    `Generated on: ${new Date().toISOString()}`,
    `Website: ${baseUrl}`,
    '',
    '## Machine-readable entry points',
    '',
    `- Full corpus: ${baseUrl}/llms-full.txt`,
    `- Markdown index: ${baseUrl}/md-index`,
    `- Per-page Markdown: ${baseUrl}/<path>.md`,
    `- Context7: https://context7.com/masumi-network/masumi-docs`,
    '',
    '## Usage guidance',
    '',
    '- Use this file to discover relevant docs pages before fetching full page content.',
    '- Fetch individual `.md` pages for focused answers and citations.',
    '- Use `/llms-full.txt` only when your agent needs the complete corpus.',
    '',
    `## Available pages (${pages.length})`,
    '',
    ...sections,
  ].join('\n');
}

/**
 * Serves the concise llms.txt file, generating it on-demand if needed.
 * Uses in-memory caching to avoid regenerating on every request.
 * This approach:
 * - Reduces build time (file not generated at build)
 * - Faster deployments (smaller bundle size)
 * - Still fast responses (cached in memory)
 * - CDN-friendly caching headers
 */
export async function GET() {
  try {
    // Check in-memory cache first
    const now = Date.now();
    if (cachedContent && (now - cacheTimestamp) < CACHE_TTL) {
      return new NextResponse(cachedContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          // Cache aggressively: 24 hours browser, 7 days CDN, serve stale for 30 days while revalidating
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
          ...CORS_HEADERS,
        },
      });
    }

    // Generate content on-demand
    const content = await generateLLMsTxtContent();
    
    // Update in-memory cache
    cachedContent = content;
    cacheTimestamp = now;

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.error('❌ Error generating/serving llms.txt:', error);
    return new NextResponse('Error generating llms.txt', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...CORS_HEADERS,
      },
    });
  }
}

// Handle CORS preflight requests (required for cross-origin fetch from browsers)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      ...CORS_HEADERS,
    },
  });
}

import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getAllPages } from '@/lib/source';
import { portalUrl } from '@/lib/base-path';
import { getLLMText } from '@/lib/get-llm-text';

let cachedContent: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function generateFullCorpus(): Promise<string> {
  const pages = getAllPages();
  const MAX_CONCURRENT = 10;
  const scanned: string[] = [];

  for (let i = 0; i < pages.length; i += MAX_CONCURRENT) {
    const batch = pages.slice(i, i + MAX_CONCURRENT);
    const batchResults = await Promise.all(batch.map(getLLMText));
    scanned.push(...batchResults);
  }

  return [
    '# Masumi Developer Portal - Full Corpus',
    '',
    'This file contains the complete Masumi and Sokosumi documentation for LLM consumption.',
    `Generated on: ${new Date().toISOString()}`,
    `Website: ${portalUrl}`,
    '',
    '## How to Access Focused Context',
    '',
    `- Concise index: ${portalUrl}/llms.txt`,
    `- Markdown index: ${portalUrl}/md-index`,
    `- Per-page Markdown: ${portalUrl}/<path>.md`,
    '',
    '---',
    '',
    '## Complete Documentation Below',
    '',
    ...scanned,
  ].join('\n');
}

export async function GET() {
  try {
    const now = Date.now();
    if (cachedContent && now - cacheTimestamp < CACHE_TTL) {
      return new NextResponse(cachedContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
          ...CORS_HEADERS,
        },
      });
    }

    const filePath = join(process.cwd(), '.cache', 'llms-full.txt');
    try {
      const fileContent = await readFile(filePath, 'utf-8');
      cachedContent = fileContent;
      cacheTimestamp = now;

      return new NextResponse(fileContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
          ...CORS_HEADERS,
        },
      });
    } catch {
      console.log('Generating llms-full.txt on-demand...');
    }

    const content = await generateFullCorpus();
    cachedContent = content;
    cacheTimestamp = now;

    mkdir(join(process.cwd(), '.cache'), { recursive: true })
      .then(() => writeFile(filePath, content, 'utf-8'))
      .catch((err) => {
        console.warn('Failed to write llms-full.txt to disk (non-critical):', err);
      });

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.error('Error generating/serving llms-full.txt:', error);
    return new NextResponse('Error generating llms-full.txt', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...CORS_HEADERS,
      },
    });
  }
}

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

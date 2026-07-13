import { MetadataRoute } from 'next';
import { portalUrl } from '@/lib/base-path';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = portalUrl;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Specifically highlight LLM-friendly endpoints
        crawlDelay: 1,
      },
      {
        // Special rules for AI crawlers
        userAgent: ['GPTBot', 'ChatGPT-User', 'Claude-Web', 'anthropic-ai', 'Applebot-Extended', 'PerplexityBot', 'Diffbot'],
        allow: '/',
        crawlDelay: 0.5, // Faster for AI bots
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-markdown.xml`, // Dedicated sitemap for .md URLs
    ],
    host: baseUrl,
  };
}

// Add custom X-Robots-Tag headers
export const dynamic = 'force-static';

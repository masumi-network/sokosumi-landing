import type { Metadata } from 'next';
import { NoriChat, type NoriPageContext } from '@/components/nori-chat';

export const metadata: Metadata = {
  title: 'Ask Nori | Masumi Developer Portal',
  description: 'Ask Nori questions about the Masumi and Sokosumi documentation.',
};

type SearchValue = string | string[] | undefined;

function first(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchValue>>;
}) {
  const params = await searchParams;
  const pagePath = first(params.pagePath);
  const pageTitle = first(params.pageTitle);
  const markdownUrl = first(params.markdownUrl);
  const page: NoriPageContext | undefined = pagePath
    ? {
        path: pagePath,
        title: pageTitle,
        markdownUrl,
      }
    : undefined;

  return (
    <div className="masumi-standalone-main masumi-ask-page">
      <NoriChat initialPrompt={first(params.q)} initialPage={page} />
    </div>
  );
}

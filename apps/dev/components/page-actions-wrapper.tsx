'use client';

import { PageActions } from './page-actions';
import { usePageContent } from '../hooks/use-page-content';
import { usePathname } from 'next/navigation';

export function PageActionsWrapper() {
  const { content, title, loading, error } = usePageContent();
  const pathname = usePathname();

  // Always render the button, but pass loading state
  return (
    <PageActions 
      content={content}
      title={title}
      url={typeof window !== 'undefined' ? window.location.href : ''}
      pathname={pathname}
      loading={loading}
      error={error}
    />
  );
}

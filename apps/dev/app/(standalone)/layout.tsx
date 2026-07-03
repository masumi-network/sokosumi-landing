import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';

export default function StandaloneLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions}
      nav={{ ...baseOptions.nav, mode: 'top' }}
      tree={source.pageTree}
      tabMode="navbar"
      containerProps={{
        className: 'masumi-standalone-layout masumi-standalone-notebook-layout',
      }}
    >
      <div className="masumi-standalone-main">{children}</div>
    </DocsLayout>
  );
}

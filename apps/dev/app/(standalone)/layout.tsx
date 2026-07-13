import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { ReactNode } from 'react';
import type { Root } from 'fumadocs-core/page-tree';
import { baseOptions } from '@/app/layout.config';

const standaloneTree = {
  name: 'Nori',
  children: [],
} satisfies Root;

export default function StandaloneLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions}
      nav={{ ...baseOptions.nav, mode: 'top' }}
      tree={standaloneTree}
      tabMode="navbar"
      sidebar={{ tabs: false, collapsible: false }}
      containerProps={{
        className: 'masumi-standalone-layout masumi-standalone-notebook-layout',
      }}
    >
      <div className="masumi-standalone-main">{children}</div>
    </DocsLayout>
  );
}

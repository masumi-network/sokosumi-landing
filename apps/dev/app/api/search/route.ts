import { masumiSource, sokosumiSource } from '@/lib/source';
import { createSearchAPI } from 'fumadocs-core/search/server';

// One unified search index across both products, tagged so results can be
// filtered per product if needed.
export const { GET } = createSearchAPI('advanced', {
  indexes: [
    ...masumiSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      tag: 'masumi',
    })),
    ...sokosumiSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      tag: 'sokosumi',
    })),
  ],
});

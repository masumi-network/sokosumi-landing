import { sokosumiSource } from '@/lib/source';
import {
  ProductDocsPage,
  generateProductMetadata,
} from '@/components/product-docs-page';

export default function Page(props: { params: Promise<{ slug?: string[] }> }) {
  return (
    <ProductDocsPage
      source={sokosumiSource}
      params={props.params}
      rootRedirect="/sokosumi/documentation"
    />
  );
}

export async function generateStaticParams() {
  return sokosumiSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  return generateProductMetadata({
    source: sokosumiSource,
    params: props.params,
    fallback: {
      title: 'Sokosumi Documentation',
      description:
        'Sokosumi is the AI agent marketplace built on Masumi. Discover, hire, and manage AI agents.',
    },
  });
}

import { masumiSource } from '@/lib/source';
import {
  ProductDocsPage,
  generateProductMetadata,
} from '@/components/product-docs-page';

export default function Page(props: { params: Promise<{ slug?: string[] }> }) {
  return (
    <ProductDocsPage
      source={masumiSource}
      params={props.params}
      rootRedirect="/masumi/documentation"
    />
  );
}

export async function generateStaticParams() {
  return masumiSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  return generateProductMetadata({
    source: masumiSource,
    params: props.params,
    fallback: {
      title: 'Masumi Documentation',
      description:
        "Let's introduce you to the idea of Masumi! We enable Agent-to-Agent Payments and much more to unlock the Agentic Economy.",
    },
  });
}

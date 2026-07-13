import {
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { CustomDocsPage } from '@/components/custom-docs-page';
import { notFound, redirect } from 'next/navigation';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/mdx-components';
import { withBasePath } from '@/lib/base-path';
import type { masumiSource } from '@/lib/source';

type ProductSource = typeof masumiSource;

function resolvePage(source: ProductSource, slug: string[]) {
  return source.getPage(slug) ?? source.getPage([...slug, 'index']);
}

export async function ProductDocsPage({
  source,
  params,
  rootRedirect,
}: {
  source: ProductSource;
  params: Promise<{ slug?: string[] }>;
  rootRedirect: string;
}) {
  const { slug } = await params;

  // Redirect the product root to its landing section
  if (!slug || slug.length === 0) {
    redirect(rootRedirect);
  }

  const page = resolvePage(source, slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <CustomDocsPage toc={page.data.toc} full={page.data.full}>
      {page.data.banner && (
        <div className="masumi-docs-banner flex justify-center">
          <img
            src={withBasePath(page.data.banner)}
            alt="Page banner"
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
      )}
      <DocsTitle className="masumi-docs-title">{page.data.title}</DocsTitle>
      <DocsDescription className="masumi-docs-description">{page.data.description}</DocsDescription>
      <DocsBody className="masumi-docs-body">
        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </CustomDocsPage>
  );
}

export async function generateProductMetadata({
  source,
  params,
  fallback,
}: {
  source: ProductSource;
  params: Promise<{ slug?: string[] }>;
  fallback: { title: string; description: string };
}) {
  const { slug } = await params;

  // For the product root, return default metadata before redirect
  if (!slug || slug.length === 0) {
    return fallback;
  }

  const page = resolvePage(source, slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

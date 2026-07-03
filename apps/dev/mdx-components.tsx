import defaultMdxComponents from 'fumadocs-ui/mdx';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { ImageCard, ImageCards } from '@/components/image-card';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import { File, Files } from 'fumadocs-ui/components/files';
import { Banner } from '@/components/banner';
import { createAPIPage } from 'fumadocs-openapi/ui';
import { openapi } from '@/lib/source';
import type { MDXComponents } from 'mdx/types';
import { withBasePath } from '@/lib/base-path';
import {Mermaid}  from '@/components/mermaid';
import * as icons from "lucide-react"

const APIPage = createAPIPage(openapi);

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...(icons as unknown as MDXComponents),
    img: (props) => {
      const { src, ...rest } = props as any;
      const resolvedSrc = typeof src === 'string' ? withBasePath(src) : src;
      return <ImageZoom src={resolvedSrc} {...rest} className="rounded-lg" />;
    },
    APIPage,
    ImageCard,
    ImageCards,
    Banner,
    Mermaid,
    File,
    Files,
    ...TabsComponents,
    ...components,
  };
}

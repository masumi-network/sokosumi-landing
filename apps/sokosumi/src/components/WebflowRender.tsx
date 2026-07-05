import Script from "next/script";
import type { WebflowPageData } from "@/lib/webflow";

// These two stylesheets are loaded globally in (webflow)/layout.tsx —
// don't re-emit them per page.
const LAYOUT_STYLESHEETS = new Set([
  "/assets/cdn/sokosumi-styles.min.css",
  "/css/style.css",
]);

export function WebflowRender({ data }: { data: WebflowPageData }) {
  const extraStylesheets = data.headStylesheets.filter(
    (href) => !LAYOUT_STYLESHEETS.has(href),
  );

  return (
    <div className={data.bodyClass}>
      {/* Page-specific stylesheets (Swiper, Font Awesome, etc.). React 19
          hoists these to <head> automatically. */}
      {extraStylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {data.jsonLd.map((blob, i) => (
        <script
          key={`jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: blob }}
        />
      ))}
      <div dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
      {data.bodyScripts.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}
    </div>
  );
}

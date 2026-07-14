import Link from "next/link";

// Breadcrumb trail + BreadcrumbList structured data. "Home" is prepended
// automatically; the last item is the current page and renders without a link.

const SITE_URL = "https://www.masumi.network";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href
        ? { item: crumb.href === "/" ? SITE_URL : `${SITE_URL}${crumb.href}` }
        : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#999]">
        {all.map((crumb, i) => {
          const last = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5 min-w-0">
              {last || !crumb.href ? (
                <span
                  className={`truncate ${last ? "text-[#666]" : ""}`}
                  aria-current={last ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-black transition-colors whitespace-nowrap"
                >
                  {crumb.label}
                </Link>
              )}
              {!last && <span aria-hidden>›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

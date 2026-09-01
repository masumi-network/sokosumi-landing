"use client";

import { useState, useEffect, useRef, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { navCopy, type NavLocale } from "./nav-copy";
import { SokosumiIcon } from "./SummationLogo";

const MasumiIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M620.15 274.055C469.578 274.055 347.5 395.383 347.5 545.09H423.243C423.243 437.144 511.563 349.351 620.15 349.351C728.737 349.351 817.057 437.176 817.057 545.09H892.799C892.799 395.415 770.722 274.055 620.15 274.055Z" fill="white"/>
    <path d="M741.498 545.064C741.498 694.77 619.421 816.099 468.849 816.099C318.277 816.099 196.199 694.739 196.199 545.064H271.942C271.942 652.978 360.262 740.802 468.849 740.802C577.436 740.802 665.755 653.009 665.755 545.064H741.498Z" fill="white"/>
  </svg>
);

const KodosumiIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26 540.5C26 256.35 256.35 26 540.5 26C824.65 26 1055 256.35 1055 540.5C1055 824.65 824.65 1055 540.5 1055C256.35 1055 26 824.65 26 540.5Z" fill="#C4FE0A"/>
    <path d="M614.707 274.643C467.006 274.643 347.256 393.658 347.256 540.51H421.555C421.555 434.622 508.19 348.503 614.707 348.503C721.224 348.503 807.859 434.653 807.859 540.51H882.158C882.158 393.689 762.408 274.643 614.707 274.643Z" fill="#0A0A0A"/>
    <path d="M466.292 806.356C613.993 806.356 733.743 687.341 733.743 540.488H659.444C659.444 646.376 572.808 732.495 466.292 732.495C359.775 732.495 273.139 646.345 273.139 540.488H198.84C198.84 687.31 318.59 806.356 466.292 806.356Z" fill="#0A0A0A"/>
  </svg>
);

const productsList = (nav: ReturnType<typeof navCopy>) => [
  {
    id: "sokosumi" as const,
    name: "sokosumi",
    desc: nav("H22"),
    href: "https://sokosumi.com",
    icon: <SokosumiIcon className="w-5 h-5" />,
  },
  {
    id: "masumi" as const,
    name: "masumi",
    desc: nav("H23"),
    href: "https://masumi.network",
    icon: <MasumiIcon className="w-5 h-5" />,
  },
  {
    id: "kodosumi" as const,
    name: "kodosumi",
    desc: nav("H24"),
    href: "https://kodosumi.io",
    icon: <KodosumiIcon className="w-5 h-5" />,
  },
];

// The Masumi site does not mention Kodosumi. The Kodosumi site still needs its
// own entry (it is the active product there), so this filters rather than
// deleting the entry.
function productsFor(
  product: "sokosumi" | "masumi" | "kodosumi",
  nav: ReturnType<typeof navCopy>,
) {
  const products = productsList(nav);
  return product === "masumi" ? products.filter((p) => p.id !== "kodosumi") : products;
}

const masumiSokosumiBanner = (nav: ReturnType<typeof navCopy>) => (
  <a
    href="https://sokosumi.com"
    className="group flex h-9 items-center justify-center gap-2 bg-[#6400FF] px-4 text-[13px] text-white transition-colors hover:bg-[#5200d0]"
  >
    <span className="truncate">
      {nav("H1")} <strong className="font-medium">{nav("H2")}</strong> {nav("H_BANNER_TAIL")}
    </span>
    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
  </a>
);

type DocumentationMenuItem = {
  href: string;
  label: string;
  description: string;
  active?: boolean;
  forceDocumentNavigation?: boolean;
};

type HeaderProps = {
  product?: "sokosumi" | "masumi" | "kodosumi";
  topBanner?: ReactNode;
  siteRootHref?: string;
  documentationHref?: string;
  documentationCtaHref?: string;
  documentationMenuItems?: ReadonlyArray<DocumentationMenuItem>;
  assetBaseUrl?: string;
  /** Defaults to "en"; only masumi's /de routes pass "de" today. */
  locale?: NavLocale;
};

function joinHref(base: string, path: string) {
  if (!base) return path;
  if (path === "/") return base;
  return `${base.replace(/\/$/, "")}${path}`;
}

function assetSrc(base: string, path: string) {
  if (!base) return path;
  return `${base.replace(/\/$/, "")}${path}`;
}

function DocumentationMenuLink({
  item,
  className,
  onClick,
  children,
}: {
  item: DocumentationMenuItem;
  className: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const commonProps = {
    className,
    "aria-current": item.active ? ("page" as const) : undefined,
    "data-active": item.active ? "true" : "false",
  };

  if (item.forceDocumentNavigation) {
    return (
      <a
        href={item.href}
        onClick={(event) => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          event.preventDefault();
          window.location.assign(item.href);
        }}
        {...commonProps}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={onClick} {...commonProps}>
      {children}
    </Link>
  );
}

function getMasumiDevHubMenuItems(
  documentationHref: string,
  nav: ReturnType<typeof navCopy>,
): NonNullable<HeaderProps["documentationMenuItems"]> {
  return [
    {
      href: joinHref(documentationHref, "/map"),
      label: nav("H25"),
      description: "Choose a path through the Masumi ecosystem.",
      forceDocumentNavigation: true,
    },
    {
      href: joinHref(documentationHref, "/ask"),
      label: nav("H26"),
      description: "Ask questions across Masumi and Sokosumi.",
      forceDocumentNavigation: true,
    },
    {
      href: joinHref(documentationHref, "/masumi/documentation"),
      label: nav("H27"),
      description: "Identity, registry, wallets, payments, and APIs.",
      forceDocumentNavigation: true,
    },
    {
      href: joinHref(documentationHref, "/sokosumi/documentation"),
      label: nav("H28"),
      description: "Agents, coworkers, tasks, jobs, and organizations.",
      forceDocumentNavigation: true,
    },
    {
      href: joinHref(documentationHref, "/agents"),
      label: nav("H29"),
      description: "Machine-readable docs, indexes, skills, and MCP.",
      forceDocumentNavigation: true,
    },
  ];
}

export default function Header({
  product = "sokosumi",
  topBanner,
  siteRootHref = "",
  documentationHref = "https://www.masumi.network/dev",
  documentationCtaHref,
  documentationMenuItems,
  assetBaseUrl = "",
  locale = "en",
}: HeaderProps) {
  const nav = navCopy(locale);
  const [showProducts, setShowProducts] = useState(false);
  const [showDocumentationMenu, setShowDocumentationMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const documentationTriggerRef = useRef<HTMLAnchorElement>(null);
  const resolvedDocumentationMenuItems =
    documentationMenuItems ??
    (product === "masumi" ? getMasumiDevHubMenuItems(documentationHref, nav) : undefined);
  const openDocumentationHref =
    documentationCtaHref ??
    (product === "masumi"
      ? joinHref(documentationHref, "/masumi/documentation")
      : documentationHref);

  // Masumi pages show the Sokosumi cross-promo banner by default; an explicit
  // topBanner prop (including null) overrides it.
  const banner =
    topBanner !== undefined
      ? topBanner
      : product === "masumi"
        ? masumiSokosumiBanner(nav)
        : null;

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const closeDocumentationMenuOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setShowDocumentationMenu(false);
    }
  };

  const handleDocumentationMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    documentationTriggerRef.current?.focus();
    setShowDocumentationMenu(false);
  };

  return (
    <>
      <header className="summation-site-header fixed top-0 left-0 right-0 z-50">
        {banner}
        <div
          className="flex justify-center"
          style={{
            height: 74,
            backgroundColor: resolvedDocumentationMenuItems?.length ? "#F4F4F4" : "rgba(244,244,244,0.85)",
            backdropFilter: resolvedDocumentationMenuItems?.length ? undefined : "blur(12px)",
          }}
        >
        <div className="w-full max-w-[1440px] flex items-center justify-between px-6 lg:px-12">
          {/* Logo with product switcher */}
          <div
            className="relative"
            onMouseEnter={() => setShowProducts(true)}
            onMouseLeave={() => setShowProducts(false)}
          >
            <div className="flex items-center gap-2 group">
              {product === "sokosumi" ? (
                <Link href="/">
                  <img src="/images/sokosumi-wordmark.svg" alt="sokosumi" width={100} height={18} className="h-[18px] w-auto block" />
                </Link>
              ) : product === "masumi" ? (
                <Link href={joinHref(siteRootHref, "/")}>
                  <img src={assetSrc(assetBaseUrl, "/images/masumi-wordmark.webp")} alt="masumi" width={100} height={18} className="h-[18px] w-auto block" fetchPriority="high" />
                </Link>
              ) : (
                <Link href="/">
                  <img src="/images/kodosumi-wordmark-black.webp" alt="kodosumi" width={100} height={18} className="h-[18px] w-auto block" fetchPriority="high" />
                </Link>
              )}
              <button aria-label={nav("H30")}>
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={`hidden sm:block transition-transform ${showProducts ? "rotate-180" : ""}`}>
                  <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {showProducts && (
              <div className="absolute top-full left-0 pt-2">
                <div className="bg-white rounded-xl shadow-xl border border-black/5 p-3 w-[280px]">
                  <p className="text-[10px] uppercase tracking-widest text-[#999] mb-2 px-2 font-medium">{nav("H3")}</p>
                  {productsFor(product, nav).map((p) => (
                    <a
                      key={p.name}
                      href={p.href}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${p.id === product ? "bg-[#F5F5F5]" : "hover:bg-[#F5F5F5]"}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${p.id === "masumi" ? "bg-[#FF003D]" : p.id === "kodosumi" ? "bg-[#C4FE0A]" : "bg-[#6400FF] text-white"}`}>
                        {p.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-medium text-black">{p.name}</span>
                          {p.id === product && (
                            <span className="text-[9px] text-[#2cb67d] bg-[#2cb67d]/10 px-1.5 py-0.5 rounded-full font-medium">{nav("H4")}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#888]">{p.desc}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {product === "sokosumi" ? (
            <nav className="hidden lg:flex items-center h-[74px]">
              <Link href="/press" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                {nav("H5")}
              </Link>
            </nav>
          ) : product === "masumi" ? (
            <nav className="hidden lg:flex items-center h-[74px]">
              <div
                className="relative flex h-full items-center"
                onMouseEnter={() => setShowDocumentationMenu(true)}
                onMouseLeave={() => setShowDocumentationMenu(false)}
                onFocusCapture={() => setShowDocumentationMenu(true)}
                onBlurCapture={closeDocumentationMenuOnBlur}
                onKeyDown={handleDocumentationMenuKeyDown}
              >
                <a
                  ref={documentationTriggerRef}
                  href={documentationHref}
                  className={`flex h-full items-center gap-1.5 border-b-2 px-[15px] text-[14px] font-normal text-black transition-colors ${
                    showDocumentationMenu
                      ? "border-black"
                      : "border-transparent hover:border-black/20 hover:text-black/60"
                  }`}
                  aria-expanded={resolvedDocumentationMenuItems?.length ? showDocumentationMenu : undefined}
                  aria-controls={resolvedDocumentationMenuItems?.length ? "summation-devhub-menu" : undefined}
                  onClick={() => setShowDocumentationMenu(false)}
                >
                  Dev Hub
                  {resolvedDocumentationMenuItems?.length ? (
                    <svg
                      width="8"
                      height="5"
                      viewBox="0 0 8 5"
                      fill="none"
                      aria-hidden="true"
                      className={`transition-transform ${showDocumentationMenu ? "rotate-180" : ""}`}
                    >
                      <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </a>

                {resolvedDocumentationMenuItems?.length && showDocumentationMenu ? (
                  <div
                    id="summation-devhub-menu"
                    className="fixed left-0 right-0 border-b border-black/[0.08] bg-[#F4F4F4]"
                    style={{ top: banner ? 110 : 74 }}
                  >
                    <div className="mx-auto w-full max-w-[1440px] px-6 py-5 lg:px-12">
                      <div className="mb-4">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/45">{nav("H6")}</p>
                          <p className="mt-1 text-[15px] text-black/70">{nav("H7")}</p>
                        </div>
                      </div>
                      <nav
                        className="grid grid-cols-5 gap-px border border-black/[0.08] bg-black/[0.08]"
                        aria-label={nav("H31")}
                      >
                        {resolvedDocumentationMenuItems.map((item) => (
                          <DocumentationMenuLink
                            key={item.href}
                            item={item}
                            onClick={() => setShowDocumentationMenu(false)}
                            className="group relative min-h-[112px] bg-[#F4F4F4] p-4 text-black transition-colors before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:scale-x-0 before:bg-[#FF51FF] before:transition-transform hover:bg-white data-[active=true]:bg-white data-[active=true]:before:scale-x-100"
                          >
                            <span className="flex items-center justify-between gap-3 text-[14px] font-medium">
                              {item.label}
                              <span aria-hidden="true" className="text-black/35 transition-transform group-hover:translate-x-0.5 group-hover:text-black/65">→</span>
                            </span>
                            <span className="mt-1.5 block text-[12px] leading-5 text-black/55">{item.description}</span>
                          </DocumentationMenuLink>
                        ))}
                      </nav>
                    </div>
                  </div>
                ) : null}
              </div>
              <Link href={joinHref(siteRootHref, "/x402")} className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                x402
              </Link>
              <Link href={joinHref(siteRootHref, "/explorer")} className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                {nav("H8")}
              </Link>
              <Link href={joinHref(siteRootHref, "/use-cases")} className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                {nav("H9")}
              </Link>
              <Link href={joinHref(siteRootHref, "/blogs")} className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                {nav("H10")}
              </Link>
              <Link href="https://github.com/masumi-network" target="_blank" rel="noopener noreferrer" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                {nav("H11")}
              </Link>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center h-[74px]">
              <Link href="https://docs.kodosumi.io" target="_blank" rel="noopener noreferrer" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                {nav("H12")}
              </Link>
              <Link href="https://github.com/masumi-network/kodosumi" target="_blank" rel="noopener noreferrer" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                {nav("H11")}
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-4">
            {product === "sokosumi" ? (
              <>
                <Link href="https://app.sokosumi.com" className="hidden lg:block text-[14px] font-normal text-black hover:text-black/60 transition-colors">
                  {nav("H13")}
                </Link>
                <Link href="https://app.sokosumi.com"
                  className="hidden lg:block bg-black text-white text-[14px] font-normal px-6 py-2 rounded-full hover:bg-black/85 transition-colors">
                  {nav("H14")}
                </Link>
              </>
            ) : product === "masumi" ? (
              <a href={openDocumentationHref}
                className="hidden lg:block bg-black text-white text-[14px] font-normal px-6 py-2.5 rounded-full hover:bg-black/85 transition-colors">
                {nav("H15")}
              </a>
            ) : (
              <Link href="https://docs.kodosumi.io" target="_blank" rel="noopener noreferrer"
                className="hidden lg:block bg-black text-white text-[14px] font-normal px-6 py-2.5 rounded-full hover:bg-black/85 transition-colors">
                {nav("H16")}
              </Link>
            )}
            <button
              className="lg:hidden flex flex-col gap-1.5 p-2"
              aria-label={nav("H32")}
              aria-expanded={mobileMenuOpen}
              aria-controls="summation-site-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className={`w-5 h-[1.5px] bg-black transition-transform duration-200 ${mobileMenuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`w-5 h-[1.5px] bg-black transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`w-5 h-[1.5px] bg-black transition-transform duration-200 ${mobileMenuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          id="summation-site-mobile-menu"
          className="summation-site-mobile-menu fixed inset-0 z-40 overflow-y-auto bg-[#F5F5F5] lg:hidden"
          style={{ top: banner ? 110 : 74 }}
        >
          <nav className="relative flex flex-col gap-1 px-6 pb-10 pt-8">
            {product === "sokosumi" ? (
              <>
                <Link href="/press" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H5")}
                </Link>
                <Link href="https://app.sokosumi.com" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H13")}
                </Link>
                <Link href="https://app.sokosumi.com" onClick={() => setMobileMenuOpen(false)}
                  className="mt-6 bg-black text-white text-[14px] font-normal px-6 py-3 rounded-full text-center">
                  {nav("H14")}
                </Link>
              </>
            ) : product === "masumi" ? (
              <>
                <a href={documentationHref} onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H17")}
                </a>
                {resolvedDocumentationMenuItems?.length ? (
                  <div className="mb-3 ml-3 flex flex-col border-l border-black/[0.08] pl-4">
                    {resolvedDocumentationMenuItems.map((item) => (
                      <DocumentationMenuLink
                        key={item.href}
                        item={item}
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2.5 text-[15px] text-black/65 transition-colors hover:text-black data-[active=true]:font-medium data-[active=true]:text-black"
                      >
                        {item.label}
                      </DocumentationMenuLink>
                    ))}
                  </div>
                ) : null}
                <Link href={joinHref(siteRootHref, "/x402")} onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  x402
                </Link>
                <Link href={joinHref(siteRootHref, "/explorer")} onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H8")}
                </Link>
                <Link href={joinHref(siteRootHref, "/use-cases")} onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H9")}
                </Link>
                <Link href={joinHref(siteRootHref, "/guides")} onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H18")}
                </Link>
                <Link href={joinHref(siteRootHref, "/releases")} onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H19")}
                </Link>
                <Link href={joinHref(siteRootHref, "/compare")} onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H20")}
                </Link>
                <Link href={joinHref(siteRootHref, "/blogs")} onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H10")}
                </Link>
                <Link href="https://github.com/masumi-network" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H11")}
                </Link>
                <Link href="https://discord.com/invite/aj4QfnTS92" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H21")}
                </Link>
                <a href={openDocumentationHref} onClick={() => setMobileMenuOpen(false)}
                  className="mt-6 bg-black text-white text-[14px] font-normal px-6 py-3 rounded-full text-center">
                  {nav("H15")}
                </a>
              </>
            ) : (
              <>
                <Link href="https://docs.kodosumi.io" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H12")}
                </Link>
                <Link href="https://github.com/masumi-network/kodosumi" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H11")}
                </Link>
                <Link href="https://discord.com/invite/aj4QfnTS92" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  {nav("H21")}
                </Link>
                <Link href="https://docs.kodosumi.io" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}
                  className="mt-6 bg-black text-white text-[14px] font-normal px-6 py-3 rounded-full text-center">
                  {nav("H16")}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

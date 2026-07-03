'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { KeyboardEvent, MouseEvent } from 'react';
import {
  productFromPathname,
  productHome,
  rememberProduct,
} from '@/lib/last-product';
import { withBasePath } from '@/lib/base-path';

const entries = [
  {
    id: 'masumi',
    href: productHome('masumi'),
    label: 'masumi',
    description: 'Protocol docs, core concepts & APIs',
    tileClass: 'masumi-product-tile--masumi',
    tileIcon: '/assets/masumi-kanji-white.png',
  },
  {
    id: 'sokosumi',
    href: productHome('sokosumi'),
    label: 'sokosumi',
    description: 'Marketplace docs, API, CLI & MCP',
    tileClass: 'masumi-product-tile--sokosumi',
    tileIcon: '/assets/sokosumi-logo-kanji-white.png',
  },
] as const;

export function ProductSwitcher({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // The menu is rendered in a portal (fixed position) so it can't be trapped
  // beneath the sidebar by the header's stacking context.
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const activeProduct = productFromPathname(pathname);

  // Remember the last visited product so "Browse" can return to it
  useEffect(() => {
    if (activeProduct) rememberProduct(activeProduct);
  }, [activeProduct]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) setMenuPosition({ top: rect.bottom + 10, left: Math.max(rect.left - 6, 8) });
    };
    updatePosition();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  // The brand mark lives inside fumadocs' title <Link>; intercept activation so
  // it toggles the menu instead of navigating.
  const toggle = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen((value) => !value);
  };

  return (
    <div ref={containerRef} className={`masumi-product-switcher ${className}`}>
      <span
        role="button"
        tabIndex={0}
        className="masumi-brand-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Masumi developer portal — switch product"
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') toggle(event);
        }}
      >
        <Image
          src={withBasePath('/assets/masumi_logo.png')}
          alt="Masumi Logo"
          width={130}
          height={50}
          className="masumi-brand-logo dark:hidden"
        />
        <Image
          src={withBasePath('/assets/masumi_logo_dark.png')}
          alt="Masumi Logo"
          width={130}
          height={50}
          className="masumi-brand-logo hidden dark:block"
        />
        <span className="masumi-brand-badge">dev</span>
        <span className="masumi-brand-caret" data-open={open ? 'true' : 'false'} aria-hidden="true">
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
            <path d="M1 1.25 4.5 4.75 8 1.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      {open && menuPosition && createPortal(
        <div
          ref={menuRef}
          className="masumi-product-menu"
          role="menu"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <div className="masumi-product-menu-heading">Documentation</div>
          {entries.map((entry) => {
            const isActive = entry.id === activeProduct;
            return (
              <Link
                key={entry.id}
                role="menuitem"
                href={entry.href}
                className="masumi-product-item"
                data-active={isActive ? 'true' : 'false'}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(false);
                }}
              >
                <span className={`masumi-product-tile ${entry.tileClass}`}>
                  <img src={withBasePath(entry.tileIcon)} alt="" />
                </span>
                <span className="masumi-product-item-text">
                  <span className="masumi-product-item-label">
                    {entry.label}
                    {isActive && <span className="masumi-product-active-badge">Active</span>}
                  </span>
                  <span className="masumi-product-item-description">{entry.description}</span>
                </span>
              </Link>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}

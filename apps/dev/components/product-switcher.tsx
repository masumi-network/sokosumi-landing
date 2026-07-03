'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bot, Check, ChevronsUpDown, Network, Store } from 'lucide-react';
import {
  productFromPathname,
  productHome,
  rememberProduct,
} from '@/lib/last-product';

const entries = [
  {
    id: 'portal',
    href: '/',
    label: 'Developer Portal',
    description: 'Ask Nori anything',
    icon: Bot,
  },
  {
    id: 'masumi',
    href: productHome('masumi'),
    label: 'Masumi',
    description: 'Agent-to-agent payment network',
    icon: Network,
  },
  {
    id: 'sokosumi',
    href: productHome('sokosumi'),
    label: 'Sokosumi',
    description: 'AI agent marketplace',
    icon: Store,
  },
] as const;

type EntryId = (typeof entries)[number]['id'];

function getActiveEntry(pathname: string | null): EntryId {
  return productFromPathname(pathname) ?? 'portal';
}

export function ProductSwitcher({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeId = getActiveEntry(pathname);
  const active = entries.find((entry) => entry.id === activeId) ?? entries[0];

  // Remember the last visited product so "Browse" can return to it
  useEffect(() => {
    const product = productFromPathname(pathname);
    if (product) rememberProduct(product);
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`masumi-product-switcher ${className}`}>
      <button
        type="button"
        className="masumi-product-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Switch product (current: ${active.label})`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="masumi-product-trigger-label">{active.label}</span>
        <ChevronsUpDown aria-hidden="true" />
      </button>
      {open && (
        <div className="masumi-product-menu" role="menu">
          {entries.map((entry) => {
            const Icon = entry.icon;
            const isActive = entry.id === activeId;
            return (
              <Link
                key={entry.id}
                role="menuitem"
                href={entry.href}
                className="masumi-product-item"
                data-active={isActive ? 'true' : 'false'}
                onClick={() => setOpen(false)}
              >
                <Icon aria-hidden="true" className="masumi-product-item-icon" />
                <span className="masumi-product-item-text">
                  <span className="masumi-product-item-label">{entry.label}</span>
                  <span className="masumi-product-item-description">{entry.description}</span>
                </span>
                {isActive && <Check aria-hidden="true" className="masumi-product-item-check" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

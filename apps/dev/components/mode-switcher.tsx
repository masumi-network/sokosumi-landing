'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Bot, BookOpen } from 'lucide-react';
import { getLastProduct, productHome } from '@/lib/last-product';

const modes = [
  {
    id: 'ask',
    href: '/',
    label: 'Ask Nori',
    icon: Bot,
  },
  {
    id: 'browse',
    href: productHome('masumi'),
    label: 'Browse',
    icon: BookOpen,
  },
] as const;

type ModeId = (typeof modes)[number]['id'];
type Mode = { id: ModeId; href: string; label: string; icon: typeof Bot };

function getActiveMode(pathname: string | null) {
  if (!pathname || pathname === '/' || pathname.startsWith('/ask')) return 'ask';
  return 'browse';
}

export function ModeSwitcher({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const routeActive = getActiveMode(pathname);
  const [pendingActive, setPendingActive] = useState<ModeId | null>(null);
  // "Browse" returns to the product the user last visited (default: Masumi).
  const [browseHref, setBrowseHref] = useState<string>(productHome('masumi'));
  const navigationFrame = useRef<number | null>(null);
  const active = pendingActive ?? routeActive;
  const resolvedModes: Mode[] = modes.map((mode) =>
    mode.id === 'browse' ? { ...mode, href: browseHref } : mode,
  );

  useEffect(() => {
    setPendingActive(null);
  }, [routeActive]);

  useEffect(() => {
    setBrowseHref(productHome(getLastProduct()));
  }, [pathname]);

  useEffect(() => {
    resolvedModes.forEach((mode) => router.prefetch(mode.href));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, browseHref]);

  useEffect(() => {
    return () => {
      if (navigationFrame.current !== null) {
        window.cancelAnimationFrame(navigationFrame.current);
      }
    };
  }, []);

  const selectMode = (mode: Mode) => {
    setPendingActive(mode.id);

    if (navigationFrame.current !== null) {
      window.cancelAnimationFrame(navigationFrame.current);
    }

    navigationFrame.current = window.requestAnimationFrame(() => {
      navigationFrame.current = null;
      router.push(mode.href);
    });
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, mode: Mode) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey ||
      event.currentTarget.target === '_blank'
    ) {
      return;
    }

    event.preventDefault();
    selectMode(mode);
  };

  return (
    <nav className={`masumi-mode-switcher ${className}`} data-mode={active} aria-label="Documentation mode">
      {resolvedModes.map((mode) => {
        const Icon = mode.icon;
        const isActive = active === mode.id;

        return (
          <Link
            key={mode.id}
            href={mode.href}
            className="masumi-mode-link text-fd-muted"
            data-active={isActive ? 'true' : 'false'}
            aria-label={mode.label}
            aria-current={isActive ? 'page' : undefined}
            onClick={(event) => handleClick(event, mode)}
            onFocus={() => router.prefetch(mode.href)}
            onMouseEnter={() => router.prefetch(mode.href)}
          >
            <Icon aria-hidden="true" />
            <span>{mode.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

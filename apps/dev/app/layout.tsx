import './global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { SiteFooter } from '@/components/site-footer';
import { DevSiteChrome } from '@/components/dev-site-chrome';
import { withBasePath } from '@/lib/base-path';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Masumi Developer Portal',
  description: 'Developer portal for Masumi Network and Sokosumi',
  icons: {
    icon: withBasePath('/favicon-docs.svg'),
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <Script
          defer
          data-domain="masumi.network"
          src="https://plausible.io/js/script.hash.outbound-links.pageview-props.tagged-events.js"
        />
        <Script id="plausible-init">
          {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ enabled: false }}>
          <DevSiteChrome />
          {children}
        </RootProvider>
        <SiteFooter />
        {/* Fixed Kanji on the right */}
        <div className="masumi-floating-kanji fixed right-4 top-1/2 -translate-y-1/2 z-50  pointer-events-none">
          <img 
            src={withBasePath('/assets/masumi-kanji-black.png')} 
            alt="Masumi Kanji" 
            className="h-[40px] w-auto"
          />
        </div>
      </body>
    </html>
  );
}

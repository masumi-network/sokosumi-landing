import type { Metadata } from 'next';
import { DevMapPage } from '@/components/dev-map-page';

export const metadata: Metadata = {
  title: 'Dev Hub Map | Masumi Developer Portal',
  description: 'Visual entrypoint for Masumi, Sokosumi, Ask Nori, and agent-ready documentation.',
};

export default function DevHubHomePage() {
  return <DevMapPage />;
}

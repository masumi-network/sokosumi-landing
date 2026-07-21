import { Route } from 'lucide-react';
import { DevRoadmapFlow } from '@/components/dev-roadmap-flow';

export function DevMapPage() {
  return (
    <main className="dev-roadmap-page">
      <section className="dev-flow-page" aria-labelledby="dev-map-title">
        <header className="dev-flow-header">
          <p className="dev-flow-kicker">
            <Route aria-hidden="true" />
            Experimental DevHub map
          </p>
          <h1 id="dev-map-title">Dev Hub Map</h1>
          <p>
            Short routes into Ask Nori, Sokosumi operations, Masumi payments, and agent-ready docs.
            Click a decision to reveal its paths: learn the theory or build right away, how agents
            get paid (MIP-003 with refunds vs x402 without), and how to run Masumi (self-hosted vs
            Masumi as a Service).
          </p>
        </header>

        <DevRoadmapFlow />
      </section>
    </main>
  );
}

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
            Choose a path through the Masumi ecosystem: explore the marketplace, learn the
            fundamentals, equip your agent, or build with the protocol.
          </p>
        </header>

        <DevRoadmapFlow />
      </section>
    </main>
  );
}

'use client';

import { PointerEvent as ReactPointerEvent, memo, useRef } from 'react';
import Image from 'next/image';
import { ExternalLink, Loader2 } from 'lucide-react';
import { withBasePath } from '@/lib/base-path';

export type RegistryState = 'idle' | 'checking' | 'verified' | 'failed';

export interface AgentIdCardData {
  name: string;
  signature?: string;
  role: string;
  agentIdentifier?: string;
  policyId?: string;
  network: string;
  registryState: RegistryState;
  assetHref?: string;
}

const MRZ_WIDTH = 44;

function mrzSanitize(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '<')
    .slice(0, MRZ_WIDTH)
    .padEnd(MRZ_WIDTH, '<');
}

function mrzLines(data: AgentIdCardData) {
  const line1 = mrzSanitize(`AI<MSM<${data.name}<<${data.role.replace(/\s+/g, '<')}`);
  const source = data.agentIdentifier || data.policyId || '';
  const line2 = source ? mrzSanitize(source) : mrzSanitize(`MASUMI<NETWORK<AGENT<REGISTRY`);
  return [line1, line2];
}

/**
 * Pointer-tracking tilt so the card behaves like a physical object in hand.
 * Technique from https://github.com/frontendfyi/css-3d-card-perspective-animation:
 * the bounding rect is cached on enter (measuring per-move reads the already
 * tilted card and wobbles), and a constant ease-out transition chases the
 * pointer for a springy, physical feel.
 */
function useCardTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const boundingRef = useRef<DOMRect | null>(null);

  const onPointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    boundingRef.current = event.currentTarget.getBoundingClientRect();
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    const rect = boundingRef.current;
    if (!el || !rect || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const xPct = (event.clientX - rect.left) / rect.width;
    const yPct = (event.clientY - rect.top) / rect.height;
    el.style.setProperty('--x-rotation', `${((0.5 - yPct) * 16).toFixed(2)}deg`);
    el.style.setProperty('--y-rotation', `${((xPct - 0.5) * 16).toFixed(2)}deg`);
    el.style.setProperty('--glare-x', `${(xPct * 100).toFixed(1)}%`);
    el.style.setProperty('--glare-y', `${(yPct * 100).toFixed(1)}%`);
  };

  const onPointerLeave = () => {
    boundingRef.current = null;
  };

  return { ref, onPointerEnter, onPointerMove, onPointerLeave };
}

function truncateMiddle(value: string, max = 26) {
  if (value.length <= max) return value;
  const half = Math.floor((max - 3) / 2);
  return `${value.slice(0, half)}...${value.slice(-half)}`;
}

// Memoized: the card stacks blend modes/filters, so avoid re-rendering it
// while chat responses stream in.
export const AgentIdCard = memo(function AgentIdCard({
  data,
  variant = 'panel',
  stamped = false,
  stampAnimated = true,
  registrySheen = true,
  interactiveTilt,
}: {
  data: AgentIdCardData;
  variant?: 'boot' | 'panel';
  /** The stamp only lands once the parent says so (after the visitor engages Nori). */
  stamped?: boolean;
  /** When false the ink is simply present — no tool descent, no thud. */
  stampAnimated?: boolean;
  /** Whether verified registry state should trigger the reflective card sweep. */
  registrySheen?: boolean;
  /** Pointer-following tilt is kept for the hero card, but disabled in the sticky rail. */
  interactiveTilt?: boolean;
}) {
  const agentId = data.agentIdentifier ? truncateMiddle(data.agentIdentifier, 17) : '';
  const checking = data.registryState === 'checking';
  const [line1, line2] = mrzLines(data);
  const tilt = useCardTilt();
  const tiltEnabled = interactiveTilt ?? variant === 'boot';
  const showStamp = stamped && (data.registryState === 'verified' || data.registryState === 'failed');
  const stampState = data.registryState === 'failed' ? 'failed' : 'verified';

  return (
    <div
      ref={tilt.ref}
      className="nori-id-tilt"
      data-tilt={tiltEnabled ? 'enabled' : 'disabled'}
      onPointerEnter={tiltEnabled ? tilt.onPointerEnter : undefined}
      onPointerMove={tiltEnabled ? tilt.onPointerMove : undefined}
      onPointerLeave={tiltEnabled ? tilt.onPointerLeave : undefined}
    >
    <figure
      className="nori-id-card"
      data-variant={variant}
      data-registry={data.registryState}
      data-registry-sheen={registrySheen ? 'true' : 'false'}
      data-stamped={showStamp ? 'true' : 'false'}
      data-stamp-static={showStamp && !stampAnimated ? 'true' : 'false'}
    >
      <div className="nori-id-sheen" aria-hidden="true" />
      <span className="nori-id-glare" aria-hidden="true" />

      <header className="nori-id-header">
        <span className="nori-id-emblem" aria-hidden="true">
          <Image src={withBasePath('/assets/favicon.png')} alt="" width={48} height={48} />
        </span>
        <span className="nori-id-issuer">
          Masumi Network
          <small>Agent Identity Card</small>
        </span>
      </header>

      <div className="nori-id-body">
        <span className="nori-id-watermark" aria-hidden="true" />
        <span className="nori-id-chip" aria-hidden="true" />

        <div className="nori-id-photo">
          <Image src={withBasePath('/assets/nori-pfp.png')} alt={`${data.name} portrait`} width={132} height={132} />
          <span className="nori-id-photo-holo" aria-hidden="true" />
        </div>

        <dl className="nori-id-fields">
          <div className="nori-id-doc-row">
            <div className="nori-id-field">
              <dt>Typ/Type</dt>
              <dd>AI</dd>
            </div>
            <div className="nori-id-field">
              <dt>Kode/Code</dt>
              <dd>MSM</dd>
            </div>
            <div className="nori-id-field">
              <dt>Agent ID/Agenten-Nr.</dt>
              <dd className="nori-id-mono" data-pending={agentId ? 'false' : 'true'}>
                {checking && !agentId ? (
                  <span className="nori-id-lookup" role="status" aria-label="Looking up agent identifier">
                    <Loader2 aria-hidden="true" />
                  </span>
                ) : (
                  agentId || '·············'
                )}
                {data.assetHref && agentId && (
                  <a href={data.assetHref} target="_blank" rel="noreferrer" aria-label="View agent asset on Cardano explorer">
                    <ExternalLink aria-hidden="true" />
                  </a>
                )}
              </dd>
            </div>
          </div>

          <div className="nori-id-field">
            <dt>1. Name/Nom</dt>
            <dd className="nori-id-name">{data.name}</dd>
          </div>

          <div className="nori-id-field">
            <dt>2. Function/Fonction</dt>
            <dd>{data.role}</dd>
          </div>

          <div className="nori-id-doc-row nori-id-doc-row-2">
            <div className="nori-id-field">
              <dt>3. Network/Réseau</dt>
              <dd>{data.network}</dd>
            </div>
            <div className="nori-id-field">
              <dt>4. Authority/Autorité</dt>
              <dd>Masumi Registry</dd>
            </div>
          </div>
        </dl>

        <div className="nori-id-signature">
          <span className="nori-id-sig-label">5. Signature of bearer/Unterschrift</span>
          <span className="nori-id-script" aria-hidden="true">
            {data.signature ?? data.name}
          </span>
        </div>

        {showStamp && (
          <span className="nori-id-stamp" data-state={stampState} aria-label={stampState === 'verified' ? 'Verified by Masumi Registry' : 'Registry verification failed'}>
            <strong>{stampState === 'verified' ? 'Verified' : 'Unverified'}</strong>
            <small>Masumi Registry</small>
            <small className="nori-id-stamp-sub">On-chain</small>
          </span>
        )}
      </div>

      <figcaption className="nori-id-mrz" aria-label="Machine readable zone">
        <span>{line1}</span>
        <span>{line2}</span>
      </figcaption>
    </figure>

    {showStamp && stampAnimated && (
    <span className="nori-id-stamp-rig" aria-hidden="true">
      <span className="nori-id-stamp-shadow" />
      <svg className="nori-id-stamp-tool" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nori-stamp-knob" cx="0.42" cy="0.32" r="0.78">
            <stop offset="0%" stopColor="#7a6070" />
            <stop offset="55%" stopColor="#43303c" />
            <stop offset="100%" stopColor="#251a21" />
          </radialGradient>
          <linearGradient id="nori-stamp-stem" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#241a20" />
            <stop offset="42%" stopColor="#5c4652" />
            <stop offset="60%" stopColor="#4a3841" />
            <stop offset="100%" stopColor="#1d141a" />
          </linearGradient>
          <linearGradient id="nori-stamp-basetop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a4650" />
            <stop offset="100%" stopColor="#382933" />
          </linearGradient>
          <linearGradient id="nori-stamp-basefront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c2028" />
            <stop offset="100%" stopColor="#171014" />
          </linearGradient>
        </defs>
        {/* base: rectangular block seen from above — top face */}
        <rect x="14" y="64" width="92" height="30" rx="6" fill="url(#nori-stamp-basetop)" />
        {/* base: shallow front face (the rubber is hidden underneath) */}
        <rect x="14" y="88" width="92" height="17" rx="5" fill="url(#nori-stamp-basefront)" />
        {/* stem contact shadow on the top face */}
        <ellipse cx="60" cy="68" rx="14" ry="4" fill="rgba(0, 0, 0, 0.28)" />
        {/* stem, foreshortened (we look down its axis) */}
        <path d="M52 38h16v27c0 2.5-3.5 4-8 4s-8-1.5-8-4V38z" fill="url(#nori-stamp-stem)" />
        {/* knob: closest to the camera, reads large */}
        <circle cx="60" cy="25" r="21" fill="url(#nori-stamp-knob)" />
        <ellipse cx="53" cy="17" rx="8" ry="6" fill="rgba(255, 255, 255, 0.16)" />
      </svg>
    </span>
    )}
    </div>
  );
});

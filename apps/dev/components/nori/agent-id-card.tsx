'use client';

import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { withBasePath } from '@/lib/base-path';

export type RegistryState = 'idle' | 'checking' | 'verified' | 'failed';

export interface AgentIdCardData {
  name: string;
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

/** Reveals `value` character-by-character whenever it changes. */
function useTypeOn(value: string, charsPerTick = 2, tickMs = 16) {
  const [shown, setShown] = useState(value);
  const previousRef = useRef(value);

  useEffect(() => {
    if (value === previousRef.current) return;
    previousRef.current = value;
    if (!value) {
      setShown('');
      return;
    }
    let index = 0;
    setShown('');
    const timer = setInterval(() => {
      index += charsPerTick;
      setShown(value.slice(0, index));
      if (index >= value.length) clearInterval(timer);
    }, tickMs);
    return () => clearInterval(timer);
  }, [value, charsPerTick, tickMs]);

  return shown;
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

export function AgentIdCard({
  data,
  variant = 'panel',
}: {
  data: AgentIdCardData;
  variant?: 'boot' | 'panel';
}) {
  const agentId = useTypeOn(data.agentIdentifier ? truncateMiddle(data.agentIdentifier, 30) : '');
  const cardNo = data.policyId ? data.policyId.slice(0, 12).toUpperCase() : '';
  const [line1, line2] = mrzLines(data);
  const tilt = useCardTilt();
  const stampState = data.registryState === 'failed' ? 'failed' : 'verified';

  return (
    <div
      ref={tilt.ref}
      className="nori-id-tilt"
      onPointerEnter={tilt.onPointerEnter}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
    <figure className="nori-id-card" data-variant={variant} data-registry={data.registryState}>
      <div className="nori-id-sheen" aria-hidden="true" />
      <span className="nori-id-glare" aria-hidden="true" />

      <header className="nori-id-header">
        <span className="nori-id-emblem" aria-hidden="true">
          <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#fa008c" />
            <path
              d="M14.5 30.5v-4a9.5 9.5 0 0 1 19 0v4"
              stroke="#fff"
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </span>
        <span className="nori-id-issuer">
          Masumi Network
          <small>Agent Identity Card</small>
        </span>
        <span className="nori-id-chip" aria-hidden="true" />
        <span className="nori-id-network">{data.network}</span>
      </header>

      <div className="nori-id-body">
        <span className="nori-id-watermark" aria-hidden="true" />

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
              <dt>Card No./Karten-Nr.</dt>
              <dd className="nori-id-mono">{cardNo || '············'}</dd>
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

          <div className="nori-id-field">
            <dt>3. Agent ID on-chain/Identifiant</dt>
            <dd className="nori-id-mono" data-pending={agentId ? 'false' : 'true'}>
              {agentId || '···· ···· ···· ····'}
              {data.assetHref && agentId && (
                <a href={data.assetHref} target="_blank" rel="noreferrer" aria-label="View agent asset on Cardano explorer">
                  <ExternalLink aria-hidden="true" />
                </a>
              )}
            </dd>
          </div>

          <div className="nori-id-doc-row nori-id-doc-row-2">
            <div className="nori-id-field">
              <dt>4. Network/Réseau</dt>
              <dd>{data.network}</dd>
            </div>
            <div className="nori-id-field">
              <dt>5. Authority/Autorité</dt>
              <dd>Masumi Registry</dd>
            </div>
          </div>
        </dl>

        <div className="nori-id-signature">
          <span className="nori-id-sig-label">6. Signature of bearer/Unterschrift</span>
          <span className="nori-id-script" aria-hidden="true">
            {data.name}
          </span>
        </div>

        <span className="nori-id-stamp" data-state={stampState} aria-label={stampState === 'verified' ? 'Verified by Masumi Registry' : 'Registry verification failed'}>
          <strong>{stampState === 'verified' ? 'Verified' : 'Unverified'}</strong>
          <small>Masumi Registry</small>
          <small className="nori-id-stamp-sub">On-chain</small>
        </span>
      </div>

      <figcaption className="nori-id-mrz" aria-label="Machine readable zone">
        <span>{line1}</span>
        <span>{line2}</span>
      </figcaption>
    </figure>
    </div>
  );
}

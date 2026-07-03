'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { withBasePath } from '@/lib/base-path';
import { AgentIdCard, type AgentIdCardData, type RegistryState } from './agent-id-card';

interface NoriIdentityState {
  status: Extract<RegistryState, 'checking' | 'verified' | 'failed'>;
  agentIdentifier?: string;
  policyId?: string;
  name?: string;
  assetHref?: string;
  error?: string;
}

interface NoriIdentityPageContext {
  path: string;
  title?: string;
  markdownUrl?: string;
}

interface NoriIdentityPayload {
  ok?: boolean;
  error?: string;
  identity?: {
    verified?: boolean;
    agentIdentifier?: string;
    policyId?: string;
    name?: string;
    error?: string;
    explorerLinks?: {
      agentAsset?: string;
    };
  };
}

let identityCache: NoriIdentityState | null = null;
let identityRequest: Promise<NoriIdentityState> | null = null;

async function loadNoriIdentity(): Promise<NoriIdentityState> {
  if (identityCache) return identityCache;
  if (identityRequest) return identityRequest;

  identityRequest = (async (): Promise<NoriIdentityState> => {
    try {
      const response = await fetch(withBasePath('/api/nori/identity'), { cache: 'no-store' });
      const payload = (await response.json()) as NoriIdentityPayload;
      if (response.ok && payload.ok && payload.identity?.verified) {
        return {
          status: 'verified',
          agentIdentifier: payload.identity.agentIdentifier,
          policyId: payload.identity.policyId,
          name: payload.identity.name,
          assetHref: payload.identity.explorerLinks?.agentAsset,
        };
      }

      return { status: 'failed', error: payload.identity?.error || payload.error };
    } catch {
      return { status: 'failed', error: 'Registry lookup failed.' };
    }
  })().then((identity) => {
    identityCache = identity;
    identityRequest = null;
    return identity;
  });

  return identityRequest;
}

function useNoriIdentity() {
  const [identity, setIdentity] = useState<NoriIdentityState>(() => identityCache ?? { status: 'checking' });

  useEffect(() => {
    if (identityCache) {
      setIdentity(identityCache);
      return;
    }

    let cancelled = false;
    void loadNoriIdentity().then((nextIdentity) => {
      if (!cancelled) setIdentity(nextIdentity);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return identity;
}

function useNoriIdentityCardData(): AgentIdCardData {
  const identity = useNoriIdentity();

  return useMemo(
    () => ({
      name: 'Nori',
      signature: 'Nori DevRel Agent',
      role: 'Developer Relations Agent',
      agentIdentifier: identity.agentIdentifier,
      policyId: identity.policyId,
      network: 'Cardano · Preprod',
      registryState: identity.status,
      assetHref: identity.assetHref,
    }),
    [identity.agentIdentifier, identity.assetHref, identity.policyId, identity.status],
  );
}

export const NoriIdentityCard = memo(function NoriIdentityCard({
  variant = 'panel',
  stamped = false,
  stampAnimated = true,
  registrySheen,
}: {
  variant?: 'boot' | 'panel';
  stamped?: boolean;
  stampAnimated?: boolean;
  registrySheen?: boolean;
}) {
  const cardData = useNoriIdentityCardData();

  return (
    <AgentIdCard
      data={cardData}
      variant={variant}
      stamped={stamped}
      stampAnimated={stampAnimated}
      registrySheen={registrySheen ?? variant === 'boot'}
    />
  );
});

export const NoriIdentityRail = memo(function NoriIdentityRail({
  initialPage,
}: {
  initialPage?: NoriIdentityPageContext;
}) {
  return (
    <aside className="nori-session" aria-label="Nori identity">
      <NoriIdentityCard variant="panel" stamped stampAnimated={false} registrySheen={false} />

      {initialPage && (
        <div className="nori-context-card">
          <div>
            <p className="nori-card-label">Current page context</p>
            <strong>{initialPage.title || initialPage.path}</strong>
            <span>{initialPage.path}</span>
          </div>
          {initialPage.markdownUrl && (
            <a href={initialPage.markdownUrl} target="_blank" rel="noreferrer">
              View Markdown <ExternalLink aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </aside>
  );
});

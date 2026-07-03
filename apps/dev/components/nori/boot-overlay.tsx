'use client';

import { Check, Circle, Loader2, XCircle } from 'lucide-react';
import { AgentIdCard, type AgentIdCardData } from './agent-id-card';

export type BootStepStatus = 'pending' | 'active' | 'done' | 'error';

export interface BootStep {
  key: string;
  label: string;
  meta?: string;
  status: BootStepStatus;
}

function StepIcon({ status }: { status: BootStepStatus }) {
  if (status === 'done') return <Check aria-hidden="true" />;
  if (status === 'error') return <XCircle aria-hidden="true" />;
  if (status === 'active') return <Loader2 aria-hidden="true" />;
  return <Circle aria-hidden="true" />;
}

export function NoriBootOverlay({
  open,
  leaving,
  card,
  steps,
  headline,
}: {
  open: boolean;
  leaving: boolean;
  card: AgentIdCardData;
  steps: BootStep[];
  headline: string;
}) {
  if (!open) return null;

  return (
    <div className="nori-boot-overlay" data-leaving={leaving ? 'true' : 'false'} role="status" aria-live="polite">
      <div className="nori-boot-stage">
        <p className="nori-boot-kicker">{headline}</p>

        <div className="nori-boot-card">
          <AgentIdCard data={card} variant="boot" />
        </div>

        <ol className="nori-boot-steps" aria-label="Masumi escrow sequence">
          {steps.map((step, index) => (
            <li
              key={step.key}
              data-status={step.status}
              style={{ animationDelay: `${1200 + index * 140}ms` }}
            >
              <span className="nori-boot-step-icon">
                <StepIcon status={step.status} />
              </span>
              <span className="nori-boot-step-label">{step.label}</span>
              {step.meta && <code className="nori-boot-step-meta">{step.meta}</code>}
            </li>
          ))}
        </ol>

        <p className="nori-boot-footnote">
          Live transaction on Cardano preprod &mdash; subsidized by Masumi Docs. You pay nothing.
        </p>
      </div>
    </div>
  );
}

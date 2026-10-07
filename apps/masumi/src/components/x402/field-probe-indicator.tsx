"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import type { X402FieldProbeStatus } from "@/lib/register-wizard/x402-resource-probe";

export function FieldProbeIndicator({
  status,
  checkingLabel,
  validLabel,
  invalidMessage,
}: {
  status: X402FieldProbeStatus;
  checkingLabel: string;
  validLabel: string;
  invalidMessage?: string;
}) {
  if (status === "idle") return null;

  const tooltipLabel =
    status === "checking"
      ? checkingLabel
      : status === "valid"
        ? validLabel
        : (invalidMessage ?? checkingLabel);

  return (
    <span
      className="flex size-4 shrink-0 cursor-help items-center justify-center"
      title={tooltipLabel}
      aria-live="polite"
      aria-busy={status === "checking"}
    >
      {status === "checking" ? (
        <Spinner size={16} className="text-masumi-muted" />
      ) : status === "valid" ? (
        <CheckCircle2 className="size-4 text-sky-500" aria-hidden />
      ) : (
        <AlertTriangle className="size-4 text-red-600" aria-hidden />
      )}
      <span className="sr-only">{tooltipLabel}</span>
    </span>
  );
}

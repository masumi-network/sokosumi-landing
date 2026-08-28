"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const STEPS = [
  { id: "submitting", label: "Submitting registration" },
  { id: "processing", label: "Setting up your agent" },
  { id: "done", label: "Ready on the network" },
] as const;

/** Equal gap above and below each rail (space X). */
const CONNECTOR_GAP_CLASS = "h-2";
/** Fixed rail height — both separators identical. */
const CONNECTOR_RAIL_CLASS = "h-8";

export type RegisterProgressStep = "submitting" | "processing" | "done";

function getStepVisualState(
  stepIndex: number,
  current: RegisterProgressStep,
): { isComplete: boolean; isActive: boolean } {
  const activeIndex =
    current === "submitting" ? 0 : current === "processing" ? 1 : STEPS.length;

  return {
    isComplete: stepIndex < activeIndex,
    isActive: stepIndex === activeIndex && current !== "done",
  };
}

export function RegisterProgress({
  step = "processing",
  className,
}: {
  /** Current stage while polling mint / registration on the success page. */
  step?: RegisterProgressStep;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "register-mint-progress w-full rounded-2xl border border-masumi-border bg-white px-5 py-6 text-left shadow-sm",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Registration progress"
    >
      <ol className="space-y-0">
        {STEPS.map((item, index) => {
          const { isActive, isComplete } = getStepVisualState(index, step);
          const isLast = index === STEPS.length - 1;

          return (
            <li key={item.id}>
              <div className="flex gap-3">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                    isComplete && "border-masumi-pink bg-masumi-pink text-white",
                    isActive &&
                      "border-masumi-pink bg-masumi-pink-soft text-masumi-pink register-mint-progress-pulse",
                    !isComplete &&
                      !isActive &&
                      "border-masumi-border bg-white text-masumi-muted",
                  )}
                >
                  {isComplete ? (
                    <Check
                      className="h-3.5 w-3.5"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium leading-6",
                      isActive || isComplete
                        ? "text-masumi-ink"
                        : "text-masumi-muted",
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              </div>

              {!isLast ? (
                <div className="flex gap-3" aria-hidden>
                  <div className="flex w-6 shrink-0 flex-col items-center">
                    <div className={CONNECTOR_GAP_CLASS} />
                    <span
                      className={cn(
                        "register-mint-progress-rail block w-px shrink-0",
                        CONNECTOR_RAIL_CLASS,
                        isComplete && "register-mint-progress-rail--done",
                        isActive && "register-mint-progress-rail--active",
                      )}
                    />
                    <div className={CONNECTOR_GAP_CLASS} />
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

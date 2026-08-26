"use client";

const STEPS = [
  { id: "submitting", label: "Submitting registration" },
  { id: "processing", label: "Setting up your agent" },
  { id: "done", label: "Ready on the network" },
] as const;

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
      className={`register-mint-progress w-full rounded-2xl border border-masumi-border bg-white px-5 py-6 text-left shadow-sm ${className ?? ""}`}
      role="status"
      aria-live="polite"
      aria-label="Registration progress"
    >
      <ol className="space-y-0">
        {STEPS.map((item, index) => {
          const { isActive, isComplete } = getStepVisualState(index, step);

          return (
            <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
              {index < STEPS.length - 1 ? (
                <span
                  className={`register-mint-progress-rail absolute top-7 left-[11px] h-[calc(100%-4px)] w-px ${
                    isComplete ? "register-mint-progress-rail--done" : ""
                  } ${isActive ? "register-mint-progress-rail--active" : ""}`}
                  aria-hidden
                />
              ) : null}
              <span
                className={`relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                  isComplete
                    ? "border-masumi-pink bg-masumi-pink text-white"
                    : isActive
                      ? "border-masumi-pink bg-masumi-pink-soft text-masumi-pink register-mint-progress-pulse"
                      : "border-masumi-border bg-white text-masumi-muted"
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-sm font-medium ${
                    isActive || isComplete
                      ? "text-masumi-ink"
                      : "text-masumi-muted"
                  }`}
                >
                  {item.label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

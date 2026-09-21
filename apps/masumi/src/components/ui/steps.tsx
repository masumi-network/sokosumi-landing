type StepItem = {
  title: string;
  description?: string;
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * Numbered step indicator: circles, check on completed, connector bars.
 */
export function Steps({
  currentStep,
  steps,
  className = "",
}: {
  currentStep: number;
  steps: StepItem[];
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`.trim()}>
      <ol className="flex w-full items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <li
              key={step.title}
              className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
            >
              <div className="flex items-center">
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                    isCompleted
                      ? "border-masumi-ink bg-masumi-ink text-white"
                      : "",
                    isActive
                      ? "border-masumi-ink bg-masumi-ink text-white ring-4 ring-masumi-ink/10"
                      : "",
                    isUpcoming
                      ? "border-masumi-border bg-white text-masumi-muted"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={isActive ? "step" : undefined}
                  title={step.title}
                >
                  {isCompleted ? <CheckIcon className="h-5 w-5" /> : stepNumber}
                </div>
              </div>
              {index < steps.length - 1 ? (
                <div className="mx-4 h-0.5 flex-1 overflow-hidden rounded-full bg-masumi-border">
                  <div
                    className={`h-full rounded-full bg-masumi-ink transition-all duration-500 ease-out ${
                      isCompleted ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

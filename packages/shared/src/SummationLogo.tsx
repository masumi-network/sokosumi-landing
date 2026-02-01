export function SokosumiIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="9" cy="9" r="2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="2" fill="currentColor" stroke="none" />
      <path d="M8 15.5c0-1.5 1.8-3 4-3s4 1.5 4 3" strokeLinecap="round" />
    </svg>
  );
}

export function SokosumiLogoFull({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <SokosumiIcon className="w-6 h-6" />
      <span className="text-xl font-medium tracking-tight">sokosumi</span>
    </div>
  );
}

export const SummationIcon = SokosumiIcon;
export const SummationLogoFull = SokosumiLogoFull;

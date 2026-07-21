export default function LearnLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-4 w-40 rounded-full bg-[#ebebeb]" />
      <div className="h-12 w-2/3 max-w-xl bg-[#ebebeb]" />
      <div className="h-28 bg-[#ebebeb]" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 bg-[#ebebeb]" />
        <div className="h-40 bg-[#ebebeb]" />
      </div>
      <span className="sr-only">Loading Learn…</span>
    </div>
  );
}

export default function LearnLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-4 w-40 rounded-full bg-black/10" />
      <div className="h-12 w-2/3 max-w-xl rounded-2xl bg-black/10" />
      <div className="h-28 rounded-3xl bg-white shadow-sm" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-3xl bg-white shadow-sm" />
        <div className="h-40 rounded-3xl bg-white shadow-sm" />
      </div>
      <span className="sr-only">Loading Learn…</span>
    </div>
  );
}

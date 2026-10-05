import CopyButton from "./copy-button";

export default function Command({ children, configuration = false }: { children: string; configuration?: boolean }) {
  return <div className="min-w-0 overflow-hidden rounded-xl bg-[#241B20] text-[#F7F2F5]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
      <span className="text-xs font-medium uppercase tracking-wider text-[#D8C5CE]">{configuration ? "Configuration" : "Terminal"}</span>
      <CopyButton text={children} label={configuration ? "Copy values" : "Copy command"} dark />
    </div>
    <pre className="overflow-x-auto overscroll-x-contain p-4 text-[13px] leading-7 sm:p-5 sm:text-sm"><code>{children}</code></pre>
  </div>;
}

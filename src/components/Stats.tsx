const stats = [
  { value: "10x", label: "Faster campaign delivery", sublabel: "vs. manual workflows" },
  { value: "75%", label: "Less coordination overhead", sublabel: "for marketing managers" },
  { value: "24/7", label: "Agents work around the clock", sublabel: "no downtime, no delays" },
  { value: "100%", label: "Decision transparency", sublabel: "full audit trail on every task" },
];

export default function Stats() {
  return (
    <section className="pt-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/5">
          {stats.map((stat) => (
            <div key={stat.value} className="bg-[#f4f4f4] p-8 md:p-10 flex flex-col">
              <span className="text-[36px] md:text-[48px] font-normal tracking-[-1px] text-black leading-none">
                {stat.value}
              </span>
              <p className="mt-3 text-[16px] md:text-[18px] text-black leading-[1.3]">
                {stat.label}
              </p>
              <p className="mt-1 text-[14px] text-[#999]">
                {stat.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

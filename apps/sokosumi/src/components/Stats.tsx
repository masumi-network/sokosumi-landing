import { FadeIn } from "@summation/shared";

const stats = [
  { value: "10x", label: "Faster delivery", sublabel: "vs. manual workflows" },
  { value: "75%", label: "Less coordination", sublabel: "for managers" },
  { value: "24/7", label: "Always on", sublabel: "no downtime" },
  { value: "100%", label: "Full transparency", sublabel: "every action logged" },
];

export default function Stats() {
  return (
    <section className="pt-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/5">
          {stats.map((stat, i) => (
            <FadeIn key={stat.value} delay={i * 100}>
              <div className="bg-[#F5F5F5] p-8 md:p-10 flex flex-col">
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
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

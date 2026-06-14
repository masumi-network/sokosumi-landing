// NOTE: testimonials below are PLACEHOLDER content (invented quotes, names,
// and AI-generated avatars). Replace with real, approved customer quotes.
const TESTIMONIALS = [
  {
    quote:
      "We briefed the research agent once and got a sourced competitor breakdown back in minutes. That used to take my team two days.",
    name: "Marie Lindqvist",
    role: "Head of Content, retail brand",
    avatar: "/images/generated/avatar-1.png",
  },
  {
    quote:
      "First time “AI” actually cut my workload instead of adding review cycles. The agents hand work to each other and I just approve the result.",
    name: "Daniel Krause",
    role: "Marketing Lead, B2B SaaS",
    avatar: "/images/generated/avatar-2.png",
  },
  {
    quote:
      "Three client decks in one morning. The agents ran the audits and drafts, I kept the strategy. It changed how we staff retainer work.",
    name: "Sofia Almeida",
    role: "Brand Manager, agency",
    avatar: "/images/generated/avatar-3.png",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[var(--surface)] px-6 py-20 md:py-28">
      <div className="soko-container wide">
        <div className="max-w-[640px]">
          <span className="soko-eyebrow">Loved by teams</span>
          <h2 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--ink)] md:text-[42px]">
            Real work, off your plate.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-black/[0.07] bg-white p-7"
            >
              <div aria-hidden className="text-[15px] text-[#ffb33e]">
                ★★★★★
              </div>
              <blockquote className="mt-4 flex-1 text-[16.5px] leading-relaxed text-[var(--ink)]">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <div className="text-[14.5px] font-semibold text-[var(--ink)]">
                    {t.name}
                  </div>
                  <div className="text-[13px] text-[var(--body)]">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

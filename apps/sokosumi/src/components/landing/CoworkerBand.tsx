const COWORKERS = [
  {
    name: "Hannah",
    role: "Marketing Research Partner",
    img: "/images/hannah-coworker.webp",
    grad: "linear-gradient(180deg, #efe9ff 0%, #e3d4ff 100%)",
  },
  {
    name: "Elena",
    role: "Project Management Partner",
    img: "/images/elena.webp",
    grad: "linear-gradient(180deg, #eef0ff 0%, #dfe2ff 100%)",
  },
  {
    name: "Alex",
    role: "Data & Analysis Partner",
    img: null,
    grad: "linear-gradient(180deg, #f4ecff 0%, #ead9ff 100%)",
  },
];

export default function CoworkerBand() {
  return (
    <section className="px-4 pb-4 md:px-6">
      <div className="soko-container wide">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COWORKERS.map((c) => (
            <div
              key={c.name}
              className="relative aspect-[4/5] overflow-hidden rounded-[28px]"
              style={{ background: c.grad }}
            >
              {c.img ? (
                <img
                  src={c.img}
                  alt={`${c.name}, a Sokosumi AI coworker`}
                  className="absolute bottom-0 left-1/2 h-[94%] w-auto -translate-x-1/2 object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="soko-eyebrow muted">Placeholder</span>
                </div>
              )}
              <div className="absolute left-7 top-7">
                <p className="text-[22px] font-medium tracking-[-0.02em] text-[var(--ink)]">
                  {c.name}
                </p>
                <p className="mt-0.5 text-[14px] text-[rgba(30,30,30,0.55)]">
                  {c.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

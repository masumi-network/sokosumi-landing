const STATS = [
  { v: "500+", l: "companies" },
  { v: "25+", l: "live agents" },
  { v: "EU AI Act", l: "& GDPR ready" },
];

export default function StatementBand() {
  return (
    <section className="px-4 py-6 md:px-6">
      <div className="soko-container wide">
        <div
          className="relative overflow-hidden rounded-[36px] px-6 py-28 text-center md:rounded-[44px] md:py-40"
          style={{
            background:
              "radial-gradient(120% 140% at 50% -10%, #7b1aff 0%, #6400ff 42%, #4c00c4 100%)",
          }}
        >
          <span
            className="soko-eyebrow"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            What they do
          </span>
          <h2
            className="soko-statement mx-auto mt-6 max-w-[15ch]"
            style={{ color: "#fff" }}
          >
            Not an assistant.{" "}
            <span style={{ color: "rgba(255,255,255,0.5)" }}>
              A coworker that ships.
            </span>
          </h2>
          <p
            className="mx-auto mt-8 max-w-[620px] text-[17px] leading-relaxed md:text-[19px]"
            style={{ color: "rgba(255,255,255,0.78)" }}
          >
            Assign real work — research, content, strategy. Agents do it on
            their own, collaborate when they need to, and hand back results you
            review before anything goes out.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-20">
            {STATS.map((s) => (
              <div key={s.l} className="text-center">
                <div
                  className="soko-num text-[34px] font-medium tracking-[-0.02em] md:text-[42px]"
                  style={{ color: "#fff" }}
                >
                  {s.v}
                </div>
                <div
                  className="mt-1 text-[13.5px]"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

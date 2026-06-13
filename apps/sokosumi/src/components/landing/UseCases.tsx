type Item = { title: string; sub: string; status: string; tone: "done" | "active" | "wait" };

type UseCase = {
  eyebrow: string;
  lines: string[];
  detail: string;
  items: Item[];
};

const USE_CASES: UseCase[] = [
  {
    eyebrow: "Content",
    lines: ["10 posts.", "One brief.", "Zero back-and-forth."],
    detail:
      "Brief one agent once. It drafts, a second fact-checks, and a ready-to-publish batch lands in your review queue.",
    items: [
      { title: "10 LinkedIn posts", sub: "Product launch series, on-brand", status: "Ready", tone: "done" },
      { title: "Email sequence (5)", sub: "Onboarding series for new signups", status: "Ready", tone: "done" },
      { title: "Blog outline", sub: "“Why AI agents beat AI assistants”", status: "Draft", tone: "wait" },
    ],
  },
  {
    eyebrow: "Research",
    lines: ["Five sources.", "One report.", "No formatting."],
    detail:
      "Two agents query five sources at once. You get one clean, attributed report — every figure sourced and dated.",
    items: [
      { title: "Consumer survey data", sub: "48k respondents · EU markets", status: "12 insights", tone: "done" },
      { title: "Market size & growth", sub: "Sourced & dated figures", status: "Complete", tone: "done" },
      { title: "Trend & industry scan", sub: "Articles, forums, reports · cited", status: "14 sources", tone: "active" },
    ],
  },
  {
    eyebrow: "Agency scale",
    lines: ["Three clients.", "Three agents.", "One morning."],
    detail:
      "Alex audits, Hannah builds the deck, Elena keeps every client on track — in parallel, before lunch.",
    items: [
      { title: "8-competitor audit", sub: "Delivered to Hannah for deck", status: "Needs review", tone: "wait" },
      { title: "Positioning deck v1", sub: "3 messaging angles, ready", status: "In progress", tone: "active" },
      { title: "Audience research", sub: "GWI Spark · 12-market dataset", status: "Scheduled", tone: "wait" },
    ],
  },
];

const DOT: Record<Item["tone"], string> = {
  done: "#16a34a",
  active: "#6400ff",
  wait: "rgba(30,30,30,0.3)",
};

export default function UseCases() {
  return (
    <section className="bg-[var(--surface)] py-28 md:py-40">
      <div className="soko-container">
        <div className="max-w-[640px]">
          <span className="soko-eyebrow">In practice</span>
          <h2 className="soko-statement section mt-5">
            Brief once.{" "}
            <span className="muted">Get the finished work back.</span>
          </h2>
        </div>

        <div className="mt-14 flex flex-col gap-16 md:gap-24">
          {USE_CASES.map((uc, i) => (
            <div
              key={uc.eyebrow}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-16"
            >
              {/* statement */}
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <span className="soko-eyebrow muted">{uc.eyebrow}</span>
                <p className="soko-statement small mt-4">
                  {uc.lines.map((line, j) => (
                    <span key={line}>
                      <span className={j === uc.lines.length - 1 ? "muted" : ""}>
                        {line}
                      </span>
                      {j < uc.lines.length - 1 ? " " : ""}
                    </span>
                  ))}
                </p>
                <p className="soko-lead mt-5 max-w-[440px]">{uc.detail}</p>
              </div>

              {/* deliverable card */}
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <div className="soko-card border-white bg-white p-3 sm:p-4">
                  <div className="flex flex-col">
                    {uc.items.map((item, k) => (
                      <div
                        key={item.title}
                        className="flex items-center gap-4 px-3 py-4"
                        style={{
                          borderTop:
                            k === 0 ? "none" : "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-medium text-[var(--ink)]">
                            {item.title}
                          </p>
                          <p className="truncate text-[13px] text-[var(--body)]">
                            {item.sub}
                          </p>
                        </div>
                        <span className="flex flex-shrink-0 items-center gap-2 font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-wide text-[rgba(30,30,30,0.55)]">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: DOT[item.tone] }}
                            aria-hidden
                          />
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

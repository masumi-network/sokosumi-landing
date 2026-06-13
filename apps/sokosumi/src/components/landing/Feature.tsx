import type { ReactNode } from "react";

export default function Feature({
  eyebrow,
  title,
  body,
  bullets,
  image,
  imageAlt,
  reverse = false,
  tint = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  body: string;
  bullets?: string[];
  image?: string;
  imageAlt?: string;
  reverse?: boolean;
  tint?: boolean;
}) {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="soko-container wide">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          <div className={reverse ? "md:order-2" : ""}>
            {eyebrow && <span className="soko-eyebrow">{eyebrow}</span>}
            <h2 className={`soko-statement section ${eyebrow ? "mt-5" : ""}`}>
              {title}
            </h2>
            <p className="soko-lead mt-6 max-w-[480px]">{body}</p>
            {bullets && (
              <ul className="mt-7 flex flex-col gap-3.5">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] text-white"
                      style={{ background: "var(--accent)" }}
                    >
                      ✓
                    </span>
                    <span className="text-[16px] leading-snug text-[var(--ink)]">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={reverse ? "md:order-1" : ""}>
            <Visual image={image} imageAlt={imageAlt} tint={tint} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Visual({
  image,
  imageAlt,
  tint,
}: {
  image?: string;
  imageAlt?: string;
  tint?: boolean;
}) {
  return (
    <figure
      className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] border border-black/[0.06]"
      style={{
        background: tint
          ? "radial-gradient(120% 120% at 30% 0%, rgba(100,0,255,0.12), rgba(100,0,255,0.03) 60%, rgba(0,0,0,0.02))"
          : "var(--surface)",
      }}
    >
      {image ? (
        <img
          src={image}
          alt={imageAlt ?? ""}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="soko-eyebrow muted">Placeholder</span>
        </div>
      )}
    </figure>
  );
}

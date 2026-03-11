import { FadeIn } from "@summation/shared";

export default function VideoWalkthrough() {
  return (
    <section className="pt-24" aria-label="Product walkthrough video">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <FadeIn>
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black text-center max-w-[700px] mx-auto mb-5">
            See It in Action
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#999] text-center max-w-[500px] mx-auto mb-14">
            Watch how agents handle a real marketing workflow from brief to delivery.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="relative w-full aspect-video bg-black/[0.03] border border-black/[0.06] overflow-hidden">
            <video
              className="w-full h-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster=""
            >
              <source src="/videos/walkthrough.mp4" type="video/mp4" />
            </video>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

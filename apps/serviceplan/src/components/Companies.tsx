"use client";

import { useState, useEffect } from "react";
import { Locale, t } from "@/lib/translations";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  initials: string;
  image: string | null;
  linkedin: string | null;
}

const companyLogos = [
  { name: "Allianz", src: "/images/logos/allianz.svg" },
  { name: "BVG", src: "/images/logos/bvg.svg" },
  { name: "Str\u00f6er", src: "/images/logos/stroer.svg" },
  { name: "Pfisterer", src: "/images/logos/pfisterer.svg" },
  { name: "Deutsche Telekom", src: "/images/logos/telekom.svg" },
  { name: "Cardano Foundation", src: "/images/logos/cardano-foundation.svg" },
  { name: "Serviceplan Group", src: "/images/logos/serviceplan-group.svg" },
  { name: "Ravensburger", src: "/images/logos/ravensburger.svg" },
  { name: "Lufthansa", src: "/images/logos/lufthansa.svg" },
  { name: "OMR", src: "/images/logos/omr.svg" },
  { name: "L\u00fcnendonk", src: "/images/logos/lunendonk.svg" },
  { name: "Vion Food Group", src: "/images/logos/vion-food.svg" },
  { name: "NMKR", src: "/images/logos/nmkr.svg" },
  { name: "Input Output", src: "/images/logos/iohk.svg" },
  { name: "Bizzlogic", src: "/images/logos/bizzlogic.svg" },
  { name: "Emurgo", src: "/images/logos/emurgo.svg" },
  { name: "TDK", src: "/images/logos/tdk.svg" },
  { name: "ARD", src: "/images/logos/ard.svg" },
  { name: "B/S/H/", src: "/images/logos/bsh.svg" },
  { name: "Golden Touch", src: "/images/logos/golden-touch.svg" },
  { name: "dpa", src: "/images/logos/dpa.svg" },
  { name: "Samsung", src: "/images/logos/samsung.svg" },
];

export default function Companies({ locale = "en" }: { locale?: Locale }) {
  const tt = t(locale).companies;
  const testimonials = tt.testimonials as readonly Testimonial[];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const slidesPerView = isMobile ? 1 : 2;
  const totalSlides = Math.ceil(testimonials.length / slidesPerView);
  const maxSlide = totalSlides - 1;

  const [currentSlide, setCurrentSlide] = useState(0);

  // Clamp currentSlide when switching between mobile/desktop
  useEffect(() => {
    setCurrentSlide((prev) => Math.min(prev, maxSlide));
  }, [maxSlide]);

  const handlePrev = () => setCurrentSlide((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCurrentSlide((prev) => Math.min(maxSlide, prev + 1));

  return (
    <div className="section-wrapper">
      <div className="white-bg-wrap">
        <div className="logo-wrapper-gradient">
          <div className="red-gradinet"></div>
          <div className="container-large">
            <div className="logo-content-wrap">
              {/* Section 1: Credibility Logo Bar */}
              <div className="sp-logo-section">
                <h2 className="bentocard-heding max-width-500">
                  {tt.heading}
                </h2>
                <div className="spacer-small"></div>
                <div className="sp-logo-grid">
                  {companyLogos.map((logo) => (
                    <div key={logo.name} className="sp-logo-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logo.src}
                        alt={logo.name}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>

                <div className="spacer-small"></div>

                {/* Stats Row */}
                <div className="footer-section">
                  <div className="container-37">
                    <div className="footer-text">
                      <div className="footer-text">
                        <span className="footer-text-0">{tt.stat1Value}</span>
                        <span className="footer-text-1">{tt.stat1Label}</span>
                      </div>
                    </div>
                    <div className="footer-subtext">
                      {tt.stat1Description}
                    </div>
                  </div>
                  <div className="container-37">
                    <div className="footer-text">
                      <div className="footer-text">
                        <span className="footer-text-0">{tt.stat2Value}</span>
                        <span className="footer-text-1">{tt.stat2Label}</span>
                      </div>
                    </div>
                    <div className="footer-subtext">
                      {tt.stat2Description}
                    </div>
                  </div>
                  <div className="number-wrap no-border">
                    <div className="footer-text">
                      <div className="footer-text">
                        <span className="footer-text-0">{tt.stat3Value}</span>
                        <span className="footer-text-1">{tt.stat3Label}</span>
                      </div>
                    </div>
                    <div className="footer-subtext">
                      {tt.stat3Description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Testimonial Quotes Slider */}
              <div className="sp-testimonials-section">
                <div className="sp-testimonials-header">
                  <h2 className="sp-testimonials-heading">
                    {tt.testimonialsHeading}
                  </h2>
                  <div className="sp-slider-nav">
                    <button
                      className="sp-slider-arrow sp-slider-prev"
                      onClick={handlePrev}
                      disabled={currentSlide === 0}
                      aria-label="Previous testimonials"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      className="sp-slider-arrow sp-slider-next"
                      onClick={handleNext}
                      disabled={currentSlide === maxSlide}
                      aria-label="Next testimonials"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="sp-slider-container">
                  <div
                    className="sp-slider-track"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {Array.from({ length: totalSlides }).map((_, slideIdx) => (
                      <div className="sp-slide" key={slideIdx}>
                        {testimonials
                          .slice(slideIdx * slidesPerView, slideIdx * slidesPerView + slidesPerView)
                          .map((testimonial, idx) => {
                            const globalIdx = slideIdx * slidesPerView + idx;
                            return (
                              <div key={globalIdx} className="sp-testimonial-card">
                                <div className="sp-testimonial-divider"></div>
                                <div className="sp-testimonial-number">
                                  {String(globalIdx + 1).padStart(2, "0")}
                                </div>
                                <div className="sp-testimonial-content">
                                  <p className="sp-testimonial-quote">
                                    &ldquo;{testimonial.quote}&rdquo;
                                  </p>
                                  <div className="sp-testimonial-author">
                                    {testimonial.image ? (
                                      <div className="sp-testimonial-avatar">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={testimonial.image}
                                          alt={testimonial.name}
                                          className="sp-testimonial-avatar-img"
                                          loading="lazy"
                                        />
                                      </div>
                                    ) : (
                                      <div className="sp-testimonial-avatar-placeholder">
                                        {testimonial.initials}
                                      </div>
                                    )}
                                    <div className="sp-testimonial-author-info">
                                      <p className="sp-testimonial-name">
                                        {testimonial.linkedin ? (
                                          <a
                                            href={testimonial.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="sp-testimonial-name-link"
                                          >
                                            {testimonial.name}
                                          </a>
                                        ) : (
                                          <span>{testimonial.name}</span>
                                        )}
                                      </p>
                                      <p className="sp-testimonial-role">
                                        {testimonial.role}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sp-slider-dots">
                  {Array.from({ length: totalSlides }).map((_, idx) => (
                    <button
                      key={idx}
                      className={`sp-slider-dot ${currentSlide === idx ? "sp-slider-dot-active" : ""}`}
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-red w-embed"></div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Locale, t } from "@/lib/translations";

export default function FAQ({ locale = "en" }: { locale?: Locale }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const tt = t(locale).faq;

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" className="section-wrapper-copy">
      <div className="div-block-35">
        <div className="padding-global">
          <div className="padding-section-large">
            <div className="container-large">
              <div className="header-wrapper">
                <h2>
                  <strong>{tt.heading}</strong>
                </h2>
              </div>
              <div className="what-outer">
                {tt.items.map((faq, index) => (
                  <div
                    key={index}
                    className="what-i-do w-dropdown"
                    data-delay="0"
                    data-hover="false"
                  >
                    <div
                      className={`question-block${index === 0 ? " top" : ""} w-dropdown-toggle`}
                      onClick={() => toggle(index)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="question-inner">
                        <h4
                          style={{ color: "rgb(0,0,0)" }}
                          className="what-question"
                        >
                          {faq.question}
                        </h4>
                      </div>
                      <img
                        loading="lazy"
                        alt=""
                        src="/images/Icon.svg"
                        className="plus-icon"
                        style={{
                          transform:
                            openIndex === index
                              ? "translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(180deg) skew(0, 0)"
                              : "translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0deg) skew(0, 0)",
                        }}
                      />
                    </div>
                    <nav
                      className="answer-block w-dropdown-list"
                      style={{
                        height: openIndex === index ? "auto" : "0px",
                        overflow: "hidden",
                      }}
                    >
                      <div className="what-answer-block">
                        <p className="body-large text-color-light">
                          {faq.answer}
                        </p>
                      </div>
                    </nav>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

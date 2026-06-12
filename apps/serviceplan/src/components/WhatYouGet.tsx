"use client";

import { useState } from "react";
import { Locale, t } from "@/lib/translations";

const ToggleArrowSvg = () => (
  <svg
    width="55"
    height="55"
    viewBox="0 0 55 55"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M54.5003 27.5C54.5003 42.4116 42.412 54.4999 27.5003 54.5C12.5886 54.5 0.500336 42.4117 0.500337 27.5C0.500338 12.5883 12.5886 0.500001 27.5003 0.500001C42.412 0.500093 54.5003 12.5884 54.5003 27.5Z"
      fill="white"
      stroke="#222222"
    />
    <path
      d="M28.2503 22.7109C28.2503 22.2967 27.9146 21.9609 27.5003 21.9609C27.0861 21.9609 26.7503 22.2967 26.7503 22.7109L27.5003 22.7109L28.2503 22.7109ZM26.97 32.8185C27.2629 33.1114 27.7378 33.1114 28.0307 32.8185L32.8036 28.0456C33.0965 27.7527 33.0965 27.2778 32.8036 26.9849C32.5107 26.692 32.0359 26.692 31.743 26.9849L27.5003 31.2276L23.2577 26.9849C22.9648 26.692 22.4899 26.692 22.197 26.9849C21.9041 27.2778 21.9041 27.7527 22.197 28.0456L26.97 32.8185ZM27.5003 22.7109L26.7503 22.7109L26.7503 32.2882L27.5003 32.2882L28.2503 32.2882L28.2503 22.7109L27.5003 22.7109Z"
      fill="black"
    />
  </svg>
);

export default function WhatYouGet({ locale = "en" }: { locale?: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tt = t(locale).whatYouGet;

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  const titleTags = ["h3", "h4", "h4", "h4", "h4"] as const;
  const extraClasses = ["", "", "", "bottom", "bottom"];

  return (
    <div className="section-what-you-get">
      <div className="padding-global">
        <div className="padding-section-large">
          <div className="container-large">
            <div className="div-block-13">
              <div className="header-wrapper">
                <h2>{tt.heading}</h2>
                <div className="sub-text-heading">
                  {tt.subheading}
                </div>
              </div>
              <div className="grid-container-2x1">
                <div className="elena-wrap-with-text">
                  <img
                    src="/images/hannah-accordian-img.avif"
                    loading="lazy"
                    alt="Hannah AI Marketing Agent accordion section image"
                    className="elena-bg-image"
                  />
                  <div className="glass-wrapper">
                    <div className="text-size-regular text-align-center">
                      {tt.hannahQuote}
                    </div>
                    <div className="text-sm text-align-center" style={{ opacity: 0.7, marginTop: "0.5rem" }}>
                      {tt.hannahQuoteAttribution}
                    </div>
                  </div>
                </div>
                <div className="faq-item-wrap">
                  {tt.accordionItems.map((item, index) => {
                    const isActive = activeIndex === index;
                    const accItemClass = [
                      "acc-item",
                      isActive ? "active" : "",
                      extraClasses[index],
                    ]
                      .filter(Boolean)
                      .join(" ");

                    const TitleTag = titleTags[index];

                    return (
                      <div key={item.title} className={accItemClass}>
                        <div
                          className={`acc-head${isActive ? " active" : ""}`}
                          onClick={() => handleToggle(index)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleToggle(index);
                            }
                          }}
                        >
                          <div className="q-wrapper">
                            <TitleTag className="faq-question">
                              {item.title}
                            </TitleTag>
                          </div>
                          <div
                            className={`toggle-arrow${isActive ? " rotate" : ""} w-embed`}
                          >
                            <ToggleArrowSvg />
                          </div>
                        </div>
                        <div
                          className={`acc-body${isActive ? " active" : ""}`}
                        >
                          <div>
                            <p className="acc-text">{item.text}</p>
                            <div className="div-block-48"></div>
                            <div className="spacer-medium"></div>
                            <div className="faq-grid">
                              <div>
                                <div className="text-size-regular is-gray">
                                  {tt.deliveryLabel}
                                </div>
                                <div className="spacer-small"></div>
                                <div className="text-size-regular text-weight-medium">
                                  {item.delivery}
                                </div>
                              </div>
                              <div>
                                <div className="text-size-regular is-gray">
                                  {tt.costLabel}
                                </div>
                                <div className="spacer-small"></div>
                                <div className="text-size-regular text-weight-medium">
                                  {item.cost}
                                </div>
                              </div>
                              <div>
                                <div className="text-size-regular is-gray">
                                  {tt.outputLabel}
                                </div>
                                <div className="spacer-small"></div>
                                <div className="text-size-regular text-weight-medium">
                                  {item.output}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

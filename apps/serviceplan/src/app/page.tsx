"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustIndicators from "@/components/TrustIndicators";
import HowItWorks from "@/components/HowItWorks";
import WhatYouGet from "@/components/WhatYouGet";
import AgentTeam from "@/components/AgentTeam";
import Sokosumi from "@/components/Sokosumi";
import Companies from "@/components/Companies";
import Pricing from "@/components/Pricing";
import Comparison from "@/components/Comparison";
import FAQ from "@/components/FAQ";
import HouseOfAI from "@/components/HouseOfAI";
import Footer from "@/components/Footer";
import { Locale, t } from "@/lib/translations";

export default function Home({ locale = "en" }: { locale?: Locale }) {
  const [showModal, setShowModal] = useState(false);
  const tt = t(locale).modal;

  useEffect(() => {
    const handler = () => setShowModal(true);
    window.addEventListener("showThankYouModal", handler);
    return () => window.removeEventListener("showThankYouModal", handler);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="page-wrapper">
      <div className="global-styles w-embed"></div>
      <div className="main-wrapper">
        <Navbar locale={locale} />
        <Hero locale={locale}>
          <TrustIndicators locale={locale} />
        </Hero>
        <div className="section-wrapper top-0">
          <div className="bg-white-wrap">
            <WhatYouGet locale={locale} />
            <HowItWorks locale={locale} />
          </div>
        </div>
        <AgentTeam locale={locale} />
        <Sokosumi locale={locale} />
        <div className="spacer-medium hide"></div>
        <Companies locale={locale} />
        <Pricing locale={locale}>
          <Comparison locale={locale} />
        </Pricing>
        <FAQ locale={locale} />
        <HouseOfAI locale={locale} />
        <Footer locale={locale} />
      </div>
      <div className="modal-wrapper" style={{ display: showModal ? "flex" : "none" }}>
        <div className="modal-content">
          <div className="modal">
            <div className="hannah-bg">
              <div className="div-block-56">
                <h2 className="heading-style-h2 is-white modl">{tt.heading}</h2>
                <div className="text-size-medium is-white text-align-center">{tt.subheading}</div>
              </div>
            </div>
            <div className="thankyou-text-wrap">
              <div className="text-size-regular text-weight-light text-align-center">
                {tt.body} <br/><br/>{tt.bodyLine2}
              </div>
            </div>
            <div className="close-icon" onClick={handleCloseModal} style={{ cursor: "pointer" }}>
              <div className="icon w-embed">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.353516 0.353516L12.3535 12.3535" stroke="black" strokeLinejoin="round"/>
                  <path d="M0.353516 12.3535L12.3535 0.353515" stroke="black" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

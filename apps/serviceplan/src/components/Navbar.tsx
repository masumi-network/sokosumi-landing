"use client";

import { useState, useRef, useEffect } from "react";
import { Locale, t } from "@/lib/translations";
import LanguageToggle from "@/components/LanguageToggle";
import SpLogo from "@/components/SpLogo";

import { ROUTES } from "@/lib/routes";

const agents = [
  { name: "Hannah", href: "#hannah", route: "agentHannah", image: "/images/user-image.png" },
  { name: "Elena", href: "#elena", route: "agentElena", image: "/images/elena.png" },
  { name: "Alex", href: "#alex", route: "agentAlex", image: "/images/alex-2.png" },
] as const;

export default function Navbar({
  locale = "en",
  /** Set on pages other than the homepage so #anchors resolve there. */
  homeHref,
  /** "sticky" is the homepage overlay bar; "static" sits in the flow. */
  variant = "sticky",
}: {
  locale?: Locale;
  homeHref?: string;
  variant?: "sticky" | "static";
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tt = t(locale).navbar;
  const home = homeHref ?? (locale === "de" ? "/de" : "/");
  const isHome = homeHref === undefined;
  const anchor = (hash: string) => (isHome ? hash : `${home}${hash}`);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAgentClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!isHome) return;
    e.preventDefault();
    setDropdownOpen(false);
    setMenuOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className={`navbar_component ${variant === "static" ? "jhn" : "up"} w-nav`} data-collapse="medium" role="banner">
      <div className="nabvar-header">
        <a href={home} className="logo_sokosumi w-nav-brand">
          <div className="logo-component">
            <div className="code-embed-4 w-embed">
              <SpLogo />
            </div>
          </div>
        </a>
        <nav role="navigation" className="navbar-menu-content-wrap w-nav-menu" {...(menuOpen ? { "data-nav-menu-open": "" } : {})}>
          <div className="navigation-link-wrap">
            <div className="uui-navbar08_menu-dropdown-2 w-dropdown" ref={dropdownRef}>
              <div
                className="uui-navbar08_dropdown-toggle-2 w-dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ cursor: "pointer" }}
              >
                <div className="uui-dropdown-icon-2 w-embed">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>{tt.agents}</div>
              </div>
              {dropdownOpen && (
                <nav className="uui-navbar08_dropdown-list-2 is-resources w-dropdown-list w--open" style={{ display: "block", backgroundColor: "rgba(10, 10, 10, 0.35)", backdropFilter: "blur(60px)", WebkitBackdropFilter: "blur(60px)", border: "1px solid rgba(16, 16, 16, 0.35)", borderRadius: "0.75rem" }}>
                  <div className="uui-navbar08_dropdown-link-list-2 is-resources">
                    {agents.map((agent) => (
                      <a
                        key={agent.name}
                        href={isHome ? agent.href : ROUTES[agent.route][locale]}
                        className="uui-navbar08_dropdown-link-2 w-inline-block"
                        onClick={(e) => handleAgentClick(e, agent.href)}
                      >
                        <div className="uui-navbar08_item-right-2">
                          <div className="uui-navbar08_text-wrapper-2">
                            <img src={agent.image} loading="lazy" alt="" style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                            <div className="uui-navbar08_item-heading-2">{agent.name}</div>
                            <div className="navbar_heading-arrow w-embed">
                              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </nav>
              )}
            </div>
            <a href={anchor("#pricing")} className="nav-menu is-white w-nav-link">{tt.pricing}</a>
            <a href="mailto:support@serviceplan-agents.com?subject=Reaching%20out%20to%20you%20reading%20Serviceplan-agents.com" className="nav-menu is-white w-nav-link">{tt.contact}</a>
          </div>
          <div className="nav-cta-links">
            <div className="button-group nav-button" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <a href={anchor(tt.freeAnalysisHref)} className="button is-cta-red navigation w-inline-block">
                <div>{tt.freeAnalysis}</div>
              </a>
              <a href={tt.requestDemoHref} className="button navigation w-inline-block">
                <div>{tt.requestDemo}</div>
                <div className="arrow-icon w-embed">
                  <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="45" height="45" rx="22.5" fill="white" />
                    <path d="M17.0161 18.1188L18.0536 17.0813C18.3733 17.0914 18.5094 17.048 18.8047 17.0314C19.5267 16.9908 20.2406 16.9114 20.9611 16.8464L26.0857 16.4123L27.6002 16.286C27.7662 16.2728 28.0385 16.2248 28.1915 16.249C28.3582 16.4057 28.6132 16.6207 28.7365 16.8045C28.7458 16.8185 28.7547 16.8313 28.7597 16.8474C28.7846 16.9296 28.5661 19.1708 28.5422 19.4465L28.0473 25.0788C28.0146 25.4404 28.001 25.8053 27.9667 26.1663C27.9563 26.2755 27.9097 26.8805 27.8789 26.934C27.8625 26.9625 27.8463 26.9905 27.8272 27.0173C27.7388 27.1412 26.9701 27.9043 26.8704 27.9214L26.8542 27.9095C26.9352 27.3589 26.9526 26.7569 27.0122 26.199L27.4765 21.4242C27.4875 21.3002 27.4863 21.1763 27.4967 21.054C27.5797 19.9997 27.6873 18.9475 27.8194 17.8983C27.8246 17.8587 27.817 17.8153 27.7922 17.7832C27.7441 17.8122 27.3648 18.1956 27.3001 18.2601L26.0284 19.5295L20.7127 24.845L18.0323 27.5251L17.2723 28.285C17.1426 28.4149 16.9178 28.6277 16.815 28.7685C16.6139 28.581 16.426 28.3748 16.2312 28.1959C16.5431 27.9104 16.911 27.5218 17.2138 27.219L19.0694 25.3634L24.7142 19.7182L26.4694 17.9621L26.9237 17.504C27.0175 17.4092 27.1511 17.2614 27.2578 17.1923C27.0057 17.1792 26.7842 17.239 26.5372 17.2554C26.1008 17.2845 25.6629 17.3409 25.228 17.3762L19.1671 17.9296L17.9339 18.048C17.7746 18.0645 17.1569 18.1339 17.0161 18.1188Z" fill="black" />
                  </svg>
                </div>
              </a>
            </div>
            <LanguageToggle locale={locale} />
          </div>
        </nav>
        <div className="language-toggle-mobile" style={{ display: "none" }}>
          <LanguageToggle locale={locale} />
        </div>
        <div
          className={`menu-icon-wrap w-nav-button${menuOpen ? " w--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ cursor: "pointer" }}
        >
          <div id="menu-button" className="menu-icon">
            <div className="menu-line-top"></div>
            <div className="menu-line-middle"><div className="menu-inner-line"></div></div>
            <div className="menu-line-bottom"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

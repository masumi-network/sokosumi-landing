"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import motion from "./token-motion.module.css";

export default function ExpertiseMotion({ children }: { children: ReactNode }) {
  const element = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!element.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setEntered(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={element} className={motion.expertise} data-entered={entered}>{children}</div>;
}

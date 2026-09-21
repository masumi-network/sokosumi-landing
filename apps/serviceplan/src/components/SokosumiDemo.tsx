"use client";

import { useEffect, useRef, useState } from "react";

// Overridable so the embed can be pointed at a local sokosumi during
// development; production uses the default.
const ORIGIN = process.env.NEXT_PUBLIC_SOKOSUMI_ORIGIN || "https://www.sokosumi.com";

/**
 * The real Sokosumi interface, framed from sokosumi.com/embed/product-demo.
 *
 * Framed rather than ported: the demo is a Node template plus ~170KB of markup,
 * CSS and JS living in the sokosumi app, and this site's source is mirrored
 * across two repos. Copying it here would put four copies in circulation and
 * guarantee drift. The frame stays current on its own.
 *
 * The embed posts its height because the demo clamps its scale below 700px and
 * stops being 16:9 there; the aspect-ratio in CSS carries it until that lands.
 */
export default function SokosumiDemo({ title }: { title: string }) {
  const [height, setHeight] = useState<number | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== ORIGIN) return;
      if (frame.current && e.source !== frame.current.contentWindow) return;
      const data = e.data as { type?: string; height?: number } | null;
      if (!data || data.type !== "sokosumi:demo-height") return;
      if (typeof data.height !== "number" || !Number.isFinite(data.height)) return;
      setHeight(Math.round(Math.min(2000, Math.max(200, data.height))));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="sp-demo">
      <iframe
        ref={frame}
        className="sp-demo-frame"
        src={`${ORIGIN}/embed/product-demo`}
        title={title}
        loading="lazy"
        style={height ? { height: `${height}px` } : undefined}
      />
    </div>
  );
}

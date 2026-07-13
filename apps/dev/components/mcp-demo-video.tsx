"use client";

import React, { useState, useRef } from "react";
import { withBasePath } from "@/lib/base-path";

interface MCPDemoVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export function MCPDemoVideo({ 
  src: rawSrc, 
  poster, 
  className = "" 
}: MCPDemoVideoProps) {
  const src = withBasePath(rawSrc);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className={`relative w-full my-6 ${className}`} style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ backgroundColor: 'transparent' }}>
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-fd-card z-[2]" style={{ borderRadius: '0.6rem' }}>
            <div className="text-center p-4">
              <p className="text-fd-muted-foreground mb-2">Failed to load video</p>
              <button
                onClick={() => {
                  setHasError(false);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className="px-3 py-1.5 text-sm bg-fd-primary text-fd-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full"
          controls
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          autoPlay
          loop
          muted
          playsInline
          poster={poster ? withBasePath(poster) : undefined}
          onError={(e) => {
            console.error('Video error:', e);
            setHasError(true);
          }}
          onAbort={() => {
            setHasError(true);
          }}
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "#000",
            display: "block",
            borderRadius: "0.6rem",
            boxShadow: "0 5px 18px -2px rgba(0, 0, 0, 0.1), 0 5px 2px -5px rgba(0, 0, 0, 0.04)"
          }}
        >            
        <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default MCPDemoVideo;
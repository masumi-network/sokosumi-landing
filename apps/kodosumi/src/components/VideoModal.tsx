"use client";

import { useState, useEffect } from "react";

export default function VideoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full overflow-hidden rounded-lg group cursor-pointer"
        style={{ paddingBottom: "56.25%" }}
      >
        <img
          src="/images/kodosumi-video-preview.webp"
          alt="Kodosumi Intro - click to play"
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-lg" />
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/70 group-hover:scale-110 transition-all duration-200">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="white"
              className="ml-1"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
        {/* Label */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="text-white/80 text-[13px] font-medium">Watch Introduction</span>
        </div>
      </button>

      {/* Full-page modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-md" />

          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close video"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Video — fills available space */}
          <div
            className="relative w-full h-full max-h-[80vh] z-10"
            style={{ aspectRatio: "16/9", maxWidth: "calc(80vh * 16 / 9)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="absolute inset-0 w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/QDllqb3VonQ?autoplay=1&rel=0&modestbranding=1"
              title="Kodosumi Intro"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";

export default function VideoModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full overflow-hidden border border-black/[0.06] group cursor-pointer"
        style={{ paddingBottom: "56.25%" }}
      >
        <img
          src="/images/kodosumi-video-poster.jpg"
          alt="Kodosumi Intro — click to play"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/80 transition-colors">
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
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Close video"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div
            className="w-full max-w-[960px] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/QDllqb3VonQ?autoplay=1&rel=0&modestbranding=1"
                title="Kodosumi Intro"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

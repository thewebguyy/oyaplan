"use client";

import { useState, useRef, MouseEvent, TouchEvent } from "react";

interface ScrubbablePhotosProps {
  images?: string[];
  venueName: string;
}

export default function ScrubbablePhotos({ images, venueName }: ScrubbablePhotosProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFrame, setActiveFrame] = useState(0);

  const totalFrames = images && images.length > 0 ? images.length : 4;

  const handleScrub = (clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const frameIndex = Math.floor(percentage * totalFrames);
    setActiveFrame(Math.min(totalFrames - 1, frameIndex));
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleScrub(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches && e.touches[0]) {
      handleScrub(e.touches[0].clientX);
    }
  };

  const handleMouseLeave = () => {
    setActiveFrame(0);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleMouseLeave}
      className="relative w-full h-full cursor-ew-resize overflow-hidden select-none bg-black flex items-center justify-center dossier-photo-container"
    >
      {/* Invisible overlay slices */}
      <div className="absolute inset-0 flex pointer-events-none z-30">
        {Array.from({ length: totalFrames }).map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 border-r border-white/10 last:border-0 h-full flex flex-col justify-between p-2 ${
              activeFrame === i ? "bg-white/5" : ""
            }`}
          >
            <span className="text-[8px] font-mono text-white/30 tracking-wider">FR-{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[8px] font-mono text-white/30 tracking-wider text-right">LGS</span>
          </div>
        ))}
      </div>

      {/* Black crushed contact sheet frame */}
      <div className="absolute inset-0 z-10 filter contrast-125 brightness-95 grayscale scale-100 dossier-photo">
        {images && images.length > 0 ? (
          <img 
            src={images[activeFrame]} 
            alt={`${venueName} frame ${activeFrame}`}
            className="w-full h-full object-cover"
            style={{ filter: "contrast(1.3) brightness(0.85) saturate(0.85)" }}
          />
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
            style={{
              background: `repeating-linear-gradient(${activeFrame * 45}deg, #1A1A1A 0px, #1A1A1A 10px, #2A2A2A 10px, #2A2A2A 20px)`
            }}
          >
            <span className="type-caption text-white font-extrabold uppercase tracking-widest text-[10px] select-none block">
              {venueName}
            </span>
            <span className="font-mono text-white/50 text-[8px] tracking-widest block mt-2">
              CONTACT SHEET FRAME {activeFrame + 1}
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1 rounded-[4px] border border-white/10 text-[9px] font-mono text-white/90 z-40 pointer-events-none uppercase tracking-widest">
        Frame {activeFrame + 1} / {totalFrames}
      </div>
    </div>
  );
}

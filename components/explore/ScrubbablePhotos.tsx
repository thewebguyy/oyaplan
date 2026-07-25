"use client";

import { useState, useRef, MouseEvent, TouchEvent } from "react";
import Image from "next/image";

interface ScrubbablePhotosProps {
  images?: string[];
  imageUrl?: string;
  venueName: string;
}

export default function ScrubbablePhotos({ images, imageUrl, venueName }: ScrubbablePhotosProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFrame, setActiveFrame] = useState(0);

  // Resolve image array: prefer explicit images[], fall back to single imageUrl
  const resolvedImages = (images && images.length > 0)
    ? images
    : (imageUrl ? [imageUrl] : []);

  const totalFrames = resolvedImages.length;

  const handleScrub = (clientX: number) => {
    const container = containerRef.current;
    if (!container || totalFrames <= 1) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const frameIndex = Math.floor(percentage * totalFrames);
    setActiveFrame(Math.min(totalFrames - 1, frameIndex));
  };

  const handleMouseMove = (e: MouseEvent) => handleScrub(e.clientX);

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches && e.touches[0]) handleScrub(e.touches[0].clientX);
  };

  const handleMouseLeave = () => setActiveFrame(0);

  // No image at all — show placeholder
  if (totalFrames === 0) {
    return (
      <div className="relative w-full h-full overflow-hidden select-none bg-[#F0EDE8] flex flex-col items-center justify-center gap-2 dossier-photo-container">
        <div className="w-8 h-8 rounded-full bg-[#E5E0D8] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          Photo coming soon
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleMouseLeave}
      className={`relative w-full h-full overflow-hidden select-none bg-black flex items-center justify-center dossier-photo-container ${
        totalFrames > 1 ? "cursor-ew-resize" : ""
      }`}
    >
      {/* Multi-frame scrub overlay — only shown when multiple images exist */}
      {totalFrames > 1 && (
        <div className="absolute inset-0 flex pointer-events-none z-30">
          {Array.from({ length: totalFrames }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 border-r border-white/10 last:border-0 h-full flex flex-col justify-between p-2 ${
                activeFrame === i ? "bg-white/5" : ""
              }`}
            >
              <span className="text-[8px] font-mono text-white/30 tracking-wider">
                FR-{String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[8px] font-mono text-white/30 tracking-wider text-right">LGS</span>
            </div>
          ))}
        </div>
      )}

      {/* Image layer */}
      <div className="absolute inset-0 z-10 dossier-photo">
        <Image
          src={resolvedImages[activeFrame]}
          alt={`${venueName}${totalFrames > 1 ? ` frame ${activeFrame + 1}` : ""}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          style={{ filter: "contrast(1.1) brightness(0.9) saturate(0.9)" }}
        />
      </div>

      {/* Frame counter — only shown when scrubbing multiple images */}
      {totalFrames > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1 rounded-[4px] border border-white/10 text-[9px] font-mono text-white/90 z-40 pointer-events-none uppercase tracking-widest">
          Frame {activeFrame + 1} / {totalFrames}
        </div>
      )}
    </div>
  );
}

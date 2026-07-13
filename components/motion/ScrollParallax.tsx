"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollParallaxProps {
  children: React.ReactNode;
  speed?: number; // Higher number = more movement
  className?: string;
  disabled?: boolean;
}

export default function ScrollParallax({
  children,
  speed = 0.5,
  className,
  disabled = false
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion natively
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (disabled || prefersReduced) return;

    let rafId: number;

    const onScroll = () => {
      rafId = requestAnimationFrame(updatePosition);
    };

    const updatePosition = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Distance from center of viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      // Calculate Y offset
      const yOffset = distanceFromCenter * speed * -0.15;
      
      // Apply transform directly to bypass React render cycle (60fps smooth)
      ref.current.style.transform = `translate3d(0, ${yOffset}px, 0)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updatePosition(); // Init

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed, disabled]);

  return (
    <div
      ref={ref}
      className={cn("will-change-transform ease-linear duration-75", className)}
    >
      {children}
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedIllustrationProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  float?: boolean;
  priority?: boolean;
}

export default function AnimatedIllustration({
  src,
  alt,
  className,
  imageClassName,
  float = true,
  priority = false
}: AnimatedIllustrationProps) {
  const [isVisible, setIsVisible] = useState(priority);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      // Need a tiny delay for priority mounts to ensure initial transition fires
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative group will-change-transform",
        className
      )}
      style={{ perspective: "1000px" }}
    >
      <div 
        className={cn(
          "w-full h-full transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]",
          isVisible 
            ? "opacity-100 translate-y-0 blur-none" 
            : "opacity-0 translate-y-12 blur-[12px]",
          isVisible && float && "motion-safe:animate-hero-breathe"
        )}
      >
        <div className="w-full h-full md:group-hover:rotate-x-1 md:group-hover:-rotate-y-1 md:group-hover:-translate-y-1 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
          <img
            src={src}
            alt={alt}
            className={cn(
              "w-full h-full object-cover rounded-[16px] shadow-lg shadow-black/5",
              imageClassName
            )}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

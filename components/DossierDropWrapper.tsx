"use client";

import { useEffect, useRef, ReactNode } from "react";

interface DossierDropWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function DossierDropWrapper({ children, className = "" }: DossierDropWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Direct window media query check for prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      hasPlayedRef.current = true;
      const cards = container.querySelectorAll(".dossier-card");
      cards.forEach((card) => {
        card.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPlayedRef.current) {
            hasPlayedRef.current = true;
            
            // Query all dossier-card elements nested inside
            const cards = container.querySelectorAll(".dossier-card");
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add("visible");
              }, index * 100); // 100ms stagger
            });
            
            observer.unobserve(container);
          }
        });
      },
      { threshold: 0.1 }
    );

    // If animation already played on this instance, immediately show all cards
    if (hasPlayedRef.current) {
      const cards = container.querySelectorAll(".dossier-card");
      cards.forEach((card) => {
        card.classList.add("visible");
      });
    } else {
      observer.observe(container);
    }

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

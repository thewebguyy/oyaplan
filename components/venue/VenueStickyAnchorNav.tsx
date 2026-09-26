"use client";

import React, { useState, useEffect } from "react";

interface AnchorItem {
  id: string;
  label: string;
}

const ANCHORS: AnchorItem[] = [
  { id: "overview", label: "Overview" },
  { id: "pricing", label: "What It Costs" },
  { id: "scenarios", label: "What You Can Get" },
  { id: "menu", label: "Menu" },
  { id: "good-to-know", label: "Good to Know" },
];

export function VenueStickyAnchorNav() {
  const [activeSection, setActiveSection] = useState<string>("overview");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const anchor of ANCHORS) {
        const element = document.getElementById(anchor.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(anchor.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="sticky top-[56px] z-30 bg-white/95 backdrop-blur-md border-b border-[#EAE4DC] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2.5">
          {ANCHORS.map((anchor) => {
            const isActive = activeSection === anchor.id;
            return (
              <button
                key={anchor.id}
                type="button"
                onClick={() => scrollToSection(anchor.id)}
                className={`relative px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 tap-feedback cursor-pointer ${
                  isActive
                    ? "bg-[#008751] text-white shadow-xs"
                    : "text-text-secondary hover:text-midnight-lagoon hover:bg-surface-grey"
                }`}
              >
                {anchor.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

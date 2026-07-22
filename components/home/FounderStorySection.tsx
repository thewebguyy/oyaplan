"use client";

import RevealOnScroll from "@/components/motion/RevealOnScroll";
import { FounderStoryAnimation } from "./FounderStoryAnimation";
import { Sparkles, ArrowRight, Check } from "lucide-react";

export function FounderStorySection() {
  const handleCtaClick = () => {
    const plannerElement = document.getElementById("planner-widget");
    if (plannerElement) {
      plannerElement.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section 
      className="w-full bg-[#FAFAF8] py-16 sm:py-24 border-t border-[#E5E7EB] text-[#1A1A1A] overflow-hidden" 
      aria-labelledby="founder-story-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        <RevealOnScroll className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Narrative (60% on desktop -> col-span-7) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Section Badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#008751]/10 text-[#008751] border border-[#008751]/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> The Story Behind OyaPlan
              </span>
              <h2 id="founder-story-title" className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A] leading-tight">
                Deciding where to go shouldn&apos;t be harder than actually going out.
              </h2>
            </div>

            {/* Paragraphs */}
            <div className="space-y-4 text-[#6B7280] text-base sm:text-lg leading-relaxed font-medium">
              <p>
                I got tired of spending hours scrolling through Instagram and TikTok just to figure out where to go.
              </p>
              <p>
                I&apos;d finally find a place that looked nice, only to get there and realize it wasn&apos;t what I expected. The food was more expensive than I planned for, transport cost more than I thought, or the vibe just wasn&apos;t right.
              </p>
            </div>

            {/* Emphasis Block with Yellow Accent Border */}
            <div className="border-l-4 border-[#FCC630] pl-4 py-1.5 my-6 bg-white/60 rounded-r-xl border border-y-transparent border-r-transparent">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                That&apos;s when I asked myself:
              </p>
              <p className="text-base sm:text-lg font-bold text-[#1A1A1A] italic leading-snug">
                &ldquo;Why isn&apos;t there an app where I can simply enter my location, budget, and vibe, and instantly get recommendations that actually fit?&rdquo;
              </p>
            </div>

            {/* Solution & Value Props */}
            <div className="space-y-3 pt-2">
              <p className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                That&apos;s why we built <span className="text-[#008751]">OyaPlan</span>.
              </p>

              <ul className="space-y-2 py-1">
                <li className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#1A1A1A]">
                  <span className="w-5 h-5 rounded-full bg-[#008751]/15 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  No endless scrolling
                </li>
                <li className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#1A1A1A]">
                  <span className="w-5 h-5 rounded-full bg-[#008751]/15 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  No guessing
                </li>
                <li className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#1A1A1A]">
                  <span className="w-5 h-5 rounded-full bg-[#008751]/15 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  No budget surprises
                </li>
              </ul>

              <p className="text-base sm:text-lg font-bold text-[#1A1A1A] pt-2">
                Just the right place, at the right price, for the right occasion.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={handleCtaClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-8 bg-[#008751] hover:bg-[#006b41] active:bg-[#005a3d] text-white font-bold text-base uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                aria-label="Start planning now with OyaPlan"
              >
                <span>Start Planning Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Right Column: 3-Frame Looping Animation (40% on desktop -> col-span-5) */}
          <div className="lg:col-span-5 flex items-center justify-center w-full pt-6 lg:pt-0">
            <FounderStoryAnimation />
          </div>

        </RevealOnScroll>
      </div>
    </section>
  );
}

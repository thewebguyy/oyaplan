"use client";

import RevealOnScroll from "@/components/motion/RevealOnScroll";
import { Quote, Sparkles } from "lucide-react";

export default function OriginStorySection() {
  return (
    <section 
      className="py-16 sm:py-24 bg-[#111827] text-white overflow-hidden relative"
      aria-labelledby="origin-story-title"
    >
      {/* Background Decorative Accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#008751]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FCC630]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header Badge */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 text-[#FCC630] border border-[#FCC630]/20">
            <Sparkles className="w-3.5 h-3.5" /> Why OyaPlan Exists
          </span>
        </div>

        {/* Narrative Card Container */}
        <RevealOnScroll className="bg-white/5 border border-white/10 rounded-[28px] p-6 sm:p-10 md:p-12 backdrop-blur-md shadow-2xl relative">
          
          <Quote className="w-12 h-12 text-[#008751]/40 absolute top-6 right-6 sm:top-8 sm:right-10 pointer-events-none select-none" />

          <h2 id="origin-story-title" className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-6 leading-tight">
            I was tired of shuffling between Instagram and TikTok just to find a place to go.
          </h2>

          <div className="space-y-4 text-white/80 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
            <p>
              When I finally found a spot that looked okay, I&apos;d show up and discover the fees and menu prices were <strong className="text-white font-bold underline decoration-[#FCC630] decoration-2 underline-offset-4">twice what I budgeted</strong>. Transport costs caught us off guard, and the squad vibe felt completely off.
            </p>
            <p className="text-white font-medium italic pt-2 border-l-2 border-[#008751] pl-4">
              &ldquo;What if there was an app where I could just input my location, tell it my vibe and my budget, and it would actually give me accurate recommendations that fit?&rdquo;
            </p>
            <p className="pt-2">
              No influencer fantasy menus. No hidden service charges. No transport price shocks. <strong className="text-[#FCC630] font-bold">Just real numbers before you leave home.</strong>
            </p>
          </div>

          {/* Founder Signature / Tagline Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#008751] text-white flex items-center justify-center font-black text-base shadow-inner">
                O
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">Built by Lagos Planners</p>
                <p className="text-xs text-white/60">For Squads Who Want Budget Confidence</p>
              </div>
            </div>

            <div className="text-xs font-bold text-[#FCC630] uppercase tracking-wider bg-[#FCC630]/10 px-3 py-1.5 rounded-full border border-[#FCC630]/20">
              100% Verified Lagos Prices
            </div>
          </div>

        </RevealOnScroll>
      </div>
    </section>
  );
}

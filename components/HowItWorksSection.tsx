"use client";

import RevealOnScroll from "@/components/motion/RevealOnScroll";

export default function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 bg-white border-t border-[#E8E8E8]/50 text-center" aria-labelledby="how-it-works-title">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 id="how-it-works-title" className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">
            How OyaPlan Works
          </h2>
          <p className="text-text-muted mt-2 text-base sm:text-lg max-w-2xl mx-auto">
            Three simple steps to plan your next squad outing with total budget confidence.
          </p>
        </div>

        {/* 3 Step Visual Cards */}
        <RevealOnScroll staggerChildren={true} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-8">
          
          {/* Step 1 */}
          <div className="bg-[#FAFAF8] border border-[#E8E8E8]/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-brand-green/30 hover:shadow-sm transition-all duration-200 group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-black text-lg mb-6 group-hover:scale-105 transition-transform duration-200">
                1
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Pick your budget</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Tell us how much you&apos;re comfortable spending. Specify a total squad spend or per-person limit.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#E8E8E8]/40 text-xs font-semibold text-brand-green uppercase tracking-wider">
              No guesswork
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FAFAF8] border border-[#E8E8E8]/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-brand-green/30 hover:shadow-sm transition-all duration-200 group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FCC630]/15 text-[#D49E00] flex items-center justify-center font-black text-lg mb-6 group-hover:scale-105 transition-transform duration-200">
                2
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Choose your vibe</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Date night. Birthday. Solo. Family. Select your vibe to match with Lagos spots that fit your squad.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#E8E8E8]/40 text-xs font-semibold text-[#D49E00] uppercase tracking-wider">
              Tailored spots
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FAFAF8] border border-[#E8E8E8]/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-brand-green/30 hover:shadow-sm transition-all duration-200 group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-black text-lg mb-6 group-hover:scale-105 transition-transform duration-200">
                3
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Get a verified plan</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Venue. Transport. Taxes. Buffer. Done. We compute everything down to the last naira before you leave home.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#E8E8E8]/40 text-xs font-semibold text-brand-green uppercase tracking-wider">
              100% Transparency
            </div>
          </div>

        </RevealOnScroll>
      </div>
    </section>
  );
}

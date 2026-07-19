"use client";

import RevealOnScroll from "@/components/motion/RevealOnScroll";

export default function TrustSection() {
  return (
    <RevealOnScroll>
      <section className="w-full bg-[#FAFAF8] border border-[#E8E8E8]/80 rounded-[32px] p-8 sm:p-12 shadow-[0px_24px_48px_-12px_rgba(1,5,40,0.03)] text-left">
        {/* Headline */}
        <div className="mb-10 pb-6 border-b border-[#E8E8E8]/40">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#010528] tracking-tight">
            Here&apos;s exactly what you&apos;ll spend
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-2 font-mono uppercase tracking-wider">
            Verified venues. Honest pricing. No hidden surprises.
          </p>
        </div>

        {/* 3 Callouts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Callout 1: Verified Venue Prices */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0 border border-[#10B981]/30">
              <span className="text-[#10B981] font-bold" aria-hidden="true">✓</span>
            </div>
            <div>
              <h3 className="font-bold text-[#010528] text-base font-sans">Verified venue prices</h3>
              <p className="text-[#6B6B6B] text-sm mt-1 leading-relaxed">
                We check actual menus. No markup.
              </p>
            </div>
          </div>

          {/* Callout 2: Real Transport Costs */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0 border border-[#10B981]/30">
              <span className="text-[#10B981] font-bold" aria-hidden="true">✓</span>
            </div>
            <div>
              <h3 className="font-bold text-[#010528] text-base font-sans">Real transport costs</h3>
              <p className="text-[#6B6B6B] text-sm mt-1 leading-relaxed">
                Bolt rates for your squad size.
              </p>
            </div>
          </div>

          {/* Callout 3: All Fees Included */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0 border border-[#10B981]/30">
              <span className="text-[#10B981] font-bold" aria-hidden="true">✓</span>
            </div>
            <div>
              <h3 className="font-bold text-[#010528] text-base font-sans">All fees included</h3>
              <p className="text-[#6B6B6B] text-sm mt-1 leading-relaxed">
                VAT &amp; service baked in. No surprises.
              </p>
            </div>
          </div>
        </div>

        {/* Closing Line */}
        <div className="mt-10 pt-6 border-t border-[#E8E8E8]/40">
          <p className="text-lg font-black text-[#008751] font-sans">
            What you see is what you pay.
          </p>
        </div>
      </section>
    </RevealOnScroll>
  );
}

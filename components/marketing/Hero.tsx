"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-background pt-24 pb-16 md:pt-32 md:pb-24 border-b border-border-default">
      <div className="container mx-auto max-w-7xl px-4 flex flex-col items-center text-center">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green-15 text-brand-green text-sm font-semibold mb-8 animate-slide-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
          </span>
          Live in Lagos
        </div>

        {/* Headline */}
        <h1 className="type-display text-text-primary max-w-4xl mb-6 animate-slide-up animation-delay-80">
          Find where to go. <br className="hidden md:block" />
          <span className="text-text-muted">Know what it costs.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="type-body text-text-secondary text-lg md:text-xl max-w-2xl mb-10 animate-slide-up animation-delay-160">
          Stop debating in group chats and stressing over surprise bills. 
          Tell OyaPlan your budget, group size, and vibe, and get a realistic, verifiable outing plan in seconds.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto animate-slide-up animation-delay-160">
          <Link href="/app" className="w-full sm:w-auto bg-brand-green text-text-on-green hover:bg-brand-green-70 shadow-md font-semibold text-base px-8 h-14 rounded-xl transition-transform hover:scale-[1.02] inline-flex items-center justify-center whitespace-nowrap">Download App</Link>
          <Link href="#how-it-works" className="w-full sm:w-auto border border-border-strong text-text-primary hover:bg-surface-grey font-semibold text-base px-8 h-14 rounded-xl transition-all inline-flex items-center justify-center whitespace-nowrap">See How It Works</Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-text-muted mb-20 animate-slide-up animation-delay-160">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Verified Pricing
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Real Venue Data
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Budget Confidence
          </div>
        </div>

        {/* Premium Phone Mockup */}
        <div className="relative w-full max-w-3xl mx-auto animate-slide-up animation-delay-160">
          {/* Decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-green-15 blur-[120px] rounded-full -z-10"></div>
          
          <div className="relative mx-auto border-[8px] border-surface-grey rounded-[3rem] bg-background shadow-2xl overflow-hidden w-[320px] h-[650px] flex flex-col ring-1 ring-border-default">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
              <div className="w-32 h-6 bg-surface-grey rounded-b-3xl"></div>
            </div>

            {/* Mockup Screen Content (Generated Plan) */}
            <div className="flex-1 overflow-hidden flex flex-col bg-surface-grey pt-12 px-4 pb-6">
              <div className="bg-background rounded-2xl p-5 shadow-sm border border-border-default mb-4 card-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-text-primary">Friday Night Out</h3>
                    <p className="text-sm text-text-secondary">Ikeja • 4 People</p>
                  </div>
                  <div className="bg-brand-green-15 text-brand-green px-2 py-1 rounded text-[10px] font-bold tracking-wider">
                    HIGH CONFIDENCE
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border-default">
                    <div className="text-left">
                      <p className="font-semibold text-text-primary text-sm">Yellow Chilli</p>
                      <p className="text-xs text-text-muted">Dinner & Drinks</p>
                    </div>
                    <p className="font-bold text-text-primary">₦18,000</p>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border-default">
                    <div className="text-left">
                      <p className="font-semibold text-text-primary text-sm">Uber</p>
                      <p className="text-xs text-text-muted">Roundtrip estimate</p>
                    </div>
                    <p className="font-bold text-text-primary">₦7,500</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="font-semibold text-text-primary text-sm">Buffer</p>
                      <p className="text-xs text-text-muted">Just in case</p>
                    </div>
                    <p className="font-bold text-text-primary">₦3,000</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-strong flex justify-between items-center">
                  <span className="font-medium text-text-secondary text-sm">Estimated Total</span>
                  <span className="text-xl font-black text-text-primary">₦28,500</span>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <div className="h-12 flex-1 bg-background rounded-xl border border-border-default flex items-center justify-center font-semibold text-sm text-text-secondary shadow-sm">
                  Share Plan
                </div>
                <div className="h-12 flex-1 bg-brand-green rounded-xl flex items-center justify-center font-semibold text-sm text-text-on-green shadow-sm">
                  Let's Go
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

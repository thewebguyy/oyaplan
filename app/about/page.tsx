import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, ShieldCheck, Compass, ArrowRight, Wallet, Check } from "lucide-react";
import { Metadata } from "next";
import { FounderStoryAnimation } from "@/components/home/FounderStoryAnimation";

export const metadata: Metadata = {
  title: "Why OyaPlan Exists — Budget Confidence for Real-World Outings",
  description: "I got tired of spending hours scrolling through Instagram and TikTok just to figure out where to go. That's why we built OyaPlan.",
};

export default function AboutPage() {
  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon py-12 px-4 sm:px-6 md:px-8 antialiased">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-200">
        
        {/* Back Link */}
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-[#008751] transition-colors py-1 group tap-feedback"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Planning</span>
          </Link>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#008751]/10 text-[#008751] border border-[#008751]/20">
            <Sparkles className="w-3.5 h-3.5" /> The Story Behind OyaPlan
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-midnight-lagoon tracking-tight leading-[1.15]">
            Deciding where to go shouldn&apos;t be harder than actually going out.
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed font-medium">
            Helping Africans confidently plan experiences they can afford.
          </p>
        </div>

        {/* Story Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#EAE4DC] rounded-[28px] p-6 sm:p-10 shadow-xs">
          
          {/* Story Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
              <p>
                I got tired of spending hours scrolling through Instagram and TikTok just to look for a nice hangout spot to visit.
              </p>
              <p>
                I&apos;d finally find a place that looked nice, only to get there and realize it wasn&apos;t what I expected. The food was way above my budget, the cost of transportation was more than I calculated before leaving home, and the vibe? It just wasn&apos;t my style.
              </p>
            </div>

            <div className="border-l-4 border-[#FCC630] pl-4 py-2 bg-[#FAF7F2] rounded-r-xl border-y-transparent border-r-transparent">
              <p className="text-base sm:text-lg font-bold text-midnight-lagoon italic leading-snug">
                &ldquo;That was when I asked myself, &lsquo;Why isn&apos;t there an app where I can just input my location, budget, and vibe, and instantly get recommendations that actually fit?&rsquo;&rdquo;
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-base sm:text-lg font-bold text-midnight-lagoon">
                The answer to this question is the birth of <span className="text-[#008751]">OyaPlan</span>.
              </p>

              <ul className="space-y-2 py-1">
                <li className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-midnight-lagoon">
                  <span className="w-5 h-5 rounded-full bg-[#008751]/15 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  No endless scrolling
                </li>
                <li className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-midnight-lagoon">
                  <span className="w-5 h-5 rounded-full bg-[#008751]/15 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  No guessing
                </li>
                <li className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-midnight-lagoon">
                  <span className="w-5 h-5 rounded-full bg-[#008751]/15 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  No budget surprises
                </li>
              </ul>

              <p className="text-base sm:text-lg font-bold text-midnight-lagoon pt-2">
                Just the right place, at the right price, for the right occasion.
              </p>
            </div>
          </div>

          {/* Story Animation Graphic */}
          <div className="lg:col-span-5 flex items-center justify-center w-full pt-4 lg:pt-0">
            <FounderStoryAnimation />
          </div>

        </div>

        {/* The 3 Pillars of Budget Confidence */}
        <div className="space-y-6">
          <div className="text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-midnight-lagoon tracking-tight">
              The Three Pillars of OyaPlan
            </h2>
            <p className="text-text-secondary text-sm sm:text-base font-medium">
              Engineered specifically for how outings actually work in Lagos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-[#EAE4DC] hover:border-[#008751]/40 rounded-[24px] p-6 space-y-3.5 shadow-xs hover:shadow-sm transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-[#008751]/10 text-[#008751] flex items-center justify-center font-black text-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-midnight-lagoon">100% Audited Menus</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                We audit actual venue menus directly. No estimated guess-pricing, fake averages, or inflated markups.
              </p>
            </div>

            <div className="bg-white border border-[#EAE4DC] hover:border-[#008751]/40 rounded-[24px] p-6 space-y-3.5 shadow-xs hover:shadow-sm transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-[#FCC630]/20 text-[#854D0E] flex items-center justify-center font-black text-xl">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-midnight-lagoon">Distance &amp; Transport</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Calculates real ride-hailing fares based on your starting area, destination, squad size, and peak Lagos traffic.
              </p>
            </div>

            <div className="bg-white border border-[#EAE4DC] hover:border-[#008751]/40 rounded-[24px] p-6 space-y-3.5 shadow-xs hover:shadow-sm transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-midnight-lagoon/10 text-midnight-lagoon flex items-center justify-center font-black text-xl">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-midnight-lagoon">Total Landed Spend</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Accounts for meals, drinks, transport, and mandatory venue charges so everyone in the squad knows their share.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action — Composed with authentic venue background texture */}
        <div className="relative overflow-hidden bg-[#010528] text-white rounded-[28px] p-8 sm:p-12 text-center space-y-6 shadow-sm">
          {/* Subtle real venue texture overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/venues/07_circa_non_pareil_hero.jpg"
              alt="Lagos outing venue"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover opacity-20 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#010528] via-[#010528]/80 to-[#010528]/70" />
          </div>

          <div className="relative z-10 space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Ready to plan your next Lagos linkup?
            </h2>
            <p className="text-white/80 text-sm sm:text-base font-medium">
              Know what you&apos;ll spend before you leave home.
            </p>
          </div>

          <div className="relative z-10 pt-2">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[#008751] hover:bg-[#007043] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs tap-feedback"
            >
              <span>Start Planning Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Wallet, 
  Check, 
  Search, 
  Car, 
  FileText
} from "lucide-react";
import { SapaRealityAnimation } from "@/components/about/SapaRealityAnimation";
import { VerifiedReceiptCard } from "@/components/about/VerifiedReceiptCard";

export default function AboutClient() {
  return (
    <main className="relative min-h-[100dvh] bg-[#F6F6F2] text-[#111111] font-sans selection:bg-[#F9E828] selection:text-[#111111]">
      
      {/* ── 5. CULTURAL TOPOGRAPHY & ADIRE GEOMETRIC WATERMARK ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `
            radial-gradient(#111111 1.5px, transparent 1.5px),
            linear-gradient(to right, #111111 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px, 128px 128px"
        }}
        aria-hidden="true"
      />

      {/* ── 1. THE HERO SECTION: THE HOOK (DARK-TINTED DUSK ATMOSPHERE) ── */}
      <section className="relative w-full bg-[#090D14] text-white overflow-hidden border-b-2 border-[#111111] pt-8 pb-20 sm:pb-24 px-4 sm:px-6 md:px-8">
        
        {/* Real Lagos Venue Dusk Photography Texture */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/venues/07_circa_non_pareil_hero.jpg"
            alt="Lagos dusk nightlife backdrop"
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-25 pointer-events-none filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D14] via-[#090D14]/85 to-[#090D14]/70" />
        </div>

        {/* Vector Headlights & Lekki-Ikoyi Link Bridge Silhouette */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-20 flex justify-end" aria-hidden="true">
          <svg viewBox="0 0 800 180" className="w-full max-w-2xl h-auto text-[#F9E828] stroke-current fill-none stroke-[2]">
            <polygon points="560,15 545,180 575,180" strokeWidth="3" />
            <line x1="560" y1="35" x2="400" y2="180" strokeDasharray="4 4" />
            <line x1="560" y1="60" x2="440" y2="180" strokeDasharray="4 4" />
            <line x1="560" y1="85" x2="480" y2="180" strokeDasharray="4 4" />
            <line x1="560" y1="35" x2="720" y2="180" strokeDasharray="4 4" />
            <line x1="560" y1="60" x2="680" y2="180" strokeDasharray="4 4" />
            <line x1="300" y1="180" x2="780" y2="180" strokeWidth="4" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Back to Planning Navigation */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all tap-feedback"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Planning</span>
            </Link>
          </div>

          {/* Hero Badge & Cultural Hook */}
          <div className="space-y-4 max-w-3xl pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F9E828]/15 border border-[#F9E828]/40 text-[#F9E828] text-xs font-mono font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Lagos Manifesto</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase font-display leading-[1.08]">
              Lagos is stressful enough. Your enjoyment shouldn&apos;t be.
            </h1>

            <p className="text-white/80 text-base sm:text-xl font-medium leading-relaxed max-w-2xl">
              We built OyaPlan to help you hack the soft life, avoid unexpected billing, and confidently plan linkups that actually match your pocket.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. THE FOUNDER'S STORY: SPLIT-SCREEN STORYTELLING (SAPA REALITY CHECK) ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-white border-2 border-[#111111] rounded-3xl p-6 sm:p-10 md:p-12 shadow-[8px_8px_0px_0px_#111111]">
          
          {/* Left Column: Narrative Story & The "Aha" Moment */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-4 text-base sm:text-lg text-[#333333] leading-relaxed font-medium">
              <p>
                I got tired of spending hours scrolling through Instagram and TikTok just to look for a nice hangout spot to visit.
              </p>
              <p className="bg-[#FFFEE5] border-l-4 border-[#111111] p-3.5 rounded-r-xl text-[#111111] font-semibold">
                The menu had surprise &ldquo;Lagos pricing,&rdquo; the Bolt fare from the mainland was ridiculous, and the vibes were completely off.
              </p>
            </div>

            {/* The "Aha" Moment: Massive Danfo Yellow Anchor Block */}
            <div className="bg-[#F9E828] border-2 border-[#111111] p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_0px_#111111] my-4">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#111111]/75 block mb-2">
                THE &ldquo;AHA&rdquo; MOMENT
              </span>
              <blockquote className="text-xl sm:text-2xl lg:text-3xl font-display font-black text-[#111111] leading-tight tracking-tight">
                &ldquo;Why isn&apos;t there an app where I can just input my location, budget, and vibe, and instantly get recommendations that actually fit?&rdquo;
              </blockquote>
              <p className="text-xs sm:text-sm font-mono font-bold text-[#111111] mt-3">
                — That single Friday night question gave birth to OyaPlan.
              </p>
            </div>

            {/* The 3 Core Commitments */}
            <div className="space-y-3 pt-1">
              <p className="text-base sm:text-lg font-black text-[#111111] font-display uppercase tracking-wide">
                No guessing. No drama. Just Lagos clarity:
              </p>

              <ul className="space-y-2.5">
                <li className="flex items-center gap-3 text-sm sm:text-base font-bold text-[#111111]">
                  <span className="w-6 h-6 rounded-lg bg-[#111111] text-[#F9E828] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  No endless scrolling through unpriced reels
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base font-bold text-[#111111]">
                  <span className="w-6 h-6 rounded-lg bg-[#111111] text-[#F9E828] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  No guessing menu prices at the table
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base font-bold text-[#111111]">
                  <span className="w-6 h-6 rounded-lg bg-[#111111] text-[#F9E828] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  No budget surprises when the POS machine arrives
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Sapa Reality Check vs Soft Life Animation */}
          <div className="lg:col-span-5 flex items-center justify-center w-full pt-4 lg:pt-0">
            <SapaRealityAnimation />
          </div>

        </div>
      </section>

      {/* ── 3. THE "RECEIPT" INTERACTIVE ELEMENT ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="bg-[#FFFEE5] border-2 border-[#111111] rounded-3xl p-6 sm:p-10 md:p-12 shadow-[8px_8px_0px_0px_#111111] space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-[#111111] text-[#F9E828]">
              <FileText className="w-3.5 h-3.5" /> Zero Mystery Billing
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#111111] font-display uppercase tracking-tight">
              The Outside Math Guarantee
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] font-medium leading-relaxed">
              Before you leave home, we calculate every item, taxi ride, and mandatory Lagos charge so your squad never experiences awkward table bill-splitting.
            </p>
          </div>

          {/* The Glowing Digital Verified Receipt */}
          <VerifiedReceiptCard />
        </div>
      </section>

      {/* ── 4. THE THREE PILLARS (STREET-SMART SUPERPOWERS) ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 space-y-8">
        <div className="text-left space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-[#008751]/10 text-[#008751] border border-[#008751]/20">
            Street-Smart Superpowers
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#111111] font-display uppercase tracking-tight">
            The Three Pillars of OyaPlan
          </h2>
          <p className="text-xs sm:text-sm text-[#555555] font-medium">
            Engineered specifically for how outings actually work in Lagos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: No Fake P: Verified Menus */}
          <div className="bg-white border-2 border-[#111111] rounded-3xl p-6 space-y-4 shadow-[6px_6px_0px_0px_#111111] hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#008751] text-white border-2 border-[#111111] flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#111111]">
              <Search className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-display font-black text-lg text-[#111111] uppercase tracking-wide">
              No Fake P: Verified Menus
            </h3>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed font-medium">
              We do the ground work. No outdated Instagram menus, no &ldquo;prices are subject to change&rdquo; surprises. Just real, audited prices.
            </p>
          </div>

          {/* Pillar 2: The Traffic Reality Check */}
          <div className="bg-white border-2 border-[#111111] rounded-3xl p-6 space-y-4 shadow-[6px_6px_0px_0px_#111111] hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#F9E828] text-[#111111] border-2 border-[#111111] flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#111111]">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-display font-black text-lg text-[#111111] uppercase tracking-wide">
              The Traffic Reality Check
            </h3>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed font-medium">
              Because going from Yaba to VI isn&apos;t just about distance—it&apos;s about traffic. We calculate real ride-hailing estimates based on your squad size and location.
            </p>
          </div>

          {/* Pillar 3: The Anti-Billing Calculator */}
          <div className="bg-white border-2 border-[#111111] rounded-3xl p-6 space-y-4 shadow-[6px_6px_0px_0px_#111111] hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#F9E828] border-2 border-[#111111] flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#111111]">
              <Wallet className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-display font-black text-lg text-[#111111] uppercase tracking-wide">
              The Anti-Billing Calculator
            </h3>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed font-medium">
              We factor in the hidden taxes, mandatory service charges, and ride fares so you know your exact &ldquo;damage&rdquo; before you even leave your house.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. THE FINAL CTA: ENTER THE SOFT LIFE ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-20 sm:pb-24">
        <div className="relative overflow-hidden bg-[#0A1D13] text-white rounded-3xl border-2 border-[#111111] p-8 sm:p-14 text-center space-y-6 shadow-[8px_8px_0px_0px_#111111]">
          
          {/* Real venue texture overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <Image
              src="/images/venues/02_rsvp_lagos_hero.jpg"
              alt="Lagos outing venue dining"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1D13] via-[#0A1D13]/85 to-[#0A1D13]/70" />
          </div>

          <div className="relative z-10 space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-display uppercase">
              Ready to plan your next Lagos linkup?
            </h2>
            <p className="text-white/80 text-sm sm:text-base font-medium">
              Know what you&apos;ll spend before you leave home.
            </p>
          </div>

          {/* Bold Danfo Yellow Action Button */}
          <div className="relative z-10 pt-2">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center gap-3 h-14 px-10 bg-[#F9E828] hover:bg-[#ffe710] text-[#111111] font-display font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-[#111111] shadow-[5px_5px_0px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#111111] transition-all tap-feedback cursor-pointer"
            >
              <span>Enter the Soft Life 🌴</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

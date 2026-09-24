"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  ChevronDown, 
  Clock, 
  Users, 
  Receipt, 
  Search 
} from "lucide-react";
import { PatternedBorder } from "@/components/business/PatternedBorder";
import { OversizedHeroGraphic } from "@/components/business/OversizedHeroGraphic";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is it really free to list and claim my venue?",
    answer: "Yes, 100% free. We never charge venue owners listing fees, monthly subscription costs, or take a cut of your customer's tab. OyaPlan exists to give Lagos squads budget confidence so they leave home and spend at your venue without hesitation.",
  },
  {
    question: "How do I update our menu prices when they change?",
    answer: "You can update prices, new cocktail items, corkage rules, VAT, or operating hours in under 60 seconds straight from your phone in the business portal. Prefer WhatsApp? Simply forward your updated menu image or PDF to our Lagos operations team and we will update it for you immediately.",
  },
  {
    question: "How does OyaPlan verify that I'm the owner or manager?",
    answer: "We make verification fast and painless for busy hospitality operators. We verify via a confirmation message from your venue's official Instagram account, your business work email, or a quick WhatsApp check with our Lagos venue relations lead.",
  },
  {
    question: "How does OyaPlan estimate what customers will spend?",
    answer: "Our planner calculates spend based on real venue menu items, typical drink and food pairings, group sizes, and mandatory state taxes and service charges. Squads arrive knowing what they will spend, which completely eliminates awkward bill-splitting arguments at checkout.",
  },
  {
    question: "Can we highlight special events like Sunday brunch or guest DJs?",
    answer: "Absolutely. Once verified, you can post operational notices, weekend guest policy updates, minimum bottle spend terms for VIP tables, and flyers directly to your public OyaPlan dossier so planners factor it into their weekend budget.",
  },
];

export function ForBusinessClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon antialiased selection:bg-brand-green/10 selection:text-brand-green overflow-x-clip">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Benefit-Driven, Scale Drop, Bleeding Graphic)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 overflow-x-clip">
        <div className="max-w-5xl mx-auto relative">
          {/* Bleeding Corner Graphic (Cocktail & Vinyl Record) */}
          <OversizedHeroGraphic />

          {/* Left Hero Content */}
          <div className="max-w-2xl space-y-6 relative z-10 text-left">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-[#008751] text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#008751] animate-pulse" />
              <span>For Lagos Restaurants, Lounges & Beach Clubs</span>
            </div>

            {/* Massive Benefit-Driven Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-midnight-lagoon tracking-tight leading-[1.04]">
              More Squads.<br />
              <span className="text-[#008751]">Zero Empty Seats.</span>
            </h1>

            {/* Subhero Social Proof Scale Drop */}
            <p className="text-base sm:text-lg md:text-xl text-text-secondary leading-relaxed font-normal max-w-xl">
              Join Lagos’ top lounges and dining spots reaching thousands of weekend planners natively. Planners decide what they&apos;ll spend before leaving home — make sure they spend it with you.
            </p>

            {/* CTA Cluster */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/business/claim" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-13 px-8 bg-brand-green hover:bg-[#007043] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer tap-feedback hover:scale-[1.02] active:scale-[0.98]">
                  <span>Claim Your Venue — 100% Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/account?next=/business" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-13 px-6 bg-white hover:bg-[#F5F2EB] border border-border-default text-midnight-lagoon text-xs sm:text-sm font-bold uppercase tracking-wider rounded-2xl transition-all shadow-xs tap-feedback flex items-center justify-center">
                  Partner Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. THE "CLAIM IN 3 STEPS" BLOCK (Gamified & Patterned Accent)
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-y border-border-default relative">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Section Header with Patterned Accent */}
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-[#008751] text-[10px] font-black uppercase tracking-wider">
              <span>Onboarding in 3 Minutes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-midnight-lagoon tracking-tight">
              Claim your venue in 3 steps
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              No 10-page forms or waiting around. 3 minutes to put your spot in the group chat before Friday.
            </p>
          </div>

          {/* 3 Gamified Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="rounded-3xl bg-[#FAF7F2] border border-[#EAE4DC] p-7 space-y-4 relative flex flex-col justify-between overflow-hidden shadow-xs hover:border-brand-green/50 transition-all group">
              <PatternedBorder className="absolute top-0 left-0 right-0" />
              <div className="space-y-3 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE4DC] flex items-center justify-center font-black text-lg text-brand-green font-mono shadow-xs group-hover:scale-105 transition-transform">
                  01
                </div>
                <h3 className="text-xl font-bold text-midnight-lagoon">
                  Find Your Spot
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Search our Lagos directory for your lounge, restaurant, or rooftop. If you&apos;re open in Lagos, your spot is probably already here.
                </p>
              </div>
              <div className="pt-4 border-t border-border-default/50">
                <div className="px-3.5 py-2 rounded-xl bg-white border border-border-default text-[11px] font-bold text-text-muted flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-brand-green" />
                  <span className="truncate">e.g. &quot;The House&quot;, &quot;Circa&quot;, &quot;Cactus&quot;...</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl bg-[#FAF7F2] border border-[#EAE4DC] p-7 space-y-4 relative flex flex-col justify-between overflow-hidden shadow-xs hover:border-brand-green/50 transition-all group">
              <PatternedBorder className="absolute top-0 left-0 right-0" />
              <div className="space-y-3 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE4DC] flex items-center justify-center font-black text-lg text-brand-green font-mono shadow-xs group-hover:scale-105 transition-transform">
                  02
                </div>
                <h3 className="text-xl font-bold text-midnight-lagoon">
                  Set Your Real Numbers
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Claim your page and set your real numbers — cocktail prices, platters, corkage, VAT, and service charge. Zero surprises for guests.
                </p>
              </div>
              <div className="pt-4 border-t border-border-default/50">
                <div className="px-3.5 py-2 rounded-xl bg-[#EAFDF3] border border-[#A3F3C6] text-[11px] font-bold text-[#008751] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#008751]" />
                  <span>100% Price Accuracy Verified</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl bg-[#FAF7F2] border border-[#EAE4DC] p-7 space-y-4 relative flex flex-col justify-between overflow-hidden shadow-xs hover:border-brand-green/50 transition-all group">
              <PatternedBorder className="absolute top-0 left-0 right-0" />
              <div className="space-y-3 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE4DC] flex items-center justify-center font-black text-lg text-brand-green font-mono shadow-xs group-hover:scale-105 transition-transform">
                  03
                </div>
                <h3 className="text-xl font-bold text-midnight-lagoon">
                  Host The Squad
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  When squads budget for the weekend, they pick verified spots with clear pricing. They show up ready to spend, tabs paid.
                </p>
              </div>
              <div className="pt-4 border-t border-border-default/50">
                <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                  <span>🥂</span>
                  <span className="truncate">Squad of 6 locked in for Friday 9PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick CTA underneath 3 steps */}
          <div className="text-center pt-4">
            <Link href="/business/claim" className="inline-block">
              <button className="h-12 px-8 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs inline-flex items-center gap-2 transition-all tap-feedback cursor-pointer">
                <span>Start Step 1: Find Your Venue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. THE REALITY (Why Top Lagos Spots Lock In)
      ───────────────────────────────────────────────────────────── */}
      <section id="why-oyaplan" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-[#008751] text-[10px] font-black uppercase tracking-wider">
              <span>The Reality</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-midnight-lagoon tracking-tight">
              People don&apos;t just browse OyaPlan. They pull up.
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Social media gives you saves and DMs. OyaPlan gets tables booked and tabs paid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-white border border-border-default space-y-4 shadow-xs hover:border-brand-green/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-midnight-lagoon">
                The Group Chat Decides Everything
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Before anyone calls a Bolt, the group chat is debating where to go and what it&apos;ll cost. When your prices are verified on OyaPlan, you&apos;re the spot they agree on in seconds.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-white border border-border-default space-y-4 shadow-xs hover:border-brand-green/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center border border-emerald-200">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-midnight-lagoon">
                Zero POS Drama
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Nothing ruins good vibes faster than guests fighting over surprise VAT or hidden service charges when the bill lands. Transparent prices mean people order freely, tip well, and come back.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-white border border-border-default space-y-4 shadow-xs hover:border-brand-green/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-midnight-lagoon">
                Change Prices In 10 Seconds
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Added a new platter? Tweaked a cocktail price? Update it directly from your phone or WhatsApp. No waiting for someone to edit a website or reprint menus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. OYASPOTLIGHT — PREMIUM VISIBILITY TIER ("Chowpass Style")
      ───────────────────────────────────────────────────────────── */}
      <section id="spotlight" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[32px] bg-[#07150E] text-white p-8 sm:p-14 border border-[#008751]/40 overflow-hidden shadow-2xl">
            {/* Patterned Accent on Top Lip */}
            <PatternedBorder className="absolute top-0 left-0 right-0 opacity-80" />

            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#008751]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header Badge & Title */}
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008751]/30 border border-[#A3F3C6]/40 text-[#A3F3C6] text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>OyaSpotlight · Premium Visibility Tier</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Own the Top Pick in Squad Outing Plans
                </h2>

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                  Modeled for Lagos’ premier lounges and dining destinations. When squads ask OyaPlan to build an itinerary with a budget matching your space, Spotlight venues are pinned as the #1 verified recommendation.
                </p>
              </div>

              {/* 4 Spotlight Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-xl bg-[#008751]/40 text-[#A3F3C6] flex items-center justify-center font-bold text-sm">
                    👑
                  </div>
                  <h4 className="font-bold text-sm text-white">Algorithm Top Pick</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Priority placement for squads searching your neighborhood and spend range.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    🎖️
                  </div>
                  <h4 className="font-bold text-sm text-white">Gold Verified Emblem</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Exclusive trust badge that builds instant consensus in the group chat.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                    📊
                  </div>
                  <h4 className="font-bold text-sm text-white">Squad Demand Heatmap</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Live visibility into how many groups are planning outings in your zone this weekend.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    💬
                  </div>
                  <h4 className="font-bold text-sm text-white">WhatsApp Concierge</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Direct line to our Lagos operations team for instant flyer & menu updates.
                  </p>
                </div>
              </div>

              {/* Bottom Spotlight Callout */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Limited to 5 venues per neighborhood
                  </span>
                  <p className="text-xs text-gray-400">
                    Spots are curated to maintain high intent for planners.
                  </p>
                </div>
                <a
                  href="https://wa.me/2348000000000?text=Hi%20OyaPlan%2C%20I%20own%20a%20venue%20in%20Lagos%20and%20want%20to%20learn%20more%20about%20OyaSpotlight%20placement."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-6 bg-white hover:bg-gray-100 text-midnight-lagoon text-xs font-black uppercase tracking-wider rounded-xl inline-flex items-center gap-2 transition-all tap-feedback shrink-0"
                >
                  <span>Inquire About Spotlight</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FRICTIONLESS FAQ BLOCK (Chowdeck Style)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-y border-border-default">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-[#008751] text-[10px] font-black uppercase tracking-wider">
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-midnight-lagoon tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Everything you need to know about getting your venue verified on OyaPlan.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border-default bg-[#FAF7F2] overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer tap-feedback"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-midnight-lagoon">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-brand-green" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border-default/40">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. WHATSAPP CONCIERGE DIRECT ONBOARDING BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-[#FAF7F2] border border-[#EAE4DC] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-xs">
            <PatternedBorder className="absolute top-0 left-0 right-0" />

            <div className="w-14 h-14 rounded-2xl bg-[#EAFDF3] text-brand-green flex items-center justify-center mx-auto border border-[#A3F3C6] shadow-2xs">
              <MessageSquare className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
                Prefer WhatsApp?
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-midnight-lagoon tracking-tight">
                We move the way Lagos moves.
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Skip web forms if you&apos;re busy running floor service. Hit up our Lagos ops team on WhatsApp to claim your spot, send an updated menu PDF, or get verified in under 2 minutes.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/2348000000000?text=Hi%20OyaPlan%2C%20I%20own%20a%20venue%20in%20Lagos%20and%20want%20to%20claim%20my%20listing."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-brand-green hover:bg-[#007043] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all tap-feedback shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Lagos Ops on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 sm:px-6 bg-white border-t border-border-default text-center space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-text-secondary">
          <Link href="/for-business" className="hover:text-brand-green transition-colors">
            For Business
          </Link>
          <Link href="/business/claim" className="hover:text-brand-green transition-colors">
            Claim Venue
          </Link>
          <a
            href="https://wa.me/2348000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-green transition-colors"
          >
            WhatsApp Support
          </a>
          <Link href="/" className="hover:text-brand-green transition-colors">
            Outing Planner
          </Link>
          <Link href="/terms" className="hover:text-brand-green transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-brand-green transition-colors">
            Privacy
          </Link>
        </div>
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} OyaPlan for Business · Lagos, Nigeria · Built for the venues that power Lagos nightlife and dining.
        </p>
      </footer>
    </div>
  );
}

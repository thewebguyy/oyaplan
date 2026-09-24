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
  Search,
  ShieldCheck 
} from "lucide-react";
import { PatternedBorder } from "@/components/business/PatternedBorder";
import { OversizedHeroGraphic } from "@/components/business/OversizedHeroGraphic";
import { getBusinessWhatsAppUrl } from "@/lib/config/businessWhatsApp";

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
            {/* Clean Editorial Eyebrow */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white border border-[#EAE4DC] text-xs shadow-2xs">
              <span className="font-bold text-midnight-lagoon text-[11px] tracking-tight">OyaPlan for Business</span>
              <span className="text-gray-300">/</span>
              <span className="text-[11px] text-text-muted">For restaurants, lounges & beach clubs</span>
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
              Social media gives you saves and DMs. OyaPlan gets squads planned and out the door.
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
          <div className="relative rounded-3xl bg-[#0B1E14] text-white p-8 sm:p-12 border border-[#1B3828] overflow-hidden shadow-xl">
            {/* Patterned Accent on Top Lip */}
            <PatternedBorder className="absolute top-0 left-0 right-0 opacity-40" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 pt-2">
              {/* Left Column: Editorial Value Proposition */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Partner · Trust Marker</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Be the spot the group chat agrees on.
                </h2>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                  When squads build outing plans with a budget matching your space, verified venues earn trust instantly. Real intent from ready-to-spend groups.
                </p>

                <ul className="space-y-3 pt-1">
                  <li className="flex items-start gap-3 text-xs sm:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <span><strong className="text-white font-semibold">100% price transparency</strong> — Verified menu items and tax calculations so squads never face bill shock.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs sm:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <span><strong className="text-white font-semibold">Verified Partner badge</strong> — Distinct trust marker that speeds up group consensus.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs sm:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <span><strong className="text-white font-semibold">Weekend demand signals</strong> — Track how many squads are actively planning outings around your business.</span>
                  </li>
                </ul>

                <div className="pt-2 flex items-center gap-4">
                  <Link
                    href="/business/claim"
                    className="h-11 px-6 bg-white hover:bg-gray-100 text-midnight-lagoon text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all tap-feedback cursor-pointer shadow-sm"
                  >
                    <span>Claim Your Venue Listing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Tangible UI Specimen Card */}
              <div className="lg:col-span-5">
                <div className="bg-[#142B1F] border border-[#234B35] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg text-left">
                  {/* Top Specimen Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" />
                      Verified Match
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400">Squad of 6</span>
                  </div>

                  {/* Venue Specimen Header */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">The House</h3>
                      <span className="text-[10px] font-semibold bg-[#EAFDF3] text-[#0A7C3F] px-1.5 py-0.5 rounded">Verified</span>
                    </div>
                    <p className="text-xs text-gray-400">Victoria Island · Lounge & Dining</p>
                  </div>

                  {/* Spend Breakdown Box */}
                  <div className="p-3 bg-[#0B1A12] rounded-xl border border-[#1B3828] space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between text-gray-400">
                      <span>Estimated Spend</span>
                      <span className="text-white font-bold font-sans">~₦22,000 / person</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-[10px]">
                      <span>Cocktails + Small Chops</span>
                      <span>VAT & Service Included</span>
                    </div>
                  </div>

                  {/* Consensus Signal */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-gray-300 border-t border-white/5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Group chat consensus</span>
                    </span>
                    <span className="font-bold text-emerald-400">6 of 6 voted Yes</span>
                  </div>
                </div>
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
              {(() => {
                const waUrl = getBusinessWhatsAppUrl('claim_support');
                if (waUrl) {
                  return (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-brand-green hover:bg-[#007043] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all tap-feedback shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message OyaPlan on WhatsApp</span>
                    </a>
                  );
                }
                return (
                  <Link
                    href="/business/claim"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-brand-green hover:bg-[#007043] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all tap-feedback shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Claim Your Listing Online</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                );
              })()}
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
          {(() => {
            const waUrl = getBusinessWhatsAppUrl('general_support');
            if (!waUrl) return null;
            return (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-green transition-colors"
              >
                WhatsApp Support
              </a>
            );
          })()}
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
          © {new Date().getFullYear()} OyaPlan · Find where to go. Know what it&apos;ll cost. · Lagos, Nigeria
        </p>
      </footer>
    </div>
  );
}

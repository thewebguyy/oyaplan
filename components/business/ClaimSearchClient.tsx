'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Spot } from '@/lib/types';
import Link from 'next/link';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';
import { searchVenuesForClaimAction, ClaimSearchVenueResult } from '@/lib/actions/venueClaimActions';
import {
  Search,
  Building2,
  ArrowRight,
  MessageSquare,
  Link2,
  ShieldCheck,
  Clock,
  Loader2,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  Check,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';

export interface VenueSearchItem {
  id: string;
  slug?: string;
  name: string;
  category?: string;
  address?: string;
  partner_state?: string;
  district_name?: string;
  cover_url?: string;
  logo_url?: string;
  gallery_urls?: string[];
  derived_typical_cost?: number | null;
  vat_pct?: number | null;
  service_charge_pct?: number | null;
}

interface ClaimSearchClientProps {
  initialVenues?: VenueSearchItem[];
  initialSpots?: Spot[];
}

export function ClaimSearchClient({ initialVenues, initialSpots }: ClaimSearchClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [liveResults, setLiveResults] = useState<ClaimSearchVenueResult[] | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Unify venues or spots into standardized initial list
  const allVenues: VenueSearchItem[] = useMemo(() => {
    if (initialVenues && initialVenues.length > 0) {
      return initialVenues;
    }
    if (initialSpots && initialSpots.length > 0) {
      return initialSpots.map((s: Spot) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        address: s.address,
        district_name: s.areas?.name,
        partner_state: 'unclaimed',
        cover_url: s.cover_url || s.image_url,
        derived_typical_cost: s.price_per_person || (s as unknown as Record<string, number | null | undefined>).derived_typical_cost || null,
      }));
    }
    return [];
  }, [initialVenues, initialSpots]);

  // Real-time server query against venues table
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchVenuesForClaimAction(trimmed);
        setLiveResults(results);
      } catch (err) {
        console.error('Error during real-time venue search:', err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Combined results
  const displayVenues = useMemo(() => {
    if (!searchQuery.trim()) {
      return allVenues.slice(0, 16);
    }

    if (liveResults !== null) {
      return liveResults;
    }

    const q = searchQuery.toLowerCase().trim();
    return allVenues
      .filter((v: VenueSearchItem) => {
        const matchName = v.name.toLowerCase().includes(q);
        const matchArea =
          v.address?.toLowerCase().includes(q) ||
          v.district_name?.toLowerCase().includes(q);
        const matchCat = v.category?.toLowerCase().includes(q);
        return matchName || matchArea || matchCat;
      })
      .slice(0, 30);
  }, [searchQuery, liveResults, allVenues]);

  const addVenueWaUrl = getBusinessWhatsAppUrl('add_venue', { query: searchQuery.trim() });
  const generalClaimWaUrl = getBusinessWhatsAppUrl('claim_support');

  return (
    <div className="space-y-16 sm:space-y-20 max-w-6xl mx-auto font-sans text-[#F5F1E8]">
      
      {/* ── SECTION 01: HERO SECTION (50/50 DYNAMIC SPLIT: THE CONTROL CENTER) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
        
        {/* Left Side: Headline, Copy & Premium Floating Search */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E59A28]/15 border border-[#E59A28]/35 text-[#E59A28] text-xs font-sans font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#E59A28] animate-pulse" />
            <span>OYAPLAN VENUE LEDGER · LIVE MENUS AUDITED</span>
          </div>

          {/* Punchy Modern Headline (No Serif Clash) */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Control your <span className="text-[#E59A28]">Outside Math</span>.
            </h1>
            <p className="text-base sm:text-lg text-[#A0978C] leading-relaxed max-w-xl font-normal">
              Lagosians use OyaPlan to calculate what an outing at your venue costs—including food, drinks, 7.5% VAT, 10% service, and rides. Claim your spot to inspect your live Till Slip, update your prices, and earn the Vetted Venue badge.
            </p>
          </div>

          {/* Premium Floating Search Bar */}
          <div className="pt-2 space-y-3">
            <div className="bg-[#1E1B18]/95 backdrop-blur-md border border-[#2D2823] rounded-2xl p-2 shadow-2xl focus-within:border-[#E59A28] focus-within:ring-2 focus-within:ring-[#E59A28]/20 transition-all">
              <div className="flex flex-col sm:flex-row gap-2 relative">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-[#A0978C] pointer-events-none" />
                  <input
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      if (!val.trim()) {
                        setLiveResults(null);
                        setIsSearching(false);
                      }
                    }}
                    className="w-full h-13 pl-12 pr-10 bg-transparent text-sm sm:text-base font-medium text-white placeholder:text-[#A0978C] focus:outline-none"
                  />
                  {isSearching && (
                    <Loader2 className="w-4 h-4 text-[#E59A28] animate-spin absolute right-3" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {}}
                  className="h-12 px-6 bg-[#E59A28] hover:bg-[#D48B1B] text-[#141210] font-sans font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg tap-feedback"
                >
                  <span>Inspect Till Slip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Subtle WhatsApp Secondary Text Link (Replaced clunky competing box) */}
            <div className="flex items-center gap-2 text-xs text-[#A0978C] px-1 font-medium">
              <Link2 className="w-3.5 h-3.5 text-[#E59A28]/80 shrink-0" />
              <span>Have a direct audit link from our team?</span>
              {generalClaimWaUrl && (
                <a
                  href={generalClaimWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E59A28] hover:text-[#F3B353] font-bold transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Verify via WhatsApp Desk</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: High-Fidelity 3D Tilted Phone Mockup (Visual Proof) */}
        <div className="lg:col-span-5 flex justify-center relative">
          
          {/* Ambient Glow */}
          <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-tr from-[#E59A28]/25 via-amber-600/10 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

          {/* 3D Tilted Phone Shell */}
          <div className="relative w-full max-w-[340px] sm:max-w-[360px] transform lg:rotate-[-2deg] lg:hover:rotate-0 transition-transform duration-500">
            <div className="bg-[#0E0C0A] border-[5px] border-[#2D2823] rounded-[42px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(229,154,40,0.15)] ring-1 ring-white/10">
              
              {/* Dynamic Island / Speaker */}
              <div className="w-24 h-4 bg-[#1E1B18] rounded-full mx-auto mb-3 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#141210]" />
                <span className="w-2 h-1.5 rounded-full bg-[#2D2823]" />
              </div>

              {/* In-App Screen */}
              <div className="space-y-3 bg-[#141210] rounded-[30px] p-4 text-[#F5F1E8] border border-white/5">
                
                {/* Header inside phone */}
                <div className="flex items-center justify-between text-[11px] text-[#A0978C] border-b border-[#2D2823] pb-2 font-mono">
                  <span>8:45 PM · LAGOS</span>
                  <span className="text-[#12A165] font-bold">● LIVE PLANNER</span>
                </div>

                {/* Venue Identity */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-black text-lg text-white tracking-tight">Circa Lagos</h3>
                    <span className="inline-flex items-center gap-1 text-[9px] font-sans font-bold text-[#12A165] bg-[#12A165]/15 border border-[#12A165]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      <span>VETTED</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A0978C]">Admiralty Way, Lekki Phase 1</p>
                </div>

                {/* ── THE VERIFIED TILL SLIP (WARM IVORY RECEIPT) ── */}
                <div className="bg-[#F7F4EC] text-[#141210] rounded-2xl p-4 font-mono text-xs border border-[#141210]/15 shadow-inner space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-[#141210]/20 text-[10px]">
                    <span className="font-bold text-[#E59A28] uppercase">TILL SLIP #LAG-2026</span>
                    <Receipt className="w-3.5 h-3.5 text-[#141210]/40" />
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#141210]/70">Dining &amp; Drinks (2x):</span>
                      <span className="font-bold">₦38,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#141210]/70">7.5% VAT (Audited):</span>
                      <span className="font-bold text-[#12A165]">₦2,850</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#141210]/70">10% Service (Locked):</span>
                      <span className="font-bold text-[#12A165]">₦3,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#141210]/70">Lekki Ride (Return Est.):</span>
                      <span className="font-bold">₦5,000</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t-2 border-dashed border-[#141210]/25 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-[#141210]/60 block font-sans font-bold">Total Outside Math</span>
                      <span className="font-sans font-black text-sm text-[#141210]">~₦24,825 <span className="text-[10px] font-normal text-[#141210]/70">/ head</span></span>
                    </div>
                    <span className="text-xs font-black text-[#141210]">₦49,650</span>
                  </div>

                  <div className="mt-1 pt-1.5 text-[9px] text-[#12A165] font-bold flex items-center justify-center gap-1 bg-[#12A165]/10 rounded-lg py-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ZERO TABLE SHOCK · VERIFIED BY MANAGEMENT</span>
                  </div>
                </div>

                {/* Intent Signal */}
                <div className="flex items-center justify-between text-[10px] text-[#A0978C] pt-1 font-sans">
                  <span className="flex items-center gap-1 text-[#E59A28] font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    <span>86 Lagos squads planning here</span>
                  </span>
                  <span className="text-white/40">OyaPlan Live</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* ── SECTION 02: SOCIAL PROOF BAR (IMMEDIATE TRUST) ── */}
      <section className="py-5 border-y border-[#2D2823] bg-[#181614]/70 rounded-3xl px-5 sm:px-8 shadow-inner">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#E59A28]" />
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#A0978C] uppercase">
              AUDITED &amp; VETTED TILL SLIPS ACROSS LAGOS
            </span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end text-xs font-sans">
            {[
              { name: 'Circa Lagos', area: 'Lekki Phase 1' },
              { name: 'Cactus Restaurant', area: 'Victoria Island' },
              { name: 'Lekki Grill', area: 'Lekki' },
              { name: 'Danfo Bistro', area: 'Ikoyi' },
              { name: 'W/Bar Lounge', area: 'Ikoyi' },
              { name: 'Brass & Copper', area: 'Lekki' },
              { name: 'Slow Lagos', area: 'VI' },
            ].map((v) => (
              <span
                key={v.name}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1E1B18] border border-[#2D2823] text-[#F5F1E8] hover:border-[#E59A28]/50 transition-colors"
              >
                <span className="font-semibold text-white">{v.name}</span>
                <span className="text-[10px] text-[#A0978C]">· {v.area}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 03: THE PROBLEM/SOLUTION MATRIX (VISUALIZING THE GUESSWORK) ── */}
      <section className="space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E85C33]/15 border border-[#E85C33]/30 text-[#E85C33] text-[11px] font-sans font-bold uppercase tracking-wider">
            <span>THE GUESSWORK TAX</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            What happens when squads have to guess your prices?
          </h2>
          <p className="text-sm text-[#A0978C] max-w-2xl leading-relaxed">
            Unverified menus don&apos;t just confuse planners—they divert real revenue away from your tables. Here is the difference between rumor and a verified Till Slip:
          </p>
        </div>

        {/* 3-Part Component-Driven Visual Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Group chats guess high */}
          <div className="bg-[#1E1B18] border border-red-500/20 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  <span>LOST SQUAD TO RUMOR</span>
                </span>
              </div>
              <h3 className="font-bold text-base text-white">Group chats guess high</h3>
              
              {/* Mockup Chat Bubble */}
              <div className="bg-[#141210] p-3.5 rounded-2xl border border-white/5 space-y-2 text-xs">
                <div className="bg-[#2D2823] text-white p-2.5 rounded-xl rounded-tl-sm max-w-[85%]">
                  <p className="text-[11px] leading-snug">Who&apos;s picking the spot for Friday dinner?</p>
                </div>
                <div className="bg-[#2D2823] text-white p-2.5 rounded-xl rounded-tl-sm max-w-[85%]">
                  <p className="text-[11px] leading-snug">What about that spot? Saw their food on IG</p>
                </div>
                <div className="bg-red-950/60 text-red-200 border border-red-500/30 p-2.5 rounded-xl rounded-tr-sm ml-auto max-w-[90%] text-right">
                  <p className="text-[11px] leading-snug font-semibold">&quot;Nah, that place is like 50k minimum per head o. Don&apos;t let them bill us. Let&apos;s go elsewhere.&quot;</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#A0978C] leading-relaxed pt-2 border-t border-[#2D2823]">
              Squads overestimate your bill by 40% and reroute to a competitor with predictable pricing.
            </p>
          </div>

          {/* Card 2: Table shock when bill drops */}
          <div className="bg-[#1E1B18] border border-amber-500/20 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>TABLE SHOCK AT 11 PM</span>
                </span>
              </div>
              <h3 className="font-bold text-base text-white">Surprise taxes &amp; disputes</h3>
              
              {/* Mockup Crumpled Bill Receipt */}
              <div className="bg-[#141210] p-3.5 rounded-2xl border border-white/5 space-y-1.5 font-mono text-[11px] text-[#A0978C]">
                <div className="flex justify-between text-white font-bold pb-1 border-b border-[#2D2823]">
                  <span>Food Subtotal</span>
                  <span>₦32,000</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>+ 7.5% Unexpected VAT</span>
                  <span>+₦2,400</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>+ 10% Service Charge</span>
                  <span>+₦3,200</span>
                </div>
                <div className="mt-2 p-2 rounded-lg bg-amber-500/10 text-amber-300 font-sans text-[10px] leading-tight">
                  ⚠️ Waiter wastes 20 minutes explaining 17.5% house tax. Patrons leave frustrated instead of tipping.
                </div>
              </div>
            </div>

            <p className="text-xs text-[#A0978C] leading-relaxed pt-2 border-t border-[#2D2823]">
              Uncommunicated house fees create awkward payment standoffs and damage repeat visits.
            </p>
          </div>

          {/* Card 3: The OyaPlan Solution */}
          <div className="bg-[#1E1B18] border border-[#12A165]/35 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden ring-1 ring-[#12A165]/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#12A165] bg-[#12A165]/15 border border-[#12A165]/30 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>100% OUTSIDE MATH PARITY</span>
                </span>
              </div>
              <h3 className="font-bold text-base text-white">The Verified OyaPlan Till Slip</h3>
              
              {/* Mockup Clean OyaPlan Card */}
              <div className="bg-[#141210] p-3.5 rounded-2xl border border-[#12A165]/20 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2D2823]">
                  <span className="font-bold text-white text-xs">Pre-Agreed Pocket Match</span>
                  <span className="text-[10px] font-bold text-[#12A165]">₦24,800 / head</span>
                </div>
                <div className="space-y-1 text-[11px] text-[#A0978C]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Every tax &amp; service charge locked</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Rides factored in before leaving home</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>1-Tap menu updates via WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#A0978C] leading-relaxed pt-2 border-t border-[#2D2823]">
              Squads arrive knowing exactly what they will spend. Zero table shock, faster turns, and higher average ticket sizes.
            </p>
          </div>

        </div>
      </section>

      {/* ── SECTION 04: LIVE VENUE TILL SLIPS IN LAGOS (Interactive Grid) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#A0978C] px-1 font-sans">
          <span className="font-bold uppercase tracking-wider text-[11px]">
            {searchQuery.trim() ? `Search Results (${displayVenues.length})` : 'HOW LAGOS SPOTS APPEAR IN THE PLANNER TODAY'}
          </span>
          {isSearching && (
            <span className="text-[10px] font-bold text-[#E59A28] flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Searching live ledger database...</span>
            </span>
          )}
        </div>

        {displayVenues.length === 0 ? (
          <div className="bg-[#1E1B18] rounded-3xl border border-[#2D2823] p-8 sm:p-10 text-center space-y-4 shadow-xl">
            <Building2 className="w-10 h-10 text-[#A0978C] mx-auto stroke-[1.5]" />
            <h3 className="font-black text-lg text-white">Can&apos;t find your venue in the ledger?</h3>
            <p className="text-xs sm:text-sm text-[#A0978C] max-w-md mx-auto leading-relaxed">
              We may not have indexed your menu prices yet. Send a photo of your physical menu to our WhatsApp Audit Desk and we will set up your live Till Slip within 24 hours.
            </p>
            {addVenueWaUrl ? (
              <a
                href={addVenueWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 bg-[#E59A28] hover:bg-[#D48B1B] text-[#141210] font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer tap-feedback shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Menu to WhatsApp Audit Desk</span>
              </a>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayVenues.map((venue: VenueSearchItem) => {
              const isVerified = venue.partner_state === 'verified_partner';
              const isPending = venue.partner_state === 'verification_pending';
              const typicalCost = venue.derived_typical_cost || 14000;
              const perHead = Math.round(typicalCost);
              const dateNightTotal = perHead * 2;

              return (
                <Link
                  key={venue.id}
                  href={`/venue/${venue.id}/claim`}
                  className="group bg-[#F7F4EC] text-[#141210] hover:bg-[#FAF7F2] border-2 border-[#2D2823] rounded-3xl p-5 shadow-xl transition-all tap-feedback flex flex-col justify-between font-mono relative overflow-hidden"
                >
                  {/* Decorative dashed tear line top */}
                  <div className="pb-3 border-b-2 border-dashed border-[#141210]/20 flex items-center justify-between">
                    <div>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#12A165] uppercase tracking-wider font-sans">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>✓ OYAPLAN VETTED VENUE · AUDITED</span>
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider font-sans">
                          <Clock className="w-3.5 h-3.5" />
                          <span>REVIEW PENDING</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E85C33] uppercase tracking-wider font-sans">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>⚠️ ESTIMATED MENU DATA · UNCLAIMED</span>
                        </span>
                      )}
                    </div>
                    <Receipt className="w-4 h-4 text-[#141210]/40 shrink-0" />
                  </div>

                  {/* Body Content */}
                  <div className="py-3 space-y-2">
                    <h2 className="font-sans font-black text-lg text-[#141210] group-hover:text-[#E59A28] transition-colors truncate">
                      {venue.name}
                    </h2>
                    <p className="text-xs text-[#141210]/60 truncate font-sans">
                      {venue.address || venue.district_name || 'Lagos, Nigeria'}
                    </p>

                    {/* Till Slip Outing Math Lines */}
                    <div className="bg-[#141210]/5 p-3 rounded-2xl space-y-1 text-xs text-[#141210]/80 border border-[#141210]/10">
                      <div className="flex justify-between">
                        <span>Dining &amp; Drinks (2x):</span>
                        <span className="font-bold">~₦{dateNightTotal.toLocaleString('en-NG')}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>VAT &amp; Service:</span>
                        <span className={`font-bold ${isVerified ? 'text-[#12A165]' : 'text-[#E85C33]'}`}>
                          {isVerified ? 'Audited & Locked' : 'Unverified'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[#141210]/10 font-bold text-[#141210]">
                        <span>Est. Per Person:</span>
                        <span>~₦{perHead.toLocaleString('en-NG')} / head</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer Button */}
                  <div className="pt-2 border-t-2 border-dashed border-[#141210]/20 flex items-center justify-between text-xs font-bold">
                    <span className="text-[11px] text-[#141210]/60 font-sans">
                      {isVerified ? 'Updated by Management' : 'Run this spot?'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#141210] group-hover:translate-x-0.5 transition-transform bg-[#141210]/10 px-3 py-1.5 rounded-xl font-sans">
                      <span>{isVerified ? 'Inspect Ledger' : 'Verify Real Prices'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SECTION 05: ONBOARDING CTA (THE 24-HOUR PLUG IN SECTION) ── */}
      <section className="bg-gradient-to-b from-[#1E1B18] via-[#1A1613] to-[#141210] rounded-3xl border border-[#2D2823] p-8 sm:p-12 relative overflow-hidden shadow-2xl space-y-8">
        
        {/* Ambient Gradient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E59A28]/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="space-y-3 text-center sm:text-left max-w-2xl">
          <span className="text-[10px] font-sans font-bold text-[#E59A28] uppercase tracking-widest block">
            PLUG YOUR SPOT INTO THE PLANNER
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Claim your Till Slip in 24 Hours.
          </h2>
          <p className="text-sm text-[#A0978C] leading-relaxed">
            Don&apos;t type out 50 menu items by hand. Send a photo or PDF of your current menu and house rules to our Menu Audit Desk—we&apos;ll audit your Outside Math and verify your spot for free.
          </p>
        </div>

        {/* 3-Step Visual Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
          
          <div className="bg-[#141210]/90 border border-[#2D2823] p-5 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#E59A28]/15 border border-[#E59A28]/30 flex items-center justify-center text-[#E59A28]">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#E59A28] uppercase tracking-wider block">STEP 01</span>
            <h4 className="font-bold text-sm text-white">Snap Physical Menu</h4>
            <p className="text-xs text-[#A0978C] leading-relaxed">
              Take photos or send your current PDF menu, drinks list, and house rules.
            </p>
          </div>

          <div className="bg-[#141210]/90 border border-[#2D2823] p-5 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#12A165]/15 border border-[#12A165]/30 flex items-center justify-center text-[#12A165]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#12A165] uppercase tracking-wider block">STEP 02</span>
            <h4 className="font-bold text-sm text-white">Send to WhatsApp Desk</h4>
            <p className="text-xs text-[#A0978C] leading-relaxed">
              Drop it directly into our WhatsApp desk—no tedious portal logins or data entry.
            </p>
          </div>

          <div className="bg-[#141210]/90 border border-[#2D2823] p-5 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#E59A28]/15 border border-[#E59A28]/30 flex items-center justify-center text-[#E59A28]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#E59A28] uppercase tracking-wider block">STEP 03</span>
            <h4 className="font-bold text-sm text-white">Go Live Vetted</h4>
            <p className="text-xs text-[#A0978C] leading-relaxed">
              We audit the Outside Math, publish your Till Slip, and activate your badge.
            </p>
          </div>

        </div>

        {/* Action Button & Trust Signals */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-6">
          {generalClaimWaUrl && (
            <a
              href={generalClaimWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto h-14 px-8 bg-[#E59A28] hover:bg-[#D48B1B] text-[#141210] font-sans font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer tap-feedback shadow-xl shadow-amber-950/40"
            >
              <MessageSquare className="w-4 h-4 text-[#141210]" />
              <span>Send Menu to Audit Desk on WhatsApp →</span>
            </a>
          )}

          <div className="flex items-center gap-4 text-xs text-[#A0978C] flex-wrap justify-center sm:justify-end">
            <span className="flex items-center gap-1.5 text-white/80">
              <Check className="w-3.5 h-3.5 text-[#12A165]" />
              <span>100% Free for Lagos Venues</span>
            </span>
            <span className="flex items-center gap-1.5 text-white/80">
              <Check className="w-3.5 h-3.5 text-[#12A165]" />
              <span>No Monthly Software Fee</span>
            </span>
            <span className="flex items-center gap-1.5 text-white/80">
              <Check className="w-3.5 h-3.5 text-[#12A165]" />
              <span>24-Hour Turnaround</span>
            </span>
          </div>
        </div>

      </section>

    </div>
  );
}

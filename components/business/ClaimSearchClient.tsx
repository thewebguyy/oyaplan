'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Spot } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';
import { searchVenuesForClaimAction, ClaimSearchVenueResult } from '@/lib/actions/venueClaimActions';
import {
  Search,
  Building2,
  MapPin,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Link2,
  ShieldCheck,
  Clock,
  Loader2,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
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

function getVenueMonogram(name: string): string {
  const clean = name.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  return clean.slice(0, 1).toUpperCase();
}

export function ClaimSearchClient({ initialVenues, initialSpots }: ClaimSearchClientProps) {
  const searchParams = useSearchParams();
  const isFirstTime = searchParams?.get('firstTime') === 'true';

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
        derived_typical_cost: s.price_per_person || (s as any).derived_typical_cost || null,

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
      setLiveResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
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
    <div className="space-y-12 max-w-4xl mx-auto font-sans text-[#F5F1E8]">
      
      {/* ── SECTION 01: HEADER & SEARCH ── */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E59A28]/15 border border-[#E59A28]/35 text-[#E59A28] text-xs font-mono font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E59A28] animate-pulse" />
          <span>OYAPLAN VENUE LEDGER · PHYSICAL MENUS AUDITED</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif">
          Check your spot&apos;s Outside Math.
        </h1>
        <p className="text-sm sm:text-base text-[#A0978C] leading-relaxed max-w-2xl">
          Lagosians are using OyaPlan to calculate what an outing at your venue costs—including food, drinks, taxes, and rides. Search your spot below to inspect your live Till Slip, update your prices, and earn the OyaPlan Vetted Venue badge.
        </p>

        {/* Direct WhatsApp Audit Link Callout */}
        <div className="p-3.5 bg-[#1E1B18] border border-[#2D2823] rounded-2xl flex items-center justify-between text-xs font-mono text-[#A0978C] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#E59A28] shrink-0" />
            <span>Have a direct audit link from our team on WhatsApp?</span>
          </div>
          {generalClaimWaUrl && (
            <a
              href={generalClaimWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E59A28] font-bold hover:underline"
            >
              Open your venue ledger →
            </a>
          )}
        </div>

        {/* Search Input Bar with Integrated CTA */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row gap-2 relative">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0978C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search your restaurant, café, lounge, or activity spot (e.g., Lekki Grill, Circa, Cactus)..."
                className="w-full h-14 pl-11 pr-11 bg-[#1E1B18] border border-[#2D2823] rounded-2xl text-sm font-medium text-white placeholder:text-[#A0978C] focus:outline-none focus:border-[#E59A28] shadow-xl transition-all font-sans"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-[#E59A28] animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
              )}
            </div>

            <button
              type="button"
              onClick={() => {}}
              className="h-14 px-6 bg-[#E59A28] hover:bg-[#D48B1B] text-[#141210] font-mono font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg tap-feedback"
            >
              <span>Inspect Till Slip →</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 02: LIVE VENUE TILL SLIPS IN LAGOS (Grid Below Search) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#A0978C] px-1 font-mono">
          <span className="font-bold uppercase tracking-wider text-[11px]">
            {searchQuery.trim() ? `Search Results (${displayVenues.length})` : 'HOW LAGOS SPOTS APPEAR IN THE PLANNER TODAY'}
          </span>
          {isSearching && (
            <span className="text-[10px] font-bold text-[#E59A28] flex items-center gap-1">
              <span>Searching live ledger database...</span>
            </span>
          )}
        </div>

        {displayVenues.length === 0 ? (
          <div className="bg-[#1E1B18] rounded-3xl border border-[#2D2823] p-8 text-center space-y-3 shadow-xl">
            <Building2 className="w-8 h-8 text-[#A0978C] mx-auto stroke-[1.5]" />
            <h3 className="font-bold text-base text-white uppercase font-serif">Can&apos;t find your venue in the ledger?</h3>
            <p className="text-xs text-[#A0978C] max-w-sm mx-auto leading-relaxed">
              We may not have indexed your menu prices yet. Send a photo of your physical menu to our WhatsApp Audit Desk and we will set up your live Till Slip within 24 hours.
            </p>
            {addVenueWaUrl ? (
              <a
                href={addVenueWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-11 px-5 bg-[#E59A28] hover:bg-[#D48B1B] text-[#141210] font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer tap-feedback shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Menu to Audit Desk on WhatsApp</span>
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
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#12A165] uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3" />
                          <span>✓ OYAPLAN VETTED VENUE · AUDITED TILL SLIP</span>
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          <span>REVIEW PENDING</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E85C33] uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" />
                          <span>⚠️ ESTIMATED MENU DATA · UNCLAIMED</span>
                        </span>
                      )}
                    </div>
                    <Receipt className="w-4 h-4 text-[#141210]/40 shrink-0" />
                  </div>

                  {/* Body Content */}
                  <div className="py-3 space-y-2">
                    <h2 className="font-serif font-black text-lg text-[#141210] group-hover:text-[#E59A28] transition-colors truncate">
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
                    <span className="text-[11px] text-[#141210]/60">
                      {isVerified ? 'Updated by Management' : 'Run this spot?'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#141210] group-hover:translate-x-0.5 transition-transform bg-[#141210]/10 px-3 py-1.5 rounded-xl">
                      <span>{isVerified ? 'Inspect Ledger' : 'Verify Real Prices'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 03: PRICE RUMOR VS VERIFIED TILL SLIP COMPARISON TABLE ── */}
      <div className="bg-[#1E1B18] rounded-3xl border border-[#2D2823] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-[#E85C33] uppercase tracking-widest block">
            THE COST OF UNVERIFIED PRICES
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
            What happens when squads have to guess your prices?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Column 1: Without OyaPlan Verification */}
          <div className="p-5 rounded-2xl bg-[#141210] border border-red-500/20 space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm border-b border-red-500/20 pb-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>Without OyaPlan Verification</span>
            </div>

            <div className="space-y-3 text-[#A0978C] text-[11px] leading-relaxed">
              <div className="space-y-0.5">
                <span className="text-white font-bold block">Group chats guess high:</span>
                <p>Squads assume your spot costs ₦50k/head and pick somewhere else.</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-white font-bold block">Table shock when the bill drops:</span>
                <p>Waiters waste 20 minutes explaining 7.5% VAT, 10% service charge, or minimum spend rules.</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-white font-bold block">Outdated menus circulate online:</span>
                <p>Old blogs or random TikToks show wrong prices from two years ago.</p>
              </div>
            </div>
          </div>

          {/* Column 2: With Your Verified OyaPlan Till Slip */}
          <div className="p-5 rounded-2xl bg-[#141210] border border-[#12A165]/30 space-y-4">
            <div className="flex items-center gap-2 text-[#12A165] font-bold text-sm border-b border-[#12A165]/20 pb-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>With Your Verified OyaPlan Till Slip</span>
            </div>

            <div className="space-y-3 text-[#A0978C] text-[11px] leading-relaxed">
              <div className="space-y-0.5">
                <span className="text-white font-bold block">Exact pocket match:</span>
                <p>Planners see they can do a proper 2-person outing at your spot for ₦28,000 total.</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-white font-bold block">Pre-agreed Outside Math:</span>
                <p>Every tax, service charge, and house rule is locked into the squad&apos;s budget before they leave home.</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-white font-bold block">1-Tap Menu Updates:</span>
                <p>Snap your current physical menu on WhatsApp or update dish prices in 10 seconds whenever costs shift.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 04: BOTTOM CONCIERGE BANNER ── */}
      <div className="p-6 sm:p-8 bg-[#1E1B18] rounded-3xl border border-[#2D2823] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-2xl">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-[#E59A28] uppercase tracking-widest block">
            PLUG YOUR SPOT INTO THE PLANNER
          </span>
          <h3 className="font-serif font-black text-xl text-white">
            Not in the directory yet, or just updated your physical menu?
          </h3>
          <p className="text-xs text-[#A0978C] max-w-xl leading-relaxed">
            Don&apos;t type out 50 menu items by hand. Send a photo or PDF of your current menu and house rules (VAT, service charge, corkage) to our Menu Audit Desk on WhatsApp—we&apos;ll build your live Till Slip within 24 hours for free.
          </p>
        </div>

        {generalClaimWaUrl && (
          <a
            href={generalClaimWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 h-13 px-6 bg-[#E59A28] hover:bg-[#D48B1B] text-[#141210] font-mono font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer tap-feedback shadow-xl shadow-amber-950/40"
          >
            <MessageSquare className="w-4 h-4 text-[#141210]" />
            <span>Send Menu to Audit Desk on WhatsApp →</span>
          </a>
        )}
      </div>

    </div>
  );
}

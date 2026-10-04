'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Spot } from '@/lib/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';
import { searchVenuesForClaimAction } from '@/lib/actions/venueClaimActions';
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
} from 'lucide-react';

export interface VenueSearchItem {
  id: string;
  slug?: string;
  name: string;
  category?: string;
  address?: string;
  partner_state?: string;
  district_name?: string;
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
  const [liveResults, setLiveResults] = useState<VenueSearchItem[] | null>(null);
  const [monthlyBookingVol, setMonthlyBookingVol] = useState<number>(500000);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Unify venues or legacy spots into standardized initial list
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

  // Combined results: prioritize live database search, fallback to local memo
  const displayVenues = useMemo(() => {
    if (!searchQuery.trim()) {
      return allVenues.slice(0, 15);
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

  // Savings math: 15% typical aggregator commission vs ₦0 on OyaPlan
  const typicalAggregatorFee = Math.round(monthlyBookingVol * 0.15);

  return (
    <div className="space-y-8 max-w-2xl mx-auto font-sans text-[#F6F6F2]">
      {/* First-time welcoming state */}
      {isFirstTime && (
        <div className="p-4 bg-[#1E1E1E] border border-[#333333] rounded-2xl flex items-start gap-3 text-gray-200 text-xs leading-relaxed animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-[#F9E828] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block text-sm">
              Operator Authenticated. Select Your Venue Plaque.
            </span>
            <p className="mt-0.5 text-gray-400">
              Search below for your pre-indexed venue profile to link it to your account and manage what Lagos outing squads see.
            </p>
          </div>
        </div>
      )}

      {/* Operator's Desk Search Header */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1C1C] border border-[#2D2D2D] text-[#F9E828] text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F9E828] animate-pulse" />
          <span>Operator&apos;s Desk • Digital Plaque Claim</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
          Find your venue on OyaPlan
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
          Search for your pre-indexed digital plaque, review your live menu items, and take control of the pricing data customers use to plan visits.
        </p>

        {/* 01 Find -> 02 Inspect -> 03 Claim -> 04 Control Slim Editorial Timeline */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-mono font-bold text-gray-400 overflow-x-auto py-2.5 border-y border-[#262626] scrollbar-none">
          <span className="text-[#F9E828] flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F9E828]" />
            <span>01 Find Plaque</span>
          </span>
          <span className="text-[#444444]">→</span>
          <span className="shrink-0 text-gray-300">02 Inspect View</span>
          <span className="text-[#444444]">→</span>
          <span className="shrink-0 text-gray-300">03 Submit Claim</span>
          <span className="text-[#444444]">→</span>
          <span className="shrink-0 text-gray-300">04 Control Pricing</span>
        </div>
      </div>

      {/* Truthful Lagos Squad Demand Signal */}
      <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex items-center gap-3 text-xs font-mono text-gray-300">
        <div className="w-2 h-2 rounded-full bg-[#F9E828] animate-ping shrink-0" />
        <div>
          <span className="text-white font-bold">Lagos Squad Planning Demand: </span>
          <span>Planners actively build and budget itineraries across Lagos daily. Claim your plaque to control verified pricing and capture squad outings.</span>
        </div>
      </div>

      {/* Direct Invitation Callout */}
      <div className="p-4 bg-[#181818] border border-[#262626] rounded-2xl flex items-start gap-3 text-gray-300 text-xs leading-relaxed">
        <Link2 className="w-4 h-4 text-[#F9E828] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Have a direct verification link?</span> If OyaPlan sent you a direct liaison link via WhatsApp or email, open that link directly to access your pre-verified venue plaque.
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          placeholder="Search venue name (e.g. The House, Circa, Cactus, Landmark)..."
          className="w-full h-14 pl-11 pr-11 bg-[#181818] border border-[#2D2D2D] rounded-2xl text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F9E828] shadow-xs transition-all font-sans"
        />
        {isSearching && (
          <Loader2 className="w-4 h-4 text-[#F9E828] animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* Results List: Digital Plaques */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span className="font-mono font-bold uppercase tracking-wider text-[11px]">
            {searchQuery.trim() ? `Search Results (${displayVenues.length})` : 'Indexed Digital Plaques in Lagos'}
          </span>
          {isSearching && (
            <span className="text-[10px] font-mono font-bold text-[#F9E828] flex items-center gap-1">
              <span>Searching database...</span>
            </span>
          )}
        </div>

        {displayVenues.length === 0 ? (
          <div className="bg-[#181818] rounded-2xl border border-[#262626] p-8 text-center space-y-3">
            <Building2 className="w-8 h-8 text-gray-500 mx-auto stroke-[1.5]" />
            <h3 className="font-bold text-sm text-white uppercase font-display">Can&apos;t find your venue plaque?</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              We may not have created an initial digital plaque for your venue yet. Contact our desk and we will list and verify it promptly.
            </p>
            {addVenueWaUrl ? (
              <a
                href={addVenueWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-11 px-5 bg-[#F9E828] text-[#111111] font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#F9E828]/90 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Desk on WhatsApp to Add It</span>
              </a>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayVenues.map((venue: VenueSearchItem) => {
              const isVerified = venue.partner_state === 'verified_partner';
              const isPending = venue.partner_state === 'verification_pending';
              const monogram = getVenueMonogram(venue.name);

              return (
                <Link
                  key={venue.id}
                  href={`/venue/${venue.id}/claim`}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-[#181818] hover:bg-[#202020] border border-[#2B2B2B] hover:border-[#F9E828]/60 rounded-2xl shadow-xs transition-all tap-feedback group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Typographic Monogram Digital Plaque */}
                    <div className="w-12 h-12 rounded-xl bg-[#222222] border border-[#333333] text-[#F9E828] font-mono font-black text-sm flex items-center justify-center shrink-0 group-hover:border-[#F9E828] group-hover:scale-105 transition-all shadow-inner">
                      {monogram}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-serif font-black text-base sm:text-lg text-white group-hover:text-[#F9E828] transition-colors truncate">
                          {venue.name}
                        </h2>
                        {venue.category && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#262626] text-gray-300 border border-[#333333] shrink-0">
                            {venue.category}
                          </span>
                        )}
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1C2E1F] text-[#6EE7B7] border border-[#065F46]">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified Plaque</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2E2415] text-[#FCD34D] border border-[#78350F]">
                            <Clock className="w-3 h-3" />
                            <span>Verification Pending</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-mono truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#F9E828] shrink-0" />
                        <span className="truncate">{venue.address || venue.district_name || 'Lagos'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                      isVerified
                        ? 'bg-[#262626] text-white border border-[#3D3D3D] group-hover:bg-white group-hover:text-[#111111]'
                        : 'bg-[#F9E828] text-[#111111] group-hover:bg-white'
                    }`}>
                      <span>{isVerified ? 'Manage' : 'Claim Plaque'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Deposit Savings Calculator */}
      <div className="p-6 bg-[#181818] rounded-2xl border border-[#2B2B2B] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F9E828] block">
              OPERATOR ECONOMICS CALCULATOR
            </span>
            <h3 className="font-serif font-black text-lg text-white">
              ₦0 Commission vs. Industry Aggregators
            </h3>
          </div>
          <span className="text-xl font-mono font-black text-[#F9E828] tabular-nums">
            ₦{typicalAggregatorFee.toLocaleString('en-NG')} Saved / mo
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Estimated Monthly Outing Volume:</span>
            <span className="text-white font-bold">₦{monthlyBookingVol.toLocaleString('en-NG')}</span>
          </div>
          <input
            type="range"
            min="100000"
            max="3000000"
            step="50000"
            value={monthlyBookingVol}
            onChange={(e) => setMonthlyBookingVol(Number(e.target.value))}
            className="w-full h-2 bg-[#2D2D2D] rounded-lg appearance-none cursor-pointer accent-[#F9E828]"
            aria-label="Monthly booking volume slider"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 bg-[#111111] rounded-xl border border-[#262626]">
            <span className="text-[10px] text-gray-500 uppercase block">OyaPlan Partner Rate</span>
            <span className="text-base font-black text-[#F9E828] block mt-0.5">0% Commission</span>
            <span className="text-[10px] text-gray-400 mt-1 block">₦0 deductions. Customers pay you directly.</span>
          </div>
          <div className="p-3 bg-[#111111] rounded-xl border border-[#262626]">
            <span className="text-[10px] text-gray-500 uppercase block">Aggregator Comparison (15%)</span>
            <span className="text-base font-black text-red-400 block mt-0.5">₦{typicalAggregatorFee.toLocaleString('en-NG')} lost</span>
            <span className="text-[10px] text-gray-400 mt-1 block">Assumes 15% booking fees standard in food delivery/booking apps.</span>
          </div>
        </div>
      </div>

      {/* VIP Concierge Fast-Track Banner */}
      <div className="p-6 bg-[#161616] rounded-2xl border border-[#2D2D2D] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#F9E828] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#F9E828]" />
            <span>VIP Concierge Fast-Track</span>
          </div>
          <h4 className="font-serif font-black text-base text-white">Can&apos;t find your venue plaque?</h4>
          <p className="text-xs text-gray-400 max-w-md">
            Our Lagos operations desk will index, verify, and mint your digital plaque within 24 hours.
          </p>
        </div>
        {generalClaimWaUrl && (
          <a
            href={generalClaimWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 h-11 px-5 bg-[#F9E828] hover:bg-[#F9E828]/90 text-[#111111] font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors cursor-pointer tap-feedback"
          >
            <MessageSquare className="w-4 h-4 text-[#111111]" />
            <span>Direct WhatsApp Desk</span>
          </a>
        )}
      </div>
    </div>
  );
}
